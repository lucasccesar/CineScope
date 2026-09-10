const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { URL } = require('node:url');

const PORT = Number(process.env.PORT || 3000);
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_PROXY_PREFIX = '/api/tmdb';
const PUBLIC_DIRECTORY = path.join(__dirname, 'public');

function createTmdbRequest(requestPath, environment = process.env) {
    if (typeof requestPath !== 'string' || !requestPath.startsWith('/')) {
        throw new Error('TMDB request path must start with /');
    }

    const [pathname, search = ''] = requestPath.split('?');
    const relativePath = pathname.replace(/^\/+/, '');

    if (!relativePath || relativePath.includes('..') || !/^[a-z0-9_/-]+$/i.test(relativePath)) {
        throw new Error('Invalid TMDB request path');
    }

    const url = new URL(`${TMDB_BASE_URL}/${relativePath}`);
    url.search = search ? `?${search}` : '';
    url.searchParams.delete('api_key');

    const accessToken = environment.TMDB_ACCESS_TOKEN?.trim();
    const apiKey = environment.TMDB_API_KEY?.trim();

    if (!accessToken && !apiKey) {
        throw new Error('Configure TMDB_ACCESS_TOKEN or TMDB_API_KEY in the environment');
    }

    const headers = { accept: 'application/json' };
    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    } else {
        url.searchParams.set('api_key', apiKey);
    }

    return {
        url: url.toString(),
        options: { method: 'GET', headers },
    };
}

function sendJson(response, statusCode, body) {
    response.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify(body));
}

async function proxyTmdbRequest(request, response, environment) {
    try {
        const requestUrl = new URL(request.url, 'http://localhost');
        const requestPath = requestUrl.pathname.slice(TMDB_PROXY_PREFIX.length) || '/';
        const { url, options } = createTmdbRequest(`${requestPath}${requestUrl.search}`, environment);
        const tmdbResponse = await fetch(url, options);
        const body = Buffer.from(await tmdbResponse.arrayBuffer());

        response.writeHead(tmdbResponse.status, {
            'content-type': tmdbResponse.headers.get('content-type') || 'application/json; charset=utf-8',
        });
        response.end(body);
    } catch (error) {
        const statusCode = error.message.startsWith('Configure TMDB') ? 500 : 400;
        sendJson(response, statusCode, { error: error.message });
    }
}

function contentType(filePath) {
    return {
        '.css': 'text/css; charset=utf-8',
        '.html': 'text/html; charset=utf-8',
        '.js': 'text/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.svg': 'image/svg+xml',
    }[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

function serveStatic(request, response, publicDirectory) {
    const requestUrl = new URL(request.url, 'http://localhost');
    const segments = decodeURIComponent(requestUrl.pathname).split('/').filter(Boolean);

    if (segments.some((segment) => segment.startsWith('.'))) {
        response.writeHead(404);
        response.end('Not found');
        return;
    }

    const relativePath = segments.length === 0 ? 'index.html' : path.join(...segments);
    const rootDirectory = publicDirectory;
    const filePath = path.resolve(rootDirectory, relativePath);

    if (filePath !== rootDirectory && !filePath.startsWith(`${rootDirectory}${path.sep}`)) {
        response.writeHead(403);
        response.end('Forbidden');
        return;
    }

    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        response.writeHead(404);
        response.end('Not found');
        return;
    }

    response.writeHead(200, { 'content-type': contentType(filePath) });
    fs.createReadStream(filePath).pipe(response);
}

function createServer(environment = process.env, publicDirectory = PUBLIC_DIRECTORY) {
    return http.createServer((request, response) => {
        if (request.method !== 'GET') {
            response.writeHead(405, { allow: 'GET' });
            response.end('Method not allowed');
            return;
        }

        const requestPathname = new URL(request.url, 'http://localhost').pathname;
        if (requestPathname === TMDB_PROXY_PREFIX || requestPathname.startsWith(`${TMDB_PROXY_PREFIX}/`)) {
            proxyTmdbRequest(request, response, environment);
            return;
        }

        serveStatic(request, response, publicDirectory);
    });
}

if (require.main === module) {
    createServer().listen(PORT, () => {
        console.log(`CineScope running at http://localhost:${PORT}`);
    });
}

module.exports = { createServer, createTmdbRequest };
