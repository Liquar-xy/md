<template>
	<view class="profile-container">
		<!-- 头部导航 -->
		<view class="header">
			<view class="header-left">
				<text class="back-icon" @click="handleBack">←</text>
			</view>
			<view class="header-center">
				<text class="header-title">个人信息</text>
			</view>
			<view class="header-right">
				<text class="save-icon" @click="handleSave">💾</text>
			</view>
		</view>
		
		<!-- 头像区域 -->
		<view class="avatar-section">
			<view class="avatar-container" @click="handleChangeAvatar">
				<image class="avatar" :src="userInfo.avatar || '/static/logo.png'" mode="aspectFill"></image>
				<view class="avatar-edit">
					<text class="edit-icon">📷</text>
				</view>
			</view>
			<text class="avatar-tip">点击更换头像</text>
		</view>
		
		<!-- 个人信息表单 -->
		<view class="form-section">
			<view class="form-item">
				<text class="form-label">用户名</text>
				<input class="form-input" v-model="userInfo.username" placeholder="请输入用户名" />
			</view>
			
			<view class="form-item">
				<text class="form-label">真实姓名</text>
				<input class="form-input" v-model="userInfo.realName" placeholder="请输入真实姓名" />
			</view>
			
			<view class="form-item">
				<text class="form-label">手机号码</text>
				<input class="form-input" v-model="userInfo.phone" placeholder="请输入手机号码" type="number" />
			</view>
			
			<view class="form-item">
				<text class="form-label">邮箱地址</text>
				<input class="form-input" v-model="userInfo.email" placeholder="请输入邮箱地址" type="email" />
			</view>
			
			<view class="form-item">
				<text class="form-label">管理员ID</text>
				<input class="form-input" v-model="userInfo.adminId" placeholder="管理员ID" disabled />
			</view>
		</view>
		
		<!-- 功能按钮 -->
		<view class="action-section">
			<button class="action-btn primary" @click="handleSave">
				<text class="btn-icon">💾</text>
				<text class="btn-text">保存修改</text>
			</button>
			
			<button class="action-btn warning" @click="handleChangePassword">
				<text class="btn-icon">🔒</text>
				<text class="btn-text">修改密码</text>
			</button>
			
			<button class="action-btn danger" @click="handleLogout">
				<text class="btn-icon">🚪</text>
				<text class="btn-text">退出登录</text>
			</button>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			userInfo: {
				username: '管理员',
				realName: '',
				phone: '',
				email: '',
				adminId: '1',
				avatar: ''
			}
		}
	},
	onLoad() {
		this.loadUserInfo();
	},
	methods: {
		// 加载用户信息
		loadUserInfo() {
			try {
				const adminData = uni.getStorageSync('adminData');
				if (adminData) {
					const data = JSON.parse(adminData);
					this.userInfo.username = data.username || '管理员';
					// 支持多种字段名
					this.userInfo.adminId = data.userId || data.account || data.id || '';
					this.userInfo.realName = data.realName || '';
					this.userInfo.phone = data.phoneNumber || data.phone || '';
					this.userInfo.email = data.email || '';
					this.userInfo.avatar = data.avatar || '';
				}
			} catch (e) {
				console.log('加载用户信息失败:', e);
			}
		},
		
		// 返回
		handleBack() {
			uni.navigateBack();
		},
		
		// 保存修改
		handleSave() {
			// 验证必填字段
			if (!this.userInfo.username.trim()) {
				uni.showToast({
					title: '请输入用户名',
					icon: 'none'
				});
				return;
			}
			
			// 保存到本地存储
			try {
				const adminData = {
					username: this.userInfo.username,
					account: this.userInfo.adminId,
					realName: this.userInfo.realName,
					phone: this.userInfo.phone,
					email: this.userInfo.email,
					avatar: this.userInfo.avatar,
					loginType: 'admin'
				};
				
				uni.setStorageSync('adminData', JSON.stringify(adminData));
				
				uni.showToast({
					title: '保存成功',
					icon: 'success'
				});
			} catch (e) {
				console.log('保存失败:', e);
				uni.showToast({
					title: '保存失败',
					icon: 'none'
				});
			}
		},
		
		// 更换头像
		handleChangeAvatar() {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					this.userInfo.avatar = res.tempFilePaths[0];
					uni.showToast({
						title: '头像已更新',
						icon: 'success'
					});
				}
			});
		},
		
		// 修改密码
		handleChangePassword() {
			uni.showModal({
				title: '修改密码',
				content: '请联系系统管理员修改密码',
				showCancel: false
			});
		},
		
		// 退出登录
		handleLogout() {
			uni.showModal({
				title: '确认退出',
				content: '确定要退出登录吗？',
				success: (res) => {
					if (res.confirm) {
						// 清除本地存储的管理员数据
						try {
							uni.removeStorageSync('adminData');
							console.log('管理员数据已清除');
						} catch (e) {
							console.log('清除数据失败:', e);
						}
						
						// 显示退出成功提示
						uni.showToast({
							title: '已退出登录',
							icon: 'success',
							success: () => {
								// 延迟跳转到登录页面
								setTimeout(() => {
									uni.reLaunch({
										url: '/pages/login/login'
									});
								}, 1500);
							}
						});
					}
				}
			});
		}
	}
}
</script>

<style scoped>
.profile-container {
	min-height: 100vh;
	background-color: #f5f5f5;
}

/* 头部导航 */
.header {
	background-color: #ffffff;
	padding: 20rpx 40rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-bottom: 1rpx solid #f0f0f0;
}

.header-left, .header-right {
	display: flex;
	align-items: center;
}

.back-icon, .save-icon {
	font-size: 36rpx;
	color: #333333;
	padding: 10rpx;
}

.header-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
}

/* 头像区域 */
.avatar-section {
	background-color: #ffffff;
	padding: 60rpx 40rpx;
	text-align: center;
	margin-bottom: 20rpx;
}

.avatar-container {
	position: relative;
	display: inline-block;
	margin-bottom: 20rpx;
}

.avatar {
	width: 160rpx;
	height: 160rpx;
	border-radius: 80rpx;
	border: 4rpx solid #e0e0e0;
}

.avatar-edit {
	position: absolute;
	bottom: 0;
	right: 0;
	width: 50rpx;
	height: 50rpx;
	background-color: #007aff;
	border-radius: 25rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 4rpx solid #ffffff;
}

.edit-icon {
	font-size: 24rpx;
	color: #ffffff;
}

.avatar-tip {
	font-size: 24rpx;
	color: #999999;
}

/* 表单区域 */
.form-section {
	background-color: #ffffff;
	padding: 0 40rpx;
	margin-bottom: 20rpx;
}

.form-item {
	padding: 30rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
	display: flex;
	align-items: center;
}

.form-item:last-child {
	border-bottom: none;
}

.form-label {
	width: 160rpx;
	font-size: 28rpx;
	color: #333333;
}

.form-input {
	flex: 1;
	font-size: 28rpx;
	color: #333333;
	padding: 0;
}

.form-input:disabled {
	color: #999999;
	background-color: transparent;
}

/* 功能按钮 */
.action-section {
	padding: 40rpx;
}

.action-btn {
	width: 100%;
	height: 100rpx;
	border-radius: 50rpx;
	margin-bottom: 30rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
	font-size: 32rpx;
}

.action-btn.primary {
	background-color: #007aff;
	color: #ffffff;
}

.action-btn.warning {
	background-color: #ff9500;
	color: #ffffff;
}

.action-btn.danger {
	background-color: #ff3b30;
	color: #ffffff;
}

.btn-icon {
	margin-right: 10rpx;
	font-size: 28rpx;
}

.btn-text {
	font-size: 32rpx;
}
</style> 