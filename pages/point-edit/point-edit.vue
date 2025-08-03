<template>
  <view class="point-edit">
    <!-- 头部 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="title">{{ pointId === 'new' ? '新增网点' : '编辑网点' }}</view>
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
      <view class="section-header">
        <text class="section-title">网点信息</text>
        <text class="section-tip">点击各项可编辑</text>
      </view>
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
          <image :src="photo" mode="aspectFill" class="list-photo" @click="setMainPhoto(photo)"></image>
          <text class="remove-btn" @click="removePhoto(index)">×</text>
          <text v-if="pointInfo.pointImage === photo" class="main-photo-label">主图</text>
        </view>
        <view class="add-photo" @click="addPhoto">
          <text class="add-icon">+</text>
        </view>
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="save-section">
      <button class="save-btn" @click="savePoint" :disabled="isSaving">
        {{ isSaving ? '保存中...' : (pointId === 'new' ? '新增' : '保存') }}
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
    this.pointId = options.id || 'new';
    this.pointName = decodeURIComponent(options.name || '');
    
    // 如果是新增，不需要获取网点信息
    if (this.pointId === 'new') {
      console.log('新增网点模式');
      // 设置默认值
      this.pointInfo = {
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
      };
    } else {
      console.log('修改网点模式，ID:', this.pointId);
      this.getPointInfo();
    }
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
          'Content-Type': 'application/json',
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
      console.log('点击编辑字段:', field);
      
      const fieldNames = {
        'name': '网点名称',
        'address': '网点地址',
        'pointType': '网点类型',
        'cabinet': '管理柜组',
        'openTime': '营业时间',
        'manager': '网点管理员',
        'status': '网点状态'
      };
      
      const fieldName = fieldNames[field] || field;
      
      if (field === 'cabinet') {
        this.editCabinet();
        return;
      }
      
      if (field === 'status') {
        this.editStatus();
        return;
      }
      
      // 获取当前值
      let currentValue = '';
      switch (field) {
        case 'name':
          currentValue = this.pointInfo.name || '';
          break;
        case 'address':
          currentValue = this.pointInfo.address || '';
          break;
        case 'pointType':
          currentValue = this.pointInfo.pointType || '';
          break;
        case 'openTime':
          currentValue = this.pointInfo.openTime || '';
          break;
        case 'manager':
          currentValue = this.pointInfo.manager || '';
          break;
      }
      
      // 显示输入框
      uni.showModal({
        title: `编辑${fieldName}`,
        content: '',
        editable: true,
        placeholderText: `请输入${fieldName}`,
        success: (res) => {
          if (res.confirm) {
            const newValue = res.content.trim();
            if (newValue) {
              switch (field) {
                case 'name':
                  this.pointInfo.name = newValue;
                  break;
                case 'address':
                  this.pointInfo.address = newValue;
                  break;
                case 'pointType':
                  this.pointInfo.pointType = newValue;
                  break;
                case 'openTime':
                  this.pointInfo.openTime = newValue;
                  break;
                case 'manager':
                  this.pointInfo.manager = newValue;
                  break;
              }
              uni.showToast({
                title: '修改成功',
                icon: 'success'
              });
            }
          }
        }
      });
    },
    

    

    
    // 编辑柜组信息
    editCabinet() {
      console.log('编辑柜组信息被调用');
      
      // 直接显示输入框
      uni.showModal({
        title: '编辑柜组信息',
        content: '',
        editable: true,
        placeholderText: '请输入：组数,主机数,柜门数（例如：10,15,20）',
        success: (res) => {
          console.log('输入结果:', res);
          if (res.confirm && res.content) {
            this.processCabinetInput(res.content);
          }
        }
      });
    },
    

    
    // 处理柜组输入
    processCabinetInput(input) {
      console.log('用户输入:', input);
      
      // 支持多种分隔符
      const parts = input.split(/[,，\s]+/).map(part => parseInt(part.trim()) || 0);
      console.log('解析结果:', parts);
      
      if (parts.length === 3) {
        this.pointInfo.availableLarge = parts[0];
        this.pointInfo.availableMedium = parts[1];
        this.pointInfo.availableSmall = parts[2];
        
        console.log('更新后的柜组数据:', this.pointInfo.availableLarge, this.pointInfo.availableMedium, this.pointInfo.availableSmall);
        
        uni.showToast({
          title: `已设置为：${parts[0]}组${parts[1]}主机${parts[2]}柜门`,
          icon: 'success',
          duration: 2000
        });
      } else {
        uni.showToast({
          title: '格式错误，请输入三个数字，用逗号分隔',
          icon: 'none',
          duration: 3000
        });
      }
    },
    
    // 编辑状态
    editStatus() {
      const statusOptions = [
        { text: '正常', value: 1 },
        { text: '暂停营业', value: 0 }
      ];
      
      uni.showActionSheet({
        itemList: statusOptions.map(item => item.text),
        success: (res) => {
          const selectedStatus = statusOptions[res.tapIndex];
          this.pointInfo.staus = selectedStatus.value;
          uni.showToast({
            title: `状态已设置为${selectedStatus.text}`,
            icon: 'success'
          });
        }
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
          const imagePath = res.tempFilePaths[0];
          this.pointInfo.pointImage = imagePath;
          
          // 同时添加到照片列表中
          if (!this.pointInfo.photos.includes(imagePath)) {
            this.pointInfo.photos.unshift(imagePath); // 添加到列表开头
          }
          
          uni.showToast({
            title: '照片上传成功',
            icon: 'success'
          });
        }
      });
    },
    
    // 添加照片
    addPhoto() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          const imagePath = res.tempFilePaths[0];
          this.pointInfo.photos.push(imagePath);
          
          uni.showToast({
            title: '照片添加成功',
            icon: 'success'
          });
        }
      });
    },
    
    // 删除照片
    removePhoto(index) {
      const removedPhoto = this.pointInfo.photos[index];
      
      // 如果删除的是主照片，清空主照片
      if (this.pointInfo.pointImage === removedPhoto) {
        this.pointInfo.pointImage = '';
      }
      
      // 从照片列表中删除
      this.pointInfo.photos.splice(index, 1);
      
      uni.showToast({
        title: '照片删除成功',
        icon: 'success'
      });
    },
    
    // 设置主照片
    setMainPhoto(photo) {
      this.pointInfo.pointImage = photo;
      uni.showToast({
        title: '已设置为主照片',
        icon: 'success'
      });
    },
    
    // 保存网点信息
    savePoint() {
      // 数据验证
      if (!this.pointInfo.name || this.pointInfo.name.trim() === '') {
        uni.showToast({
          title: '请输入网点名称',
          icon: 'none'
        });
        return;
      }
      
      if (!this.pointInfo.address || this.pointInfo.address.trim() === '') {
        uni.showToast({
          title: '请输入网点地址',
          icon: 'none'
        });
        return;
      }
      
      if (!this.pointInfo.pointType || this.pointInfo.pointType.trim() === '') {
        uni.showToast({
          title: '请输入网点类型',
          icon: 'none'
        });
        return;
      }
      
      this.isSaving = true;
      
      // 构建请求数据
      const requestData = {
        name: this.pointInfo.name,
        address: this.pointInfo.address,
        pointType: this.pointInfo.pointType,
        availableLarge: this.pointInfo.availableLarge,
        availableMedium: this.pointInfo.availableMedium,
        availableSmall: this.pointInfo.availableSmall,
        openTime: this.pointInfo.openTime,
        status: this.pointInfo.staus,
        manager: this.pointInfo.manager,
        pointImage: this.pointInfo.pointImage,
        photos: this.pointInfo.photos
      };
      
      // 判断是新增还是修改
      const isUpdate = this.pointId && this.pointId !== 'new';
      const url = isUpdate ? 'http://localhost:8000/admin/updatePoint' : 'http://localhost:8000/admin/addPoint';
      
      // 如果是修改，需要添加ID
      if (isUpdate) {
        requestData.id = this.pointId;
      }
      
      console.log('保存网点信息:', requestData);
      console.log('请求URL:', url);
      
      // 检查token
      const token = uni.getStorageSync('adminToken');
      console.log('当前token:', token);
      if (!token || token === 'admin-token') {
        uni.showToast({
          title: '请先登录管理员账号',
          icon: 'none',
          duration: 2000
        });
        // 跳转到管理员登录页面
        setTimeout(() => {
          uni.navigateTo({
            url: '/pages/admin/login'
          });
        }, 2000);
        return;
      }
      
      uni.request({
        url: url,
        method: 'POST',
        data: requestData,
        header: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + uni.getStorageSync('adminToken')
        },
        success: (res) => {
          console.log('保存网点接口返回数据:', res);
          
          if (res.data && (res.data.code === 200 || res.data.code === "200")) {
            uni.showToast({
              title: isUpdate ? '修改成功' : '新增成功',
              icon: 'success',
              duration: 2000
            });
            
            // 延迟返回上一页并刷新网点列表
            setTimeout(() => {
              // 返回上一页
              uni.navigateBack();
              
              // 通知上一页刷新数据
              const pages = getCurrentPages();
              const prevPage = pages[pages.length - 2];
              if (prevPage && prevPage.getPointList) {
                prevPage.getPointList();
              }
            }, 1500);
          } else {
            console.error('保存失败:', res.data);
            uni.showToast({
              title: res.data?.msg || (isUpdate ? '修改失败' : '新增失败'),
              icon: 'none',
              duration: 2000
            });
          }
        },
        fail: (err) => {
          console.error('保存网点请求失败:', err);
          uni.showToast({
            title: '网络请求失败',
            icon: 'none',
            duration: 2000
          });
        },
        complete: () => {
          this.isSaving = false;
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
  background-color: #f8f9fa;
}

.section-title {
  font-size: 28rpx;
  color: #333333;
  font-weight: bold;
}

.section-tip {
  font-size: 24rpx;
  color: #999999;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 30rpx 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.info-item:active {
  background-color: #f8f9fa;
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
  color: #999999;
  margin-left: 20rpx;
  font-weight: bold;
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

.main-photo-label {
  position: absolute;
  bottom: 5rpx;
  left: 5rpx;
  background: rgba(0, 122, 255, 0.8);
  color: white;
  font-size: 20rpx;
  padding: 4rpx 8rpx;
  border-radius: 4rpx;
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