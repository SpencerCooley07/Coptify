import { renderHome } from './views/home.js';
import { renderProfile } from './views/profile.js';
import { renderLogin } from './views/login.js';
import { renderSignup } from './views/signup.js';
import { render404 } from './views/404.js';
import { renderPlaylist } from './views/playlist.js';

const routes = [
    { path: /^\/$/, render: renderHome },
    { path: /^\/home$/, render: renderHome },
    { path: /^\/profile$/, render: renderProfile },
    { path: /^\/signup$/, render: renderSignup },
    { path: /^\/login$/, render: renderLogin },
    { path: /^\/playlist\/([^/]+)$/, render: renderPlaylist },
];

export function initRouter() {
    window.addEventListener('popstate', handleRoute);
    document.body.addEventListener('click', interceptLinks);
    handleRoute();
};

function interceptLinks(event) {
    const link = event.target.closest('a');
    if (link && link.getAttribute('href').startsWith('/')) {
        event.preventDefault();
        history.pushState(null, '', link.href);
        handleRoute();
    };
};

function handleRoute() {
    const path = window.location.pathname;
    document.getElementById('page').innerHTML = '';

    for (const route of routes) {
        const match = path.match(route.path);
        if (match) {
            const params = match.slice(1);
            route.render(...params);
            return;
        };
    };
    render404();
};