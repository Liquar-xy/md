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
				<text class="overview-status error" v-else>⚠️ 无数据</text>
			</view>
			<view class="revenue-note">
				<text class="note-text">*每日9:00后结算昨日收益</text>
				<text class="question-icon">?</text>
			</view>
			<view class="data-time" v-if="lastUpdateTime">
				<text class="time-text">数据更新时间: {{lastUpdateTime}}</text>
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
			<view class="refresh-info">
				<text class="last-update" v-if="lastUpdateTime">最后更新: {{lastUpdateTime}}</text>
			</view>
			<button class="refresh-btn" @click="fetchAdminData">
				<text class="refresh-icon">🔄</text>
				<text class="refresh-text">刷新数据</text>
			</button>
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
		if (this.pointNum === 0) {
			console.log('数据为空，重新获取');
			this.loadAdminData();
		}
	},
	methods: {
		// 加载管理员数据
		loadAdminData() {
			console.log('开始加载管理员数据');
			
			try {
				const adminData = uni.getStorageSync('adminData');
				console.log('原始adminData:', adminData);
				
				if (adminData) {
					const data = JSON.parse(adminData);
					console.log('解析后的adminData:', data);
					console.log('data.userId:', data.userId);
					console.log('data.account:', data.account);
					console.log('data.id:', data.id);
					
					// 支持多种字段名
					this.adminId = data.userId || data.account || data.id || '';
					console.log('最终设置的管理员ID:', this.adminId);
					console.log('管理员ID类型:', typeof this.adminId);
					console.log('管理员ID是否为空:', this.adminId === '');
					console.log('管理员ID是否为null:', this.adminId === null);
					console.log('管理员ID是否为undefined:', this.adminId === undefined);
				} else {
					this.adminId = '';
					console.log('未找到管理员数据');
				}
			} catch (e) {
				console.log('获取管理员数据失败:', e);
				this.adminId = '';
			}
			
			// 从本地存储获取lockerPointId，如果没有则使用默认值
			try {
				const lockerPointId = uni.getStorageSync('lockerPointId');
				this.lockerPointId = lockerPointId || '1'; // 设置默认值
				console.log('设置lockerPointId:', this.lockerPointId);
			} catch (e) {
				console.log('获取lockerPointId失败:', e);
				this.lockerPointId = '1'; // 设置默认值
			}
			
			// 验证必要参数
			if (!this.adminId) {
				console.log('缺少管理员ID，跳转到登录页面');
				uni.showToast({
					title: '请先登录',
					icon: 'none',
					success: () => {
						setTimeout(() => {
							uni.reLaunch({
								url: '/pages/login/login'
							});
						}, 1500);
					}
				});
				return;
			}
			
			this.fetchAdminData();
		},
		

		

		
		// 获取管理员数据
		fetchAdminData() {
			console.log('=== 开始获取管理员数据 ===');
			
			// 清空数据
			this.pointNum = 0;
			this.lastOrderNum = 0;
			this.yesterdayOrderNum = 0;
			this.lastOrderPrice = 0;
			this.mouthPrice = 0;
			this.monthNum = 0;
			
			uni.showLoading({ title: '加载中...' });
			
			// 使用和你测试时相同的参数
			const requestData = {
				admin_id: "1",  // 使用固定的管理员ID
				locker_point_id: "2"  // 使用固定的网点ID
			};
			
			console.log('=== 使用固定参数 ===');
			console.log('注意：使用固定参数 admin_id=1, locker_point_id=2');
			
			console.log('=== 请求详情 ===');
			console.log('请求URL:', 'http://localhost:8000/admin');
			console.log('请求方法:', 'POST');
			console.log('请求参数:', requestData);
			console.log('adminId类型:', typeof this.adminId);
			console.log('lockerPointId类型:', typeof this.lockerPointId);
			
			uni.request({
				url: 'http://localhost:8000/admin',
				method: 'POST',
				data: requestData,
				header: { 'Content-Type': 'application/x-www-form-urlencoded' },
				timeout: 10000,
				success: (res) => {
					uni.hideLoading();
					console.log('=== 接口响应详情 ===');
					console.log('完整响应:', res);
					console.log('响应数据:', res.data);
					console.log('响应状态码:', res.statusCode);
					console.log('响应数据类型:', typeof res.data);
					console.log('响应数据是否为对象:', typeof res.data === 'object');
					console.log('响应数据的所有字段:');
					if (res.data && typeof res.data === 'object') {
						Object.keys(res.data).forEach(key => {
							console.log(`  ${key}:`, res.data[key], `(类型: ${typeof res.data[key]})`);
						});
					}
					
					// 检查响应数据结构
					if (res.data) {
						console.log('响应数据字段:');
						Object.keys(res.data).forEach(key => {
							console.log(`${key}:`, res.data[key], `(类型: ${typeof res.data[key]})`);
						});
					}
					
					if (res.data && (res.data.code === 200 || res.data.code === "200")) {
						console.log('=== 开始数据映射 ===');
						
						// 根据后端接口返回的真实数据进行映射
						const data = res.data;
						console.log('用于映射的数据对象:', data);
						console.log('=== 完整响应数据结构 ===');
						console.log('res.data:', res.data);
						console.log('res.data的所有字段:', Object.keys(res.data));
						console.log('res.data的每个字段值:');
						Object.keys(res.data).forEach(key => {
							console.log(`  ${key}:`, res.data[key], `(类型: ${typeof res.data[key]})`);
						});
						
						// 映射数据字段（根据后端API返回的真实字段）
						const originalPointNum = data.pointNum;
						const originalLastOrderNum = data.lastOrderNum;
						const originalYesterdayOrderNum = data.yesterdayOrderNum;
						const originalLastOrderPrice = data.lastOrderPrice;
						const originalMouthPrice = data.mouthPrice;
						const originalMonthNum = data.monthNum;
						
						console.log('=== 原始数据值 ===');
						console.log('pointNum:', originalPointNum, `(类型: ${typeof originalPointNum})`);
						console.log('lastOrderNum:', originalLastOrderNum, `(类型: ${typeof originalLastOrderNum})`);
						console.log('yesterdayOrderNum:', originalYesterdayOrderNum, `(类型: ${typeof originalYesterdayOrderNum})`);
						console.log('lastOrderPrice:', originalLastOrderPrice, `(类型: ${typeof originalLastOrderPrice})`);
						console.log('mouthPrice:', originalMouthPrice, `(类型: ${typeof originalMouthPrice})`);
						console.log('monthNum:', originalMonthNum, `(类型: ${typeof originalMonthNum})`);
						
						// 设置到前端变量 - 确保正确转换数据类型
						this.pointNum = parseInt(originalPointNum) || 0;
						this.lastOrderNum = parseInt(originalLastOrderNum) || 0;
						this.yesterdayOrderNum = parseInt(originalYesterdayOrderNum) || 0;
						this.lastOrderPrice = parseFloat(originalLastOrderPrice) || 0;
						this.mouthPrice = parseFloat(originalMouthPrice) || 0;
						this.monthNum = parseInt(originalMonthNum) || 0;
						
						console.log('=== 数据映射结果 ===');
						console.log('- 网点:', this.pointNum);
						console.log('- 今日订单:', this.lastOrderNum);
						console.log('- 昨日订单:', this.yesterdayOrderNum);
						console.log('- 昨日收益:', this.lastOrderPrice);
						console.log('- 本月收益:', this.mouthPrice);
						console.log('- 本月订单:', this.monthNum);
						
						// 保存最后更新时间
						this.lastUpdateTime = new Date().toLocaleString();
						
						uni.showToast({ title: '数据加载成功', icon: 'success' });
					} else {
						console.log('=== 接口返回错误详情 ===');
						console.log('完整响应:', res);
						console.log('响应数据:', res.data);
						console.log('响应状态码:', res.statusCode);
						console.log('code字段值:', res.data?.code);
						console.log('code字段类型:', typeof res.data?.code);
						console.log('code是否等于200:', res.data?.code === 200);
						console.log('code是否等于"200":', res.data?.code === "200");
						
						uni.showToast({ 
							title: `获取数据失败: ${res.data?.msg || '未知错误'}`, 
							icon: 'none',
							duration: 3000
						});
					}
				},
				fail: (err) => {
					uni.hideLoading();
					console.log('=== 请求失败详情 ===');
					console.log('错误对象:', err);
					console.log('错误信息:', err.errMsg);
					console.log('错误类型:', typeof err);
					
					// 检查是否是跨域问题
					if (err.errMsg && err.errMsg.includes('fail')) {
						console.log('可能是跨域或网络问题');
					}
					
					uni.showToast({ 
						title: `网络请求失败: ${err.errMsg || '未知错误'}`, 
						icon: 'none',
						duration: 3000
					});
				}
			});
		},
		

		
		// 返回
		handleBack() {
			uni.navigateBack();
		},
		
		// 菜单
		handleMenu() {
			uni.showActionSheet({
				itemList: ['帮助', '关于'],
				success: (res) => {
					console.log('选择了:', res.tapIndex);
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
			uni.showToast({
				title: '我的网点',
				icon: 'none'
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
}

.time-text {
	font-size: 22rpx;
	color: #999999;
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
}

.last-update {
	font-size: 24rpx;
	color: #666666;
}

.refresh-btn {
	width: 100%;
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

.refresh-btn:active {
	background-color: #e3f2fd;
}

.refresh-icon {
	font-size: 24rpx;
}

.refresh-text {
	font-size: 28rpx;
}
</style> 