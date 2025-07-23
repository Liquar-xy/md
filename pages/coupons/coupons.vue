<template>
	<view class="coupons-container">
		<!-- 页面标题 -->
		<view class="header">
			<text class="title">优惠卡券</text>
			<text class="subtitle">享受更多优惠，省钱更轻松</text>
		</view>
		
		<!-- 优惠券列表 -->
		<view class="coupons-section">
			<text class="section-title">我的优惠券</text>
			
			<view class="coupon-item" v-for="(coupon, index) in coupons" :key="index">
				<view class="coupon-left">
					<view class="coupon-amount">
						<text class="amount-symbol">¥</text>
						<text class="amount-number">{{ coupon.amount }}</text>
					</view>
					<text class="coupon-condition">满{{ coupon.condition }}可用</text>
				</view>
				<view class="coupon-right">
					<text class="coupon-title">{{ coupon.title }}</text>
					<text class="coupon-desc">{{ coupon.description }}</text>
					<text class="coupon-date">有效期至：{{ coupon.expireDate }}</text>
					<button class="use-btn" @click="handleUseCoupon(coupon)">立即使用</button>
				</view>
				<view class="coupon-status" v-if="coupon.status === 'used'">
					<text class="status-text">已使用</text>
				</view>
			</view>
		</view>
		
		<!-- 会员卡 -->
		<view class="membership-section">
			<text class="section-title">会员卡</text>
			<view class="membership-card">
				<view class="card-header">
					<view class="card-icon">👑</view>
					<view class="card-info">
						<text class="card-title">优小宝会员卡</text>
						<text class="card-level">黄金会员</text>
					</view>
				</view>
				<view class="card-content">
					<view class="benefit-item">
						<text class="benefit-icon">💰</text>
						<text class="benefit-text">享受9折优惠</text>
					</view>
					<view class="benefit-item">
						<text class="benefit-icon">🎁</text>
						<text class="benefit-text">生日当月免费寄存2小时</text>
					</view>
					<view class="benefit-item">
						<text class="benefit-icon">⭐</text>
						<text class="benefit-text">积分双倍累积</text>
					</view>
				</view>
				<view class="card-footer">
					<text class="card-number">会员号：VIP888888</text>
					<text class="card-points">积分：1280</text>
				</view>
			</view>
		</view>
		
		<!-- 积分商城 -->
		<view class="points-section">
			<text class="section-title">积分商城</text>
			<view class="points-items">
				<view class="points-item" @click="handleExchange('coupon')">
					<view class="item-icon">🎫</view>
					<text class="item-name">5元优惠券</text>
					<text class="item-points">500积分</text>
				</view>
				<view class="points-item" @click="handleExchange('free')">
					<view class="item-icon">⏰</view>
					<text class="item-name">免费寄存1小时</text>
					<text class="item-points">300积分</text>
				</view>
				<view class="points-item" @click="handleExchange('discount')">
					<view class="item-icon">🏷️</view>
					<text class="item-name">8折优惠券</text>
					<text class="item-points">800积分</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			coupons: [
				{
					id: 1,
					title: '新用户专享券',
					description: '首次使用寄存服务',
					amount: 10,
					condition: 20,
					expireDate: '2024-12-31',
					status: 'available'
				},
				{
					id: 2,
					title: '周末特惠券',
					description: '仅限周末使用',
					amount: 5,
					condition: 15,
					expireDate: '2024-12-15',
					status: 'available'
				},
				{
					id: 3,
					title: '生日优惠券',
					description: '生日当月专享',
					amount: 15,
					condition: 30,
					expireDate: '2024-12-31',
					status: 'used'
				}
			]
		}
	},
	methods: {
		// 使用优惠券
		handleUseCoupon(coupon) {
			if (coupon.status === 'used') {
				uni.showToast({
					title: '优惠券已使用',
					icon: 'none'
				});
				return;
			}
			
			uni.showModal({
				title: '使用优惠券',
				content: `确定要使用"${coupon.title}"吗？`,
				success: (res) => {
					if (res.confirm) {
						// 这里可以添加使用优惠券的逻辑
						uni.showToast({
							title: '优惠券使用成功',
							icon: 'success'
						});
					}
				}
			});
		},
		
		// 积分兑换
		handleExchange(type) {
			let itemName = '';
			let points = 0;
			
			switch(type) {
				case 'coupon':
					itemName = '5元优惠券';
					points = 500;
					break;
				case 'free':
					itemName = '免费寄存1小时';
					points = 300;
					break;
				case 'discount':
					itemName = '8折优惠券';
					points = 800;
					break;
			}
			
			uni.showModal({
				title: '积分兑换',
				content: `确定要使用${points}积分兑换"${itemName}"吗？`,
				success: (res) => {
					if (res.confirm) {
						uni.showToast({
							title: '兑换成功',
							icon: 'success'
						});
					}
				}
			});
		}
	}
}
</script>

<style scoped>
.coupons-container {
	min-height: 100vh;
	background-color: #f5f5f5;
	padding: 40rpx;
}

.header {
	text-align: center;
	margin-bottom: 60rpx;
}

.title {
	font-size: 48rpx;
	color: #333333;
	font-weight: bold;
	display: block;
	margin-bottom: 20rpx;
}

.subtitle {
	font-size: 28rpx;
	color: #666666;
}

.section-title {
	font-size: 32rpx;
	color: #333333;
	font-weight: 500;
	margin-bottom: 30rpx;
	display: block;
}

.coupons-section {
	margin-bottom: 40rpx;
}

.coupon-item {
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
	display: flex;
	align-items: center;
	position: relative;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.coupon-left {
	background: linear-gradient(135deg, #ff4757, #ff6b7a);
	color: #ffffff;
	padding: 30rpx;
	border-radius: 12rpx;
	margin-right: 30rpx;
	text-align: center;
	min-width: 120rpx;
}

.coupon-amount {
	display: flex;
	align-items: baseline;
	justify-content: center;
	margin-bottom: 10rpx;
}

.amount-symbol {
	font-size: 24rpx;
	margin-right: 4rpx;
}

.amount-number {
	font-size: 48rpx;
	font-weight: bold;
}

.coupon-condition {
	font-size: 20rpx;
	opacity: 0.9;
}

.coupon-right {
	flex: 1;
}

.coupon-title {
	font-size: 30rpx;
	color: #333333;
	font-weight: 500;
	display: block;
	margin-bottom: 8rpx;
}

.coupon-desc {
	font-size: 24rpx;
	color: #666666;
	display: block;
	margin-bottom: 8rpx;
}

.coupon-date {
	font-size: 22rpx;
	color: #999999;
	display: block;
	margin-bottom: 15rpx;
}

.use-btn {
	background-color: #007aff;
	color: #ffffff;
	padding: 12rpx 24rpx;
	border-radius: 6rpx;
	font-size: 24rpx;
	border: none;
}

.coupon-status {
	position: absolute;
	top: 0;
	right: 0;
	background-color: rgba(0, 0, 0, 0.7);
	color: #ffffff;
	padding: 8rpx 16rpx;
	border-radius: 0 16rpx 0 12rpx;
}

.status-text {
	font-size: 20rpx;
}

.membership-section {
	margin-bottom: 40rpx;
}

.membership-card {
	background: linear-gradient(135deg, #ffd700, #ffed4e);
	border-radius: 16rpx;
	padding: 40rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.card-header {
	display: flex;
	align-items: center;
	margin-bottom: 30rpx;
}

.card-icon {
	font-size: 60rpx;
	margin-right: 20rpx;
}

.card-title {
	font-size: 32rpx;
	color: #333333;
	font-weight: bold;
	display: block;
	margin-bottom: 8rpx;
}

.card-level {
	font-size: 24rpx;
	color: #666666;
}

.card-content {
	margin-bottom: 30rpx;
}

.benefit-item {
	display: flex;
	align-items: center;
	margin-bottom: 15rpx;
}

.benefit-item:last-child {
	margin-bottom: 0;
}

.benefit-icon {
	font-size: 28rpx;
	margin-right: 15rpx;
}

.benefit-text {
	font-size: 26rpx;
	color: #333333;
}

.card-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-top: 20rpx;
	border-top: 1rpx solid rgba(0, 0, 0, 0.1);
}

.card-number, .card-points {
	font-size: 24rpx;
	color: #666666;
}

.points-items {
	display: flex;
	justify-content: space-between;
}

.points-item {
	flex: 1;
	background-color: #ffffff;
	border-radius: 12rpx;
	padding: 30rpx;
	margin: 0 10rpx;
	text-align: center;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.item-icon {
	font-size: 50rpx;
	margin-bottom: 15rpx;
}

.item-name {
	font-size: 26rpx;
	color: #333333;
	font-weight: 500;
	display: block;
	margin-bottom: 10rpx;
}

.item-points {
	font-size: 24rpx;
	color: #ff4757;
	font-weight: 500;
}
</style> 