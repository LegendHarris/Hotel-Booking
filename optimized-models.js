const { optimizedQuery } = require('./middleware/performance');

// Enhanced User Model with optimized queries
class OptimizedUser {
  static async create(userData) {
    const { username, email, password, first_name, last_name, role = 'user' } = userData;
    
    const sql = `
      INSERT INTO users (username, email, password, first_name, last_name, role) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    return await optimizedQuery(sql, [username, email, password, first_name, last_name, role]);
  }

  static async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ? AND is_active = TRUE LIMIT 1';
    const results = await optimizedQuery(sql, [email]);
    return results[0] || null;
  }

  static async findById(id) {
    const sql = 'SELECT id, username, email, first_name, last_name, role, created_at FROM users WHERE id = ? AND is_active = TRUE LIMIT 1';
    const results = await optimizedQuery(sql, [id]);
    return results[0] || null;
  }

  static async updateLastLogin(id) {
    const sql = 'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    return await optimizedQuery(sql, [id]);
  }

  static async updateProfile(id, profileData) {
    const { first_name, last_name, phone } = profileData;
    const sql = 'UPDATE users SET first_name = ?, last_name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    return await optimizedQuery(sql, [first_name, last_name, phone, id]);
  }

  static async deactivate(id) {
    const sql = 'UPDATE users SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    return await optimizedQuery(sql, [id]);
  }

  static async getStats() {
    const sql = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_users_30d,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count
      FROM users 
      WHERE is_active = TRUE
    `;
    const results = await optimizedQuery(sql);
    return results[0];
  }
}

// Enhanced Hotel Model with optimized queries
class OptimizedHotel {
  static async create(hotelData) {
    const { name, location, address, city, country, price, description, amenities, images, total_rooms, manager_id } = hotelData;
    
    const sql = `
      INSERT INTO hotels (name, location, address, city, country, price, description, amenities, images, total_rooms, available_rooms, manager_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    return await optimizedQuery(sql, [
      name, location, address, city, country, price, description, 
      JSON.stringify(amenities), JSON.stringify(images), total_rooms, total_rooms, manager_id
    ]);
  }

  static async findAll(filters = {}) {
    let sql = `
      SELECT h.*, 
             COALESCE(AVG(r.rating), 0) as avg_rating,
             COUNT(r.id) as review_count,
             COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END) as confirmed_bookings
      FROM hotels h
      LEFT JOIN reviews r ON h.id = r.hotel_id
      LEFT JOIN bookings b ON h.id = b.hotel_id
      WHERE h.is_active = TRUE
    `;
    
    const params = [];
    
    if (filters.city) {
      sql += ' AND h.city LIKE ?';
      params.push(`%${filters.city}%`);
    }
    
    if (filters.minPrice) {
      sql += ' AND h.price >= ?';
      params.push(filters.minPrice);
    }
    
    if (filters.maxPrice) {
      sql += ' AND h.price <= ?';
      params.push(filters.maxPrice);
    }
    
    sql += ' GROUP BY h.id ORDER BY h.created_at DESC';
    
    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }
    
    return await optimizedQuery(sql, params);
  }

  static async findById(id) {
    const sql = `
      SELECT h.*, 
             COALESCE(AVG(r.rating), 0) as avg_rating,
             COUNT(r.id) as review_count
      FROM hotels h
      LEFT JOIN reviews r ON h.id = r.hotel_id
      WHERE h.id = ? AND h.is_active = TRUE
      GROUP BY h.id
      LIMIT 1
    `;
    
    const results = await optimizedQuery(sql, [id]);
    return results[0] || null;
  }

  static async update(id, hotelData) {
    const { name, location, address, city, country, price, description, amenities, images, total_rooms } = hotelData;
    
    const sql = `
      UPDATE hotels 
      SET name = ?, location = ?, address = ?, city = ?, country = ?, price = ?, 
          description = ?, amenities = ?, images = ?, total_rooms = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    return await optimizedQuery(sql, [
      name, location, address, city, country, price, description,
      JSON.stringify(amenities), JSON.stringify(images), total_rooms, id
    ]);
  }

  static async updateAvailability(id, availableRooms) {
    const sql = 'UPDATE hotels SET available_rooms = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    return await optimizedQuery(sql, [availableRooms, id]);
  }

  static async search(query) {
    const sql = `
      SELECT h.*, 
             COALESCE(AVG(r.rating), 0) as avg_rating,
             COUNT(r.id) as review_count,
             MATCH(h.name, h.location, h.description) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance
      FROM hotels h
      LEFT JOIN reviews r ON h.id = r.hotel_id
      WHERE h.is_active = TRUE 
        AND (MATCH(h.name, h.location, h.description) AGAINST(? IN NATURAL LANGUAGE MODE)
             OR h.name LIKE ? OR h.location LIKE ? OR h.city LIKE ?)
      GROUP BY h.id
      ORDER BY relevance DESC, avg_rating DESC
      LIMIT 20
    `;
    
    const searchTerm = `%${query}%`;
    return await optimizedQuery(sql, [query, query, searchTerm, searchTerm, searchTerm]);
  }

  static async getPopular(limit = 10) {
    const sql = `
      SELECT h.*, 
             COALESCE(AVG(r.rating), 0) as avg_rating,
             COUNT(b.id) as booking_count
      FROM hotels h
      LEFT JOIN reviews r ON h.id = r.hotel_id
      LEFT JOIN bookings b ON h.id = b.hotel_id AND b.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      WHERE h.is_active = TRUE
      GROUP BY h.id
      ORDER BY booking_count DESC, avg_rating DESC
      LIMIT ?
    `;
    
    return await optimizedQuery(sql, [limit]);
  }

  static async delete(id) {
    const sql = 'UPDATE hotels SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    return await optimizedQuery(sql, [id]);
  }
}

// Enhanced Booking Model with optimized queries
class OptimizedBooking {
  static async create(bookingData) {
    const { user_id, hotel_id, check_in_date, check_out_date, guests, rooms, total_amount, special_requests } = bookingData;
    
    // Generate booking reference
    const reference = `BK${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const sql = `
      INSERT INTO bookings (user_id, hotel_id, check_in_date, check_out_date, guests, rooms, total_amount, special_requests, booking_reference) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    return await optimizedQuery(sql, [
      user_id, hotel_id, check_in_date, check_out_date, guests, rooms, total_amount, special_requests, reference
    ]);
  }

  static async findByUserId(userId, status = null) {
    let sql = `
      SELECT b.*, h.name as hotel_name, h.location as hotel_location, h.images as hotel_images
      FROM bookings b
      JOIN hotels h ON b.hotel_id = h.id
      WHERE b.user_id = ?
    `;
    
    const params = [userId];
    
    if (status) {
      sql += ' AND b.status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY b.created_at DESC';
    
    return await optimizedQuery(sql, params);
  }

  static async findById(id) {
    const sql = `
      SELECT b.*, h.name as hotel_name, h.location as hotel_location, h.address as hotel_address,
             u.username, u.email, u.first_name, u.last_name
      FROM bookings b
      JOIN hotels h ON b.hotel_id = h.id
      JOIN users u ON b.user_id = u.id
      WHERE b.id = ?
      LIMIT 1
    `;
    
    const results = await optimizedQuery(sql, [id]);
    return results[0] || null;
  }

  static async updateStatus(id, status) {
    const sql = 'UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    return await optimizedQuery(sql, [status, id]);
  }

  static async updatePaymentStatus(id, paymentStatus) {
    const sql = 'UPDATE bookings SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    return await optimizedQuery(sql, [paymentStatus, id]);
  }

  static async cancel(id, userId) {
    const sql = 'UPDATE bookings SET status = "cancelled", updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?';
    return await optimizedQuery(sql, [id, userId]);
  }

  static async getUpcoming(userId) {
    const sql = `
      SELECT b.*, h.name as hotel_name, h.location as hotel_location
      FROM bookings b
      JOIN hotels h ON b.hotel_id = h.id
      WHERE b.user_id = ? AND b.check_in_date >= CURDATE() AND b.status IN ('confirmed', 'pending')
      ORDER BY b.check_in_date ASC
    `;
    
    return await optimizedQuery(sql, [userId]);
  }

  static async getByDateRange(startDate, endDate, hotelId = null) {
    let sql = `
      SELECT b.*, h.name as hotel_name, u.username, u.email
      FROM bookings b
      JOIN hotels h ON b.hotel_id = h.id
      JOIN users u ON b.user_id = u.id
      WHERE b.check_in_date <= ? AND b.check_out_date >= ? AND b.status = 'confirmed'
    `;
    
    const params = [endDate, startDate];
    
    if (hotelId) {
      sql += ' AND b.hotel_id = ?';
      params.push(hotelId);
    }
    
    sql += ' ORDER BY b.check_in_date ASC';
    
    return await optimizedQuery(sql, params);
  }

  static async getStats(hotelId = null) {
    let sql = `
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
        SUM(CASE WHEN status = 'confirmed' THEN total_amount ELSE 0 END) as total_revenue,
        AVG(CASE WHEN status = 'confirmed' THEN total_amount ELSE NULL END) as avg_booking_value
      FROM bookings
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `;
    
    const params = [];
    
    if (hotelId) {
      sql += ' AND hotel_id = ?';
      params.push(hotelId);
    }
    
    const results = await optimizedQuery(sql, params);
    return results[0];
  }
}

module.exports = {
  OptimizedUser,
  OptimizedHotel,
  OptimizedBooking
};