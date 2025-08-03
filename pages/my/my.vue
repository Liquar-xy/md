<template>
	<view class="my-container">
		<!-- 用户信息区域 -->
		<view class="user-section" @click="handleUserClick">
			<view class="avatar-container">
				<view class="avatar">
					<image v-if="avatarUrl" :src="avatarUrl" class="avatar-image" mode="aspectFill"></image>
					<text v-else class="avatar-icon">👤</text>
				</view>
			</view>
			<view class="user-info">
				<text class="login-text" v-if="!isLoggedIn">点击登录</text>
				<text class="username" v-else>{{ username }}</text>
				<text class="phone-number" v-if="isLoggedIn">{{ maskedPhone }}</text>
			</view>
		</view>
		
		<!-- 我的订单区域 -->
		<view class="orders-section">
			<view class="section-header" @click="handleViewAllOrders">
				<text class="section-title">我的订单</text>
				<text class="view-all">全部订单></text>
			</view>
		</view>
		
		<!-- 我的服务区域 -->
		<view class="services-section">
			<text class="section-title">我的服务</text>
			<view class="service-list">
				<view class="service-item" @click="handleCustomerService">
					<text class="service-text">在线客服</text>
					<text class="arrow">></text>
				</view>
				<view class="service-item" @click="handleUserGuide">
					<text class="service-text">使用指南</text>
					<text class="arrow">></text>
				</view>
				<view class="service-item" @click="handleCoupons">
					<text class="service-text">优惠卡券</text>
					<text class="dev-tag">开发中</text>
					<text class="arrow">></text>
				</view>
				<view class="service-item" @click="handleUserAgreement">
					<text class="service-text">用户协议</text>
					<text class="arrow">></text>
				</view>
				<view class="service-item" @click="handleBackToLogin">
					<text class="service-text">回到登录页</text>
					<text class="arrow">></text>
				</view>
				<view class="service-item" @click="handleLogout">
					<text class="service-text">退出登录</text>
					<text class="arrow">></text>
				</view>
			</view>
		</view>
		
		<!-- 底部导航栏 -->
		<view class="bottom-nav">
			<view class="nav-item" @click="handleHomeClick">
				<text class="nav-icon">🏠</text>
				<text class="nav-text">首页</text>
			</view>
			<view class="nav-item" @click="handleOrdersClick">
				<text class="nav-icon">📋</text>
				<text class="nav-text">订单</text>
			</view>
			<view class="nav-item active" @click="handleMyClick">
				<text class="nav-icon">👤</text>
				<text class="nav-text">我的</text>
			</view>
		</view>
	</view>
</template>

<script>
import NavigationUtils from '@/utils/navigation.js';

export default {
	data() {
		return {
			isLoggedIn: true, // 假设已登录
			username: '智慧存0987',
			phoneNumber: '18512345678',
			avatarUrl: '' // 新增头像URL字段
		}
	},
	computed: {
		maskedPhone() {
			if (this.phoneNumber) {
				return this.phoneNumber.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
			}
			return '';
		}
	},
	onLoad() {
		// 检查登录状态
		this.checkLoginStatus();
	},
	
	onShow() {
		// 页面显示时重新检查登录状态
		this.checkLoginStatus();
	},
	methods: {
		// 检查登录状态
		checkLoginStatus() {
			const token = uni.getStorageSync('token');
			const userData = uni.getStorageSync('userData');

			if (!token || !userData) {
				console.log('用户未登录，跳转到登录页');
				this.isLoggedIn = false;
				uni.reLaunch({
					url: '/pages/login/login'
				});
				return;
			}

			// 加载用户数据
			this.loadUserData(userData);
		},

		// 加载用户数据
		loadUserData(userData) {
			try {
				if (userData) {
					this.username = userData.username || userData.nickname || '智慧存用户';
					this.phoneNumber = userData.phone || '';
					this.avatarUrl = userData.avatar || '';
					this.isLoggedIn = true;

					console.log('用户数据加载成功:', {
						username: this.username,
						phone: this.phoneNumber
					});
				}
			} catch (e) {
				console.error('加载用户数据失败:', e);
				this.handleLogout();
			}
		},
		
		// 用户信息点击事件
		handleUserClick() {
			if (!this.isLoggedIn) {
				uni.navigateTo({
					url: '/pages/login/login'
				});
			} else {
				// 跳转到用户信息编辑页面
				uni.navigateTo({
					url: `/pages/user-edit/user-edit?username=${encodeURIComponent(this.username)}&phoneNumber=${encodeURIComponent(this.phoneNumber)}&avatarUrl=${encodeURIComponent(this.avatarUrl)}`
				});
			}
		},
		
		// 查看全部订单
		handleViewAllOrders() {
			console.log('跳转到订单页面');
			// 直接跳转到订单页面
			uni.navigateTo({
				url: '/pages/orders/orders'
			});
		},
		

		
		// 去取出
		handleRetrieve() {
			uni.showModal({
				title: '确认取件',
				content: '确定要取出寄存的物品吗？',
				success: (res) => {
					if (res.confirm) {
						uni.showLoading({
							title: '处理中...'
						});
						
						setTimeout(() => {
							uni.hideLoading();
							uni.showToast({
								title: '取件成功',
								icon: 'success'
							});
							
							// 这里可以添加取件后的逻辑，比如隐藏订单
							setTimeout(() => {
								// 可以重新加载页面或更新订单状态
								this.loadUserData();
							}, 1500);
						}, 2000);
					}
				}
			});
		},
		
		// 在线客服
		handleCustomerService() {
			uni.navigateTo({
				url: '/pages/customer-service/customer-service'
			});
		},
		
		// 使用指南
		handleUserGuide() {
			uni.navigateTo({
				url: '/pages/user-guide/user-guide'
			});
		},
		
		// 优惠卡券
		handleCoupons() {
			uni.navigateTo({
				url: '/pages/coupons/coupons'
			});
		},
		
		// 用户协议
		handleUserAgreement() {
			uni.navigateTo({
				url: '/pages/user-agreement/user-agreement'
			});
		},
		
		// 回到登录页面（不退出登录）
		handleBackToLogin() {
			NavigationUtils.showBackToLoginConfirm();
		},
		
		// 退出登录
		handleLogout() {
			NavigationUtils.showLogoutConfirm(() => {
				// 重置页面数据
				this.isLoggedIn = false;
				this.username = '';
				this.phoneNumber = '';
				this.avatarUrl = '';
			});
		},

		// 底部导航事件
		handleHomeClick() {
			uni.switchTab({
				url: '/pages/index/index'
			});
		},
		
		handleOrdersClick() {
			uni.navigateTo({
				url: '/pages/order-detail/order-detail'
			});
		},
		
		handleMyClick() {
			// 当前就在我的页面，不需要跳转
			console.log('当前在我的页面');
		}
	}
}
</script>

<style scoped>
.my-container {
	background-image: url('/static/12.png');
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
	background-attachment: fixed;
	min-height: 100vh;
	padding-bottom: 120rpx;
	position: relative;
}

.my-container::before {
	content: '';
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: linear-gradient(180deg,
		rgba(248, 250, 255, 0.85) 0%,
		rgba(245, 245, 245, 0.9) 100%);
	z-index: -1;
	backdrop-filter: blur(2rpx);
}

/* 用户信息区域 */
.user-section {
	background-color: #ffffff;
	padding: 40rpx;
	display: flex;
	align-items: center;
	margin-bottom: 20rpx;
}

.avatar-container {
	margin-right: 30rpx;
}

.avatar {
	width: 120rpx;
	height: 120rpx;
	background-color: #e0e0e0;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.avatar-icon {
	font-size: 60rpx;
}

.avatar-image {
	width: 100%;
	height: 100%;
	border-radius: 50%;
}

.user-info {
	flex: 1;
}

.login-text {
	font-size: 36rpx;
	color: #333333;
	font-weight: 500;
}

.username {
	font-size: 36rpx;
	color: #333333;
	font-weight: 500;
	display: block;
}

.phone-number {
	font-size: 28rpx;
	color: #999999;
	margin-top: 10rpx;
	display: block;
}

/* 订单区域 */
.orders-section {
	background-color: #ffffff;
	margin-bottom: 20rpx;
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx 40rpx 20rpx;
	cursor: pointer;
	transition: background-color 0.2s;
}

.section-header:active {
	background-color: #f5f5f5;
}

.section-title {
	font-size: 32rpx;
	color: #333333;
	font-weight: 500;
}

.view-all {
	font-size: 28rpx;
	color: #666666;
}



/* 服务区域 */
.services-section {
	background-color: #ffffff;
	padding: 30rpx 40rpx;
}

.service-list {
	margin-top: 20rpx;
}

.service-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
}

.service-item:last-child {
	border-bottom: none;
}

.service-text {
	font-size: 30rpx;
	color: #333333;
}

.arrow {
	font-size: 30rpx;
	color: #cccccc;
}

.dev-tag {
	font-size: 20rpx;
	color: #999999;
	background-color: #f0f0f0;
	padding: 4rpx 12rpx;
	border-radius: 20rpx;
	margin-right: 20rpx;
}

/* 底部导航 */
.bottom-nav {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: #ffffff;
	display: flex;
	padding: 20rpx 0;
	border-top: 1rpx solid #f0f0f0;
}

.nav-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 10rpx 0;
}

.nav-icon {
	font-size: 40rpx;
	margin-bottom: 8rpx;
}

.nav-text {
	font-size: 24rpx;
	color: #666666;
}

.nav-item.active .nav-text {
	color: #007aff;
}
</style> 