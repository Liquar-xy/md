<template>
	<view class="login-container">
		<!-- 头部 -->
		<view class="header">
			<view class="header-left">
				<text class="back-icon" @click="handleBack">←</text>
			</view>
			<view class="header-center">
				<text class="header-title">管理员登录</text>
			</view>
		</view>
		
		<!-- 登录表单 -->
		<view class="login-form">
			<view class="form-header">
				<text class="form-title">管理员登录</text>
				<text class="form-subtitle">请输入您的登录信息</text>
			</view>
			
			<view class="form-group">
				<label class="form-label">手机号</label>
				<input 
					class="form-input" 
					type="text" 
					v-model="loginForm.mobile" 
					placeholder="请输入手机号"
					maxlength="11"
				/>
			</view>
			
			<view class="form-group">
				<label class="form-label">密码</label>
				<input 
					class="form-input" 
					type="password" 
					v-model="loginForm.password" 
					placeholder="请输入密码"
				/>
			</view>
			
			<view class="form-group">
				<label class="form-label">验证码</label>
				<view class="sms-group">
					<input 
						class="form-input sms-input" 
						type="text" 
						v-model="loginForm.smsCode" 
						placeholder="请输入验证码"
						maxlength="4"
					/>
					<button 
						class="sms-btn" 
						:disabled="smsCountdown > 0"
						@click="sendSmsCode"
					>
						{{ smsCountdown > 0 ? `${smsCountdown}s` : '获取验证码' }}
					</button>
				</view>
			</view>
			
			<button class="login-btn" @click="handleLogin" :disabled="isLoading">
				<text v-if="isLoading">登录中...</text>
				<text v-else>登录</text>
			</button>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			loginForm: {
				mobile: '13800138000',
				password: '123456',
				smsCode: '1234'
			},
			isLoading: false,
			smsCountdown: 0,
			timer: null
		}
	},
	
	onLoad() {
		console.log('管理员登录页面加载');
	},
	
	onUnload() {
		if (this.timer) {
			clearInterval(this.timer);
		}
	},
	
	methods: {
		// 返回
		handleBack() {
			uni.navigateBack();
		},
		
		// 发送验证码
		sendSmsCode() {
			if (!this.loginForm.mobile) {
				uni.showToast({
					title: '请先输入手机号',
					icon: 'none'
				});
				return;
			}
			
			if (!/^1[3-9]\d{9}$/.test(this.loginForm.mobile)) {
				uni.showToast({
					title: '请输入正确的手机号',
					icon: 'none'
				});
				return;
			}
			
			// 构建 URL 编码的表单数据
			const smsData = `mobile=${this.loginForm.mobile}&source=admin`;
			
			uni.request({
				url: 'http://localhost:8000/sendSms',
				method: 'POST',
				data: smsData,
				header: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				success: (res) => {
					if (res.data && (res.data.code === 200 || res.data.code === "200")) {
						uni.showToast({
							title: '验证码已发送',
							icon: 'success'
						});
						
						this.smsCountdown = 60;
						this.timer = setInterval(() => {
							this.smsCountdown--;
							if (this.smsCountdown <= 0) {
								clearInterval(this.timer);
							}
						}, 1000);
					} else {
						uni.showToast({
							title: res.data?.msg || '发送失败',
							icon: 'none'
						});
					}
				},
				fail: (err) => {
					console.error('发送验证码失败:', err);
					uni.showToast({
						title: '网络错误，请重试',
						icon: 'none'
					});
				}
			});
		},
		
		// 登录
		handleLogin() {
			if (!this.loginForm.mobile) {
				uni.showToast({
					title: '请输入手机号',
					icon: 'none'
				});
				return;
			}
			
			if (!this.loginForm.password) {
				uni.showToast({
					title: '请输入密码',
					icon: 'none'
				});
				return;
			}
			
			if (!this.loginForm.smsCode) {
				uni.showToast({
					title: '请输入验证码',
					icon: 'none'
				});
				return;
			}
			
			if (!/^\d{4}$/.test(this.loginForm.smsCode)) {
				uni.showToast({
					title: '请输入4位验证码',
					icon: 'none'
				});
				return;
			}
			
			this.isLoading = true;
			
			// 构建 URL 编码的表单数据
			const loginData = `mobile=${this.loginForm.mobile}&password=${this.loginForm.password}&smsCode=${this.loginForm.smsCode}`;
			
			uni.request({
				url: 'http://localhost:8000/admin/login',
				method: 'POST',
				data: loginData,
				header: { 
					'Content-Type': 'application/x-www-form-urlencoded' 
				},
				success: (res) => {
					if (res.data && (res.data.code === 200 || res.data.code === "200")) {
						// 保存登录信息
						uni.setStorageSync('adminToken', res.data.token || 'admin-token');
						uni.setStorageSync('adminId', String(res.data.id || '1'));
						uni.setStorageSync('adminMobile', this.loginForm.mobile);
						
						// 直接跳转到管理员主页
						uni.reLaunch({
							url: '/pages/admin/admin'
						});
						
					} else {
						uni.showToast({
							title: res.data?.msg || '登录失败',
							icon: 'none'
						});
					}
				},
				fail: (err) => {
					console.error('登录请求失败:', err);
					uni.showToast({
						title: '网络请求失败，请检查网络连接',
						icon: 'none'
					});
				},
				complete: () => {
					this.isLoading = false;
				}
			});
		}
	}
}
</script>

<style scoped>
.login-container {
	min-height: 100vh;
	background-color: #f5f5f5;
}

.header {
	background-color: #ffffff;
	padding: 20rpx 40rpx;
	display: flex;
	align-items: center;
	border-bottom: 1rpx solid #f0f0f0;
}

.header-left {
	display: flex;
	align-items: center;
}

.back-icon {
	font-size: 36rpx;
	color: #333333;
	padding: 10rpx;
}

.header-title {
	font-size: 36rpx;
	color: #333333;
	font-weight: bold;
	margin-left: 20rpx;
}

.login-form {
	background-color: #ffffff;
	margin: 40rpx;
	padding: 60rpx 40rpx;
	border-radius: 20rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.form-header {
	text-align: center;
	margin-bottom: 60rpx;
}

.form-title {
	font-size: 48rpx;
	color: #333333;
	font-weight: bold;
	display: block;
	margin-bottom: 20rpx;
}

.form-subtitle {
	font-size: 28rpx;
	color: #666666;
	display: block;
}

.form-group {
	margin-bottom: 40rpx;
}

.form-label {
	font-size: 32rpx;
	color: #333333;
	margin-bottom: 20rpx;
	display: block;
}

.form-input {
	width: 100%;
	height: 88rpx;
	border: 2rpx solid #e0e0e0;
	border-radius: 12rpx;
	padding: 0 24rpx;
	font-size: 32rpx;
	background-color: #ffffff;
	box-sizing: border-box;
}

.form-input:focus {
	border-color: #007bff;
}

.sms-group {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.sms-input {
	flex: 1;
}

.sms-btn {
	width: 200rpx;
	height: 88rpx;
	background-color: #007bff;
	color: #ffffff;
	border: none;
	border-radius: 12rpx;
	font-size: 28rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.sms-btn:disabled {
	background-color: #cccccc;
	color: #666666;
}

.login-btn {
	width: 100%;
	height: 88rpx;
	background-color: #007bff;
	color: #ffffff;
	border: none;
	border-radius: 12rpx;
	font-size: 32rpx;
	font-weight: bold;
	margin-top: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.login-btn:disabled {
	background-color: #cccccc;
}
</style> 