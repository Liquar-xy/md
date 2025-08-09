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
                <text class="nav-title">柜组管理</text>
            </view>
            <view class="nav-right">
                <view class="nav-action" @click="testAPI">
                    <text class="nav-icon">🔍</text>
                </view>
                <view class="nav-action" @click="showMenu">
                    <text class="nav-icon">⋯</text>
                </view>
                <view class="nav-action" @click="refreshData">
                    <text class="nav-icon">⟲</text>
                </view>
            </view>
        </view>

        <!-- 寄存点选择 -->
        <view class="location-selector" @click="selectLocation">
            <view class="location-content">
                <view class="location-icon">📍</view>
                <view class="location-info">
                    <text class="location-label">当前寄存点</text>
                    <text class="location-text">{{ currentLocation }}</text>
                </view>
            </view>
            <view class="dropdown-arrow">
                <text class="dropdown-icon">▼</text>
            </view>
        </view>

        <!-- 连接状态提示 -->
        <view class="connection-status" v-if="showConnectionStatus">
            <text class="status-text" :class="connectionStatusClass">
                {{ connectionStatusText }}
            </text>
        </view>

        <!-- 柜组列表 -->
        <scroll-view class="group-list" scroll-y="true" @scrolltolower="loadMore">
            <view class="group-item" v-for="(group, index) in groupList" :key="group.id">
                <!-- 柜组卡片 -->
                <view class="group-card">
                    <!-- 柜组标题 -->
                    <view class="group-header">
                        <view class="group-title-section">
                            <text class="group-name">{{ group.groupName || group.group_name }}</text>
                            <view class="group-badge">
                                <text class="group-number">{{ formatGroupNumber(group) }}</text>
                            </view>
                        </view>
                        <view class="status-indicator" :class="getStatusClass(group.status)">
                            <text class="status-dot">●</text>
                            <text class="status-text">{{ getStatusText(group.status) }}</text>
                        </view>
                    </view>

                    <!-- 柜组信息网格 -->
                    <view class="group-info-grid">
                        <view class="info-card">
                            <text class="info-icon">🏷️</text>
                            <view class="info-content">
                                <text class="info-label">柜组编号</text>
                                <text class="info-value">{{ group.groupCode || group.group_code }}</text>
                            </view>
                        </view>

                        <view class="info-card">
                            <text class="info-icon">📊</text>
                            <view class="info-content">
                                <text class="info-label">使用状态</text>
                                <text class="info-value">{{ getUsageText(group) }}</text>
                            </view>
                        </view>

                        <view class="info-card">
                            <text class="info-icon">🔢</text>
                            <view class="info-content">
                                <text class="info-label">编号区间</text>
                                <text class="info-value">{{ group.startNo || group.start_no }} - {{ group.endNo ||
                                    group.end_no }}</text>
                            </view>
                        </view>

                        <view class="info-card">
                            <text class="info-icon">📋</text>
                            <view class="info-content">
                                <text class="info-label">今日订单</text>
                                <text class="info-value highlight">{{ getTodayOrders(group) }}单</text>
                            </view>
                        </view>
                    </view>

                    <!-- 操作按钮 -->
                    <view class="group-actions">
                        <button class="action-btn primary-btn" @click="manageCabinet(group)">
                            <text class="btn-icon">🔧</text>
                            <text class="btn-text">管理柜门</text>
                        </button>
                        <button class="action-btn secondary-btn" @click="viewOrders(group)">
                            <text class="btn-icon">📊</text>
                            <text class="btn-text">柜门订单</text>
                        </button>
                        <button class="action-btn edit-btn" @click="editGroup(group)">
                            <text class="btn-icon">✏️</text>
                            <text class="btn-text">修改柜组</text>
                        </button>
                        <button class="action-btn danger-btn" @click="deleteGroup(group)">
                            <text class="btn-icon">🗑️</text>
                            <text class="btn-text">删除柜组</text>
                        </button>
                    </view>
                </view>
            </view>

            <!-- 加载更多 -->
            <view class="load-more" v-if="hasMore">
                <text class="load-text" v-if="!loading">上拉加载更多</text>
                <text class="load-text" v-else>加载中...</text>
            </view>

            <!-- 没有更多数据 -->
            <view class="no-more" v-if="!hasMore && groupList.length > 0">
                <text class="no-more-text">没有更多数据了</text>
            </view>

            <!-- 空状态 -->
            <view class="empty-state" v-if="!loading && groupList.length === 0">
                <text class="empty-icon">📦</text>
                <text class="empty-text">暂无柜组数据</text>
                <button class="refresh-btn" @click="refreshData">刷新数据</button>
            </view>
        </scroll-view>

        <!-- 浮动添加按钮 -->
        <view class="fab" @click="addGroup">
            <view class="fab-content">
                <text class="fab-icon">+</text>
            </view>
        </view>

        <!-- 菜单弹窗 -->
        <view class="menu-overlay" v-if="showMenuModal" @click="hideMenu">
            <view class="menu-popup" @click.stop>
                <view class="menu-item" @click="navigateToAddGroup">
                    <text class="menu-icon">➕</text>
                    <text class="menu-text">添加柜组</text>
                </view>
                <view class="menu-item" @click="searchGroup">
                    <text class="menu-icon">🔍</text>
                    <text class="menu-text">搜索柜组</text>
                </view>
                <view class="menu-item" @click="exportData">
                    <text class="menu-icon">📊</text>
                    <text class="menu-text">导出数据</text>
                </view>
            </view>
        </view>

    </view>
</template>

<script>
export default {
    data() {
        return {
            // 当前选择的寄存点
            currentLocation: '郑州新途径',
            currentLocationId: 1,

            // 柜组列表数据
            groupList: [],

            // 分页参数
            currentPage: 1,
            pageSize: 10,
            hasMore: true,
            loading: false,

            // UI状态
            showMenuModal: false,
            showConnectionStatus: false,
            connectionStatusText: '',
            connectionStatusClass: '',

            // API配置
            apiBaseUrl: 'http://localhost:8000'
        }
    },

    onLoad() {
        console.log('=== 柜组管理页面加载 ===');

        // 初始化寄存点信息
        this.initLocationInfo();

        console.log('当前寄存点ID:', this.currentLocationId);
        console.log('API基础URL:', this.apiBaseUrl);

        // 检查登录状态
        const token = uni.getStorageSync('token') || uni.getStorageSync('adminToken');
        console.log('登录状态:', token ? '已登录' : '未登录');

        this.loadGroupList();
    },

    onShow() {
        console.log('=== 柜组管理页面显示 ===');

        // 检查寄存点是否有变化
        const savedLocationId = uni.getStorageSync('selectedLocationId');
        const savedLocationName = uni.getStorageSync('selectedLocationName');

        if (savedLocationId && savedLocationId !== this.currentLocationId) {
            console.log('寄存点已变更，重新加载数据');
            this.currentLocationId = parseInt(savedLocationId);
            this.currentLocation = savedLocationName || '未知寄存点';

            // 重新加载柜组数据
            this.refreshData();
        } else {
            // 检查是否需要刷新数据（从添加页面返回）
            const shouldRefresh = uni.getStorageSync('shouldRefreshGroupList');
            if (shouldRefresh) {
                console.log('从添加页面返回，刷新柜组列表');
                uni.removeStorageSync('shouldRefreshGroupList');
                this.refreshData();
            }
        }
    },

    methods: {
        // 返回上一页
        goBack() {
            uni.navigateBack();
        },

        // 显示菜单
        showMenu() {
            this.showMenuModal = true;
        },

        // 隐藏菜单
        hideMenu() {
            this.showMenuModal = false;
        },

        // 刷新数据
        refreshData() {
            console.log('🔄 刷新柜组数据');
            this.currentPage = 1;
            this.hasMore = true;
            this.groupList = [];
            this.loadGroupList();
        },

        // 测试后端连接
        async testBackendConnection() {
            console.log('🔍 测试后端连接');

            try {
                const response = await new Promise((resolve, reject) => {
                    uni.request({
                        url: `${this.apiBaseUrl}/v1/group/list`,
                        method: 'POST',
                        header: {
                            'Content-Type': 'application/json'
                        },
                        data: {
                            page: 1,
                            size: 1,
                            location_point_id: 1
                        },
                        timeout: 5000,
                        success: resolve,
                        fail: reject
                    });
                });

                console.log('✅ 后端连接测试成功:', response);
                return true;
            } catch (error) {
                console.error('❌ 后端连接测试失败:', error);
                return false;
            }
        },

        // 初始化寄存点信息
        initLocationInfo() {
            // 从本地存储获取选择的寄存点信息
            const savedLocationId = uni.getStorageSync('selectedLocationId');
            const savedLocationName = uni.getStorageSync('selectedLocationName');

            if (savedLocationId && savedLocationName) {
                this.currentLocationId = parseInt(savedLocationId);
                this.currentLocation = savedLocationName;
                console.log('从本地存储加载寄存点:', this.currentLocation, this.currentLocationId);
            } else {
                // 没有选择寄存点，提示用户选择
                this.currentLocationId = null;
                this.currentLocation = '请选择寄存点';
                console.log('未选择寄存点，需要用户选择');

                // 如果没有选择寄存点，自动跳转到选择页面
                setTimeout(() => {
                    uni.showModal({
                        title: '提示',
                        content: '请先选择要管理的寄存点',
                        showCancel: false,
                        success: () => {
                            this.selectLocation();
                        }
                    });
                }, 500);
            }
        },

        // 选择寄存点
        selectLocation() {
            console.log('跳转到寄存点选择页面');
            uni.navigateTo({
                url: '/pages/location-select/location-select?from=cabinet-group'
            });
        },

        // 加载柜组列表
        async loadGroupList() {
            if (this.loading || !this.hasMore) return;

            // 检查是否已选择寄存点
            if (!this.currentLocationId) {
                console.log('未选择寄存点，无法加载柜组数据');
                return;
            }

            this.loading = true;

            try {
                const response = await this.requestGroupList();

                console.log('=== 处理响应数据 ===');
                console.log('响应对象:', response);
                console.log('响应code:', response.code);
                console.log('响应groups:', response.groups);

                // 检查响应格式 - 根据你的后端接口，code应该是数字200
                if (response.code === 200 || response.code === '200') {
                    const newGroups = response.groups || [];

                    console.log('获取到的柜组数据:', newGroups);
                    console.log('柜组数量:', newGroups.length);

                    if (this.currentPage === 1) {
                        this.groupList = newGroups;
                    } else {
                        this.groupList = [...this.groupList, ...newGroups];
                    }

                    // 判断是否还有更多数据
                    this.hasMore = newGroups.length === this.pageSize;

                    console.log(`✅ 加载柜组列表成功，当前页：${this.currentPage}，数据量：${newGroups.length}`);

                    // 显示成功状态
                    if (this.currentPage === 1) {
                        this.showConnectionStatus = true;
                        this.connectionStatusText = `✅ 后端连接正常，共加载${newGroups.length}个柜组`;
                        this.connectionStatusClass = 'success';

                        // 3秒后隐藏状态提示
                        setTimeout(() => {
                            this.showConnectionStatus = false;
                        }, 3000);

                        uni.showToast({
                            title: `加载成功，共${newGroups.length}个柜组`,
                            icon: 'success',
                            duration: 1500
                        });
                    }
                } else {
                    throw new Error(response.msg || `服务器返回错误: ${response.code}`);
                }
            } catch (error) {
                console.error('❌ 加载柜组列表失败:', error);

                // 显示连接状态
                this.showConnectionStatus = true;
                this.connectionStatusText = `连接失败: ${error.message}`;
                this.connectionStatusClass = 'error';

                // 显示错误提示
                uni.showToast({
                    title: error.message || '加载失败',
                    icon: 'none',
                    duration: 2000
                });

                // 如果是第一页加载失败，使用模拟数据作为降级方案
                if (this.currentPage === 1) {
                    console.log('⚠️ 使用模拟数据作为降级方案');
                    this.loadMockData();

                    // 更新状态提示
                    this.connectionStatusText = '后端连接失败，使用模拟数据';
                    this.connectionStatusClass = 'warning';
                }
            } finally {
                this.loading = false;
            }
        },

        // 请求柜组列表API
        requestGroupList() {
            return new Promise((resolve, reject) => {
                console.log('=== 开始请求柜组列表 ===');

                // 获取token
                const token = uni.getStorageSync('token') || uni.getStorageSync('adminToken') || '';

                // 构建请求数据 - 确保字段名与后端proto定义一致
                const requestData = {
                    page: String(this.currentPage), // 后端期望string类型
                    size: String(this.pageSize),     // 后端期望string类型
                    location_point_id: this.currentLocationId, // int32类型
                    status: 'normal' // 只查询正常状态的柜组
                };

                console.log('请求参数:', requestData);
                console.log('请求URL:', `${this.apiBaseUrl}/v1/group/list`);
                console.log('使用Token:', token ? '已设置' : '未设置');
                console.log('Content-Type: application/json');

                // 显示加载提示
                if (this.currentPage === 1) {
                    uni.showLoading({
                        title: '加载柜组数据...',
                        mask: true
                    });
                }

                uni.request({
                    url: `${this.apiBaseUrl}/v1/group/list`,
                    method: 'POST',
                    header: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : ''
                    },
                    data: requestData,
                    timeout: 15000, // 增加超时时间
                    success: (res) => {
                        console.log('=== 柜组列表API响应 ===');
                        console.log('HTTP状态码:', res.statusCode);
                        console.log('响应头:', res.header);
                        console.log('响应数据类型:', typeof res.data);
                        console.log('响应数据:', res.data);

                        // 隐藏加载提示
                        if (this.currentPage === 1) {
                            uni.hideLoading();
                        }

                        if (res.statusCode === 200) {
                            // 检查响应数据格式
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
                        console.error('=== 柜组列表API请求失败 ===');
                        console.error('错误对象:', err);
                        console.error('错误消息:', err.errMsg);

                        // 隐藏加载提示
                        if (this.currentPage === 1) {
                            uni.hideLoading();
                        }

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

        // 加载模拟数据
        loadMockData() {
            console.log('🎭 使用模拟数据作为降级方案');

            const mockGroups = [
                {
                    id: 1,
                    location_point_id: 1,
                    group_name: 'A组',
                    group_code: '1234567865435',
                    group_type: 'standard',
                    status: 'normal',
                    total_cells: 20,
                    start_no: 1,
                    end_no: 20,
                    install_time: '2024-01-15T10:00:00Z',
                    create_time: '2024-01-15T10:00:00Z',
                    update_time: '2024-01-15T10:00:00Z'
                },
                {
                    id: 2,
                    location_point_id: 1,
                    group_name: 'B组',
                    group_code: '1234567865436',
                    group_type: 'standard',
                    status: 'normal',
                    total_cells: 20,
                    start_no: 1,
                    end_no: 20,
                    install_time: '2024-01-15T10:00:00Z',
                    create_time: '2024-01-15T10:00:00Z',
                    update_time: '2024-01-15T10:00:00Z'
                },
                {
                    id: 3,
                    location_point_id: 1,
                    group_name: 'C组',
                    group_code: '1234567865437',
                    group_type: 'refrigerated',
                    status: 'normal',
                    total_cells: 15,
                    start_no: 1,
                    end_no: 15,
                    install_time: '2024-01-20T10:00:00Z',
                    create_time: '2024-01-20T10:00:00Z',
                    update_time: '2024-01-20T10:00:00Z'
                }
            ];

            this.groupList = mockGroups;
            this.hasMore = false;

            // 显示模拟数据提示
            uni.showToast({
                title: '使用模拟数据',
                icon: 'none',
                duration: 2000
            });
        },

        // 加载更多
        loadMore() {
            if (this.hasMore && !this.loading) {
                this.currentPage++;
                this.loadGroupList();
            }
        },

        // 格式化柜组编号显示
        formatGroupNumber(group) {
            const startNo = group.startNo || group.start_no || 1;
            return `${String(startNo).padStart(2, '0')}号柜`;
        },

        // 获取状态样式类
        getStatusClass(status) {
            const statusMap = {
                'normal': 'status-normal',
                'abnormal': 'status-abnormal',
                'disabled': 'status-disabled',
                'damaged': 'status-damaged'
            };
            return statusMap[status] || 'status-normal';
        },

        // 获取状态文本
        getStatusText(status) {
            const statusMap = {
                'normal': '正常',
                'abnormal': '异常',
                'disabled': '禁用',
                'damaged': '损坏'
            };
            return statusMap[status] || '未知';
        },

        // 获取使用状态文本
        getUsageText(group) {
            // 获取总格口数，兼容驼峰和下划线命名
            const totalCells = group.totalCells || group.total_cells || 0;

            // 模拟使用状态，实际应该从后端获取
            const used = Math.floor(Math.random() * totalCells);
            const available = totalCells - used;
            return `${used}单/${available}门`;
        },

        // 获取今日订单数
        getTodayOrders(group) {
            // 模拟今日订单数，实际应该从后端获取
            return Math.floor(Math.random() * 50) + 10;
        },

        // 管理柜门
        manageCabinet(group) {
            console.log('管理柜门:', group);
            const groupName = group.groupName || group.group_name || '未知柜组';
            uni.navigateTo({
                url: `/pages/cabinet-cell/cabinet-cell?groupId=${group.id}&groupName=${encodeURIComponent(groupName)}`
            });
        },

        // 查看订单
        viewOrders(group) {
            console.log('查看柜门订单:', group);
            const groupName = group.groupName || group.group_name || '未知柜组';
            uni.navigateTo({
                url: `/pages/group-orders/group-orders?groupId=${group.id}&groupName=${encodeURIComponent(groupName)}`
            });
        },

        // 修改柜组
        editGroup(group) {
            console.log('修改柜组:', group);
            const groupName = group.groupName || group.group_name || '未知柜组';
            const groupId = group.id;

            // 跳转到修改柜组页面，传递柜组信息
            uni.navigateTo({
                url: `/pages/group-edit/group-edit?groupId=${groupId}&groupName=${encodeURIComponent(groupName)}&from=cabinet-group`
            });
        },

        // 删除柜组
        async deleteGroup(group) {
            console.log('删除柜组:', group);
            const groupName = group.groupName || group.group_name || '未知柜组';
            const groupId = group.id;

            // 显示确认对话框
            const result = await new Promise((resolve) => {
                uni.showModal({
                    title: '确认删除',
                    content: `确定要删除柜组"${groupName}"吗？删除后柜组将被禁用，无法正常使用。`,
                    confirmText: '确认删除',
                    confirmColor: '#ff4d4f',
                    cancelText: '取消',
                    success: (res) => {
                        resolve(res.confirm);
                    }
                });
            });

            if (!result) {
                return; // 用户取消删除
            }

            // 执行删除操作
            try {
                uni.showLoading({
                    title: '删除中...',
                    mask: true
                });

                await this.requestDeleteGroup(groupId);

                uni.hideLoading();

                // 删除成功，从列表中移除该项
                this.groupList = this.groupList.filter(item => item.id !== groupId);

                uni.showToast({
                    title: '删除成功',
                    icon: 'success',
                    duration: 2000
                });

            } catch (error) {
                uni.hideLoading();

                console.error('删除柜组失败:', error);

                uni.showModal({
                    title: '删除失败',
                    content: error.message || '删除柜组时发生错误，请稍后重试',
                    showCancel: false
                });
            }
        },

        // 请求删除柜组API
        requestDeleteGroup(groupId) {
            return new Promise((resolve, reject) => {
                console.log('=== 开始删除柜组 ===');
                console.log('柜组ID:', groupId);

                // 获取token
                const token = uni.getStorageSync('token') || uni.getStorageSync('adminToken') || '';

                // 构建请求数据
                const requestData = {
                    id: groupId
                };

                console.log('删除请求参数:', requestData);
                console.log('请求URL:', `${this.apiBaseUrl}/v1/group/delete`);

                uni.request({
                    url: `${this.apiBaseUrl}/v1/group/delete`,
                    method: 'POST',
                    header: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : ''
                    },
                    data: requestData,
                    timeout: 10000,
                    success: (res) => {
                        console.log('=== 删除柜组API响应 ===');
                        console.log('HTTP状态码:', res.statusCode);
                        console.log('响应数据:', res.data);

                        if (res.statusCode === 200) {
                            if (res.data && (res.data.code === 200 || res.data.code === '200')) {
                                console.log('✅ 删除柜组成功');
                                resolve(res.data);
                            } else {
                                console.error('❌ 删除失败:', res.data?.msg);
                                reject(new Error(res.data?.msg || '删除失败'));
                            }
                        } else {
                            console.error('❌ HTTP状态码错误:', res.statusCode);
                            reject(new Error(`HTTP ${res.statusCode}: ${res.data?.msg || '请求失败'}`));
                        }
                    },
                    fail: (err) => {
                        console.error('=== 删除柜组API请求失败 ===');
                        console.error('错误对象:', err);
                        console.error('错误消息:', err.errMsg);

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

        // 添加柜组
        addGroup() {
            this.navigateToAddGroup();
        },

        // 跳转到添加柜组页面
        navigateToAddGroup() {
            this.hideMenu();
            uni.navigateTo({
                url: '/pages/group-add/group-add?from=cabinet-group'
            });
        },

        // 搜索柜组
        searchGroup() {
            this.hideMenu();
            uni.navigateTo({
                url: '/pages/group-search/group-search'
            });
        },

        // 导出数据
        exportData() {
            this.hideMenu();
            uni.showToast({
                title: '导出功能开发中',
                icon: 'none'
            });
        },

        // 测试API连接
        async testAPI() {
            console.log('🔍 手动测试API连接');

            uni.showLoading({
                title: '测试连接...',
                mask: true
            });

            try {
                // 先测试基础连接
                const isConnected = await this.testBackendConnection();

                if (isConnected) {
                    // 测试柜组列表接口
                    const response = await this.requestGroupList();

                    uni.hideLoading();
                    uni.showModal({
                        title: '测试结果',
                        content: `连接成功！\n返回数据: ${JSON.stringify(response, null, 2)}`,
                        showCancel: false
                    });
                } else {
                    uni.hideLoading();
                    uni.showModal({
                        title: '测试结果',
                        content: '无法连接到后端服务，请检查：\n1. 后端服务是否启动\n2. 端口8000是否正确\n3. 网络连接是否正常',
                        showCancel: false
                    });
                }
            } catch (error) {
                uni.hideLoading();
                uni.showModal({
                    title: '测试失败',
                    content: `错误信息: ${error.message}`,
                    showCancel: false
                });
            }
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
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 15rpx;
}

/* 优化的返回按钮 */
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

/* 导航操作按钮 */
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

.nav-action .nav-icon {
    font-size: 28rpx;
    color: #667eea;
}

/* 寄存点选择 */
.location-selector {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 25rpx 30rpx;
    margin: 20rpx 30rpx;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20rpx);
    border-radius: 20rpx;
    box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.1);
    border: 1rpx solid rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
}

.location-selector:active {
    transform: translateY(-2rpx);
    box-shadow: 0 12rpx 35rpx rgba(0, 0, 0, 0.15);
}

.location-content {
    display: flex;
    align-items: center;
    gap: 15rpx;
    flex: 1;
}

.location-icon {
    font-size: 32rpx;
    color: #667eea;
}

.location-info {
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

.dropdown-arrow {
    padding: 10rpx;
}

.dropdown-icon {
    font-size: 20rpx;
    color: #667eea;
    font-weight: bold;
}

/* 连接状态 */
.connection-status {
    padding: 15rpx 30rpx;
    margin: 0 30rpx 20rpx;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 15rpx;
    text-align: center;
    backdrop-filter: blur(10rpx);
}

.status-text {
    font-size: 24rpx;
    font-weight: 500;
}

.status-text.success {
    color: #52c41a;
}

.status-text.error {
    color: #ff4d4f;
}

.status-text.warning {
    color: #faad14;
}

/* 柜组列表 */
.group-list {
    flex: 1;
    padding: 0 30rpx 120rpx;
}

.group-item {
    margin-bottom: 25rpx;
}

.group-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20rpx);
    border-radius: 25rpx;
    padding: 30rpx;
    box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
    border: 1rpx solid rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
    overflow: hidden;
    position: relative;
}

.group-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4rpx;
    background: linear-gradient(90deg, #667eea, #764ba2);
}

.group-card:active {
    transform: translateY(-4rpx);
    box-shadow: 0 15rpx 40rpx rgba(0, 0, 0, 0.15);
}

/* 柜组标题 */
.group-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 25rpx;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid rgba(102, 126, 234, 0.1);
}

.group-title-section {
    display: flex;
    align-items: center;
    gap: 15rpx;
}

.group-name {
    font-size: 34rpx;
    font-weight: bold;
    color: #333333;
}

.group-badge {
    background: linear-gradient(135deg, #667eea, #764ba2);
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
    box-shadow: 0 4rpx 15rpx rgba(102, 126, 234, 0.3);
}

.group-number {
    font-size: 22rpx;
    color: #ffffff;
    font-weight: 600;
}

.status-indicator {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 8rpx 15rpx;
    border-radius: 20rpx;
    background: rgba(255, 255, 255, 0.8);
}

.status-dot {
    font-size: 16rpx;
}

.status-indicator .status-text {
    font-size: 22rpx;
    font-weight: 500;
}

/* 信息网格 */
.group-info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15rpx;
    margin-bottom: 25rpx;
}

.info-card {
    display: flex;
    align-items: center;
    gap: 12rpx;
    padding: 20rpx;
    background: rgba(102, 126, 234, 0.05);
    border-radius: 15rpx;
    border: 1rpx solid rgba(102, 126, 234, 0.1);
    transition: all 0.3s ease;
}

.info-card:active {
    transform: scale(0.98);
    background: rgba(102, 126, 234, 0.1);
}

.info-icon {
    font-size: 24rpx;
    color: #667eea;
}

.info-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4rpx;
}

.info-label {
    font-size: 22rpx;
    color: #999999;
    font-weight: 500;
}

.info-value {
    font-size: 26rpx;
    color: #333333;
    font-weight: 600;
}

.info-value.highlight {
    color: #667eea;
    font-weight: bold;
}

/* 状态样式 */
.status-normal {
    color: #52c41a !important;
}

.status-normal .status-dot {
    color: #52c41a;
}

.status-abnormal {
    color: #faad14 !important;
}

.status-abnormal .status-dot {
    color: #faad14;
}

.status-disabled {
    color: #d9d9d9 !important;
}

.status-disabled .status-dot {
    color: #d9d9d9;
}

.status-damaged {
    color: #ff4d4f !important;
}

.status-damaged .status-dot {
    color: #ff4d4f;
}

/* 操作按钮 */
.group-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10rpx;
}

.action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6rpx;
    padding: 18rpx 12rpx;
    border-radius: 12rpx;
    border: none;
    font-size: 22rpx;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.1);
}

.action-btn:active {
    transform: translateY(-2rpx);
    box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.15);
}

.primary-btn {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #ffffff;
}

.secondary-btn {
    background: linear-gradient(135deg, #52c41a, #73d13d);
    color: #ffffff;
}

.edit-btn {
    background: linear-gradient(135deg, #faad14, #ffc53d);
    color: #ffffff;
}

.danger-btn {
    background: linear-gradient(135deg, #ff4d4f, #ff7875);
    color: #ffffff;
}

.btn-icon {
    font-size: 22rpx;
}

.btn-text {
    font-size: 22rpx;
    font-weight: 600;
}

/* 加载更多 */
.load-more,
.no-more {
    text-align: center;
    padding: 40rpx 0;
}

.load-text,
.no-more-text {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
}

/* 空状态 */
.empty-state {
    text-align: center;
    padding: 100rpx 0;
}

.empty-icon {
    font-size: 80rpx;
    margin-bottom: 20rpx;
}

.empty-text {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 40rpx;
    font-weight: 500;
}

.refresh-btn {
    padding: 25rpx 50rpx;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #ffffff;
    border-radius: 25rpx;
    border: none;
    font-size: 26rpx;
    font-weight: 600;
    box-shadow: 0 8rpx 25rpx rgba(102, 126, 234, 0.3);
    transition: all 0.3s ease;
}

.refresh-btn:active {
    transform: translateY(-2rpx);
    box-shadow: 0 12rpx 35rpx rgba(102, 126, 234, 0.4);
}

/* 浮动添加按钮 */
.fab {
    position: fixed;
    right: 30rpx;
    bottom: 100rpx;
    width: 120rpx;
    height: 120rpx;
    z-index: 99;
    transition: all 0.3s ease;
}

.fab:active {
    transform: scale(0.9);
}

.fab-content {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 12rpx 30rpx rgba(102, 126, 234, 0.4);
    border: 3rpx solid rgba(255, 255, 255, 0.3);
}

.fab-icon {
    font-size: 45rpx;
    color: #ffffff;
    font-weight: bold;
}

/* 菜单弹窗 */
.menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(10rpx);
    z-index: 1000;
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    padding: 120rpx 30rpx 0 0;
}

.menu-popup {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20rpx);
    border-radius: 20rpx;
    padding: 20rpx 0;
    min-width: 220rpx;
    box-shadow: 0 15rpx 40rpx rgba(0, 0, 0, 0.2);
    border: 1rpx solid rgba(255, 255, 255, 0.3);
}

.menu-item {
    display: flex;
    align-items: center;
    padding: 25rpx 30rpx;
    gap: 20rpx;
    transition: all 0.3s ease;
}

.menu-item:active {
    background: rgba(102, 126, 234, 0.1);
}

.menu-icon {
    font-size: 28rpx;
    color: #667eea;
}

.menu-text {
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

@keyframes pulse {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.05);
    }
}

.group-card {
    animation: fadeInUp 0.6s ease-out;
}

.fab-content {
    animation: pulse 2s infinite;
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
    .group-info-grid {
        grid-template-columns: 1fr;
    }

    .group-actions {
        flex-direction: column;
    }

    .nav-title {
        font-size: 30rpx;
    }
}

/* 滚动条美化 */
::-webkit-scrollbar {
    width: 6rpx;
}

::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3rpx;
}

::-webkit-scrollbar-thumb {
    background: rgba(102, 126, 234, 0.3);
    border-radius: 3rpx;
}

::-webkit-scrollbar-thumb:hover {
    background: rgba(102, 126, 234, 0.5);
}

/* 触觉反馈增强 */
.back-button,
.nav-action,
.location-selector,
.group-card,
.action-btn,
.fab {
    -webkit-tap-highlight-color: transparent;
}

/* 加载状态优化 */
.group-list.loading {
    opacity: 0.7;
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

    .group-card {
        background: rgba(45, 55, 72, 0.95);
        border: 1rpx solid rgba(255, 255, 255, 0.1);
    }

    .group-name {
        color: #e2e8f0;
    }

    .info-value {
        color: #cbd5e0;
    }

    .location-text {
        color: #e2e8f0;
    }
}
</style>