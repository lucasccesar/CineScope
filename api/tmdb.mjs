import { createTmdbRequest } from '../server.js';

const TMDB_PATH_QUERY = '_tmdb_path';

export default async function handler(request, response) {
    if (request.method !== 'GET') {
        response.statusCode = 405;
        response.setHeader('Allow', 'GET');
        response.setHeader('content-type', 'application/json; charset=utf-8');
        response.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
    }

    try {
        const requestUrl = new URL(request.url, 'https://cinescope.local');
        const proxyPath = requestUrl.searchParams.get(TMDB_PATH_QUERY);
        if (!proxyPath) {
            throw new Error('TMDB request path is required');
        }

        requestUrl.searchParams.delete(TMDB_PATH_QUERY);
        const requestPath = `/${proxyPath.replace(/^\/+/, '')}`;
        const search = requestUrl.searchParams.toString();
        const { url, options } = createTmdbRequest(`${requestPath}${search ? `?${search}` : ''}`, process.env);
        const tmdbResponse = await fetch(url, options);
        const body = Buffer.from(await tmdbResponse.arrayBuffer());

        response.statusCode = tmdbResponse.status;
        response.setHeader(
            'content-type',
            tmdbResponse.headers.get('content-type') || 'application/json; charset=utf-8',
        );
        response.end(body);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'TMDB proxy request failed';
        const statusCode = message.startsWith('Configure TMDB') ? 500 : 400;
        response.statusCode = statusCode;
        response.setHeader('content-type', 'application/json; charset=utf-8');
        response.end(JSON.stringify({ error: message }));
    }
}
