export function render404() {
    const page = document.getElementById('page');
    const attemptedPath = window.location.pathname;
    page.innerHTML = `
        <div class="container-404">
            <div class="content-404">
                <h1>404</h1>
                <h2>Page Not Found</h2>
                <svg style="margin: 20px 0px;" xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none"><path d="M3 11V13M6 8V16M9 10V14M12 7V17M15 4V20M18 9V15M21 11V13" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <p>The page "${attemptedPath}" does not exist. Go back <a href="/">home</a>!</p>
            </div>
        </div>
    `;
};