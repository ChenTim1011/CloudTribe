CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(10) NOT NULL,
    location VARCHAR(255) NOT NULL,
    is_urgent BOOLEAN NOT NULL,
    total_price FLOAT NOT NULL,
    order_type VARCHAR(50) NOT NULL,
    order_status VARCHAR(50) NOT NULL,
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    item_id VARCHAR(50) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    price FLOAT NOT NULL,
    quantity INTEGER NOT NULL,
    img VARCHAR(255) NOT NULL
);

CREATE TABLE drivers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(10) NOT NULL,
    direction VARCHAR(255) NOT NULL,
    available_date DATE NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL
);

