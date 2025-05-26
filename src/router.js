import { renderHome } from './views/home.js';
import { renderLogin } from './views/login.js';
import { renderSignup } from './views/signup.js';

const routes = {
    '/': renderHome,
    '/home': renderHome,
    '/signup': renderSignup,
    '/login': renderLogin
};

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
    if (routes[path]) {
        document.getElementById('content').innerHTML = '';
        routes[path](path);
        return;
    };
};