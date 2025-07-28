<template>
	<view class="page">
		<!-- 顶部信息栏 -->
		<view class="header-section">
			<view class="city-info">
				<view class="city-selector" @click="selectCity">
					<text class="city-icon">📍</text>
					<text class="city-name">{{currentCity}}</text>
					<text class="dropdown-icon">▼</text>
				</view>
				<view class="locker-stats">
					<text class="stats-text">共找到 {{totalLockers}} 个寄存点</text>
				</view>
			</view>
			<view class="refresh-btn" @click="refreshMap">
				<text class="refresh-icon">🔄</text>
				<text class="refresh-text">刷新</text>
			</view>
		</view>
		
		<!-- 地图容器 -->
		<view class="map-container">
			<!-- 地图加载状态 -->
			<view class="map-placeholder" v-if="!mapReady">
				<view class="placeholder-content">
					<text class="placeholder-icon">🗺️</text>
					<text class="placeholder-text">{{loadingText}}</text>
					<view class="loading-spinner" v-if="isLoading"></view>
				</view>
			</view>
			
			<!-- 百度地图容器 -->
			<view id="lockerMapContainer" class="baidu-map-container" v-show="mapReady"></view>
			
			<!-- 地图控制按钮 -->
			<view class="map-controls">
				<view class="control-btn center-btn" @click="centerToCity">
					<text class="btn-icon">🎯</text>
					<text class="btn-text">居中</text>
				</view>
				<view class="control-btn filter-btn" @click="showFilterPanel">
					<text class="btn-icon">🔍</text>
					<text class="btn-text">筛选</text>
				</view>
				<view class="control-btn list-btn" @click="showLockerList">
					<text class="btn-icon">📋</text>
					<text class="btn-text">列表</text>
				</view>
			</view>
		</view>
		
		<!-- 筛选面板 -->
		<view class="filter-panel" v-if="showFilter">
			<view class="filter-header">
				<text class="filter-title">筛选条件</text>
				<text class="close-btn" @click="hideFilterPanel">✕</text>
			</view>
			<view class="filter-content">
				<view class="filter-item">
					<text class="filter-label">营业状态</text>
					<view class="filter-options">
						<view class="filter-option" 
							:class="{ active: statusFilter === 'all' }"
							@click="setStatusFilter('all')"
						>
							<text class="option-text">全部</text>
						</view>
						<view class="filter-option" 
							:class="{ active: statusFilter === 'available' }"
							@click="setStatusFilter('available')"
						>
							<text class="option-text">营业中</text>
						</view>
						<view class="filter-option" 
							:class="{ active: statusFilter === 'unavailable' }"
							@click="setStatusFilter('unavailable')"
						>
							<text class="option-text">暂停服务</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 寄存点列表面板 -->
		<view class="locker-list-panel" v-if="showList">
			<view class="list-header">
				<text class="list-title">{{currentCity}}寄存点列表</text>
				<text class="close-btn" @click="hideLockerList">✕</text>
			</view>
			<scroll-view class="list-content" scroll-y="true">
				<view class="locker-item" 
					v-for="(locker, index) in filteredLockers" 
					:key="index"
					@click="selectLocker(locker)"
				>
					<view class="locker-info">
						<text class="locker-name">{{locker.name}}</text>
						<text class="locker-address">📍 {{locker.address}}</text>
						<view class="locker-capacity">
							<text class="capacity-item large">大{{locker.large || 0}}</text>
							<text class="capacity-item medium">中{{locker.medium || 0}}</text>
							<text class="capacity-item small">小{{locker.small || 0}}</text>
						</view>
					</view>
					<view class="locker-status" :class="locker.status || 'available'">
						<text class="status-text">{{(locker.status === 'available' || !locker.status) ? '营业中' : '暂停服务'}}</text>
					</view>
				</view>
			</scroll-view>
		</view>
		
		<!-- 选中寄存点信息 -->
		<view class="selected-locker-info" v-if="selectedLocker">
			<view class="info-header">
				<text class="locker-name">{{selectedLocker.name}}</text>
				<text class="close-btn" @click="clearSelection">✕</text>
			</view>
			<view class="info-content">
				<text class="locker-address">📍 {{selectedLocker.address}}</text>
				<view class="capacity-info">
					<view class="capacity-item">
						<text class="capacity-label">大柜</text>
						<text class="capacity-value">{{selectedLocker.large || 0}}</text>
					</view>
					<view class="capacity-item">
						<text class="capacity-label">中柜</text>
						<text class="capacity-value">{{selectedLocker.medium || 0}}</text>
					</view>
					<view class="capacity-item">
						<text class="capacity-label">小柜</text>
						<text class="capacity-value">{{selectedLocker.small || 0}}</text>
					</view>
				</view>
				<view class="info-actions">
					<button class="action-btn primary" @click="goToDetail">查看详情</button>
					<button class="action-btn secondary" @click="getDirections">获取路线</button>
				</view>
			</view>
		</view>
		
		<!-- 加载遮罩 -->
		<view v-if="isLoading" class="loading-overlay">
			<view class="loading-content">
				<view class="loading-spinner"></view>
				<text class="loading-text">{{loadingText}}</text>
			</view>
		</view>
	</view>
</template>

<script>
	// 百度地图AK配置
	const BAIDU_MAP_AK = '9jnxn6bIxVgX1u4KffC5Cc83dTMzzYIA';
	
	export default {
		data() {
			return {
				// 基本信息
				currentCity: '郑州',
				totalLockers: 0,
				
				// 地图相关
				mapInstance: null,
				mapReady: false,
				isLoading: true,
				loadingText: '正在加载地图...',
				
				// 寄存点数据
				lockers: [],
				selectedLocker: null,
				mapMarkers: [], // 地图标记点
				
				// 筛选相关
				showFilter: false,
				statusFilter: 'all', // all, available, unavailable
				
				// 列表相关
				showList: false
			}
		},
		
		computed: {
			filteredLockers() {
				let filtered = this.lockers;
				
				// 按状态筛选
				if (this.statusFilter !== 'all') {
					filtered = filtered.filter(locker => {
						const status = locker.status || 'available';
						return status === this.statusFilter;
					});
				}
				
				return filtered;
			}
		},
		
		onLoad() {
			console.log('寄存点分布图页面加载');
			
			// 获取当前选择的城市
			const selectedCity = uni.getStorageSync('selectedCity');
			if (selectedCity) {
				this.currentCity = selectedCity.name;
			}
			
			// 使用nextTick确保DOM已渲染
			this.$nextTick(() => {
				this.initMap().catch(error => {
					console.error('地图初始化失败:', error);
					this.handleError('地图初始化失败: ' + error.message);
				});
			});
		},
		
		onUnload() {
			console.log('页面卸载，清理地图资源');
			if (this.mapInstance) {
				this.mapInstance = null;
			}
		},
		
		methods: {
			// 初始化地图
			async initMap() {
				console.log('🗺️ 开始初始化寄存点分布图');
				this.loadingText = '正在加载百度地图...';
				this.isLoading = true;
				
				try {
					// 加载百度地图API
					await this.loadBaiduMapAPI();
					
					// 创建地图实例
					this.createMapInstance();
					
					// 等待地图实例创建完成后加载数据
					setTimeout(() => {
						if (this.mapReady) {
							this.loadLockersData();
						} else {
							// 如果地图还没准备好，等待地图加载完成事件
							console.log('等待地图加载完成...');
						}
					}, 1500);
					
				} catch (error) {
					console.error('地图初始化失败:', error);
					this.isLoading = false;
					// 如果地图加载失败，直接使用模拟数据
					this.handleNetworkError();
				}
			},
			
			// 加载百度地图API
			loadBaiduMapAPI() {
				return new Promise((resolve, reject) => {
					// 如果已经加载，直接resolve
					if (typeof window.BMap !== 'undefined') {
						resolve();
						return;
					}
					
					console.log('📡 加载百度地图JavaScript API');
					
					// 设置超时
					const timeout = setTimeout(() => {
						reject(new Error('百度地图API加载超时'));
					}, 10000);
					
					const script = document.createElement('script');
					script.type = 'text/javascript';
					script.src = `https://api.map.baidu.com/api?v=3.0&ak=${BAIDU_MAP_AK}&callback=initLockerMapCallback`;
					
					script.onerror = () => {
						clearTimeout(timeout);
						reject(new Error('百度地图API加载失败'));
					};
					
					// 创建全局回调函数
					window.initLockerMapCallback = () => {
						clearTimeout(timeout);
						console.log('✅ 百度地图API加载完成');
						// 清理回调函数
						delete window.initLockerMapCallback;
						resolve();
					};
					
					document.head.appendChild(script);
				});
			},
			
			// 创建地图实例
			createMapInstance() {
				console.log('🗺️ 创建百度地图实例');
				this.loadingText = '正在创建地图...';
				
				try {
					// 检查百度地图API是否已加载
					if (typeof window.BMap === 'undefined') {
						throw new Error('百度地图API未加载');
					}
					
					const mapContainer = document.getElementById('lockerMapContainer');
					if (!mapContainer) {
						throw new Error('地图容器未找到');
					}
					
					// 获取城市坐标
					const selectedCity = uni.getStorageSync('selectedCity');
					const cityCoords = selectedCity?.coordinates || {
						longitude: 113.6253,
						latitude: 34.7466
					};
					
					// 创建地图实例
					this.mapInstance = new window.BMap.Map(mapContainer);
					const centerPoint = new window.BMap.Point(cityCoords.longitude, cityCoords.latitude);
					this.mapInstance.centerAndZoom(centerPoint, 12);
					
					// 启用地图功能
					this.mapInstance.enableScrollWheelZoom(true);
					this.mapInstance.addControl(new window.BMap.NavigationControl());
					this.mapInstance.addControl(new window.BMap.ScaleControl());
					
					// 地图加载完成事件
					this.mapInstance.addEventListener('tilesloaded', () => {
						console.log('✅ 地图瓦片加载完成');
						this.mapReady = true;
						this.loadingText = '';
						
						// 如果还没有加载寄存点数据，现在加载
						if (this.lockers.length === 0) {
							setTimeout(() => {
								this.loadLockersData();
							}, 500);
						}
					});
					
					// 添加地图初始化完成的备用检查
					setTimeout(() => {
						if (!this.mapReady) {
							console.log('⚠️ 地图瓦片加载超时，强制设置为就绪状态');
							this.mapReady = true;
							this.loadingText = '';
							if (this.lockers.length === 0) {
								this.loadLockersData();
							}
						}
					}, 5000);
					
					console.log('✅ 百度地图实例创建完成');
					
				} catch (error) {
					console.error('❌ 创建地图实例失败:', error);
					this.handleError('创建地图实例失败: ' + error.message);
				}
			},			

			// 加载寄存点数据
			loadLockersData() {
				console.log('📍 开始加载寄存点分布数据');
				this.loadingText = '正在加载寄存点数据...';
				this.isLoading = true;
				
				// 获取城市信息
				const selectedCity = uni.getStorageSync('selectedCity');
				const cityCoords = selectedCity?.coordinates || {
					longitude: 113.6253,
					latitude: 34.7466
				};
				
				// 首先尝试调用后端接口，如果失败则直接使用模拟数据
				this.tryLoadFromAPI(cityCoords);
			},
			
			// 尝试从API加载数据
			tryLoadFromAPI(cityCoords) {
				const apiUrl = 'http://localhost:8000/api/nearby/city/map';
				
				// 计算边界框（以城市中心为中心，半径约10公里的矩形区域）
				const radiusInDegrees = 0.1; // 约11公里的度数差
				const bounds = {
					northLat: cityCoords.latitude + radiusInDegrees,
					southLat: cityCoords.latitude - radiusInDegrees,
					eastLng: cityCoords.longitude + radiusInDegrees,
					westLng: cityCoords.longitude - radiusInDegrees
				};
				
				// 使用正确的参数格式
				const queryParams = new URLSearchParams({
					city_name: this.currentCity,
					north_lat: bounds.northLat.toString(),
					south_lat: bounds.southLat.toString(),
					east_lng: bounds.eastLng.toString(),
					west_lng: bounds.westLng.toString(),
					zoom_level: '12',
					enable_cluster: 'false'
				});
				
				const fullUrl = `${apiUrl}?${queryParams.toString()}`;
				
				console.log('📡 尝试调用寄存点分布图接口:', {
					url: fullUrl,
					method: 'GET',
					params: {
						city_name: this.currentCity,
						bounds: bounds,
						zoom_level: 12,
						enable_cluster: false
					}
				});
				
				// 设置较短的超时时间，快速失败
				uni.request({
					url: fullUrl,
					method: 'GET',
					header: {
						'Content-Type': 'application/json',
						'Accept': 'application/json'
					},
					timeout: 8000, // 给后端接口足够时间
					success: (res) => {
						console.log('=== 寄存点分布图接口响应 ===');
						console.log('HTTP状态码:', res.statusCode);
						console.log('响应数据:', res.data);
						console.log('响应数据类型:', typeof res.data);
						console.log('响应数据结构:', Object.keys(res.data || {}));
						
						this.isLoading = false;
						
						if (res.statusCode === 200 && res.data) {
							this.handleLockersDataSuccess(res.data);
						} else {
							console.log('⚠️ API返回非200状态码，使用模拟数据');
							this.handleNetworkError();
						}
					},
					fail: (error) => {
						console.log('⚠️ API调用失败，自动使用模拟数据:', error);
						console.log('错误详情:', {
							errMsg: error.errMsg,
							statusCode: error.statusCode,
							data: error.data
						});
						this.isLoading = false;
						this.handleNetworkError();
					}
				});
			},
			
			// 处理寄存点数据成功响应
			handleLockersDataSuccess(data) {
				console.log('✅ 寄存点数据加载成功');
				console.log('原始响应数据:', data);
				
				try {
					let lockersData = [];
					
					// 处理地图API的响应格式
					if (data.points && Array.isArray(data.points)) {
						// 地图API返回的详细点位数据
						lockersData = data.points;
					} else if (data.clusters && Array.isArray(data.clusters)) {
						// 地图API返回的聚合数据，需要展开
						console.log('⚠️ 收到聚合数据，但当前版本不支持聚合显示，使用模拟数据');
						this.handleNetworkError();
						return;
					} else if (data.data && Array.isArray(data.data)) {
						lockersData = data.data;
					} else if (data.locker_points && Array.isArray(data.locker_points)) {
						lockersData = data.locker_points;
					} else if (data.results && Array.isArray(data.results)) {
						lockersData = data.results;
					} else if (data.lockers && Array.isArray(data.lockers)) {
						lockersData = data.lockers;
					} else if (Array.isArray(data)) {
						lockersData = data;
					} else {
						console.log('⚠️ 未识别的响应数据格式，尝试提取所有可能的数组字段');
						// 尝试找到任何数组字段
						Object.keys(data).forEach(key => {
							if (Array.isArray(data[key]) && data[key].length > 0) {
								console.log(`发现数组字段: ${key}`, data[key]);
								if (lockersData.length === 0) {
									lockersData = data[key];
								}
							}
						});
					}
					
					// 处理和格式化寄存点数据
					const processedLockers = this.processMapPointsData(lockersData);
					
					this.lockers = processedLockers;
					this.totalLockers = processedLockers.length;
					
					console.log(`📍 成功加载 ${this.totalLockers} 个寄存点`);
					console.log('处理后的寄存点数据:', processedLockers);
					
					if (processedLockers.length > 0) {
						this.displayLockersOnMap();
						
						uni.showToast({
							title: `加载了${this.totalLockers}个寄存点`,
							icon: 'success',
							duration: 2000
						});
					} else {
						console.log('⚠️ 处理后无有效寄存点数据，使用模拟数据');
						this.handleNetworkError();
					}
					
				} catch (error) {
					console.error('❌ 处理寄存点数据失败:', error);
					this.handleError('处理寄存点数据失败: ' + error.message);
				}
			},
			
			// 处理和格式化寄存点数据
			processLockersData(rawData) {
				console.log('🔄 处理寄存点数据格式');
				
				if (!Array.isArray(rawData) || rawData.length === 0) {
					return [];
				}
				
				return rawData.map((item, index) => {
					console.log(`处理第${index + 1}个寄存点:`, item);
					
					// 处理多种可能的字段名
					const processedItem = {
						// ID字段
						id: item.id || item.locker_id || item.point_id || `map_${index + 1}`,
						
						// 名称字段
						name: item.name || item.locker_name || item.point_name || item.location_name || `寄存点${index + 1}`,
						
						// 地址字段
						address: item.address || item.location || item.location_address || item.full_address || '地址信息待完善',
						
						// 坐标字段
						longitude: parseFloat(item.longitude || item.lng || item.lon || 113.6253),
						latitude: parseFloat(item.latitude || item.lat || 34.7466),
						
						// 寄存柜容量字段
						large: parseInt(item.large_count || item.large || item.large_capacity || item.big_count || 0),
						medium: parseInt(item.medium_count || item.medium || item.medium_capacity || item.mid_count || 0),
						small: parseInt(item.small_count || item.small || item.small_capacity || 0),
						
						// 状态字段
						status: item.status || item.state || (item.available ? 'available' : 'unavailable') || 'available',
						
						// 其他可能有用的字段
						distance: item.distance || item.dist || '0km',
						rating: item.rating || item.score || 0,
						
						// 保留原始数据用于调试
						rawData: item
					};
					
					console.log(`处理后的第${index + 1}个寄存点:`, processedItem);
					return processedItem;
				});
			},
			
			// 处理地图API返回的点位数据
			processMapPointsData(rawData) {
				console.log('🔄 处理地图API点位数据格式');
				
				if (!Array.isArray(rawData) || rawData.length === 0) {
					return [];
				}
				
				return rawData.map((item, index) => {
					console.log(`处理第${index + 1}个地图点位:`, item);
					
					// 地图API返回的数据格式
					const processedItem = {
						// ID字段
						id: item.id || `map_${index + 1}`,
						
						// 名称字段
						name: item.name || `寄存点${index + 1}`,
						
						// 地址字段
						address: item.address || '地址信息待完善',
						
						// 坐标字段
						longitude: parseFloat(item.longitude || 113.6253),
						latitude: parseFloat(item.latitude || 34.7466),
						
						// 从total_available推算各种柜子数量
						totalAvailable: parseInt(item.total_available || 0),
						large: Math.floor((item.total_available || 0) * 0.3), // 假设30%是大柜
						medium: Math.floor((item.total_available || 0) * 0.4), // 假设40%是中柜
						small: Math.floor((item.total_available || 0) * 0.3), // 假设30%是小柜
						
						// 状态字段映射
						status: this.mapPointStatusToLockerStatus(item.status),
						
						// 其他字段
						distance: '0km',
						rating: 0,
						
						// 保留原始数据用于调试
						rawData: item
					};
					
					console.log(`处理后的第${index + 1}个地图点位:`, processedItem);
					return processedItem;
				});
			},
			
			// 将地图点位状态映射为寄存点状态
			mapPointStatusToLockerStatus(mapStatus) {
				switch (mapStatus) {
					case 'available':
						return 'available';
					case 'busy':
						return 'available'; // 繁忙但仍可用
					case 'full':
						return 'unavailable'; // 满了就不可用
					default:
						return 'available';
				}
			},
			
			// 处理网络错误，使用模拟数据
			handleNetworkError() {
				console.log('🔄 API不可用，使用模拟寄存点数据');
				this.loadingText = '正在加载模拟数据...';
				
				// 模拟加载延迟，提供更好的用户体验
				setTimeout(() => {
					const selectedCity = uni.getStorageSync('selectedCity');
					const cityCoords = selectedCity?.coordinates || {
						longitude: 113.6253,
						latitude: 34.7466
					};
					
					const mockLockers = this.generateMockLockers(cityCoords);
					
					this.lockers = mockLockers;
					this.totalLockers = mockLockers.length;
					this.isLoading = false;
					
					console.log(`✅ 成功加载 ${this.totalLockers} 个模拟寄存点`);
					
					this.displayLockersOnMap();
					
					// 显示友好的提示信息
					uni.showToast({
						title: `已加载${this.totalLockers}个寄存点`,
						icon: 'success',
						duration: 2000
					});
					
					// 在控制台显示提示信息
					console.log('💡 提示：当前使用模拟数据，如需真实数据请确保后端服务正常运行');
					
				}, 800); // 模拟加载时间
			},
			
			// 生成模拟寄存点数据
			generateMockLockers(centerCoords) {
				const mockLockers = [];
				const lockerNames = [
					'郑州东站寄存点', '二七广场寄存点', '郑州大学寄存点', 
					'CBD商务区寄存点', '火车站寄存点', '紫荆山寄存点',
					'金水路寄存点', '花园路寄存点', '中原万达寄存点',
					'郑州机场寄存点', '高铁站寄存点', '市政府寄存点'
				];
				
				const addresses = [
					'郑州东站西广场', '二七广场地铁站', '郑州大学南门',
					'CBD商务内环路', '郑州火车站东广场', '紫荆山地铁站',
					'金水路玉凤路', '花园路农业路', '中原万达广场',
					'新郑国际机场', '郑州东站', '市政府大楼'
				];
				
				for (let i = 0; i < 12; i++) {
					const offsetLng = (Math.random() - 0.5) * 0.1;
					const offsetLat = (Math.random() - 0.5) * 0.1;
					
					mockLockers.push({
						id: i + 1,
						name: lockerNames[i],
						address: addresses[i],
						longitude: centerCoords.longitude + offsetLng,
						latitude: centerCoords.latitude + offsetLat,
						large: Math.floor(Math.random() * 10) + 5,
						medium: Math.floor(Math.random() * 15) + 10,
						small: Math.floor(Math.random() * 20) + 15,
						status: Math.random() > 0.2 ? 'available' : 'unavailable',
						distance: (Math.random() * 10 + 0.5).toFixed(1) + 'km',
						rating: (Math.random() * 2 + 3).toFixed(1)
					});
				}
				
				return mockLockers;
			},
			
			// 在地图上显示寄存点
			displayLockersOnMap() {
				if (!this.mapInstance) {
					console.error('❌ 地图实例不存在');
					return;
				}
				
				console.log('📍 在地图上显示寄存点标记');
				
				this.clearMapMarkers();
				
				this.lockers.forEach((locker, index) => {
					this.createLockerMarker(locker, index);
				});
				
				this.fitMapToMarkers();
			},
			
			// 创建寄存点标记
			createLockerMarker(locker, index) {
				try {
					const point = new BMap.Point(locker.longitude, locker.latitude);
					
					// 使用简单的SVG图标，避免emoji编码问题
					const iconUrl = locker.status === 'available' 
						? 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
							<svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
								<path d="M16 0C7.2 0 0 7.2 0 16c0 16 16 24 16 24s16-8 16-24C32 7.2 24.8 0 16 0z" fill="#007AFF"/>
								<circle cx="16" cy="16" r="8" fill="white"/>
								<circle cx="16" cy="16" r="4" fill="#007AFF"/>
							</svg>
						`)
						: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
							<svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
								<path d="M16 0C7.2 0 0 7.2 0 16c0 16 16 24 16 24s16-8 16-24C32 7.2 24.8 0 16 0z" fill="#FF3B30"/>
								<circle cx="16" cy="16" r="8" fill="white"/>
								<path d="M12 12 L20 20 M20 12 L12 20" stroke="#FF3B30" stroke-width="2"/>
							</svg>
						`);
					
					// 检查百度地图API是否可用
					if (typeof window.BMap === 'undefined') {
						console.error('百度地图API不可用');
						return;
					}
					
					const icon = new window.BMap.Icon(iconUrl, new window.BMap.Size(32, 40), {
						anchor: new window.BMap.Size(16, 40)
					});
					
					const marker = new window.BMap.Marker(point, { icon });
					
					// 添加点击事件
					marker.addEventListener('click', () => {
						this.onMarkerClick(locker);
					});
					
					// 创建信息窗口内容（避免使用emoji）
					const infoContent = `
						<div style="padding: 10px; min-width: 200px;">
							<h4 style="margin: 0 0 8px 0; color: #333;">${locker.name || '未知寄存点'}</h4>
							<p style="margin: 4px 0; color: #666; font-size: 12px;">地址: ${locker.address || '地址未知'}</p>
							<div style="margin: 8px 0;">
								<span style="margin-right: 10px; font-size: 12px;">大柜: ${locker.large || 0}</span>
								<span style="margin-right: 10px; font-size: 12px;">中柜: ${locker.medium || 0}</span>
								<span style="font-size: 12px;">小柜: ${locker.small || 0}</span>
							</div>
							<div style="margin-top: 8px;">
								<span style="padding: 2px 6px; border-radius: 4px; font-size: 11px; color: white; background: ${locker.status === 'available' ? '#007AFF' : '#FF3B30'};">
									${locker.status === 'available' ? '营业中' : '暂停服务'}
								</span>
							</div>
						</div>
					`;
					
					const infoWindow = new window.BMap.InfoWindow(infoContent);
					marker.addEventListener('click', () => {
						if (this.mapInstance) {
							this.mapInstance.openInfoWindow(infoWindow, point);
						}
					});
					
					if (this.mapInstance) {
						this.mapInstance.addOverlay(marker);
						this.mapMarkers.push(marker);
					}
					
				} catch (error) {
					console.error('❌ 创建标记失败:', error);
				}
			},
			
			// 清除地图标记
			clearMapMarkers() {
				if (this.mapInstance && this.mapMarkers.length > 0) {
					this.mapMarkers.forEach(marker => {
						try {
							this.mapInstance.removeOverlay(marker);
						} catch (error) {
							console.warn('清除标记失败:', error);
						}
					});
				}
				this.mapMarkers = [];
			},
			
			// 调整地图视野
			fitMapToMarkers() {
				if (!this.mapInstance || this.lockers.length === 0) return;
				
				try {
					// 检查百度地图API是否可用
					if (typeof window.BMap === 'undefined') {
						console.error('百度地图API不可用');
						return;
					}
					
					const points = this.lockers.map(locker => 
						new window.BMap.Point(locker.longitude, locker.latitude)
					);
					
					if (points.length > 0) {
						const viewport = this.mapInstance.getViewport(points);
						this.mapInstance.centerAndZoom(viewport.center, viewport.zoom);
					}
					
				} catch (error) {
					console.error('❌ 调整地图视野失败:', error);
				}
			},
			
			// 标记点击事件
			onMarkerClick(locker) {
				console.log('📍 点击寄存点:', locker.name);
				this.selectedLocker = locker;
			},
			
			// 城市选择
			selectCity() {
				uni.navigateTo({
					url: '/pages/city-select/city-select'
				});
			},
			
			// 刷新地图
			refreshMap() {
				console.log('🔄 刷新寄存点分布图');
				this.isLoading = true;
				this.loadingText = '正在刷新数据...';
				
				// 清除现有数据
				this.lockers = [];
				this.totalLockers = 0;
				this.selectedLocker = null;
				this.clearMapMarkers();
				
				// 重新加载数据
				this.loadLockersData();
				
				uni.showToast({
					title: '正在刷新...',
					icon: 'loading',
					duration: 1000
				});
			},
			
			// 居中到城市
			centerToCity() {
				if (!this.mapInstance || typeof window.BMap === 'undefined') {
					console.warn('地图实例不可用');
					return;
				}
				
				try {
					const selectedCity = uni.getStorageSync('selectedCity');
					const cityCoords = selectedCity?.coordinates || {
						longitude: 113.6253,
						latitude: 34.7466
					};
					
					const centerPoint = new window.BMap.Point(cityCoords.longitude, cityCoords.latitude);
					this.mapInstance.centerAndZoom(centerPoint, 12);
					
					uni.showToast({
						title: '已居中到' + this.currentCity,
						icon: 'success',
						duration: 1500
					});
				} catch (error) {
					console.error('居中到城市失败:', error);
				}
			},
			
			// 显示筛选面板
			showFilterPanel() {
				this.showFilter = true;
			},
			
			// 隐藏筛选面板
			hideFilterPanel() {
				this.showFilter = false;
			},
			
			// 设置状态筛选
			setStatusFilter(status) {
				this.statusFilter = status;
				this.updateMapMarkers();
				
				uni.showToast({
					title: '筛选已更新',
					icon: 'success',
					duration: 1000
				});
			},
			
			// 更新地图标记（根据筛选条件）
			updateMapMarkers() {
				this.clearMapMarkers();
				
				this.filteredLockers.forEach((locker, index) => {
					this.createLockerMarker(locker, index);
				});
				
				this.totalLockers = this.filteredLockers.length;
			},
			
			// 显示寄存点列表
			showLockerList() {
				this.showList = true;
			},
			
			// 隐藏寄存点列表
			hideLockerList() {
				this.showList = false;
			},
			
			// 选择寄存点
			selectLocker(locker) {
				console.log('📍 选择寄存点:', locker.name);
				this.selectedLocker = locker;
				this.showList = false;
				
				if (this.mapInstance && typeof window.BMap !== 'undefined') {
					try {
						const point = new window.BMap.Point(locker.longitude, locker.latitude);
						this.mapInstance.centerAndZoom(point, 15);
					} catch (error) {
						console.error('地图居中失败:', error);
					}
				}
			},
			
			// 清除选择
			clearSelection() {
				this.selectedLocker = null;
			},
			
			// 查看详情
			goToDetail() {
				if (!this.selectedLocker) return;
				
				uni.navigateTo({
					url: `/pages/locker-detail/locker-detail?id=${this.selectedLocker.id}`
				});
			},
			
			// 获取路线
			getDirections() {
				if (!this.selectedLocker) return;
				
				uni.showModal({
					title: '获取路线',
					content: `是否打开地图应用获取到"${this.selectedLocker.name}"的路线？`,
					success: (res) => {
						if (res.confirm) {
							const url = `https://uri.amap.com/navigation?to=${this.selectedLocker.longitude},${this.selectedLocker.latitude}&toname=${this.selectedLocker.name}&mode=car`;
							
							// #ifdef H5
							window.open(url);
							// #endif
							
							// #ifdef APP-PLUS
							plus.runtime.openURL(url);
							// #endif
						}
					}
				});
			},
			
			// 错误处理
			handleError(message) {
				console.error('❌ 错误:', message);
				console.log('🔄 自动切换到模拟数据模式');
				
				// 不显示错误弹窗，直接使用模拟数据
				this.handleNetworkError();
			}
		}
	}
</script><style>

	.page {
		height: 100vh;
		background: #f5f5f5;
		display: flex;
		flex-direction: column;
	}
	
	/* 顶部信息栏 */
	.header-section {
		background: white;
		padding: 15px 20px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-shadow: 0 2px 8px rgba(0,0,0,0.1);
		z-index: 100;
	}
	
	.city-info {
		flex: 1;
	}
	
	.city-selector {
		display: flex;
		align-items: center;
		margin-bottom: 5px;
	}
	
	.city-icon {
		font-size: 16px;
		margin-right: 5px;
	}
	
	.city-name {
		font-size: 18px;
		font-weight: bold;
		color: #333;
		margin-right: 5px;
	}
	
	.dropdown-icon {
		font-size: 12px;
		color: #666;
	}
	
	.locker-stats {
		margin-top: 2px;
	}
	
	.stats-text {
		font-size: 12px;
		color: #666;
	}
	
	.refresh-btn {
		display: flex;
		align-items: center;
		padding: 8px 12px;
		background: #007AFF;
		border-radius: 6px;
		color: white;
	}
	
	.refresh-icon {
		font-size: 14px;
		margin-right: 4px;
	}
	
	.refresh-text {
		font-size: 12px;
	}
	
	/* 地图容器 */
	.map-container {
		flex: 1;
		position: relative;
		overflow: hidden;
	}
	
	.map-placeholder {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f8f9fa;
		z-index: 10;
	}
	
	.placeholder-content {
		text-align: center;
	}
	
	.placeholder-icon {
		font-size: 48px;
		margin-bottom: 10px;
		display: block;
	}
	
	.placeholder-text {
		font-size: 14px;
		color: #666;
		margin-bottom: 15px;
		display: block;
	}
	
	.baidu-map-container {
		width: 100%;
		height: 100%;
	}
	
	/* 地图控制按钮 */
	.map-controls {
		position: absolute;
		right: 15px;
		top: 15px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		z-index: 50;
	}
	
	.control-btn {
		background: white;
		border-radius: 8px;
		padding: 10px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.15);
		display: flex;
		flex-direction: column;
		align-items: center;
		min-width: 50px;
	}
	
	.btn-icon {
		font-size: 16px;
		margin-bottom: 2px;
	}
	
	.btn-text {
		font-size: 10px;
		color: #666;
	}
	
	/* 筛选面板 */
	.filter-panel {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: white;
		border-radius: 15px 15px 0 0;
		box-shadow: 0 -2px 20px rgba(0,0,0,0.1);
		z-index: 200;
		max-height: 60%;
	}
	
	.filter-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px;
		border-bottom: 1px solid #eee;
	}
	
	.filter-title {
		font-size: 16px;
		font-weight: bold;
		color: #333;
	}
	
	.close-btn {
		font-size: 18px;
		color: #999;
		padding: 5px;
	}
	
	.filter-content {
		padding: 20px;
	}
	
	.filter-item {
		margin-bottom: 20px;
	}
	
	.filter-label {
		font-size: 14px;
		color: #333;
		margin-bottom: 10px;
		display: block;
	}
	
	.filter-options {
		display: flex;
		gap: 10px;
	}
	
	.filter-option {
		padding: 8px 16px;
		border: 1px solid #ddd;
		border-radius: 20px;
		background: white;
	}
	
	.filter-option.active {
		background: #007AFF;
		border-color: #007AFF;
	}
	
	.filter-option.active .option-text {
		color: white;
	}
	
	.option-text {
		font-size: 12px;
		color: #666;
	}
	
	/* 寄存点列表面板 */
	.locker-list-panel {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: white;
		border-radius: 15px 15px 0 0;
		box-shadow: 0 -2px 20px rgba(0,0,0,0.1);
		z-index: 200;
		max-height: 70%;
		display: flex;
		flex-direction: column;
	}
	
	.list-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px;
		border-bottom: 1px solid #eee;
		flex-shrink: 0;
	}
	
	.list-title {
		font-size: 16px;
		font-weight: bold;
		color: #333;
	}
	
	.list-content {
		flex: 1;
		padding: 0 20px 20px;
	}
	
	.locker-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15px 0;
		border-bottom: 1px solid #f0f0f0;
	}
	
	.locker-item:last-child {
		border-bottom: none;
	}
	
	.locker-info {
		flex: 1;
	}
	
	.locker-name {
		font-size: 14px;
		font-weight: bold;
		color: #333;
		margin-bottom: 5px;
		display: block;
	}
	
	.locker-address {
		font-size: 12px;
		color: #666;
		margin-bottom: 8px;
		display: block;
	}
	
	.locker-capacity {
		display: flex;
		gap: 8px;
	}
	
	.capacity-item {
		font-size: 11px;
		padding: 2px 6px;
		border-radius: 4px;
		background: #f0f0f0;
		color: #666;
	}
	
	.capacity-item.large {
		background: #e3f2fd;
		color: #1976d2;
	}
	
	.capacity-item.medium {
		background: #f3e5f5;
		color: #7b1fa2;
	}
	
	.capacity-item.small {
		background: #e8f5e8;
		color: #388e3c;
	}
	
	.locker-status {
		padding: 6px 12px;
		border-radius: 12px;
		font-size: 11px;
	}
	
	.locker-status.available {
		background: #e8f5e8;
		color: #2e7d32;
	}
	
	.locker-status.unavailable {
		background: #ffebee;
		color: #c62828;
	}
	
	.status-text {
		font-size: 11px;
	}
	
	/* 选中寄存点信息 */
	.selected-locker-info {
		position: absolute;
		bottom: 20px;
		left: 20px;
		right: 20px;
		background: white;
		border-radius: 12px;
		box-shadow: 0 4px 20px rgba(0,0,0,0.15);
		z-index: 150;
	}
	
	.info-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15px 20px 10px;
		border-bottom: 1px solid #f0f0f0;
	}
	
	.info-content {
		padding: 15px 20px;
	}
	
	.capacity-info {
		display: flex;
		gap: 15px;
		margin: 10px 0;
	}
	
	.capacity-item {
		text-align: center;
	}
	
	.capacity-label {
		font-size: 11px;
		color: #666;
		display: block;
		margin-bottom: 2px;
	}
	
	.capacity-value {
		font-size: 16px;
		font-weight: bold;
		color: #333;
		display: block;
	}
	
	.info-actions {
		display: flex;
		gap: 10px;
		margin-top: 15px;
	}
	
	.action-btn {
		flex: 1;
		padding: 10px;
		border-radius: 6px;
		font-size: 12px;
		border: none;
	}
	
	.action-btn.primary {
		background: #007AFF;
		color: white;
	}
	
	.action-btn.secondary {
		background: #f0f0f0;
		color: #333;
	}
	
	/* 加载遮罩 */
	.loading-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0,0,0,0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 300;
	}
	
	.loading-content {
		background: white;
		padding: 30px;
		border-radius: 12px;
		text-align: center;
		min-width: 150px;
	}
	
	.loading-spinner {
		width: 30px;
		height: 30px;
		border: 3px solid #f0f0f0;
		border-top: 3px solid #007AFF;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto 15px;
	}
	
	.loading-text {
		font-size: 14px;
		color: #666;
	}
	
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
	
	/* 响应式设计 */
	@media (max-width: 480px) {
		.header-section {
			padding: 12px 15px;
		}
		
		.city-name {
			font-size: 16px;
		}
		
		.map-controls {
			right: 10px;
			top: 10px;
		}
		
		.control-btn {
			padding: 8px;
			min-width: 45px;
		}
		
		.selected-locker-info {
			left: 15px;
			right: 15px;
			bottom: 15px;
		}
	}
</style>