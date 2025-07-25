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
				<text class="search-placeholder">搜索火车站/地铁站/景点</text>
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
				<view class="feature-icon">📋</view>
				<text class="feature-text">我的订单</text>
			</view>
			<view class="feature-item" @click="goToService">
				<view class="feature-icon">💬</view>
				<text class="feature-text">在线客服</text>
			</view>
			<view class="feature-item" @click="goToGuide">
				<view class="feature-icon">📖</view>
				<text class="feature-text">寄存指南</text>
			</view>
			<view class="feature-item developing" @click="goToCoupons">
				<view class="feature-icon">🎫</view>
				<text class="feature-text">优惠卡券</text>
				<text class="developing-tag">开发中</text>
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
			
			<view class="no-locker" v-if="!nearestLocker && nearbyLockers.length === 0">
				<text class="no-locker-text">正在获取附近寄存点...</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				currentCity: '郑州市',
				hotspots: ['郑州站', '郑州东站', '二七广场', '中原福塔'],
				nearestLocker: null,
				nearbyLockers: [], // 存储所有附近寄存点
				updateTimer: null
			}
		},
		onLoad() {
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
			
			this.loadNearestLocker();
			this.startRealTimeUpdate();
		},
		onShow() {
			// 页面显示时重新加载数据，确保从其他页面返回时数据正确
			console.log('首页显示');
			
			// 检查是否有选择的城市
			const selectedCity = uni.getStorageSync('selectedCity');
			if (selectedCity) {
				this.currentCity = selectedCity.name;
			}
			
			if (!this.nearestLocker) {
				this.loadNearestLocker();
			}
			// 确保页面滚动到顶部
			uni.pageScrollTo({
				scrollTop: 0,
				duration: 0
			});
		},
		onUnload() {
			// 页面卸载时清除定时器
			if (this.updateTimer) {
				clearInterval(this.updateTimer);
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
						success: (res) => {
							if (res.statusCode === 200 && res.data) {
								resolve(res.data);
							} else {
								reject(new Error('获取城市信息失败'));
							}
						},
						fail: (error) => {
							// 如果后端接口不可用，使用默认逻辑
							console.warn('后端接口不可用，使用默认城市');
							resolve({
								id: 1,
								name: '郑州市',
								code: 'zhengzhou'
							});
						}
					});
				});
			},
			
			// 加载附近寄存点
			loadNearbyLockers(latitude, longitude) {
				return new Promise((resolve, reject) => {
					// TODO: 调用ito-deposit后端接口获取附近寄存点
					const apiUrl = 'https://your-actual-api-domain.com/api/lockers/nearby';
					
					uni.request({
						url: apiUrl,
						method: 'POST',
						data: {
							latitude: latitude,
							longitude: longitude,
							radius: 5000, // 搜索半径5公里
							limit: 10 // 最多返回10个寄存点
						},
						header: {
							'Content-Type': 'application/json'
						},
						success: (res) => {
							if (res.statusCode === 200 && res.data) {
								// 更新附近寄存点数据
								if (res.data.length > 0) {
									this.nearestLocker = res.data[0]; // 取最近的一个
									this.nearbyLockers = res.data; // 保存所有附近寄存点
								}
								resolve(res.data);
							} else {
								reject(new Error('获取附近寄存点失败'));
							}
						},
						fail: (error) => {
							// 如果后端接口不可用，使用模拟数据
							console.warn('后端接口不可用，使用模拟数据');
							this.loadNearestLocker(); // 使用原有的模拟数据逻辑
							resolve([]);
						}
					});
				});
			},
			
			// 打开搜索
			openSearch() {
				console.log('打开搜索');
				uni.showToast({
					title: '跳转到搜索页面',
					icon: 'none'
				});
				// TODO: 跳转到搜索页面
				// uni.navigateTo({
				//     url: '/pages/search/search'
				// });
			},
			
			// 选择热门地点
			selectHotspot(hotspot) {
				console.log('选择热门地点:', hotspot);
				uni.showToast({
					title: `查询${hotspot}的寄存点`,
					icon: 'none'
				});
				// TODO: 根据热门地点查询寄存点
			},
			
			// 查询寄存点
			queryLockers() {
				console.log('查询寄存点');
				uni.showToast({
					title: '跳转到寄存点列表页面',
					icon: 'none'
				});
				// TODO: 跳转到寄存点列表页面
				// uni.navigateTo({
				//     url: '/pages/locker-list/locker-list'
				// });
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
			
			// 加载最近的寄存点
			loadNearestLocker() {
				// 模拟API调用获取最近的寄存点
				// 实际项目中这里应该调用后端API
				setTimeout(() => {
					this.nearestLocker = {
						id: 1,
						name: '中交锦兰荟南门寄存柜',
						large: Math.floor(Math.random() * 10) + 1,
						medium: Math.floor(Math.random() * 10) + 1,
						small: Math.floor(Math.random() * 10) + 1,
						address: '中交锦兰荟南门中交锦兰荟门寄存柜...',
						distance: '0.5km'
					};
				}, 1000);
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
				// TODO: 跳转到附近寄存点列表页面
				uni.showToast({
					title: '跳转到附近寄存点列表',
					icon: 'none'
				});
				// uni.navigateTo({
				//     url: '/pages/nearby-list/nearby-list'
				// });
			}
		}
	}
</script>

<style>
	.page {
		background: linear-gradient(180deg, #F8FAFF 0%, #F5F5F5 100%);
		min-height: 100vh;
		width: 100%;
		overflow-x: hidden;
		position: relative;
	}
	
	/* 顶部图片区域 */
	.header-section {
		width: 100%;
		height: 200rpx;
		position: relative;
		overflow: hidden;
	}
	
	.header-image {
		width: 100%;
		height: 100%;
		border-radius: 0 0 30rpx 30rpx;
	}
	
	/* 城市选择和我的附近 */
	.location-section {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 25rpx 30rpx;
		background: linear-gradient(135deg, #FFFFFF 0%, #FAFBFF 100%);
		margin: 20rpx 30rpx;
		border-radius: 24rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 122, 255, 0.08);
		border: 1rpx solid rgba(0, 122, 255, 0.05);
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
		background: linear-gradient(135deg, #FFFFFF 0%, #FAFBFF 100%);
		padding: 28rpx 35rpx;
		border-radius: 50rpx;
		box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.06);
		border: 1rpx solid rgba(0, 0, 0, 0.04);
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
	
	.search-placeholder {
		color: #8E8E93;
		font-size: 28rpx;
		margin-left: 50rpx;
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
		background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFF 100%);
		padding: 18rpx 24rpx;
		border-radius: 50rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		border: 1rpx solid rgba(0, 122, 255, 0.08);
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
		background: #FFFFFF;
		margin: 0 30rpx 30rpx;
		border-radius: 24rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
		border: 1rpx solid rgba(0, 0, 0, 0.02);
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
	
	/* 交易保障 */
	.guarantee-section {
		display: flex;
		align-items: center;
		padding: 25rpx 30rpx;
		background: linear-gradient(135deg, #F0FFF4 0%, #E8F5E8 100%);
		margin: 0 30rpx 30rpx;
		border-radius: 20rpx;
		box-shadow: 0 6rpx 20rpx rgba(82, 196, 26, 0.08);
		border: 1rpx solid rgba(82, 196, 26, 0.1);
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
		background: linear-gradient(135deg, #FFFFFF 0%, #FAFBFF 100%);
		margin: 0 30rpx 30rpx;
		border-radius: 24rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
		border: 1rpx solid rgba(0, 0, 0, 0.04);
		padding-bottom: 100rpx;
		overflow: hidden;
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
		padding: 80rpx 30rpx;
		text-align: center;
	}
	
	.no-locker-text {
		font-size: 28rpx;
		color: #8E8E93;
		position: relative;
	}
	
	.no-locker-text::after {
		content: '';
		display: inline-block;
		width: 20rpx;
		height: 20rpx;
		border: 2rpx solid #007AFF;
		border-top: 2rpx solid transparent;
		border-radius: 50%;
		margin-left: 16rpx;
		animation: spin 1s linear infinite;
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
