import { allSongs } from "../app.js";
import { fuzzySearchSongs } from "../utils.js";
import { loadSong } from "../player.js";

export function renderHome() {
    const page = document.getElementById('page');
    page.innerHTML = `
        <nav class="navbar">
            <div class="nav-left">
                <div class="logo">
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none">
                        <path d="M3 11V13M6 8V16M9 10V14M12 7V17M15 4V20M18 9V15M21 11V13"
                            stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <ul class="nav-items">
                    <li><a href="/" data-route>Home</a></li>
                </ul>
            </div>
            <div class="nav-center">
                <input type="text" class="search-bar" placeholder="Search">
                <div id="search-dropdown" class="search-dropdown"></div>
            </div>
            <div class="nav-right">
                <div class="profile-container">
                    <img id="profile-icon" src="/src/assets/profile.png" alt="Profile" class="profile-icon">
                    <div id="profile-dropdown" class="profile-dropdown hidden"></div>
                </div>
            </div>
        </nav>
        <main class="content">
            <section class="coptify-playlists-section">
                <h1>Coptify Playlists</h1>
                <div id="coptify-playlists" class="coptify-playlists"></div>
            </section>
        </main>
    `;

    // Search
    const searchInput = document.querySelector('.search-bar');
    const searchDropdown = document.getElementById('search-dropdown');

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();
        searchDropdown.innerHTML = '';

        if (!query) {
            searchDropdown.classList.add('hidden');
            return;
        }

        const results = fuzzySearchSongs(allSongs, query).slice(0, 5);
        
        if (results.length === 0) {
            searchDropdown.classList.add('hidden');
            return;
        }

        results.forEach(songObj => {
            const song = songObj.song;
            const card = document.createElement('div');
            card.className = 'search-item';
            card.innerHTML = `
                <div class="search-item-text" data-id=${song.id}>
                    <strong>${song.name}</strong><br>
                    <span>${song.artist}</span>
                </div>
            `;

            card.addEventListener('click', () => loadSong(song.id));
            searchDropdown.appendChild(card);
        });

        searchDropdown.classList.remove('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
            searchDropdown.classList.add('hidden');
        }
    });

    // Profile
    const profileIcon = document.getElementById('profile-icon');
    const profileDropdown = document.getElementById('profile-dropdown');

    const token = localStorage.getItem('token');
    profileDropdown.innerHTML = token ? `
        <a href="/profile" data-route>Profile</a>
        <a href="#" id="logout-button">Log out</a>
    ` : `
        <a href="/login" data-route>Login</a>
        <a href="/signup" data-route>Create Account</a>
    `;

    profileIcon.addEventListener('click', () => {
        profileDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.profile-container')) {
            profileDropdown.classList.add('hidden');
        } else if (!e.target.closest('.search-dropdown')) {
            searchDropdown.classList.add('hidden');
        }
    });

    if (token) {
        document.getElementById('logout-button').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            location.reload();
        });
    }

    loadCoptifyPlaylists();
}

async function loadCoptifyPlaylists() {
    const container = document.getElementById('coptify-playlists');

    try {
        const response = await fetch('/api/getCoptifyPlaylists');
        const data = await response.json();
        
        if (!response.ok) return alert(data.message);

        Object.entries(data).forEach(([playlistID, { name, curator }]) => {
            const card = `
                <a href="/playlist/${playlistID}" class="content-item">
                    <img src="/src/assets/playlists/${playlistID}.jpg" alt="${name}">
                    <h2>${name}</h2>
                    <h3>${curator}</h3>
                </a>
            `;
            container.insertAdjacentHTML('beforeend', card);
        });

    } catch (err) {
        console.error(err);
        alert('Could not retrieve data');
    }
}
