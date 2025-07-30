<template>
  <view class="point-edit">
    <!-- 头部 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="title">我的网点</view>
      <view class="header-right">
        <text class="menu-icon">⋯</text>
        <text class="target-icon">◎</text>
      </view>
    </view>

    <!-- 网点照片 -->
    <view class="photo-section">
      <view class="photo-placeholder" @click="uploadPhoto">
        <image v-if="pointInfo.pointImage" :src="pointInfo.pointImage" mode="aspectFill" class="main-photo"></image>
        <view v-else class="photo-upload">
          <text class="photo-icon">📷</text>
          <text class="photo-text">网点照片</text>
        </view>
      </view>
    </view>

    <!-- 网点信息 -->
    <view class="info-section">
      <view class="info-item" @click="editField('name')">
        <text class="info-label">网点名称</text>
        <text class="info-value">{{ pointInfo.name || '未设置' }}</text>
        <text class="arrow">></text>
      </view>
      
      <view class="info-item" @click="editField('address')">
        <text class="info-label">网点地址</text>
        <view class="address-container">
          <text class="location-icon">📍</text>
          <text class="info-value">{{ pointInfo.address || '未设置' }}</text>
        </view>
        <text class="arrow">></text>
      </view>
      
      <view class="info-item" @click="editField('pointType')">
        <text class="info-label">网点类型</text>
        <text class="info-value">{{ pointInfo.pointType || '未设置' }}</text>
        <text class="arrow">></text>
      </view>
      
      <view class="info-item" @click="editField('cabinet')">
        <text class="info-label">管理柜组</text>
        <text class="info-value">{{ getCabinetInfo() }}</text>
        <text class="arrow">></text>
      </view>
      
      <view class="info-item" @click="editField('openTime')">
        <text class="info-label">营业时间</text>
        <text class="info-value">{{ pointInfo.openTime || '未设置' }}</text>
        <text class="arrow">></text>
      </view>
      
      <view class="info-item" @click="editField('manager')">
        <text class="info-label">网点管理员</text>
        <text class="info-value">{{ pointInfo.manager || '未设置' }}</text>
        <text class="arrow">></text>
      </view>
      
      <view class="info-item" @click="editField('status')">
        <text class="info-label">网点状态</text>
        <text class="info-value" :class="pointInfo.staus === 1 ? 'status-normal' : 'status-closed'">
          {{ pointInfo.staus === 1 ? '正常' : '暂停营业' }}
        </text>
        <text class="arrow">></text>
      </view>
      
      <view class="info-item" @click="viewChargingRules">
        <text class="info-label">收费规则</text>
        <text class="info-value">查看</text>
        <text class="arrow">></text>
      </view>
    </view>

    <!-- 网点照片列表 -->
    <view class="photo-list-section">
      <text class="section-title">网点照片</text>
      <view class="photo-list">
        <view v-for="(photo, index) in pointInfo.photos" :key="index" class="photo-item">
          <image :src="photo" mode="aspectFill" class="list-photo"></image>
          <text class="remove-btn" @click="removePhoto(index)">×</text>
        </view>
        <view class="add-photo" @click="addPhoto">
          <text class="add-icon">+</text>
        </view>
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="save-section">
      <button class="save-btn" @click="savePoint" :disabled="isSaving">
        {{ isSaving ? '保存中...' : '保存' }}
      </button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      pointId: null,
      pointName: '',
      pointInfo: {
        name: '',
        address: '',
        pointType: '',
        availableLarge: 0,
        availableMedium: 0,
        availableSmall: 0,
        openTime: '',
        staus: 1,
        pointImage: '',
        manager: '',
        photos: []
      },
      isSaving: false
    }
  },
  onLoad(options) {
    this.pointId = options.id || 1;
    this.pointName = decodeURIComponent(options.name || '');
    this.getPointInfo();
  },
  methods: {
    // 获取网点信息
    getPointInfo() {
      console.log('正在获取网点信息，ID:', this.pointId);
      
      uni.request({
        url: 'http://localhost:8000/point_info',
        method: 'POST',
        data: {
          Id: this.pointId
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Bearer ' + uni.getStorageSync('adminToken')
        },
        success: (res) => {
          console.log('网点信息接口返回数据:', res);
          
          if (res.data && (res.data.code === 200 || res.data.code === "200")) {
            // 确保数据正确映射，兼容不同的字段名
            this.pointInfo = {
              name: res.data.name || res.data.Name || '',
              address: res.data.address || res.data.Address || '',
              pointType: res.data.pointType || res.data.PointType || '',
              availableLarge: parseInt(res.data.availableLarge || res.data.AvailableLarge) || 0,
              availableMedium: parseInt(res.data.availableMedium || res.data.AvailableMedium) || 0,
              availableSmall: parseInt(res.data.availableSmall || res.data.AvailableSmall) || 0,
              openTime: res.data.openTime || res.data.OpenTime || '',
              staus: parseInt(res.data.staus || res.data.Status) || 1,
              pointImage: res.data.pointImage || res.data.PointImage || '',
              manager: res.data.manager || res.data.Manager || '',
              photos: res.data.photos || res.data.Photos || []
            };
            
            console.log('处理后的网点信息:', this.pointInfo);
            
            // 显示成功提示
            uni.showToast({
              title: '数据加载成功',
              icon: 'success',
              duration: 1000
            });
          } else {
            console.error('接口返回错误:', res.data);
            uni.showToast({
              title: res.data?.msg || '获取网点信息失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          console.error('网点信息请求失败:', err);
          uni.showToast({
            title: '网络请求失败',
            icon: 'none'
          });
        }
      });
    },
    
    // 获取柜组信息
    getCabinetInfo() {
      const { availableLarge, availableMedium, availableSmall } = this.pointInfo;
      return `${availableLarge}组${availableMedium}主机${availableSmall}柜门`;
    },
    
    // 编辑字段
    editField(field) {
      uni.showToast({
        title: `编辑${field}`,
        icon: 'none'
      });
    },
    
    // 查看收费规则
    viewChargingRules() {
      uni.showToast({
        title: '查看收费规则',
        icon: 'none'
      });
    },
    
    // 上传照片
    uploadPhoto() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          this.pointInfo.pointImage = res.tempFilePaths[0];
        }
      });
    },
    
    // 添加照片
    addPhoto() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          this.pointInfo.photos.push(res.tempFilePaths[0]);
        }
      });
    },
    
    // 删除照片
    removePhoto(index) {
      this.pointInfo.photos.splice(index, 1);
    },
    
    // 保存网点信息
    savePoint() {
      this.isSaving = true;
      
      // 这里应该调用保存接口
      setTimeout(() => {
        this.isSaving = false;
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        });
      }, 1000);
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack();
    }
  }
}
</script>

<style scoped>
.point-edit {
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

.menu-icon, .target-icon {
  font-size: 32rpx;
  color: #333333;
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

/* 照片列表 */
.photo-list-section {
  background: #ffffff;
  margin: 0 40rpx 30rpx 40rpx;
  border-radius: 18rpx;
  padding: 30rpx 40rpx;
}

.section-title {
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 20rpx;
}

.photo-list {
  display: flex;
  gap: 20rpx;
}

.photo-item {
  position: relative;
  width: 120rpx;
  height: 120rpx;
}

.list-photo {
  width: 100%;
  height: 100%;
  border-radius: 8rpx;
}

.remove-btn {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 40rpx;
  height: 40rpx;
  background: #ff6b6b;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
}

.add-photo {
  width: 120rpx;
  height: 120rpx;
  border: 2rpx dashed #cccccc;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-icon {
  font-size: 48rpx;
  color: #cccccc;
}

/* 保存按钮 */
.save-section {
  padding: 40rpx;
}

.save-btn {
  width: 100%;
  height: 88rpx;
  background: #007aff;
  color: white;
  border: none;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
}

.save-btn:disabled {
  background: #cccccc;
}
</style> 