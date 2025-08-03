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
				<text class="nav-title">添加柜组</text>
			</view>
			<view class="nav-right">
				<view class="nav-action" @click="resetForm">
					<text class="nav-icon">⟲</text>
				</view>
			</view>
		</view>

		<!-- 寄存点信息 -->
		<view class="location-info">
			<view class="location-icon">📍</view>
			<view class="location-content">
				<text class="location-label">当前寄存点</text>
				<text class="location-text">{{ currentLocation }}</text>
			</view>
		</view>

		<!-- 表单内容 -->
		<view class="form-container">
			<view class="form-section">
				<text class="section-title">基本信息</text>
				
				<view class="form-item">
					<text class="form-label">柜组名称</text>
					<input 
						class="form-input" 
						v-model="formData.groupName" 
						placeholder="请输入柜组名称（如：A组、B组）"
						maxlength="20"
					/>
				</view>
				
				<view class="form-item">
					<text class="form-label">柜组编码</text>
					<input 
						class="form-input" 
						v-model="formData.groupCode" 
						placeholder="请输入柜组编码（如：GROUP001）"
						maxlength="32"
					/>
				</view>
				
				<view class="form-item">
					<text class="form-label">柜组类型</text>
					<picker 
						:value="formData.groupTypeIndex" 
						:range="groupTypeOptions" 
						range-key="label"
						@change="onGroupTypeChange"
					>
						<view class="form-picker">
							<text class="picker-text">{{ groupTypeOptions[formData.groupTypeIndex].label }}</text>
							<text class="picker-arrow">▼</text>
						</view>
					</picker>
				</view>
			</view>

			<view class="form-section">
				<text class="section-title">格口配置</text>
				
				<view class="form-row">
					<view class="form-item half">
						<text class="form-label">总格口数</text>
						<input 
							class="form-input" 
							v-model.number="formData.totalCells" 
							placeholder="总格口数"
							type="number"
							maxlength="3"
							@input="calculateEndNo"
						/>
					</view>
					
					<view class="form-item half">
						<text class="form-label">起始编号</text>
						<input 
							class="form-input" 
							v-model.number="formData.startNo" 
							placeholder="起始编号"
							type="number"
							maxlength="3"
							@input="calculateEndNo"
						/>
					</view>
				</view>
				
				<view class="form-item">
					<text class="form-label">结束编号</text>
					<input 
						class="form-input calculated" 
						v-model.number="formData.endNo" 
						placeholder="结束编号（自动计算）"
						type="number"
						readonly
					/>
				</view>
			</view>

			<view class="form-section">
				<text class="section-title">安装信息</text>
				
				<view class="form-item">
					<text class="form-label">安装时间</text>
					<picker 
						mode="date" 
						:value="formData.installDate"
						@change="onInstallDateChange"
					>
						<view class="form-picker">
							<text class="picker-text">{{ formData.installDate || '请选择安装时间' }}</text>
							<text class="picker-arrow">▼</text>
						</view>
					</picker>
				</view>
			</view>
		</view>

		<!-- 底部操作按钮 -->
		<view class="bottom-actions" @click.stop>
			<button class="action-btn cancel-btn" @click.stop="handleCancelClick" type="button">取消</button>
			<button class="action-btn confirm-btn" @click.stop="handleConfirmClick" :disabled="!canSubmit" type="button">确定添加</button>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			// 页面参数
			fromPage: '',
			currentLocation: '',
			currentLocationId: null,
			
			// 表单数据
			formData: {
				groupName: '',
				groupCode: '',
				groupTypeIndex: 0,
				totalCells: '',
				startNo: '',
				endNo: '',
				installDate: ''
			},
			
			// 柜组类型选项
			groupTypeOptions: [
				{ label: '标准柜组', value: 'standard' },
				{ label: '冷藏柜组', value: 'refrigerated' },
				{ label: '超大柜组', value: 'oversize' }
			],
			
			// API配置
			apiBaseUrl: 'http://localhost:8000'
		}
	},
	
	computed: {
		// 检查是否可以提交表单
		canSubmit() {
			return this.formData.groupName.trim() && 
				   this.formData.groupCode.trim() && 
				   this.formData.totalCells > 0 && 
				   this.formData.startNo > 0 && 
				   this.formData.endNo > 0 &&
				   this.currentLocationId;
		}
	},
	
	onLoad(options) {
		console.log('添加柜组页面加载:', options);
		
		this.fromPage = options.from || 'cabinet-group';
		
		// 初始化寄存点信息
		this.initLocationInfo();
		
		// 设置默认安装时间为今天
		const today = new Date();
		this.formData.installDate = today.toISOString().split('T')[0];
	},
	
	methods: {
		// 返回上一页
		goBack() {
			console.log('顶部返回按钮被点击');
			uni.navigateBack();
		},
		
		// 初始化寄存点信息
		initLocationInfo() {
			const savedLocationId = uni.getStorageSync('selectedLocationId');
			const savedLocationName = uni.getStorageSync('selectedLocationName');
			
			if (savedLocationId && savedLocationName) {
				this.currentLocationId = parseInt(savedLocationId);
				this.currentLocation = savedLocationName;
				console.log('当前寄存点:', this.currentLocation, this.currentLocationId);
			} else {
				this.currentLocationId = null;
				this.currentLocation = '未选择寄存点';
				
				uni.showModal({
					title: '提示',
					content: '请先选择要管理的寄存点',
					showCancel: false,
					success: () => {
						uni.navigateBack();
					}
				});
			}
		},
		
		// 柜组类型选择变化
		onGroupTypeChange(e) {
			this.formData.groupTypeIndex = e.detail.value;
		},
		
		// 安装时间选择变化
		onInstallDateChange(e) {
			this.formData.installDate = e.detail.value;
		},
		
		// 计算结束编号
		calculateEndNo() {
			if (this.formData.totalCells > 0 && this.formData.startNo > 0) {
				this.formData.endNo = parseInt(this.formData.startNo) + parseInt(this.formData.totalCells) - 1;
			} else {
				this.formData.endNo = '';
			}
		},
		
		// 重置表单
		resetForm() {
			this.formData = {
				groupName: '',
				groupCode: '',
				groupTypeIndex: 0,
				totalCells: '',
				startNo: '',
				endNo: '',
				installDate: new Date().toISOString().split('T')[0]
			};
			
			uni.showToast({
				title: '表单已重置',
				icon: 'success',
				duration: 1000
			});
		},
		
		// 处理取消按钮点击
		handleCancelClick(e) {
			console.log('取消按钮点击事件:', e);
			e.stopPropagation();
			e.preventDefault();
			this.cancelAdd();
		},
		
		// 处理确认按钮点击
		handleConfirmClick(e) {
			console.log('确认按钮点击事件:', e);
			e.stopPropagation();
			e.preventDefault();
			this.confirmAdd();
		},
		
		// 取消添加
		cancelAdd() {
			console.log('取消添加按钮被点击');
			uni.showModal({
				title: '确认取消',
				content: '确定要取消添加柜组吗？已填写的信息将丢失。',
				success: (res) => {
					if (res.confirm) {
						console.log('用户确认取消，返回上一页');
						uni.navigateBack();
					} else {
						console.log('用户取消了取消操作');
					}
				}
			});
		},
		
		// 确认添加
		async confirmAdd() {
			console.log('确认添加按钮被点击');
			if (!this.canSubmit) {
				console.log('表单验证失败，无法提交');
				uni.showToast({
					title: '请填写完整信息',
					icon: 'none'
				});
				return;
			}
			
			try {
				uni.showLoading({
					title: '添加中...',
					mask: true
				});
				
				const result = await this.createGroupAPI();
				
				uni.hideLoading();
				
				if (result.code === 200) {
					uni.showToast({
						title: '添加成功',
						icon: 'success',
						duration: 1500
					});
					
					// 设置刷新标志，让柜组列表页面知道需要刷新
					uni.setStorageSync('shouldRefreshGroupList', true);
					
					// 延迟返回上一页，让用户看到成功提示
					setTimeout(() => {
						uni.navigateBack();
					}, 1500);
				} else {
					uni.showToast({
						title: result.msg || '添加失败',
						icon: 'none',
						duration: 2000
					});
				}
			} catch (error) {
				uni.hideLoading();
				console.error('添加柜组失败:', error);
				uni.showToast({
					title: error.message || '添加失败',
					icon: 'none',
					duration: 2000
				});
			}
		},
		
		// 调用后端创建柜组API
		createGroupAPI() {
			return new Promise((resolve, reject) => {
				console.log('=== 开始创建柜组 ===');
				
				// 获取token
				const token = uni.getStorageSync('token') || uni.getStorageSync('adminToken') || '';
				
				// 构建请求数据
				const requestData = {
					location_point_id: this.currentLocationId,
					group_name: this.formData.groupName.trim(),
					group_code: this.formData.groupCode.trim(),
					group_type: this.groupTypeOptions[this.formData.groupTypeIndex].value,
					total_cells: parseInt(this.formData.totalCells),
					start_no: parseInt(this.formData.startNo),
					end_no: parseInt(this.formData.endNo),
					install_time: new Date(this.formData.installDate + 'T00:00:00Z').toISOString()
				};
				
				console.log('创建柜组请求数据:', requestData);
				console.log('请求URL:', `${this.apiBaseUrl}/v1/group/create`);
				
				uni.request({
					url: `${this.apiBaseUrl}/v1/group/create`,
					method: 'POST',
					header: {
						'Content-Type': 'application/json',
						'Authorization': token ? `Bearer ${token}` : ''
					},
					data: requestData,
					timeout: 15000,
					success: (res) => {
						console.log('=== 创建柜组API响应 ===');
						console.log('HTTP状态码:', res.statusCode);
						console.log('响应数据:', res.data);
						
						if (res.statusCode === 200) {
							if (res.data && typeof res.data === 'object') {
								resolve(res.data);
							} else {
								reject(new Error('响应数据格式错误'));
							}
						} else {
							reject(new Error(`HTTP ${res.statusCode}: ${res.data?.msg || '请求失败'}`));
						}
					},
					fail: (err) => {
						console.error('=== 创建柜组API请求失败 ===');
						console.error('错误对象:', err);
						
						let errorMessage = '网络请求失败';
						if (err.errMsg) {
							if (err.errMsg.includes('timeout')) {
								errorMessage = '请求超时，请检查网络连接';
							} else if (err.errMsg.includes('fail')) {
								errorMessage = '无法连接到服务器，请检查后端服务是否启动';
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
	padding-bottom: 120rpx;
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
	display: flex;
	align-items: center;
	justify-content: flex-end;
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

.nav-action {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(102, 126, 234, 0.1);
	border-radius: 50%;
	transition: all 0.3s ease;
}

.nav-action:active {
	transform: scale(0.9);
	background: rgba(102, 126, 234, 0.2);
}

.nav-icon {
	font-size: 28rpx;
	color: #667eea;
}

/* 寄存点信息 */
.location-info {
	display: flex;
	align-items: center;
	gap: 15rpx;
	padding: 25rpx 30rpx;
	margin: 20rpx 30rpx;
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(20rpx);
	border-radius: 20rpx;
	box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.1);
	border: 1rpx solid rgba(255, 255, 255, 0.3);
}

.location-icon {
	font-size: 32rpx;
	color: #667eea;
}

.location-content {
	display: flex;
	flex-direction: column;
	gap: 6rpx;
}

.location-label {
	font-size: 22rpx;
	color: #999999;
	font-weight: 500;
}

.location-text {
	font-size: 28rpx;
	color: #333333;
	font-weight: 600;
}

/* 表单容器 */
.form-container {
	padding: 0 30rpx;
}

.form-section {
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(20rpx);
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.1);
	border: 1rpx solid rgba(255, 255, 255, 0.3);
}

.section-title {
	font-size: 30rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 25rpx;
	padding-bottom: 15rpx;
	border-bottom: 2rpx solid rgba(102, 126, 234, 0.1);
}

.form-item {
	margin-bottom: 25rpx;
}

.form-item:last-child {
	margin-bottom: 0;
}

.form-label {
	display: block;
	font-size: 26rpx;
	color: #333333;
	font-weight: 500;
	margin-bottom: 12rpx;
}

.form-input {
	width: 100%;
	padding: 20rpx;
	border: 2rpx solid rgba(102, 126, 234, 0.2);
	border-radius: 12rpx;
	font-size: 28rpx;
	color: #333333;
	background: rgba(255, 255, 255, 0.8);
	transition: all 0.3s ease;
}

.form-input:focus {
	border-color: #667eea;
	background: rgba(255, 255, 255, 1);
	box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
}

.form-input.calculated {
	background: rgba(102, 126, 234, 0.05);
	color: #667eea;
	font-weight: 500;
}

.form-picker {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx;
	border: 2rpx solid rgba(102, 126, 234, 0.2);
	border-radius: 12rpx;
	background: rgba(255, 255, 255, 0.8);
	transition: all 0.3s ease;
}

.form-picker:active {
	border-color: #667eea;
	background: rgba(255, 255, 255, 1);
}

.picker-text {
	font-size: 28rpx;
	color: #333333;
}

.picker-arrow {
	font-size: 20rpx;
	color: #667eea;
	font-weight: bold;
}

/* 表单行 */
.form-row {
	display: flex;
	gap: 20rpx;
}

.form-item.half {
	flex: 1;
}

/* 底部操作按钮 */
.bottom-actions {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	gap: 20rpx;
	padding: 25rpx 30rpx;
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(20rpx);
	border-top: 1rpx solid rgba(255, 255, 255, 0.2);
	box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
	z-index: 1000;
}

.action-btn {
	flex: 1;
	padding: 25rpx;
	border-radius: 15rpx;
	font-size: 30rpx;
	font-weight: 600;
	border: none;
	transition: all 0.3s ease;
	position: relative;
	z-index: 1001;
}

.cancel-btn {
	background: rgba(153, 153, 153, 0.1);
	color: #666666;
	border: 2rpx solid rgba(153, 153, 153, 0.3);
}

.cancel-btn:active {
	transform: scale(0.98);
	background: rgba(153, 153, 153, 0.2);
}

.confirm-btn {
	background: linear-gradient(135deg, #667eea, #764ba2);
	color: #ffffff;
	box-shadow: 0 6rpx 20rpx rgba(102, 126, 234, 0.3);
}

.confirm-btn:active {
	transform: scale(0.98);
	box-shadow: 0 4rpx 15rpx rgba(102, 126, 234, 0.4);
}

.confirm-btn:disabled {
	background: rgba(153, 153, 153, 0.3);
	color: rgba(255, 255, 255, 0.5);
	box-shadow: none;
}

.confirm-btn:disabled:active {
	transform: none;
}
</style>