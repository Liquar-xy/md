<script>
	import NavigationUtils from '@/utils/navigation.js';
	
	export default {
		onLaunch: function() {
			console.log('App Launch');
			this.setupGlobalNavigation();
			// 初始化导航工具
			NavigationUtils.init();
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		methods: {
			// 设置全局导航
			setupGlobalNavigation() {
				// 监听页面返回事件
				uni.onBackPress = (options) => {
					console.log('页面返回事件:', options);
					
					// 获取当前页面路径
					const pages = getCurrentPages();
					const currentPage = pages[pages.length - 1];
					const currentRoute = currentPage ? currentPage.route : '';
					
					console.log('当前页面:', currentRoute);
					console.log('页面栈长度:', pages.length);
					
					// 如果在首页或我的页面，且页面栈只有一个页面，提供回到登录页的选项
					if (pages.length === 1 && 
						(currentRoute.includes('pages/index/index') || 
						 currentRoute.includes('pages/my/my') ||
						 currentRoute.includes('pages/order-detail/order-detail'))) {
						
						// 显示选择对话框
						uni.showModal({
							title: '返回选项',
							content: '是否要回到登录页面？',
							confirmText: '登录页',
							cancelText: '退出应用',
							success: (res) => {
								if (res.confirm) {
									// 回到登录页
									NavigationUtils.toLogin(true, true);
								} else {
									// 退出应用
									// #ifdef APP-PLUS
									plus.runtime.quit();
									// #endif
									// #ifdef H5
									window.close();
									// #endif
								}
							}
						});
						
						return true; // 阻止默认返回行为
					}
					
					return false; // 允许默认返回行为
				};
			}
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
