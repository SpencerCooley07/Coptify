export function renderHome() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <nav class="navbar">
            <div class="nav-left">
                <div class="logo">
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M3 11V13M6 8V16M9 10V14M12 7V17M15 4V20M18 9V15M21 11V13" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </div>
                <ul class="nav-items">
                    <li><a href="/" data-route>Home</a></li>
                    <li><a href="/playlists" data-route>Playlists</a></li>
                </ul>
            </div>

            <div class="nav-center">
                <input type="text" class="search-bar" placeholder="Search">
            </div>

            <div class="nav-right">
                <img id="profile-icon" src="/src/assets/profile.png" alt="Profile" class="profile-icon">
            </div>
        </nav>
    `;
};