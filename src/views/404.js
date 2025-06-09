export function render404() {
    const page = document.getElementById('page');
    const attemptedPath = window.location.pathname.replace(/</g, "&lt;").replace(/>/g, "&gt;"); // basic sanitization

    page.innerHTML = `
        <main class="container-404" role="main" aria-label="404 Page Not Found">
            <section class="content-404">
                <h1>404</h1>
                <h2>Page Not Found</h2>
                <svg class="icon-404" xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M3 11V13M6 8V16M9 10V14M12 7V17M15 4V20M18 9V15M21 11V13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p>The page <code>"${attemptedPath}"</code> does not exist.</p>
                <a href="/" class="btn-home" role="button" tabindex="0">Return Home</a>
            </section>
        </main>
    `;
}