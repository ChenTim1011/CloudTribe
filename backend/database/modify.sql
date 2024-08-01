ALTER TABLE users ADD COLUMN location VARCHAR(15);
UPDATE users SET location = '未選擇';