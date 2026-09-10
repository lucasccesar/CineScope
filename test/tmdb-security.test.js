const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');

const projectRoot = path.resolve(__dirname, '..');
const frontendFiles = [
    path.join('public', 'assets', 'js', 'home.js'),
    ...fs
        .readdirSync(path.join(projectRoot, 'public', 'assets', 'js'))
        .filter((file) => file !== 'home.js')
        .filter((file) => file.endsWith('.js'))
        .map((file) => path.join('public', 'assets', 'js', file)),
];

test('frontend code does not expose TMDB credentials or call TMDB directly', () => {
    const source = frontendFiles.map((file) => fs.readFileSync(path.join(projectRoot, file), 'utf8')).join('\n');

    assert.doesNotMatch(source, /Authorization\s*:\s*['"]Bearer\s+/i);
    assert.doesNotMatch(source, /api_key\s*=/i);
    assert.doesNotMatch(source, /api\.themoviedb\.org\/3/i);
});

test('TMDB proxy request uses the access token from the environment', () => {
    const { createTmdbRequest } = require('../server');
    const request = createTmdbRequest('/movie/550?language=en-US', {
        TMDB_ACCESS_TOKEN: 'access-token-from-env',
    });

    assert.equal(request.url, 'https://api.themoviedb.org/3/movie/550?language=en-US');
    assert.equal(request.options.headers.Authorization, 'Bearer access-token-from-env');
    assert.equal(request.options.headers.accept, 'application/json');
    assert.doesNotMatch(request.url, /api_key=/i);
});

test('TMDB proxy request can use the API key from the environment', () => {
    const { createTmdbRequest } = require('../server');
    const request = createTmdbRequest('/genre/movie/list?language=en', {
        TMDB_API_KEY: 'api-key-from-env',
    });

    assert.equal(request.url, 'https://api.themoviedb.org/3/genre/movie/list?language=en&api_key=api-key-from-env');
    assert.equal(request.options.headers.Authorization, undefined);
});

test('Vercel function proxies TMDB requests with server-side credentials', async () => {
    const previousToken = process.env.TMDB_ACCESS_TOKEN;
    const previousFetch = globalThis.fetch;
    let capturedRequest;

    process.env.TMDB_ACCESS_TOKEN = 'access-token-from-env';
    globalThis.fetch = async (url, options) => {
        capturedRequest = { url, options };
        return new Response(JSON.stringify({ results: [] }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
        });
    };

    try {
        const functionUrl = pathToFileURL(path.join(projectRoot, 'api', 'tmdb', '[...path].mjs')).href;
        const { default: handler } = await import(`${functionUrl}?test=${Date.now()}`);
        const response = await handler(
            new Request('https://cinescope.test/api/tmdb/trending/movie/day?language=en-US'),
        );

        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), { results: [] });
        assert.equal(capturedRequest.url, 'https://api.themoviedb.org/3/trending/movie/day?language=en-US');
        assert.equal(capturedRequest.options.headers.Authorization, 'Bearer access-token-from-env');
    } finally {
        globalThis.fetch = previousFetch;
        if (previousToken === undefined) {
            delete process.env.TMDB_ACCESS_TOKEN;
        } else {
            process.env.TMDB_ACCESS_TOKEN = previousToken;
        }
    }
});

test('server serves the organized frontend structure from public', async (t) => {
    const { createServer } = require('../server');
    const server = createServer({});
    await new Promise((resolve) => server.listen(0, resolve));
    t.after(() => server.close());

    const port = server.address().port;
    const home = await fetch(`http://127.0.0.1:${port}/`);
    const moviesPage = await fetch(`http://127.0.0.1:${port}/pages/movies.html`);

    assert.equal(home.status, 200);
    assert.match(await home.text(), /<title>CineScope<\/title>/i);
    assert.equal(moviesPage.status, 200);
    assert.match(await moviesPage.text(), /<script src="\.\.\/assets\/js\/movies\.js"><\/script>/i);
});

test('lazy image markup defers offscreen images and escapes attributes', () => {
    const { createLazyImageMarkup } = require('../public/assets/js/shared');
    const markup = createLazyImageMarkup('/poster.jpg?size=1&mode=cover', 'A "great" movie');

    assert.equal(
        markup,
        '<img src="/poster.jpg?size=1&amp;mode=cover" alt="A &quot;great&quot; movie" loading="lazy" decoding="async">',
    );
});
