<template>
	<view class="page">
		<!-- 顶部导航栏 -->
		<view class="navbar">
			<view class="nav-left" @click="goBack">
				<view class="back-button">
					<text class="back-icon">←</text>
					<text class="back-text">返回</text>
				</view>
			</view>
			<view class="nav-center">
				<text class="nav-title">修改柜组</text>
			</view>
			<view class="nav-right"></view>
		</view>

		<!-- 表单内容 -->
		<view class="form-container">
			<!-- 基本信息卡片 -->
			<view class="form-card">
				<view class="card-header">
					<text class="card-title">基本信息</text>
				</view>
				
				<view class="form-group">
					<text class="form-label">柜组名称 *</text>
					<input 
						class="form-input" 
						v-model="formData.groupName" 
						placeholder="请输入柜组名称（如：A组、B组）"
						maxlength="20"
					/>
				</view>
				
				<view class="form-group">
					<text class="form-label">柜组编码 *</text>
					<input 
						class="form-input" 
						v-model="formData.groupCode" 
						placeholder="请输入柜组编码（用于扫码识别）"
						maxlength="32"
					/>
				</view>
				
				<view class="form-group">
					<text class="form-label">柜组类型</text>
					<picker 
						mode="selector" 
						:value="groupTypeIndex" 
						:range="groupTypeOptions" 
						range-key="label"
						@change="onGroupTypeChange"
					>
						<view class="picker-input">
							<text class="picker-text">{{ groupTypeOptions[groupTypeIndex].label }}</text>
							<text class="picker-arrow">▼</text>
						</view>
					</picker>
				</view>
				
				<view class="form-group">
					<text class="form-label">柜组状态</text>
					<picker 
						mode="selector" 
						:value="statusIndex" 
						:range="statusOptions" 
						range-key="label"
						@change="onStatusChange"
					>
						<view class="picker-input">
							<text class="picker-text">{{ statusOptions[statusIndex].label }}</text>
							<text class="picker-arrow">▼</text>
						</view>
					</picker>
				</view>
			</view>

			<!-- 格口配置卡片 -->
			<view class="form-card">
				<view class="card-header">
					<text class="card-title">格口配置</text>
				</view>
				
				<view class="form-group">
					<text class="form-label">总格口数 *</text>
					<input 
						class="form-input" 
						v-model.number="formData.totalCells" 
						type="number"
						placeholder="请输入总格口数"
						@input="calculateEndNo"
					/>
				</view>
				
				<view class="form-group">
					<text class="form-label">起始编号 *</text>
					<input 
						class="form-input" 
						v-model.number="formData.startNo" 
						type="number"
						placeholder="请输入起始编号"
						@input="calculateEndNo"
					/>
				</view>
				
				<view class="form-group">
					<text class="form-label">结束编号</text>
					<input 
						class="form-input readonly" 
						v-model="formData.endNo" 
						type="number"
						placeholder="自动计算"
						disabled
					/>
					<text class="form-hint">根据起始编号和总格口数自动计算</text>
				</view>
			</view>

			<!-- 安装信息卡片 -->
			<view class="form-card">
				<view class="card-header">
					<text class="card-title">安装信息</text>
				</view>
				
				<view class="form-group">
					<text class="form-label">安装时间</text>
					<picker 
						mode="date" 
						:value="installDate" 
						@change="onInstallDateChange"
					>
						<view class="picker-input">
							<text class="picker-text">{{ installDate || '请选择安装时间' }}</text>
							<text class="picker-arrow">📅</text>
						</view>
					</picker>
				</view>
			</view>
		</view>

		<!-- 底部操作按钮 -->
		<view class="bottom-actions">
			<button class="action-btn cancel-btn" @click="goBack">
				<text class="btn-text">取消</text>
			</button>
			<button class="action-btn submit-btn" @click="submitForm" :disabled="submitting">
				<text class="btn-text">{{ submitting ? '保存中...' : '保存修改' }}</text>
			</button>
		</view>

		<!-- 加载遮罩 -->
		<view class="loading-overlay" v-if="loading">
			<view class="loading-content">
				<text class="loading-text">加载中...</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			// 表单数据
			formData: {
				id: 0,
				locationPointId: 0,
				groupName: '',
				groupCode: '',
				groupType: 'standard',
				status: 'normal',
				totalCells: 0,
				startNo: 1,
				endNo: 0,
				installTime: null
			},
			
			// 选择器选项
			groupTypeOptions: [
				{ value: 'standard', label: '标准柜组' },
				{ value: 'refrigerated', label: '冷藏柜组' },
				{ value: 'oversize', label: '大件柜组' }
			],
			statusOptions: [
				{ value: 'normal', label: '正常' },
				{ value: 'abnormal', label: '异常' },
				{ value: 'disabled', label: '禁用' },
				{ value: 'damaged', label: '损坏' }
			],
			
			// 选择器索引
			groupTypeIndex: 0,
			statusIndex: 0,
			
			// 安装日期
			installDate: '',
			
			// 页面状态
			loading: false,
			submitting: false,
			
			// 页面参数
			groupId: 0,
			fromPage: '',
			
			// API配置
			apiBaseUrl: 'http://localhost:8000'
		}
	},
	
	onLoad(options) {
		console.log('=== 修改柜组页面加载 ===');
		console.log('页面参数:', options);
		
		this.groupId = parseInt(options.groupId) || 0;
		this.fromPage = options.from || 'cabinet-group';
		
		if (this.groupId) {
			this.loadGroupInfo();
		} else {
			uni.showModal({
				title: '错误',
				content: '缺少柜组ID参数',
				showCancel: false,
				success: () => {
					uni.navigateBack();
				}
			});
		}
	},
	
	methods: {
		// 返回上一页
		goBack() {
			uni.navigateBack();
		},
		
		// 加载柜组信息
		async loadGroupInfo() {
			this.loading = true;
			
			try {
				const response = await this.requestGroupInfo();
				
				if (response.code === 200 || response.code === '200') {
					const group = response.group;
					
					// 填充表单数据
					this.formData = {
						id: group.id,
						locationPointId: group.location_point_id || group.locationPointId,
						groupName: group.group_name || group.groupName || '',
						groupCode: group.group_code || group.groupCode || '',
						groupType: group.group_type || group.groupType || 'standard',
						status: group.status || 'normal',
						totalCells: group.total_cells || group.totalCells || 0,
						startNo: group.start_no || group.startNo || 1,
						endNo: group.end_no || group.endNo || 0,
						installTime: group.install_time || group.installTime
					};
					
					// 设置选择器索引
					this.setPickerIndexes();
					
					// 设置安装日期
					if (this.formData.installTime) {
						const date = new Date(this.formData.installTime);
						this.installDate = date.toISOString().split('T')[0];
					}
					
					console.log('✅ 柜组信息加载成功:', this.formData);
					
				} else {
					throw new Error(response.msg || '获取柜组信息失败');
				}
				
			} catch (error) {
				console.error('❌ 加载柜组信息失败:', error);
				
				uni.showModal({
					title: '加载失败',
					content: error.message || '无法获取柜组信息，请稍后重试',
					showCancel: false,
					success: () => {
						uni.navigateBack();
					}
				});
			} finally {
				this.loading = false;
			}
		},
		
		// 请求柜组信息API
		requestGroupInfo() {
			return new Promise((resolve, reject) => {
				console.log('=== 请求柜组信息 ===');
				console.log('柜组ID:', this.groupId);
				
				const token = uni.getStorageSync('token') || uni.getStorageSync('adminToken') || '';
				
				uni.request({
					url: `${this.apiBaseUrl}/v1/group/get?id=${this.groupId}`,
					method: 'GET',
					header: {
						'Content-Type': 'application/json',
						'Authorization': token ? `Bearer ${token}` : ''
					},
					timeout: 10000,
					success: (res) => {
						console.log('=== 柜组信息API响应 ===');
						console.log('HTTP状态码:', res.statusCode);
						console.log('响应数据:', res.data);
						
						if (res.statusCode === 200) {
							resolve(res.data);
						} else {
							reject(new Error(`HTTP ${res.statusCode}: ${res.data?.msg || '请求失败'}`));
						}
					},
					fail: (err) => {
						console.error('=== 柜组信息API请求失败 ===');
						console.error('错误:', err);
						
						let errorMessage = '网络请求失败';
						if (err.errMsg) {
							if (err.errMsg.includes('timeout')) {
								errorMessage = '请求超时，请检查网络连接';
							} else if (err.errMsg.includes('fail')) {
								errorMessage = '无法连接到服务器';
							} else {
								errorMessage = err.errMsg;
							}
						}
						
						reject(new Error(errorMessage));
					}
				});
			});
		},
		
		// 设置选择器索引
		setPickerIndexes() {
			// 设置柜组类型索引
			const typeIndex = this.groupTypeOptions.findIndex(item => item.value === this.formData.groupType);
			this.groupTypeIndex = typeIndex >= 0 ? typeIndex : 0;
			
			// 设置状态索引
			const statusIndex = this.statusOptions.findIndex(item => item.value === this.formData.status);
			this.statusIndex = statusIndex >= 0 ? statusIndex : 0;
		},
		
		// 柜组类型选择
		onGroupTypeChange(e) {
			this.groupTypeIndex = e.detail.value;
			this.formData.groupType = this.groupTypeOptions[this.groupTypeIndex].value;
		},
		
		// 状态选择
		onStatusChange(e) {
			this.statusIndex = e.detail.value;
			this.formData.status = this.statusOptions[this.statusIndex].value;
		},
		
		// 安装日期选择
		onInstallDateChange(e) {
			this.installDate = e.detail.value;
			this.formData.installTime = new Date(e.detail.value + 'T00:00:00').toISOString();
		},
		
		// 计算结束编号
		calculateEndNo() {
			if (this.formData.startNo && this.formData.totalCells) {
				this.formData.endNo = this.formData.startNo + this.formData.totalCells - 1;
			}
		},
		
		// 表单验证
		validateForm() {
			if (!this.formData.groupName.trim()) {
				uni.showToast({
					title: '请输入柜组名称',
					icon: 'none'
				});
				return false;
			}
			
			if (!this.formData.groupCode.trim()) {
				uni.showToast({
					title: '请输入柜组编码',
					icon: 'none'
				});
				return false;
			}
			
			if (!this.formData.totalCells || this.formData.totalCells <= 0) {
				uni.showToast({
					title: '请输入有效的总格口数',
					icon: 'none'
				});
				return false;
			}
			
			if (!this.formData.startNo || this.formData.startNo <= 0) {
				uni.showToast({
					title: '请输入有效的起始编号',
					icon: 'none'
				});
				return false;
			}
			
			if (this.formData.startNo >= this.formData.endNo) {
				uni.showToast({
					title: '起始编号必须小于结束编号',
					icon: 'none'
				});
				return false;
			}
			
			return true;
		},
		
		// 提交表单
		async submitForm() {
			if (!this.validateForm()) {
				return;
			}
			
			this.submitting = true;
			
			try {
				const response = await this.requestUpdateGroup();
				
				if (response.code === 200 || response.code === '200') {
					uni.showToast({
						title: '修改成功',
						icon: 'success',
						duration: 2000
					});
					
					// 设置刷新标记
					uni.setStorageSync('shouldRefreshGroupList', true);
					
					// 延迟返回，让用户看到成功提示
					setTimeout(() => {
						uni.navigateBack();
					}, 1500);
					
				} else {
					throw new Error(response.msg || '修改失败');
				}
				
			} catch (error) {
				console.error('❌ 修改柜组失败:', error);
				
				uni.showModal({
					title: '修改失败',
					content: error.message || '修改柜组时发生错误，请稍后重试',
					showCancel: false
				});
			} finally {
				this.submitting = false;
			}
		},
		
		// 请求更新柜组API
		requestUpdateGroup() {
			return new Promise((resolve, reject) => {
				console.log('=== 开始更新柜组 ===');
				
				const token = uni.getStorageSync('token') || uni.getStorageSync('adminToken') || '';
				
				// 构建请求数据
				const requestData = {
					id: this.formData.id,
					location_point_id: this.formData.locationPointId,
					group_name: this.formData.groupName.trim(),
					group_code: this.formData.groupCode.trim(),
					group_type: this.formData.groupType,
					status: this.formData.status,
					total_cells: this.formData.totalCells,
					start_no: this.formData.startNo,
					end_no: this.formData.endNo,
					install_time: this.formData.installTime
				};
				
				console.log('更新请求参数:', requestData);
				console.log('请求URL:', `${this.apiBaseUrl}/v1/group/update`);
				
				uni.request({
					url: `${this.apiBaseUrl}/v1/group/update`,
					method: 'PUT',
					header: {
						'Content-Type': 'application/json',
						'Authorization': token ? `Bearer ${token}` : ''
					},
					data: requestData,
					timeout: 15000,
					success: (res) => {
						console.log('=== 更新柜组API响应 ===');
						console.log('HTTP状态码:', res.statusCode);
						console.log('响应数据:', res.data);
						
						if (res.statusCode === 200) {
							resolve(res.data);
						} else {
							reject(new Error(`HTTP ${res.statusCode}: ${res.data?.msg || '请求失败'}`));
						}
					},
					fail: (err) => {
						console.error('=== 更新柜组API请求失败 ===');
						console.error('错误:', err);
						
						let errorMessage = '网络请求失败';
						if (err.errMsg) {
							if (err.errMsg.includes('timeout')) {
								errorMessage = '请求超时，请检查网络连接';
							} else if (err.errMsg.includes('fail')) {
								errorMessage = '无法连接到服务器';
							} else {
								errorMessage = err.errMsg;
							}
						}
						
						reject(new Error(errorMessage));
					}
				});
			});
		}
	}
}
</script>

<style scoped>
.page {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	min-height: 100vh;
	position: relative;
}

/* 导航栏 */
.navbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 25rpx 30rpx;
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(20rpx);
	border-bottom: 1rpx solid rgba(255, 255, 255, 0.2);
	position: sticky;
	top: 0;
	z-index: 100;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.nav-left {
	flex: 1;
}

.nav-center {
	flex: 2;
	text-align: center;
}

.nav-right {
	flex: 1;
}

.back-button {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 12rpx 20rpx;
	background: linear-gradient(135deg, #667eea, #764ba2);
	border-radius: 25rpx;
	box-shadow: 0 4rpx 15rpx rgba(102, 126, 234, 0.3);
	transition: all 0.3s ease;
}

.back-button:active {
	transform: scale(0.95);
	box-shadow: 0 2rpx 10rpx rgba(102, 126, 234, 0.4);
}

.back-icon {
	font-size: 28rpx;
	color: #ffffff;
	font-weight: bold;
}

.back-text {
	font-size: 26rpx;
	color: #ffffff;
	font-weight: 500;
}

.nav-title {
	font-size: 34rpx;
	font-weight: bold;
	color: #333333;
	background: linear-gradient(135deg, #667eea, #764ba2);
	background-clip: text;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}

/* 表单容器 */
.form-container {
	padding: 30rpx;
	padding-bottom: 150rpx;
}

/* 表单卡片 */
.form-card {
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(20rpx);
	border-radius: 25rpx;
	padding: 30rpx;
	margin-bottom: 25rpx;
	box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
	border: 1rpx solid rgba(255, 255, 255, 0.3);
}

.card-header {
	margin-bottom: 30rpx;
	padding-bottom: 20rpx;
	border-bottom: 2rpx solid rgba(102, 126, 234, 0.1);
}

.card-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
	background: linear-gradient(135deg, #667eea, #764ba2);
	background-clip: text;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}

/* 表单组 */
.form-group {
	margin-bottom: 30rpx;
}

.form-label {
	display: block;
	font-size: 28rpx;
	color: #333333;
	font-weight: 600;
	margin-bottom: 15rpx;
}

.form-input {
	width: 100%;
	padding: 25rpx 20rpx;
	background: rgba(102, 126, 234, 0.05);
	border: 2rpx solid rgba(102, 126, 234, 0.1);
	border-radius: 15rpx;
	font-size: 28rpx;
	color: #333333;
	transition: all 0.3s ease;
}

.form-input:focus {
	border-color: #667eea;
	background: rgba(102, 126, 234, 0.1);
}

.form-input.readonly {
	background: rgba(0, 0, 0, 0.05);
	color: #999999;
}

.form-hint {
	display: block;
	font-size: 22rpx;
	color: #999999;
	margin-top: 10rpx;
}

/* 选择器 */
.picker-input {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 25rpx 20rpx;
	background: rgba(102, 126, 234, 0.05);
	border: 2rpx solid rgba(102, 126, 234, 0.1);
	border-radius: 15rpx;
	transition: all 0.3s ease;
}

.picker-input:active {
	background: rgba(102, 126, 234, 0.1);
	border-color: #667eea;
}

.picker-text {
	font-size: 28rpx;
	color: #333333;
	flex: 1;
}

.picker-arrow {
	font-size: 20rpx;
	color: #667eea;
	font-weight: bold;
}

/* 底部操作按钮 */
.bottom-actions {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	gap: 20rpx;
	padding: 30rpx;
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(20rpx);
	border-top: 1rpx solid rgba(255, 255, 255, 0.2);
	box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.action-btn {
	flex: 1;
	padding: 30rpx 20rpx;
	border-radius: 20rpx;
	border: none;
	font-size: 28rpx;
	font-weight: 600;
	transition: all 0.3s ease;
	box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.1);
}

.action-btn:active {
	transform: translateY(-2rpx);
	box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.15);
}

.cancel-btn {
	background: rgba(0, 0, 0, 0.1);
	color: #666666;
}

.submit-btn {
	background: linear-gradient(135deg, #667eea, #764ba2);
	color: #ffffff;
}

.submit-btn:disabled {
	opacity: 0.6;
	transform: none;
}

.btn-text {
	font-size: 28rpx;
	font-weight: 600;
}

/* 加载遮罩 */
.loading-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.6);
	backdrop-filter: blur(10rpx);
	z-index: 1000;
	display: flex;
	align-items: center;
	justify-content: center;
}

.loading-content {
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(20rpx);
	padding: 40rpx 60rpx;
	border-radius: 20rpx;
	box-shadow: 0 15rpx 40rpx rgba(0, 0, 0, 0.2);
}

.loading-text {
	font-size: 28rpx;
	color: #333333;
	font-weight: 500;
}

/* 动画效果 */
@keyframes fadeInUp {
	from {
		opacity: 0;
		transform: translateY(30rpx);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.form-card {
	animation: fadeInUp 0.6s ease-out;
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
	.bottom-actions {
		flex-direction: column;
	}
	
	.nav-title {
		font-size: 30rpx;
	}
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
	.page {
		background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
	}
	
	.navbar {
		background: rgba(45, 55, 72, 0.95);
	}
	
	.nav-title {
		color: #e2e8f0;
	}
	
	.form-card {
		background: rgba(45, 55, 72, 0.95);
		border: 1rpx solid rgba(255, 255, 255, 0.1);
	}
	
	.card-title {
		color: #e2e8f0;
	}
	
	.form-label {
		color: #e2e8f0;
	}
	
	.form-input {
		background: rgba(255, 255, 255, 0.1);
		color: #e2e8f0;
		border-color: rgba(255, 255, 255, 0.2);
	}
	
	.picker-text {
		color: #e2e8f0;
	}
}
</style>