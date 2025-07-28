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
			
			<!-- 开发测试用快速登录 -->
			<view class="quick-login" @click="quickLogin">
				<text class="quick-login-text">快速登录（测试）</text>
			</view>
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
	onLoad() {
		// 检查是否已经登录
		this.checkLoginStatus();
	},
	methods: {
		// 检查登录状态
		checkLoginStatus() {
			const token = uni.getStorageSync('token');
			const userData = uni.getStorageSync('userData');
			
			if (token && userData) {
				console.log('用户已登录，跳转到首页');
				uni.reLaunch({
					url: '/pages/index/index'
				});
			}
		},
		
		// 验证手机号格式
		validatePhone(phone) {
			const phoneRegex = /^1[3-9]\d{9}$/;
			return phoneRegex.test(phone);
		},
		
		// 处理登录
		async handleLogin() {
			// 表单验证
			if (!this.account.trim()) {
				uni.showToast({
					title: '请输入手机号',
					icon: 'none'
				});
				return;
			}
			
			if (!this.validatePhone(this.account)) {
				uni.showToast({
					title: '请输入正确的手机号',
					icon: 'none'
				});
				return;
			}
			
			if (!this.password.trim()) {
				uni.showToast({
					title: '请输入密码',
					icon: 'none'
				});
				return;
			}
			
			if (this.password.length < 6) {
				uni.showToast({
					title: '密码至少6位',
					icon: 'none'
				});
				return;
			}
			
			// 显示登录中
			uni.showLoading({
				title: '登录中...'
			});
			
			try {
				// 模拟登录请求
				setTimeout(() => {
					try {
						// 模拟登录成功，保存用户信息
						const userData = {
							id: 1,
							username: '智慧存' + this.account.slice(-4),
							phone: this.account,
							avatar: '',
							nickname: '智慧存' + this.account.slice(-4)
						};
						
						// 保存token和用户信息
						uni.setStorageSync('token', 'mock_token_' + Date.now());
						uni.setStorageSync('userData', userData);
						uni.setStorageSync('loginTime', Date.now());
						
						console.log('登录成功，用户数据已保存:', userData);
						
						uni.hideLoading();
						uni.showToast({
							title: '登录成功',
							icon: 'success',
							duration: 1500
						});
						
						// 延迟跳转到首页
						setTimeout(() => {
							uni.reLaunch({
								url: '/pages/index/index'
							});
						}, 1500);
						
					} catch (error) {
						uni.hideLoading();
						console.error('保存登录数据失败:', error);
						uni.showToast({
							title: '登录失败，请重试',
							icon: 'none'
						});
					}
				}, 1000); // 模拟网络请求延迟
				
			} catch (error) {
				uni.hideLoading();
				console.error('登录失败:', error);
				
				uni.showToast({
					title: error.message || '登录失败，请重试',
					icon: 'none',
					duration: 2000
				});
			}
		},
		
		// 快速登录（测试用）
		quickLogin() {
			this.account = '13800138000';
			this.password = '123456';
			this.handleLogin();
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

.quick-login {
	text-align: center;
	margin-top: 30rpx;
	padding: 20rpx;
}

.quick-login-text {
	font-size: 26rpx;
	color: #007aff;
	text-decoration: underline;
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