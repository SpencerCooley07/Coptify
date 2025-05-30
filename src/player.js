let audio = null;
let currentSong = null;

export function initPlayer() {
    const container = document.getElementById('player');
    container.innerHTML = `
        <button class="media-button" id="prev-btn">⏮</button>
        <button class="media-button" id="play-btn">▶️</button>
        <button class="media-button" id="next-btn">⏭</button>
        <input type="range" id="progress" value="0" min="0" max="100">
        <input type="range" id="volume" value="100" min="0" max="100">
    `;

    audio = new Audio();
    audio.volume = 1.0;

    document.getElementById('play-btn').addEventListener('click', togglePlay);
    document.getElementById('volume').addEventListener('input', e => {
        audio.volume = e.target.value / 100;
    });

    audio.addEventListener('timeupdate', updateProgress);
    document.getElementById('progress').addEventListener('input', seek);
};

function togglePlay() {
    if (!audio.src) return;
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    };
};

function updateProgress() {
    document.getElementById('progress').value = (audio.currentTime / audio.duration) * 100 || 0;
};

function seek(e) {
    if (!audio.duration) return;
    audio.currentTime = (e.target.value / 100) * audio.duration;
};

export function loadSong(songID) {
    console.log(songID);
    // currentSong = song;
    // audio.src = `/static/assests/songs/${song.id}.mp3`;
    // audio.play();
};