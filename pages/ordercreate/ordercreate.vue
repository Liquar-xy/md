<template>
	<view class="order-create">
		<view class="header">
			<text class="title">创建订单</text>
			
		</view>
		
		<form @submit="handleSubmit" class="order-form">
			<!-- 用户信息 -->
			<view class="form-section">
				<text class="section-title">用户信息</text>
				<view class="form-item">
					<text class="label">用户ID</text>
					<input v-model="orderForm.userId" type="number" placeholder="请输入用户ID" class="input" />
				</view>
			</view>
			
			<!-- 柜子信息 -->
			<view class="form-section">
				<text class="section-title">柜子信息</text>
				<view class="form-item">
					<text class="label">柜子ID</text>
					<input v-model="orderForm.cabinetId" type="number" placeholder="请输入柜子ID" class="input" @blur="checkCabinetAvailability" />
					<view v-if="cabinetCheckStatus" class="cabinet-status" :class="cabinetCheckStatus.type">
						<text class="status-text">{{cabinetCheckStatus.message}}</text>
					</view>
				</view>
				<view class="form-item">
					<text class="label">存储点ID</text>
					<input v-model="orderForm.lockerPointId" type="number" placeholder="请输入存储点ID" class="input" />
				</view>
				<view class="form-item">
					<text class="label">存储位置名称</text>
					<input v-model="orderForm.storageLocationName" type="text" placeholder="请输入存储位置名称" class="input" />
				</view>
				<view class="form-item">
					<text class="label">柜子类型ID</text>
					<input v-model="orderForm.typeId" type="number" placeholder="请输入柜子类型ID" class="input" />
				</view>
			</view>
			
			<!-- 订单信息 -->
			<view class="form-section">
				<text class="section-title">订单信息</text>
				<view class="form-item">
					<text class="label">订单标题</text>
					<input v-model="orderForm.title" type="text" placeholder="请输入订单标题" class="input" />
				</view>
				<view class="form-item">
					<text class="label">预定时长(分钟)</text>
					<input v-model="orderForm.scheduledDuration" type="number" placeholder="请输入预定时长" class="input" />
				</view>
				<view class="form-item">
					<text class="label">价格</text>
					<input v-model="orderForm.price" type="number" step="0.01" placeholder="请输入价格" class="input" />
				</view>
				<view class="form-item">
					<text class="label">折扣</text>
					<input v-model="orderForm.discount" type="number" step="0.01" placeholder="请输入折扣" class="input" />
				</view>
				<view class="form-item">
					<text class="label">实付金额</text>
					<input v-model="orderForm.amountPaid" type="number" step="0.01" placeholder="请输入实付金额" class="input" />
				</view>
			</view>
			
			<!-- 状态信息 -->
			<view class="form-section">
				<text class="section-title">状态信息</text>
				<view class="form-item">
					<text class="label">订单状态</text>
					<picker @change="onStatusChange" :value="statusIndex" :range="statusOptions">
						<view class="picker">
							{{statusOptions[statusIndex]}}
						</view>
					</picker>
				</view>
				<view class="form-item">
					<text class="label">押金状态</text>
					<picker @change="onDepositStatusChange" :value="depositStatusIndex" :range="depositStatusOptions">
						<view class="picker">
							{{depositStatusOptions[depositStatusIndex]}}
						</view>
					</picker>
				</view>
			</view>
			
			<!-- 提交按钮 -->
			<view class="form-actions">
				<button @click="handleSubmit" :disabled="isSubmitting" class="submit-btn">
					{{isSubmitting ? '创建中...' : '创建订单'}}
				</button>
				<button @click="handleReset" class="reset-btn">重置</button>
				<button @click="goToIndex" class="index-btn">返回首页</button>
			</view>
		</form>
		
		<!-- 加载提示 -->
		<view v-if="isSubmitting" class="loading-overlay">
			<view class="loading-content">
				<text>正在创建订单...</text>
			</view>
		</view>
	</view>
</template>

<script>
	import apiConfig from '@/config/api.js'
	
	export default {
		data() {
			return {
				isSubmitting: false,
				statusIndex: 0,
				depositStatusIndex: 0,
				statusOptions: ['待支付', '已支付', '使用中', '已完成', '已取消'],
				depositStatusOptions: ['未支付', '已支付', '已退还'],
				cabinetCheckStatus: null, // 柜子状态检查结果
				orderForm: {
					userId: '',
					cabinetId: '',
					lockerPointId: '',
					storageLocationName: '',
					typeId: '',
					title: '',
					scheduledDuration: '',
					price: '',
					discount: 0,
					amountPaid: '',
					status: 0,
					depositStatus: 0
					// 注意：orderId由后端自动生成，不需要前端提供
				}
			}
		},
		methods: {
			// 状态选择器变化
			onStatusChange(e) {
				this.statusIndex = e.detail.value
				this.orderForm.status = parseInt(e.detail.value)
			},
			
			// 押金状态选择器变化
			onDepositStatusChange(e) {
				this.depositStatusIndex = e.detail.value
				this.orderForm.depositStatus = parseInt(e.detail.value)
			},
			
			// 表单验证
			validateForm() {
				const required = ['userId', 'cabinetId', 'lockerPointId', 'storageLocationName', 'typeId', 'title', 'scheduledDuration', 'price', 'amountPaid']
				
				for (let field of required) {
					if (!this.orderForm[field] || this.orderForm[field] === '') {
						uni.showToast({
							title: `请填写${this.getFieldLabel(field)}`,
							icon: 'none'
						})
						return false
					}
				}
				
				// 验证数值类型
				if (this.orderForm.scheduledDuration <= 0) {
					uni.showToast({
						title: '预定时长必须大于0分钟',
						icon: 'none'
					})
					return false
				}
				
				if (this.orderForm.price <= 0) {
					uni.showToast({
						title: '价格必须大于0',
						icon: 'none'
					})
					return false
				}
				
				if (this.orderForm.amountPaid <= 0) {
					uni.showToast({
						title: '实付金额必须大于0',
						icon: 'none'
					})
					return false
				}
				
				// 验证实付金额不能超过原价
				const finalPrice = this.orderForm.price - (this.orderForm.discount || 0)
				if (this.orderForm.amountPaid > finalPrice) {
					uni.showToast({
						title: '实付金额不能超过折后价格',
						icon: 'none'
					})
					return false
				}
				
				return true
			},
			
			// 获取字段标签
			getFieldLabel(field) {
				const labels = {
					userId: '用户ID',
					cabinetId: '柜子ID',
					lockerPointId: '存储点ID',
					storageLocationName: '存储位置名称',
					typeId: '柜子类型ID',
					title: '订单标题',
					scheduledDuration: '预定时长',
					price: '价格',
					amountPaid: '实付金额'
				}
				return labels[field] || field
			},
			
			// 提交订单
			async handleSubmit() {
				if (!this.validateForm()) {
					return
				}
				
				this.isSubmitting = true
				
				try {
					// 准备请求数据，确保数据类型正确
					const requestData = {
						userId: parseInt(this.orderForm.userId),
						cabinetId: parseInt(this.orderForm.cabinetId),
						lockerPointId: parseInt(this.orderForm.lockerPointId),
						storageLocationName: this.orderForm.storageLocationName,
						typeId: parseInt(this.orderForm.typeId),
						title: this.orderForm.title,
						scheduledDuration: parseInt(this.orderForm.scheduledDuration),
						price: parseFloat(this.orderForm.price),
						discount: parseFloat(this.orderForm.discount) || 0,
						amountPaid: parseFloat(this.orderForm.amountPaid),
						status: this.orderForm.status,
						depositStatus: this.orderForm.depositStatus
						// 注意：orderId由后端自动生成，不需要传递
					}
					
					const response = await this.createOrder(requestData)
					
					if (response.success) {
						uni.showToast({
							title: '订单创建成功',
							icon: 'success'
						})
						
						// 延迟跳转，让用户看到成功提示
						setTimeout(() => {
							uni.navigateBack()
						}, 1500)
					} else {
						throw new Error(response.message || '创建订单失败')
					}
					
				} catch (error) {
					console.error('创建订单失败:', error)
					
					// 处理特定的后端错误
					let errorMessage = '创建订单失败'
					if (error.message.includes('DAILY_LIMIT_EXCEEDED')) {
						errorMessage = '订单数量上限，请等待再试'
					} else if (error.message.includes('CabinetId already exists')) {
						errorMessage = '该柜子已被占用，请选择其他柜子'
					} else if (error.message.includes('create order failed')) {
						errorMessage = '订单创建失败，请检查输入信息'
					} else if (error.message) {
						errorMessage = error.message
					}
					
					uni.showToast({
						title: errorMessage,
						icon: 'none',
						duration: 3000
					})
				} finally {
					this.isSubmitting = false
				}
			},
			
			// 调用创建订单API
			createOrder(data) {
				return new Promise((resolve, reject) => {
					console.log('发送订单创建请求:', data)
					
					uni.request({
						url: `http://127.0.0.1:8000/v1/order/create`,
						method: 'POST',
						data: data,
						header: {
							'Content-Type': 'application/json'
						},
						timeout: apiConfig.timeout,
						success: (res) => {
							console.log('订单创建响应:', res)
							
							if (res.statusCode === 200) {
								// 检查后端返回的消息
								if (res.data && res.data.msg) {
									resolve({
										success: true,
										data: res.data,
										message: res.data.msg
									})
								} else {
									resolve({
										success: true,
										data: res.data,
										message: '订单创建成功'
									})
								}
							} else {
								// 处理HTTP错误状态码
								const errorMsg = res.data?.message || res.data?.msg || '请求失败'
								reject(new Error(errorMsg))
							}
						},
						fail: (err) => {
							console.error('网络请求失败:', err)
							reject(new Error('网络连接失败，请检查网络设置'))
						}
					})
				})
			},
			
			// 检查柜子可用性
			async checkCabinetAvailability() {
				if (!this.orderForm.cabinetId) {
					this.cabinetCheckStatus = null
					return
				}
				
				try {
					// 这里可以调用后端API检查柜子状态
					// 暂时使用模拟逻辑
					this.cabinetCheckStatus = {
						type: 'checking',
						message: '正在检查柜子状态...'
					}
					
					// 模拟API调用延迟
					setTimeout(() => {
						// 这里应该调用实际的API
						// 现在使用随机结果模拟
						const isAvailable = Math.random() > 0.3 // 70%概率可用
						
						if (isAvailable) {
							this.cabinetCheckStatus = {
								type: 'available',
								message: '✓ 柜子可用'
							}
						} else {
							this.cabinetCheckStatus = {
								type: 'occupied',
								message: '✗ 柜子已被占用'
							}
						}
					}, 1000)
					
				} catch (error) {
					this.cabinetCheckStatus = {
						type: 'error',
						message: '检查失败，请稍后重试'
					}
				}
			},
			
			// 重置表单
			handleReset() {
				this.orderForm = {
					userId: '',
					cabinetId: '',
					lockerPointId: '',
					storageLocationName: '',
					typeId: '',
					title: '',
					scheduledDuration: '',
					price: '',
					discount: 0,
					amountPaid: '',
					status: 0,
					depositStatus: 0
				}
				this.statusIndex = 0
				this.depositStatusIndex = 0
				this.cabinetCheckStatus = null
				
				uni.showToast({
					title: '表单已重置',
					icon: 'success'
				})
			},
			
			// 跳转到首页
			goToIndex() {
				uni.navigateTo({
					url: '/pages/index/index'
				})
			}
		},
		
		onLoad() {
			// 页面加载时的初始化操作
			console.log('订单创建页面加载')
		}
	}
</script>

<style>
	.order-create {
		padding: 20rpx;
		background-color: #f5f5f5;
		min-height: 100vh;
	}
	
	.header {
		text-align: center;
		margin-bottom: 30rpx;
	}
	
	.title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
	}
	
	.tips {
		background-color: #f0f8ff;
		border-radius: 8rpx;
		padding: 20rpx;
		margin: 0 20rpx;
	}
	
	.tip-text {
		display: block;
		font-size: 24rpx;
		color: #666;
		margin-bottom: 8rpx;
		text-align: left;
	}
	
	.tip-text:last-child {
		margin-bottom: 0;
	}
	
	.order-form {
		background-color: #fff;
		border-radius: 10rpx;
		padding: 30rpx;
	}
	
	.form-section {
		margin-bottom: 40rpx;
	}
	
	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
		display: block;
		border-left: 4rpx solid #007aff;
		padding-left: 15rpx;
	}
	
	.form-item {
		margin-bottom: 25rpx;
	}
	
	.label {
		display: block;
		font-size: 28rpx;
		color: #666;
		margin-bottom: 10rpx;
	}
	
	.input {
		width: 100%;
		height: 80rpx;
		border: 2rpx solid #e0e0e0;
		border-radius: 8rpx;
		padding: 0 20rpx;
		font-size: 28rpx;
		box-sizing: border-box;
	}
	
	.input:focus {
		border-color: #007aff;
	}
	
	.picker {
		height: 80rpx;
		line-height: 80rpx;
		border: 2rpx solid #e0e0e0;
		border-radius: 8rpx;
		padding: 0 20rpx;
		font-size: 28rpx;
		background-color: #fff;
	}
	
	.form-actions {
		margin-top: 50rpx;
		display: flex;
		gap: 20rpx;
	}
	
	.submit-btn {
		flex: 1;
		height: 80rpx;
		background-color: #007aff;
		color: #fff;
		border: none;
		border-radius: 8rpx;
		font-size: 30rpx;
	}
	
	.submit-btn:disabled {
		background-color: #ccc;
	}
	
	.reset-btn {
		flex: 1;
		height: 80rpx;
		background-color: #f0f0f0;
		color: #333;
		border: none;
		border-radius: 8rpx;
		font-size: 30rpx;
	}
	
	.index-btn {
		flex: 1;
		height: 80rpx;
		background-color: #28a745;
		color: #fff;
		border: none;
		border-radius: 8rpx;
		font-size: 30rpx;
	}
	
	.loading-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 9999;
	}
	
	.loading-content {
		background-color: #fff;
		padding: 40rpx;
		border-radius: 10rpx;
		text-align: center;
	}
	
	.cabinet-status {
		margin-top: 10rpx;
		padding: 8rpx 12rpx;
		border-radius: 4rpx;
		font-size: 24rpx;
	}
	
	.cabinet-status.available {
		background-color: #e8f5e8;
		color: #4caf50;
	}
	
	.cabinet-status.occupied {
		background-color: #ffeaea;
		color: #f44336;
	}
	
	.cabinet-status.checking {
		background-color: #fff3cd;
		color: #856404;
	}
	
	.cabinet-status.error {
		background-color: #f8d7da;
		color: #721c24;
	}
	
	.status-text {
		font-size: 24rpx;
	}
</style>
