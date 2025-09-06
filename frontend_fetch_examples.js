// Enhanced Frontend Fetch Examples with Reliability Features

const API_BASE = "http://localhost:3002/api";

// Retry function for failed requests
async function retryFetch(url, options = {}, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      
      if (attempt === maxRetries) throw new Error(`Request failed after ${maxRetries} attempts`);
      
      // Wait before retry with exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}

// Health check function
async function checkServerHealth() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    return await response.json();
  } catch (error) {
    return { success: false, message: 'Server unavailable' };
  }
}

// Example 1: User Signup (sends verification email) with retry
async function signup(email, password, firstName, lastName, phone) {
  try {
    const response = await retryFetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        email, 
        password, 
        first_name: firstName, 
        last_name: lastName, 
        phone 
      }),
    });
    const data = await response.json();
    console.log("Signup result:", data.message);
    return data;
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, message: error.message };
  }
}

// Example 2: Email Verification
async function verifyEmail(email, code) {
  try {
    const response = await fetch(`${API_BASE}/auth/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const data = await response.json();
    console.log("Verification result:", data.message);
    return data;
  } catch (error) {
    console.error("Verification error:", error);
    return { success: false, message: error.message };
  }
}

// Example 3: User Login (only verified users)
async function login(email, password) {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const status = response.status;
    const data = await response.json();
    if (data.success && data.data && data.data.token) {
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      console.log("Login successful");
    } else {
      console.warn("Login failed:", data.message);
    }
    return { ...data, status };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: error.message };
  }
}

// Example 4: Get All Hotels with Filters (cached)
async function getHotels(filters = {}) {
  const queryParams = new URLSearchParams(filters);
  try {
    const response = await retryFetch(`${API_BASE}/hotels?${queryParams}`);
    const data = await response.json();
    console.log("Hotels (Cache:", response.headers.get('X-Cache') || 'MISS', "):", data);
    return data;
  } catch (error) {
    console.error("Get hotels error:", error);
    return { success: false, message: error.message };
  }
}

// Example 5: Get Hotel by ID
async function getHotelById(id) {
  try {
    const response = await fetch(`${API_BASE}/hotels/${id}`);
    const data = await response.json();
    console.log("Hotel details:", data);
    return data;
  } catch (error) {
    console.error("Get hotel error:", error);
  }
}

// Example 6: Create Hotel (Admin only)
async function createHotel(hotelData) {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(`${API_BASE}/hotels`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(hotelData),
    });
    const data = await response.json();
    console.log("Create hotel result:", data);
    return data;
  } catch (error) {
    console.error("Create hotel error:", error);
  }
}

// Example 7: Update Hotel (Admin only)
async function updateHotel(id, updateData) {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(`${API_BASE}/hotels/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });
    const data = await response.json();
    console.log("Update hotel result:", data);
    return data;
  } catch (error) {
    console.error("Update hotel error:", error);
  }
}

// Example 8: Delete Hotel (Admin only)
async function deleteHotel(id) {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(`${API_BASE}/hotels/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log("Delete hotel result:", data);
    return data;
  } catch (error) {
    console.error("Delete hotel error:", error);
  }
}

// Example 9: Get African Countries
async function getCountries() {
  try {
    const response = await fetch(`${API_BASE}/hotels/countries`);
    const data = await response.json();
    console.log("Countries:", data);
    return data;
  } catch (error) {
    console.error("Get countries error:", error);
  }
}

// Example 10: Convert Currency
async function convertCurrency(from, to, amount) {
  try {
    const response = await fetch(
      `${API_BASE}/hotels/currency/convert?from=${from}&to=${to}&amount=${amount}`
    );
    const data = await response.json();
    console.log("Currency conversion:", data);
    return data;
  } catch (error) {
    console.error("Currency conversion error:", error);
  }
}

// Example 11: Get All Transactions (Admin only)
async function getTransactions() {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(`${API_BASE}/transactions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log("Transactions:", data);
    return data;
  } catch (error) {
    console.error("Get transactions error:", error);
  }
}

// Usage Examples:
// signup('user@example.com', 'password123', 'John', 'Doe', '+1234567890');
// verifyEmail('user@example.com', '123456');
// login('user@example.com', 'password123');
// getHotels({ country: 'Nigeria', page: 1, limit: 10, sort: 'price_per_night:asc' });
// getHotelById(1);
// createHotel({ name: 'New Hotel', country: 'Nigeria', city: 'Lagos', price_per_night: 150, currency: 'USD', description: 'Nice hotel' });
// updateHotel(1, { name: 'Updated Hotel Name' });
// deleteHotel(1);
// getCountries();
// convertCurrency('USD', 'NGN', 100);
// getTransactions();
