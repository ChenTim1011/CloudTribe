-- users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL
);

-- drivers table
CREATE TABLE drivers (
    -- user_id INT PRIMARY KEY REFERENCES users(id),
    id SERIAL PRIMARY KEY,
    driver_name VARCHAR(255) NOT NULL,
    driver_phone VARCHAR(20) UNIQUE NOT NULL,
    direction VARCHAR(255),
    available_date DATE,
    start_time TIME,
    end_time TIME
);

-- orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    buyer_id INT REFERENCES users(id),
    buyer_name VARCHAR(255) NOT NULL,
    buyer_phone VARCHAR(20) NOT NULL,
    seller_id INT REFERENCES users(id),
    seller_name VARCHAR(255) NOT NULL,
    seller_phone VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    is_urgent BOOLEAN NOT NULL,
    total_price FLOAT NOT NULL,
    order_type VARCHAR(50) DEFAULT '購買類',
    order_status VARCHAR(50) DEFAULT '未接單',
    note TEXT,
    shipment_count INT, -- Number of drivers needed for shipment
    required_orders_count INT, -- Number of orders required for shipment
    previous_driver_id INT REFERENCES drivers(id), --drivers(user_id)
    previous_driver_name VARCHAR(255),
    previous_driver_phone VARCHAR(20)
);

-- order_items table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    item_id VARCHAR(50),
    item_name VARCHAR(255),
    price FLOAT,
    quantity INT,
    img VARCHAR(255)
);

-- driver_orders table
CREATE TABLE driver_orders (
    id SERIAL PRIMARY KEY,
    driver_id INT REFERENCES drivers(id), --drivers(user_id)
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    action VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    previous_driver_id INT REFERENCES drivers(id), --drivers(user_id)
    previous_driver_name VARCHAR(255),
    previous_driver_phone VARCHAR(20)
);

--agricultural product
CREATE TABLE products (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(25) NOT NULL,
    price INTEGER NOT NULL,
    category VARCHAR(8) NOT NULL,
    uploadDate DATE NOT NULL,
    offShelfDate Date NOT NULL,
    imgLink VARCHAR(255) NOT NULL,
    imgID VARCHAR(36) NOT NULL
);
