// 全局API配置文件
// 确保所有API调用都使用正确的后端地址

// 强制使用正确的后端地址，避免任何缓存或配置问题
export const API_BASE_URL = 'http://localhost:8000';

// API端点配置
export const API_ENDPOINTS = {
    // 城市相关
    CITIES_LIST: '/api/cities',
    CITIES_HOT: '/api/cities/hot',
    CITIES_SEARCH: '/api/cities/search',
    
    // 附近寄存点相关
    NEARBY_CITY_LOCKER_POINTS: '/api/nearby/city/locker-points',
    NEARBY_LOCKER_POINTS: '/api/nearby/locker-points',
    NEARBY_CITY_SEARCH: '/api/nearby/city/search',
    NEARBY_MY_LOCATION: '/api/nearby/my-location/locker-points',
    
    // 寄存点详情
    DEPOSIT_LOCKER: '/getDepositLocker',
    
    // 健康检查
    HEALTH_CHECK: '/returntoken'
};

// 构建完整的API URL
export function buildApiUrl(endpoint, params = {}) {
    let url = API_BASE_URL + endpoint;
    
    // 添加查询参数
    if (Object.keys(params).length > 0) {
        const queryString = new URLSearchParams(params).toString();
        url += '?' + queryString;
    }
    
    console.log('🔍 构建API URL:', url);
    return url;
}

// 通用的API请求方法
export function makeApiRequest(endpoint, options = {}) {
    const {
        method = 'GET',
        data = {},
        params = {},
        timeout = 8000,
        ...otherOptions
    } = options;
    
    const url = buildApiUrl(endpoint, params);
    
    const requestOptions = {
        url,
        method,
        header: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',  // 强制不使用缓存
            ...otherOptions.header
        },
        timeout,
        ...otherOptions
    };
    
    if (method !== 'GET' && Object.keys(data).length > 0) {
        requestOptions.data = data;
    }
    
    console.log('📡 API请求配置:', requestOptions);
    
    return new Promise((resolve, reject) => {
        uni.request({
            ...requestOptions,
            success: (res) => {
                console.log('✅ API响应成功:', { url, status: res.statusCode, data: res.data });
                resolve(res);
            },
            fail: (err) => {
                console.error('❌ API请求失败:', { url, error: err });
                reject(err);
            }
        });
    });
}

// 预定义的API方法
export const API = {
    // 获取热门城市
    getHotCities: (limit = 10) => {
        return makeApiRequest(API_ENDPOINTS.CITIES_HOT, {
            params: { limit }
        });
    },
    
    // 获取城市列表
    getCities: (page = 1, pageSize = 50) => {
        return makeApiRequest(API_ENDPOINTS.CITIES_LIST, {
            params: { page, page_size: pageSize }
        });
    },
    
    // 搜索城市内的寄存点（用于热门地点）
    searchCityLockers: (cityName, limit = 4) => {
        return makeApiRequest(API_ENDPOINTS.NEARBY_CITY_SEARCH, {
            params: { city_name: cityName, limit }
        });
    },
    
    // 获取城市内附近的寄存点
    getNearbyLockersInCity: (cityName, longitude, latitude, radius = 10, limit = 10) => {
        return makeApiRequest(API_ENDPOINTS.NEARBY_CITY_LOCKER_POINTS, {
            params: { 
                city_name: cityName, 
                longitude, 
                latitude, 
                radius, 
                limit 
            }
        });
    },
    
    // 获取寄存点详情
    getLockerDetail: (lockerId) => {
        return makeApiRequest(API_ENDPOINTS.DEPOSIT_LOCKER, {
            params: { locker_id: lockerId }
        });
    },
    
    // 健康检查
    healthCheck: () => {
        return makeApiRequest(API_ENDPOINTS.HEALTH_CHECK);
    }
};

// 默认导出
export default {
    API_BASE_URL,
    API_ENDPOINTS,
    buildApiUrl,
    makeApiRequest,
    API
};