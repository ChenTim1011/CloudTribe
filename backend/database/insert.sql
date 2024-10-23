-- Insert into users table
INSERT INTO users (name, phone, location, is_driver) VALUES 
('陳冠宇', '0912345678', '部落位置1', false),
('林佳蓉', '0922345678', '部落位置1', false),
('王志明', '0933345678', '部落位置2', false),
('李宜芳', '0942345678', '部落位置1', false),
('張志豪', '0952345678', '部落位置2', false),
('許美玲', '0962345678', '部落位置1', false),
('黃建成', '0972345678', '部落位置2', false),
('林俊傑', '0982345678', '部落位置1', false),
('蔡依林', '0992345678', '部落位置2', false),
('吳宗憲', '0911345678', '部落位置1', false);

-- Insert into drivers table
INSERT INTO drivers (driver_name, driver_phone, direction, available_date, start_time, end_time) VALUES 
('陳冠宇', '0912345678', '目前已經沒有方向', '2024-10-24', '08:00', '18:00'),
('林佳蓉', '0922345678', '目前已經沒有方向', '2024-10-25', '09:00', '17:00'),
('王志明', '0933345678', '目前已經沒有方向', '2024-10-26', '10:00', '19:00'),
('李宜芳', '0942345678', '目前已經沒有方向', '2024-10-24', '07:00', '14:00'),
('張志豪', '0952345678', '目前已經沒有方向', '2024-10-27', '12:00', '20:00');

-- Insert into driver_time table
INSERT INTO driver_time (driver_id, date, start_time, locations) VALUES 
(1, '2024-10-24', '08:00', '部落位置1'),
(2, '2024-10-25', '09:00', '部落位置2'),
(3, '2024-10-26', '10:00', '部落位置1'),
(4, '2024-10-24', '07:00', '部落位置2'),
(5, '2024-10-27', '12:00', '部落位置1');

-- Insert into orders table
INSERT INTO orders (buyer_id, buyer_name, buyer_phone, seller_id, seller_name, seller_phone, date, time, location, is_urgent, total_price, order_type, order_status, note, shipment_count, required_orders_count, previous_driver_id, previous_driver_name, previous_driver_phone) VALUES 
(1, '陳冠宇', '0912345678', 2, '林佳蓉', '0922345678', '2024-10-25', '14:00', '部落位置1', false, 1500.00, '購買類', '未接單', '請小心運送', 2, 1, null, null, null),
(2, '林佳蓉', '0922345678', 3, '王志明', '0933345678', '2024-10-26', '15:00', '部落位置2', true, 2000.00, '購買類', '未接單', null, 3, 1, null, null, null),
(3, '王志明', '0933345678', 4, '李宜芳', '0942345678', '2024-10-24', '10:00', '部落位置1', false, 1200.00, '購買類', '未接單', '緊急', 1, 1, null, null, null);

-- Insert into order_items table
INSERT INTO order_items (order_id, item_id, item_name, price, quantity, img, location) VALUES 
(1, 'P001', '農產品1', 500.00, 3, 'img1.jpg', '部落位置1'),
(2, 'P002', '農產品2', 400.00, 5, 'img2.jpg', '部落位置2'),
(3, 'P003', '農產品3', 300.00, 2, 'img3.jpg', '部落位置1');

-- Insert into driver_orders table
INSERT INTO driver_orders (driver_id, order_id, action, timestamp, previous_driver_id, previous_driver_name, previous_driver_phone) VALUES 
(1, 1, '接單', '2024-10-24 08:00:00', null, null, null),
(2, 2, '接單', '2024-10-25 09:00:00', null, null, null),
(3, 3, '接單', '2024-10-26 10:00:00', null, null, null);

-- Insert into agricultural_produce table
INSERT INTO agricultural_produce (name, price, total_quantity, category, upload_date, off_shelf_date, img_link, img_id, seller_id) VALUES 
('玉米', 50, 100, '穀類', '2024-10-01', '2024-12-01', 'img4.jpg', 'img123', 1),
('稻米', 30, 200, '穀類', '2024-09-15', '2024-11-15', 'img5.jpg', 'img124', 2);

-- Insert into agricultural_shopping_cart table
INSERT INTO agricultural_shopping_cart (buyer_id, produce_id, quantity, status) VALUES 
(1, 1, 3, '未送單'),
(2, 2, 5, '已送單');

-- Insert into product_order table
INSERT INTO product_order (seller_id, buyer_id, buyer_name, produce_id, quantity, starting_point, end_point, category, status) VALUES 
(1, 2, '林佳蓉', 1, 3, '部落位置1', '部落位置2', 'agriculture', '未接單'),
(2, 3, '王志明', 2, 5, '部落位置1', '部落位置2', 'necessity', '已接單');

-- Insert into driver_order table
INSERT INTO driver_order (driver_id, product_order_id, starting_point, end_point, service) VALUES 
(1, 1, '部落位置1', '部落位置2', 'carry products'),
(2, 2, '部落位置2', '部落位置1', 'pick up people');
