<template>
	<view class="page">
		<view class="search-section">
			<input 
				class="search-input" 
				placeholder="搜索寄存点"
				v-model="searchKeyword"
				@confirm="performSearch"
				confirm-type="search"
			/>
			<button class="search-btn" @click="performSearch">搜索</button>
		</view>
		
		<view v-if="searchResults.length > 0" class="results-section">
			<view class="result-item" 
				v-for="(item, index) in searchResults" 
				:key="index"
				@click="selectResult(item)"
			>
				<text class="result-name">{{item.name}}</text>
				<text class="result-address">{{item.address}}</text>
			</view>
		</view>
		
		<view v-else class="empty-section">
			<text class="empty-text">请输入关键词搜索寄存点</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				searchKeyword: '',
				searchResults: []
			}
		},
		
		onLoad(options) {
			if (options.keyword) {
				this.searchKeyword = decodeURIComponent(options.keyword);
				this.performSearch();
			}
		},
		
		methods: {
			performSearch() {
				if (!this.searchKeyword.trim()) {
					uni.showToast({
						title: '请输入搜索关键词',
						icon: 'none'
					});
					return;
				}
				
				// 这里应该调用真实的搜索API
				// 暂时使用模拟数据
				this.searchResults = [
					{
						id: 1,
						name: '示例寄存点',
						address: '示例地址'
					}
				];
			},
			
			selectResult(item) {
				uni.navigateTo({
					url: `/pages/locker-detail/locker-detail?id=${item.id}`
				});
			}
		}
	}
</script>

<style>
	.page {
		padding: 20rpx;
		background-color: #f5f5f5;
		min-height: 100vh;
	}
	
	.search-section {
		background: white;
		padding: 30rpx;
		border-radius: 20rpx;
		margin-bottom: 30rpx;
		display: flex;
		gap: 20rpx;
	}
	
	.search-input {
		flex: 1;
		height: 80rpx;
		border: 2rpx solid #e5e5e5;
		border-radius: 10rpx;
		padding: 0 20rpx;
		font-size: 28rpx;
	}
	
	.search-btn {
		width: 120rpx;
		height: 80rpx;
		background: #007AFF;
		color: white;
		border: none;
		border-radius: 10rpx;
		font-size: 28rpx;
	}
	
	.results-section {
		background: white;
		border-radius: 20rpx;
		overflow: hidden;
	}
	
	.result-item {
		padding: 30rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}
	
	.result-item:last-child {
		border-bottom: none;
	}
	
	.result-name {
		font-size: 32rpx;
		color: #333;
		font-weight: bold;
		display: block;
		margin-bottom: 10rpx;
	}
	
	.result-address {
		font-size: 26rpx;
		color: #666;
	}
	
	.empty-section {
		background: white;
		padding: 80rpx 30rpx;
		border-radius: 20rpx;
		text-align: center;
	}
	
	.empty-text {
		font-size: 28rpx;
		color: #999;
	}
</style>