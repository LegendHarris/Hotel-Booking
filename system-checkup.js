const mysql = require('mysql2');
const { dbConfig } = require('./config/config');
const fs = require('fs');
const path = require('path');

console.log('🔍 Starting comprehensive system checkup...\n');

// 1. Database Connection Test
function testDatabase() {
    return new Promise((resolve, reject) => {
        console.log('📊 Testing Database Connection...');
        const db = mysql.createConnection(dbConfig);
        
        db.connect((err) => {
            if (err) {
                console.log('❌ Database connection failed:', err.message);
                reject(err);
                return;
            }
            
            console.log('✅ Database connected successfully');
            
            // Test tables exist
            db.query('SHOW TABLES', (err, results) => {
                if (err) {
                    console.log('❌ Error checking tables:', err.message);
                    reject(err);
                    return;
                }
                
                const tables = results.map(row => Object.values(row)[0]);
                console.log('📋 Available tables:', tables.join(', '));
                
                // Test sample data
                db.query('SELECT COUNT(*) as count FROM users', (err, userCount) => {
                    if (err) {
                        console.log('❌ Error checking users:', err.message);
                    } else {
                        console.log(`👥 Users in database: ${userCount[0].count}`);
                    }
                    
                    db.query('SELECT COUNT(*) as count FROM hotels', (err, hotelCount) => {
                        if (err) {
                            console.log('❌ Error checking hotels:', err.message);
                        } else {
                            console.log(`🏨 Hotels in database: ${hotelCount[0].count}`);
                        }
                        
                        db.end();
                        resolve(true);
                    });
                });
            });
        });
    });
}

// 2. Backend Files Check
function checkBackendFiles() {
    console.log('\n🔧 Checking Backend Files...');
    
    const requiredFiles = [
        'server.js',
        'package.json',
        '.env',
        'config/config.js',
        'models/User.js',
        'models/Hotel.js',
        'models/Booking.js',
        'routes/authRoutes.js',
        'routes/hotelRoutes.js',
        'routes/bookingRoutes.js',
        'controllers/authController.js',
        'controllers/hotelController.js',
        'controllers/bookingController.js'
    ];
    
    let allFilesExist = true;
    
    requiredFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            console.log(`✅ ${file}`);
        } else {
            console.log(`❌ ${file} - MISSING`);
            allFilesExist = false;
        }
    });
    
    return allFilesExist;
}

// 3. Frontend Files Check
function checkFrontendFiles() {
    console.log('\n🎨 Checking Frontend Files...');
    
    const frontendFiles = [
        'index.html',
        'login.html',
        'register.html',
        'hotels.html',
        'booking.html',
        'user-dashboard.html',
        'admin-dashboard.html',
        'hotel-dashboard.html',
        'style.css',
        'dashboard.css',
        'main.js',
        'auth.js',
        'dashboard.js',
        'hotels.js',
        'booking.js',
        'utils.js'
    ];
    
    let allFilesExist = true;
    
    frontendFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            console.log(`✅ ${file}`);
        } else {
            console.log(`❌ ${file} - MISSING`);
            allFilesExist = false;
        }
    });
    
    return allFilesExist;
}

// 4. Dependencies Check
function checkDependencies() {
    console.log('\n📦 Checking Dependencies...');
    
    try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const dependencies = packageJson.dependencies;
        
        console.log('Required dependencies:');
        Object.keys(dependencies).forEach(dep => {
            try {
                require.resolve(dep);
                console.log(`✅ ${dep} - ${dependencies[dep]}`);
            } catch (err) {
                console.log(`❌ ${dep} - NOT INSTALLED`);
            }
        });
        
        return true;
    } catch (err) {
        console.log('❌ Error reading package.json:', err.message);
        return false;
    }
}

// 5. Environment Variables Check
function checkEnvironment() {
    console.log('\n🌍 Checking Environment Variables...');
    
    const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
    let allVarsPresent = true;
    
    requiredEnvVars.forEach(envVar => {
        if (process.env[envVar]) {
            console.log(`✅ ${envVar} - Set`);
        } else {
            console.log(`❌ ${envVar} - NOT SET`);
            allVarsPresent = false;
        }
    });
    
    return allVarsPresent;
}

// Run all checks
async function runCheckup() {
    try {
        const backendFiles = checkBackendFiles();
        const frontendFiles = checkFrontendFiles();
        const dependencies = checkDependencies();
        const environment = checkEnvironment();
        await testDatabase();
        
        console.log('\n📊 CHECKUP SUMMARY:');
        console.log('==================');
        console.log(`Backend Files: ${backendFiles ? '✅ OK' : '❌ ISSUES'}`);
        console.log(`Frontend Files: ${frontendFiles ? '✅ OK' : '❌ ISSUES'}`);
        console.log(`Dependencies: ${dependencies ? '✅ OK' : '❌ ISSUES'}`);
        console.log(`Environment: ${environment ? '✅ OK' : '❌ ISSUES'}`);
        console.log('Database: ✅ OK');
        
        if (backendFiles && frontendFiles && dependencies && environment) {
            console.log('\n🎉 System is ready to run!');
            console.log('💡 Next steps:');
            console.log('   1. Run: npm start (to start backend)');
            console.log('   2. Open index.html in browser (for frontend)');
            console.log('   3. Backend API will be available at: http://localhost:3000');
        } else {
            console.log('\n⚠️  Some issues found. Please fix them before running the system.');
        }
        
    } catch (err) {
        console.log('\n❌ Database connection failed. Please check your MySQL server and credentials.');
    }
}

runCheckup();