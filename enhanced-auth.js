// Enhanced Authentication with Security Features
class SecureAuth {
    constructor() {
        this.maxLoginAttempts = 5;
        this.lockoutDuration = 15 * 60 * 1000; // 15 minutes
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.init();
    }

    init() {
        this.setupSessionTimeout();
        this.setupCSRFProtection();
        this.checkAuthStatus();
    }

    // Enhanced login with rate limiting and security checks
    async login(email, password) {
        try {
            // Check if account is locked
            if (this.isAccountLocked(email)) {
                throw new Error('Account temporarily locked due to multiple failed attempts');
            }

            // Validate input
            if (!this.validateEmail(email) || !password) {
                throw new Error('Invalid email or password format');
            }

            // Attempt login
            const response = await window.apiClient.login({
                email: this.sanitizeInput(email),
                password: password
            });

            if (response.success) {
                this.clearLoginAttempts(email);
                this.setSession(response.data);
                this.setupAutoLogout();
                return { success: true, user: response.data.user };
            } else {
                this.recordFailedAttempt(email);
                throw new Error(response.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    }

    // Enhanced registration with validation
    async register(userData) {
        try {
            // Validate all fields
            const validation = this.validateRegistrationData(userData);
            if (!validation.valid) {
                throw new Error(validation.errors.join(', '));
            }

            // Sanitize input
            const sanitizedData = this.sanitizeRegistrationData(userData);

            const response = await window.apiClient.register(sanitizedData);

            if (response.success) {
                return { success: true, message: 'Registration successful' };
            } else {
                throw new Error(response.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message };
        }
    }

    // Secure logout
    logout() {
        try {
            // Clear all session data
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            localStorage.removeItem('sessionStart');
            sessionStorage.clear();
            
            // Clear API client token
            window.apiClient.logout();
            
            // Redirect to login
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // Session management
    setSession(data) {
        const sessionData = {
            token: data.token,
            user: data.user,
            timestamp: Date.now()
        };
        
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('sessionStart', Date.now().toString());
    }

    checkAuthStatus() {
        const token = localStorage.getItem('authToken');
        const sessionStart = localStorage.getItem('sessionStart');
        
        if (!token || !sessionStart) {
            return false;
        }
        
        // Check if session has expired
        const sessionAge = Date.now() - parseInt(sessionStart);
        if (sessionAge > this.sessionTimeout) {
            this.logout();
            return false;
        }
        
        return true;
    }

    setupSessionTimeout() {
        // Auto-logout after session timeout
        setInterval(() => {
            if (!this.checkAuthStatus()) {
                this.logout();
            }
        }, 60000); // Check every minute
    }

    setupAutoLogout() {
        // Reset session timeout on user activity
        const resetTimeout = () => {
            localStorage.setItem('sessionStart', Date.now().toString());
        };
        
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, resetTimeout, true);
        });
    }

    // Rate limiting for login attempts
    recordFailedAttempt(email) {
        const attempts = JSON.parse(localStorage.getItem('loginAttempts') || '{}');
        const now = Date.now();
        
        if (!attempts[email]) {
            attempts[email] = { count: 0, lastAttempt: now };
        }
        
        attempts[email].count++;
        attempts[email].lastAttempt = now;
        
        localStorage.setItem('loginAttempts', JSON.stringify(attempts));
    }

    clearLoginAttempts(email) {
        const attempts = JSON.parse(localStorage.getItem('loginAttempts') || '{}');
        delete attempts[email];
        localStorage.setItem('loginAttempts', JSON.stringify(attempts));
    }

    isAccountLocked(email) {
        const attempts = JSON.parse(localStorage.getItem('loginAttempts') || '{}');
        const userAttempts = attempts[email];
        
        if (!userAttempts) return false;
        
        const timeSinceLastAttempt = Date.now() - userAttempts.lastAttempt;
        
        if (userAttempts.count >= this.maxLoginAttempts && timeSinceLastAttempt < this.lockoutDuration) {
            return true;
        }
        
        // Reset if lockout period has passed
        if (timeSinceLastAttempt >= this.lockoutDuration) {
            this.clearLoginAttempts(email);
        }
        
        return false;
    }

    // Input validation and sanitization
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePassword(password) {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    }

    validateRegistrationData(data) {
        const errors = [];
        
        if (!data.username || data.username.length < 3) {
            errors.push('Username must be at least 3 characters');
        }
        
        if (!this.validateEmail(data.email)) {
            errors.push('Invalid email format');
        }
        
        if (!this.validatePassword(data.password)) {
            errors.push('Password must be at least 8 characters with uppercase, lowercase, and number');
        }
        
        if (data.password !== data.confirmPassword) {
            errors.push('Passwords do not match');
        }
        
        return { valid: errors.length === 0, errors };
    }

    sanitizeInput(input) {
        return input.trim().replace(/[<>\"']/g, '');
    }

    sanitizeRegistrationData(data) {
        return {
            username: this.sanitizeInput(data.username),
            email: this.sanitizeInput(data.email).toLowerCase(),
            password: data.password, // Don't sanitize password
            first_name: this.sanitizeInput(data.first_name || ''),
            last_name: this.sanitizeInput(data.last_name || '')
        };
    }

    // CSRF Protection
    setupCSRFProtection() {
        // Generate CSRF token
        let csrfToken = localStorage.getItem('csrfToken');
        if (!csrfToken) {
            csrfToken = this.generateCSRFToken();
            localStorage.setItem('csrfToken', csrfToken);
        }
        
        // Add CSRF token to all forms
        document.addEventListener('DOMContentLoaded', () => {
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                const csrfInput = document.createElement('input');
                csrfInput.type = 'hidden';
                csrfInput.name = 'csrfToken';
                csrfInput.value = csrfToken;
                form.appendChild(csrfInput);
            });
        });
    }

    generateCSRFToken() {
        return Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    // Get current user
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    // Check if user has specific role
    hasRole(role) {
        const user = this.getCurrentUser();
        return user && user.role === role;
    }

    // Redirect if not authenticated
    requireAuth() {
        if (!this.checkAuthStatus()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    // Redirect if not admin
    requireAdmin() {
        if (!this.requireAuth() || !this.hasRole('admin')) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }
}

// Initialize secure auth
window.secureAuth = new SecureAuth();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecureAuth;
}