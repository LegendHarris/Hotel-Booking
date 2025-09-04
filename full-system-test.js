const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const { dbConfig, jwtSecret } = require('./config/config');

console.log('🔍 FULL SYSTEM ANALYSIS STARTING...\n');
console.log('=' .repeat(50));

class SystemTester {
    constructor() {
        this.results = {
            database: { status: 'pending', tests: [] },
            backend: { status: 'pending', tests: [] },
            frontend: { status: 'pending', tests: [] },
            performance: { status: 'pending', tests: [] },
            security: { status: 'pending', tests: [] }
        };
    }

    async testDatabase() {
        console.log('\n📊 DATABASE CONNECTIVITY & PERFORMANCE TESTS');
        console.log('-'.repeat(45));
        
        try {
            const connection = await mysql.createConnection(dbConfig);
            this.addResult('database', '✅ Database Connection', 'SUCCESS', 'Connected to MySQL successfully');

            // Test 1: Table Structure Validation
            const [tables] = await connection.execute('SHOW TABLES');
            const expectedTables = ['users', 'hotels', 'bookings', 'reviews', 'payments', 'notifications', 'room_types', 'user_sessions', 'system_settings'];
            const existingTables = tables.map(row => Object.values(row)[0]);
            
            const missingTables = expectedTables.filter(table => !existingTables.includes(table));
            if (missingTables.length === 0) {
                this.addResult('database', '✅ Table Structure', 'SUCCESS', `All ${expectedTables.length} required tables exist`);
            } else {
                this.addResult('database', '❌ Table Structure', 'FAILED', `Missing tables: ${missingTables.join(', ')}`);
            }

            // Test 2: Data Integrity Check
            const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
            const [hotelCount] = await connection.execute('SELECT COUNT(*) as count FROM hotels');
            const [bookingCount] = await connection.execute('SELECT COUNT(*) as count FROM bookings');
            
            this.addResult('database', '📊 Data Counts', 'INFO', 
                `Users: ${userCount[0].count}, Hotels: ${hotelCount[0].count}, Bookings: ${bookingCount[0].count}`);

            // Test 3: Performance Test - Query Speed
            const startTime = Date.now();
            await connection.execute(`
                SELECT h.*, AVG(r.rating) as avg_rating, COUNT(b.id) as booking_count 
                FROM hotels h 
                LEFT JOIN reviews r ON h.id = r.hotel_id 
                LEFT JOIN bookings b ON h.id = b.hotel_id 
                GROUP BY h.id
            `);
            const queryTime = Date.now() - startTime;
            
            if (queryTime < 100) {
                this.addResult('database', '⚡ Query Performance', 'SUCCESS', `Complex query executed in ${queryTime}ms`);
            } else {
                this.addResult('database', '⚠️ Query Performance', 'WARNING', `Query took ${queryTime}ms (consider optimization)`);
            }

            // Test 4: Foreign Key Constraints
            try {
                await connection.execute('INSERT INTO bookings (user_id, hotel_id, check_in_date, check_out_date) VALUES (99999, 1, "2024-01-01", "2024-01-02")');
                this.addResult('database', '❌ Foreign Key Constraints', 'FAILED', 'Invalid foreign key was accepted');
            } catch (err) {
                this.addResult('database', '✅ Foreign Key Constraints', 'SUCCESS', 'Foreign key constraints working properly');
            }

            // Test 5: Index Performance
            const [indexInfo] = await connection.execute('SHOW INDEX FROM bookings');
            const hasUserIndex = indexInfo.some(idx => idx.Column_name === 'user_id');
            const hasHotelIndex = indexInfo.some(idx => idx.Column_name === 'hotel_id');
            
            if (hasUserIndex && hasHotelIndex) {
                this.addResult('database', '✅ Database Indexes', 'SUCCESS', 'Required indexes are present');
            } else {
                this.addResult('database', '⚠️ Database Indexes', 'WARNING', 'Some recommended indexes missing');
            }

            await connection.end();
            this.results.database.status = 'completed';

        } catch (error) {
            this.addResult('database', '❌ Database Connection', 'FAILED', error.message);
            this.results.database.status = 'failed';
        }
    }

    async testBackend() {
        console.log('\n🔧 BACKEND FUNCTIONALITY TESTS');
        console.log('-'.repeat(35));

        // Test 1: File Structure
        const requiredFiles = [
            { path: 'server.js', type: 'Main Server' },
            { path: 'package.json', type: 'Dependencies' },
            { path: '.env', type: 'Environment' },
            { path: 'config/config.js', type: 'Configuration' },
            { path: 'models/User.js', type: 'User Model' },
            { path: 'models/Hotel.js', type: 'Hotel Model' },
            { path: 'models/Booking.js', type: 'Booking Model' },
            { path: 'routes/authRoutes.js', type: 'Auth Routes' },
            { path: 'routes/hotelRoutes.js', type: 'Hotel Routes' },
            { path: 'routes/bookingRoutes.js', type: 'Booking Routes' },
            { path: 'controllers/authController.js', type: 'Auth Controller' },
            { path: 'controllers/hotelController.js', type: 'Hotel Controller' },
            { path: 'controllers/bookingController.js', type: 'Booking Controller' }
        ];

        let missingFiles = [];
        for (const file of requiredFiles) {
            try {
                await fs.access(path.join(__dirname, file.path));
                this.addResult('backend', `✅ ${file.type}`, 'SUCCESS', `${file.path} exists`);
            } catch {
                missingFiles.push(file.path);
                this.addResult('backend', `❌ ${file.type}`, 'FAILED', `${file.path} missing`);
            }
        }

        // Test 2: Package Dependencies
        try {
            const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
            const requiredDeps = ['express', 'mysql2', 'jsonwebtoken', 'bcryptjs', 'dotenv'];
            const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
            
            if (missingDeps.length === 0) {
                this.addResult('backend', '✅ Dependencies', 'SUCCESS', 'All required packages present');
            } else {
                this.addResult('backend', '❌ Dependencies', 'FAILED', `Missing: ${missingDeps.join(', ')}`);
            }
        } catch (error) {
            this.addResult('backend', '❌ Package.json', 'FAILED', error.message);
        }

        // Test 3: Environment Variables
        const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
        const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
        
        if (missingEnvVars.length === 0) {
            this.addResult('backend', '✅ Environment Variables', 'SUCCESS', 'All required env vars set');
        } else {
            this.addResult('backend', '❌ Environment Variables', 'FAILED', `Missing: ${missingEnvVars.join(', ')}`);
        }

        // Test 4: Code Quality Check
        try {
            const serverCode = await fs.readFile('server.js', 'utf8');
            
            // Check for security headers
            if (serverCode.includes('cors') || serverCode.includes('helmet')) {
                this.addResult('backend', '✅ Security Headers', 'SUCCESS', 'Security middleware detected');
            } else {
                this.addResult('backend', '⚠️ Security Headers', 'WARNING', 'Consider adding CORS/Helmet middleware');
            }

            // Check for error handling
            if (serverCode.includes('try') && serverCode.includes('catch')) {
                this.addResult('backend', '✅ Error Handling', 'SUCCESS', 'Error handling implemented');
            } else {
                this.addResult('backend', '⚠️ Error Handling', 'WARNING', 'Limited error handling detected');
            }

        } catch (error) {
            this.addResult('backend', '❌ Code Analysis', 'FAILED', error.message);
        }

        this.results.backend.status = missingFiles.length === 0 ? 'completed' : 'failed';
    }

    async testFrontend() {
        console.log('\n🎨 FRONTEND FUNCTIONALITY TESTS');
        console.log('-'.repeat(35));

        const frontendFiles = [
            { path: 'index.html', type: 'Landing Page' },
            { path: 'login.html', type: 'Login Page' },
            { path: 'register.html', type: 'Registration' },
            { path: 'hotels.html', type: 'Hotels Listing' },
            { path: 'booking.html', type: 'Booking Page' },
            { path: 'user-dashboard.html', type: 'User Dashboard' },
            { path: 'admin-dashboard.html', type: 'Admin Dashboard' },
            { path: 'style.css', type: 'Main Styles' },
            { path: 'main.js', type: 'Main JavaScript' },
            { path: 'auth.js', type: 'Authentication JS' },
            { path: 'utils.js', type: 'Utility Functions' }
        ];

        let missingFrontendFiles = [];
        for (const file of frontendFiles) {
            try {
                await fs.access(path.join(__dirname, file.path));
                this.addResult('frontend', `✅ ${file.type}`, 'SUCCESS', `${file.path} exists`);
            } catch {
                missingFrontendFiles.push(file.path);
                this.addResult('frontend', `❌ ${file.type}`, 'FAILED', `${file.path} missing`);
            }
        }

        // Test HTML Structure
        try {
            const indexHtml = await fs.readFile('index.html', 'utf8');
            
            // Check for Bootstrap
            if (indexHtml.includes('bootstrap')) {
                this.addResult('frontend', '✅ UI Framework', 'SUCCESS', 'Bootstrap CSS framework detected');
            } else {
                this.addResult('frontend', '⚠️ UI Framework', 'WARNING', 'No CSS framework detected');
            }

            // Check for responsive design
            if (indexHtml.includes('viewport')) {
                this.addResult('frontend', '✅ Responsive Design', 'SUCCESS', 'Viewport meta tag present');
            } else {
                this.addResult('frontend', '❌ Responsive Design', 'FAILED', 'Missing viewport meta tag');
            }

        } catch (error) {
            this.addResult('frontend', '❌ HTML Analysis', 'FAILED', error.message);
        }

        // Test JavaScript API Integration
        try {
            const authJs = await fs.readFile('auth.js', 'utf8');
            
            if (authJs.includes('fetch') || authJs.includes('XMLHttpRequest')) {
                this.addResult('frontend', '✅ API Integration', 'SUCCESS', 'HTTP requests implemented');
            } else {
                this.addResult('frontend', '⚠️ API Integration', 'WARNING', 'No API calls detected');
            }

            if (authJs.includes('localStorage') || authJs.includes('sessionStorage')) {
                this.addResult('frontend', '✅ State Management', 'SUCCESS', 'Local storage usage detected');
            } else {
                this.addResult('frontend', '⚠️ State Management', 'WARNING', 'No client-side storage detected');
            }

        } catch (error) {
            this.addResult('frontend', '❌ JavaScript Analysis', 'FAILED', error.message);
        }

        this.results.frontend.status = missingFrontendFiles.length === 0 ? 'completed' : 'failed';
    }

    async testPerformance() {
        console.log('\n⚡ PERFORMANCE & OPTIMIZATION TESTS');
        console.log('-'.repeat(40));

        // Test 1: File Sizes
        const filesToCheck = ['style.css', 'main.js', 'auth.js', 'index.html'];
        
        for (const file of filesToCheck) {
            try {
                const stats = await fs.stat(file);
                const sizeKB = (stats.size / 1024).toFixed(2);
                
                if (stats.size < 100000) { // Less than 100KB
                    this.addResult('performance', `✅ ${file} Size`, 'SUCCESS', `${sizeKB}KB (optimized)`);
                } else {
                    this.addResult('performance', `⚠️ ${file} Size`, 'WARNING', `${sizeKB}KB (consider optimization)`);
                }
            } catch (error) {
                this.addResult('performance', `❌ ${file} Size`, 'FAILED', 'File not found');
            }
        }

        // Test 2: Database Connection Pool
        try {
            const configCode = await fs.readFile('config/config.js', 'utf8');
            if (configCode.includes('createPool')) {
                this.addResult('performance', '✅ Connection Pooling', 'SUCCESS', 'Database connection pooling implemented');
            } else {
                this.addResult('performance', '⚠️ Connection Pooling', 'WARNING', 'Consider using connection pooling for better performance');
            }
        } catch (error) {
            this.addResult('performance', '❌ Connection Analysis', 'FAILED', error.message);
        }

        // Test 3: Caching Strategy
        try {
            const serverCode = await fs.readFile('server.js', 'utf8');
            if (serverCode.includes('cache') || serverCode.includes('Cache-Control')) {
                this.addResult('performance', '✅ Caching Strategy', 'SUCCESS', 'Caching implementation detected');
            } else {
                this.addResult('performance', '⚠️ Caching Strategy', 'WARNING', 'No caching strategy detected');
            }
        } catch (error) {
            this.addResult('performance', '❌ Caching Analysis', 'FAILED', error.message);
        }

        this.results.performance.status = 'completed';
    }

    async testSecurity() {
        console.log('\n🔒 SECURITY & BEST PRACTICES TESTS');
        console.log('-'.repeat(40));

        // Test 1: Environment Security
        try {
            const envContent = await fs.readFile('.env', 'utf8');
            
            if (envContent.includes('JWT_SECRET') && !envContent.includes('your_jwt_secret_key')) {
                this.addResult('security', '✅ JWT Secret', 'SUCCESS', 'Custom JWT secret configured');
            } else {
                this.addResult('security', '❌ JWT Secret', 'FAILED', 'Using default JWT secret (security risk)');
            }

            if (envContent.includes('DB_PASSWORD') && envContent.length > 50) {
                this.addResult('security', '✅ Environment Config', 'SUCCESS', 'Environment variables properly configured');
            } else {
                this.addResult('security', '⚠️ Environment Config', 'WARNING', 'Review environment configuration');
            }

        } catch (error) {
            this.addResult('security', '❌ Environment Security', 'FAILED', error.message);
        }

        // Test 2: Password Hashing
        try {
            const authController = await fs.readFile('controllers/authController.js', 'utf8');
            
            if (authController.includes('bcrypt')) {
                this.addResult('security', '✅ Password Hashing', 'SUCCESS', 'bcrypt password hashing implemented');
            } else {
                this.addResult('security', '❌ Password Hashing', 'FAILED', 'No password hashing detected');
            }

        } catch (error) {
            this.addResult('security', '❌ Auth Controller Analysis', 'FAILED', error.message);
        }

        // Test 3: SQL Injection Protection
        try {
            const userModel = await fs.readFile('models/User.js', 'utf8');
            
            if (userModel.includes('?') && !userModel.includes('${')) {
                this.addResult('security', '✅ SQL Injection Protection', 'SUCCESS', 'Parameterized queries detected');
            } else {
                this.addResult('security', '❌ SQL Injection Protection', 'FAILED', 'Potential SQL injection vulnerability');
            }

        } catch (error) {
            this.addResult('security', '❌ SQL Security Analysis', 'FAILED', error.message);
        }

        // Test 4: Input Validation
        try {
            const authRoutes = await fs.readFile('routes/authRoutes.js', 'utf8');
            
            if (authRoutes.includes('validate') || authRoutes.includes('sanitize')) {
                this.addResult('security', '✅ Input Validation', 'SUCCESS', 'Input validation implemented');
            } else {
                this.addResult('security', '⚠️ Input Validation', 'WARNING', 'Consider adding input validation middleware');
            }

        } catch (error) {
            this.addResult('security', '❌ Validation Analysis', 'FAILED', error.message);
        }

        this.results.security.status = 'completed';
    }

    addResult(category, test, status, message) {
        this.results[category].tests.push({ test, status, message });
        console.log(`${test}: ${message}`);
    }

    generateReport() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 COMPREHENSIVE SYSTEM ANALYSIS REPORT');
        console.log('='.repeat(60));

        const categories = ['database', 'backend', 'frontend', 'performance', 'security'];
        let totalTests = 0;
        let passedTests = 0;
        let failedTests = 0;
        let warningTests = 0;

        categories.forEach(category => {
            const categoryData = this.results[category];
            console.log(`\n${category.toUpperCase()} - Status: ${categoryData.status.toUpperCase()}`);
            console.log('-'.repeat(30));

            categoryData.tests.forEach(test => {
                totalTests++;
                if (test.status === 'SUCCESS') passedTests++;
                else if (test.status === 'FAILED') failedTests++;
                else if (test.status === 'WARNING') warningTests++;
                
                console.log(`${test.test}: ${test.status}`);
            });
        });

        console.log('\n' + '='.repeat(60));
        console.log('📈 SUMMARY STATISTICS');
        console.log('='.repeat(60));
        console.log(`Total Tests: ${totalTests}`);
        console.log(`✅ Passed: ${passedTests} (${((passedTests/totalTests)*100).toFixed(1)}%)`);
        console.log(`⚠️ Warnings: ${warningTests} (${((warningTests/totalTests)*100).toFixed(1)}%)`);
        console.log(`❌ Failed: ${failedTests} (${((failedTests/totalTests)*100).toFixed(1)}%)`);

        const overallScore = ((passedTests + warningTests * 0.5) / totalTests * 100).toFixed(1);
        console.log(`\n🎯 Overall System Health: ${overallScore}%`);

        if (overallScore >= 90) {
            console.log('🎉 EXCELLENT! Your system is production-ready!');
        } else if (overallScore >= 75) {
            console.log('✅ GOOD! Minor improvements recommended.');
        } else if (overallScore >= 60) {
            console.log('⚠️ FAIR! Several issues need attention.');
        } else {
            console.log('❌ POOR! Critical issues must be resolved.');
        }

        console.log('\n💡 RECOMMENDATIONS:');
        if (failedTests > 0) {
            console.log('• Fix all failed tests before deployment');
        }
        if (warningTests > 0) {
            console.log('• Address warnings to improve system reliability');
        }
        console.log('• Regular monitoring and testing recommended');
        console.log('• Keep dependencies updated for security');
    }

    async runFullAnalysis() {
        await this.testDatabase();
        await this.testBackend();
        await this.testFrontend();
        await this.testPerformance();
        await this.testSecurity();
        this.generateReport();
    }
}

// Run the comprehensive analysis
const tester = new SystemTester();
tester.runFullAnalysis().catch(console.error);