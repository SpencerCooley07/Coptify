export function renderSignup() {
    const content = document.getElementById('content');

    content.innerHTML = `
    <div class="auth-container">
        <div class="auth-box">
            <h1>Create Account</h1>
            <form id="signup-form">
                <input 
                    type="text"
                    placeholder="Username"
                    id="usernameInput"
                    name="username"
                    autocomplete="username"
                    pattern="^[A-Za-z][A-Za-z0-9_]{3,19}$"
                    title="Must be 3-20 alphanumeric characters and begin with a letter"
                    required>
                
                <input
                    type="email"
                    placeholder="Email"
                    id="emailInput"
                    name="email"
                    autocomplete="email"
                    required>
                
                <input
                    type="password"
                    placeholder="Password"
                    id="passwordInput"
                    name="password"
                    autocomplete="new-password"
                    required>
                
                <input
                    type="password"
                    placeholder="Confirm Password"
                    id="confirmPasswordInput"
                    name="confirmPassword"
                    autocomplete="new-password"
                    required>
                
                <button type="submit">Sign In</button>
            </form>
        </div>
    </div>
    `;

    attachListeners();
};

const validateEmail = (email) => {
    return String(email).match(/\S+@\S+\.\S+/);
};

const validatePassword = (password) => {
    return String(password).match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/);
};

function attachListeners() {
    const signupForm = document.getElementById('signup-form');

    signupForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = Object.fromEntries(new FormData(signupForm));
        
        if (!validateEmail(formData.email)) {
            alert('Invalid email');
            return;
        } else if (!validatePassword(formData.password)) {
            alert("Password must be 8+ characters and have at least 1:\n• Uppercase character\n• Lowercase character\n• Number\n• Special Character")
            return;
        } else if (formData.password != formData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        };

        createAccount(formData);
    });
};

async function createAccount(formData) {
    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(formData)
        });
        const responseJSON = await response.json();

        if (!response.ok) {
            alert(responseJSON.message);
        } else {
            alert('Authentication successful!');
            localStorage.setItem('token', responseJSON.token);
            localStorage.setItem('username', responseJSON.username);
            window.location.href = '/';
        };

    } catch (error) {
        alert('Authentication failed, please try again.');
    };
};