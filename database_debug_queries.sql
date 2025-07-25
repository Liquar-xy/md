-- 数据库调试查询语句
-- 用于验证admin接口的数据查询是否正确

-- 1. 检查网点数据
SELECT 
    id,
    admin_id,
    name,
    address,
    create_time
FROM locker_point 
WHERE admin_id = '1'  -- 替换为实际的管理员ID
ORDER BY create_time DESC;

-- 2. 检查订单数据 - 今日订单
SELECT 
    id,
    locker_point_id,
    amount_paid,
    create_time,
    DATE(create_time) as order_date
FROM locker_orders 
WHERE locker_point_id = '1'  -- 替换为实际的网点ID
  AND DATE(create_time) = CURDATE()  -- 今日订单
ORDER BY create_time DESC;

-- 3. 检查订单数据 - 昨日订单
SELECT 
    id,
    locker_point_id,
    amount_paid,
    create_time,
    DATE(create_time) as order_date
FROM locker_orders 
WHERE locker_point_id = '1'  -- 替换为实际的网点ID
  AND DATE(create_time) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)  -- 昨日订单
ORDER BY create_time DESC;

-- 4. 检查订单数据 - 本月订单
SELECT 
    id,
    locker_point_id,
    amount_paid,
    create_time,
    DATE(create_time) as order_date
FROM locker_orders 
WHERE locker_point_id = '1'  -- 替换为实际的网点ID
  AND DATE(create_time) >= DATE_FORMAT(CURDATE(), '%Y-%m-01')  -- 本月订单
ORDER BY create_time DESC;

-- 5. 统计查询 - 今日订单数和收益
SELECT 
    COUNT(*) as today_order_count,
    SUM(amount_paid) as today_revenue
FROM locker_orders 
WHERE locker_point_id = '1'
  AND DATE(create_time) = CURDATE();

-- 6. 统计查询 - 昨日订单数和收益
SELECT 
    COUNT(*) as yesterday_order_count,
    SUM(amount_paid) as yesterday_revenue
FROM locker_orders 
WHERE locker_point_id = '1'
  AND DATE(create_time) = DATE_SUB(CURDATE(), INTERVAL 1 DAY);

-- 7. 统计查询 - 本月订单数和收益
SELECT 
    COUNT(*) as month_order_count,
    SUM(amount_paid) as month_revenue
FROM locker_orders 
WHERE locker_point_id = '1'
  AND DATE(create_time) >= DATE_FORMAT(CURDATE(), '%Y-%m-01');

-- 8. 检查时间范围 - 验证后端的时间计算
SELECT 
    NOW() as current_time,
    CURDATE() as current_date,
    DATE_FORMAT(CURDATE(), '%Y-%m-%d 00:00:00') as today_start,
    DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), '%Y-%m-%d 00:00:00') as yesterday_start,
    DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), '%Y-%m-%d 23:59:59') as yesterday_end,
    DATE_FORMAT(CURDATE(), '%Y-%m-01 00:00:00') as month_start;

-- 9. 按日期分组查看订单分布
SELECT 
    DATE(create_time) as order_date,
    COUNT(*) as order_count,
    SUM(amount_paid) as total_revenue
FROM locker_orders 
WHERE locker_point_id = '1'
  AND create_time >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)  -- 最近30天
GROUP BY DATE(create_time)
ORDER BY order_date DESC;

-- 10. 检查是否有空值或异常数据
SELECT 
    id,
    locker_point_id,
    amount_paid,
    create_time
FROM locker_orders 
WHERE locker_point_id = '1'
  AND (amount_paid IS NULL OR amount_paid < 0 OR create_time IS NULL)
ORDER BY create_time DESC; 