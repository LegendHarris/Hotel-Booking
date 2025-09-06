const CurrencyService = require('../services/currencyService');
const { pool } = require('../middleware/performance');

class CurrencyController {
  // Convert currency
  static async convertCurrency(req, res) {
    try {
      const { from, to, amount } = req.query;

      if (!from || !to || !amount) {
        return res.status(400).json({
          success: false,
          message: 'From currency, to currency, and amount are required',
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

      const result = await CurrencyService.convertCurrency(from, to, parseFloat(amount));

      res.json({
        success: result.success,
        message: result.success ? 'Currency converted successfully' : 'Currency conversion failed',
        data: result.data
      });

    } catch (error) {
      console.error('Currency conversion error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        data: null
      });
    }
  }

  // Get supported currencies
  static async getSupportedCurrencies(req, res) {
    try {
      const result = await CurrencyService.getSupportedCurrencies();

      res.json({
        success: result.success,
        message: 'Supported currencies retrieved successfully',
        data: result.data
      });

    } catch (error) {
      console.error('Get currencies error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        data: null
      });
    }
  }

  // Get African countries with currency info
  static async getAfricanCountries(req, res) {
    try {
      const sql = 'SELECT * FROM countries WHERE is_active = TRUE ORDER BY name';
      const [results] = await pool.execute(sql);

      res.json({
        success: true,
        message: 'African countries retrieved successfully',
        data: { countries: results }
      });

    } catch (error) {
      console.error('Get countries error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        data: null
      });
    }
  }

  // Get country by code
  static async getCountryByCode(req, res) {
    try {
      const { code } = req.params;

      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'Country code is required',
          data: null
        });
      }

      const sql = 'SELECT * FROM countries WHERE code = ? AND is_active = TRUE LIMIT 1';
      const [results] = await pool.execute(sql, [code.toUpperCase()]);

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Country not found',
          data: null
        });
      }

      res.json({
        success: true,
        message: 'Country retrieved successfully',
        data: { country: results[0] }
      });

    } catch (error) {
      console.error('Get country error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        data: null
      });
    }
  }
}

module.exports = CurrencyController;