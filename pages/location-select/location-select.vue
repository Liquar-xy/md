<template>
	<view class="page">
		<!-- 顶部导航栏 -->
		<view class="navbar">
			<view class="nav-left" @click="goBack">
				<text class="nav-icon">‹</text>
			</view>
			<view class="nav-center">
				<text class="nav-title">选择寄存点</text>
			</view>
			<view class="nav-right">
				<text class="nav-icon" @click="checkDatabase">🔍</text>
				<text class="nav-icon" @click="testMockData">🎭</text>
				<text class="nav-icon" @click="refreshData">⟲</text>
			</view>
		</view>

		<!-- 操作提示 -->
		<view class="operation-hint" v-if="fromPage === 'admin' && targetPage === 'cabinet-group'">
			<text class="hint-icon">📍</text>
			<text class="hint-text">请选择要管理的寄存点，选择后将进入柜组管理页面</text>
		</view>

		<!-- 搜索框 -->
		<view class="search-section">
			<view class="search-box">
				<text class="search-icon">🔍</text>
				<input 
					class="search-input" 
					placeholder="搜索寄存点名称或地址"
					v-model="searchKeyword"
					@input="onSearchInput"
				/>
				<text class="clear-icon" v-if="searchKeyword" @click="clearSearch">×</text>
			</view>
		</view>

		<!-- 寄存点列表 -->
		<scroll-view class="location-list" scroll-y="true" @scrolltolower="loadMore">
			<view 
				class="location-item" 
				v-for="location in filteredLocationList" 
				:key="location.id"
				@click="selectLocation(location)"
				:class="{ 'selected': selectedLocationId === location.id }"
			>
				<view class="location-header">
					<text class="location-name">{{ location.name }}</text>
					<text class="location-status" :class="getStatusClass(location.status)">
						{{ getStatusText(location.status) }}
					</text>
				</view>
				
				<view class="location-info">
					<view class="info-row">
						<text class="info-label">地址:</text>
						<text class="info-value">{{ location.address || '暂无地址' }}</text>
					</view>
					<view class="info-row">
						<text class="info-label">营业时间:</text>
						<text class="info-value">{{ location.open_time || '24小时' }}</text>
					</view>
					<view class="info-row">
						<text class="info-label">联系电话:</text>
						<text class="info-value">{{ location.mobile || '暂无' }}</text>
					</view>
				</view>

				<!-- 可用柜子统计 -->
				<view class="cabinet-stats">
					<view class="stat-item">
						<text class="stat-label">大柜</text>
						<text class="stat-value">{{ location.available_large || 0 }}</text>
					</view>
					<view class="stat-item">
						<text class="stat-label">中柜</text>
						<text class="stat-value">{{ location.available_medium || 0 }}</text>
					</view>
					<view class="stat-item">
						<text class="stat-label">小柜</text>
						<text class="stat-value">{{ location.available_small || 0 }}</text>
					</view>
				</view>

				<!-- 选中标识 -->
				<view class="selected-icon" v-if="selectedLocationId === location.id">
					<text class="check-icon">✓</text>
				</view>
			</view>

			<!-- 加载更多 -->
			<view class="load-more" v-if="hasMore && !isSearching">
				<text class="load-text" v-if="!loading">上拉加载更多</text>
				<text class="load-text" v-else>加载中...</text>
			</view>

			<!-- 没有更多数据 -->
			<view class="no-more" v-if="!hasMore && locationList.length > 0 && !isSearching">
				<text class="no-more-text">没有更多数据了</text>
			</view>

			<!-- 空状态 -->
			<view class="empty-state" v-if="!loading && filteredLocationList.length === 0">
				<text class="empty-icon">📍</text>
				<text class="empty-text">
					{{ isSearching ? '未找到匹配的寄存点' : '暂无寄存点数据' }}
				</text>
				<text class="empty-desc">
					{{ isSearching ? '尝试修改搜索关键词' : '后端API返回空数据，可能是数据库中没有寄存点数据' }}
				</text>
				<view class="empty-actions">
					<button class="refresh-btn" @click="refreshData">重新请求API</button>
					<button class="mock-btn" @click="testMockData">使用模拟数据</button>
				</view>
			</view>
		</scroll-view>

		<!-- 确认按钮 -->
		<view class="confirm-section" v-if="selectedLocationId">
			<button class="confirm-btn" @click="confirmSelection">
				{{ getConfirmButtonText() }}
			</button>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			// 寄存点列表数据
			locationList: [],
			filteredLocationList: [],
			
			// 搜索相关
			searchKeyword: '',
			isSearching: false,
			
			// 选择状态
			selectedLocationId: null,
			selectedLocation: null,
			
			// 分页参数
			currentPage: 1,
			pageSize: 20,
			hasMore: true,
			loading: false,
			
			// 来源页面参数
			fromPage: '',
			targetPage: '',
			
			// API配置
			apiBaseUrl: 'http://localhost:8000'
		}
	},
	
	onLoad(options) {
		console.log('=== 寄存点选择页面加载 ===');
		console.log('页面参数:', options);
		
		this.fromPage = options.from || '';
		this.targetPage = options.target || '';
		
		// 获取当前选中的寄存点ID
		const currentLocationId = uni.getStorageSync('selectedLocationId');
		if (currentLocationId) {
			this.selectedLocationId = parseInt(currentLocationId);
		}
		
		this.loadLocationList();
	},
	
	methods: {
		// 返回上一页
		goBack() {
			uni.navigateBack();
		},
		
		// 刷新数据
		refreshData() {
			console.log('🔄 刷新寄存点数据');
			this.currentPage = 1;
			this.hasMore = true;
			this.locationList = [];
			this.filteredLocationList = [];
			this.loadLocationList();
		},
		
		// 加载寄存点列表
		async loadLocationList() {
			if (this.loading || !this.hasMore) return;
			
			this.loading = true;
			
			try {
				const response = await this.requestLocationList();
				
				console.log('=== 处理寄存点响应数据 ===');
				console.log('响应对象:', response);
				
				if (response.code === 200 || response.code === '200') {
					const newLocations = response.locations || [];
					
					console.log('获取到的寄存点数据:', newLocations);
					console.log('寄存点数量:', newLocations.length);
					console.log('总数量:', response.total);
					
					// 如果后端返回空数据，使用模拟数据
					if (newLocations.length === 0 && this.currentPage === 1) {
						console.log('⚠️ 后端返回空数据，使用模拟数据');
						this.loadMockData();
						return;
					}
					
					if (this.currentPage === 1) {
						this.locationList = newLocations;
					} else {
						this.locationList = [...this.locationList, ...newLocations];
					}
					
					// 更新过滤列表
					this.updateFilteredList();
					
					// 判断是否还有更多数据
					this.hasMore = newLocations.length === this.pageSize;
					
					console.log(`✅ 加载寄存点列表成功，当前页：${this.currentPage}，数据量：${newLocations.length}`);
					
					// 显示成功提示
					if (this.currentPage === 1) {
						if (newLocations.length > 0) {
							uni.showToast({
								title: `加载成功，共${response.total || newLocations.length}个寄存点`,
								icon: 'success',
								duration: 1500
							});
						} else {
							uni.showToast({
								title: '后端暂无数据，使用模拟数据',
								icon: 'none',
								duration: 2000
							});
						}
					}
				} else {
					throw new Error(response.msg || `服务器返回错误: ${response.code}`);
				}
			} catch (error) {
				console.error('❌ 加载寄存点列表失败:', error);
				
				// 显示错误提示
				uni.showToast({
					title: error.message || '加载失败',
					icon: 'none',
					duration: 2000
				});
				
				// 如果是第一页加载失败，使用模拟数据作为降级方案
				if (this.currentPage === 1) {
					console.log('⚠️ 使用模拟数据作为降级方案');
					this.loadMockData();
				}
			} finally {
				this.loading = false;
			}
		},
		
		// 请求寄存点列表API
		async requestLocationList() {
			console.log('=== 开始请求寄存点列表 ===');
			
			// 先尝试直接查询数据库中的寄存点数据
			try {
				const directResult = await this.requestDirectLockerPoints();
				if (directResult && directResult.locations && directResult.locations.length > 0) {
					console.log('✅ 直接查询成功，返回数据');
					return directResult;
				}
			} catch (error) {
				console.log('⚠️ 直接查询失败，尝试城市搜索接口:', error.message);
			}
			
			// 如果直接查询失败，尝试城市搜索接口
			return this.requestCitySearchAPI();
		},
		
		// 直接查询寄存点数据（绕过城市查询）
		requestDirectLockerPoints() {
			return new Promise((resolve, reject) => {
				console.log('=== 尝试直接查询寄存点数据 ===');
				
				const token = uni.getStorageSync('token') || uni.getStorageSync('adminToken') || '';
				
				// 构建请求参数
				const params = {
					keyword: this.searchKeyword || '',
					page: this.currentPage,
					page_size: this.pageSize
				};
				
				// 构建URL参数
				const queryString = Object.keys(params)
					.filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
					.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
					.join('&');
				
				const apiUrl = `${this.apiBaseUrl}/api/locker-points/all?${queryString}`;
				
				console.log('直接查询API URL:', apiUrl);
				console.log('直接查询参数:', params);
				
				// 显示加载提示
				if (this.currentPage === 1) {
					uni.showLoading({
						title: '加载寄存点数据...',
						mask: true
					});
				}
				
				uni.request({
					url: apiUrl,
					method: 'GET',
					header: {
						'Content-Type': 'application/json',
						'Authorization': token ? `Bearer ${token}` : ''
					},
					timeout: 10000,
					success: (res) => {
						console.log('直接查询API响应:', res);
						
						if (this.currentPage === 1) {
							uni.hideLoading();
						}
						
						if (res.statusCode === 200 && res.data) {
							resolve({
								code: 200,
								msg: '查询成功',
								locations: res.data.items || [],
								total: res.data.total || 0
							});
						} else {
							reject(new Error('直接查询接口返回异常'));
						}
					},
					fail: (err) => {
						if (this.currentPage === 1) {
							uni.hideLoading();
						}
						console.log('直接查询接口失败:', err);
						reject(new Error('直接查询接口不可用'));
					}
				});
			});
		},
		
		// 城市搜索API
		requestCitySearchAPI() {
			return new Promise((resolve, reject) => {
				console.log('=== 使用城市搜索API ===');
				
				// 获取token
				const token = uni.getStorageSync('token') || uni.getStorageSync('adminToken') || '';
				
				// 构建请求参数 - 使用SearchLockerPointsInCity接口
				const params = {
					city_name: '郑州', // 默认城市，可以从用户设置获取
					keyword: this.searchKeyword || '', // 搜索关键词
					page: this.currentPage,
					page_size: this.pageSize
				};
				
				console.log('完整请求参数:', params);
				
				// 构建URL参数
				const queryString = Object.keys(params)
					.filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
					.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
					.join('&');
				
				const apiUrl = `${this.apiBaseUrl}/api/nearby/city/search?${queryString}`;
				
				console.log('请求参数:', params);
				console.log('请求URL:', apiUrl);
				
				// 显示加载提示
				if (this.currentPage === 1) {
					uni.showLoading({
						title: '加载寄存点数据...',
						mask: true
					});
				}
				
				uni.request({
					url: apiUrl,
					method: 'GET',
					header: {
						'Content-Type': 'application/json',
						'Authorization': token ? `Bearer ${token}` : ''
					},
					timeout: 15000,
					success: (res) => {
						console.log('=== 寄存点列表API响应 ===');
						console.log('HTTP状态码:', res.statusCode);
						console.log('响应数据:', res.data);
						
						// 隐藏加载提示
						if (this.currentPage === 1) {
							uni.hideLoading();
						}
						
						if (res.statusCode === 200) {
							if (res.data && typeof res.data === 'object') {
								console.log('✅ 响应数据格式正确');
								// 转换数据格式以适配前端
								const transformedData = {
									code: 200,
									msg: '查询成功',
									locations: res.data.items || [],
									total: res.data.total || 0
								};
								resolve(transformedData);
							} else {
								console.error('❌ 响应数据格式错误:', res.data);
								reject(new Error('响应数据格式错误'));
							}
						} else {
							console.error('❌ HTTP状态码错误:', res.statusCode);
							reject(new Error(`HTTP ${res.statusCode}: ${res.data?.msg || '请求失败'}`));
						}
					},
					fail: (err) => {
						console.error('=== 寄存点列表API请求失败 ===');
						console.error('错误对象:', err);
						
						// 隐藏加载提示
						if (this.currentPage === 1) {
							uni.hideLoading();
						}
						
						let errorMessage = '网络请求失败';
						if (err.errMsg) {
							if (err.errMsg.includes('timeout')) {
								errorMessage = '请求超时，请检查网络连接';
							} else if (err.errMsg.includes('fail')) {
								errorMessage = '无法连接到服务器，请检查后端服务是否启动';
							} else {
								errorMessage = err.errMsg;
							}
						}
						
						reject(new Error(errorMessage));
					}
				});
			});
		},
		
		// 加载模拟数据（模拟真实数据库数据）
		loadMockData() {
			console.log('🎭 使用模拟寄存点数据（模拟数据库真实数据）');
			
			// 这些数据模拟数据库中真实的寄存点数据，包含正确的柜子数量
			const mockLocations = [
				{
					id: 1,
					name: '北京西站南广场寄存点',
					address: '南广场站出口东侧',
					latitude: 39.8963,
					longitude: 116.3220,
					available_large: 7,  // 实际可用大柜数量（总8个，1个使用中）
					available_medium: 13, // 实际可用中柜数量（总14个，1个使用中）
					available_small: 22,  // 实际可用小柜数量（总23个，1个使用中）
					open_time: '24小时',
					mobile: '13900139000'
				},
				{
					id: 2,
					name: '上海虹桥站出发层寄存点',
					address: '出发层A17检票口附近',
					latitude: 31.1979,
					longitude: 121.3157,
					available_large: 3,
					available_medium: 6,
					available_small: 10,
					open_time: '24小时',
					mobile: '13900139000'
				},
				{
					id: 3,
					name: '广州南站东进站口寄存点',
					address: '东进站口南侧',
					latitude: 23.0059,
					longitude: 113.2650,
					available_large: 4,
					available_medium: 7,
					available_small: 11,
					open_time: '24小时',
					mobile: '13900139000'
				},
				{
					id: 4,
					name: '郑州新途径',
					address: '郑州市中原区新途径大厦1楼',
					latitude: 34.7466,
					longitude: 113.6253,
					available_large: 5,
					available_medium: 8,
					available_small: 12,
					open_time: '06:00-24:00',
					mobile: '0371-12345678'
				},
				{
					id: 5,
					name: '郑州火车站',
					address: '郑州市二七区火车站西广场',
					latitude: 34.7532,
					longitude: 113.6401,
					available_large: 3,
					available_medium: 6,
					available_small: 10,
					open_time: '24小时',
					mobile: '0371-87654321'
				},
				{
					id: 6,
					name: '郑州东站',
					address: '郑州市郑东新区郑州东站',
					latitude: 34.7200,
					longitude: 113.7300,
					available_large: 8,
					available_medium: 15,
					available_small: 20,
					open_time: '05:00-23:00',
					mobile: '0371-11223344'
				},
				{
					id: 7,
					name: '郑州机场',
					address: '郑州市新郑区郑州机场T2航站楼',
					latitude: 34.5197,
					longitude: 113.8408,
					available_large: 10,
					available_medium: 20,
					available_small: 25,
					open_time: '24小时',
					mobile: '0371-44556677'
				},
				{
					id: 8,
					name: '河南大学',
					address: '郑州市金水区河南大学新校区',
					latitude: 34.7800,
					longitude: 113.6800,
					available_large: 3,
					available_medium: 5,
					available_small: 8,
					open_time: '06:00-23:00',
					mobile: '0371-33445566'
				}
			];
			
			console.log('模拟数据（共%d个寄存点）:', mockLocations.length, mockLocations);
			
			this.locationList = mockLocations;
			this.updateFilteredList();
			this.hasMore = false;
			
			console.log('设置后的locationList:', this.locationList);
			console.log('设置后的filteredLocationList:', this.filteredLocationList);
			
			// 显示模拟数据提示
			uni.showToast({
				title: `数据库暂无数据，使用模拟数据（${mockLocations.length}个寄存点）`,
				icon: 'none',
				duration: 3000
			});
		},
		
		// 加载更多
		loadMore() {
			if (this.hasMore && !this.loading && !this.isSearching) {
				this.currentPage++;
				this.loadLocationList();
			}
		},
		
		// 搜索输入处理
		onSearchInput() {
			this.isSearching = this.searchKeyword.trim().length > 0;
			this.updateFilteredList();
		},
		
		// 清除搜索
		clearSearch() {
			this.searchKeyword = '';
			this.isSearching = false;
			this.updateFilteredList();
		},
		
		// 更新过滤列表
		updateFilteredList() {
			if (this.isSearching) {
				const keyword = this.searchKeyword.toLowerCase();
				this.filteredLocationList = this.locationList.filter(location => 
					location.name.toLowerCase().includes(keyword) ||
					(location.address && location.address.toLowerCase().includes(keyword))
				);
			} else {
				this.filteredLocationList = [...this.locationList];
			}
		},
		
		// 选择寄存点
		selectLocation(location) {
			console.log('选择寄存点:', location);
			this.selectedLocationId = location.id;
			this.selectedLocation = location;
		},
		
		// 确认选择
		confirmSelection() {
			if (!this.selectedLocation) return;
			
			console.log('确认选择寄存点:', this.selectedLocation);
			console.log('来源页面:', this.fromPage);
			console.log('目标页面:', this.targetPage);
			
			// 保存选择的寄存点到本地存储
			uni.setStorageSync('selectedLocationId', this.selectedLocation.id);
			uni.setStorageSync('selectedLocationName', this.selectedLocation.name);
			uni.setStorageSync('selectedLocationData', this.selectedLocation);
			
			// 显示成功提示
			uni.showToast({
				title: `已选择：${this.selectedLocation.name}`,
				icon: 'success',
				duration: 1500
			});
			
			// 根据来源和目标页面决定跳转逻辑
			setTimeout(() => {
				if (this.fromPage === 'admin' && this.targetPage === 'cabinet-group') {
					// 从管理员页面来，目标是柜组管理，直接跳转到柜组管理页面
					console.log('跳转到柜组管理页面');
					uni.redirectTo({
						url: '/pages/cabinet-group/cabinet-group'
					});
				} else {
					// 其他情况返回上一页
					console.log('返回上一页');
					uni.navigateBack();
				}
			}, 1500);
		},
		
		// 获取状态样式类
		getStatusClass(status) {
			const statusMap = {
				'active': 'status-active',
				'inactive': 'status-inactive',
				'maintenance': 'status-maintenance'
			};
			return statusMap[status] || 'status-active';
		},
		
		// 获取状态文本
		getStatusText(status) {
			const statusMap = {
				'active': '营业中',
				'inactive': '暂停营业',
				'maintenance': '维护中'
			};
			return statusMap[status] || '营业中';
		},
		
		// 测试模拟数据
		testMockData() {
			console.log('🎭 手动加载模拟数据');
			this.locationList = [];
			this.filteredLocationList = [];
			this.loadMockData();
		},
		
		// 获取确认按钮文本
		getConfirmButtonText() {
			if (this.fromPage === 'admin' && this.targetPage === 'cabinet-group') {
				return '确认选择并进入柜组管理';
			}
			return '确认选择';
		},
		
		// 检查数据库状态
		async checkDatabase() {
			console.log('🔍 检查数据库状态');
			
			uni.showLoading({
				title: '检查数据库...',
				mask: true
			});
			
			try {
				// 先测试直接查询接口
				console.log('测试直接查询接口...');
				const directResponse = await this.requestDirectLockerPoints();
				
				uni.hideLoading();
				
				const message = `数据库状态检查结果：

直接查询API: ✅ 正常
返回数据: ${directResponse.locations.length} 个寄存点
总数量: ${directResponse.total}

${directResponse.locations.length === 0 ? 
'⚠️ 数据库查询返回空数据\n可能原因:\n1. 数据库表为空\n2. 查询条件过滤了所有数据\n3. 表名或字段名不匹配' : 
'✅ 数据库中有寄存点数据'}

数据示例:
${directResponse.locations.slice(0, 2).map(item => `- ${item.name}: ${item.address}`).join('\n')}`;
				
				uni.showModal({
					title: '数据库状态',
					content: message,
					showCancel: false,
					confirmText: '确定'
				});
				
			} catch (error) {
				console.log('直接查询失败，尝试城市搜索接口...');
				
				try {
					const cityResponse = await this.requestCitySearchAPI();
					
					uni.hideLoading();
					
					const message = `数据库状态检查结果：

直接查询API: ❌ 失败 (${error.message})
城市搜索API: ✅ 正常
返回数据: ${cityResponse.locations.length} 个寄存点
总数量: ${cityResponse.total}

${cityResponse.locations.length === 0 ? 
'⚠️ 城市搜索返回空数据\n可能原因:\n1. 城市表不存在\n2. 城市名称不匹配\n3. location_id关联错误' : 
'✅ 城市搜索有数据'}`;
					
					uni.showModal({
						title: '数据库状态',
						content: message,
						showCancel: false,
						confirmText: '确定'
					});
					
				} catch (cityError) {
					uni.hideLoading();
					
					uni.showModal({
						title: '数据库检查失败',
						content: `两个接口都失败了：

直接查询: ${error.message}
城市搜索: ${cityError.message}

可能原因:
1. 后端服务未启动
2. 数据库连接失败
3. API接口异常
4. 认证问题 (401错误)`,
						showCancel: false,
						confirmText: '确定'
					});
				}
			}
		}
	}
}
</script>

<style scoped>
.page {
	background-color: #f5f5f5;
	min-height: 100vh;
}

/* 导航栏 */
.navbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 30rpx;
	background-color: #ffffff;
	border-bottom: 1rpx solid #e5e5e5;
	position: sticky;
	top: 0;
	z-index: 100;
}

/* 操作提示 */
.operation-hint {
	display: flex;
	align-items: center;
	gap: 15rpx;
	padding: 25rpx 30rpx;
	background-color: #e6f7ff;
	border-left: 4rpx solid #1890ff;
	margin-bottom: 20rpx;
}

.hint-icon {
	font-size: 28rpx;
}

.hint-text {
	font-size: 26rpx;
	color: #1890ff;
	line-height: 1.4;
}

.nav-left, .nav-right {
	display: flex;
	align-items: center;
}

.nav-icon {
	font-size: 36rpx;
	color: #333333;
	padding: 10rpx;
}

.nav-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
}

/* 搜索框 */
.search-section {
	padding: 20rpx 30rpx;
	background-color: #ffffff;
	border-bottom: 1rpx solid #e5e5e5;
}

.search-box {
	display: flex;
	align-items: center;
	background-color: #f5f5f5;
	border-radius: 25rpx;
	padding: 20rpx 30rpx;
}

.search-icon {
	font-size: 28rpx;
	color: #999999;
	margin-right: 15rpx;
}

.search-input {
	flex: 1;
	font-size: 28rpx;
	color: #333333;
}

.clear-icon {
	font-size: 32rpx;
	color: #999999;
	padding: 5rpx;
}

/* 寄存点列表 */
.location-list {
	flex: 1;
	padding: 0 20rpx;
}

.location-item {
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 30rpx;
	margin: 20rpx 0;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	position: relative;
	border: 2rpx solid transparent;
	transition: all 0.3s ease;
}

.location-item.selected {
	border-color: #1890ff;
	background-color: #f0f8ff;
}

.location-item:active {
	transform: scale(0.98);
}

/* 寄存点标题 */
.location-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20rpx;
}

.location-name {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
}

.location-status {
	font-size: 24rpx;
	padding: 8rpx 16rpx;
	border-radius: 12rpx;
	font-weight: 500;
}

.status-active {
	background-color: #f6ffed;
	color: #52c41a;
}

.status-inactive {
	background-color: #fff2f0;
	color: #ff4d4f;
}

.status-maintenance {
	background-color: #fff7e6;
	color: #faad14;
}

/* 寄存点信息 */
.location-info {
	margin-bottom: 20rpx;
}

.info-row {
	display: flex;
	align-items: flex-start;
	padding: 8rpx 0;
}

.info-label {
	font-size: 26rpx;
	color: #666666;
	width: 140rpx;
	flex-shrink: 0;
}

.info-value {
	font-size: 26rpx;
	color: #333333;
	flex: 1;
}

/* 柜子统计 */
.cabinet-stats {
	display: flex;
	justify-content: space-around;
	padding: 20rpx 0;
	border-top: 1rpx solid #f0f0f0;
}

.stat-item {
	text-align: center;
}

.stat-label {
	display: block;
	font-size: 24rpx;
	color: #666666;
	margin-bottom: 8rpx;
}

.stat-value {
	display: block;
	font-size: 32rpx;
	font-weight: bold;
	color: #1890ff;
}

/* 选中标识 */
.selected-icon {
	position: absolute;
	top: 20rpx;
	right: 20rpx;
	width: 40rpx;
	height: 40rpx;
	background-color: #1890ff;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.check-icon {
	font-size: 24rpx;
	color: #ffffff;
	font-weight: bold;
}

/* 加载更多 */
.load-more, .no-more {
	text-align: center;
	padding: 40rpx 0;
}

.load-text, .no-more-text {
	font-size: 24rpx;
	color: #999999;
}

/* 空状态 */
.empty-state {
	text-align: center;
	padding: 100rpx 0;
}

.empty-icon {
	font-size: 80rpx;
	margin-bottom: 20rpx;
}

.empty-text {
	font-size: 28rpx;
	color: #333333;
	margin-bottom: 15rpx;
	font-weight: 500;
}

.empty-desc {
	font-size: 24rpx;
	color: #999999;
	margin-bottom: 40rpx;
	line-height: 1.5;
}

.empty-actions {
	display: flex;
	justify-content: center;
	gap: 20rpx;
}

.refresh-btn, .mock-btn {
	padding: 20rpx 30rpx;
	border-radius: 8rpx;
	border: none;
	font-size: 26rpx;
}

.refresh-btn {
	background-color: #1890ff;
	color: #ffffff;
}

.mock-btn {
	background-color: #52c41a;
	color: #ffffff;
}

/* 确认按钮 */
.confirm-section {
	padding: 30rpx;
	background-color: #ffffff;
	border-top: 1rpx solid #e5e5e5;
}

.confirm-btn {
	width: 100%;
	padding: 30rpx;
	background-color: #1890ff;
	color: #ffffff;
	border: none;
	border-radius: 12rpx;
	font-size: 32rpx;
	font-weight: bold;
}

.confirm-btn:active {
	background-color: #0d7bd9;
}
</style>