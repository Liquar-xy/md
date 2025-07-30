<template>
	<view class="page">
		<!-- 顶部图片区域 -->
		<view class="header-section">
			<image class="header-image" src="/static/首页顶图.png" mode="aspectFill"></image>
			<view class="header-overlay">
				<text class="header-title">便捷储物舱</text>
				<text class="header-subtitle">智能寄存，安全可靠</text>
			</view>
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
					<text class="search-icon">🔍</text>
					<text class="search-text">搜索火车站/地铁站/景点</text>
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
			<view class="feature-item" @click="goToCoupons">
				<view class="feature-icon coupons-icon">🎫</view>
				<text class="feature-text coupons-text">优惠卡券</text>
			</view>
		</view>

		<!-- 交易保障 -->
		<view class="guarantee-section">
			<view class="guarantee-icon">✓</view>
			<text class="guarantee-text">小程序交易保障</text>
		</view>

		<!-- 线上寄存优惠券 -->
		<view class="coupon-banner">
			<view class="coupon-content">
				<text class="coupon-title">线上寄存优惠券</text>
				<text class="coupon-subtitle">新人专享 无门槛优惠券大礼包！</text>
			</view>
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
				'郑州市': ['郑州站', '郑州东站', '二七广场', '中原福塔'],
				'石家庄': ['石家庄站', '石家庄北站', '正定机场', '万达广场'],
				'石家庄市': ['石家庄站', '石家庄北站', '正定机场', '万达广场'],
				'北京': ['北京站', '北京西站', '天安门', '故宫'],
				'北京市': ['北京站', '北京西站', '天安门', '故宫'],
				'上海': ['上海站', '上海虹桥站', '外滩', '东方明珠'],
				'上海市': ['上海站', '上海虹桥站', '外滩', '东方明珠'],
				'广州': ['广州站', '广州南站', '珠江新城', '天河城'],
				'广州市': ['广州站', '广州南站', '珠江新城', '天河城'],
				'深圳': ['深圳站', '深圳北站', '华强北', '世界之窗'],
				'深圳市': ['深圳站', '深圳北站', '华强北', '世界之窗'],
				'杭州': ['杭州站', '杭州东站', '西湖', '钱江新城'],
				'杭州市': ['杭州站', '杭州东站', '西湖', '钱江新城'],
				'南京': ['南京站', '南京南站', '夫子庙', '中山陵'],
				'南京市': ['南京站', '南京南站', '夫子庙', '中山陵'],
				'武汉': ['武汉站', '汉口站', '黄鹤楼', '江汉路'],
				'武汉市': ['武汉站', '汉口站', '黄鹤楼', '江汉路'],
				'成都': ['成都站', '成都东站', '春熙路', '宽窄巷子'],
				'成都市': ['成都站', '成都东站', '春熙路', '宽窄巷子'],
				'西安': ['西安站', '西安北站', '钟楼', '大雁塔'],
				'西安市': ['西安站', '西安北站', '钟楼', '大雁塔'],
				'天津': ['天津站', '天津西站', '天津之眼', '古文化街'],
				'天津市': ['天津站', '天津西站', '天津之眼', '古文化街'],
				'重庆': ['重庆站', '重庆北站', '解放碑', '洪崖洞'],
				'重庆市': ['重庆站', '重庆北站', '解放碑', '洪崖洞'],
				'沈阳': ['沈阳站', '沈阳北站', '故宫', '中街'],
				'沈阳市': ['沈阳站', '沈阳北站', '故宫', '中街'],
				'长春': ['长春站', '长春西站', '伪满皇宫', '重庆路'],
				'长春市': ['长春站', '长春西站', '伪满皇宫', '重庆路'],
				'哈尔滨': ['哈尔滨站', '哈尔滨西站', '中央大街', '太阳岛'],
				'哈尔滨市': ['哈尔滨站', '哈尔滨西站', '中央大街', '太阳岛'],
				'济南': ['济南站', '济南西站', '趵突泉', '大明湖'],
				'济南市': ['济南站', '济南西站', '趵突泉', '大明湖'],
				'青岛': ['青岛站', '青岛北站', '栈桥', '五四广场'],
				'青岛市': ['青岛站', '青岛北站', '栈桥', '五四广场'],
				'合肥': ['合肥站', '合肥南站', '天鹅湖', '万达茂'],
				'合肥市': ['合肥站', '合肥南站', '天鹅湖', '万达茂'],
				'福州': ['福州站', '福州南站', '三坊七巷', '西湖公园'],
				'福州市': ['福州站', '福州南站', '三坊七巷', '西湖公园'],
				'厦门': ['厦门站', '厦门北站', '鼓浪屿', '中山路'],
				'厦门市': ['厦门站', '厦门北站', '鼓浪屿', '中山路'],
				'南昌': ['南昌站', '南昌西站', '滕王阁', '八一广场'],
				'南昌市': ['南昌站', '南昌西站', '滕王阁', '八一广场'],
				'长沙': ['长沙站', '长沙南站', '橘子洲', '太平街'],
				'长沙市': ['长沙站', '长沙南站', '橘子洲', '太平街'],
				'昆明': ['昆明站', '昆明南站', '滇池', '翠湖公园'],
				'昆明市': ['昆明站', '昆明南站', '滇池', '翠湖公园'],
				'贵阳': ['贵阳站', '贵阳北站', '甲秀楼', '花果园'],
				'贵阳市': ['贵阳站', '贵阳北站', '甲秀楼', '花果园'],
				'兰州': ['兰州站', '兰州西站', '中山桥', '白塔山'],
				'兰州市': ['兰州站', '兰州西站', '中山桥', '白塔山'],
				'银川': ['银川站', '银川河东站', '鼓楼', '南门广场'],
				'银川市': ['银川站', '银川河东站', '鼓楼', '南门广场'],
				'西宁': ['西宁站', '西宁西站', '塔尔寺', '中心广场'],
				'西宁市': ['西宁站', '西宁西站', '塔尔寺', '中心广场'],
				'乌鲁木齐': ['乌鲁木齐站', '乌鲁木齐南站', '红山公园', '大巴扎'],
				'乌鲁木齐市': ['乌鲁木齐站', '乌鲁木齐南站', '红山公园', '大巴扎'],
				'拉萨': ['拉萨站', '拉萨西站', '布达拉宫', '大昭寺'],
				'拉萨市': ['拉萨站', '拉萨西站', '布达拉宫', '大昭寺'],
				'呼和浩特': ['呼和浩特站', '呼和浩特东站', '大召寺', '内蒙古博物院'],
				'呼和浩特市': ['呼和浩特站', '呼和浩特东站', '大召寺', '内蒙古博物院']
			}
		}
	},
	
	onLoad() {
		console.log('🚀 首页加载');
		
		// 获取当前选择的城市
		const selectedCity = uni.getStorageSync('selectedCity');
		console.log('📍 初始加载时的城市:', selectedCity);
		
		if (selectedCity && selectedCity.name) {
			console.log('🔄 设置城市为:', selectedCity.name);
			this.currentCity = selectedCity.name;
		} else {
			console.log('⚠️ 使用默认城市: 郑州');
			this.currentCity = '郑州';
		}
		
		// 更新热门地点
		this.updateHotspots();
		
		// 获取附近寄存点
		this.loadNearbyLockers();
		
		// 添加延迟强制更新，确保热门地点正确显示
		setTimeout(() => {
			console.log('🔄 延迟强制更新热门地点');
			this.updateHotspots();
		}, 100);
	},
	
	onShow() {
		console.log('🔄 首页onShow触发');
		
		// 页面显示时检查城市是否变化
		const selectedCity = uni.getStorageSync('selectedCity');
		console.log('📍 存储中的城市:', selectedCity);
		console.log('📍 当前显示城市:', this.currentCity);
		console.log('📍 当前热门地点:', this.hotspots);
		
		if (selectedCity && selectedCity.name) {
			if (selectedCity.name !== this.currentCity) {
				console.log('🔄 城市变化:', this.currentCity, '->', selectedCity.name);
				this.currentCity = selectedCity.name;
				this.updateHotspots();
				this.loadNearbyLockers();
			} else {
				console.log('✅ 城市未变化，但强制更新热门地点');
				// 即使城市未变化，也强制更新一次热门地点，确保显示正确
				this.updateHotspots();
			}
		} else {
			console.log('⚠️ 未找到选中城市，使用默认城市');
			this.updateHotspots();
		}
		
		// 添加延迟检查，确保热门地点已更新
		setTimeout(() => {
			console.log('🔍 延迟检查 - 当前城市:', this.currentCity);
			console.log('🔍 延迟检查 - 热门地点:', this.hotspots);
		}, 500);
	},
	
	onUnload() {
		// 清理定时器
		if (this.updateTimer) {
			clearInterval(this.updateTimer);
		}
	},
	
	methods: {
		// 更新热门地点
		updateHotspots() {
			console.log('🔄 更新热门地点，当前城市:', this.currentCity);
			
			// 获取城市的核心名称（去掉"市"、"省"等后缀）
			const cleanCityName = this.getCleanCityName(this.currentCity);
			console.log('🔍 清理后的城市名称:', cleanCityName);
			
			// 根据当前城市获取对应的热门地点
			let cityHotspots = this.cityHotspots[this.currentCity] || this.cityHotspots[cleanCityName];
			
			// 如果还是找不到，尝试模糊匹配
			if (!cityHotspots) {
				cityHotspots = this.findCityHotspotsByFuzzyMatch(cleanCityName);
			}
			
			if (cityHotspots && cityHotspots.length > 0) {
				this.hotspots = [...cityHotspots];
				console.log('✅ 热门地点已更新:', this.hotspots);
			} else {
				// 使用默认的郑州热门地点
				this.hotspots = [...this.cityHotspots['郑州']];
				console.log('⚠️ 未找到匹配城市，使用默认热门地点:', this.hotspots);
			}
		},
		
		// 获取清理后的城市名称
		getCleanCityName(cityName) {
			if (!cityName) return '';
			// 移除常见的城市后缀
			return cityName.replace(/[市省区县]/g, '');
		},
		
		// 通过模糊匹配查找城市热门地点
		findCityHotspotsByFuzzyMatch(cleanCityName) {
			console.log('🔍 尝试模糊匹配城市:', cleanCityName);
			
			// 遍历所有配置的城市，寻找匹配的
			for (const configCity in this.cityHotspots) {
				const cleanConfigCity = this.getCleanCityName(configCity);
				if (cleanConfigCity === cleanCityName || configCity.includes(cleanCityName) || cleanCityName.includes(cleanConfigCity)) {
					console.log('✅ 模糊匹配成功:', configCity);
					return this.cityHotspots[configCity];
				}
			}
			
			console.log('❌ 模糊匹配失败');
			return null;
		},
		
		// 选择城市
		selectCity() {
			uni.navigateTo({
				url: '/pages/city-select/city-select?from=index'
			});
		},
		
		// 找附近
		findNearby() {
			uni.navigateTo({
				url: '/pages/nearby/nearby'
			});
		},
		
		// 打开搜索
		openSearch() {
			uni.navigateTo({
				url: '/pages/search/search'
			});
		},
		
		// 选择热门地点
		selectHotspot(hotspot) {
			console.log('选择热门地点:', hotspot);
			uni.navigateTo({
				url: `/pages/search/search?keyword=${encodeURIComponent(hotspot)}`
			});
		},
		
		// 查询寄存点
		queryLockers() {
			uni.navigateTo({
				url: '/pages/locker-map/locker-map'
			});
		},
		
		// 功能入口
		goToOrders() {
			uni.navigateTo({
				url: '/pages/order-detail/order-detail'
			});
		},
		
		goToService() {
			uni.navigateTo({
				url: '/pages/customer-service/customer-service'
			});
		},
		
		goToGuide() {
			uni.navigateTo({
				url: '/pages/user-guide/user-guide'
			});
		},
		
		goToCoupons() {
			uni.navigateTo({
				url: '/pages/coupons/coupons'
			});
		},
		
		// 查看全部附近寄存点
		viewAllNearby() {
			uni.navigateTo({
				url: '/pages/nearby/nearby'
			});
		},
		
		// 选择寄存点
		selectLocker(locker) {
			console.log('选择寄存点:', locker);
			uni.navigateTo({
				url: `/pages/locker-detail/locker-detail?id=${locker.id}&name=${encodeURIComponent(locker.name)}&address=${encodeURIComponent(locker.address)}`
			});
		},
		
		// 加载附近寄存点
		loadNearbyLockers() {
			console.log('🔄 开始加载附近寄存点');
			this.isLoadingNearby = true;
			this.noLockerMessage = '正在获取附近寄存点...';
			
			// 获取用户位置
			uni.getLocation({
				type: 'gcj02',
				success: (res) => {
					console.log('📍 获取位置成功:', res);
					this.fetchNearbyLockers(res.latitude, res.longitude);
				},
				fail: (err) => {
					console.log('❌ 获取位置失败:', err);
					// 使用默认位置（郑州）
					this.fetchNearbyLockers(34.7466, 113.6253);
				}
			});
		},
		
		// 获取附近寄存点数据
		fetchNearbyLockers(latitude, longitude) {
			console.log('📡 请求附近寄存点数据:', { latitude, longitude, city: this.currentCity });
			
			// 统一的API基础URL
			const API_BASE_URL = 'http://localhost:8000';
			
			// 调用后端接口 - 修复API路径
			uni.request({
				url: `${API_BASE_URL}/api/nearby/city/locker-points`,
				method: 'GET',
				data: {
					city: this.currentCity,
					longitude: longitude,
					latitude: latitude,
					radius: 10, // 10公里范围
					include_unavailable: false
				},
				header: {
					'Content-Type': 'application/json'
				},
				timeout: 8000, // 8秒超时
				success: (res) => {
					console.log('✅ 获取附近寄存点成功:', res.data);
					this.handleNearbyLockersSuccess(res.data);
				},
				fail: (err) => {
					console.log('❌ 获取附近寄存点失败，使用模拟数据:', err);
					// 网络失败时使用模拟数据
					this.useMockNearbyData(latitude, longitude);
				}
			});
		},
		
		// 使用模拟附近寄存点数据
		useMockNearbyData(latitude, longitude) {
			console.log('🎭 使用模拟附近寄存点数据');
			
			// 生成模拟数据
			const mockData = {
				lockers: [
					{
						id: 1,
						name: `${this.currentCity}火车站寄存点`,
						address: `${this.currentCity}火车站西广场`,
						longitude: longitude + 0.001,
						latitude: latitude + 0.001,
						large: 5,
						medium: 8,
						small: 12,
						status: 'available',
						distance: '0.8km',
						rating: 4.5,
						price: 8,
						openTime: '06:00-23:00'
					},
					{
						id: 2,
						name: `${this.currentCity}地铁站寄存点`,
						address: `${this.currentCity}地铁1号线A出口`,
						longitude: longitude - 0.002,
						latitude: latitude + 0.003,
						large: 3,
						medium: 6,
						small: 10,
						status: 'available',
						distance: '1.2km',
						rating: 4.3,
						price: 6,
						openTime: '24小时'
					},
					{
						id: 3,
						name: `${this.currentCity}商业中心寄存点`,
						address: `${this.currentCity}万达广场B1层`,
						longitude: longitude + 0.003,
						latitude: latitude - 0.001,
						large: 2,
						medium: 4,
						small: 8,
						status: 'available',
						distance: '1.5km',
						rating: 4.7,
						price: 10,
						openTime: '10:00-22:00'
					}
				]
			};
			
			// 延迟一下模拟网络请求
			setTimeout(() => {
				this.handleNearbyLockersSuccess(mockData);
			}, 1000);
		},
		
		// 处理获取附近寄存点成功
		handleNearbyLockersSuccess(data) {
			this.isLoadingNearby = false;
			
			try {
				let lockers = [];
				
				// 处理不同的响应格式
				if (data.lockers && Array.isArray(data.lockers)) {
					lockers = data.lockers;
				} else if (data.data && Array.isArray(data.data)) {
					lockers = data.data;
				} else if (Array.isArray(data)) {
					lockers = data;
				}
				
				if (lockers.length > 0) {
					// 按距离排序
					lockers.sort((a, b) => {
						const distanceA = parseFloat(a.distance) || 0;
						const distanceB = parseFloat(b.distance) || 0;
						return distanceA - distanceB;
					});
					
					this.nearestLocker = lockers[0];
					this.nearbyLockers = lockers;
					this.noLockerMessage = '';
					
					console.log('✅ 附近寄存点数据处理完成:', {
						nearest: this.nearestLocker.name,
						total: this.nearbyLockers.length
					});
				} else {
					this.handleNearbyLockersError('暂无附近寄存点');
				}
			} catch (error) {
				console.error('❌ 处理附近寄存点数据时出错:', error);
				this.handleNearbyLockersError('数据处理失败');
			}
		},
		
		// 处理获取附近寄存点失败
		handleNearbyLockersError(message, latitude, longitude) {
			console.log('⚠️ 处理附近寄存点错误:', message);
			this.isLoadingNearby = false;
			
			// 如果是网络错误，提供模拟数据作为降级方案
			if (message && message.includes('网络') && latitude && longitude) {
				console.log('🎭 网络错误，提供模拟数据作为降级方案');
				this.useMockNearbyData(latitude, longitude);
				return;
			}
			
			// 其他错误情况显示错误信息
			this.nearestLocker = null;
			this.nearbyLockers = [];
			this.noLockerMessage = message || '暂无附近寄存点，试试扩大搜索范围';
		},
		
		// 重新搜索
		refreshNearbyLockers() {
			this.loadNearbyLockers();
		},
		
		// 扩大搜索范围
		expandSearchRadius() {
			console.log('🔍 扩大搜索范围');
			this.isLoadingNearby = true;
			this.noLockerMessage = '正在扩大范围搜索...';
			
			// 获取用户位置并使用更大的搜索半径
			uni.getLocation({
				type: 'gcj02',
				success: (res) => {
					this.fetchNearbyLockersWithRadius(res.latitude, res.longitude, 50); // 50公里
				},
				fail: (err) => {
					this.fetchNearbyLockersWithRadius(34.7466, 113.6253, 50);
				}
			});
		},
		
		// 使用指定半径获取寄存点
		fetchNearbyLockersWithRadius(latitude, longitude, radius) {
			uni.request({
				url: 'http://localhost:8000/api/nearby/locker-points',
				method: 'GET',
				data: {
					city: this.currentCity,
					longitude: longitude,
					latitude: latitude,
					radius: radius,
					include_unavailable: false
				},
				header: {
					'Content-Type': 'application/json'
				},
				success: (res) => {
					this.handleNearbyLockersSuccess(res.data);
				},
				fail: (err) => {
					this.handleNearbyLockersError('扩大范围搜索失败', latitude, longitude);
				}
			});
		}
	}
}
</script>

<style scoped>
.page {
	background: linear-gradient(180deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
	min-height: 100vh;
	position: relative;
}

.page::before {
	content: '';
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: linear-gradient(135deg, 
		rgba(102, 126, 234, 0.1) 0%, 
		rgba(118, 75, 162, 0.05) 50%, 
		rgba(240, 147, 251, 0.1) 100%);
	backdrop-filter: blur(100rpx);
	z-index: -1;
}

/* 顶部图片区域 */
.header-section {
	position: relative;
	height: 280rpx;
	overflow: hidden;
}

.header-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.header-overlay {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.1));
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}

.header-title {
	font-size: 48rpx;
	font-weight: bold;
	color: #ffffff;
	margin-bottom: 10rpx;
	text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
}

.header-subtitle {
	font-size: 28rpx;
	color: #ffffff;
	opacity: 0.9;
	text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.3);
}

/* 城市选择和我的附近 */
.location-section {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx;
	background: linear-gradient(135deg, 
		rgba(255, 255, 255, 0.95) 0%, 
		rgba(255, 255, 255, 0.85) 100%);
	backdrop-filter: blur(20rpx);
	border-bottom: 1rpx solid rgba(255, 255, 255, 0.2);
}

.city-selector {
	display: flex;
	align-items: center;
	padding: 15rpx 25rpx;
	background: linear-gradient(135deg, #667eea, #764ba2);
	border-radius: 25rpx;
	box-shadow: 0 4rpx 15rpx rgba(102, 126, 234, 0.3);
}

.location-icon {
	font-size: 28rpx;
	margin-right: 10rpx;
	color: #ffffff;
}

.city-name {
	font-size: 28rpx;
	font-weight: bold;
	color: #ffffff;
	margin-right: 10rpx;
}

.dropdown-icon {
	font-size: 24rpx;
	color: #ffffff;
}

.nearby-btn {
	display: flex;
	align-items: center;
	padding: 15rpx 25rpx;
	background: linear-gradient(135deg, #f093fb, #f5576c);
	border-radius: 25rpx;
	box-shadow: 0 4rpx 15rpx rgba(240, 147, 251, 0.3);
}

.nearby-icon {
	font-size: 28rpx;
	margin-right: 8rpx;
	color: #ffffff;
}

.nearby-text {
	font-size: 28rpx;
	color: #ffffff;
	font-weight: 500;
}

/* 搜索框 */
.search-section {
	padding: 30rpx;
	background: linear-gradient(135deg, 
		rgba(255, 255, 255, 0.95) 0%, 
		rgba(255, 255, 255, 0.85) 100%);
	backdrop-filter: blur(20rpx);
}

.search-box {
	display: flex;
	align-items: center;
	padding: 25rpx 30rpx;
	background: linear-gradient(135deg, 
		rgba(255, 255, 255, 0.9) 0%, 
		rgba(255, 255, 255, 0.7) 100%);
	border-radius: 30rpx;
	border: 2rpx solid rgba(102, 126, 234, 0.2);
	box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.1);
}

.search-placeholder-container {
	display: flex;
	align-items: center;
	flex: 1;
}

.search-icon {
	font-size: 32rpx;
	color: #667eea;
	margin-right: 15rpx;
}

.search-text {
	font-size: 28rpx;
	color: #999999;
}

/* 热门地点 */
.hotspots-section {
	display: flex;
	flex-wrap: wrap;
	padding: 20rpx 30rpx;
	background: linear-gradient(135deg, 
		rgba(255, 255, 255, 0.95) 0%, 
		rgba(255, 255, 255, 0.85) 100%);
	backdrop-filter: blur(20rpx);
}

.hotspot-item {
	margin: 10rpx;
	padding: 15rpx 25rpx;
	background: linear-gradient(135deg, 
		rgba(102, 126, 234, 0.1) 0%, 
		rgba(118, 75, 162, 0.1) 100%);
	border-radius: 25rpx;
	border: 1rpx solid rgba(102, 126, 234, 0.2);
}

.hotspot-text {
	font-size: 26rpx;
	color: #667eea;
	font-weight: 500;
}

/* 查询按钮 */
.query-section {
	padding: 30rpx;
	background: linear-gradient(135deg, 
		rgba(255, 255, 255, 0.95) 0%, 
		rgba(255, 255, 255, 0.85) 100%);
	backdrop-filter: blur(20rpx);
}

.query-btn {
	width: 100%;
	padding: 30rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
	border: none;
	border-radius: 30rpx;
	font-size: 32rpx;
	font-weight: bold;
	box-shadow: 0 8rpx 25rpx rgba(102, 126, 234, 0.4);
}

/* 功能入口 */
.features-section {
	display: flex;
	justify-content: space-around;
	padding: 40rpx 30rpx;
	background: linear-gradient(135deg, 
		rgba(255, 255, 255, 0.95) 0%, 
		rgba(255, 255, 255, 0.85) 100%);
	backdrop-filter: blur(20rpx);
	margin-top: 20rpx;
}

.feature-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 20rpx;
	border-radius: 20rpx;
	transition: all 0.3s ease;
}

.feature-icon {
	font-size: 48rpx;
	margin-bottom: 15rpx;
	padding: 20rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #f093fb, #f5576c);
	color: #ffffff;
	box-shadow: 0 6rpx 20rpx rgba(240, 147, 251, 0.3);
}

.feature-text {
	font-size: 24rpx;
	color: #333333;
	font-weight: 500;
}

/* 交易保障 */
.guarantee-section {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 30rpx;
	background: linear-gradient(135deg, 
		rgba(255, 255, 255, 0.95) 0%, 
		rgba(255, 255, 255, 0.85) 100%);
	backdrop-filter: blur(20rpx);
	margin-top: 20rpx;
}

.guarantee-icon {
	font-size: 32rpx;
	color: #4CAF50;
	margin-right: 15rpx;
	font-weight: bold;
}

.guarantee-text {
	font-size: 28rpx;
	color: #666666;
}

/* 优惠券横幅 */
.coupon-banner {
	margin: 20rpx 30rpx;
	padding: 30rpx;
	background: linear-gradient(135deg, #ff6b6b, #ffa500);
	border-radius: 20rpx;
	box-shadow: 0 8rpx 25rpx rgba(255, 107, 107, 0.3);
}

.coupon-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #ffffff;
	margin-bottom: 10rpx;
}

.coupon-subtitle {
	font-size: 24rpx;
	color: #ffffff;
	opacity: 0.9;
}

/* 附近寄存点 */
.nearby-lockers-section {
	background: linear-gradient(135deg, 
		rgba(255, 255, 255, 0.95) 0%, 
		rgba(255, 255, 255, 0.85) 100%);
	backdrop-filter: blur(20rpx);
	margin: 20rpx 30rpx;
	padding: 30rpx;
	border-radius: 20rpx;
	box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.1);
}

.section-title {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 30rpx;
}

.title-text {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
}

.more-btn {
	font-size: 26rpx;
	color: #667eea;
}

.locker-item {
	display: flex;
	padding: 25rpx 0;
	border-bottom: 1rpx solid rgba(0, 0, 0, 0.1);
}

.locker-item:last-child {
	border-bottom: none;
}

.locker-image {
	width: 120rpx;
	height: 120rpx;
	border-radius: 15rpx;
	margin-right: 25rpx;
}

.locker-info {
	flex: 1;
}

.locker-name {
	font-size: 30rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 10rpx;
}

.locker-capacity {
	font-size: 24rpx;
	color: #666666;
	margin-bottom: 10rpx;
}

.locker-location {
	display: flex;
	align-items: center;
}

.location-text {
	font-size: 24rpx;
	color: #999999;
	flex: 1;
}

.distance {
	font-size: 24rpx;
	color: #667eea;
	font-weight: 500;
}

/* 无寄存点提示 */
.no-locker {
	text-align: center;
	padding: 60rpx 30rpx;
}

.no-locker-icon {
	font-size: 80rpx;
	margin-bottom: 20rpx;
	opacity: 0.5;
}

.no-locker-text {
	font-size: 28rpx;
	color: #666666;
	margin-bottom: 40rpx;
}

.loading-spinner {
	width: 60rpx;
	height: 60rpx;
	border: 4rpx solid #f3f3f3;
	border-top: 4rpx solid #667eea;
	border-radius: 50%;
	animation: spin 1s linear infinite;
	margin: 20rpx auto;
}

@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
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
}

.retry-btn {
	background: #667eea;
	color: #ffffff;
}

.expand-btn {
	background: #f093fb;
	color: #ffffff;
}
</style>