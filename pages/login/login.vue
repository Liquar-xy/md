<template>
	<view class="login-container">
		<!-- 标题区域 -->
		<view class="title-section">
			<text class="main-title">欢迎使用</text>
			<text class="welcome-text">智能寄存柜</text>
		</view>
		
		<!-- 表单区域 -->
		<view class="form-section">
			<!-- 登录类型选择 -->
			<view class="login-type-selector">
				<view class="type-option" :class="{ active: loginType === 'user' }" @click="selectLoginType('user')">
					<text>用户登录</text>
				</view>
				<view class="type-option" :class="{ active: loginType === 'admin' }" @click="selectLoginType('admin')">
					<text>管理员</text>
				</view>
			</view>
			
			<!-- 账号输入 -->
			<view class="input-group">
				<text class="input-label">账号</text>
				<input class="input-field" type="text" placeholder="请输入手机号" v-model="account" />
			</view>
			
			<!-- 密码输入 -->
			<view class="input-group">
				<text class="input-label">密码</text>
				<input class="input-field" type="password" placeholder="请输入密码" v-model="password" />
			</view>
			
			<!-- 登录按钮 -->
			<button class="login-btn" @click="handleLogin">登录</button>
			
			<!-- 快速登录 -->
			<view class="quick-login" @click="quickLogin">
				<text class="quick-login-text">快速登录（测试）</text>
			</view>
		</view>
		
		<!-- 底部区域 -->
		<view class="footer-section">
			<view class="logo-container">
				<view class="logo">
					<text class="logo-text">🏪</text>
				</view>
				<view class="tagline">
					<text class="tagline-text">智能寄存，便捷生活</text>
					<text class="tagline-text">让每一次出行都更轻松</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			loginType: 'user', // 'user' 或 'admin'
			account: '',
			password: '',
			verifyCode: '',
			countdown: 0
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
		
		// 选择登录类型
		selectLoginType(type) {
			this.loginType = type;
			console.log('切换到登录类型:', type);
			// 根据登录类型清空输入框
			this.account = '';
			this.password = '';
			this.verifyCode = '';
			// 重置倒计时
			this.countdown = 0;
		},
		
		// 验证手机号格式
		validatePhone(phone) {
			const phoneRegex = /^1[3-9]\d{9}$/;
			return phoneRegex.test(phone);
		},
		
		// 发送短信验证码
		sendSms() {
			// 如果是测试环境，可以预设一些测试数据
			console.log('发送验证码到手机:', this.account);

			// 立即开始倒计时（1分钟）
			this.countdown = 60;
			console.log('设置倒计时为:', this.countdown);

			// 立即开始倒计时
			this.startCountdown();

			// 根据登录类型调用不同的发送短信接口
			const smsData = {
				mobile: this.account
			};

			// 管理员登录需要特殊的source标识
			if (this.loginType === 'admin') {
				smsData.source = 'admin_login';
			} else {
				smsData.source = 'login';
			}

			// 统一的API基础URL
			const API_BASE_URL = 'http://localhost:8000';
			
			// 调用后端发送短信接口
			uni.request({
				url: `${API_BASE_URL}/api/auth/sms`,
				method: 'POST',
				data: smsData,
				header: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				success: (res) => {
					console.log('发送短信响应:', res.data);
					if (res.data && res.data.code === 200) {
						// 验证码已发送并存储在Redis中
						uni.showToast({
							title: '验证码已发送',
							icon: 'success'
						});
						console.log('验证码已发送到手机:', this.account, '并存储在Redis中');
					} else {
						uni.showToast({
							title: res.data?.msg || '发送失败',
							icon: 'none'
						});
						// 发送失败，重置倒计时
						this.countdown = 0;
					}
				},
				fail: (err) => {
					console.log('发送短信失败:', err);
					uni.showToast({
						title: '网络错误，请重试',
						icon: 'none'
					});
					// 发送失败，重置倒计时
					this.countdown = 0;
				}
			});
		},
		
		// 倒计时
		startCountdown() {
			console.log('当前倒计时:', this.countdown);
			
			if (this.countdown > 0) {
				setTimeout(() => {
					this.countdown--;
					this.startCountdown();
				}, 1000);
			}
		},

		// 处理登录
		handleLogin() {
			if (!this.account) {
				uni.showToast({
					title: '请输入账号',
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
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
	font-size: 48rpx;
	color: #ffffff;
	display: block;
	margin-bottom: 20rpx;
}

.welcome-text {
	font-size: 32rpx;
	color: #ffffff;
	font-weight: bold;
	display: block;
}

.form-section {
	flex: 1;
}

.login-type-selector {
	display: flex;
	margin-bottom: 40rpx;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 25rpx;
	padding: 8rpx;
}

.type-option {
	flex: 1;
	text-align: center;
	padding: 20rpx;
	border-radius: 20rpx;
	color: rgba(255, 255, 255, 0.7);
	transition: all 0.3s;
}

.type-option.active {
	background: rgba(255, 255, 255, 0.2);
	color: #ffffff;
}

.input-group {
	margin-bottom: 30rpx;
	display: flex;
	align-items: center;
}

.input-label {
	color: #ffffff;
	font-size: 28rpx;
	width: 120rpx;
	text-align: left;
}

.input-field {
	flex: 1;
	padding: 25rpx 30rpx;
	border: 2rpx solid rgba(255, 255, 255, 0.3);
	border-radius: 25rpx;
	color: #333333;
	font-size: 28rpx;
	background-color: #ffffff;
}

.input-field:focus {
	border-color: #007aff;
}

.login-btn {
	width: 100%;
	padding: 30rpx;
	background: linear-gradient(135deg, #007aff 0%, #0056cc 100%);
	color: #ffffff;
	border: none;
	border-radius: 25rpx;
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
	font-size: 28rpx;
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
	font-size: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 20rpx;
}

.logo-text {
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