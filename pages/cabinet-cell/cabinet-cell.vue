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

		<!-- 操作按钮区域 - 优化版 -->
		<view class="action-section-enhanced">
			<view class="primary-actions">
				<button class="action-btn-primary refresh" @click="refreshData">
					<text class="btn-icon">⟲</text>
					<text class="btn-text">刷新</text>
				</button>
				<button class="action-btn-primary toggle-all" @click="toggleAllCells">
					<text class="btn-icon">{{ allCellsOpened ? '🔒' : '🔓' }}</text>
					<text class="btn-text">{{ allCellsOpened ? '全部关闭' : '全部打开' }}</text>
				</button>
				<button class="action-btn-primary view-mode" @click="toggleViewMode">
					<text class="btn-icon">{{ viewMode === 'grid' ? '📋' : '⊞' }}</text>
					<text class="btn-text">{{ viewMode === 'grid' ? '列表' : '网格' }}</text>
				</button>
			</view>
			<view class="secondary-actions">
				<button class="action-btn-secondary report" @click="showReport">
					<text class="btn-icon-secondary">📊</text>
				</button>
				<button class="action-btn-secondary modify-status" @click="showStatusModalDialog">
					<text class="btn-icon-secondary">🔧</text>
				</button>
			</view>
		</view>

		<!-- 状态说明 -->
		<view class="status-legend">
			<text class="legend-title">单击开门/关门，长按选择操作</text>
			<view class="legend-items">
				<view class="legend-item">
					<view class="legend-color normal"></view>
					<text class="legend-text">正常</text>
				</view>
				<view class="legend-item">
					<view class="legend-color in-use"></view>
					<text class="legend-text">使用中</text>
				</view>
				<view class="legend-item">
					<view class="legend-color abnormal"></view>
					<text class="legend-text">异常</text>
				</view>
				<view class="legend-item">
					<view class="legend-color disabled"></view>
					<text class="legend-text">停用</text>
				</view>
				<view class="legend-item">
					<view class="legend-color damaged"></view>
					<text class="legend-text">损坏</text>
				</view>
			</view>
		</view>

		<!-- 柜格显示区域 - 支持网格和列表模式 -->
		<view class="cells-container">
			<!-- 加载状态显示 -->
			<view v-if="loading" class="loading-state">
				<text class="loading-icon">⟳</text>
				<text class="loading-text">处理中...</text>
			</view>

			<!-- 空状态显示 -->
			<view v-else-if="cellList.length === 0" class="empty-state">
				<text class="empty-icon">📦</text>
				<text class="empty-title">暂无柜格数据</text>
				<text class="empty-desc">请检查网络连接或联系管理员</text>
				<button class="empty-retry-btn" @click="loadCellList">重新加载</button>
			</view>

			<!-- 网格模式 - 优化的柜格布局 -->
			<view v-else-if="viewMode === 'grid'" class="cells-grid-optimized">
				<view class="cell-item-enhanced" v-for="cell in sortedCellList" :key="cell.id"
					:class="[getCellClass(cell.status), getCellSizeClass(cell.cell_size)]"
					@click="handleCellClick(cell)" @longpress="handleCellLongPress(cell)">
					
					<!-- 柜格主体内容 -->
					<view class="cell-main-content">
						<view class="cell-header">
							<view class="cell-size-badge" :class="getSizeBadgeClass(cell.cell_size)">
								<text class="size-badge-icon">{{ getSizeIcon(cell.cell_size) }}</text>
								<text class="size-badge-text">{{ getCellSizeText(cell.cell_size) }}</text>
							</view>
							<view class="cell-status-dot" :class="getStatusDotClass(cell.status)"></view>
						</view>
						
						<view class="cell-body">
							<text class="cell-number-enhanced">{{ formatCellNumber(cell.cell_no) }}</text>
							<text class="cell-status-text">{{ getCellStatusText(cell.status) }}</text>
						</view>
						
						<view class="cell-footer">
							<text class="cell-sequence-text">第{{ getCellSequence(cell) }}个</text>
							<view class="cell-action-hint" v-if="cell.status === 'normal' || cell.status === 'inUse'">
								<text class="action-hint-text">{{ cell.status === 'normal' ? '点击开门' : '点击关门' }}</text>
							</view>
						</view>
					</view>
					
					<!-- 状态指示器 -->
					<view class="cell-status-indicator" :class="getStatusIndicatorClass(cell.status)">
						<text class="status-indicator-icon">{{ getStatusIcon(cell.status) }}</text>
					</view>
				</view>
			</view>

			<!-- 列表模式 -->
			<view v-else class="cells-list">
				<view class="list-item" v-for="cell in sortedCellList" :key="cell.id"
					:class="getListItemClass(cell.status)" @click="handleCellClick(cell)"
					@longpress="handleCellLongPress(cell)">
					<view class="list-item-left">
						<view class="list-cell-number" :class="getCellSizeClass(cell.cell_size)">
							{{ formatCellNumber(cell.cell_no) }}
						</view>
						<view class="list-cell-info">
							<text class="list-cell-sequence">第{{ getCellSequence(cell) }}个柜格</text>
							<text class="list-cell-size">{{ getCellSizeText(cell.cell_size) }}格</text>
							<text class="list-cell-time" v-if="cell.last_open_time">
								{{ formatTime(cell.last_open_time) }}
							</text>
						</view>
					</view>
					<view class="list-item-right">
						<view class="list-status-badge" :class="getCellClass(cell.status)">
							{{ getCellStatusText(cell.status) }}
						</view>
						<text class="list-arrow">›</text>
					</view>
				</view>
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
						<text class="detail-value">{{ getCellSizeText(selectedCell.cell_size) }}</text>
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

		<!-- 批量修改柜门状态弹窗 -->
		<view class="modal-overlay" v-if="showStatusModal" @click="hideStatusModal">
			<view class="status-modal-content" @click.stop>
				<view class="status-modal-header">
					<text class="status-modal-title">批量修改柜门状态</text>
					<text class="status-modal-subtitle">将修改所有柜格的状态</text>
				</view>

				<view class="status-options">
					<view class="status-option" v-for="option in statusOptions" :key="option.value"
						:class="{ 'status-option-selected': selectedStatus === option.value }"
						@click="selectStatus(option.value)">
						<view class="status-option-content">
							<text class="status-option-icon">{{ option.icon }}</text>
							<text class="status-option-label" :style="{ color: option.color }">{{ option.label }}</text>
						</view>
						<view class="status-option-check" v-if="selectedStatus === option.value">
							<text class="check-icon">✓</text>
						</view>
					</view>
				</view>

				<view class="status-modal-actions">
					<button class="status-btn cancel" @click="hideStatusModal">取消</button>
					<button class="status-btn confirm" @click="confirmStatusChange"
						:disabled="!selectedStatus">确定</button>
				</view>
			</view>
		</view>

		<!-- 单个柜格修改状态弹窗 -->
		<view class="modal-overlay" v-if="showSingleStatusModal" @click="hideSingleStatusModal">
			<view class="status-modal-content" @click.stop>
				<view class="status-modal-header">
					<text class="status-modal-title">修改柜格状态</text>
					<text class="status-modal-subtitle" v-if="selectedCellForStatus">
						第{{ getCellSequence(selectedCellForStatus) }}个柜格 ({{
							formatCellNumber(selectedCellForStatus.cell_no) }})
					</text>
				</view>

				<view class="status-options">
					<view class="status-option" v-for="option in statusOptions" :key="option.value"
						:class="{ 'status-option-selected': selectedStatus === option.value }"
						@click="selectStatus(option.value)">
						<view class="status-option-content">
							<text class="status-option-icon">{{ option.icon }}</text>
							<text class="status-option-label" :style="{ color: option.color }">{{ option.label }}</text>
						</view>
						<view class="status-option-check" v-if="selectedStatus === option.value">
							<text class="check-icon">✓</text>
						</view>
					</view>
				</view>

				<view class="status-modal-actions">
					<button class="status-btn cancel" @click="hideSingleStatusModal">取消</button>
					<button class="status-btn confirm" @click="confirmSingleStatusChange"
						:disabled="!selectedStatus">确定</button>
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
			loading: false,

			// 显示配置
			showCellStatus: true,
			showCellSize: true, // 显示柜格尺寸
			viewMode: 'grid', // 'grid' 或 'list'

			// 状态修改弹窗
			showStatusModal: false,
			selectedStatus: '',

			// 单个柜格状态修改
			showSingleStatusModal: false,
			selectedCellForStatus: null,
			statusOptions: [
				{ value: 'normal', label: '正常', color: '#52c41a', icon: '✓' },
				{ value: 'inUse', label: '使用中', color: '#faad14', icon: '🔒' },
				{ value: 'abnormal', label: '异常', color: '#ff7875', icon: '⚠️' },
				{ value: 'disabled', label: '停用', color: '#d9d9d9', icon: '🚫' },
				{ value: 'damaged', label: '损坏', color: '#ff4d4f', icon: '💥' }
			],

			// API配置
			apiBaseUrl: 'http://localhost:8000'
		}
	},

	computed: {
		// 是否可以管理柜格
		canManageCell() {
			if (!this.selectedCell) return false;
			return ['normal', 'abnormal', 'damaged'].includes(this.selectedCell.status);
		},

		// 排序后的柜格列表
		sortedCellList() {
			return [...this.cellList].sort((a, b) => {
				const numA = parseInt(a.cell_no);
				const numB = parseInt(b.cell_no);
				return numA - numB;
			});
		},

		// 检查是否所有柜格都已打开
		allCellsOpened() {
			const normalCells = this.cellList.filter(cell => ['normal', 'inUse'].includes(cell.status));
			const inUseCells = this.cellList.filter(cell => cell.status === 'inUse');
			return normalCells.length > 0 && inUseCells.length === normalCells.length;
		}
	},

	onLoad(options) {
		console.log('柜格管理页面加载:', options);

		this.groupId = options.groupId || '';
		this.groupName = decodeURIComponent(options.groupName || '未知柜组');

		// 恢复用户偏好的视图模式
		const savedViewMode = uni.getStorageSync('cellViewMode');
		if (savedViewMode) {
			this.viewMode = savedViewMode;
		}

		if (this.groupId) {
			this.loadCellList();
		} else {
			uni.showToast({
				title: '参数错误',
				icon: 'none'
			});
		}
	},

	onShow() {
		// 每次页面显示时刷新数据，确保显示最新的柜口数量
		if (this.groupId) {
			console.log('页面显示，刷新柜格数据');
			this.loadCellList();
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
		async loadCellList() {
			if (this.loading) return;

			this.loading = true;

			try {
				const response = await this.requestCellList();

				console.log('=== 处理柜格列表响应数据 ===');
				console.log('响应对象:', response);

				if (response.code === 200 || response.code === '200') {
					const cells = response.cells || [];

					console.log('获取到的柜格数据:', cells);
					console.log('柜格数量:', cells.length);

					console.log('获取到的柜格数据:', cells);
					console.log('柜格数量:', cells.length);

					// 验证数据格式
					if (Array.isArray(cells)) {
						// 修复字段命名问题：protobuf转JSON时cell_size变为cellSize
						cells.forEach(cell => {
							// 如果存在cellSize但不存在cell_size，则复制字段
							if (cell.cellSize && !cell.cell_size) {
								cell.cell_size = cell.cellSize;
							}
							// 如果存在cellNo但不存在cell_no，则复制字段
							if (cell.cellNo && !cell.cell_no) {
								cell.cell_no = cell.cellNo;
							}
							// 如果存在cabinetGroupId但不存在cabinet_group_id，则复制字段
							if (cell.cabinetGroupId && !cell.cabinet_group_id) {
								cell.cabinet_group_id = cell.cabinetGroupId;
							}
						});

						// 调试：检查每个柜格的cell_size字段
						if (cells.length > 0) {
							console.log('=== 柜格尺寸调试信息 ===');
							cells.forEach((cell, index) => {
								console.log(`柜格${index + 1}:`, {
									id: cell.id,
									cell_no: cell.cell_no,
									cell_size: cell.cell_size,
									cellSize: cell.cellSize,
									cell_size_type: typeof cell.cell_size,
									status: cell.status,
									全部字段: cell
								});

								// 检查getCellSizeText的返回值
								const sizeText = this.getCellSizeText(cell.cell_size);
								console.log(`柜格${index + 1}的尺寸文本:`, sizeText);
							});
						}

						this.cellList = cells;
						this.updateStats();

						console.log(`✅ 加载柜格列表成功，数据量：${cells.length}`);

						if (cells.length > 0) {
							uni.showToast({
								title: `加载成功，共${cells.length}个柜格`,
								icon: 'success',
								duration: 1500
							});
						} else {
							uni.showToast({
								title: '该柜组暂无柜格',
								icon: 'none',
								duration: 2000
							});
						}
					} else {
						throw new Error('服务器返回的柜格数据格式错误');
					}
				} else {
					throw new Error(response.msg || `服务器返回错误: ${response.code}`);
				}
			} catch (error) {
				console.error('❌ 加载柜格列表失败:', error);

				// 使用模拟数据作为降级方案
				console.log('⚠️ 使用模拟柜格数据作为降级方案');
				this.loadMockCellData();

				uni.showToast({
					title: '使用模拟数据',
					icon: 'none',
					duration: 2000
				});
			} finally {
				this.loading = false;
			}
		},



		// 更新统计数据
		updateStats() {
			this.totalCells = this.cellList.length;
			this.availableCells = this.cellList.filter(cell => cell.status === 'normal').length;
			this.occupiedCells = this.cellList.filter(cell => cell.status === 'inUse').length;
			this.maintenanceCells = this.cellList.filter(cell => ['abnormal', 'disabled', 'damaged'].includes(cell.status)).length;

			console.log('统计数据更新:', {
				total: this.totalCells,
				available: this.availableCells,
				occupied: this.occupiedCells,
				maintenance: this.maintenanceCells
			});

			// 根据柜格数量动态调整网格列数
			this.adjustGridColumns();
		},

		// 动态调整网格列数（保留用于统计）
		adjustGridColumns() {
			// 这个方法现在主要用于触发统计更新
			// 实际的网格布局通过CSS媒体查询控制
			console.log('柜格数据已更新，当前柜格数量:', this.cellList.length);
		},

		// 格式化柜格编号显示
		formatCellNumber(cellNo) {
			const num = parseInt(cellNo);
			return num < 10 ? `0${num}` : `${num}`;
		},

		// 获取柜格样式类
		getCellClass(status) {
			const classMap = {
				'normal': 'cell-available',
				'inUse': 'cell-occupied',
				'abnormal': 'cell-maintenance',
				'disabled': 'cell-maintenance',
				'damaged': 'cell-damaged'
			};
			return classMap[status] || 'cell-unknown';
		},

		// 获取柜格状态文本
		getCellStatusText(status) {
			const statusMap = {
				'normal': '正常',
				'inUse': '使用中',
				'abnormal': '异常',
				'disabled': '禁用',
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

		// 获取柜格尺寸样式类
		getCellSizeClass(size) {
			const sizeClassMap = {
				'small': 'cell-size-small',
				'medium': 'cell-size-medium',
				'large': 'cell-size-large'
			};
			return sizeClassMap[size] || 'cell-size-medium';
		},

		// 获取尺寸徽章样式类
		getSizeBadgeClass(size) {
			const badgeClassMap = {
				'small': 'size-badge-small',
				'medium': 'size-badge-medium',
				'large': 'size-badge-large'
			};
			return badgeClassMap[size] || 'size-badge-medium';
		},

		// 获取尺寸图标
		getSizeIcon(size) {
			const iconMap = {
				'small': '📦',
				'medium': '📋',
				'large': '🗃️'
			};
			return iconMap[size] || '📋';
		},

		// 获取状态点样式类
		getStatusDotClass(status) {
			const dotClassMap = {
				'normal': 'status-dot-normal',
				'inUse': 'status-dot-inuse',
				'abnormal': 'status-dot-abnormal',
				'disabled': 'status-dot-disabled',
				'damaged': 'status-dot-damaged'
			};
			return dotClassMap[status] || 'status-dot-normal';
		},

		// 获取状态指示器样式类
		getStatusIndicatorClass(status) {
			const indicatorClassMap = {
				'normal': 'status-indicator-normal',
				'inUse': 'status-indicator-inuse',
				'abnormal': 'status-indicator-abnormal',
				'disabled': 'status-indicator-disabled',
				'damaged': 'status-indicator-damaged'
			};
			return indicatorClassMap[status] || 'status-indicator-normal';
		},

		// 获取状态图标
		getStatusIcon(status) {
			const iconMap = {
				'normal': '✓',
				'inUse': '🔒',
				'abnormal': '⚠️',
				'disabled': '🚫',
				'damaged': '💥'
			};
			return iconMap[status] || '?';
		},

		// 获取柜格动态样式
		getCellStyle(size) {
			const sizeStyleMap = {
				'small': {
					gridColumn: 'span 1',
					gridRow: 'span 1'
				},
				'medium': {
					gridColumn: 'span 1',
					gridRow: 'span 1'
				},
				'large': {
					gridColumn: 'span 2',
					gridRow: 'span 1'
				}
			};
			return sizeStyleMap[size] || sizeStyleMap['medium'];
		},

		// 处理柜格点击 - 开门/关门操作
		handleCellClick(cell) {
			console.log('点击柜格:', cell);

			if (cell.status === 'normal') {
				// 正常状态的柜格可以开门，变为使用中
				this.openCell(cell);
			} else if (cell.status === 'inUse') {
				// 使用中的柜格可以关门，变为正常状态
				this.closeCell(cell);
			} else {
				// 其他状态显示状态信息
				uni.showToast({
					title: `柜格${cell.cell_no}: ${this.getCellStatusText(cell.status)}`,
					icon: 'none',
					duration: 2000
				});
			}
		},

		// 处理柜格长按 - 管理操作
		handleCellLongPress(cell) {
			console.log('长按柜格:', cell);
			this.selectedCell = cell;

			// 显示操作选择
			uni.showActionSheet({
				itemList: ['查看详情', '修改状态'],
				success: (res) => {
					if (res.tapIndex === 0) {
						// 查看详情
						this.showCellModal = true;
					} else if (res.tapIndex === 1) {
						// 修改状态
						this.showSingleCellStatusModal(cell);
					}
				}
			});
		},

		// 开启柜格（正常 -> 使用中）
		async openCell(cell) {
			try {
				// 调用开门API
				const response = await this.requestOpenCell(cell.id);

				if (response.code === 200 || response.code === '200') {
					// 本地更新状态，避免重新加载
					const cellIndex = this.cellList.findIndex(c => c.id === cell.id);
					if (cellIndex !== -1) {
						this.cellList[cellIndex].status = 'inUse';
						this.cellList[cellIndex].last_open_time = new Date().toISOString();
						this.updateStats();
					}

					uni.showToast({
						title: `第${this.getCellSequence(cell)}个柜格已开启`,
						icon: 'success'
					});
				} else {
					throw new Error(response.msg || '开启失败');
				}
			} catch (error) {
				console.error('开启柜格失败:', error);
				uni.showToast({
					title: error.message || '开启失败',
					icon: 'none'
				});
			}
		},

		// 关闭柜格（使用中 -> 正常）
		async closeCell(cell) {
			try {
				// 调用关门API
				const response = await this.requestCloseCell(cell.id);

				if (response.code === 200 || response.code === '200') {
					// 本地更新状态，避免重新加载
					const cellIndex = this.cellList.findIndex(c => c.id === cell.id);
					if (cellIndex !== -1) {
						this.cellList[cellIndex].status = 'normal';
						this.updateStats();
					}

					uni.showToast({
						title: `第${this.getCellSequence(cell)}个柜格已关闭`,
						icon: 'success'
					});
				} else {
					throw new Error(response.msg || '关闭失败');
				}
			} catch (error) {
				console.error('关闭柜格失败:', error);
				uni.showToast({
					title: error.message || '关闭失败',
					icon: 'none'
				});
			}
		},

		// 显示柜格详情
		showCellDetails(cell) {
			this.selectedCell = cell;
			this.showCellModal = true;
		},

		// 切换所有柜格状态
		toggleAllCells() {
			if (this.allCellsOpened) {
				// 如果都已打开，则全部关闭
				this.closeAllCells();
			} else {
				// 如果未全部打开，则全部打开
				this.openAllCells();
			}
		},

		// 全部打开操作
		openAllCells() {
			const normalCells = this.cellList.filter(cell => cell.status === 'normal');

			if (normalCells.length === 0) {
				uni.showToast({
					title: '没有可开启的柜格',
					icon: 'none'
				});
				return;
			}

			uni.showModal({
				title: '确认操作',
				content: `确定要开启所有${normalCells.length}个正常柜格吗？`,
				success: (res) => {
					if (res.confirm) {
						this.batchOpenCells(normalCells);
					}
				}
			});
		},

		// 全部关闭操作
		closeAllCells() {
			const inUseCells = this.cellList.filter(cell => cell.status === 'inUse');

			if (inUseCells.length === 0) {
				uni.showToast({
					title: '没有可关闭的柜格',
					icon: 'none'
				});
				return;
			}

			uni.showModal({
				title: '确认操作',
				content: `确定要关闭所有${inUseCells.length}个使用中的柜格吗？`,
				success: (res) => {
					if (res.confirm) {
						this.batchCloseCells(inUseCells);
					}
				}
			});
		},

		// 批量开启柜格
		async batchOpenCells(cells) {
			try {
				// 设置批量操作状态
				this.loading = true;

				const promises = cells.map(cell => this.requestOpenCell(cell.id));
				const results = await Promise.allSettled(promises);

				// 统计成功和失败的数量
				const successCount = results.filter(result =>
					result.status === 'fulfilled' &&
					(result.value.code === 200 || result.value.code === '200')
				).length;
				const failCount = cells.length - successCount;

				// 本地更新成功的柜格状态
				cells.forEach(cell => {
					const cellIndex = this.cellList.findIndex(c => c.id === cell.id);
					if (cellIndex !== -1) {
						this.cellList[cellIndex].status = 'inUse';
						this.cellList[cellIndex].last_open_time = new Date().toISOString();
					}
				});
				this.updateStats();

				if (failCount === 0) {
					uni.showToast({
						title: `成功开启${successCount}个柜格`,
						icon: 'success'
					});
				} else {
					uni.showToast({
						title: `开启${successCount}个成功，${failCount}个失败`,
						icon: 'none'
					});
				}
			} catch (error) {
				console.error('批量开启失败:', error);
				uni.showToast({
					title: '批量开启失败',
					icon: 'none'
				});
			} finally {
				this.loading = false;
			}
		},

		// 批量关闭柜格
		async batchCloseCells(cells) {
			try {
				// 设置批量操作状态
				this.loading = true;

				const promises = cells.map(cell => this.requestCloseCell(cell.id));
				const results = await Promise.allSettled(promises);

				// 统计成功和失败的数量
				const successCount = results.filter(result =>
					result.status === 'fulfilled' &&
					(result.value.code === 200 || result.value.code === '200')
				).length;
				const failCount = cells.length - successCount;

				// 本地更新成功的柜格状态
				cells.forEach(cell => {
					const cellIndex = this.cellList.findIndex(c => c.id === cell.id);
					if (cellIndex !== -1) {
						this.cellList[cellIndex].status = 'normal';
					}
				});
				this.updateStats();

				if (failCount === 0) {
					uni.showToast({
						title: `成功关闭${successCount}个柜格`,
						icon: 'success'
					});
				} else {
					uni.showToast({
						title: `关闭${successCount}个成功，${failCount}个失败`,
						icon: 'none'
					});
				}
			} catch (error) {
				console.error('批量关闭失败:', error);
				uni.showToast({
					title: '批量关闭失败',
					icon: 'none'
				});
			} finally {
				this.loading = false;
			}
		},

		// 显示柜组状态报告
		showReport() {
			const report = {
				total: this.totalCells,
				available: this.availableCells,
				occupied: this.occupiedCells,
				maintenance: this.maintenanceCells,
				utilization: this.totalCells > 0 ? ((this.occupiedCells / this.totalCells) * 100).toFixed(1) : 0
			};

			const content = `总柜格: ${report.total}个\n可用: ${report.available}个\n使用中: ${report.occupied}个\n维护中: ${report.maintenance}个\n使用率: ${report.utilization}%`;

			uni.showModal({
				title: '柜组状态报告',
				content: content,
				showCancel: false,
				confirmText: '确定'
			});
		},

		// 切换视图模式
		toggleViewMode() {
			this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';

			// 保存用户偏好
			uni.setStorageSync('cellViewMode', this.viewMode);

			uni.showToast({
				title: `已切换到${this.viewMode === 'grid' ? '网格' : '列表'}模式`,
				icon: 'none',
				duration: 1500
			});
		},

		// 获取列表项样式类
		getListItemClass(status) {
			return `list-item-${status}`;
		},

		// 获取柜格序号（第几个柜格）
		getCellSequence(cell) {
			const sortedList = this.sortedCellList;
			const index = sortedList.findIndex(c => c.id === cell.id);
			return index + 1;
		},

		// 显示状态修改弹窗
		showStatusModalDialog() {
			console.log('=== 点击修改状态按钮 ===');
			console.log('当前showStatusModal值:', this.showStatusModal);

			// 先显示一个简单的提示，确认点击事件有效
			uni.showToast({
				title: '修改状态按钮被点击',
				icon: 'none',
				duration: 1000
			});

			this.showStatusModal = true;
			this.selectedStatus = '';

			console.log('设置后showStatusModal值:', this.showStatusModal);

			// 延迟一下再检查
			setTimeout(() => {
				console.log('延迟检查showStatusModal值:', this.showStatusModal);
			}, 100);
		},

		// 隐藏状态修改弹窗
		hideStatusModal() {
			this.showStatusModal = false;
			this.selectedStatus = '';
		},

		// 显示单个柜格状态修改弹窗
		showSingleCellStatusModal(cell) {
			console.log('显示单个柜格状态修改弹窗:', cell);
			this.selectedCellForStatus = cell;
			this.selectedStatus = cell.status; // 预选当前状态
			this.showSingleStatusModal = true;
		},

		// 隐藏单个柜格状态修改弹窗
		hideSingleStatusModal() {
			this.showSingleStatusModal = false;
			this.selectedCellForStatus = null;
			this.selectedStatus = '';
		},

		// 选择状态
		selectStatus(status) {
			this.selectedStatus = status;
		},

		// 确认批量状态修改
		async confirmStatusChange() {
			if (!this.selectedStatus) {
				uni.showToast({
					title: '请选择要修改的状态',
					icon: 'none'
				});
				return;
			}

			try {
				this.loading = true;

				// 获取所有柜格
				const promises = this.cellList.map(cell => this.requestUpdateCellStatus(cell.id, this.selectedStatus));
				const results = await Promise.allSettled(promises);

				// 统计成功和失败的数量
				const successCount = results.filter(result =>
					result.status === 'fulfilled' &&
					(result.value.code === 200 || result.value.code === '200')
				).length;
				const failCount = this.cellList.length - successCount;

				// 本地更新成功的柜格状态
				this.cellList.forEach(cell => {
					cell.status = this.selectedStatus;
					cell.update_time = new Date().toISOString();
				});
				this.updateStats();

				// 隐藏弹窗
				this.hideStatusModal();

				// 显示结果
				if (failCount === 0) {
					uni.showToast({
						title: `成功修改${successCount}个柜格状态`,
						icon: 'success'
					});
				} else {
					uni.showToast({
						title: `修改${successCount}个成功，${failCount}个失败`,
						icon: 'none'
					});
				}
			} catch (error) {
				console.error('批量修改状态失败:', error);
				uni.showToast({
					title: '批量修改状态失败',
					icon: 'none'
				});
			} finally {
				this.loading = false;
			}
		},

		// 确认单个柜格状态修改
		async confirmSingleStatusChange() {
			if (!this.selectedStatus || !this.selectedCellForStatus) {
				uni.showToast({
					title: '请选择要修改的状态',
					icon: 'none'
				});
				return;
			}

			const cell = this.selectedCellForStatus;
			const oldStatus = cell.status;
			const newStatus = this.selectedStatus;

			// 如果状态没有变化，直接返回
			if (oldStatus === newStatus) {
				uni.showToast({
					title: '状态未发生变化',
					icon: 'none'
				});
				this.hideSingleStatusModal();
				return;
			}

			try {
				// 调用API更新状态
				const response = await this.requestUpdateCellStatus(cell.id, newStatus);

				if (response.code === 200 || response.code === '200') {
					// 本地更新状态
					const cellIndex = this.cellList.findIndex(c => c.id === cell.id);
					if (cellIndex !== -1) {
						this.cellList[cellIndex].status = newStatus;
						this.cellList[cellIndex].update_time = new Date().toISOString();
						this.updateStats();
					}

					// 隐藏弹窗
					this.hideSingleStatusModal();

					// 显示成功提示
					uni.showToast({
						title: `第${this.getCellSequence(cell)}个柜格状态已修改为${this.getCellStatusText(newStatus)}`,
						icon: 'success'
					});
				} else {
					throw new Error(response.msg || '修改状态失败');
				}
			} catch (error) {
				console.error('修改单个柜格状态失败:', error);
				uni.showToast({
					title: error.message || '修改状态失败',
					icon: 'none'
				});
			}
		},

		// 隐藏柜格详情弹窗
		hideCellModal() {
			this.showCellModal = false;
			this.selectedCell = null;
		},

		// 获取柜格操作文本
		getCellActionText(status) {
			const actionMap = {
				'normal': '设为维护',
				'abnormal': '设为正常',
				'disabled': '启用柜格',
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
				case 'normal':
					newStatus = 'abnormal';
					actionText = '设为异常状态';
					break;
				case 'abnormal':
					newStatus = 'normal';
					actionText = '设为正常状态';
					break;
				case 'disabled':
					newStatus = 'normal';
					actionText = '启用柜格';
					break;
				case 'damaged':
					newStatus = 'normal';
					actionText = '标记为已修复';
					break;
				default:
					return;
			}

			uni.showModal({
				title: '确认操作',
				content: `确定要将柜格 ${this.formatCellNumber(cell.cell_no)} ${actionText}吗？`,
				success: (res) => {
					if (res.confirm) {
						this.updateCellStatus(cell.id, newStatus);
					}
				}
			});
		},

		// 请求开启柜格API
		requestOpenCell(cellId) {
			return new Promise((resolve, reject) => {
				console.log('=== 开始请求开启柜格 ===');
				console.log('柜格ID:', cellId);

				// 获取token
				const token = uni.getStorageSync('token') || uni.getStorageSync('adminToken') || '';

				const requestData = {
					id: cellId
				};

				console.log('开门请求参数:', requestData);

				uni.request({
					url: `${this.apiBaseUrl}/v1/cabinet-cell/open`,
					method: 'POST',
					header: {
						'Content-Type': 'application/json',
						'Authorization': token ? `Bearer ${token}` : ''
					},
					data: requestData,
					timeout: 10000,
					success: (res) => {
						console.log('=== 开门API响应 ===');
						console.log('HTTP状态码:', res.statusCode);
						console.log('响应数据:', res.data);

						if (res.statusCode === 200) {
							resolve(res.data);
						} else {
							reject(new Error(`HTTP ${res.statusCode}: ${res.data?.msg || '开门失败'}`));
						}
					},
					fail: (err) => {
						console.error('=== 开门API请求失败 ===');
						console.error('错误:', err);
						reject(new Error(err.errMsg || '网络请求失败'));
					}
				});
			});
		},

		// 请求关闭柜格API
		requestCloseCell(cellId) {
			return new Promise((resolve, reject) => {
				console.log('=== 开始请求关闭柜格 ===');
				console.log('柜格ID:', cellId);

				// 获取token
				const token = uni.getStorageSync('token') || uni.getStorageSync('adminToken') || '';

				const requestData = {
					id: cellId
				};

				console.log('关门请求参数:', requestData);

				uni.request({
					url: `${this.apiBaseUrl}/v1/cabinet-cell/close`,
					method: 'POST',
					header: {
						'Content-Type': 'application/json',
						'Authorization': token ? `Bearer ${token}` : ''
					},
					data: requestData,
					timeout: 10000,
					success: (res) => {
						console.log('=== 关门API响应 ===');
						console.log('HTTP状态码:', res.statusCode);
						console.log('响应数据:', res.data);

						if (res.statusCode === 200) {
							resolve(res.data);
						} else {
							reject(new Error(`HTTP ${res.statusCode}: ${res.data?.msg || '关门失败'}`));
						}
					},
					fail: (err) => {
						console.error('=== 关门API请求失败 ===');
						console.error('错误:', err);
						reject(new Error(err.errMsg || '网络请求失败'));
					}
				});
			});
		},

		// 请求更新柜格状态API
		requestUpdateCellStatus(cellId, status) {
			return new Promise((resolve, reject) => {
				console.log('=== 开始请求更新柜格状态 ===');
				console.log('柜格ID:', cellId, '新状态:', status);

				// 获取token
				const token = uni.getStorageSync('token') || uni.getStorageSync('adminToken') || '';

				const requestData = {
					id: cellId,
					status: status
				};

				console.log('更新状态请求参数:', requestData);

				uni.request({
					url: `${this.apiBaseUrl}/v1/cabinet-cell/update`,
					method: 'PUT',
					header: {
						'Content-Type': 'application/json',
						'Authorization': token ? `Bearer ${token}` : ''
					},
					data: requestData,
					timeout: 10000,
					success: (res) => {
						console.log('=== 更新状态API响应 ===');
						console.log('HTTP状态码:', res.statusCode);
						console.log('响应数据:', res.data);

						if (res.statusCode === 200) {
							resolve(res.data);
						} else {
							reject(new Error(`HTTP ${res.statusCode}: ${res.data?.msg || '更新状态失败'}`));
						}
					},
					fail: (err) => {
						console.error('=== 更新状态API请求失败 ===');
						console.error('错误:', err);
						reject(new Error(err.errMsg || '网络请求失败'));
					}
				});
			});
		},

		// 加载模拟柜格数据
		loadMockCellData() {
			console.log('🎭 使用模拟柜格数据作为降级方案');

			const mockCells = [
				{
					id: 1,
					cabinet_group_id: 1,
					cell_no: 1,
					cell_size: 'small',
					status: 'normal',
					last_open_time: '2024-01-15T10:00:00Z',
					create_time: '2024-01-15T10:00:00Z',
					update_time: '2024-01-15T10:00:00Z'
				},
				{
					id: 2,
					cabinet_group_id: 1,
					cell_no: 2,
					cell_size: 'medium',
					status: 'normal',
					last_open_time: '2024-01-15T10:00:00Z',
					create_time: '2024-01-15T10:00:00Z',
					update_time: '2024-01-15T10:00:00Z'
				},
				{
					id: 3,
					cabinet_group_id: 1,
					cell_no: 3,
					cell_size: 'large',
					status: 'inUse',
					last_open_time: '2024-01-15T10:00:00Z',
					create_time: '2024-01-15T10:00:00Z',
					update_time: '2024-01-15T10:00:00Z'
				},
				{
					id: 4,
					cabinet_group_id: 1,
					cell_no: 4,
					cell_size: 'small',
					status: 'normal',
					last_open_time: '2024-01-15T10:00:00Z',
					create_time: '2024-01-15T10:00:00Z',
					update_time: '2024-01-15T10:00:00Z'
				},
				{
					id: 5,
					cabinet_group_id: 1,
					cell_no: 5,
					cell_size: 'medium',
					status: 'abnormal',
					last_open_time: '2024-01-15T10:00:00Z',
					create_time: '2024-01-15T10:00:00Z',
					update_time: '2024-01-15T10:00:00Z'
				},
				{
					id: 6,
					cabinet_group_id: 1,
					cell_no: 6,
					cell_size: 'large',
					status: 'normal',
					last_open_time: '2024-01-15T10:00:00Z',
					create_time: '2024-01-15T10:00:00Z',
					update_time: '2024-01-15T10:00:00Z'
				},
				{
					id: 7,
					cabinet_group_id: 1,
					cell_no: 7,
					cell_size: 'small',
					status: 'disabled',
					last_open_time: '2024-01-15T10:00:00Z',
					create_time: '2024-01-15T10:00:00Z',
					update_time: '2024-01-15T10:00:00Z'
				},
				{
					id: 8,
					cabinet_group_id: 1,
					cell_no: 8,
					cell_size: 'medium',
					status: 'normal',
					last_open_time: '2024-01-15T10:00:00Z',
					create_time: '2024-01-15T10:00:00Z',
					update_time: '2024-01-15T10:00:00Z'
				},
				{
					id: 9,
					cabinet_group_id: 1,
					cell_no: 9,
					cell_size: 'large',
					status: 'damaged',
					last_open_time: '2024-01-15T10:00:00Z',
					create_time: '2024-01-15T10:00:00Z',
					update_time: '2024-01-15T10:00:00Z'
				},
				{
					id: 10,
					cabinet_group_id: 1,
					cell_no: 10,
					cell_size: 'medium',
					status: 'normal',
					last_open_time: '2024-01-15T10:00:00Z',
					create_time: '2024-01-15T10:00:00Z',
					update_time: '2024-01-15T10:00:00Z'
				}
			];

			this.cellList = mockCells;
			this.updateStats();

			// 显示模拟数据提示
			console.log('✅ 模拟数据加载完成，共', mockCells.length, '个柜格');
			console.log('模拟数据详情:', mockCells);
		},

		// 请求柜格列表API
		requestCellList() {
			return new Promise((resolve, reject) => {
				console.log('=== 开始请求柜格列表 ===');

				// 获取token
				const token = uni.getStorageSync('token') || uni.getStorageSync('adminToken') || '';

				console.log('groupId原始值:', this.groupId);
				console.log('groupId转换后:', parseInt(this.groupId));
				console.log('请求URL:', `${this.apiBaseUrl}/v1/cabinet-cell/by-group?cabinet_group_id=${this.groupId}`);
				console.log('使用Token:', token ? '已设置' : '未设置');

				// 使用专门的根据柜组获取柜格的API
				uni.request({
					url: `${this.apiBaseUrl}/v1/cabinet-cell/by-group?cabinet_group_id=${this.groupId}`,
					method: 'GET',
					header: {
						'Content-Type': 'application/json',
						'Authorization': token ? `Bearer ${token}` : ''
					},
					timeout: 15000,
					success: (res) => {
						console.log('=== 柜格列表API响应 ===');
						console.log('HTTP状态码:', res.statusCode);
						console.log('响应头:', res.header);
						console.log('响应数据类型:', typeof res.data);
						console.log('响应数据:', res.data);

						if (res.statusCode === 200) {
							if (res.data && typeof res.data === 'object') {
								console.log('✅ 响应数据格式正确');
								resolve(res.data);
							} else {
								console.error('❌ 响应数据格式错误:', res.data);
								reject(new Error('响应数据格式错误'));
							}
						} else {
							console.error('❌ HTTP状态码错误:', res.statusCode);
							reject(new Error(`HTTP ${res.statusCode}: ${res.data?.msg || '请求失败'}`));
						}
					},
					fail: (err) => {
						console.error('=== 柜格列表API请求失败 ===');
						console.error('错误对象:', err);
						console.error('错误消息:', err.errMsg);

						// 分析错误类型
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
		},

		// 强制使用模拟数据进行测试
		testMockData() {
			console.log('🧪 强制使用模拟数据进行测试');
			this.loadMockCellData();

			uni.showToast({
				title: '已加载模拟数据',
				icon: 'success',
				duration: 2000
			});
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

.nav-left,
.nav-right {
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

/* 增强的操作按钮区域 */
.action-section-enhanced {
	margin: 20rpx;
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 24rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 20rpx;
}

/* 主要操作按钮 */
.primary-actions {
	display: flex;
	gap: 12rpx;
	flex: 1;
}

.action-btn-primary {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 12rpx 16rpx;
	border-radius: 12rpx;
	border: none;
	font-size: 24rpx;
	font-weight: 500;
	color: #ffffff;
	background: linear-gradient(135deg, #1890ff, #40a9ff);
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	flex: 1;
	justify-content: center;
	box-shadow: 0 2rpx 8rpx rgba(24, 144, 255, 0.3);
}

.action-btn-primary:active {
	transform: scale(0.98);
	box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.4);
}

.action-btn-primary.refresh {
	background: linear-gradient(135deg, #52c41a, #73d13d);
	box-shadow: 0 2rpx 8rpx rgba(82, 196, 26, 0.3);
}

.action-btn-primary.toggle-all {
	background: linear-gradient(135deg, #faad14, #ffc53d);
	box-shadow: 0 2rpx 8rpx rgba(250, 173, 20, 0.3);
}

.action-btn-primary.view-mode {
	background: linear-gradient(135deg, #722ed1, #9254de);
	box-shadow: 0 2rpx 8rpx rgba(114, 46, 209, 0.3);
}

.btn-icon {
	font-size: 28rpx;
}

.btn-text {
	font-size: 24rpx;
	font-weight: 500;
}

/* 次要操作按钮 */
.secondary-actions {
	display: flex;
	gap: 8rpx;
}

.action-btn-secondary {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 56rpx;
	height: 56rpx;
	border-radius: 50%;
	border: none;
	background-color: #f8f9fa;
	color: #666666;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.08);
}

.action-btn-secondary:active {
	transform: scale(0.95);
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

.action-btn-secondary.report {
	background: linear-gradient(135deg, #fff7e6, #ffffff);
	color: #fa8c16;
}

.action-btn-secondary.modify-status {
	background: linear-gradient(135deg, #fff0f6, #ffffff);
	color: #eb2f96;
}

.btn-icon-secondary {
	font-size: 24rpx;
}

/* 状态说明 */
.status-legend {
	margin: 20rpx;
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 30rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.legend-title {
	font-size: 26rpx;
	color: #333333;
	margin-bottom: 20rpx;
	text-align: center;
}

.legend-items {
	display: flex;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 15rpx;
}

.legend-item {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.legend-color {
	width: 24rpx;
	height: 24rpx;
	border-radius: 4rpx;
}

.legend-color.normal {
	background-color: #52c41a;
}

.legend-color.in-use {
	background-color: #faad14;
}

.legend-color.abnormal {
	background-color: #ff7875;
}

.legend-color.disabled {
	background-color: #d9d9d9;
}

.legend-color.damaged {
	background-color: #ff4d4f;
}

.legend-text {
	font-size: 22rpx;
	color: #666666;
}

/* 柜格容器 */
.cells-container {
	margin: 20rpx;
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 30rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

/* 空状态样式 */
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 80rpx 40rpx;
	text-align: center;
}

.empty-icon {
	font-size: 120rpx;
	margin-bottom: 30rpx;
	opacity: 0.6;
}

.empty-title {
	font-size: 32rpx;
	color: #333333;
	font-weight: bold;
	margin-bottom: 15rpx;
}

.empty-desc {
	font-size: 26rpx;
	color: #999999;
	margin-bottom: 40rpx;
	line-height: 1.5;
}

.empty-retry-btn {
	padding: 20rpx 40rpx;
	background-color: #1890ff;
	color: #ffffff;
	border-radius: 8rpx;
	border: none;
	font-size: 28rpx;
	font-weight: 500;
}

/* 加载状态样式 */
.loading-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 80rpx 40rpx;
	text-align: center;
}

.loading-icon {
	font-size: 80rpx;
	color: #1890ff;
	margin-bottom: 20rpx;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	from {
		transform: rotate(0deg);
	}

	to {
		transform: rotate(360deg);
	}
}

/* 柜格动画效果 */
@keyframes cellPulse {
	0% {
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
	}
	50% {
		box-shadow: 0 4rpx 16rpx rgba(24, 144, 255, 0.2);
	}
	100% {
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
	}
}

@keyframes statusDotBlink {
	0%, 100% {
		opacity: 1;
	}
	50% {
		opacity: 0.5;
	}
}

/* 为使用中的柜格添加脉冲效果 */
.cell-occupied {
	animation: cellPulse 2s ease-in-out infinite;
}

.cell-occupied .status-dot-inuse {
	animation: statusDotBlink 1.5s ease-in-out infinite;
}

/* 为异常柜格添加警告动画 */
.cell-maintenance .status-dot-abnormal,
.cell-damaged .status-dot-damaged {
	animation: statusDotBlink 1s ease-in-out infinite;
}

/* 悬停效果增强 */
.cell-item-enhanced:hover {
	transform: translateY(-2rpx);
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 点击反馈动画 */
@keyframes clickFeedback {
	0% {
		transform: scale(1);
	}
	50% {
		transform: scale(0.95);
	}
	100% {
		transform: scale(1);
	}
}

.cell-item-enhanced:active {
	animation: clickFeedback 0.2s ease-out;
}

.loading-text {
	font-size: 28rpx;
	color: #666666;
}

/* 优化的柜格网格布局 */
.cells-grid-optimized {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(160rpx, 1fr));
	gap: 20rpx;
	padding: 10rpx;
}

/* 增强的柜格项目 */
.cell-item-enhanced {
	position: relative;
	background: #ffffff;
	border-radius: 16rpx;
	padding: 0;
	border: 2rpx solid #e8e8e8;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	overflow: hidden;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.cell-item-enhanced:active {
	transform: scale(0.98);
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.12);
}

/* 柜格主体内容 */
.cell-main-content {
	padding: 16rpx;
	display: flex;
	flex-direction: column;
	height: 100%;
	min-height: 140rpx;
}

/* 柜格头部 */
.cell-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 12rpx;
}

/* 尺寸徽章 */
.cell-size-badge {
	display: flex;
	align-items: center;
	gap: 4rpx;
	padding: 4rpx 8rpx;
	border-radius: 8rpx;
	font-size: 18rpx;
	font-weight: 600;
}

.size-badge-small {
	background: linear-gradient(135deg, #52c41a, #73d13d);
	color: #ffffff;
}

.size-badge-medium {
	background: linear-gradient(135deg, #1890ff, #40a9ff);
	color: #ffffff;
}

.size-badge-large {
	background: linear-gradient(135deg, #faad14, #ffc53d);
	color: #ffffff;
}

.size-badge-icon {
	font-size: 16rpx;
}

.size-badge-text {
	font-size: 16rpx;
	font-weight: 600;
}

/* 状态点 */
.cell-status-dot {
	width: 12rpx;
	height: 12rpx;
	border-radius: 50%;
	flex-shrink: 0;
}

.status-dot-normal {
	background-color: #52c41a;
	box-shadow: 0 0 8rpx rgba(82, 196, 26, 0.4);
}

.status-dot-inuse {
	background-color: #faad14;
	box-shadow: 0 0 8rpx rgba(250, 173, 20, 0.4);
}

.status-dot-abnormal {
	background-color: #ff7875;
	box-shadow: 0 0 8rpx rgba(255, 120, 117, 0.4);
}

.status-dot-disabled {
	background-color: #d9d9d9;
}

.status-dot-damaged {
	background-color: #ff4d4f;
	box-shadow: 0 0 8rpx rgba(255, 77, 79, 0.4);
}

/* 柜格主体 */
.cell-body {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	text-align: center;
	margin: 8rpx 0;
}

.cell-number-enhanced {
	font-size: 42rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 4rpx;
	line-height: 1.2;
}

.cell-status-text {
	font-size: 22rpx;
	color: #666666;
	font-weight: 500;
}

/* 柜格底部 */
.cell-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 8rpx;
}

.cell-sequence-text {
	font-size: 18rpx;
	color: #999999;
}

.cell-action-hint {
	padding: 2rpx 6rpx;
	background-color: rgba(24, 144, 255, 0.1);
	border-radius: 4rpx;
}

.action-hint-text {
	font-size: 16rpx;
	color: #1890ff;
	font-weight: 500;
}

/* 状态指示器 */
.cell-status-indicator {
	position: absolute;
	top: -2rpx;
	right: -2rpx;
	width: 32rpx;
	height: 32rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 16rpx;
	font-weight: bold;
	border: 2rpx solid #ffffff;
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.15);
}

.status-indicator-normal {
	background: linear-gradient(135deg, #52c41a, #73d13d);
	color: #ffffff;
}

.status-indicator-inuse {
	background: linear-gradient(135deg, #faad14, #ffc53d);
	color: #ffffff;
}

.status-indicator-abnormal {
	background: linear-gradient(135deg, #ff7875, #ff9c6e);
	color: #ffffff;
}

.status-indicator-disabled {
	background: linear-gradient(135deg, #d9d9d9, #f0f0f0);
	color: #666666;
}

.status-indicator-damaged {
	background: linear-gradient(135deg, #ff4d4f, #ff7875);
	color: #ffffff;
}

.status-indicator-icon {
	font-size: 14rpx;
}

/* 不同尺寸柜格的特殊样式 */
.cell-size-small .cell-main-content {
	min-height: 120rpx;
}

.cell-size-small .cell-number-enhanced {
	font-size: 36rpx;
}

.cell-size-small .cell-status-text {
	font-size: 20rpx;
}

.cell-size-medium .cell-main-content {
	min-height: 140rpx;
}

.cell-size-medium .cell-number-enhanced {
	font-size: 42rpx;
}

.cell-size-medium .cell-status-text {
	font-size: 22rpx;
}

.cell-size-large .cell-main-content {
	min-height: 160rpx;
}

.cell-size-large .cell-number-enhanced {
	font-size: 48rpx;
	font-weight: 900;
}

.cell-size-large .cell-status-text {
	font-size: 24rpx;
}

.cell-item:active {
	transform: scale(0.95);
}

/* 柜格类型标识 */
.cell-type-badge {
	position: absolute;
	top: 5rpx;
	right: 5rpx;
	display: flex;
	align-items: center;
	gap: 4rpx;
	padding: 4rpx 8rpx;
	border-radius: 8rpx;
	font-size: 18rpx;
	font-weight: 600;
	z-index: 2;
}

.type-badge-small {
	background: linear-gradient(135deg, #52c41a, #73d13d);
	color: #ffffff;
}

.type-badge-medium {
	background: linear-gradient(135deg, #1890ff, #40a9ff);
	color: #ffffff;
}

.type-badge-large {
	background: linear-gradient(135deg, #faad14, #ffc53d);
	color: #ffffff;
}

.type-badge-icon {
	font-size: 16rpx;
}

.type-badge-text {
	font-size: 16rpx;
	font-weight: 600;
}

.cell-number {
	display: block;
	font-size: 36rpx;
	font-weight: bold;
	color: #ffffff;
	margin-bottom: 6rpx;
	text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.3);
}

.cell-status {
	display: block;
	font-size: 20rpx;
	color: #ffffff;
	font-weight: 500;
	margin-bottom: 2rpx;
}

.cell-size-indicator {
	position: absolute;
	bottom: 8rpx;
	left: 8rpx;
	background-color: rgba(0, 0, 0, 0.6);
	color: #ffffff;
	font-size: 16rpx;
	padding: 4rpx 8rpx;
	border-radius: 6rpx;
}

.size-text {
	font-size: 16rpx;
	color: #ffffff;
}

.cell-sequence {
	position: absolute;
	top: 8rpx;
	left: 8rpx;
	background-color: rgba(0, 0, 0, 0.7);
	color: #ffffff;
	font-size: 16rpx;
	padding: 4rpx 8rpx;
	border-radius: 6rpx;
}

.sequence-text {
	font-size: 16rpx;
	color: #ffffff;
	font-weight: bold;
}

.cell-indicator {
	position: absolute;
	top: 8rpx;
	right: 8rpx;
	background-color: rgba(0, 0, 0, 0.6);
	color: #ffffff;
	font-size: 16rpx;
	padding: 4rpx 8rpx;
	border-radius: 6rpx;
}

.indicator-text {
	font-size: 16rpx;
	color: #ffffff;
}

/* 柜格状态样式 - 现代化设计 */
.cell-available {
	border-color: #52c41a;
	background: linear-gradient(135deg, #f6ffed, #ffffff);
	box-shadow: 0 4rpx 16rpx rgba(82, 196, 26, 0.15);
}

.cell-available:hover {
	border-color: #73d13d;
	box-shadow: 0 6rpx 20rpx rgba(82, 196, 26, 0.25);
}

.cell-available .cell-number-enhanced {
	color: #52c41a;
}

.cell-available .cell-status-text {
	color: #52c41a;
}

.cell-occupied {
	border-color: #faad14;
	background: linear-gradient(135deg, #fff7e6, #ffffff);
	box-shadow: 0 4rpx 16rpx rgba(250, 173, 20, 0.15);
}

.cell-occupied:hover {
	border-color: #ffc53d;
	box-shadow: 0 6rpx 20rpx rgba(250, 173, 20, 0.25);
}

.cell-occupied .cell-number-enhanced {
	color: #faad14;
}

.cell-occupied .cell-status-text {
	color: #faad14;
}

.cell-maintenance {
	border-color: #ff7875;
	background: linear-gradient(135deg, #fff2f0, #ffffff);
	box-shadow: 0 4rpx 16rpx rgba(255, 120, 117, 0.15);
}

.cell-maintenance:hover {
	border-color: #ff9c6e;
	box-shadow: 0 6rpx 20rpx rgba(255, 120, 117, 0.25);
}

.cell-maintenance .cell-number-enhanced {
	color: #ff7875;
}

.cell-maintenance .cell-status-text {
	color: #ff7875;
}

.cell-damaged {
	border-color: #ff4d4f;
	background: linear-gradient(135deg, #fff1f0, #ffffff);
	box-shadow: 0 4rpx 16rpx rgba(255, 77, 79, 0.15);
}

.cell-damaged:hover {
	border-color: #ff7875;
	box-shadow: 0 6rpx 20rpx rgba(255, 77, 79, 0.25);
}

.cell-damaged .cell-number-enhanced {
	color: #ff4d4f;
}

.cell-damaged .cell-status-text {
	color: #ff4d4f;
}

.cell-unknown {
	border-color: #d9d9d9;
	background: linear-gradient(135deg, #fafafa, #ffffff);
	box-shadow: 0 4rpx 16rpx rgba(217, 217, 217, 0.15);
}

.cell-unknown .cell-number-enhanced {
	color: #999999;
}

.cell-unknown .cell-status-text {
	color: #999999;
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
	.cells-grid-optimized {
		grid-template-columns: repeat(auto-fit, minmax(140rpx, 1fr));
		gap: 16rpx;
	}

	.cell-main-content {
		padding: 12rpx;
	}

	.cell-size-small .cell-main-content {
		min-height: 100rpx;
	}

	.cell-size-small .cell-number-enhanced {
		font-size: 32rpx;
	}

	.cell-size-small .cell-status-text {
		font-size: 18rpx;
	}

	.cell-size-medium .cell-main-content {
		min-height: 120rpx;
	}

	.cell-size-medium .cell-number-enhanced {
		font-size: 36rpx;
	}

	.cell-size-medium .cell-status-text {
		font-size: 20rpx;
	}

	.cell-size-large .cell-main-content {
		min-height: 140rpx;
	}

	.cell-size-large .cell-number-enhanced {
		font-size: 42rpx;
	}

	.cell-size-large .cell-status-text {
		font-size: 22rpx;
	}

	.action-section-enhanced {
		flex-direction: column;
		gap: 16rpx;
	}

	.primary-actions {
		width: 100%;
		gap: 10rpx;
	}

	.action-btn-primary {
		padding: 10rpx 12rpx;
		font-size: 22rpx;
	}

	.btn-icon {
		font-size: 24rpx;
	}

	.btn-text {
		font-size: 20rpx;
	}

	.secondary-actions {
		justify-content: center;
		gap: 12rpx;
	}

	.action-btn-secondary {
		width: 48rpx;
		height: 48rpx;
	}

	.btn-icon-secondary {
		font-size: 20rpx;
	}
}

@media screen and (max-width: 600rpx) {
	.cells-grid-optimized {
		grid-template-columns: repeat(auto-fit, minmax(120rpx, 1fr));
		gap: 12rpx;
	}

	.cell-main-content {
		padding: 10rpx;
	}

	.cell-size-badge {
		padding: 2rpx 6rpx;
	}

	.size-badge-text {
		font-size: 14rpx;
	}

	.cell-sequence-text {
		font-size: 16rpx;
	}

	.action-hint-text {
		font-size: 14rpx;
	}

	.action-section-enhanced {
		padding: 16rpx;
	}

	.primary-actions {
		flex-direction: column;
		gap: 8rpx;
	}

	.action-btn-primary {
		padding: 8rpx 12rpx;
		font-size: 20rpx;
	}

	.btn-text {
		font-size: 18rpx;
	}

	.secondary-actions {
		flex-direction: row;
		gap: 8rpx;
	}

	.action-btn-secondary {
		width: 44rpx;
		height: 44rpx;
	}

	.btn-icon-secondary {
		font-size: 18rpx;
	}
}

@media screen and (max-width: 600rpx) {
	.cells-grid-flexible {
		grid-template-columns: repeat(2, 1fr);
	}

	.legend-items {
		justify-content: center;
		gap: 20rpx;
	}

	.legend-item {
		flex-basis: 45%;
		justify-content: center;
	}

	.stats-section {
		flex-wrap: wrap;
		gap: 20rpx;
	}

	.stat-item {
		flex-basis: 45%;
	}
}

/* 列表模式样式 */
.cells-list {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.list-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx;
	background-color: #f8f9fa;
	border-radius: 12rpx;
	border-left: 6rpx solid transparent;
	transition: all 0.3s ease;
}

.list-item:active {
	transform: scale(0.98);
}

.list-item-left {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.list-cell-number {
	background: linear-gradient(135deg, #1890ff, #40a9ff);
	color: #ffffff;
	border-radius: 12rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: bold;
	text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.3);
	position: relative;
}

/* 列表模式的类型标识 */
.list-type-badge {
	position: absolute;
	top: -8rpx;
	right: -8rpx;
	width: 24rpx;
	height: 24rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 2rpx solid #ffffff;
}

.list-type-badge.type-badge-small {
	background: linear-gradient(135deg, #52c41a, #73d13d);
}

.list-type-badge.type-badge-medium {
	background: linear-gradient(135deg, #1890ff, #40a9ff);
}

.list-type-badge.type-badge-large {
	background: linear-gradient(135deg, #faad14, #ffc53d);
}

.list-type-icon {
	font-size: 12rpx;
	color: #ffffff;
}

/* 列表模式中不同尺寸的柜格编号显示 */
.list-cell-number.cell-size-small {
	width: 70rpx;
	height: 70rpx;
	font-size: 28rpx;
}

.list-cell-number.cell-size-medium {
	width: 80rpx;
	height: 80rpx;
	font-size: 32rpx;
}

.list-cell-number.cell-size-large {
	width: 90rpx;
	height: 90rpx;
	font-size: 36rpx;
}

.list-cell-info {
	display: flex;
	flex-direction: column;
	gap: 6rpx;
}

.list-cell-sequence {
	font-size: 24rpx;
	color: #1890ff;
	font-weight: bold;
	margin-bottom: 4rpx;
}

.list-cell-size {
	font-size: 28rpx;
	color: #333333;
	font-weight: 500;
}

.list-cell-time {
	font-size: 22rpx;
	color: #999999;
}

.list-item-right {
	display: flex;
	align-items: center;
	gap: 15rpx;
}

.list-status-badge {
	padding: 8rpx 16rpx;
	border-radius: 20rpx;
	font-size: 22rpx;
	font-weight: 500;
	color: #ffffff;
}

.list-status-badge.cell-available {
	background: linear-gradient(135deg, #52c41a, #73d13d);
}

.list-status-badge.cell-occupied {
	background: linear-gradient(135deg, #faad14, #ffc53d);
}

.list-status-badge.cell-maintenance {
	background: linear-gradient(135deg, #ff7875, #ff9c6e);
}

.list-status-badge.cell-damaged {
	background: linear-gradient(135deg, #ff4d4f, #ff7875);
}

.list-status-badge.cell-unknown {
	background: linear-gradient(135deg, #d9d9d9, #f0f0f0);
	color: #666666;
}

.list-arrow {
	font-size: 32rpx;
	color: #d9d9d9;
}

/* 列表模式状态指示 */
.list-item-normal {
	border-left-color: #52c41a;
	background-color: #f6ffed;
}

.list-item-inUse {
	border-left-color: #faad14;
	background-color: #fffbe6;
}

.list-item-abnormal,
.list-item-disabled {
	border-left-color: #ff7875;
	background-color: #fff2f0;
}

.list-item-damaged {
	border-left-color: #ff4d4f;
	background-color: #fff1f0;
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

.detail-value-with-badge {
	display: flex;
	align-items: center;
	gap: 15rpx;
}

.detail-type-badge {
	display: flex;
	align-items: center;
	gap: 6rpx;
	padding: 6rpx 12rpx;
	border-radius: 12rpx;
	font-size: 20rpx;
	font-weight: 600;
}

.detail-type-badge.type-badge-small {
	background: linear-gradient(135deg, #52c41a, #73d13d);
	color: #ffffff;
}

.detail-type-badge.type-badge-medium {
	background: linear-gradient(135deg, #1890ff, #40a9ff);
	color: #ffffff;
}

.detail-type-badge.type-badge-large {
	background: linear-gradient(135deg, #faad14, #ffc53d);
	color: #ffffff;
}

.detail-badge-icon {
	font-size: 18rpx;
}

.detail-badge-text {
	font-size: 18rpx;
	font-weight: 600;
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

/* 状态修改弹窗样式 */
.status-modal-content {
	background-color: #ffffff;
	border-radius: 16rpx;
	width: 90%;
	max-width: 600rpx;
	max-height: 80vh;
	overflow: hidden;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.2);
	z-index: 1001;
}

.status-modal-header {
	padding: 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
	text-align: center;
}

.status-modal-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 8rpx;
}

.status-modal-subtitle {
	font-size: 24rpx;
	color: #666666;
	text-align: center;
}

.status-options {
	padding: 20rpx;
	max-height: 500rpx;
	overflow-y: auto;
}

.status-option {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 25rpx 20rpx;
	margin-bottom: 12rpx;
	background-color: #f8f9fa;
	border-radius: 12rpx;
	border: 2rpx solid transparent;
	transition: all 0.3s ease;
}

.status-option:active {
	transform: scale(0.98);
}

.status-option-selected {
	border-color: #1890ff;
	background-color: #e6f7ff;
}

.status-option-content {
	display: flex;
	align-items: center;
	gap: 15rpx;
}

.status-option-icon {
	font-size: 32rpx;
}

.status-option-label {
	font-size: 28rpx;
	font-weight: 500;
}

.status-option-check {
	width: 40rpx;
	height: 40rpx;
	border-radius: 50%;
	background-color: #1890ff;
	display: flex;
	align-items: center;
	justify-content: center;
}

.check-icon {
	color: #ffffff;
	font-size: 24rpx;
	font-weight: bold;
}

.status-modal-actions {
	display: flex;
	gap: 20rpx;
	padding: 30rpx;
	border-top: 1rpx solid #f0f0f0;
}

.status-btn {
	flex: 1;
	padding: 25rpx;
	border-radius: 8rpx;
	font-size: 28rpx;
	border: none;
	font-weight: 500;
	transition: all 0.3s ease;
}

.status-btn.cancel {
	background-color: #f5f5f5;
	color: #666666;
}

.status-btn.confirm {
	background-color: #1890ff;
	color: #ffffff;
}

.status-btn.confirm:disabled {
	background-color: #d9d9d9;
	color: #999999;
}
</style>