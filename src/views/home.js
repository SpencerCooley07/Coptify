export function renderHome() {
    const page = document.getElementById('page');
    page.innerHTML = `
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
                <a href="/login"><img id="profile-icon" src="/src/assets/profile.png" alt="Profile" class="profile-icon"></a>
            </div>
        </nav>
        <div class="content">
            <div class="coptify-playlists-container">
                <h1>Coptify Playlists</h1>
                <div id="coptify-playlists" class="coptify-playlists">
                </div>
            </div>
        </div>
    `;
    getCoptifyPlaylists();
};

async function getCoptifyPlaylists() {
    const coptifyPlaylists = document.getElementById('coptify-playlists')

    try {
        const response = await fetch('/api/getCoptifyPlaylists', {
            method: 'GET'
        });
        const responseJSON = await response.json();

        if (!response.ok) {
            alert(responseJSON.message);
        } else {
            for (var key in responseJSON) {
                coptifyPlaylists.insertAdjacentHTML('beforeend', `
                <div id="${key}" class="content-item" onclick="window.location='/playlist/${key}';">
                    <img src='/src/assets/playlists/${key}.jpg'>
                    <h2>${responseJSON[key]['name']}</h2>
                    <h3>${responseJSON[key]['curator']}</h3>
                </div>
                `);
            };
        };
    } catch (error) {
        alert('Could not retrieve data');
        console.log(error);
    };
};