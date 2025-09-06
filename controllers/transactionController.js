const Transaction = require('../models/Transaction');
const EnhancedAuthController = require('./enhancedAuthController');

class TransactionController {
  // Get all transactions (Admin only)
  static async getAllTransactions(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        transaction_type,
        user_id,
        hotel_id,
        date_from,
        date_to
      } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (transaction_type) filters.transaction_type = transaction_type;
      if (user_id) filters.user_id = parseInt(user_id);
      if (hotel_id) filters.hotel_id = parseInt(hotel_id);
      if (date_from) filters.date_from = date_from;
      if (date_to) filters.date_to = date_to;

      const result = await Transaction.getAll(filters, parseInt(page), parseInt(limit));

      res.json({
        success: true,
        message: 'Transactions retrieved successfully',
        data: result
      });

    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        data: null
      });
    }
  }

  // Get user's transactions
  static async getUserTransactions(req, res) {
    try {
      const userId = req.user.userId;
      const { page = 1, limit = 20 } = req.query;

      const result = await Transaction.findByUserId(userId, parseInt(page), parseInt(limit));

      res.json({
        success: true,
        message: 'User transactions retrieved successfully',
        data: result
      });

    } catch (error) {
      console.error('Get user transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        data: null
      });
    }
  }

  // Get transaction by ID
  static async getTransactionById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const userRole = req.user.role;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid transaction ID is required',
          data: null
        });
      }

      const transaction = await Transaction.findById(parseInt(id));

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found',
          data: null
        });
      }

      // Check if user can access this transaction
      if (userRole !== 'admin' && transaction.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
          data: null
        });
      }

      res.json({
        success: true,
        message: 'Transaction retrieved successfully',
        data: { transaction }
      });

    } catch (error) {
      console.error('Get transaction error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        data: null
      });
    }
  }

  // Get transaction by reference
  static async getTransactionByReference(req, res) {
    try {
      const { reference } = req.params;
      const userId = req.user.userId;
      const userRole = req.user.role;

      if (!reference) {
        return res.status(400).json({
          success: false,
          message: 'Transaction reference is required',
          data: null
        });
      }

      const transaction = await Transaction.findByReference(reference);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found',
          data: null
        });
      }

      // Check if user can access this transaction
      if (userRole !== 'admin' && transaction.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
          data: null
        });
      }

      res.json({
        success: true,
        message: 'Transaction retrieved successfully',
        data: { transaction }
      });

    } catch (error) {
      console.error('Get transaction by reference error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        data: null
      });
    }
  }

  // Create new transaction
  static async createTransaction(req, res) {
    try {
      const {
        hotel_id,
        amount,
        currency = 'USD',
        transaction_type = 'booking',
        metadata = {}
      } = req.body;

      const user_id = req.user.userId;

      if (!hotel_id || !amount) {
        return res.status(400).json({
          success: false,
          message: 'Hotel ID and amount are required',
          data: null
        });
      }

      if (isNaN(amount) || parseFloat(amount) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be a positive number',
          data: null
        });
      }

      const transactionData = {
        user_id,
        hotel_id: parseInt(hotel_id),
        amount: parseFloat(amount),
        currency,
        transaction_type,
        status: 'pending',
        metadata
      };

      const result = await Transaction.create(transactionData);

      res.status(201).json({
        success: true,
        message: 'Transaction created successfully',
        data: {
          transaction_id: result.insertId,
          reference_id: result.reference_id
        }
      });

    } catch (error) {
      console.error('Create transaction error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        data: null
      });
    }
  }

  // Update transaction status (Admin only)
  static async updateTransactionStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, metadata = {} } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid transaction ID is required',
          data: null
        });
      }

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required',
          data: null
        });
      }

      const validStatuses = ['pending', 'completed', 'failed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be one of: ' + validStatuses.join(', '),
          data: null
        });
      }

      // Check if transaction exists
      const existingTransaction = await Transaction.findById(parseInt(id));
      if (!existingTransaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found',
          data: null
        });
      }

      await Transaction.updateStatus(parseInt(id), status, metadata);

      res.json({
        success: true,
        message: 'Transaction status updated successfully',
        data: null
      });

    } catch (error) {
      console.error('Update transaction status error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        data: null
      });
    }
  }

  // Get transaction statistics (Admin only)
  static async getTransactionStats(req, res) {
    try {
      const { date_from, date_to, hotel_id } = req.query;

      const filters = {};
      if (date_from) filters.date_from = date_from;
      if (date_to) filters.date_to = date_to;
      if (hotel_id) filters.hotel_id = parseInt(hotel_id);

      const stats = await Transaction.getStats(filters);

      res.json({
        success: true,
        message: 'Transaction statistics retrieved successfully',
        data: { stats }
      });

    } catch (error) {
      console.error('Get transaction stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        data: null
      });
    }
  }
}

module.exports = TransactionController;