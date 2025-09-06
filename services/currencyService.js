const axios = require('axios');
const { pool } = require('../middleware/performance');

class CurrencyService {
  static async convertCurrency(from, to, amount) {
    try {
      // Use exchangerate.host API for live currency conversion
      const response = await axios.get(`${process.env.EXCHANGE_API_URL}/convert`, {
        params: {
          from: from.toUpperCase(),
          to: to.toUpperCase(),
          amount: amount
        },
        timeout: 5000
      });

      if (response.data && response.data.success) {
        return {
          success: true,
          data: {
            from: from.toUpperCase(),
            to: to.toUpperCase(),
            amount: parseFloat(amount),
            converted_amount: response.data.result,
            rate: response.data.info?.rate || (response.data.result / amount),
            timestamp: new Date().toISOString()
          }
        };
      } else {
        throw new Error('Currency conversion failed');
      }

    } catch (error) {
      console.error('Currency conversion error:', error.message);
      
      // Fallback to static rates if API fails
      return this.getFallbackConversion(from, to, amount);
    }
  }

  static getFallbackConversion(from, to, amount) {
    // Static fallback rates (should be updated regularly in production)
    const fallbackRates = {
      'USD': {
        'NGN': 750.00,
        'ZAR': 18.50,
        'KES': 110.00,
        'GHS': 12.00,
        'EGP': 30.50,
        'MAD': 10.20,
        'ETB': 55.00,
        'TZS': 2300.00,
        'UGX': 3700.00,
        'RWF': 1050.00
      }
    };

    const fromUpper = from.toUpperCase();
    const toUpper = to.toUpperCase();

    if (fromUpper === toUpper) {
      return {
        success: true,
        data: {
          from: fromUpper,
          to: toUpper,
          amount: parseFloat(amount),
          converted_amount: parseFloat(amount),
          rate: 1,
          timestamp: new Date().toISOString(),
          note: 'Same currency conversion'
        }
      };
    }

    let rate = 1;
    let convertedAmount = parseFloat(amount);

    if (fromUpper === 'USD' && fallbackRates.USD[toUpper]) {
      rate = fallbackRates.USD[toUpper];
      convertedAmount = amount * rate;
    } else if (toUpper === 'USD' && fallbackRates.USD[fromUpper]) {
      rate = 1 / fallbackRates.USD[fromUpper];
      convertedAmount = amount * rate;
    } else {
      // Cross conversion through USD
      if (fallbackRates.USD[fromUpper] && fallbackRates.USD[toUpper]) {
        const fromToUsd = 1 / fallbackRates.USD[fromUpper];
        const usdToTarget = fallbackRates.USD[toUpper];
        rate = fromToUsd * usdToTarget;
        convertedAmount = amount * rate;
      }
    }

    return {
      success: true,
      data: {
        from: fromUpper,
        to: toUpper,
        amount: parseFloat(amount),
        converted_amount: Math.round(convertedAmount * 100) / 100,
        rate: Math.round(rate * 10000) / 10000,
        timestamp: new Date().toISOString(),
        note: 'Fallback conversion rates used'
      }
    };
  }

  static async getSupportedCurrencies() {
    try {
      const response = await axios.get(`${process.env.EXCHANGE_API_URL}/symbols`, {
        timeout: 5000
      });

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.symbols
        };
      }
    } catch (error) {
      console.error('Get currencies error:', error.message);
    }

    // Fallback to African currencies
    return {
      success: true,
      data: {
        'USD': 'United States Dollar',
        'NGN': 'Nigerian Naira',
        'ZAR': 'South African Rand',
        'KES': 'Kenyan Shilling',
        'GHS': 'Ghanaian Cedi',
        'EGP': 'Egyptian Pound',
        'MAD': 'Moroccan Dirham',
        'ETB': 'Ethiopian Birr',
        'TZS': 'Tanzanian Shilling',
        'UGX': 'Ugandan Shilling',
        'RWF': 'Rwandan Franc',
        'BWP': 'Botswana Pula',
        'ZMW': 'Zambian Kwacha',
        'NAD': 'Namibian Dollar',
        'XOF': 'West African CFA Franc',
        'XAF': 'Central African CFA Franc',
        'TND': 'Tunisian Dinar',
        'DZD': 'Algerian Dinar',
        'AOA': 'Angolan Kwanza'
      }
    };
  }
}

module.exports = CurrencyService;