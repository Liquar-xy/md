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
    
    // 监听网点更新事件
    uni.$on('updatePointList', (data) => {
      console.log('收到网点更新事件:', data);
      this.updatePointInList(data);
    });
  },
  
  onUnload() {
    // 移除事件监听
    uni.$off('updatePointList');
  },
  
  onShow() {
    console.log('列表页面显示 - 开始检查数据更新');
    
    // 检查全局数据更新
    const dataUpdateTime = uni.getStorageSync('dataUpdateTime');
    const currentPointData = uni.getStorageSync('currentPointData');
    const currentTime = Date.now();
    
    console.log('列表页面 - 全局数据更新时间:', dataUpdateTime);
    console.log('列表页面 - 全局最新数据:', currentPointData);
    console.log('当前时间:', currentTime);
    
    // 优先使用全局最新数据（最近30秒内）
    if (dataUpdateTime && currentPointData && (currentTime - dataUpdateTime) < 30000) {
      console.log('检测到全局最新数据，立即更新列表');
      
      // 更新列表中的对应网点数据
      const updatedIndex = this.pointList.findIndex(item => 
        item.id == currentPointData.id || item.Id == currentPointData.id
      );
      
      console.log('找到的网点索引:', updatedIndex);
      console.log('当前列表数据:', this.pointList);
      
      if (updatedIndex !== -1) {
        // 更新列表中的数据
        this.pointList[updatedIndex] = {
          ...this.pointList[updatedIndex],
          name: currentPointData.name,
          address: currentPointData.address,
          pointType: currentPointData.pointType,
          availableLarge: currentPointData.availableLarge,
          availableMedium: currentPointData.availableMedium,
          availableSmall: currentPointData.availableSmall,
          openTime: currentPointData.openTime,
          status: currentPointData.status,
          // 添加柜组信息字段
          cabinetInfo: `${currentPointData.availableLarge}组${currentPointData.availableMedium}主机${currentPointData.availableSmall}柜门`
        };
        
        console.log('✅ 列表数据已更新:', this.pointList[updatedIndex]);
        
        // 强制更新视图
        this.$forceUpdate();
        
        // 更新本地存储
        uni.setStorageSync('pointList', this.pointList);
        
        // 显示更新提示
        uni.showToast({
          title: '列表数据已更新',
          icon: 'success',
          duration: 1500
        });
        
        // 延迟清除全局数据
        setTimeout(() => {
          uni.removeStorageSync('currentPointData');
          uni.removeStorageSync('dataUpdateTime');
          console.log('列表页面已清除全局数据');
        }, 10000);
      } else {
        console.log('未找到匹配的网点，重新获取列表数据');
        this.getPointList();
      }
    }
    // 检查本地编辑数据
    else {
      const lastEditTime = uni.getStorageSync('lastEditTime');
      const latestData = uni.getStorageSync('latestPointData');
      
      console.log('检查本地编辑数据');
      console.log('编辑时间:', lastEditTime, '当前时间:', currentTime, '时间差:', currentTime - lastEditTime);
      console.log('本地最新数据:', latestData);
      
      // 如果最近30秒内有编辑操作，立即更新列表中的对应项
      if (lastEditTime && latestData && (currentTime - lastEditTime) < 30000) {
        console.log('检测到最新编辑数据，更新列表');
        
        // 更新列表中的对应网点数据
        const updatedIndex = this.pointList.findIndex(item => 
          item.id == latestData.id || item.Id == latestData.id
        );
        
        if (updatedIndex !== -1) {
          // 更新列表中的数据
          this.pointList[updatedIndex] = {
            ...this.pointList[updatedIndex],
            name: latestData.name,
            address: latestData.address,
            pointType: latestData.pointType,
            availableLarge: latestData.availableLarge,
            availableMedium: latestData.availableMedium,
            availableSmall: latestData.availableSmall,
            openTime: latestData.openTime,
            status: latestData.status,
            // 添加柜组信息字段
            cabinetInfo: `${latestData.availableLarge}组${latestData.availableMedium}主机${latestData.availableSmall}柜门`
          };
          
          console.log('✅ 列表数据已更新:', this.pointList[updatedIndex]);
          
          // 强制更新视图
          this.$forceUpdate();
          
          // 更新本地存储
          uni.setStorageSync('pointList', this.pointList);
          
          // 显示更新提示
          uni.showToast({
            title: '列表数据已更新',
            icon: 'success',
            duration: 1500
          });
          
          // 延迟清除本地数据
          setTimeout(() => {
            uni.removeStorageSync('latestPointData');
            uni.removeStorageSync('lastEditTime');
            console.log('列表页面已清除本地数据');
          }, 3000);
        } else {
          console.log('未找到匹配的网点，重新获取列表数据');
          this.getPointList();
        }
      } else {
        // 否则正常刷新数据
        console.log('没有最新数据，正常刷新网点列表');
        this.getPointList();
      }
    }
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
    
    // 更新列表中的网点数据
    updatePointInList(data) {
      console.log('更新列表中的网点数据:', data);
      
      const updatedIndex = this.pointList.findIndex(item => 
        item.id == data.id || item.Id == data.id
      );
      
      if (updatedIndex !== -1) {
        // 更新列表中的数据
        this.pointList[updatedIndex] = {
          ...this.pointList[updatedIndex],
          name: data.name,
          address: data.address,
          pointType: data.pointType,
          availableLarge: data.availableLarge,
          availableMedium: data.availableMedium,
          availableSmall: data.availableSmall,
          openTime: data.openTime,
          status: data.status,
          // 添加柜组信息字段
          cabinetInfo: `${data.availableLarge}组${data.availableMedium}主机${data.availableSmall}柜门`
        };
        
        console.log('✅ 列表数据已实时更新:', this.pointList[updatedIndex]);
        
        // 强制更新视图
        this.$forceUpdate();
        
        // 更新本地存储
        uni.setStorageSync('pointList', this.pointList);
        
        // 显示更新提示
        uni.showToast({
          title: '列表数据已更新',
          icon: 'success',
          duration: 1500
        });
      } else {
        console.log('❌ 未找到要更新的网点，重新获取列表');
        this.getPointList();
      }
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
                  id: item.Id || item.id, // 使用数据库中真实的ID
                  // 添加柜组信息字段
                  cabinetInfo: `${item.availableLarge || item.AvailableLarge || 0}组${item.availableMedium || item.AvailableMedium || 0}主机${item.availableSmall || item.AvailableSmall || 0}柜门`
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
    
    // 更新列表中的网点数据
    updatePointInList(data) {
      console.log('更新列表中的网点数据:', data);
      
      const updatedIndex = this.pointList.findIndex(item => 
        item.id === data.id || item.Id === data.id
      );
      
      if (updatedIndex !== -1) {
        // 更新列表中的数据
        this.pointList[updatedIndex] = {
          ...this.pointList[updatedIndex],
          name: data.name,
          address: data.address,
          pointType: data.pointType,
          availableLarge: data.availableLarge,
          availableMedium: data.availableMedium,
          availableSmall: data.availableSmall,
          openTime: data.openTime,
          status: data.status,
          // 添加柜组信息字段
          cabinetInfo: `${data.availableLarge}组${data.availableMedium}主机${data.availableSmall}柜门`
        };
        
        console.log('列表数据已更新:', this.pointList[updatedIndex]);
        
        // 更新本地存储
        uni.setStorageSync('pointList', this.pointList);
        
        uni.showToast({
          title: '列表已更新',
          icon: 'success',
          duration: 1000
        });
      }
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