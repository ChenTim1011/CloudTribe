-- New database schema has added a location column to the users table
-- add location column to users table
ALTER TABLE users ADD COLUMN location VARCHAR(15);
UPDATE users SET location = '未選擇';