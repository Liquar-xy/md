<template>
	<scroll-view class="user-guide-container" scroll-y="true" :show-scrollbar="false">
		<!-- 顶部导航 -->
		<view class="nav-header">
			<view class="nav-back" @click="goBack">
				<text class="back-icon">←</text>
			</view>
			<text class="nav-title">寄存指南</text>
			<view class="nav-placeholder"></view>
		</view>
		
		<!-- 主标题 -->
		<view class="main-header">
			<text class="main-title">优小宝</text>
			<text class="main-subtitle">智能寄存，安全可靠</text>
		</view>
		
		<!-- 使用流程分割线 -->
		<view class="section-divider">
			<view class="divider-line"></view>
			<text class="divider-text">使用流程</text>
			<view class="divider-line"></view>
		</view>
		
		<!-- 步骤1：选择寄存点 -->
		<view class="step-card">
			<view class="step-content">
				<view class="step-image-container">
					<view class="phone-mockup">
						<view class="phone-frame">
							<view class="phone-screen">
								<view class="app-header">
									<text class="app-title">便捷储物舱</text>
								</view>
								<view class="search-section">
									<view class="search-bar">
										<text class="search-icon">🔍</text>
										<text class="search-placeholder">搜索火车站/地铁站/景点</text>
									</view>
								</view>
								<view class="location-list">
									<view class="location-item active">
										<view class="location-dot"></view>
										<text class="location-name">郑州站</text>
										<text class="location-distance">500m</text>
									</view>
									<view class="location-item">
										<view class="location-dot"></view>
										<text class="location-name">郑州东站</text>
										<text class="location-distance">2.1km</text>
									</view>
									<view class="location-item">
										<view class="location-dot"></view>
										<text class="location-name">二七广场</text>
										<text class="location-distance">1.8km</text>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
				<view class="step-info">
					<view class="step-number">01</view>
					<view class="step-description">
						<text class="step-title">选择寄存点</text>
						<text class="step-desc">在首页搜索或选择附近的寄存点</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 步骤2：查看详情 -->
		<view class="step-card">
			<view class="step-content">
				<view class="step-image-container">
					<view class="phone-mockup">
						<view class="phone-frame">
							<view class="phone-screen">
								<view class="detail-header">
									<text class="detail-title">郑州站寄存点</text>
									<text class="detail-address">郑州市二七区...</text>
								</view>
								<view class="locker-grid">
									<view class="locker-type-card">
										<text class="locker-icon">📦</text>
										<text class="locker-name">小柜</text>
										<text class="locker-count">12个</text>
									</view>
									<view class="locker-type-card">
										<text class="locker-icon">📦</text>
										<text class="locker-name">中柜</text>
										<text class="locker-count">8个</text>
									</view>
									<view class="locker-type-card">
										<text class="locker-icon">📦</text>
										<text class="locker-name">大柜</text>
										<text class="locker-count">5个</text>
									</view>
								</view>
								<view class="action-button">
									<text class="button-text">立即寄存</text>
								</view>
							</view>
						</view>
					</view>
				</view>
				<view class="step-info">
					<view class="step-number">02</view>
					<view class="step-description">
						<text class="step-title">查看详情</text>
						<text class="step-desc">查看寄存点可用柜子类型和数量</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 扫码寄存分割线 -->
		<view class="section-divider">
			<view class="divider-line"></view>
			<text class="divider-text">扫码寄存</text>
			<view class="divider-line"></view>
		</view>
		
		<!-- 步骤3：扫码开柜 -->
		<view class="step-card">
			<view class="step-content">
				<view class="step-image-container">
					<view class="qr-section">
						<view class="qr-code-frame">
							<view class="qr-code">
								<view class="qr-pattern">
									<view class="qr-corner tl"></view>
									<view class="qr-corner tr"></view>
									<view class="qr-corner bl"></view>
									<view class="qr-corner br"></view>
									<view class="qr-dots">
										<view class="qr-dot"></view>
										<view class="qr-dot"></view>
										<view class="qr-dot"></view>
										<view class="qr-dot"></view>
										<view class="qr-dot"></view>
										<view class="qr-dot"></view>
									</view>
								</view>
							</view>
						</view>
						<text class="qr-instruction">扫描柜子上的二维码</text>
					</view>
				</view>
				<view class="step-info">
					<view class="step-number">03</view>
					<view class="step-description">
						<text class="step-title">扫码开柜</text>
						<text class="step-desc">扫描二维码，系统自动分配柜子</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 步骤4：存放物品 -->
		<view class="step-card">
			<view class="step-content">
				<view class="step-image-container">
					<view class="storage-visual">
						<view class="locker-cabinet">
							<view class="locker-door open">
								<view class="door-handle"></view>
							</view>
							<view class="storage-space">
								<view class="storage-item bag">🎒</view>
								<view class="storage-item box">📦</view>
							</view>
						</view>
						<text class="storage-instruction">将物品放入柜子并关门</text>
					</view>
				</view>
				<view class="step-info">
					<view class="step-number">04</view>
					<view class="step-description">
						<text class="step-title">存放物品</text>
						<text class="step-desc">放入物品，确认柜门完全关闭</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 取件流程分割线 -->
		<view class="section-divider">
			<view class="divider-line"></view>
			<text class="divider-text">取件流程</text>
			<view class="divider-line"></view>
		</view>
		
		<!-- 步骤5：订单管理 -->
		<view class="step-card">
			<view class="step-content">
				<view class="step-image-container">
					<view class="phone-mockup">
						<view class="phone-frame">
							<view class="phone-screen">
								<view class="order-header">
									<text class="order-title">我的订单</text>
								</view>
								<view class="order-card">
									<view class="order-status">
										<text class="status-text">寄存中</text>
										<text class="status-time">2小时30分</text>
									</view>
									<view class="order-details">
										<text class="order-location">郑州站寄存点</text>
										<text class="order-locker">21号柜 (大柜)</text>
									</view>
									<view class="order-action-btn">
										<text class="action-btn-text">去取出</text>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
				<view class="step-info">
					<view class="step-number">05</view>
					<view class="step-description">
						<text class="step-title">订单管理</text>
						<text class="step-desc">查看寄存记录，点击去取出</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 步骤6：支付取件 -->
		<view class="step-card">
			<view class="step-content">
				<view class="step-image-container">
					<view class="payment-visual">
						<view class="payment-card">
							<view class="payment-header">
								<text class="payment-title">寄存费用</text>
								<text class="payment-amount">¥12.00</text>
							</view>
							<view class="payment-detail">
								<text class="detail-text">寄存时长：2小时30分</text>
							</view>
							<view class="payment-methods">
								<view class="payment-method selected">
									<text class="method-icon">💳</text>
									<text class="method-name">微信支付</text>
									<view class="method-check">✓</view>
								</view>
								<view class="payment-method">
									<text class="method-icon">💰</text>
									<text class="method-name">支付宝</text>
								</view>
							</view>
							<view class="pay-btn">
								<text class="pay-btn-text">立即支付</text>
							</view>
						</view>
					</view>
				</view>
				<view class="step-info">
					<view class="step-number">06</view>
					<view class="step-description">
						<text class="step-title">支付取件</text>
						<text class="step-desc">支付费用后柜门自动打开</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 温馨提示分割线 -->
		<view class="section-divider">
			<view class="divider-line"></view>
			<text class="divider-text">温馨提示</text>
			<view class="divider-line"></view>
		</view>
		
		<!-- 温馨提示内容 -->
		<view class="tips-section">
			<view class="tip-item">
				<text class="tip-bullet">•</text>
				<text class="tip-text">请勿存放贵重物品、易燃易爆品或违禁品</text>
			</view>
			<view class="tip-item">
				<text class="tip-bullet">•</text>
				<text class="tip-text">建议寄存时间不超过24小时，超时将产生额外费用</text>
			</view>
			<view class="tip-item">
				<text class="tip-bullet">•</text>
				<text class="tip-text">存取物品时请确认柜门完全关闭，听到提示音</text>
			</view>
			<view class="tip-item">
				<text class="tip-bullet">•</text>
				<text class="tip-text">如遇问题请及时联系客服：400-123-4567</text>
			</view>
		</view>
		
		<!-- 底部间距 -->
		<view class="bottom-spacing"></view>
	</scroll-view>
</template>

<script>
export default {
	data() {
		return {
			
		}
	},
	methods: {
		// 返回上一页
		goBack() {
			uni.navigateBack();
		}
	}
}
</script>

<style scoped>
.user-guide-container {
	min-height: 100vh;
	background-color: #f8f9ff;
	padding: 0;
}

/* 顶部导航 */
.nav-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 30rpx;
	background-color: #ffffff;
	border-bottom: 1rpx solid #f0f0f0;
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 100;
}

.nav-back {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.back-icon {
	font-size: 36rpx;
	color: #333333;
}

.nav-title {
	font-size: 32rpx;
	color: #333333;
	font-weight: 500;
}

.nav-placeholder {
	width: 60rpx;
}

/* 主标题区域 */
.main-header {
	text-align: center;
	padding: 140rpx 0 40rpx;
	background-color: #ffffff;
}

.main-title {
	font-size: 48rpx;
	color: #333333;
	font-weight: bold;
	display: block;
	margin-bottom: 16rpx;
}

.main-subtitle {
	font-size: 28rpx;
	color: #666666;
}

/* 分割线 */
.section-divider {
	display: flex;
	align-items: center;
	margin: 60rpx 40rpx 40rpx;
}

.divider-line {
	flex: 1;
	height: 2rpx;
	background-color: #e5e5e5;
}

.divider-text {
	font-size: 28rpx;
	color: #666666;
	padding: 0 30rpx;
	background-color: #ffffff;
}

/* 步骤卡片 */
.step-card {
	margin: 0 30rpx 50rpx;
	background-color: #ffffff;
	border-radius: 20rpx;
	padding: 40rpx;
	border: 1rpx solid #f0f0f0;
}

.step-content {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.step-image-container {
	width: 100%;
	display: flex;
	justify-content: center;
	margin-bottom: 30rpx;
}

/* 手机模拟器 */
.phone-mockup {
	position: relative;
}

.phone-frame {
	width: 280rpx;
	height: 500rpx;
	background-color: #333333;
	border-radius: 40rpx;
	padding: 20rpx;
	border: 2rpx solid #666666;
}

.phone-screen {
	width: 100%;
	height: 100%;
	background-color: #ffffff;
	border-radius: 30rpx;
	padding: 20rpx;
	overflow: hidden;
}

.app-header {
	text-align: center;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
}

.app-title {
	font-size: 24rpx;
	color: #333333;
	font-weight: 500;
}

.search-section {
	padding: 20rpx 0;
}

.search-bar {
	display: flex;
	align-items: center;
	background-color: #f5f5f5;
	border-radius: 20rpx;
	padding: 16rpx 20rpx;
}

.search-icon {
	font-size: 20rpx;
	margin-right: 10rpx;
}

.search-placeholder {
	font-size: 20rpx;
	color: #999999;
}

.location-list {
	padding: 10rpx 0;
}

.location-item {
	display: flex;
	align-items: center;
	padding: 16rpx 0;
	border-bottom: 1rpx solid #f8f8f8;
}

.location-item.active {
	background-color: #f0f7ff;
	border-radius: 10rpx;
	padding: 16rpx 10rpx;
}

.location-dot {
	width: 12rpx;
	height: 12rpx;
	background-color: #007aff;
	border-radius: 50%;
	margin-right: 16rpx;
}

.location-name {
	font-size: 20rpx;
	color: #333333;
	flex: 1;
}

.location-distance {
	font-size: 18rpx;
	color: #999999;
}

/* 详情页面样式 */
.detail-header {
	text-align: center;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
}

.detail-title {
	font-size: 22rpx;
	color: #333333;
	font-weight: 500;
	display: block;
	margin-bottom: 8rpx;
}

.detail-address {
	font-size: 18rpx;
	color: #999999;
}

.locker-grid {
	display: flex;
	justify-content: space-between;
	padding: 20rpx 0;
}

.locker-type-card {
	flex: 1;
	text-align: center;
	padding: 16rpx 8rpx;
	margin: 0 4rpx;
	background-color: #f8f9fa;
	border-radius: 10rpx;
}

.locker-icon {
	font-size: 24rpx;
	display: block;
	margin-bottom: 8rpx;
}

.locker-name {
	font-size: 18rpx;
	color: #333333;
	display: block;
	margin-bottom: 4rpx;
}

.locker-count {
	font-size: 16rpx;
	color: #666666;
}

.action-button {
	background-color: #007aff;
	border-radius: 20rpx;
	padding: 16rpx;
	text-align: center;
	margin-top: 20rpx;
}

.button-text {
	font-size: 20rpx;
	color: #ffffff;
	font-weight: 500;
}

/* 二维码区域 */
.qr-section {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.qr-code-frame {
	width: 200rpx;
	height: 200rpx;
	background-color: #ffffff;
	border-radius: 20rpx;
	padding: 20rpx;
	border: 1rpx solid #e0e0e0;
	margin-bottom: 30rpx;
}

.qr-code {
	width: 100%;
	height: 100%;
	position: relative;
	background-color: #ffffff;
	border: 2rpx solid #333333;
}

.qr-pattern {
	width: 100%;
	height: 100%;
	position: relative;
}

.qr-corner {
	position: absolute;
	width: 30rpx;
	height: 30rpx;
	border: 4rpx solid #333333;
}

.qr-corner.tl {
	top: 10rpx;
	left: 10rpx;
	border-right: none;
	border-bottom: none;
}

.qr-corner.tr {
	top: 10rpx;
	right: 10rpx;
	border-left: none;
	border-bottom: none;
}

.qr-corner.bl {
	bottom: 10rpx;
	left: 10rpx;
	border-right: none;
	border-top: none;
}

.qr-corner.br {
	bottom: 10rpx;
	right: 10rpx;
	border-left: none;
	border-top: none;
}

.qr-dots {
	position: absolute;
	top: 50rpx;
	left: 50rpx;
	display: flex;
	flex-wrap: wrap;
	width: 60rpx;
	height: 60rpx;
}

.qr-dot {
	width: 8rpx;
	height: 8rpx;
	background-color: #333333;
	margin: 2rpx;
}

.qr-instruction {
	font-size: 26rpx;
	color: #666666;
	text-align: center;
}

/* 储物柜视觉效果 */
.storage-visual {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.locker-cabinet {
	width: 200rpx;
	height: 150rpx;
	background-color: #e8e8e8;
	border-radius: 10rpx;
	position: relative;
	margin-bottom: 30rpx;
}

.locker-door {
	width: 80rpx;
	height: 120rpx;
	background-color: #007aff;
	border-radius: 8rpx;
	position: absolute;
	top: 15rpx;
	left: 15rpx;
	transform-origin: left center;
}

.locker-door.open {
	left: 5rpx;
	width: 70rpx;
}

.door-handle {
	width: 8rpx;
	height: 20rpx;
	background-color: #ffffff;
	border-radius: 4rpx;
	position: absolute;
	right: 10rpx;
	top: 50rpx;
}

.storage-space {
	position: absolute;
	right: 20rpx;
	top: 30rpx;
	display: flex;
	flex-direction: column;
}

.storage-item {
	font-size: 24rpx;
	margin-bottom: 10rpx;
}

.storage-instruction {
	font-size: 26rpx;
	color: #666666;
	text-align: center;
}

/* 订单卡片 */
.order-header {
	text-align: center;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
}

.order-title {
	font-size: 22rpx;
	color: #333333;
	font-weight: 500;
}

.order-card {
	padding: 20rpx;
	background-color: #f8f9fa;
	border-radius: 10rpx;
	margin-top: 20rpx;
}

.order-status {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16rpx;
}

.status-text {
	font-size: 18rpx;
	color: #007aff;
	font-weight: 500;
}

.status-time {
	font-size: 16rpx;
	color: #666666;
}

.order-details {
	margin-bottom: 16rpx;
}

.order-location {
	font-size: 20rpx;
	color: #333333;
	display: block;
	margin-bottom: 8rpx;
}

.order-locker {
	font-size: 18rpx;
	color: #666666;
}

.order-action-btn {
	background-color: #007aff;
	border-radius: 16rpx;
	padding: 12rpx;
	text-align: center;
}

.action-btn-text {
	font-size: 18rpx;
	color: #ffffff;
}

/* 支付界面 */
.payment-visual {
	display: flex;
	justify-content: center;
}

.payment-card {
	width: 280rpx;
	background-color: #ffffff;
	border-radius: 20rpx;
	padding: 30rpx;
	border: 1rpx solid #e0e0e0;
}

.payment-header {
	text-align: center;
	margin-bottom: 20rpx;
}

.payment-title {
	font-size: 24rpx;
	color: #333333;
	display: block;
	margin-bottom: 10rpx;
}

.payment-amount {
	font-size: 36rpx;
	color: #ff4757;
	font-weight: bold;
}

.payment-detail {
	text-align: center;
	margin-bottom: 30rpx;
}

.detail-text {
	font-size: 20rpx;
	color: #666666;
}

.payment-methods {
	margin-bottom: 30rpx;
}

.payment-method {
	display: flex;
	align-items: center;
	padding: 16rpx;
	border-radius: 10rpx;
	margin-bottom: 10rpx;
	background-color: #f8f9fa;
}

.payment-method.selected {
	background-color: #e8f4ff;
	border: 1rpx solid #007aff;
}

.method-icon {
	font-size: 24rpx;
	margin-right: 16rpx;
}

.method-name {
	font-size: 20rpx;
	color: #333333;
	flex: 1;
}

.method-check {
	font-size: 20rpx;
	color: #007aff;
}

.pay-btn {
	background-color: #007aff;
	border-radius: 20rpx;
	padding: 16rpx;
	text-align: center;
}

.pay-btn-text {
	font-size: 20rpx;
	color: #ffffff;
	font-weight: 500;
}

/* 步骤信息 */
.step-info {
	display: flex;
	align-items: center;
	width: 100%;
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

.step-description {
	flex: 1;
}

.step-title {
	font-size: 32rpx;
	color: #333333;
	font-weight: 600;
	display: block;
	margin-bottom: 12rpx;
}

.step-desc {
	font-size: 26rpx;
	color: #666666;
	line-height: 1.5;
}

/* 温馨提示 */
.tips-section {
	background-color: #ffffff;
	border-radius: 20rpx;
	padding: 40rpx;
	margin: 0 30rpx 40rpx;
	border: 1rpx solid #f0f0f0;
}

.tip-item {
	display: flex;
	align-items: flex-start;
	margin-bottom: 24rpx;
}

.tip-item:last-child {
	margin-bottom: 0;
}

.tip-bullet {
	font-size: 28rpx;
	color: #007aff;
	margin-right: 20rpx;
	margin-top: 4rpx;
	font-weight: bold;
}

.tip-text {
	font-size: 26rpx;
	color: #666666;
	line-height: 1.6;
	flex: 1;
}

/* 底部间距 */
.bottom-spacing {
	height: 60rpx;
}
</style> 