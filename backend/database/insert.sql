-- users table
INSERT INTO users (name, phone, location) VALUES 
('王小明', '0912345678', '飛鼠不渴露營農場'),
('李大華', '0922333444', '樹不老休閒農場'),
('陳美玲', '0933444555', '戀戀雅渡農場'),
('張志強', '0911222333', '飛鼠不渴露營農場'),
('林秀芬', '0955666777', '樹不老休閒農場'),
('黃國強', '0944555666', '戀戀雅渡農場'),
('吳麗華', '0966888999', '飛鼠不渴露營農場'),
('鄭文彬', '0977999111', '樹不老休閒農場'),
('許智傑', '0988111222', '戀戀雅渡農場'),
('趙子龍', '0933999222', '飛鼠不渴露營農場');


-- drivers table
INSERT INTO drivers (driver_name, driver_phone, direction, available_date, start_time, end_time) VALUES 
('王大成', '0911222333', '山上到山下', '2024-10-01', '08:00', '17:00'),
('林美麗', '0922445566', '山下到山上', '2024-10-02', '09:00', '18:00'),
('張大偉', '0933556677', '山上到山下', '2024-10-03', '07:00', '16:00'),
('李建志', '0911667788', '山下到山上', '2024-10-01', '08:30', '17:30'),
('陳志豪', '0955777888', '山上到山下', '2024-10-02', '09:30', '18:30'),
('黃偉雄', '0944888999', '山下到山上', '2024-10-03', '10:00', '19:00'),
('吳明哲', '0966999000', '山上到山下', '2024-10-04', '06:00', '15:00'),
('鄭麗君', '0977111222', '山下到山上', '2024-10-05', '07:30', '16:30'),
('許志強', '0988222333', '山上到山下', '2024-10-06', '08:00', '17:00'),
('趙建國', '0933444555', '山下到山上', '2024-10-07', '09:00', '18:00');

-- driver_time table
INSERT INTO driver_time (driver_id, date, start_time, end_time) VALUES
(1, '2024-10-01', '08:00', '17:00'),
(2, '2024-10-02', '09:00', '18:00'),
(3, '2024-10-03', '07:00', '16:00'),
(4, '2024-10-01', '08:30', '17:30'),
(5, '2024-10-02', '09:30', '18:30'),
(6, '2024-10-03', '10:00', '19:00'),
(7, '2024-10-04', '06:00', '15:00'),
(8, '2024-10-05', '07:30', '16:30'),
(9, '2024-10-06', '08:00', '17:00'),
(10, '2024-10-07', '09:00', '18:00');

-- orders table
INSERT INTO orders (buyer_id, buyer_name, buyer_phone, seller_id, seller_name, seller_phone, date, time, location, is_urgent, total_price, order_type, order_status, note, shipment_count, required_orders_count, previous_driver_id, previous_driver_name, previous_driver_phone) VALUES 
(1, '王小明', '0912345678', 2, '李大華', '0922333444', '2024-10-01', '10:00', '飛鼠不渴露營農場', false, 1500, '購買類', '未接單', '無', 2, 1, 1, '王大成', '0911222333'),
(3, '陳美玲', '0933444555', 4, '張志強', '0911222333', '2024-10-01', '12:00', '樹不老休閒農場', true, 2000, '購買類', '未接單', '急件', 1, 1, 2, '林美麗', '0922445566'),
(5, '林秀芬', '0955666777', 6, '黃國強', '0944555666', '2024-10-02', '15:00', '戀戀雅渡農場', false, 2500, '購買類', '已接單', '急件', 3, 2, 3, '張大偉', '0933556677'),
(7, '吳麗華', '0966888999', 8, '鄭文彬', '0977999111', '2024-10-03', '14:00', '飛鼠不渴露營農場', true, 1800, '購買類', '未接單', '無', 2, 1, 4, '李建志', '0911667788'),
(9, '許智傑', '0988111222', 10, '趙子龍', '0933999222', '2024-10-04', '11:00', '樹不老休閒農場', false, 1200, '購買類', '未接單', '無', 1, 1, 5, '陳志豪', '0955777888');


-- order_items table
INSERT INTO order_items (order_id, item_id, item_name, price, quantity, img) VALUES 
(1, 'A001', '蘋果', 50, 10, 'apple.jpg'),
(2, 'A002', '香蕉', 30, 15, 'banana.jpg'),
(3, 'A003', '葡萄', 60, 8, 'grape.jpg'),
(4, 'A004', '橙子', 40, 20, 'orange.jpg'),
(5, 'A005', '梨子', 35, 12, 'pear.jpg');

-- driver_orders table
INSERT INTO driver_orders (driver_id, order_id, action, timestamp, previous_driver_id, previous_driver_name, previous_driver_phone) VALUES 
(1, 1, '接單', '2024-10-01 10:30', NULL, NULL, NULL),
(2, 2, '轉單', '2024-10-02 11:00', 3, '張大偉', '0933556677'),
(3, 3, '取消', '2024-10-03 12:30', NULL, NULL, NULL),
(4, 4, '接單', '2024-10-04 15:00', NULL, NULL, NULL),
(5, 5, '轉單', '2024-10-05 13:00', 6, '黃偉雄', '0944888999');


-- agricultural_produce table
INSERT INTO agricultural_produce (name, price, total_quantity, category, upload_date, off_shelf_date, img_link, img_id, seller_id) VALUES 
('蘋果', 50, 100, '水果', '2024-09-30', '2024-10-15', 'apple.jpg', 'IMG123', 1),
('香蕉', 30, 150, '水果', '2024-09-30', '2024-10-20', 'banana.jpg', 'IMG124', 2),
('葡萄', 60, 80, '水果', '2024-09-30', '2024-10-18', 'grape.jpg', 'IMG125', 3),
('橙子', 40, 120, '水果', '2024-09-30', '2024-10-22', 'orange.jpg', 'IMG126', 4),
('梨子', 35, 90, '水果', '2024-09-30', '2024-10-17', 'pear.jpg', 'IMG127', 5);

-- agricultural_shopping_cart table
INSERT INTO agricultural_shopping_cart (buyer_id, produce_id, quantity, status) VALUES 
(1, 1, 5, '已送單'),
(2, 2, 3, '未送單'),
(3, 3, 10, '已送單'),
(4, 4, 7, '未送單'),
(5, 5, 6, '已送單');

-- product_order table
INSERT INTO product_order (seller_id, buyer_id, buyer_name, produce_id, quantity, starting_point, end_point, category, timestamp, status) VALUES 
(1, 1, '王小明', 1, 10, '台北市', '新北市', 'agriculture', '2024-10-01 09:00', '未接單'),
(2, 2, '李大華', 2, 5, '桃園市', '台中市', 'agriculture', '2024-10-02 10:00', '已接單'),
(3, 3, '陳美玲', 3, 8, '高雄市', '台南市', 'necessity', '2024-10-03 11:00', '未接單'),
(4, 4, '張志強', 4, 12, '台中市', '台北市', 'agriculture', '2024-10-04 12:00', '未接單'),
(5, 5, '林秀芬', 5, 6, '高雄市', '屏東縣', 'necessity', '2024-10-05 13:00', '已接單');

-- driver_order table
INSERT INTO driver_order (driver_id, product_order_id, starting_point, end_point, service) VALUES 
(1, 1, '台北市', '新北市', 'carry products'),
(2, 2, '桃園市', '台中市', 'carry products'),
(3, 3, '高雄市', '台南市', 'pick up people'),
(4, 4, '台中市', '台北市', 'carry products'),
(5, 5, '高雄市', '屏東縣', 'carry products');
