<template>
  <view class="price-rule">
    <!-- 头部 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="header-title">收费规则</text>
      <view class="header-right">
        <text class="menu-icon">⋯</text>
        <text class="target-icon">○</text>
      </view>
    </view>

    <!-- 网点信息 -->
    <view class="network-info">
      <text class="network-title">网点: {{ networkName }}</text>
    </view>

    <!-- 收费模式 -->
    <view class="charging-mode">
      <text class="section-title">收费模式</text>
      <view class="mode-buttons">
        <view 
          class="mode-btn" 
          :class="{ active: chargingMode === 'timed' }"
          @click="setChargingMode('timed')"
        >
          计时收费
        </view>
        <view 
          class="mode-btn" 
          :class="{ active: chargingMode === 'daily' }"
          @click="setChargingMode('daily')"
        >
          按日收费
        </view>
      </view>
    </view>

    <!-- 价格设置 -->
    <view class="price-settings">
      <text class="section-title">价格设置</text>
      
      <!-- 计时收费模式 -->
      <view v-if="chargingMode === 'timed'" class="timed-settings">
        <view class="setting-item">
          <text class="setting-label">小柜子:</text>
          <input 
            class="setting-input" 
            type="text" 
            v-model="timedSettings.smallHourlyRate"
            placeholder="0"
          />
          <text class="setting-unit">元/小时</text>
        </view>
        
        <view class="setting-item">
          <text class="setting-label">小柜子24小时内封顶费用:</text>
          <input 
            class="setting-input" 
            type="text" 
            v-model="timedSettings.smallDailyCap"
            placeholder="0"
          />
          <text class="setting-unit">元</text>
        </view>
        
        <view class="setting-item">
          <text class="setting-label">大柜子:</text>
          <input 
            class="setting-input" 
            type="text" 
            v-model="timedSettings.largeHourlyRate"
            placeholder="0"
          />
          <text class="setting-unit">元/小时</text>
        </view>
        
        <view class="setting-item">
          <text class="setting-label">大柜子24小时内封顶费用:</text>
          <input 
            class="setting-input" 
            type="text" 
            v-model="timedSettings.largeDailyCap"
            placeholder="0"
          />
          <text class="setting-unit">元</text>
        </view>
      </view>
      
      <!-- 按日收费模式 -->
      <view v-if="chargingMode === 'daily'" class="daily-settings">
        <view class="setting-item">
          <text class="setting-label">小柜子:</text>
          <input 
            class="setting-input" 
            type="text" 
            v-model="dailySettings.smallDailyRate"
            placeholder="0"
          />
          <text class="setting-unit">元/日</text>
        </view>
        
        <view class="setting-item">
          <text class="setting-label">大柜子:</text>
          <input 
            class="setting-input" 
            type="text" 
            v-model="dailySettings.largeDailyRate"
            placeholder="0"
          />
          <text class="setting-unit">元/日</text>
        </view>
      </view>
    </view>

    <!-- 免费时长 -->
    <view class="free-duration">
      <text class="section-title">免费时长</text>
      <view class="free-duration-row">
        <text class="free-duration-label">寄存后前</text>
        <input 
          class="free-duration-input"
          type="text"
          v-model="freeDuration"
          placeholder="0"
          @input="onFreeDurationChange"
        />
        <text class="free-duration-unit" v-if="chargingMode === 'timed'">分钟内取出结束订单不收取费用。</text>
        <text class="free-duration-unit" v-else>小时内取出结束订单不收取费用。</text>
      </view>
    </view>

    <!-- 押金 -->
    <view class="deposit">
      <text class="section-title">押金</text>
      <view class="setting-item">
        <text class="setting-label">小柜子:</text>
        <input 
          class="setting-input" 
          type="text" 
          v-model="depositSettings.smallDeposit"
          placeholder="0"
        />
        <text class="setting-unit">元</text>
      </view>
      
      <view class="setting-item">
        <text class="setting-label">大柜子:</text>
        <input 
          class="setting-input" 
          type="text" 
          v-model="depositSettings.largeDeposit"
          placeholder="0"
        />
        <text class="setting-unit">元</text>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-buttons">
      <button class="cancel-btn" @click="goBack">取消</button>
      <button class="save-btn" @click="savePriceRule">保存</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      networkId: null,
      networkName: '',
      chargingMode: 'timed', // 'timed' 或 'daily'
      
      // 计时收费设置
      timedSettings: {
        smallHourlyRate: '',
        smallDailyCap: '',
        largeHourlyRate: '',
        largeDailyCap: ''
      },
      
      // 按日收费设置
      dailySettings: {
        smallDailyRate: '',
        largeDailyRate: ''
      },
      
      // 免费时长
      freeDuration: '',
      
      // 押金设置
      depositSettings: {
        smallDeposit: '',
        largeDeposit: ''
      }
    }
  },
  
  onLoad(options) {
    this.networkId = options.id || 1;
    this.networkName = decodeURIComponent(options.name || '未命名网点');
    console.log('收费规则页面加载 - 网点ID:', this.networkId, '名称:', this.networkName);
    this.getPriceRule();
  },
  
  onShow() {
    // 每次显示页面时重新获取数据
    if (this.networkId) {
      console.log('页面显示，重新获取价格规则 - 网点ID:', this.networkId);
      this.getPriceRule();
    }
  },
  
  methods: {
    // 设置收费模式
    setChargingMode(mode) {
      this.chargingMode = mode;
    },
    
    // 免费时长输入变化
    onFreeDurationChange(event) {
      const value = event.detail.value;
      // 允许输入数字和小数点
      const numericValue = value.replace(/[^0-9.]/g, '');
      // 确保只有一个小数点
      const parts = numericValue.split('.');
      if (parts.length > 2) {
        this.freeDuration = parts[0] + '.' + parts.slice(1).join('');
      } else {
        this.freeDuration = numericValue;
      }
      console.log('免费时长已更新:', this.freeDuration);
    },
    

    
    // 获取价格规则
    getPriceRule() {
      console.log('正在获取价格规则，网点ID:', this.networkId);
      
      uni.request({
        url: `http://localhost:8000/admin/getPriceRule?networkId=${this.networkId}`,
        method: 'GET',
        header: {
          'Authorization': 'Bearer ' + uni.getStorageSync('adminToken')
        },
        success: (res) => {
          console.log('获取价格规则返回:', res);
          
          if (res.data && res.data.code === 200 && res.data.rules && res.data.rules.length > 0) {
            console.log('找到价格规则数据，开始加载');
            this.loadPriceRules(res.data.rules);
            uni.showToast({
              title: '数据加载成功',
              icon: 'success',
              duration: 1000
            });
          } else {
            console.log('没有找到价格规则数据或数据为空');
            // 清空所有数据
            this.resetFormData();
            uni.showToast({
              title: '暂无价格规则数据',
              icon: 'none',
              duration: 1500
            });
          }
        },
        fail: (err) => {
          console.error('获取价格规则失败:', err);
          uni.showToast({
            title: '获取数据失败',
            icon: 'none'
          });
        }
      });
    },
    
    // 加载价格规则到表单
    loadPriceRules(rules) {
      console.log('开始加载价格规则:', rules);
      
      // 重置所有数据
      this.timedSettings = {
        smallHourlyRate: '',
        smallDailyCap: '',
        largeHourlyRate: '',
        largeDailyCap: ''
      };
      
      this.dailySettings = {
        smallDailyRate: '',
        largeDailyRate: ''
      };
      
      this.depositSettings = {
        smallDeposit: '',
        largeDeposit: ''
      };
      
      this.freeDuration = '';
      
      rules.forEach(rule => {
        console.log('处理规则:', rule);
        
        if (rule.lockerType === 1) { // 小柜子
          if (rule.feeType === 1) { // 计时收费
            this.timedSettings.smallHourlyRate = (rule.hourlyRate || 0).toString();
            this.timedSettings.smallDailyCap = (rule.dailyCap || 0).toString();
          } else { // 按日收费
            this.dailySettings.smallDailyRate = (rule.dailyRate || 0).toString();
          }
          this.depositSettings.smallDeposit = (rule.depositAmount || 0).toString();
        } else if (rule.lockerType === 2) { // 大柜子
          if (rule.feeType === 1) { // 计时收费
            this.timedSettings.largeHourlyRate = (rule.hourlyRate || 0).toString();
            this.timedSettings.largeDailyCap = (rule.dailyCap || 0).toString();
          } else { // 按日收费
            this.dailySettings.largeDailyRate = (rule.dailyRate || 0).toString();
          }
          this.depositSettings.largeDeposit = (rule.depositAmount || 0).toString();
        }
        
        // 设置免费时长（取第一个规则的免费时长）
        if (rule.freeDuration !== undefined && rule.freeDuration !== null) {
          this.freeDuration = (rule.freeDuration || 0).toString();
        }
        
        // 设置收费模式
        this.chargingMode = rule.feeType === 1 ? 'timed' : 'daily';
      });
      
      console.log('加载完成 - 计时设置:', this.timedSettings);
      console.log('加载完成 - 按日设置:', this.dailySettings);
      console.log('加载完成 - 押金设置:', this.depositSettings);
      console.log('加载完成 - 免费时长:', this.freeDuration);
      console.log('加载完成 - 收费模式:', this.chargingMode);
    },
    
    // 保存价格规则
    savePriceRule() {
      // 验证免费时长
      const freeDurationNum = parseFloat(this.freeDuration) || 0;
      if (freeDurationNum < 0) {
        uni.showToast({
          title: '免费时长不能为负数',
          icon: 'none'
        });
        return;
      }
      
      const rules = [];
      
      // 构建小柜子规则
      if (this.chargingMode === 'timed') {
        rules.push({
          ruleName: '小柜子计时收费',
          feeType: 1, // 计时收费
          lockerType: 1, // 小柜子
          freeDuration: parseFloat(this.freeDuration) || 0,
          hourlyRate: parseFloat(this.timedSettings.smallHourlyRate) || 0,
          dailyCap: parseFloat(this.timedSettings.smallDailyCap) || 0,
          depositAmount: parseFloat(this.depositSettings.smallDeposit) || 0,
          isDepositEnabled: this.depositSettings.smallDeposit > 0,
          isAdvancePay: false
        });
        
        rules.push({
          ruleName: '大柜子计时收费',
          feeType: 1, // 计时收费
          lockerType: 2, // 大柜子
          freeDuration: parseFloat(this.freeDuration) || 0,
          hourlyRate: parseFloat(this.timedSettings.largeHourlyRate) || 0,
          dailyCap: parseFloat(this.timedSettings.largeDailyCap) || 0,
          depositAmount: parseFloat(this.depositSettings.largeDeposit) || 0,
          isDepositEnabled: this.depositSettings.largeDeposit > 0,
          isAdvancePay: false
        });
      } else {
        rules.push({
          ruleName: '小柜子按日收费',
          feeType: 2, // 按日收费
          lockerType: 1, // 小柜子
          freeDuration: parseFloat(this.freeDuration) || 0,
          dailyRate: parseFloat(this.dailySettings.smallDailyRate) || 0,
          depositAmount: parseFloat(this.depositSettings.smallDeposit) || 0,
          isDepositEnabled: this.depositSettings.smallDeposit > 0,
          isAdvancePay: false
        });
        
        rules.push({
          ruleName: '大柜子按日收费',
          feeType: 2, // 按日收费
          lockerType: 2, // 大柜子
          freeDuration: parseFloat(this.freeDuration) || 0,
          dailyRate: parseFloat(this.dailySettings.largeDailyRate) || 0,
          depositAmount: parseFloat(this.depositSettings.largeDeposit) || 0,
          isDepositEnabled: this.depositSettings.largeDeposit > 0,
          isAdvancePay: false
        });
      }
      
      const requestData = {
        networkId: parseInt(this.networkId),
        rules: rules
      };
      
      console.log('保存价格规则:', requestData);
      console.log('免费时长值:', this.freeDuration);
      
      uni.request({
        url: 'http://localhost:8000/admin/setPriceRule',
        method: 'POST',
        data: requestData,
        header: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + uni.getStorageSync('adminToken')
        },
        success: (res) => {
          console.log('保存价格规则返回:', res);
          if (res.data && res.data.code === 200) {
            // 保存成功后，重新获取最新数据
            this.getPriceRule();
            
            uni.showToast({
              title: '保存成功',
              icon: 'success'
            });
            
            // 延迟返回，让用户看到保存成功的数据
            setTimeout(() => {
              uni.navigateBack();
            }, 2000);
          } else {
            uni.showToast({
              title: res.data?.msg || '保存失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          console.error('保存价格规则失败:', err);
          uni.showToast({
            title: '网络错误',
            icon: 'none'
          });
        }
      });
    },
    
    // 重置表单数据
    resetFormData() {
      this.timedSettings = {
        smallHourlyRate: '',
        smallDailyCap: '',
        largeHourlyRate: '',
        largeDailyCap: ''
      };
      
      this.dailySettings = {
        smallDailyRate: '',
        largeDailyRate: ''
      };
      
      this.depositSettings = {
        smallDeposit: '',
        largeDeposit: ''
      };
      
      this.freeDuration = '';
      this.chargingMode = 'timed';
      
      console.log('表单数据已重置');
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack();
    }
  }
}
</script>

<style scoped>
.price-rule {
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

.header-left {
  display: flex;
  align-items: center;
}

.back-icon {
  font-size: 36rpx;
  color: #333333;
  padding: 10rpx;
}

.header-title {
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

/* 网点信息 */
.network-info {
  background-color: #ffffff;
  padding: 30rpx 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.network-title {
  font-size: 32rpx;
  color: #333333;
  font-weight: bold;
}

/* 收费模式 */
.charging-mode {
  background-color: #ffffff;
  margin: 20rpx 0;
  padding: 30rpx 40rpx;
}

.section-title {
  font-size: 32rpx;
  color: #333333;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
}

.mode-buttons {
  display: flex;
  gap: 20rpx;
}

.mode-btn {
  flex: 1;
  padding: 20rpx;
  text-align: center;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #666666;
  background-color: #ffffff;
}

.mode-btn.active {
  background-color: #007aff;
  color: #ffffff;
  border-color: #007aff;
}

/* 价格设置 */
.price-settings {
  background-color: #ffffff;
  margin: 20rpx 0;
  padding: 30rpx 40rpx;
}

.setting-item {
  display: flex;
  align-items: center;
  margin-bottom: 15rpx;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.setting-label {
  font-size: 28rpx;
  color: #333333;
  min-width: 200rpx;
  flex-shrink: 0;
}

.setting-input {
  flex: 1;
  padding: 15rpx 20rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #333333;
  text-align: center;
  margin: 0 20rpx;
  background-color: #ffffff;
  pointer-events: auto;
  user-select: text;
  -webkit-user-select: text;
  transition: border-color 0.3s ease;
}

.setting-input:focus {
  border-color: #007aff;
  outline: none;
}

.setting-input::placeholder {
  color: #999999;
  font-size: 26rpx;
}

/* 免费时长专用样式 */
.free-duration-row {
  display: flex;
  align-items: center;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.free-duration-label {
  font-size: 28rpx;
  color: #333333;
  margin-right: 10rpx;
  flex-shrink: 0;
}

.free-duration-input {
  width: 100rpx;
  height: 60rpx;
  padding: 8rpx 12rpx;
  border: 2rpx solid #007aff;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #333333;
  text-align: center;
  margin: 0 10rpx;
  background-color: #ffffff;
  box-sizing: border-box;
  flex-shrink: 0;
}

.free-duration-input:focus {
  border-color: #0056cc;
  outline: none;
  box-shadow: 0 0 0 2rpx rgba(0, 122, 255, 0.15);
}

.free-duration-input::placeholder {
  color: #cccccc;
  font-size: 26rpx;
}

.free-duration-unit {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.4;
  flex: 1;
}

.setting-unit {
  font-size: 26rpx;
  color: #666666;
  min-width: 180rpx;
  line-height: 1.4;
}

/* 免费时长 */
.free-duration {
  background-color: #ffffff;
  margin: 15rpx 0;
  padding: 25rpx 40rpx;
}

/* 押金 */
.deposit {
  background-color: #ffffff;
  margin: 20rpx 0;
  padding: 30rpx 40rpx;
}

/* 底部按钮 */
.bottom-buttons {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  padding: 20rpx 40rpx;
  display: flex;
  gap: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.cancel-btn, .save-btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 8rpx;
  font-size: 32rpx;
  text-align: center;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666666;
  border: 1rpx solid #e0e0e0;
}

.save-btn {
  background-color: #007aff;
  color: #ffffff;
  border: 1rpx solid #007aff;
}
</style> 