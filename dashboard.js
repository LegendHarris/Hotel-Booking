// Dashboard functionality
function initUserDashboard() {
    showSection('overview');
}

function initHotelDashboard() {
    showHotelSection('overview');
}

function initAdminDashboard() {
    showAdminSection('overview');
}

// User Dashboard Functions
function showSection(section) {
    // Update active nav
    document.querySelectorAll('.dashboard-nav a').forEach(a => a.classList.remove('active'));
    event?.target.classList.add('active');
    
    const content = document.getElementById('dashboardContent');
    const title = document.getElementById('sectionTitle');
    
    switch(section) {
        case 'overview':
            title.textContent = 'Dashboard Overview';
            showUserOverview(content);
            break;
        case 'bookings':
            title.textContent = 'My Bookings';
            showUserBookings(content);
            break;
        case 'profile':
            title.textContent = 'Profile Settings';
            showUserProfile(content);
            break;
        case 'settings':
            title.textContent = 'Account Settings';
            showUserSettings(content);
            break;
    }
}

function showUserOverview(content) {
    const user = auth.getCurrentUser();
    const userBookings = JSON.parse(localStorage.getItem('bookings') || '[]')
        .filter(b => b.userId === user.id);
    
    const totalBookings = userBookings.length;
    const upcomingBookings = userBookings.filter(b => new Date(b.checkinDate) > new Date()).length;
    const totalSpent = userBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    
    content.innerHTML = `
        <div class="row mb-4">
            <div class="col-md-4">
                <div class="card stat-card">
                    <div class="card-body text-center">
                        <i class="fas fa-calendar-check stat-icon"></i>
                        <h3>${totalBookings}</h3>
                        <p class="mb-0">Total Bookings</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card stat-card">
                    <div class="card-body text-center">
                        <i class="fas fa-clock stat-icon"></i>
                        <h3>${upcomingBookings}</h3>
                        <p class="mb-0">Upcoming Stays</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card stat-card">
                    <div class="card-body text-center">
                        <i class="fas fa-dollar-sign stat-icon"></i>
                        <h3>${utils.formatCurrency(totalSpent)}</h3>
                        <p class="mb-0">Total Spent</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-lg-8">
                <div class="dashboard-card">
                    <div class="card-header">
                        <h5>Recent Bookings</h5>
                    </div>
                    <div class="card-body">
                        ${userBookings.length > 0 ? `
                            <div class="table-responsive">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Hotel</th>
                                            <th>Dates</th>
                                            <th>Status</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${userBookings.slice(0, 5).map(booking => {
                                            const hotel = dummyData.hotels.find(h => h.id === booking.hotelId);
                                            return `
                                                <tr>
                                                    <td>${hotel?.name || 'Unknown Hotel'}</td>
                                                    <td>${utils.formatDate(booking.checkinDate)} - ${utils.formatDate(booking.checkoutDate)}</td>
                                                    <td><span class="status-badge status-${booking.status}">${booking.status}</span></td>
                                                    <td>${utils.formatCurrency(booking.totalPrice)}</td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        ` : '<p class="text-muted">No bookings yet. <a href="hotels.html">Book your first stay!</a></p>'}
                    </div>
                </div>
            </div>
            
            <div class="col-lg-4">
                <div class="dashboard-card">
                    <div class="card-header">
                        <h5>Quick Actions</h5>
                    </div>
                    <div class="card-body">
                        <div class="d-grid gap-2">
                            <a href="hotels.html" class="btn btn-primary">
                                <i class="fas fa-search me-2"></i>Find Hotels
                            </a>
                            <button class="btn btn-outline-primary" onclick="showSection('bookings')">
                                <i class="fas fa-list me-2"></i>View All Bookings
                            </button>
                            <button class="btn btn-outline-secondary" onclick="showSection('profile')">
                                <i class="fas fa-user me-2"></i>Edit Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showUserBookings(content) {
    const user = auth.getCurrentUser();
    const userBookings = JSON.parse(localStorage.getItem('bookings') || '[]')
        .filter(b => b.userId === user.id)
        .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
    
    content.innerHTML = `
        <div class="dashboard-card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5>All Bookings</h5>
                <a href="hotels.html" class="btn btn-primary">
                    <i class="fas fa-plus me-2"></i>New Booking
                </a>
            </div>
            <div class="card-body">
                ${userBookings.length > 0 ? `
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Confirmation #</th>
                                    <th>Hotel</th>
                                    <th>Room</th>
                                    <th>Dates</th>
                                    <th>Guests</th>
                                    <th>Status</th>
                                    <th>Total</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${userBookings.map(booking => {
                                    const hotel = dummyData.hotels.find(h => h.id === booking.hotelId);
                                    const room = hotel?.rooms.find(r => r.id === booking.roomId);
                                    return `
                                        <tr>
                                            <td><strong>${booking.confirmationNumber}</strong></td>
                                            <td>${hotel?.name || 'Unknown Hotel'}</td>
                                            <td>${room?.type || 'Unknown Room'}</td>
                                            <td>${utils.formatDate(booking.checkinDate)} - ${utils.formatDate(booking.checkoutDate)}</td>
                                            <td>${booking.guests}</td>
                                            <td><span class="status-badge status-${booking.status}">${booking.status}</span></td>
                                            <td>${utils.formatCurrency(booking.totalPrice)}</td>
                                            <td>
                                                <button class="btn btn-sm btn-outline-primary" onclick="viewBookingDetails(${booking.id})">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                                ${new Date(booking.checkinDate) > new Date() ? `
                                                    <button class="btn btn-sm btn-outline-danger ms-1" onclick="cancelBooking(${booking.id})">
                                                        <i class="fas fa-times"></i>
                                                    </button>
                                                ` : ''}
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : `
                    <div class="text-center py-5">
                        <i class="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                        <h4>No bookings yet</h4>
                        <p class="text-muted">Start exploring our amazing hotels and make your first booking!</p>
                        <a href="hotels.html" class="btn btn-primary">Browse Hotels</a>
                    </div>
                `}
            </div>
        </div>
    `;
}

function showUserProfile(content) {
    const user = auth.getCurrentUser();
    
    content.innerHTML = `
        <div class="dashboard-card">
            <div class="card-header">
                <h5>Profile Information</h5>
            </div>
            <div class="card-body">
                <form onsubmit="updateProfile(event)">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Full Name</label>
                            <input type="text" class="form-control" id="profileName" value="${user.name}" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-control" id="profileEmail" value="${user.email}" required>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Phone</label>
                            <input type="tel" class="form-control" id="profilePhone" value="${user.phone || ''}">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Date of Birth</label>
                            <input type="date" class="form-control" id="profileDob" value="${user.dateOfBirth || ''}">
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Address</label>
                        <textarea class="form-control" id="profileAddress" rows="3">${user.address || ''}</textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save me-2"></i>Update Profile
                    </button>
                </form>
            </div>
        </div>
    `;
}

function showUserSettings(content) {
    content.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <div class="dashboard-card">
                    <div class="card-header">
                        <h5>Change Password</h5>
                    </div>
                    <div class="card-body">
                        <form onsubmit="changePassword(event)">
                            <div class="mb-3">
                                <label class="form-label">Current Password</label>
                                <input type="password" class="form-control" id="currentPassword" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">New Password</label>
                                <input type="password" class="form-control" id="newPassword" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Confirm New Password</label>
                                <input type="password" class="form-control" id="confirmNewPassword" required>
                            </div>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-key me-2"></i>Change Password
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="dashboard-card">
                    <div class="card-header">
                        <h5>Preferences</h5>
                    </div>
                    <div class="card-body">
                        <div class="form-check form-switch mb-3">
                            <input class="form-check-input" type="checkbox" id="emailNotifications" checked>
                            <label class="form-check-label" for="emailNotifications">
                                Email Notifications
                            </label>
                        </div>
                        <div class="form-check form-switch mb-3">
                            <input class="form-check-input" type="checkbox" id="smsNotifications">
                            <label class="form-check-label" for="smsNotifications">
                                SMS Notifications
                            </label>
                        </div>
                        <div class="form-check form-switch mb-3">
                            <input class="form-check-input" type="checkbox" id="marketingEmails">
                            <label class="form-check-label" for="marketingEmails">
                                Marketing Emails
                            </label>
                        </div>
                        <button class="btn btn-primary" onclick="savePreferences()">
                            <i class="fas fa-save me-2"></i>Save Preferences
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Utility functions
function viewBookingDetails(bookingId) {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const booking = bookings.find(b => b.id === bookingId);
    
    if (booking) {
        const hotel = dummyData.hotels.find(h => h.id === booking.hotelId);
        const room = hotel?.rooms.find(r => r.id === booking.roomId);
        
        alert(`Booking Details:\n\nConfirmation: ${booking.confirmationNumber}\nHotel: ${hotel?.name}\nRoom: ${room?.type}\nDates: ${utils.formatDate(booking.checkinDate)} - ${utils.formatDate(booking.checkoutDate)}\nTotal: ${utils.formatCurrency(booking.totalPrice)}`);
    }
}

function cancelBooking(bookingId) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const bookingIndex = bookings.findIndex(b => b.id === bookingId);
        
        if (bookingIndex !== -1) {
            bookings[bookingIndex].status = 'cancelled';
            localStorage.setItem('bookings', JSON.stringify(bookings));
            utils.showSuccess('Booking cancelled successfully');
            showSection('bookings');
        }
    }
}

function updateProfile(event) {
    event.preventDefault();
    
    const user = auth.getCurrentUser();
    const updatedUser = {
        ...user,
        name: document.getElementById('profileName').value,
        email: document.getElementById('profileEmail').value,
        phone: document.getElementById('profilePhone').value,
        dateOfBirth: document.getElementById('profileDob').value,
        address: document.getElementById('profileAddress').value
    };
    
    // Update user in localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        utils.showSuccess('Profile updated successfully');
    }
}

function changePassword(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    const user = auth.getCurrentUser();
    
    if (user.password !== currentPassword) {
        utils.showError('Current password is incorrect');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        utils.showError('New passwords do not match');
        return;
    }
    
    if (!utils.validators.password(newPassword)) {
        utils.showError('Password must be at least 8 characters long');
        return;
    }
    
    // Update password
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
        
        const updatedUser = { ...user, password: newPassword };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        utils.showSuccess('Password changed successfully');
        event.target.reset();
    }
}

function savePreferences() {
    utils.showSuccess('Preferences saved successfully');
}