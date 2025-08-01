<template>
	<view class="page">
		<!-- 搜索栏 -->
		<view class="search-section">
			<view class="city-selector" @click="selectCity">
				<text class="city-name">{{currentCity}}</text>
				<text class="dropdown-icon">▼</text>
			</view>
			<view class="search-input-container">
				<input 
					class="search-input" 
					placeholder="搜索位置/地址/景点"
					v-model="searchKeyword"
					@input="onSearchInput"
					@confirm="performSearch"
					confirm-type="search"
					:focus="autoFocus"
				/>
				<view class="search-btn" @click="performSearch">
					<text class="search-icon">🔍</text>
				</view>
			</view>
		</view>
		
		<!-- 搜索状态提示 -->
		<view v-if="searchStatus" class="search-status">
			<text class="status-text">{{searchStatus}}</text>
		</view>
		
		<!-- 搜索结果或分类列表 -->
		<view class="content-section">
			<!-- 搜索结果 -->
			<view v-if="searchResults.length > 0" class="search-results">
				<view class="results-header">
					<text class="results-title">🏪 找到 {{searchResults.length}} 个寄存点</text>
					<text class="results-subtitle">点击查看详情</text>
				</view>
				
				<view class="result-item" 
					v-for="(item, index) in searchResults" 
					:key="index"
					@click="selectSearchResult(item)"
				>
					<view class="result-left">
						<view class="result-icon">🏪</view>
						<view class="result-info">
							<text class="result-name">{{item.name}}</text>
							<text class="result-address">📍 {{item.address}}</text>
							<view class="result-capacity">
								<text class="capacity-item">大{{item.large || 0}}</text>
								<text class="capacity-item">中{{item.medium || 0}}</text>
								<text class="capacity-item">小{{item.small || 0}}</text>
							</view>
						</view>
					</view>
					<view class="result-right">
						<text class="result-distance" v-if="item.distance">{{item.distance}}</text>
						<view class="result-status" :class="item.status || 'available'">
							<text class="status-text">{{(item.status === 'available' || !item.status) ? '营业中' : '暂停服务'}}</text>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 分类列表（无搜索时显示） -->
			<view v-else class="category-list">
				<view class="category-intro">
					<text class="intro-title">🔍 快速搜索</text>
					<text class="intro-desc">点击下方分类快速查找{{currentCity}}的寄存点</text>
					
					<!-- 调试按钮 -->
					<view class="debug-section" style="margin-top: 20rpx; text-align: center;">
						<button class="debug-btn" @click="testSearch" style="background: #007AFF; color: white; border: none; padding: 10rpx 20rpx; border-radius: 10rpx; font-size: 24rpx;">
							测试搜索功能
						</button>
					</view>
				</view>
				
				<!-- 景点分类 -->
				<view class="category-section">
					<view class="category-header">
						<view class="category-badge attractions">1</view>
						<text class="category-title">景点</text>
						<text class="category-count">{{attractions.length}}个</text>
					</view>
					<view class="category-items">
						<view class="category-item" 
							v-for="(item, index) in attractions" 
							:key="index"
							@click="searchLocation(item)"
						>
							<text class="item-icon">🎡</text>
							<text class="item-text">{{item}}</text>
						</view>
					</view>
				</view>
				
				<!-- 机场车站分类 -->
				<view class="category-section">
					<view class="category-header">
						<view class="category-badge stations">🚂</view>
						<text class="category-title">机场车站</text>
						<text class="category-count">{{stations.length}}个</text>
					</view>
					<view class="category-items">
						<view class="category-item" 
							v-for="(item, index) in stations" 
							:key="index"
							@click="searchLocation(item)"
						>
							<text class="item-icon">🚂</text>
							<text class="item-text">{{item}}</text>
						</view>
					</view>
				</view>
				
				<!-- 地铁站分类 -->
				<view class="category-section">
					<view class="category-header">
						<view class="category-badge subway">🚇</view>
						<text class="category-title">地铁站</text>
						<text class="category-count">{{subwayStations.length}}个</text>
					</view>
					<view class="category-items">
						<view class="category-item" 
							v-for="(item, index) in subwayStations" 
							:key="index"
							@click="searchLocation(item)"
						>
							<text class="item-icon">🚇</text>
							<text class="item-text">{{item}}</text>
						</view>
					</view>
				</view>
				
				<!-- 商圈分类 -->
				<view class="category-section">
					<view class="category-header">
						<view class="category-badge business">🏢</view>
						<text class="category-title">商圈</text>
						<text class="category-count">{{businessAreas.length}}个</text>
					</view>
					<view class="category-items">
						<view class="category-item" 
							v-for="(item, index) in businessAreas" 
							:key="index"
							@click="searchLocation(item)"
						>
							<text class="item-icon">🏢</text>
							<text class="item-text">{{item}}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 加载状态 -->
		<view v-if="isSearching" class="loading-overlay">
			<view class="loading-content">
				<view class="loading-spinner"></view>
				<text class="loading-text">正在搜索...</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				currentCity: '郑州',
				searchKeyword: '',
				searchResults: [],
				isSearching: false,
				autoFocus: true,
				searchStatus: '',
				searchTimer: null,
				
				// 分类数据（当前城市的）
				attractions: [
					'美景天城', '大卫城', '国贸360', '万特',
					'少林寺', '银基动物王国'
				],
				stations: [
					'郑州站', '郑州东站', '新郑国际机场'
				],
				subwayStations: [
					'二七广场', '陇海路地铁站', '航海广场站',
					'陇海路地铁站', '航海广场站'
				],
				businessAreas: [
					'熙地港购物中心', '二七广场', '正弘城',
					'二七广场', '正弘城'
				],
				
				// 各城市的分类数据配置
				cityCategories: {
					'郑州': {
						attractions: ['美景天城', '大卫城', '国贸360', '万特', '少林寺', '银基动物王国'],
						stations: ['郑州站', '郑州东站', '新郑国际机场'],
						subwayStations: ['二七广场', '陇海路地铁站', '航海广场站', '紫荆山站', '人民路站'],
						businessAreas: ['熙地港购物中心', '二七广场', '正弘城', '万达广场', '国贸360']
					},
					'北京': {
						attractions: ['天安门', '故宫', '颐和园', '天坛', '长城', '鸟巢'],
						stations: ['北京站', '北京西站', '北京南站', '首都国际机场', '大兴国际机场'],
						subwayStations: ['天安门东', '王府井', '西单', '国贸', '三里屯'],
						businessAreas: ['王府井', '西单', '国贸', '三里屯', '中关村']
					},
					'上海': {
						attractions: ['外滩', '东方明珠', '豫园', '城隍庙', '朱家角', '迪士尼'],
						stations: ['上海站', '上海虹桥站', '上海南站', '浦东国际机场', '虹桥机场'],
						subwayStations: ['人民广场', '南京路', '陆家嘴', '徐家汇', '静安寺'],
						businessAreas: ['南京路', '淮海路', '陆家嘴', '徐家汇', '静安寺']
					},
					'广州': {
						attractions: ['广州塔', '陈家祠', '沙面', '白云山', '长隆', '珠江夜游'],
						stations: ['广州站', '广州南站', '广州东站', '白云国际机场'],
						subwayStations: ['体育西路', '珠江新城', '北京路', '上下九', '天河城'],
						businessAreas: ['天河城', '北京路', '上下九', '珠江新城', '万菱汇']
					},
					'深圳': {
						attractions: ['世界之窗', '欢乐谷', '大梅沙', '莲花山', '华侨城', '东部华侨城'],
						stations: ['深圳站', '深圳北站', '深圳东站', '宝安国际机场'],
						subwayStations: ['罗湖', '国贸', '华强北', '车公庙', '世界之窗'],
						businessAreas: ['华强北', '东门', '海岸城', '万象城', '益田假日广场']
					},
					'杭州': {
						attractions: ['西湖', '灵隐寺', '雷峰塔', '千岛湖', '西溪湿地', '宋城'],
						stations: ['杭州站', '杭州东站', '杭州南站', '萧山国际机场'],
						subwayStations: ['西湖文化广场', '武林广场', '钱江新城', '滨江', '城站'],
						businessAreas: ['武林广场', '湖滨', '钱江新城', '西溪', '滨江']
					},
					'南京': {
						attractions: ['中山陵', '夫子庙', '玄武湖', '总统府', '明孝陵', '秦淮河'],
						stations: ['南京站', '南京南站', '禄口国际机场'],
						subwayStations: ['新街口', '夫子庙', '鼓楼', '玄武门', '中华门'],
						businessAreas: ['新街口', '夫子庙', '湖南路', '江宁万达', '仙林']
					},
					'武汉': {
						attractions: ['黄鹤楼', '东湖', '武汉大学', '户部巷', '长江大桥', '归元寺'],
						stations: ['武汉站', '汉口站', '武昌站', '天河国际机场'],
						subwayStations: ['江汉路', '中南路', '光谷广场', '街道口', '武昌火车站'],
						businessAreas: ['江汉路', '中南路', '光谷', '汉正街', '楚河汉街']
					},
					'成都': {
						attractions: ['宽窄巷子', '锦里', '武侯祠', '杜甫草堂', '青城山', '都江堰'],
						stations: ['成都站', '成都东站', '双流国际机场', '天府国际机场'],
						subwayStations: ['春熙路', '天府广场', '骡马市', '太古里', '金沙遗址'],
						businessAreas: ['春熙路', '太古里', '天府广场', '建设路', '金沙']
					},
					'西安': {
						attractions: ['兵马俑', '大雁塔', '钟楼', '古城墙', '华清池', '法门寺'],
						stations: ['西安站', '西安北站', '咸阳国际机场'],
						subwayStations: ['钟楼', '小寨', '大雁塔', '北大街', '纺织城'],
						businessAreas: ['钟楼', '小寨', '大雁塔', '高新区', '曲江']
					},
					'沈阳': {
						attractions: ['沈阳故宫', '张氏帅府', '北陵公园', '东陵公园', '沈阳植物园', '棋盘山'],
						stations: ['沈阳站', '沈阳北站', '沈阳南站', '桃仙国际机场'],
						subwayStations: ['太原街', '中街', '沈阳站', '青年大街', '奥体中心'],
						businessAreas: ['太原街', '中街', '铁西广场', '沈北新区', '浑南新区']
					},
					'沈阳市': {
						attractions: ['沈阳故宫', '张氏帅府', '北陵公园', '东陵公园', '沈阳植物园', '棋盘山'],
						stations: ['沈阳站', '沈阳北站', '沈阳南站', '桃仙国际机场'],
						subwayStations: ['太原街', '中街', '沈阳站', '青年大街', '奥体中心'],
						businessAreas: ['太原街', '中街', '铁西广场', '沈北新区', '浑南新区']
					}
				}
			}
		},
		
		onLoad(options) {
			console.log('🔍 搜索页面加载成功');
			console.log('🔍 页面参数:', options);
			
			// 显示页面加载成功的提示
			this.searchStatus = '页面加载完成';
			
			// 获取当前选择的城市
			try {
				const selectedCity = uni.getStorageSync('selectedCity');
				if (selectedCity) {
					this.currentCity = selectedCity.name;
					this.searchStatus = `正在${selectedCity.name}为您搜索寄存点`;
					console.log('✅ 获取到选择的城市:', selectedCity.name);
				} else {
					this.searchStatus = `正在${this.currentCity}为您搜索寄存点`;
					console.log('⚠️ 未找到选择的城市，使用默认城市:', this.currentCity);
				}
			} catch (error) {
				console.error('❌ 获取城市信息失败:', error);
				this.searchStatus = '获取城市信息失败';
			}
			
			// 初始化分类数据
			this.updateCategoryData();
			
			// 如果有传入的搜索关键词，直接搜索
			if (options.keyword) {
				this.searchKeyword = decodeURIComponent(options.keyword);
				this.autoFocus = false;
				setTimeout(() => {
					this.performSearch();
				}, 500);
			} else {
				// 没有关键词时显示欢迎信息
				setTimeout(() => {
					this.searchStatus = '';
				}, 2000);
			}
		},
		
		onShow() {
			// 页面显示时检查城市是否变化
			try {
				const selectedCity = uni.getStorageSync('selectedCity');
				console.log('🔍 搜索页面onShow检查城市:', {
					存储中的城市: selectedCity?.name,
					当前显示城市: this.currentCity
				});
				
				if (selectedCity && selectedCity.name !== this.currentCity) {
					console.log('🏙️ 搜索页面检测到城市变化:', {
						从: this.currentCity,
						到: selectedCity.name
					});
					
					// 更新当前城市
					this.currentCity = selectedCity.name;
					
					// 更新分类数据
					this.updateCategoryData();
					
					// 清空之前的搜索结果
					this.searchResults = [];
					this.searchStatus = '';
					
					// 如果有搜索关键词，重新搜索
					if (this.searchKeyword) {
						console.log('🔄 城市变化后重新搜索:', this.searchKeyword);
						setTimeout(() => {
							this.performSearch();
						}, 300);
					}
				} else if (selectedCity) {
					// 即使城市没有变化，也要确保分类数据是最新的
					this.updateCategoryData();
				}
			} catch (error) {
				console.error('搜索页面onShow处理城市变化时出错:', error);
			}
		},
		
		methods: {
			// 更新分类数据
			updateCategoryData() {
				console.log('🔄 更新搜索分类数据，当前城市:', this.currentCity);
				
				// 根据当前城市获取对应的分类数据
				const cityData = this.cityCategories[this.currentCity];
				
				if (cityData) {
					this.attractions = [...cityData.attractions];
					this.stations = [...cityData.stations];
					this.subwayStations = [...cityData.subwayStations];
					this.businessAreas = [...cityData.businessAreas];
					console.log('✅ 分类数据已更新:', {
						city: this.currentCity,
						attractions: this.attractions.length,
						stations: this.stations.length,
						subwayStations: this.subwayStations.length,
						businessAreas: this.businessAreas.length
					});
				} else {
					// 如果没有找到对应城市的分类数据，自动生成
					console.log('⚠️ 未找到城市分类数据配置，自动生成');
					const generatedData = this.generateCityCategories(this.currentCity);
					this.attractions = [...generatedData.attractions];
					this.stations = [...generatedData.stations];
					this.subwayStations = [...generatedData.subwayStations];
					this.businessAreas = [...generatedData.businessAreas];
					
					// 将生成的数据保存到配置中，避免重复生成
					this.cityCategories[this.currentCity] = generatedData;
					
					console.log('✅ 自动生成分类数据完成:', {
						city: this.currentCity,
						attractions: this.attractions.length,
						stations: this.stations.length,
						subwayStations: this.subwayStations.length,
						businessAreas: this.businessAreas.length
					});
				}
			},
			
			// 为新城市自动生成分类数据
			generateCityCategories(cityName) {
				console.log('🎯 为城市自动生成分类数据:', cityName);
				
				// 移除城市名称中的"市"、"省"等后缀，获取核心城市名
				const cleanCityName = cityName.replace(/[市省区县]/g, '');
				
				// 生成景点
				const attractions = [
					`${cleanCityName}博物馆`,
					`${cleanCityName}公园`,
					`${cleanCityName}广场`,
					`${cleanCityName}古城`,
					`${cleanCityName}风景区`,
					`${cleanCityName}文化中心`
				];
				
				// 生成车站
				const stations = [
					`${cleanCityName}站`,
					`${cleanCityName}东站`,
					`${cleanCityName}北站`,
					`${cleanCityName}机场`
				];
				
				// 生成地铁站
				const subwayStations = [
					`${cleanCityName}中心站`,
					`${cleanCityName}广场站`,
					`${cleanCityName}火车站`,
					`${cleanCityName}汽车站`,
					`${cleanCityName}体育馆站`
				];
				
				// 生成商圈
				const businessAreas = [
					`${cleanCityName}万达`,
					`${cleanCityName}购物中心`,
					`${cleanCityName}商业街`,
					`${cleanCityName}步行街`
				];
				
				return {
					attractions: attractions,
					stations: stations,
					subwayStations: subwayStations,
					businessAreas: businessAreas
				};
			},
			
			// 选择城市
			selectCity() {
				uni.navigateTo({
					url: '/pages/city-select/city-select?from=search'
				});
			},
			
			// 搜索输入变化
			onSearchInput(e) {
				this.searchKeyword = e.detail.value;
				
				// 清空之前的状态
				this.searchStatus = '';
				
				// 实时搜索（防抖）
				clearTimeout(this.searchTimer);
				if (this.searchKeyword.trim()) {
					this.searchStatus = `正在搜索"${this.searchKeyword.trim()}"...`;
					this.searchTimer = setTimeout(() => {
						this.performSearch();
					}, 800);
				} else {
					this.searchResults = [];
					this.searchStatus = '';
				}
			},
			
			// 执行搜索
			performSearch() {
				const keyword = this.searchKeyword.trim();
				if (!keyword) {
					uni.showToast({
						title: '请输入搜索关键词',
						icon: 'none'
					});
					return;
				}
				
				console.log('🔍 执行搜索:', keyword);
				
				// 清空之前的结果
				this.searchResults = [];
				this.isSearching = true;
				this.searchStatus = `正在搜索"${keyword}"...`;
				
				// 调用后端搜索接口
				this.callSearchAPI(keyword);
			},
			
			// 调用后端搜索API
			callSearchAPI(keyword) {
				console.log('📡 调用后端搜索接口:', keyword);
				
				const API_BASE_URL = 'http://localhost:8000';
				const apiUrl = `${API_BASE_URL}/api/cities/search`;
				
				// 构建查询参数
				const queryParams = new URLSearchParams({
					city_name: this.currentCity,
					keyword: keyword,
					page: '1',
					page_size: '20'
				});
				
				const fullUrl = `${apiUrl}?${queryParams.toString()}`;
				
				console.log('🔍 搜索请求URL:', fullUrl);
				
				uni.request({
					url: fullUrl,
					method: 'GET',
					header: {
						'Content-Type': 'application/json',
						'Accept': 'application/json'
					},
					timeout: 10000,
					success: (response) => {
						console.log('✅ 搜索接口响应:', response);
						this.handleSearchSuccess(response.data, keyword);
					},
					fail: (error) => {
						console.log('❌ 搜索接口失败:', error);
						this.handleSearchError(keyword, error);
					},
					complete: () => {
						this.isSearching = false;
					}
				});
			},
			
			// 处理搜索成功
			handleSearchSuccess(data, keyword) {
				console.log('🔄 处理搜索成功响应:', data);
				
				try {
					let results = [];
					
					// 处理不同的响应格式
					if (data && data.items && Array.isArray(data.items)) {
						results = data.items;
					} else if (data && Array.isArray(data)) {
						results = data;
					} else if (data && data.data && Array.isArray(data.data)) {
						results = data.data;
					}
					
					console.log('📊 解析到的结果数量:', results.length);
					
					if (results.length > 0) {
						// 转换数据格式
						this.searchResults = results.map((item, index) => ({
							id: item.id || index + 1,
							name: item.name || `寄存点${index + 1}`,
							address: item.address || item.location || '地址信息暂无',
							distance: item.distance ? `${item.distance.toFixed(1)}km` : '',
							large: parseInt(item.large_count || item.large || 0),
							medium: parseInt(item.medium_count || item.medium || 0),
							small: parseInt(item.small_count || item.small || 0),
							price: item.price || '2元/小时起',
							status: item.status || 'available'
						}));
						
						this.searchStatus = `在${this.currentCity}找到 ${this.searchResults.length} 个"${keyword}"相关的寄存点`;
						
						uni.showToast({
							title: `找到${this.searchResults.length}个寄存点`,
							icon: 'success',
							duration: 2000
						});
						
						console.log('✅ 搜索结果处理完成:', this.searchResults);
					} else {
						this.handleNoResults(keyword);
					}
				} catch (error) {
					console.error('❌ 处理搜索结果时出错:', error);
					this.handleSearchError(keyword, error);
				}
			},
			
			// 处理搜索失败
			handleSearchError(keyword, error) {
				console.log('❌ 搜索失败:', error);
				
				this.searchResults = [];
				this.searchStatus = '搜索失败，请检查网络连接或稍后重试';
				uni.showToast({
					title: '搜索失败',
					icon: 'error',
					duration: 2000
				});
			},
			
			// 处理无结果情况
			handleNoResults(keyword) {
				this.searchResults = [];
				this.searchStatus = `在${this.currentCity}没有找到"${keyword}"相关的寄存点`;
				
				uni.showToast({
					title: '未找到相关寄存点',
					icon: 'none',
					duration: 2000
				});
				
				// 显示建议
				setTimeout(() => {
					this.searchStatus = '试试搜索其他关键词，如"火车站"、"地铁站"、"商场"等';
				}, 2000);
			},
			
			// 搜索寄存点（已合并到performSearch方法中）
			searchLockers(keyword) {
				// 直接调用统一的搜索方法
				this.searchKeyword = keyword;
				this.performSearch();
			},

			
			// 处理搜索成功
			handleSearchSuccess(responseData, keyword) {
				console.log('✅ 真实后端搜索成功');
				console.log('原始响应数据:', responseData);
				
				try {
					// 尝试多种可能的数据结构
					let results = [];
					let totalCount = 0;
					
					// 处理不同的响应格式
					if (responseData.items && Array.isArray(responseData.items)) {
						results = responseData.items;
						totalCount = responseData.total || responseData.items.length;
					} else if (responseData.data && Array.isArray(responseData.data)) {
						results = responseData.data;
					} else if (responseData.results && Array.isArray(responseData.results)) {
						results = responseData.results;
					} else if (responseData.lockers && Array.isArray(responseData.lockers)) {
						results = responseData.lockers;
					} else if (responseData.locker_points && Array.isArray(responseData.locker_points)) {
						results = responseData.locker_points;
					} else if (Array.isArray(responseData)) {
						results = responseData;
					} else {
						console.log('⚠️ 未识别的响应数据格式，尝试提取所有可能的数组字段');
						// 尝试找到任何数组字段
						Object.keys(responseData).forEach(key => {
							if (Array.isArray(responseData[key]) && responseData[key].length > 0) {
								console.log(`发现数组字段: ${key}`, responseData[key]);
								if (results.length === 0) {
									results = responseData[key];
								}
							}
						});
					}
					
					totalCount = totalCount || responseData.total || responseData.total_count || responseData.count || results.length;
					
					console.log('解析后的搜索结果:', {
						keyword: keyword,
						resultsCount: results.length,
						totalCount: totalCount,
						firstResult: results[0] || null
					});
					
					// 清除搜索状态
					this.searchStatus = '';
					
					if (results && results.length > 0) {
						// 处理搜索结果数据
						this.searchResults = this.processSearchResults(results);
						
						console.log('✅ 真实数据处理完成:', this.searchResults.length, '个寄存点');
						
						// 更新搜索状态
						this.searchStatus = `在${this.currentCity}找到 ${this.searchResults.length} 个"${keyword}"相关的寄存点`;
						
						// 显示成功提示
						uni.showToast({
							title: `找到${this.searchResults.length}个寄存点`,
							icon: 'success',
							duration: 2000
						});
						
					} else {
						console.log('⚠️ 后端返回空结果');
						this.searchResults = [];
						this.searchStatus = `在${this.currentCity}未找到"${keyword}"相关的寄存点`;
						uni.showToast({
							title: '未找到相关寄存点',
							icon: 'none',
							duration: 2000
						});
					}
				} catch (error) {
					console.error('处理搜索结果时出错:', error);
					this.searchResults = [];
					this.searchStatus = '搜索结果处理失败';
					uni.showToast({
						title: '搜索结果处理失败',
						icon: 'error',
						duration: 2000
					});
				}
			},
			

			
			// 处理搜索结果数据
			processSearchResults(results) {
				console.log('🔄 处理真实后端搜索结果数据');
				console.log('原始结果数据:', results);
				
				if (!Array.isArray(results)) {
					console.error('搜索结果不是数组格式:', results);
					return [];
				}
				
				return results.map((item, index) => {
					console.log(`处理第${index + 1}个结果:`, item);
					
					try {
						// 处理多种可能的字段名
						const processedItem = {
							// ID字段
							id: item.id || item.locker_id || item.point_id || `search_${Date.now()}_${index + 1}`,
							
							// 名称字段
							name: item.name || item.locker_name || item.point_name || item.location_name || `寄存点${index + 1}`,
							
							// 地址字段
							address: item.address || item.location || item.location_address || item.full_address || '地址信息待完善',
							
							// 距离字段
							distance: this.formatDistance(item.distance || item.dist || 0),
							
							// 寄存柜容量字段
							large: parseInt(item.available_large || item.large_count || item.large || item.large_capacity || item.big_count || 0),
							medium: parseInt(item.available_medium || item.medium_count || item.medium || item.medium_capacity || item.mid_count || 0),
							small: parseInt(item.available_small || item.small_count || item.small || item.small_capacity || 0),
							
							// 状态字段
							status: this.mapItemStatus(item.status || item.state || item.available),
							
							// 其他字段
							rating: parseFloat(item.rating || item.score || 0),
							price: parseFloat(item.price || item.cost || 0),
							openTime: item.open_time || item.openTime || '24小时',
							mobile: item.mobile || item.phone || '',
							
							// 保留原始数据用于调试
							rawData: item
						};
						
						console.log(`处理后的第${index + 1}个结果:`, processedItem);
						return processedItem;
					} catch (error) {
						console.error(`处理第${index + 1}个搜索结果时出错:`, error, item);
						// 返回一个默认的结果项
						return {
							id: `error_${Date.now()}_${index}`,
							name: `寄存点${index + 1}`,
							address: '地址信息获取失败',
							distance: '0km',
							large: 0,
							medium: 0,
							small: 0,
							status: 'available',
							rating: 0,
							price: 0,
							rawData: item
						};
					}
				});
			},
			
			// 映射项目状态
			mapItemStatus(status) {
				if (typeof status === 'boolean') {
					return status ? 'available' : 'unavailable';
				} else if (typeof status === 'string') {
					const statusLower = status.toLowerCase();
					if (statusLower.includes('available') || statusLower.includes('open') || statusLower === '营业中') {
						return 'available';
					} else if (statusLower.includes('unavailable') || statusLower.includes('closed') || statusLower === '暂停服务') {
						return 'unavailable';
					}
				}
				return 'available'; // 默认可用
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
			
			// 点击分类项目搜索
			searchLocation(location) {
				console.log('🔍 点击搜索位置:', location);
				this.searchKeyword = location;
				this.searchStatus = `正在搜索"${location}"相关的寄存点...`;
				
				// 调用真实的搜索接口
				this.performSearch();
			},
			
			// 选择搜索结果
			selectSearchResult(result) {
				console.log('选择搜索结果:', result);
				
				// 跳转到寄存点详情页面，传递寄存点信息
				uni.navigateTo({
					url: `/pages/locker-detail/locker-detail?id=${result.id}&name=${encodeURIComponent(result.name)}&address=${encodeURIComponent(result.address)}`
				});
			},
			
			// 测试搜索功能
			testSearch() {
				console.log('🧪 开始测试搜索功能');
				
				// 显示测试开始提示
				uni.showToast({
					title: '测试后端搜索接口',
					icon: 'loading',
					duration: 1000
				});
				
				// 使用测试关键词调用真实的搜索接口
				this.searchKeyword = '火车站';
				this.performSearch();
			}
		}
	}
</script>

<style>
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

	/* 搜索栏 */
	.search-section {
		display: flex;
		align-items: center;
		padding: 30rpx;
		background: linear-gradient(135deg, 
			rgba(255, 255, 255, 0.95) 0%, 
			rgba(255, 255, 255, 0.85) 100%);
		backdrop-filter: blur(20rpx);
		border-bottom: 1rpx solid rgba(255, 255, 255, 0.2);
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
		position: sticky;
		top: 0;
		z-index: 100;
	}
	
	/* 搜索状态提示 */
	.search-status {
		padding: 25rpx 30rpx;
		background: linear-gradient(135deg, 
			rgba(102, 126, 234, 0.1) 0%, 
			rgba(118, 75, 162, 0.05) 100%);
		backdrop-filter: blur(10rpx);
		text-align: center;
		border-radius: 0 0 25rpx 25rpx;
		margin: 0 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(102, 126, 234, 0.15);
	}
	
	.status-text {
		font-size: 28rpx;
		color: #667eea;
		font-weight: 600;
		text-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
	}
	
	.city-selector {
		display: flex;
		align-items: center;
		padding: 18rpx 25rpx;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 50rpx;
		margin-right: 25rpx;
		min-width: 130rpx;
		box-shadow: 0 8rpx 25rpx rgba(102, 126, 234, 0.4);
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
		overflow: hidden;
	}
	
	.city-selector::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
		transition: left 0.6s ease;
	}
	
	.city-selector:active {
		transform: scale(0.95);
		box-shadow: 0 4rpx 15rpx rgba(102, 126, 234, 0.6);
	}
	
	.city-selector:active::before {
		left: 100%;
	}
	
	.city-name {
		font-size: 30rpx;
		color: #FFFFFF;
		margin-right: 10rpx;
		font-weight: 700;
		text-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.2);
	}
	
	.dropdown-icon {
		font-size: 22rpx;
		color: rgba(255, 255, 255, 0.9);
		transition: transform 0.3s ease;
	}
	
	.search-input-container {
		flex: 1;
		display: flex;
		align-items: center;
		background: transparent;
		backdrop-filter: blur(10rpx);
		border-radius: 50rpx;
		padding: 0 30rpx;
		border: 2rpx solid rgba(255, 255, 255, 0.3);
		box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.08);
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
		overflow: hidden;
	}
	
	.search-input-container::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(255, 255, 255, 0.1);
		opacity: 0;
		transition: opacity 0.3s ease;
	}
	
	.search-input-container:focus-within {
		border-color: rgba(255, 255, 255, 0.6);
		box-shadow: 0 12rpx 35rpx rgba(255, 255, 255, 0.15);
		transform: translateY(-2rpx);
	}
	
	.search-input-container:focus-within::before {
		opacity: 1;
	}
	
	.search-input {
		flex: 1;
		height: 80rpx;
		font-size: 30rpx;
		color: #FFFFFF;
		background: transparent;
		border: none;
		font-weight: 500;
	}
	
	.search-input::placeholder {
		color: rgba(255, 255, 255, 0.7);
	}
	
	.search-btn {
		width: 70rpx;
		height: 70rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 4rpx 15rpx rgba(102, 126, 234, 0.3);
		position: relative;
		overflow: hidden;
	}
	
	.search-btn::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
		transition: left 0.6s ease;
	}
	
	.search-btn:active {
		transform: scale(0.9);
		box-shadow: 0 2rpx 10rpx rgba(102, 126, 234, 0.5);
	}
	
	.search-btn:active::before {
		left: 100%;
	}
	
	.search-icon {
		font-size: 32rpx;
		color: #FFFFFF;
		text-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.2);
	}
	
	/* 内容区域 */
	.content-section {
		flex: 1;
		padding: 20rpx 0;
	}
	
	/* 搜索结果 */
	.search-results {
		margin: 30rpx;
	}
	
	.results-header {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 35rpx 40rpx;
		border-radius: 25rpx 25rpx 0 0;
		text-align: center;
		position: relative;
		overflow: hidden;
		box-shadow: 0 8rpx 25rpx rgba(102, 126, 234, 0.3);
	}
	
	.results-header::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(45deg, 
			rgba(255, 255, 255, 0.1) 0%, 
			transparent 50%, 
			rgba(255, 255, 255, 0.1) 100%);
		animation: shimmer 3s ease-in-out infinite;
	}
	
	@keyframes shimmer {
		0%, 100% { transform: translateX(-100%); }
		50% { transform: translateX(100%); }
	}
	
	.results-title {
		font-size: 36rpx;
		color: #FFFFFF;
		font-weight: 800;
		display: block;
		margin-bottom: 12rpx;
		text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
	}
	
	.results-subtitle {
		font-size: 26rpx;
		color: rgba(255, 255, 255, 0.9);
		font-weight: 500;
	}
	
	.result-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 35rpx;
		background: linear-gradient(135deg, 
			rgba(255, 255, 255, 0.95) 0%, 
			rgba(255, 255, 255, 0.85) 100%);
		backdrop-filter: blur(10rpx);
		border-bottom: 1rpx solid rgba(102, 126, 234, 0.1);
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
		overflow: hidden;
	}
	
	.result-item::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, 
			transparent, 
			rgba(102, 126, 234, 0.1), 
			transparent);
		transition: left 0.6s ease;
	}
	
	.result-item:last-child {
		border-bottom: none;
		border-radius: 0 0 25rpx 25rpx;
	}
	
	.result-item:active {
		background: linear-gradient(135deg, 
			rgba(102, 126, 234, 0.1) 0%, 
			rgba(118, 75, 162, 0.05) 100%);
		transform: scale(0.98) translateY(-2rpx);
		box-shadow: 0 8rpx 25rpx rgba(102, 126, 234, 0.2);
	}
	
	.result-item:active::before {
		left: 100%;
	}
	
	.result-left {
		display: flex;
		align-items: center;
		flex: 1;
	}
	
	.result-icon {
		font-size: 40rpx;
		margin-right: 25rpx;
		background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		filter: drop-shadow(0 2rpx 4rpx rgba(240, 147, 251, 0.3));
	}
	
	.result-info {
		flex: 1;
	}
	
	.result-name {
		font-size: 34rpx;
		color: #333333;
		font-weight: 800;
		display: block;
		margin-bottom: 15rpx;
		text-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
	}
	
	.result-address {
		font-size: 28rpx;
		color: #666666;
		display: block;
		margin-bottom: 15rpx;
		line-height: 1.5;
		font-weight: 500;
	}
	
	.result-capacity {
		display: flex;
		gap: 15rpx;
	}
	
	.capacity-item {
		font-size: 24rpx;
		color: #667eea;
		background: linear-gradient(135deg, 
			rgba(102, 126, 234, 0.15) 0%, 
			rgba(118, 75, 162, 0.1) 100%);
		padding: 8rpx 16rpx;
		border-radius: 20rpx;
		font-weight: 600;
		border: 1rpx solid rgba(102, 126, 234, 0.2);
		box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.1);
	}
	
	.result-right {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 8rpx;
	}
	
	.result-distance {
		font-size: 26rpx;
		color: #667eea;
		background: linear-gradient(135deg, 
			rgba(102, 126, 234, 0.15) 0%, 
			rgba(118, 75, 162, 0.1) 100%);
		padding: 10rpx 20rpx;
		border-radius: 25rpx;
		font-weight: 700;
		border: 1rpx solid rgba(102, 126, 234, 0.2);
		box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.15);
	}
	
	.result-status {
		padding: 10rpx 20rpx;
		border-radius: 25rpx;
		background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
		box-shadow: 0 4rpx 12rpx rgba(82, 196, 26, 0.3);
	}
	
	.result-status.unavailable {
		background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
		box-shadow: 0 4rpx 12rpx rgba(255, 77, 79, 0.3);
	}
	
	.result-status .status-text {
		font-size: 24rpx;
		color: #FFFFFF;
		font-weight: 700;
		text-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.2);
	}
	
	.result-status.unavailable .status-text {
		color: #FFFFFF;
	}
	
	/* 分类列表 */
	.category-list {
		padding: 30rpx;
	}
	
	.category-intro {
		background: linear-gradient(135deg, 
			rgba(255, 255, 255, 0.95) 0%, 
			rgba(255, 255, 255, 0.85) 100%);
		backdrop-filter: blur(20rpx);
		padding: 40rpx;
		border-radius: 30rpx;
		text-align: center;
		margin-bottom: 40rpx;
		box-shadow: 0 12rpx 35rpx rgba(0, 0, 0, 0.1);
		border: 1rpx solid rgba(255, 255, 255, 0.3);
		position: relative;
		overflow: hidden;
	}
	
	.category-intro::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(45deg, 
			rgba(102, 126, 234, 0.05) 0%, 
			rgba(118, 75, 162, 0.03) 50%, 
			rgba(240, 147, 251, 0.05) 100%);
		animation: pulse 4s ease-in-out infinite;
	}
	
	@keyframes pulse {
		0%, 100% { opacity: 0.5; }
		50% { opacity: 1; }
	}
	
	.intro-title {
		font-size: 36rpx;
		color: #333333;
		font-weight: 800;
		display: block;
		margin-bottom: 15rpx;
		text-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
		position: relative;
		z-index: 1;
	}
	
	.intro-desc {
		font-size: 28rpx;
		color: #666666;
		line-height: 1.6;
		font-weight: 500;
		position: relative;
		z-index: 1;
	}
	
	.category-section {
		background: linear-gradient(135deg, 
			rgba(255, 255, 255, 0.95) 0%, 
			rgba(255, 255, 255, 0.85) 100%);
		backdrop-filter: blur(20rpx);
		border-radius: 30rpx;
		padding: 35rpx;
		margin-bottom: 35rpx;
		box-shadow: 0 12rpx 35rpx rgba(0, 0, 0, 0.08);
		border: 1rpx solid rgba(102, 126, 234, 0.1);
		position: relative;
		overflow: hidden;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}
	
	.category-section::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, 
			rgba(102, 126, 234, 0.02) 0%, 
			rgba(118, 75, 162, 0.01) 50%, 
			rgba(240, 147, 251, 0.02) 100%);
		opacity: 0;
		transition: opacity 0.3s ease;
	}
	
	.category-section:hover::before {
		opacity: 1;
	}
	
	.category-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 25rpx;
	}
	
	.category-badge {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 26rpx;
		font-weight: 800;
		margin-right: 20rpx;
		box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.2);
		position: relative;
		overflow: hidden;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}
	
	.category-badge::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
		transition: left 0.6s ease;
	}
	
	.category-badge:active::before {
		left: 100%;
	}
	
	.category-badge.attractions {
		background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
		color: #FFFFFF;
	}
	
	.category-badge.stations {
		background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
		color: #FFFFFF;
		font-size: 22rpx;
	}
	
	.category-badge.subway {
		background: linear-gradient(135deg, #45b7d1 0%, #96c93d 100%);
		color: #FFFFFF;
		font-size: 22rpx;
	}
	
	.category-badge.business {
		background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
		color: #FFFFFF;
		font-size: 22rpx;
	}
	
	.category-title {
		font-size: 36rpx;
		color: #333333;
		font-weight: 800;
		flex: 1;
		text-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
	}
	
	.category-count {
		font-size: 26rpx;
		color: #667eea;
		background: linear-gradient(135deg, 
			rgba(102, 126, 234, 0.15) 0%, 
			rgba(118, 75, 162, 0.1) 100%);
		padding: 10rpx 20rpx;
		border-radius: 25rpx;
		font-weight: 700;
		border: 1rpx solid rgba(102, 126, 234, 0.2);
		box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.15);
	}
	
	.category-items {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
	}
	
	.category-item {
		display: flex;
		align-items: center;
		background: linear-gradient(135deg, 
			rgba(255, 255, 255, 0.9) 0%, 
			rgba(255, 255, 255, 0.7) 100%);
		backdrop-filter: blur(10rpx);
		padding: 20rpx 30rpx;
		border-radius: 50rpx;
		border: 2rpx solid rgba(102, 126, 234, 0.15);
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.08);
		position: relative;
		overflow: hidden;
	}
	
	.category-item::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, 
			transparent, 
			rgba(102, 126, 234, 0.2), 
			transparent);
		transition: left 0.6s ease;
	}
	
	.category-item:active {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-color: #667eea;
		transform: scale(0.95) translateY(-2rpx);
		box-shadow: 0 8rpx 25rpx rgba(102, 126, 234, 0.4);
	}
	
	.category-item:active::before {
		left: 100%;
	}
	
	.category-item:active .item-icon,
	.category-item:active .item-text {
		color: #FFFFFF;
		text-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.2);
	}
	
	.item-icon {
		font-size: 28rpx;
		margin-right: 12rpx;
		transition: all 0.4s ease;
		filter: drop-shadow(0 1rpx 3rpx rgba(0, 0, 0, 0.1));
	}
	
	.item-text {
		font-size: 30rpx;
		color: #333333;
		font-weight: 600;
		transition: all 0.4s ease;
	}
	
	/* 加载状态 */
	.loading-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(10rpx);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		animation: fadeIn 0.3s ease;
	}
	
	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}
	
	.loading-content {
		background: linear-gradient(135deg, 
			rgba(255, 255, 255, 0.95) 0%, 
			rgba(255, 255, 255, 0.85) 100%);
		backdrop-filter: blur(20rpx);
		padding: 60rpx;
		border-radius: 30rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.2);
		border: 1rpx solid rgba(255, 255, 255, 0.3);
		animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}
	
	@keyframes slideUp {
		from { 
			opacity: 0;
			transform: translateY(50rpx) scale(0.9);
		}
		to { 
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}
	
	.loading-spinner {
		width: 100rpx;
		height: 100rpx;
		border: 8rpx solid rgba(102, 126, 234, 0.2);
		border-top: 8rpx solid #667eea;
		border-radius: 50%;
		animation: spin 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
		margin-bottom: 40rpx;
		position: relative;
	}
	
	.loading-spinner::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 60rpx;
		height: 60rpx;
		border: 4rpx solid rgba(118, 75, 162, 0.3);
		border-top: 4rpx solid #764ba2;
		border-radius: 50%;
		transform: translate(-50%, -50%);
		animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite reverse;
	}
	
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
	
	.loading-text {
		font-size: 32rpx;
		color: #333333;
		font-weight: 700;
		text-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
		animation: pulse 2s ease-in-out infinite;
	}
	
	@keyframes pulse {
		0%, 100% { opacity: 0.8; }
		50% { opacity: 1; }
	}
</style>