<template>
	<view class="page">
		<!-- 顶部导航栏 -->
		<view class="header">
			<view class="back-btn" @click="goBack">
				<text class="back-icon">←</text>
			</view>
			<text class="header-title">寄存点详情</text>
			<view class="share-btn">
				<text class="share-icon">⋯</text>
			</view>
		</view>
		
		<!-- 寄存点信息 -->
		<view class="locker-info-section">
			<view class="locker-header">
				<text class="locker-name">{{lockerInfo.name}}</text>
				<view class="locker-status" :class="lockerInfo.status">
					<text class="status-text">{{lockerInfo.status === 'available' ? '营业中' : '暂停服务'}}</text>
				</view>
			</view>
			
			<view class="locker-address">
				<text class="address-icon">📍</text>
				<text class="address-text">{{lockerInfo.address}}</text>
			</view>
			
			<view class="locker-distance" v-if="lockerInfo.distance">
				<text class="distance-text">距离您 {{lockerInfo.distance}}</text>
			</view>
		</view>
		
		<!-- 柜子容量信息 -->
		<view class="capacity-section">
			<view class="section-title">
				<text class="title-text">可用柜子</text>
				<text class="refresh-btn" @click="refreshCapacity">🔄 刷新</text>
			</view>
			
			<view class="capacity-grid">
				<view class="capacity-item">
					<view class="capacity-icon large">📦</view>
					<text class="capacity-label">大柜</text>
					<text class="capacity-count" :class="{ 'zero': lockerInfo.large === 0 }">{{lockerInfo.large}}</text>
					<text class="capacity-size">适合行李箱</text>
				</view>
				
				<view class="capacity-item">
					<view class="capacity-icon medium">📦</view>
					<text class="capacity-label">中柜</text>
					<text class="capacity-count" :class="{ 'zero': lockerInfo.medium === 0 }">{{lockerInfo.medium}}</text>
					<text class="capacity-size">适合背包</text>
				</view>
				
				<view class="capacity-item">
					<view class="capacity-icon small">📦</view>
					<text class="capacity-label">小柜</text>
					<text class="capacity-count" :class="{ 'zero': lockerInfo.small === 0 }">{{lockerInfo.small}}</text>
					<text class="capacity-size">适合手提包</text>
				</view>
			</view>
		</view>
		
		<!-- 操作按钮 -->
		<view class="action-section">
			<button class="action-btn primary" @click="selectLocker" :disabled="!hasAvailableLockers">
				{{hasAvailableLockers ? '选择此寄存点' : '暂无可用柜子'}}
			</button>
			
			<view class="secondary-actions">
				<button class="action-btn secondary" @click="showOnMap">在地图中查看</button>
				<button class="action-btn secondary" @click="getDirections">获取路线</button>
			</view>
		</view>
		
		<!-- 寄存点详细信息 -->
		<view class="detail-section">
			<view class="detail-item">
				<text class="detail-label">营业时间</text>
				<text class="detail-value">{{lockerInfo.businessHours || '24小时营业'}}</text>
			</view>
			
			<view class="detail-item">
				<text class="detail-label">联系电话</text>
				<text class="detail-value phone" @click="callPhone">{{lockerInfo.phone || '400-123-4567'}}</text>
			</view>
			
			<view class="detail-item">
				<text class="detail-label">收费标准</text>
				<text class="detail-value">{{lockerInfo.pricing || '小柜5元/天，中柜8元/天，大柜12元/天'}}</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				lockerInfo: {
					id: '',
					name: '寄存点',
					address: '地址加载中...',
					distance: '',
					large: 0,
					medium: 0,
					small: 0,
					status: 'available',
					businessHours: '24小时营业',
					phone: '400-123-4567',
					pricing: '小柜5元/天，中柜8元/天，大柜12元/天'
				}
			}
		},
		
		computed: {
			hasAvailableLockers() {
				return this.lockerInfo.large > 0 || this.lockerInfo.medium > 0 || this.lockerInfo.small > 0;
			}
		},
		
		onLoad(options) {
			console.log('寄存点详情页面加载:', options);
			
			// 从参数中获取寄存点信息
			if (options.id) {
				this.lockerInfo.id = options.id;
			}
			if (options.name) {
				this.lockerInfo.name = decodeURIComponent(options.name);
			}
			if (options.address) {
				this.lockerInfo.address = decodeURIComponent(options.address);
			}
			
			// 加载详细信息
			this.loadLockerDetail();
		},
		
		methods: {
			// 返回上一页
			goBack() {
				uni.navigateBack();
			},
			
			// 加载寄存点详细信息
			loadLockerDetail() {
				console.log('加载寄存点详细信息:', this.lockerInfo.id);
				
				// 调用后端接口获取详细信息
				const apiUrl = `http://localhost:8000/api/lockers/${this.lockerInfo.id}/detail`;
				
				uni.request({
					url: apiUrl,
					method: 'GET',
					header: {
						'Content-Type': 'application/json'
					},
					success: (res) => {
						console.log('寄存点详情接口响应:', res);
						
						if (res.statusCode === 200 && res.data) {
							this.updateLockerInfo(res.data);
						} else {
							console.warn('获取寄存点详情失败，使用默认数据');
							this.setDefaultLockerInfo();
						}
					},
					fail: (error) => {
						console.error('获取寄存点详情失败:', error);
						this.setDefaultLockerInfo();
					}
				});
			},
			
			// 更新寄存点信息
			updateLockerInfo(data) {
				this.lockerInfo = {
					...this.lockerInfo,
					large: data.large_count || data.large || Math.floor(Math.random() * 5) + 1,
					medium: data.medium_count || data.medium || Math.floor(Math.random() * 8) + 2,
					small: data.small_count || data.small || Math.floor(Math.random() * 10) + 3,
					status: data.status || 'available',
					businessHours: data.business_hours || '24小时营业',
					phone: data.phone || '400-123-4567',
					pricing: data.pricing || '小柜5元/天，中柜8元/天，大柜12元/天'
				};
			},
			
			// 设置默认寄存点信息
			setDefaultLockerInfo() {
				this.lockerInfo = {
					...this.lockerInfo,
					large: Math.floor(Math.random() * 5) + 1,
					medium: Math.floor(Math.random() * 8) + 2,
					small: Math.floor(Math.random() * 10) + 3,
					status: 'available'
				};
			},
			
			// 刷新容量信息
			refreshCapacity() {
				console.log('刷新柜子容量');
				
				uni.showLoading({
					title: '刷新中...'
				});
				
				// 模拟刷新延迟
				setTimeout(() => {
					this.lockerInfo.large = Math.floor(Math.random() * 5) + 1;
					this.lockerInfo.medium = Math.floor(Math.random() * 8) + 2;
					this.lockerInfo.small = Math.floor(Math.random() * 10) + 3;
					
					uni.hideLoading();
					uni.showToast({
						title: '容量已更新',
						icon: 'success'
					});
				}, 1000);
			},
			
			// 选择寄存点
			selectLocker() {
				if (!this.hasAvailableLockers) {
					uni.showToast({
						title: '暂无可用柜子',
						icon: 'none'
					});
					return;
				}
				
				console.log('选择寄存点:', this.lockerInfo);
				
				// 跳转到预订页面或其他相关页面
				uni.showModal({
					title: '选择寄存点',
					content: `确定选择"${this.lockerInfo.name}"进行寄存吗？`,
					success: (res) => {
						if (res.confirm) {
							// 这里可以跳转到预订页面
							uni.showToast({
								title: '功能开发中',
								icon: 'none'
							});
						}
					}
				});
			},
			
			// 在地图中查看
			showOnMap() {
				console.log('在地图中查看寄存点');
				
				// 跳转到附近页面，并定位到该寄存点
				uni.navigateTo({
					url: `/pages/nearby/nearby?lockerID=${this.lockerInfo.id}`
				});
			},
			
			// 获取路线
			getDirections() {
				console.log('获取路线到寄存点');
				
				uni.showActionSheet({
					itemList: ['使用高德地图导航', '使用百度地图导航', '使用腾讯地图导航'],
					success: (res) => {
						const mapNames = ['高德地图', '百度地图', '腾讯地图'];
						uni.showToast({
							title: `使用${mapNames[res.tapIndex]}导航`,
							icon: 'none'
						});
						// 这里可以调用相应的地图导航功能
					}
				});
			},
			
			// 拨打电话
			callPhone() {
				uni.makePhoneCall({
					phoneNumber: this.lockerInfo.phone,
					fail: (error) => {
						console.error('拨打电话失败:', error);
						uni.showToast({
							title: '拨打电话失败',
							icon: 'none'
						});
					}
				});
			}
		}
	}
</script>

<style>
	.page {
		background-color: #F5F5F5;
		min-height: 100vh;
	}
	
	/* 顶部导航栏 */
	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 30rpx;
		background-color: #FFFFFF;
		border-bottom: 1rpx solid #E5E5E5;
	}
	
	.back-btn, .share-btn {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.back-icon, .share-icon {
		font-size: 36rpx;
		color: #333333;
	}
	
	.header-title {
		font-size: 32rpx;
		color: #333333;
		font-weight: 600;
		flex: 1;
		text-align: center;
	}
	
	/* 寄存点信息 */
	.locker-info-section {
		background-color: #FFFFFF;
		padding: 30rpx;
		margin-bottom: 20rpx;
	}
	
	.locker-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20rpx;
	}
	
	.locker-name {
		font-size: 36rpx;
		color: #333333;
		font-weight: 700;
		flex: 1;
	}
	
	.locker-status {
		padding: 8rpx 16rpx;
		border-radius: 20rpx;
		background-color: #E8F5E8;
	}
	
	.locker-status.unavailable {
		background-color: #FFE8E8;
	}
	
	.status-text {
		font-size: 24rpx;
		color: #52C41A;
		font-weight: 500;
	}
	
	.locker-status.unavailable .status-text {
		color: #FF4D4F;
	}
	
	.locker-address {
		display: flex;
		align-items: flex-start;
		margin-bottom: 16rpx;
	}
	
	.address-icon {
		font-size: 28rpx;
		color: #007AFF;
		margin-right: 12rpx;
		margin-top: 4rpx;
	}
	
	.address-text {
		font-size: 28rpx;
		color: #666666;
		line-height: 1.5;
		flex: 1;
	}
	
	.locker-distance {
		margin-top: 16rpx;
	}
	
	.distance-text {
		font-size: 26rpx;
		color: #007AFF;
		background-color: rgba(0, 122, 255, 0.1);
		padding: 6rpx 16rpx;
		border-radius: 20rpx;
	}
	
	/* 容量信息 */
	.capacity-section {
		background-color: #FFFFFF;
		padding: 30rpx;
		margin-bottom: 20rpx;
	}
	
	.section-title {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 30rpx;
	}
	
	.title-text {
		font-size: 32rpx;
		color: #333333;
		font-weight: 600;
	}
	
	.refresh-btn {
		font-size: 26rpx;
		color: #007AFF;
		padding: 8rpx 16rpx;
		border-radius: 20rpx;
		background-color: rgba(0, 122, 255, 0.1);
	}
	
	.capacity-grid {
		display: flex;
		justify-content: space-between;
		gap: 20rpx;
	}
	
	.capacity-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 30rpx 20rpx;
		background-color: #F8F9FA;
		border-radius: 16rpx;
		border: 2rpx solid transparent;
		transition: all 0.3s ease;
	}
	
	.capacity-icon {
		font-size: 48rpx;
		margin-bottom: 16rpx;
	}
	
	.capacity-icon.large {
		color: #FF6B6B;
	}
	
	.capacity-icon.medium {
		color: #4ECDC4;
	}
	
	.capacity-icon.small {
		color: #45B7D1;
	}
	
	.capacity-label {
		font-size: 28rpx;
		color: #333333;
		font-weight: 600;
		margin-bottom: 8rpx;
	}
	
	.capacity-count {
		font-size: 36rpx;
		color: #007AFF;
		font-weight: 700;
		margin-bottom: 8rpx;
	}
	
	.capacity-count.zero {
		color: #999999;
	}
	
	.capacity-size {
		font-size: 22rpx;
		color: #999999;
		text-align: center;
	}
	
	/* 操作按钮 */
	.action-section {
		padding: 30rpx;
	}
	
	.action-btn {
		width: 100%;
		padding: 30rpx;
		border-radius: 50rpx;
		font-size: 32rpx;
		font-weight: 600;
		border: none;
		margin-bottom: 20rpx;
		transition: all 0.3s ease;
	}
	
	.action-btn.primary {
		background: linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%);
		color: #FFFFFF;
		box-shadow: 0 8rpx 24rpx rgba(0, 122, 255, 0.3);
	}
	
	.action-btn.primary:disabled {
		background: #CCCCCC;
		color: #999999;
		box-shadow: none;
	}
	
	.action-btn.primary:active:not(:disabled) {
		transform: scale(0.98);
	}
	
	.secondary-actions {
		display: flex;
		gap: 20rpx;
	}
	
	.action-btn.secondary {
		flex: 1;
		background-color: #FFFFFF;
		color: #007AFF;
		border: 2rpx solid #007AFF;
		font-size: 28rpx;
		padding: 24rpx;
		margin-bottom: 0;
	}
	
	.action-btn.secondary:active {
		background-color: #007AFF;
		color: #FFFFFF;
	}
	
	/* 详细信息 */
	.detail-section {
		background-color: #FFFFFF;
		padding: 30rpx;
		margin-bottom: 40rpx;
	}
	
	.detail-item {
		display: flex;
		align-items: flex-start;
		padding: 20rpx 0;
		border-bottom: 1rpx solid #F0F0F0;
	}
	
	.detail-item:last-child {
		border-bottom: none;
	}
	
	.detail-label {
		font-size: 28rpx;
		color: #666666;
		width: 160rpx;
		flex-shrink: 0;
	}
	
	.detail-value {
		font-size: 28rpx;
		color: #333333;
		flex: 1;
		line-height: 1.5;
	}
	
	.detail-value.phone {
		color: #007AFF;
		text-decoration: underline;
	}
</style>