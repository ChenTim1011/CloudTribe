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
-- 更新 drivers 表格，新增 user_id 欄位
ALTER TABLE drivers
ADD COLUMN user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE;