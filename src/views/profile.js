import { allSongs } from "../app.js";
import { fuzzySearchSongs } from "../utils.js";
import { loadSong } from "../player.js";

export function renderProfile() {
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
            <section class="profile-section">
                <div class="profile-header">
                    <div class="profile-pic-wrapper">
                        <img src="/src/assets/profile.png" alt="Profile Picture" class="profile-page-pic">
                        <label class="edit-overlay">
                            <span>Edit</span>
                            <input type="file" id="upload-profile-pic" class="file-input" accept="image/*">
                        </label>
                    </div>
                    <h3 class="profile-name">${localStorage.getItem("username")}</h2>
                </div>
            </section>
            <h2>Liked Songs</h1>
            <div id="liked-songs" class="liked-content"></div>
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

            card.addEventListener('click', () => {loadSong(song.id);});
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

    const fileInput = document.getElementById('upload-profile-pic');
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
    });

    getLikedSongs();
}

async function getLikedSongs() {
    const likedContent = document.getElementById('liked-songs');
    try {

        const likedResponse = await fetch('/api/getLikedSongs', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
        })

        const songs = await likedResponse.json();
        if (!likedResponse.ok) return;

        Object.entries(songs).forEach(([id, { name, artist }]) => {
            likedContent.insertAdjacentHTML('beforeend', `
                <div class="playlist-item" data-id="${id}">
                    <div class="song-info">
                        <p class="song-name">${name}</p>
                        <p class="song-artist">${artist}</p>
                    </div>
                    <div class="song-actions">
                        <button class="play-button" title="Play song">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M7 4V20L20 12L7 4Z" fill="currentColor"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `);

        });

        document.querySelectorAll('.playlist-item').forEach(item =>
            item.addEventListener('click', () => loadSong(item.dataset.id))
        );

    } catch (err) {
        console.error(err);
        alert('Could not retrieve playlist data.');
    }
}