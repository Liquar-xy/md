<template>
	<view class="page">
		<!-- 顶部状态栏 -->
		<view class="status-bar">
			<text class="status-text">城市定位状态: {{locationStatus}}</text>
			<text class="api-key-text">百度地图: {{mapStatus}}</text>
		</view>
		
		<!-- 搜索栏 -->
		<view class="search-section">
			<view class="location-info" @click="selectCity">
				<text class="location-icon">📍</text>
				<text class="current-city">{{currentCity}}</text>
				<text class="dropdown-icon">▼</text>
			</view>
			<view class="search-box" @click="openSearch">
				<text class="search-icon">🔍</text>
				<text class="search-placeholder">搜索火车站/地铁站/景点</text>
			</view>
		</view>
		
		<!-- 地图容器 -->
		<view class="map-container">
			<!-- 简化的地图显示区域 -->
			<view class="map-placeholder" v-if="!mapReady && !mapError">
				<view class="placeholder-content">
					<text class="placeholder-icon">🗺️</text>
					<text class="placeholder-text">{{loadingText}}</text>
					<text class="placeholder-status">状态: {{mapStatus}}</text>
				</view>
			</view>
			
			<!-- 百度地图容器 -->
			<view id="baiduMapContainer" class="baidu-map-container" v-show="!mapError"></view>
			
			<!-- 地图控制按钮 -->
			<view class="map-controls">
				<view class="control-btn location-btn" @click="getCurrentLocation">
					<text class="btn-icon">🏙️</text>
					<text class="btn-text">回到城市</text>
				</view>
				<view class="control-btn refresh-btn" @click="refreshMap">
					<text class="btn-icon">🔄</text>
					<text class="btn-text">刷新</text>
				</view>
				<view class="control-btn lockers-btn" @click="refreshNearbyLockers">
					<text class="btn-icon">🏪</text>
					<text class="btn-text">寄存点</text>
				</view>


			</view>
			
			<!-- 地图错误提示 -->
			<view v-if="mapError" class="map-error">
				<text class="error-title">地图加载失败</text>
				<text class="error-message">{{mapErrorMessage}}</text>
				<view class="error-actions">
					<button class="retry-btn" @click="retryLoadMap">重试</button>
				</view>
			</view>
			
			<!-- 位置信息显示 -->
			<view class="location-info-panel" v-if="currentLocation">
				<text class="location-title">🏙️ 当前城市位置 ({{currentLocation.source}})</text>
				<text class="location-detail">🌐 经度: {{currentLocation.longitude}}</text>
				<text class="location-detail">🌐 纬度: {{currentLocation.latitude}}</text>
				<text class="location-detail">🎯 精度: {{currentLocation.accuracy}}米</text>
				<text class="location-detail" v-if="currentLocation.altitude">⛰️ 海拔: {{currentLocation.altitude}}米</text>
				<text class="location-detail" v-if="currentLocation.speed">🚗 速度: {{currentLocation.speed}}km/h</text>
				<text class="location-detail">🕐 更新: {{currentLocation.timestamp}}</text>
				<text class="location-detail address">📍 {{currentLocation.address}}</text>
			</view>
		</view>
		
		<!-- 寄存点信息面板 -->
		<view class="locker-panel" v-if="currentLocation">
			<view class="panel-header">
				<text class="panel-title">🏪 附近寄存点</text>
				<text class="panel-count" v-if="nearbyLockers.length > 0">找到 {{nearbyLockers.length}} 个寄存点</text>
				<text class="panel-count" v-else>附近暂无寄存点</text>
				<text class="refresh-btn-small" @click="refreshNearbyLockers">🔄</text>
			</view>
			
			<!-- 有寄存点时显示寄存点信息 -->
			<view class="selected-locker" v-if="selectedLocker">
				<view class="locker-info">
					<text class="locker-name">{{selectedLocker.name}}</text>
					<text class="locker-address">📍 {{selectedLocker.address}}</text>
					<text class="locker-distance">📏 距离: {{selectedLocker.distance}}</text>
					<text class="locker-status" :class="selectedLocker.status">
						🔘 状态: {{selectedLocker.status === 'available' ? '可用' : '不可用'}}
					</text>
				</view>
				
				<view class="locker-capacity">
					<view class="capacity-item">
						<text class="capacity-label">大柜</text>
						<text class="capacity-value" :class="{ 'zero': selectedLocker.large === 0 }">{{selectedLocker.large}}</text>
					</view>
					<view class="capacity-item">
						<text class="capacity-label">中柜</text>
						<text class="capacity-value" :class="{ 'zero': selectedLocker.medium === 0 }">{{selectedLocker.medium}}</text>
					</view>
					<view class="capacity-item">
						<text class="capacity-label">小柜</text>
						<text class="capacity-value" :class="{ 'zero': selectedLocker.small === 0 }">{{selectedLocker.small}}</text>
					</view>
				</view>
				
				<view class="locker-actions">
					<button class="action-btn primary" @click="selectLocker(selectedLocker)" 
							:disabled="selectedLocker.status !== 'available'">
						{{selectedLocker.status === 'available' ? '选择此寄存点' : '暂不可用'}}
					</button>
				</view>
			</view>
			
			<!-- 没有寄存点时显示提示信息 -->
			<view class="no-lockers" v-else>
				<view class="no-lockers-content">
					<text class="no-lockers-icon">📍</text>
					<text class="no-lockers-title">附近暂无寄存点</text>
					<text class="no-lockers-desc">在当前位置5公里范围内未找到可用的寄存点</text>
					<view class="no-lockers-actions">
						<button class="action-btn secondary" @click="refreshNearbyLockers">
							🔄 重新搜索
						</button>
						<button class="action-btn primary" @click="openSearch">
							🔍 搜索其他地点
						</button>
					</view>
				</view>
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
				currentCity: '定位中...',
				
				// 地图相关
				mapInstance: null,
				mapStatus: '初始化中',
				mapError: false,
				mapErrorMessage: '',
				mapReady: false,
				
				// 定位相关
				locationStatus: '准备定位',
				currentLocation: null,
				watchId: null,
				
				// 寄存点相关
				nearbyLockers: [],
				selectedLocker: null,
				
				// 状态管理
				loadingText: '正在初始化...'
			}
		},
		
		onLoad() {
			console.log('=== 实时定位地图页面加载 ===');
			console.log('百度地图API密钥:', BAIDU_MAP_AK);
		},
		
		onReady() {
			console.log('=== 页面渲染完成，开始初始化 ===');
			this.startInitialization();
		},
		
		onUnload() {
			console.log('📱 页面卸载，清理资源');
			if (this.watchId) {
				clearInterval(this.watchId);
				console.log('✅ 位置监听定时器已清理');
			}
		},
		
		onHide() {
			console.log('📱 页面隐藏');
			// 页面隐藏时可以选择暂停位置监听以节省电量
		},
		
		onShow() {
			console.log('📱 页面显示');
			
			// 检查城市是否发生变化
			const selectedCity = uni.getStorageSync('selectedCity');
			if (selectedCity) {
				if (selectedCity.name !== this.currentCity) {
					console.log('🏙️ 检测到城市变化:', this.currentCity, '->', selectedCity.name);
					this.currentCity = selectedCity.name;
					
					// 显示城市切换提示
					uni.showToast({
						title: `已切换到${selectedCity.name}`,
						icon: 'success',
						duration: 2000
					});
					
					// 如果地图已经初始化，重新设置城市位置
					if (this.mapInstance) {
						this.setCityLocation(selectedCity);
					} else {
						// 如果地图未初始化，重新初始化
						this.startInitialization();
					}
				} else {
					console.log('🏙️ 城市未变化，保持当前状态:', this.currentCity);
				}
			} else {
				console.log('⚠️ 未找到选择的城市，使用默认城市');
				// 如果没有选择城市，设置默认城市
				const defaultCity = {
					name: '郑州',
					coordinates: {
						longitude: 113.6253,
						latitude: 34.7466
					}
				};
				uni.setStorageSync('selectedCity', defaultCity);
				this.currentCity = defaultCity.name;
				
				if (this.mapInstance) {
					this.setCityLocation(defaultCity);
				} else {
					this.startInitialization();
				}
			}
			
			// 页面重新显示时可以重新启动位置监听（已废弃的GPS功能）
			// if (this.currentLocation && !this.watchId) {
			//     this.startBaiduLocationWatch();
			// }
		},
		
		methods: {
			// 选择城市
			selectCity() {
				console.log('选择城市');
				uni.navigateTo({
					url: '/pages/city-select/city-select?from=nearby'
				});
			},
			
			// 开始初始化
			startInitialization() {
				console.log('🚀 开始初始化');
				this.loadingText = '正在初始化地图...';
				this.mapStatus = '初始化中';
				
				// 获取用户选择的城市
				const selectedCity = uni.getStorageSync('selectedCity');
				if (selectedCity && selectedCity.coordinates) {
					console.log('📍 使用选择的城市:', selectedCity.name);
					this.currentCity = selectedCity.name;
					this.initMapWithCity(selectedCity);
				} else {
					console.log('📍 未找到选择的城市，使用默认城市');
					this.currentCity = '郑州';
					this.initMapWithDefaultCity();
				}
			},
			
			// 基于选择的城市初始化地图
			async initMapWithCity(selectedCity) {
				console.log('🗺️ 基于选择城市初始化地图:', selectedCity.name);
				this.mapStatus = '加载地图API';
				this.loadingText = '正在加载百度地图API...';
				
				try {
					await this.loadBaiduMapAPI();
					this.createMapInstance();
					
					// 地图创建完成后设置城市位置
					setTimeout(() => {
						this.setCityLocation(selectedCity);
					}, 1000);
					
				} catch (error) {
					console.error('地图初始化失败:', error);
					this.handleError('地图初始化失败: ' + error.message);
				}
			},
			
			// 使用默认城市初始化地图
			async initMapWithDefaultCity() {
				console.log('🗺️ 使用默认城市初始化地图');
				const defaultCity = {
					name: '郑州',
					coordinates: {
						longitude: 113.6253,
						latitude: 34.7466
					}
				};
				
				// 保存默认城市到本地存储
				uni.setStorageSync('selectedCity', defaultCity);
				
				await this.initMapWithCity(defaultCity);
			},
			
			// 设置城市位置
			setCityLocation(selectedCity) {
				console.log('📍 设置城市位置:', selectedCity.name);
				const { longitude, latitude } = selectedCity.coordinates;
				
				this.locationStatus = `当前城市: ${selectedCity.name}`;
				
				// 更新位置信息
				this.currentLocation = {
					longitude: longitude.toFixed(6),
					latitude: latitude.toFixed(6),
					accuracy: 1000,
					timestamp: new Date().toLocaleTimeString(),
					address: `${selectedCity.name}市中心`,
					source: '城市选择'
				};
				
				// 更新地图中心
				if (this.mapInstance) {
					const point = new BMap.Point(longitude, latitude);
					this.mapInstance.centerAndZoom(point, 13);
					
					// 添加城市中心标记
					this.addCityLocationMarker(point, selectedCity.name);
				}
				
				// 搜索该城市的寄存点
				this.loadNearbyLockers(longitude, latitude);
				
				// 显示成功提示
				uni.showToast({
					title: `已定位到${selectedCity.name}`,
					icon: 'success',
					duration: 2000
				});
				
				console.log('✅ 城市位置设置完成');
			},
			
			// 添加城市位置标记
			addCityLocationMarker(point, cityName) {
				if (!this.mapInstance) return;
				
				// 清除之前的标记
				this.mapInstance.clearOverlays();
				
				// 创建城市标记
				const marker = new BMap.Marker(point);
				
				// 创建城市图标
				const icon = new BMap.Icon(
					'data:image/svg+xml;base64,' + btoa(`
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
							<circle cx="16" cy="16" r="12" fill="#FF6B35" stroke="#FFFFFF" stroke-width="4"/>
							<circle cx="16" cy="16" r="4" fill="#FFFFFF"/>
							<circle cx="16" cy="16" r="14" fill="none" stroke="#FF6B35" stroke-width="2" opacity="0.3"/>
						</svg>
					`),
					new BMap.Size(32, 32),
					{
						anchor: new BMap.Size(16, 16)
					}
				);
				marker.setIcon(icon);
				
				this.mapInstance.addOverlay(marker);
				
				// 添加信息窗口
				const infoContent = `
					<div style="padding: 15px; min-width: 250px;">
						<h4 style="margin: 0 0 10px 0; color: #FF6B35;">🏙️ ${cityName}</h4>
						<p style="margin: 5px 0;"><strong>经度:</strong> ${point.lng.toFixed(6)}</p>
						<p style="margin: 5px 0;"><strong>纬度:</strong> ${point.lat.toFixed(6)}</p>
						<p style="margin: 5px 0;"><strong>定位方式:</strong> 城市选择</p>
						<p style="margin: 5px 0;"><strong>更新时间:</strong> ${new Date().toLocaleTimeString()}</p>
						<p style="margin: 5px 0; word-break: break-all;"><strong>地址:</strong> ${cityName}市中心区域</p>
					</div>
				`;
				
				const infoWindow = new BMap.InfoWindow(infoContent);
				marker.addEventListener('click', () => {
					this.mapInstance.openInfoWindow(infoWindow, point);
				});
				
				console.log('📍 城市位置标记已添加');
			},
			
			// 使用百度地图定位
			startBaiduGeolocation() {
				console.log('📍 开始百度地图定位');
				this.loadingText = '正在使用百度定位获取您的位置...';
				this.mapStatus = '百度定位中';
				this.locationStatus = '正在定位';
				
				if (!this.mapInstance) {
					console.error('❌ 地图实例未创建');
					this.fallbackToHTML5Location();
					return;
				}
				
				try {
					// 创建百度定位控件
					const geolocationControl = new BMap.GeolocationControl({
						anchor: BMAP_ANCHOR_BOTTOM_RIGHT,
						offset: new BMap.Size(10, 10),
						enableAutoLocation: false,
						locationIcon: null
					});
					
					// 添加定位控件到地图（隐藏）
					this.mapInstance.addControl(geolocationControl);
					
					// 创建定位对象
					const geolocation = new BMap.Geolocation();
					
					// 定位成功回调
					geolocation.getCurrentPosition((result) => {
						if (geolocation.getStatus() == BMAP_STATUS_SUCCESS) {
							console.log('✅ 百度定位成功:', result);
							this.handleBaiduLocationSuccess(result);
						} else {
							console.error('❌ 百度定位失败:', geolocation.getStatus());
							this.fallbackToHTML5Location();
						}
					}, {
						enableHighAccuracy: true,
						timeout: 10000,
						maximumAge: 60000
					});
					
					console.log('✅ 百度定位已启动');
					
				} catch (error) {
					console.error('❌ 百度定位初始化失败:', error);
					this.fallbackToHTML5Location();
				}
			},
			
			// 处理百度定位成功
			handleBaiduLocationSuccess(result) {
				console.log('📍 百度定位详细信息:', result);
				
				const point = result.point;
				const accuracy = result.accuracy || 100;
				
				// 更新位置信息
				this.currentLocation = {
					longitude: point.lng.toFixed(6),
					latitude: point.lat.toFixed(6),
					accuracy: Math.round(accuracy),
					timestamp: new Date().toLocaleTimeString(),
					address: '正在解析地址...',
					source: '百度定位'
				};
				
				this.locationStatus = `百度定位成功 (精度: ${Math.round(accuracy)}米)`;
				
				// 更新地图中心
				this.mapInstance.centerAndZoom(point, 16);
				
				// 添加位置标记
				this.addBaiduLocationMarker(point, accuracy);
				
				// 解析地址
				this.reverseGeocode(point.lng, point.lat);
				
				// 搜索附近寄存点
				this.loadNearbyLockers(point.lng, point.lat);
				
				// 开始监听位置变化
				this.startBaiduLocationWatch();
				
				// 显示成功提示
				uni.showToast({
					title: `定位成功 (${Math.round(accuracy)}米)`,
					icon: 'success',
					duration: 2000
				});
				
				console.log('✅ 百度定位处理完成');
			},
			
			// 添加百度定位标记
			addBaiduLocationMarker(point, accuracy) {
				if (!this.mapInstance) return;
				
				// 清除之前的标记
				this.mapInstance.clearOverlays();
				
				// 创建位置标记
				const marker = new BMap.Marker(point);
				
				// 创建自定义图标
				const icon = new BMap.Icon(
					'data:image/svg+xml;base64,' + btoa(`
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
							<circle cx="16" cy="16" r="12" fill="#007AFF" stroke="#FFFFFF" stroke-width="4"/>
							<circle cx="16" cy="16" r="4" fill="#FFFFFF"/>
							<circle cx="16" cy="16" r="14" fill="none" stroke="#007AFF" stroke-width="2" opacity="0.3"/>
						</svg>
					`),
					new BMap.Size(32, 32),
					{
						anchor: new BMap.Size(16, 16)
					}
				);
				marker.setIcon(icon);
				
				this.mapInstance.addOverlay(marker);
				
				// 添加精度圆圈
				const circle = new BMap.Circle(point, accuracy, {
					strokeColor: '#007AFF',
					strokeWeight: 2,
					strokeOpacity: 0.6,
					fillColor: '#007AFF',
					fillOpacity: 0.2
				});
				this.mapInstance.addOverlay(circle);
				
				// 添加信息窗口
				const infoContent = `
					<div style="padding: 15px; min-width: 250px;">
						<h4 style="margin: 0 0 10px 0; color: #007AFF;">📍 当前位置 (百度定位)</h4>
						<p style="margin: 5px 0;"><strong>经度:</strong> ${point.lng.toFixed(6)}</p>
						<p style="margin: 5px 0;"><strong>纬度:</strong> ${point.lat.toFixed(6)}</p>
						<p style="margin: 5px 0;"><strong>精度:</strong> ${Math.round(accuracy)}米</p>
						<p style="margin: 5px 0;"><strong>更新时间:</strong> ${new Date().toLocaleTimeString()}</p>
						<p style="margin: 5px 0; word-break: break-all;"><strong>地址:</strong> ${this.currentLocation?.address || '解析中...'}</p>
					</div>
				`;
				
				const infoWindow = new BMap.InfoWindow(infoContent);
				marker.addEventListener('click', () => {
					this.mapInstance.openInfoWindow(infoWindow, point);
				});
				
				console.log('📍 百度定位标记已添加');
			},
			
			// 开始百度位置监听
			startBaiduLocationWatch() {
				console.log('👁️ 开始百度位置监听');
				
				// 每30秒更新一次位置
				if (this.watchId) {
					clearInterval(this.watchId);
				}
				
				this.watchId = setInterval(() => {
					console.log('🔄 定时更新位置');
					this.updateBaiduLocation();
				}, 30000); // 30秒更新一次
				
				console.log('✅ 百度位置监听已启动');
			},
			
			// 更新百度位置
			updateBaiduLocation() {
				if (!this.mapInstance) return;
				
				const geolocation = new BMap.Geolocation();
				geolocation.getCurrentPosition((result) => {
					if (geolocation.getStatus() == BMAP_STATUS_SUCCESS) {
						console.log('🔄 位置更新成功:', result);
						
						const newPoint = result.point;
						const oldLocation = this.currentLocation;
						
						// 计算位置变化
						if (oldLocation) {
							const distance = this.calculateDistance(
								parseFloat(oldLocation.latitude),
								parseFloat(oldLocation.longitude),
								newPoint.lat,
								newPoint.lng
							);
							
							// 位置变化超过50米才更新
							if (distance < 50) {
								console.log('📍 位置变化较小，跳过更新:', distance, '米');
								return;
							}
							
							console.log('📍 位置显著变化:', distance, '米');
						}
						
						// 更新位置
						this.handleBaiduLocationSuccess(result);
						
						// 位置显著变化时重新搜索附近寄存点
						console.log('📍 位置显著变化，重新搜索附近寄存点');
						this.loadNearbyLockers(newPoint.lng, newPoint.lat);
					}
				}, {
					enableHighAccuracy: true,
					timeout: 5000
				});
			},
			
			// ========== 以下方法已废弃，保留用于向后兼容 ==========
			// 注意：当前版本使用城市选择定位，不再使用GPS定位
			
			// 备用HTML5定位（已废弃）
			fallbackToHTML5Location() {
				console.log('🔄 使用HTML5定位作为备用方案');
				this.loadingText = '正在使用浏览器定位...';
				this.locationStatus = '浏览器定位中';
				
				if (!navigator.geolocation) {
					this.useDefaultLocation();
					return;
				}
				
				navigator.geolocation.getCurrentPosition(
					(position) => {
						console.log('✅ HTML5定位成功:', position);
						this.handleHTML5LocationSuccess(position);
					},
					(error) => {
						console.error('❌ HTML5定位也失败:', error);
						this.useDefaultLocation();
					},
					{
						enableHighAccuracy: true,
						timeout: 10000,
						maximumAge: 60000
					}
				);
			},
			
			// 处理HTML5定位成功
			handleHTML5LocationSuccess(position) {
				const coords = position.coords;
				
				this.currentLocation = {
					longitude: coords.longitude.toFixed(6),
					latitude: coords.latitude.toFixed(6),
					accuracy: Math.round(coords.accuracy),
					timestamp: new Date().toLocaleTimeString(),
					address: '正在解析地址...',
					source: 'HTML5定位'
				};
				
				this.locationStatus = `HTML5定位成功 (精度: ${Math.round(coords.accuracy)}米)`;
				
				// 更新地图
				if (this.mapInstance) {
					const point = new BMap.Point(coords.longitude, coords.latitude);
					this.mapInstance.centerAndZoom(point, 16);
					this.addBaiduLocationMarker(point, coords.accuracy);
				}
				
				// 解析地址
				this.reverseGeocode(coords.longitude, coords.latitude);
				
				// 搜索附近寄存点
				this.loadNearbyLockers(coords.longitude, coords.latitude);
				
				uni.showToast({
					title: `定位成功 (${Math.round(coords.accuracy)}米)`,
					icon: 'success',
					duration: 2000
				});
			},
			

			
			// 初始化地图
			async initMap() {
				console.log('🗺️ 开始初始化百度地图');
				this.mapStatus = '加载地图API';
				this.loadingText = '正在加载百度地图API...';
				
				try {
					await this.loadBaiduMapAPI();
					this.createMapInstance();
					
					// 地图创建完成后开始百度定位
					setTimeout(() => {
						this.startBaiduGeolocation();
					}, 1000);
					
				} catch (error) {
					console.error('地图初始化失败:', error);
					this.handleError('地图初始化失败: ' + error.message);
				}
			},
			
			// 加载百度地图API
			loadBaiduMapAPI() {
				return new Promise((resolve, reject) => {
					if (window.BMap) {
						resolve();
						return;
					}
					
					console.log('📡 加载百度地图JavaScript API');
					
					const script = document.createElement('script');
					script.type = 'text/javascript';
					script.src = `https://api.map.baidu.com/api?v=3.0&ak=${BAIDU_MAP_AK}&callback=initBaiduMapCallback`;
					script.onerror = () => {
					console.error('❌ 百度地图API加载失败');
					this.mapError = true;
					this.mapErrorMessage = '百度地图API加载失败，请检查网络连接';
					this.mapStatus = 'API加载失败';
					reject(new Error('百度地图API加载失败'));
				};
					
					// 设置超时
					const timeout = setTimeout(() => {
						console.error('❌ 百度地图API加载超时');
						this.mapError = true;
						this.mapErrorMessage = '百度地图API加载超时，请重试';
						this.mapStatus = 'API加载超时';
						reject(new Error('百度地图API加载超时'));
					}, 10000);
					
					window.initBaiduMapCallback = () => {
						console.log('✅ 百度地图API加载完成');
						clearTimeout(timeout);
						delete window.initBaiduMapCallback;
						this.mapStatus = 'API加载完成';
						resolve();
					};
					
					document.head.appendChild(script);
				});
			},
			
			// 创建地图实例
			createMapInstance() {
				console.log('🗺️ 创建百度地图实例');
				this.mapStatus = '创建地图';
				
				try {
					const mapContainer = document.getElementById('baiduMapContainer');
					if (!mapContainer) {
						throw new Error('地图容器未找到');
					}
					
					// 调试信息：检查容器尺寸
					const rect = mapContainer.getBoundingClientRect();
					console.log('地图容器尺寸:', {
						width: rect.width,
						height: rect.height,
						visible: rect.width > 0 && rect.height > 0
					});
					
					if (rect.width === 0 || rect.height === 0) {
						console.warn('⚠️ 地图容器尺寸为0，可能影响地图显示');
					}
					
					this.mapInstance = new BMap.Map(mapContainer);
					
					const initialPoint = new BMap.Point(113.6253, 34.7466);
					this.mapInstance.centerAndZoom(initialPoint, 15);
					
					// 启用地图交互功能
					this.mapInstance.enableScrollWheelZoom(true);     // 启用滚轮缩放
					this.mapInstance.enableDragging(true);            // 启用拖拽
					this.mapInstance.enableDoubleClickZoom(true);     // 启用双击缩放
					this.mapInstance.enableKeyboard(true);           // 启用键盘操作
					this.mapInstance.enableInertialDragging(true);   // 启用惯性拖拽
					this.mapInstance.enableContinuousZoom(true);     // 启用连续缩放
					
					// 添加地图控件
					this.mapInstance.addControl(new BMap.NavigationControl());
					this.mapInstance.addControl(new BMap.ScaleControl());
					
					// 地图事件监听
					this.mapInstance.addEventListener('tilesloaded', () => {
						console.log('✅ 地图瓦片加载完成');
						this.mapStatus = '地图就绪';
						this.mapReady = true;
						this.loadingText = '';
					});
					
					// 地图拖拽事件
					this.mapInstance.addEventListener('dragstart', () => {
						console.log('🖱️ 开始拖拽地图');
					});
					
					this.mapInstance.addEventListener('dragend', () => {
						console.log('🖱️ 拖拽地图结束');
						// 可以在这里添加拖拽结束后的逻辑，比如重新搜索附近寄存点
					});
					
					// 地图缩放事件
					this.mapInstance.addEventListener('zoomstart', () => {
						console.log('🔍 开始缩放地图');
					});
					
					this.mapInstance.addEventListener('zoomend', () => {
						console.log('🔍 缩放地图结束');
						const zoom = this.mapInstance.getZoom();
						console.log('当前缩放级别:', zoom);
					});
					
					// 地图点击事件
					this.mapInstance.addEventListener('click', (e) => {
						console.log('🖱️ 点击地图:', e.point);
						// 可以在这里添加点击地图的逻辑
					});
					
					// 位置标记和寄存点搜索会在定位成功后自动执行
					
					console.log('✅ 百度地图实例创建完成');
					
				} catch (error) {
					console.error('❌ 创建地图实例失败:', error);
					this.handleError('创建地图实例失败: ' + error.message);
				}
			},
			

			
			// 计算两点间距离（米）
			calculateDistance(lat1, lon1, lat2, lon2) {
				const R = 6371000; // 地球半径（米）
				const dLat = (lat2 - lat1) * Math.PI / 180;
				const dLon = (lon2 - lon1) * Math.PI / 180;
				const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
						Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
						Math.sin(dLon/2) * Math.sin(dLon/2);
				const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
				return R * c;
			},
			
			// 处理定位错误
			handleLocationError(error) {
				let errorMessage = '定位失败';
				
				if (error.code) {
					switch(error.code) {
						case error.PERMISSION_DENIED:
							errorMessage = '用户拒绝了定位请求';
							break;
						case error.POSITION_UNAVAILABLE:
							errorMessage = '位置信息不可用';
							break;
						case error.TIMEOUT:
							errorMessage = '定位请求超时';
							break;
					}
				}
				
				this.locationStatus = errorMessage;
				this.useDefaultLocation();
			},
			
			// 使用默认位置
			useDefaultLocation() {
				console.log('📍 使用默认位置（郑州）');
				
				this.currentLocation = {
					longitude: '113.625300',
					latitude: '34.746600',
					accuracy: 1000,
					timestamp: new Date().toLocaleTimeString(),
					address: '河南省郑州市二七区',
					source: '默认位置'
				};
				
				this.currentCity = '郑州';
				this.locationStatus = '使用默认位置';
				this.loadingText = '';
				
				// 更新地图到默认位置
				if (this.mapInstance) {
					const point = new BMap.Point(113.6253, 34.7466);
					this.mapInstance.centerAndZoom(point, 15);
					this.addBaiduLocationMarker(point, 1000);
				}
				
				// 搜索默认位置附近的寄存点
				this.loadNearbyLockers(113.6253, 34.7466);
				
				// 显示提示
				uni.showToast({
					title: '使用默认位置：郑州',
					icon: 'none',
					duration: 2000
				});
				
				console.log('✅ 默认位置设置完成');
			},
			
			// 逆地理编码 - 获取详细地址信息
			reverseGeocode(longitude, latitude) {
				console.log('🔍 开始解析地址:', { longitude, latitude });
				
				// 如果地图实例还没创建，延迟执行
				if (!this.mapInstance) {
					setTimeout(() => {
						this.reverseGeocode(longitude, latitude);
					}, 1000);
					return;
				}
				
				const geocoder = new BMap.Geocoder();
				const point = new BMap.Point(longitude, latitude);
				
				geocoder.getLocation(point, (result) => {
					if (result) {
						console.log('✅ 地址解析成功:', result);
						
						const addressComponents = result.addressComponents;
						const fullAddress = result.address;
						
						// 更新位置信息
						if (this.currentLocation) {
							this.currentLocation.address = fullAddress;
						}
						
						// 更新城市信息
						const city = addressComponents.city || addressComponents.district || '未知城市';
						const province = addressComponents.province || '';
						
						this.currentCity = city.replace('市', ''); // 去掉"市"字
						
						console.log('🏙️ 城市信息更新:', {
							province: province,
							city: city,
							district: addressComponents.district,
							street: addressComponents.street,
							fullAddress: fullAddress
						});
						
						// 保存城市信息到本地存储
						uni.setStorageSync('currentCity', {
							name: this.currentCity,
							province: province,
							fullName: city,
							coordinates: {
								longitude: longitude,
								latitude: latitude
							},
							timestamp: new Date().getTime()
						});
						
						// 显示城市更新提示
						uni.showToast({
							title: `当前城市: ${this.currentCity}`,
							icon: 'none',
							duration: 2000
						});
						
					} else {
						console.warn('⚠️ 地址解析失败');
						this.currentLocation.address = '地址解析失败';
					}
				});
			},
			
			// 添加当前位置标记
			addCurrentLocationMarker() {
				if (!this.mapInstance || !this.currentLocation) return;
				
				const longitude = parseFloat(this.currentLocation.longitude);
				const latitude = parseFloat(this.currentLocation.latitude);
				const point = new BMap.Point(longitude, latitude);
				
				// 清除之前的标记
				this.mapInstance.clearOverlays();
				
				// 创建自定义位置标记
				const marker = new BMap.Marker(point);
				
				// 创建蓝色圆点图标
				const icon = new BMap.Icon(
					'data:image/svg+xml;base64,' + btoa(`
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
							<circle cx="12" cy="12" r="8" fill="#007AFF" stroke="#FFFFFF" stroke-width="3"/>
							<circle cx="12" cy="12" r="3" fill="#FFFFFF"/>
						</svg>
					`),
					new BMap.Size(24, 24),
					{
						anchor: new BMap.Size(12, 12)
					}
				);
				marker.setIcon(icon);
				
				this.mapInstance.addOverlay(marker);
				
				// 添加精度圆圈
				if (this.currentLocation.accuracy) {
					const circle = new BMap.Circle(point, this.currentLocation.accuracy, {
						strokeColor: '#007AFF',
						strokeWeight: 2,
						strokeOpacity: 0.5,
						fillColor: '#007AFF',
						fillOpacity: 0.1
					});
					this.mapInstance.addOverlay(circle);
				}
				
				// 创建详细信息窗口
				const infoContent = `
					<div style="padding: 10px; min-width: 200px;">
						<h4 style="margin: 0 0 10px 0; color: #007AFF;">📍 当前位置</h4>
						<p style="margin: 5px 0;"><strong>经度:</strong> ${longitude}</p>
						<p style="margin: 5px 0;"><strong>纬度:</strong> ${latitude}</p>
						<p style="margin: 5px 0;"><strong>精度:</strong> ${this.currentLocation.accuracy}米</p>
						${this.currentLocation.altitude ? `<p style="margin: 5px 0;"><strong>海拔:</strong> ${this.currentLocation.altitude}米</p>` : ''}
						${this.currentLocation.speed ? `<p style="margin: 5px 0;"><strong>速度:</strong> ${this.currentLocation.speed}km/h</p>` : ''}
						<p style="margin: 5px 0;"><strong>更新时间:</strong> ${this.currentLocation.timestamp}</p>
						<p style="margin: 5px 0; word-break: break-all;"><strong>地址:</strong> ${this.currentLocation.address}</p>
					</div>
				`;
				
				const infoWindow = new BMap.InfoWindow(infoContent);
				marker.addEventListener('click', () => {
					this.mapInstance.openInfoWindow(infoWindow, point);
				});
				
				console.log('📍 位置标记已更新');
			},
			
			// 更新位置标记
			updateLocationMarker(longitude, latitude) {
				if (!this.mapInstance) return;
				
				// 重新添加标记（简单方式）
				this.addCurrentLocationMarker();
				
				console.log('📍 位置标记已更新到新位置:', { longitude, latitude });
			},
			
			// 加载附近寄存点
			loadNearbyLockers(longitude, latitude) {
				if (!longitude || !latitude) {
					console.warn('⚠️ 缺少位置信息，无法搜索附近寄存点');
					return;
				}
				
				console.log('🔍 开始搜索附近寄存点');
				console.log('搜索位置:', { longitude, latitude });
				
				// 显示加载状态
				this.loadingText = '正在搜索附近寄存点...';
				
				// 调用后端"我的附近"接口
				const apiUrl = 'http://localhost:8000/api/nearby/my-nearby';
				
				// 构建查询参数
				const params = new URLSearchParams({
					longitude: longitude.toString(),
					latitude: latitude.toString(),
					radius: '5',    // 5公里范围
					limit: '20'     // 最多返回20个寄存点
				});
				
				const fullUrl = `${apiUrl}?${params.toString()}`;
				console.log('📡 请求URL:', fullUrl);
				
				uni.request({
					url: fullUrl,
					method: 'GET',
					header: {
						'Content-Type': 'application/json'
					},
					timeout: 10000,
					success: (res) => {
						console.log('=== 后端附近寄存点接口响应 ===');
						console.log('HTTP状态码:', res.statusCode);
						console.log('响应数据:', res.data);
						
						if (res.statusCode === 200 && res.data) {
							this.handleNearbyLockersSuccess(res.data);
						} else if (res.statusCode === 401) {
							console.error('❌ API需要认证，后端服务可能需要重启');
							this.handleNearbyLockersError('正在连接服务器，请稍后重试...');
							// 显示友好提示
							uni.showToast({
								title: '正在连接服务器...',
								icon: 'loading',
								duration: 2000
							});
						} else {
							console.error('❌ 接口返回错误:', res.statusCode);
							this.handleNearbyLockersError('接口返回错误: ' + res.statusCode);
						}
					},
					fail: (error) => {
						console.error('❌ 附近寄存点接口调用失败:', error);
						this.handleNearbyLockersError('网络请求失败: ' + (error.errMsg || '未知错误'));
						// 显示网络错误提示
						uni.showToast({
							title: '网络连接失败',
							icon: 'none',
							duration: 2000
						});
					}
				});
			},
			
			// 处理附近寄存点接口成功响应
			handleNearbyLockersSuccess(responseData) {
				console.log('✅ 附近寄存点接口调用成功');
				
				// 提取寄存点数据
				const nearbyPoints = responseData.nearby_points || [];
				const totalCount = responseData.total_count || 0;
				const searchRadius = responseData.search_radius || 5;
				
				console.log('📍 附近寄存点数据:', {
					count: nearbyPoints.length,
					totalCount: totalCount,
					searchRadius: searchRadius
				});
				
				if (nearbyPoints && nearbyPoints.length > 0) {
					// 处理寄存点数据
					this.nearbyLockers = this.processNearbyLockersData(nearbyPoints);
					
					// 在地图上添加寄存点标记
					this.addLockersToMap(this.nearbyLockers);
					
					// 选择第一个寄存点
					this.selectedLocker = this.nearbyLockers[0];
					
					console.log('✅ 寄存点数据处理完成:', this.nearbyLockers.length, '个');
					
					// 显示成功提示
					uni.showToast({
						title: `找到${this.nearbyLockers.length}个寄存点`,
						icon: 'success',
						duration: 2000
					});
					
				} else {
					console.log('⚠️ 附近没有找到寄存点');
					this.nearbyLockers = [];
					this.selectedLocker = null;
					
					uni.showToast({
						title: `附近${searchRadius}km内暂无寄存点`,
						icon: 'none',
						duration: 2000
					});
				}
				
				this.loadingText = '';
			},
			
			// 处理附近寄存点接口错误
			handleNearbyLockersError(errorMessage) {
				console.error('❌ 附近寄存点加载失败:', errorMessage);
				
				// 使用模拟数据作为备用
				console.log('🔄 使用模拟数据作为备用');
				this.nearbyLockers = [
					{
						id: 'mock_1',
						name: '模拟寄存点1',
						large: 3,
						medium: 5,
						small: 8,
						address: '模拟地址1',
						distance: '0.5km',
						status: 'available',
						longitude: parseFloat(this.currentLocation?.longitude || 113.6253) + 0.005,
						latitude: parseFloat(this.currentLocation?.latitude || 34.7466) + 0.005
					},
					{
						id: 'mock_2',
						name: '模拟寄存点2',
						large: 2,
						medium: 4,
						small: 6,
						address: '模拟地址2',
						distance: '1.2km',
						status: 'available',
						longitude: parseFloat(this.currentLocation?.longitude || 113.6253) - 0.008,
						latitude: parseFloat(this.currentLocation?.latitude || 34.7466) + 0.003
					}
				];
				
				this.selectedLocker = this.nearbyLockers[0];
				this.addLockersToMap(this.nearbyLockers);
				
				this.loadingText = '';
				
				uni.showToast({
					title: '使用模拟数据',
					icon: 'none',
					duration: 2000
				});
			},
			
			// 处理寄存点数据
			processNearbyLockersData(nearbyPoints) {
				console.log('🔄 处理寄存点数据');
				
				return nearbyPoints.map((point, index) => {
					console.log(`处理寄存点 ${index + 1}:`, point);
					
					return {
						id: point.id || `point_${index + 1}`,
						name: point.name || `寄存点${index + 1}`,
						large: point.large_count || point.large || 0,
						medium: point.medium_count || point.medium || 0,
						small: point.small_count || point.small || 0,
						address: point.address || '地址信息待完善',
						distance: this.formatDistance(point.distance),
						status: point.status || 'available',
						longitude: parseFloat(point.longitude),
						latitude: parseFloat(point.latitude),
						// 保留原始数据
						rawData: point
					};
				});
			},
			
			// 格式化距离显示
			formatDistance(distance) {
				if (typeof distance === 'number') {
					if (distance < 1) {
						return Math.round(distance * 1000) + 'm';
					} else {
						return distance.toFixed(1) + 'km';
					}
				} else if (typeof distance === 'string') {
					return distance;
				} else {
					return '距离未知';
				}
			},
			
			// 在地图上添加寄存点标记
			addLockersToMap(lockers) {
				if (!this.mapInstance || !lockers || lockers.length === 0) {
					return;
				}
				
				console.log('📍 在地图上添加寄存点标记:', lockers.length, '个');
				
				lockers.forEach((locker, index) => {
					if (!locker.longitude || !locker.latitude) {
						console.warn('⚠️ 寄存点缺少坐标信息:', locker);
						return;
					}
					
					const point = new BMap.Point(locker.longitude, locker.latitude);
					const marker = new BMap.Marker(point);
					
					// 创建寄存点图标
					const icon = new BMap.Icon(
						'data:image/svg+xml;base64,' + btoa(`
							<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28">
								<rect x="2" y="2" width="24" height="24" fill="#FF6B35" stroke="#FFFFFF" stroke-width="2" rx="4"/>
								<text x="14" y="18" text-anchor="middle" fill="white" font-size="12" font-weight="bold">柜</text>
							</svg>
						`),
						new BMap.Size(28, 28),
						{
							anchor: new BMap.Size(14, 14)
						}
					);
					marker.setIcon(icon);
					
					this.mapInstance.addOverlay(marker);
					
					// 添加信息窗口
					const infoContent = `
						<div style="padding: 15px; min-width: 250px;">
							<h4 style="margin: 0 0 10px 0; color: #FF6B35;">🏪 ${locker.name}</h4>
							<p style="margin: 5px 0;"><strong>地址:</strong> ${locker.address}</p>
							<p style="margin: 5px 0;"><strong>距离:</strong> ${locker.distance}</p>
							<div style="margin: 10px 0;">
								<strong>柜子数量:</strong><br>
								大柜: ${locker.large}个 | 中柜: ${locker.medium}个 | 小柜: ${locker.small}个
							</div>
							<p style="margin: 5px 0; color: ${locker.status === 'available' ? '#28a745' : '#dc3545'};">
								<strong>状态:</strong> ${locker.status === 'available' ? '可用' : '不可用'}
							</p>
						</div>
					`;
					
					const infoWindow = new BMap.InfoWindow(infoContent);
					marker.addEventListener('click', () => {
						this.mapInstance.openInfoWindow(infoWindow, point);
						this.selectedLocker = locker;
						console.log('选中寄存点:', locker.name);
					});
				});
				
				console.log('✅ 寄存点标记添加完成');
			},
			
			// 手动获取当前位置
			getCurrentLocation() {
				console.log('🏙️ 回到城市按钮点击');
				this.locationStatus = '正在回到选择的城市...';
				this.loadingText = '正在回到选择的城市...';
				
				// 显示加载提示
				uni.showLoading({
					title: '正在回到城市...'
				});
				
				// 获取用户选择的城市
				const selectedCity = uni.getStorageSync('selectedCity');
				console.log('🔍 存储中的选择城市:', selectedCity);
				console.log('🔍 城市名称:', selectedCity?.name);
				console.log('🔍 城市坐标:', selectedCity?.coordinates);
				
				if (selectedCity && selectedCity.coordinates) {
					console.log('📍 回到选择的城市:', selectedCity.name);
					console.log('📍 城市坐标:', selectedCity.coordinates);
					
					// 更新当前城市显示
					this.currentCity = selectedCity.name;
					
					setTimeout(() => {
						uni.hideLoading();
						this.setCityLocation(selectedCity);
						
						// 显示成功提示
						uni.showToast({
							title: `已回到${selectedCity.name}`,
							icon: 'success',
							duration: 2000
						});
					}, 1000);
				} else {
					console.log('📍 未找到选择的城市，使用默认城市');
					
					setTimeout(() => {
						uni.hideLoading();
						const defaultCity = {
							name: '郑州',
							coordinates: {
								longitude: 113.6253,
								latitude: 34.7466
							}
						};
						
						// 保存默认城市并更新显示
						uni.setStorageSync('selectedCity', defaultCity);
						this.currentCity = defaultCity.name;
						this.setCityLocation(defaultCity);
						
						// 显示提示
						uni.showToast({
							title: '已回到默认城市：郑州',
							icon: 'none',
							duration: 2000
						});
					}, 1000);
				}
			},
			

			// 手动HTML5定位
			manualHTML5Location() {
				console.log('🧭 手动HTML5定位');
				
				if (!navigator.geolocation) {
					uni.hideLoading();
					uni.showModal({
						title: '定位失败',
						content: '浏览器不支持定位功能',
						showCancel: false
					});
					return;
				}
				
				navigator.geolocation.getCurrentPosition(
					(position) => {
						uni.hideLoading();
						console.log('✅ HTML5手动定位成功:', position);
						this.handleHTML5LocationSuccess(position);
					},
					(error) => {
						uni.hideLoading();
						console.error('❌ HTML5手动定位失败:', error);
						
						let errorMsg = '定位失败';
						switch(error.code) {
							case error.PERMISSION_DENIED:
								errorMsg = '定位权限被拒绝，请在浏览器设置中允许位置访问';
								break;
							case error.POSITION_UNAVAILABLE:
								errorMsg = '位置信息不可用，请检查GPS或网络连接';
								break;
							case error.TIMEOUT:
								errorMsg = '定位超时，请重试';
								break;
						}
						
						uni.showModal({
							title: '定位失败',
							content: errorMsg,
							showCancel: false
						});
					},
					{
						enableHighAccuracy: true,
						timeout: 15000,
						maximumAge: 0
					}
				);
			},
			
			// 刷新地图
			refreshMap() {
				console.log('🔄 刷新地图和附近寄存点');
				this.loadingText = '正在刷新...';
				
				// 显示刷新提示
				uni.showLoading({
					title: '正在刷新...'
				});
				
				// 获取用户选择的城市，确保地图显示正确的城市
				const selectedCity = uni.getStorageSync('selectedCity');
				if (selectedCity && selectedCity.coordinates) {
					console.log('🔄 刷新到选择的城市:', selectedCity.name);
					
					// 更新当前城市显示
					this.currentCity = selectedCity.name;
					
					setTimeout(() => {
						uni.hideLoading();
						
						// 重新设置城市位置
						this.setCityLocation(selectedCity);
						
						// 显示刷新成功提示
						uni.showToast({
							title: `已刷新${selectedCity.name}的寄存点`,
							icon: 'success',
							duration: 2000
						});
					}, 1000);
					
				} else if (this.currentLocation) {
					// 如果没有选择城市但有当前位置，基于当前位置刷新
					const longitude = parseFloat(this.currentLocation.longitude);
					const latitude = parseFloat(this.currentLocation.latitude);
					
					console.log('🔄 基于当前位置刷新附近寄存点');
					
					setTimeout(() => {
						uni.hideLoading();
						this.loadNearbyLockers(longitude, latitude);
						
						uni.showToast({
							title: '已刷新附近寄存点',
							icon: 'success',
							duration: 2000
						});
					}, 1000);
					
				} else {
					// 没有位置信息，重新初始化
					console.log('🔄 重新初始化地图和定位');
					
					setTimeout(() => {
						uni.hideLoading();
						this.mapReady = false;
						this.startInitialization();
						
						uni.showToast({
							title: '正在重新初始化地图',
							icon: 'loading',
							duration: 2000
						});
					}, 1000);
				}
			},
			
			// 手动刷新附近寄存点
			refreshNearbyLockers() {
				if (!this.currentLocation) {
					uni.showToast({
						title: '请先获取位置信息',
						icon: 'none',
						duration: 2000
					});
					return;
				}
				
				const longitude = parseFloat(this.currentLocation.longitude);
				const latitude = parseFloat(this.currentLocation.latitude);
				
				console.log('🔄 手动刷新附近寄存点');
				this.loadNearbyLockers(longitude, latitude);
			},
			

			
			// 错误处理
			handleError(message) {
				console.error('❌ 错误:', message);
				this.mapError = true;
				this.mapErrorMessage = message;
				this.mapStatus = '加载失败';
				this.loadingText = '';
			},
			
			// 重试加载地图
			retryLoadMap() {
				console.log('🔄 重试加载地图');
				this.mapError = false;
				this.mapErrorMessage = '';
				this.startInitialization();
			},
			
			// 搜索功能
			openSearch() {
				console.log('🔍 打开搜索页面');
				uni.navigateTo({
					url: '/pages/search/search'
				});
			},
			
			// 选择寄存点
			selectLocker(locker) {
				console.log('选择寄存点:', locker);
				uni.showModal({
					title: '确认选择',
					content: `确定选择 ${locker.name} 吗？`,
					success: (res) => {
						if (res.confirm) {
							uni.showToast({
								title: '跳转到寄存点详情',
								icon: 'success',
								duration: 1500
							});
						}
					}
				});
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
	
	/* 状态栏 */
	.status-bar {
		background-color: #007AFF;
		color: white;
		padding: 10rpx 30rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 24rpx;
	}
	
	.status-text {
		font-weight: 600;
	}
	
	.api-key-text {
		opacity: 0.8;
		font-size: 20rpx;
	}
	
	/* 搜索栏 */
	.search-section {
		background-color: #FFFFFF;
		padding: 20rpx 30rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
		z-index: 10;
	}
	
	.location-info {
		display: flex;
		align-items: center;
	}
	
	.location-icon {
		font-size: 32rpx;
		margin-right: 12rpx;
		color: #007AFF;
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
		background-color: #E5E5E5;
		min-height: 400px; /* 确保最小高度 */
	}
	
	.baidu-map-container {
		width: 100%;
		height: 100%;
		min-height: 400px; /* 确保最小高度 */
		border-radius: 0;
		background-color: #E5E5E5;
		position: relative;
		z-index: 1;
		cursor: grab;
	}
	
	.baidu-map-container:active {
		cursor: grabbing;
	}
	
	/* 地图占位符 */
	.map-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #F0F0F0;
	}
	
	.placeholder-content {
		text-align: center;
		padding: 40rpx;
	}
	
	.placeholder-icon {
		font-size: 80rpx;
		display: block;
		margin-bottom: 20rpx;
	}
	
	.placeholder-text {
		font-size: 28rpx;
		color: #666;
		display: block;
		margin-bottom: 10rpx;
	}
	
	.placeholder-status {
		font-size: 24rpx;
		color: #999;
		display: block;
	}
	
	/* 地图控制按钮 */
	.map-controls {
		position: absolute;
		right: 30rpx;
		top: 30rpx;
		z-index: 10;
	}
	
	.control-btn {
		background-color: #FFFFFF;
		border-radius: 50rpx;
		padding: 20rpx 30rpx;
		margin-bottom: 20rpx;
		display: flex;
		align-items: center;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
		min-width: 120rpx;
		justify-content: center;
	}
	
	.control-btn:active {
		transform: scale(0.95);
	}
	
	.lockers-btn {
		background-color: #FF6B35 !important;
	}
	
	.lockers-btn .btn-text {
		color: white !important;
	}
	

	

	
	.btn-icon {
		font-size: 32rpx;
		margin-right: 10rpx;
	}
	
	.btn-text {
		font-size: 24rpx;
		color: #333;
		font-weight: 500;
	}
	
	/* 地图错误提示 */
	.map-error {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background-color: #FFFFFF;
		padding: 60rpx 40rpx;
		border-radius: 20rpx;
		text-align: center;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
		z-index: 20;
		max-width: 600rpx;
	}
	
	.error-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #FF3B30;
		margin-bottom: 20rpx;
		display: block;
	}
	
	.error-message {
		font-size: 28rpx;
		color: #666;
		margin-bottom: 40rpx;
		display: block;
		line-height: 1.5;
	}
	
	.error-actions {
		display: flex;
		justify-content: center;
	}
	
	.retry-btn {
		background-color: #007AFF;
		color: white;
		border: none;
		padding: 20rpx 40rpx;
		border-radius: 10rpx;
		font-size: 28rpx;
	}
	
	/* 位置信息面板 */
	.location-info-panel {
		position: absolute;
		top: 20rpx;
		left: 20rpx;
		background-color: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 20rpx;
		border-radius: 10rpx;
		z-index: 15;
		font-size: 24rpx;
		max-width: 400rpx;
	}
	
	.location-title {
		font-size: 28rpx;
		font-weight: 600;
		margin-bottom: 10rpx;
		display: block;
	}
	
	.location-detail {
		display: block;
		margin-bottom: 8rpx;
		opacity: 0.9;
		font-family: monospace;
	}
	
	.location-detail.address {
		margin-top: 10rpx;
		padding-top: 10rpx;
		border-top: 1rpx solid rgba(255, 255, 255, 0.3);
		font-size: 22rpx;
		line-height: 1.4;
	}
	
	/* 寄存点信息面板 */
	.locker-panel {
		background-color: #FFFFFF;
		border-top: 1rpx solid #E5E5E5;
		padding: 30rpx;
		max-height: 400rpx;
	}
	
	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30rpx;
	}
	
	.panel-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}
	
	.panel-count {
		font-size: 24rpx;
		color: #666;
		flex: 1;
	}
	
	.refresh-btn-small {
		font-size: 28rpx;
		color: #007AFF;
		padding: 10rpx;
		cursor: pointer;
	}
	
	.refresh-btn-small:active {
		transform: scale(0.9);
	}
	
	.selected-locker {
		background-color: #F8F9FA;
		border-radius: 15rpx;
		padding: 30rpx;
	}
	
	.locker-info {
		margin-bottom: 30rpx;
	}
	
	.locker-name {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		display: block;
		margin-bottom: 10rpx;
	}
	
	.locker-address {
		font-size: 26rpx;
		color: #666;
		display: block;
		margin-bottom: 10rpx;
	}
	
	.locker-distance {
		font-size: 24rpx;
		color: #007AFF;
		display: block;
		margin-bottom: 10rpx;
	}
	
	.locker-status {
		font-size: 24rpx;
		display: block;
	}
	
	.locker-status.available {
		color: #28a745;
	}
	
	.locker-status:not(.available) {
		color: #dc3545;
	}
	
	.locker-capacity {
		display: flex;
		justify-content: space-around;
		margin-bottom: 30rpx;
		background-color: #FFFFFF;
		border-radius: 10rpx;
		padding: 20rpx;
	}
	
	.capacity-item {
		text-align: center;
		flex: 1;
	}
	
	.capacity-label {
		font-size: 24rpx;
		color: #666;
		display: block;
		margin-bottom: 10rpx;
	}
	
	.capacity-value {
		font-size: 36rpx;
		font-weight: 600;
		color: #007AFF;
		display: block;
	}
	
	.capacity-value.zero {
		color: #999;
		opacity: 0.6;
	}
	
	.locker-actions {
		display: flex;
		justify-content: center;
	}
	
	.action-btn {
		border: none;
		border-radius: 25rpx;
		padding: 25rpx 60rpx;
		font-size: 28rpx;
		font-weight: 500;
	}
	
	.action-btn.primary {
		background-color: #007AFF;
		color: white;
	}
	
	.action-btn:active {
		transform: scale(0.95);
	}
	
	.action-btn:disabled {
		background-color: #ccc !important;
		color: #666 !important;
		cursor: not-allowed;
	}
</style>	

	/* 无寄存点提示样式 */
	.no-lockers {
		padding: 40rpx 30rpx;
		text-align: center;
	}
	
	.no-lockers-content {
		background: #f8f9fa;
		border-radius: 20rpx;
		padding: 60rpx 40rpx;
		border: 2rpx dashed #ddd;
	}
	
	.no-lockers-icon {
		font-size: 80rpx;
		display: block;
		margin-bottom: 20rpx;
		opacity: 0.6;
	}
	
	.no-lockers-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		display: block;
		margin-bottom: 15rpx;
	}
	
	.no-lockers-desc {
		font-size: 26rpx;
		color: #666;
		line-height: 1.5;
		display: block;
		margin-bottom: 40rpx;
	}
	
	.no-lockers-actions {
		display: flex;
		gap: 20rpx;
		justify-content: center;
	}
	
	.action-btn.secondary {
		background: #f8f9fa;
		color: #666;
		border: 2rpx solid #ddd;
	}
	
	.action-btn.secondary:hover {
		background: #e9ecef;
		border-color: #adb5bd;
	}