-- 检查网点表结构
DESCRIBE locker_point;

-- 查看所有网点数据
SELECT * FROM locker_point;

-- 查看网点数量
SELECT COUNT(*) as total_points FROM locker_point;

-- 查看网点基本信息
SELECT 
    id,
    name,
    address,
    point_type,
    available_large,
    available_medium,
    available_small,
    open_time,
    status,
    point_image,
    created_at,
    updated_at
FROM locker_point;

-- 插入测试数据（如果表为空）
INSERT INTO locker_point (
    name, 
    address, 
    point_type, 
    available_large, 
    available_medium, 
    available_small, 
    open_time, 
    status, 
    point_image,
    created_at, 
    updated_at
) VALUES 
('北京西站南广场寄存点', '南广场进站口东侧', '火车站', 10, 15, 20, '06:00-24:00', 1, '', NOW(), NOW()),
('上海虹桥站出发层寄存点', '出发层A17检票口附近', '火车站', 8, 12, 18, '06:00-24:00', 1, '', NOW(), NOW()),
('广州南站东进站口寄存点', '东进站口南侧', '火车站', 12, 16, 25, '06:00-24:00', 1, '', NOW(), NOW()),
('郑州站寄存点', '郑州站南广场进站口东侧', '火车站', 10, 15, 20, '06:00-24:00', 1, '', NOW(), NOW()),
('郑州东站寄存点', '郑州东站北广场', '火车站', 8, 12, 15, '06:00-24:00', 1, '', NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW(); 