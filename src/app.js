import { initPlayer } from "./player.js";
import { initRouter } from "./router.js";
export let allSongs = [];

async function preloadSongs() {
    try {
        const response = await fetch('/api/getAllSongs');
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        allSongs = data;
        console.log(allSongs);
    } catch (err) {
        console.error("Failed to preload songs", err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    preloadSongs();
    initRouter();
    initPlayer();
});