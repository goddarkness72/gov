// ========== SESSION MANAGEMENT ==========

// Check if user is logged in
function isUserLoggedIn() {
  return localStorage.getItem('currentUser') !== null;
}

// Get current logged-in user
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser'));
}

// Login user (create session)
function loginUser(userData) {
  localStorage.setItem('currentUser', JSON.stringify(userData));
}

// Logout user (destroy session)
function logoutUser() {
  localStorage.removeItem('currentUser');
  const currentPath = window.location.pathname;
  // Handle both file:// and http:// protocols
  if (currentPath.includes('auth')) {
    window.location.href = 'login.html';
  } else {
    window.location.href = 'auth/login.html';
  }
}

// Redirect if not logged in
function checkLoginStatus() {
  if (!isUserLoggedIn()) {
    const currentPath = window.location.pathname;
    // Don't redirect if already on login page
    if (currentPath.includes('login.html') || currentPath.includes('signup.html')) {
      return;
    }
    // Handle both file:// and http:// protocols
    if (currentPath.includes('auth')) {
      window.location.href = 'login.html';
    } else {
      window.location.href = 'auth/login.html';
    }
  }
}

// ========== LOGIN PAGE FUNCTIONS ==========

function showSuccessMessage() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('newuser') === 'true') {
    const successMsg = document.getElementById('successMessage');
    if (successMsg) {
      successMsg.classList.add('show');
      window.history.replaceState({}, document.title, 'login.html');
    }
  }
}

function handleLogin(event) {
  event.preventDefault();

  // Get the values
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Clear error messages
  const usernameError = document.getElementById('usernameError');
  const passwordError = document.getElementById('passwordError');

  if (usernameError) usernameError.classList.remove('show');
  if (passwordError) passwordError.classList.remove('show');

  // Validate fields
  if (username.trim() === '') {
    if (usernameError) {
      usernameError.textContent = '⚠️ Username is required';
      usernameError.classList.add('show');
    }
    return;
  }

  if (password.trim() === '') {
    if (passwordError) {
      passwordError.textContent = '⚠️ Password is required';
      passwordError.classList.add('show');
    }
    return;
  }

  // Get users from storage
  const users = JSON.parse(localStorage.getItem('users')) || [];

  // Find matching user
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    alert('✅ Login Successful! Welcome, ' + user.firstName);
    loginUser(user);  // Set session
    // Redirect to home page
    window.location.href = '../index.html';
  } else {
    alert('❌ Login Failed! Username or password is incorrect.');
  }
}

// ========== SIGNUP PAGE FUNCTIONS ==========

// Auto-calculate age from date of birth
function setupDateOfBirthListener() {
  const dobInput = document.getElementById('dob');
  if (dobInput) {
    dobInput.addEventListener('change', function() {
      const dob = new Date(this.value);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }

      const ageInput = document.getElementById('age');
      if (ageInput) {
        ageInput.value = age;
      }
    });
  }
}

// Check password strength
function checkPasswordStrength() {
  const password = document.getElementById('password').value;
  const strengthDiv = document.getElementById('passwordStrength');

  if (!strengthDiv) return;

  if (password.length === 0) {
    strengthDiv.textContent = '';
    strengthDiv.classList.remove('weak', 'medium', 'strong');
    return;
  }

  let strength = 0;

  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[!@#$%^&*]/.test(password)) strength++;

  strengthDiv.classList.remove('weak', 'medium', 'strong');

  if (strength <= 2) {
    strengthDiv.classList.add('weak');
    strengthDiv.textContent = '⚠️ Weak Password - Add uppercase, numbers, and special characters';
  } else if (strength <= 3) {
    strengthDiv.classList.add('medium');
    strengthDiv.textContent = '⚡ Medium Password - Consider adding special characters';
  } else {
    strengthDiv.classList.add('strong');
    strengthDiv.textContent = '✅ Strong Password - Good!';
  }
}

// Handle signup form submission
function handleSignup(event) {
  event.preventDefault();

  // Clear all error messages
  document.querySelectorAll('.error-message').forEach(el => {
    el.classList.remove('show');
  });

  // Get form values
  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const dob = document.getElementById('dob').value;
  const age = document.getElementById('age').value;
  const gender = document.getElementById('gender').value;
  const city = document.getElementById('city').value.trim();
  const state = document.getElementById('state').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const termsAccepted = document.getElementById('terms').checked;

  let hasError = false;

  // Validate First Name
  if (firstName === '') {
    showError('firstNameError', '⚠️ First name is required');
    hasError = true;
  }

  // Validate Last Name
  if (lastName === '') {
    showError('lastNameError', '⚠️ Last name is required');
    hasError = true;
  }

  // Validate Username
  if (username === '') {
    showError('usernameError', '⚠️ Username is required');
    hasError = true;
  } else if (username.includes(' ')) {
    showError('usernameError', '⚠️ Username cannot contain spaces');
    hasError = true;
  } else if (username.length < 4) {
    showError('usernameError', '⚠️ Username must be at least 4 characters');
    hasError = true;
  }

  // Check duplicate username
  const existingUsers = JSON.parse(localStorage.getItem('users')) || [];
  if (existingUsers.some(u => u.username === username)) {
    showError('usernameError', '⚠️ Username already taken. Choose another.');
    hasError = true;
  }

  // Validate Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showError('emailError', '⚠️ Please enter a valid email address');
    hasError = true;
  }

  // Validate Phone (10 digits)
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phone)) {
    showError('phoneError', '⚠️ Phone must be 10 digits');
    hasError = true;
  }

  // Validate Date of Birth
  if (dob === '') {
    showError('dobError', '⚠️ Date of birth is required');
    hasError = true;
  } else if (age < 13) {
    showError('dobError', '⚠️ You must be at least 13 years old');
    hasError = true;
  }

  // Validate Gender
  if (gender === '') {
    showError('genderError', '⚠️ Please select your gender');
    hasError = true;
  }

  // Validate City
  if (city === '') {
    showError('cityError', '⚠️ City is required');
    hasError = true;
  }

  // Validate State
  if (state === '') {
    showError('stateError', '⚠️ State is required');
    hasError = true;
  }

  // Validate Password
  if (password.length < 8) {
    showError('passwordError', '⚠️ Password must be at least 8 characters');
    hasError = true;
  }

  // Validate Confirm Password
  if (password !== confirmPassword) {
    showError('confirmPasswordError', '⚠️ Passwords do not match');
    hasError = true;
  }

  // Validate Terms
  if (!termsAccepted) {
    showError('termsError', '⚠️ You must accept the terms and conditions');
    hasError = true;
  }

  // Stop if errors exist
  if (hasError) {
    return;
  }

  // Create user object
  const newUser = {
    firstName: firstName,
    lastName: lastName,
    username: username,
    email: email,
    phone: phone,
    dob: dob,
    age: age,
    gender: gender,
    city: city,
    state: state,
    password: password,
    createdAt: new Date().toLocaleString()
  };

  // Get existing users and add new one
  let users = JSON.parse(localStorage.getItem('users')) || [];
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));

  // Show success and redirect
  alert('✅ Account Created Successfully! You can now login with your username and password.');
  window.location.href = 'login.html?newuser=true';
}

// Helper function to show error message
function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
  }
}

// Initialize page when document loads
document.addEventListener('DOMContentLoaded', function() {
  // Setup date of birth listener if signup page
  setupDateOfBirthListener();

  // Show success message if login page
  showSuccessMessage();

  // Setup password strength checker if signup page
  const passwordInput = document.getElementById('password');
  if (passwordInput) {
    passwordInput.addEventListener('keyup', checkPasswordStrength);
  }
});
