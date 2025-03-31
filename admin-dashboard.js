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
    // Check admin session
    const adminData = localStorage.getItem('admin');
    if (!adminData) {
        window.location.replace('admin.html');
        return;
    }

    try {
        const admin = JSON.parse(adminData);
        const currentTime = new Date().getTime();
        
        if (!admin.isAdmin || (currentTime - admin.loginTime) >= 24 * 60 * 60 * 1000) {
            localStorage.removeItem('admin');
            window.location.replace('admin.html');
            return;
        }

        // Initialize dashboard
        loadUserData();
        setupEventListeners();
        updateStats();
        updateUsersTable();
        updateTransactionsTable();
    } catch (error) {
        localStorage.removeItem('admin');
        window.location.replace('admin.html');
    }
});

function initializeDashboard() {
    try {
        // Load user data
        loadUserData();
        
        // Add event listeners
        setupEventListeners();
        
        // Initialize other dashboard features
        updateStats();
        updateUsersTable();
        updateTransactionsTable();
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        alert('Error loading dashboard. Please refresh the page.');
    }
}

function loadUserData() {
    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userTableBody = document.getElementById('userTableBody');
        
        if (!userTableBody) {
            console.error('User table body not found');
            return;
        }
        
        userTableBody.innerHTML = '';
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.firstname} ${user.surname}</td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td>${user.district}</td>
                <td>${user.age}</td>
                <td>${user.sex}</td>
                <td>
                    <button onclick="deleteUser(${user.id})" class="delete-btn">Delete</button>
                </td>
            `;
            userTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading user data:', error);
        alert('Error loading user data. Please refresh the page.');
    }
}

function setupEventListeners() {
    try {
        // Add logout button handler
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            // Remove any existing click listeners
            logoutBtn.replaceWith(logoutBtn.cloneNode(true));
            
            // Get the fresh button reference
            const freshLogoutBtn = document.getElementById('logoutBtn');
            freshLogoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Clear admin session
                localStorage.removeItem('admin');
                
                // Redirect to login page
                window.location.href = 'admin.html';
            });
        } else {
            console.error('Logout button not found');
        }
    } catch (error) {
        console.error('Error setting up event listeners:', error);
    }
}

// Global logout function
window.logoutAdmin = function() {
    localStorage.removeItem('admin');
    window.location.replace('admin.html');
};

function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }
    
    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const updatedUsers = users.map(user => {
            if (user.id === userId) {
                return { ...user, deleted: true };
            }
            return user;
        });
        
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        loadUserData(); // Refresh the table
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user. Please try again.');
    }
}

// Display all localStorage keys and contents
console.log('All localStorage keys:', Object.keys(localStorage));
for (let key of Object.keys(localStorage)) {
    console.log(`${key}:`, localStorage.getItem(key));
}

// Display all users in console
const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
console.log('All registered users:', allUsers);

// Get real user data from localStorage
function getRealUserData() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return {
        activeUsers: users.filter(user => user.isActive),
        registeredUsers: users
    };
}

// Tab switching
function switchTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabId).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Update content based on tab
    if (tabId === 'users') {
        updateUsersTable();
    } else if (tabId === 'transactions') {
        updateTransactionsTable();
    }
}

// Users table pagination
let currentUserPage = 1;
const usersPerPage = 10;

function updateUsersTable(page = 1) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    
    const userData = getRealUserData();
    const users = userData.registeredUsers;
    
    const start = (page - 1) * usersPerPage;
    const end = start + usersPerPage;
    const paginatedUsers = users.slice(start, end);
    
    paginatedUsers.forEach(user => {
        const isActive = userData.activeUsers.some(activeUser => activeUser.id === user.id);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.firstname} ${user.surname}</td>
            <td>${user.phone}</td>
            <td>${user.email}</td>
            <td>${user.joinDate || new Date(user.timestamp).toISOString().split('T')[0]}</td>
            <td><span class="status-badge status-${isActive ? 'active' : 'inactive'}">${isActive ? 'active' : 'inactive'}</span></td>
            <td>
                <button class="action-btn edit" onclick="editUser(${user.id})">Edit</button>
                <button class="action-btn delete" onclick="deleteUser(${user.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function changePage(delta) {
    const userData = getRealUserData();
    const maxPages = Math.ceil(userData.registeredUsers.length / usersPerPage);
    currentUserPage = Math.max(1, Math.min(currentUserPage + delta, maxPages));
    document.getElementById('currentPage').textContent = `Page ${currentUserPage}`;
    updateUsersTable(currentUserPage);
}

// Transactions table pagination and filtering
let currentTransactionPage = 1;
const transactionsPerPage = 10;

function updateTransactionsTable(page = 1, filters = {}) {
    const tbody = document.getElementById('transactionBody');
    tbody.innerHTML = '';
    
    let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    let filteredTransactions = transactions;
    
    // Apply filters
    if (filters.type && filters.type !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => 
            t.result.toLowerCase() === filters.type
        );
    }
    
    if (filters.startDate) {
        filteredTransactions = filteredTransactions.filter(t => 
            new Date(t.date) >= new Date(filters.startDate)
        );
    }
    
    if (filters.endDate) {
        filteredTransactions = filteredTransactions.filter(t => 
            new Date(t.date) <= new Date(filters.endDate)
        );
    }
    
    const start = (page - 1) * transactionsPerPage;
    const end = start + transactionsPerPage;
    const paginatedTransactions = filteredTransactions.slice(start, end);
    
    paginatedTransactions.forEach(trans => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${trans.date}</td>
            <td>${trans.user}</td>
            <td>${trans.id}</td>
            <td>${trans.stake.toLocaleString()} UGX</td>
            <td><span class="${trans.result.toLowerCase()}">${trans.result}</span></td>
            <td>${Math.abs(trans.amount).toLocaleString()} UGX</td>
        `;
        tbody.appendChild(row);
    });
}

function changeTransactionPage(delta) {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const maxPages = Math.ceil(transactions.length / transactionsPerPage);
    currentTransactionPage = Math.max(1, Math.min(currentTransactionPage + delta, maxPages));
    document.getElementById('currentTransactionPage').textContent = `Page ${currentTransactionPage}`;
    updateTransactionsTable(currentTransactionPage);
}

function filterTransactions() {
    const type = document.getElementById('transactionType').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    updateTransactionsTable(1, { type, startDate, endDate });
}

// User search functionality
document.getElementById('userSearch').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    currentUserPage = 1;
    updateUsersTable(1);
});

// Database management functions
function exportDatabase() {
    const data = {
        users: JSON.parse(localStorage.getItem('users') || '[]'),
        transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
        settings: JSON.parse(localStorage.getItem('gameSettings') || '{}'),
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fifty_database_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function backupDatabase() {
    // Store a backup in a different localStorage key
    const backup = {
        users: JSON.parse(localStorage.getItem('users') || '[]'),
        transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
        settings: JSON.parse(localStorage.getItem('gameSettings') || '{}'),
        backupDate: new Date().toISOString()
    };
    localStorage.setItem('backup_' + new Date().toISOString(), JSON.stringify(backup));
    alert('Database backup created');
}

function clearLogs() {
    if (!confirm('Are you sure you want to clear all transaction logs?')) return;
    localStorage.setItem('transactions', '[]');
    updateTransactionsTable();
    updateStats();
    alert('Logs cleared successfully');
}

// Save system settings
function saveSettings() {
    const settings = {
        minStake: parseInt(document.getElementById('minStake').value),
        maxStake: parseInt(document.getElementById('maxStake').value),
        winMultiplier: parseFloat(document.getElementById('winMultiplier').value),
        sessionDuration: parseInt(document.getElementById('sessionDuration').value),
        maxDailyLoss: parseInt(document.getElementById('maxDailyLoss').value)
    };
    
    // Validate inputs
    if (settings.minStake <= 0 || settings.maxStake <= 0 || 
        settings.winMultiplier <= 1 || settings.sessionDuration <= 0 || 
        settings.maxDailyLoss <= 0) {
        alert('Please enter valid values');
        return;
    }
    
    if (settings.minStake >= settings.maxStake) {
        alert('Maximum stake must be greater than minimum stake');
        return;
    }
    
    localStorage.setItem('gameSettings', JSON.stringify(settings));
    alert('Settings saved successfully');
}

// User management functions
function editUser(userId) {
    const userData = getRealUserData();
    const user = userData.registeredUsers.find(u => u.id === userId);
    if (!user) return;
    
    // In production, this would open a modal with a form
    alert(`Edit user: ${user.firstname} ${user.surname}`);
}

// Clean up stale active users
function cleanupStaleUsers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Set all users to inactive except the current user
    const updatedUsers = users.map(user => ({
        ...user,
        isActive: currentUser ? user.id === currentUser.id : false
    }));
    
    localStorage.setItem('users', JSON.stringify(updatedUsers));
}

// Initialize dashboard
function updateStats() {
    const userData = getRealUserData();
    // Show number of currently logged in users
    document.getElementById('activeUsers').textContent = userData.activeUsers.length;
    // Show total number of registered users
    document.getElementById('totalUsers').textContent = userData.registeredUsers.length;
    
    // Get real transaction data
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const today = new Date().toISOString().split('T')[0];
    const todayTransactions = transactions.filter(t => t.date.startsWith(today));
    
    const totalStakes = todayTransactions.reduce((sum, t) => sum + t.stake, 0);
    const netProfit = todayTransactions.reduce((sum, t) => sum + (t.result === 'Loss' ? t.stake : -t.amount), 0);
    
    document.getElementById('totalStakes').textContent = `${totalStakes.toLocaleString()} UGX`;
    document.getElementById('netProfit').textContent = `${netProfit.toLocaleString()} UGX`;
}

// Initialize
cleanupStaleUsers(); // Clean up stale users first
updateStats();
updateUsersTable();
updateTransactionsTable();

// Auto-refresh stats every 5 seconds to keep active users count current
setInterval(updateStats, 5000);

// Database management functions
function addTestUser() {
    const testUser = {
        id: Date.now(),
        firstname: "Test",
        surname: "User",
        email: "test@example.com",
        phone: "0700000000",
        dob: "01/01/1990",
        age: 33,
        sex: "male",
        district: "Kampala",
        timestamp: new Date().toISOString(),
        isActive: true
    };
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push(testUser);
    localStorage.setItem('users', JSON.stringify(users));
    updateUsersTable();
    updateStats();
    alert('Test user added successfully');
} 