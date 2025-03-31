// Admin credentials (in production, these should be stored securely on the server)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

// Function to check if we're on the admin dashboard page
function isAdminDashboardPage() {
    return window.location.pathname.includes('admin-dashboard.html');
}

// Function to check if we're on the admin login page
function isAdminLoginPage() {
    return window.location.pathname.includes('admin.html');
}

// Function to validate admin session
function validateAdminSession() {
    try {
        const adminData = localStorage.getItem('admin');
        if (!adminData) return false;

        const admin = JSON.parse(adminData);
        const currentTime = new Date().getTime();
        
        return admin.isAdmin && (currentTime - admin.loginTime) < 24 * 60 * 60 * 1000;
    } catch (error) {
        console.error('Error validating admin session:', error);
        return false;
    }
}

// Handle page load
document.addEventListener('DOMContentLoaded', function() {
    const adminForm = document.getElementById('adminLoginForm');
    if (!adminForm) return;

    // Check if already logged in
    const adminData = localStorage.getItem('admin');
    if (adminData) {
        try {
            const admin = JSON.parse(adminData);
            const currentTime = new Date().getTime();
            if (admin.isAdmin && (currentTime - admin.loginTime) < 24 * 60 * 60 * 1000) {
                window.location.replace('admin-dashboard.html');
                return;
            }
        } catch (error) {
            localStorage.removeItem('admin');
        }
    }

    adminForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;
        
        if (!username || !password) {
            alert('Please fill in all fields');
            return;
        }
        
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            localStorage.setItem('admin', JSON.stringify({
                username: username,
                isAdmin: true,
                loginTime: new Date().getTime()
            }));
            
            window.location.replace('admin-dashboard.html');
        } else {
            alert('Invalid admin credentials');
        }
    });
}); 