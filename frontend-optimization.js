// Frontend Performance and Connectivity Enhancements
class APIClient {
    constructor(baseURL = 'http://localhost:3000') {
        this.baseURL = baseURL;
        this.token = localStorage.getItem('authToken');
        this.requestQueue = [];
        this.isOnline = navigator.onLine;
        
        // Setup offline/online event listeners
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processQueue();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    // Enhanced fetch with retry logic and error handling
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Add auth token if available
        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        // If offline, queue the request
        if (!this.isOnline && options.method !== 'GET') {
            return this.queueRequest(endpoint, options);
        }

        try {
            const response = await this.fetchWithRetry(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('API Request failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Fetch with automatic retry
    async fetchWithRetry(url, config, retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url, config);
                return response;
            } catch (error) {
                if (i === retries - 1) throw error;
                await this.delay(1000 * Math.pow(2, i)); // Exponential backoff
            }
        }
    }

    // Queue requests for offline processing
    queueRequest(endpoint, options) {
        const request = { endpoint, options, timestamp: Date.now() };
        this.requestQueue.push(request);
        localStorage.setItem('requestQueue', JSON.stringify(this.requestQueue));
        
        return Promise.resolve({
            success: false,
            error: 'Request queued for when connection is restored'
        });
    }

    // Process queued requests when back online
    async processQueue() {
        const queue = JSON.parse(localStorage.getItem('requestQueue') || '[]');
        
        for (const request of queue) {
            try {
                await this.request(request.endpoint, request.options);
            } catch (error) {
                console.error('Failed to process queued request:', error);
            }
        }
        
        this.requestQueue = [];
        localStorage.removeItem('requestQueue');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // API Methods
    async getHotels() {
        return this.request('/api/hotels');
    }

    async getHotel(id) {
        return this.request(`/api/hotels/${id}`);
    }

    async createBooking(bookingData) {
        return this.request('/api/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });
    }

    async login(credentials) {
        const result = await this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        
        if (result.success && result.data.token) {
            this.token = result.data.token;
            localStorage.setItem('authToken', this.token);
        }
        
        return result;
    }

    async register(userData) {
        return this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    logout() {
        this.token = null;
        localStorage.removeItem('authToken');
    }
}

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            pageLoadTime: 0,
            apiResponseTimes: [],
            errorCount: 0,
            cacheHitRate: 0
        };
        
        this.init();
    }

    init() {
        // Measure page load time
        window.addEventListener('load', () => {
            this.metrics.pageLoadTime = performance.now();
            console.log(`Page loaded in ${this.metrics.pageLoadTime.toFixed(2)}ms`);
        });

        // Monitor API response times
        this.interceptFetch();
    }

    interceptFetch() {
        const originalFetch = window.fetch;
        
        window.fetch = async (...args) => {
            const start = performance.now();
            
            try {
                const response = await originalFetch(...args);
                const duration = performance.now() - start;
                
                this.metrics.apiResponseTimes.push(duration);
                
                if (duration > 1000) {
                    console.warn(`Slow API call: ${args[0]} took ${duration.toFixed(2)}ms`);
                }
                
                return response;
            } catch (error) {
                this.metrics.errorCount++;
                throw error;
            }
        };
    }

    getAverageResponseTime() {
        const times = this.metrics.apiResponseTimes;
        return times.length > 0 ? times.reduce((a, b) => a + b) / times.length : 0;
    }

    getMetrics() {
        return {
            ...this.metrics,
            averageResponseTime: this.getAverageResponseTime()
        };
    }
}

// Cache management
class CacheManager {
    constructor() {
        this.cache = new Map();
        this.maxSize = 100;
        this.ttl = 5 * 60 * 1000; // 5 minutes
    }

    set(key, value, customTTL = null) {
        const ttl = customTTL || this.ttl;
        const item = {
            value,
            expiry: Date.now() + ttl
        };
        
        this.cache.set(key, item);
        
        // Clean up if cache is too large
        if (this.cache.size > this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
    }

    get(key) {
        const item = this.cache.get(key);
        
        if (!item) return null;
        
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }

    clear() {
        this.cache.clear();
    }

    cleanup() {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now > item.expiry) {
                this.cache.delete(key);
            }
        }
    }
}

// Initialize global instances
window.apiClient = new APIClient();
window.performanceMonitor = new PerformanceMonitor();
window.cacheManager = new CacheManager();

// Cleanup expired cache items every 5 minutes
setInterval(() => {
    window.cacheManager.cleanup();
}, 5 * 60 * 1000);

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIClient, PerformanceMonitor, CacheManager };
}