<template>
	<view class="customer-service-container">
		<!-- 页面标题 -->
		<view class="header">
			<text class="title">在线客服</text>
			<text class="subtitle">为您提供专业的寄存服务支持</text>
		</view>
		
		<!-- 客服信息卡片 -->
		<view class="service-card">
			<view class="service-item">
				<view class="service-icon">📞</view>
				<view class="service-info">
					<text class="service-title">客服热线</text>
					<text class="service-desc">400-888-9999</text>
					<text class="service-time">服务时间：8:00-22:00</text>
				</view>
				<button class="call-btn" @click="handleCall">拨打</button>
			</view>
		</view>
		
		<!-- 在线客服 -->
		<view class="service-card">
			<view class="service-item">
				<view class="service-icon">💬</view>
				<view class="service-info">
					<text class="service-title">在线咨询</text>
					<text class="service-desc">智能客服为您解答问题</text>
					<text class="service-time">24小时在线服务</text>
				</view>
				<button class="chat-btn" @click="handleChat">开始咨询</button>
			</view>
		</view>
		
		<!-- 聊天框 -->
		<view class="chat-section" v-if="showChat">
			<view class="chat-header">
				<text class="chat-title">智能客服</text>
				<text class="chat-status">在线</text>
			</view>
			
			<!-- 消息列表 -->
			<scroll-view class="chat-messages" scroll-y="true" :scroll-top="scrollTop">
				<view class="message-list">
					<!-- 系统欢迎消息 -->
					<view class="message-item system-message">
						<view class="message-content">
							<text class="message-text">您好！我是优小宝智能客服，很高兴为您服务。请问有什么可以帮助您的吗？</text>
						</view>
						<text class="message-time">{{ getCurrentTime() }}</text>
					</view>
					
					<!-- 用户消息 -->
					<view class="message-item user-message" v-for="(message, index) in userMessages" :key="index">
						<view class="message-content">
							<text class="message-text">{{ message.content }}</text>
						</view>
						<text class="message-time">{{ message.time }}</text>
					</view>
					
					<!-- 客服回复 -->
					<view class="message-item service-message" v-for="(reply, index) in serviceReplies" :key="'reply-' + index">
						<view class="message-content">
							<text class="message-text">{{ reply.content }}</text>
						</view>
						<text class="message-time">{{ reply.time }}</text>
					</view>
				</view>
			</scroll-view>
			
			<!-- 输入框 -->
			<view class="chat-input-section">
				<view class="input-container">
					<input 
						class="chat-input" 
						type="text" 
						placeholder="请输入您的问题..." 
						v-model="inputMessage"
						@confirm="sendMessage"
						confirm-type="send"
					/>
					<button class="send-btn" @click="sendMessage" :disabled="!inputMessage.trim()">发送</button>
				</view>
			</view>
		</view>
		
		<!-- 常见问题 -->
		<view class="faq-section" v-if="!showChat">
			<text class="section-title">常见问题</text>
			<view class="faq-list">
				<view class="faq-item" @click="handleFAQ('寄存费用')">
					<text class="faq-question">寄存费用如何计算？</text>
					<text class="faq-arrow">></text>
				</view>
				<view class="faq-item" @click="handleFAQ('取件时间')">
					<text class="faq-question">可以延长寄存时间吗？</text>
					<text class="faq-arrow">></text>
				</view>
				<view class="faq-item" @click="handleFAQ('物品安全')">
					<text class="faq-question">寄存物品安全吗？</text>
					<text class="faq-arrow">></text>
				</view>
				<view class="faq-item" @click="handleFAQ('遗失物品')">
					<text class="faq-question">物品遗失怎么办？</text>
					<text class="faq-arrow">></text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			showChat: false,
			inputMessage: '',
			userMessages: [],
			serviceReplies: [],
			scrollTop: 0
		}
	},
	methods: {
		// 拨打客服电话
		handleCall() {
			uni.makePhoneCall({
				phoneNumber: '400-888-9999',
				success: () => {
					console.log('拨打电话成功');
				},
				fail: (err) => {
					console.log('拨打电话失败:', err);
					uni.showToast({
						title: '拨打电话失败',
						icon: 'none'
					});
				}
			});
		},
		
		// 开始在线咨询
		handleChat() {
			this.showChat = true;
			this.scrollToBottom();
		},
		
		// 发送消息
		sendMessage() {
			if (!this.inputMessage.trim()) {
				return;
			}
			
			// 添加用户消息
			const userMessage = {
				content: this.inputMessage,
				time: this.getCurrentTime()
			};
			this.userMessages.push(userMessage);
			
			// 清空输入框
			const message = this.inputMessage;
			this.inputMessage = '';
			
			// 滚动到底部
			this.scrollToBottom();
			
			// 模拟客服回复
			setTimeout(() => {
				this.generateReply(message);
			}, 1000);
		},
		
		// 生成客服回复
		generateReply(userMessage) {
			let reply = '';
			
			// 简单的关键词匹配回复
			if (userMessage.includes('费用') || userMessage.includes('价格') || userMessage.includes('多少钱')) {
				reply = '寄存费用按小时计算，大柜5元/小时，小柜3元/小时，不足1小时按1小时计算。';
			} else if (userMessage.includes('时间') || userMessage.includes('延长') || userMessage.includes('超时')) {
				reply = '可以延长寄存时间，在订单详情页面点击"延长寄存"按钮即可。超过约定时间每小时加收1元超时费。';
			} else if (userMessage.includes('安全') || userMessage.includes('保险')) {
				reply = '我们的寄存柜采用先进的电子锁技术，24小时监控，确保您的物品安全。建议不要存放贵重物品。';
			} else if (userMessage.includes('遗失') || userMessage.includes('丢失')) {
				reply = '如遇物品遗失，请立即联系客服热线400-888-9999，我们会协助您查找并处理相关事宜。';
			} else if (userMessage.includes('谢谢') || userMessage.includes('感谢')) {
				reply = '不客气！如果还有其他问题，随时可以咨询我。祝您使用愉快！';
			} else {
				reply = '感谢您的咨询！关于寄存服务，您可以询问费用、时间、安全等相关问题，我会为您详细解答。';
			}
			
			const serviceReply = {
				content: reply,
				time: this.getCurrentTime()
			};
			this.serviceReplies.push(serviceReply);
			
			// 滚动到底部
			this.scrollToBottom();
		},
		
		// 滚动到底部
		scrollToBottom() {
			setTimeout(() => {
				this.scrollTop = 9999;
			}, 100);
		},
		
		// 获取当前时间
		getCurrentTime() {
			const now = new Date();
			const hours = now.getHours().toString().padStart(2, '0');
			const minutes = now.getMinutes().toString().padStart(2, '0');
			return `${hours}:${minutes}`;
		},
		
		// 常见问题
		handleFAQ(type) {
			let content = '';
			switch(type) {
				case '寄存费用':
					content = '寄存费用按小时计算，每小时5元，不足1小时按1小时计算。大柜可存放行李箱等大件物品，小柜适合存放背包等小件物品。';
					break;
				case '取件时间':
					content = '可以延长寄存时间，在订单详情页面点击"延长寄存"按钮，可选择延长1小时、2小时、4小时或8小时。';
					break;
				case '物品安全':
					content = '我们的寄存柜采用先进的电子锁技术，每个柜子都有独立的密码，24小时监控，确保您的物品安全。';
					break;
				case '遗失物品':
					content = '如遇物品遗失，请立即联系客服热线400-888-9999，我们会协助您查找并处理相关事宜。';
					break;
			}
			
			uni.showModal({
				title: type,
				content: content,
				showCancel: false
			});
		}
	}
}
</script>

<style scoped>
.customer-service-container {
	min-height: 100vh;
	background-color: #f5f5f5;
	padding: 40rpx;
	padding-bottom: 40rpx;
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

.service-card {
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 40rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.service-item {
	display: flex;
	align-items: center;
}

.service-icon {
	font-size: 60rpx;
	margin-right: 30rpx;
}

.service-info {
	flex: 1;
}

.service-title {
	font-size: 32rpx;
	color: #333333;
	font-weight: 500;
	display: block;
	margin-bottom: 10rpx;
}

.service-desc {
	font-size: 28rpx;
	color: #666666;
	display: block;
	margin-bottom: 8rpx;
}

.service-time {
	font-size: 24rpx;
	color: #999999;
}

.call-btn, .chat-btn {
	background-color: #007aff;
	color: #ffffff;
	padding: 16rpx 32rpx;
	border-radius: 8rpx;
	font-size: 28rpx;
	border: none;
}

/* 聊天框样式 */
.chat-section {
	background-color: #ffffff;
	border-radius: 16rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
	height: 600rpx;
	display: flex;
	flex-direction: column;
}

.chat-header {
	background-color: #007aff;
	color: #ffffff;
	padding: 30rpx 40rpx;
	border-radius: 16rpx 16rpx 0 0;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.chat-title {
	font-size: 32rpx;
	font-weight: 500;
}

.chat-status {
	font-size: 24rpx;
	opacity: 0.9;
}

.chat-messages {
	flex: 1;
	padding: 30rpx;
	background-color: #f8f9fa;
}

.message-list {
	
}

.message-item {
	margin-bottom: 30rpx;
}

.message-content {
	max-width: 70%;
	padding: 20rpx 24rpx;
	border-radius: 20rpx;
	word-wrap: break-word;
}

.message-text {
	font-size: 28rpx;
	line-height: 1.4;
}

.message-time {
	font-size: 22rpx;
	color: #999999;
	margin-top: 10rpx;
	display: block;
}

/* 系统消息 */
.system-message {
	text-align: center;
}

.system-message .message-content {
	background-color: #e9ecef;
	color: #666666;
	margin: 0 auto;
}

/* 用户消息 */
.user-message {
	text-align: right;
}

.user-message .message-content {
	background-color: #007aff;
	color: #ffffff;
	margin-left: auto;
}

/* 客服消息 */
.service-message {
	text-align: left;
}

.service-message .message-content {
	background-color: #ffffff;
	color: #333333;
	border: 1rpx solid #e9ecef;
}

.chat-input-section {
	padding: 30rpx;
	border-top: 1rpx solid #f0f0f0;
}

.input-container {
	display: flex;
	align-items: center;
}

.chat-input {
	flex: 1;
	background-color: #f8f9fa;
	border: 1rpx solid #e9ecef;
	border-radius: 25rpx;
	padding: 20rpx 30rpx;
	font-size: 28rpx;
	margin-right: 20rpx;
}

.send-btn {
	background-color: #007aff;
	color: #ffffff;
	padding: 20rpx 30rpx;
	border-radius: 25rpx;
	font-size: 28rpx;
	border: none;
}

.send-btn:disabled {
	background-color: #cccccc;
}

.faq-section {
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 40rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.section-title {
	font-size: 32rpx;
	color: #333333;
	font-weight: 500;
	margin-bottom: 30rpx;
	display: block;
}

.faq-list {
	
}

.faq-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
}

.faq-item:last-child {
	border-bottom: none;
}

.faq-question {
	font-size: 28rpx;
	color: #333333;
}

.faq-arrow {
	font-size: 28rpx;
	color: #cccccc;
}
</style> 