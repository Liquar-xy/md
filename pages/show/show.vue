<template>
  <view class="order-detail-container">
    <!-- 顶部返回栏 -->
    <view class="header-bar">
      <view class="back-btn" @click="goBack" hover-class="back-btn-hover">
        <text class="back-icon">←</text>
      </view>
      <text class="header-title">订单详情</text>
      <view class="header-placeholder"></view>
    </view>

    <!-- 订单详情内容 -->
    <view v-if="loading" class="loading-container">
      <text class="loading-text">加载中...</text>
    </view>

    <view v-else-if="order" class="order-detail-content">
      <!-- 订单状态 -->
      <view class="order-status-banner">
        <text class="status-text">
          {{ getOrderStatusText(order.status) }}
        </text>
      </view>

      <!-- 订单基本信息 -->
      <view class="order-info-card">
        <view class="info-row">
          <text class="info-label">订单号</text>
          <text class="info-value">{{ order.order_number }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">寄存网点</text>
          <text class="info-value">{{ order.storage_location_name }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">柜子ID</text>
          <text class="info-value">{{ order.cabinet_id }}</text>
        </view>
      </view>

      <!-- 时间和费用信息 -->
      <view class="order-time-fee-card">
        <view class="info-row">
          <text class="info-label">计划寄存时长</text>
          <text class="info-value">{{ order.scheduled_duration }}小时</text>
        </view>
        <view class="info-row">
          <text class="info-label">实际寄存时长</text>
          <text class="info-value">{{ order.actual_duration }}小时</text>
        </view>
        <view class="info-row">
          <text class="info-label">基础费用</text>
          <text class="info-value">¥{{ order.price.toFixed(2) }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">优惠金额</text>
          <text class="info-value">¥{{ order.discount.toFixed(2) }}</text>
        </view>
        <view class="info-row total">
          <text class="info-label">实付金额</text>
          <text class="info-value highlight">¥{{ order.amount_paid.toFixed(2) }}</text>
        </view>
      </view>

      <!-- 押金状态 -->
      <view class="order-deposit-card">
        <view class="info-row">
          <text class="info-label">押金状态</text>
          <text class="info-value">
            {{ getDepositStatusText(order.deposit_status) }}
          </text>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="order-actions">
        <button 
          v-if="order.status === 2" 
          class="action-btn primary"
          @click="handlePickup"
        >
          取出物品
        </button>
        <button 
          v-if="order.status === 3" 
          class="action-btn default"
          @click="handleEvaluate"
        >
          去评价
        </button>
        <button 
          v-if="order.status !== 3"
          class="action-btn secondary"
          @click="handleCustomAction"
        >
          去支付
        </button>
        <button 
          v-if="order.status === 2"
          class="action-btn remind"
          @click="goToRemindTask"
        >
          发送提醒
        </button>
        <button 
          v-if="order.status === 1 || order.status === 2"
          class="action-btn expire-remind"
          @click="goToExpireRemind"
        >
          提醒到期
        </button>
        <button 
          v-if="order.status === 1 || order.status === 2"
          class="action-btn refund"
          @click="goToRefund"
        >
          申请退款
        </button>
      </view>
    </view>

    <view v-else class="error-container">
      <text class="error-text">未找到订单详情</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      orderId: null,
      order: null,
      loading: true,
      statusCheckTimer: null // 状态检查定时器
    }
  },
  onLoad(options) {
    // 从路由参数获取订单ID，确保是数字
    const id = options.id ? parseInt(options.id, 10) : null;
    
    if (id && !isNaN(id)) {
      this.orderId = id;
      this.fetchOrderDetails();
    } else {
      // 如果ID无效，显示错误并返回
      uni.showToast({
        title: '无效的订单ID',
        icon: 'none',
        duration: 2000
      });
      
      // 2秒后返回上一页
      setTimeout(() => {
        uni.navigateBack();
      }, 2000);
    }
  },
  
  onShow() {
    // 页面显示时开始状态同步
    this.startStatusSync();
  },
  
  onHide() {
    // 页面隐藏时停止状态同步
    this.stopStatusSync();
  },
  
  onUnload() {
    // 页面卸载时停止状态同步
    this.stopStatusSync();
  },
  methods: {
    fetchOrderDetails() {
      // 如果没有订单ID，显示错误
      if (!this.orderId) {
        uni.showToast({
          title: '订单ID无效',
          icon: 'none'
        });
        this.loading = false;
        return;
      }

      // 发起请求获取订单详情
      uni.request({
        url: 'http://127.0.0.1:8000/v1/orders/show', 
        method: 'POST',
        header: {
          'Content-Type': 'application/json'
        },
        data: JSON.stringify({
          id: this.orderId  // 使用路由传递的订单ID
        }),
        success: (res) => {
          console.log('订单详情请求成功:', res);
          
          // 检查响应状态码
          if (res.statusCode !== 200) {
            uni.showToast({
              title: `请求失败：状态码 ${res.statusCode}`,
              icon: 'none'
            });
            return;
          }

          // 检查返回的数据结构
          if (!res.data || !res.data.order || res.data.order.length === 0) {
            uni.showToast({
              title: '未找到订单详情',
              icon: 'none'
            });
            console.warn('订单数据为空:', res.data);
            return;
          }

          // 直接取第一个订单（假设返回的是单个订单的数组）
          const orderData = res.data.order[0];

          // 映射订单数据
          this.order = {
            id: orderData.id,
            order_number: orderData.orderNumber,
            user_id: orderData.userId,
            scheduled_duration: orderData.scheduledDuration,
            actual_duration: orderData.actualDuration,
            price: orderData.price,
            discount: orderData.discount,
            amount_paid: orderData.amountPaid,
            storage_location_name: orderData.storageLocationName,
            cabinet_id: orderData.cabinetId,
            status: parseInt(orderData.status) || 0, // 确保状态是数字类型
            deposit_status: parseInt(orderData.depositStatus) || 0 // 确保押金状态是数字类型
          };

          // 调试信息：打印订单状态
          console.log('订单状态调试信息:', {
            原始状态: orderData.status,
            转换后状态: this.order.status,
            状态文本: this.getOrderStatusText(this.order.status)
          });

          // 如果订单为空，显示错误提示
          if (!this.order) {
            uni.showToast({
              title: '未找到订单详情',
              icon: 'none'
            });
          } else {
            // 订单数据加载完成后，启动状态同步
            this.startStatusSync();
          }
        },
        fail: (err) => {
          console.error('获取订单详情失败 - 详细错误:', err);
          uni.showToast({
            title: `获取订单详情失败：${err.errMsg || '未知错误'}`,
            icon: 'none'
          });
        },
        complete: () => {
          this.loading = false;
        }
      });
    },
    getOrderStatusText(status) {
      // 确保状态是数字类型
      const numStatus = parseInt(status);
      console.log('状态映射调试:', { 输入状态: status, 转换后: numStatus });
      
      switch (numStatus) {
        case 1: return '待支付';
        case 2: return '寄存中';
        case 3: return '已完成';
        case 4: return '已取消';
        case 5: return '超时';
        case 6: return '异常';
        default: 
          console.warn('未知的订单状态:', status, '类型:', typeof status);
          return `未知状态(${status})`;
      }
    },
    getDepositStatusText(status) {
      // 确保状态是数字类型
      const numStatus = parseInt(status);
      
      switch (numStatus) {
        case 1: return '已支付';
        case 2: return '已退还';
        case 3: return '已扣除';
        default: 
          console.warn('未知的押金状态:', status, '类型:', typeof status);
          return `未知状态(${status})`;
      }
    },
    goBack() {
      try {
        // 尝试返回上一页
        const pages = getCurrentPages();
        if (pages.length > 1) {
          uni.navigateBack({
            delta: 1,
            fail: (err) => {
              console.error('返回失败:', err);
              // 如果返回失败，提供备选方案
              uni.switchTab({
                url: '/pages/orders/orders',
                fail: () => {
                  uni.reLaunch({
                    url: '/pages/orders/orders'
                  });
                }
              });
            }
          });
        } else {
          // 如果没有上一页，直接切换到订单列表
          uni.switchTab({
            url: '/pages/orders/orders',
            fail: () => {
              uni.reLaunch({
                url: '/pages/orders/orders'
              });
            }
          });
        }
      } catch (error) {
        console.error('返回出错:', error);
        // 兜底方案：强制跳转到订单列表
        uni.reLaunch({
          url: '/pages/orders/orders'
        });
      }
    },
    handlePickup() {
      uni.showToast({
        title: '取出物品功能开发中',
        icon: 'none'
      });
    },
    handleEvaluate() {
      uni.showToast({
        title: '评价功能开发中',
        icon: 'none'
      });
    },
    handleCustomAction() {
      if (!this.order) {
        uni.showToast({
          title: '订单数据不完整',
          icon: 'none'
        });
        return;
      }

      // 只传递订单ID，让alipay页面从后端获取完整数据
      uni.navigateTo({
        url: `/pages/alipay/alipay?id=${this.order.id}`,
        fail: (err) => {
          console.error('跳转支付页面失败:', err);
          uni.showToast({
            title: '页面跳转失败',
            icon: 'none'
          });
        }
      });
    },
    goToRemindTask() {
      if (!this.order) {
        uni.showToast({
          title: '订单数据不完整',
          icon: 'none'
        });
        return;
      }

      // 跳转到定时任务提醒页面，可以传递订单相关信息
      uni.navigateTo({
        url: `/pages/timetasksend/timetasksend?orderId=${this.order.id}&orderNumber=${this.order.order_number}`,
        fail: (err) => {
          console.error('跳转提醒任务页面失败:', err);
          uni.showToast({
            title: '页面跳转失败',
            icon: 'none'
          });
        }
      });
    },
    
    // 开始状态同步
    startStatusSync() {
      // 如果已经有定时器，先清除
      this.stopStatusSync();
      
      // 只对未完成的订单进行状态同步
      if (this.order && this.order.status && this.order.status < 3) {
        console.log('开始订单状态同步，当前状态:', this.order.status);
        
        // 每30秒检查一次状态
        this.statusCheckTimer = setInterval(() => {
          this.syncOrderStatus();
        }, 30000);
      }
    },
    
    // 停止状态同步
    stopStatusSync() {
      if (this.statusCheckTimer) {
        clearInterval(this.statusCheckTimer);
        this.statusCheckTimer = null;
        console.log('停止订单状态同步');
      }
    },
    
    // 同步订单状态
    syncOrderStatus() {
      if (!this.orderId) return;
      
      console.log('同步订单状态，订单ID:', this.orderId);
      
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
          if (res.statusCode === 200 && res.data && res.data.order && res.data.order.length > 0) {
            const orderData = res.data.order[0];
            const newStatus = parseInt(orderData.status) || 0;
            const newDepositStatus = parseInt(orderData.depositStatus) || 0;
            
            // 检查状态是否发生变化
            if (this.order.status !== newStatus || this.order.deposit_status !== newDepositStatus) {
              console.log('订单状态发生变化:', {
                旧状态: this.order.status,
                新状态: newStatus,
                旧押金状态: this.order.deposit_status,
                新押金状态: newDepositStatus
              });
              
              // 更新订单状态
              this.order.status = newStatus;
              this.order.deposit_status = newDepositStatus;
              
              // 如果订单已完成，停止状态同步
              if (newStatus >= 3) {
                this.stopStatusSync();
              }
              
              // 显示状态变化提示
              uni.showToast({
                title: `订单状态已更新: ${this.getOrderStatusText(newStatus)}`,
                icon: 'none',
                duration: 2000
              });
            }
          }
        },
        fail: (err) => {
          console.error('同步订单状态失败:', err);
        }
      });
    },
    
    // 跳转到提醒到期页面
    goToExpireRemind() {
      if (!this.order) {
        uni.showToast({
          title: '订单数据不完整',
          icon: 'none'
        });
        return;
      }

      // 跳转到定时任务提醒页面，传递订单相关信息
      uni.navigateTo({
        url: `/pages/timetasksend/timetasksend?orderId=${this.order.id}&orderNumber=${this.order.order_number}&type=expire`,
        fail: (err) => {
          console.error('跳转提醒到期页面失败:', err);
          uni.showToast({
            title: '页面跳转失败',
            icon: 'none'
          });
        }
      });
    },
    
    // 跳转到退款页面
    goToRefund() {
      if (!this.order) {
        uni.showToast({
          title: '订单数据不完整',
          icon: 'none'
        });
        return;
      }

      // 跳转到订单删除页面，传递订单相关信息
      uni.navigateTo({
        url: `/pages/orderdel/orderdel?id=${this.order.id}&orderNumber=${this.order.order_number}&status=${this.order.status}`,
        fail: (err) => {
          console.error('跳转退款页面失败:', err);
          uni.showToast({
            title: '页面跳转失败',
            icon: 'none'
          });
        }
      });
    }
  }
}
</script>

<style scoped>
.order-detail-container {
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

.back-btn:active {
  background-color: rgba(0, 0, 0, 0.2);
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

/* 订单状态横幅 */
.order-status-banner {
  background: #007aff;
  color: #fff;
  text-align: center;
  padding: 24rpx 0;
}

.status-text {
  font-size: 32rpx;
  font-weight: bold;
}

/* 信息卡片通用样式 */
.order-info-card,
.order-time-fee-card,
.order-deposit-card {
  background: #fff;
  margin: 24rpx;
  border-radius: 16rpx;
  padding: 24rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 28rpx;
  color: #666;
}

.info-value {
  font-size: 32rpx;
  color: #222;
  text-align: right;
}

.info-row.total .info-label {
  font-weight: bold;
}

.info-row.total .info-value.highlight {
  color: #ff3b30;
  font-weight: bold;
}

/* 操作按钮 */
.order-actions {
  margin: 48rpx 24rpx;
}

.action-btn {
  width: 100%;
  border-radius: 48rpx;
  padding: 24rpx 0;
  font-size: 32rpx;
  border: none;
}

.action-btn.primary {
  background: #007aff;
  color: #fff;
}

.action-btn.default {
  background: #f0f0f0;
  color: #666;
}

.action-btn.secondary {
  background: #34c759;
  color: #fff;
  margin-top: 16rpx;
}

.action-btn.remind {
  background: #ff9500;
  color: #fff;
  margin-top: 16rpx;
}

.action-btn.expire-remind {
  background: #8e44ad;
  color: #fff;
  margin-top: 16rpx;
}

.action-btn.refund {
  background: #ff3b30;
  color: #fff;
  margin-top: 16rpx;
}

/* 错误状态 */
.error-container {
  text-align: center;
  padding: 40rpx 0;
  color: #999;
}
</style> 