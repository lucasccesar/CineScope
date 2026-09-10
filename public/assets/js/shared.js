const TMDB_API_URL = '/api/tmdb';
const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p';
const IMG_URL = `${TMDB_IMAGE_URL}/w780`;
const HERO_IMG_URL = `${TMDB_IMAGE_URL}/w1280`;
const DETAIL_IMG_URL = `${TMDB_IMAGE_URL}/w1280`;
const PROFILE_IMG_URL = `${TMDB_IMAGE_URL}/w185`;
const POSTER_IMG_URL = `${TMDB_IMAGE_URL}/w342`;
const EPISODE_IMG_URL = `${TMDB_IMAGE_URL}/w780`;

const options = Object.freeze({
    method: 'GET',
    headers: Object.freeze({ accept: 'application/json' }),
});

function escapeAttribute(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/'/g, '&#39;');
}

function createLazyImageMarkup(src, alt = '', className = '') {
    const classAttribute = className ? ` class="${escapeAttribute(className)}"` : '';
    return `<img${classAttribute} src="${escapeAttribute(src)}" alt="${escapeAttribute(alt)}" loading="lazy" decoding="async">`;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createLazyImageMarkup };
}
