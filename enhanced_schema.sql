-- Enhanced SQL schema for hotel management system with frontend-backend sync
-- Run this script to create all necessary tables

CREATE DATABASE IF NOT EXISTS hotel_db;
USE hotel_db;

-- Users table with additional fields for better frontend integration
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  role ENUM('user', 'admin', 'hotel_manager') DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  profile_image VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Hotels table with enhanced fields for frontend display
CREATE TABLE IF NOT EXISTS hotels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  amenities JSON,
  images JSON,
  rating DECIMAL(2,1) DEFAULT 0.0,
  total_rooms INT DEFAULT 0,
  available_rooms INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  manager_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Bookings table with status tracking
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  hotel_id INT NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  guests INT DEFAULT 1,
  rooms INT DEFAULT 1,
  total_amount DECIMAL(10, 2),
  status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
  payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
  special_requests TEXT,
  booking_reference VARCHAR(50) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

-- Reviews table for hotel ratings
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  hotel_id INT NOT NULL,
  booking_id INT,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  UNIQUE KEY unique_user_hotel_booking (user_id, hotel_id, booking_id)
);

-- Room types table
CREATE TABLE IF NOT EXISTS room_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hotel_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  capacity INT DEFAULT 2,
  amenities JSON,
  images JSON,
  total_rooms INT DEFAULT 0,
  available_rooms INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

-- Sessions table for user authentication tracking
CREATE TABLE IF NOT EXISTS user_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notifications table for real-time updates
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('booking', 'payment', 'system', 'promotion') DEFAULT 'system',
  is_read BOOLEAN DEFAULT FALSE,
  action_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Payment transactions table
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(100),
  status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  gateway_response JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- System settings table for configuration
CREATE TABLE IF NOT EXISTS system_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('site_name', 'Hotel Reservation SaaS', 'Website name'),
('currency', 'USD', 'Default currency'),
('timezone', 'UTC', 'Default timezone'),
('booking_cancellation_hours', '24', 'Hours before check-in to allow cancellation'),
('max_booking_days', '365', 'Maximum days in advance for booking');

-- Insert sample admin user (password: admin123 - should be hashed in production)
INSERT INTO users (username, email, password, first_name, last_name, role) VALUES
('admin', 'admin@hotel.com', '$2b$10$example_hashed_password', 'Admin', 'User', 'admin');

-- Insert sample hotels
INSERT INTO hotels (name, location, address, city, country, price, description, total_rooms, available_rooms, amenities, images) VALUES
('Grand Plaza Hotel', 'New York, NY', '123 Broadway St', 'New York', 'USA', 299.99, 'Luxury hotel in the heart of Manhattan', 150, 45, 
 '["WiFi", "Pool", "Gym", "Restaurant", "Room Service", "Parking"]', 
 '["https://example.com/hotel1.jpg", "https://example.com/hotel1-2.jpg"]'),
('Ocean View Resort', 'Miami, FL', '456 Ocean Drive', 'Miami', 'USA', 199.99, 'Beautiful beachfront resort with stunning ocean views', 200, 78, 
 '["WiFi", "Beach Access", "Pool", "Spa", "Restaurant", "Bar"]', 
 '["https://example.com/hotel2.jpg", "https://example.com/hotel2-2.jpg"]'),
('Mountain Lodge', 'Denver, CO', '789 Mountain Rd', 'Denver', 'USA', 149.99, 'Cozy mountain retreat perfect for nature lovers', 80, 23, 
 '["WiFi", "Fireplace", "Hiking Trails", "Restaurant", "Parking"]', 
 '["https://example.com/hotel3.jpg", "https://example.com/hotel3-2.jpg"]');

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_hotel_id ON bookings(hotel_id);
CREATE INDEX idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_hotels_location ON hotels(location);
CREATE INDEX idx_hotels_price ON hotels(price);
CREATE INDEX idx_reviews_hotel_id ON reviews(hotel_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id, is_read);

-- Create triggers for automatic updates
DELIMITER //

-- Trigger to update hotel rating when review is added/updated
CREATE TRIGGER update_hotel_rating AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    UPDATE hotels 
    SET rating = (
        SELECT AVG(rating) 
        FROM reviews 
        WHERE hotel_id = NEW.hotel_id
    )
    WHERE id = NEW.hotel_id;
END//

-- Trigger to generate booking reference
CREATE TRIGGER generate_booking_reference BEFORE INSERT ON bookings
FOR EACH ROW
BEGIN
    SET NEW.booking_reference = CONCAT('BK', YEAR(NOW()), MONTH(NOW()), DAY(NOW()), '-', LPAD(LAST_INSERT_ID() + 1, 6, '0'));
END//

DELIMITER ;

-- Views for common queries
CREATE VIEW booking_details AS
SELECT 
    b.id,
    b.booking_reference,
    b.check_in_date,
    b.check_out_date,
    b.guests,
    b.rooms,
    b.total_amount,
    b.status,
    b.payment_status,
    b.created_at,
    u.username,
    u.email,
    u.first_name,
    u.last_name,
    h.name as hotel_name,
    h.location as hotel_location,
    h.address as hotel_address
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN hotels h ON b.hotel_id = h.id;

CREATE VIEW hotel_stats AS
SELECT 
    h.id,
    h.name,
    h.location,
    h.rating,
    h.total_rooms,
    h.available_rooms,
    COUNT(b.id) as total_bookings,
    COUNT(r.id) as total_reviews,
    AVG(r.rating) as avg_rating
FROM hotels h
LEFT JOIN bookings b ON h.id = b.hotel_id
LEFT JOIN reviews r ON h.id = r.hotel_id
GROUP BY h.id;