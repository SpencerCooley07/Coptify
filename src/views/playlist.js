import { loadSong } from "../player.js";

export function renderPlaylist(playlistID) {
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
                    <li><a href="/playlists" data-route>Playlists</a></li>
                </ul>
            </div>
            <div class="nav-center">
                <input type="text" class="search-bar" placeholder="Search">
            </div>
            <div class="nav-right">
                <a href="/login"><img id="profile-icon" src="/src/assets/profile.png" alt="Profile" class="profile-icon"></a>
            </div>
        </nav>
        <div class="content">
            <div class="playlist-header">
                <img class="playlist-cover" src="/src/assets/playlists/${playlistID}.jpg" alt="Cover Art">
                <div class="playlist-info">
                    <h1 id="playlist-title" class="playlist-title">Loading...</h1>
                    <h2 id="playlist-curator" class="playlist-curator">Loading...</h2>
                </div>
            </div>
            <div id="playlist-content" class="playlist-content"></div>
        </div>
    `;

    getPlaylistData(playlistID);
}

async function getPlaylistData(playlistID) {
    const playlistContent = document.getElementById('playlist-content');
    const playlistTitle = document.getElementById('playlist-title');
    const playlistCurator = document.getElementById('playlist-curator')

    try {
        const [songsRes, infoRes] = await Promise.all([
            fetch(`/api/getPlaylist/${playlistID}`),
            fetch(`/api/getPlaylistInformation/${playlistID}`)
        ]);

        const songs = await songsRes.json();
        const info = await infoRes.json();

        if (!songsRes.ok || !infoRes.ok) {
            return alert(songs.message || info.message);
        }

        playlistTitle.textContent = info.name;
        playlistCurator.textContent = info.curator;

        Object.entries(songs).forEach(([id, { name, artist }]) => {
            playlistContent.insertAdjacentHTML('beforeend', `
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
