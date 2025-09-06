// Frontend Fetch Examples for Hotel Reservation Platform API

const API_BASE = 'http://localhost:3001/api';

// Example 1: User Signup
async function signup(email, password) {
  try {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    console.log('Signup result:', data);
    return data;
  } catch (error) {
    console.error('Signup error:', error);
  }
}

// Example 2: User Login
async function login(email, password) {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (data.success) {
      localStorage.setItem('token', data.data.token);
      console.log('Login successful, token saved');
    }
    return data;
  } catch (error) {
    console.error('Login error:', error);
  }
}

// Example 3: Get All Hotels with Filters
async function getHotels(filters = {}) {
  const queryParams = new URLSearchParams(filters);
  try {
    const response = await fetch(`${API_BASE}/hotels?${queryParams}`);
    const data = await response.json();
    console.log('Hotels:', data);
    return data;
  } catch (error) {
    console.error('Get hotels error:', error);
  }
}

// Example 4: Get Hotel by ID
async function getHotelById(id) {
  try {
    const response = await fetch(`${API_BASE}/hotels/${id}`);
    const data = await response.json();
    console.log('Hotel details:', data);
    return data;
  } catch (error) {
    console.error('Get hotel error:', error);
  }
}

// Example 5: Create Hotel (Admin only)
async function createHotel(hotelData) {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_BASE}/hotels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(hotelData)
    });
    const data = await response.json();
    console.log('Create hotel result:', data);
    return data;
  } catch (error) {
    console.error('Create hotel error:', error);
  }
}

// Example 6: Update Hotel (Admin only)
async function updateHotel(id, updateData) {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_BASE}/hotels/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });
    const data = await response.json();
    console.log('Update hotel result:', data);
    return data;
  } catch (error) {
    console.error('Update hotel error:', error);
  }
}

// Example 7: Delete Hotel (Admin only)
async function deleteHotel(id) {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_BASE}/hotels/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    console.log('Delete hotel result:', data);
    return data;
  } catch (error) {
    console.error('Delete hotel error:', error);
  }
}

// Example 8: Get African Countries
async function getCountries() {
  try {
    const response = await fetch(`${API_BASE}/hotels/countries`);
    const data = await response.json();
    console.log('Countries:', data);
    return data;
  } catch (error) {
    console.error('Get countries error:', error);
  }
}

// Example 9: Convert Currency
async function convertCurrency(from, to, amount) {
  try {
    const response = await fetch(`${API_BASE}/hotels/currency/convert?from=${from}&to=${to}&amount=${amount}`);
    const data = await response.json();
    console.log('Currency conversion:', data);
    return data;
  } catch (error) {
    console.error('Currency conversion error:', error);
  }
}

// Example 10: Get All Transactions (Admin only)
async function getTransactions() {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_BASE}/transactions`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    console.log('Transactions:', data);
    return data;
  } catch (error) {
    console.error('Get transactions error:', error);
  }
}

// Usage Examples:
// signup('user@example.com', 'password123');
// login('solutionlegend9@gmail.com', 'Legend07');
// getHotels({ country: 'Nigeria', page: 1, limit: 10, sort: 'price_per_night:asc' });
// getHotelById(1);
// createHotel({ name: 'New Hotel', country: 'Nigeria', city: 'Lagos', price_per_night: 150, currency: 'USD', description: 'Nice hotel' });
// updateHotel(1, { name: 'Updated Hotel Name' });
// deleteHotel(1);
// getCountries();
// convertCurrency('USD', 'NGN', 100);
// getTransactions();
