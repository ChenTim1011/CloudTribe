-- create_indexes.sql

-- ====================================
-- Indexes for users table
-- ====================================
CREATE INDEX idx_users_location ON users (location);

-- ====================================
-- Indexes for drivers table
-- ====================================
CREATE INDEX idx_drivers_user_id ON drivers (user_id);


-- ====================================
-- Indexes for driver_time table
-- ====================================
CREATE INDEX idx_driver_time_driver_id ON driver_time (driver_id);
CREATE INDEX idx_driver_time_date ON driver_time (date);

-- ====================================
-- Indexes for orders table
-- ====================================
CREATE INDEX idx_orders_buyer_id ON orders (buyer_id);
CREATE INDEX idx_orders_date ON orders (date);
CREATE INDEX idx_orders_time ON orders (time);

-- ====================================
-- Indexes for order_items table
-- ====================================
CREATE INDEX idx_order_items_order_id ON order_items (order_id);
CREATE INDEX idx_order_items_category ON order_items (category);
CREATE INDEX idx_order_items_order_id_category ON order_items (order_id, category);

-- ====================================
-- Indexes for driver_orders table
-- ====================================
CREATE INDEX idx_driver_orders_driver_id ON driver_orders (driver_id);
CREATE INDEX idx_driver_orders_order_id ON driver_orders (order_id);
CREATE INDEX idx_driver_orders_timestamp ON driver_orders (timestamp);
CREATE INDEX idx_driver_orders_driver_order ON driver_orders (driver_id, order_id);


