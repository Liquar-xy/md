<template>
  <view class="order-delete-container">
    <!-- 顶部返回栏 -->
    <view class="header-bar">
      <view class="back-btn" @click="goBack" hover-class="back-btn-hover">
        <text class="back-icon">←</text>
      </view>
      <text class="header-title">订单退款</text>
      <view class="header-placeholder"></view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 订单信息 -->
    <view v-else-if="orderInfo" class="order-info-section">
      <view class="info-card">
        <view class="card-header">
          <text class="card-title">订单信息</text>
        </view>
        <view class="info-row">
          <text class="info-label">订单号</text>
          <text class="info-value">{{ orderInfo.order_number }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">订单状态</text>
          <text class="info-value status" :class="'status-' + orderInfo.status">
            {{ getOrderStatusText(orderInfo.status) }}
          </text>
        </view>
        <view class="info-row">
          <text class="info-label">寄存网点</text>
          <text class="info-value">{{ orderInfo.storage_location_name }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">柜子ID</text>
          <text class="info-value">{{ orderInfo.cabinet_id }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">订单金额</text>
          <text class="info-value amount">¥{{ formatAmount(orderInfo.amount_paid) }}</text>
        </view>
      </view>
    </view>

    <!-- 退款说明 -->
    <view class="refund-notice">
      <view class="notice-header">
        <text class="notice-title">退款说明</text>
      </view>
      <view class="notice-content">
        <text class="notice-text">• 退款将在1-3个工作日内到账</text>
        <text class="notice-text">• 退款金额将原路返回到您的支付账户</text>
        <text class="notice-text">• 如有疑问，请联系客服</text>
        <text class="notice-text">• 退款成功后，订单将被删除且无法恢复</text>
      </view>
    </view>

    <!-- 退款原因选择 -->
    <view class="refund-reason-section">
      <view class="reason-header">
        <text class="reason-title">退款原因</text>
      </view>
      <view class="reason-options">
        <view 
          v-for="(reason, index) in refundReasons" 
          :key="index"
          class="reason-option"
          :class="{ active: selectedReason === index }"
          @click="selectReason(index)"
        >
          <text class="reason-text">{{ reason }}</text>
          <view class="reason-radio" :class="{ checked: selectedReason === index }"></view>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <button class="cancel-btn" @click="goBack">取消</button>
      <button 
        class="confirm-btn" 
        :class="{ disabled: processing || selectedReason === -1 }"
        :disabled="processing || selectedReason === -1"
        @click="confirmRefund"
      >
        {{ processing ? '处理中...' : '确认退款' }}
      </button>
    </view>

    <!-- 处理结果弹窗 -->
    <view v-if="showResult" class="result-modal">
      <view class="modal-content">
        <view class="result-icon" :class="resultSuccess ? 'success' : 'error'">
          <text>{{ resultSuccess ? '✓' : '✗' }}</text>
        </view>
        <text class="result-title">{{ resultSuccess ? '退款成功' : '退款失败' }}</text>
        <text class="result-message">{{ resultMessage }}</text>
        <button class="result-btn" @click="handleResultConfirm">确定</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      orderId: null,
      orderInfo: null,
      loading: true,
      processing: false,
      showResult: false,
      resultSuccess: false,
      resultMessage: '',
      selectedReason: -1,
      refundReasons: [
        '不需要寄存了',
        '找到其他寄存点',
        '计划有变',
        '价格太贵',
        '服务不满意',
        '其他原因'
      ]
    }
  },
  
  onLoad(options) {
    console.log('订单删除页面加载:', options);
    
    if (options.id) {
      this.orderId = parseInt(options.id);
      this.fetchOrderDetails();
    } else {
      uni.showToast({
        title: '订单ID无效',
        icon: 'none'
      });
      setTimeout(() => {
        uni.navigateBack();
      }, 2000);
    }
  },
  
  methods: {
    // 获取订单详情
    fetchOrderDetails() {
      this.loading = true;
      
      uni.request({
        url: 'http://127.0.0.1:8000/v1/orders/show',
        method: 'POST',
        header: {
          'Content-Type': 'application/json'
        },
        data: JSON.stringify({
          id: this.orderId
        }),
        success: (res) => {
          console.log('获取订单详情成功:', res);
          
          if (res.statusCode === 200 && res.data && res.data.order && res.data.order.length > 0) {
            const orderData = res.data.order[0];
            this.orderInfo = {
              id: orderData.id,
              order_number: orderData.orderNumber,
              status: parseInt(orderData.status) || 0,
              storage_location_name: orderData.storageLocationName,
              cabinet_id: orderData.cabinetId,
              amount_paid: Number(orderData.amountPaid) || 0,
              price: Number(orderData.price) || 0
            };
          } else {
            uni.showToast({
              title: '获取订单信息失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          console.error('获取订单详情失败:', err);
          uni.showToast({
            title: '网络异常，请重试',
            icon: 'none'
          });
        },
        complete: () => {
          this.loading = false;
        }
      });
    },
    
    // 选择退款原因
    selectReason(index) {
      this.selectedReason = index;
    },
    
    // 确认退款
    confirmRefund() {
      if (this.processing || this.selectedReason === -1) {
        return;
      }
      
      // 显示确认对话框
      uni.showModal({
        title: '确认退款',
        content: `确定要退款并删除订单吗？\n退款原因：${this.refundReasons[this.selectedReason]}\n退款金额：¥${this.formatAmount(this.orderInfo.amount_paid)}`,
        confirmText: '确认退款',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.processRefund();
          }
        }
      });
    },
    

    
    // 处理退款
    processRefund() {
      this.processing = true;
      
      const requestData = {
        id: this.orderId,
        reason: this.refundReasons[this.selectedReason],
        amount: this.orderInfo.amount_paid
      };
      
      console.log('发送退款请求:', requestData);
      
      uni.request({
        url: 'http://127.0.0.1:8000/v1/order/del',
        method: 'POST',
        header: {
          'Content-Type': 'application/json'
        },
        data: JSON.stringify(requestData),
        timeout: 10000,
        success: (res) => {
          console.log('退款请求响应:', res);
          
          if (res.statusCode === 200) {
            this.showResultModal(true, '退款申请已提交，预计1-3个工作日内到账');
          } else {
            const errorMsg = res.data?.message || res.data?.msg || '退款失败，请重试';
            this.showResultModal(false, errorMsg);
          }
        },
        fail: (err) => {
          console.error('退款请求失败:', err);
          let errorMsg = '网络异常，请重试';
          if (err.errMsg?.includes('timeout')) {
            errorMsg = '请求超时，请检查网络连接';
          }
          this.showResultModal(false, errorMsg);
        },
        complete: () => {
          this.processing = false;
        }
      });
    },
    

    
    // 显示结果弹窗
    showResultModal(success, message) {
      this.resultSuccess = success;
      this.resultMessage = message;
      this.showResult = true;
    },
    
    // 处理结果确认
    handleResultConfirm() {
      this.showResult = false;
      
      if (this.resultSuccess) {
        // 退款成功，智能返回
        uni.showToast({
          title: '退款成功',
          icon: 'success',
          duration: 2000
        });
        
        setTimeout(() => {
          // 检查页面栈，智能决定返回方式
          const pages = getCurrentPages();
          if (pages.length > 2) {
            // 如果是从订单详情页面跳转过来的，返回到订单列表
            uni.navigateBack({
              delta: 2,
              fail: () => {
                uni.switchTab({
                  url: '/pages/orders/orders'
                });
              }
            });
          } else {
            // 否则返回到订单列表
            uni.switchTab({
              url: '/pages/orders/orders'
            });
          }
        }, 2000);
      }
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },
    
    // 格式化金额
    formatAmount(amount) {
      return (amount || 0).toFixed(2);
    },
    
    // 获取订单状态文本
    getOrderStatusText(status) {
      switch (parseInt(status)) {
        case 1: return '待支付';
        case 2: return '寄存中';
        case 3: return '已完成';
        case 4: return '已取消';
        case 5: return '超时';
        case 6: return '异常';
        default: return '未知状态';
      }
    }
  }
}
</script>

<style scoped>
.order-delete-container {
  min-height: 100vh;
  background: #f5f6fa;
}

/* 顶部返回栏 */
.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  background: #fff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  padding: 10rpx;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.back-btn-hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.back-icon {
  font-size: 36rpx;
  color: #222;
  line-height: 1;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #222;
}

.header-placeholder {
  width: 36rpx;
}

/* 加载状态 */
.loading-container {
  text-align: center;
  padding: 40rpx 0;
}

.loading-text {
  font-size: 32rpx;
  color: #999;
}

/* 订单信息 */
.order-info-section {
  margin: 24rpx;
}

.info-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.card-header {
  margin-bottom: 24rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #222;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f8f8f8;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 28rpx;
  color: #666;
}

.info-value {
  font-size: 28rpx;
  color: #222;
  text-align: right;
}

.info-value.status {
  font-weight: bold;
}

.info-value.status.status-1 {
  color: #ff9500;
}

.info-value.status.status-2 {
  color: #007aff;
}

.info-value.amount {
  font-size: 32rpx;
  font-weight: bold;
  color: #ff3b30;
}

/* 退款说明 */
.refund-notice {
  margin: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.notice-header {
  margin-bottom: 24rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.notice-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #222;
}

.notice-content {
  display: flex;
  flex-direction: column;
}

.notice-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 12rpx;
}

.notice-text:last-child {
  margin-bottom: 0;
}

/* 退款原因 */
.refund-reason-section {
  margin: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.reason-header {
  margin-bottom: 24rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.reason-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #222;
}

.reason-options {
  display: flex;
  flex-direction: column;
}

.reason-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f8f8f8;
  transition: background-color 0.2s ease;
}

.reason-option:last-child {
  border-bottom: none;
}

.reason-option.active {
  background-color: rgba(0, 122, 255, 0.05);
}

.reason-text {
  font-size: 28rpx;
  color: #222;
}

.reason-radio {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #ddd;
  border-radius: 50%;
  position: relative;
}

.reason-radio.checked {
  border-color: #007aff;
}

.reason-radio.checked::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24rpx;
  height: 24rpx;
  background: #007aff;
  border-radius: 50%;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 24rpx;
  margin: 48rpx 24rpx;
}

.cancel-btn, .confirm-btn {
  flex: 1;
  padding: 32rpx 0;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
}

.cancel-btn {
  background: #f0f0f0;
  color: #666;
}

.confirm-btn {
  background: #ff3b30;
  color: #fff;
}

.confirm-btn.disabled {
  background: #ccc;
  color: #999;
}

/* 结果弹窗 */
.result-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: #fff;
  border-radius: 20rpx;
  padding: 60rpx 40rpx 40rpx;
  margin: 0 40rpx;
  text-align: center;
  max-width: 600rpx;
}

.result-icon {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 32rpx;
  font-size: 60rpx;
  font-weight: bold;
}

.result-icon.success {
  background: #34c759;
  color: #fff;
}

.result-icon.error {
  background: #ff3b30;
  color: #fff;
}

.result-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #222;
  margin-bottom: 16rpx;
  display: block;
}

.result-message {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 40rpx;
  display: block;
}

.result-btn {
  width: 100%;
  padding: 24rpx 0;
  background: #007aff;
  color: #fff;
  border: none;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: bold;
}
</style>