// 修正后的时间范围计算
func (s *UserService) Admin(ctx context.Context, req *pb.AdminRequest) (*pb.AdminRes, error) {

	// 1. 查询网点总数
	var pointCount int64
	if err := s.DB.Model(&data.LockerPoint{}).
		Where("admin_id = ?", req.AdminId).
		Count(&pointCount).Error; err != nil {
		return &pb.AdminRes{
			Code: 500,
			Msg:  "查询网点数量失败: " + err.Error(),
		}, nil
	}

	// 2. 修正时间范围计算
	now := time.Now()

	// 今日开始时间: 今天 00:00:00
	todayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location()).Format("2006-01-02 15:04:05")

	// 昨日开始时间: 昨天 00:00:00
	yesterdayStart := time.Date(now.Year(), now.Month(), now.Day()-1, 0, 0, 0, 0, now.Location()).Format("2006-01-02 15:04:05")

	// 昨日结束时间: 昨天 23:59:59
	yesterdayEnd := time.Date(now.Year(), now.Month(), now.Day()-1, 23, 59, 59, 0, now.Location()).Format("2006-01-02 15:04:05")

	// 本月开始时间: 本月1号 00:00:00
	monthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location()).Format("2006-01-02 15:04:05")

	// 打印时间范围用于调试
	fmt.Printf("时间范围调试:\n")
	fmt.Printf("今日开始: %s\n", todayStart)
	fmt.Printf("昨日开始: %s\n", yesterdayStart)
	fmt.Printf("昨日结束: %s\n", yesterdayEnd)
	fmt.Printf("本月开始: %s\n", monthStart)

	// 3. 查询今日订单数
	var todayOrderCount int64
	if err := s.DB.Model(&data.LockerOrders{}).
		Where("locker_point_id = ?", req.LockerPointId).
		Where("create_time >= ?", todayStart). // 使用 >= 而不是 >
		Count(&todayOrderCount).Error; err != nil {
		return &pb.AdminRes{
			Code: 500,
			Msg:  "查询今日订单数失败: " + err.Error(),
		}, nil
	}

	// 4. 查询昨日订单数和收益
	var yesterdayResult struct {
		OrderCount int64
		TotalPaid  float64
	}
	if err := s.DB.Debug().Model(&data.LockerOrders{}).
		Select("COUNT(1) as order_count, SUM(amount_paid) as total_paid").
		Where("locker_point_id = ?", req.LockerPointId).
		Where("create_time BETWEEN ? AND ?", yesterdayStart, yesterdayEnd).
		Scan(&yesterdayResult).Error; err != nil {
		return &pb.AdminRes{
			Code: 500,
			Msg:  "查询昨日订单信息失败: " + err.Error(),
		}, nil
	}

	fmt.Printf("昨日查询结果: %+v\n", yesterdayResult)

	// 5. 查询本月订单数和收益
	var monthResult struct {
		OrderCount int64
		TotalPaid  float64
	}
	if err := s.DB.Model(&data.LockerOrders{}).
		Select("COUNT(1) as order_count, SUM(amount_paid) as total_paid").
		Where("locker_point_id = ?", req.LockerPointId).
		Where("create_time >= ?", monthStart). // 使用 >= 而不是 >
		Scan(&monthResult).Error; err != nil {
		return &pb.AdminRes{
			Code: 500,
			Msg:  "查询本月订单信息失败: " + err.Error(),
		}, nil
	}

	fmt.Printf("本月查询结果: %+v\n", monthResult)

	// 6. 返回结果
	return &pb.AdminRes{
		Code:              200,
		Msg:               "查询成功",
		PointNum:          pointCount,
		LastOrderNum:      todayOrderCount,
		YesterdayOrderNum: yesterdayResult.OrderCount,
		LastOrderPrice:    float32(yesterdayResult.TotalPaid),
		MouthPrice:        float32(monthResult.TotalPaid),
		MonthNum:          monthResult.OrderCount,
	}, nil
} 