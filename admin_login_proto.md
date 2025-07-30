# 管理员登录 Protobuf 定义

## 路由定义
```protobuf
rpc AdminLogin(AdminLoginReq) returns (AdminLoginRes) {
    option (google.api.http) = {
        post: "/admin/login"
        body: "*"
    };
};
```

## 请求参数 (AdminLoginReq)
```protobuf
message AdminLoginReq {
    string Mobile = 1;    // 手机号
    string Password = 2;   // 密码
    string SmsCode = 3;    // 验证码
}
```

## 响应参数 (AdminLoginRes)
```protobuf
message AdminLoginRes {
    int32 Code = 1;       // 状态码
    string Msg = 2;        // 消息
    int64 Id = 3;          // 管理员ID
    string Token = 4;      // JWT Token
}
```

## 关键点
1. 参数名必须完全匹配：`Mobile`, `Password`, `SmsCode`
2. 使用 `body: "*"` 表示所有参数都在请求体中
3. Content-Type: `application/x-www-form-urlencoded` 