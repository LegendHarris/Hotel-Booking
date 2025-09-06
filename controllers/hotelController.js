const axios = require('axios');
const Hotel = require('../models/Hotel');

function sendResponse(res, success, data, message, statusCode = 200) {
  return res.status(statusCode).json({ success, data, message });
}

exports.createHotel = (req, res) => {
  const hotelData = req.body;
  Hotel.create(hotelData, (err, result) => {
    if (err) return sendResponse(res, false, null, 'Error creating hotel', 500);
    sendResponse(res, true, { hotelId: result.insertId }, 'Hotel created', 201);
  });
};

exports.getAllHotels = async (req, res) => {
  const { currency, country, city, rating, minPrice, maxPrice, page = 1, limit = 20, sort } = req.query;

  Hotel.findAll((err, results) => {
    if (err) return sendResponse(res, false, null, 'Error fetching hotels', 500);

    // Filtering
    let filtered = results;
    if (country) filtered = filtered.filter(h => h.country.toLowerCase() === country.toLowerCase());
    if (city) filtered = filtered.filter(h => h.city.toLowerCase() === city.toLowerCase());
    if (rating) filtered = filtered.filter(h => parseFloat(h.rating) >= parseFloat(rating));
    if (minPrice) filtered = filtered.filter(h => parseFloat(h.price_per_night) >= parseFloat(minPrice));
    if (maxPrice) filtered = filtered.filter(h => parseFloat(h.price_per_night) <= parseFloat(maxPrice));

    // Sorting
    if (sort) {
      const [field, order] = sort.split(':');
      filtered.sort((a, b) => {
        if (!a[field] || !b[field]) return 0;
        if (order === 'desc') return b[field] - a[field];
        return a[field] - b[field];
      });
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + parseInt(limit));

    // Currency conversion if requested
    if (!currency) {
      return sendResponse(res, true, { hotels: paginated, total: filtered.length }, 'Hotels fetched');
    }

    axios.get('https://api.exchangerate.host/latest')
      .then(response => {
        const rates = response.data.rates;
        const convertedHotels = paginated.map(hotel => {
          const originalPrice = parseFloat(hotel.price_per_night);
          const originalCurrency = hotel.currency || 'USD';
          const targetCurrency = currency.toUpperCase();

          const rateToUSD = rates[originalCurrency] ? 1 / rates[originalCurrency] : 1;
          const rateToTarget = rates[targetCurrency] || 1;
          const conversionRate = rateToUSD * rateToTarget;

          const convertedPrice = (originalPrice * conversionRate).toFixed(2);

          return {
            ...hotel,
            original_price_per_night: originalPrice,
            original_currency: originalCurrency,
            converted_price_per_night: parseFloat(convertedPrice),
            converted_currency: targetCurrency
          };
        });
        sendResponse(res, true, { hotels: convertedHotels, total: filtered.length }, 'Hotels fetched with currency conversion');
      })
      .catch(error => {
        console.error('Currency conversion error:', error.message);
        sendResponse(res, false, null, 'Failed to fetch currency conversion rates', 500);
      });
  });
};

exports.getHotelById = (req, res) => {
  const id = req.params.id;
  Hotel.findById(id, (err, results) => {
    if (err) return sendResponse(res, false, null, 'Error fetching hotel', 500);
    if (results.length === 0) return sendResponse(res, false, null, 'Hotel not found', 404);
    sendResponse(res, true, results[0], 'Hotel fetched');
  });
};

exports.updateHotel = (req, res) => {
  const id = req.params.id;
  const hotelData = req.body;
  Hotel.update(id, hotelData, (err) => {
    if (err) return sendResponse(res, false, null, 'Error updating hotel', 500);
    sendResponse(res, true, null, 'Hotel updated');
  });
};

exports.deleteHotel = (req, res) => {
  const id = req.params.id;
  Hotel.delete(id, (err) => {
    if (err) return sendResponse(res, false, null, 'Error deleting hotel', 500);
    sendResponse(res, true, null, 'Hotel deleted');
  });
};

exports.getCountries = (req, res) => {
  const africanCountries = [
    { name: 'Nigeria', currency: 'NGN', code: 'NG' },
    { name: 'South Africa', currency: 'ZAR', code: 'ZA' },
    { name: 'Egypt', currency: 'EGP', code: 'EG' },
    { name: 'Kenya', currency: 'KES', code: 'KE' },
    { name: 'Ghana', currency: 'GHS', code: 'GH' },
    { name: 'Morocco', currency: 'MAD', code: 'MA' },
    { name: 'Ethiopia', currency: 'ETB', code: 'ET' },
    { name: 'Tanzania', currency: 'TZS', code: 'TZ' },
    { name: 'Uganda', currency: 'UGX', code: 'UG' },
    { name: 'Algeria', currency: 'DZD', code: 'DZ' }
  ];
  sendResponse(res, true, africanCountries, 'African countries fetched');
};

exports.convertCurrency = async (req, res) => {
  const { from, to, amount } = req.query;
  if (!from || !to || !amount) {
    return sendResponse(res, false, null, 'from, to, and amount parameters are required', 400);
  }

  try {
    const response = await axios.get('https://api.exchangerate.host/latest');
    const rates = response.data.rates;

    const fromRate = rates[from.toUpperCase()] || 1;
    const toRate = rates[to.toUpperCase()] || 1;
    const conversionRate = toRate / fromRate;
    const convertedAmount = (parseFloat(amount) * conversionRate).toFixed(2);

    sendResponse(res, true, {
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      amount: parseFloat(amount),
      convertedAmount: parseFloat(convertedAmount),
      rate: conversionRate
    }, 'Currency converted');
  } catch (error) {
    console.error('Currency conversion error:', error.message);
    sendResponse(res, false, null, 'Failed to fetch currency conversion rates', 500);
  }
};
