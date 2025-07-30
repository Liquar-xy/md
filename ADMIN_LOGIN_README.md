# 管理员登录功能说明

## 📋 功能概述

已重新对接管理员登录接口，实现了完整的登录流程，包括：
- 手机号验证
- 密码验证  
- 短信验证码验证
- JWT Token生成
- 登录状态管理

## 🔧 后端接口

### 登录接口
- **URL**: `POST /admin/login`
- **Content-Type**: `application/x-www-form-urlencoded`

### 请求参数
```json
{
  "Mobile": "手机号",
  "Password": "密码", 
  "SmsCode": "验证码"
}
```

### 响应格式
```json
{
  "code": 200,
  "msg": "登陆成功",
  "id": 123,
  "token": "jwt_token_string"
}
```

## 📱 前端页面

### 1. 管理员登录页面
- **路径**: `/pages/admin/login`
- **功能**: 管理员登录表单
- **特性**:
  - 手机号格式验证
  - 验证码发送（60秒倒计时）
  - 表单验证
  - 登录状态保存
  - 自动跳转到管理员主页

### 2. 管理员主页
- **路径**: `/pages/admin/admin`
- **功能**: 管理员数据展示
- **特性**:
  - 登录状态检查
  - 自动跳转到登录页面（未登录时）
  - 退出登录功能
  - 数据刷新

## 🚀 使用流程

### 1. 访问登录页面
```
http://localhost:8080/#/pages/admin/login
```

### 2. 输入登录信息
- 手机号：管理员注册的手机号
- 密码：管理员设置的密码
- 验证码：通过短信获取的4位验证码

### 3. 获取验证码
- 点击"获取验证码"按钮
- 等待60秒倒计时结束
- 查看后端日志获取验证码

### 4. 登录成功
- 系统自动保存登录信息
- 跳转到管理员主页
- 显示实时数据

## 🔍 测试工具

### HTML测试页面
- **文件**: `test_admin_login.html`
- **功能**: 独立测试登录接口
- **特性**:
  - 完整的登录表单
  - 请求详情显示
  - 响应详情分析
  - 登录状态检查

## 📊 数据存储

### 本地存储
登录成功后，以下信息会保存到本地存储：
```javascript
uni.setStorageSync('adminToken', res.data.token);
uni.setStorageSync('adminId', res.data.id);
uni.setStorageSync('adminMobile', mobile);
```

### 退出登录
退出时会清除所有登录信息：
```javascript
uni.removeStorageSync('adminToken');
uni.removeStorageSync('adminId');
uni.removeStorageSync('adminMobile');
```

## 🔐 安全特性

### 1. 验证码验证
- 验证码存储在Redis中
- 格式：`sendSms{mobile}admin`（对应后端代码）
- 验证码错误时返回500状态

### 2. 用户验证
- 检查用户是否存在
- 验证密码是否正确
- 用户不存在或密码错误时返回500状态

### 3. JWT Token
- 登录成功后生成JWT Token
- Token包含管理员ID信息
- 用于后续接口的身份验证

## 🛠️ 开发调试

### 1. 后端调试
```bash
# 启动后端服务
go run main.go

# 查看日志
tail -f logs/app.log
```

### 2. 前端调试
```bash
# 启动前端服务
npm run dev

# 查看控制台日志
F12 -> Console
```

### 3. 接口测试
```bash
# 使用curl测试
curl -X POST http://localhost:8000/admin/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "Mobile=13800138000&Password=123456&SmsCode=1234"
```

## ⚠️ 注意事项

### 1. 验证码获取
- 目前验证码发送是模拟的
- 实际使用时需要对接真实的短信服务
- 可以通过后端日志查看验证码
- **如果后端服务未启动，会提示使用测试验证码: 1234**

### 2. 短信接口问题
如果遇到 `ERR_CONNECTION_REFUSED` 错误：
1. 确保后端服务已启动: `go run main.go`
2. 检查端口8000是否被占用
3. 使用测试验证码: `1234`
4. 查看后端日志获取真实验证码

### 3. 数据库配置
- 确保管理员表存在
- 确保有测试数据
- 检查数据库连接

### 4. Redis配置
- 确保Redis服务运行
- 检查Redis连接配置
- 验证码存储格式正确

### 5. 跨域问题
- 前端开发时可能遇到跨域问题
- 需要在后端配置CORS
- 或使用代理服务器

## 📝 更新日志

### v1.0.0 (2024-01-XX)
- ✅ 创建管理员登录页面
- ✅ 实现登录表单验证
- ✅ 对接后端登录接口
- ✅ 添加登录状态管理
- ✅ 实现退出登录功能
- ✅ 创建测试工具页面
- ✅ 更新路由配置

## 🔗 相关文件

- `pages/admin/login.vue` - 管理员登录页面
- `pages/admin/admin.vue` - 管理员主页
- `pages.json` - 路由配置
- `test_admin_login.html` - 测试工具
- `test_sms_debug.html` - 短信调试工具
- `ADMIN_LOGIN_README.md` - 说明文档 