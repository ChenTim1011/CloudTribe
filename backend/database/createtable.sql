-- users table
-- users table (updated version)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    location VARCHAR(15) DEFAULT '未選擇', -- New: add location column to users table
    is_driver BOOLEAN DEFAULT FALSE    -- New: add is_driver column to users table
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

-- add 24/10/1
-- driver_time table
CREATE TABLE driver_time (
    id SERIAL PRIMARY KEY,
    driver_id INT REFERENCES drivers(id),
    date DATE,
    start_time TIME,
    locations VARCHAR(255)
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
    img VARCHAR(255),
    location VARCHAR(255) -- new: add location column to order_items table
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

--add
--agricultural produce
CREATE TABLE agricultural_produce (
    id SERIAL PRIMARY KEY,
    name VARCHAR(25) NOT NULL,
    price INTEGER NOT NULL,
    total_quantity INTEGER NOT NULL,
    category VARCHAR(15) NOT NULL,
    upload_date DATE NOT NULL,
    off_shelf_date Date NOT NULL,
    img_link VARCHAR(255) NOT NULL,
    img_id VARCHAR(36) NOT NULL,
    seller_id INTEGER NOT NULL
);

CREATE TABLE agricultural_shopping_cart (
    id SERIAL PRIMARY KEY,
    buyer_id INTEGER NOT NULL,
    produce_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    status VARCHAR(5) NOT NULL DEFAULT '未送單'--status:已送單/未送單
);
--order of agricultural products and necessities
CREATE TABLE product_order(
    id SERIAL PRIMARY KEY,
    seller_id INTEGER, --if products are necessities, be null
    buyer_id INTEGER NOT NULL,
    buyer_name VARCHAR(25) NOT NULL,
    produce_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    starting_point VARCHAR(25) NOT NULL,
    end_point VARCHAR(25) NOT NULL,
    category VARCHAR(15) NOT NULL,--agriculture or necessity
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, --TIMESTAMP WITHOUT TIME ZONE
    status VARCHAR(5) DEFAULT '未接單' --未接單 or 已接單 or 已送達
);

CREATE TABLE driver_order (
    id SERIAL PRIMARY KEY,
    driver_id INTEGER NOT NULL,
    product_order_id INTEGER, --if service is pick up people, can be null
    starting_point VARCHAR(25) NOT NULL,
    end_point VARCHAR(25) NOT NULL,
    service VARCHAR(20) NOT NULL --kind: 1.pick up people, 2.carry products
);



