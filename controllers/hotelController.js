const axios = require('axios');
const Hotel = require('../models/Hotel');

exports.createHotel = (req, res) => {
  const hotelData = req.body;
  Hotel.create(hotelData, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ message: 'Hotel created', hotelId: result.insertId });
  });
};

exports.getAllHotels = async (req, res) => {
  const requestedCurrency = req.query.currency;

  Hotel.findAll(async (err, results) => {
    if (err) return res.status(500).json({ error: err });

    if (!requestedCurrency) {
      return res.json(results);
    }

    try {
      // Fetch exchange rates with base as original currency (assumed USD for simplicity)
      const response = await axios.get('https://api.exchangerate.host/latest');
      const rates = response.data.rates;

      // Convert prices
      const convertedResults = results.map(hotel => {
        const originalPrice = parseFloat(hotel.price_per_night);
        const originalCurrency = hotel.currency || 'USD';
        const targetCurrency = requestedCurrency.toUpperCase();

        // Calculate conversion rate
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

      res.json(convertedResults);
    } catch (error) {
      console.error('Currency conversion error:', error.message);
      res.status(500).json({ error: 'Failed to fetch currency conversion rates' });
    }
  });
};

exports.getHotelById = (req, res) => {
  const id = req.params.id;
  Hotel.findById(id, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Hotel not found' });
    res.json(results[0]);
  });
};

exports.updateHotel = (req, res) => {
  const id = req.params.id;
  const hotelData = req.body;
  Hotel.update(id, hotelData, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Hotel updated' });
  });
};

exports.deleteHotel = (req, res) => {
  const id = req.params.id;
  Hotel.delete(id, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Hotel deleted' });
  });
};
