<template>
  <view class="index-container">
    <!-- 顶部Banner区 -->
    <view class="banner-section">
      <image class="banner-img" src="https://img2.baidu.com/it/u=1819648572,1819648572&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=300" mode="widthFix"></image>
      <view class="banner-title">放心寄存</view>
      <view class="banner-desc">平台安全保障</view>
      <view class="banner-badge">寄存点</view>
      <view class="banner-action">
        <text class="iconfont">···</text>
      </view>
    </view>

    <!-- 城市选择与定位 -->
    <view class="location-section">
      <view class="city-select" @click="onSelectCity">{{ city }}</view>
      <view class="nearby-btn" @click="onNearby">我的附近</view>
    </view>

    <!-- 搜索框 -->
    <view class="search-section">
      <view class="search-box">
        <text class="iconfont">🔍</text>
        <input class="search-input" placeholder="搜索火车站/地铁站/景点" v-model="searchText" />
      </view>
    </view>

    <!-- 快捷标签tab -->
    <view class="tab-section">
      <view v-for="(tab, idx) in tabs" :key="tab" :class="['tab-item', {active: idx === activeTab}]" @click="onTabClick(idx)">
        {{ tab }}
      </view>
    </view>

    <!-- 查询按钮 -->
    <view class="query-btn-section">
      <button class="query-btn" @click="onQuery">查询寄存点</button>
    </view>

    <!-- 功能区 -->
    <view class="func-section">
      <view class="func-item" v-for="item in funcList" :key="item.text" @click="item.action()">
        <image :src="item.icon" class="func-icon"></image>
        <text class="func-text">{{ item.text }}</text>
      </view>
    </view>

    <!-- 小程序安全保障 -->
    <view class="miniapp-safe-section">
      <image src="https://img2.baidu.com/it/u=1819648572,1819648572&fm=253&fmt=auto&app=138&f=JPEG?w=50&h=50" class="miniapp-safe-icon"></image>
      <text class="miniapp-safe-text">小程序交易保障</text>
    </view>

    <!-- 线上寄存优惠券 -->
    <view class="coupon-section">
      <view class="coupon-title">线上寄存优惠券</view>
      <view class="coupon-desc">新人专享 无门槛优惠券大礼包！</view>
    </view>

    <!-- 附近寄存点 -->
    <view class="nearby-section">
      <view class="nearby-title">附近寄存点</view>
      <view class="nearby-list">
        <view class="nearby-item" v-for="point in nearbyPoints" :key="point.id" @click="goLockerDetail(point.id)">
          <image :src="point.img" class="nearby-img"></image>
          <view class="nearby-info">
            <view class="nearby-name">{{ point.name }}</view>
            <view class="nearby-detail">{{ point.detail }}</view>
            <view class="nearby-location">{{ point.location }}</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部导航栏 -->
    <view class="bottom-nav">
      <view class="nav-item active">
        <text class="nav-icon">🏠</text>
        <text class="nav-text">首页</text>
      </view>
      <view class="nav-item">
        <text class="nav-icon">📋</text>
        <text class="nav-text">订单</text>
      </view>
      <view class="nav-item">
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
      city: '郑州',
      searchText: '',
      tabs: ['郑州火车站', '新郑机场', '地铁站', '景点'],
      activeTab: 0,
      funcList: [
        { text: '我的订单', icon: 'https://img.icons8.com/ios-filled/50/000000/order-history.png', action: () => this.onFunc('order') },
        { text: '在线客服', icon: 'https://img.icons8.com/ios-filled/50/000000/online-support.png', action: () => this.onFunc('service') },
        { text: '寄存指南', icon: 'https://img.icons8.com/ios-filled/50/000000/book.png', action: () => this.onFunc('guide') },
        { text: '优惠卡券', icon: 'https://img.icons8.com/ios-filled/50/000000/coupon.png', action: () => this.onFunc('coupon') },
      ],
      nearbyPoints: [
        {
          id: 1,
          img: 'https://img2.baidu.com/it/u=1819648572,1819648572&fm=253&fmt=auto&app=138&f=JPEG?w=100&h=100',
          name: '郑州火车站寄存柜',
          detail: '大柜5个 中柜4个 小柜10个',
          location: '郑州火车站西广场路北100米KFC门口'
        },
        {
          id: 2,
          img: 'https://img2.baidu.com/it/u=1819648572,1819648572&fm=253&fmt=auto&app=138&f=JPEG?w=100&h=100',
          name: '郑州地铁寄存点',
          detail: '中柜2个 小柜8个',
          location: '郑州地铁1号线A出口旁'
        }
      ]
    }
  },
  methods: {
    onSelectCity() {
      uni.showToast({ title: '选择城市', icon: 'none' })
    },
    onNearby() {
      uni.showToast({ title: '定位到附近', icon: 'none' })
    },
    onTabClick(idx) {
      this.activeTab = idx
    },
    onQuery() {
      uni.showToast({ title: '查询寄存点', icon: 'none' })
    },
    onFunc(type) {
      uni.showToast({ title: '功能：' + type, icon: 'none' })
    },
    goLockerDetail(lockerId) {
      uni.navigateTo({
        url: `/pages/locker-detail/locker-detail?locker_id=${lockerId}`
      });
    }
  }
}
</script>

<style scoped>
.index-container {
  min-height: 100vh;
  background: #f5f6fa;
  padding-bottom: 120rpx;
}
.banner-section {
  position: relative;
  background: linear-gradient(180deg, #3a8cff 0%, #eaf6ff 100%);
  padding: 40rpx 30rpx 20rpx 30rpx;
  border-bottom-left-radius: 40rpx;
  border-bottom-right-radius: 40rpx;
  text-align: left;
}
.banner-img {
  width: 100%;
  height: 180rpx;
  border-radius: 20rpx;
  margin-bottom: 10rpx;
}
.banner-title {
  font-size: 40rpx;
  color: #fff;
  font-weight: bold;
  margin-top: -120rpx;
  margin-left: 20rpx;
}
.banner-desc {
  font-size: 28rpx;
  color: #fff;
  margin-left: 20rpx;
  margin-bottom: 10rpx;
}
.banner-badge {
  position: absolute;
  top: 30rpx;
  right: 60rpx;
  background: #ffb400;
  color: #fff;
  font-size: 24rpx;
  padding: 6rpx 20rpx;
  border-radius: 20rpx;
}
.banner-action {
  position: absolute;
  top: 30rpx;
  right: 20rpx;
  font-size: 36rpx;
  color: #fff;
}
.location-section {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx 0 30rpx;
}
.city-select {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
  margin-right: 20rpx;
}
.nearby-btn {
  font-size: 28rpx;
  color: #007aff;
  margin-left: auto;
}
.search-section {
  padding: 20rpx 30rpx 0 30rpx;
}
.search-box {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 30rpx;
  padding: 10rpx 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
}
.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 28rpx;
  background: transparent;
  margin-left: 10rpx;
}
.tab-section {
  display: flex;
  padding: 20rpx 30rpx 0 30rpx;
}
.tab-item {
  font-size: 28rpx;
  color: #666;
  background: #f0f4fa;
  border-radius: 20rpx;
  padding: 10rpx 30rpx;
  margin-right: 20rpx;
}
.tab-item.active {
  background: #007aff;
  color: #fff;
}
.query-btn-section {
  padding: 30rpx 30rpx 0 30rpx;
}
.query-btn {
  width: 100%;
  background: #007aff;
  color: #fff;
  font-size: 32rpx;
  border-radius: 30rpx;
  padding: 20rpx 0;
  font-weight: bold;
}
.func-section {
  display: flex;
  justify-content: space-between;
  background: #fff;
  margin: 30rpx 30rpx 0 30rpx;
  border-radius: 20rpx;
  padding: 30rpx 0;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
}
.func-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.func-icon {
  width: 48rpx;
  height: 48rpx;
  margin-bottom: 10rpx;
}
.func-text {
  font-size: 26rpx;
  color: #333;
}
.miniapp-safe-section {
  display: flex;
  align-items: center;
  background: #f8f8f8;
  margin: 20rpx 30rpx 0 30rpx;
  border-radius: 16rpx;
  padding: 16rpx 20rpx;
}
.miniapp-safe-icon {
  width: 36rpx;
  height: 36rpx;
  margin-right: 10rpx;
}
.miniapp-safe-text {
  font-size: 24rpx;
  color: #666;
}
.coupon-section {
  background: #fff4f0;
  margin: 20rpx 30rpx 0 30rpx;
  border-radius: 16rpx;
  padding: 20rpx 30rpx;
}
.coupon-title {
  font-size: 28rpx;
  color: #e74c3c;
  font-weight: bold;
}
.coupon-desc {
  font-size: 24rpx;
  color: #e67e22;
  margin-top: 8rpx;
}
.nearby-section {
  margin: 20rpx 30rpx 0 30rpx;
}
.nearby-title {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 10rpx;
}
.nearby-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.nearby-item {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
}
.nearby-img {
  width: 100rpx;
  height: 100rpx;
  border-radius: 12rpx;
  margin-right: 20rpx;
}
.nearby-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.nearby-name {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}
.nearby-detail {
  font-size: 24rpx;
  color: #666;
  margin: 4rpx 0;
}
.nearby-location {
  font-size: 22rpx;
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
