const { pool } = require('../middleware/performance');

class Transaction {
  static async create(transactionData) {
    const { 
      user_id, hotel_id, amount, currency = 'USD', 
      transaction_type = 'booking', status = 'pending', metadata = {} 
    } = transactionData;
    
    // Generate unique reference ID
    const reference_id = `TXN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const sql = `
      INSERT INTO transactions (user_id, hotel_id, amount, currency, transaction_type, status, reference_id, metadata) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(sql, [
      user_id, hotel_id, amount, currency, transaction_type, status, reference_id, JSON.stringify(metadata)
    ]);
    
    return { ...result, reference_id };
  }

  static async findById(id) {
    const sql = `
      SELECT t.*, u.email as user_email, u.first_name, u.last_name, h.name as hotel_name
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      JOIN hotels h ON t.hotel_id = h.id
      WHERE t.id = ?
      LIMIT 1
    `;
    
    const [results] = await pool.execute(sql, [id]);
    
    if (results.length === 0) return null;
    
    const transaction = results[0];
    return {
      ...transaction,
      metadata: transaction.metadata ? JSON.parse(transaction.metadata) : {}
    };
  }

  static async findByReference(reference_id) {
    const sql = `
      SELECT t.*, u.email as user_email, u.first_name, u.last_name, h.name as hotel_name
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      JOIN hotels h ON t.hotel_id = h.id
      WHERE t.reference_id = ?
      LIMIT 1
    `;
    
    const [results] = await pool.execute(sql, [reference_id]);
    
    if (results.length === 0) return null;
    
    const transaction = results[0];
    return {
      ...transaction,
      metadata: transaction.metadata ? JSON.parse(transaction.metadata) : {}
    };
  }

  static async findByUserId(user_id, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    const sql = `
      SELECT t.*, h.name as hotel_name, h.city, h.country
      FROM transactions t
      JOIN hotels h ON t.hotel_id = h.id
      WHERE t.user_id = ?
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const [results] = await pool.execute(sql, [user_id, limit, offset]);
    
    // Get total count
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM transactions WHERE user_id = ?', [user_id]);
    const total = countResult[0].total;
    
    const transactions = results.map(transaction => ({
      ...transaction,
      metadata: transaction.metadata ? JSON.parse(transaction.metadata) : {}
    }));
    
    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async getAll(filters = {}, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    let sql = `
      SELECT t.*, u.email as user_email, u.first_name, u.last_name, h.name as hotel_name, h.city, h.country
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      JOIN hotels h ON t.hotel_id = h.id
      WHERE 1=1
    `;
    const params = [];
    
    // Apply filters
    if (filters.status) {
      sql += ' AND t.status = ?';
      params.push(filters.status);
    }
    
    if (filters.transaction_type) {
      sql += ' AND t.transaction_type = ?';
      params.push(filters.transaction_type);
    }
    
    if (filters.user_id) {
      sql += ' AND t.user_id = ?';
      params.push(filters.user_id);
    }
    
    if (filters.hotel_id) {
      sql += ' AND t.hotel_id = ?';
      params.push(filters.hotel_id);
    }
    
    if (filters.date_from) {
      sql += ' AND DATE(t.created_at) >= ?';
      params.push(filters.date_from);
    }
    
    if (filters.date_to) {
      sql += ' AND DATE(t.created_at) <= ?';
      params.push(filters.date_to);
    }
    
    sql += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const [results] = await pool.execute(sql, params);
    
    // Get total count with same filters
    let countSql = `
      SELECT COUNT(*) as total
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      JOIN hotels h ON t.hotel_id = h.id
      WHERE 1=1
    `;
    const countParams = [];
    
    if (filters.status) {
      countSql += ' AND t.status = ?';
      countParams.push(filters.status);
    }
    
    if (filters.transaction_type) {
      countSql += ' AND t.transaction_type = ?';
      countParams.push(filters.transaction_type);
    }
    
    if (filters.user_id) {
      countSql += ' AND t.user_id = ?';
      countParams.push(filters.user_id);
    }
    
    if (filters.hotel_id) {
      countSql += ' AND t.hotel_id = ?';
      countParams.push(filters.hotel_id);
    }
    
    if (filters.date_from) {
      countSql += ' AND DATE(t.created_at) >= ?';
      countParams.push(filters.date_from);
    }
    
    if (filters.date_to) {
      countSql += ' AND DATE(t.created_at) <= ?';
      countParams.push(filters.date_to);
    }
    
    const [countResult] = await pool.execute(countSql, countParams);
    const total = countResult[0].total;
    
    const transactions = results.map(transaction => ({
      ...transaction,
      metadata: transaction.metadata ? JSON.parse(transaction.metadata) : {}
    }));
    
    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      filters
    };
  }

  static async updateStatus(id, status, metadata = {}) {
    const sql = 'UPDATE transactions SET status = ?, metadata = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const [result] = await pool.execute(sql, [status, JSON.stringify(metadata), id]);
    return result;
  }

  static async getStats(filters = {}) {
    let sql = `
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_revenue,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount,
        AVG(CASE WHEN status = 'completed' THEN amount ELSE NULL END) as avg_transaction_amount,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_transactions,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_transactions,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_transactions,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_transactions
      FROM transactions
      WHERE 1=1
    `;
    const params = [];
    
    if (filters.date_from) {
      sql += ' AND DATE(created_at) >= ?';
      params.push(filters.date_from);
    }
    
    if (filters.date_to) {
      sql += ' AND DATE(created_at) <= ?';
      params.push(filters.date_to);
    }
    
    if (filters.hotel_id) {
      sql += ' AND hotel_id = ?';
      params.push(filters.hotel_id);
    }
    
    const [results] = await pool.execute(sql, params);
    return results[0];
  }
}

module.exports = Transaction;