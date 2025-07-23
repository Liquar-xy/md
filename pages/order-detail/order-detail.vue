<template>
	<view class="order-detail-container">
		<!-- 订单状态 -->
		<view class="status-section">
			<view class="status-card">
				<view class="status-icon">📦</view>
				<text class="status-text">寄存中</text>
				<text class="status-desc">您的物品正在安全寄存</text>
			</view>
		</view>
		
		<!-- 寄存柜信息 -->
		<view class="locker-section">
			<view class="section-title">寄存柜信息</view>
			<view class="locker-card">
				<view class="locker-image">
					<image src="/static/locker-image.jpg" class="locker-img" mode="aspectFill"></image>
				</view>
				<view class="locker-info">
					<text class="locker-title">上海高铁站寄存柜</text>
					<text class="locker-detail">寄存柜: 21号柜 (大)</text>
					<view class="location-info">
						<text class="location-icon">📍</text>
						<text class="location-text">上海高铁站西广场路北100米KFC门口</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 订单详情 -->
		<view class="order-info-section">
			<view class="section-title">订单详情</view>
			<view class="info-card">
				<view class="info-item">
					<text class="info-label">订单号</text>
					<text class="info-value">YXB20241201001</text>
				</view>
				<view class="info-item">
					<text class="info-label">寄存时间</text>
					<text class="info-value">2024-12-01 14:30</text>
				</view>
				<view class="info-item">
					<text class="info-label">预计取件时间</text>
					<text class="info-value">2024-12-01 18:00</text>
				</view>
				<view class="info-item">
					<text class="info-label">寄存费用</text>
					<text class="info-value price">¥15.00</text>
				</view>
			</view>
		</view>
		
		<!-- 操作按钮 -->
		<view class="action-section">
			<button class="retrieve-btn" @click="handleRetrieve">去取出</button>
			<button class="extend-btn" @click="handleExtend">延长寄存</button>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			orderInfo: {
				orderNo: 'YXB20241201001',
				lockerName: '上海高铁站寄存柜',
				lockerNo: '21号柜',
				lockerSize: '大',
				location: '上海高铁站西广场路北100米KFC门口',
				storeTime: '2024-12-01 14:30',
				expectedPickupTime: '2024-12-01 18:00',
				price: '¥15.00',
				status: '寄存中'
			}
		}
	},
	methods: {
		// 去取出
		handleRetrieve() {
			uni.showModal({
				title: '确认取件',
				content: '确定要取出寄存的物品吗？',
				success: (res) => {
					if (res.confirm) {
						uni.showLoading({
							title: '处理中...'
						});
						
						setTimeout(() => {
							uni.hideLoading();
							uni.showToast({
								title: '取件成功',
								icon: 'success'
							});
							
							// 这里可以添加取件逻辑
							setTimeout(() => {
								uni.navigateBack();
							}, 1500);
						}, 2000);
					}
				}
			});
		},
		
		// 延长寄存
		handleExtend() {
			uni.showActionSheet({
				itemList: ['延长1小时', '延长2小时', '延长4小时', '延长8小时'],
				success: (res) => {
					const hours = [1, 2, 4, 8][res.tapIndex];
					const cost = hours * 5; // 每小时5元
					
					uni.showModal({
						title: '延长寄存',
						content: `延长${hours}小时，费用¥${cost}.00，确定延长吗？`,
						success: (modalRes) => {
							if (modalRes.confirm) {
								uni.showToast({
									title: `已延长${hours}小时`,
									icon: 'success'
								});
							}
						}
					});
				}
			});
		}
	}
}
</script>

<style scoped>
.order-detail-container {
	min-height: 100vh;
	background-color: #f5f5f5;
	padding-bottom: 40rpx;
}

/* 状态区域 */
.status-section {
	background-color: #007aff;
	padding: 60rpx 40rpx;
	color: #ffffff;
}

.status-card {
	text-align: center;
}

.status-icon {
	font-size: 80rpx;
	margin-bottom: 20rpx;
}

.status-text {
	font-size: 36rpx;
	font-weight: bold;
	display: block;
	margin-bottom: 10rpx;
}

.status-desc {
	font-size: 28rpx;
	opacity: 0.9;
}

/* 寄存柜信息 */
.locker-section {
	background-color: #ffffff;
	margin: 20rpx;
	border-radius: 16rpx;
	padding: 40rpx;
}

.section-title {
	font-size: 32rpx;
	color: #333333;
	font-weight: 500;
	margin-bottom: 30rpx;
}

.locker-card {
	display: flex;
	align-items: flex-start;
}

.locker-image {
	width: 120rpx;
	height: 120rpx;
	background-color: #f0f0f0;
	border-radius: 12rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 30rpx;
	flex-shrink: 0;
}

.locker-img {
	width: 100%;
	height: 100%;
	border-radius: 12rpx;
}

.locker-info {
	flex: 1;
}

.locker-title {
	font-size: 32rpx;
	color: #333333;
	font-weight: 500;
	display: block;
	margin-bottom: 15rpx;
}

.locker-detail {
	font-size: 28rpx;
	color: #666666;
	display: block;
	margin-bottom: 15rpx;
}

.location-info {
	display: flex;
	align-items: flex-start;
}

.location-icon {
	font-size: 24rpx;
	margin-right: 10rpx;
	margin-top: 4rpx;
}

.location-text {
	font-size: 26rpx;
	color: #666666;
	line-height: 1.4;
	flex: 1;
}

/* 订单信息 */
.order-info-section {
	background-color: #ffffff;
	margin: 20rpx;
	border-radius: 16rpx;
	padding: 40rpx;
}

.info-card {
	background-color: #f8f9fa;
	border-radius: 12rpx;
	padding: 30rpx;
}

.info-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #e9ecef;
}

.info-item:last-child {
	border-bottom: none;
}

.info-label {
	font-size: 28rpx;
	color: #666666;
}

.info-value {
	font-size: 28rpx;
	color: #333333;
}

.info-value.price {
	color: #ff4757;
	font-weight: 500;
}

/* 操作按钮 */
.action-section {
	padding: 40rpx;
	display: flex;
	gap: 20rpx;
}

.retrieve-btn {
	flex: 2;
	height: 88rpx;
	background-color: #007aff;
	color: #ffffff;
	border: none;
	border-radius: 8rpx;
	font-size: 32rpx;
	font-weight: 500;
}

.extend-btn {
	flex: 1;
	height: 88rpx;
	background-color: #ffffff;
	color: #007aff;
	border: 2rpx solid #007aff;
	border-radius: 8rpx;
	font-size: 28rpx;
}

.retrieve-btn:active {
	background-color: #0056cc;
}

.extend-btn:active {
	background-color: #f0f8ff;
}
</style> 