CREATE DATABASE IF NOT EXISTS hotel_db;
USE hotel_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_code VARCHAR(6),
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hotels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    price_per_night DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    hotel_id INT NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (hotel_id) REFERENCES hotels(id)
);

-- Insert sample hotels
INSERT INTO hotels (name, country, city, price_per_night, currency, description, image_url) VALUES
('Lagos Grand Hotel', 'Nigeria', 'Lagos', 150.00, 'USD', 'Luxury hotel in Victoria Island', 'https://images.unsplash.com/photo-1566073771259-6a8506099945'),
('Cape Town Lodge', 'South Africa', 'Cape Town', 120.00, 'USD', 'Beautiful hotel with mountain views', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d'),
('Nairobi Safari Hotel', 'Kenya', 'Nairobi', 200.00, 'USD', 'Safari-themed luxury accommodation', 'https://images.unsplash.com/photo-1520637836862-4d197d17c93a'),
('Accra Beach Resort', 'Ghana', 'Accra', 180.00, 'USD', 'Beachfront resort with modern amenities', 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9'),
('Cairo Palace', 'Egypt', 'Cairo', 100.00, 'USD', 'Historic hotel near the pyramids', 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e');