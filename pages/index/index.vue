<template>
	<view class="page">
		<!-- 顶部图片区域 -->
		<view class="header-section">
			<image class="header-image" src="/static/首页顶图.png" mode="aspectFill"></image>
		</view>
		
		<!-- 城市选择和我的附近 -->
		<view class="location-section">
			<view class="city-selector" @click="selectCity">
				<text class="location-icon">📍</text>
				<text class="city-name">{{currentCity}}</text>
				<text class="dropdown-icon">▼</text>
			</view>
			<view class="nearby-btn" @click="findNearby">
				<text class="nearby-icon">🧭</text>
				<text class="nearby-text">我的附近</text>
			</view>
		</view>
		
		<!-- 搜索框 -->
		<view class="search-section">
			<view class="search-box" @click="openSearch">
				<view class="search-placeholder-container">
					<text class="search-text-1">搜索</text>
					<text class="search-text-2">火车站</text>
					<text class="search-text-3">/</text>
					<text class="search-text-4">地铁站</text>
					<text class="search-text-5">/</text>
					<text class="search-text-6">景点</text>
				</view>
			</view>
		</view>
		
		<!-- 热门地点 -->
		<view class="hotspots-section">
			<view class="hotspot-item" v-for="(item, index) in hotspots" :key="index" @click="selectHotspot(item)">
				<text class="hotspot-text">{{item}}</text>
			</view>
		</view>
		
		<!-- 查询寄存点按钮 -->
		<view class="query-section">
			<button class="query-btn" @click="queryLockers">查询寄存点</button>
		</view>
		
		<!-- 功能入口 -->
		<view class="features-section">
			<view class="feature-item" @click="goToOrders">
				<view class="feature-icon orders-icon">📋</view>
				<text class="feature-text orders-text">我的订单</text>
			</view>
			<view class="feature-item" @click="goToService">
				<view class="feature-icon service-icon">💬</view>
				<text class="feature-text service-text">在线客服</text>
			</view>
			<view class="feature-item" @click="goToGuide">
				<view class="feature-icon guide-icon">📖</view>
				<text class="feature-text guide-text">寄存指南</text>
			</view>
			<view class="feature-item developing" @click="goToCoupons">
				<view class="feature-icon coupons-icon">🎫</view>
				<text class="feature-text coupons-text">优惠卡券</text>
				<text class="developing-tag">开发中</text>
			</view>
			<view class="feature-item admin-entry" @click="goToAdmin" @longpress="showAdminOptions">
				<view class="feature-icon admin-icon">🔐</view>
				<text class="feature-text admin-text">管理员</text>
				<text class="admin-tag">后台</text>
			</view>
		</view>
		
		<!-- 交易保障 -->
		<view class="guarantee-section">
			<view class="guarantee-icon">✓</view>
			<text class="guarantee-text">小程序交易保障</text>
			<text class="guarantee-desc">先行赔付·消费者权益</text>
		</view>
		
		<!-- 附近寄存点 -->
		<view class="nearby-lockers-section">
			<view class="section-title">
				<text class="title-text">附近寄存点</text>
				<text class="more-btn" v-if="nearbyLockers.length > 1" @click="viewAllNearby">查看全部</text>
			</view>
			
			<!-- 最近的寄存点 -->
			<view class="locker-item" v-if="nearestLocker" @click="selectLocker(nearestLocker)">
				<image class="locker-image" src="/static/locker-image.jpg" mode="aspectFill"></image>
				<view class="locker-info">
					<text class="locker-name">{{nearestLocker.name}}</text>
					<text class="locker-capacity">可用柜口：大{{nearestLocker.large}} | 中{{nearestLocker.medium}} | 小{{nearestLocker.small}}</text>
					<view class="locker-location">
						<text class="location-icon">📍</text>
						<text class="location-text">{{nearestLocker.address}}</text>
						<text class="distance" v-if="nearestLocker.distance">{{nearestLocker.distance}}</text>
					</view>
				</view>
			</view>
			
			<!-- 其他附近寄存点（最多显示2个） -->
			<view 
				class="locker-item" 
				v-for="(locker, index) in nearbyLockers.slice(1, 3)" 
				:key="locker.id"
				@click="selectLocker(locker)"
			>
				<image class="locker-image" src="/static/locker-image.jpg" mode="aspectFill"></image>
				<view class="locker-info">
					<text class="locker-name">{{locker.name}}</text>
					<text class="locker-capacity">可用柜口：大{{locker.large}} | 中{{locker.medium}} | 小{{locker.small}}</text>
					<view class="locker-location">
						<text class="location-icon">📍</text>
						<text class="location-text">{{locker.address}}</text>
						<text class="distance" v-if="locker.distance">{{locker.distance}}</text>
					</view>
				</view>
			</view>
			
			<!-- 无寄存点提示 -->
			<view class="no-locker" v-if="!nearestLocker && nearbyLockers.length === 0">
				<view class="no-locker-icon">📍</view>
				<text class="no-locker-text">{{noLockerMessage}}</text>
				
				<!-- 加载动画 -->
				<view class="loading-spinner" v-if="isLoadingNearby"></view>
				
				<!-- 操作按钮 -->
				<view class="no-locker-actions" v-if="!isLoadingNearby">
					<button class="retry-btn" @click="refreshNearbyLockers">重新搜索</button>
					<button class="expand-btn" @click="expandSearchRadius">扩大搜索范围</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				currentCity: '郑州',
				hotspots: ['郑州站', '郑州东站', '二七广场', '中原福塔'],
				nearestLocker: null,
				nearbyLockers: [], // 存储所有附近寄存点
				noLockerMessage: '正在获取附近寄存点...', // 无寄存点时的提示信息
				isLoadingNearby: true, // 是否正在加载附近寄存点
				updateTimer: null,
				
				// 各城市的热门地点配置
				cityHotspots: {
					'郑州': ['郑州站', '郑州东站', '二七广场', '中原福塔'],
					'北京': ['北京站', '北京西站', '天安门', '故宫'],
					'上海': ['上海站', '上海虹桥站', '外滩', '东方明珠'],
					'广州': ['广州站', '广州南站', '珠江新城', '天河城'],
					'深圳': ['深圳站', '深圳北站', '华强北', '世界之窗'],
					'杭州': ['杭州站', '杭州东站', '西湖', '钱江新城'],
					'南京': ['南京站', '南京南站', '夫子庙', '中山陵'],
					'武汉': ['武汉站', '汉口站', '黄鹤楼', '江汉路'],
					'成都': ['成都站', '成都东站', '春熙路', '宽窄巷子'],
					'西安': ['西安站', '西安北站', '钟楼', '大雁塔'],
					'重庆': ['重庆站', '重庆北站', '解放碑', '洪崖洞'],
					'天津': ['天津站', '天津西站', '天津之眼', '古文化街'],
					'苏州': ['苏州站', '苏州北站', '观前街', '拙政园'],
					'青岛': ['青岛站', '青岛北站', '栈桥', '五四广场'],
					'大连': ['大连站', '大连北站', '星海广场', '老虎滩'],
					'厦门': ['厦门站', '厦门北站', '鼓浪屿', '中山路'],
					'长沙': ['长沙站', '长沙南站', '五一广场', '橘子洲'],
					'昆明': ['昆明站', '昆明南站', '翠湖', '金马碧鸡坊'],
					'济南': ['济南站', '济南西站', '趵突泉', '大明湖'],
					'哈尔滨': ['哈尔滨站', '哈尔滨西站', '中央大街', '太阳岛'],
					'石家庄': ['石家庄站', '石家庄北站', '正定古城', '赵州桥'],
					'太原': ['太原站', '太原南站', '晋祠', '五台山'],
					'沈阳': ['沈阳站', '沈阳北站', '故宫', '中街'],
					'长春': ['长春站', '长春西站', '净月潭', '伪满皇宫'],
					'合肥': ['合肥站', '合肥南站', '包公园', '三河古镇'],
					'福州': ['福州站', '福州南站', '三坊七巷', '鼓山'],
					'南昌': ['南昌站', '南昌西站', '滕王阁', '八一广场'],
					'贵阳': ['贵阳站', '贵阳北站', '甲秀楼', '青岩古镇'],
					'兰州': ['兰州站', '兰州西站', '中山桥', '白塔山'],
					'银川': ['银川站', '银川河东机场', '西夏王陵', '沙湖'],
					'西宁': ['西宁站', '西宁机场', '塔尔寺', '青海湖'],
					'乌鲁木齐': ['乌鲁木齐站', '地窝堡机场', '红山公园', '大巴扎'],
					'拉萨': ['拉萨站', '贡嘎机场', '布达拉宫', '大昭寺'],
					'呼和浩特': ['呼和浩特站', '白塔机场', '大召寺', '内蒙古博物院'],
					'南宁': ['南宁站', '南宁东站', '青秀山', '邕江'],
					'海口': ['海口站', '美兰机场', '骑楼老街', '万绿园'],
					'三亚': ['三亚站', '凤凰机场', '天涯海角', '亚龙湾'],
					'澳门': ['澳门关闸', '澳门机场', '大三巴', '威尼斯人'],
					'香港': ['红磡站', '香港机场', '维多利亚港', '中环'],
					'台北': ['台北车站', '桃园机场', '101大楼', '西门町']
				}
			}
		},
		onLoad() {
			try {
				console.log('首页加载完成');
				
				// 检查登录状态
				if (!this.checkLoginStatus()) {
					return; // 如果未登录，会跳转到登录页，不继续执行
				}
				
				// 初始化时检查已选择的城市
				const selectedCity = uni.getStorageSync('selectedCity');
				if (selectedCity) {
					this.currentCity = selectedCity.name;
				}
				
				// 初始化热门地点
				this.updateHotspots();
				
				this.loadNearestLocker();
				this.startRealTimeUpdate();
			} catch (error) {
				console.error('❌ 首页加载时发生错误:', error);
				// 设置默认状态
				this.currentCity = '郑州';
				this.isLoadingNearby = false;
				this.noLockerMessage = '页面加载出现问题，请刷新重试';
			}
		},
		onShow() {
			try {
				// 页面显示时重新加载数据，确保从其他页面返回时数据正确
				console.log('首页显示');
				
				// 检查城市是否发生变化
				const selectedCity = uni.getStorageSync('selectedCity');
				if (selectedCity) {
					const cityChanged = selectedCity.name !== this.currentCity;
					this.currentCity = selectedCity.name;
					
					// 如果城市发生变化，更新热门地点
					if (cityChanged) {
						console.log('🏙️ 首页检测到城市变化，更新热门地点');
						this.updateHotspots();
					}
					
					// 如果城市发生变化或者没有寄存点数据，重新加载
					if (cityChanged || !this.nearestLocker) {
						console.log('🏙️ 首页检测到城市变化或无数据，重新加载寄存点');
						this.loadNearestLocker();
					}
				} else if (!this.nearestLocker) {
					this.loadNearestLocker();
				}
				
				// 确保页面滚动到顶部
				uni.pageScrollTo({
					scrollTop: 0,
					duration: 0
				});
			} catch (error) {
				console.error('❌ 首页显示时发生错误:', error);
				// 设置默认状态
				this.currentCity = '郑州';
				this.isLoadingNearby = false;
			}
		},
		onUnload() {
			// 页面卸载时清除定时器
			if (this.updateTimer) {
				clearInterval(this.updateTimer);
			}
		},
		methods: {
			// 更新热门地点
			updateHotspots() {
				console.log('🔄 更新热门地点，当前城市:', this.currentCity);
				
				// 根据当前城市获取对应的热门地点
				const cityHotspots = this.cityHotspots[this.currentCity];
				
				if (cityHotspots && cityHotspots.length > 0) {
					this.hotspots = [...cityHotspots]; // 使用展开运算符创建新数组
					console.log('✅ 热门地点已更新:', this.hotspots);
				} else {
					// 如果没有找到对应城市的热门地点，自动生成
					console.log('⚠️ 未找到城市热门地点配置，自动生成热门地点');
					this.hotspots = this.generateHotspotsForCity(this.currentCity);
					console.log('✅ 自动生成热门地点:', this.hotspots);
					
					// 将生成的热门地点保存到配置中，避免重复生成
					this.cityHotspots[this.currentCity] = [...this.hotspots];
					console.log('💾 热门地点配置已保存到缓存');
				}
			},
			
			// 为新城市自动生成热门地点
			generateHotspotsForCity(cityName) {
				console.log('🎯 为城市自动生成热门地点:', cityName);
				
				// 移除城市名称中的"市"、"省"等后缀，获取核心城市名
				const cleanCityName = cityName.replace(/[市省区县]/g, '');
				
				// 定义不同类型的热门地点模板
				const transportHubs = [
					`${cleanCityName}站`,
					`${cleanCityName}东站`,
					`${cleanCityName}西站`,
					`${cleanCityName}南站`,
					`${cleanCityName}北站`,
					`${cleanCityName}火车站`,
					`${cleanCityName}高铁站`,
					`${cleanCityName}机场`
				];
				
				const landmarks = [
					`${cleanCityName}广场`,
					`${cleanCityName}中心`,
					`${cleanCityName}CBD`,
					`${cleanCityName}商业街`,
					`${cleanCityName}步行街`,
					`${cleanCityName}古城`,
					`${cleanCityName}老城区`,
					`${cleanCityName}新区`
				];
				
				const commercialAreas = [
					`${cleanCityName}万达`,
					`${cleanCityName}购物中心`,
					`${cleanCityName}商场`,
					`${cleanCityName}百货`,
					`${cleanCityName}天地`,
					`${cleanCityName}广场购物中心`
				];
				
				const culturalSpots = [
					`${cleanCityName}博物馆`,
					`${cleanCityName}公园`,
					`${cleanCityName}图书馆`,
					`${cleanCityName}体育馆`,
					`${cleanCityName}文化中心`,
					`${cleanCityName}大剧院`
				];
				
				// 智能选择热门地点：优先选择交通枢纽，然后是地标建筑
				const finalHotspots = [];
				
				// 1. 优先选择2个交通枢纽
				const selectedTransport = this.selectRandomItems(transportHubs, 2);
				finalHotspots.push(...selectedTransport);
				
				// 2. 选择1个地标建筑
				const selectedLandmark = this.selectRandomItems(landmarks, 1);
				finalHotspots.push(...selectedLandmark);
				
				// 3. 选择1个商业区域或文化景点
				const otherOptions = [...commercialAreas, ...culturalSpots];
				const selectedOther = this.selectRandomItems(otherOptions, 1);
				finalHotspots.push(...selectedOther);
				
				console.log('✅ 为城市生成的热门地点:', finalHotspots);
				return finalHotspots;
			},
			
			// 从数组中随机选择指定数量的项目
			selectRandomItems(array, count) {
				const shuffled = [...array].sort(() => Math.random() - 0.5);
				return shuffled.slice(0, count);
			},
			
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
			
			// 选择城市
			selectCity() {
				console.log('选择城市');
				uni.navigateTo({
					url: '/pages/city-select/city-select'
				});
			},
			
			// 查找附近
			findNearby() {
				console.log('跳转到附近寄存页面');
				uni.navigateTo({
					url: '/pages/nearby/nearby'
				});
			},
			
			// 处理定位成功
			async handleLocationSuccess(locationRes) {
				const { latitude, longitude } = locationRes;
				
				try {
					// 1. 根据经纬度获取城市信息
					const cityInfo = await this.getCityByLocation(latitude, longitude);
					
					// 2. 自动切换到定位城市
					if (cityInfo && cityInfo.name) {
						this.currentCity = cityInfo.name;
						// 保存到本地存储
						uni.setStorageSync('selectedCity', cityInfo);
						
						uni.showToast({
							title: `已切换到${cityInfo.name}`,
							icon: 'success'
						});
					}
					
					// 3. 获取附近寄存点
					await this.loadNearbyLockers(latitude, longitude);
					
				} catch (error) {
					console.error('处理定位结果失败:', error);
					uni.showToast({
						title: '获取附近信息失败',
						icon: 'none'
					});
				}
			},
			
			// 处理定位失败
			handleLocationFail(error) {
				let message = '定位失败';
				
				// 根据不同错误类型给出不同提示
				if (error.errMsg) {
					if (error.errMsg.includes('auth deny')) {
						message = '请允许位置权限后重试';
					} else if (error.errMsg.includes('timeout')) {
						message = '定位超时，请重试';
					}
				}
				
				uni.showModal({
					title: '定位失败',
					content: message + '，是否手动选择城市？',
					success: (res) => {
						if (res.confirm) {
							this.selectCity();
						}
					}
				});
			},
			
			// 根据经纬度获取城市信息
			getCityByLocation(latitude, longitude) {
				return new Promise((resolve, reject) => {
					try {
						// TODO: 调用ito-deposit后端接口，根据经纬度获取城市信息
						const apiUrl = 'https://your-actual-api-domain.com/api/location/city';
						
						uni.request({
							url: apiUrl,
							method: 'POST',
							data: {
								latitude: latitude,
								longitude: longitude
							},
							header: {
								'Content-Type': 'application/json'
							},
							timeout: 3000, // 减少超时时间
							success: (res) => {
								if (res.statusCode === 200 && res.data) {
									resolve(res.data);
								} else {
									console.warn('⚠️ 获取城市信息失败，使用默认城市');
									resolve({
										id: 1,
										name: '郑州',
										code: 'zhengzhou',
										coordinates: {
											longitude: 113.6253,
											latitude: 34.7466
										}
									});
								}
							},
							fail: (error) => {
								// 如果后端接口不可用，使用默认逻辑
								console.warn('⚠️ 后端接口不可用，使用默认城市:', error);
								resolve({
									id: 1,
									name: '郑州',
									code: 'zhengzhou',
									coordinates: {
										longitude: 113.6253,
										latitude: 34.7466
									}
								});
							}
						});
					} catch (error) {
						console.error('❌ 获取城市信息时发生错误:', error);
						resolve({
							id: 1,
							name: '郑州',
							code: 'zhengzhou',
							coordinates: {
								longitude: 113.6253,
								latitude: 34.7466
							}
						});
					}
				});
			},
			
			// 加载附近寄存点
			loadNearbyLockers(latitude, longitude) {
				console.log('🔍 首页开始搜索附近寄存点');
				console.log('搜索位置:', { latitude, longitude });
				
				return new Promise((resolve, reject) => {
					try {
						// 调用ito-deposit后端"我的附近"接口
						const apiUrl = 'http://localhost:8000/api/nearby/my-nearby';
						
						// 构建查询参数
						const params = new URLSearchParams({
							longitude: longitude.toString(),
							latitude: latitude.toString(),
							radius: '5',    // 5公里范围
							limit: '10'     // 最多返回10个寄存点
						});
						
						const fullUrl = `${apiUrl}?${params.toString()}`;
						console.log('📡 首页请求URL:', fullUrl);
						
						uni.request({
							url: fullUrl,
							method: 'GET',
							header: {
								'Content-Type': 'application/json'
							},
							timeout: 5000, // 减少超时时间
							success: (res) => {
								console.log('=== 首页附近寄存点接口响应 ===');
								console.log('HTTP状态码:', res.statusCode);
								console.log('响应数据:', res.data);
								
								if (res.statusCode === 200 && res.data) {
									this.handleNearbyLockersSuccess(res.data, latitude, longitude);
									resolve(res.data);
								} else {
									console.warn('⚠️ 首页接口返回错误:', res.statusCode);
									this.handleNearbyLockersError('接口返回错误', latitude, longitude);
									resolve([]); // 返回空数组而不是reject
								}
							},
							fail: (error) => {
								console.warn('⚠️ 首页附近寄存点接口调用失败，使用模拟数据:', error);
								this.handleNearbyLockersError('网络请求失败', latitude, longitude);
								resolve([]); // 返回空数组而不是reject
							}
						});
					} catch (error) {
						console.error('❌ 加载附近寄存点时发生错误:', error);
						this.handleNearbyLockersError('系统错误', latitude, longitude);
						resolve([]); // 返回空数组而不是reject
					}
				});
			},
			
			// 处理附近寄存点成功响应
			handleNearbyLockersSuccess(responseData, latitude, longitude) {
				console.log('✅ 首页附近寄存点接口调用成功');
				
				// 提取寄存点数据
				const nearbyPoints = responseData.nearby_points || [];
				const totalCount = responseData.total_count || 0;
				const searchRadius = responseData.search_radius || 5;
				
				console.log('📍 首页附近寄存点数据:', {
					count: nearbyPoints.length,
					totalCount: totalCount,
					searchRadius: searchRadius
				});
				
				// 结束加载状态
				this.isLoadingNearby = false;
				
				if (nearbyPoints && nearbyPoints.length > 0) {
					// 处理寄存点数据
					const processedLockers = this.processNearbyLockersData(nearbyPoints);
					
					// 更新数据
					this.nearbyLockers = processedLockers;
					this.nearestLocker = processedLockers[0]; // 最近的寄存点
					
					console.log('✅ 首页寄存点数据处理完成:', processedLockers.length, '个');
					
				} else {
					console.log('⚠️ 首页附近没有找到寄存点');
					this.nearbyLockers = [];
					this.nearestLocker = null;
					
					// 设置无寄存点提示信息
					this.noLockerMessage = `附近${searchRadius}km内暂无寄存点`;
				}
			},
			
			// 处理附近寄存点错误
			handleNearbyLockersError(errorMessage, latitude, longitude) {
				console.error('❌ 首页附近寄存点加载失败:', errorMessage);
				
				// 结束加载状态
				this.isLoadingNearby = false;
				
				// 清空数据
				this.nearbyLockers = [];
				this.nearestLocker = null;
				this.noLockerMessage = '获取附近寄存点失败，请稍后重试';
				
				// 可以选择使用模拟数据作为备用
				console.log('🔄 首页使用模拟数据作为备用');
				this.loadMockNearbyData(latitude, longitude);
			},
			
			// 处理寄存点数据
			processNearbyLockersData(nearbyPoints) {
				console.log('🔄 首页处理寄存点数据');
				
				return nearbyPoints.map((point, index) => {
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
						latitude: parseFloat(point.latitude)
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
			
			// 加载模拟数据作为备用
			loadMockNearbyData(latitude, longitude) {
				console.log('🔄 首页加载模拟寄存点数据');
				
				// 基于用户位置生成模拟数据
				const mockLockers = [
					{
						id: 'mock_1',
						name: '模拟寄存点1',
						large: 3,
						medium: 5,
						small: 8,
						address: '模拟地址1',
						distance: '0.8km',
						status: 'available',
						longitude: longitude + 0.005,
						latitude: latitude + 0.005
					},
					{
						id: 'mock_2',
						name: '模拟寄存点2',
						large: 2,
						medium: 4,
						small: 6,
						address: '模拟地址2',
						distance: '1.5km',
						status: 'available',
						longitude: longitude - 0.008,
						latitude: latitude + 0.003
					}
				];
				
				this.nearbyLockers = mockLockers;
				this.nearestLocker = mockLockers[0];
				
				console.log('✅ 首页模拟数据加载完成');
			},
			
			// 打开搜索
			openSearch() {
				console.log('打开搜索');
				uni.navigateTo({
					url: '/pages/search/search'
				});
			},
			
			// 选择热门地点
			selectHotspot(hotspot) {
				console.log('选择热门地点:', hotspot);
				try {
					// 跳转到搜索页面并传入关键词
					const encodedKeyword = encodeURIComponent(hotspot);
					uni.navigateTo({
						url: `/pages/search/search?keyword=${encodedKeyword}`
					});
				} catch (error) {
					console.error('跳转搜索页面失败:', error);
					// 备用方案：不传参数直接跳转
					uni.navigateTo({
						url: '/pages/search/search'
					});
				}
			},
			
			// 查询寄存点
			queryLockers() {
				console.log('查询寄存点分布图');
				uni.navigateTo({
					url: '/pages/locker-map/locker-map'
				});
			},
			
			// 跳转到订单页面
			goToOrders() {
				uni.switchTab({
					url: '/pages/order-detail/order-detail'
				});
			},
			
			// 跳转到客服页面
			goToService() {
				uni.navigateTo({
					url: '/pages/customer-service/customer-service'
				});
			},
			
			// 跳转到指南页面
			goToGuide() {
				uni.navigateTo({
					url: '/pages/user-guide/user-guide'
				});
			},
			
			// 跳转到优惠券页面
			goToCoupons() {
				uni.navigateTo({
					url: '/pages/coupons/coupons'
				});
			},
			
			// 进入管理员后台
			goToAdmin() {
				console.log('🔐 尝试进入管理员后台');
				
				// 检查是否有管理员登录信息
				try {
					const adminData = uni.getStorageSync('adminData');
					if (adminData) {
						console.log('✅ 检测到管理员登录信息，直接进入后台');
						uni.navigateTo({
							url: '/pages/admin/admin'
						});
					} else {
						console.log('⚠️ 未检测到管理员登录信息');
						this.showAdminLoginOptions();
					}
				} catch (e) {
					console.error('检查管理员登录状态失败:', e);
					this.showAdminLoginOptions();
				}
			},
			
			// 显示管理员登录选项
			showAdminLoginOptions() {
				uni.showActionSheet({
					itemList: ['管理员登录', '模拟管理员登录', '取消'],
					success: (res) => {
						if (res.tapIndex === 0) {
							// 跳转到登录页面
							uni.navigateTo({
								url: '/pages/login/login?type=admin'
							});
						} else if (res.tapIndex === 1) {
							// 模拟管理员登录
							this.simulateAdminLogin();
						}
					}
				});
			},
			
			// 模拟管理员登录
			simulateAdminLogin() {
				console.log('🔑 模拟管理员登录');
				
				const adminData = {
					userId: "1",
					account: "admin",
					username: "系统管理员",
					realName: "管理员",
					phone: "13800138000",
					email: "admin@example.com",
					loginType: "admin",
					loginTime: new Date().toISOString()
				};
				
				try {
					uni.setStorageSync('adminData', JSON.stringify(adminData));
					console.log('✅ 管理员数据已保存');
					
					uni.showToast({
						title: '管理员登录成功',
						icon: 'success',
						success: () => {
							setTimeout(() => {
								uni.navigateTo({
									url: '/pages/admin/admin'
								});
							}, 1500);
						}
					});
				} catch (e) {
					console.error('保存管理员数据失败:', e);
					uni.showToast({
						title: '登录失败',
						icon: 'none'
					});
				}
			},
			
			// 长按显示管理员选项
			showAdminOptions() {
				console.log('🔧 显示管理员高级选项');
				
				uni.showActionSheet({
					itemList: ['管理员后台', '个人信息', '清除登录信息', '查看登录状态'],
					success: (res) => {
						switch (res.tapIndex) {
							case 0:
								uni.navigateTo({
									url: '/pages/admin/admin'
								});
								break;
							case 1:
								uni.navigateTo({
									url: '/pages/admin/profile'
								});
								break;
							case 2:
								this.clearAdminData();
								break;
							case 3:
								this.showAdminStatus();
								break;
						}
					}
				});
			},
			
			// 清除管理员数据
			clearAdminData() {
				uni.showModal({
					title: '确认清除',
					content: '确定要清除管理员登录信息吗？',
					success: (res) => {
						if (res.confirm) {
							try {
								uni.removeStorageSync('adminData');
								uni.showToast({
									title: '已清除登录信息',
									icon: 'success'
								});
							} catch (e) {
								console.error('清除数据失败:', e);
							}
						}
					}
				});
			},
			
			// 显示管理员状态
			showAdminStatus() {
				try {
					const adminData = uni.getStorageSync('adminData');
					if (adminData) {
						const data = JSON.parse(adminData);
						const status = `管理员状态：\n\n• 用户ID: ${data.userId || '未设置'}\n• 账号: ${data.account || '未设置'}\n• 用户名: ${data.username || '未设置'}\n• 登录时间: ${data.loginTime || '未设置'}`;
						
						uni.showModal({
							title: '管理员信息',
							content: status,
							showCancel: false
						});
					} else {
						uni.showModal({
							title: '管理员状态',
							content: '当前未登录管理员账号',
							showCancel: false
						});
					}
				} catch (e) {
					console.error('获取管理员状态失败:', e);
				}
			},
			
			// 加载最近的寄存点
			loadNearestLocker() {
				console.log('🚀 首页开始基于选择城市加载寄存点数据');
				
				this.isLoadingNearby = true;
				this.noLockerMessage = '正在获取城市位置...';
				
				// 获取用户选择的城市
				const selectedCity = uni.getStorageSync('selectedCity');
				if (selectedCity && selectedCity.coordinates) {
					console.log('✅ 首页使用选择的城市:', selectedCity.name);
					
					this.currentCity = selectedCity.name;
					
					// 获取该城市的寄存点
					this.noLockerMessage = '正在搜索城市寄存点...';
					const { longitude, latitude } = selectedCity.coordinates;
					this.loadNearbyLockers(latitude, longitude);
					
				} else {
					console.log('🔄 首页未找到选择的城市，使用默认城市');
					
					// 使用默认城市（郑州）
					const defaultCity = {
						name: '郑州',
						coordinates: {
							longitude: 113.6253,
							latitude: 34.7466
						}
					};
					
					this.currentCity = defaultCity.name;
					uni.setStorageSync('selectedCity', defaultCity);
					
					this.noLockerMessage = '使用默认城市搜索寄存点...';
					this.loadNearbyLockers(34.7466, 113.6253);
				}
			},
			
			// 获取当前位置
			getCurrentLocation() {
				return new Promise((resolve, reject) => {
					console.log('📍 首页开始获取位置');
					
					// 检查浏览器是否支持定位
					if (!navigator.geolocation) {
						reject(new Error('浏览器不支持定位功能'));
						return;
					}
					
					navigator.geolocation.getCurrentPosition(
						(position) => {
							const coords = position.coords;
							console.log('✅ 首页定位成功:', coords);
							
							// 使用百度地图逆地理编码获取城市信息
							this.reverseGeocode(coords.longitude, coords.latitude).then((address) => {
								resolve({
									latitude: coords.latitude,
									longitude: coords.longitude,
									accuracy: coords.accuracy,
									city: address.city || '未知城市',
									address: address.address || '地址解析中...'
								});
							}).catch(() => {
								// 即使地址解析失败，也返回位置信息
								resolve({
									latitude: coords.latitude,
									longitude: coords.longitude,
									accuracy: coords.accuracy,
									city: '未知城市',
									address: '地址解析失败'
								});
							});
						},
						(error) => {
							console.error('❌ 首页定位失败:', error);
							reject(error);
						},
						{
							enableHighAccuracy: true,
							timeout: 10000,
							maximumAge: 300000 // 5分钟缓存
						}
					);
				});
			},
			
			// 逆地理编码获取地址信息
			reverseGeocode(longitude, latitude) {
				return new Promise((resolve, reject) => {
					// 这里需要等待百度地图API加载完成
					// 简化处理，直接返回基本信息
					setTimeout(() => {
						resolve({
							city: '郑州市', // 可以根据坐标范围判断城市
							address: '位置解析中...'
						});
					}, 500);
				});
			},
			
			// 开始实时更新
			startRealTimeUpdate() {
				// 每30秒更新一次附近寄存点信息
				this.updateTimer = setInterval(() => {
					this.updateLockerInfo();
				}, 30000);
			},
			
			// 更新寄存点信息
			updateLockerInfo() {
				if (this.nearestLocker) {
					// 模拟实时更新柜子数量
					this.nearestLocker.large = Math.floor(Math.random() * 10) + 1;
					this.nearestLocker.medium = Math.floor(Math.random() * 10) + 1;
					this.nearestLocker.small = Math.floor(Math.random() * 10) + 1;
					
					console.log('寄存点信息已更新');
				}
			},
			
			// 选择寄存点
			selectLocker(locker) {
				console.log('选择寄存点:', locker);
				uni.navigateTo({
					url: `/pages/locker-detail/locker-detail?id=${locker.id}`
				});
			},
			
			// 查看全部附近寄存点
			viewAllNearby() {
				console.log('查看全部附近寄存点');
				// 跳转到附近寄存点页面
				uni.navigateTo({
					url: '/pages/nearby/nearby'
				});
			},
			
			// 重新搜索附近寄存点
			refreshNearbyLockers() {
				console.log('🔄 重新搜索附近寄存点');
				
				this.isLoadingNearby = true;
				this.noLockerMessage = '正在重新搜索附近寄存点...';
				
				// 重新获取位置并搜索
				this.loadNearestLocker();
			},
			
			// 扩大搜索范围
			expandSearchRadius() {
				console.log('🔍 扩大搜索范围');
				
				uni.showModal({
					title: '扩大搜索范围',
					content: '是否扩大到10km范围内搜索寄存点？',
					success: (res) => {
						if (res.confirm) {
							this.searchWithExpandedRadius();
						}
					}
				});
			},
			
			// 使用扩大的搜索范围
			searchWithExpandedRadius() {
				console.log('🔍 使用扩大的搜索范围搜索');
				
				this.isLoadingNearby = true;
				this.noLockerMessage = '正在扩大范围搜索寄存点...';
				
				// 获取当前位置
				const savedLocation = uni.getStorageSync('userLocation');
				if (savedLocation) {
					this.loadNearbyLockersWithRadius(savedLocation.latitude, savedLocation.longitude, 10);
				} else {
					// 重新获取位置
					this.loadNearestLocker();
				}
			},
			
			// 使用指定半径搜索寄存点
			loadNearbyLockersWithRadius(latitude, longitude, radius = 5) {
				console.log(`🔍 搜索${radius}km范围内的寄存点`);
				
				try {
					const apiUrl = 'http://localhost:8000/api/nearby/my-nearby';
					const params = new URLSearchParams({
						longitude: longitude.toString(),
						latitude: latitude.toString(),
						radius: radius.toString(),
						limit: '10'
					});
					
					const fullUrl = `${apiUrl}?${params.toString()}`;
					console.log('📡 扩大范围请求URL:', fullUrl);
					
					uni.request({
						url: fullUrl,
						method: 'GET',
						header: {
							'Content-Type': 'application/json'
						},
						timeout: 5000, // 减少超时时间
						success: (res) => {
							if (res.statusCode === 200 && res.data) {
								this.handleNearbyLockersSuccess(res.data, latitude, longitude);
								
								// 如果扩大范围后还是没有，显示特殊提示
								if ((!res.data.nearby_points || res.data.nearby_points.length === 0) && radius > 5) {
									this.noLockerMessage = `附近${radius}km内仍然没有寄存点，建议选择其他区域`;
								}
							} else {
								console.warn('⚠️ 扩大范围搜索失败，使用模拟数据');
								this.handleNearbyLockersError('扩大范围搜索失败', latitude, longitude);
							}
						},
						fail: (error) => {
							console.warn('⚠️ 扩大范围搜索网络错误，使用模拟数据:', error);
							this.handleNearbyLockersError('扩大范围搜索网络错误', latitude, longitude);
						}
					});
				} catch (error) {
					console.error('❌ 扩大范围搜索时发生错误:', error);
					this.handleNearbyLockersError('系统错误', latitude, longitude);
				}
			}
		}
	}
</script>

<style>
	.page {
		background-image: url('/static/12.png');
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		background-attachment: fixed;
		min-height: 100vh;
		width: 100%;
		overflow-x: hidden;
		position: relative;
	}
	
	.page::before {
		content: '';
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(180deg, 
			rgba(248, 250, 255, 0.85) 0%, 
			rgba(245, 245, 245, 0.9) 100%);
		z-index: -1;
		backdrop-filter: blur(2rpx);
	}
	
	/* 顶部图片区域 */
	.header-section {
		width: 100%;
		height: 200rpx;
		position: relative;
		overflow: hidden;
		background-image: url('/static/12.png');
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
	}
	
	.header-section::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(180deg, 
			rgba(0, 0, 0, 0.3) 0%, 
			rgba(0, 0, 0, 0.1) 100%);
		z-index: 1;
	}
	
	.header-image {
		width: 100%;
		height: 100%;
		border-radius: 0 0 30rpx 30rpx;
		position: relative;
		z-index: 2;
		background: transparent;
	}
	
	/* 城市选择和我的附近 */
	.location-section {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 25rpx 30rpx;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10rpx);
		margin: 20rpx 30rpx;
		border-radius: 24rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
		border: 1rpx solid rgba(255, 255, 255, 0.2);
	}
	
	.city-selector {
		display: flex;
		align-items: center;
		padding: 8rpx 0;
		transition: all 0.3s ease;
	}
	
	.city-selector:active {
		transform: scale(0.98);
	}
	
	.location-icon {
		font-size: 32rpx;
		margin-right: 12rpx;
		color: #007AFF;
	}
	
	.city-name {
		font-size: 32rpx;
		color: #1A1A1A;
		margin-right: 8rpx;
		font-weight: 600;
	}
	
	.dropdown-icon {
		font-size: 20rpx;
		color: #8E8E93;
		transition: transform 0.3s ease;
	}
	
	.nearby-btn {
		display: flex;
		align-items: center;
		background: linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%);
		padding: 16rpx 28rpx;
		border-radius: 50rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 122, 255, 0.3);
		transition: all 0.3s ease;
	}
	
	.nearby-btn:active {
		transform: scale(0.95);
		box-shadow: 0 2rpx 8rpx rgba(0, 122, 255, 0.4);
	}
	
	.nearby-icon {
		font-size: 28rpx;
		margin-right: 8rpx;
	}
	
	.nearby-text {
		color: #FFFFFF;
		font-size: 28rpx;
		font-weight: 500;
	}
	
	/* 搜索框 */
	.search-section {
		padding: 0 30rpx;
		margin-bottom: 25rpx;
	}
	
	.search-box {
		background: rgba(255, 255, 255, 0.15);
		backdrop-filter: blur(10rpx);
		padding: 28rpx 35rpx;
		border-radius: 50rpx;
		box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.1);
		border: 1rpx solid rgba(255, 255, 255, 0.3);
		position: relative;
		transition: all 0.3s ease;
	}
	
	.search-box:active {
		transform: scale(0.98);
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
	}
	
	.search-box::before {
		content: '🔍';
		position: absolute;
		left: 35rpx;
		top: 50%;
		transform: translateY(-50%);
		font-size: 28rpx;
		opacity: 0.6;
	}
	
	.search-placeholder-container {
		display: flex;
		align-items: center;
		margin-left: 50rpx;
	}
	
	.search-text-1 {
		color: #FF6B6B;
		font-size: 28rpx;
		font-weight: 600;
		margin-right: 2rpx;
	}
	
	.search-text-2 {
		color: #4ECDC4;
		font-size: 28rpx;
		font-weight: 600;
		margin-right: 2rpx;
	}
	
	.search-text-3 {
		color: #45B7D1;
		font-size: 28rpx;
		font-weight: 600;
		margin-right: 2rpx;
	}
	
	.search-text-4 {
		color: #96CEB4;
		font-size: 28rpx;
		font-weight: 600;
		margin-right: 2rpx;
	}
	
	.search-text-5 {
		color: #FFEAA7;
		font-size: 28rpx;
		font-weight: 600;
		margin-right: 2rpx;
	}
	
	.search-text-6 {
		color: #DDA0DD;
		font-size: 28rpx;
		font-weight: 600;
	}
	
	/* 热门地点 */
	.hotspots-section {
		display: flex;
		flex-wrap: wrap;
		padding: 0 30rpx;
		gap: 12rpx;
		margin-bottom: 30rpx;
		justify-content: space-between;
	}
	
	.hotspot-item {
		background: rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(10rpx);
		padding: 18rpx 24rpx;
		border-radius: 50rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
		border: 1rpx solid rgba(255, 255, 255, 0.3);
		flex: 1;
		text-align: center;
		max-width: 160rpx;
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
	}
	
	.hotspot-item::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
		transition: left 0.5s ease;
	}
	
	.hotspot-item:active {
		transform: scale(0.95);
		box-shadow: 0 2rpx 8rpx rgba(0, 122, 255, 0.15);
	}
	
	.hotspot-item:active::before {
		left: 100%;
	}
	
	.hotspot-text {
		font-size: 26rpx;
		color: #1A1A1A;
		text-align: center;
		white-space: nowrap;
		font-weight: 500;
	}
	
	/* 查询按钮 */
	.query-section {
		padding: 0 30rpx;
		margin-bottom: 30rpx;
	}
	
	.query-btn {
		background: linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%);
		color: #FFFFFF;
		font-size: 34rpx;
		border-radius: 50rpx;
		padding: 35rpx;
		border: none;
		width: 100%;
		font-weight: 600;
		box-shadow: 0 8rpx 24rpx rgba(0, 122, 255, 0.3);
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
	}
	
	.query-btn::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: left 0.5s ease;
	}
	
	.query-btn:active {
		transform: scale(0.98);
		box-shadow: 0 4rpx 16rpx rgba(0, 122, 255, 0.4);
	}
	
	.query-btn:active::before {
		left: 100%;
	}
	
	/* 功能入口 */
	.features-section {
		display: flex;
		justify-content: space-around;
		padding: 30rpx 30rpx 40rpx;
		background-image: url('/static/12.png');
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		margin: 0 30rpx 30rpx;
		border-radius: 24rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
		border: 1rpx solid rgba(0, 0, 0, 0.02);
		position: relative;
		overflow: hidden;
	}
	
	.features-section::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10rpx);
		z-index: 1;
	}
	
	.features-section > * {
		position: relative;
		z-index: 2;
	}
	
	.feature-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
		flex: 1;
		padding: 20rpx 10rpx;
		border-radius: 12rpx;
		transition: all 0.2s ease;
	}
	
	.feature-item:active {
		transform: scale(0.95);
		background-color: rgba(0, 122, 255, 0.04);
	}
	
	.feature-icon {
		font-size: 48rpx;
		margin-bottom: 16rpx;
		opacity: 0.8;
	}
	
	.feature-text {
		font-size: 26rpx;
		color: #8E8E93;
		font-weight: 400;
		text-align: center;
	}
	
	/* 我的订单 - 红色 */
	.orders-icon {
		color: #FF4757;
		text-shadow: 0 2rpx 4rpx rgba(255, 71, 87, 0.3);
	}
	
	.orders-text {
		color: #FF4757;
		font-weight: 600;
	}
	
	/* 在线客服 - 蓝色 */
	.service-icon {
		color: #3742FA;
		text-shadow: 0 2rpx 4rpx rgba(55, 66, 250, 0.3);
	}
	
	.service-text {
		color: #3742FA;
		font-weight: 600;
	}
	
	/* 寄存指南 - 紫色 */
	.guide-icon {
		color: #8E44AD;
		text-shadow: 0 2rpx 4rpx rgba(142, 68, 173, 0.3);
	}
	
	.guide-text {
		color: #8E44AD;
		font-weight: 600;
	}
	
	/* 优惠卡券 - 黑色 */
	.coupons-icon {
		color: #2C3E50;
		text-shadow: 0 2rpx 4rpx rgba(44, 62, 80, 0.3);
	}
	
	.coupons-text {
		color: #2C3E50;
		font-weight: 600;
	}
	
	/* 管理员 - 金色 */
	.admin-icon {
		color: #F39C12;
		text-shadow: 0 2rpx 4rpx rgba(243, 156, 18, 0.3);
	}
	
	.admin-text {
		color: #F39C12;
		font-weight: 600;
	}
	
	.developing {
		opacity: 0.5;
	}
	
	.developing-tag {
		position: absolute;
		top: 8rpx;
		right: 8rpx;
		background: #FF6B6B;
		color: #FFFFFF;
		font-size: 18rpx;
		padding: 2rpx 6rpx;
		border-radius: 8rpx;
		font-weight: 400;
		transform: scale(0.8);
	}
	
	/* 管理员入口样式 */
	.admin-entry {
		border: 2rpx solid rgba(0, 122, 255, 0.2);
		background: linear-gradient(135deg, rgba(0, 122, 255, 0.05) 0%, rgba(0, 122, 255, 0.02) 100%);
	}
	
	.admin-entry:active {
		background: linear-gradient(135deg, rgba(0, 122, 255, 0.1) 0%, rgba(0, 122, 255, 0.05) 100%);
		border-color: rgba(0, 122, 255, 0.3);
	}
	
	.admin-tag {
		position: absolute;
		top: 8rpx;
		right: 8rpx;
		background: #007AFF;
		color: #FFFFFF;
		font-size: 18rpx;
		padding: 2rpx 6rpx;
		border-radius: 8rpx;
		font-weight: 400;
		transform: scale(0.8);
	}
	
	/* 交易保障 */
	.guarantee-section {
		display: flex;
		align-items: center;
		padding: 25rpx 30rpx;
		background: rgba(82, 196, 26, 0.1);
		backdrop-filter: blur(10rpx);
		margin: 0 30rpx 30rpx;
		border-radius: 20rpx;
		box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.1);
		border: 1rpx solid rgba(255, 255, 255, 0.3);
	}
	
	.guarantee-icon {
		width: 44rpx;
		height: 44rpx;
		background: linear-gradient(135deg, #52C41A 0%, #73D13D 100%);
		color: #FFFFFF;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24rpx;
		font-weight: bold;
		margin-right: 16rpx;
		box-shadow: 0 4rpx 12rpx rgba(82, 196, 26, 0.2);
	}
	
	.guarantee-text {
		font-size: 28rpx;
		color: #1A1A1A;
		margin-right: 20rpx;
		font-weight: 600;
	}
	
	.guarantee-desc {
		font-size: 24rpx;
		color: #52C41A;
		font-weight: 500;
	}
	
	/* 附近寄存点 */
	.nearby-lockers-section {
		background-image: url('/static/12.png');
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		margin: 0 30rpx 30rpx;
		border-radius: 24rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
		border: 1rpx solid rgba(0, 0, 0, 0.04);
		padding-bottom: 100rpx;
		overflow: hidden;
		position: relative;
	}
	
	.nearby-lockers-section::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(255, 255, 255, 0.15);
		backdrop-filter: blur(10rpx);
		z-index: 1;
	}
	
	.nearby-lockers-section > * {
		position: relative;
		z-index: 2;
	}
	
	.section-title {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx 30rpx 20rpx;
		border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);
		background: linear-gradient(135deg, #FAFBFF 0%, #F5F7FA 100%);
	}
	
	.title-text {
		font-size: 32rpx;
		color: #1A1A1A;
		font-weight: 700;
	}
	
	.more-btn {
		font-size: 26rpx;
		color: #007AFF;
		padding: 8rpx 16rpx;
		border-radius: 20rpx;
		background-color: rgba(0, 122, 255, 0.1);
		transition: all 0.3s ease;
	}
	
	.more-btn:active {
		background-color: rgba(0, 122, 255, 0.2);
		transform: scale(0.95);
	}
	
	.locker-item {
		display: flex;
		padding: 30rpx;
		align-items: center;
		transition: all 0.3s ease;
		position: relative;
	}
	
	.locker-item:active {
		background-color: rgba(0, 122, 255, 0.03);
		transform: scale(0.98);
	}
	
	.locker-image {
		width: 120rpx;
		height: 120rpx;
		margin-right: 30rpx;
		border-radius: 16rpx;
		background-color: #F5F5F5;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
	}
	
	.locker-info {
		flex: 1;
		min-width: 0;
		word-wrap: break-word;
	}
	
	.locker-name {
		font-size: 30rpx;
		color: #1A1A1A;
		font-weight: 600;
		display: block;
		margin-bottom: 12rpx;
		line-height: 1.4;
		word-wrap: break-word;
		overflow: hidden;
	}
	
	.locker-capacity {
		font-size: 24rpx;
		color: #007AFF;
		display: inline-block;
		margin-bottom: 12rpx;
		font-weight: 500;
		background: linear-gradient(135deg, #E3F2FD 0%, #F0F8FF 100%);
		padding: 8rpx 16rpx;
		border-radius: 20rpx;
		white-space: nowrap;
	}
	
	.locker-location {
		display: flex;
		align-items: flex-start;
		width: 100%;
	}
	
	.location-text {
		font-size: 24rpx;
		color: #8E8E93;
		margin-left: 8rpx;
		flex: 1;
		line-height: 1.4;
		word-wrap: break-word;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	
	.distance {
		font-size: 22rpx;
		color: #007AFF;
		background-color: rgba(0, 122, 255, 0.1);
		padding: 4rpx 8rpx;
		border-radius: 12rpx;
		margin-left: 12rpx;
		white-space: nowrap;
	}
	
	.no-locker {
		padding: 60rpx 30rpx;
		text-align: center;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10rpx);
		border-radius: 15rpx;
		margin: 20rpx;
		border: 1rpx solid rgba(255, 255, 255, 0.2);
	}
	
	.no-locker-icon {
		font-size: 60rpx;
		margin-bottom: 20rpx;
		opacity: 0.6;
	}
	
	.no-locker-text {
		font-size: 28rpx;
		color: #8E8E93;
		margin-bottom: 30rpx;
		line-height: 1.5;
	}
	
	.no-locker-actions {
		display: flex;
		justify-content: center;
		gap: 20rpx;
	}
	
	.retry-btn, .expand-btn {
		padding: 20rpx 30rpx;
		border-radius: 25rpx;
		font-size: 26rpx;
		border: none;
		min-width: 160rpx;
	}
	
	.retry-btn {
		background-color: #007AFF;
		color: white;
	}
	
	.expand-btn {
		background-color: #FF6B35;
		color: white;
	}
	
	.retry-btn:active, .expand-btn:active {
		transform: scale(0.95);
	}
	
	.loading-spinner {
		width: 40rpx;
		height: 40rpx;
		border: 3rpx solid #E5E5E5;
		border-top: 3rpx solid #007AFF;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 20rpx auto;
	}
	
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
	
	/* 添加一些微动画效果 */
	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(30rpx);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
