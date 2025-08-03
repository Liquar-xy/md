<template>
  <view class="map-container">
    <!-- 头部 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="title">{{ pointName || '网点位置' }}</view>
      <view class="header-right"></view>
    </view>
    
    <!-- 主要内容区域 -->
    <view class="content-area">
      <!-- 网点信息展示 -->
      <view class="point-info-section">
        <view class="point-header">
          <text class="point-icon">📍</text>
          <text class="point-title">{{ pointName || '网点位置' }}</text>
        </view>
        <view class="point-address">
          <text class="address-label">地址：</text>
          <text class="address-content">{{ pointAddress || '地址信息' }}</text>
        </view>
      </view>
      
      <!-- 地图选项 -->
      <view class="map-options">
        <view class="options-title">
          <text>选择地图应用查看位置</text>
        </view>
        <view class="options-grid">
          <view class="option-item" @click="openBaiduMap">
            <text class="option-icon">🗺️</text>
            <text class="option-name">百度地图</text>
          </view>
          <view class="option-item" @click="openGaodeMap">
            <text class="option-icon">🧭</text>
            <text class="option-name">高德地图</text>
          </view>
          <view class="option-item" @click="openTencentMap">
            <text class="option-icon">📍</text>
            <text class="option-name">腾讯地图</text>
          </view>
          <view class="option-item" @click="copyAddress">
            <text class="option-icon">📋</text>
            <text class="option-name">复制地址</text>
          </view>
        </view>
      </view>
      
      <!-- 位置预览 -->
      <view class="location-preview">
        <view class="preview-header">
          <text>位置预览</text>
        </view>
        <view class="preview-content">
          <view class="coordinate-info">
            <text class="coord-label">经度：</text>
            <text class="coord-value">{{ longitude }}</text>
          </view>
          <view class="coordinate-info">
            <text class="coord-label">纬度：</text>
            <text class="coord-value">{{ latitude }}</text>
          </view>
          <view class="location-note">
            <text>* 当前显示默认坐标，点击地图应用查看精确位置</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      pointName: '',
      pointAddress: '',
      longitude: 116.397428, // 默认北京坐标
      latitude: 39.90923
    }
  },
  
  onLoad(options) {
    console.log('地图页面加载 - 原始参数:', options);
    
    this.pointName = decodeURIComponent(options.name || '网点位置');
    this.pointAddress = decodeURIComponent(options.address || '地址信息');
    
    console.log('地图页面加载 - 名称:', this.pointName, '地址:', this.pointAddress);
    
    // 显示页面加载成功提示
    uni.showToast({
      title: '页面加载完成',
      icon: 'success',
      duration: 1500
    });
  },
  
  methods: {
    // 打开百度地图
    openBaiduMap() {
      const address = encodeURIComponent(this.pointAddress);
      const pointName = encodeURIComponent(this.pointName);
      
      // #ifdef H5
      const webUrl = `https://api.map.baidu.com/marker?location=${this.latitude},${this.longitude}&title=${pointName}&content=${address}&output=html&src=webapp`;
      window.open(webUrl, '_blank');
      // #endif
      
      // #ifdef APP-PLUS
      const appUrl = `baidumap://map/marker?location=${this.latitude},${this.longitude}&title=${pointName}&content=${address}&src=webapp`;
      plus.runtime.openURL(appUrl, function(res) {
        console.log('打开百度地图成功');
      }, function(e) {
        console.log('打开百度地图失败，尝试网页版');
        const webUrl = `https://api.map.baidu.com/marker?location=${this.latitude},${this.longitude}&title=${pointName}&content=${address}&output=html`;
        plus.runtime.openWeb(webUrl);
      });
      // #endif
      
      uni.showToast({
        title: '正在打开百度地图',
        icon: 'success'
      });
    },
    
    // 打开高德地图
    openGaodeMap() {
      const address = encodeURIComponent(this.pointAddress);
      const pointName = encodeURIComponent(this.pointName);
      
      // #ifdef H5
      const webUrl = `https://uri.amap.com/marker?position=${this.longitude},${this.latitude}&name=${pointName}&src=webapp`;
      window.open(webUrl, '_blank');
      // #endif
      
      // #ifdef APP-PLUS
      const appUrl = `androidamap://viewMap?lat=${this.latitude}&lon=${this.longitude}&title=${pointName}&content=${address}`;
      plus.runtime.openURL(appUrl, function(res) {
        console.log('打开高德地图成功');
      }, function(e) {
        console.log('打开高德地图失败，尝试网页版');
        const webUrl = `https://uri.amap.com/marker?position=${this.longitude},${this.latitude}&name=${pointName}&src=webapp`;
        plus.runtime.openWeb(webUrl);
      });
      // #endif
      
      uni.showToast({
        title: '正在打开高德地图',
        icon: 'success'
      });
    },
    
    // 打开腾讯地图
    openTencentMap() {
      const address = encodeURIComponent(this.pointAddress);
      const pointName = encodeURIComponent(this.pointName);
      
      // #ifdef H5
      const webUrl = `https://apis.map.qq.com/uri/v1/marker?marker=coord:${this.latitude},${this.longitude};title:${pointName};addr:${address}`;
      window.open(webUrl, '_blank');
      // #endif
      
      // #ifdef APP-PLUS
      const appUrl = `qqmap://map/routeplan?type=drive&to=${pointName}&tocoord=${this.latitude},${this.longitude}`;
      plus.runtime.openURL(appUrl, function(res) {
        console.log('打开腾讯地图成功');
      }, function(e) {
        console.log('打开腾讯地图失败，尝试网页版');
        const webUrl = `https://apis.map.qq.com/uri/v1/marker?marker=coord:${this.latitude},${this.longitude};title:${pointName};addr:${address}`;
        plus.runtime.openWeb(webUrl);
      });
      // #endif
      
      uni.showToast({
        title: '正在打开腾讯地图',
        icon: 'success'
      });
    },
    
    // 复制地址
    copyAddress() {
      uni.setClipboardData({
        data: this.pointAddress,
        success: () => {
          uni.showToast({
            title: '地址已复制到剪贴板',
            icon: 'success'
          });
        },
        fail: () => {
          uni.showToast({
            title: '复制失败',
            icon: 'none'
          });
        }
      });
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack();
    }
  }
}
</script>

<style scoped>
.map-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

/* 头部 */
.header {
  background-color: #ffffff;
  padding: 20rpx 40rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid #f0f0f0;
  z-index: 999;
}

.back-btn {
  padding: 10rpx;
}

.back-icon {
  font-size: 36rpx;
  color: #333333;
}

.title {
  font-size: 36rpx;
  color: #333333;
  font-weight: bold;
}

.header-right {
  width: 60rpx;
}

/* 主要内容区域 */
.content-area {
  flex: 1;
  padding: 30rpx;
  overflow-y: auto;
}

/* 网点信息区域 */
.point-info-section {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.point-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.point-icon {
  font-size: 40rpx;
  margin-right: 15rpx;
  color: #007aff;
}

.point-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
}

.point-address {
  display: flex;
  align-items: flex-start;
  line-height: 1.6;
}

.address-label {
  font-size: 28rpx;
  color: #666666;
  margin-right: 10rpx;
  flex-shrink: 0;
}

.address-content {
  font-size: 28rpx;
  color: #333333;
  flex: 1;
}

/* 地图选项区域 */
.map-options {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.options-title {
  margin-bottom: 30rpx;
}

.options-title text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.option-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30rpx 20rpx;
  background: #f8f9fa;
  border-radius: 15rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}

.option-item:active {
  transform: scale(0.95);
  background: #e3f2fd;
  border-color: #007aff;
}

.option-icon {
  font-size: 48rpx;
  margin-bottom: 10rpx;
}

.option-name {
  font-size: 26rpx;
  color: #333333;
  font-weight: 500;
}

/* 位置预览区域 */
.location-preview {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 40rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.preview-header {
  margin-bottom: 30rpx;
}

.preview-header text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.preview-content {
  
}

.coordinate-info {
  display: flex;
  align-items: center;
  margin-bottom: 15rpx;
}

.coord-label {
  font-size: 28rpx;
  color: #666666;
  margin-right: 10rpx;
  min-width: 100rpx;
}

.coord-value {
  font-size: 28rpx;
  color: #333333;
  font-family: monospace;
}

.location-note {
  margin-top: 20rpx;
  padding: 20rpx;
  background: #fff3cd;
  border-radius: 10rpx;
  border-left: 4rpx solid #ffc107;
}

.location-note text {
  font-size: 24rpx;
  color: #856404;
  line-height: 1.5;
}
</style>