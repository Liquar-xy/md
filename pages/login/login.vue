<template>
	<view class="login-container">
		<!-- 标题区域 -->
		<view class="title-section">
			<text class="main-title">账号登录</text>
			<text class="welcome-text">欢迎登录优小宝</text>
		</view>
		
		<!-- 登录类型选择 -->
		<view class="login-type-section">
			<view class="type-buttons">
				<button 
					class="type-btn" 
					:class="{ active: loginType === 'user' }"
					@click="selectLoginType('user')"
				>
					用户登录
				</button>
				<button 
					class="type-btn" 
					:class="{ active: loginType === 'admin' }"
					@click="selectLoginType('admin')"
				>
					管理员登录
				</button>
			</view>
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
			
			<view class="input-group">
				<text class="input-label">验证码</text>
				<view class="verify-code-container">
					<input 
						class="input-field verify-input" 
						type="text" 
						placeholder="请输入验证码" 
						v-model="verifyCode"
						maxlength="4"
					/>
					<button 
						class="verify-btn" 
						:class="{ disabled: countdown > 0 }"
						@click="handleGetVerifyCode"
						:disabled="countdown > 0"
					>
						{{ countdown > 0 ? countdown + '秒' : '获取验证码' }}
					</button>
				</view>
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
			account: '13661740781', // 预设测试手机号
			password: '200621', // 预设测试密码
			verifyCode: '',
			loginType: 'user', // 默认选择用户登录
			countdown: 0 // 验证码倒计时
		}
	},
	methods: {
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
		
		// 获取验证码
		handleGetVerifyCode() {
			if (!this.account) {
				uni.showToast({
					title: '请先输入手机号',
					icon: 'none'
				});
				return;
			}
			
			if (!/^1[3-9]\d{9}$/.test(this.account)) {
				uni.showToast({
					title: '请输入正确的手机号',
					icon: 'none'
				});
				return;
			}
			
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
			
			// 调用后端发送短信接口
			uni.request({
				url: 'http://localhost:8000/sendSms',
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
			
			if (!this.verifyCode) {
				uni.showToast({
					title: '请输入验证码',
					icon: 'none'
				});
				return;
			}
			
			if (this.verifyCode.length !== 4) {
				uni.showToast({
					title: '验证码格式不正确',
					icon: 'none'
				});
				return;
			}
			
			// 根据登录类型调用不同的登录接口
			uni.showLoading({
				title: '登录中...'
			});
			
			let loginUrl, loginData;
			
			if (this.loginType === 'admin') {
				// 管理员登录接口
				loginUrl = 'http://localhost:8000/adminLogin';
				loginData = {
					mobile: this.account,
					password: this.password,
					smsCode: this.verifyCode
				};
			} else {
				// 用户登录接口
				loginUrl = 'http://localhost:8000/login';
				loginData = {
					mobile: this.account,
					password: this.password,
					smsCode: this.verifyCode,
					username: 'user'
				};
			}
			
			console.log('登录类型:', this.loginType);
			console.log('登录接口:', loginUrl);
			console.log('登录请求参数:', loginData);
			
			uni.request({
				url: loginUrl,
				method: 'POST',
				data: loginData,
				header: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				success: (res) => {
					uni.hideLoading();
					console.log('登录响应:', res.data);
					console.log('响应数据类型:', typeof res.data.code);
					console.log('响应code值:', res.data.code);
					console.log('响应code是否等于200:', res.data.code === 200);
					console.log('响应code是否等于"200":', res.data.code === "200");
					
					if (res.data && (res.data.code === 200 || res.data.code === "200")) {
						// 登录成功
						console.log('后端返回的完整数据:', res.data);
						console.log('后端返回的id字段:', res.data.id);
						console.log('当前账号:', this.account);
						
						let loginData;
						
						if (this.loginType === 'admin') {
							// 管理员登录数据
							loginData = {
								username: '管理员',
								phoneNumber: this.account,
								account: this.account,
								loginType: this.loginType,
								token: res.data.token,
								userId: res.data.id || this.account,
								id: res.data.id || this.account,
								isLoggedIn: true
							};
						} else {
							// 用户登录数据
							loginData = {
								username: '智慧存0987',
								phoneNumber: this.account,
								account: this.account,
								loginType: this.loginType,
								token: res.data.token,
								userId: res.data.id || this.account,
								id: res.data.id || this.account,
								isLoggedIn: true
							};
						}
						
						// 保存登录信息到本地存储
						try {
							if (this.loginType === 'admin') {
								uni.setStorageSync('adminData', JSON.stringify(loginData));
							} else {
								uni.setStorageSync('userData', JSON.stringify(loginData));
							}
							console.log('登录数据已保存');
						} catch (e) {
							console.log('保存登录数据失败:', e);
						}
						
						// 立即跳转，不等待toast
						console.log('登录成功，开始跳转');
						console.log('当前登录类型:', this.loginType);
						
						// 根据登录类型跳转到不同页面
						console.log('准备执行跳转...');
						console.log('当前登录类型:', this.loginType);
						
						if (this.loginType === 'admin') {
							// 管理员登录跳转到管理员页面
							console.log('跳转到管理员页面');
							uni.reLaunch({
								url: '/pages/admin/admin',
								success: () => {
									console.log('管理员页面跳转成功');
									uni.showToast({
										title: '登录成功',
										icon: 'success'
									});
								},
								fail: (err) => {
									console.log('管理员页面跳转失败:', err);
									uni.showToast({
										title: '跳转失败',
										icon: 'none'
									});
								}
							});
						} else {
							// 用户登录跳转到我的页面
							console.log('跳转到我的页面');
							uni.reLaunch({
								url: '/pages/my/my',
								success: () => {
									console.log('我的页面跳转成功');
									uni.showToast({
										title: '登录成功',
										icon: 'success'
									});
								},
								fail: (err) => {
									console.log('我的页面跳转失败:', err);
									uni.showToast({
										title: '跳转失败',
										icon: 'none'
									});
								}
							});
						}
					} else {
						// 登录失败
						console.log('登录失败详情:', res.data);
						uni.showToast({
							title: res.data?.msg || '登录失败',
							icon: 'none'
						});
					}
				},
				fail: (err) => {
					uni.hideLoading();
					console.log('登录请求失败:', err);
					uni.showToast({
						title: '网络错误，请重试',
						icon: 'none'
					});
				}
			});
		},
		

	}
}
</script>

<style scoped>
.login-container {
	min-height: 100vh;
	background-color: #f8f9fa;
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

/* 登录类型选择样式 */
.login-type-section {
	margin-bottom: 60rpx;
}

.type-buttons {
	display: flex;
	gap: 20rpx;
}

.type-btn {
	flex: 1;
	height: 80rpx;
	background-color: #ffffff;
	color: #666666;
	border: 2rpx solid #e5e5e5;
	border-radius: 8rpx;
	font-size: 28rpx;
	font-weight: 500;
	transition: all 0.3s ease;
}

.type-btn.active {
	background-color: #007aff;
	color: #ffffff;
	border-color: #007aff;
}

.type-btn:active {
	transform: scale(0.98);
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

/* 验证码输入框样式 */
.verify-code-container {
	display: flex;
	align-items: center;
	gap: 20rpx;
	flex: 1;
}

.verify-input {
	flex: 1;
}

.verify-btn {
	width: 200rpx;
	height: 80rpx;
	background-color: #007aff;
	color: #ffffff;
	border: none;
	border-radius: 8rpx;
	font-size: 24rpx;
	font-weight: 500;
	white-space: nowrap;
	text-align: center;
	transition: all 0.3s ease;
}

.verify-btn.disabled {
	background-color: #cccccc;
	color: #999999;
}

.verify-btn:active {
	transform: scale(0.98);
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