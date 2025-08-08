<template>
  <view class="point-detail">
    <!-- 头部 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
      </view>
             <view class="title">网点详情</view>
             <view class="header-right">
         <text class="refresh-btn" @click="forceRefresh">刷新</text>
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
        <text class="info-value" :class="pointDetail.status === 1 ? 'status-normal' : 'status-closed'">
          {{ pointDetail.status === 1 ? '正常' : '暂停营业' }}
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
        status: 1,
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
     this.fromEdit = options.fromEdit === 'true';
     console.log('网点详情页面加载 - ID:', this.pointId, '名称:', this.pointName, '来自编辑:', this.fromEdit);
     console.log('完整options:', options);
     
     // 检查token
     const token = uni.getStorageSync('adminToken');
     console.log('当前token:', token);
     
     // 不再使用EventBus，直接使用本地存储数据同步
     
                             // 如果是从编辑页面跳转过来，直接从数据库获取最新数据
      if (this.fromEdit) {
        console.log('从编辑页面跳转过来，直接从数据库获取最新数据');
        // 检查ID是否有效
        if (this.pointId === 'new' || this.pointId === 'undefined' || !this.pointId) {
          console.log('新增网点模式，使用本地最新数据');
          // 新增模式下，使用本地存储的最新数据
          const latestData = uni.getStorageSync('latestPointData');
          if (latestData) {
            this.updatePointDetailDirectly(latestData);
            return;
          } else {
            this.error = '新增网点模式，但未找到本地数据';
            return;
          }
        }
        this.getPointDetail();
      } else {
         // 检查是否有最新的编辑数据
         const lastEditTime = uni.getStorageSync('lastEditTime');
         const latestData = uni.getStorageSync('latestPointData');
         const currentTime = Date.now();
         
         // 如果最近30秒内有编辑操作且ID匹配，直接使用本地数据
         if (lastEditTime && latestData && (currentTime - lastEditTime) < 30000 && 
             (latestData.id == this.pointId || latestData.Id == this.pointId)) {
           console.log('页面加载时使用本地最新数据:', latestData);
           this.updatePointDetailDirectly(latestData);
         } else {
           // 直接调用接口获取网点详情
           this.getPointDetail();
         }
       }
   },
  
                                                                               onShow() {
          // 重置导航状态，确保可以正常点击
          this.isNavigating = false;
          console.log('页面显示，重置导航状态');
          
          // 检查是否有最新的编辑数据
          const lastEditTime = uni.getStorageSync('lastEditTime');
          const latestData = uni.getStorageSync('latestPointData');
          const currentTime = Date.now();
          
          console.log('详情页面显示 - 检查编辑数据');
          console.log('编辑时间:', lastEditTime, '当前时间:', currentTime, '时间差:', currentTime - lastEditTime);
          console.log('最新编辑数据:', latestData);
          console.log('当前网点ID:', this.pointId);
          
          // 如果最近30秒内有编辑操作且ID匹配，直接使用最新数据
          if (lastEditTime && latestData && (currentTime - lastEditTime) < 30000 && 
              (latestData.id == this.pointId || latestData.Id == this.pointId)) {
            console.log('使用最新编辑数据更新详情页面');
            this.updatePointDetailDirectly(latestData);
            return;
          }
          
                // 如果是从编辑页面跳转过来，直接从数据库获取最新数据
      if (this.fromEdit) {
        console.log('从编辑页面跳转过来，直接从数据库获取最新数据');
        // 检查ID是否有效
        if (this.pointId === 'new' || this.pointId === 'undefined' || !this.pointId) {
          console.log('新增网点模式，使用本地最新数据');
          // 新增模式下，使用本地存储的最新数据
          const latestData = uni.getStorageSync('latestPointData');
          if (latestData) {
            this.updatePointDetailDirectly(latestData);
            return;
          } else {
            this.error = '新增网点模式，但未找到本地数据';
            return;
          }
        }
        // 延迟一点时间确保数据库已更新
        setTimeout(() => {
          this.getPointDetail();
        }, 500);
        return;
      }
          
          // 检查全局数据更新
          const dataUpdateTime = uni.getStorageSync('dataUpdateTime');
          const currentPointData = uni.getStorageSync('currentPointData');
        
        console.log('全局数据更新时间:', dataUpdateTime);
        console.log('全局最新数据:', currentPointData);
        
        // 优先使用全局最新数据（最近30秒内）
        if (dataUpdateTime && currentPointData && (currentTime - dataUpdateTime) < 30000 && 
            (currentPointData.id == this.pointId || currentPointData.Id == this.pointId)) {
          console.log('使用全局最新数据:', currentPointData);
          
          // 直接更新数据，不显示加载状态
          this.updatePointDetailDirectly(currentPointData);
          
          // 延迟清除全局数据，确保数据已显示
          setTimeout(() => {
            uni.removeStorageSync('currentPointData');
            uni.removeStorageSync('dataUpdateTime');
            console.log('已清除全局数据');
          }, 5000);
        }
        // 如果最近30秒内有编辑操作且ID匹配，直接使用本地数据
        else if (lastEditTime && latestData && (currentTime - lastEditTime) < 30000 && 
            (latestData.id == this.pointId || latestData.Id == this.pointId)) {
          console.log('使用本地最新数据:', latestData);
          
          // 直接更新数据，不显示加载状态
          this.updatePointDetailDirectly(latestData);
          
          // 延迟清除本地数据，确保数据已显示
          setTimeout(() => {
            uni.removeStorageSync('latestPointData');
            uni.removeStorageSync('lastEditTime');
            console.log('已清除本地数据');
          }, 5000);
        } else {
          // 否则重新获取网点详情
          if (this.pointId) {
            console.log('页面显示时重新获取网点详情');
            setTimeout(() => {
              this.getPointDetail();
            }, 100);
          }
        }
      },
           methods: {
             // 直接更新网点详情数据（不显示加载状态）
       updatePointDetailDirectly(data) {
         console.log('直接更新网点详情数据:', data);
         
         // 确保不显示加载状态
         this.isLoading = false;
         this.error = '';
         
         // 直接更新数据，不显示加载状态
         this.pointDetail = {
           name: data.name || '',
           address: data.address || '',
           pointType: data.pointType || '',
           availableLarge: parseInt(data.availableLarge) || 0,
           availableMedium: parseInt(data.availableMedium) || 0,
           availableSmall: parseInt(data.availableSmall) || 0,
           openTime: data.openTime || '',
           status: parseInt(data.status) || 1,
           pointImage: data.pointImage || ''
         };
         
         console.log('直接更新后的网点详情:', this.pointDetail);
         
         // 使用$set确保响应式更新
         this.$set(this, 'pointDetail', { ...this.pointDetail });
         
         // 显示更新成功提示
         uni.showToast({
           title: '数据已更新',
           icon: 'success',
           duration: 1500
         });
       },
      
                     
     
         // 获取网点详情
    getPointDetail() {
      this.isLoading = true;
      this.error = '';
      
      console.log('正在获取网点详情，ID:', this.pointId);
      
      // 如果是新增模式或无效ID，不发送请求
      if (this.pointId === 'new' || this.pointId === 'undefined' || !this.pointId) {
        console.log('新增网点模式或无效ID，跳过获取网点详情');
        this.isLoading = false;
        this.error = '无效的网点ID';
        return;
      }
      
      // 清空旧数据，确保显示新数据
      this.pointDetail = {
        name: '',
        address: '',
        pointType: '',
        availableLarge: 0,
        availableMedium: 0,
        availableSmall: 0,
        openTime: '',
        status: 1,
        pointImage: ''
      };
      
      // 构建请求数据
      const requestData = {
        id: parseInt(this.pointId) || this.pointId
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
            
            // 获取实际的数据
            const data = res.data.data || res.data;
            console.log('后端返回的原始数据:', data);
            
            // 确保数据正确映射
            this.pointDetail = {
              name: data.name || data.Name || '',
              address: data.address || data.Address || '',
              pointType: data.pointType || data.PointType || data.point_type || '',
              availableLarge: parseInt(data.availableLarge || data.AvailableLarge || data.available_large) || 0,
              availableMedium: parseInt(data.availableMedium || data.AvailableMedium || data.available_medium) || 0,
              availableSmall: parseInt(data.availableSmall || data.AvailableSmall || data.available_small) || 0,
              openTime: data.openTime || data.OpenTime || data.open_time || '',
              status: parseInt(data.status || data.Status) || 1,
              pointImage: data.pointImage || data.PointImage || data.point_image || ''
            };
            
            console.log('处理后的网点详情:', this.pointDetail);
            
                         // 更新全局存储，确保数据一致性
             const latestData = {
               id: this.pointId,
               name: this.pointDetail.name,
               address: this.pointDetail.address,
               pointType: this.pointDetail.pointType,
               availableLarge: this.pointDetail.availableLarge,
               availableMedium: this.pointDetail.availableMedium,
               availableSmall: this.pointDetail.availableSmall,
               openTime: this.pointDetail.openTime,
               status: this.pointDetail.status,
               pointImage: this.pointDetail.pointImage
             };
             
             uni.setStorageSync('currentPointData', latestData);
             uni.setStorageSync('dataUpdateTime', Date.now());
             uni.setStorageSync('latestPointData', latestData);
             uni.setStorageSync('lastEditTime', Date.now());
             
             console.log('数据库数据与前端数据已同步:', latestData);
             
                         // 显示成功提示
            if (this.fromEdit) {
              uni.showToast({
                title: '已显示最新数据',
                icon: 'success',
                duration: 1500
              });
              console.log('✅ 从编辑页面跳转，已显示数据库最新数据');
            } else {
              uni.showToast({
                title: '数据加载成功',
                icon: 'success',
                duration: 1000
              });
              console.log('✅ 正常加载，数据获取成功');
            }
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
      
      // 跳转到编辑页面
      uni.navigateTo({
        url: `/pages/point-edit/point-edit?id=${this.pointId}&name=${encodeURIComponent(this.pointName)}`,
        success: () => {
          console.log('成功跳转到编辑页面');
        },
        fail: (err) => {
          console.error('跳转到编辑页面失败:', err);
          uni.showToast({
            title: '跳转失败',
            icon: 'none'
          });
        }
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
    
         // 更新网点详情数据
     updatePointDetail(data) {
       console.log('更新网点详情数据:', data);
       
       // 强制更新数据
       this.pointDetail = {
         name: data.name || '',
         address: data.address || '',
         pointType: data.pointType || '',
         availableLarge: data.availableLarge || 0,
         availableMedium: data.availableMedium || 0,
         availableSmall: data.availableSmall || 0,
         openTime: data.openTime || '',
         status: data.status || 1,
         pointImage: data.pointImage || ''
       };
       
       console.log('更新后的网点详情:', this.pointDetail);
       
       // 使用$set确保响应式更新
       this.$set(this, 'pointDetail', { ...this.pointDetail });
       
       uni.showToast({
         title: '数据已更新',
         icon: 'success',
         duration: 1000
       });
     },
     
           // 强制刷新数据
      forceRefresh() {
        console.log('强制刷新数据');
        
        // 检查ID是否有效
        if (this.pointId === 'new' || this.pointId === 'undefined' || !this.pointId) {
          console.log('新增网点模式，不需要刷新详情');
          this.error = '新增网点模式，无需刷新详情';
          return;
        }
        
        // 直接从数据库获取最新数据，确保数据一致性
        console.log('强制刷新 - 从数据库获取最新数据');
        this.getPointDetail();
      },
     
                                     // 返回我的网点列表页面
        goBack() {
          console.log('点击返回按钮，fromEdit:', this.fromEdit);
          
          // 直接跳转到我的网点列表页面，确保显示最新数据
          uni.reLaunch({
            url: '/pages/point/point',
            success: () => {
              console.log('✅ 成功跳转到我的网点页面，将显示最新数据');
            },
            fail: (err) => {
              console.error('跳转到我的网点页面失败:', err);
              // 如果跳转失败，尝试使用navigateBack
              uni.navigateBack();
            }
          });
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

 .refresh-btn {
   font-size: 28rpx;
   color: #28a745;
   padding: 8rpx 16rpx;
   border: 1rpx solid #28a745;
   border-radius: 8rpx;
   background: transparent;
   margin-right: 20rpx;
 }

 .refresh-btn:active {
   background: #28a745;
   color: #ffffff;
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