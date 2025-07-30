<template>
	<view class="order-list-container">
		<!-- 头部导航 -->
		<view class="header">
			<view class="back-btn" @click="handleBack">
				<text class="back-icon">←</text>
			</view>
			<text class="header-title">全部订单</text>
		</view>
		
		<!-- 订单列表 -->
		<view class="order-list">
			<view v-if="orderList.length === 0" class="empty-state">
				<text class="empty-text">暂无订单</text>
			</view>
			
			<view v-else>
				<view 
					v-for="(order, index) in orderList" 
					:key="index" 
					class="order-item"
					@click="handleOrderClick(order)"
				>
					<view class="order-header">
						<text class="order-title">{{ order.title || '寄存服务' }}</text>
						<text class="order-status" :class="getStatusClass(order.status)">
							{{ getStatusText(order.status) }}
						</text>
					</view>
					
					<view class="order-content">
						<view class="order-image">
							<image src="/static/locker-image.jpg" class="locker-image" mode="aspectFill"></image>
						</view>
						<view class="order-info">
							<text class="order-location">{{ order.location || '上海高铁站寄存柜' }}</text>
							<text class="order-detail">{{ order.detail || '寄存柜: 21号柜 (大)' }}</text>
							<text class="order-time">{{ order.createTime || '2024-01-15 14:30' }}</text>
						</view>
					</view>
					
					<view class="order-footer">
						<text class="order-price">¥{{ order.price || '15.00' }}</text>
						<view class="order-actions">
							<button 
								v-if="order.status === 'active'" 
								class="action-btn retrieve-btn"
								@click.stop="handleRetrieve(order)"
							>
								取件
							</button>
							<button 
								class="action-btn detail-btn"
								@click.stop="handleOrderDetail(order)"
							>
								详情
							</button>
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 加载更多 -->
		<view v-if="hasMore" class="load-more">
			<button class="load-more-btn" @click="loadMore" :disabled="loading">
				{{ loading ? '加载中...' : '加载更多' }}
			</button>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			orderList: [],
			page: 1,
			pageSize: 20,
			hasMore: true,
			loading: false
		}
	},
	
	onLoad() {
		console.log('订单列表页面加载');
		// 监听订单数据传递
		uni.$on('orderListData', (data) => {
			console.log('接收到订单数据:', data);
			this.orderList = data || [];
			console.log('设置订单列表:', this.orderList);
		});
		
		// 如果没有接收到数据，则重新获取
		if (this.orderList.length === 0) {
			console.log('没有接收到订单数据，重新获取');
			this.loadOrderList();
		}
	},
	
	onUnload() {
		// 移除事件监听
		uni.$off('orderListData');
	},
	
	methods: {
		// 返回上一页
		handleBack() {
			uni.navigateBack();
		},
		
		// 加载订单列表
		loadOrderList() {
			if (this.loading) return;
			
			this.loading = true;
			uni.showLoading({
				title: '加载中...'
			});
			
			// 临时使用模拟数据，等待后端接口完成
			console.log('订单列表页面使用模拟数据');
			const mockOrderData = [
				{
					id: '1',
					title: '上海高铁站寄存柜',
					location: '上海高铁站寄存柜',
					detail: '寄存柜: 21号柜 (大)',
					price: '15.00',
					status: 'active',
					createTime: '2024-01-15 14:30'
				},
				{
					id: '2',
					title: '台北车站寄存点',
					location: '台北车站寄存点',
					detail: '寄存柜: 15号柜 (中)',
					price: '12.00',
					status: 'completed',
					createTime: '2024-01-14 10:20'
				},
				{
					id: '3',
					title: '北京机场寄存点',
					location: '北京机场寄存点',
					detail: '寄存柜: 8号柜 (小)',
					price: '10.00',
					status: 'completed',
					createTime: '2024-01-13 09:15'
				}
			];
			
			// 模拟API响应
			setTimeout(() => {
				uni.hideLoading();
				this.loading = false;
				console.log('订单列表模拟数据:', mockOrderData);
				
				if (this.page === 1) {
					this.orderList = mockOrderData;
				} else {
					this.orderList = [...this.orderList, ...mockOrderData];
				}
				
				this.hasMore = false; // 模拟数据只有一页
			}, 1000);
		},
		
		// 加载更多
		loadMore() {
			if (this.loading || !this.hasMore) return;
			
			this.page++;
			this.loadOrderList();
		},
		
		// 点击订单
		handleOrderClick(order) {
			console.log('点击订单:', order);
			uni.navigateTo({
				url: `/pages/order-detail/order-detail?id=${order.id}`
			});
		},
		
		// 取件操作
		handleRetrieve(order) {
			uni.showModal({
				title: '确认取件',
				content: `确定要取出寄存的物品吗？\n订单号：${order.id}`,
				success: (res) => {
					if (res.confirm) {
						uni.showLoading({
							title: '处理中...'
						});
						
						// 调用取件接口
						uni.request({
							url: 'http://localhost:8000/retrieve',
							method: 'POST',
							data: {
								orderId: order.id
							},
							header: {
								'Content-Type': 'application/x-www-form-urlencoded'
							},
							success: (res) => {
								uni.hideLoading();
								if (res.data && (res.data.code === 200 || res.data.code === "200")) {
									uni.showToast({
										title: '取件成功',
										icon: 'success'
									});
									// 重新加载订单列表
									this.page = 1;
									this.loadOrderList();
								} else {
									uni.showToast({
										title: res.data?.msg || '取件失败',
										icon: 'none'
									});
								}
							},
							fail: (err) => {
								uni.hideLoading();
								uni.showToast({
									title: '网络错误，请重试',
									icon: 'none'
								});
							}
						});
					}
				}
			});
		},
		
		// 查看订单详情
		handleOrderDetail(order) {
			uni.navigateTo({
				url: `/pages/order-detail/order-detail?id=${order.id}`
			});
		},
		
		// 获取状态样式类
		getStatusClass(status) {
			switch (status) {
				case 'active':
					return 'status-active';
				case 'completed':
					return 'status-completed';
				case 'cancelled':
					return 'status-cancelled';
				default:
					return 'status-default';
			}
		},
		
		// 获取状态文本
		getStatusText(status) {
			switch (status) {
				case 'active':
					return '进行中';
				case 'completed':
					return '已完成';
				case 'cancelled':
					return '已取消';
				default:
					return '未知';
			}
		}
	}
}
</script>

<style scoped>
.order-list-container {
	min-height: 100vh;
	background-color: #f8f9fa;
}

.header {
	display: flex;
	align-items: center;
	padding: 20rpx 40rpx;
	background-color: #ffffff;
	border-bottom: 1rpx solid #e5e5e5;
}

.back-btn {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.back-icon {
	font-size: 36rpx;
	color: #333333;
}

.header-title {
	flex: 1;
	text-align: center;
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
}

.order-list {
	padding: 20rpx;
}

.empty-state {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 400rpx;
}

.empty-text {
	font-size: 28rpx;
	color: #999999;
}

.order-item {
	background-color: #ffffff;
	border-radius: 12rpx;
	margin-bottom: 20rpx;
	padding: 30rpx;
	box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}

.order-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.order-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
}

.order-status {
	font-size: 24rpx;
	padding: 8rpx 16rpx;
	border-radius: 20rpx;
}

.status-active {
	background-color: #e3f2fd;
	color: #1976d2;
}

.status-completed {
	background-color: #e8f5e8;
	color: #388e3c;
}

.status-cancelled {
	background-color: #ffebee;
	color: #d32f2f;
}

.status-default {
	background-color: #f5f5f5;
	color: #666666;
}

.order-content {
	display: flex;
	margin-bottom: 20rpx;
}

.order-image {
	width: 120rpx;
	height: 120rpx;
	margin-right: 20rpx;
}

.locker-image {
	width: 100%;
	height: 100%;
	border-radius: 8rpx;
}

.order-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

.order-location {
	font-size: 28rpx;
	font-weight: 500;
	color: #333333;
	margin-bottom: 10rpx;
}

.order-detail {
	font-size: 24rpx;
	color: #666666;
	margin-bottom: 10rpx;
}

.order-time {
	font-size: 22rpx;
	color: #999999;
}

.order-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-top: 20rpx;
	border-top: 1rpx solid #f0f0f0;
}

.order-price {
	font-size: 32rpx;
	font-weight: bold;
	color: #ff6b6b;
}

.order-actions {
	display: flex;
	gap: 20rpx;
}

.action-btn {
	padding: 12rpx 24rpx;
	border-radius: 6rpx;
	font-size: 24rpx;
	border: none;
}

.retrieve-btn {
	background-color: #007aff;
	color: #ffffff;
}

.detail-btn {
	background-color: #f5f5f5;
	color: #666666;
}

.load-more {
	padding: 40rpx;
	text-align: center;
}

.load-more-btn {
	width: 200rpx;
	height: 60rpx;
	background-color: #ffffff;
	color: #666666;
	border: 1rpx solid #e5e5e5;
	border-radius: 30rpx;
	font-size: 24rpx;
}

.load-more-btn:disabled {
	background-color: #f5f5f5;
	color: #999999;
}
</style> 