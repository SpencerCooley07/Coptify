import { renderHome } from './views/home.js';
import { renderLogin } from './views/login.js';
import { renderSignup } from './views/signup.js';
import { render404 } from './views/404.js';

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
        document.getElementById('page').innerHTML = '';
        routes[path](path);
        return;
    };

    document.getElementById('page').innerHTML = '';
    render404();
};