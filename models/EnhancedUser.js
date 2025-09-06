const bcrypt = require('bcryptjs');
const { reliableQuery } = require('../middleware/reliability');

class EnhancedUser {
  static async create(userData) {
    const { email, password, role = 'user', first_name, last_name, phone, is_verified = false, verification_code } = userData;
    
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const sql = `
      INSERT INTO users (email, password, role, first_name, last_name, phone, is_verified, verification_code) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await reliableQuery(sql, [email, hashedPassword, role, first_name, last_name, phone, is_verified, verification_code]);
    return result;
  }

  static async findByEmail(email) {
    const sql = 'SELECT id, email, role, first_name, last_name, phone, created_at FROM users WHERE email = ? AND is_active = TRUE LIMIT 1';
    const results = await reliableQuery(sql, [email]);
    return results[0] || null;
  }

  static async findByEmailWithVerification(email) {
    const sql = 'SELECT * FROM users WHERE email = ? AND is_active = TRUE LIMIT 1';
    const results = await reliableQuery(sql, [email]);
    return results[0] || null;
  }

  static async verifyUser(id) {
    const sql = 'UPDATE users SET is_verified = TRUE, verification_code = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const [result] = await pool.execute(sql, [id]);
    return result;
  }

  static async findById(id) {
    const sql = 'SELECT id, email, role, first_name, last_name, phone, created_at FROM users WHERE id = ? AND is_active = TRUE LIMIT 1';
    const [results] = await pool.execute(sql, [id]);
    return results[0] || null;
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateProfile(id, profileData) {
    const { first_name, last_name, phone } = profileData;
    const sql = 'UPDATE users SET first_name = ?, last_name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const [result] = await pool.execute(sql, [first_name, last_name, phone, id]);
    return result;
  }

  static async changePassword(id, newPassword) {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    const sql = 'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const [result] = await pool.execute(sql, [hashedPassword, id]);
    return result;
  }

  static async deactivate(id) {
    const sql = 'UPDATE users SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const [result] = await pool.execute(sql, [id]);
    return result;
  }

  static async getAll(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const sql = `
      SELECT id, email, role, first_name, last_name, phone, created_at 
      FROM users 
      WHERE is_active = TRUE 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    const [results] = await pool.execute(sql, [limit, offset]);
    
    // Get total count
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM users WHERE is_active = TRUE');
    const total = countResult[0].total;
    
    return {
      users: results,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async seedDefaultAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminEmail || !adminPassword) {
      throw new Error('Admin credentials not configured in environment variables');
    }

    // Check if admin already exists
    const existingAdmin = await this.findByEmail(adminEmail);
    if (existingAdmin) {
      console.log('✅ Default admin already exists');
      return existingAdmin;
    }

    // Create default admin
    const adminData = {
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      first_name: 'System',
      last_name: 'Administrator'
    };

    try {
      await this.create(adminData);
      console.log('✅ Default admin created successfully');
      return await this.findByEmail(adminEmail);
    } catch (error) {
      console.error('❌ Failed to create default admin:', error.message);
      throw error;
    }
  }
}

module.exports = EnhancedUser;