<template>
	<view class="login-container">
		<!-- 标题区域 -->
		<view class="title-section">
			<text class="main-title">账号登录</text>
			<text class="welcome-text">欢迎登录优小宝</text>
		</view>
		
		<!-- 表单区域 -->
		<view class="form-section">
			<view class="input-group">
				<text class="input-label">账号</text>
				<input 
					class="input-field" 
					type="text" 
					placeholder="请输入手机号" 
					v-model="account"
					maxlength="11"
				/>
			</view>
			
			<view class="input-group">
				<text class="input-label">密码</text>
				<input 
					class="input-field" 
					type="password" 
					placeholder="请输入密码" 
					v-model="password"
				/>
			</view>
			
			<button class="login-btn" @click="handleLogin">登录</button>
		</view>
		
		<!-- 底部logo区域 -->
		<view class="footer-section">
			<view class="logo-container">
				<view class="logo">
					<text class="logo-text">优小宝</text>
				</view>
				<view class="tagline">
					<text class="tagline-text">智存无忧</text>
					<text class="tagline-text">安心随行</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			account: '',
			password: ''
		}
	},
	methods: {
		handleLogin() {
			if (!this.account) {
				uni.showToast({
					title: '请输入手机号',
					icon: 'none'
				});
				return;
			}
			
			if (!this.password) {
				uni.showToast({
					title: '请输入密码',
					icon: 'none'
				});
				return;
			}
			
			// 这里可以添加登录逻辑
			console.log('登录信息:', {
				account: this.account,
				password: this.password
			});
			
			// 保存登录用户信息到本地存储
			try {
				const userData = {
					username: '智慧存0987', // 登录后的默认用户名
					phoneNumber: this.account, // 使用输入的手机号
					avatarUrl: '' // 默认空头像
				};
				uni.setStorageSync('userData', JSON.stringify(userData));
				console.log('登录用户数据已保存');
			} catch (e) {
				console.log('保存登录数据失败:', e);
			}
			
			uni.showToast({
				title: '登录成功',
				icon: 'success',
				success: () => {
					// 延迟跳转，让用户看到成功提示
					setTimeout(() => {
						uni.reLaunch({
							url: '/pages/my/my'
						});
					}, 1500);
				}
			});
		}
	}
}
</script>

<style scoped>
.login-container {
	min-height: 100vh;
	background-color: #ffffff;
	display: flex;
	flex-direction: column;
	padding: 0 40rpx;
}

.title-section {
	text-align: center;
	margin-top: 120rpx;
	margin-bottom: 80rpx;
}

.main-title {
	font-size: 36rpx;
	color: #333333;
	font-weight: 500;
	display: block;
	margin-bottom: 20rpx;
}

.welcome-text {
	font-size: 48rpx;
	color: #333333;
	font-weight: bold;
	display: block;
}

.form-section {
	flex: 1;
}

.input-group {
	margin-bottom: 40rpx;
	display: flex;
	align-items: center;
}

.input-label {
	font-size: 32rpx;
	color: #333333;
	width: 120rpx;
	text-align: left;
}

.input-field {
	flex: 1;
	height: 80rpx;
	border: 2rpx solid #e5e5e5;
	border-radius: 8rpx;
	padding: 0 20rpx;
	font-size: 28rpx;
	background-color: #ffffff;
}

.input-field:focus {
	border-color: #007aff;
}

.login-btn {
	width: 100%;
	height: 88rpx;
	background-color: #007aff;
	color: #ffffff;
	border: none;
	border-radius: 8rpx;
	font-size: 32rpx;
	font-weight: 500;
	margin-top: 60rpx;
}

.login-btn:active {
	background-color: #0056cc;
}

.footer-section {
	margin-top: auto;
	padding-bottom: 60rpx;
}

.logo-container {
	display: flex;
	align-items: center;
	justify-content: center;
}

.logo {
	width: 80rpx;
	height: 80rpx;
	background-color: #333333;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 20rpx;
}

.logo-text {
	color: #ffffff;
	font-size: 24rpx;
	font-weight: bold;
}

.tagline {
	display: flex;
	flex-direction: column;
}

.tagline-text {
	font-size: 24rpx;
	color: #666666;
	line-height: 1.5;
}
</style> 