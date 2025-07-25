<template>
	<view class="page">
		<!-- 搜索栏 -->
		<view class="search-section">
			<view class="location-info">
				<text class="location-icon">📍</text>
				<text class="current-city">{{currentCity}}</text>
			</view>
			<view class="search-box" @click="openSearch">
				<text class="search-icon">🔍</text>
				<text class="search-placeholder">搜索火车站/地铁站/景点</text>
			</view>
		</view>
		
		<!-- 百度地图 -->
		<view class="map-container">
			<map
				id="nearbyMap"
				class="map"
				:longitude="mapCenter.longitude"
				:latitude="mapCenter.latitude"
				:scale="15"
				:markers="mapMarkers"
				:show-location="true"
				:enable-3D="false"
				:show-compass="true"
				:enable-overlooking="false"
				:enable-zoom="true"
				:enable-scroll="true"
				:enable-rotate="false"
				:enable-satellite="false"
				:enable-traffic="false"
				@markertap="onMarkerTap"
				@regionchange="onRegionChange"
				@tap="onMapTap"
				@updated="onMapUpdated"
			></map>
			
			<!-- 定位按钮 -->
			<view class="location-btn" @click="relocate">
				<text class="location-btn-icon">🧭</text>
			</view>
			
			<!-- 刷新按钮 -->
			<view class="refresh-btn" @click="refreshNearbyLockers">
				<text class="refresh-btn-icon">🔄</text>
			</view>
			
			<!-- API模式切换按钮（开发测试用） -->
			<view class="api-mode-btn" @click="toggleAPIMode">
				<text class="api-mode-text">{{useRealAPI ? '真实API' : '模拟数据'}}</text>
			</view>
			
			<!-- 调试信息显示（开发模式） -->
			<view class="debug-info" v-if="!useRealAPI">
				<text class="debug-text">调试模式</text>
			</view>
		</view>
		
		<!-- 底部寄存点列表 -->
		<view class="bottom-panel" :class="{ 'expanded': showLockerList }">
			<!-- 拖拽指示器 -->
			<view class="drag-indicator" @click="toggleLockerList">
				<view class="drag-line"></view>
			</view>
			
			<!-- 无寄存点状态 -->
			<view class="no-lockers" v-if="!loading && nearbyLockers.length === 0">
				<text class="no-lockers-title">抱歉</text>
				<text class="no-lockers-desc">您附近5KM内暂无寄存点</text>
			</view>
			
			<!-- 有寄存点状态 -->
			<view class="lockers-content" v-else>
				<view class="lockers-header" v-if="nearbyLockers.length > 0">
					<text class="lockers-count">附近共有{{nearbyLockers.length}}个寄存柜</text>
					<text class="refresh-text" @click="refreshAllData">刷新</text>
				</view>
				
				<!-- 寄存点列表 -->
				<scroll-view class="lockers-list" scroll-y="true" v-if="showLockerList">
					<view 
						class="locker-card" 
						v-for="(locker, index) in nearbyLockers" 
						:key="locker.id"
						@click="selectLocker(locker)"
					>
						<image class="locker-image" src="/static/locker-image.jpg" mode="aspectFill"></image>
						<view class="locker-info">
							<text class="locker-name">{{locker.name}}</text>
							<text class="locker-capacity" :class="{ 'unavailable': locker.status === 'unavailable' }">
								{{locker.status === 'unavailable' ? '设备离线' : `大柜${locker.large}个 中柜${locker.medium}个 小柜${locker.small}个`}}
							</text>
							<view class="locker-location">
								<text class="location-icon">📍</text>
								<text class="location-text">{{locker.address}}</text>
							</view>
							<text class="distance" v-if="locker.distance">{{locker.distance}}</text>
						</view>
					</view>
				</scroll-view>
				
				<!-- 当前选择寄存柜（收起状态） -->
				<view class="current-locker" v-if="!showLockerList && selectedLocker">
					<view class="current-locker-content" @click="selectLocker(selectedLocker)">
						<image class="current-locker-image" src="/static/locker-image.jpg" mode="aspectFill"></image>
						<view class="current-locker-info">
							<text class="current-locker-name">{{selectedLocker.name}}</text>
							<text class="current-locker-capacity" :class="{ 'unavailable': selectedLocker.status === 'unavailable' }">
								{{selectedLocker.status === 'unavailable' ? '设备离线' : `大柜${selectedLocker.large}个 中柜${selectedLocker.medium}个 小柜${selectedLocker.small}个`}}
							</text>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 加载状态 -->
			<view class="loading" v-if="loading">
				<text class="loading-text">正在获取附近寄存点...</text>
			</view>
		</view>
	</view>
</template>

<script>
	// ===== 后端接口配置说明 =====
	// 1. 后端服务地址: http://localhost:8000
	// 2. 我的附近接口: GET /api/nearby/my-nearby
	// 3. 接口请求格式: GET ?longitude=116.397428&latitude=39.90923&radius=5&limit=20
	// 4. 返回格式: { user_location: {...}, nearby_points: [...], total_count: 2, search_radius: 5.0, baidu_map_ak: "..." }
	// 5. 启动后端服务: go run cmd/ito-deposit/main.go
	// 6. 测试接口: .\test_api.ps1
	
	export default {
		data() {
			return {
				currentCity: '郑州',
				mapCenter: {
					longitude: 113.6253,
					latitude: 34.7466
				},
				mapMarkers: [],
				nearbyLockers: [],
				selectedLocker: null,
				showLockerList: false,
				loading: true,
				searchTimer: null, // 搜索防抖定时器
				realTimeUpdateTimer: null, // 实时更新定时器
				useRealAPI: true // 是否使用真实API，false则使用模拟数据
			}
		},
		onLoad() {
			console.log('=== 附近寄存页面加载 ===');
			console.log('当前API模式:', this.useRealAPI ? '真实API' : '模拟数据');
			
			// 检查登录状态
			if (!this.checkLoginStatus()) {
				return; // 如果未登录，会跳转到登录页，不继续执行
			}
			
			// 检查是否有已选择的城市
			const selectedCity = uni.getStorageSync('selectedCity');
			if (selectedCity && selectedCity.name) {
				this.currentCity = selectedCity.name;
				console.log('已选择城市:', selectedCity);
			}
			
			// 显示页面加载提示
			uni.showToast({
				title: '正在初始化...',
				icon: 'loading',
				duration: 2000
			});
			
			this.initLocation();
		},
		
		onShow() {
			console.log('附近寄存页面显示');
			// 页面显示时开始实时更新
			this.startRealTimeUpdate();
		},
		
		onHide() {
			console.log('附近寄存页面隐藏');
			// 页面隐藏时停止实时更新
			this.stopRealTimeUpdate();
		},
		
		onUnload() {
			console.log('附近寄存页面卸载');
			// 页面卸载时清理定时器
			this.stopRealTimeUpdate();
			if (this.searchTimer) {
				clearTimeout(this.searchTimer);
			}
		},
		methods: {
			// 检查登录状态
			checkLoginStatus() {
				const token = uni.getStorageSync('token');
				const userData = uni.getStorageSync('userData');
				
				if (!token || !userData) {
					console.log('用户未登录，跳转到登录页');
					uni.reLaunch({
						url: '/pages/login/login'
					});
					return false;
				}
				
				console.log('用户已登录:', userData);
				return true;
			},
			
			// 初始化定位
			initLocation() {
				console.log('=== 开始初始化定位 ===');
				console.log('当前地图中心:', this.mapCenter);
				
				uni.showLoading({
					title: '定位中...'
				});
				
				// 检查是否支持定位
				if (typeof navigator === 'undefined' || !navigator.geolocation) {
					console.warn('浏览器不支持定位功能，使用默认位置');
					uni.hideLoading();
					this.handleLocationFail({ errMsg: 'geolocation not supported' });
					return;
				}
				
				// 设置定位选项
				const locationOptions = {
					type: 'gcj02', // 返回可用于uni.openLocation的坐标
					altitude: false, // 不需要高度信息
					geocode: false, // 不需要地理编码
					timeout: 15000, // 15秒超时
					enableHighAccuracy: true, // 启用高精度定位
					maximumAge: 60000 // 缓存1分钟
				};
				
				console.log('定位配置:', locationOptions);
				
				uni.getLocation({
					...locationOptions,
					success: (res) => {
						console.log('✅ 定位成功:', res);
						console.log('经度:', res.longitude, '纬度:', res.latitude);
						console.log('精度:', res.accuracy, '米');
						
						this.mapCenter = {
							longitude: res.longitude,
							latitude: res.latitude
						};
						
						// 定位成功后处理城市切换和寄存点加载
						this.handleLocationSuccess(res);
					},
					fail: (err) => {
						console.error('❌ 定位失败:', err);
						this.handleLocationFail(err);
					},
					complete: () => {
						uni.hideLoading();
					}
				});
			},
			
			// 处理定位成功
			async handleLocationSuccess(locationRes) {
				const { latitude, longitude } = locationRes;
				
				try {
					// 1. 根据经纬度获取城市信息并自动切换
					const cityInfo = await this.getCityByLocation(latitude, longitude);
					
					if (cityInfo && cityInfo.name) {
						this.currentCity = cityInfo.name;
						// 保存到本地存储，同步到首页
						uni.setStorageSync('selectedCity', cityInfo);
						
						uni.showToast({
							title: `已定位到${cityInfo.name}`,
							icon: 'success',
							duration: 1500
						});
					}
					
					// 2. 获取附近寄存点
					await this.loadNearbyLockers(latitude, longitude);
					
				} catch (error) {
					console.error('处理定位结果失败:', error);
					// 即使城市获取失败，也要尝试加载寄存点
					this.loadNearbyLockers(latitude, longitude);
				}
			},
			
			// 处理定位失败
			handleLocationFail(error) {
				console.error('定位失败详细信息:', error);
				
				let message = '定位失败';
				let suggestion = '将使用默认位置显示寄存点';
				
				if (error.errMsg) {
					if (error.errMsg.includes('auth deny') || error.errMsg.includes('denied')) {
						message = '位置权限被拒绝';
						suggestion = '请在浏览器设置中允许位置访问权限，或使用模拟数据测试';
					} else if (error.errMsg.includes('timeout')) {
						message = '定位超时';
						suggestion = '请检查网络连接，或使用模拟数据测试';
					} else if (error.errMsg.includes('unavailable')) {
						message = '定位服务不可用';
						suggestion = '请检查设备定位功能是否开启';
					}
				}
				
				uni.showModal({
					title: '定位失败',
					content: `${message}\n\n${suggestion}`,
					confirmText: '使用模拟数据',
					cancelText: '使用默认位置',
					success: (res) => {
						if (res.confirm) {
							// 用户选择使用模拟数据
							console.log('用户选择使用模拟数据');
							this.useRealAPI = false;
							this.loadMockDataWithUserLocation(this.mapCenter.latitude, this.mapCenter.longitude);
							this.loading = false;
						} else {
							// 使用默认位置（郑州）
							console.log('使用默认位置:', this.mapCenter);
							this.loadNearbyLockers(this.mapCenter.latitude, this.mapCenter.longitude);
						}
					}
				});
			},
			
			// 根据经纬度获取城市信息（从我的附近接口的响应中获取）
			getCityByLocation(latitude, longitude) {
				return new Promise((resolve, reject) => {
					// 由于我的附近接口已经返回了用户位置信息，这里直接返回默认值
					// 实际的城市信息会在loadNearbyLockers中从接口响应中获取
					resolve({
						id: 1,
						name: '当前位置',
						code: 'current'
					});
				});
			},
			
			// 重新定位
			relocate() {
				uni.showToast({
					title: '重新定位中...',
					icon: 'loading'
				});
				this.initLocation();
			},
			
			// 刷新附近寄存点
			refreshNearbyLockers() {
				if (this.mapCenter.latitude && this.mapCenter.longitude) {
					this.loadNearbyLockers(this.mapCenter.latitude, this.mapCenter.longitude);
				} else {
					this.initLocation();
				}
			},
			
			// 调用后端接口获取附近寄存点
			loadNearbyLockers(latitude, longitude) {
				this.loading = true;
				console.log('开始获取附近寄存点:', { latitude, longitude, useRealAPI: this.useRealAPI });
				
				// 如果不使用真实API，直接使用模拟数据
				if (!this.useRealAPI) {
					console.log('🔄 使用模拟数据模式');
					setTimeout(() => {
						this.loadMockDataWithUserLocation(latitude, longitude);
						this.loading = false;
					}, 1000);
					return;
				}
				
				// 调用ito-deposit后端"我的附近"接口
				const apiUrl = 'http://localhost:8000/api/nearby/my-nearby'; // 后端"我的附近"接口地址
				
				// 构建查询参数
				const params = new URLSearchParams({
					latitude: latitude.toString(),
					longitude: longitude.toString(),
					radius: '5.0', // 5公里范围
					limit: '50' // 最多返回50个寄存点
				});
				
				const fullUrl = `${apiUrl}?${params.toString()}`;
				
				console.log('请求参数:', requestData);
				
				uni.request({
					url: fullUrl,
					method: 'GET',
					header: {
						'Content-Type': 'application/json'
						// 注意：根据后端配置，这个接口不需要JWT认证
					},
					timeout: 10000, // 10秒超时
					success: (res) => {
						console.log('=== 后端"我的附近"接口响应 ===');
						console.log('状态码:', res.statusCode);
						console.log('响应数据:', res.data);
						
						if (res.statusCode === 200) {
							console.log('✅ 后端"我的附近"接口调用成功');
							console.log('📍 用户位置信息:', res.data.user_location);
							console.log('📊 附近寄存点数量:', res.data.total_count);
							
							// 根据后端返回的数据结构处理
							const userLocation = res.data.user_location;
							const nearbyPoints = res.data.nearby_points || [];
							
							// 更新地图中心为用户实际位置
							if (userLocation) {
								this.mapCenter = {
									longitude: userLocation.longitude,
									latitude: userLocation.latitude
								};
								
								// 显示用户位置信息
								uni.showToast({
									title: `定位到${userLocation.city}`,
									icon: 'success',
									duration: 1500
								});
							}
							
							console.log('📍 解析到的寄存点数据:', nearbyPoints);
							console.log('📊 寄存点数量:', nearbyPoints.length);
							
							if (nearbyPoints && nearbyPoints.length > 0) {
								// 处理寄存点数据
								this.nearbyLockers = this.processBackendLockersData(nearbyPoints);
								this.updateMapMarkers();
								this.selectedLocker = this.nearbyLockers[0];
								
								// 显示找到寄存点的提示
								uni.showToast({
									title: `找到${this.nearbyLockers.length}个寄存点`,
									icon: 'success',
									duration: 1500
								});
								
								// 自动展开列表显示寄存点
								setTimeout(() => {
									this.showLockerList = true;
								}, 1000);
								
							} else {
								// 没有找到寄存点
								this.nearbyLockers = [];
								this.mapMarkers = [];
								this.selectedLocker = null;
								
								uni.showToast({
									title: `附近${res.data.search_radius || 5}KM内暂无寄存点`,
									icon: 'none',
									duration: 2000
								});
							}
						} else {
							throw new Error(`接口返回错误: ${res.statusCode} - ${res.data?.message || '未知错误'}`);
						}
					},
					fail: (error) => {
						console.error('=== 后端"我的附近"接口调用失败 ===');
						console.error('错误详情:', error);
						console.error('请求URL:', fullUrl);
						
						// 根据错误类型显示不同提示
						let errorMessage = '网络连接失败';
						let suggestion = '';
						
						if (error.errMsg) {
							if (error.errMsg.includes('timeout')) {
								errorMessage = '请求超时';
								suggestion = '请检查网络连接或稍后重试';
							} else if (error.errMsg.includes('fail') || error.errMsg.includes('connect')) {
								errorMessage = '无法连接到后端服务';
								suggestion = '请确保后端服务已启动在 http://localhost:8000';
							} else if (error.errMsg.includes('abort')) {
								errorMessage = '请求被取消';
								suggestion = '请重新尝试';
							}
						}
						
						console.log('💡 故障排除提示:');
						console.log('1. 检查后端服务是否启动: go run cmd/ito-deposit/main.go');
						console.log('2. 检查服务端口: http://localhost:8000');
						console.log('3. 检查网络连接');
						console.log('4. 或使用模拟数据测试前端功能');
						
						uni.showModal({
							title: '连接后端服务失败',
							content: `${errorMessage}\n${suggestion}\n\n是否使用模拟数据测试前端功能？`,
							confirmText: '使用模拟数据',
							cancelText: '重试连接',
							success: (modalRes) => {
								if (modalRes.confirm) {
									console.log('🔄 切换到模拟数据模式');
									this.useRealAPI = false;
									this.loadMockDataWithUserLocation(latitude, longitude);
								} else {
									// 用户选择重试
									console.log('🔄 用户选择重试连接');
									setTimeout(() => {
										this.loadNearbyLockers(latitude, longitude);
									}, 2000);
								}
							}
						});
					},
					complete: () => {
						this.loading = false;
					}
				});
			},
			
			// 处理后端返回的寄存点数据
			processBackendLockersData(nearbyPoints) {
				return nearbyPoints.map(point => {
					return {
						id: point.id,
						name: point.name || '未知寄存点',
						large: Math.floor(Math.random() * 10) + 1, // 模拟数据，实际应该从后端获取
						medium: Math.floor(Math.random() * 10) + 1,
						small: Math.floor(Math.random() * 10) + 1,
						address: point.address || '地址未知',
						longitude: point.longitude,
						latitude: point.latitude,
						distance: point.distance.toFixed(1) + 'km',
						status: 'available' // 默认可用状态
					};
				});
			},
			
			// 处理寄存点数据（保留原方法用于模拟数据）
			processLockersData(lockers, userLat, userLng) {
				return lockers.map(locker => {
					// 计算距离
					const distance = this.calculateDistance(
						userLat, userLng, 
						locker.latitude, locker.longitude
					);
					
					return {
						id: locker.id,
						name: locker.name || '未知寄存点',
						large: locker.large_count || 0,
						medium: locker.medium_count || 0,
						small: locker.small_count || 0,
						address: locker.address || '地址未知',
						longitude: locker.longitude,
						latitude: locker.latitude,
						distance: distance,
						status: locker.status || 'available' // available, unavailable
					};
				}).sort((a, b) => {
					// 按距离排序
					return parseFloat(a.distance) - parseFloat(b.distance);
				});
			},
			
			// 计算两点间距离
			calculateDistance(lat1, lng1, lat2, lng2) {
				const R = 6371; // 地球半径（公里）
				const dLat = this.deg2rad(lat2 - lat1);
				const dLng = this.deg2rad(lng2 - lng1);
				const a = 
					Math.sin(dLat/2) * Math.sin(dLat/2) +
					Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
					Math.sin(dLng/2) * Math.sin(dLng/2);
				const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
				const distance = R * c;
				
				if (distance < 1) {
					return Math.round(distance * 1000) + 'm';
				} else {
					return distance.toFixed(1) + 'km';
				}
			},
			
			// 角度转弧度
			deg2rad(deg) {
				return deg * (Math.PI/180);
			},
			
			// 加载模拟数据（模拟后端接口返回格式）
			loadMockDataWithUserLocation(userLat, userLng) {
				console.log('=== 使用模拟数据 ===');
				console.log('模拟用户位置:', { userLat, userLng });
				
				// 确保坐标有效
				if (!userLat || !userLng || isNaN(userLat) || isNaN(userLng)) {
					console.warn('用户坐标无效，使用默认坐标（郑州）');
					userLat = 34.7466;
					userLng = 113.6253;
				}
				
				// 模拟后端返回的数据格式
				const mockResponse = {
					user_location: {
						longitude: userLng,
						latitude: userLat,
						address: '河南省郑州市中原区',
						city: '郑州市',
						district: '中原区',
						province: '河南省',
						location_type: 'mock'
					},
					nearby_points: [
						{
							id: 1,
							name: '成功驾校寄存柜',
							address: '新乡路与内环路交叉口西100米成功驾校内',
							distance: 0.8,
							longitude: userLng + 0.003,
							latitude: userLat + 0.002
						},
						{
							id: 2,
							name: '开龙天汇广场寄存柜',
							address: '农业路与东五路口西南角开龙天汇广场地下室水果区内',
							distance: 1.2,
							longitude: userLng - 0.002,
							latitude: userLat + 0.003
						},
						{
							id: 3,
							name: '郑州东站寄存柜',
							address: '郑州东站东广场地下一层',
							distance: 2.5,
							longitude: userLng + 0.001,
							latitude: userLat - 0.002
						},
						{
							id: 4,
							name: '中原万达寄存柜',
							address: '中原路与秦岭路交叉口万达广场',
							distance: 1.8,
							longitude: userLng - 0.004,
							latitude: userLat - 0.001
						}
					],
					total_count: 4,
					search_radius: 5.0,
					baidu_map_ak: '7pzoTHchDdMRK7jmpCr1sugjv3hfoxz5'
				};
				
				console.log('模拟响应数据:', mockResponse);
				
				// 更新地图中心为用户位置
				this.mapCenter = {
					longitude: mockResponse.user_location.longitude,
					latitude: mockResponse.user_location.latitude
				};
				
				console.log('更新地图中心:', this.mapCenter);
				
				// 更新城市信息
				this.currentCity = mockResponse.user_location.city;
				
				// 处理寄存点数据
				this.nearbyLockers = this.processBackendLockersData(mockResponse.nearby_points);
				this.updateMapMarkers();
				
				console.log('处理后的寄存点数据:', this.nearbyLockers);
				console.log('地图标记:', this.mapMarkers);
				
				if (this.nearbyLockers.length > 0) {
					this.selectedLocker = this.nearbyLockers[0];
					
					uni.showToast({
						title: `找到${this.nearbyLockers.length}个寄存点（模拟数据）`,
						icon: 'success',
						duration: 2000
					});
					
					// 自动展开列表显示寄存点
					setTimeout(() => {
						this.showLockerList = true;
					}, 1500);
				}
			},
			
			// 加载模拟数据（原方法，保留用于其他地方调用）
			loadMockData(userLat, userLng) {
				const mockLockers = [
					{
						id: 1,
						name: '成功驾校寄存柜',
						large: 6,
						medium: 4,
						small: 10,
						address: '新乡路与内环路交叉口西100米成功驾校内',
						longitude: userLng + 0.001,
						latitude: userLat + 0.001,
						status: 'available'
					},
					{
						id: 2,
						name: '开龙天汇广场寄存柜',
						large: 0,
						medium: 0,
						small: 0,
						address: '农业路与东五路口西南角开龙天汇广场地下室水果区内',
						longitude: userLng + 0.002,
						latitude: userLat + 0.002,
						status: 'unavailable'
					},
					{
						id: 3,
						name: '郑州东站寄存柜',
						large: 8,
						medium: 6,
						small: 15,
						address: '郑州东站东广场地下一层',
						longitude: userLng - 0.001,
						latitude: userLat - 0.001,
						status: 'available'
					}
				];
				
				// 处理模拟数据，计算距离
				this.nearbyLockers = this.processLockersData(mockLockers, userLat, userLng);
				this.updateMapMarkers();
				
				if (this.nearbyLockers.length > 0) {
					this.selectedLocker = this.nearbyLockers[0];
				}
			},
			
			// 更新地图标记
			updateMapMarkers() {
				console.log('=== 更新地图标记 ===');
				console.log('寄存点数据:', this.nearbyLockers);
				
				this.mapMarkers = this.nearbyLockers.map((locker, index) => {
					const marker = {
						id: locker.id,
						longitude: parseFloat(locker.longitude),
						latitude: parseFloat(locker.latitude),
						width: 30,
						height: 30,
						anchor: {
							x: 0.5,
							y: 1
						},
						callout: {
							content: `${locker.name}\n距离: ${locker.distance}\n地址: ${locker.address}`,
							fontSize: 12,
							borderRadius: 6,
							bgColor: '#ffffff',
							padding: 8,
							display: 'BYCLICK',
							textAlign: 'left'
						},
						// 添加标签显示距离
						label: {
							content: locker.distance,
							fontSize: 10,
							color: '#ffffff',
							bgColor: locker.status === 'available' ? '#007AFF' : '#FF6B6B',
							borderRadius: 6,
							padding: 3,
							anchorX: 0.5,
							anchorY: -0.5
						}
					};
					
					// 不设置自定义图标，使用系统默认标记
					// 这样可以避免图标文件不存在的问题
					
					console.log(`标记 ${index + 1}:`, marker);
					return marker;
				});
				
				console.log('✅ 地图标记已更新:', this.mapMarkers.length, '个标记');
				console.log('标记详情:', this.mapMarkers);
				
				// 如果有寄存点，调整地图视野以包含所有标记
				if (this.mapMarkers.length > 0) {
					this.adjustMapView();
				}
			},
			
			// 调整地图视野
			adjustMapView() {
				// 计算所有标记的边界
				let minLat = this.mapMarkers[0].latitude;
				let maxLat = this.mapMarkers[0].latitude;
				let minLng = this.mapMarkers[0].longitude;
				let maxLng = this.mapMarkers[0].longitude;
				
				this.mapMarkers.forEach(marker => {
					minLat = Math.min(minLat, marker.latitude);
					maxLat = Math.max(maxLat, marker.latitude);
					minLng = Math.min(minLng, marker.longitude);
					maxLng = Math.max(maxLng, marker.longitude);
				});
				
				// 计算中心点和缩放级别
				const centerLat = (minLat + maxLat) / 2;
				const centerLng = (minLng + maxLng) / 2;
				
				// 更新地图中心（如果需要的话）
				// this.mapCenter = {
				//     latitude: centerLat,
				//     longitude: centerLng
				// };
			},
			
			// 地图标记点击
			onMarkerTap(e) {
				const markerId = e.detail.markerId;
				const locker = this.nearbyLockers.find(item => item.id === markerId);
				if (locker) {
					this.selectedLocker = locker;
					this.showLockerList = false;
				}
			},
			
			// 地图区域变化
			onRegionChange(e) {
				if (e.type === 'end') {
					console.log('地图区域变化:', e.detail);
					
					// 更新地图中心点
					if (e.detail && e.detail.centerLocation) {
						this.mapCenter = {
							longitude: e.detail.centerLocation.longitude,
							latitude: e.detail.centerLocation.latitude
						};
						
						// 可选：拖拽地图后自动重新搜索附近寄存点
						// this.searchNearbyInNewArea();
					}
				}
			},
			
			// 地图点击事件
			onMapTap(e) {
				console.log('地图点击:', e.detail);
			},
			
			// 地图更新事件
			onMapUpdated(e) {
				console.log('地图更新完成:', e.detail);
			},
			
			// 在新区域搜索附近寄存点
			searchNearbyInNewArea() {
				// 防抖处理，避免频繁请求
				if (this.searchTimer) {
					clearTimeout(this.searchTimer);
				}
				
				this.searchTimer = setTimeout(() => {
					uni.showToast({
						title: '正在搜索新区域...',
						icon: 'loading',
						duration: 1000
					});
					
					this.loadNearbyLockers(this.mapCenter.latitude, this.mapCenter.longitude);
				}, 1000);
			},
			
			// 切换寄存点列表显示
			toggleLockerList() {
				this.showLockerList = !this.showLockerList;
			},
			
			// 选择寄存点
			selectLocker(locker) {
				console.log('选择寄存点:', locker);
				uni.navigateTo({
					url: `/pages/locker-detail/locker-detail?id=${locker.id}`
				});
			},
			
			// 打开搜索
			openSearch() {
				uni.showToast({
					title: '跳转到搜索页面',
					icon: 'none'
				});
				// TODO: 跳转到搜索页面
				// uni.navigateTo({
				//     url: '/pages/search/search'
				// });
			},
			
			// 开始实时更新
			startRealTimeUpdate() {
				// 每30秒更新一次附近寄存点信息
				this.realTimeUpdateTimer = setInterval(() => {
					if (this.mapCenter.latitude && this.mapCenter.longitude && !this.loading) {
						console.log('实时更新附近寄存点');
						this.loadNearbyLockers(this.mapCenter.latitude, this.mapCenter.longitude);
					}
				}, 30000); // 30秒更新一次
			},
			
			// 停止实时更新
			stopRealTimeUpdate() {
				if (this.realTimeUpdateTimer) {
					clearInterval(this.realTimeUpdateTimer);
					this.realTimeUpdateTimer = null;
				}
			},
			
			// 手动刷新所有数据
			refreshAllData() {
				uni.showLoading({
					title: '刷新中...'
				});
				
				// 重新定位并获取数据
				this.initLocation();
			},
			
			// 切换API模式（开发测试用）
			toggleAPIMode() {
				this.useRealAPI = !this.useRealAPI;
				
				uni.showToast({
					title: `已切换到${this.useRealAPI ? '真实API' : '模拟数据'}模式`,
					icon: 'none',
					duration: 2000
				});
				
				// 重新加载数据
				setTimeout(() => {
					this.refreshAllData();
				}, 1000);
			}
		}
	}
</script>

<style>
	.page {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: #F5F5F5;
	}
	
	/* 搜索栏 */
	.search-section {
		background-color: #FFFFFF;
		padding: 20rpx 30rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
		z-index: 10;
	}
	
	.location-info {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}
	
	.location-icon {
		font-size: 28rpx;
		margin-right: 8rpx;
	}
	
	.current-city {
		font-size: 28rpx;
		color: #1A1A1A;
		font-weight: 600;
	}
	
	.search-box {
		display: flex;
		align-items: center;
		background-color: #F8F9FA;
		padding: 20rpx 30rpx;
		border-radius: 50rpx;
		border: 1rpx solid #E9ECEF;
	}
	
	.search-icon {
		font-size: 28rpx;
		margin-right: 16rpx;
		opacity: 0.6;
	}
	
	.search-placeholder {
		font-size: 28rpx;
		color: #8E8E93;
	}
	
	/* 地图容器 */
	.map-container {
		flex: 1;
		position: relative;
	}
	
	.map {
		width: 100%;
		height: 100%;
	}
	
	.location-btn {
		position: absolute;
		right: 30rpx;
		top: 30rpx;
		width: 80rpx;
		height: 80rpx;
		background-color: #FFFFFF;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
		z-index: 5;
	}
	
	.location-btn:active {
		transform: scale(0.95);
	}
	
	.location-btn-icon {
		font-size: 32rpx;
	}
	
	.refresh-btn {
		position: absolute;
		right: 30rpx;
		top: 130rpx;
		width: 80rpx;
		height: 80rpx;
		background-color: #FFFFFF;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
		z-index: 5;
	}
	
	.refresh-btn:active {
		transform: scale(0.95);
	}
	
	.refresh-btn-icon {
		font-size: 28rpx;
	}
	
	.api-mode-btn {
		position: absolute;
		right: 30rpx;
		top: 230rpx;
		background-color: #FFFFFF;
		border-radius: 20rpx;
		padding: 12rpx 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
		z-index: 5;
	}
	
	.api-mode-btn:active {
		transform: scale(0.95);
	}
	
	.api-mode-text {
		font-size: 22rpx;
		color: #007AFF;
		font-weight: 500;
	}
	
	.debug-info {
		position: absolute;
		left: 30rpx;
		top: 230rpx;
		background-color: #FF6B6B;
		border-radius: 20rpx;
		padding: 8rpx 16rpx;
		z-index: 5;
	}
	
	.debug-text {
		font-size: 20rpx;
		color: #FFFFFF;
		font-weight: 500;
	}
	
	/* 底部面板 */
	.bottom-panel {
		background-color: #FFFFFF;
		border-radius: 24rpx 24rpx 0 0;
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
		transition: all 0.3s ease;
		max-height: 40vh;
		min-height: 200rpx;
	}
	
	.bottom-panel.expanded {
		max-height: 60vh;
	}
	
	.drag-indicator {
		padding: 20rpx;
		display: flex;
		justify-content: center;
		cursor: pointer;
	}
	
	.drag-line {
		width: 60rpx;
		height: 6rpx;
		background-color: #E9ECEF;
		border-radius: 3rpx;
	}
	
	/* 无寄存点状态 */
	.no-lockers {
		text-align: center;
		padding: 60rpx 30rpx;
	}
	
	.no-lockers-title {
		font-size: 36rpx;
		color: #1A1A1A;
		font-weight: 600;
		display: block;
		margin-bottom: 16rpx;
	}
	
	.no-lockers-desc {
		font-size: 28rpx;
		color: #8E8E93;
	}
	
	/* 寄存点内容 */
	.lockers-content {
		padding: 0 30rpx 30rpx;
	}
	
	.lockers-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 0;
		border-bottom: 1rpx solid #F0F0F0;
		margin-bottom: 20rpx;
	}
	
	.lockers-count {
		font-size: 28rpx;
		color: #1A1A1A;
		font-weight: 600;
	}
	
	.refresh-text {
		font-size: 26rpx;
		color: #007AFF;
		padding: 8rpx 16rpx;
		border-radius: 20rpx;
		background-color: rgba(0, 122, 255, 0.1);
		transition: all 0.3s ease;
	}
	
	.refresh-text:active {
		background-color: rgba(0, 122, 255, 0.2);
		transform: scale(0.95);
	}
	
	/* 寄存点列表 */
	.lockers-list {
		max-height: 400rpx;
	}
	
	.locker-card {
		display: flex;
		padding: 30rpx 0;
		border-bottom: 1rpx solid #F0F0F0;
		transition: all 0.3s ease;
	}
	
	.locker-card:active {
		background-color: rgba(0, 122, 255, 0.05);
		transform: scale(0.98);
	}
	
	.locker-card:last-child {
		border-bottom: none;
	}
	
	.locker-image {
		width: 120rpx;
		height: 120rpx;
		border-radius: 12rpx;
		margin-right: 24rpx;
		background-color: #F5F5F5;
	}
	
	.locker-info {
		flex: 1;
		position: relative;
	}
	
	.locker-name {
		font-size: 30rpx;
		color: #1A1A1A;
		font-weight: 600;
		display: block;
		margin-bottom: 12rpx;
	}
	
	.locker-capacity {
		font-size: 24rpx;
		color: #007AFF;
		display: block;
		margin-bottom: 12rpx;
	}
	
	.locker-capacity.unavailable {
		color: #FF6B6B;
	}
	
	.locker-location {
		display: flex;
		align-items: center;
	}
	
	.location-text {
		font-size: 24rpx;
		color: #8E8E93;
		margin-left: 8rpx;
		flex: 1;
	}
	
	.distance {
		position: absolute;
		top: 0;
		right: 0;
		font-size: 22rpx;
		color: #007AFF;
		background-color: rgba(0, 122, 255, 0.1);
		padding: 4rpx 12rpx;
		border-radius: 12rpx;
	}
	
	/* 当前选择寄存柜 */
	.current-locker {
		padding: 20rpx 0;
	}
	
	.current-locker-content {
		display: flex;
		align-items: center;
		padding: 20rpx;
		background-color: #F8F9FA;
		border-radius: 12rpx;
		transition: all 0.3s ease;
	}
	
	.current-locker-content:active {
		background-color: rgba(0, 122, 255, 0.05);
		transform: scale(0.98);
	}
	
	.current-locker-image {
		width: 80rpx;
		height: 80rpx;
		border-radius: 8rpx;
		margin-right: 20rpx;
		background-color: #F5F5F5;
	}
	
	.current-locker-name {
		font-size: 28rpx;
		color: #1A1A1A;
		font-weight: 600;
		display: block;
		margin-bottom: 8rpx;
	}
	
	.current-locker-capacity {
		font-size: 22rpx;
		color: #007AFF;
	}
	
	.current-locker-capacity.unavailable {
		color: #FF6B6B;
	}
	
	/* 加载状态 */
	.loading {
		text-align: center;
		padding: 60rpx 30rpx;
	}
	
	.loading-text {
		font-size: 28rpx;
		color: #8E8E93;
	}
</style>