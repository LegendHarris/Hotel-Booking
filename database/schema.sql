-- Enhanced Hotel Reservation Platform Database Schema
CREATE DATABASE IF NOT EXISTS hotel_reservation_db;
USE hotel_reservation_db;

-- Users table with authentication
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Enhanced hotels table
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_country (country),
    INDEX idx_city (city),
    INDEX idx_price (price),
    INDEX idx_rating (rating),
    INDEX idx_active (is_active)
);

-- Transactions table
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
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_hotel_id (hotel_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Bookings table for reservation management
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    hotel_id INT NOT NULL,
    transaction_id INT,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    guests INT DEFAULT 1,
    rooms INT DEFAULT 1,
    total_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    booking_reference VARCHAR(50) UNIQUE,
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,
    INDEX idx_user_bookings (user_id),
    INDEX idx_hotel_bookings (hotel_id),
    INDEX idx_dates (check_in_date, check_out_date),
    INDEX idx_status (status)
);

-- African countries with currency information
CREATE TABLE IF NOT EXISTS countries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(3) NOT NULL UNIQUE,
    currency_code VARCHAR(3) NOT NULL,
    currency_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert African countries data
INSERT INTO countries (name, code, currency_code, currency_name) VALUES
('Nigeria', 'NG', 'NGN', 'Nigerian Naira'),
('South Africa', 'ZA', 'ZAR', 'South African Rand'),
('Kenya', 'KE', 'KES', 'Kenyan Shilling'),
('Ghana', 'GH', 'GHS', 'Ghanaian Cedi'),
('Egypt', 'EG', 'EGP', 'Egyptian Pound'),
('Morocco', 'MA', 'MAD', 'Moroccan Dirham'),
('Ethiopia', 'ET', 'ETB', 'Ethiopian Birr'),
('Tanzania', 'TZ', 'TZS', 'Tanzanian Shilling'),
('Uganda', 'UG', 'UGX', 'Ugandan Shilling'),
('Rwanda', 'RW', 'RWF', 'Rwandan Franc'),
('Botswana', 'BW', 'BWP', 'Botswana Pula'),
('Zambia', 'ZM', 'ZMW', 'Zambian Kwacha'),
('Zimbabwe', 'ZW', 'ZWL', 'Zimbabwean Dollar'),
('Namibia', 'NA', 'NAD', 'Namibian Dollar'),
('Senegal', 'SN', 'XOF', 'West African CFA Franc'),
('Ivory Coast', 'CI', 'XOF', 'West African CFA Franc'),
('Cameroon', 'CM', 'XAF', 'Central African CFA Franc'),
('Tunisia', 'TN', 'TND', 'Tunisian Dinar'),
('Algeria', 'DZ', 'DZD', 'Algerian Dinar'),
('Angola', 'AO', 'AOA', 'Angolan Kwanza');

-- Sample hotels data
INSERT INTO hotels (name, description, country, city, address, price, currency, rating, total_rooms, available_rooms, amenities, images) VALUES
('Lagos Continental Hotel', 'Luxury business hotel in Victoria Island', 'Nigeria', 'Lagos', 'Victoria Island, Lagos', 250.00, 'USD', 4.5, 200, 45, 
 '["WiFi", "Pool", "Gym", "Restaurant", "Business Center", "Spa"]', 
 '["https://images.unsplash.com/photo-1566073771259-6a8506099945", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"]'),
 
('Cape Town Grand', 'Stunning hotel with Table Mountain views', 'South Africa', 'Cape Town', 'Waterfront, Cape Town', 180.00, 'USD', 4.7, 150, 32, 
 '["WiFi", "Pool", "Mountain View", "Restaurant", "Bar", "Concierge"]', 
 '["https://images.unsplash.com/photo-1571896349842-33c89424de2d", "https://images.unsplash.com/photo-1578774204375-8f04d6b6c3b0"]'),
 
('Nairobi Safari Lodge', 'Experience wildlife luxury in the heart of Kenya', 'Kenya', 'Nairobi', 'Karen, Nairobi', 320.00, 'USD', 4.8, 80, 18, 
 '["WiFi", "Safari Tours", "Pool", "Restaurant", "Wildlife View", "Spa"]', 
 '["https://images.unsplash.com/photo-1520637836862-4d197d17c93a", "https://images.unsplash.com/photo-1544551763-46a013bb70d5"]'),
 
('Accra Beach Resort', 'Beachfront paradise with modern amenities', 'Ghana', 'Accra', 'Labadi Beach, Accra', 200.00, 'USD', 4.3, 120, 28, 
 '["WiFi", "Beach Access", "Pool", "Restaurant", "Water Sports", "Gym"]', 
 '["https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9", "https://images.unsplash.com/photo-1582719508461-905c673771fd"]'),
 
('Cairo Palace Hotel', 'Historic luxury near the pyramids', 'Egypt', 'Cairo', 'Giza District, Cairo', 150.00, 'USD', 4.2, 180, 55, 
 '["WiFi", "Historical Tours", "Pool", "Restaurant", "Cultural Center", "Spa"]', 
 '["https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e", "https://images.unsplash.com/photo-1582719471384-894fbb16e074"]);

-- Create indexes for better performance
CREATE INDEX idx_hotels_search ON hotels(country, city, price, rating);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, created_at);
CREATE INDEX idx_bookings_dates_status ON bookings(check_in_date, check_out_date, status);