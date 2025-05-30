import { initPlayer } from "./player.js";
import { initRouter } from "./router.js";

document.addEventListener('DOMContentLoaded', () => {
    initRouter();
    initPlayer();
});