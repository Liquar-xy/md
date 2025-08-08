// 网点数据管理工具
class PointDataManager {
  constructor() {
    this.storageKey = {
      latestData: 'latestPointData',
      lastEditTime: 'lastEditTime',
      pointList: 'pointList',
      currentPoint: 'currentPoint'
    };
  }

  // 保存最新编辑的数据
  saveLatestData(pointData) {
    const data = {
      ...pointData,
      lastUpdateTime: Date.now()
    };
    
    uni.setStorageSync(this.storageKey.latestData, data);
    uni.setStorageSync(this.storageKey.lastEditTime, Date.now());
    
    console.log('保存最新数据到全局管理器:', data);
    return data;
  }

  // 获取最新编辑的数据
  getLatestData() {
    return uni.getStorageSync(this.storageKey.latestData);
  }

  // 检查是否有最新的编辑数据
  hasRecentEditData(timeWindow = 10000) {
    const lastEditTime = uni.getStorageSync(this.storageKey.lastEditTime);
    const latestData = uni.getStorageSync(this.storageKey.latestData);
    const currentTime = Date.now();
    
    return lastEditTime && latestData && (currentTime - lastEditTime) < timeWindow;
  }

  // 更新列表中的网点数据
  updatePointInList(pointList, updatedData) {
    if (!pointList || !Array.isArray(pointList)) {
      console.warn('网点列表为空或格式错误');
      return pointList;
    }

    const updatedIndex = pointList.findIndex(item => 
      item.id === updatedData.id || item.Id === updatedData.id
    );

    if (updatedIndex !== -1) {
      // 更新列表中的数据
      pointList[updatedIndex] = {
        ...pointList[updatedIndex],
        name: updatedData.name,
        address: updatedData.address,
        pointType: updatedData.pointType,
        availableLarge: updatedData.availableLarge,
        availableMedium: updatedData.availableMedium,
        availableSmall: updatedData.availableSmall,
        openTime: updatedData.openTime,
        status: updatedData.status
      };

      console.log('列表数据已更新:', pointList[updatedIndex]);
      
      // 保存更新后的列表
      uni.setStorageSync(this.storageKey.pointList, pointList);
    }

    return pointList;
  }

  // 清除本地数据
  clearLocalData() {
    setTimeout(() => {
      uni.removeStorageSync(this.storageKey.latestData);
      uni.removeStorageSync(this.storageKey.lastEditTime);
      console.log('已清除本地数据');
    }, 2000);
  }

  // 获取网点列表
  getPointList() {
    return uni.getStorageSync(this.storageKey.pointList) || [];
  }

  // 保存网点列表
  savePointList(pointList) {
    uni.setStorageSync(this.storageKey.pointList, pointList);
  }

  // 获取当前选中的网点
  getCurrentPoint() {
    return uni.getStorageSync(this.storageKey.currentPoint);
  }

  // 保存当前选中的网点
  saveCurrentPoint(point) {
    uni.setStorageSync(this.storageKey.currentPoint, point);
  }
}

// 创建单例实例
const pointDataManager = new PointDataManager();

export default pointDataManager; 