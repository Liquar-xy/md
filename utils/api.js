// API配置文件
const API_CONFIG = {
	// 基础URL配置 - 根据后端实际配置
	BASE_URL: 'http://localhost:8000',
	
	// 请求超时时间
	TIMEOUT: 10000,
	
	// API接口路径 - 根据OpenAPI规范更新
	ENDPOINTS: {
		// 用户相关
		LOGIN: '/login',
		ADMIN_LOGIN: '/admin',
		SEND_SMS: '/sendSms',
		REGISTER: '/register',
		
		// 寄存点相关 - 根据实际API路径
		NEARBY_SEARCH: '/api/nearby/city/search',
		NEARBY_MY: '/api/nearby/my-nearby',
		NEARBY_MAP: '/api/nearby/city/map',
		NEARBY_LOCKER_POINTS: '/api/nearby/locker-points',
		NEARBY_CITY_LOCKER_POINTS: '/api/nearby/city/locker-points',
		NEARBY_MY_LOCATION: '/api/nearby/my-location/locker-points',
		
		// 城市相关
		CITIES_LIST: '/api/cities',
		CITIES_HOT: '/api/cities/hot',
		CITIES_SEARCH: '/api/cities/search',
		CITIES_BY_CODE: '/api/cities/code',
		
		// 订单相关
		ORDER_LIST: '/v1/orders/list',
		ORDER_SHOW: '/v1/orders/show',
		ORDER_GET: '/v1/order/get',
		ORDER_CREATE: '/v1/order/create',
		ORDER_UPDATE: '/v1/order/update',
		ORDER_DELETE: '/v1/order/del',
		
		// 寄存相关
		DEPOSIT_LIST: '/deposit',
		DEPOSIT_CREATE: '/deposit/createDeposit',
		DEPOSIT_LOCKER: '/getDepositLocker',
		DEPOSIT_UPDATE_LOCKER: '/deposit/updateDepositLockerId',
		DEPOSIT_SEND_CODE: '/deposit/sendCodeByOrder',
		
		// 首页
		HOME: '/home',
		
		// Token相关
		RETURN_TOKEN: '/returntoken',
		DECODE_TOKEN: '/decodetoken'
	}
};

// 构建完整的API URL
function buildApiUrl(endpoint) {
	return API_CONFIG.BASE_URL + endpoint;
}

// 通用请求方法
function apiRequest(options) {
	const {
		endpoint,
		method = 'GET',
		data = {},
		header = {},
		timeout = API_CONFIG.TIMEOUT,
		success,
		fail,
		complete
	} = options;
	
	const url = buildApiUrl(endpoint);
	
	console.log('📡 API请求:', {
		url,
		method,
		data,
		header
	});
	
	return uni.request({
		url,
		method,
		data,
		header: {
			'Content-Type': 'application/json',
			...header
		},
		timeout,
		success: (res) => {
			console.log('✅ API响应成功:', {
				url,
				status: res.statusCode,
				data: res.data
			});
			
			if (success) {
				success(res);
			}
		},
		fail: (err) => {
			console.error('❌ API请求失败:', {
				url,
				error: err
			});
			
			if (fail) {
				fail(err);
			}
		},
		complete: (res) => {
			if (complete) {
				complete(res);
			}
		}
	});
}

// 具体的API方法
const API = {
	// 用户登录
	login(data) {
		return apiRequest({
			endpoint: API_CONFIG.ENDPOINTS.LOGIN,
			method: 'POST',
			data
		});
	},
	
	// 管理员登录
	adminLogin(data) {
		return apiRequest({
			endpoint: API_CONFIG.ENDPOINTS.ADMIN_LOGIN,
			method: 'POST',
			data
		});
	},
	
	// 发送短信
	sendSms(data) {
		return apiRequest({
			endpoint: API_CONFIG.ENDPOINTS.SEND_SMS,
			method: 'POST',
			data
		});
	},
	
	// 获取寄存点信息
	getDepositLocker(lockerId) {
		return apiRequest({
			endpoint: `${API_CONFIG.ENDPOINTS.DEPOSIT_LOCKER}?locker_id=${lockerId}`,
			method: 'GET'
		});
	},
	
	// 创建寄存订单
	createDeposit(data) {
		return apiRequest({
			endpoint: API_CONFIG.ENDPOINTS.DEPOSIT_CREATE,
			method: 'POST',
			data
		});
	},
	
	// 搜索城市内寄存点
	nearbySearch(params) {
		const queryString = new URLSearchParams(params).toString();
		return apiRequest({
			endpoint: `${API_CONFIG.ENDPOINTS.NEARBY_SEARCH}?${queryString}`,
			method: 'GET'
		});
	},
	
	// 获取我的附近信息
	nearbyMy(params) {
		const queryString = new URLSearchParams(params).toString();
		return apiRequest({
			endpoint: `${API_CONFIG.ENDPOINTS.NEARBY_MY}?${queryString}`,
			method: 'GET'
		});
	},
	
	// 获取城市寄存点地图数据
	nearbyMap(params) {
		const queryString = new URLSearchParams(params).toString();
		return apiRequest({
			endpoint: `${API_CONFIG.ENDPOINTS.NEARBY_MAP}?${queryString}`,
			method: 'GET'
		});
	},
	
	// 查找附近寄存点
	findNearbyLockerPoints(params) {
		const queryString = new URLSearchParams(params).toString();
		return apiRequest({
			endpoint: `${API_CONFIG.ENDPOINTS.NEARBY_LOCKER_POINTS}?${queryString}`,
			method: 'GET'
		});
	},
	
	// 查找城市内附近寄存点
	findNearbyLockerPointsInCity(params) {
		const queryString = new URLSearchParams(params).toString();
		return apiRequest({
			endpoint: `${API_CONFIG.ENDPOINTS.NEARBY_CITY_LOCKER_POINTS}?${queryString}`,
			method: 'GET'
		});
	},
	
	// 使用实时定位查找我的附近寄存点
	findMyNearbyLockerPoints(params) {
		const queryString = new URLSearchParams(params).toString();
		return apiRequest({
			endpoint: `${API_CONFIG.ENDPOINTS.NEARBY_MY_LOCATION}?${queryString}`,
			method: 'GET'
		});
	},
	
	// 获取城市列表
	getCities(params = {}) {
		// 默认参数：获取50条数据
		const defaultParams = {
			page: 1,
			page_size: 50,
			...params
		};
		const queryString = new URLSearchParams(defaultParams).toString();
		const endpoint = `${API_CONFIG.ENDPOINTS.CITIES_LIST}?${queryString}`;
		return apiRequest({
			endpoint,
			method: 'GET'
		});
	},
	
	// 获取热门城市
	getHotCities(limit = 10) {
		return apiRequest({
			endpoint: `${API_CONFIG.ENDPOINTS.CITIES_HOT}?limit=${limit}`,
			method: 'GET'
		});
	},
	
	// 搜索城市
	searchCities(params) {
		const queryString = new URLSearchParams(params).toString();
		return apiRequest({
			endpoint: `${API_CONFIG.ENDPOINTS.CITIES_SEARCH}?${queryString}`,
			method: 'GET'
		});
	},
	
	// 根据城市编码获取城市
	getCityByCode(code) {
		return apiRequest({
			endpoint: `${API_CONFIG.ENDPOINTS.CITIES_BY_CODE}/${code}`,
			method: 'GET'
		});
	},
	
	// 获取订单列表
	getOrderList(data) {
		return apiRequest({
			endpoint: API_CONFIG.ENDPOINTS.ORDER_LIST,
			method: 'POST',
			data
		});
	},
	
	// 显示订单
	showOrder(data) {
		return apiRequest({
			endpoint: API_CONFIG.ENDPOINTS.ORDER_SHOW,
			method: 'POST',
			data
		});
	},
	
	// 获取订单详情
	getOrder(id) {
		return apiRequest({
			endpoint: `${API_CONFIG.ENDPOINTS.ORDER_GET}?id=${id}`,
			method: 'GET'
		});
	},
	
	// 创建订单
	createOrder(data) {
		return apiRequest({
			endpoint: API_CONFIG.ENDPOINTS.ORDER_CREATE,
			method: 'POST',
			data
		});
	},
	
	// 更新订单
	updateOrder(data) {
		return apiRequest({
			endpoint: API_CONFIG.ENDPOINTS.ORDER_UPDATE,
			method: 'PUT',
			data
		});
	},
	
	// 删除订单
	deleteOrder(data) {
		return apiRequest({
			endpoint: API_CONFIG.ENDPOINTS.ORDER_DELETE,
			method: 'POST',
			data
		});
	},
	
	// 获取首页数据
	getHome() {
		return apiRequest({
			endpoint: API_CONFIG.ENDPOINTS.HOME,
			method: 'GET'
		});
	},
	
	// 用户注册
	register(data) {
		return apiRequest({
			endpoint: API_CONFIG.ENDPOINTS.REGISTER,
			method: 'POST',
			data
		});
	},
	
	// 获取Token
	getToken() {
		return apiRequest({
			endpoint: API_CONFIG.ENDPOINTS.RETURN_TOKEN,
			method: 'GET'
		});
	},
	
	// 解码Token
	decodeToken() {
		return apiRequest({
			endpoint: API_CONFIG.ENDPOINTS.DECODE_TOKEN,
			method: 'GET'
		});
	}
};

// 模拟数据生成器（用于API失败时的降级）
const MockData = {
	// 生成模拟寄存点数据
	generateMockLockers(city, latitude, longitude, count = 3) {
		const lockers = [];
		const types = ['火车站', '地铁站', '商业中心', '机场', '景点'];
		
		for (let i = 0; i < count; i++) {
			const type = types[i % types.length];
			lockers.push({
				id: i + 1,
				name: `${city}${type}寄存点`,
				address: `${city}${type}附近`,
				longitude: longitude + (Math.random() - 0.5) * 0.01,
				latitude: latitude + (Math.random() - 0.5) * 0.01,
				large: Math.floor(Math.random() * 8) + 2,
				medium: Math.floor(Math.random() * 12) + 5,
				small: Math.floor(Math.random() * 15) + 8,
				status: 'available',
				distance: (Math.random() * 3 + 0.5).toFixed(1) + 'km',
				rating: (Math.random() * 1.5 + 3.5).toFixed(1),
				price: Math.floor(Math.random() * 5) + 5,
				openTime: i === 1 ? '24小时' : '06:00-23:00'
			});
		}
		
		return lockers;
	},
	
	// 生成模拟城市数据
	generateMockCities() {
		return [
			{ name: '郑州', code: 'zhengzhou', hot: true },
			{ name: '北京', code: 'beijing', hot: true },
			{ name: '上海', code: 'shanghai', hot: true },
			{ name: '广州', code: 'guangzhou', hot: true },
			{ name: '深圳', code: 'shenzhen', hot: true },
			{ name: '杭州', code: 'hangzhou', hot: false },
			{ name: '南京', code: 'nanjing', hot: false },
			{ name: '武汉', code: 'wuhan', hot: false },
			{ name: '成都', code: 'chengdu', hot: false },
			{ name: '西安', code: 'xian', hot: false }
		];
	},
	
	// 生成模拟订单数据
	generateMockOrders(count = 5) {
		const orders = [];
		const statuses = ['active', 'completed', 'expired'];
		
		for (let i = 0; i < count; i++) {
			orders.push({
				id: `DP${Date.now()}${i}`,
				lockerName: `寄存点${i + 1}`,
				lockerType: ['large', 'medium', 'small'][i % 3],
				startTime: new Date(Date.now() - Math.random() * 86400000).toISOString(),
				endTime: new Date(Date.now() + Math.random() * 86400000).toISOString(),
				status: statuses[i % statuses.length],
				price: Math.floor(Math.random() * 50) + 10
			});
		}
		
		return orders;
	}
};

// 导出API和配置
export {
	API_CONFIG,
	API,
	MockData,
	buildApiUrl,
	apiRequest
};

// 默认导出
export default API;