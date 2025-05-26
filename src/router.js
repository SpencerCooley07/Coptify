import { renderHome } from './views/home.js';
import { renderSignup } from './views/signup.js';

const routes = {
    '/': renderHome,
    '/home': renderHome,
    '/signup': renderSignup
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
    console.log(path)

    if (routes[path]) {
        document.getElementById('content').innerHTML = '';
        console.log(routes[path])
        routes[path](path);
        return;
    };
};