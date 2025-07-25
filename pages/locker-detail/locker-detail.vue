<template>
	<view class="page">
		<!-- 寄存点图片 -->
		<view class="image-section">
			<image class="locker-image" src="/static/locker-image.jpg" mode="aspectFill"></image>
		</view>
		
		<!-- 寄存点信息 -->
		<view class="info-section">
			<text class="locker-name">{{lockerInfo.name}}</text>
			<view class="location-info">
				<text class="location-icon">📍</text>
				<text class="location-text">{{lockerInfo.address}}</text>
			</view>
			<text class="distance-text">距离您 {{lockerInfo.distance}}</text>
		</view>
		
		<!-- 柜子信息 -->
		<view class="capacity-section">
			<text class="section-title">可用柜子</text>
			<view class="capacity-list">
				<view class="capacity-item">
					<text class="capacity-type">大柜</text>
					<text class="capacity-count">{{lockerInfo.large}}个</text>
				</view>
				<view class="capacity-item">
					<text class="capacity-type">中柜</text>
					<text class="capacity-count">{{lockerInfo.medium}}个</text>
				</view>
				<view class="capacity-item">
					<text class="capacity-type">小柜</text>
					<text class="capacity-count">{{lockerInfo.small}}个</text>
				</view>
			</view>
		</view>
		
		<!-- 营业信息 -->
		<view class="business-section">
			<text class="section-title">营业信息</text>
			<view class="business-item">
				<text class="business-label">营业时间</text>
				<text class="business-value">{{lockerInfo.openTime || '24小时'}}</text>
			</view>
			<view class="business-item">
				<text class="business-label">联系电话</text>
				<text class="business-value">{{lockerInfo.mobile || '暂无'}}</text>
			</view>
		</view>
		
		<!-- 底部按钮 -->
		<view class="bottom-actions">
			<button class="action-btn secondary" @click="callPhone">联系商家</button>
			<button class="action-btn primary" @click="bookLocker">立即预订</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				lockerId: null,
				lockerInfo: {
					id: 1,
					name: '中交锦兰荟南门寄存柜',
					address: '中交锦兰荟南门中交锦兰荟门寄存柜',
					distance: '0.5km',
					large: 8,
					medium: 10,
					small: 7,
					openTime: '24小时',
					mobile: '400-123-4567'
				}
			}
		},
		onLoad(options) {
			if (options.id) {
				this.lockerId = options.id;
				this.loadLockerDetail();
			}
		},
		methods: {
			// 加载寄存点详情
			loadLockerDetail() {
				// 模拟API调用
				console.log('加载寄存点详情:', this.lockerId);
				// 实际项目中这里应该调用后端API获取详情
			},
			
			// 拨打电话
			callPhone() {
				if (this.lockerInfo.mobile && this.lockerInfo.mobile !== '暂无') {
					uni.makePhoneCall({
						phoneNumber: this.lockerInfo.mobile
					});
				} else {
					uni.showToast({
						title: '暂无联系电话',
						icon: 'none'
					});
				}
			},
			
			// 预订寄存柜
			bookLocker() {
				uni.showToast({
					title: '跳转到预订页面',
					icon: 'none'
				});
				// TODO: 跳转到预订页面
				// uni.navigateTo({
				//     url: `/pages/booking/booking?lockerId=${this.lockerId}`
				// });
			}
		}
	}
</script>

<style>
	.page {
		background: linear-gradient(180deg, #F8FAFF 0%, #F5F5F5 100%);
		min-height: 100vh;
		padding-bottom: 140rpx;
	}
	
	/* 寄存点图片 */
	.image-section {
		width: 100%;
		height: 400rpx;
		position: relative;
		overflow: hidden;
	}
	
	.locker-image {
		width: 100%;
		height: 100%;
		border-radius: 0 0 30rpx 30rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
	}
	
	/* 寄存点信息 */
	.info-section {
		background: linear-gradient(135deg, #FFFFFF 0%, #FAFBFF 100%);
		padding: 35rpx 30rpx;
		margin: 20rpx 30rpx;
		border-radius: 24rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
		border: 1rpx solid rgba(0, 0, 0, 0.04);
		animation: fadeInUp 0.6s ease-out;
	}
	
	.locker-name {
		font-size: 38rpx;
		color: #1A1A1A;
		font-weight: 700;
		display: block;
		margin-bottom: 24rpx;
		line-height: 1.3;
	}
	
	.location-info {
		display: flex;
		align-items: flex-start;
		margin-bottom: 20rpx;
		padding: 16rpx 20rpx;
		background: linear-gradient(135deg, #F0F8FF 0%, #E3F2FD 100%);
		border-radius: 16rpx;
		border: 1rpx solid rgba(0, 122, 255, 0.1);
	}
	
	.location-icon {
		font-size: 28rpx;
		color: #007AFF;
		margin-right: 12rpx;
		margin-top: 2rpx;
	}
	
	.location-text {
		font-size: 28rpx;
		color: #1A1A1A;
		flex: 1;
		line-height: 1.4;
		font-weight: 500;
	}
	
	.distance-text {
		font-size: 26rpx;
		color: #007AFF;
		background: linear-gradient(135deg, #E3F2FD 0%, #F0F8FF 100%);
		padding: 8rpx 16rpx;
		border-radius: 20rpx;
		display: inline-block;
		font-weight: 600;
	}
	
	/* 柜子信息 */
	.capacity-section {
		background: linear-gradient(135deg, #FFFFFF 0%, #FAFBFF 100%);
		padding: 35rpx 30rpx;
		margin: 0 30rpx 20rpx;
		border-radius: 24rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
		border: 1rpx solid rgba(0, 0, 0, 0.04);
		animation: fadeInUp 0.6s ease-out 0.1s both;
	}
	
	.section-title {
		font-size: 34rpx;
		color: #1A1A1A;
		font-weight: 700;
		display: block;
		margin-bottom: 30rpx;
		position: relative;
	}
	
	.section-title::after {
		content: '';
		position: absolute;
		bottom: -10rpx;
		left: 0;
		width: 60rpx;
		height: 4rpx;
		background: linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%);
		border-radius: 2rpx;
	}
	
	.capacity-list {
		display: flex;
		justify-content: space-around;
		gap: 20rpx;
	}
	
	.capacity-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex: 1;
		padding: 25rpx 15rpx;
		background: linear-gradient(135deg, #F8FAFF 0%, #F0F8FF 100%);
		border-radius: 20rpx;
		border: 1rpx solid rgba(0, 122, 255, 0.08);
		transition: all 0.3s ease;
	}
	
	.capacity-item:active {
		transform: scale(0.95);
		box-shadow: 0 4rpx 16rpx rgba(0, 122, 255, 0.15);
	}
	
	.capacity-type {
		font-size: 26rpx;
		color: #8E8E93;
		margin-bottom: 12rpx;
		font-weight: 500;
	}
	
	.capacity-count {
		font-size: 36rpx;
		color: #007AFF;
		font-weight: 700;
	}
	
	/* 营业信息 */
	.business-section {
		background: linear-gradient(135deg, #FFFFFF 0%, #FAFBFF 100%);
		padding: 35rpx 30rpx;
		margin: 0 30rpx 20rpx;
		border-radius: 24rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
		border: 1rpx solid rgba(0, 0, 0, 0.04);
		animation: fadeInUp 0.6s ease-out 0.2s both;
	}
	
	.business-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 24rpx 20rpx;
		margin-bottom: 12rpx;
		background: linear-gradient(135deg, #F8FAFF 0%, #F5F7FA 100%);
		border-radius: 16rpx;
		border: 1rpx solid rgba(0, 0, 0, 0.03);
		transition: all 0.3s ease;
	}
	
	.business-item:last-child {
		margin-bottom: 0;
	}
	
	.business-item:active {
		transform: scale(0.98);
		background: linear-gradient(135deg, #E3F2FD 0%, #F0F8FF 100%);
	}
	
	.business-label {
		font-size: 28rpx;
		color: #1A1A1A;
		font-weight: 600;
	}
	
	.business-value {
		font-size: 28rpx;
		color: #007AFF;
		font-weight: 500;
	}
	
	/* 底部按钮 */
	.bottom-actions {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
		padding: 25rpx 30rpx;
		background: linear-gradient(135deg, #FFFFFF 0%, #FAFBFF 100%);
		border-top: 1rpx solid rgba(0, 0, 0, 0.06);
		gap: 20rpx;
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);
	}
	
	.action-btn {
		flex: 1;
		padding: 30rpx 25rpx;
		border-radius: 50rpx;
		font-size: 32rpx;
		border: none;
		font-weight: 600;
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
	}
	
	.action-btn::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: left 0.5s ease;
	}
	
	.action-btn:active::before {
		left: 100%;
	}
	
	.action-btn.primary {
		background: linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%);
		color: #FFFFFF;
		box-shadow: 0 6rpx 20rpx rgba(0, 122, 255, 0.3);
	}
	
	.action-btn.primary:active {
		transform: scale(0.95);
		box-shadow: 0 4rpx 16rpx rgba(0, 122, 255, 0.4);
	}
	
	.action-btn.secondary {
		background: linear-gradient(135deg, #F5F5F5 0%, #FAFAFA 100%);
		color: #1A1A1A;
		border: 1rpx solid rgba(0, 0, 0, 0.08);
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	}
	
	.action-btn.secondary:active {
		transform: scale(0.95);
		background: linear-gradient(135deg, #E8E8E8 0%, #F0F0F0 100%);
	}
	
	/* 动画效果 */
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
	
	/* 添加一些微交互效果 */
	.info-section,
	.capacity-section,
	.business-section {
		transition: all 0.3s ease;
	}
	
	.info-section:active,
	.capacity-section:active,
	.business-section:active {
		transform: scale(0.98);
	}
</style>