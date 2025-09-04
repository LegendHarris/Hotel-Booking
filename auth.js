// Authentication functions
const auth = {
    // Check if user is logged in
    isLoggedIn: () => {
        return localStorage.getItem('currentUser') !== null;
    },

    // Get current user
    getCurrentUser: () => {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    },

    // Login user
    login: (email, password) => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            return { success: true, user };
        }
        
        return { success: false, message: 'Invalid email or password' };
    },

    // Register user
    register: (userData) => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Check if email already exists
        if (users.find(u => u.email === userData.email)) {
            return { success: false, message: 'Email already exists' };
        }

        const newUser = {
            id: Date.now(),
            ...userData,
            role: userData.role || 'user',
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        return { success: true, user: newUser };
    },

    // Logout user
    logout: () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    },

    // Check user role
    hasRole: (role) => {
        const user = auth.getCurrentUser();
        return user && user.role === role;
    },

    // Protect routes
    requireAuth: () => {
        if (!auth.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },

    // Protect admin routes
    requireAdmin: () => {
        if (!auth.isLoggedIn() || !auth.hasRole('admin')) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    },

    // Protect hotel owner routes
    requireHotelOwner: () => {
        const user = auth.getCurrentUser();
        if (!user || (user.role !== 'hotel_owner' && user.role !== 'admin')) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }
};

// Initialize some demo users
if (!localStorage.getItem('users')) {
    const demoUsers = [
        {
            id: 1,
            name: 'Admin User',
            email: 'admin@hotel.com',
            password: 'admin123',
            role: 'admin',
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            name: 'Hotel Owner',
            email: 'owner@hotel.com',
            password: 'owner123',
            role: 'hotel_owner',
            createdAt: new Date().toISOString()
        },
        {
            id: 3,
            name: 'John Doe',
            email: 'user@hotel.com',
            password: 'user123',
            role: 'user',
            createdAt: new Date().toISOString()
        }
    ];
    localStorage.setItem('users', JSON.stringify(demoUsers));
}