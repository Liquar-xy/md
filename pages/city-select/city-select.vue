<template>
	<view class="page">
		<!-- 服务城市标题 -->
		<view class="section-title">
			<text class="title-text">服务城市</text>
		</view>
		
		<!-- 城市列表 -->
		<view class="cities-grid">
			<view 
				class="city-item" 
				v-for="(city, index) in cities" 
				:key="index"
				@click="selectCity(city)"
			>
				<text class="city-name">{{city.name}}</text>
			</view>
		</view>
		
		<!-- 加载状态 -->
		<view class="loading" v-if="loading">
			<text class="loading-text">加载中...</text>
		</view>
		
		<!-- 空状态 -->
		<view class="empty" v-if="!loading && cities.length === 0">
			<text class="empty-text">暂无服务城市</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				cities: [],
				loading: true
			}
		},
		onLoad() {
			this.loadCities();
		},
		methods: {
			// 加载城市列表
			async loadCities() {
				this.loading = true;
				try {
					// TODO: 请提供正确的ito-deposit后端接口地址
					// 暂时使用默认城市列表，避免网络错误
					this.cities = this.getDefaultCities();
					
					// 如果有正确的后端接口，可以取消下面的注释
					// const response = await this.getCitiesFromAPI();
					// this.cities = response.data || [];
				} catch (error) {
					console.error('获取城市列表失败:', error);
					// 如果接口失败，使用默认城市列表
					this.cities = this.getDefaultCities();
				} finally {
					this.loading = false;
				}
			},
			
			// 调用后端API获取城市列表
			getCitiesFromAPI() {
				return new Promise((resolve, reject) => {
					// TODO: 请提供正确的ito-deposit后端接口地址
					const apiUrl = 'https://your-actual-api-domain.com/api/cities'; // 请替换为实际接口地址
					
					uni.request({
						url: apiUrl,
						method: 'GET',
						header: {
							'Content-Type': 'application/json',
							// 如果需要认证，添加token等header
							// 'Authorization': 'Bearer ' + token
						},
						success: (res) => {
							if (res.statusCode === 200) {
								resolve(res.data);
							} else {
								reject(new Error(`API请求失败: ${res.statusCode}`));
							}
						},
						fail: (error) => {
							reject(error);
						}
					});
				});
			},
			
			// 获取默认城市列表（作为备用）
			getDefaultCities() {
				return [
					{ id: 1, name: '北京', code: 'beijing' },
					{ id: 2, name: '上海', code: 'shanghai' },
					{ id: 3, name: '广州', code: 'guangzhou' },
					{ id: 4, name: '香港', code: 'hongkong' },
					{ id: 5, name: '深圳', code: 'shenzhen' },
					{ id: 6, name: '杭州', code: 'hangzhou' },
					{ id: 7, name: '南京', code: 'nanjing' },
					{ id: 8, name: '成都', code: 'chengdu' }
				];
			},
			
			// 选择城市
			selectCity(city) {
				console.log('选择城市:', city);
				
				// 保存选中的城市到本地存储
				uni.setStorageSync('selectedCity', city);
				
				// 显示选择成功提示
				uni.showToast({
					title: `已选择${city.name}`,
					icon: 'success'
				});
				
				// 延迟返回上一页，让用户看到提示
				setTimeout(() => {
					uni.navigateBack();
				}, 1000);
			}
		}
	}
</script>

<style>
	.page {
		background-color: #F5F5F5;
		min-height: 100vh;
		padding: 20rpx;
	}
	
	.section-title {
		padding: 30rpx 20rpx 20rpx;
		background-color: #FFFFFF;
		margin-bottom: 20rpx;
		border-radius: 12rpx;
	}
	
	.title-text {
		font-size: 32rpx;
		color: #1A1A1A;
		font-weight: 600;
	}
	
	.cities-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
		padding: 20rpx;
		background-color: #FFFFFF;
		border-radius: 12rpx;
	}
	
	.city-item {
		flex: 0 0 calc(25% - 15rpx);
		background-color: #F8F9FA;
		padding: 30rpx 20rpx;
		border-radius: 12rpx;
		text-align: center;
		transition: all 0.3s ease;
		border: 1rpx solid #E9ECEF;
	}
	
	.city-item:active {
		background-color: #007AFF;
		transform: scale(0.95);
	}
	
	.city-item:active .city-name {
		color: #FFFFFF;
	}
	
	.city-name {
		font-size: 28rpx;
		color: #1A1A1A;
		font-weight: 500;
	}
	
	.loading {
		text-align: center;
		padding: 100rpx 0;
	}
	
	.loading-text {
		font-size: 28rpx;
		color: #8E8E93;
	}
	
	.empty {
		text-align: center;
		padding: 100rpx 0;
	}
	
	.empty-text {
		font-size: 28rpx;
		color: #8E8E93;
	}
	
	/* 响应式布局 */
	@media screen and (max-width: 750rpx) {
		.city-item {
			flex: 0 0 calc(25% - 15rpx);
		}
	}
</style>