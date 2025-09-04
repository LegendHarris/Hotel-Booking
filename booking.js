// Booking functionality
function initBookingPage() {
    if (!auth.requireAuth()) return;
    
    const pendingBooking = localStorage.getItem('pendingBooking');
    
    if (!pendingBooking) {
        window.location.href = 'hotels.html';
        return;
    }
    
    const bookingData = JSON.parse(pendingBooking);
    displayBookingForm(bookingData);
}

function displayBookingForm(bookingData) {
    const hotel = dummyData.hotels.find(h => h.id === bookingData.hotelId);
    const room = hotel.rooms.find(r => r.id === bookingData.roomId);
    const user = auth.getCurrentUser();
    
    const nights = Math.ceil((new Date(bookingData.checkoutDate) - new Date(bookingData.checkinDate)) / (1000 * 60 * 60 * 24));
    
    document.getElementById('bookingContent').innerHTML = `
        <div class="row">
            <div class="col-lg-8">
                <div class="card mb-4">
                    <div class="card-header">
                        <h3>Booking Details</h3>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h5>${hotel.name}</h5>
                                <p class="text-muted">${hotel.location}</p>
                                <p><strong>Room:</strong> ${room.type}</p>
                                <p><strong>Guests:</strong> ${bookingData.guests}</p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>Check-in:</strong> ${utils.formatDate(bookingData.checkinDate)}</p>
                                <p><strong>Check-out:</strong> ${utils.formatDate(bookingData.checkoutDate)}</p>
                                <p><strong>Nights:</strong> ${nights}</p>
                                <p><strong>Total:</strong> ${utils.formatCurrency(bookingData.totalPrice)}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Guest Information -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h4>Guest Information</h4>
                    </div>
                    <div class="card-body">
                        <form id="guestForm">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">First Name</label>
                                    <input type="text" class="form-control" id="firstName" value="${user.name.split(' ')[0]}" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Last Name</label>
                                    <input type="text" class="form-control" id="lastName" value="${user.name.split(' ')[1] || ''}" required>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-control" id="email" value="${user.email}" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Phone</label>
                                    <input type="tel" class="form-control" id="phone" value="${user.phone || ''}" required>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Special Requests</label>
                                <textarea class="form-control" id="specialRequests" rows="3" placeholder="Any special requests or notes..."></textarea>
                            </div>
                        </form>
                    </div>
                </div>
                
                <!-- Payment Information -->
                <div class="card">
                    <div class="card-header">
                        <h4>Payment Information</h4>
                    </div>
                    <div class="card-body">
                        <form id="paymentForm" onsubmit="processPayment(event)">
                            <div class="mb-3">
                                <label class="form-label">Card Number</label>
                                <input type="text" class="form-control" id="cardNumber" placeholder="1234 5678 9012 3456" required>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Expiry Date</label>
                                    <input type="text" class="form-control" id="expiryDate" placeholder="MM/YY" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">CVV</label>
                                    <input type="text" class="form-control" id="cvv" placeholder="123" required>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Cardholder Name</label>
                                <input type="text" class="form-control" id="cardholderName" required>
                            </div>
                            
                            <div class="form-check mb-3">
                                <input class="form-check-input" type="checkbox" id="saveCard">
                                <label class="form-check-label" for="saveCard">
                                    Save card for future bookings
                                </label>
                            </div>
                            
                            <button type="submit" class="btn btn-success btn-lg w-100">
                                <i class="fas fa-credit-card me-2"></i>Complete Booking - ${utils.formatCurrency(bookingData.totalPrice)}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            
            <!-- Booking Summary -->
            <div class="col-lg-4">
                <div class="card booking-summary position-sticky" style="top: 100px;">
                    <div class="card-header">
                        <h4>Booking Summary</h4>
                    </div>
                    <div class="card-body">
                        <div class="d-flex justify-content-between mb-2">
                            <span>Room Rate (${nights} nights)</span>
                            <span>${utils.formatCurrency(room.price * nights)}</span>
                        </div>
                        <div class="d-flex justify-content-between mb-2">
                            <span>Taxes & Fees</span>
                            <span>${utils.formatCurrency(bookingData.totalPrice * 0.1)}</span>
                        </div>
                        <hr>
                        <div class="d-flex justify-content-between mb-3">
                            <strong>Total</strong>
                            <strong>${utils.formatCurrency(bookingData.totalPrice + (bookingData.totalPrice * 0.1))}</strong>
                        </div>
                        
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            <small>Free cancellation up to 24 hours before check-in</small>
                        </div>
                        
                        <div class="text-center">
                            <i class="fas fa-shield-alt text-success me-2"></i>
                            <small class="text-muted">Secure SSL Payment</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function processPayment(event) {
    event.preventDefault();
    
    // Get form data
    const guestData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        specialRequests: document.getElementById('specialRequests').value
    };
    
    const paymentData = {
        cardNumber: document.getElementById('cardNumber').value,
        expiryDate: document.getElementById('expiryDate').value,
        cvv: document.getElementById('cvv').value,
        cardholderName: document.getElementById('cardholderName').value
    };
    
    // Validate payment data
    if (!utils.validators.creditCard(paymentData.cardNumber)) {
        utils.showError('Invalid card number');
        return;
    }
    
    if (!utils.validators.cvv(paymentData.cvv)) {
        utils.showError('Invalid CVV');
        return;
    }
    
    // Simulate payment processing
    const submitButton = event.target.querySelector('button[type="submit"]');
    submitButton.innerHTML = '<div class="loading"></div> Processing...';
    submitButton.disabled = true;
    
    setTimeout(() => {
        completeBooking(guestData, paymentData);
    }, 2000);
}

function completeBooking(guestData, paymentData) {
    const pendingBooking = JSON.parse(localStorage.getItem('pendingBooking'));
    const user = auth.getCurrentUser();
    
    // Create booking record
    const booking = {
        id: Date.now(),
        userId: user.id,
        hotelId: pendingBooking.hotelId,
        roomId: pendingBooking.roomId,
        checkinDate: pendingBooking.checkinDate,
        checkoutDate: pendingBooking.checkoutDate,
        guests: pendingBooking.guests,
        totalPrice: pendingBooking.totalPrice + (pendingBooking.totalPrice * 0.1), // Include taxes
        status: 'confirmed',
        guestInfo: guestData,
        bookingDate: new Date().toISOString(),
        confirmationNumber: 'HTL' + Date.now().toString().slice(-6)
    };
    
    // Save booking
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    // Clear pending booking
    localStorage.removeItem('pendingBooking');
    
    // Show success message
    showBookingConfirmation(booking);
}

function showBookingConfirmation(booking) {
    const hotel = dummyData.hotels.find(h => h.id === booking.hotelId);
    const room = hotel.rooms.find(r => r.id === booking.roomId);
    
    document.getElementById('bookingContent').innerHTML = `
        <div class="text-center">
            <div class="card">
                <div class="card-body p-5">
                    <i class="fas fa-check-circle fa-5x text-success mb-4"></i>
                    <h1 class="text-success mb-4">Booking Confirmed!</h1>
                    <p class="lead mb-4">Your reservation has been successfully processed.</p>
                    
                    <div class="alert alert-success">
                        <h4>Confirmation Number: <strong>${booking.confirmationNumber}</strong></h4>
                        <p class="mb-0">Please save this number for your records.</p>
                    </div>
                    
                    <div class="row text-start mt-4">
                        <div class="col-md-6">
                            <h5>Booking Details</h5>
                            <p><strong>Hotel:</strong> ${hotel.name}</p>
                            <p><strong>Room:</strong> ${room.type}</p>
                            <p><strong>Check-in:</strong> ${utils.formatDate(booking.checkinDate)}</p>
                            <p><strong>Check-out:</strong> ${utils.formatDate(booking.checkoutDate)}</p>
                        </div>
                        <div class="col-md-6">
                            <h5>Guest Information</h5>
                            <p><strong>Name:</strong> ${booking.guestInfo.firstName} ${booking.guestInfo.lastName}</p>
                            <p><strong>Email:</strong> ${booking.guestInfo.email}</p>
                            <p><strong>Phone:</strong> ${booking.guestInfo.phone}</p>
                            <p><strong>Total Paid:</strong> ${utils.formatCurrency(booking.totalPrice)}</p>
                        </div>
                    </div>
                    
                    <div class="mt-4">
                        <a href="user-dashboard.html" class="btn btn-primary me-3">View My Bookings</a>
                        <a href="hotels.html" class="btn btn-outline-primary">Book Another Hotel</a>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    utils.showSuccess('Booking confirmed successfully!');
}