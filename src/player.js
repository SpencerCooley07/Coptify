let audio = null;
let progressSlider = null;
let volumeSlider = null;
let playButton = null;
let progressLabel = null;
let durationLabel = null;
let likeButton = null;

let isDragging = false;
let isLiked = false;
let currentSongID = null;

const ICONS = {
    play: `
        <svg viewBox="0 0 24 20" width="20" height="20" fill="none"><path d="M16.6582 9.28638C18.098 10.1862 18.8178 10.6361 19.0647 11.2122C19.2803 11.7152 19.2803 12.2847 19.0647 12.7878C18.8178 13.3638 18.098 13.8137 16.6582 14.7136L9.896 18.94C8.29805 19.9387 7.49907 20.4381 6.83973 20.385C6.26501 20.3388 5.73818 20.0469 5.3944 19.584C5 19.053 5 18.1108 5 16.2264V7.77357C5 5.88919 5 4.94701 5.3944 4.41598C5.73818 3.9531 6.26501 3.66111 6.83973 3.6149C7.49907 3.5619 8.29805 4.06126 9.896 5.05998L16.6582 9.28638Z" stroke-width="2" stroke-linejoin="round"/></svg>
    `,
    pause: `
        <svg viewBox="0 0 24 20" width="20" height="20" fill="none"><path d="M8 5V19M16 5V19" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    `,
    prev: `
        <svg viewBox="0 0 24 20" width="20" height="20" fill="none"><path d="M7 5V19M17 7.329V16.671C17 17.7367 17 18.2695 16.7815 18.5432C16.5916 18.7812 16.3035 18.9197 15.9989 18.9194C15.6487 18.919 15.2327 18.5861 14.4005 17.9204L10.1235 14.4988C9.05578 13.6446 8.52194 13.2176 8.32866 12.7016C8.1592 12.2492 8.1592 11.7508 8.32866 11.2984C8.52194 10.7824 9.05578 10.3554 10.1235 9.50122L14.4005 6.07961C15.2327 5.41387 15.6487 5.081 15.9989 5.08063C16.3035 5.0803 16.5916 5.21876 16.7815 5.45677C17 5.73045 17 6.2633 17 7.329Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    `,
    next: `
        <svg viewBox="0 0 24 20" width="20" height="20" fill="none"><path d="M17 5V19M7 7.329V16.671C7 17.7367 7 18.2695 7.21846 18.5432C7.40845 18.7812 7.69654 18.9197 8.00108 18.9194C8.35125 18.919 8.76734 18.5861 9.59951 17.9204L13.8765 14.4988C14.9442 13.6446 15.4781 13.2176 15.6713 12.7016C15.8408 12.2492 15.8408 11.7508 15.6713 11.2984C15.4781 10.7824 14.9442 10.3554 13.8765 9.50122L9.59951 6.07961C8.76734 5.41387 8.35125 5.081 8.00108 5.08063C7.69654 5.0803 7.40845 5.21876 7.21846 5.45677C7 5.73045 7 6.2633 7 7.329Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    `,
    heart: `
        <svg viewBox="-2 -4 20 20" width="20" height="20" fill="none"><path d="M1.24264 8.24264L8 15L14.7574 8.24264C15.553 7.44699 16 6.36786 16 5.24264V5.05234C16 2.8143 14.1857 1 11.9477 1C10.7166 1 9.55233 1.55959 8.78331 2.52086L8 3.5L7.21669 2.52086C6.44767 1.55959 5.28338 1 4.05234 1C1.8143 1 0 2.8143 0 5.05234V5.24264C0 6.36786 0.44699 7.44699 1.24264 8.24264Z" stroke-width="2"/></svg>
    `
};

export function initPlayer() {
    const container = document.getElementById('player');
    container.innerHTML = `
        <div class="player-ui">
            <div class="controls">
                <button class="media-button" id="prev-btn" title="Previous">${ICONS.prev}</button>
                <button class="media-button" id="play-btn" title="Play/Pause">${ICONS.play}</button>
                <button class="media-button" id="next-btn" title="Next">${ICONS.next}</button>
                <button class="media-button like-button" id="like-btn" title="Like">${ICONS.heart}</button>
            </div>

            <div class="slider-container">
                <span class="progressbar-label" id="progress-label">0:00</span>
                <input type="range" id="progress" min="0" max="100" value="0" step="0.1">
                <span class="progressbar-label" id="duration-label">0:00</span>
            </div>

            <input type="range" id="volume" min="0" max="100" value="100" title="Volume">
        </div>
    `;

    audio = new Audio();
    audio.volume = 1.0;

    // Media control handlers
    progressSlider = document.getElementById('progress');
    volumeSlider = document.getElementById('volume');
    playButton = document.getElementById('play-btn');
    progressLabel = document.getElementById('progress-label');
    durationLabel = document.getElementById('duration-label');

    // Button handlers
    document.getElementById('prev-btn').addEventListener('click', () => audio.currentTime = 0);
    document.getElementById('next-btn').addEventListener('click', () => audio.currentTime = audio.duration);
    playButton.addEventListener('click', togglePlay);

    // Volume control
    volumeSlider.addEventListener('input', () => {
        audio.volume = volumeSlider.value / 100;
    });

    // Scrubbing
    progressSlider.addEventListener('mousedown', () => isDragging = true);
    progressSlider.addEventListener('touchstart', () => isDragging = true);

    progressSlider.addEventListener('input', () => {
        if (audio.duration && isDragging) {
            const time = (progressSlider.value / 100) * audio.duration;
            updateProgressLabel(time);
        }
    });

    const scrubEnd = () => {
        if (audio.duration) {
            const time = (progressSlider.value / 100) * audio.duration;
            audio.currentTime = time;
        }
        isDragging = false;
    };

    // Initialising duration label
    audio.addEventListener('loadedmetadata', () => {
        if (audio.duration) {
            const mins = Math.floor(audio.duration / 60);
            const secs = Math.floor(audio.duration % 60).toString().padStart(2, '0');
            durationLabel.textContent = `${mins}:${secs}`;
        }
    });

    progressSlider.addEventListener('mouseup', scrubEnd);
    progressSlider.addEventListener('touchend', scrubEnd);

    // Playback progress update
    audio.addEventListener('timeupdate', () => {
        if (!isDragging && audio.duration) {
            const percent = (audio.currentTime / audio.duration) * 100;
            progressSlider.value = percent;
            updateProgressLabel(audio.currentTime);
        }
    });

    // Reset play button when song ends
    audio.addEventListener('ended', () => {
        playButton.innerHTML = ICONS.play;
    });

    // Like Logic
    likeButton = document.getElementById('like-btn');
    likeButton.addEventListener('click', () => {
        if (!currentSongID) return;
        toggleLike(currentSongID);
    });


}

function togglePlay() {
    if (!audio.src) return;
    if (audio.paused) {
        audio.play();
        playButton.innerHTML = ICONS.pause;
    } else {
        audio.pause();
        playButton.innerHTML = ICONS.play;
    }
}

function updateProgressLabel(time) {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60).toString().padStart(2, '0');
    progressLabel.textContent = `${mins}:${secs}`;
}

// Song Liking Logic
async function toggleLike(songID) {
    try {
        const res = await fetch(`/api/toggleSongLike/${songID}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.token}`
            }
        });
        const json = await res.json();
        if (!res.ok) return alert(json.message);
        likeStatus(songID);
    } catch (err) {
        console.error('Error toggling like:', err);
    }
}

async function likeStatus(songID) {
    try {
        const res = await fetch(`/api/getLikeStatus/${songID}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.token}`
            }
        });
        const json = await res.json();
        if (!res.ok) return alert(json.message);
        isLiked = (json.message == "liked") ? true : false;
        updateLikeButton();
    } catch (err) {
        console.error('Error toggling like:', err);
    }
}

function updateLikeButton() {
    likeButton.querySelector('path').setAttribute('fill', isLiked ? 'var(--accent)' : 'none');
    likeButton.querySelector('path').setAttribute('stroke', isLiked ? 'var(--accent)' : '--primary-fg');
}

export function loadSong(songID) {
    currentSongID = songID;
    audio.src = `/src/assets/songs/${songID}.mp3`;
    progressSlider.value = 0;
    progressLabel.textContent = '0:00';
    durationLabel.textContent = '0:00';
    likeStatus(songID);
    audio.play();
    playButton.innerHTML = ICONS.pause;
}