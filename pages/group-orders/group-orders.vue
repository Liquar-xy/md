<template>
	<view class="page">
		<!-- 顶部导航栏 -->
		<view class="navbar">
			<view class="nav-left" @click="goBack">
				<text class="nav-icon">‹</text>
			</view>
			<view class="nav-center">
				<text class="nav-title">{{ groupName }} - 订单管理</text>
			</view>
			<view class="nav-right">
				<text class="nav-icon" @click="refreshData">⟲</text>
			</view>
		</view>

		<!-- 订单统计 -->
		<view class="stats-section">
			<view class="stat-item">
				<text class="stat-value">{{ todayOrders }}</text>
				<text class="stat-label">今日订单</text>
			</view>
			<view class="stat-item">
				<text class="stat-value">{{ activeOrders }}</text>
				<text class="stat-label">进行中</text>
			</view>
			<view class="stat-item">
				<text class="stat-value">¥{{ todayRevenue }}</text>
				<text class="stat-label">今日收益</text>
			</view>
		</view>

		<!-- 订单列表 -->
		<scroll-view class="orders-list" scroll-y="true" @scrolltolower="loadMore">
			<view class="order-item" v-for="order in orderList" :key="order.id" @click="viewOrderDetail(order)">
				<view class="order-header">
					<text class="order-id">订单 {{ order.order_no }}</text>
					<text class="order-status" :class="getStatusClass(order.status)">
						{{ getStatusText(order.status) }}
					</text>
				</view>
				
				<view class="order-info">
					<view class="info-row">
						<text class="info-label">柜格编号:</text>
						<text class="info-value">{{ order.cell_no }}</text>
					</view>
					<view class="info-row">
						<text class="info-label">存储时间:</text>
						<text class="info-value">{{ formatTime(order.start_time) }}</text>
					</view>
					<view class="info-row" v-if="order.end_time">
						<text class="info-label">取出时间:</text>
						<text class="info-value">{{ formatTime(order.end_time) }}</text>
					</view>
					<view class="info-row">
						<text class="info-label">订单金额:</text>
						<text class="info-value price">¥{{ order.total_amount }}</text>
					</view>
				</view>
			</view>

			<!-- 加载更多 -->
			<view class="load-more" v-if="hasMore">
				<text class="load-text" v-if="!loading">上拉加载更多</text>
				<text class="load-text" v-else>加载中...</text>
			</view>

			<!-- 没有更多数据 -->
			<view class="no-more" v-if="!hasMore && orderList.length > 0">
				<text class="no-more-text">没有更多数据了</text>
			</view>

			<!-- 空状态 -->
			<view class="empty-state" v-if="!loading && orderList.length === 0">
				<text class="empty-icon">📋</text>
				<text class="empty-text">暂无订单数据</text>
				<button class="refresh-btn" @click="refreshData">刷新数据</button>
			</view>
		</scroll-view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			// 页面参数
			groupId: '',
			groupName: '',
			
			// 订单数据
			orderList: [],
			
			// 分页参数
			currentPage: 1,
			pageSize: 10,
			hasMore: true,
			loading: false,
			
			// 统计数据
			todayOrders: 0,
			activeOrders: 0,
			todayRevenue: 0
		}
	},
	
	onLoad(options) {
		console.log('柜组订单页面加载:', options);
		
		this.groupId = options.groupId || '';
		this.groupName = decodeURIComponent(options.groupName || '未知柜组');
		
		if (this.groupId) {
			this.loadOrderList();
		} else {
			uni.showToast({
				title: '参数错误',
				icon: 'none'
			});
		}
	},
	
	methods: {
		// 返回上一页
		goBack() {
			uni.navigateBack();
		},
		
		// 刷新数据
		refreshData() {
			this.currentPage = 1;
			this.hasMore = true;
			this.orderList = [];
			this.loadOrderList();
		},
		
		// 加载订单列表
		loadOrderList() {
			if (this.loading || !this.hasMore) return;
			
			this.loading = true;
			
			// 暂时使用模拟数据
			setTimeout(() => {
				this.loadMockOrderData();
				this.loading = false;
			}, 500);
		},
		
		// 加载模拟订单数据
		loadMockOrderData() {
			console.log('使用模拟订单数据');
			
			const mockOrders = [];
			const statuses = ['active', 'completed', 'cancelled', 'expired'];
			
			// 生成订单数据
			for (let i = 1; i <= this.pageSize; i++) {
				const status = statuses[Math.floor(Math.random() * statuses.length)];
				const startTime = new Date(Date.now() - Math.random() * 86400000 * 7); // 最近7天
				const endTime = status === 'completed' ? new Date(startTime.getTime() + Math.random() * 86400000) : null;
				
				mockOrders.push({
					id: (this.currentPage - 1) * this.pageSize + i,
					order_no: `ORD${Date.now()}${String(i).padStart(3, '0')}`,
					group_id: this.groupId,
					cell_no: String(Math.floor(Math.random() * 20) + 1).padStart(2, '0'),
					status: status,
					start_time: startTime.toISOString(),
					end_time: endTime?.toISOString() || null,
					total_amount: (Math.random() * 50 + 10).toFixed(2),
					create_time: startTime.toISOString(),
					update_time: new Date().toISOString()
				});
			}
			
			if (this.currentPage === 1) {
				this.orderList = mockOrders;
				this.updateStats();
			} else {
				this.orderList = [...this.orderList, ...mockOrders];
			}
			
			// 模拟分页结束
			this.hasMore = this.currentPage < 3;
		},
		
		// 更新统计数据
		updateStats() {
			const today = new Date().toDateString();
			const todayOrdersData = this.orderList.filter(order => 
				new Date(order.create_time).toDateString() === today
			);
			
			this.todayOrders = todayOrdersData.length;
			this.activeOrders = this.orderList.filter(order => order.status === 'active').length;
			this.todayRevenue = todayOrdersData
				.filter(order => order.status === 'completed')
				.reduce((sum, order) => sum + parseFloat(order.total_amount), 0)
				.toFixed(2);
		},
		
		// 加载更多
		loadMore() {
			if (this.hasMore && !this.loading) {
				this.currentPage++;
				this.loadOrderList();
			}
		},
		
		// 获取状态样式类
		getStatusClass(status) {
			const classMap = {
				'active': 'status-active',
				'completed': 'status-completed',
				'cancelled': 'status-cancelled',
				'expired': 'status-expired'
			};
			return classMap[status] || 'status-unknown';
		},
		
		// 获取状态文本
		getStatusText(status) {
			const statusMap = {
				'active': '进行中',
				'completed': '已完成',
				'cancelled': '已取消',
				'expired': '已过期'
			};
			return statusMap[status] || '未知';
		},
		
		// 查看订单详情
		viewOrderDetail(order) {
			console.log('查看订单详情:', order);
			uni.navigateTo({
				url: `/pages/order-detail/order-detail?orderId=${order.id}&orderNo=${order.order_no}`
			});
		},
		
		// 格式化时间
		formatTime(timeStr) {
			if (!timeStr) return '';
			const date = new Date(timeStr);
			return date.toLocaleString('zh-CN');
		}
	}
}
</script>

<style scoped>
.page {
	background-color: #f5f5f5;
	min-height: 100vh;
}

/* 导航栏 */
.navbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 30rpx;
	background-color: #ffffff;
	border-bottom: 1rpx solid #e5e5e5;
	position: sticky;
	top: 0;
	z-index: 100;
}

.nav-left, .nav-right {
	display: flex;
	align-items: center;
}

.nav-icon {
	font-size: 36rpx;
	color: #333333;
	padding: 10rpx;
}

.nav-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #333333;
}

/* 统计区域 */
.stats-section {
	display: flex;
	background-color: #ffffff;
	margin: 20rpx;
	border-radius: 16rpx;
	padding: 30rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.stat-item {
	flex: 1;
	text-align: center;
}

.stat-value {
	display: block;
	font-size: 48rpx;
	font-weight: bold;
	color: #1890ff;
	margin-bottom: 8rpx;
}

.stat-label {
	font-size: 24rpx;
	color: #666666;
}

/* 订单列表 */
.orders-list {
	flex: 1;
	padding: 0 20rpx;
}

.order-item {
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

/* 订单标题 */
.order-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20rpx;
}

.order-id {
	font-size: 30rpx;
	font-weight: bold;
	color: #333333;
}

.order-status {
	font-size: 24rpx;
	padding: 8rpx 16rpx;
	border-radius: 12rpx;
	font-weight: 500;
}

/* 状态样式 */
.status-active {
	background-color: #e6f7ff;
	color: #1890ff;
}

.status-completed {
	background-color: #f6ffed;
	color: #52c41a;
}

.status-cancelled {
	background-color: #fff2f0;
	color: #ff4d4f;
}

.status-expired {
	background-color: #fff7e6;
	color: #faad14;
}

/* 订单信息 */
.order-info {
	margin-top: 20rpx;
}

.info-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 8rpx 0;
}

.info-label {
	font-size: 26rpx;
	color: #666666;
}

.info-value {
	font-size: 26rpx;
	color: #333333;
}

.info-value.price {
	color: #ff4d4f;
	font-weight: bold;
}

/* 加载更多 */
.load-more, .no-more {
	text-align: center;
	padding: 40rpx 0;
}

.load-text, .no-more-text {
	font-size: 24rpx;
	color: #999999;
}

/* 空状态 */
.empty-state {
	text-align: center;
	padding: 100rpx 0;
}

.empty-icon {
	font-size: 80rpx;
	margin-bottom: 20rpx;
}

.empty-text {
	font-size: 28rpx;
	color: #999999;
	margin-bottom: 40rpx;
}

.refresh-btn {
	padding: 20rpx 40rpx;
	background-color: #1890ff;
	color: #ffffff;
	border-radius: 8rpx;
	border: none;
	font-size: 26rpx;
}
</style>