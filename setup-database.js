const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  console.log('🚀 Setting up enhanced hotel reservation database...\n');

  try {
    // Create connection without database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL server');

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    
    await connection.execute(schema);
    console.log('✅ Database schema created successfully');

    // Close connection
    await connection.end();
    console.log('✅ Database connection closed');

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Database Details:');
    console.log(`   Database: ${process.env.DB_NAME}`);
    console.log(`   Host: ${process.env.DB_HOST}`);
    console.log(`   Port: 3306`);
    
    console.log('\n👤 Default Admin Account:');
    console.log(`   Email: ${process.env.ADMIN_EMAIL}`);
    console.log(`   Password: ${process.env.ADMIN_PASSWORD}`);
    console.log('   Role: admin');
    
    console.log('\n🏨 Sample Data:');
    console.log('   - 5 sample hotels across Africa');
    console.log('   - 20 African countries with currency info');
    console.log('   - Proper indexes for performance');
    
    console.log('\n🚀 Ready to start the server with: npm start');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;