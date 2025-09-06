const { pool } = require('../middleware/performance');

class EnhancedHotel {
  static async create(hotelData) {
    const { 
      name, description, country, city, address, price, currency = 'USD', 
      rating = 0, total_rooms = 0, available_rooms = 0, amenities = [], images = [] 
    } = hotelData;
    
    const sql = `
      INSERT INTO hotels (name, description, country, city, address, price, currency, rating, total_rooms, available_rooms, amenities, images) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(sql, [
      name, description, country, city, address, price, currency, 
      rating, total_rooms, available_rooms, 
      JSON.stringify(amenities), JSON.stringify(images)
    ]);
    
    return result;
  }

  static async findAll(filters = {}, page = 1, limit = 20, sort = 'created_at') {
    const offset = (page - 1) * limit;
    let sql = 'SELECT * FROM hotels WHERE is_active = TRUE';
    const params = [];
    
    // Apply filters
    if (filters.country) {
      sql += ' AND country = ?';
      params.push(filters.country);
    }
    
    if (filters.city) {
      sql += ' AND city = ?';
      params.push(filters.city);
    }
    
    if (filters.min_price) {
      sql += ' AND price >= ?';
      params.push(filters.min_price);
    }
    
    if (filters.max_price) {
      sql += ' AND price <= ?';
      params.push(filters.max_price);
    }
    
    if (filters.min_rating) {
      sql += ' AND rating >= ?';
      params.push(filters.min_rating);
    }
    
    if (filters.search) {
      sql += ' AND (name LIKE ? OR description LIKE ? OR city LIKE ? OR country LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    // Apply sorting
    const validSortFields = ['name', 'price', 'rating', 'created_at', 'country', 'city'];
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = filters.order === 'asc' ? 'ASC' : 'DESC';
    sql += ` ORDER BY ${sortField} ${sortOrder}`;
    
    // Apply pagination
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const [results] = await pool.execute(sql, params);
    
    // Get total count with same filters
    let countSql = 'SELECT COUNT(*) as total FROM hotels WHERE is_active = TRUE';
    const countParams = [];
    
    if (filters.country) {
      countSql += ' AND country = ?';
      countParams.push(filters.country);
    }
    
    if (filters.city) {
      countSql += ' AND city = ?';
      countParams.push(filters.city);
    }
    
    if (filters.min_price) {
      countSql += ' AND price >= ?';
      countParams.push(filters.min_price);
    }
    
    if (filters.max_price) {
      countSql += ' AND price <= ?';
      countParams.push(filters.max_price);
    }
    
    if (filters.min_rating) {
      countSql += ' AND rating >= ?';
      countParams.push(filters.min_rating);
    }
    
    if (filters.search) {
      countSql += ' AND (name LIKE ? OR description LIKE ? OR city LIKE ? OR country LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    const [countResult] = await pool.execute(countSql, countParams);
    const total = countResult[0].total;
    
    // Parse JSON fields
    const hotels = results.map(hotel => ({
      ...hotel,
      amenities: hotel.amenities ? JSON.parse(hotel.amenities) : [],
      images: hotel.images ? JSON.parse(hotel.images) : []
    }));
    
    return {
      hotels,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      filters: filters
    };
  }

  static async findById(id) {
    const sql = 'SELECT * FROM hotels WHERE id = ? AND is_active = TRUE LIMIT 1';
    const [results] = await pool.execute(sql, [id]);
    
    if (results.length === 0) return null;
    
    const hotel = results[0];
    return {
      ...hotel,
      amenities: hotel.amenities ? JSON.parse(hotel.amenities) : [],
      images: hotel.images ? JSON.parse(hotel.images) : []
    };
  }

  static async update(id, hotelData) {
    const { 
      name, description, country, city, address, price, currency, 
      rating, total_rooms, available_rooms, amenities, images 
    } = hotelData;
    
    const sql = `
      UPDATE hotels 
      SET name = ?, description = ?, country = ?, city = ?, address = ?, 
          price = ?, currency = ?, rating = ?, total_rooms = ?, available_rooms = ?, 
          amenities = ?, images = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND is_active = TRUE
    `;
    
    const [result] = await pool.execute(sql, [
      name, description, country, city, address, price, currency, 
      rating, total_rooms, available_rooms, 
      JSON.stringify(amenities), JSON.stringify(images), id
    ]);
    
    return result;
  }

  static async delete(id) {
    const sql = 'UPDATE hotels SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const [result] = await pool.execute(sql, [id]);
    return result;
  }

  static async updateAvailability(id, availableRooms) {
    const sql = 'UPDATE hotels SET available_rooms = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const [result] = await pool.execute(sql, [availableRooms, id]);
    return result;
  }

  static async getCountries() {
    const sql = 'SELECT DISTINCT country FROM hotels WHERE is_active = TRUE ORDER BY country';
    const [results] = await pool.execute(sql);
    return results.map(row => row.country);
  }

  static async getCitiesByCountry(country) {
    const sql = 'SELECT DISTINCT city FROM hotels WHERE country = ? AND is_active = TRUE ORDER BY city';
    const [results] = await pool.execute(sql, [country]);
    return results.map(row => row.city);
  }

  static async getStats() {
    const sql = `
      SELECT 
        COUNT(*) as total_hotels,
        AVG(price) as avg_price,
        AVG(rating) as avg_rating,
        SUM(total_rooms) as total_rooms,
        SUM(available_rooms) as available_rooms,
        COUNT(DISTINCT country) as countries_count,
        COUNT(DISTINCT city) as cities_count
      FROM hotels 
      WHERE is_active = TRUE
    `;
    
    const [results] = await pool.execute(sql);
    return results[0];
  }
}

module.exports = EnhancedHotel;