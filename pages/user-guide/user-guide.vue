<template>
	<view class="user-guide-container">
		<!-- 页面标题 -->
		<view class="header">
			<text class="title">使用指南</text>
			<text class="subtitle">轻松掌握寄存服务的使用方法</text>
		</view>
		
		<!-- 使用步骤 -->
		<view class="steps-section">
			<text class="section-title">使用步骤</text>
			
			<view class="step-item">
				<view class="step-number">1</view>
				<view class="step-content">
					<text class="step-title">选择寄存柜</text>
					<text class="step-desc">在首页选择附近的寄存柜，查看柜子大小和价格</text>
				</view>
			</view>
			
			<view class="step-item">
				<view class="step-number">2</view>
				<view class="step-content">
					<text class="step-title">扫码开柜</text>
					<text class="step-desc">使用手机扫描柜子上的二维码，系统会自动分配柜子</text>
				</view>
			</view>
			
			<view class="step-item">
				<view class="step-number">3</view>
				<view class="step-content">
					<text class="step-title">存放物品</text>
					<text class="step-desc">将物品放入柜子，确认柜门关闭后离开</text>
				</view>
			</view>
			
			<view class="step-item">
				<view class="step-number">4</view>
				<view class="step-content">
					<text class="step-title">取件支付</text>
					<text class="step-desc">返回时在订单页面点击"去取出"，完成支付后取件</text>
				</view>
			</view>
		</view>
		
		<!-- 注意事项 -->
		<view class="notice-section">
			<text class="section-title">注意事项</text>
			<view class="notice-list">
				<view class="notice-item">
					<text class="notice-icon">⚠️</text>
					<text class="notice-text">请勿存放贵重物品、易碎品或违禁品</text>
				</view>
				<view class="notice-item">
					<text class="notice-icon">⚠️</text>
					<text class="notice-text">寄存时间超过24小时将收取额外费用</text>
				</view>
				<view class="notice-item">
					<text class="notice-icon">⚠️</text>
					<text class="notice-text">取件时请确认柜门完全关闭</text>
				</view>
				<view class="notice-item">
					<text class="notice-icon">⚠️</text>
					<text class="notice-text">如遇问题请及时联系客服</text>
				</view>
			</view>
		</view>
		
		<!-- 柜子类型 -->
		<view class="locker-types-section">
			<text class="section-title">柜子类型</text>
			<view class="locker-types">
				<view class="locker-type">
					<view class="locker-icon">📦</view>
					<text class="locker-name">大柜</text>
					<text class="locker-desc">适合行李箱、大背包</text>
					<text class="locker-price">¥5/小时</text>
				</view>
				<view class="locker-type">
					<view class="locker-icon">🎒</view>
					<text class="locker-name">小柜</text>
					<text class="locker-desc">适合小背包、手提包</text>
					<text class="locker-price">¥3/小时</text>
				</view>
			</view>
		</view>
		
		<!-- 视频教程 -->
		<view class="video-section">
			<text class="section-title">视频教程</text>
			<view class="video-item" @click="handleVideo">
				<view class="video-icon">▶️</view>
				<view class="video-info">
					<text class="video-title">寄存服务使用教程</text>
					<text class="video-desc">详细演示寄存服务的完整流程</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			
		}
	},
	methods: {
		// 播放视频教程
		handleVideo() {
			uni.showModal({
				title: '视频教程',
				content: '视频教程功能正在开发中，敬请期待！',
				showCancel: false
			});
		}
	}
}
</script>

<style scoped>
.user-guide-container {
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

.steps-section {
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 40rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.step-item {
	display: flex;
	align-items: flex-start;
	margin-bottom: 40rpx;
}

.step-item:last-child {
	margin-bottom: 0;
}

.step-number {
	width: 60rpx;
	height: 60rpx;
	background-color: #007aff;
	color: #ffffff;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
	font-weight: bold;
	margin-right: 30rpx;
	flex-shrink: 0;
}

.step-content {
	flex: 1;
}

.step-title {
	font-size: 30rpx;
	color: #333333;
	font-weight: 500;
	display: block;
	margin-bottom: 10rpx;
}

.step-desc {
	font-size: 26rpx;
	color: #666666;
	line-height: 1.5;
}

.notice-section {
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 40rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.notice-list {
	
}

.notice-item {
	display: flex;
	align-items: flex-start;
	margin-bottom: 20rpx;
}

.notice-item:last-child {
	margin-bottom: 0;
}

.notice-icon {
	font-size: 32rpx;
	margin-right: 20rpx;
	margin-top: 4rpx;
}

.notice-text {
	font-size: 26rpx;
	color: #666666;
	line-height: 1.5;
	flex: 1;
}

.locker-types-section {
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 40rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.locker-types {
	display: flex;
	justify-content: space-between;
}

.locker-type {
	flex: 1;
	text-align: center;
	padding: 30rpx;
	background-color: #f8f9fa;
	border-radius: 12rpx;
	margin: 0 10rpx;
}

.locker-icon {
	font-size: 60rpx;
	margin-bottom: 20rpx;
}

.locker-name {
	font-size: 28rpx;
	color: #333333;
	font-weight: 500;
	display: block;
	margin-bottom: 10rpx;
}

.locker-desc {
	font-size: 24rpx;
	color: #666666;
	display: block;
	margin-bottom: 15rpx;
}

.locker-price {
	font-size: 26rpx;
	color: #ff4757;
	font-weight: 500;
}

.video-section {
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 40rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.video-item {
	display: flex;
	align-items: center;
	padding: 30rpx;
	background-color: #f8f9fa;
	border-radius: 12rpx;
}

.video-icon {
	font-size: 50rpx;
	margin-right: 30rpx;
}

.video-info {
	flex: 1;
}

.video-title {
	font-size: 28rpx;
	color: #333333;
	font-weight: 500;
	display: block;
	margin-bottom: 8rpx;
}

.video-desc {
	font-size: 24rpx;
	color: #666666;
}
</style> 