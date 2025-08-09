<template>
  <view class="pay-container">
    <!-- 顶部返回栏 -->
    <view class="header-bar">
      <view class="back-btn" @click="goBack" hover-class="back-btn-hover">
        <text class="back-icon">←</text>
      </view>
      <text class="header-title">订单支付</text>
      <view class="header-placeholder"></view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 订单信息 -->
    <view v-else class="order-summary">
      <view class="order-info">
        <text class="order-title">{{ orderData.title }}</text>
        <view class="order-details">
          <view class="detail-row">
            <text class="detail-label">订单号：</text>
            <text class="detail-value">{{ orderData.order_number }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">寄存网点：</text>
            <text class="detail-value">{{ orderData.storage_location_name }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">柜子ID：</text>
            <text class="detail-value">{{ orderData.cabinet_id }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">寄存时长：</text>
            <text class="detail-value">{{ orderData.actual_duration }}小时</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">订单状态：</text>
            <text class="detail-value status" :class="'status-' + orderData.status">{{ getOrderStatusText(orderData.status) }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">押金状态：</text>
            <text class="detail-value deposit" :class="'deposit-' + orderData.deposit_status">{{ getDepositStatusText(orderData.deposit_status) }}</text>
          </view>
        </view>
      </view>
      <view class="amount-info">
        <text class="amount-label">应付金额</text>
        <text class="amount-value">¥{{ formatAmount(totalAmount) }}</text>
      </view>
    </view>

    <!-- 费用明细 -->
    <view v-if="!loading" class="fee-detail">
      <view class="detail-header">
        <text class="detail-title">费用明细</text>
      </view>
      <view class="detail-item">
        <text class="item-label">基础费用</text>
        <text class="item-value">¥{{ formatAmount(orderData.price) }}</text>
      </view>
      <view class="detail-item" v-if="orderData.discount > 0">
        <text class="item-label">优惠金额</text>
        <text class="item-value discount">-¥{{ formatAmount(orderData.discount) }}</text>
      </view>
      <view class="detail-divider"></view>
      <view class="detail-item total">
        <text class="item-label">实付金额</text>
        <text class="item-value">¥{{ formatAmount(orderData.amount_paid || totalAmount) }}</text>
      </view>
    </view>

    <!-- 支付方式选择 -->
    <view v-if="!loading" class="payment-methods">
      <view class="method-header">
        <text class="method-title">选择支付方式</text>
      </view>
      <view 
        class="payment-option" 
        :class="{ active: selectedPayment === 'alipay' }"
        @click="selectPayment('alipay')"
      >
        <view class="option-left">
          <text class="payment-icon">💰</text>
          <text class="payment-name">支付宝</text>
        </view>
        <view class="option-right">
          <text class="radio" :class="{ checked: selectedPayment === 'alipay' }"></text>
        </view>
      </view>
    </view>

    <!-- 支付按钮 -->
    <view v-if="!loading" class="pay-action">
      <button 
        class="pay-btn" 
        :class="{ disabled: !selectedPayment || paying }"
        @click="handlePay"
        :disabled="!selectedPayment || paying"
      >
        {{ paying ? '处理中...' : `立即支付 ¥${formatAmount(totalAmount)}` }}
      </button>
      
      <!-- 查看订单按钮 -->
      <view class="secondary-actions">
        <text class="link-text" @click="goToOrderDetail(orderData.id)">查看订单详情</text>
        <text class="link-text" @click="goToOrderList">我的订单</text>
      </view>
    </view>


  </view>
</template>

<script>


export default {
  data() {
    return {
      loading: false,
      paying: false,
      selectedPayment: '',
      errorMsg: '',
      orderData: {
        id: null,
        actual_duration: 0,
        status: 1,
        deposit_status: 1,
        hourly_rate: 0,
        locker_type: 1,
        type_id: 1, // 柜子类型ID
        price: 0,
        title: ''
      }
    }
  },
  computed: {
    // 计算实际应付金额
    totalAmount() {
      // 如果有实付金额，优先使用实付金额
      if (this.orderData.amount_paid > 0) {
        return this.orderData.amount_paid;
      }
      // 否则使用基础价格减去优惠
      const basePrice = this.orderData.price || 0;
      const discount = this.orderData.discount || 0;
      return Math.max(0, basePrice - discount);
    }
  },
  onLoad(options) {
    if (options.id) {
      this.orderData.id = parseInt(options.id);
      this.fetchOrderDetail();
    }
    
    // 检查是否有未完成的支付
    this.checkPendingPayment();
  },
  
  onShow() {
    // 页面显示时也检查支付状态（用户从支付页面返回时）
    this.checkPendingPayment();
  },
  methods: {
    formatAmount(amount) {
      return (amount || 0).toFixed(2);
    },

    // 检查待处理的支付
    checkPendingPayment() {
      try {
        const pendingPayment = uni.getStorageSync('current_payment_info');
        if (pendingPayment) {
          const { startTime, orderNumber } = pendingPayment;
          const elapsed = Date.now() - startTime;
          
          // 如果支付开始时间超过30分钟，清除记录
          if (elapsed > 30 * 60 * 1000) {
            uni.removeStorageSync('current_payment_info');
            return;
          }
          
          // 如果是当前订单的支付，检查结果
          if (orderNumber == this.orderData.id) {
            console.log('发现待处理的支付，检查结果');
            this.checkPaymentResult(pendingPayment);
          }
        }
      } catch (error) {
        console.error('检查待处理支付失败:', error);
      }
    },
    fetchOrderDetail() {
      this.loading = true;
      uni.request({
        url: 'http://127.0.0.1:8000/v1/orders/show',
        method: 'POST',
        data: { id: this.orderData.id },
        success: (res) => {
          console.log('后端返回数据:', res.data); // 调试输出
          if (res.data && typeof res.data === 'object' && Array.isArray(res.data.order) && res.data.order.length > 0) {
            const od = res.data.order[0];
            // 兼容多种总价字段名
            const totalPrice = Number(od.price || od.amountPaid || od.totalPrice) || 0;
            this.orderData = {
              ...this.orderData,
              id: od.id,
              order_number: od.orderNumber,
              storage_location_name: od.storageLocationName,
              cabinet_id: od.cabinetId,
              actual_duration: Number(od.actualDuration || od.actual_duration) || 0,
              scheduled_duration: Number(od.scheduledDuration || od.scheduled_duration) || 0,
              status: parseInt(od.status) || 0,
              deposit_status: parseInt(od.depositStatus) || 0,
              price: Number(od.price) || 0,
              discount: Number(od.discount) || 0,
              amount_paid: Number(od.amountPaid) || 0,
              locker_type: od.cabinetId,
              type_id: od.type_id || od.typeId || od.locker_type_id,
              title: `订单${od.id}支付`
            };
            
            console.log('订单数据映射完成:', this.orderData);
          } else {
            this.showError('订单数据异常');
          }
        },
        fail: (err) => {
          let msg = '网络异常';
          if (err.errMsg?.includes('timeout')) {
            msg = '连接服务器超时，点击重试';
          } else if (err.errMsg?.includes('fail')) {
            msg = '网络连接失败，请重试';
          }
          this.showError(msg);
        },
        complete: () => {
          this.loading = false;
        }
      });
    },
    showError(msg) {
      this.loading = false;
      uni.showModal({
        title: '提示',
        content: msg,
        showCancel: true,
        cancelText: '返回',
        confirmText: '重试',
        success: (res) => {
          if (res.confirm) {
            this.fetchOrderDetail();
          } else {
            uni.navigateBack();
          }
        }
      });
    },

    async handlePay() {
      if (this.paying || !this.selectedPayment) return;
      
      // 订单数据验证
      if (!this.validateOrder()) {
        return;
      }
      
      this.paying = true;
      uni.showLoading({
        title: '处理支付请求...',
        mask: true
      });
      
      try {
       const requestData = {
           id: this.orderData.id,
           actual_duration: this.orderData.actual_duration,
           status: 3,
           deposit_status: this.orderData.deposit_status,
           locker_type: this.orderData.locker_type,
           type_id: this.orderData.type_id, 
           payment_method: this.selectedPayment,
           title: this.orderData.title,
           return_url: 'app://payment/return', 
           cancel_url: 'app://payment/cancel', 
           client_type: 'uniapp', 
           platform: uni.getSystemInfoSync().platform 
       };
        
        console.log('发送支付请求:', requestData);
        
        const res = await uni.request({
          url: 'http://127.0.0.1:8000/v1/order/update',
          method: 'PUT',
          header: {
            'Content-Type': 'application/json'
          },
          data: requestData,
          timeout: 10000 // 10秒超时
        });
        
        console.log('后端响应:', res);
        
        // 检查HTTP状态码
        if (res.statusCode !== 200) {
          throw new Error(`服务器错误: ${res.statusCode}`);
        }
        
        // 检查响应数据
        if (!res.data) {
          throw new Error('服务器返回数据为空');
        }
        
        // 检查是否有错误信息
        if (res.data.error) {
          throw new Error(res.data.error);
        }
        
        // 获取后端返回的支付信息
        const paymentInfo = res.data;
        console.log('后端返回的支付信息:', paymentInfo);
        
        // 验证必要的支付信息，兼容多种字段名
        const payUrl = paymentInfo.payUrl || paymentInfo.PayUrl || paymentInfo.result || paymentInfo.url;
        
        if (!payUrl) {
          console.error('支付链接为空，完整响应:', paymentInfo);
          throw new Error('支付链接获取失败，请联系客服');
        }
        
        const paymentMethod = paymentInfo.payment_method || this.selectedPayment;
        const orderNumber = paymentInfo.order_number || paymentInfo.order_id || this.orderData.id;
        const amount = paymentInfo.amount || this.orderData.price;
        
        // 验证支付链接格式
        if (!this.isValidUrl(payUrl)) {
          console.error('支付链接格式无效:', payUrl);
          throw new Error('支付链接格式无效');
        }
        
        uni.hideLoading();
        
        // 根据后端返回的信息处理支付跳转
        this.handlePaymentRedirect({
          payUrl,
          paymentMethod,
          orderNumber,
          amount,
          title: this.orderData.title
        });
        
      } catch (err) {
        console.error('支付处理错误:', err);
        uni.hideLoading();
        
        let errorMsg = '网络异常，请重试';
        if (err.message) {
          errorMsg = err.message;
        } else if (err.errMsg) {
          if (err.errMsg.includes('timeout')) {
            errorMsg = '请求超时，请检查网络连接';
          } else if (err.errMsg.includes('fail')) {
            errorMsg = '网络连接失败，请重试';
          } else {
            errorMsg = err.errMsg;
          }
        }
        
        uni.showModal({
          title: '支付失败',
          content: errorMsg,
          confirmText: '重试',
          cancelText: '返回',
          success: (modalRes) => {
            if (modalRes.confirm) {
              // 延迟重试，避免频繁请求
              setTimeout(() => {
                this.handlePay();
              }, 1000);
            }
          }
        });
      } finally {
        this.paying = false;
      }
    },
    
    validateOrder() {
      if (!this.orderData.id) {
        uni.showToast({
          title: '订单ID缺失',
          icon: 'none'
        });
        return false;
      }
      if (!this.orderData.actual_duration || this.orderData.actual_duration <= 0) {
        uni.showToast({
          title: '寄存时长异常',
          icon: 'none'
        });
        return false;
      }
      if (this.totalAmount <= 0) {
        uni.showToast({
          title: '订单金额异常',
          icon: 'none'
        });
        return false;
      }
      if (!this.orderData.title) {
        uni.showToast({
          title: '订单标题缺失',
          icon: 'none'
        });
        return false;
      }
      return true;
    },

    // 验证URL格式
    isValidUrl(url) {
      if (!url || typeof url !== 'string') {
        return false;
      }
      
      try {
        // 简单的URL格式验证
        const urlPattern = /^https?:\/\/.+/;
        return urlPattern.test(url);
      } catch (e) {
        return false;
      }
    },

    // 处理支付跳转
    handlePaymentRedirect(paymentInfo) {
      const { payUrl, paymentMethod, orderNumber, amount, title } = paymentInfo;
      
      console.log('处理支付跳转:', paymentInfo);
      
      // 显示支付确认对话框
      uni.showModal({
        title: '确认支付',
        content: `订单号：${orderNumber}\n支付金额：¥${amount}\n支付方式：${paymentMethod === 'alipay' ? '支付宝' : paymentMethod}\n\n即将跳转到安全支付环境`,
        confirmText: '确认支付',
        cancelText: '取消',
        success: (modalRes) => {
          if (modalRes.confirm) {
            this.openPaymentUrl(payUrl, paymentInfo);
          }
        }
      });
    },

    // 打开支付链接
    openPaymentUrl(payUrl, paymentInfo) {
      console.log('打开支付链接:', payUrl);
      
      // 保存支付信息到本地存储，用于支付结果处理
      try {
        uni.setStorageSync('current_payment_info', {
          ...paymentInfo,
          startTime: Date.now()
        });
      } catch (error) {
        console.error('保存支付信息失败:', error);
      }
      
      try {
        // 检测当前环境并使用相应的打开方式
        if (typeof window !== 'undefined' && window.open) {
          // H5环境：在新窗口打开
          const newWindow = window.open(payUrl, '_blank');
          if (!newWindow) {
            // 如果被浏览器阻止弹窗，则提示用户
            this.showPaymentUrlFallback(payUrl);
          } else {
            // 监听窗口关闭，检查支付结果
            this.monitorPaymentWindow(newWindow, paymentInfo);
          }
        } else if (typeof plus !== 'undefined' && plus.runtime) {
          // App环境：使用系统浏览器打开
          plus.runtime.openURL(payUrl, (error) => {
            console.error('打开支付链接失败:', error);
            this.showPaymentUrlFallback(payUrl);
          });
          // 设置定时器检查支付结果
          this.startPaymentResultCheck(paymentInfo);
        } else {
          // 其他环境或小程序：复制链接提示用户在浏览器打开
          this.showPaymentUrlFallback(payUrl);
        }
        
      } catch (error) {
        console.error('打开支付链接异常:', error);
        this.showPaymentUrlFallback(payUrl);
      }
    },

    // 支付链接备用方案
    showPaymentUrlFallback(payUrl) {
      uni.setClipboardData({
        data: payUrl,
        success: () => {
          uni.showModal({
            title: '支付链接已复制',
            content: '支付链接已复制到剪贴板，请在浏览器中粘贴打开完成支付',
            confirmText: '我知道了',
            showCancel: false,
            success: () => {
              // 可以选择返回上一页或停留在当前页面
              console.log('用户确认已知晓支付链接复制');
            }
          });
        },
        fail: () => {
          uni.showModal({
            title: '支付链接',
            content: `请复制以下链接在浏览器中打开：\n\n${payUrl}`,
            confirmText: '我知道了',
            showCancel: false
          });
        }
      });
    },

    // 监听支付窗口（H5环境）
    monitorPaymentWindow(paymentWindow, paymentInfo) {
      if (!paymentWindow) {
        console.error('支付窗口对象无效');
        return;
      }
      
      const checkInterval = setInterval(() => {
        try {
          if (paymentWindow.closed) {
            clearInterval(checkInterval);
            console.log('支付窗口已关闭，检查支付结果');
            this.checkPaymentResult(paymentInfo);
          }
        } catch (error) {
          console.error('监听支付窗口失败:', error);
          clearInterval(checkInterval);
        }
      }, 1000);
      
      // 设置最大监听时间（10分钟）
      setTimeout(() => {
        clearInterval(checkInterval);
        try {
          if (paymentWindow && !paymentWindow.closed) {
            console.log('支付监听超时');
          }
        } catch (error) {
          console.error('检查窗口状态失败:', error);
        }
      }, 10 * 60 * 1000);
    },

    // 开始支付结果检查（App环境）
    startPaymentResultCheck(paymentInfo) {
      // 延迟3秒后开始检查，给用户时间完成支付
      setTimeout(() => {
        this.checkPaymentResult(paymentInfo);
      }, 3000);
    },

    // 检查支付结果
    async checkPaymentResult(paymentInfo) {
      if (!paymentInfo || !paymentInfo.orderNumber) {
        console.error('支付信息无效:', paymentInfo);
        return;
      }
      
      try {
        console.log('检查支付结果:', paymentInfo);
        
        // 调用后端接口检查支付状态
        const res = await uni.request({
          url: 'http://127.0.0.1:8000/v1/payment/status',
          method: 'POST',
          header: {
            'Content-Type': 'application/json'
          },
          data: {
            order_id: paymentInfo.orderNumber,
            order_number: paymentInfo.orderNumber
          },
          timeout: 5000
        });
        
        if (res.statusCode === 200 && res.data) {
          const paymentStatus = res.data.status;
          
          if (paymentStatus === 'success' || paymentStatus === 2) {
            // 支付成功
            this.handlePaymentSuccess(paymentInfo);
          } else if (paymentStatus === 'failed' || paymentStatus === 3) {
            // 支付失败
            this.handlePaymentFailed(paymentInfo, res.data.message);
          } else {
            // 支付状态未知，提示用户
            this.handlePaymentUnknown(paymentInfo);
          }
        } else {
          this.handlePaymentUnknown(paymentInfo);
        }
        
      } catch (error) {
        console.error('检查支付结果失败:', error);
        // 网络错误时不显示未知状态，避免误导用户
        console.log('由于网络错误，跳过支付状态检查');
      }
    },

    // 支付成功处理
    handlePaymentSuccess(paymentInfo) {
      uni.removeStorageSync('current_payment_info');
      
      // 更新订单状态为已支付
      this.orderData.status = 2; // 寄存中
      
      uni.showToast({
        title: '支付成功',
        icon: 'success',
        duration: 2000
      });
      
      setTimeout(() => {
        // 返回订单详情页面，显示最新状态
        uni.navigateTo({
          url: `/pages/show/show?id=${this.orderData.id}`,
          fail: () => {
            // 如果跳转失败，返回上一页
            uni.navigateBack({
              delta: 1,
              fail: () => {
                uni.reLaunch({
                  url: '/pages/index/index'
                });
              }
            });
          }
        });
      }, 2000);
    },

    // 支付失败处理
    handlePaymentFailed(paymentInfo, message) {
      uni.removeStorageSync('current_payment_info');
      
      uni.showModal({
        title: '支付失败',
        content: message || '支付未成功，请重试',
        confirmText: '重新支付',
        cancelText: '返回',
        success: (res) => {
          if (res.confirm) {
            // 重新发起支付
            this.handlePay();
          }
        }
      });
    },

    // 支付状态未知处理
    handlePaymentUnknown(paymentInfo) {
      uni.showModal({
        title: '支付状态确认',
        content: '无法确认支付状态，请检查订单详情或联系客服',
        confirmText: '查看订单',
        cancelText: '返回',
        success: (res) => {
          if (res.confirm) {
            this.goToOrderDetail(this.orderData.id);
          }
        }
      });
    },

    selectPayment(method) {
      if (this.paying) return;
      this.selectedPayment = method;
      // 触感反馈
      uni.vibrateShort({
        success: () => {
          uni.showToast({
            title: `已选择支付宝`,
            icon: 'none',
            duration: 1000
          });
        }
      });
    },
    goBack() {
      uni.navigateBack();
    },
    goToOrderDetail(orderId) {
      uni.navigateTo({
        url: `/pages/show/show?id=${orderId}`
      });
    },
    goToOrderList() {
      uni.switchTab({
        url: '/pages/orders/orders'
      });
    },
    
    // 获取订单状态文本
    getOrderStatusText(status) {
      const numStatus = parseInt(status);
      switch (numStatus) {
        case 1: return '待支付';
        case 2: return '寄存中';
        case 3: return '已完成';
        case 4: return '已取消';
        case 5: return '超时';
        case 6: return '异常';
        default: return '未知状态';
      }
    },
    
    // 获取押金状态文本
    getDepositStatusText(status) {
      const numStatus = parseInt(status);
      switch (numStatus) {
        case 1: return '已支付';
        case 2: return '已退还';
        case 3: return '已扣除';
        default: return '未知状态';
      }
    }
  }
}
</script>

<style scoped>
.pay-container {
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

/* 订单摘要 */
.order-summary {
  background: #fff;
  margin: 24rpx;
  border-radius: 16rpx;
  padding: 32rpx;
}

.order-info {
  margin-bottom: 24rpx;
}

.order-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #222;
  display: block;
  margin-bottom: 16rpx;
}

.order-details {
  margin-top: 16rpx;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.detail-label {
  font-size: 28rpx;
  color: #666;
  flex-shrink: 0;
}

.detail-value {
  font-size: 28rpx;
  color: #222;
  text-align: right;
  flex: 1;
}

.detail-value.status {
  font-weight: bold;
}

.detail-value.status.status-1 {
  color: #ff9500;
}

.detail-value.status.status-2 {
  color: #007aff;
}

.detail-value.status.status-3 {
  color: #34c759;
}

.detail-value.deposit {
  font-weight: bold;
}

.detail-value.deposit.deposit-1 {
  color: #34c759;
}

.detail-value.deposit.deposit-2 {
  color: #007aff;
}

.detail-value.deposit.deposit-3 {
  color: #ff3b30;
}

.amount-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24rpx;
  border-top: 1rpx solid #f0f0f0;
}

.amount-label {
  font-size: 32rpx;
  color: #222;
}

.amount-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #ff3b30;
}

/* 费用明细 */
.fee-detail {
  background: #fff;
  margin: 24rpx;
  border-radius: 16rpx;
  padding: 32rpx;
}

.detail-header {
  margin-bottom: 24rpx;
}

.detail-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #222;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
}

.detail-divider {
  height: 1rpx;
  background: #f0f0f0;
  margin: 16rpx 0;
}

.detail-item.total {
  font-weight: bold;
}

.item-label {
  font-size: 28rpx;
  color: #666;
}

.item-value {
  font-size: 32rpx;
  color: #222;
}

.item-value.discount {
  color: #34c759;
}

/* 支付方式 */
.payment-methods {
  background: #fff;
  margin: 24rpx;
  border-radius: 16rpx;
  padding: 32rpx;
}

.method-header {
  margin-bottom: 24rpx;
}

.method-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #222;
}

.payment-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  transition: background-color 0.2s ease;
}

.payment-option:last-child {
  border-bottom: none;
}

.payment-option.active {
  background-color: rgba(0, 122, 255, 0.05);
}

.option-left {
  display: flex;
  align-items: center;
}

.payment-icon {
  font-size: 40rpx;
  margin-right: 24rpx;
}

.payment-name {
  font-size: 32rpx;
  color: #222;
}

.radio {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #ddd;
  border-radius: 50%;
  position: relative;
}

.radio.checked {
  border-color: #007aff;
}

.radio.checked::after {
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

/* 支付按钮 */
.pay-action {
  margin: 48rpx 24rpx;
}

.pay-btn {
  width: 100%;
  border-radius: 48rpx;
  padding: 32rpx 0;
  font-size: 36rpx;
  font-weight: bold;
  border: none;
  background: #007aff;
  color: #fff;
}

.pay-btn.disabled {
  background: #ccc;
  color: #999;
}

/* 次要操作按钮 */
.secondary-actions {
  display: flex;
  justify-content: space-around;
  margin-top: 32rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #f0f0f0;
}

.link-text {
  font-size: 28rpx;
  color: #007aff;
  padding: 16rpx 24rpx;
  text-decoration: underline;
}


</style>