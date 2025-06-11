export function renderLogin() {
    const page = document.getElementById('page');
    page.innerHTML = `
        <div class="auth-container">
            <div class="auth-box">
                <h1>Login</h1>
                <form id="login-form">
                    <input type="email" name="email" placeholder="Email" required autocomplete="email" />
                    <input type="password" name="password" placeholder="Password" required autocomplete="current-password" />
                    <button type="submit">Sign In</button>
                    <p>Don't have an account? <a href="/signup" data-route>Sign up</a></p>
                </form>
            </div>
        </div>
    `;
    attachLoginListeners();
}

function attachLoginListeners() {
    const form = document.getElementById('login-form');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = Object.fromEntries(new FormData(form));
        
        try {
            const res = await fetch('/api/login', {
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