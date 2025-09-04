const mysql = require('mysql2/promise');
const axios = require('axios');
const { dbConfig } = require('./config/config');

const africanCountries = [
  { country: 'Nigeria', currency: 'NGN' },
  { country: 'Ghana', currency: 'GHS' },
  { country: 'South Africa', currency: 'ZAR' },
  { country: 'Kenya', currency: 'KES' },
  { country: 'Egypt', currency: 'EGP' },
  { country: 'Morocco', currency: 'MAD' },
  { country: 'Ethiopia', currency: 'ETB' },
  { country: 'Tanzania', currency: 'TZS' },
  { country: 'Uganda', currency: 'UGX' },
  { country: 'Algeria', currency: 'DZD' }
];

// Sample hotels data per country (for demo, real data should be fetched or expanded)
const sampleHotels = {
  Nigeria: [
    { name: 'Lagos Continental Hotel', city: 'Lagos', price_per_night: 120 },
    { name: 'Abuja Grand Hotel', city: 'Abuja', price_per_night: 100 },
  ],
  Ghana: [
    { name: 'Accra Beach Resort', city: 'Accra', price_per_night: 90 },
    { name: 'Kumasi Royal Hotel', city: 'Kumasi', price_per_night: 80 },
  ],
  "South Africa": [
    { name: 'Cape Town Seaside Hotel', city: 'Cape Town', price_per_night: 150 },
    { name: 'Johannesburg Central Hotel', city: 'Johannesburg', price_per_night: 130 },
  ],
  // Add more sample hotels for other countries
};

async function seedHotels() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    for (const countryInfo of africanCountries) {
      const { country, currency } = countryInfo;
      const hotels = sampleHotels[country] || [];

      for (const hotel of hotels) {
        // Check if hotel already exists by name and country
        const [rows] = await connection.execute(
          'SELECT id FROM hotels WHERE name = ? AND country = ?',
          [hotel.name, country]
        );

        if (rows.length === 0) {
          // Insert hotel
          await connection.execute(
            'INSERT INTO hotels (name, country, city, price_per_night, currency, description) VALUES (?, ?, ?, ?, ?, ?)',
            [hotel.name, country, hotel.city, hotel.price_per_night, currency, '']
          );
          console.log(`Inserted hotel: ${hotel.name} in ${country}`);
        } else {
          console.log(`Hotel already exists: ${hotel.name} in ${country}`);
        }
      }
    }
    console.log('Seeding completed.');
  } catch (error) {
    console.error('Error seeding hotels:', error);
  } finally {
    await connection.end();
  }
}

seedHotels();
