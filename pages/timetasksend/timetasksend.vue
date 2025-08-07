<template>
	<view class="remind-task-page">
		<view class="header">
			<text class="title">定时任务到期提醒</text>
			<view class="tips">
				<text class="tip-text">• 处理寄存订单的到期提醒任务</text>
				<text class="tip-text">• 仅对"寄存中"状态的订单发送提醒</text>
				<text class="tip-text">• 支持短信通知用户</text>
			</view>
		</view>
		
		<form @submit="handleSubmit" class="remind-form">
			<!-- 任务信息 -->
			<view class="form-section">
				<text class="section-title">任务信息</text>
				<view class="form-item">
					<text class="label">任务ID</text>
					<input v-model="remindForm.id" type="number" placeholder="请输入任务ID" class="input" />
				</view>
				<view class="form-item">
					<text class="label">任务类型</text>
					<picker @change="onTaskTypeChange" :value="taskTypeIndex" :range="taskTypeOptions">
						<view class="picker">
							{{taskTypeOptions[taskTypeIndex]}}
						</view>
					</picker>
				</view>
				<view class="form-item">
					<text class="label">任务状态</text>
					<picker @change="onStatusChange" :value="statusIndex" :range="statusOptions">
						<view class="picker">
							{{statusOptions[statusIndex]}}
						</view>
					</picker>
				</view>
			</view>
			
			<!-- 用户信息 -->
			<view class="form-section">
				<text class="section-title">用户信息</text>
				<view class="form-item">
					<text class="label">手机号码</text>
					<input v-model="remindForm.mobile" type="text" placeholder="请输入手机号码" class="input" />
				</view>
			</view>
			
			<!-- 提交按钮 -->
			<view class="form-actions">
				<button @click="handleSubmit" :disabled="isSubmitting" class="submit-btn">
					{{isSubmitting ? '处理中...' : '发送提醒'}}
				</button>
				<button @click="handleReset" class="reset-btn">重置</button>
				<button @click="goToIndex" class="index-btn">返回首页</button>
			</view>
		</form>
		
		<!-- 处理结果 -->
		<view v-if="lastResult" class="result-section">
			<text class="result-title">处理结果</text>
			<view class="result-content" :class="lastResult.success ? 'success' : 'error'">
				<text class="result-text">{{lastResult.message}}</text>
				<text v-if="lastResult.details" class="result-details">{{lastResult.details}}</text>
			</view>
		</view>
		
		<!-- 加载提示 -->
		<view v-if="isSubmitting" class="loading-overlay">
			<view class="loading-content">
				<text>正在处理提醒任务...</text>
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
				taskTypeIndex: 0,
				statusIndex: 0,
				taskTypeOptions: ['remind', 'check', 'handle'],
				statusOptions: ['待执行', '执行中', '已完成', '执行失败'],
				lastResult: null, // 存储最后一次处理结果
				remindForm: {
					id: '',
					task_type: 'remind',
					status: 1,
					mobile: ''
				}
			}
		},
		onLoad(options) {
			// 页面加载时的初始化操作
			console.log('定时任务提醒页面加载', options)
			
			// 从页面参数中获取订单信息
			if (options.orderId) {
				this.remindForm.id = options.orderId
				console.log('接收到订单ID:', options.orderId)
			}
			
			if (options.orderNumber) {
				console.log('接收到订单号:', options.orderNumber)
			}
			
			// 检查是否是到期提醒类型
			if (options.type === 'expire') {
				console.log('这是到期提醒任务')
				// 可以根据需要设置特定的任务类型或其他配置
				this.remindForm.task_type = 'remind'
				this.taskTypeIndex = 0
			}
		},
		methods: {
			// 任务类型选择器变化
			onTaskTypeChange(e) {
				this.taskTypeIndex = e.detail.value
				this.remindForm.task_type = this.taskTypeOptions[e.detail.value]
			},
			
			// 状态选择器变化
			onStatusChange(e) {
				this.statusIndex = e.detail.value
				this.remindForm.status = parseInt(e.detail.value) + 1 // 状态从1开始
			},
			
			// 表单验证
			validateForm() {
				// 验证任务ID
				if (!this.remindForm.id || this.remindForm.id <= 0) {
					uni.showToast({
						title: '请输入有效的任务ID',
						icon: 'none'
					})
					return false
				}
				
				// 验证手机号码格式
				if (this.remindForm.mobile) {
					const mobileRegex = /^1[3-9]\d{9}$/
					if (!mobileRegex.test(this.remindForm.mobile)) {
						uni.showToast({
							title: '请输入正确的手机号码',
							icon: 'none'
						})
						return false
					}
				}
				
				return true
			},
			
			// 提交提醒任务
			async handleSubmit() {
				if (!this.validateForm()) {
					return
				}
				
				this.isSubmitting = true
				this.lastResult = null
				
				try {
					// 准备请求数据
					const requestData = {
						id: parseInt(this.remindForm.id),
						task_type: this.remindForm.task_type,
						status: this.remindForm.status,
						mobile: this.remindForm.mobile
					}
					
					const response = await this.handleRemindTask(requestData)
					
					if (response.success) {
						this.lastResult = {
							success: true,
							message: response.message || '提醒任务处理成功',
							details: response.details
						}
						
						uni.showToast({
							title: '提醒发送成功',
							icon: 'success'
						})
					} else {
						throw new Error(response.message || '处理提醒任务失败')
					}
					
				} catch (error) {
					console.error('处理提醒任务失败:', error)
					
					// 处理特定的后端错误
					let errorMessage = '处理提醒任务失败'
					let errorDetails = ''
					
					if (error.message.includes('任务ID不能为空')) {
						errorMessage = '任务ID不能为空'
					} else if (error.message.includes('到期提醒任务不存在或状态异常')) {
						errorMessage = '任务不存在或状态异常'
						errorDetails = '请检查任务ID和状态是否正确'
					} else if (error.message.includes('关联的寄存订单不存在')) {
						errorMessage = '关联的寄存订单不存在'
					} else if (error.message.includes('关联用户不存在')) {
						errorMessage = '关联用户不存在'
					} else if (error.message.includes('订单状态无需提醒')) {
						errorMessage = '订单状态无需提醒'
						errorDetails = '任务已自动结束'
					} else if (error.message) {
						errorMessage = error.message
					}
					
					this.lastResult = {
						success: false,
						message: errorMessage,
						details: errorDetails
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
			
			// 调用处理提醒任务API
			handleRemindTask(data) {
				return new Promise((resolve, reject) => {
					console.log('发送提醒任务处理请求:', data)
					
					uni.request({
						url: 'http://127.0.0.1:8000/handle/remind/task',
						method: 'POST',
						data: data,
						header: {
							'Content-Type': 'application/json'
						},
						timeout: apiConfig.timeout || 10000,
						success: (res) => {
							console.log('提醒任务处理响应:', res)
							
							if (res.statusCode === 200) {
								resolve({
									success: true,
									data: res.data,
									message: res.data?.msg || '提醒任务处理成功',
									details: res.data?.details
								})
							} else {
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
			
			// 重置表单
			handleReset() {
				this.remindForm = {
					id: '',
					task_type: 'remind',
					status: 1,
					mobile: ''
				}
				this.taskTypeIndex = 0
				this.statusIndex = 0
				this.lastResult = null
				
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
			},
			
			// 快速填充测试数据
			fillTestData() {
				this.remindForm = {
					id: 10,
					task_type: 'remind',
					status: 1,
					mobile: '13661740781'
				}
				this.taskTypeIndex = 0
				this.statusIndex = 0
				
				uni.showToast({
					title: '已填充测试数据',
					icon: 'success'
				})
			}
		}
	}
</script>

<style>
	.remind-task-page {
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
	
	.remind-form {
		background-color: #fff;
		border-radius: 10rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
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
	
	.result-section {
		background-color: #fff;
		border-radius: 10rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
	}
	
	.result-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
		display: block;
		border-left: 4rpx solid #28a745;
		padding-left: 15rpx;
	}
	
	.result-content {
		padding: 20rpx;
		border-radius: 8rpx;
		border: 2rpx solid #e0e0e0;
	}
	
	.result-content.success {
		background-color: #f0f9ff;
		border-color: #28a745;
	}
	
	.result-content.error {
		background-color: #fff5f5;
		border-color: #dc3545;
	}
	
	.result-text {
		display: block;
		font-size: 28rpx;
		color: #333;
		margin-bottom: 10rpx;
	}
	
	.result-details {
		display: block;
		font-size: 24rpx;
		color: #666;
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
</style>
