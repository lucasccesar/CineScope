import { createTmdbRequest } from '../../server.js';

const TMDB_PROXY_PREFIX = '/api/tmdb';

export default async function handler(request) {
    if (request.method !== 'GET') {
        return Response.json(
            { error: 'Method not allowed' },
            { status: 405, headers: { Allow: 'GET' } },
        );
    }

    try {
        const requestUrl = new URL(request.url);
        const requestPath = requestUrl.pathname.slice(TMDB_PROXY_PREFIX.length) || '/';
        const { url, options } = createTmdbRequest(`${requestPath}${requestUrl.search}`, process.env);
        const tmdbResponse = await fetch(url, options);
        const body = await tmdbResponse.arrayBuffer();

        return new Response(body, {
            status: tmdbResponse.status,
            headers: {
                'content-type': tmdbResponse.headers.get('content-type') || 'application/json; charset=utf-8',
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'TMDB proxy request failed';
        const statusCode = message.startsWith('Configure TMDB') ? 500 : 400;
        return Response.json({ error: message }, { status: statusCode });
    }
}
