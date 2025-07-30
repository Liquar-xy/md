<template>
  <view class="order-page-container">
    <!-- 顶部标题栏 -->
    <view class="header-bar">
      <text class="header-title">我的订单</text>
      <view class="header-icons">
        <text class="iconfont">&#xe60b;</text>
        <text class="iconfont">&#xe601;</text>
      </view>
    </view>

    <!-- tab 切换 -->
    <view class="order-tabs">
      <view :class="['tab-item', currentTab === 0 ? 'active' : '']" @click="switchTab(0)">当前订单</view>
      <view :class="['tab-item', currentTab === 1 ? 'active' : '']" @click="switchTab(1)">历史订单</view>
    </view>

    <!-- 订单列表 -->
    <view v-if="currentTab === 0 || currentTab === 1" class="order-list">
      <!-- 加载状态 -->
      <view v-if="loading" class="loading-container">
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 订单列表 -->
      <template v-else-if="orders.length > 0">
        <view v-for="(order, idx) in orders" :key="order.id" class="order-card" @click="goToOrderDetail(order.id)">
          <!-- 原有订单卡片代码保持不变 -->
          <view class="order-card-main">
            <image :src="'/static/locker-image.jpg'" class="order-img" mode="aspectFill"></image>
            <view class="order-info">
              <view class="order-title-row">
                <text class="order-title">{{ order.storage_location_name }}</text>
                <text class="order-status" :class="order.status === 1 ? 'status-pending' : order.status === 3 ? 'status-done' : ''">
                  {{ order.status === 1 ? '待支付' : order.status === 2 ? '寄存中' : order.status === 3 ? '已完成' : order.status === 4 ? '已取消' : order.status === 5 ? '超时' : order.status === 6 ? '异常' : '' }}
                </text>
                <text v-if="order.deposit_status === 1" class="order-badge">押金已支付</text>
                <text v-else-if="order.deposit_status === 2" class="order-badge">押金已退还</text>
                <text v-else-if="order.deposit_status === 3" class="order-badge">押金已扣除</text>
              </view>
              <text class="order-desc">订单号：{{ order.order_number }}</text>
              <text class="order-location">柜子ID：{{ order.cabinet_id }}</text>
            </view>
          </view>
          <view class="order-card-footer">
            <text class="order-timer">计划时长{{ order.scheduled_duration }}小时，实用{{ order.actual_duration }}小时</text>
            <view class="order-actions">
              <button v-if="order.status === 2" class="order-btn primary">取出</button>
              <button v-if="order.status === 3" class="order-btn default">去评价</button>
              <!-- 右下角状态显示 -->
              <view class="order-status-badge" :class="'status-' + order.status">
                <text class="status-text">{{ order.status === 1 ? '待支付' : order.status === 2 ? '寄存中' : order.status === 3 ? '已完成' : order.status === 4 ? '已取消' : order.status === 5 ? '超时' : order.status === 6 ? '异常' : '' }}</text>
              </view>
            </view>
          </view>
        </view>
      </template>
      
      <!-- 空状态 -->
      <view v-else class="order-list empty">
        <text class="empty-text">{{ currentTab === 0 ? '暂无当前订单' : '暂无历史订单' }}</text>
      </view>
    </view>

    <!-- 底部导航栏 -->
    <view class="bottom-nav">
      <view class="nav-item" @click="handleHomeClick">
        <text class="nav-icon">🏠</text>
        <text class="nav-text">首页</text>
      </view>
      <view class="nav-item active" @click="handleOrdersClick">
        <text class="nav-icon">📋</text>
        <text class="nav-text">订单</text>
      </view>
      <view class="nav-item" @click="handleMyClick">
        <text class="nav-icon">👤</text>
        <text class="nav-text">我的</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentTab: 0,
      orders: [],
      total: 0,
      page: 1,
      size: 20, // 修改分页条数为20
      storage_location_name: '',
      loading: false
    }
  },
  onLoad() {
    this.fetchOrders();
  },
  methods: {
    // 切换tab时重置并重新获取订单
    switchTab(tabIndex) {
      // 如果点击的是当前tab，不做处理
      if (this.currentTab === tabIndex) return;

      // 更新当前tab
      this.currentTab = tabIndex;

      // 重置分页参数
      this.page = 1;
      this.orders = [];

      // 重新获取订单
      this.fetchOrders();
    },
    fetchOrders() {
      // 获取订单列表
      this.loading = true;
      uni.request({
        url: 'http://127.0.0.1:8000/v1/orders/list', // 替换为实际后端接口地址
        method: 'POST',
        header: {
          'Content-Type': 'application/json'
        },
        data: JSON.stringify({
          page: this.page,
          size: this.size,
          storage_location_name: this.storage_location_name,
          // 根据状态筛选：状态1,2为当前订单，状态3为历史订单
          status: this.currentTab === 0 ? "1,2" : "3"
        }),
        success: (res) => {
          console.log('订单列表请求成功:', res);
          
          // 检查响应状态码
          if (res.statusCode !== 200) {
            uni.showToast({
              title: `请求失败：状态码 ${res.statusCode}`,
              icon: 'none'
            });
            return;
          }

          // 检查返回的数据结构
          if (!res.data || !res.data.orders) {
            uni.showToast({
              title: '未获取到订单数据',
              icon: 'none'
            });
            console.warn('订单数据结构异常:', res.data);
            return;
          }

          // 映射后端返回的订单数据
          const newOrders = res.data.orders.map(order => ({
            id: order.id,
            order_number: order.orderNumber,
            user_id: order.userId,
            scheduled_duration: order.scheduledDuration,
            actual_duration: order.actualDuration,
            price: order.price,
            discount: order.discount,
            amount_paid: order.amountPaid,
            storage_location_name: order.storageLocationName,
            cabinet_id: order.cabinetId,
            status: order.status,
            deposit_status: order.depositStatus
          }));
          
          // 如果是第一页，直接替换，否则追加
          this.orders = this.page === 1 ? newOrders : [...this.orders, ...newOrders];
          this.total = res.data.total || 0;

          // 如果没有订单，显示空状态提示
          if (this.orders.length === 0) {
            uni.showToast({
              title: this.currentTab === 0 ? '暂无当前订单' : '暂无历史订单',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          console.error('获取订单失败 - 详细错误:', err);
          uni.showToast({
            title: `获取订单失败：${err.errMsg || '未知错误'}`,
            icon: 'none'
          });
        },
        complete: () => {
          this.loading = false;
        }
      });
    },
    handleHomeClick() {
      uni.showToast({ title: '首页', icon: 'none' });
    },
    handleOrdersClick() {
      uni.showToast({ title: '订单页面', icon: 'none' });
    },
    handleMyClick() {
     uni.navigateTo({
     	url: '/pages/my/my'
     });
    },
    // 添加分页相关方法
    onReachBottom() {
      // 触底加载更多
      if (this.orders.length < this.total) {
        this.page++;
        this.fetchOrders();
      }
    },
    // 下拉刷新
    onPullDownRefresh() {
      this.page = 1;
      this.orders = [];
      this.fetchOrders();
      uni.stopPullDownRefresh();
    },
    // 跳转到订单详情页
    goToOrderDetail(orderId) {
      uni.navigateTo({
        url: `/pages/show/show?id=${orderId}`
      });
    },
    // 可根据需要添加分页、筛选等方法
  }
}
</script>

<style scoped>
.order-page-container {
  min-height: 100vh;
  background: #f5f6fa;
  padding-bottom: 120rpx;
}
.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 32rpx 0 32rpx;
  background: #fff;
}
.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #222;
}
.header-icons .iconfont {
  font-size: 36rpx;
  margin-left: 24rpx;
  color: #999;
}
.order-tabs {
  display: flex;
  background: #fff;
  border-bottom: 2rpx solid #f0f0f0;
  margin-bottom: 16rpx;
}
.tab-item {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  color: #888;
  padding: 24rpx 0 16rpx 0;
  position: relative;
}
.tab-item.active {
  color: #007aff;
  font-weight: bold;
}
.tab-item.active::after {
  content: '';
  display: block;
  width: 60rpx;
  height: 6rpx;
  background: #007aff;
  border-radius: 3rpx;
  margin: 0 auto;
  position: absolute;
  left: 0; right: 0; bottom: 0;
}
.order-list {
  padding: 0 24rpx;
}
.order-card {
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.04);
  margin-bottom: 32rpx;
  padding: 24rpx 20rpx 20rpx 20rpx;
  transition: background-color 0.2s;
}

.order-card:active {
  background-color: #f5f5f5;
}
.order-card-main {
  display: flex;
  align-items: flex-start;
}
.order-img {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  margin-right: 20rpx;
  background: #f0f0f0;
}
.order-info {
  flex: 1;
  min-width: 0;
}
.order-title-row {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}
.order-title {
  font-size: 32rpx;
  color: #222;
  font-weight: bold;
  margin-right: 12rpx;
}
.order-status {
  font-size: 24rpx;
  margin-right: 8rpx;
}
.status-pending {
  color: #ff9500;
}
.status-done {
  color: #999;
}
.order-badge {
  font-size: 20rpx;
  color: #fff;
  background: #ff3b30;
  border-radius: 20rpx;
  padding: 2rpx 12rpx;
  margin-left: 8rpx;
}
.order-desc {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 4rpx;
  display: block;
}
.order-location {
  font-size: 24rpx;
  color: #bbb;
  display: block;
  margin-bottom: 4rpx;
}
.order-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16rpx;
}
.order-timer {
  font-size: 24rpx;
  color: #ff3b30;
}
.order-actions {
  display: flex;
  align-items: center;
  position: relative;
}
.order-btn {
  font-size: 28rpx;
  border-radius: 24rpx;
  padding: 8rpx 32rpx;
  margin-left: 16rpx;
  border: none;
}
.order-btn.primary {
  background: #007aff;
  color: #fff;
}
.order-btn.default {
  background: #f0f0f0;
  color: #666;
}
.order-status-badge {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
}
.order-status-badge.status-1 {
  background: #ff9500;
  color: #fff;
}
.order-status-badge.status-2 {
  background: #007aff;
  color: #fff;
}
.order-status-badge.status-3 {
  background: #34c759;
  color: #fff;
}
.order-status-badge.status-4 {
  background: #ff3b30;
  color: #fff;
}
.order-status-badge.status-5 {
  background: #ff9500;
  color: #fff;
}
.order-status-badge.status-6 {
  background: #ff3b30;
  color: #fff;
}
.status-text {
  font-size: 22rpx;
  font-weight: bold;
}
.order-list.empty {
  text-align: center;
  color: #bbb;
  font-size: 28rpx;
  margin-top: 80rpx;
}
.loading-container {
  text-align: center;
  padding: 40rpx 0;
}
.loading-text {
  font-size: 32rpx;
  color: #999;
}
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