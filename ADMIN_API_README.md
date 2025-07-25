# Admin页面接口调用说明

## 概述
Admin页面已经更新，移除了默认数据，现在完全依赖后端接口返回的真实数据，支持手动刷新获取最新数据。

## 问题修复
- **登录后直接退出问题**: 修复了管理员登录后直接退出的问题
- **字段名不匹配**: 统一了登录数据和admin页面读取的字段名
- **参数验证**: 优化了参数验证逻辑，只检查必要的adminId
- **后端ID字段**: 如果后端没有返回id字段，使用手机号作为管理员ID

## 主要修改

### 1. 接口调用
- **接口地址**: `http://localhost:8000/admin`
- **请求方法**: POST
- **请求参数**:
  ```javascript
  {
    admin_id: "管理员ID",      // 对应后端req.AdminId
    locker_point_id: "网点ID"  // 对应后端req.LockerPointId
  }
  ```
- **请求头**: `Content-Type: application/x-www-form-urlencoded`
- **响应格式**: 对应后端pb.AdminRes结构体

### 2. 数据映射
接口返回的数据会映射到以下字段（对应后端AdminRes结构体）：
```javascript
// 后端字段 -> 前端字段
pointNum: data.pointNum,           // 网点总数 (PointNum)
lastOrderNum: data.lastOrderNum,   // 今日订单数 (LastOrderNum)
yesterdayOrderNum: data.yesterdayOrderNum,  // 昨日订单数 (YesterdayOrderNum)
lastOrderPrice: data.lastOrderPrice,     // 昨日收益 (LastOrderPrice)
mouthPrice: data.mouthPrice,         // 本月收益 (MouthPrice)
monthNum: data.monthNum,           // 本月订单数 (MonthNum)
```

### 3. 手动刷新功能
- **刷新按钮**: 点击"刷新数据"按钮获取最新数据
- **最后更新时间**: 显示数据最后更新时间
- **加载状态**: 刷新时显示加载提示

### 4. 参数验证
- 检查管理员ID和网点ID是否存在
- 如果缺少必要参数，自动跳转到登录页面
- 从本地存储获取用户信息

## 使用方法

### 1. 登录后访问
确保用户已登录，本地存储中包含：
- `adminData`: 管理员信息
- `lockerPointId`: 网点ID

### 2. 手动刷新
点击"刷新数据"按钮手动获取最新数据

### 3. 查看状态
页面显示：
- 最后更新时间
- 实时数据指标

## 测试工具

项目根目录包含 `test-admin-api.html` 文件，可用于测试接口调用：
1. 打开 `test-admin-api.html`
2. 输入管理员ID、网点ID和API地址
3. 点击"测试接口"查看响应结果

## 本地存储

### 存储的数据
- `adminData`: 管理员登录信息
- `lockerPointId`: 网点ID

### 数据格式
```javascript
// adminData
{
  username: "管理员用户名",
  phoneNumber: "手机号",
  account: "手机号",
  loginType: "admin",
  token: "登录令牌",
  userId: "管理员ID",
  id: "管理员ID",
  isLoggedIn: true
}
```

## 错误处理

### 网络错误
- 显示"网络请求失败"提示
- 保留上次成功的数据

### 参数错误
- 显示"请先登录"提示
- 自动跳转到登录页面

### 接口错误
- 显示"获取数据失败"提示
- 记录详细错误日志

## 注意事项

1. **后端接口要求**: 确保后端接口返回正确的数据格式
2. **网络环境**: 确保网络连接正常
3. **参数配置**: 确保管理员ID和网点ID正确
4. **数据缓存**: 建议后端添加适当的缓存机制

## 后端接口说明

### 数据库查询逻辑
根据后端代码，接口会查询以下数据：

1. **网点总数**: 根据`admin_id`查询`LockerPoint`表
2. **今日订单数**: 根据`locker_point_id`和今日时间范围查询`LockerOrders`表
3. **昨日订单数和收益**: 根据`locker_point_id`和昨日时间范围查询`LockerOrders`表
4. **本月订单数和收益**: 根据`locker_point_id`和本月时间范围查询`LockerOrders`表

### 时间范围计算
- **今日**: `time.Now().Format("2006-01-02 00:00:00")` 至今
- **昨日**: `time.Now().AddDate(0, 0, -1).Format("2006-01-02 00:00:00")` 至 `time.Now().Format("2006-01-02 00:00:00")`
- **本月**: `time.Date(time.Now().Year(), time.Now().Month(), 1, 0, 0, 0, 0, time.Now().Location()).Format("2006-01-02 00:00:00")` 至今

## 调试信息

页面包含详细的调试日志，可在浏览器控制台查看：
- 请求参数
- 响应数据
- 数据映射过程
- 错误信息 