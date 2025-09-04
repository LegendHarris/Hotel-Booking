let currentHotels = [];
let filteredHotels = [];
const hotelsPerPage = 6;
let currentPage = 1;

async function fetchHotels(currency = '') {
    try {
        const url = currency ? `/api/hotels?currency=${currency}` : '/api/hotels';
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch hotels');
        const data = await response.json();
        currentHotels = data;
        filteredHotels = data;
        currentPage = 1;
        displayHotels();
        showFilterResults();
    } catch (error) {
        console.error('Error fetching hotels:', error);
        const container = document.getElementById('hotelsContainer');
        container.innerHTML = `<div class="col-12 text-center py-5"><h4>Error loading hotels</h4></div>`;
    }
}

function initHotelsPage() {
    loadSearchParams();
    const currencySelect = document.getElementById('currencySelect');
    currencySelect.addEventListener('change', () => {
        fetchHotels(currencySelect.value);
    });
    fetchHotels();
    setupEventListeners();
}

function loadSearchParams() {
    const params = utils.getUrlParams();
    
    if (params.country) {
        // Filter hotels by country
        filteredHotels = currentHotels.filter(hotel => 
            hotel.country === params.country
        );
    }
    
    if (params.minPrice) {
        document.getElementById('minPrice').value = params.minPrice;
    }
    
    if (params.maxPrice) {
        document.getElementById('maxPrice').value = params.maxPrice;
    }
}

function setupEventListeners() {
    // Real-time filtering
    ['minPrice', 'maxPrice', 'minRating'].forEach(id => {
        document.getElementById(id).addEventListener('change', applyFilters);
    });
    
    // Amenity checkboxes
    ['wifi', 'pool', 'gym', 'spa'].forEach(id => {
        document.getElementById(id).addEventListener('change', applyFilters);
    });
}

function applyFilters() {
    const hotelsContainer = document.getElementById('hotelsContainer');
    showLoading(hotelsContainer, 'Applying filters...');

    setTimeout(() => {
        const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
        const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;
        const minRating = parseFloat(document.getElementById('minRating').value) || 0;

        const selectedAmenities = [];
        ['wifi', 'pool', 'gym', 'spa'].forEach(id => {
            if (document.getElementById(id).checked) {
                selectedAmenities.push(document.getElementById(id).value);
            }
        });

        filteredHotels = currentHotels.filter(hotel => {
            // Use converted_price_per_night if available, else price_per_night
            const price = hotel.converted_price_per_night || hotel.price_per_night || hotel.price;
            const priceMatch = price >= minPrice && price <= maxPrice;
            const ratingMatch = hotel.rating >= minRating;
            const amenitiesMatch = selectedAmenities.length === 0 ||
                selectedAmenities.every(amenity => hotel.amenities && hotel.amenities.includes(amenity));

            return priceMatch && ratingMatch && amenitiesMatch;
        });

        currentPage = 1;
        displayHotels();

        showFilterResults();
    }, 300);
}

function clearFilters() {
    document.getElementById('minPrice').value = 0;
    document.getElementById('maxPrice').value = 1000;
    document.getElementById('minRating').value = 0;
    
    ['wifi', 'pool', 'gym', 'spa'].forEach(id => {
        document.getElementById(id).checked = false;
    });
    
    filteredHotels = [...currentHotels];
    currentPage = 1;
    displayHotels();
}

function sortHotels() {
    const sortBy = document.getElementById('sortBy').value;

    filteredHotels.sort((a, b) => {
        switch(sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'price':
                // Use converted_price_per_night if available, else price_per_night
                const priceA = a.converted_price_per_night || a.price_per_night || a.price || 0;
                const priceB = b.converted_price_per_night || b.price_per_night || b.price || 0;
                return priceA - priceB;
            case 'rating':
                return b.rating - a.rating;
            default:
                return 0;
        }
    });

    displayHotels();
}

function displayHotels() {
    const container = document.getElementById('hotelsContainer');
    const startIndex = (currentPage - 1) * hotelsPerPage;
    const endIndex = startIndex + hotelsPerPage;
    const hotelsToShow = filteredHotels.slice(startIndex, endIndex);

    if (hotelsToShow.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h4>No hotels found</h4>
                <p class="text-muted">Try adjusting your filters or search criteria</p>
            </div>
        `;
    } else {
        container.innerHTML = hotelsToShow.map(hotel => createHotelCard(hotel)).join('');
    }

    displayPagination();
}

function createHotelCard(hotel) {
    const originalPrice = hotel.original_price_per_night || hotel.price_per_night || hotel.price || 0;
    const originalCurrency = hotel.original_currency || hotel.currency || 'USD';
    const convertedPrice = hotel.converted_price_per_night;
    const convertedCurrency = hotel.converted_currency;

    let priceHTML = `<span>${originalPrice.toFixed(2)} ${originalCurrency}</span>`;
    if (convertedPrice && convertedCurrency && convertedCurrency !== originalCurrency) {
        priceHTML += ` <small class="text-muted">(Converted: ${convertedPrice.toFixed(2)} ${convertedCurrency})</small>`;
    }

    return `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card h-100">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${hotel.name}</h5>
                    <p class="card-text">${hotel.city}, ${hotel.country}</p>
                    <p class="card-text fw-bold">Price per night: ${priceHTML}</p>
                    <p class="card-text">${hotel.description || ''}</p>
                    <a href="hotel-details.html?id=${hotel.id}" class="btn btn-primary mt-auto">View Details</a>
                </div>
            </div>
        </div>
    `;
}

function displayPagination() {
    const totalPages = Math.ceil(filteredHotels.length / hotelsPerPage);
    const pagination = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '<nav><ul class="pagination">';
    
    // Previous button
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">Previous</a>
        </li>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
            </li>
        `;
    }
    
    // Next button
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">Next</a>
        </li>
    `;
    
    paginationHTML += '</ul></nav>';
    pagination.innerHTML = paginationHTML;
}

function changePage(page) {
    const totalPages = Math.ceil(filteredHotels.length / hotelsPerPage);

    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        displayHotels();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Show filter results count
function showFilterResults() {
    const resultsCount = filteredHotels.length;
    const totalCount = currentHotels.length;

    // Update the page title to show results
    const hotelsTitle = document.querySelector('h2');
    if (hotelsTitle) {
        hotelsTitle.innerHTML = `Available Hotels <small class="text-muted">(${resultsCount} of ${totalCount} results)</small>`;
    }

    // Add visual feedback for active filters
    updateActiveFiltersIndicator();
}

// Update active filters indicator
function updateActiveFiltersIndicator() {
    const activeFilters = [];

    const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPrice').value) || 1000;
    const minRating = parseFloat(document.getElementById('minRating').value) || 0;

    if (minPrice > 0 || maxPrice < 1000) {
        activeFilters.push('Price');
    }

    if (minRating > 0) {
        activeFilters.push('Rating');
    }

    ['wifi', 'pool', 'gym', 'spa'].forEach(id => {
        if (document.getElementById(id).checked) {
            activeFilters.push(document.getElementById(id).value);
        }
    });

    // Show active filters in the sidebar
    const filterSidebar = document.querySelector('.filter-sidebar');
    const existingIndicator = filterSidebar.querySelector('.active-filters');

    if (existingIndicator) {
        existingIndicator.remove();
    }

    if (activeFilters.length > 0) {
        const indicator = document.createElement('div');
        indicator.className = 'active-filters mb-3 p-2 bg-primary bg-opacity-10 rounded';
        indicator.innerHTML = `
            <small class="text-primary fw-bold">
                <i class="fas fa-filter me-1"></i>
                Active filters: ${activeFilters.join(', ')}
                <button class="btn btn-sm btn-outline-primary ms-2" onclick="clearFilters()">
                    <i class="fas fa-times"></i>
                </button>
            </small>
        `;
        filterSidebar.insertBefore(indicator, filterSidebar.querySelector('h5').nextSibling);
    }
}
