<template>
	<view class="page">
		<!-- 顶部导航栏 -->
		<view class="header">
			<view class="header-content">
				<view class="back-btn" @click="goBack">
					<text class="back-icon">←</text>
				</view>
				<text class="header-title">选择城市</text>
				<view class="location-btn" @click="getCurrentLocation">
					<text class="location-icon">📍</text>
				</view>
			</view>
		</view>
		
		<!-- 搜索框 -->
		<view class="search-section">
			<view class="search-container">
				<view class="search-box">
					<text class="search-icon">🔍</text>
					<input 
						class="search-input" 
						placeholder="搜索城市名称或拼音" 
						v-model="searchKeyword"
						@input="onSearchInput"
						@focus="onSearchFocus"
						@blur="onSearchBlur"
					/>
					<view class="clear-btn" v-if="searchKeyword" @click="clearSearch">
						<text class="clear-icon">✕</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 定位城市 -->
		<view class="location-section" v-if="locationCity && !searchKeyword">
			<view class="section-header">
				<text class="section-title">📍 当前定位</text>
				<text class="section-subtitle">基于您的位置推荐</text>
			</view>
			<view class="location-city-item" @click="selectCity(locationCity)">
				<view class="city-info">
					<text class="city-name">{{locationCity.name}}</text>
					<text class="city-desc">{{locationCity.description || '当前定位城市'}}</text>
				</view>
				<view class="city-action">
					<text class="action-text">选择</text>
					<text class="action-icon">→</text>
				</view>
			</view>
		</view>
		
		<!-- 当前选择 -->
		<view class="current-section" v-if="currentSelectedCity && !searchKeyword">
			<view class="section-header">
				<text class="section-title">✓ 当前选择</text>
				<text class="section-subtitle">您正在使用的城市</text>
			</view>
			<view class="current-city-item" @click="selectCity(currentSelectedCity)">
				<view class="city-info">
					<text class="city-name">{{currentSelectedCity.name}}</text>
					<text class="city-desc">{{getCityDescription(currentSelectedCity)}}</text>
				</view>
				<view class="city-status">
					<text class="status-text">已选择</text>
					<text class="status-icon">✓</text>
				</view>
			</view>
		</view>
		
		<!-- 热门城市 -->
		<view class="hot-section" v-if="!searchKeyword">
			<view class="section-header">
				<text class="section-title">🔥 热门城市</text>
				<text class="section-subtitle">{{hotCities.length}}个热门城市</text>
			</view>
			<view class="hot-cities-grid">
				<view 
					class="hot-city-item" 
					v-for="city in hotCities" 
					:key="city.code"
					@click="selectCity(city)"
					:class="{ 
						'selected': city.code === currentSelectedCity?.code,
						'has-lockers': city.lockerCount > 0
					}"
				>
					<text class="city-name">{{city.name}}</text>
					<text class="city-count" v-if="city.lockerCount">{{city.lockerCount}}个寄存点</text>
				</view>
			</view>
		</view>
		
		<!-- 热门景点分类 -->
		<view class="categories-section" v-if="false">
			<view class="section-header">
				<text class="section-title">🎯 {{currentSelectedCity.name}}热门分类</text>
				<text class="section-subtitle">快速查找寄存点</text>
			</view>
			
			<!-- 景点分类 -->
			<view class="category-group" v-if="currentCityCategories.attractions.length > 0">
				<view class="category-header">
					<view class="category-badge attractions">🎡</view>
					<text class="category-title">景点</text>
					<text class="category-count">{{currentCityCategories.attractions.length}}个</text>
				</view>
				<view class="category-items">
					<view 
						class="category-item" 
						v-for="(item, index) in currentCityCategories.attractions.slice(0, 6)" 
						:key="index"
						@click="searchInCurrentCity(item)"
					>
						<text class="item-icon">🎡</text>
						<text class="item-text">{{item}}</text>
					</view>
				</view>
			</view>
			
			<!-- 机场车站分类 -->
			<view class="category-group" v-if="currentCityCategories.stations.length > 0">
				<view class="category-header">
					<view class="category-badge stations">🚂</view>
					<text class="category-title">机场车站</text>
					<text class="category-count">{{currentCityCategories.stations.length}}个</text>
				</view>
				<view class="category-items">
					<view 
						class="category-item" 
						v-for="(item, index) in currentCityCategories.stations.slice(0, 3)" 
						:key="index"
						@click="searchInCurrentCity(item)"
					>
						<text class="item-icon">🚂</text>
						<text class="item-text">{{item}}</text>
					</view>
				</view>
			</view>
			
			<!-- 地铁站分类 -->
			<view class="category-group" v-if="currentCityCategories.subwayStations.length > 0">
				<view class="category-header">
					<view class="category-badge subway">🚇</view>
					<text class="category-title">地铁站</text>
					<text class="category-count">{{currentCityCategories.subwayStations.length}}个</text>
				</view>
				<view class="category-items">
					<view 
						class="category-item" 
						v-for="(item, index) in currentCityCategories.subwayStations.slice(0, 5)" 
						:key="index"
						@click="searchInCurrentCity(item)"
					>
						<text class="item-icon">🚇</text>
						<text class="item-text">{{item}}</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 搜索结果 -->
		<view class="search-results" v-if="searchKeyword">
			<view class="section-header">
				<text class="section-title">🔍 搜索结果</text>
				<text class="section-subtitle">找到{{filteredCities.length}}个城市</text>
			</view>
			<view class="search-list" v-if="filteredCities.length > 0">
				<view 
					class="search-result-item" 
					v-for="city in filteredCities" 
					:key="city.code"
					@click="selectCity(city)"
					:class="{ 'selected': city.code === currentSelectedCity?.code }"
				>
					<view class="city-info">
						<text class="city-name" v-html="highlightSearchKeyword(city.name)"></text>
						<text class="city-desc">{{getCityDescription(city)}}</text>
					</view>
					<view class="city-meta">
						<text class="locker-count" v-if="city.lockerCount">{{city.lockerCount}}个寄存点</text>
						<text class="select-icon">→</text>
					</view>
				</view>
			</view>
			<view class="empty-result" v-else>
				<text class="empty-icon">🔍</text>
				<text class="empty-text">未找到"{{searchKeyword}}"相关的城市</text>
				<text class="empty-hint">试试搜索其他城市名称或拼音</text>
			</view>
		</view>
		
		<!-- 全部城市（按字母分组） -->
		<view class="all-cities-section" v-if="!searchKeyword">
			<view class="section-header">
				<text class="section-title">🏙️ 全部城市</text>
				<text class="section-subtitle">按字母排序</text>
			</view>
			<view class="alphabet-index">
				<view 
					class="alphabet-item" 
					v-for="letter in alphabetList" 
					:key="letter"
					@click="scrollToLetter(letter)"
					:class="{ 'active': currentLetter === letter }"
				>
					<text class="alphabet-text">{{letter}}</text>
				</view>
			</view>
			<scroll-view class="cities-scroll" scroll-y="true" @scroll="onScroll">
				<view 
					class="letter-group" 
					v-for="group in groupedCities" 
					:key="group.letter"
					:id="'letter-' + group.letter"
				>
					<view class="letter-header">
						<text class="letter-title">{{group.letter}}</text>
					</view>
					<view class="cities-list">
						<view 
							class="city-list-item" 
							v-for="city in group.cities" 
							:key="city.code"
							@click="selectCity(city)"
							:class="{ 'selected': city.code === currentSelectedCity?.code }"
						>
							<view class="city-info">
								<text class="city-name">{{city.name}}</text>
								<text class="city-desc">{{getCityDescription(city)}}</text>
							</view>
							<view class="city-meta">
								<text class="locker-count" v-if="city.lockerCount">{{city.lockerCount}}个寄存点</text>
								<text class="select-icon">→</text>
							</view>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>
		
		<!-- 加载状态 -->
		<view class="loading-overlay" v-if="isLoading">
			<view class="loading-content">
				<view class="loading-spinner"></view>
				<text class="loading-text">{{loadingText}}</text>
			</view>
		</view>
	</view>
</template>
<script>
	export default {
		data() {
			return {
				searchKeyword: '',
				currentSelectedCity: null,
				locationCity: null,
				cities: [],
				hotCities: [],
				isLoading: false,
				loadingText: '正在加载城市列表...',
				currentLetter: 'A',
				searchTimer: null,
				fromPage: '', // 来源页面
				
				// 当前城市的分类数据
				currentCityCategories: {
					attractions: [],
					stations: [],
					subwayStations: [],
					businessAreas: []
				},
				
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
					'锦州': {
						attractions: ['锦州古城', '笔架山', '医巫闾山', '锦州世博园', '辽沈战役纪念馆', '北普陀山'],
						stations: ['锦州站', '锦州南站', '锦州机场'],
						subwayStations: ['锦州火车站', '市政府', '锦州医科大学', '渤海大学', '锦州港'],
						businessAreas: ['万达广场', '锦州商业城', '凌河夜市', '锦州步行街']
					},
					'锦州市': {
						attractions: ['锦州古城', '笔架山', '医巫闾山', '锦州世博园', '辽沈战役纪念馆', '北普陀山'],
						stations: ['锦州站', '锦州南站', '锦州机场'],
						subwayStations: ['锦州火车站', '市政府', '锦州医科大学', '渤海大学', '锦州港'],
						businessAreas: ['万达广场', '锦州商业城', '凌河夜市', '锦州步行街']
					}
				}
			}
		},
		
		computed: {
			// 搜索过滤的城市
			filteredCities() {
				if (!this.searchKeyword) {
					return this.cities;
				}
				
				const keyword = this.searchKeyword.toLowerCase();
				return this.cities.filter(city => {
					return city.name.toLowerCase().includes(keyword) ||
						   city.pinyin?.toLowerCase().includes(keyword) ||
						   city.code?.toLowerCase().includes(keyword);
				});
			},
			
			// 按字母分组的城市
			groupedCities() {
				const groups = {};
				
				this.cities.forEach(city => {
					const firstLetter = city.firstLetter || city.name.charAt(0).toUpperCase();
					if (!groups[firstLetter]) {
						groups[firstLetter] = [];
					}
					groups[firstLetter].push(city);
				});
				
				// 转换为数组并排序
				return Object.keys(groups)
					.sort()
					.map(letter => ({
						letter,
						cities: groups[letter].sort((a, b) => a.name.localeCompare(b.name))
					}));
			},
			
			// 字母索引列表
			alphabetList() {
				return this.groupedCities.map(group => group.letter);
			}
		},
		
		onLoad(options) {
			console.log('城市选择页面加载', options);
			this.fromPage = options.from || '';
			this.loadCurrentCity();
			this.loadCities();
			this.getCurrentLocation();
			// 延迟更新分类数据，确保当前城市已加载
			setTimeout(() => {
				this.updateCityCategories();
			}, 100);
		},
		
		onShow() {
			// 页面显示时重新检查当前城市并更新分类数据
			this.loadCurrentCity();
			setTimeout(() => {
				this.updateCityCategories();
			}, 100);
		},
		
		methods: {
			// 返回上一页
			goBack() {
				uni.navigateBack();
			},
			
			// 搜索输入处理
			onSearchInput() {
				// 防抖处理
				clearTimeout(this.searchTimer);
				this.searchTimer = setTimeout(() => {
					console.log('搜索关键词:', this.searchKeyword);
				}, 300);
			},
			
			// 搜索框获得焦点
			onSearchFocus() {
				console.log('搜索框获得焦点');
			},
			
			// 搜索框失去焦点
			onSearchBlur() {
				console.log('搜索框失去焦点');
			},
			
			// 清除搜索
			clearSearch() {
				this.searchKeyword = '';
			},
			
			// 高亮搜索关键词
			highlightSearchKeyword(text) {
				if (!this.searchKeyword) return text;
				
				const keyword = this.searchKeyword;
				const regex = new RegExp(`(${keyword})`, 'gi');
				return text.replace(regex, '<span style="color: #007AFF; background: #E3F2FD;">$1</span>');
			},
			
			// 获取当前位置
			getCurrentLocation() {
				console.log('🌍 获取当前位置');
				this.loadingText = '正在获取位置信息...';
				
				// 模拟定位（实际项目中应该使用真实的定位API）
				setTimeout(() => {
					this.locationCity = {
						id: 'location_001',
						name: '郑州',
						code: 'zhengzhou',
						description: '根据您的位置自动识别',
						coordinates: {
							longitude: 113.625368,
							latitude: 34.746611
						},
						lockerCount: 156
					};
					console.log('✅ 定位成功:', this.locationCity);
				}, 1000);
			},
			
			// 加载当前选择的城市
			loadCurrentCity() {
				try {
					const selectedCity = uni.getStorageSync('selectedCity');
					if (selectedCity) {
						this.currentSelectedCity = selectedCity;
						console.log('当前选择的城市:', selectedCity);
						// 立即更新分类数据
						setTimeout(() => {
							this.updateCityCategories();
						}, 50);
					}
				} catch (e) {
					console.error('获取当前城市失败:', e);
				}
			},
			
			// 加载城市列表
			async loadCities() {
				this.isLoading = true;
				this.loadingText = '正在从数据库加载城市列表...';
				
				try {
					// 优先从后端数据库获取真实数据
					const cities = await this.getCitiesFromAPI();
					this.cities = cities;
					this.hotCities = this.getHotCities(cities);
					
					console.log('✅ 从数据库加载城市列表成功:', cities.length, '个城市');
					
					// 显示成功提示
					if (cities.length > 0) {
						uni.showToast({
							title: `已加载${cities.length}个城市`,
							icon: 'success',
							duration: 1500
						});
					}
				} catch (error) {
					console.error('从数据库获取城市列表失败:', error);
					
					// 显示友好的错误提示
					if (error.message.includes('认证')) {
						console.log('🔄 API需要认证，请确保后端服务已重启');
						uni.showToast({
							title: '连接服务器中...',
							icon: 'loading',
							duration: 2000
						});
					} else {
						uni.showToast({
							title: '网络连接失败，使用离线数据',
							icon: 'none',
							duration: 2000
						});
					}
					
					// 使用默认城市列表作为后备
					const defaultCities = this.getDefaultCities();
					this.cities = defaultCities;
					this.hotCities = this.getHotCities(defaultCities);
					console.log('⚠️ 使用后备城市列表:', defaultCities.length, '个城市');
				} finally {
					this.isLoading = false;
				}
			},
			
			// 调用后端API获取城市列表
			getCitiesFromAPI() {
				return new Promise((resolve, reject) => {
					// 请求更多数据：页码1，每页50条
					const apiUrl = 'http://localhost:8000/api/cities?page=1&page_size=50';
					
					console.log('📡 调用后端城市列表接口:', apiUrl);
					
					uni.request({
						url: apiUrl,
						method: 'GET',
						header: {
							'Content-Type': 'application/json',
							'Accept': 'application/json'
						},
						timeout: 10000, // 增加超时时间
						success: (res) => {
							console.log('=== 后端城市列表接口响应 ===');
							console.log('HTTP状态码:', res.statusCode);
							console.log('响应数据:', res.data);
							
							if (res.statusCode === 200 && res.data) {
								// 处理后端返回的城市数据
								const processedCities = this.processBackendCities(res.data);
								console.log('✅ 处理后的城市数据:', processedCities.length, '个城市');
								resolve(processedCities);
							} else if (res.statusCode === 401) {
								console.log('⚠️ API需要认证，后端服务可能需要重启以应用白名单更改');
								reject(new Error('API需要认证，请重启后端服务'));
							} else {
								console.log('⚠️ API返回非200状态码，使用默认数据');
								reject(new Error(`API请求失败: ${res.statusCode}`));
							}
						},
						fail: (error) => {
							console.log('⚠️ 后端城市列表API调用失败:', error);
							console.log('错误详情:', {
								errMsg: error.errMsg,
								statusCode: error.statusCode,
								data: error.data
							});
							reject(error);
						}
					});
				});
			},
			
			// 处理后端返回的城市数据
			processBackendCities(backendData) {
				console.log('🔄 处理后端城市数据');
				console.log('原始后端数据:', backendData);
				
				let citiesArray = [];
				
				// 处理不同的响应格式
				if (backendData.data && Array.isArray(backendData.data)) {
					citiesArray = backendData.data;
				} else if (backendData.cities && Array.isArray(backendData.cities)) {
					citiesArray = backendData.cities;
				} else if (backendData.list && Array.isArray(backendData.list)) {
					citiesArray = backendData.list;
				} else if (Array.isArray(backendData)) {
					citiesArray = backendData;
				} else {
					console.log('⚠️ 未识别的响应数据格式，尝试提取所有可能的数组字段');
					// 尝试找到任何数组字段
					Object.keys(backendData).forEach(key => {
						if (Array.isArray(backendData[key]) && backendData[key].length > 0) {
							console.log(`发现数组字段: ${key}`, backendData[key]);
							if (citiesArray.length === 0) {
								citiesArray = backendData[key];
							}
						}
					});
				}
				
				if (!Array.isArray(citiesArray) || citiesArray.length === 0) {
					console.log('⚠️ 无有效城市数据，返回空数组');
					return [];
				}
				
				// 格式化城市数据
				return citiesArray.map((item, index) => {
					console.log(`处理第${index + 1}个城市:`, item);
					
					// 处理多种可能的字段名
					const processedCity = {
						// ID字段
						id: item.id || item.city_id || item.cityId || `city_${index + 1}`,
						
						// 名称字段
						name: item.name || item.city_name || item.cityName || `城市${index + 1}`,
						
						// 代码字段
						code: item.code || item.city_code || item.cityCode || this.generateCityCode(item.name || `city${index + 1}`),
						
						// 拼音字段
						pinyin: item.pinyin || item.py || this.generatePinyin(item.name || ''),
						
						// 首字母
						firstLetter: item.first_letter || item.firstLetter || this.getFirstLetter(item.name || ''),
						
						// 寄存点数量
						lockerCount: parseInt(item.locker_count || item.lockerCount || item.point_count || item.pointCount || 0),
						
						// 城市等级
						level: parseInt(item.level || item.city_level || item.cityLevel || 4),
						
						// 描述信息
						description: item.description || item.desc || item.remark || this.generateCityDescription(item.name || ''),
						
						// 坐标信息
						coordinates: {
							longitude: parseFloat(item.longitude || item.lng || item.lon || 116.4074),
							latitude: parseFloat(item.latitude || item.lat || 39.9042)
						},
						
						// 状态
						status: item.status || item.state || 'active',
						
						// 创建时间
						createdAt: item.created_at || item.createdAt || new Date().toISOString(),
						
						// 保留原始数据用于调试
						rawData: item
					};
					
					console.log(`处理后的第${index + 1}个城市:`, processedCity);
					return processedCity;
				}).filter(city => city.status === 'active'); // 只返回激活状态的城市
			},
			
			// 生成城市代码
			generateCityCode(cityName) {
				// 简单的拼音转换（实际项目中应该使用专业的拼音库）
				const pinyinMap = {
					'北京': 'beijing', '上海': 'shanghai', '广州': 'guangzhou', '深圳': 'shenzhen',
					'杭州': 'hangzhou', '南京': 'nanjing', '成都': 'chengdu', '武汉': 'wuhan',
					'西安': 'xian', '重庆': 'chongqing', '天津': 'tianjin', '苏州': 'suzhou',
					'郑州': 'zhengzhou', '长沙': 'changsha', '青岛': 'qingdao', '大连': 'dalian'
				};
				
				return pinyinMap[cityName] || cityName.toLowerCase().replace(/\s+/g, '');
			},
			
			// 生成拼音
			generatePinyin(cityName) {
				// 简单的拼音转换
				return this.generateCityCode(cityName);
			},
			
			// 获取首字母
			getFirstLetter(cityName) {
				if (!cityName) return 'A';
				
				// 中文首字母映射
				const firstLetterMap = {
					'北': 'B', '上': 'S', '广': 'G', '深': 'S', '杭': 'H', '南': 'N',
					'成': 'C', '武': 'W', '西': 'X', '重': 'C', '天': 'T', '苏': 'S',
					'郑': 'Z', '长': 'C', '青': 'Q', '大': 'D', '宁': 'N', '厦': 'X',
					'济': 'J', '哈': 'H', '昆': 'K', '福': 'F', '石': 'S', '太': 'T'
				};
				
				const firstChar = cityName.charAt(0);
				return firstLetterMap[firstChar] || firstChar.toUpperCase();
			},
			
			// 生成城市描述
			generateCityDescription(cityName) {
				const descriptions = {
					'北京': '首都，政治文化中心',
					'上海': '经济金融中心',
					'广州': '华南地区中心城市',
					'深圳': '科技创新之城',
					'杭州': '电商之都，西湖美景',
					'南京': '六朝古都，教育名城',
					'成都': '天府之国，美食之都',
					'武汉': '九省通衢，教育重镇',
					'西安': '千年古都，丝路起点',
					'重庆': '山城火锅，网红之都',
					'天津': '海河之滨，近代名城',
					'苏州': '园林之城，丝绸之府',
					'郑州': '中原腹地，交通枢纽'
				};
				
				return descriptions[cityName] || '美丽的城市';
			},
			
			// 获取热门城市
			getHotCities(cities) {
				// 根据寄存点数量和城市等级筛选热门城市
				const hotCityNames = [
					'北京', '上海', '广州', '深圳', '杭州', '南京', 
					'成都', '武汉', '西安', '郑州', '重庆', '天津',
					'苏州', '长沙', '青岛', '大连', '宁波', '厦门'
				];
				
				return cities
					.filter(city => hotCityNames.includes(city.name))
					.sort((a, b) => (b.lockerCount || 0) - (a.lockerCount || 0))
					.slice(0, 18);
			},
			
			// 获取默认城市列表（仅作为后备数据）
			getDefaultCities() {
				return [
					// 主要城市作为后备数据
					{ id: 1, name: '北京', code: 'beijing', pinyin: 'beijing', firstLetter: 'B', lockerCount: 0, level: 1, description: '首都，政治文化中心' },
					{ id: 2, name: '上海', code: 'shanghai', pinyin: 'shanghai', firstLetter: 'S', lockerCount: 0, level: 1, description: '经济金融中心' },
					{ id: 3, name: '广州', code: 'guangzhou', pinyin: 'guangzhou', firstLetter: 'G', lockerCount: 0, level: 1, description: '华南地区中心城市' },
					{ id: 4, name: '深圳', code: 'shenzhen', pinyin: 'shenzhen', firstLetter: 'S', lockerCount: 0, level: 1, description: '科技创新之城' },
					{ id: 5, name: '杭州', code: 'hangzhou', pinyin: 'hangzhou', firstLetter: 'H', lockerCount: 0, level: 2, description: '电商之都，西湖美景' },
					{ id: 6, name: '南京', code: 'nanjing', pinyin: 'nanjing', firstLetter: 'N', lockerCount: 0, level: 2, description: '六朝古都，教育名城' },
					{ id: 7, name: '成都', code: 'chengdu', pinyin: 'chengdu', firstLetter: 'C', lockerCount: 0, level: 2, description: '天府之国，美食之都' },
					{ id: 8, name: '武汉', code: 'wuhan', pinyin: 'wuhan', firstLetter: 'W', lockerCount: 0, level: 2, description: '九省通衢，教育重镇' },
					{ id: 9, name: '西安', code: 'xian', pinyin: 'xian', firstLetter: 'X', lockerCount: 0, level: 2, description: '千年古都，丝路起点' },
					{ id: 10, name: '郑州', code: 'zhengzhou', pinyin: 'zhengzhou', firstLetter: 'Z', lockerCount: 0, level: 3, description: '中原腹地，交通枢纽' }
				].map(city => ({
					...city,
					coordinates: this.getCityCoordinates(city.code),
					status: 'active'
				}));
			},
			
			// 获取城市坐标（模拟数据）
			getCityCoordinates(cityCode) {
				const coordinates = {
					// 一线城市
					'beijing': { longitude: 116.4074, latitude: 39.9042 },
					'shanghai': { longitude: 121.4737, latitude: 31.2304 },
					'guangzhou': { longitude: 113.2644, latitude: 23.1291 },
					'shenzhen': { longitude: 114.0579, latitude: 22.5431 },
					
					// 新一线城市
					'hangzhou': { longitude: 120.1551, latitude: 30.2741 },
					'nanjing': { longitude: 118.7969, latitude: 32.0603 },
					'chengdu': { longitude: 104.0668, latitude: 30.5728 },
					'wuhan': { longitude: 114.3054, latitude: 30.5931 },
					'xian': { longitude: 108.9402, latitude: 34.3416 },
					'chongqing': { longitude: 106.5516, latitude: 29.5630 },
					'tianjin': { longitude: 117.1901, latitude: 39.1235 },
					'suzhou': { longitude: 120.6197, latitude: 31.3117 },
					
					// 二线城市
					'zhengzhou': { longitude: 113.6253, latitude: 34.7466 },
					'changsha': { longitude: 112.9388, latitude: 28.2282 },
					'qingdao': { longitude: 120.3826, latitude: 36.0671 },
					'dalian': { longitude: 121.6147, latitude: 38.9140 },
					'ningbo': { longitude: 121.5440, latitude: 29.8683 },
					'xiamen': { longitude: 118.1689, latitude: 24.4797 },
					'jinan': { longitude: 117.0009, latitude: 36.6758 },
					'haerbin': { longitude: 126.6424, latitude: 45.7560 },
					'kunming': { longitude: 102.8329, latitude: 24.8801 },
					'fuzhou': { longitude: 119.3063, latitude: 26.0745 },
					'shijiazhuang': { longitude: 114.5149, latitude: 38.0428 },
					'taiyuan': { longitude: 112.5489, latitude: 37.8706 },
					'changchun': { longitude: 125.3245, latitude: 43.8171 },
					
					// 三线城市
					'shenyang': { longitude: 123.4315, latitude: 41.8057 },
					'wuxi': { longitude: 120.3019, latitude: 31.5747 },
					'wenzhou': { longitude: 120.6994, latitude: 27.9944 },
					'hefei': { longitude: 117.2272, latitude: 31.8206 },
					'nanchang': { longitude: 115.8921, latitude: 28.6765 },
					'guiyang': { longitude: 106.7135, latitude: 26.5783 },
					'nanning': { longitude: 108.3669, latitude: 22.8170 },
					'haikou': { longitude: 110.3312, latitude: 20.0311 },
					'lanzhou': { longitude: 103.8236, latitude: 36.0581 },
					'yinchuan': { longitude: 106.2309, latitude: 38.4872 },
					'xining': { longitude: 101.7782, latitude: 36.6171 },
					'wulumuqi': { longitude: 87.6177, latitude: 43.7928 },
					'lasa': { longitude: 91.1322, latitude: 29.6544 },
					'huhehaote': { longitude: 111.7519, latitude: 40.8427 },
					'zhuhai': { longitude: 113.5767, latitude: 22.2707 },
					'shantou': { longitude: 116.7081, latitude: 23.3839 },
					'foshan': { longitude: 113.1220, latitude: 23.0291 },
					'dongguan': { longitude: 113.7518, latitude: 23.0489 },
					'zhongshan': { longitude: 113.3823, latitude: 22.5211 },
					'huizhou': { longitude: 114.4152, latitude: 23.1115 },
					'jiangmen': { longitude: 113.0946, latitude: 22.5901 },
					'zhanjiang': { longitude: 110.3594, latitude: 21.2707 },
					'maoming': { longitude: 110.9255, latitude: 21.6687 },
					'zhaoqing': { longitude: 112.4444, latitude: 23.0786 },
					'qingyuan': { longitude: 113.0510, latitude: 23.7016 }
				};
				
				return coordinates[cityCode] || { longitude: 116.4074, latitude: 39.9042 };
			},
			
			// 获取城市描述
			getCityDescription(city) {
				if (city.description) return city.description;
				if (city.lockerCount) return `${city.lockerCount}个寄存点`;
				return '暂无寄存点信息';
			},
			
			// 滚动到指定字母
			scrollToLetter(letter) {
				this.currentLetter = letter;
				// 实现滚动到指定字母的逻辑
				console.log('滚动到字母:', letter);
			},
			
			// 滚动事件处理
			onScroll(e) {
				// 根据滚动位置更新当前字母
				console.log('滚动事件:', e);
			},
			
			// 更新城市分类数据
			updateCityCategories() {
				// 重新从存储中获取当前选择的城市
				let currentCityName = '郑州'; // 默认值
				
				try {
					const selectedCity = uni.getStorageSync('selectedCity');
					if (selectedCity && selectedCity.name) {
						currentCityName = selectedCity.name;
						this.currentSelectedCity = selectedCity; // 同步更新当前选择的城市
					} else if (this.currentSelectedCity && this.currentSelectedCity.name) {
						currentCityName = this.currentSelectedCity.name;
					}
				} catch (e) {
					console.error('获取当前城市失败:', e);
				}
				
				console.log('🔄 更新城市分类数据，当前城市:', currentCityName);
				
				// 根据当前城市获取对应的分类数据
				const cityData = this.cityCategories[currentCityName];
				
				if (cityData) {
					this.currentCityCategories = {
						attractions: [...cityData.attractions],
						stations: [...cityData.stations],
						subwayStations: [...cityData.subwayStations],
						businessAreas: [...cityData.businessAreas]
					};
					console.log('✅ 城市分类数据已更新:', {
						city: currentCityName,
						attractions: this.currentCityCategories.attractions.length,
						stations: this.currentCityCategories.stations.length,
						subwayStations: this.currentCityCategories.subwayStations.length,
						businessAreas: this.currentCityCategories.businessAreas.length
					});
				} else {
					// 如果没有找到对应城市的分类数据，自动生成
					console.log('⚠️ 未找到城市分类数据配置，自动生成');
					this.currentCityCategories = this.generateCityCategories(currentCityName);
					console.log('✅ 自动生成城市分类数据:', this.currentCityCategories);
				}
			},
			
			// 为新城市自动生成分类数据
			generateCityCategories(cityName) {
				console.log('🎯 为城市自动生成分类数据:', cityName);
				
				// 移除城市名称中的"市"、"省"等后缀，获取核心城市名
				const cleanCityName = cityName.replace(/[市省区县]/g, '');
				
				// 生成景点
				const attractions = [
					`${cleanCityName}公园`,
					`${cleanCityName}广场`,
					`${cleanCityName}博物馆`,
					`${cleanCityName}古城`,
					`${cleanCityName}风景区`,
					`${cleanCityName}文化中心`
				];
				
				// 生成车站
				const stations = [
					`${cleanCityName}站`,
					`${cleanCityName}东站`,
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
				
				const generatedCategories = {
					attractions: attractions,
					stations: stations,
					subwayStations: subwayStations,
					businessAreas: businessAreas
				};
				
				// 将生成的数据保存到配置中，避免重复生成
				this.cityCategories[cityName] = generatedCategories;
				
				return generatedCategories;
			},
			
			// 在当前城市搜索指定位置
			searchInCurrentCity(location) {
				console.log('在当前城市搜索:', location);
				
				try {
					if (!this.currentSelectedCity) {
						uni.showToast({
							title: '请先选择城市',
							icon: 'none'
						});
						return;
					}
					
					// 跳转到搜索页面，传递搜索关键词
					uni.navigateTo({
						url: `/pages/search/search?keyword=${encodeURIComponent(location)}`
					});
					
				} catch (error) {
					console.error('搜索时发生错误:', error);
					uni.showToast({
						title: '搜索失败',
						icon: 'none'
					});
				}
			},
			
			// 选择城市
			selectCity(city) {
				console.log('选择城市:', city);
				
				try {
					// 添加选择时间戳
					const selectedCity = {
						...city,
						selectedAt: new Date().toISOString()
					};
					
					// 保存选中的城市到本地存储
					uni.setStorageSync('selectedCity', selectedCity);
					
					// 更新当前选择
					this.currentSelectedCity = selectedCity;
					
					// 更新城市分类数据
					this.updateCityCategories();
					
					// 显示选择成功提示
					uni.showToast({
						title: `已选择${city.name}`,
						icon: 'success',
						duration: 1500
					});
					
					// 延迟返回上一页，让用户看到提示
					setTimeout(() => {
						uni.navigateBack();
					}, 1500);
					
				} catch (error) {
					console.error('选择城市时发生错误:', error);
					uni.showToast({
						title: '选择城市失败',
						icon: 'none'
					});
				}
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
	
	/* 顶部导航栏 */
	.header {
		background: linear-gradient(135deg, 
			rgba(255, 255, 255, 0.95) 0%, 
			rgba(255, 255, 255, 0.85) 100%);
		backdrop-filter: blur(20rpx);
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
	}
	
	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 30rpx;
		height: 88rpx;
	}
	
	.back-btn {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: rgba(0, 122, 255, 0.1);
		transition: all 0.3s ease;
	}
	
	.back-btn:active {
		background: rgba(0, 122, 255, 0.2);
		transform: scale(0.9);
	}
	
	.back-icon {
		font-size: 32rpx;
		color: #007AFF;
		font-weight: bold;
	}
	
	.header-title {
		font-size: 36rpx;
		color: #333333;
		font-weight: 700;
	}
	
	.location-btn {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: rgba(255, 107, 53, 0.1);
		transition: all 0.3s ease;
	}
	
	.location-btn:active {
		background: rgba(255, 107, 53, 0.2);
		transform: scale(0.9);
	}
	
	.location-icon {
		font-size: 28rpx;
	}
	
	/* 搜索框 */
	.search-section {
		padding: 30rpx;
		background: linear-gradient(135deg, #FFFFFF 0%, #FAFBFF 100%);
	}
	
	.search-container {
		position: relative;
	}
	
	.search-box {
		display: flex;
		align-items: center;
		background: linear-gradient(135deg, #F8FAFF 0%, #F0F4FF 100%);
		border-radius: 50rpx;
		padding: 0 30rpx;
		border: 2rpx solid rgba(0, 122, 255, 0.1);
		transition: all 0.3s ease;
	}
	
	.search-box:focus-within {
		border-color: #007AFF;
		box-shadow: 0 6rpx 20rpx rgba(0, 122, 255, 0.15);
	}
	
	.search-icon {
		font-size: 28rpx;
		color: #007AFF;
		margin-right: 20rpx;
	}
	
	.search-input {
		flex: 1;
		height: 80rpx;
		font-size: 30rpx;
		color: #333333;
		background: transparent;
		border: none;
	}
	
	.clear-btn {
		width: 40rpx;
		height: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.1);
		margin-left: 10rpx;
	}
	
	.clear-icon {
		font-size: 24rpx;
		color: #666666;
	}
	
	/* 通用区域样式 */
	.location-section,
	.current-section,
	.hot-section,
	.search-results,
	.all-cities-section {
		margin: 30rpx;
		background: linear-gradient(135deg, #FFFFFF 0%, #FAFBFF 100%);
		border-radius: 20rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
		border: 1rpx solid rgba(0, 122, 255, 0.05);
		overflow: hidden;
	}
	
	.section-header {
		padding: 30rpx;
		border-bottom: 1rpx solid #F0F0F0;
		background: linear-gradient(135deg, #FAFBFF 0%, #F8FAFF 100%);
	}
	
	.section-title {
		font-size: 32rpx;
		color: #333333;
		font-weight: 700;
		margin-bottom: 8rpx;
		display: block;
	}
	
	.section-subtitle {
		font-size: 24rpx;
		color: #666666;
		display: block;
	}
	
	/* 定位城市 */
	.location-city-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 30rpx;
		transition: all 0.3s ease;
	}
	
	.location-city-item:active {
		background: linear-gradient(135deg, #E3F2FD 0%, #F0F8FF 100%);
	}
	
	/* 当前选择 */
	.current-city-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 30rpx;
		background: linear-gradient(135deg, #E8F5E8 0%, #F0FFF0 100%);
		transition: all 0.3s ease;
	}
	
	.current-city-item:active {
		background: linear-gradient(135deg, #D4EDDA 0%, #E8F5E8 100%);
	}
	
	.city-info {
		flex: 1;
	}
	
	.city-name {
		font-size: 32rpx;
		color: #333333;
		font-weight: 700;
		margin-bottom: 8rpx;
		display: block;
	}
	
	.city-desc {
		font-size: 24rpx;
		color: #666666;
		display: block;
	}
	
	.city-action {
		display: flex;
		align-items: center;
		gap: 8rpx;
	}
	
	.action-text {
		font-size: 28rpx;
		color: #007AFF;
		font-weight: 600;
	}
	
	.action-icon {
		font-size: 24rpx;
		color: #007AFF;
	}
	
	.city-status {
		display: flex;
		align-items: center;
		gap: 8rpx;
	}
	
	.status-text {
		font-size: 24rpx;
		color: #52C41A;
		font-weight: 600;
	}
	
	.status-icon {
		font-size: 28rpx;
		color: #52C41A;
	}
	
	/* 热门城市网格 */
	.hot-cities-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20rpx;
		padding: 30rpx;
	}
	
	.hot-city-item {
		background: linear-gradient(135deg, #F8FAFF 0%, #F0F4FF 100%);
		border-radius: 16rpx;
		padding: 30rpx 20rpx;
		text-align: center;
		transition: all 0.3s ease;
		border: 2rpx solid rgba(0, 122, 255, 0.1);
		position: relative;
		overflow: hidden;
	}
	
	.hot-city-item::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
		transition: left 0.5s ease;
	}
	
	.hot-city-item:active {
		background: linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%);
		border-color: #007AFF;
		transform: scale(0.95);
		box-shadow: 0 8rpx 24rpx rgba(0, 122, 255, 0.3);
	}
	
	.hot-city-item:active::before {
		left: 100%;
	}
	
	.hot-city-item.selected {
		background: linear-gradient(135deg, #52C41A 0%, #73D13D 100%);
		border-color: #52C41A;
	}
	
	.hot-city-item.has-lockers {
		border-color: rgba(255, 107, 53, 0.3);
	}
	
	.hot-city-item:active .city-name,
	.hot-city-item:active .city-count,
	.hot-city-item.selected .city-name,
	.hot-city-item.selected .city-count {
		color: #FFFFFF;
	}
	
	.hot-city-item .city-name {
		font-size: 28rpx;
		color: #333333;
		font-weight: 600;
		margin-bottom: 8rpx;
		display: block;
		transition: all 0.3s ease;
	}
	
	.city-count {
		font-size: 20rpx;
		color: #666666;
		display: block;
		transition: all 0.3s ease;
	}
	
	/* 搜索结果 */
	.search-list {
		max-height: 600rpx;
		overflow-y: auto;
	}
	
	.search-result-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 30rpx;
		border-bottom: 1rpx solid #F0F0F0;
		transition: all 0.3s ease;
	}
	
	.search-result-item:last-child {
		border-bottom: none;
	}
	
	.search-result-item:active {
		background: linear-gradient(135deg, #E3F2FD 0%, #F0F8FF 100%);
	}
	
	.search-result-item.selected {
		background: linear-gradient(135deg, #E8F5E8 0%, #F0FFF0 100%);
	}
	
	.city-meta {
		display: flex;
		align-items: center;
		gap: 15rpx;
	}
	
	.locker-count {
		font-size: 22rpx;
		color: #007AFF;
		background: rgba(0, 122, 255, 0.1);
		padding: 6rpx 12rpx;
		border-radius: 12rpx;
	}
	
	.select-icon {
		font-size: 24rpx;
		color: #007AFF;
	}
	
	/* 空结果 */
	.empty-result {
		text-align: center;
		padding: 80rpx 30rpx;
	}
	
	.empty-icon {
		font-size: 80rpx;
		margin-bottom: 20rpx;
		display: block;
		opacity: 0.5;
	}
	
	.empty-text {
		font-size: 28rpx;
		color: #333333;
		margin-bottom: 12rpx;
		display: block;
	}
	
	.empty-hint {
		font-size: 24rpx;
		color: #666666;
		display: block;
	}
	
	/* 字母索引 */
	.alphabet-index {
		position: fixed;
		right: 20rpx;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		flex-direction: column;
		gap: 4rpx;
		z-index: 50;
	}
	
	.alphabet-item {
		width: 40rpx;
		height: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(10rpx);
		transition: all 0.3s ease;
	}
	
	.alphabet-item.active {
		background: #007AFF;
		transform: scale(1.2);
	}
	
	.alphabet-text {
		font-size: 20rpx;
		color: #333333;
		font-weight: 600;
	}
	
	.alphabet-item.active .alphabet-text {
		color: #FFFFFF;
	}
	
	/* 热门景点分类 */
	.categories-section {
		margin: 30rpx;
		background: linear-gradient(135deg, #FFFFFF 0%, #FAFBFF 100%);
		border-radius: 20rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
		border: 1rpx solid rgba(0, 122, 255, 0.05);
		overflow: hidden;
	}
	
	.category-group {
		border-bottom: 1rpx solid #F0F0F0;
	}
	
	.category-group:last-child {
		border-bottom: none;
	}
	
	.category-header {
		display: flex;
		align-items: center;
		padding: 25rpx 30rpx;
		background: linear-gradient(135deg, #FAFBFF 0%, #F8FAFF 100%);
		border-bottom: 1rpx solid #F0F0F0;
	}
	
	.category-badge {
		width: 50rpx;
		height: 50rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		margin-right: 20rpx;
		font-size: 24rpx;
	}
	
	.category-badge.attractions {
		background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
	}
	
	.category-badge.stations {
		background: linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%);
	}
	
	.category-badge.subway {
		background: linear-gradient(135deg, #52C41A 0%, #73D13D 100%);
	}
	
	.category-title {
		font-size: 30rpx;
		color: #333333;
		font-weight: 700;
		flex: 1;
	}
	
	.category-count {
		font-size: 24rpx;
		color: #666666;
		background: rgba(0, 122, 255, 0.1);
		padding: 6rpx 12rpx;
		border-radius: 12rpx;
	}
	
	.category-items {
		display: flex;
		flex-wrap: wrap;
		gap: 15rpx;
		padding: 30rpx;
	}
	
	.category-item {
		display: flex;
		align-items: center;
		gap: 10rpx;
		background: linear-gradient(135deg, #F8FAFF 0%, #F0F4FF 100%);
		border-radius: 25rpx;
		padding: 15rpx 20rpx;
		border: 2rpx solid rgba(0, 122, 255, 0.1);
		transition: all 0.3s ease;
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
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
		transition: left 0.5s ease;
	}
	
	.category-item:active {
		background: linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%);
		border-color: #007AFF;
		transform: scale(0.95);
		box-shadow: 0 6rpx 20rpx rgba(0, 122, 255, 0.3);
	}
	
	.category-item:active::before {
		left: 100%;
	}
	
	.category-item:active .item-icon,
	.category-item:active .item-text {
		color: #FFFFFF;
	}
	
	.item-icon {
		font-size: 24rpx;
		transition: all 0.3s ease;
	}
	
	.item-text {
		font-size: 26rpx;
		color: #333333;
		font-weight: 600;
		transition: all 0.3s ease;
	}

	/* 城市滚动列表 */
	.cities-scroll {
		max-height: 600rpx;
	}
	
	.letter-group {
		border-bottom: 1rpx solid #F0F0F0;
	}
	
	.letter-group:last-child {
		border-bottom: none;
	}
	
	.letter-header {
		padding: 20rpx 30rpx;
		background: linear-gradient(135deg, #FAFBFF 0%, #F8FAFF 100%);
		border-bottom: 1rpx solid #F0F0F0;
	}
	
	.letter-title {
		font-size: 28rpx;
		color: #007AFF;
		font-weight: 700;
	}
	
	.cities-list {
		background: #FFFFFF;
	}
	
	.city-list-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 25rpx 30rpx;
		border-bottom: 1rpx solid #F8F8F8;
		transition: all 0.3s ease;
	}
	
	.city-list-item:last-child {
		border-bottom: none;
	}
	
	.city-list-item:active {
		background: linear-gradient(135deg, #E3F2FD 0%, #F0F8FF 100%);
	}
	
	.city-list-item.selected {
		background: linear-gradient(135deg, #E8F5E8 0%, #F0FFF0 100%);
	}
	
	.city-list-item .city-name {
		font-size: 30rpx;
		margin-bottom: 6rpx;
	}
	
	.city-list-item .city-desc {
		font-size: 22rpx;
	}
	
	/* 加载状态 */
	.loading-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(4rpx);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}
	
	.loading-content {
		background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFF 100%);
		padding: 50rpx;
		border-radius: 20rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
		border: 1rpx solid rgba(255, 255, 255, 0.8);
	}
	
	.loading-spinner {
		width: 60rpx;
		height: 60rpx;
		border: 4rpx solid #E5E5E5;
		border-top: 4rpx solid #007AFF;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 20rpx;
	}
	
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
	
	.loading-text {
		font-size: 28rpx;
		color: #333333;
		font-weight: 600;
	}
	
	/* 响应式设计 */
	@media (max-width: 480px) {
		.hot-cities-grid {
			grid-template-columns: repeat(2, 1fr);
		}
		
		.header-content {
			padding: 15rpx 20rpx;
		}
		
		.search-section {
			padding: 20rpx;
		}
		
		.location-section,
		.current-section,
		.hot-section,
		.search-results,
		.all-cities-section {
			margin: 20rpx;
		}
	}
</style>