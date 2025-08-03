# 首页城市选择功能说明

## 功能概述

首页的城市选择功能允许用户点击城市名称来切换到不同的城市，默认显示郑州，用户可以切换到其他任何城市。

## 功能特点

### 1. 默认城市
- **默认显示**：郑州
- **默认坐标**：经度 113.6253，纬度 34.7466
- **自动加载**：页面加载时自动显示郑州的附近寄存点

### 2. 城市选择器
- **位置**：首页顶部，"📍 郑州 ▼" 区域
- **可点击**：整个区域都可以点击
- **视觉反馈**：点击时有缩放动画效果
- **跳转**：点击后跳转到城市选择页面

### 3. 城市切换流程
1. 用户点击首页的城市名称（如"📍 郑州 ▼"）
2. 跳转到城市选择页面 (`/pages/city-select/city-select`)
3. 用户在城市选择页面选择目标城市
4. 选择完成后自动返回首页
5. 首页自动更新城市名称和附近寄存点数据

### 4. 数据持久化
- **本地存储**：选择的城市保存在 `uni.getStorageSync('selectedCity')`
- **格式**：
  ```javascript
  {
    name: "北京",
    coordinates: {
      longitude: 116.4074,
      latitude: 39.9042
    }
  }
  ```
- **恢复**：页面重新加载时自动恢复上次选择的城市

## 技术实现

### 模板代码
```vue
<view class="city-selector" @click="selectCity">
  <text class="location-icon">📍</text>
  <text class="city-name">{{currentCity}}</text>
  <text class="dropdown-icon">▼</text>
</view>
```

### 方法实现
```javascript
// 选择城市
selectCity() {
  console.log('选择城市');
  uni.navigateTo({
    url: '/pages/city-select/city-select'
  });
},

// 页面显示时检查城市变化
onShow() {
  const selectedCity = uni.getStorageSync('selectedCity');
  if (selectedCity) {
    const cityChanged = selectedCity.name !== this.currentCity;
    this.currentCity = selectedCity.name;
    
    if (cityChanged || !this.nearestLocker) {
      this.loadNearestLocker();
    }
  }
}
```

### 样式设计
```css
.city-selector {
  display: flex;
  align-items: center;
  padding: 8rpx 0;
  transition: all 0.3s ease;
}

.city-selector:active {
  transform: scale(0.98);
}
```

## 用户体验

### 视觉设计
- **图标**：📍 位置图标，直观表示地理位置
- **文字**：城市名称，清晰显示当前选择
- **下拉箭头**：▼ 提示用户可以点击选择
- **动画**：点击时轻微缩放，提供触觉反馈

### 交互流程
1. **初始状态**：显示默认城市"郑州"
2. **点击反馈**：按钮缩放动画
3. **页面跳转**：平滑跳转到城市选择页面
4. **选择完成**：显示成功提示，自动返回
5. **数据更新**：首页自动刷新城市和寄存点信息

### 状态管理
- **加载状态**：显示"正在搜索城市寄存点..."
- **成功状态**：显示找到的寄存点数量
- **错误处理**：网络错误时显示模拟数据
- **空数据**：没有寄存点时显示相应提示

## 与其他功能的集成

### 1. 我的附近功能
- 点击"我的附近"按钮时，基于当前选择的城市坐标跳转
- 附近页面自动使用选择的城市进行地图定位

### 2. 寄存点搜索
- 所有寄存点搜索都基于选择的城市坐标
- 搜索半径默认5公里，可扩大到10公里

### 3. 数据同步
- 首页和附近页面共享同一个城市选择数据
- 在任一页面切换城市，其他页面自动同步

## 测试验证

### 功能测试
- ✅ 默认显示郑州
- ✅ 城市选择器可点击
- ✅ 跳转到城市选择页面
- ✅ 选择城市后自动返回
- ✅ 首页自动更新城市名称
- ✅ 自动加载新城市的寄存点
- ✅ 数据持久化保存和恢复

### 测试页面
- `test_city_switch_flow.html` - 完整的城市切换流程演示
- `test_homepage_city_selection.html` - 首页城市选择功能测试

## 总结

首页的城市选择功能完全满足需求：
- **默认城市**：郑州
- **可点击切换**：支持切换到任何其他城市
- **自动更新**：切换后首页和相关功能自动更新
- **用户友好**：直观的界面设计和流畅的交互体验
- **数据持久**：选择的城市会被保存，下次打开应用时自动恢复

这种设计完美适合出行寄存的使用场景，用户可以在出发前就选择目的地城市，提前了解当地的寄存点分布情况。