const express = require('express');
const cors = require('cors');
const app = express();
const port = 8000;

// 模拟Redis存储
const redisStore = new Map();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 生成4位数验证码
function generateVerifyCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// 发送验证码接口
app.post('/sendSms', (req, res) => {
  console.log('收到验证码发送请求:', req.body);
  
  const { mobile, source } = req.body;
  
  if (!mobile) {
    return res.json({
      code: 400,
      msg: '手机号不能为空'
    });
  }
  
  // 验证手机号格式
  if (!/^1[3-9]\d{9}$/.test(mobile)) {
    return res.json({
      code: 400,
      msg: '手机号格式不正确'
    });
  }
  
  // 生成验证码
  const verifyCode = generateVerifyCode();
  
  // 根据source类型设置不同的Redis key
  let redisKey;
  if (source === 'admin_login') {
    redisKey = `admin_verify_code:${mobile}`;
  } else {
    redisKey = `verify_code:${mobile}`;
  }
  
  // 存储到模拟Redis中，设置5分钟过期
  redisStore.set(redisKey, {
    code: verifyCode,
    expireTime: Date.now() + 5 * 60 * 1000 // 5分钟后过期
  });
  
  console.log(`验证码已生成并存储到Redis:`);
  console.log(`Key: ${redisKey}`);
  console.log(`Code: ${verifyCode}`);
  console.log(`手机号: ${mobile}`);
  console.log(`类型: ${source || 'user_login'}`);
  
  // 模拟发送短信成功
  res.json({
    code: 200,
    msg: '验证码发送成功',
    data: {
      mobile: mobile,
      // 在开发环境下返回验证码，生产环境不应该返回
      verifyCode: verifyCode
    }
  });
});

// 验证验证码接口（用于登录时验证）
app.post('/verifyCode', (req, res) => {
  const { mobile, code, source } = req.body;
  
  if (!mobile || !code) {
    return res.json({
      code: 400,
      msg: '手机号和验证码不能为空'
    });
  }
  
  // 根据source类型获取对应的Redis key
  let redisKey;
  if (source === 'admin_login') {
    redisKey = `admin_verify_code:${mobile}`;
  } else {
    redisKey = `verify_code:${mobile}`;
  }
  
  const storedData = redisStore.get(redisKey);
  
  if (!storedData) {
    return res.json({
      code: 400,
      msg: '验证码不存在或已过期'
    });
  }
  
  // 检查是否过期
  if (Date.now() > storedData.expireTime) {
    redisStore.delete(redisKey);
    return res.json({
      code: 400,
      msg: '验证码已过期'
    });
  }
  
  // 验证验证码
  if (storedData.code !== code) {
    return res.json({
      code: 400,
      msg: '验证码错误'
    });
  }
  
  // 验证成功，删除验证码
  redisStore.delete(redisKey);
  
  res.json({
    code: 200,
    msg: '验证码验证成功'
  });
});

// 管理员登录接口
app.post('/admin', (req, res) => {
  console.log('管理员登录请求:', req.body);
  
  const { mobile, password, verifyCode } = req.body;
  
  // 先验证验证码
  const redisKey = `admin_verify_code:${mobile}`;
  const storedData = redisStore.get(redisKey);
  
  if (!storedData || storedData.code !== verifyCode) {
    return res.json({
      code: 400,
      msg: '验证码错误或已过期'
    });
  }
  
  // 验证管理员账号密码（这里使用固定的测试账号）
  if (mobile === '13800138000' && password === '123456') {
    // 删除已使用的验证码
    redisStore.delete(redisKey);
    
    res.json({
      code: 200,
      msg: '登录成功',
      token: 'admin-token-' + Date.now(),
      data: {
        id: 1,
        mobile: mobile,
        username: '管理员',
        role: 'admin'
      }
    });
  } else {
    res.json({
      code: 400,
      msg: '账号或密码错误'
    });
  }
});

// 查看Redis存储状态的调试接口
app.get('/debug/redis', (req, res) => {
  const data = {};
  for (let [key, value] of redisStore.entries()) {
    data[key] = {
      ...value,
      isExpired: Date.now() > value.expireTime
    };
  }
  
  res.json({
    code: 200,
    msg: '当前Redis存储状态',
    data: data,
    count: redisStore.size
  });
});

// 启动服务器
app.listen(port, () => {
  console.log(`🚀 模拟后端服务器启动成功！`);
  console.log(`📍 服务地址: http://localhost:${port}`);
  console.log(`📱 验证码接口: POST /sendSms`);
  console.log(`🔐 管理员登录: POST /admin`);
  console.log(`🔍 调试接口: GET /debug/redis`);
  console.log(`\n📋 测试账号信息:`);
  console.log(`   手机号: 13800138000`);
  console.log(`   密码: 123456`);
  console.log(`\n💡 使用说明:`);
  console.log(`1. 在登录页面选择"管理员登录"`);
  console.log(`2. 输入手机号: 13800138000`);
  console.log(`3. 输入密码: 123456`);
  console.log(`4. 点击"获取验证码"，验证码会显示在控制台`);
  console.log(`5. 输入验证码完成登录`);
});