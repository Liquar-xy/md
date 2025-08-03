<template>
  <view class="point-detail">
    <!-- 头部 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="title">我的网点</view>
      <view class="header-right">
        <text class="edit-btn" @click="editPoint">编辑</text>
      </view>
    </view>

    <!-- 网点照片 -->
    <view class="photo-section" v-if="pointDetail">
      <view class="photo-placeholder">
        <image v-if="pointDetail.pointImage" :src="pointDetail.pointImage" mode="aspectFill" class="main-photo"></image>
        <view v-else class="photo-upload">
          <text class="photo-icon">📷</text>
          <text class="photo-text">网点照片</text>
        </view>
      </view>
    </view>


    
    <!-- 网点信息 -->
    <view class="info-section" v-if="pointDetail">
      <view class="info-item">
        <text class="info-label">网点名称</text>
        <text class="info-value">{{ pointDetail.name }}</text>
        <text class="arrow">></text>
      </view>
      
      <view class="info-item clickable" @click="openBaiduMap">
        <text class="info-label">网点地址</text>
        <view class="address-container">
          <text class="location-icon">📍</text>
          <text class="info-value">{{ pointDetail.address }}</text>
        </view>
        <text class="arrow">></text>
      </view>
      
      <view class="info-item">
        <text class="info-label">网点类型</text>
        <text class="info-value">{{ pointDetail.pointType }}</text>
        <text class="arrow">></text>
      </view>
      
      <view class="info-item">
        <text class="info-label">管理柜组</text>
        <text class="info-value">{{ getCabinetInfo() }}</text>
        <text class="arrow">></text>
      </view>
      
      <view class="info-item">
        <text class="info-label">营业时间</text>
        <text class="info-value">{{ pointDetail.openTime }}</text>
        <text class="arrow">></text>
      </view>
      
      <view class="info-item">
        <text class="info-label">网点状态</text>
        <text class="info-value" :class="pointDetail.staus === 1 ? 'status-normal' : 'status-closed'">
          {{ pointDetail.staus === 1 ? '正常' : '暂停营业' }}
        </text>
        <text class="arrow">></text>
      </view>
      
      <view class="info-item clickable" @click="goToPriceRule">
        <text class="info-label">收费规则</text>
        <text class="info-value">查看</text>
        <text class="arrow">></text>
      </view>
    </view>



    <!-- 加载中 -->
    <view class="loading" v-if="isLoading">
      <text>加载中...</text>
    </view>

    <!-- 错误提示 -->
    <view class="error" v-if="error">
      <text>{{ error }}</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      pointId: null,
      pointName: '',
      pointDetail: {
        name: '',
        address: '',
        pointType: '',
        availableLarge: 0,
        availableMedium: 0,
        availableSmall: 0,
        openTime: '',
        staus: 1,
        pointImage: ''
      },
      isLoading: true,
      error: '',
      isNavigating: false
    }
  },
  onLoad(options) {
    this.pointId = options.id || 1;
    this.pointName = decodeURIComponent(options.name || '');
    console.log('网点详情页面加载 - ID:', this.pointId, '名称:', this.pointName);
    console.log('完整options:', options);
    
    // 检查token
    const token = uni.getStorageSync('adminToken');
    console.log('当前token:', token);
    
    // 直接调用接口获取网点详情
    this.getPointDetail();
  },
  
  onShow() {
    // 重置导航状态，确保可以正常点击
    this.isNavigating = false;
    console.log('页面显示，重置导航状态');
  },
  methods: {
    // 获取网点详情
    getPointDetail() {
      this.isLoading = true;
      this.error = '';
      
      console.log('正在获取网点详情，ID:', this.pointId);
      
      // 重置数据，确保显示新数据
      this.pointDetail = {
        name: '',
        address: '',
        pointType: '',
        availableLarge: 0,
        availableMedium: 0,
        availableSmall: 0,
        openTime: '',
        staus: 1,
        pointImage: ''
      };
      
      // 构建JSON数据
      const requestData = {
        id: this.pointId
      };
      
      console.log('发送的请求数据:', requestData);
      
      uni.request({
        url: 'http://localhost:8000/point_info',
        method: 'POST',
        data: requestData,
        header: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + uni.getStorageSync('adminToken')
        },
        success: (res) => {
          this.isLoading = false;
          console.log('网点详情接口返回数据:', res);
          
          if (res.data && (res.data.code === 200 || res.data.code === "200")) {
            console.log('原始接口返回数据:', res.data);
            
            // 根据你的后端接口实际返回的数据结构进行映射
            const data = res.data.data || res.data;
            console.log('后端返回的原始数据:', data);
            
            // 直接使用后端返回的数据
            this.pointDetail = data;
            
            console.log('处理后的网点详情:', this.pointDetail);
            
            // 显示成功提示
            uni.showToast({
              title: '数据加载成功',
              icon: 'success',
              duration: 1000
            });
          } else {
            this.error = res.data?.msg || '获取网点详情失败';
            console.error('接口返回错误:', res.data);
            uni.showToast({
              title: this.error,
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          this.isLoading = false;
          console.error('网点详情请求失败:', err);
          this.error = '网络请求失败';
          uni.showToast({
            title: this.error,
            icon: 'none'
          });
        }
      });
    },
    
    // 获取柜组信息
    getCabinetInfo() {
      if (!this.pointDetail) {
        return '0组0主机0柜门';
      }
      const { availableLarge, availableMedium, availableSmall } = this.pointDetail;
      const large = parseInt(availableLarge) || 0;
      const medium = parseInt(availableMedium) || 0;
      const small = parseInt(availableSmall) || 0;
      return `${large}组${medium}主机${small}柜门`;
    },
    
    // 编辑网点
      editPoint() {
        console.log('点击编辑网点，ID:', this.pointId, '名称:', this.pointName);
        uni.navigateTo({
          url: `/pages/point-edit/point-edit?id=${this.pointId}&name=${encodeURIComponent(this.pointName)}`
        });
      },
    // 打开百度地图
    openBaiduMap() {
      if (!this.pointDetail.address) {
        uni.showToast({
          title: '网点地址为空',
          icon: 'none'
        });
        return;
      }
      
      console.log('打开地图页面，地址:', this.pointDetail.address);
      
      // 跳转到地图页面
      const name = encodeURIComponent(this.pointDetail.name || '网点位置');
      const address = encodeURIComponent(this.pointDetail.address);
      
      uni.navigateTo({
        url: `/pages/map-view/map-view?name=${name}&address=${address}`,
        success: () => {
          console.log('跳转到地图页面成功');
        },
        fail: (err) => {
          console.error('跳转到地图页面失败:', err);
          uni.showToast({
            title: '跳转失败',
            icon: 'none'
          });
        }
      });
    },
    
    // 跳转到收费规则页面
    goToPriceRule() {
      // 防止重复点击
      if (this.isNavigating) {
        console.log('正在跳转中，忽略重复点击');
        return;
      }
      
      this.isNavigating = true;
      console.log('点击收费规则，网点ID:', this.pointId, '名称:', this.pointName);
      
      uni.navigateTo({
        url: `/pages/price-rule/price-rule?id=${this.pointId}&name=${encodeURIComponent(this.pointName)}`,
        success: () => {
          console.log('跳转成功');
          // 跳转成功后重置状态
          setTimeout(() => {
            this.isNavigating = false;
          }, 500);
        },
        fail: (err) => {
          console.error('跳转失败:', err);
          this.isNavigating = false;
          uni.showToast({
            title: '跳转失败',
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
.point-detail {
  min-height: 100vh;
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
  display: flex;
  gap: 20rpx;
}

.edit-btn {
  font-size: 28rpx;
  color: #007aff;
  padding: 8rpx 16rpx;
  border: 1rpx solid #007aff;
  border-radius: 8rpx;
  background: transparent;
}

.edit-btn:active {
  background: #007aff;
  color: #ffffff;
}

/* 照片区域 */
.photo-section {
  padding: 30rpx 40rpx;
}

.photo-placeholder {
  width: 100%;
  height: 400rpx;
  border: 2rpx solid #007aff;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  overflow: hidden;
}

.main-photo {
  width: 100%;
  height: 100%;
}

.photo-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.photo-icon {
  font-size: 80rpx;
}

.photo-text {
  font-size: 28rpx;
  color: #666666;
}

/* 信息区域 */
.info-section {
  background: #ffffff;
  margin: 0 40rpx 30rpx 40rpx;
  border-radius: 18rpx;
  overflow: hidden;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 30rpx 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.clickable {
  cursor: pointer;
  transition: background-color 0.2s;
}

.clickable:active {
  background-color: #f5f5f5;
}

.info-label {
  font-size: 28rpx;
  color: #333333;
  min-width: 160rpx;
}

.info-value {
  font-size: 28rpx;
  color: #666666;
  flex: 1;
  margin-left: 20rpx;
}

.address-container {
  display: flex;
  align-items: center;
  flex: 1;
  margin-left: 20rpx;
}

.location-icon {
  font-size: 24rpx;
  margin-right: 10rpx;
}

.arrow {
  font-size: 24rpx;
  color: #cccccc;
  margin-left: 20rpx;
}

.status-normal {
  color: #28a745;
}

.status-closed {
  color: #ff6b6b;
}



/* 调试信息 */
.debug-info {
  background: #f8f9fa;
  padding: 20rpx 40rpx;
  margin: 0 40rpx 20rpx 40rpx;
  border-radius: 8rpx;
  border: 1rpx solid #e9ecef;
}

.debug-text {
  font-size: 24rpx;
  color: #6c757d;
}

/* 加载和错误状态 */
.loading, .error {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400rpx;
  font-size: 28rpx;
  color: #666666;
}

.error {
  color: #ff6b6b;
}
</style> 