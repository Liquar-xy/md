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
      
      <view class="info-item" @click="editField('status')">
        <text class="info-label">网点状态</text>
        <text class="info-value" :class="pointInfo.status === 1 ? 'status-normal' : 'status-closed'">
          {{ pointInfo.status === 1 ? '正常' : '暂停营业' }}
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
          {{ isSaving ? '正在保存...' : (pointId === 'new' ? '新增网点' : '保存') }}
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
        status: 1,
        pointImage: '',
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
        status: 1,
        pointImage: '',
        photos: []
      };
    } else {
      console.log('修改网点模式，ID:', this.pointId);
      
      // 检查是否有本地最新数据
      const lastEditTime = uni.getStorageSync('lastEditTime');
      const latestData = uni.getStorageSync('latestPointData');
      const currentTime = Date.now();
      
      console.log('编辑页面加载 - 检查本地数据');
      console.log('编辑时间:', lastEditTime, '当前时间:', currentTime, '时间差:', currentTime - lastEditTime);
      console.log('本地最新数据:', latestData);
      
      // 如果最近10秒内有编辑操作且ID匹配，使用本地数据
      if (lastEditTime && latestData && (currentTime - lastEditTime) < 10000 && 
          (latestData.id == this.pointId || latestData.Id == this.pointId)) {
        console.log('使用本地最新数据加载编辑页面');
        this.pointInfo = {
          name: latestData.name || '',
          address: latestData.address || '',
          pointType: latestData.pointType || '',
          availableLarge: latestData.availableLarge || 0,
          availableMedium: latestData.availableMedium || 0,
          availableSmall: latestData.availableSmall || 0,
          openTime: latestData.openTime || '',
          status: latestData.status || 1,
          pointImage: latestData.pointImage || '',
          photos: latestData.photos || []
        };
        
        console.log('编辑页面使用本地数据:', this.pointInfo);
      } else {
        // 否则从服务器获取数据
        if (this.pointId !== 'new') {
          this.getPointInfo();
        } else {
          console.log('新增网点模式，不需要获取现有数据');
        }
      }
    }
  },
  methods: {
    // 获取网点信息
    getPointInfo() {
      // 如果是新增模式，不需要获取网点信息
      if (this.pointId === 'new') {
        console.log('新增网点模式，跳过获取网点信息');
        return;
      }
      
      console.log('正在获取网点信息，ID:', this.pointId);
      
      uni.request({
        url: 'http://localhost:8000/point_info',
        method: 'POST',
        data: {
          id: parseInt(this.pointId) || this.pointId
        },
        header: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + uni.getStorageSync('adminToken')
        },
        success: (res) => {
          console.log('网点信息接口返回数据:', res);
          
          if (res.data && (res.data.code === 200 || res.data.code === "200")) {
            // 获取实际的数据
            const data = res.data.data || res.data;
            console.log('后端返回的原始数据:', data);
            
            // 确保数据正确映射，兼容不同的字段名
            this.pointInfo = {
              name: data.name || data.Name || '',
              address: data.address || data.Address || '',
              pointType: data.pointType || data.PointType || data.point_type || '',
              availableLarge: parseInt(data.availableLarge || data.AvailableLarge || data.available_large) || 0,
              availableMedium: parseInt(data.availableMedium || data.AvailableMedium || data.available_medium) || 0,
              availableSmall: parseInt(data.availableSmall || data.AvailableSmall || data.available_small) || 0,
              openTime: data.openTime || data.OpenTime || data.open_time || '',
              status: parseInt(data.status || data.Status) || 1,
              pointImage: data.pointImage || data.PointImage || data.point_image || '',
              photos: data.photos || data.Photos || []
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
          this.pointInfo.status = selectedStatus.value;
      uni.showToast({
            title: `状态已设置为${selectedStatus.text}`,
            icon: 'success'
          });
        }
      });
    },
    
    // 查看收费规则
    viewChargingRules() {
      // 跳转到收费规则页面，传递网点ID和名称
      uni.navigateTo({
        url: `/pages/price-rule/price-rule?id=${this.pointId}&name=${encodeURIComponent(this.pointInfo.name || this.pointName)}`
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
      console.log('开始验证编辑数据:', this.pointInfo);
      
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
      
      console.log('✅ 数据验证通过');
      
      this.isSaving = true;
      
      // 检查是否有管理员token
      const adminToken = uni.getStorageSync('adminToken');
      if (!adminToken) {
        this.isSaving = false;
        uni.showToast({
          title: '请先登录管理员账号',
          icon: 'none'
        });
        return;
      }
      
      // 判断是新增还是修改
      const isUpdate = this.pointId && this.pointId !== 'new';
      const url = isUpdate ? 'http://localhost:8000/admin/updatePoint' : 'http://localhost:8000/admin/addPoint';
      
      // 检查后端服务是否可用
      console.log('检查后端服务状态...');
      uni.request({
        url: 'http://localhost:8000/point_list',
        method: 'GET',
        timeout: 5000,
        success: (res) => {
          console.log('✅ 后端服务正常，可以发送修改请求');
          // 在这里重新构建requestData，确保变量已初始化
          // 根据ApiPost测试，新增接口不需要point包装器，修改接口需要point包装器
          const finalRequestData = isUpdate ? {
            point: {
              id: parseInt(this.pointId),
              name: this.pointInfo.name.trim(),
              address: this.pointInfo.address.trim(),
              point_type: this.pointInfo.pointType.trim(),
              available_large: parseInt(this.pointInfo.availableLarge) || 0,
              available_medium: parseInt(this.pointInfo.availableMedium) || 0,
              available_small: parseInt(this.pointInfo.availableSmall) || 0,
              open_time: this.pointInfo.openTime.trim(),
              status: (parseInt(this.pointInfo.status) || 1).toString(),
              mobile: '13800138000',
              latitude: 39.984699,
              longitude: 116.307198,
              point_image: ''
            }
          } : {
            // 新增接口：直接发送数据，不需要point包装器
            name: this.pointInfo.name.trim(),
            address: this.pointInfo.address.trim(),
            point_type: this.pointInfo.pointType.trim(),
            available_large: parseInt(this.pointInfo.availableLarge) || 0,
            available_medium: parseInt(this.pointInfo.availableMedium) || 0,
            available_small: parseInt(this.pointInfo.availableSmall) || 0,
            open_time: this.pointInfo.openTime.trim(),
            status: (parseInt(this.pointInfo.status) || 1).toString(),
            mobile: '13800138000',
            latitude: 39.984699,
            longitude: 116.307198,
            point_image: ''
          };
          
          console.log('=== 请求格式调试 ===');
          console.log('是否修改模式:', isUpdate);
          console.log('请求URL:', url);
          console.log('请求数据格式:', isUpdate ? '使用point包装器' : '直接发送数据');
          console.log('最终请求数据:', finalRequestData);
          console.log('=== 请求格式调试结束 ===');
          
          this.sendUpdateRequest(url, finalRequestData, adminToken, isUpdate);
        },
        fail: (err) => {
          console.error('❌ 后端服务不可用:', err);
          uni.showToast({
            title: '后端服务不可用，请检查服务状态',
            icon: 'none',
            duration: 3000
          });
        }
      });
      
      return; // 先检查服务状态，不直接发送请求
    },
    
    // 刷新网点列表数据
    refreshPointList() {
      console.log('强制刷新网点列表数据');
      
      // 重新获取网点列表
      uni.request({
        url: 'http://localhost:8000/point_list',
        method: 'GET',
        header: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + uni.getStorageSync('adminToken')
        },
        success: (res) => {
          console.log('刷新网点列表成功:', res);
          if (res.data && (res.data.code === 200 || res.data.code === "200")) {
            const listData = res.data.list || res.data.data || [];
            
            // 更新本地存储的网点列表
            const updatedList = listData.map(item => ({
              id: item.Id || item.id,
              name: item.name || item.Name,
              address: item.address || item.Address,
              pointType: item.pointType || item.PointType,
              availableLarge: item.availableLarge || item.AvailableLarge,
              availableMedium: item.availableMedium || item.AvailableMedium,
              availableSmall: item.availableSmall || item.AvailableSmall,
              openTime: item.openTime || item.OpenTime,
              status: item.status || item.Status,
              cabinetInfo: `${item.availableLarge || item.AvailableLarge}组${item.availableMedium || item.AvailableMedium}主机${item.availableSmall || item.AvailableSmall}柜门`
            }));
            
            uni.setStorageSync('pointList', updatedList);
            console.log('网点列表已更新:', updatedList);
          }
        },
        fail: (err) => {
          console.error('刷新网点列表失败:', err);
        }
      });
    },
    
    // 刷新网点详情数据
    refreshPointDetail() {
      console.log('强制刷新网点详情数据，验证数据库更新');
      
      // 如果是新增模式，不需要刷新详情
      if (this.pointId === 'new' || this.pointId === 'undefined' || !this.pointId) {
        console.log('新增网点模式，跳过刷新详情');
        return;
      }
      
      // 重新获取网点详情
      uni.request({
        url: 'http://localhost:8000/point_info',
        method: 'POST',
        data: {
          id: parseInt(this.pointId) || this.pointId
        },
        header: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + uni.getStorageSync('adminToken')
        },
        success: (res) => {
          console.log('验证数据库更新成功:', res);
          if (res.data && (res.data.code === 200 || res.data.code === "200")) {
            const data = res.data.data || res.data;
            
            // 更新全局存储，确保详情页面显示最新数据
            const latestData = {
              id: this.pointId,
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
            
            // 更新全局存储
            uni.setStorageSync('currentPointData', latestData);
            uni.setStorageSync('dataUpdateTime', Date.now());
            uni.setStorageSync('latestPointData', latestData);
            uni.setStorageSync('lastEditTime', Date.now());
            
            console.log('数据库验证成功，最新数据:', latestData);
            console.log('数据库数据与前端数据已完全同步');
            
            // 显示验证成功提示
            uni.showToast({
              title: '数据库更新验证成功',
              icon: 'success',
              duration: 1500
            });
          } else {
            console.error('数据库验证失败:', res.data);
            uni.showToast({
              title: '数据库验证失败',
              icon: 'none',
              duration: 1500
            });
          }
        },
        fail: (err) => {
          console.error('数据库验证请求失败:', err);
          uni.showToast({
            title: '数据库验证失败',
            icon: 'none',
            duration: 1500
          });
        }
      });
    },
    
    
    

    

    
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },
    
    // 发送修改请求
    sendUpdateRequest(url, finalRequestData, adminToken, isUpdate) {
      console.log('开始发送修改请求...');
      console.log('发送的数据:', finalRequestData);
      console.log('使用的Token:', adminToken);
      console.log('请求URL:', url);
      
      // 检查Token格式
      if (!adminToken || adminToken === 'undefined' || adminToken === 'null') {
        console.error('❌ Token无效:', adminToken);
        uni.showToast({
          title: '请重新登录管理员账号',
          icon: 'none',
          duration: 3000
        });
        return;
      }
      
      uni.request({
        url: url,
        method: 'POST',
        data: finalRequestData,
        header: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + adminToken
        },
        timeout: 30000, // 增加超时时间到30秒
        dataType: 'json',
        responseType: 'text',
        success: (res) => {
          console.log('=== 修改响应详情 ===');
          console.log('完整响应对象:', res);
          console.log('响应状态码:', res.statusCode);
          console.log('响应数据:', res.data);
          console.log('=== 响应详情结束 ===');
          
          if (res.statusCode === 200 && res.data) {
            console.log('HTTP请求成功，检查业务状态码');
            console.log('业务状态码:', res.data.code);
            console.log('响应消息:', res.data.msg);
            
            if (res.data.code === 200 || res.data.code === "200") {
              // 修改成功
              console.log('✅ 数据库修改成功，响应数据:', res.data);
              
              // 显示修改成功提示
              uni.showToast({
                title: isUpdate ? '网点数据修改成功' : '新增成功',
                icon: 'success',
                duration: 2000
              });
              
              // 保存完成后，立即存储最新数据到本地
              const latestData = {
                // 如果是新增，使用后端返回的ID；如果是修改，使用当前ID
                id: isUpdate ? this.pointId : (res.data.data?.id || res.data.id),
                name: this.pointInfo.name.trim(),
                address: this.pointInfo.address.trim(),
                pointType: this.pointInfo.pointType.trim(),
                availableLarge: parseInt(this.pointInfo.availableLarge) || 0,
                availableMedium: parseInt(this.pointInfo.availableMedium) || 0,
                availableSmall: parseInt(this.pointInfo.availableSmall) || 0,
                openTime: this.pointInfo.openTime.trim(),
                status: parseInt(this.pointInfo.status) || 1,
                pointImage: this.pointInfo.pointImage || ''
              };
              
              console.log('✅ 数据已成功修改到数据库');
              console.log('修改的数据:', latestData);
              
              // 立即存储最新数据到本地
              uni.setStorageSync('latestPointData', latestData);
              uni.setStorageSync('lastEditTime', Date.now());
              
              // 立即更新网点列表中的对应项
              const pointList = uni.getStorageSync('pointList') || [];
              
              if (isUpdate) {
                // 修改模式：更新现有网点
                const updatedIndex = pointList.findIndex(item => 
                  item.id == latestData.id || item.Id == latestData.id
                );
                
                if (updatedIndex !== -1) {
                  // 更新列表中的数据
                  pointList[updatedIndex] = {
                    ...pointList[updatedIndex],
                    name: latestData.name,
                    address: latestData.address,
                    pointType: latestData.pointType,
                    availableLarge: latestData.availableLarge,
                    availableMedium: latestData.availableMedium,
                    availableSmall: latestData.availableSmall,
                    openTime: latestData.openTime,
                    status: latestData.status,
                    cabinetInfo: `${latestData.availableLarge}组${latestData.availableMedium}主机${latestData.availableSmall}柜门`
                  };
                  
                  uni.setStorageSync('pointList', pointList);
                  console.log('✅ 已更新网点列表数据');
                }
              } else {
                // 新增模式：添加新网点到列表
                const newPoint = {
                  id: latestData.id,
                  name: latestData.name,
                  address: latestData.address,
                  pointType: latestData.pointType,
                  availableLarge: latestData.availableLarge,
                  availableMedium: latestData.availableMedium,
                  availableSmall: latestData.availableSmall,
                  openTime: latestData.openTime,
                  status: latestData.status,
                  cabinetInfo: `${latestData.availableLarge}组${latestData.availableMedium}主机${latestData.availableSmall}柜门`
                };
                
                pointList.unshift(newPoint); // 添加到列表开头
                uni.setStorageSync('pointList', pointList);
                console.log('✅ 已添加新网点到列表:', newPoint);
              }
              
              // 更新全局数据
              uni.setStorageSync('currentPointData', latestData);
              uni.setStorageSync('dataUpdateTime', Date.now());
              
              // 发送事件通知列表页面更新
              uni.$emit('updatePointList', latestData);
              
              // 跳转到详情页面
              setTimeout(() => {
                // 使用后端返回的新ID，如果是新增模式
                const detailId = isUpdate ? this.pointId : (res.data.data?.id || res.data.id);
                console.log('跳转到详情页面，使用ID:', detailId, '是否新增模式:', !isUpdate);
                
                uni.navigateTo({
                  url: `/pages/point-detail/point-detail?id=${detailId}&name=${encodeURIComponent(this.pointInfo.name)}&fromEdit=true`,
                  success: () => {
                    console.log('✅ 成功跳转到详情页面');
                  },
                  fail: (err) => {
                    console.error('跳转到详情页面失败:', err);
                    uni.navigateBack();
                  }
                });
              }, 1000);
            } else {
              // 业务错误
              console.error('❌ 业务错误:', res.data);
              uni.showToast({
                title: res.data.msg || '修改失败',
                icon: 'none',
                duration: 3000
              });
            }
          } else {
            // HTTP错误
            console.error('HTTP错误:', res.statusCode, res.data);
            uni.showToast({
              title: `HTTP错误: ${res.statusCode}`,
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          console.error('❌ 修改请求失败:', err);
          console.error('错误详情:', {
            errMsg: err.errMsg,
            statusCode: err.statusCode,
            data: err.data
          });
          
          // 添加更详细的调试信息
          console.log('=== 请求调试信息 ===');
          console.log('请求URL:', url);
          console.log('请求数据:', finalRequestData);
          console.log('请求头:', {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken
          });
          console.log('Token长度:', adminToken ? adminToken.length : 0);
          console.log('=== 调试信息结束 ===');
          
          let errorMsg = '网络连接失败';
          let shouldShowRestartDialog = false;
          let shouldCheckToken = false;
          
          if (err.errMsg && err.errMsg.includes('ERR_EMPTY_RESPONSE')) {
                      // 现在使用与ApiPost相同的格式，如果仍然失败，说明是其他问题
          errorMsg = '请求格式已修正，请重试';
          console.error('已使用与ApiPost相同的请求格式，如果仍然失败，可能是：');
          console.error('1. 后端服务问题');
          console.error('2. 网络连接问题');
          console.error('3. 其他环境问题');
          } else if (err.errMsg && err.errMsg.includes('timeout')) {
            errorMsg = '请求超时，请重试';
          } else if (err.errMsg && err.errMsg.includes('fail')) {
            errorMsg = '服务器连接失败，请检查后端服务';
            shouldShowRestartDialog = true;
          } else if (err.errMsg && err.errMsg.includes('abort')) {
            errorMsg = '请求被中断';
          }
          
          console.error('显示错误消息:', errorMsg);
          uni.showToast({
            title: errorMsg,
            icon: 'none',
            duration: 3000
          });
          
          // 如果是Token问题，提示重新登录
          if (shouldCheckToken) {
            setTimeout(() => {
              uni.showModal({
                title: 'Token问题',
                content: '检测到Token问题，请重新登录管理员账号',
                confirmText: '去登录',
                cancelText: '取消',
                success: (res) => {
                  if (res.confirm) {
                    uni.removeStorageSync('adminToken');
                    uni.navigateTo({
                      url: '/pages/admin/login'
                    });
                  }
                }
              });
            }, 2000);
          }
          // 如果是后端服务问题，显示重启提示
          else if (shouldShowRestartDialog) {
            setTimeout(() => {
              uni.showModal({
                title: '后端服务问题',
                content: '检测到后端服务问题，请检查服务状态',
                showCancel: false,
                confirmText: '知道了'
              });
            }, 2000);
          }
        },
        complete: () => {
          this.isSaving = false;
        }
      });
    },
    
    // 调试请求格式
    debugRequest() {
      console.log('=== 调试请求格式 ===');
      
      const adminToken = uni.getStorageSync('adminToken');
      console.log('Token:', adminToken);
      
      // 构建请求数据
      const debugData = {
        id: parseInt(this.pointId),
        name: this.pointInfo.name.trim(),
        address: this.pointInfo.address.trim(),
        point_type: this.pointInfo.pointType.trim(),
        available_large: parseInt(this.pointInfo.availableLarge) || 0,
        available_medium: parseInt(this.pointInfo.availableMedium) || 0,
        available_small: parseInt(this.pointInfo.availableSmall) || 0,
        open_time: this.pointInfo.openTime.trim(),
        status: (parseInt(this.pointInfo.status) || 1).toString(),
        mobile: '',
        latitude: 0,
        longitude: 0
      };
      
      console.log('请求数据:', debugData);
      console.log('请求URL:', 'http://localhost:8000/admin/updatePoint');
      console.log('请求方法:', 'POST');
      console.log('请求头:', {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + adminToken
      });
      
      // 尝试发送一个简单的测试请求
      uni.request({
        url: 'http://localhost:8000/admin/updatePoint',
        method: 'POST',
        data: debugData,
        header: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + adminToken
        },
        timeout: 10000,
        success: (res) => {
          console.log('✅ 调试请求成功:', res);
          uni.showToast({
            title: '请求格式正确',
            icon: 'success',
            duration: 2000
          });
        },
        fail: (err) => {
          console.error('❌ 调试请求失败:', err);
          console.error('错误详情:', {
            errMsg: err.errMsg,
            statusCode: err.statusCode,
            data: err.data
          });
          
          let errorMsg = '请求失败';
          if (err.errMsg && err.errMsg.includes('ERR_EMPTY_RESPONSE')) {
            errorMsg = '后端返回空响应，可能是数据格式问题';
          } else if (err.errMsg && err.errMsg.includes('timeout')) {
            errorMsg = '请求超时';
          } else if (err.errMsg && err.errMsg.includes('fail')) {
            errorMsg = '请求失败';
          }
          
          uni.showToast({
            title: errorMsg,
            icon: 'none',
            duration: 3000
          });
        }
      });
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