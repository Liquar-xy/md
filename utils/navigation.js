// 导航工具函数
const NavigationUtils = {
	// 初始化导航工具
	init() {
		// 设置全局快捷键（仅在H5环境下）
		// #ifdef H5
		document.addEventListener('keydown', (e) => {
			// Ctrl + L 快速回到登录页
			if (e.ctrlKey && e.key === 'l') {
				e.preventDefault();
				this.showBackToLoginConfirm();
			}
			// Ctrl + Q 快速退出登录
			if (e.ctrlKey && e.key === 'q') {
				e.preventDefault();
				this.showLogoutConfirm();
			}
		});
		// #endif
	},
	/**
	 * 跳转到登录页面
	 * @param {boolean} force - 是否强制显示登录页面（不检查登录状态）
	 * @param {boolean} clearHistory - 是否清除页面历史记录
	 */
	toLogin(force = false, clearHistory = false) {
		const url = force ? '/pages/login/login?force=true' : '/pages/login/login';
		
		if (clearHistory) {
			uni.reLaunch({ url });
		} else {
			uni.navigateTo({ url });
		}
	},
	
	/**
	 * 退出登录并跳转到登录页
	 */
	logout() {
		// 清除所有登录相关的本地存储
		const storageKeys = [
			'token', 'userData', 'adminData', 'loginTime', 
			'userToken', 'userId', 'userInfo', 'selectedCity'
		];
		
		storageKeys.forEach(key => {
			try {
				uni.removeStorageSync(key);
			} catch (e) {
				console.warn(`清除存储 ${key} 失败:`, e);
			}
		});
		
		// 显示退出提示
		uni.showToast({
			title: '已退出登录',
			icon: 'success',
			duration: 1500
		});
		
		// 跳转到登录页
		setTimeout(() => {
			this.toLogin(false, true);
		}, 1500);
	},
	
	/**
	 * 检查登录状态
	 * @returns {boolean} 是否已登录
	 */
	checkLoginStatus() {
		const token = uni.getStorageSync('token');
		const userData = uni.getStorageSync('userData');
		const adminData = uni.getStorageSync('adminData');
		
		return !!(token && (userData || adminData));
	},
	
	/**
	 * 获取当前用户信息
	 * @returns {object|null} 用户信息
	 */
	getCurrentUser() {
		try {
			const userData = uni.getStorageSync('userData');
			const adminData = uni.getStorageSync('adminData');
			
			if (userData) {
				return typeof userData === 'string' ? JSON.parse(userData) : userData;
			}
			
			if (adminData) {
				return typeof adminData === 'string' ? JSON.parse(adminData) : adminData;
			}
			
			return null;
		} catch (e) {
			console.error('获取用户信息失败:', e);
			return null;
		}
	},
	
	/**
	 * 显示退出登录确认对话框
	 * @param {function} onConfirm - 确认回调
	 * @param {function} onCancel - 取消回调
	 */
	showLogoutConfirm(onConfirm, onCancel) {
		uni.showModal({
			title: '退出登录',
			content: '确定要退出当前账号吗？',
			confirmText: '退出',
			cancelText: '取消',
			success: (res) => {
				if (res.confirm) {
					if (onConfirm) {
						onConfirm();
					} else {
						this.logout();
					}
				} else if (onCancel) {
					onCancel();
				}
			}
		});
	},
	
	/**
	 * 显示回到登录页确认对话框
	 */
	showBackToLoginConfirm() {
		uni.showModal({
			title: '回到登录页',
			content: '是否要回到登录页面？（不会退出当前登录状态）',
			confirmText: '确定',
			cancelText: '取消',
			success: (res) => {
				if (res.confirm) {
					this.toLogin(true, false);
				}
			}
		});
	}
};

export default NavigationUtils;