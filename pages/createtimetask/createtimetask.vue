<template>
	<view class="locker-storage-create">
		<view class="header">
			<text class="title">创建寄存记录</text>
			<view class="tips">
				<text class="tip-text">• 请确保订单已存在且有效</text>
				<text class="tip-text">• 过期时间不能早于当前时间</text>
				<text class="tip-text">• 系统将自动创建提醒和处理任务</text>
			</view>
		</view>
		
		<form @submit="handleSubmit" class="storage-form">
			<!-- 基本信息 -->
			<view class="form-section">
				<text class="section-title">基本信息</text>
				<view class="form-item">
					<text class="label">订单ID</text>
					<input v-model="storageForm.orderId" type="number" placeholder="请输入订单ID" class="input" />
				</view>
				<view class="form-item">
					<text class="label">柜子ID</text>
					<input v-model="storageForm.cabinetId" type="number" placeholder="请输入柜子ID" class="input" />
				</view>
				<view class="form-item">
					<text class="label">用户ID</text>
					<input v-model="storageForm.userId" type="number" placeholder="请输入用户ID" class="input" />
				</view>
			</view>
			
			<!-- 状态和时间 -->
			<view class="form-section">
				<text class="section-title">状态和时间</text>
				<view class="form-item">
					<text class="label">寄存状态</text>
					<picker @change="onStatusChange" :value="statusIndex" :range="statusOptions">
						<view class="picker">
							{{statusOptions[statusIndex]}}
						</view>
					</picker>
				</view>
				<view class="form-item">
					<text class="label">过期时间</text>
					<picker mode="multiSelector" @change="onDateTimeChange" :value="dateTimeIndex" :range="dateTimeRange">
						<view class="picker">
							{{formatDateTime()}}
						</view>
					</picker>
				</view>
			</view>
			
			<!-- 提交按钮 -->
			<view class="form-actions">
				<button @click="handleSubmit" :disabled="isSubmitting" class="submit-btn">
					{{isSubmitting ? '创建中...' : '创建寄存记录'}}
				</button>
				<button @click="handleReset" class="reset-btn">重置</button>
				<button @click="goToIndex" class="index-btn">返回首页</button>
			</view>
		</form>
		
		<!-- 加载提示 -->
		<view v-if="isSubmitting" class="loading-overlay">
			<view class="loading-content">
				<text>正在创建寄存记录...</text>
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
				statusOptions: ['待寄存', '寄存中'],
				dateTimeIndex: [0, 0, 0, 0, 0], // [年, 月, 日, 时, 分]
				dateTimeRange: [],
				storageForm: {
					orderId: '',
					cabinetId: '',
					userId: '',
					status: 0,
					expireTime: 0
				}
			}
		},
		onLoad() {
			this.initDateTimeRange()
		},
		methods: {
			// 初始化日期时间选择器数据
			initDateTimeRange() {
				const now = new Date()
				const currentYear = now.getFullYear()
				
				// 年份：当前年到后两年
				const years = []
				for (let i = 0; i < 3; i++) {
					years.push((currentYear + i).toString())
				}
				
				// 月份：1-12
				const months = []
				for (let i = 1; i <= 12; i++) {
					months.push(i.toString().padStart(2, '0'))
				}
				
				// 日期：1-31
				const days = []
				for (let i = 1; i <= 31; i++) {
					days.push(i.toString().padStart(2, '0'))
				}
				
				// 小时：0-23
				const hours = []
				for (let i = 0; i < 24; i++) {
					hours.push(i.toString().padStart(2, '0'))
				}
				
				// 分钟：0-59
				const minutes = []
				for (let i = 0; i < 60; i++) {
					minutes.push(i.toString().padStart(2, '0'))
				}
				
				this.dateTimeRange = [years, months, days, hours, minutes]
				
				// 设置默认时间为1小时后
				const defaultTime = new Date(now.getTime() + 60 * 60 * 1000)
				this.dateTimeIndex = [
					0, // 当前年
					defaultTime.getMonth(), // 当前月
					defaultTime.getDate() - 1, // 当前日
					defaultTime.getHours(), // 当前时+1
					defaultTime.getMinutes() // 当前分
				]
			},
			
			// 状态选择器变化
			onStatusChange(e) {
				this.statusIndex = e.detail.value
				this.storageForm.status = parseInt(e.detail.value)
			},
			
			// 日期时间选择器变化
			onDateTimeChange(e) {
				this.dateTimeIndex = e.detail.value
			},
			
			// 格式化显示日期时间
			formatDateTime() {
				if (!this.dateTimeRange.length) return '请选择过期时间'
				
				const [yearIndex, monthIndex, dayIndex, hourIndex, minuteIndex] = this.dateTimeIndex
				const year = this.dateTimeRange[0][yearIndex]
				const month = this.dateTimeRange[1][monthIndex]
				const day = this.dateTimeRange[2][dayIndex]
				const hour = this.dateTimeRange[3][hourIndex]
				const minute = this.dateTimeRange[4][minuteIndex]
				
				return `${year}-${month}-${day} ${hour}:${minute}`
			},
			
			// 获取选择的时间戳
			getSelectedTimestamp() {
				const [yearIndex, monthIndex, dayIndex, hourIndex, minuteIndex] = this.dateTimeIndex
				const year = parseInt(this.dateTimeRange[0][yearIndex])
				const month = parseInt(this.dateTimeRange[1][monthIndex]) - 1 // 月份从0开始
				const day = parseInt(this.dateTimeRange[2][dayIndex])
				const hour = parseInt(this.dateTimeRange[3][hourIndex])
				const minute = parseInt(this.dateTimeRange[4][minuteIndex])
				
				const selectedDate = new Date(year, month, day, hour, minute)
				return Math.floor(selectedDate.getTime() / 1000) // 返回秒级时间戳
			},
			
			// 表单验证
			validateForm() {
				const required = ['orderId', 'cabinetId', 'userId']
				
				for (let field of required) {
					if (!this.storageForm[field] || this.storageForm[field] === '') {
						uni.showToast({
							title: `请填写${this.getFieldLabel(field)}`,
							icon: 'none'
						})
						return false
					}
				}
				
				// 验证数值类型
				if (this.storageForm.orderId <= 0) {
					uni.showToast({
						title: '订单ID必须大于0',
						icon: 'none'
					})
					return false
				}
				
				if (this.storageForm.cabinetId <= 0) {
					uni.showToast({
						title: '柜子ID必须大于0',
						icon: 'none'
					})
					return false
				}
				
				if (this.storageForm.userId <= 0) {
					uni.showToast({
						title: '用户ID必须大于0',
						icon: 'none'
					})
					return false
				}
				
				// 验证过期时间
				const expireTimestamp = this.getSelectedTimestamp()
				const nowTimestamp = Math.floor(Date.now() / 1000)
				
				if (expireTimestamp <= nowTimestamp) {
					uni.showToast({
						title: '过期时间不能早于当前时间',
						icon: 'none'
					})
					return false
				}
				
				this.storageForm.expireTime = expireTimestamp
				return true
			},
			
			// 获取字段标签
			getFieldLabel(field) {
				const labels = {
					orderId: '订单ID',
					cabinetId: '柜子ID',
					userId: '用户ID'
				}
				return labels[field] || field
			},
			
			// 提交寄存记录
			async handleSubmit() {
				if (!this.validateForm()) {
					return
				}
				
				this.isSubmitting = true
				
				try {
					// 准备请求数据
					const requestData = {
						orderId: parseInt(this.storageForm.orderId),
						cabinetId: parseInt(this.storageForm.cabinetId),
						userId: parseInt(this.storageForm.userId),
						status: this.storageForm.status,
						expireTime: this.storageForm.expireTime
					}
					
					const response = await this.createLockerStorage(requestData)
					
					if (response.success) {
						uni.showToast({
							title: '寄存记录创建成功',
							icon: 'success'
						})
						
						// 延迟跳转，让用户看到成功提示
						setTimeout(() => {
							uni.navigateBack()
						}, 1500)
					} else {
						throw new Error(response.message || '创建寄存记录失败')
					}
					
				} catch (error) {
					console.error('创建寄存记录失败:', error)
					
					// 处理特定的后端错误
					let errorMessage = '创建寄存记录失败'
					if (error.message.includes('无效参数')) {
						errorMessage = '参数无效，请检查输入信息'
					} else if (error.message.includes('过期时间不能早于当前时间')) {
						errorMessage = '过期时间不能早于当前时间'
					} else if (error.message.includes('创建寄存记录失败')) {
						errorMessage = '寄存记录创建失败，请稍后重试'
					} else if (error.message.includes('创建定时任务失败')) {
						errorMessage = '定时任务创建失败，请联系管理员'
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
			
			// 调用创建寄存记录API
			createLockerStorage(data) {
				return new Promise((resolve, reject) => {
					console.log('发送寄存记录创建请求:', data)
					
					uni.request({
						url: `http://127.0.0.1:8000/create/locker/storage`,
						method: 'POST',
						data: data,
						header: {
							'Content-Type': 'application/json'
						},
						timeout: apiConfig.timeout,
						success: (res) => {
							console.log('寄存记录创建响应:', res)
							
							if (res.statusCode === 200) {
								resolve({
									success: true,
									data: res.data,
									message: res.data?.msg || '寄存记录创建成功'
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
				this.storageForm = {
					orderId: '',
					cabinetId: '',
					userId: '',
					status: 0,
					expireTime: 0
				}
				this.statusIndex = 0
				this.initDateTimeRange()
				
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
		}
	}
</script>

<style>
	.locker-storage-create {
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
	
	.storage-form {
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
</style>
