// Main JavaScript file
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Loading animation function
function showLoading(element, text = 'Loading...') {
    element.innerHTML = `
        <div class="text-center py-5">
            <div class="loading mb-3"></div>
            <p class="text-muted">${text}</p>
        </div>
    `;
}

// Smooth scroll function
function smoothScrollTo(element, offset = 0) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

// Add fade-in animation to elements
function addFadeInAnimation() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all cards and sections
    document.querySelectorAll('.card, .hotel-card, section').forEach(el => {
        observer.observe(el);
    });
}

// Enhanced search with loading state
function performSearch(event) {
    event.preventDefault();

    const searchForm = event.target;
    const submitBtn = searchForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Searching...';
    submitBtn.disabled = true;

    // Simulate search delay for better UX
    setTimeout(() => {
        const country = document.getElementById('country').value;
        const checkin = document.getElementById('checkin').value;
        const checkout = document.getElementById('checkout').value;
        const guests = document.getElementById('guests').value;

        const searchParams = new URLSearchParams({
            country,
            checkin,
            checkout,
            guests
        });

        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        window.location.href = `hotels.html?${searchParams.toString()}`;
    }, 800);
}

function initializeApp() {
    loadNavbar();
    loadFooter();
    initializeTheme();
    
    // Page-specific initialization
    const page = window.location.pathname.split('/').pop() || 'index.html';
    
    switch(page) {
        case 'index.html':
        case '':
            initHomePage();
            break;
        case 'hotels.html':
            initHotelsPage();
            break;
        case 'hotel-details.html':
            initHotelDetailsPage();
            break;
        case 'booking.html':
            initBookingPage();
            break;
        case 'login.html':
            initLoginPage();
            break;
        case 'register.html':
            initRegisterPage();
            break;
        case 'user-dashboard.html':
            if (auth.requireAuth()) initUserDashboard();
            break;
        case 'hotel-dashboard.html':
            if (auth.requireHotelOwner()) initHotelDashboard();
            break;
        case 'admin-dashboard.html':
            if (auth.requireAdmin()) initAdminDashboard();
            break;
    }
}

// Load Navbar
function loadNavbar() {
    const navbar = document.getElementById('navbar');
    const currentUser = auth.getCurrentUser();
    
    navbar.innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-light">
            <div class="container">
                <a class="navbar-brand fw-bold" href="index.html">
                    <i class="fas fa-hotel me-2"></i>HotelSaaS
                </a>
                
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav me-auto">
                        <li class="nav-item">
                            <a class="nav-link" href="index.html">Home</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="hotels.html">Hotels</a>
                        </li>
                    </ul>
                    
                    <ul class="navbar-nav">
                        <li class="nav-item">
                            <button class="theme-toggle" onclick="toggleTheme()">
                                <i class="fas fa-moon" id="themeIcon"></i>
                            </button>
                        </li>
                        ${currentUser ? `
                            <li class="nav-item dropdown">
                                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                                    <i class="fas fa-user me-1"></i>${currentUser.name}
                                </a>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="${getDashboardUrl(currentUser.role)}">Dashboard</a></li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li><a class="dropdown-item" href="#" onclick="auth.logout()">Logout</a></li>
                                </ul>
                            </li>
                        ` : `
                            <li class="nav-item">
                                <a class="nav-link" href="login.html">Login</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="register.html">Register</a>
                            </li>
                        `}
                    </ul>
                </div>
            </div>
        </nav>
    `;
}

// Load Footer
function loadFooter() {
    const footer = document.getElementById('footer');
    footer.innerHTML = `
        <footer class="bg-dark text-light py-5 mt-5">
            <div class="container">
                <div class="row">
                    <div class="col-md-4">
                        <h5><i class="fas fa-hotel me-2"></i>HotelSaaS</h5>
                        <p>Your trusted partner for hotel reservations worldwide.</p>
                    </div>
                    <div class="col-md-4">
                        <h5>Quick Links</h5>
                        <ul class="list-unstyled">
                            <li><a href="index.html" class="text-light text-decoration-none">Home</a></li>
                            <li><a href="hotels.html" class="text-light text-decoration-none">Hotels</a></li>
                            <li><a href="#" class="text-light text-decoration-none">About</a></li>
                            <li><a href="#" class="text-light text-decoration-none">Contact</a></li>
                        </ul>
                    </div>
                    <div class="col-md-4">
                        <h5>Contact Info</h5>
                        <p><i class="fas fa-phone me-2"></i>+1 (555) 123-4567</p>
                        <p><i class="fas fa-envelope me-2"></i>info@hotelsaas.com</p>
                    </div>
                </div>
                <hr class="my-4">
                <div class="text-center">
                    <p>&copy; 2024 HotelSaaS. All rights reserved.</p>
                </div>
            </div>
        </footer>
    `;
}

// Theme functions
function initializeTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('themeIcon');
    if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Get dashboard URL based on user role
function getDashboardUrl(role) {
    switch(role) {
        case 'admin': return 'admin-dashboard.html';
        case 'hotel_owner': return 'hotel-dashboard.html';
        default: return 'user-dashboard.html';
    }
}

// Home page initialization
function initHomePage() {
    loadSearchBar();
    loadFeaturedHotels();
}

// Load search bar
function loadSearchBar() {
    const searchBar = document.getElementById('searchBar');
    const countryOptions = Object.keys(westAfricanCountries).map(country => 
        `<option value="${country}">${country}</option>`
    ).join('');
    
    searchBar.innerHTML = `
        <div class="search-form">
            <form onsubmit="performSearch(event)">
                <div class="row g-3">
                    <div class="col-md-3">
                        <label class="form-label text-dark">Country</label>
                        <select class="form-select" id="country" required>
                            <option value="">Select Country</option>
                            ${countryOptions}
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label text-dark">Check-in</label>
                        <input type="date" class="form-control" id="checkin" required>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label text-dark">Check-out</label>
                        <input type="date" class="form-control" id="checkout" required>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label text-dark">Guests</label>
                        <select class="form-select" id="guests">
                            <option value="1">1 Guest</option>
                            <option value="2">2 Guests</option>
                            <option value="3">3 Guests</option>
                            <option value="4">4+ Guests</option>
                        </select>
                    </div>
                    <div class="col-12">
                        <button type="submit" class="btn btn-primary btn-lg w-100">
                            <i class="fas fa-search me-2"></i>Search Hotels
                        </button>
                    </div>
                </div>
            </form>
        </div>
    `;
    
    // Set minimum dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('checkin').min = today;
    document.getElementById('checkout').min = today;
    
    // Update checkout min date when checkin changes
    document.getElementById('checkin').addEventListener('change', function() {
        document.getElementById('checkout').min = this.value;
    });
}

// Load featured hotels
function loadFeaturedHotels() {
    const container = document.getElementById('featuredHotels');
    const featuredHotels = dummyData.hotels.slice(0, 3);
    
    container.innerHTML = featuredHotels.map(hotel => createHotelCard(hotel)).join('');
}

// Create hotel card HTML
function createHotelCard(hotel) {
    const dualPrice = hotel.country ? utils.formatDualCurrency(hotel.price, hotel.country) : utils.formatCurrency(hotel.price);
    
    return `
        <div class="col-md-4 mb-4">
            <div class="card hotel-card fade-in">
                <img src="${hotel.image}" class="card-img-top hotel-image" alt="${hotel.name}">
                <div class="card-body">
                    <h5 class="card-title">${hotel.name}</h5>
                    <p class="card-text">
                        <i class="fas fa-map-marker-alt me-1"></i>${hotel.location}
                    </p>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div class="rating">
                            ${utils.generateStars(hotel.rating)}
                            <span class="ms-1">${hotel.rating}</span>
                        </div>
                        <div class="price" style="font-size: 0.9rem;">${dualPrice}/night</div>
                    </div>
                    <div class="mb-3">
                        ${hotel.amenities.slice(0, 3).map(amenity => 
                            `<span class="badge bg-secondary me-1">${amenity}</span>`
                        ).join('')}
                    </div>
                    <a href="hotel-details.html?id=${hotel.id}" class="btn btn-primary w-100">View Details</a>
                </div>
            </div>
        </div>
    `;
}

// Perform search
function performSearch(event) {
    event.preventDefault();
    
    const country = document.getElementById('country').value;
    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;
    const guests = document.getElementById('guests').value;
    
    const searchParams = new URLSearchParams({
        country,
        checkin,
        checkout,
        guests
    });
    
    window.location.href = `hotels.html?${searchParams.toString()}`;
}