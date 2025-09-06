const EnhancedHotel = require('../models/EnhancedHotel');
const axios = require('axios');

class EnhancedHotelController {
  // Get all hotels with filters, pagination, and sorting
  static async getAllHotels(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        sort = 'created_at',
        order = 'desc',
        country,
        city,
        min_price,
        max_price,
        min_rating,
        search
      } = req.query;

      const filters = {};
      if (country) filters.country = country;
      if (city) filters.city = city;
      if (min_price) filters.min_price = parseFloat(min_price);
      if (max_price) filters.max_price = parseFloat(max_price);
      if (min_rating) filters.min_rating = parseFloat(min_rating);
      if (search) filters.search = search;
      if (order) filters.order = order;

      const result = await EnhancedHotel.findAll(
        filters,
        parseInt(page),
        parseInt(limit),
        sort
      );

      res.json({
        success: true,
        message: 'Hotels retrieved successfully',
        data: result
      });

    } catch (error) {
      console.error('Get hotels error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        data: null
      });
    }
  }

  // Get hotel by ID
  static async getHotelById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid hotel ID is required',
          data: null
        });
      }

      const hotel = await EnhancedHotel.findById(parseInt(id));

      if (!hotel) {
        return res.status(404).json({
          success: false,
          message: 'Hotel not found',
          data: null
        });
      }

      res.json({
        success: true,
        message: 'Hotel retrieved successfully',
        data: { hotel }
      });

    } catch (error) {
      console.error('Get hotel by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        data: null
      });
    }
  }

  // Create new hotel (Admin only)
  static async createHotel(req, res) {
    try {
      const {
        name,
        description,
        country,
        city,
        address,
        price,
        currency = 'USD',
        rating = 0,
        total_rooms = 0,
        available_rooms,
        amenities = [],
        images = []
      } = req.body;

      // Validate required fields
      if (!name || !country || !city || !price) {
        return res.status(400).json({
          success: false,
          message: 'Name, country, city, and price are required',
          data: null
        });
      }

      const hotelData = {
        name,
        description,
        country,
        city,
        address,
        price: parseFloat(price),
        currency,
        rating: parseFloat(rating),
        total_rooms: parseInt(total_rooms),
        available_rooms: available_rooms !== undefined ? parseInt(available_rooms) : parseInt(total_rooms),
        amenities,
        images
      };

      const result = await EnhancedHotel.create(hotelData);

      res.status(201).json({
        success: true,
        message: 'Hotel created successfully',
        data: { hotel_id: result.insertId }
      });

    } catch (error) {
      console.error('Create hotel error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        data: null
      });
    }
  }

  // Update hotel (Admin only)
  static async updateHotel(req, res) {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        country,
        city,
        address,
        price,
        currency,
        rating,
        total_rooms,
        available_rooms,
        amenities,
        images
      } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid hotel ID is required',
          data: null
        });
      }

      // Check if hotel exists
      const existingHotel = await EnhancedHotel.findById(parseInt(id));
      if (!existingHotel) {
        return res.status(404).json({
          success: false,
          message: 'Hotel not found',
          data: null
        });
      }

      const hotelData = {
        name: name || existingHotel.name,
        description: description || existingHotel.description,
        country: country || existingHotel.country,
        city: city || existingHotel.city,
        address: address || existingHotel.address,
        price: price !== undefined ? parseFloat(price) : existingHotel.price,
        currency: currency || existingHotel.currency,
        rating: rating !== undefined ? parseFloat(rating) : existingHotel.rating,
        total_rooms: total_rooms !== undefined ? parseInt(total_rooms) : existingHotel.total_rooms,
        available_rooms: available_rooms !== undefined ? parseInt(available_rooms) : existingHotel.available_rooms,
        amenities: amenities || existingHotel.amenities,
        images: images || existingHotel.images
      };

      await EnhancedHotel.update(parseInt(id), hotelData);

      res.json({
        success: true,
        message: 'Hotel updated successfully',
        data: null
      });

    } catch (error) {
      console.error('Update hotel error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        data: null
      });
    }
  }

  // Delete hotel (Admin only)
  static async deleteHotel(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid hotel ID is required',
          data: null
        });
      }

      // Check if hotel exists
      const existingHotel = await EnhancedHotel.findById(parseInt(id));
      if (!existingHotel) {
        return res.status(404).json({
          success: false,
          message: 'Hotel not found',
          data: null
        });
      }

      await EnhancedHotel.delete(parseInt(id));

      res.json({
        success: true,
        message: 'Hotel deleted successfully',
        data: null
      });

    } catch (error) {
      console.error('Delete hotel error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        data: null
      });
    }
  }

  // Get hotel statistics (Admin only)
  static async getHotelStats(req, res) {
    try {
      const stats = await EnhancedHotel.getStats();

      res.json({
        success: true,
        message: 'Hotel statistics retrieved successfully',
        data: { stats }
      });

    } catch (error) {
      console.error('Get hotel stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        data: null
      });
    }
  }

  // Get available countries
  static async getCountries(req, res) {
    try {
      const countries = await EnhancedHotel.getCountries();

      res.json({
        success: true,
        message: 'Countries retrieved successfully',
        data: { countries }
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

  // Get cities by country
  static async getCitiesByCountry(req, res) {
    try {
      const { country } = req.params;

      if (!country) {
        return res.status(400).json({
          success: false,
          message: 'Country is required',
          data: null
        });
      }

      const cities = await EnhancedHotel.getCitiesByCountry(country);

      res.json({
        success: true,
        message: 'Cities retrieved successfully',
        data: { cities }
      });

    } catch (error) {
      console.error('Get cities error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        data: null
      });
    }
  }
}

module.exports = EnhancedHotelController;