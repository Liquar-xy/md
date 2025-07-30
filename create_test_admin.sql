-- 创建测试管理员用户
-- 根据你的后端代码，需要插入一个管理员用户

-- 假设你的管理员表名为 admin
INSERT INTO admin (mobile, password, created_at, updated_at) 
VALUES ('13800138000', '123456', NOW(), NOW());

-- 或者如果表结构不同，请根据你的实际表结构调整
-- 例如：
-- INSERT INTO admin (mobile, password, name, status, created_at, updated_at) 
-- VALUES ('13800138000', '123456', '测试管理员', 1, NOW(), NOW());

-- 验证插入是否成功
SELECT * FROM admin WHERE mobile = '13800138000'; 