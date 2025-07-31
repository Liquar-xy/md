<template>
	<view class="navigation-bar" v-if="showBar">
		<view class="nav-buttons">
			<view class="nav-btn" @click="handleBackToLogin" v-if="showBackToLogin">
				<text class="nav-icon">🔙</text>
				<text class="nav-text">登录页</text>
			</view>
			<view class="nav-btn" @click="handleLogout" v-if="showLogout">
				<text class="nav-icon">🚪</text>
				<text class="nav-text">退出</text>
			</view>
		</view>
	</view>
</template>

<script>
import NavigationUtils from '@/utils/navigation.js';

export default {
	name: 'NavigationBar',
	props: {
		// 是否显示导航栏
		show: {
			type: Boolean,
			default: true
		},
		// 是否显示回到登录页按钮
		showBackToLogin: {
			type: Boolean,
			default: true
		},
		// 是否显示退出登录按钮
		showLogout: {
			type: Boolean,
			default: true
		},
		// 导航栏位置：top-right, top-left, bottom
		position: {
			type: String,
			default: 'top-right'
		}
	},
	computed: {
		showBar() {
			return this.show && NavigationUtils.checkLoginStatus();
		}
	},
	methods: {
		handleBackToLogin() {
			NavigationUtils.showBackToLoginConfirm();
		},
		
		handleLogout() {
			NavigationUtils.showLogoutConfirm();
		}
	}
}
</script>

<style scoped>
.navigation-bar {
	position: fixed;
	top: 60rpx;
	right: 30rpx;
	z-index: 1000;
	display: flex;
}

.nav-buttons {
	display: flex;
	gap: 20rpx;
}

.nav-btn {
	display: flex;
	align-items: center;
	padding: 15rpx 20rpx;
	background: rgba(255, 255, 255, 0.9);
	border-radius: 25rpx;
	box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.1);
	backdrop-filter: blur(10rpx);
	transition: all 0.3s ease;
}

.nav-btn:active {
	transform: scale(0.95);
	background: rgba(255, 255, 255, 0.8);
}

.nav-icon {
	font-size: 24rpx;
	margin-right: 8rpx;
	color: #007aff;
}

.nav-text {
	font-size: 24rpx;
	color: #007aff;
	font-weight: 500;
}

/* 不同位置的样式 */
.navigation-bar.top-left {
	top: 60rpx;
	left: 30rpx;
	right: auto;
}

.navigation-bar.bottom {
	top: auto;
	bottom: 120rpx;
	right: 30rpx;
}
</style>