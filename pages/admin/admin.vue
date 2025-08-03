<template>
	<view class="admin-container">
		<!-- 头部导航 -->
		<view class="header">
			<view class="header-left">
				<text class="back-icon" @click="handleBack">←</text>
			</view>
			<view class="header-center">
				<text class="header-title">管理员</text>
			</view>
			<view class="header-right">
				<text class="menu-icon" @click="handleMenu">⋯</text>
				<text class="profile-icon" @click="handleProfile">👤</text>
			</view>
		</view>
		
		<!-- 网点概览 -->
		<view class="overview-section">
			<view class="overview-header">
				<text class="overview-text">共 {{pointNum}} 个网点</text>
				<text class="overview-status" v-if="pointNum > 0">✅ 正常</text>
				<text class="overview-status error" v-else>▲ 无数据</text>
			</view>
			<view class="revenue-note">
				<text class="note-text">*每日9:00后结算昨日收益</text>
				<text class="question-icon">?</text>
			</view>
			<view class="data-time" v-if="lastUpdateTime">
				<text class="time-text">数据库同步时间: {{lastUpdateTime}}</text>
			</view>
		</view>
		
		<!-- 关键指标 -->
		<view class="kpi-section">
			<view class="kpi-header">
				<text class="kpi-title">实时数据</text>
				<text class="kpi-subtitle">基于数据库实时查询</text>
			</view>
			<view class="kpi-grid">
				<view class="kpi-item">
					<text class="kpi-value">{{lastOrderNum}}</text>
					<text class="kpi-label">今日订单</text>
					<text class="kpi-desc">今日新增订单数</text>
				</view>
				<view class="kpi-item">
					<text class="kpi-value">¥{{lastOrderPrice}}</text>
					<text class="kpi-label">昨日收益</text>
					<text class="kpi-desc">昨日总收益金额</text>
				</view>
				<view class="kpi-item">
					<text class="kpi-value">{{yesterdayOrderNum}}</text>
					<text class="kpi-label">昨日订单</text>
					<text class="kpi-desc">昨日完成订单数</text>
				</view>
				<view class="kpi-item">
					<text class="kpi-value">¥{{mouthPrice}}</text>
					<text class="kpi-label">本月收益</text>
					<text class="kpi-desc">本月累计收益</text>
				</view>
				<view class="kpi-item">
					<text class="kpi-value">{{monthNum}}</text>
					<text class="kpi-label">本月订单</text>
					<text class="kpi-desc">本月累计订单数</text>
				</view>
			</view>
		</view>
		
		<!-- 刷新区域 -->
		<view class="refresh-section">
			<view class="refresh-controls">
				<button class="refresh-btn" @click="forceRefreshData">
					<text class="refresh-icon">🔄</text>
					<text class="refresh-text">刷新数据</text>
				</button>
			</view>
		</view>
		
		<!-- 管理工具 -->
		<view class="tools-section">
			<text class="section-title">管理工具</text>
			<view class="tools-grid">
				<view class="tool-item" @click="handleMySites">
					<text class="tool-text">我的网点</text>
				</view>
				<view class="tool-item" @click="handleCabinetManagement">
					<text class="tool-text">柜组管理</text>
				</view>
				<view class="tool-item" @click="handleOrderManagement">
					<text class="tool-text">订单管理</text>
				</view>
				<view class="tool-item" @click="handleRevenueDashboard">
					<text class="tool-text">营收看板</text>
				</view>
				<view class="tool-item alarm" @click="handleAlarm">
					<text class="tool-text">异常报警</text>
					<view class="alarm-badge" v-if="alarmCount > 0">
						<text class="alarm-count">{{alarmCount}}</text>
					</view>
				</view>
				<view class="tool-item" @click="handleSystemAdmin">
					<text class="tool-text">系统管理员</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			// 从后端获取的数据
			pointNum: 0,           // 网点总数
			lastOrderNum: 0,       // 今日订单数
			yesterdayOrderNum: 0,  // 昨日订单数
			lastOrderPrice: 0,     // 昨日收益
			mouthPrice: 0,         // 本月收益
			monthNum: 0,           // 本月订单数
			alarmCount: 0,         // 异常报警数量
			
			// 请求参数
			adminId: '',
			lockerPointId: '',
			
			// 更新时间
			lastUpdateTime: ''     // 最后更新时间
		}
	},
	onLoad() {
		console.log('页面加载开始');
		this.loadAdminData();
	},
	
	onShow() {
		console.log('页面显示');
		// 每次显示页面时都刷新数据，但不显示loading
		this.fetchAdminDataSilent();
	},
	methods: {
		// 加载管理员数据
		loadAdminData() {
			// 检查登录状态
			const adminToken = uni.getStorageSync('adminToken');
			const adminId = uni.getStorageSync('adminId');
			const adminMobile = uni.getStorageSync('adminMobile');
			
			// 设置管理员ID和网点ID（与API测试一致）
			this.adminId = adminId || '1';
			this.lockerPointId = '2';  // 使用locker_point_id: 2，与您的API测试一致
			
			console.log('=== 初始化参数 ===');
			console.log('管理员ID:', this.adminId);
			console.log('网点ID:', this.lockerPointId);
			
			// 加载数据
			this.fetchAdminData();
		},
		

		

		
		// 静默获取管理员数据（不显示loading）
		fetchAdminDataSilent() {
			console.log('=== 静默获取管理员数据 ===');
			console.log('时间:', new Date().toLocaleString());
			
			this.fetchAdminDataInternal(false);
		},
		
		// 获取管理员数据
		fetchAdminData() {
			console.log('=== 开始获取管理员数据 ===');
			console.log('时间:', new Date().toLocaleString());
			
			uni.showLoading({ title: '正在获取数据...' });
			
			this.fetchAdminDataInternal(true);
		},
		
		// 内部获取数据方法
		fetchAdminDataInternal(showLoading = true) {
			
			// 使用登录后的管理员ID
			const requestData = {
				admin_id: this.adminId,
				locker_point_id: this.lockerPointId
			};
			
			console.log('=== 请求参数 ===');
			console.log('管理员ID:', this.adminId);
			console.log('网点ID:', this.lockerPointId);
			console.log('请求数据:', requestData);
			
			// 添加时间戳防止缓存
			const timestamp = new Date().getTime();
			const url = `http://localhost:8000/admin?t=${timestamp}`;
			
			// 将数据转换为URL编码格式
			const formData = new URLSearchParams();
			formData.append('admin_id', requestData.admin_id);
			formData.append('locker_point_id', requestData.locker_point_id);
			
			uni.request({
				url: url,
				method: 'POST',
				data: formData.toString(),
				header: { 
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				timeout: 20000, // 增加超时时间到20秒
				success: (res) => {
					if (showLoading) {
						uni.hideLoading();
					}
					
					console.log('=== API响应 ===');
					console.log('状态码:', res.statusCode);
					console.log('响应数据:', res.data);
					
					if (res.data && (res.data.code === 200 || res.data.code === "200")) {
						console.log('=== 数据映射开始 ===');
						
						const data = res.data;
						
						// 调试：打印所有字段
						console.log('=== 所有字段 ===');
						console.log('pointNum:', data.pointNum, typeof data.pointNum);
						console.log('lastOrderNum:', data.lastOrderNum, typeof data.lastOrderNum);
						console.log('yesterdayOrderNum:', data.yesterdayOrderNum, typeof data.yesterdayOrderNum);
						console.log('lastOrderPrice:', data.lastOrderPrice, typeof data.lastOrderPrice);
						console.log('mouthPrice:', data.mouthPrice, typeof data.mouthPrice);
						console.log('monthNum:', data.monthNum, typeof data.monthNum);
						
						// 根据实际后端返回的字段名映射
						this.pointNum = this.safeParseInt(data.pointNum);
						this.lastOrderNum = this.safeParseInt(data.lastOrderNum);
						this.yesterdayOrderNum = this.safeParseInt(data.yesterdayOrderNum);
						this.lastOrderPrice = this.safeParseFloat(data.lastOrderPrice);
						this.mouthPrice = this.safeParseFloat(data.mouthPrice);
						this.monthNum = this.safeParseInt(data.monthNum);
						
						console.log('=== 数据映射结果 ===');
						console.log('网点数:', this.pointNum);
						console.log('今日订单:', this.lastOrderNum);
						console.log('昨日订单:', this.yesterdayOrderNum);
						console.log('昨日收益:', this.lastOrderPrice);
						console.log('本月收益:', this.mouthPrice);
						console.log('本月订单:', this.monthNum);
						
						// 保存最后更新时间
						this.lastUpdateTime = new Date().toLocaleString();
						
						uni.showToast({ 
							title: '数据已更新', 
							icon: 'success',
							duration: 2000
						});
					} else {
						console.log('=== API返回错误 ===');
						console.log('错误码:', res.data?.code);
						console.log('错误信息:', res.data?.msg);
						
						// 检查是否是认证错误
						if (res.data?.code === 401 || res.data?.msg?.includes('未登录') || res.data?.msg?.includes('token')) {
							this.handleAuthError();
						} else {
							uni.showToast({ 
								title: `获取数据失败: ${res.data?.msg || '未知错误'}`, 
								icon: 'none',
								duration: 3000
							});
						}
					}
				},
				fail: (err) => {
					if (showLoading) {
						uni.hideLoading();
					}
					
					console.log('=== 网络请求失败 ===');
					console.log('错误信息:', err.errMsg);
					console.log('错误详情:', err);
					
					if (showLoading) {
						uni.showToast({ 
							title: `网络请求失败: ${err.errMsg || '未知错误'}`, 
							icon: 'none',
							duration: 3000
						});
					}
				}
			});
		},
		
		// 安全解析整数
		safeParseInt(value) {
			if (value === null || value === undefined || value === '') {
				return 0;
			}
			const parsed = parseInt(value);
			return isNaN(parsed) ? 0 : parsed;
		},
		
		// 安全解析浮点数
		safeParseFloat(value) {
			if (value === null || value === undefined || value === '') {
				return 0;
			}
			const parsed = parseFloat(value);
			return isNaN(parsed) ? 0 : parsed;
		},
		
		// 处理认证错误
		handleAuthError() {
			uni.showModal({
				title: '登录已过期',
				content: '您的登录已过期，请重新登录',
				showCancel: false,
				success: () => {
					// 清除登录信息
					uni.removeStorageSync('adminToken');
					uni.removeStorageSync('adminId');
					uni.removeStorageSync('adminMobile');
					
					// 跳转到登录页面
					uni.reLaunch({
						url: '/pages/admin/login'
					});
				}
			});
		},
		

		
				// 强制刷新数据
		forceRefreshData() {
			console.log('=== 刷新数据 ===');
			console.log('时间:', new Date().toLocaleString());

			// 重新获取数据（带loading）
			this.fetchAdminData();
		},
		

		
		// 返回
		handleBack() {
			uni.navigateBack();
		},
		
		// 菜单
		handleMenu() {
			uni.showActionSheet({
				itemList: ['退出登录', '帮助', '关于'],
				success: (res) => {
					console.log('选择了:', res.tapIndex);
					if (res.tapIndex === 0) {
						this.handleLogout();
					}
				}
			});
		},
		
		// 退出登录
		handleLogout() {
			uni.showModal({
				title: '确认退出',
				content: '确定要退出登录吗？',
				success: (res) => {
					if (res.confirm) {
						// 清除登录信息
						uni.removeStorageSync('adminToken');
						uni.removeStorageSync('adminId');
						uni.removeStorageSync('adminMobile');
						
						uni.showToast({
							title: '已退出登录',
							icon: 'success'
						});
						
						// 跳转到登录页面
						setTimeout(() => {
							uni.reLaunch({
								url: '/pages/admin/login'
							});
						}, 1500);
					}
				}
			});
		},
		
		// 个人资料
		handleProfile() {
			uni.navigateTo({
				url: '/pages/admin/profile'
			});
		},
		
		// 我的网点
		handleMySites() {
			uni.navigateTo({
				url: '/pages/point/point'
			});
		},
		
		// 柜组管理
		handleCabinetManagement() {
			uni.showToast({
				title: '柜组管理',
				icon: 'none'
			});
		},
		
		// 订单管理
		handleOrderManagement() {
			uni.showToast({
				title: '订单管理',
				icon: 'none'
			});
		},
		
		// 营收看板
		handleRevenueDashboard() {
			uni.showToast({
				title: '营收看板',
				icon: 'none'
			});
		},
		
		// 异常报警
		handleAlarm() {
			uni.showToast({
				title: `异常报警 (${this.alarmCount}条)`,
				icon: 'none'
			});
		},
		
		// 系统管理员
		handleSystemAdmin() {
			uni.showToast({
				title: '系统管理员',
				icon: 'none'
			});
		}
	}
}
</script>

<style scoped>
.admin-container {
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
	gap: 20rpx;
}

.back-icon, .menu-icon, .profile-icon {
	font-size: 36rpx;
	color: #333333;
	padding: 10rpx;
}

.header-title {
	font-size: 36rpx;
	color: #333333;
	font-weight: bold;
}

/* 网点概览 */
.overview-section {
	background-color: #ffffff;
	padding: 30rpx 40rpx;
	margin-bottom: 20rpx;
}

.overview-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 10rpx;
}

.overview-text {
	font-size: 32rpx;
	color: #333333;
	font-weight: 500;
}

.overview-status {
	font-size: 24rpx;
	color: #28a745;
	font-weight: 500;
}

.overview-status.error {
	color: #ff6b6b;
}

.revenue-note {
	display: flex;
	align-items: center;
	gap: 10rpx;
}

.note-text {
	font-size: 24rpx;
	color: #999999;
}

.question-icon {
	font-size: 24rpx;
	color: #999999;
	background-color: #f0f0f0;
	width: 32rpx;
	height: 32rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.data-time {
	margin-top: 10rpx;
	text-align: center;
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 10rpx;
}

.time-text {
	font-size: 22rpx;
	color: #999999;
}

.sync-status {
	font-size: 20rpx;
	color: #007aff;
	background-color: #e3f2fd;
	padding: 4rpx 12rpx;
	border-radius: 20rpx;
}

/* 关键指标 */
.kpi-section {
	background-color: #ffffff;
	padding: 30rpx 40rpx;
	margin-bottom: 20rpx;
}

.kpi-header {
	text-align: center;
	margin-bottom: 30rpx;
}

.kpi-title {
	font-size: 32rpx;
	color: #333333;
	font-weight: bold;
	display: block;
	margin-bottom: 8rpx;
}

.kpi-subtitle {
	font-size: 24rpx;
	color: #999999;
}

.kpi-grid {
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	gap: 20rpx;
}

.kpi-item {
	text-align: center;
	padding: 30rpx;
	background-color: #f8f9fa;
	border-radius: 12rpx;
	transition: all 0.3s ease;
}

.kpi-item:hover {
	background-color: #e9ecef;
	transform: translateY(-2rpx);
}

.kpi-value {
	font-size: 48rpx;
	color: #007aff;
	font-weight: bold;
	display: block;
	margin-bottom: 10rpx;
}

.kpi-label {
	font-size: 28rpx;
	color: #666666;
	font-weight: 500;
	display: block;
	margin-bottom: 8rpx;
}

.kpi-desc {
	font-size: 22rpx;
	color: #999999;
	display: block;
}

/* 管理工具 */
.tools-section {
	background-color: #ffffff;
	padding: 30rpx 40rpx;
}

.section-title {
	font-size: 32rpx;
	color: #333333;
	font-weight: 500;
	margin-bottom: 30rpx;
	display: block;
}

.tools-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 20rpx;
}

.tool-item {
	background-color: #f8f9fa;
	border-radius: 12rpx;
	padding: 40rpx 20rpx;
	text-align: center;
	position: relative;
	border: 2rpx solid transparent;
	transition: all 0.3s ease;
}

.tool-item:active {
	background-color: #e9ecef;
	transform: scale(0.98);
}

.tool-text {
	font-size: 28rpx;
	color: #333333;
	font-weight: 500;
}

.tool-item.alarm {
	border-color: #ff4757;
}

.alarm-badge {
	position: absolute;
	top: -10rpx;
	right: -10rpx;
	background-color: #ff4757;
	border-radius: 50%;
	width: 40rpx;
	height: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.alarm-count {
	font-size: 20rpx;
	color: #ffffff;
	font-weight: bold;
}

/* 刷新区域 */
.refresh-section {
	background-color: #ffffff;
	padding: 20rpx 40rpx;
	margin-bottom: 20rpx;
}

.refresh-info {
	margin-bottom: 20rpx;
	padding: 10rpx 0;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.last-update, .auto-refresh {
	font-size: 24rpx;
	color: #666666;
}

.refresh-controls {
	display: flex;
	gap: 20rpx;
}

.refresh-btn, .auto-refresh-btn {
	flex: 1;
	height: 80rpx;
	background-color: #f8f9fa;
	color: #007aff;
	border: 2rpx solid #007aff;
	border-radius: 8rpx;
	font-size: 28rpx;
	font-weight: 500;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10rpx;
}

.refresh-btn:active, .auto-refresh-btn:active {
	background-color: #e3f2fd;
}

.auto-refresh-btn.active {
	background-color: #007aff;
	color: #ffffff;
}

.refresh-icon, .auto-refresh-icon {
	font-size: 24rpx;
}

.refresh-text, .auto-refresh-text {
	font-size: 28rpx;
}
</style> 