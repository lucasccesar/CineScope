# CineScope

Aplicação web para descobrir filmes e séries usando a API do The Movie Database (TMDB).

## Requisitos

- Node.js 24+
- Um token de leitura ou uma API key do TMDB

## Configuração

1. Copie o arquivo de exemplo:

   ```powershell
   Copy-Item .env.example .env
   ```

2. Preencha `TMDB_ACCESS_TOKEN` no arquivo `.env`.

   `TMDB_API_KEY` também é aceito como alternativa.

## Executar

```powershell
npm start
```

A aplicação ficará disponível em `http://localhost:3000`.

## Testes

```powershell
npm test
```

Os testes verificam o proxy TMDB, a ausência de credenciais no frontend, a estrutura pública e o helper de imagens lazy.

## Estrutura

```text
public/
├── index.html
├── pages/              # páginas HTML
└── assets/
    ├── css/            # estilos
    └── js/             # scripts e cliente compartilhado
server.js               # servidor estático e proxy TMDB
api/tmdb/[...path].mjs  # proxy TMDB como Vercel Function
test/                   # testes automatizados
```

O frontend acessa o TMDB através de `/api/tmdb`. As credenciais ficam somente no servidor, carregadas por variáveis de ambiente.

## Deploy na Vercel

Configure `TMDB_ACCESS_TOKEN` nos ambientes Production e Preview. A pasta `api/` contém o proxy serverless usado pela Vercel; depois de alterar variáveis de ambiente, crie um novo deploy.

## Segurança

Não commite `.env` nem credenciais. Como as credenciais antigas já foram expostas, revogue-as no TMDB e gere novas antes de publicar a aplicação.
