<template>
	<view class="page">
		<!-- 顶部导航栏 -->
		<view class="header">
			<view class="back-btn" @click="goBack">
				<text class="back-icon">←</text>
			</view>
			<text class="header-title">寄存点详情</text>
			<view class="share-btn">
				<text class="share-icon">⋯</text>
			</view>
		</view>

		<!-- 寄存点信息 -->
		<view class="locker-info-section">
			<view class="locker-header">
				<text class="locker-name">{{lockerInfo.name}}</text>
				<view class="locker-status" :class="lockerInfo.status">
					<text class="status-text">{{lockerInfo.status === 'available' ? '营业中' : '暂停服务'}}</text>
				</view>
			</view>

			<view class="locker-address">
				<text class="address-icon">📍</text>
				<text class="address-text">{{lockerInfo.address}}</text>
			</view>

			<view class="locker-distance" v-if="lockerInfo.distance">
				<text class="distance-text">距离您 {{lockerInfo.distance}}</text>
			</view>
		</view>

		<!-- 柜子容量信息 -->
		<view class="capacity-section">
			<view class="section-title">
				<text class="title-text">可用柜子</text>
				<text class="refresh-btn" @click="refreshCapacity">🔄 刷新</text>
			</view>

			<view class="capacity-grid">
				<view class="capacity-item">
					<view class="capacity-icon large">📦</view>
					<text class="capacity-label">大柜</text>
					<text class="capacity-count" :class="{ 'zero': lockerInfo.large === 0 }">{{lockerInfo.large}}</text>
					<text class="capacity-size">适合行李箱</text>
				</view>

				<view class="capacity-item">
					<view class="capacity-icon medium">📦</view>
					<text class="capacity-label">中柜</text>
					<text class="capacity-count" :class="{ 'zero': lockerInfo.medium === 0 }">{{lockerInfo.medium}}</text>
					<text class="capacity-size">适合背包</text>
				</view>

				<view class="capacity-item">
					<view class="capacity-icon small">📦</view>
					<text class="capacity-label">小柜</text>
					<text class="capacity-count" :class="{ 'zero': lockerInfo.small === 0 }">{{lockerInfo.small}}</text>
					<text class="capacity-size">适合手提包</text>
				</view>
			</view>
		</view>

		<!-- 服务信息 -->
		<view class="service-section">
			<view class="section-title">
				<text class="title-text">服务信息</text>
			</view>

			<view class="service-item">
				<text class="service-label">营业时间</text>
				<text class="service-value">{{lockerInfo.openTime || '24小时'}}</text>
			</view>

			<view class="service-item">
				<text class="service-label">联系电话</text>
				<text class="service-value phone" @click="callPhone">{{lockerInfo.mobile || '暂无'}}</text>
			</view>

			<view class="service-item">
				<text class="service-label">收费标准</text>
				<text class="service-value">{{lockerInfo.price || '按时计费'}}</text>
			</view>
		</view>

		<!-- 操作按钮 -->
		<view class="action-section">
			<button class="action-btn primary" @click="startDeposit" :disabled="!hasAvailableLocker">
				立即寄存
			</button>
			<button class="action-btn secondary" @click="getDirections">
				获取路线
			</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				lockerInfo: {
					id: 1,
					name: '寄存点名称',
					address: '寄存点地址',
					status: 'available',
					large: 0,
					medium: 0,
					small: 0,
					distance: '',
					openTime: '24小时',
					mobile: '',
					price: '按时计费'
				}
			}
		},
		
		computed: {
			hasAvailableLocker() {
				return this.lockerInfo.large > 0 || this.lockerInfo.medium > 0 || this.lockerInfo.small > 0;
			}
		},
		
		onLoad(options) {
			console.log('寄存点详情页加载，参数:', options);
			
			// 获取传入的参数
			if (options.id) {
				this.loadLockerDetail(options.id);
			} else if (options.name && options.address) {
				// 从搜索页面跳转过来的参数
				this.lockerInfo.name = decodeURIComponent(options.name);
				this.lockerInfo.address = decodeURIComponent(options.address);
				this.loadLockerDetail(options.id || 1);
			}
		},
		
		methods: {
			// 返回上一页
			goBack() {
				uni.navigateBack();
			},
			
			// 加载寄存点详情
			loadLockerDetail(id) {
				console.log('加载寄存点详情:', id);
				
				// 显示加载状态
				uni.showLoading({
					title: '加载中...'
				});
				
				// 统一的API基础URL
				const API_BASE_URL = 'http://localhost:8000';
				
				// 调用后端接口获取详情 - 使用正确的API路径
				uni.request({
					url: `${API_BASE_URL}/getDepositLocker?locker_id=${id}`,
					method: 'GET',
					header: {
						'Content-Type': 'application/json'
					},
					success: (res) => {
						console.log('获取寄存点详情成功:', res.data);
						uni.hideLoading();
						
						if (res.data) {
							// 处理后端返回的数据格式
							this.processLockerData(res.data);
						} else {
							this.handleLoadError('获取详情失败');
						}
					},
					fail: (err) => {
						console.log('获取寄存点详情失败:', err);
						uni.hideLoading();
						this.handleLoadError('网络请求失败');
					}
				});
			},
			
			// 处理后端返回的寄存点数据
			processLockerData(data) {
				console.log('处理寄存点数据:', data);
				
				// 根据后端返回的数据结构处理
				this.lockerInfo = {
					id: this.lockerInfo.id,
					name: data.name || '寄存点',
					address: data.address || '地址信息',
					status: 'available',
					longitude: data.longitude || 0,
					latitude: data.latitude || 0,
					distance: this.lockerInfo.distance,
					openTime: '06:00-23:00',
					mobile: '400-123-4567',
					price: '按时计费'
				};
				
				// 处理柜子信息
				if (data.locker && Array.isArray(data.locker)) {
					let large = 0, medium = 0, small = 0;
					
					data.locker.forEach(locker => {
						if (locker.locker_type === 1 || locker.size === 'large') {
							large += locker.num || 0;
						} else if (locker.locker_type === 2 || locker.size === 'medium') {
							medium += locker.num || 0;
						} else if (locker.locker_type === 3 || locker.size === 'small') {
							small += locker.num || 0;
						}
					});
					
					this.lockerInfo.large = large;
					this.lockerInfo.medium = medium;
					this.lockerInfo.small = small;
				} else {
					// 默认值
					this.lockerInfo.large = 5;
					this.lockerInfo.medium = 8;
					this.lockerInfo.small = 12;
				}
				
				console.log('处理后的寄存点信息:', this.lockerInfo);
			},
			
			// 处理加载错误
			handleLoadError(message) {
				// 使用模拟数据
				this.lockerInfo = {
					id: 1,
					name: '郑州东站寄存点',
					address: '郑州市金水区郑东新区郑州东站西广场',
					status: 'available',
					large: 5,
					medium: 8,
					small: 12,
					distance: '1.2km',
					openTime: '06:00-23:00',
					mobile: '400-123-4567',
					price: '大柜8元/小时，中柜6元/小时，小柜4元/小时'
				};
				
				uni.showToast({
					title: message + '，使用模拟数据',
					icon: 'none',
					duration: 2000
				});
			},
			
			// 刷新容量信息
			refreshCapacity() {
				console.log('刷新容量信息');
				this.loadLockerDetail(this.lockerInfo.id);
			},
			
			// 拨打电话
			callPhone() {
				if (!this.lockerInfo.mobile) {
					uni.showToast({
						title: '暂无联系电话',
						icon: 'none'
					});
					return;
				}
				
				uni.makePhoneCall({
					phoneNumber: this.lockerInfo.mobile,
					success: () => {
						console.log('拨打电话成功');
					},
					fail: (error) => {
						console.error('拨打电话失败:', error);
						uni.showToast({
							title: '拨打电话失败',
							icon: 'none'
						});
					}
				});
			},
			
			// 开始寄存
			startDeposit() {
				if (!this.hasAvailableLocker) {
					uni.showToast({
						title: '暂无可用柜子',
						icon: 'none'
					});
					return;
				}
				
				// 跳转到寄存页面或显示寄存选项
				uni.showActionSheet({
					itemList: ['大柜寄存', '中柜寄存', '小柜寄存'],
					success: (res) => {
						const types = ['large', 'medium', 'small'];
						const selectedType = types[res.tapIndex];
						
						if (this.lockerInfo[selectedType] > 0) {
							this.processDeposit(selectedType);
						} else {
							uni.showToast({
								title: '该类型柜子暂无库存',
								icon: 'none'
							});
						}
					}
				});
			},
			
			// 处理寄存
			processDeposit(type) {
				console.log('处理寄存:', type);
				
				// 这里可以跳转到寄存确认页面或直接处理寄存逻辑
				uni.showModal({
					title: '确认寄存',
					content: `确定要使用${type === 'large' ? '大' : type === 'medium' ? '中' : '小'}柜进行寄存吗？`,
					success: (res) => {
						if (res.confirm) {
							// 执行寄存逻辑
							this.executeDeposit(type);
						}
					}
				});
			},
			
			// 执行寄存
			executeDeposit(type) {
				uni.showLoading({
					title: '正在寄存...'
				});
				
				// 模拟寄存请求
				setTimeout(() => {
					uni.hideLoading();
					
					// 模拟成功
					const orderNo = 'DP' + Date.now();
					
					uni.showModal({
						title: '寄存成功',
						content: `订单号：${orderNo}\n请妥善保管取件码`,
						showCancel: false,
						success: () => {
							// 跳转到订单详情或我的页面
							uni.navigateTo({
								url: '/pages/order-detail/order-detail'
							});
						}
					});
				}, 2000);
			},
			
			// 获取路线
			getDirections() {
				console.log('获取路线到:', this.lockerInfo.address);
				
				// 调用地图应用获取路线
				uni.openLocation({
					latitude: 34.7466, // 示例坐标
					longitude: 113.6253,
					name: this.lockerInfo.name,
					address: this.lockerInfo.address,
					success: () => {
						console.log('打开地图成功');
					},
					fail: (error) => {
						console.error('打开地图失败:', error);
						uni.showToast({
							title: '打开地图失败',
							icon: 'none'
						});
					}
				});
			}
		}
	}
</script>

<style scoped>
.page {
	background: linear-gradient(180deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
	min-height: 100vh;
	position: relative;
}

.page::before {
	content: '';
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: linear-gradient(135deg, 
		rgba(102, 126, 234, 0.1) 0%, 
		rgba(118, 75, 162, 0.05) 50%, 
		rgba(240, 147, 251, 0.1) 100%);
	backdrop-filter: blur(100rpx);
	z-index: -1;
}

/* 顶部导航栏 */
.header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx;
	background: linear-gradient(135deg, 
		rgba(255, 255, 255, 0.95) 0%, 
		rgba(255, 255, 255, 0.85) 100%);
	backdrop-filter: blur(20rpx);
	border-bottom: 1rpx solid rgba(255, 255, 255, 0.2);
}

.back-btn, .share-btn {
	width: 80rpx;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background: linear-gradient(135deg, #667eea, #764ba2);
}

.back-icon, .share-icon {
	font-size: 32rpx;
	color: #ffffff;
	font-weight: bold;
}

.header-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333333;
}

/* 寄存点信息 */
.locker-info-section {
	margin: 30rpx;
	padding: 40rpx;
	background: linear-gradient(135deg, 
		rgba(255, 255, 255, 0.95) 0%, 
		rgba(255, 255, 255, 0.85) 100%);
	backdrop-filter: blur(20rpx);
	border-radius: 25rpx;
	box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.1);
}

.locker-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20rpx;
}

.locker-name {
	font-size: 36rpx;
	font-weight: bold;
	color: #333333;
	flex: 1;
}

.locker-status {
	padding: 10rpx 20rpx;
	border-radius: 20rpx;
	font-size: 24rpx;
}

.locker-status.available {
	background: linear-gradient(135deg, #4CAF50, #45a049);
	color: #ffffff;
}

.locker-status.unavailable {
	background: linear-gradient(135deg, #f44336, #d32f2f);
	color: #ffffff;
}

.locker-address {
	display: flex;
	align-items: center;
	margin-bottom: 15rpx;
}

.address-icon {
	font-size: 28rpx;
	margin-right: 10rpx;
	color: #667eea;
}

.address-text {
	font-size: 28rpx;
	color: #666666;
	flex: 1;
}

.locker-distance {
	text-align: right;
}

.distance-text {
	font-size: 24rpx;
	color: #999999;
}

/* 容量信息 */
.capacity-section {
	margin: 30rpx;
	padding: 40rpx;
	background: linear-gradient(135deg, 
		rgba(255, 255, 255, 0.95) 0%, 
		rgba(255, 255, 255, 0.85) 100%);
	backdrop-filter: blur(20rpx);
	border-radius: 25rpx;
	box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.1);
}

.section-title {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 30rpx;
}

.title-text {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
}

.refresh-btn {
	font-size: 26rpx;
	color: #667eea;
	padding: 10rpx 20rpx;
	border-radius: 20rpx;
	background: rgba(102, 126, 234, 0.1);
}

.capacity-grid {
	display: flex;
	justify-content: space-between;
}

.capacity-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 30rpx 20rpx;
	margin: 0 10rpx;
	border-radius: 20rpx;
	background: linear-gradient(135deg, 
		rgba(102, 126, 234, 0.1) 0%, 
		rgba(118, 75, 162, 0.1) 100%);
}

.capacity-icon {
	font-size: 48rpx;
	margin-bottom: 15rpx;
}

.capacity-icon.large {
	color: #ff6b6b;
}

.capacity-icon.medium {
	color: #ffa500;
}

.capacity-icon.small {
	color: #4CAF50;
}

.capacity-label {
	font-size: 28rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 10rpx;
}

.capacity-count {
	font-size: 36rpx;
	font-weight: bold;
	color: #667eea;
	margin-bottom: 10rpx;
}

.capacity-count.zero {
	color: #999999;
}

.capacity-size {
	font-size: 22rpx;
	color: #999999;
	text-align: center;
}

/* 服务信息 */
.service-section {
	margin: 30rpx;
	padding: 40rpx;
	background: linear-gradient(135deg, 
		rgba(255, 255, 255, 0.95) 0%, 
		rgba(255, 255, 255, 0.85) 100%);
	backdrop-filter: blur(20rpx);
	border-radius: 25rpx;
	box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.1);
}

.service-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 25rpx 0;
	border-bottom: 1rpx solid rgba(0, 0, 0, 0.1);
}

.service-item:last-child {
	border-bottom: none;
}

.service-label {
	font-size: 28rpx;
	color: #333333;
}

.service-value {
	font-size: 28rpx;
	color: #666666;
}

.service-value.phone {
	color: #667eea;
	text-decoration: underline;
}

/* 操作按钮 */
.action-section {
	display: flex;
	padding: 30rpx;
	gap: 20rpx;
}

.action-btn {
	flex: 1;
	padding: 30rpx;
	border-radius: 30rpx;
	font-size: 32rpx;
	font-weight: bold;
	border: none;
}

.action-btn.primary {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
	box-shadow: 0 8rpx 25rpx rgba(102, 126, 234, 0.4);
}

.action-btn.primary:disabled {
	background: #cccccc;
	box-shadow: none;
}

.action-btn.secondary {
	background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
	color: #ffffff;
	box-shadow: 0 8rpx 25rpx rgba(240, 147, 251, 0.4);
}
</style>