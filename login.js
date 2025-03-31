// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Get the login form
        const loginForm = document.getElementById('loginForm');
        if (!loginForm) {
            console.error('Login form not found');
            return;
        }

        // Add submit event listener
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            try {
                const emailOrPhone = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                
                // Basic validation
                if (!emailOrPhone || !password) {
                    alert('Please fill in all fields');
                    return;
                }
                
                // Get users from localStorage with error handling
                let users = [];
                try {
                    const usersStr = localStorage.getItem('users');
                    if (usersStr) {
                        users = JSON.parse(usersStr);
                    }
                } catch (error) {
                    console.error('Error reading users from localStorage:', error);
                    alert('Error accessing user data. Please try again.');
                    return;
                }
                
                // Find user by email or phone
                const user = users.find(u => 
                    (u.email === emailOrPhone || u.phone === emailOrPhone) && 
                    u.password === password
                );
                
                if (!user) {
                    alert('Invalid email/phone or password');
                    return;
                }
                
                if (user.deleted) {
                    alert('Your account has been deleted. Please contact support.');
                    return;
                }
                
                // Update user's active status
                const updatedUsers = users.map(u => {
                    if (u.id === user.id) {
                        return { ...u, isActive: true };
                    }
                    return u;
                });
                
                // Save updated users
                try {
                    localStorage.setItem('users', JSON.stringify(updatedUsers));
                    localStorage.setItem('currentUser', JSON.stringify(user));
                } catch (error) {
                    console.error('Error saving to localStorage:', error);
                    alert('Error saving user data. Please try again.');
                    return;
                }
                
                // Redirect to game page
                window.location.href = 'game.html';
            } catch (error) {
                console.error('Error during login:', error);
                alert('An error occurred during login. Please try again.');
            }
        });
    } catch (error) {
        console.error('Error setting up login form:', error);
        alert('Error initializing login form. Please refresh the page.');
    }
});

// Check if user is already logged in
try {
    if (localStorage.getItem('currentUser')) {
        window.location.href = 'game.html';
    }
} catch (error) {
    console.error('Error checking login status:', error);
} 