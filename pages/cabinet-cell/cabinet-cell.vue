<template>
	<view class="page">
		<!-- 顶部导航栏 -->
		<view class="navbar">
			<view class="nav-left" @click="goBack">
				<text class="nav-icon">‹</text>
			</view>
			<view class="nav-center">
				<text class="nav-title">{{ groupName }} - 柜格管理</text>
			</view>
			<view class="nav-right">
				<text class="nav-icon" @click="refreshData">⟲</text>
			</view>
		</view>

		<!-- 柜格状态统计 -->
		<view class="stats-section">
			<view class="stat-item">
				<text class="stat-value">{{ totalCells }}</text>
				<text class="stat-label">总柜格</text>
			</view>
			<view class="stat-item">
				<text class="stat-value available">{{ availableCells }}</text>
				<text class="stat-label">可用</text>
			</view>
			<view class="stat-item">
				<text class="stat-value occupied">{{ occupiedCells }}</text>
				<text class="stat-label">占用</text>
			</view>
			<view class="stat-item">
				<text class="stat-value maintenance">{{ maintenanceCells }}</text>
				<text class="stat-label">维护</text>
			</view>
		</view>

		<!-- 柜格网格 -->
		<view class="cells-grid">
			<view 
				class="cell-item" 
				v-for="cell in cellList" 
				:key="cell.id"
				:class="getCellClass(cell.status)"
				@click="selectCell(cell)"
			>
				<text class="cell-number">{{ cell.cell_no }}</text>
				<text class="cell-status">{{ getCellStatusText(cell.status) }}</text>
				<text class="cell-size">{{ getCellSizeText(cell.size) }}</text>
			</view>
		</view>

		<!-- 柜格详情弹窗 -->
		<view class="modal-overlay" v-if="showCellModal" @click="hideCellModal">
			<view class="modal-content" @click.stop>
				<view class="modal-header">
					<text class="modal-title">柜格 {{ selectedCell?.cell_no }} 详情</text>
					<text class="modal-close" @click="hideCellModal">×</text>
				</view>
				
				<view class="modal-body" v-if="selectedCell">
					<view class="detail-row">
						<text class="detail-label">柜格编号:</text>
						<text class="detail-value">{{ selectedCell.cell_no }}</text>
					</view>
					<view class="detail-row">
						<text class="detail-label">柜格状态:</text>
						<text class="detail-value" :class="getCellClass(selectedCell.status)">
							{{ getCellStatusText(selectedCell.status) }}
						</text>
					</view>
					<view class="detail-row">
						<text class="detail-label">柜格尺寸:</text>
						<text class="detail-value">{{ getCellSizeText(selectedCell.size) }}</text>
					</view>
					<view class="detail-row" v-if="selectedCell.current_order_id">
						<text class="detail-label">当前订单:</text>
						<text class="detail-value">{{ selectedCell.current_order_id }}</text>
					</view>
					<view class="detail-row" v-if="selectedCell.last_open_time">
						<text class="detail-label">最后开启:</text>
						<text class="detail-value">{{ formatTime(selectedCell.last_open_time) }}</text>
					</view>
				</view>
				
				<view class="modal-actions">
					<button class="action-btn secondary" @click="hideCellModal">关闭</button>
					<button class="action-btn primary" @click="manageCellAction" v-if="canManageCell">
						{{ getCellActionText(selectedCell?.status) }}
					</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			// 页面参数
			groupId: '',
			groupName: '',
			
			// 柜格数据
			cellList: [],
			selectedCell: null,
			showCellModal: false,
			
			// 统计数据
			totalCells: 0,
			availableCells: 0,
			occupiedCells: 0,
			maintenanceCells: 0,
			
			// 加载状态
			loading: false
		}
	},
	
	computed: {
		// 是否可以管理柜格
		canManageCell() {
			if (!this.selectedCell) return false;
			return ['available', 'maintenance', 'damaged'].includes(this.selectedCell.status);
		}
	},
	
	onLoad(options) {
		console.log('柜格管理页面加载:', options);
		
		this.groupId = options.groupId || '';
		this.groupName = decodeURIComponent(options.groupName || '未知柜组');
		
		if (this.groupId) {
			this.loadCellList();
		} else {
			uni.showToast({
				title: '参数错误',
				icon: 'none'
			});
		}
	},
	
	methods: {
		// 返回上一页
		goBack() {
			uni.navigateBack();
		},
		
		// 刷新数据
		refreshData() {
			this.loadCellList();
		},
		
		// 加载柜格列表
		loadCellList() {
			if (this.loading) return;
			
			this.loading = true;
			
			// 暂时使用模拟数据
			setTimeout(() => {
				this.loadMockCellData();
				this.loading = false;
			}, 500);
		},
		
		// 加载模拟柜格数据
		loadMockCellData() {
			console.log('使用模拟柜格数据');
			
			const mockCells = [];
			const statuses = ['available', 'occupied', 'maintenance', 'damaged'];
			const sizes = ['small', 'medium', 'large'];
			
			// 生成20个柜格
			for (let i = 1; i <= 20; i++) {
				const status = statuses[Math.floor(Math.random() * statuses.length)];
				const size = sizes[Math.floor(Math.random() * sizes.length)];
				
				mockCells.push({
					id: i,
					group_id: this.groupId,
					cell_no: String(i).padStart(2, '0'),
					status: status,
					size: size,
					current_order_id: status === 'occupied' ? `ORD${Date.now()}${i}` : null,
					last_open_time: status !== 'available' ? new Date(Date.now() - Math.random() * 86400000).toISOString() : null,
					create_time: new Date().toISOString(),
					update_time: new Date().toISOString()
				});
			}
			
			this.cellList = mockCells;
			this.updateStats();
		},
		
		// 更新统计数据
		updateStats() {
			this.totalCells = this.cellList.length;
			this.availableCells = this.cellList.filter(cell => cell.status === 'available').length;
			this.occupiedCells = this.cellList.filter(cell => cell.status === 'occupied').length;
			this.maintenanceCells = this.cellList.filter(cell => cell.status === 'maintenance').length;
		},
		
		// 获取柜格样式类
		getCellClass(status) {
			const classMap = {
				'available': 'cell-available',
				'occupied': 'cell-occupied',
				'maintenance': 'cell-maintenance',
				'damaged': 'cell-damaged'
			};
			return classMap[status] || 'cell-unknown';
		},
		
		// 获取柜格状态文本
		getCellStatusText(status) {
			const statusMap = {
				'available': '可用',
				'occupied': '占用',
				'maintenance': '维护',
				'damaged': '损坏'
			};
			return statusMap[status] || '未知';
		},
		
		// 获取柜格尺寸文本
		getCellSizeText(size) {
			const sizeMap = {
				'small': '小',
				'medium': '中',
				'large': '大'
			};
			return sizeMap[size] || '未知';
		},
		
		// 选择柜格
		selectCell(cell) {
			console.log('选择柜格:', cell);
			this.selectedCell = cell;
			this.showCellModal = true;
		},
		
		// 隐藏柜格详情弹窗
		hideCellModal() {
			this.showCellModal = false;
			this.selectedCell = null;
		},
		
		// 获取柜格操作文本
		getCellActionText(status) {
			const actionMap = {
				'available': '设为维护',
				'maintenance': '设为可用',
				'damaged': '标记修复'
			};
			return actionMap[status] || '操作';
		},
		
		// 管理柜格操作
		manageCellAction() {
			if (!this.selectedCell) return;
			
			const cell = this.selectedCell;
			let newStatus = '';
			let actionText = '';
			
			switch (cell.status) {
				case 'available':
					newStatus = 'maintenance';
					actionText = '设为维护状态';
					break;
				case 'maintenance':
					newStatus = 'available';
					actionText = '设为可用状态';
					break;
				case 'damaged':
					newStatus = 'available';
					actionText = '标记为已修复';
					break;
				default:
					return;
			}
			
			uni.showModal({
				title: '确认操作',
				content: `确定要将柜格 ${cell.cell_no} ${actionText}吗？`,
				success: (res) => {
					if (res.confirm) {
						this.updateCellStatus(cell.id, newStatus);
					}
				}
			});
		},
		
		// 更新柜格状态
		updateCellStatus(cellId, newStatus) {
			// 找到对应的柜格并更新状态
			const cellIndex = this.cellList.findIndex(cell => cell.id === cellId);
			if (cellIndex !== -1) {
				this.cellList[cellIndex].status = newStatus;
				this.cellList[cellIndex].update_time = new Date().toISOString();
				
				// 更新统计数据
				this.updateStats();
				
				// 更新选中的柜格
				if (this.selectedCell && this.selectedCell.id === cellId) {
					this.selectedCell.status = newStatus;
				}
				
				uni.showToast({
					title: '状态更新成功',
					icon: 'success'
				});
			}
		},
		
		// 格式化时间
		formatTime(timeStr) {
			if (!timeStr) return '';
			const date = new Date(timeStr);
			return date.toLocaleString('zh-CN');
		}
	}
}
</script>

<style scoped>
.page {
	background-color: #f5f5f5;
	min-height: 100vh;
}

/* 导航栏 */
.navbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 30rpx;
	background-color: #ffffff;
	border-bottom: 1rpx solid #e5e5e5;
	position: sticky;
	top: 0;
	z-index: 100;
}

.nav-left, .nav-right {
	display: flex;
	align-items: center;
}

.nav-icon {
	font-size: 36rpx;
	color: #333333;
	padding: 10rpx;
}

.nav-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #333333;
}

/* 统计区域 */
.stats-section {
	display: flex;
	background-color: #ffffff;
	margin: 20rpx;
	border-radius: 16rpx;
	padding: 30rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.stat-item {
	flex: 1;
	text-align: center;
}

.stat-value {
	display: block;
	font-size: 48rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 8rpx;
}

.stat-value.available {
	color: #52c41a;
}

.stat-value.occupied {
	color: #1890ff;
}

.stat-value.maintenance {
	color: #faad14;
}

.stat-label {
	font-size: 24rpx;
	color: #666666;
}

/* 柜格网格 */
.cells-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 20rpx;
	padding: 20rpx;
}

.cell-item {
	background-color: #ffffff;
	border-radius: 12rpx;
	padding: 30rpx 20rpx;
	text-align: center;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	border: 3rpx solid transparent;
	transition: all 0.3s ease;
}

.cell-item:active {
	transform: scale(0.95);
}

.cell-number {
	display: block;
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 8rpx;
}

.cell-status {
	display: block;
	font-size: 22rpx;
	margin-bottom: 4rpx;
}

.cell-size {
	display: block;
	font-size: 20rpx;
	color: #999999;
}

/* 柜格状态样式 */
.cell-available {
	border-color: #52c41a;
	background-color: #f6ffed;
}

.cell-available .cell-status {
	color: #52c41a;
}

.cell-occupied {
	border-color: #1890ff;
	background-color: #e6f7ff;
}

.cell-occupied .cell-status {
	color: #1890ff;
}

.cell-maintenance {
	border-color: #faad14;
	background-color: #fffbe6;
}

.cell-maintenance .cell-status {
	color: #faad14;
}

.cell-damaged {
	border-color: #ff4d4f;
	background-color: #fff2f0;
}

.cell-damaged .cell-status {
	color: #ff4d4f;
}

/* 弹窗样式 */
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 1000;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40rpx;
}

.modal-content {
	background-color: #ffffff;
	border-radius: 16rpx;
	width: 100%;
	max-width: 600rpx;
	max-height: 80vh;
	overflow: hidden;
}

.modal-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
}

.modal-close {
	font-size: 40rpx;
	color: #999999;
	padding: 10rpx;
}

.modal-body {
	padding: 30rpx;
	max-height: 400rpx;
	overflow-y: auto;
}

.detail-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 15rpx 0;
	border-bottom: 1rpx solid #f5f5f5;
}

.detail-row:last-child {
	border-bottom: none;
}

.detail-label {
	font-size: 28rpx;
	color: #666666;
}

.detail-value {
	font-size: 28rpx;
	color: #333333;
	font-weight: 500;
}

.modal-actions {
	display: flex;
	gap: 20rpx;
	padding: 30rpx;
	border-top: 1rpx solid #f0f0f0;
}

.action-btn {
	flex: 1;
	padding: 25rpx;
	border-radius: 8rpx;
	font-size: 28rpx;
	border: none;
	font-weight: 500;
}

.action-btn.secondary {
	background-color: #f5f5f5;
	color: #666666;
}

.action-btn.primary {
	background-color: #1890ff;
	color: #ffffff;
}
</style>