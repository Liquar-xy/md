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

		<!-- 顶部操作栏 -->
		<view class="top-bar">
			<view class="logout-btn" @click="showLogoutConfirm">
				<text class="logout-icon">🚪</text>
				<text class="logout-text">退出</text>
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
			nearbyLockers: [],
			noLockerMessage: '正在获取附近寄存点...',
			isLoadingNearby: true,
			updateTimer: null,


			// 各城市的热门地点配置
			cityHotspots: {
				// 河南省
				'郑州': ['郑州站', '郑州东站', '二七广场', '中原福塔'],
				'郑州市': ['郑州站', '郑州东站', '二七广场', '中原福塔'],
				'洛阳': ['洛阳站', '洛阳龙门站', '龙门石窟', '白马寺'],
				'洛阳市': ['洛阳站', '洛阳龙门站', '龙门石窟', '白马寺'],
				'新乡': ['新乡站', '新乡东站', '平原博物院', '新乡市政府'],
				'新乡市': ['新乡站', '新乡东站', '平原博物院', '新乡市政府'],
				'开封': ['开封站', '开封北站', '清明上河园', '大相国寺'],
				'开封市': ['开封站', '开封北站', '清明上河园', '大相国寺'],
				'安阳': ['安阳站', '安阳东站', '殷墟', '红旗渠'],
				'安阳市': ['安阳站', '安阳东站', '殷墟', '红旗渠'],
				
				// 直辖市
				'北京': ['北京站', '北京西站', '天安门', '故宫'],
				'北京市': ['北京站', '北京西站', '天安门', '故宫'],
				'上海': ['上海站', '上海虹桥站', '外滩', '东方明珠'],
				'上海市': ['上海站', '上海虹桥站', '外滩', '东方明珠'],
				'天津': ['天津站', '天津西站', '天津之眼', '古文化街'],
				'天津市': ['天津站', '天津西站', '天津之眼', '古文化街'],
				'重庆': ['重庆站', '重庆北站', '解放碑', '洪崖洞'],
				'重庆市': ['重庆站', '重庆北站', '解放碑', '洪崖洞'],
				
				// 广东省
				'广州': ['广州站', '广州南站', '珠江新城', '天河城'],
				'广州市': ['广州站', '广州南站', '珠江新城', '天河城'],
				'深圳': ['深圳站', '深圳北站', '华强北', '世界之窗'],
				'深圳市': ['深圳站', '深圳北站', '华强北', '世界之窗'],
				'珠海': ['珠海站', '珠海机场', '拱北口岸', '珠海渔女'],
				'珠海市': ['珠海站', '珠海机场', '拱北口岸', '珠海渔女'],
				'佛山': ['佛山站', '佛山西站', '祖庙', '岭南天地'],
				'佛山市': ['佛山站', '佛山西站', '祖庙', '岭南天地'],
				'东莞': ['东莞站', '东莞东站', '可园', '松山湖'],
				'东莞市': ['东莞站', '东莞东站', '可园', '松山湖'],
				
				// 四川省
				'成都': ['成都站', '成都东站', '春熙路', '宽窄巷子'],
				'成都市': ['成都站', '成都东站', '春熙路', '宽窄巷子'],
				'四川': ['成都站', '成都东站', '春熙路', '宽窄巷子'],
				'四川省': ['成都站', '成都东站', '春熙路', '宽窄巷子'],
				'绵阳': ['绵阳站', '绵阳机场', '科技城', '越王楼'],
				'绵阳市': ['绵阳站', '绵阳机场', '科技城', '越王楼'],
				
				// 江苏省
				'南京': ['南京站', '南京南站', '夫子庙', '中山陵'],
				'南京市': ['南京站', '南京南站', '夫子庙', '中山陵'],
				'苏州': ['苏州站', '苏州北站', '拙政园', '平江路'],
				'苏州市': ['苏州站', '苏州北站', '拙政园', '平江路'],
				'无锡': ['无锡站', '无锡东站', '太湖', '鼋头渚'],
				'无锡市': ['无锡站', '无锡东站', '太湖', '鼋头渚'],
				'常州': ['常州站', '常州北站', '中华恐龙园', '天宁寺'],
				'常州市': ['常州站', '常州北站', '中华恐龙园', '天宁寺'],
				
				// 浙江省
				'杭州': ['杭州站', '杭州东站', '西湖', '灵隐寺'],
				'杭州市': ['杭州站', '杭州东站', '西湖', '灵隐寺'],
				'宁波': ['宁波站', '宁波东站', '天一阁', '东钱湖'],
				'宁波市': ['宁波站', '宁波东站', '天一阁', '东钱湖'],
				'温州': ['温州站', '温州南站', '雁荡山', '楠溪江'],
				'温州市': ['温州站', '温州南站', '雁荡山', '楠溪江'],
				
				// 湖北省
				'武汉': ['武汉站', '汉口站', '黄鹤楼', '东湖'],
				'武汉市': ['武汉站', '汉口站', '黄鹤楼', '东湖'],
				'宜昌': ['宜昌站', '宜昌东站', '三峡大坝', '葛洲坝'],
				'宜昌市': ['宜昌站', '宜昌东站', '三峡大坝', '葛洲坝'],
				
				// 湖南省
				'长沙': ['长沙站', '长沙南站', '橘子洲', '岳麓山'],
				'长沙市': ['长沙站', '长沙南站', '橘子洲', '岳麓山'],
				'张家界': ['张家界站', '张家界机场', '天门山', '黄龙洞'],
				'张家界市': ['张家界站', '张家界机场', '天门山', '黄龙洞'],
				
				// 陕西省
				'西安': ['西安站', '西安北站', '兵马俑', '大雁塔'],
				'西安市': ['西安站', '西安北站', '兵马俑', '大雁塔'],
				'宝鸡': ['宝鸡站', '宝鸡南站', '法门寺', '太白山'],
				'宝鸡市': ['宝鸡站', '宝鸡南站', '法门寺', '太白山'],
				
				// 山东省
				'济南': ['济南站', '济南西站', '趵突泉', '大明湖'],
				'济南市': ['济南站', '济南西站', '趵突泉', '大明湖'],
				'青岛': ['青岛站', '青岛北站', '栈桥', '八大关'],
				'青岛市': ['青岛站', '青岛北站', '栈桥', '八大关'],
				'烟台': ['烟台站', '烟台南站', '蓬莱阁', '金沙滩'],
				'烟台市': ['烟台站', '烟台南站', '蓬莱阁', '金沙滩'],
				
				// 辽宁省
				'沈阳': ['沈阳站', '沈阳北站', '故宫', '北陵公园'],
				'沈阳市': ['沈阳站', '沈阳北站', '故宫', '北陵公园'],
				'大连': ['大连站', '大连北站', '星海广场', '老虎滩'],
				'大连市': ['大连站', '大连北站', '星海广场', '老虎滩'],
				'锦州': ['锦州站', '锦州南站', '笔架山', '医巫闾山'],
				'锦州市': ['锦州站', '锦州南站', '笔架山', '医巫闾山'],
				
				// 吉林省
				'长春': ['长春站', '长春西站', '净月潭', '伪满皇宫'],
				'长春市': ['长春站', '长春西站', '净月潭', '伪满皇宫'],
				'吉林': ['吉林站', '吉林西站', '松花江', '北山公园'],
				'吉林市': ['吉林站', '吉林西站', '松花江', '北山公园'],
				
				// 黑龙江省
				'哈尔滨': ['哈尔滨站', '哈尔滨西站', '中央大街', '太阳岛'],
				'哈尔滨市': ['哈尔滨站', '哈尔滨西站', '中央大街', '太阳岛'],
				'大庆': ['大庆站', '大庆西站', '铁人纪念馆', '龙凤湿地'],
				'大庆市': ['大庆站', '大庆西站', '铁人纪念馆', '龙凤湿地'],
				
				// 安徽省
				'合肥': ['合肥站', '合肥南站', '包公园', '三河古镇'],
				'合肥市': ['合肥站', '合肥南站', '包公园', '三河古镇'],
				'芜湖': ['芜湖站', '芜湖北站', '方特欢乐世界', '鸠兹古镇'],
				'芜湖市': ['芜湖站', '芜湖北站', '方特欢乐世界', '鸠兹古镇'],
				
				// 江西省
				'南昌': ['南昌站', '南昌西站', '滕王阁', '八一广场'],
				'南昌市': ['南昌站', '南昌西站', '滕王阁', '八一广场'],
				'九江': ['九江站', '九江西站', '庐山', '浔阳楼'],
				'九江市': ['九江站', '九江西站', '庐山', '浔阳楼'],
				
				// 福建省
				'福州': ['福州站', '福州南站', '三坊七巷', '鼓山'],
				'福州市': ['福州站', '福州南站', '三坊七巷', '鼓山'],
				'厦门': ['厦门站', '厦门北站', '鼓浪屿', '中山路'],
				'厦门市': ['厦门站', '厦门北站', '鼓浪屿', '中山路'],
				
				// 云南省
				'昆明': ['昆明站', '昆明南站', '滇池', '石林'],
				'昆明市': ['昆明站', '昆明南站', '滇池', '石林'],
				'大理': ['大理站', '大理机场', '洱海', '古城'],
				'大理市': ['大理站', '大理机场', '洱海', '古城'],
				
				// 贵州省
				'贵阳': ['贵阳站', '贵阳北站', '黔灵山', '甲秀楼'],
				'贵阳市': ['贵阳站', '贵阳北站', '黔灵山', '甲秀楼'],
				
				// 广西省
				'南宁': ['南宁站', '南宁东站', '青秀山', '民族大道'],
				'南宁市': ['南宁站', '南宁东站', '青秀山', '民族大道'],
				'桂林': ['桂林站', '桂林北站', '漓江', '象鼻山'],
				'桂林市': ['桂林站', '桂林北站', '漓江', '象鼻山'],
				
				// 海南省
				'海口': ['海口站', '海口东站', '骑楼老街', '万绿园'],
				'海口市': ['海口站', '海口东站', '骑楼老街', '万绿园'],
				'三亚': ['三亚站', '三亚机场', '天涯海角', '亚龙湾'],
				'三亚市': ['三亚站', '三亚机场', '天涯海角', '亚龙湾'],
				
				// 山西省
				'太原': ['太原站', '太原南站', '晋祠', '双塔寺'],
				'太原市': ['太原站', '太原南站', '晋祠', '双塔寺'],
				'大同': ['大同站', '大同南站', '云冈石窟', '华严寺'],
				'大同市': ['大同站', '大同南站', '云冈石窟', '华严寺'],
				
				// 河北省
				'石家庄': ['石家庄站', '石家庄东站', '赵州桥', '正定古城'],
				'石家庄市': ['石家庄站', '石家庄东站', '赵州桥', '正定古城'],
				'唐山': ['唐山站', '唐山北站', '南湖公园', '清东陵'],
				'唐山市': ['唐山站', '唐山北站', '南湖公园', '清东陵'],
				
				// 内蒙古
				'呼和浩特': ['呼和浩特站', '呼和浩特东站', '大召寺', '内蒙古博物院'],
				'呼和浩特市': ['呼和浩特站', '呼和浩特东站', '大召寺', '内蒙古博物院'],
				'包头': ['包头站', '包头东站', '五当召', '赛汗塔拉'],
				'包头市': ['包头站', '包头东站', '五当召', '赛汗塔拉'],
				
				// 新疆
				'乌鲁木齐': ['乌鲁木齐站', '乌鲁木齐南站', '天山大峡谷', '红山公园'],
				'乌鲁木齐市': ['乌鲁木齐站', '乌鲁木齐南站', '天山大峡谷', '红山公园'],
				
				// 西藏
				'拉萨': ['拉萨站', '拉萨机场', '布达拉宫', '大昭寺'],
				'拉萨市': ['拉萨站', '拉萨机场', '布达拉宫', '大昭寺'],
				
				// 青海
				'西宁': ['西宁站', '西宁机场', '塔尔寺', '青海湖'],
				'西宁市': ['西宁站', '西宁机场', '塔尔寺', '青海湖'],
				
				// 宁夏
				'银川': ['银川站', '银川河东机场', '西夏王陵', '沙湖'],
				'银川市': ['银川站', '银川河东机场', '西夏王陵', '沙湖'],
				
				// 甘肃
				'兰州': ['兰州站', '兰州西站', '黄河铁桥', '白塔山'],
				'兰州市': ['兰州站', '兰州西站', '黄河铁桥', '白塔山']
			}
		}
	},
	
	onLoad() {
		console.log('🚀 首页加载');
		
		// 获取当前选择的城市
		const selectedCity = uni.getStorageSync('selectedCity');
		if (selectedCity && selectedCity.name) {
			this.currentCity = selectedCity.name;
		}
		
		// 强制更新热门地点，确保显示正确
		this.updateHotspots();
		
		// 初始化首页数据
		this.initializeHomePage();
	},
	
	onShow() {
		console.log('🔄 首页onShow触发');
		
		// 页面显示时检查城市是否变化
		const selectedCity = uni.getStorageSync('selectedCity');
		if (selectedCity && selectedCity.name && selectedCity.name !== this.currentCity) {
			this.currentCity = selectedCity.name;
			this.updateHotspots(); // 立即更新热门地点
			this.initializeHomePage();
		}
	},
	
	onUnload() {
		// 清理定时器
		if (this.updateTimer) {
			clearInterval(this.updateTimer);
		}
	},
	
	methods: {
		// 初始化首页数据
		initializeHomePage() {
			console.log('🔄 初始化首页数据');
			
			try {
				// 先使用本地数据，确保页面能正常显示
				this.updateHotspots();
				
				// 然后尝试加载后端数据（非阻塞）
				this.loadHotspots();
				this.loadNearbyLockers();
				this.loadHotCities();
				
				console.log('✅ 首页数据初始化完成');
			} catch (error) {
				console.error('❌ 首页数据初始化失败:', error);
				// 降级到本地数据
				this.updateHotspots();
			}
		},
		
		// 加载热门地点（暂时禁用API，直接使用本地数据）
		loadHotspots() {
			console.log('📡 加载热门地点（使用本地配置）');
			
			// 暂时禁用API调用，直接使用本地配置的热门地点
			this.updateHotspots();
			
			// TODO: 等后端API修复后再启用
			/*
			try {
				const API_BASE_URL = 'http://localhost:8000';
				const apiUrl = `${API_BASE_URL}/api/cities/hotspots?city_name=${encodeURIComponent(this.currentCity)}&limit=4`;
				
				console.log('🔍 热门地点请求URL:', apiUrl);
				
				uni.request({
					url: apiUrl,
					method: 'GET',
					header: {
						'Content-Type': 'application/json',
						'Accept': 'application/json'
					},
					timeout: 5000,
					success: (response) => {
						if (response.statusCode === 200 && response.data && response.data.items && response.data.items.length > 0) {
							this.hotspots = response.data.items.map(item => item.name).slice(0, 4);
							console.log('✅ 从后端加载热门地点成功:', this.hotspots);
						} else {
							console.log('⚠️ 后端返回数据格式不正确，使用本地配置');
						}
					},
					fail: (error) => {
						console.log('⚠️ 从后端加载热门地点失败，使用本地配置:', error);
					}
				});
			} catch (error) {
				console.log('⚠️ 加载热门地点异常，使用本地配置:', error);
			}
			*/
		},
		
		// 加载热门城市（暂时禁用）
		loadHotCities() {
			console.log('📡 加载热门城市（已禁用）');
			
			// 暂时禁用这个API调用，避免不必要的网络请求
			// TODO: 等后端API稳定后再启用
			/*
			try {
				const API_BASE_URL = 'http://localhost:8000';
				const apiUrl = `${API_BASE_URL}/api/cities/hot?limit=10`;
				
				uni.request({
					url: apiUrl,
					method: 'GET',
					header: {
						'Content-Type': 'application/json',
						'Accept': 'application/json'
					},
					timeout: 5000,
					success: (response) => {
						if (response.statusCode === 200 && response.data) {
							console.log('✅ 热门城市加载成功:', response.data);
						}
					},
					fail: (error) => {
						console.log('⚠️ 热门城市加载失败:', error);
					}
				});
			} catch (error) {
				console.log('⚠️ 加载热门城市异常:', error);
			}
			*/
		},
		
		// 更新热门地点
		updateHotspots() {
			console.log('🔄 更新热门地点，当前城市:', this.currentCity);
			
			// 获取城市的核心名称（去掉"市"、"省"等后缀）
			const cleanCityName = this.getCleanCityName(this.currentCity);
			
			// 根据当前城市获取对应的热门地点
			let cityHotspots = this.cityHotspots[this.currentCity] || this.cityHotspots[cleanCityName];
			
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
			return cityName.replace(/[市省区县]/g, '');
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
		

		
		// 显示退出登录确认
		showLogoutConfirm() {
			uni.showModal({
				title: '退出登录',
				content: '确定要退出当前账号吗？',
				confirmText: '退出',
				cancelText: '取消',
				success: (res) => {
					if (res.confirm) {
						this.logout();
					}
				}
			});
		},
		
		// 退出登录
		logout() {
			// 清除本地存储的用户信息
			uni.removeStorageSync('userToken');
			uni.removeStorageSync('userId');
			uni.removeStorageSync('userInfo');
			uni.removeStorageSync('selectedCity');
			
			// 显示退出成功提示
			uni.showToast({
				title: '已退出登录',
				icon: 'success',
				duration: 1500
			});
			
			// 延迟跳转到登录页面
			setTimeout(() => {
				uni.reLaunch({
					url: '/pages/login/login'
				});
			}, 1500);
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
			
			// 直接使用模拟数据，避免位置权限问题
			setTimeout(() => {
				this.useMockNearbyData(34.7466, 113.6253);
			}, 500);
			
			// 位置获取功能已禁用，直接使用模拟数据
			console.log('📍 使用模拟数据，跳过位置获取');
		},
		
		// 获取附近寄存点数据（暂时禁用API）
		fetchNearbyLockers(latitude, longitude) {
			console.log('📡 请求附近寄存点数据（使用模拟数据）:', { latitude, longitude, city: this.currentCity });
			
			// 如果已经有数据了，就不再重复生成
			if (this.nearbyLockers.length > 0) {
				console.log('✅ 已有附近寄存点数据，跳过重复生成');
				return;
			}
			
			// 暂时禁用API调用，直接使用模拟数据
			console.log('🎭 使用模拟数据替代API调用');
			// 不调用API，保持现有的模拟数据
			
			// TODO: 等后端API修复后再启用
			/*
			try {
				const API_BASE_URL = 'http://localhost:8000';
				const apiUrl = `${API_BASE_URL}/api/cities/locker-points?city_name=${encodeURIComponent(this.currentCity)}&longitude=${longitude}&latitude=${latitude}&radius=10&limit=10`;
				
				uni.request({
					url: apiUrl,
					method: 'GET',
					header: {
						'Content-Type': 'application/json',
						'Accept': 'application/json'
					},
					timeout: 5000,
					success: (response) => {
						if (response.statusCode === 200 && response.data) {
							console.log('✅ 获取附近寄存点成功:', response.data);
							this.handleNearbyLockersSuccess(response.data);
						}
					},
					fail: (error) => {
						console.log('❌ 获取附近寄存点失败:', error);
					}
				});
			} catch (error) {
				console.log('❌ 获取附近寄存点异常:', error);
			}
			*/
		},
		
		// 使用模拟附近寄存点数据
		useMockNearbyData(latitude, longitude) {
			console.log('🎭 使用模拟附近寄存点数据');
			
			const mockData = {
				items: [
					{
						id: 1,
						name: `${this.currentCity}火车站寄存点`,
						address: `${this.currentCity}火车站西广场`,
						longitude: longitude + 0.001,
						latitude: latitude + 0.001,
						distance: 0.8
					},
					{
						id: 2,
						name: `${this.currentCity}地铁站寄存点`,
						address: `${this.currentCity}地铁1号线A出口`,
						longitude: longitude - 0.002,
						latitude: latitude + 0.003,
						distance: 1.2
					},
					{
						id: 3,
						name: `${this.currentCity}商业中心寄存点`,
						address: `${this.currentCity}万达广场B1层`,
						longitude: longitude + 0.003,
						latitude: latitude - 0.001,
						distance: 1.5
					}
				]
			};
			
			setTimeout(() => {
				this.handleNearbyLockersSuccess(mockData);
			}, 1000);
		},
		
		// 处理获取附近寄存点成功
		handleNearbyLockersSuccess(data) {
			this.isLoadingNearby = false;
			
			try {
				let lockers = [];
				
				// 处理后端返回的数据格式
				if (data.items && Array.isArray(data.items)) {
					lockers = data.items.map(item => ({
						id: item.id,
						name: item.name,
						address: item.address,
						longitude: item.longitude,
						latitude: item.latitude,
						distance: item.distance ? `${item.distance.toFixed(1)}km` : '',
						large: Math.floor(Math.random() * 8) + 2,
						medium: Math.floor(Math.random() * 12) + 5,
						small: Math.floor(Math.random() * 15) + 8,
						status: 'available'
					}));
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
		handleNearbyLockersError(message) {
			console.log('⚠️ 处理附近寄存点错误:', message);
			this.isLoadingNearby = false;
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
			
			// 位置获取功能已禁用，直接使用默认坐标
			this.fetchNearbyLockersWithRadius(34.7466, 113.6253, 50);
		},
		
		// 使用指定半径获取寄存点（暂时禁用API）
		fetchNearbyLockersWithRadius(latitude, longitude, radius) {
			console.log('🔍 扩大搜索范围（使用模拟数据）');
			
			// 暂时禁用API调用，使用扩展的模拟数据
			const expandedMockData = {
				items: [
					{
						id: 1,
						name: `${this.currentCity}火车站寄存点`,
						address: `${this.currentCity}火车站西广场`,
						longitude: longitude + 0.001,
						latitude: latitude + 0.001,
						distance: 0.8
					},
					{
						id: 2,
						name: `${this.currentCity}地铁站寄存点`,
						address: `${this.currentCity}地铁1号线A出口`,
						longitude: longitude - 0.002,
						latitude: latitude + 0.003,
						distance: 1.2
					},
					{
						id: 3,
						name: `${this.currentCity}商业中心寄存点`,
						address: `${this.currentCity}万达广场B1层`,
						longitude: longitude + 0.003,
						latitude: latitude - 0.001,
						distance: 1.5
					},
					{
						id: 4,
						name: `${this.currentCity}机场寄存点`,
						address: `${this.currentCity}机场T2航站楼`,
						longitude: longitude + 0.005,
						latitude: latitude + 0.002,
						distance: 2.8
					},
					{
						id: 5,
						name: `${this.currentCity}高铁站寄存点`,
						address: `${this.currentCity}高铁站南广场`,
						longitude: longitude - 0.004,
						latitude: latitude - 0.003,
						distance: 3.2
					}
				]
			};
			
			setTimeout(() => {
				this.handleNearbyLockersSuccess(expandedMockData);
			}, 800);
			
			// TODO: 等后端API修复后再启用
			/*
			const API_BASE_URL = 'http://localhost:8000';
			
			uni.request({
				url: `${API_BASE_URL}/api/cities/locker-points?city_name=${encodeURIComponent(this.currentCity)}&longitude=${longitude}&latitude=${latitude}&radius=${radius}&limit=20`,
				method: 'GET',
				header: {
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				},
				success: (res) => {
					this.handleNearbyLockersSuccess(res.data);
				},
				fail: (err) => {
					this.handleNearbyLockersError('扩大范围搜索失败');
				}
			});
			*/
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