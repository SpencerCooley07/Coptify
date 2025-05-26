export function renderLogin() {
    const content = document.getElementById('content');

    content.innerHTML = `
    <div class="auth-container">
        <div class="auth-box">
            <h1>Login</h1>
            <form id="login-form">
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
                
                <button type="submit">Sign In</button>
                <p>Don't have an account? <a href='/signup'>Sign up</a></p>
            </form>
        </div>
    </div>
    `;

    attachListeners();
};

const validateEmail = (email) => {
    return String(email).match(/\S+@\S+\.\S+/);
};

function attachListeners() {
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = Object.fromEntries(new FormData(loginForm));
        
        if (!validateEmail(formData.email)) {
            alert('Invalid email');
            return;
        };

        login(formData);
    });
};

async function login(formData) {
    try {
        const response = await fetch('/api/login', {
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