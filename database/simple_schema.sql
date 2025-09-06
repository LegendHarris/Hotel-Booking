CREATE DATABASE IF NOT EXISTS hotel_reservation_db;
USE hotel_reservation_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hotels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    rating DECIMAL(2,1) DEFAULT 0.0,
    total_rooms INT DEFAULT 0,
    available_rooms INT DEFAULT 0,
    amenities JSON,
    images JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    hotel_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    transaction_type ENUM('booking', 'refund', 'payment') DEFAULT 'booking',
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    reference_id VARCHAR(100) UNIQUE,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS countries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(3) NOT NULL UNIQUE,
    currency_code VARCHAR(3) NOT NULL,
    currency_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO countries (name, code, currency_code, currency_name) VALUES
('Nigeria', 'NG', 'NGN', 'Nigerian Naira'),
('South Africa', 'ZA', 'ZAR', 'South African Rand'),
('Kenya', 'KE', 'KES', 'Kenyan Shilling'),
('Ghana', 'GH', 'GHS', 'Ghanaian Cedi'),
('Egypt', 'EG', 'EGP', 'Egyptian Pound');

INSERT INTO hotels (name, description, country, city, address, price, currency, rating, total_rooms, available_rooms) VALUES
('Lagos Continental Hotel', 'Luxury business hotel in Victoria Island', 'Nigeria', 'Lagos', 'Victoria Island, Lagos', 250.00, 'USD', 4.5, 200, 45),
('Cape Town Grand', 'Stunning hotel with Table Mountain views', 'South Africa', 'Cape Town', 'Waterfront, Cape Town', 180.00, 'USD', 4.7, 150, 32),
('Nairobi Safari Lodge', 'Experience wildlife luxury in the heart of Kenya', 'Kenya', 'Nairobi', 'Karen, Nairobi', 320.00, 'USD', 4.8, 80, 18),
('Accra Beach Resort', 'Beachfront paradise with modern amenities', 'Ghana', 'Accra', 'Labadi Beach, Accra', 200.00, 'USD', 4.3, 120, 28),
('Cairo Palace Hotel', 'Historic luxury near the pyramids', 'Egypt', 'Cairo', 'Giza District, Cairo', 150.00, 'USD', 4.2, 180, 55);