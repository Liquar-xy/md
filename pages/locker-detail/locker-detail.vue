<template>
  <view class="locker-detail-container">
    <!-- 返回栏 -->
    <view class="header-bar">
      <text class="back-btn" @click="goBack">〈</text>
      <text class="header-title">柜子信息</text>
    </view>

    <!-- 柜点信息 -->
    <view class="site-info">
      <view class="site-title">{{ lockerInfo.name }}</view>
      <view class="site-address">
        <text class="iconfont">📍</text>
        {{ lockerInfo.address }}
      </view>
      <view class="site-map-btn">导航</view>
    </view>

    <!-- 当前可用 -->
    <view class="available-section">
      <view class="section-title">当前可用 <text class="device-status">设备在线</text></view>
      <view class="locker-list">
        <view class="locker-item" v-for="item in lockerInfo.locker" :key="item.name">
          <image class="locker-img" :src="getLockerImg(item.lockerType)" />
          <view class="locker-desc">
            <view class="locker-name">{{ item.name }} <text class="locker-status" v-if="item.num > 0">(可用)</text><text class="locker-status" v-else style="color:#e74c3c;">(已满)</text></view>
            <view class="locker-size">{{ item.size }}</view>
            <view class="locker-rate">{{ item.hourlyRate === 0 ? '免费' : (item.hourlyRate + '元/小时') }}</view>
            <view class="locker-desc-text">{{ item.description }}</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 选择寄存 -->
    <view class="select-section">
      <view class="section-title">选择寄存</view>
      <view class="select-row">
        <text>选择柜子型号</text>
        <picker :range="lockerTypes.map(l=>l.name)" :value="selectedLockerType" @change="onLockerTypeChange">
          <view class="picker-value">{{ lockerTypes[selectedLockerType] ? lockerTypes[selectedLockerType].name : '无可用柜子' }}</view>
        </picker>
      </view>
      <view class="select-row">
        <text>选择寄存时长</text>
        <picker :range="hours" :value="selectedHour" @change="onHourChange">
          <view class="picker-value">{{ hours[selectedHour] }}</view>
        </picker>
      </view>
      <view class="select-row">
        <text>选择取件方式</text>
        <picker :range="pickupWays" :value="selectedPickupWay" @change="onPickupWayChange">
          <view class="picker-value">{{ pickupWays[selectedPickupWay] }}</view>
        </picker>
      </view>
      <view class="select-row price-row">
        <text>预计费用（优惠后）：</text>
        <text class="price">￥{{ calcPrice }}</text>
      </view>
    </view>

    <!-- 取件方式 -->
    <view class="pickup-section">
      <view class="section-title">取件方式</view>
      <view class="pickup-list">
        <view class="pickup-item" v-for="(way, idx) in pickupWays" :key="way">
          <text>{{ way }}</text>
          <button size="mini" :type="idx === selectedPickupWay ? 'primary' : 'default'">{{ idx === selectedPickupWay ? '已选' : '选用' }}</button>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="footer-bar">
      <view class="footer-price">合计￥{{ calcPrice }}</view>
      <button class="footer-btn" type="primary" @click="onConfirmDeposit">确认寄存</button>
    </view>

    <!-- 柜门已开弹窗 -->
    <view v-if="showDepositResult" class="deposit-result-modal">
      <image src="https://img.icons8.com/ios-filled/100/000000/box.png" class="result-img" />
      <view class="result-title">柜门已开，请存放您的物品</view>
      <view class="result-locker-id">{{ depositResult.locker_id }}号</view>
      <button class="order-btn" @click="goOrderDetail">查看订单</button>
      <view class="change-locker-tip">
        柜子异常？<text class="change-link" @click="onChangeLocker">点击换个柜子&gt;&gt;</text>
      </view>
    </view>

    <!-- 换柜子弹窗 -->
    <view v-if="showChangeLocker" class="change-locker-modal">
      <view class="modal-title">更换柜门</view>
      <view class="modal-locker-id">{{ newLockerId }}号</view>
      <view class="modal-desc">
        原{{ depositResult.locker_id }}号柜门异常，即将为您打开新的柜门。请您取出原柜门个人物品，存放在新柜门内。
      </view>
      <button class="confirm-btn" @click="onConfirmChangeLocker">确认</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      lockerInfo: {
        name: '',
        address: '',
        locker: []
      },
      lockerTypes: [], // 只包含有余量的locker
      selectedLockerType: 0,
      hours: ['1小时', '2小时', '3小时', '4小时', '8小时'],
      selectedHour: 0,
      pickupWays: ['柜门扫码取件', '柜门密码取件', '柜台人工取件'],
      selectedPickupWay: 0,
      depositResult: null,
      showDepositResult: false,
      showChangeLocker: false,
      newLockerId: null
    }
  },
  computed: {
    calcPrice() {
      if (!this.lockerTypes.length) return '0.0';
      const locker = this.lockerTypes[this.selectedLockerType];
      if (!locker) return '0.0';
      const price = locker.hourlyRate || 0;
      // 提取小时数
      const hourStr = this.hours[this.selectedHour];
      const hour = parseInt(hourStr.match(/\d+/)?.[0] || '1');
      return price === 0 ? '免费' : (price * hour).toFixed(2);
    }
  },
  onLoad(options) {
    const locker_id = options.locker_id || 1;
    this.fetchLockerInfo(locker_id);
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    onLockerTypeChange(e) {
      this.selectedLockerType = e.detail.value;
    },
    onHourChange(e) {
      this.selectedHour = e.detail.value;
    },
    onPickupWayChange(e) {
      this.selectedPickupWay = e.detail.value;
    },
    onConfirmDeposit() {
      // 构造请求参数
      const scheduled_duration = parseInt(this.hours[this.selectedHour].match(/\d+/)[0]);
      const locker_type = this.lockerTypes[this.selectedLockerType].lockerType;
      const cabinet_id = this.lockerInfo.id || 1;
      uni.request({
        url: 'http://127.0.0.1:8000/deposit/createDeposit',
        method: 'POST',
        data: {
          scheduled_duration,
          locker_type,
          cabinet_id
        },
        header: {
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTM3NTUyNDMsImlkIjoiMTIzIiwieW91cl9jdXN0b21fY2xhaW0iOiJ5b3VyX2N1c3RvbV92YWx1ZSJ9.qcdoe8dSYtfQBZgCP30Yln4r8z9ovPDEF1fNVlviWX4'
        },
        success: (res) => {
          if (res.data && res.data.code === 200) {
            this.depositResult = {
              order_no: res.data.data.orderNo,
              locker_id: res.data.data.lockerId
            };
            this.showDepositResult = true;
          } else {
            uni.showToast({ title: res.data.msg || '寄存失败', icon: 'none' });
          }
        }
      });
    },
    onChangeLocker() {
      uni.request({
        url: 'http://127.0.0.1:8000/deposit/updateDepositLockerId',
        method: 'POST',
        data: {
          order_id: this.depositResult.order_no
        },
        header: {
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTM3NTUyNDMsImlkIjoiMTIzIiwieW91cl9jdXN0b21fY2xhaW0iOiJ5b3VyX2N1c3RvbV92YWx1ZSJ9.qcdoe8dSYtfQBZgCP30Yln4r8z9ovPDEF1fNVlviWX4'
        },
        success: (res) => {
          if (res.data && res.data.code === 200) {
            this.newLockerId = res.data.lockerId;
            this.showChangeLocker = true;
          } else {
            uni.showToast({ title: res.data.msg || '换柜失败', icon: 'none' });
          }
        }
      });
    },
    onConfirmChangeLocker() {
      this.showChangeLocker = false;
      this.depositResult.locker_id = this.newLockerId;
    },
    goOrderDetail() {
      // 跳转到订单详情页，需根据你的路由实际调整
      uni.navigateTo({
        url: `/pages/order-detail/order-detail?order_no=${this.depositResult.order_no}`
      });
    },
    fetchLockerInfo(locker_id) {
      uni.request({
        url: `http://127.0.0.1:8000/getDepositLocker?locker_id=${locker_id}`,
        method: 'GET',
        header: {
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTM3NTUyNDMsImlkIjoiMTIzIiwieW91cl9jdXN0b21fY2xhaW0iOiJ5b3VyX2N1c3RvbV92YWx1ZSJ9.qcdoe8dSYtfQBZgCP30Yln4r8z9ovPDEF1fNVlviWX4'
        },
        success: (res) => {
          if (res.data) {
            this.lockerInfo = res.data;
            // 只保留有余量的locker
            this.lockerTypes = (res.data.locker || []).filter(l => l.num > 0);
            // 如果没有可用locker，selectedLockerType为0
            this.selectedLockerType = 0;
          }
        },
        fail: () => {
          // 假数据兜底
          this.lockerInfo = {
            name: '郑州火车站寄存柜',
            address: '郑州火车站西广场路北100米KFC门口',
            locker: [
              { name: '小柜子', description: '适合小件', size: '33L(298*429*430mm)', num: 3, hourlyRate: 1, lockerType: 1, freeDuration: 0 },
              { name: '大柜子', description: '适合大件', size: '53L(298*429*630mm)', num: 2, hourlyRate: 2, lockerType: 2, freeDuration: 0 }
            ]
          };
          this.lockerTypes = this.lockerInfo.locker.filter(l => l.num > 0);
          this.selectedLockerType = 0;
        }
      });
    },
    getLockerImg(type) {
      // 可根据类型返回不同图片
      return type === 2
        ? 'https://img.icons8.com/ios-filled/100/000000/box.png'
        : 'https://img.icons8.com/ios-filled/100/000000/parcel.png';
    }
  }
}
</script>

<style scoped>
.locker-detail-container {
  background: #f5f6fa;
  min-height: 100vh;
  padding-bottom: 120rpx;
}
.header-bar {
  display: flex;
  align-items: center;
  padding: 30rpx 20rpx 10rpx 20rpx;
  background: #fff;
  border-bottom: 1rpx solid #eee;
}
.back-btn {
  font-size: 36rpx;
  color: #333;
  margin-right: 20rpx;
}
.header-title {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
}
.site-info {
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 24rpx 20rpx 16rpx 20rpx;
}
.site-title {
  font-size: 30rpx;
  color: #222;
  font-weight: bold;
}
.site-address {
  font-size: 24rpx;
  color: #666;
  margin: 8rpx 0;
  display: flex;
  align-items: center;
}
.site-map-btn {
  color: #007aff;
  font-size: 24rpx;
  margin-left: auto;
  margin-top: -32rpx;
}
.available-section {
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 20rpx;
}
.section-title {
  font-size: 26rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 10rpx;
}
.device-status {
  color: #e67e22;
  font-size: 22rpx;
  margin-left: 10rpx;
}
.locker-list {
  display: flex;
  gap: 20rpx;
}
.locker-item {
  display: flex;
  align-items: center;
  background: #f8f8f8;
  border-radius: 12rpx;
  padding: 16rpx;
  flex: 1;
}
.locker-img {
  width: 60rpx;
  height: 60rpx;
  margin-right: 16rpx;
}
.locker-desc {
  flex: 1;
}
.locker-name {
  font-size: 24rpx;
  color: #333;
  font-weight: bold;
}
.locker-status {
  color: #007aff;
  font-size: 20rpx;
}
.locker-size {
  font-size: 20rpx;
  color: #999;
}
.locker-rate {
  font-size: 20rpx;
  color: #e67e22;
}
.locker-desc-text {
  font-size: 20rpx;
  color: #666;
  margin-top: 4rpx;
}
.select-section {
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 20rpx;
}
.select-row {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}
.picker-value {
  margin-left: 20rpx;
  color: #007aff;
  font-size: 24rpx;
}
.price-row {
  justify-content: flex-end;
}
.price {
  color: #e74c3c;
  font-size: 28rpx;
  font-weight: bold;
  margin-left: 10rpx;
}
.pickup-section {
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 20rpx;
}
.pickup-list {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}
.pickup-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.footer-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #eee;
}
.footer-price {
  color: #e74c3c;
  font-size: 32rpx;
  font-weight: bold;
}
.footer-btn {
  width: 300rpx;
  font-size: 28rpx;
}
.deposit-result-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: #f6f8fc;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.result-img {
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 20rpx;
}
.result-title {
  font-size: 28rpx;
  color: #222;
  font-weight: bold;
  margin-bottom: 16rpx;
}
.result-locker-id {
  font-size: 48rpx;
  color: #222;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx 60rpx;
  margin-bottom: 32rpx;
  font-weight: bold;
  box-shadow: 0 2rpx 12rpx #e6e6e6;
}
.order-btn {
  background: #1677ff;
  color: #fff;
  font-size: 28rpx;
  border-radius: 12rpx;
  margin-bottom: 24rpx;
  width: 300rpx;
}
.change-locker-tip {
  color: #ff9900;
  font-size: 22rpx;
  margin-top: 20rpx;
}
.change-link {
  color: #ff6600;
  text-decoration: underline;
  margin-left: 8rpx;
}
.change-locker-modal {
  position: fixed;
  left: 0; right: 0; bottom: 0;
  background: #fff;
  border-top-left-radius: 24rpx;
  border-top-right-radius: 24rpx;
  box-shadow: 0 -2rpx 12rpx #e6e6e6;
  z-index: 1100;
  padding: 40rpx 32rpx 32rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.modal-title {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 16rpx;
}
.modal-locker-id {
  font-size: 40rpx;
  color: #222;
  background: #f6f8fc;
  border-radius: 16rpx;
  padding: 20rpx 50rpx;
  margin-bottom: 20rpx;
  font-weight: bold;
}
.modal-desc {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 32rpx;
  text-align: center;
}
.confirm-btn {
  background: #1677ff;
  color: #fff;
  font-size: 28rpx;
  border-radius: 12rpx;
  width: 300rpx;
}
</style> 