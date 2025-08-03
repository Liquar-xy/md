<template>
  <view class="point-page">
    <!-- 头部导航栏 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="header-title">
        <text class="title-text">我的网点</text>
      </view>
      <view class="header-right" @click="addNewPoint">
        <text class="add-text">新增网点</text>
      </view>
    </view>
    
    <!-- 网点列表 -->
    <view class="point-list">
      <!-- 加载状态 -->
      <view v-if="isLoading" class="loading-container">
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 网点列表 -->
      <view v-else-if="pointList.length > 0">
        <view v-for="item in pointList" :key="item.id || item.name" class="point-card" @click="goToPointDetail(item)">
          <view class="point-title-section">
            <view class="point-title">{{ item.name }}</view>
          </view>
          <view class="point-divider"></view>
          <view class="point-info">
            <view class="point-label">柜组数量：</view>
            <view class="point-value">{{ item.cabinetInfo || (item.availableLarge + '组' + item.availableMedium + '主机' + item.availableSmall + '柜门') }}</view>
          </view>
          <view class="point-info">
            <view class="point-label">详细地址：</view>
            <view class="point-value">{{ item.address }}</view>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view v-else class="empty-container">
        <text class="empty-text">暂无网点数据</text>
        <text class="empty-tip">点击右上角"新增网点"开始添加</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      pointList: [],
      isLoading: false
    }
  },
  onLoad() {
    this.getPointList();
  },
  
  onShow() {
    // 页面显示时刷新数据，确保新增或修改后能及时更新
    this.getPointList();
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack({
        delta: 1
      });
    },
    
    // 新增网点
    addNewPoint() {
      console.log('点击新增网点按钮');
      uni.navigateTo({
        url: '/pages/point-edit/point-edit?id=new&name=新增网点'
      });
    },
    
    getPointList() {
      this.isLoading = true;
      uni.request({
        url: 'http://localhost:8000/point_list',
        method: 'GET',
        header: {
          'Authorization': 'Bearer ' + uni.getStorageSync('adminToken')
        },
        success: (res) => {
          console.log('网点列表接口返回数据:', res);
          if (res.data && (res.data.code === 200 || res.data.code === "200")) {
            const listData = res.data.list || res.data.List || [];
            if (listData && Array.isArray(listData)) {
              // 直接使用后端返回的数据，使用数据库中真实的ID
              this.pointList = listData.map((item) => {
                console.log('原始网点数据:', item);
                return {
                  ...item,
                  id: item.Id || item.id // 使用数据库中真实的ID
                };
              });
              console.log('网点列表数据:', this.pointList);
              
              // 保存网点列表到本地存储，供详情页使用
              uni.setStorageSync('pointList', this.pointList);
              
              if (this.pointList.length === 0) {
                uni.showToast({ title: '暂无网点数据', icon: 'none' });
              }
            } else {
              this.pointList = [];
              uni.showToast({ title: '暂无网点数据', icon: 'none' });
            }
          } else {
            this.pointList = [];
            uni.showToast({ 
              title: res.data?.msg || '获取网点列表失败', 
              icon: 'none' 
            });
          }
        },
        fail: (err) => {
          console.error('网点列表请求失败:', err);
          this.pointList = [];
          uni.showToast({ title: '网络请求失败', icon: 'none' });
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    },
    
    // 跳转到网点详情
    goToPointDetail(item) {
      console.log('点击网点:', item);
      // 使用数据库中真实的ID
      const pointId = item.id;
      const pointName = item.name || item.Name || '';
      
      console.log('跳转参数 - ID:', pointId, '名称:', pointName);
      console.log('完整网点数据:', item);
      
      // 保存当前选中的网点数据到本地存储
      console.log('保存到currentPoint的数据:', item);
      uni.setStorageSync('currentPoint', item);
      
      // 确保网点列表数据已保存
      if (this.pointList && this.pointList.length > 0) {
        uni.setStorageSync('pointList', this.pointList);
        console.log('网点列表数据已保存到本地存储');
      }
      
      uni.navigateTo({
        url: `/pages/point-detail/point-detail?id=${pointId}&name=${encodeURIComponent(pointName)}`
      });
    }
  }
}
</script>

<style>
.point-page {
  background: #f6f7fb;
  min-height: 100vh;
}

/* 头部样式 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  background: #fff;
  border-bottom: 1rpx solid #e5e6eb;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 36rpx;
  color: #333;
  font-weight: bold;
}

.header-title {
  flex: 1;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title-text {
  font-size: 36rpx;
  font-weight: 700;
  color: #222;
}

.header-right {
  padding: 12rpx 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120rpx;
}

.add-text {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
}

.point-list {
  padding: 24rpx 0;
}
.point-card {
  background: #fff;
  border-radius: 18rpx;
  box-shadow: 0 4rpx 24rpx rgba(0,0,0,0.06);
  margin: 28rpx 24rpx;
  padding: 32rpx 28rpx 28rpx 28rpx;
  border: 1rpx solid #e5e6eb;
  transition: box-shadow 0.2s;
}
.point-card:active {
  box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.12);
}
.point-title-section {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}
.point-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #222;
  letter-spacing: 1rpx;
}
.point-divider {
  height: 1rpx;
  background: linear-gradient(90deg, #e5e6eb 0%, #fff 100%);
  margin: 16rpx 0 18rpx 0;
}
.point-info {
  display: flex;
  align-items: flex-start;
  margin-bottom: 14rpx;
}
.point-label {
  font-size: 28rpx;
  color: #888;
  min-width: 140rpx;
  font-weight: 500;
}
.point-value {
  font-size: 28rpx;
  color: #333;
  word-break: break-all;
  line-height: 1.7;
}

/* 加载状态 */
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: #666;
}

/* 空状态 */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-text {
  font-size: 32rpx;
  color: #999;
  margin-bottom: 20rpx;
}

.empty-tip {
  font-size: 26rpx;
  color: #ccc;
}
</style> 