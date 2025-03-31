// Clear existing accounts that don't have passwords or deleted status
const users = JSON.parse(localStorage.getItem('users') || '[]');
if (users.some(user => !user.password || user.deleted === undefined)) {
    // Clear all users
    localStorage.removeItem('users');
    localStorage.removeItem('currentUser');
    console.log('Cleared existing accounts due to missing password data or deleted status');
}

// Add this function to calculate age
function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate.split('/').reverse().join('-'));
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
}

// Update the validation function
function isValidDate(dateString) {
    // Check format DD/MM/YYYY
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return false;

    const parts = dateString.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    
    // Basic date validation
    const isValidDate = date.getDate() === day &&
                       date.getMonth() === month &&
                       date.getFullYear() === year;
    
    if (!isValidDate) return false;
    
    // Age validation
    const age = calculateAge(`${day}/${month + 1}/${year}`);
    return age >= 18;
}

document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const firstname = document.getElementById('firstname').value;
    const surname = document.getElementById('surname').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const dob = document.getElementById('dob').value;
    const sex = document.getElementById('sex').value;
    const district = document.getElementById('district').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Basic validation
    if (!firstname || !surname || !email || !phone || !dob || !sex || !district || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }

    // Date and age validation
    if (!isValidDate(dob)) {
        alert('Please enter a valid date in the format DD/MM/YYYY (e.g., 25/12/1990). You must be 18 or older.');
        return;
    }

    // Calculate age for storage
    const age = calculateAge(dob);

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }

    // Password match validation
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    // Phone number validation (Uganda format)
    const phoneRegex = /^(0|256|\+256)(7[0-8]|20)\d{7}$/;
    if (!phoneRegex.test(phone)) {
        alert('Please enter a valid Ugandan phone number');
        return;
    }

    // Store user info in localStorage
    const userData = {
        id: Date.now(), // Generate a unique ID
        firstname: firstname,
        surname: surname,
        email: email,
        phone: phone,
        dob: dob,
        age: age,
        sex: sex,
        district: district,
        password: password,
        timestamp: new Date().toISOString(),
        isActive: false,
        deleted: false // Add deleted status flag
    };

    // Add to users array in localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push(userData);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Remove current user data since they need to log in
    localStorage.removeItem('currentUser');
    
    // Show success message and redirect to login page
    alert('Registration successful! Please log in with your email and password.');
    window.location.href = 'index.html';
});

// Prevent logged in users from accessing register page
if (localStorage.getItem('currentUser')) {
    window.location.href = 'game.html';
} 