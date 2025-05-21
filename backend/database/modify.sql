-- New: database schema has added a location column to the users table
-- add location column to users table
ALTER TABLE users ADD COLUMN location VARCHAR(15);
UPDATE users SET location = '未選擇';

-- New: add is_driver column to users table
-- In order not to let every user be a driver, if the user want to be a driver, he or she need to apply for it. 
ALTER TABLE users ADD COLUMN is_driver BOOLEAN DEFAULT FALSE;
UPDATE users SET is_driver = FALSE;


ALTER TABLE driver_time ADD COLUMN locations VARCHAR(255) ;

ALTER TABLE driver_time DROP COLUMN end_time;

-- update drivers table to add user_id column
ALTER TABLE drivers
ADD COLUMN user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE;

-- update orders item table
ALTER TABLE order_items
ADD COLUMN category VARCHAR(50);

ALTER TABLE driver_orders
ADD COLUMN service VARCHAR(20);


ALTER TABLE agricultural_produce
ADD COLUMN unit VARCHAR(10);

ALTER TABLE users ADD COLUMN line_user_id VARCHAR(255);

ALTER TABLE agricultural_product_order ADD COLUMN is_put BOOLEAN DEFAULT FALSE;
    
ALTER TABLE orders ADD COLUMN timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- add location column to agricultural_produce table
ALTER TABLE agricultural_produce
ADD COLUMN location VARCHAR(100) NOT NULL DEFAULT 'unknown';