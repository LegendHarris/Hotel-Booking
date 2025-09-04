// West African countries and currencies
const westAfricanCountries = {
    'Benin': { currency: 'XOF', rate: 600, name: 'West African CFA franc' },
    'Burkina Faso': { currency: 'XOF', rate: 600, name: 'West African CFA franc' },
    'Cape Verde': { currency: 'CVE', rate: 100, name: 'Cape Verdean Escudo' },
    'Côte d\'Ivoire': { currency: 'XOF', rate: 600, name: 'West African CFA franc' },
    'Gambia': { currency: 'GMD', rate: 65, name: 'Gambian Dalasi' },
    'Ghana': { currency: 'GHS', rate: 15, name: 'Ghanaian Cedi' },
    'Guinea': { currency: 'GNF', rate: 8600, name: 'Guinean Franc' },
    'Guinea-Bissau': { currency: 'XOF', rate: 600, name: 'West African CFA franc' },
    'Liberia': { currency: 'LRD', rate: 190, name: 'Liberian Dollar' },
    'Mali': { currency: 'XOF', rate: 600, name: 'West African CFA franc' },
    'Niger': { currency: 'XOF', rate: 600, name: 'West African CFA franc' },
    'Nigeria': { currency: 'NGN', rate: 1500, name: 'Nigerian Naira' },
    'Senegal': { currency: 'XOF', rate: 600, name: 'West African CFA franc' },
    'Sierra Leone': { currency: 'SLL', rate: 22000, name: 'Leone' },
    'Togo': { currency: 'XOF', rate: 600, name: 'West African CFA franc' }
};

// Utility functions
const utils = {
    // Date formatting
    formatDate: (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    // Currency formatting
    formatCurrency: (amount, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    // Convert USD to local currency
    convertCurrency: (usdAmount, country) => {
        const countryData = westAfricanCountries[country];
        if (!countryData) return usdAmount;
        return usdAmount * countryData.rate;
    },

    // Format local currency
    formatLocalCurrency: (amount, country) => {
        const countryData = westAfricanCountries[country];
        if (!countryData) return utils.formatCurrency(amount);
        
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount) + ' ' + countryData.currency;
    },

    // Format dual currency display
    formatDualCurrency: (usdAmount, country) => {
        const localAmount = utils.convertCurrency(usdAmount, country);
        const usdFormatted = utils.formatCurrency(usdAmount);
        const localFormatted = utils.formatLocalCurrency(localAmount, country);
        return `${usdFormatted} ≈ ${localFormatted}`;
    },

    // Form validators
    validators: {
        email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        password: (password) => password.length >= 8,
        required: (value) => value && value.toString().trim().length > 0,
        phone: (phone) => /^\+?[\d\s\-\(\)]{10,}$/.test(phone),
        date: (date) => new Date(date) >= new Date().setHours(0,0,0,0)
    },

    // Generate star rating HTML
    generateStars: (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star text-warning"></i>';
        }
        
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt text-warning"></i>';
        }
        
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star text-warning"></i>';
        }
        
        return stars;
    },

    // Show loading state
    showLoading: (element) => {
        element.innerHTML = '<div class="text-center"><div class="loading"></div></div>';
    },

    // Show error message
    showError: (message) => {
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger alert-dismissible fade show';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.insertBefore(alert, document.body.firstChild);
        setTimeout(() => alert.remove(), 5000);
    },

    // Show success message
    showSuccess: (message) => {
        const alert = document.createElement('div');
        alert.className = 'alert alert-success alert-dismissible fade show';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.insertBefore(alert, document.body.firstChild);
        setTimeout(() => alert.remove(), 5000);
    },

    // Get URL parameters
    getUrlParams: () => {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    },

    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Dummy data
const dummyData = {
    hotels: [
        // Nigeria
        {
            id: 1,
            name: "Lagos Continental Hotel",
            location: "Lagos, Nigeria",
            country: "Nigeria",
            rating: 4.5,
            price: 120,
            image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
            amenities: ["WiFi", "Pool", "Gym", "Restaurant"],
            description: "Premier business hotel in Victoria Island",
            rooms: [
                { id: 1, type: "Standard", price: 120, capacity: 2, amenities: ["WiFi", "TV", "AC"] },
                { id: 2, type: "Executive", price: 180, capacity: 3, amenities: ["WiFi", "TV", "AC", "Balcony"] }
            ]
        },
        {
            id: 2,
            name: "Abuja Luxury Suites",
            location: "Abuja, Nigeria",
            country: "Nigeria",
            rating: 4.7,
            price: 150,
            image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=300&fit=crop",
            amenities: ["WiFi", "Spa", "Pool", "Conference Room"],
            description: "Elegant hotel in the capital city",
            rooms: [
                { id: 3, type: "Deluxe", price: 150, capacity: 2, amenities: ["WiFi", "TV", "AC", "Minibar"] }
            ]
        },
        // Ghana
        {
            id: 3,
            name: "Accra Beach Resort",
            location: "Accra, Ghana",
            country: "Ghana",
            rating: 4.3,
            price: 95,
            image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop",
            amenities: ["WiFi", "Beach Access", "Pool", "Restaurant"],
            description: "Beachfront hotel with stunning ocean views",
            rooms: [
                { id: 4, type: "Ocean View", price: 95, capacity: 2, amenities: ["WiFi", "TV", "AC"] }
            ]
        },
        // Senegal
        {
            id: 4,
            name: "Dakar Grand Hotel",
            location: "Dakar, Senegal",
            country: "Senegal",
            rating: 4.4,
            price: 110,
            image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
            amenities: ["WiFi", "Pool", "Spa", "Restaurant"],
            description: "Historic hotel in the heart of Dakar",
            rooms: [
                { id: 5, type: "Standard", price: 110, capacity: 2, amenities: ["WiFi", "TV", "AC"] }
            ]
        },
        // Côte d'Ivoire
        {
            id: 5,
            name: "Abidjan Business Center",
            location: "Abidjan, Côte d'Ivoire",
            country: "Côte d'Ivoire",
            rating: 4.2,
            price: 130,
            image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=300&fit=crop",
            amenities: ["WiFi", "Conference Room", "Gym", "Restaurant"],
            description: "Modern business hotel in Plateau district",
            rooms: [
                { id: 6, type: "Business", price: 130, capacity: 2, amenities: ["WiFi", "TV", "AC", "Desk"] }
            ]
        },
        // Cape Verde
        {
            id: 6,
            name: "Praia Paradise Resort",
            location: "Praia, Cape Verde",
            country: "Cape Verde",
            rating: 4.6,
            price: 85,
            image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop",
            amenities: ["WiFi", "Beach", "Pool", "Water Sports"],
            description: "Tropical resort with pristine beaches",
            rooms: [
                { id: 7, type: "Beach Villa", price: 85, capacity: 4, amenities: ["WiFi", "TV", "AC", "Balcony"] }
            ]
        },
        // Mali
        {
            id: 7,
            name: "Bamako Heritage Hotel",
            location: "Bamako, Mali",
            country: "Mali",
            rating: 4.0,
            price: 75,
            image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
            amenities: ["WiFi", "Pool", "Restaurant", "Cultural Tours"],
            description: "Traditional hotel showcasing Malian culture",
            rooms: [
                { id: 8, type: "Cultural Suite", price: 75, capacity: 2, amenities: ["WiFi", "TV", "AC"] }
            ]
        },
        // Burkina Faso
        {
            id: 8,
            name: "Ouagadougou Central",
            location: "Ouagadougou, Burkina Faso",
            country: "Burkina Faso",
            rating: 3.9,
            price: 65,
            image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=300&fit=crop",
            amenities: ["WiFi", "Restaurant", "Conference Room"],
            description: "Comfortable hotel in the city center",
            rooms: [
                { id: 9, type: "Standard", price: 65, capacity: 2, amenities: ["WiFi", "TV", "AC"] }
            ]
        },
        // Guinea
        {
            id: 9,
            name: "Conakry Grand Hotel",
            location: "Conakry, Guinea",
            country: "Guinea",
            rating: 4.1,
            price: 80,
            image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
            amenities: ["WiFi", "Pool", "Restaurant", "Airport Shuttle"],
            description: "Modern hotel near the airport",
            rooms: [
                { id: 10, type: "Standard", price: 80, capacity: 2, amenities: ["WiFi", "TV", "AC"] }
            ]
        },
        // Liberia
        {
            id: 10,
            name: "Monrovia Beach Hotel",
            location: "Monrovia, Liberia",
            country: "Liberia",
            rating: 3.8,
            price: 70,
            image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop",
            amenities: ["WiFi", "Beach Access", "Restaurant"],
            description: "Coastal hotel with ocean views",
            rooms: [
                { id: 11, type: "Ocean View", price: 70, capacity: 2, amenities: ["WiFi", "TV", "AC"] }
            ]
        },
        // Gambia
        {
            id: 11,
            name: "Banjul Riverside Lodge",
            location: "Banjul, Gambia",
            country: "Gambia",
            rating: 4.2,
            price: 55,
            image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
            amenities: ["WiFi", "River View", "Restaurant", "Boat Tours"],
            description: "Charming lodge by the Gambia River",
            rooms: [
                { id: 12, type: "River View", price: 55, capacity: 2, amenities: ["WiFi", "TV", "AC"] }
            ]
        },
        // Togo
        {
            id: 12,
            name: "Lomé Business Hotel",
            location: "Lomé, Togo",
            country: "Togo",
            rating: 3.9,
            price: 68,
            image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop",
            amenities: ["WiFi", "Conference Room", "Restaurant"],
            description: "Modern business hotel in the capital",
            rooms: [
                { id: 13, type: "Business", price: 68, capacity: 2, amenities: ["WiFi", "TV", "AC", "Desk"] }
            ]
        },
        // Benin
        {
            id: 13,
            name: "Cotonou Heritage Inn",
            location: "Cotonou, Benin",
            country: "Benin",
            rating: 4.0,
            price: 72,
            image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=300&fit=crop",
            amenities: ["WiFi", "Pool", "Cultural Center", "Restaurant"],
            description: "Cultural hotel showcasing Beninese heritage",
            rooms: [
                { id: 14, type: "Heritage Suite", price: 72, capacity: 2, amenities: ["WiFi", "TV", "AC"] }
            ]
        },
        // Niger
        {
            id: 14,
            name: "Niamey Desert Lodge",
            location: "Niamey, Niger",
            country: "Niger",
            rating: 3.7,
            price: 58,
            image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
            amenities: ["WiFi", "Pool", "Desert Tours", "Restaurant"],
            description: "Gateway to the Sahara Desert",
            rooms: [
                { id: 15, type: "Desert View", price: 58, capacity: 2, amenities: ["WiFi", "TV", "AC"] }
            ]
        },
        // Guinea-Bissau
        {
            id: 15,
            name: "Bissau Coastal Hotel",
            location: "Bissau, Guinea-Bissau",
            country: "Guinea-Bissau",
            rating: 3.6,
            price: 52,
            image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop",
            amenities: ["WiFi", "Restaurant", "Island Tours"],
            description: "Peaceful hotel near the Bijagós Islands",
            rooms: [
                { id: 16, type: "Standard", price: 52, capacity: 2, amenities: ["WiFi", "TV", "AC"] }
            ]
        },
        // Sierra Leone
        {
            id: 16,
            name: "Freetown Peninsula Resort",
            location: "Freetown, Sierra Leone",
            country: "Sierra Leone",
            rating: 4.0,
            price: 60,
            image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=300&fit=crop",
            amenities: ["WiFi", "Beach", "Pool", "Restaurant"],
            description: "Beautiful resort on the peninsula",
            rooms: [
                { id: 17, type: "Beach Room", price: 60, capacity: 2, amenities: ["WiFi", "TV", "AC"] }
            ]
        }
    ],

    bookings: JSON.parse(localStorage.getItem('bookings') || '[]'),

    users: JSON.parse(localStorage.getItem('users') || '[]')
};