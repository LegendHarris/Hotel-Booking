# Hotel Reservation Platform API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Standard Response Format
All API responses follow this format:
```json
{
  "success": true/false,
  "message": "Description of the response",
  "data": { ... } // Response data or null
}
```

---

## Authentication Endpoints

### POST /api/auth/signup
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "role": "user",
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+1234567890"
    },
    "token": "jwt_token_here"
  }
}
```

### POST /api/auth/login
Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "role": "user",
      "first_name": "John",
      "last_name": "Doe"
    },
    "token": "jwt_token_here"
  }
}
```

### GET /api/auth/profile
Get current user profile (Protected).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "role": "user",
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+1234567890"
    }
  }
}
```

---

## Hotel Endpoints

### GET /api/hotels
Get all hotels with filtering, pagination, and sorting.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `sort` (string): Sort field (name, price, rating, created_at)
- `order` (string): Sort order (asc, desc)
- `country` (string): Filter by country
- `city` (string): Filter by city
- `min_price` (number): Minimum price filter
- `max_price` (number): Maximum price filter
- `min_rating` (number): Minimum rating filter
- `search` (string): Search in name, description, city, country

**Example:**
```
GET /api/hotels?page=1&limit=10&country=Nigeria&min_price=100&sort=price&order=asc
```

**Response:**
```json
{
  "success": true,
  "message": "Hotels retrieved successfully",
  "data": {
    "hotels": [
      {
        "id": 1,
        "name": "Lagos Continental Hotel",
        "description": "Luxury business hotel in Victoria Island",
        "country": "Nigeria",
        "city": "Lagos",
        "address": "Victoria Island, Lagos",
        "price": 250.00,
        "currency": "USD",
        "rating": 4.5,
        "total_rooms": 200,
        "available_rooms": 45,
        "amenities": ["WiFi", "Pool", "Gym", "Restaurant"],
        "images": ["image1.jpg", "image2.jpg"],
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### GET /api/hotels/:id
Get hotel details by ID.

**Response:**
```json
{
  "success": true,
  "message": "Hotel retrieved successfully",
  "data": {
    "hotel": {
      "id": 1,
      "name": "Lagos Continental Hotel",
      "description": "Luxury business hotel in Victoria Island",
      "country": "Nigeria",
      "city": "Lagos",
      "address": "Victoria Island, Lagos",
      "price": 250.00,
      "currency": "USD",
      "rating": 4.5,
      "total_rooms": 200,
      "available_rooms": 45,
      "amenities": ["WiFi", "Pool", "Gym", "Restaurant"],
      "images": ["image1.jpg", "image2.jpg"]
    }
  }
}
```

### POST /api/hotels (Admin Only)
Create a new hotel.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "New Hotel",
  "description": "Hotel description",
  "country": "Nigeria",
  "city": "Lagos",
  "address": "Hotel address",
  "price": 200.00,
  "currency": "USD",
  "rating": 4.0,
  "total_rooms": 100,
  "available_rooms": 100,
  "amenities": ["WiFi", "Pool"],
  "images": ["image1.jpg"]
}
```

### PUT /api/hotels/:id (Admin Only)
Update hotel details.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:** Same as POST (partial updates allowed)

### DELETE /api/hotels/:id (Admin Only)
Delete a hotel (soft delete).

**Headers:**
```
Authorization: Bearer <admin_token>
```

---

## Currency Endpoints

### GET /api/currency/convert
Convert currency amounts.

**Query Parameters:**
- `from` (string): Source currency code (e.g., USD)
- `to` (string): Target currency code (e.g., NGN)
- `amount` (number): Amount to convert

**Example:**
```
GET /api/currency/convert?from=USD&to=NGN&amount=100
```

**Response:**
```json
{
  "success": true,
  "message": "Currency converted successfully",
  "data": {
    "from": "USD",
    "to": "NGN",
    "amount": 100,
    "converted_amount": 75000,
    "rate": 750,
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

### GET /api/currency/supported
Get list of supported currencies.

**Response:**
```json
{
  "success": true,
  "message": "Supported currencies retrieved successfully",
  "data": {
    "USD": "United States Dollar",
    "NGN": "Nigerian Naira",
    "ZAR": "South African Rand",
    "KES": "Kenyan Shilling"
  }
}
```

---

## Countries Endpoints

### GET /api/countries
Get all African countries with currency information.

**Response:**
```json
{
  "success": true,
  "message": "African countries retrieved successfully",
  "data": {
    "countries": [
      {
        "id": 1,
        "name": "Nigeria",
        "code": "NG",
        "currency_code": "NGN",
        "currency_name": "Nigerian Naira",
        "is_active": true
      }
    ]
  }
}
```

### GET /api/countries/:code
Get country details by country code.

**Response:**
```json
{
  "success": true,
  "message": "Country retrieved successfully",
  "data": {
    "country": {
      "id": 1,
      "name": "Nigeria",
      "code": "NG",
      "currency_code": "NGN",
      "currency_name": "Nigerian Naira",
      "is_active": true
    }
  }
}
```

---

## Transaction Endpoints

### GET /api/transactions (Admin Only)
Get all transactions with filtering.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by status (pending, completed, failed, cancelled)
- `transaction_type`: Filter by type (booking, refund, payment)
- `user_id`: Filter by user ID
- `hotel_id`: Filter by hotel ID
- `date_from`, `date_to`: Date range filter

### GET /api/transactions/my (Protected)
Get current user's transactions.

**Headers:**
```
Authorization: Bearer <token>
```

### POST /api/transactions (Protected)
Create a new transaction.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "hotel_id": 1,
  "amount": 250.00,
  "currency": "USD",
  "transaction_type": "booking",
  "metadata": {
    "booking_details": "Additional info"
  }
}
```

---

## Frontend JavaScript Examples

### Authentication
```javascript
// Login
async function login(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  const result = await response.json();
  
  if (result.success) {
    localStorage.setItem('token', result.data.token);
    localStorage.setItem('user', JSON.stringify(result.data.user));
  }
  
  return result;
}

// Register
async function register(userData) {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  
  return await response.json();
}
```

### Hotels
```javascript
// Get hotels with filters
async function getHotels(filters = {}) {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/hotels?${params}`);
  return await response.json();
}

// Get hotel by ID
async function getHotel(id) {
  const response = await fetch(`/api/hotels/${id}`);
  return await response.json();
}

// Create hotel (admin)
async function createHotel(hotelData) {
  const token = localStorage.getItem('token');
  
  const response = await fetch('/api/hotels', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(hotelData)
  });
  
  return await response.json();
}
```

### Currency Conversion
```javascript
// Convert currency
async function convertCurrency(from, to, amount) {
  const response = await fetch(`/api/currency/convert?from=${from}&to=${to}&amount=${amount}`);
  return await response.json();
}

// Get countries
async function getCountries() {
  const response = await fetch('/api/countries');
  return await response.json();
}
```

### Transactions
```javascript
// Create transaction
async function createTransaction(transactionData) {
  const token = localStorage.getItem('token');
  
  const response = await fetch('/api/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(transactionData)
  });
  
  return await response.json();
}

// Get user transactions
async function getUserTransactions() {
  const token = localStorage.getItem('token');
  
  const response = await fetch('/api/transactions/my', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}
```

---

## Default Admin Account

**Email:** solutionlegend9@gmail.com  
**Password:** Legend07  
**Role:** admin

Use these credentials to access admin-only endpoints after the server starts.

---

## Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error

---

## Rate Limiting

- General API: 100 requests per 15 minutes
- Authentication endpoints: 5 requests per 15 minutes

---

## Setup Instructions

1. Install dependencies: `npm install`
2. Setup database: `node setup-database.js`
3. Start server: `npm start`
4. Server runs on: `http://localhost:3001`