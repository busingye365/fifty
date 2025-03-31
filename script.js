// Check if user is logged in
if (!localStorage.getItem('currentUser')) {
    window.location.href = 'index.html';
}

// Get user data
const userData = JSON.parse(localStorage.getItem('currentUser'));

// Check if user is deleted
function checkUserStatus() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const currentUser = users.find(u => u.id === userData.id);
    
    if (!currentUser || currentUser.deleted) {
        alert('Your account has been deleted. Please contact support.');
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Add deletion check at the start
if (!checkUserStatus()) {
    window.location.href = 'index.html';
}

let balance = userData.balance || 0;

// Profile management functions
function showUserProfile() {
    if (!checkUserStatus()) return;
    
    const modal = document.getElementById('profile-modal');
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profilePhone = document.getElementById('profile-phone');
    const profileDistrict = document.getElementById('profile-district');
    const profileDob = document.getElementById('profile-dob');
    const profileAge = document.getElementById('profile-age');
    const profileJoinDate = document.getElementById('profile-join-date');
    
    // Calculate age
    const calculateAge = (birthDate) => {
        const dob = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        return age;
    };

    // Update profile content
    profileName.textContent = `${userData.firstname} ${userData.surname}`;
    profileEmail.textContent = userData.email;
    profilePhone.textContent = userData.phone;
    profileDistrict.textContent = userData.district;
    profileDob.textContent = new Date(userData.dob).toLocaleDateString();
    profileAge.textContent = `${calculateAge(userData.dob)} years`;
    profileJoinDate.textContent = new Date(userData.timestamp).toLocaleDateString();
    
    // Show modal
    modal.style.display = 'flex';

    // Add click event listener to close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeProfile();
        }
    });
}

function showStakeHistory() {
    if (!checkUserStatus()) return;
    
    const modal = document.getElementById('stake-history-modal');
    const stakeHistoryList = document.getElementById('stake-history-list');
    
    // Get and display stake history
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const userTransactions = transactions.filter(t => t.userId === userData.id);
    
    // Sort transactions by date (most recent first)
    userTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Clear previous history
    stakeHistoryList.innerHTML = '';

    if (userTransactions.length === 0) {
        stakeHistoryList.innerHTML = '<p class="no-history">No stake history available</p>';
    } else {
        // Create table
        const table = document.createElement('table');
        table.className = 'history-table';
        
        // Add table header
        table.innerHTML = `
            <thead>
                <tr>
                    <th>S/N</th>
                    <th>Amount (UGX)</th>
                    <th>Date/Time</th>
                    <th>Code</th>
                    <th>Result</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        
        // Add table rows
        userTransactions.forEach((transaction, index) => {
            const row = document.createElement('tr');
            const date = new Date(transaction.timestamp).toLocaleString();
            const resultClass = transaction.result === 'win' ? 'win' : 'loss';
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${transaction.stake.toLocaleString()}</td>
                <td>${date}</td>
                <td>${transaction.code}</td>
                <td><span class="${resultClass}">${transaction.result.toUpperCase()}</span></td>
            `;
            
            table.querySelector('tbody').appendChild(row);
        });
        
        stakeHistoryList.appendChild(table);
    }
    
    // Show modal
    modal.style.display = 'flex';

    // Add click event listener to close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeStakeHistory();
        }
    });
}

function closeStakeHistory() {
    const modal = document.getElementById('stake-history-modal');
    modal.style.display = 'none';
}

function closeProfile() {
    const modal = document.getElementById('profile-modal');
    modal.style.display = 'none';
}

let selectedStake = 0;

// Function to generate unique code
function generateUniqueCode() {
    const now = new Date();
    const date = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 9).toLowerCase();

    return `${date}${month}${year} ${hours}${minutes}${seconds} ${random}`;
}

// Function to show modal notification
function showNotification(stake, code) {
    const modal = document.getElementById('notification-modal');
    const stakeAmount = document.getElementById('stake-amount');
    const possibleWin = document.getElementById('possible-win');
    const codeDisplay = document.getElementById('code-display');
    const copyBtn = document.getElementById('copy-btn');
    const closeX = document.querySelector('.close-x');

    // Calculate possible win (stake + 50% of stake)
    const possibleWinAmount = stake + (stake * 0.5);

    // Update content
    stakeAmount.textContent = `${stake.toLocaleString()} UGX`;
    possibleWin.textContent = `${possibleWinAmount.toLocaleString()} UGX`;
    codeDisplay.textContent = code;

    // Show modal
    modal.style.display = 'flex';

    // Copy button handler
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(code).then(() => {
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = 'Copy Code';
            }, 2000);
        });
    });

    // Close X handler
    closeX.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Click outside to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Get DOM elements
const stakeOptions = document.querySelectorAll('.stake-option');

// Add click event listeners to stake options
stakeOptions.forEach(option => {
    option.addEventListener('click', () => {
        if (!checkUserStatus()) return;

        // Remove selected class from all options
        stakeOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Add selected class to clicked option
        option.classList.add('selected');
        
        // Update selected stake
        selectedStake = parseInt(option.dataset.stake);
        
        // Generate unique code
        const uniqueCode = generateUniqueCode();
        
        // Save transaction data
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const transaction = {
            userId: userData.id,
            stake: selectedStake,
            code: uniqueCode,
            timestamp: new Date().toISOString(),
            result: Math.random() >= 0.5 ? 'win' : 'loss' // Random result for demonstration
        };
        transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        
        // Show notification with stake details and code
        showNotification(selectedStake, uniqueCode);
        
        // Mark stake as placed for this session
        if (gameClock) {
            gameClock.handleStakePlaced();
        }
    });
});

// Game logic function
function playGame() {
    // Simple random win/lose logic (50% chance)
    const win = Math.random() >= 0.5;
    
    if (win) {
        // Win amount is stake + 50% of stake
        const winAmount = selectedStake + (selectedStake * 0.5);
        balance += winAmount;
        alert(`Congratulations! You won ${winAmount.toLocaleString()} UGX!`);
    } else {
        balance -= selectedStake;
        alert(`Sorry! You lost ${selectedStake.toLocaleString()} UGX.`);
    }
}

var Clock = (function(){
    var exports = function(element) {
        this._element = element;
        this._seconds = 30;
        this._isGameSession = true;
        this._heading = document.querySelector('h2');
        this._originalHeadingText = this._heading.textContent;
        this._hasPlacedStake = false; // Track if stake has been placed in current session
        var html = '';
        for (var i=0; i<8; i++) {
            if (i === 2 || i === 5) {
                html += '<span>:</span>';
            } else {
                html += '<span>0</span>';
            }
        }
        this._element.innerHTML = html;
        this._slots = this._element.getElementsByTagName('span');
        this._tick();
        this._updateStakeButtons();
        this._updateHeading();
    };

    exports.prototype = {
        _updateHeading: function() {
            if (this._isGameSession) {
                this._heading.textContent = this._originalHeadingText;
            } else {
                this._heading.textContent = 'Session Closed - Wait for Next Session';
            }
        },

        _tick: function() {
            var timeString = this._pad(this._seconds);
            var slots = this._slots;
            
            this._updateSlot(slots[6], timeString.charAt(0));
            this._updateSlot(slots[7], timeString.charAt(1));
            
            if (this._seconds > 0) {
                this._seconds--;
                var self = this;
                setTimeout(function(){
                    self._tick();
                },1000);
            } else {
                this._seconds = 30;
                this._isGameSession = !this._isGameSession;
                this._hasPlacedStake = false; // Reset stake placement for new session
                this._updateStakeButtons();
                this._updateHeading();
                this._tick();
            }
        },

        _updateStakeButtons: function() {
            const stakeOptions = document.querySelectorAll('.stake-option');
            stakeOptions.forEach(option => {
                if (this._isGameSession && !this._hasPlacedStake) {
                    option.classList.remove('disabled');
                    option.style.pointerEvents = 'auto';
                    option.style.opacity = '1';
                } else {
                    option.classList.add('disabled');
                    option.style.pointerEvents = 'none';
                    option.style.opacity = '0.5';
                }
            });
        },

        _updateSlot: function(slot, value) {
            var now = slot.dataset.now;
            if (!now) {
                slot.dataset.now = value;
                slot.dataset.old = value;
            }
            else if (now !== value) {
                this._flip(slot, value);
            }
        },

        _pad: function(value) {
            return ('0' + value).slice(-2);
        },

        _flip: function(slot,value) {
            slot.classList.remove('flip');
            slot.dataset.old = slot.dataset.now;
            slot.dataset.now = value;
            slot.offsetLeft;
            slot.classList.add('flip');
        },

        // Add method to handle stake placement
        handleStakePlaced: function() {
            this._hasPlacedStake = true;
            this._updateStakeButtons();
        }
    };
    return exports;
}());

// Create a single clock instance that we can reference
var gameClock;

// Initialize clock
var clocks = document.querySelectorAll('.clock');
if (clocks.length > 0) {
    gameClock = new Clock(clocks[0]);
}

// Add logout function
function logout() {
    // Get the current user
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Update user's active status in the users array
    if (currentUser) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const updatedUsers = users.map(u => {
            if (u.id === currentUser.id) {
                return { ...u, isActive: false };
            }
            return u;
        });
        localStorage.setItem('users', JSON.stringify(updatedUsers));
    }
    
    // Remove current user
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
} 

// Add at the beginning of the file
function toggleDropdown(event) {
    event.preventDefault(); // Prevent default button behavior
    event.stopPropagation(); // Prevent event from bubbling up
    const dropdown = document.getElementById('profileDropdown');
    const isShown = dropdown.classList.contains('show');
    
    // Close any open dropdowns first
    const dropdowns = document.getElementsByClassName('dropdown-content');
    for (let i = 0; i < dropdowns.length; i++) {
        dropdowns[i].classList.remove('show');
    }
    
    // Toggle the clicked dropdown
    if (!isShown) {
        dropdown.classList.add('show');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdowns = document.getElementsByClassName('dropdown-content');
    for (let i = 0; i < dropdowns.length; i++) {
        if (dropdowns[i].classList.contains('show')) {
            dropdowns[i].classList.remove('show');
        }
    }
});

// Prevent dropdown from closing when clicking inside it
document.addEventListener('DOMContentLoaded', function() {
    const dropdownContent = document.querySelector('.dropdown-content');
    if (dropdownContent) {
        dropdownContent.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    }
}); 