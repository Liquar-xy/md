<template>
	<view class="edit-container">
		<!-- 头像编辑区域 -->
		<view class="avatar-section">
			<view class="avatar-container" @click="handleAvatarClick">
				<view class="avatar">
					<image v-if="avatarUrl" :src="avatarUrl" class="avatar-image" mode="aspectFill"></image>
					<text v-else class="avatar-icon">👤</text>
				</view>
				<view class="edit-overlay">
					<text class="edit-text">点击修改</text>
				</view>
			</view>
		</view>
		
		<!-- 用户信息编辑区域 -->
		<view class="info-section">
			<view class="info-item">
				<text class="info-label">用户名</text>
				<input 
					class="info-input" 
					type="text" 
					placeholder="请输入用户名" 
					v-model="username"
					maxlength="20"
				/>
			</view>
			
			<view class="info-item">
				<text class="info-label">手机号</text>
				<input 
					class="info-input" 
					type="number" 
					placeholder="请输入手机号" 
					v-model="phoneNumber"
					maxlength="11"
				/>
			</view>
		</view>
		
		<!-- 保存按钮 -->
		<view class="button-section">
			<button class="save-btn" @click="handleSave">保存修改</button>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			username: '智慧存0987',
			phoneNumber: '18512345678',
			avatarUrl: '' // 新增头像URL字段
		}
	},
	onLoad(options) {
		// 优先从本地存储获取用户信息
		this.loadUserData();
		
		// 如果本地没有数据，则使用传入的数据
		if (!this.username && options.username) {
			this.username = options.username;
		}
		if (!this.phoneNumber && options.phoneNumber) {
			this.phoneNumber = options.phoneNumber;
		}
		if (!this.avatarUrl && options.avatarUrl) {
			this.avatarUrl = options.avatarUrl;
		}
	},
	methods: {
		// 头像点击事件
		handleAvatarClick() {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					console.log('选择的图片:', res.tempFilePaths[0]);
					// 更新头像显示
					this.avatarUrl = res.tempFilePaths[0];
					
					uni.showToast({
						title: '头像选择成功',
						icon: 'success'
					});
					
					// 这里可以添加上传头像到服务器的逻辑
					// this.uploadAvatar(res.tempFilePaths[0]);
				},
				fail: (err) => {
					console.log('选择图片失败:', err);
					uni.showToast({
						title: '选择图片失败',
						icon: 'none'
					});
				}
			});
		},
		
		// 上传头像到服务器（可选）
		uploadAvatar(filePath) {
			uni.uploadFile({
				url: 'YOUR_UPLOAD_URL', // 替换为实际的上传地址
				filePath: filePath,
				name: 'avatar',
				success: (res) => {
					console.log('头像上传成功:', res);
					// 处理服务器返回的头像URL
					// this.avatarUrl = res.data.avatarUrl;
				},
				fail: (err) => {
					console.log('头像上传失败:', err);
					uni.showToast({
						title: '头像上传失败',
						icon: 'none'
					});
				}
			});
		},
		
		// 加载用户数据
		loadUserData() {
			try {
				const userData = uni.getStorageSync('userData');
				if (userData) {
					const data = JSON.parse(userData);
					this.username = data.username || '';
					this.phoneNumber = data.phoneNumber || '';
					this.avatarUrl = data.avatarUrl || '';
				}
			} catch (e) {
				console.log('加载用户数据失败:', e);
			}
		},
		
		// 保存用户数据到本地存储
		saveUserData() {
			try {
				const userData = {
					username: this.username,
					phoneNumber: this.phoneNumber,
					avatarUrl: this.avatarUrl
				};
				uni.setStorageSync('userData', JSON.stringify(userData));
				console.log('用户数据已保存到本地存储');
			} catch (e) {
				console.log('保存用户数据失败:', e);
			}
		},
		
		// 保存修改
		handleSave() {
			// 验证用户名
			if (!this.username.trim()) {
				uni.showToast({
					title: '请输入用户名',
					icon: 'none'
				});
				return;
			}
			
			// 验证手机号
			if (!this.phoneNumber) {
				uni.showToast({
					title: '请输入手机号',
					icon: 'none'
				});
				return;
			}
			
			// 验证手机号格式
			const phoneRegex = /^1[3-9]\d{9}$/;
			if (!phoneRegex.test(this.phoneNumber)) {
				uni.showToast({
					title: '请输入正确的手机号',
					icon: 'none'
				});
				return;
			}
			
			// 保存用户信息
			uni.showLoading({
				title: '保存中...'
			});
			
			// 保存到本地存储
			this.saveUserData();
			
			// 模拟保存过程
			setTimeout(() => {
				uni.hideLoading();
				
				// 这里可以添加保存到服务器的逻辑
				console.log('保存的用户信息:', {
					username: this.username,
					phoneNumber: this.phoneNumber,
					avatarUrl: this.avatarUrl
				});
				
				uni.showToast({
					title: '保存成功',
					icon: 'success',
					success: () => {
						// 延迟返回上一页
						setTimeout(() => {
							// 将修改后的信息传递回上一页
							const pages = getCurrentPages();
							const prevPage = pages[pages.length - 2];
							
							// 更新上一页的数据
							if (prevPage && prevPage.$vm) {
								prevPage.$vm.username = this.username;
								prevPage.$vm.phoneNumber = this.phoneNumber;
								prevPage.$vm.avatarUrl = this.avatarUrl;
								// 强制更新页面显示
								prevPage.$vm.$forceUpdate();
							}
							
							uni.navigateBack();
						}, 1500);
					}
				});
			}, 1000);
		}
	}
}
</script>

<style scoped>
.edit-container {
	min-height: 100vh;
	background-color: #f5f5f5;
	padding: 40rpx;
}

/* 头像编辑区域 */
.avatar-section {
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 60rpx;
	margin-bottom: 40rpx;
	text-align: center;
}

.avatar-container {
	position: relative;
	display: inline-block;
}

.avatar {
	width: 160rpx;
	height: 160rpx;
	background-color: #e0e0e0;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 0 auto;
}

.avatar-icon {
	font-size: 80rpx;
}

.avatar-image {
	width: 100%;
	height: 100%;
	border-radius: 50%;
}

.edit-overlay {
	position: absolute;
	bottom: -10rpx;
	left: 50%;
	transform: translateX(-50%);
	background-color: rgba(0, 0, 0, 0.7);
	color: #ffffff;
	padding: 8rpx 16rpx;
	border-radius: 20rpx;
}

.edit-text {
	font-size: 20rpx;
}

/* 用户信息编辑区域 */
.info-section {
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 40rpx;
	margin-bottom: 40rpx;
}

.info-item {
	margin-bottom: 40rpx;
}

.info-item:last-child {
	margin-bottom: 0;
}

.info-label {
	font-size: 28rpx;
	color: #333333;
	margin-bottom: 20rpx;
	display: block;
}

.info-input {
	width: 100%;
	height: 80rpx;
	border: 2rpx solid #e5e5e5;
	border-radius: 8rpx;
	padding: 0 20rpx;
	font-size: 28rpx;
	background-color: #ffffff;
	box-sizing: border-box;
}

.info-input:focus {
	border-color: #007aff;
}

/* 按钮区域 */
.button-section {
	padding: 40rpx 0;
}

.save-btn {
	width: 100%;
	height: 88rpx;
	background-color: #007aff;
	color: #ffffff;
	border: none;
	border-radius: 8rpx;
	font-size: 32rpx;
	font-weight: 500;
}

.save-btn:active {
	background-color: #0056cc;
}
</style> 