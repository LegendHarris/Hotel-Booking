const mysql = require('mysql2');
const { dbConfig } = require('./config/config');

// Create connection
const db = mysql.createConnection(dbConfig);

// Test database connection and show tables
db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    return;
  }
  
  console.log('✅ Connected to MySQL database successfully!');
  
  // Show all tables
  db.query('SHOW TABLES', (err, results) => {
    if (err) {
      console.error('❌ Error showing tables:', err.message);
      return;
    }
    
    console.log('\n📋 Available tables:');
    results.forEach(row => {
      const tableName = Object.values(row)[0];
      console.log(`  - ${tableName}`);
    });
    
    // Show sample data
    console.log('\n🏨 Sample hotels:');
    db.query('SELECT id, name, location, price FROM hotels LIMIT 3', (err, hotels) => {
      if (err) {
        console.error('❌ Error fetching hotels:', err.message);
      } else {
        hotels.forEach(hotel => {
          console.log(`  ${hotel.id}. ${hotel.name} - ${hotel.location} ($${hotel.price})`);
        });
      }
      
      // Close connection
      db.end();
      console.log('\n🎉 Database is ready for your hotel management system!');
    });
  });
});