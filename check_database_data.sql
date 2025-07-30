-- 检查网点数据表结构和数据
-- 请在你的数据库中运行这些SQL语句

-- 1. 查看表结构
DESCRIBE locker_point;
-- 或者
SHOW COLUMNS FROM locker_point;

-- 2. 查看所有网点数据
SELECT * FROM locker_point;

-- 3. 查看网点数量
SELECT COUNT(*) as total_points FROM locker_point;

-- 4. 查看前10条网点数据
SELECT id, name, address, point_type, available_large, available_medium, available_small, open_time, status, point_image 
FROM locker_point 
LIMIT 10;

-- 5. 如果数据为空，插入测试数据
INSERT INTO locker_point (name, address, point_type, available_large, available_medium, available_small, open_time, status, point_image) VALUES
('北京西站南广场寄存点', '南广场进站口东侧', '火车站', 10, 15, 20, '24小时营业', 1, ''),
('北京南站寄存点', '北广场售票厅旁', '火车站', 8, 12, 18, '06:00-24:00', 1, ''),
('首都机场T2寄存点', 'T2航站楼到达层', '机场', 15, 20, 25, '24小时营业', 1, ''),
('三里屯商圈寄存点', '三里屯太古里北区', '商圈', 5, 8, 12, '10:00-22:00', 1, ''),
('王府井商业街寄存点', '王府井步行街中段', '商圈', 6, 10, 15, '09:00-21:00', 1, '');

-- 6. 再次查看数据
SELECT * FROM locker_point; 