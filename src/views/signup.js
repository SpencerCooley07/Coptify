export function renderSignup() {
    const page = document.getElementById('page');
    page.innerHTML = `
        <div class="auth-container">
            <div class="auth-box">
                <h1>Sign Up</h1>
                <form id="signup-form">
                    <input type="text" name="username" placeholder="Username" required
                        pattern="^[A-Za-z][A-Za-z0-9_]{3,19}$"
                        title="3–20 characters. Letters, numbers, underscores. Start with a letter." 
                        autocomplete="username" />
                    <input type="email" name="email" placeholder="Email" required autocomplete="email" />
                    <input type="password" name="password" placeholder="Password" required autocomplete="new-password" />
                    <input type="password" name="confirmPassword" placeholder="Confirm Password" required autocomplete="new-password" />
                    <button type="submit">Create Account</button>
                    <p>Already have an account? <a href="/login" data-route>Sign In</a></p>
                </form>
            </div>
        </div>
    `;
    attachSignupListeners();
}

function attachSignupListeners() {
    const form = document.getElementById('signup-form');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = Object.fromEntries(new FormData(form));

        if (!isValidEmail(formData.email)) {
            alert('Invalid email');
            return;
        }

        if (!isValidPassword(formData.password)) {
            alert("Password must be at least 8 characters, including:\n• uppercase\n• lowercase\n• digit\n• special character");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            const res = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const json = await res.json();

            if (!res.ok) return alert(json.message);
            localStorage.setItem('token', json.token);
            localStorage.setItem('username', json.username);
            window.location.href = '/';
        } catch {
            alert('Authentication failed, please try again.');
        }
    });
}

function isValidEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
}

function isValidPassword(password) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password);
}