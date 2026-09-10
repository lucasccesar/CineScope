const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});
const genreId = params.id;
const genreName = params.genre;
const type = params.type;
const movies = document.getElementById('movies');
var page = 1;
var pageBtn = document.querySelectorAll('.pageBtn');
pageBtn.forEach((element) => {
    element.addEventListener('click', pageChange);
});
document.getElementById('genreName').innerText = `${genreName}`;
document.getElementById('back').addEventListener('click', back);
window.top.document.title = `${genreName} ${type == 'movie' ? 'Movies' : 'Shows'}`;

/*=============== SEARCH ===============*/
const search = document.getElementById('search'),
    searchBtn = document.getElementById('search-btn');

/* Search show */
searchBtn.addEventListener('click', () => {
    search.classList.add('show-search');
});

/* Search hidden */
search.addEventListener('click', (event) => {
    if (event.target == search) {
        search.classList.remove('show-search');
    }
});

async function main() {
    pageChange();
}

async function pageChange(event) {
    movies.innerHTML = '';
    if (event != undefined) {
        let selected = document.querySelector('.pageSelected');
        selected.classList.remove('pageSelected');
        event.target.classList.add('pageSelected');
        page = event.target.dataset.value;
    }
    var moviesListObj = await fetch(`${TMDB_API_URL}/discover/${type}?sort_by=vote_count.desc&with_genres=${genreId}&page=${page}`, options).then((response) => response.json());
    var moviesList = moviesListObj.results;

    for (let i = 0; i < 20; i++) {
        let divMovies = document.createElement('div');
        divMovies.classList.add('movie');
        divMovies.addEventListener('click', openR);
        divMovies.dataset.id = `${moviesList[i].id}`;
        let movieImgCount = 0;
        let movieImg = await fetch(`${TMDB_API_URL}/${type}/${moviesList[i].id}/images`, options).then((response) => response.json());
        for (let i = 0; i < movieImg.backdrops.length; i++) {
            if (movieImg.backdrops[i].iso_639_1 == 'en' && movieImgCount == 0) {
                movieImgCount = 1;
                movieImgPath = movieImg.backdrops[i].file_path;
            }
        }
        if (movieImgCount == 0) {
            movieImgPath = movieImg.backdrops[0].file_path;
        }
        divMovies.innerHTML = `
        <div class="movieBackdrop">${createLazyImageMarkup(IMG_URL + movieImgPath)}</div>
        <div class="movieInfo"><p class="title">${
            type == 'movie' ? moviesList[i].title : moviesList[i].name
        }</p><svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><style>svg{fill:#ffffff}</style><path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/></svg></div>
        `;
        movies.appendChild(divMovies);
    }
}

function back() {
    history.back();
}

function openR(event) {
    if (event.target.dataset.id != undefined) {
        movieId = event.target.dataset.id;
        site = `/pages/watch-${type == 'movie' ? 'movies' : 'shows'}.html?id=` + movieId;
        window.location.href = site;
    } else {
        movieId = event.target.parentElement.dataset.id;
        site = `/pages/watch-${type == 'movie' ? 'movies' : 'shows'}.html?id=` + movieId;
        window.location.href = site;
    }
}

main();
