<template>
	<view class="user-agreement-container">
		<!-- 页面标题 -->
		<view class="header">
			<text class="title">用户协议</text>
			<text class="subtitle">优小宝寄存服务用户协议与隐私政策</text>
		</view>
		
		<!-- 协议内容 -->
		<view class="agreement-content">
			<view class="section">
				<text class="section-title">一、服务说明</text>
				<text class="section-text">优小宝为用户提供智能寄存服务，通过手机APP扫码使用寄存柜，为用户提供安全、便捷的物品寄存服务。</text>
			</view>
			
			<view class="section">
				<text class="section-title">二、用户责任</text>
				<view class="subsection">
					<text class="subsection-title">2.1 物品安全</text>
					<text class="section-text">用户应妥善保管自己的物品，不得存放贵重物品、易碎品、违禁品等。因用户自身原因造成的物品损坏或遗失，平台不承担责任。</text>
				</view>
				<view class="subsection">
					<text class="subsection-title">2.2 使用规范</text>
					<text class="section-text">用户应按照使用说明正确使用寄存柜，确保柜门完全关闭。不得恶意损坏设备或影响其他用户使用。</text>
				</view>
				<view class="subsection">
					<text class="subsection-title">2.3 及时取件</text>
					<text class="section-text">用户应在约定时间内取件，超时取件将产生额外费用。超过7天未取件的物品，平台有权按相关规定处理。</text>
				</view>
			</view>
			
			<view class="section">
				<text class="section-title">三、费用说明</text>
				<view class="subsection">
					<text class="subsection-title">3.1 收费标准</text>
					<text class="section-text">寄存费用按小时计算，大柜5元/小时，小柜3元/小时，不足1小时按1小时计算。</text>
				</view>
				<view class="subsection">
					<text class="subsection-title">3.2 超时费用</text>
					<text class="section-text">超过约定时间取件，每小时加收1元超时费。超过24小时未取件，每日加收5元保管费。</text>
				</view>
				<view class="subsection">
					<text class="subsection-title">3.3 支付方式</text>
					<text class="section-text">支持微信支付、支付宝等多种支付方式，取件时统一结算费用。</text>
				</view>
			</view>
			
			<view class="section">
				<text class="section-title">四、隐私保护</text>
				<view class="subsection">
					<text class="subsection-title">4.1 信息收集</text>
					<text class="section-text">我们收集的信息包括：手机号码、使用记录、支付信息等，用于提供寄存服务和改善用户体验。</text>
				</view>
				<view class="subsection">
					<text class="subsection-title">4.2 信息使用</text>
					<text class="section-text">收集的信息仅用于服务提供、安全监控、客户服务等合法用途，不会向第三方泄露。</text>
				</view>
				<view class="subsection">
					<text class="subsection-title">4.3 信息保护</text>
					<text class="section-text">我们采用先进的安全技术保护用户信息，防止信息泄露、丢失或被非法使用。</text>
				</view>
			</view>
			
			<view class="section">
				<text class="section-title">五、免责声明</text>
				<text class="section-text">因不可抗力、设备故障、网络问题等原因导致的服务中断，平台不承担责任。用户因违反本协议造成的损失，由用户自行承担。</text>
			</view>
			
			<view class="section">
				<text class="section-title">六、协议修改</text>
				<text class="section-text">平台有权根据业务发展需要修改本协议，修改后的协议将在APP内公布，继续使用服务即表示同意修改后的协议。</text>
			</view>
			
			<view class="section">
				<text class="section-title">七、联系方式</text>
				<text class="section-text">如有疑问或建议，请联系客服热线：400-888-9999，或通过APP内在线客服咨询。</text>
			</view>
		</view>
		
		<!-- 底部按钮 -->
		<view class="footer">
			<button class="agree-btn" @click="handleAgree">我已阅读并同意</button>
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
		// 同意协议
		handleAgree() {
			uni.showModal({
				title: '确认同意',
				content: '您确认已阅读并同意用户协议吗？',
				success: (res) => {
					if (res.confirm) {
						// 这里可以添加同意协议的逻辑
						uni.showToast({
							title: '感谢您的确认',
							icon: 'success'
						});
						
						// 延迟返回上一页
						setTimeout(() => {
							uni.navigateBack();
						}, 1500);
					}
				}
			});
		}
	}
}
</script>

<style scoped>
.user-agreement-container {
	min-height: 100vh;
	background-color: #f5f5f5;
	padding: 40rpx;
	padding-bottom: 120rpx;
}

.header {
	text-align: center;
	margin-bottom: 40rpx;
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

.agreement-content {
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 40rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.section {
	margin-bottom: 40rpx;
}

.section:last-child {
	margin-bottom: 0;
}

.section-title {
	font-size: 32rpx;
	color: #333333;
	font-weight: bold;
	display: block;
	margin-bottom: 20rpx;
}

.section-text {
	font-size: 28rpx;
	color: #666666;
	line-height: 1.6;
	display: block;
}

.subsection {
	margin-bottom: 20rpx;
}

.subsection:last-child {
	margin-bottom: 0;
}

.subsection-title {
	font-size: 30rpx;
	color: #333333;
	font-weight: 500;
	display: block;
	margin-bottom: 15rpx;
}

.footer {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: #ffffff;
	padding: 30rpx 40rpx;
	border-top: 1rpx solid #f0f0f0;
}

.agree-btn {
	background-color: #007aff;
	color: #ffffff;
	padding: 25rpx;
	border-radius: 12rpx;
	font-size: 32rpx;
	border: none;
	width: 100%;
}
</style> 