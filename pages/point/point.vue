<template>
  <view class="point-list">
    <view v-for="item in pointList" :key="item.name" class="point-card" @click="goToPointDetail(item)">
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
</template>

<script>
export default {
  data() {
    return {
      pointList: []
    }
  },
  onLoad() {
    this.getPointList();
  },
  methods: {
    getPointList() {
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
              // 确保每个网点都有正确的ID，根据你的后端代码使用小写字段名
              this.pointList = listData.map((item, index) => ({
                ...item,
                id: item.id || item.Id || (index + 1), // 确保有唯一ID
                name: item.name || item.Name || '未命名网点',
                address: item.address || item.Address || '地址未设置'
              }));
              console.log('网点列表数据:', this.pointList);
              
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
        }
      });
    },
    
    // 跳转到网点详情
                goToPointDetail(item) {
              console.log('点击网点:', item);
              // 确保传递正确的网点ID
              const pointId = item.id || item.Id || 1;
              const pointName = item.name || item.Name || '';
              
              console.log('跳转参数 - ID:', pointId, '名称:', pointName);
              console.log('完整网点数据:', item);
              
              uni.navigateTo({
                url: `/pages/point-detail/point-detail?id=${pointId}&name=${encodeURIComponent(pointName)}`
              });
            }
  }
}
</script>

<style>
.point-list {
  padding: 24rpx 0;
  background: #f6f7fb;
  min-height: 100vh;
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
</style> 