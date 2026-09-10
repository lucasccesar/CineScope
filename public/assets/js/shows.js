const upper = document.getElementById('upper');
const movies = document.getElementById('movies');
const lower = document.getElementById('lower');
const btns = document.querySelectorAll('#suggestions .btn');
const body = document.querySelector('body');
btns.forEach((e) => {
    e.addEventListener('click', mudar);
});
var width = body.offsetWidth;
var height = body.offsetHeight;
var ms = 0;
var currentSuggestion = 0;
const trending = document.getElementById('trending');
const trendingMovies = document.getElementById('trendingMovies');
var resultsImgs = [];
const genresArray = ['Action', 'Romance', 'Adventure', 'Family', 'Comedy', 'Science Fiction'];
let startPoint = 0;
let drag = 0;
let slider = document.querySelector('#movies');
let currentMovie = 0;
var genresMovies = document.querySelectorAll('.genresMovies');

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
    const [discover, genresObject] = await Promise.all([
        fetch(`${TMDB_API_URL}/trending/tv/day?language=en-US`, options).then((response) => response.json()),
        fetch(`${TMDB_API_URL}/genre/tv/list?language=en`, options).then((response) => response.json()),
    ]);
    var trendingResults = discover.results;
    var discoverOrder = [...discover.results].sort((a, b) => Number(b.vote_count) - Number(a.vote_count));
    var genresObjectResults = genresObject.genres;

    for (let i = discoverOrder.length; i > 4; i--) {
        discoverOrder.pop();
    }

    discoverOrder.forEach((movie) => {
        let fundo = document.createElement('div');
        fundo.classList.add('fundo');
        let filme = document.createElement('div');
        filme.classList.add('filme');
        filme.style.backgroundImage = `-webkit-linear-gradient(bottom, rgb(5, 21, 30) 0%, rgba(0, 0, 0, 0) 30%) ,url(${HERO_IMG_URL + movie.backdrop_path})`;
        filme.innerHTML = `
        <div class='info'>
            <div class='infoInner'>
                <p class="title">${movie.name}</p>
                <p class="description">${movie.overview}</p>
                <button class="btnWatch" data-id="${movie.id}"><span class="material-symbols-rounded" id="play_arrow">play_arrow</span>Watch Movie</button>
            </div>
        </div>
        <div class='infoMobile'>
            <div class='infoInner'>
                <p class="title">${movie.name}</p>
                <button class="btnWatch" data-id="${movie.id}" data-type="${movie.media_type}"><span class="material-symbols-rounded" id="play_arrow">play_arrow</span></button>
            </div>
        </div>
        `;

        fundo.appendChild(filme);
        movies.appendChild(fundo);
        if (movie == discoverOrder[3]) {
            let fundo = document.createElement('div');
            fundo.classList.add('fundo');
            let filme = document.createElement('div');
            filme.classList.add('filme');
            filme.style.backgroundImage = `-webkit-linear-gradient(bottom, rgb(5, 21, 30) 0%, rgba(0, 0, 0, 0) 30%) ,url(${HERO_IMG_URL + discoverOrder[0].backdrop_path})`;
            filme.innerHTML = `
            <div class='info'>
                <div class='infoInner'>
                    <p class="title">${discoverOrder[0].name}</p>
                    <p class="description">${discoverOrder[0].overview}</p>
                    <button class="btnWatch" data-id="${movie.id}"><span class="material-symbols-rounded" id="play_arrow">play_arrow</span>Watch Movie</button>
                </div>
            </div>
            <div class='infoMobile'>
                <div class='infoInner'>
                    <p class="title">${movie.name}</p>
                    <button class="btnWatch" data-id="${movie.id}" data-type="${movie.media_type}"><span class="material-symbols-rounded" id="play_arrow">play_arrow</span></button>
                </div>
            </div>
            `;

            fundo.appendChild(filme);
            movies.appendChild(fundo);
        }
    });

    let div = document.createElement('div');
    div.classList.add('moviesWrapper');
    for (let i = 0; i < trendingResults.length; i++) {
        let divMovies = document.createElement('div');
        divMovies.classList.add('movie');
        divMovies.addEventListener('click', openR);
        divMovies.dataset.id = `${trendingResults[i].id}`;
        divMovies.dataset.type = trendingResults[i].media_type;
        let movieImgCount = 0;
        let movieImg = await fetch(`${TMDB_API_URL}/${trendingResults[i].media_type}/${trendingResults[i].id}/images`, options).then((response) => response.json());
        for (let i = 0; i < movieImg.backdrops.length; i++) {
            if (movieImg.backdrops[i].iso_639_1 == 'en' && movieImgCount == 0 && movieImg.backdrops.length > 0) {
                movieImgCount = 1;
                movieImgPath = movieImg.backdrops[i].file_path;
            }
        }
        if (movieImgCount == 0 && movieImg.backdrops.length > 0) {
            movieImgPath = movieImg.backdrops[0].file_path;
        }
        divMovies.innerHTML = `
                <div class="movieBackdrop">${createLazyImageMarkup(IMG_URL + movieImgPath)}</div>
                <div class="movieInfo"><p class="title">${
                    trendingResults[i].title != undefined ? trendingResults[i].title : trendingResults[i].name
                }</p><svg xmlns="http://www.w3.org/2000/svg" height="2rem" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><style>svg{fill:#ffffff}</style><path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/></svg></div>
                `;
        div.appendChild(divMovies);
    }
    document.getElementById('trendingMovies').appendChild(div);

    Object.keys(genresObjectResults).forEach(function (key) {
        let divGenre = document.createElement('div');
        divGenre.classList.add('genres');
        divGenre.innerHTML = `
        <div class="genresUpper">
        <div class="genreDiv">
            <div class="genreAbsolute" data-genre-id="${genresObject.genres[key].id}" data-genre-name="${genresObject.genres[key].name}"></div>
            <div class="centerText">
                <p>${genresObjectResults[key].name}</p>
                <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24"><path d="M6.75 21.5q-.525-.525-.525-1.288 0-.762.525-1.287L13.675 12l-6.95-6.95q-.525-.525-.537-1.275-.013-.75.537-1.3.525-.525 1.287-.525.763 0 1.288.525l8.425 8.425q.225.225.337.512.113.288.113.588t-.113.587q-.112.288-.337.513L9.3 21.525q-.525.525-1.262.525-.738 0-1.288-.55Z" /></svg>  
            </div>
            <div class="genreBar"></div>
            </div>
            <div class="pageCount">
                <div class="pageCounts selecionada"></div>
                <div class="pageCounts"></div>
                <div class="pageCounts"></div>
                <div class="pageCounts"></div>
                <div class="pageCounts"></div>
            </div>
            <div class="scrollPositionWrapper">
                <div class="scrollPosition"></div>
            </div> 
        </div>
        <div class="genresLower">
            <button class="pass previous hidden"><span class="material-symbols-rounded" style="font-size: 70px"> arrow_back_ios </span></button>
            <div data-genre="${genresObject.genres[key].name}" class="genresMovies" data-current-count="0"></div>
            <button class="pass next hidden"><span class="material-symbols-rounded" style="font-size: 70px"> arrow_forward_ios </span></button>
        </div>
        `;

        lower.appendChild(divGenre);
        let genresMovies = document.querySelectorAll('.genresMovies');
        showMovies(genresObjectResults[key].name, key, genresMovies[parseInt(key) + 1], genresObjectResults[key].id);
    });

    var btns = document.querySelectorAll('.btnWatch');
    btns.forEach((btn) => {
        btn.addEventListener('click', openR);
    });

    let genresLower = document.querySelectorAll('.genresLower');
    genresLower.forEach((e) => {
        e.addEventListener('mouseenter', hoverEnter);
        e.addEventListener('mouseleave', hoverLeave);
    });

    var next = document.querySelectorAll('.next');
    next.forEach((btn) => {
        btn.addEventListener('click', nextAction);
    });
    var previous = document.querySelectorAll('.previous');
    previous.forEach((btn) => {
        btn.addEventListener('click', previousAction);
    });

    var moviesDiv = document.querySelectorAll('.movie');
    moviesDiv.forEach((movie) => {
        movie.addEventListener('click', openR);
    });

    var genreAbsolute = document.querySelectorAll('.genreAbsolute');
    genreAbsolute.forEach((element) => {
        element.addEventListener('mouseenter', hoverGenre);
        element.addEventListener('mouseleave', leaveGenre);
        element.addEventListener('click', openGenre);
    });

    setInterval(constant, 1);

    slider.addEventListener('touchstart', onTouchStart);
    slider.addEventListener('touchend', onTouchEnd);
}

function onTouchStart(event) {
    slider.classList.remove('delay');
    startPoint = event.touches[0].clientX;
    slider.addEventListener('touchmove', onTouchMove);
}

function onTouchMove(event) {
    if (event.touches[0].clientX - startPoint < 0 && currentMovie < 3) {
        slider.style.transform = `translateX(${event.touches[0].clientX - startPoint - slider.offsetWidth * currentMovie}px)`;
    } else if (event.touches[0].clientX - startPoint > 0 && currentMovie > 0) {
        slider.style.transform = `translateX(${event.touches[0].clientX - startPoint - slider.offsetWidth * currentMovie}px)`;
    }
    drag = event.touches[0].clientX - startPoint;
}

function onTouchEnd(event) {
    let sliderPosition = document.querySelectorAll('.btn');
    slider.removeEventListener('touchmove', onTouchMove);
    if (drag < -120 && currentMovie < 3) {
        slider.classList.add('delay');
        slider.style.transform = `translateX(-${100 * (currentMovie + 1)}vw)`;
        sliderPosition[currentMovie].classList.remove('currentBtn');
        sliderPosition[currentMovie + 1].classList.add('currentBtn');
        currentMovie++;
    } else if (drag > 120 && currentMovie > 0) {
        slider.classList.add('delay');
        slider.style.transform = `translateX(-${100 * (currentMovie - 1)}vw)`;
        sliderPosition[currentMovie].classList.remove('currentBtn');
        sliderPosition[currentMovie - 1].classList.add('currentBtn');
        currentMovie--;
    } else {
        slider.classList.add('delay');
        slider.style.transform = `translateX(-${100 * currentMovie}vw)`;
    }
}

function openGenre(event) {
    let genreId = event.target.dataset.genreId;
    let genreName = event.target.dataset.genreName;
    site = '/pages/movie-genre.html?id=' + genreId + '&type=tv' + '&genre=' + genreName;
    window.location.href = site;
}

async function showMovies(genre, index, element, genreId, type) {
    let results = await fetch(`${TMDB_API_URL}/discover/tv?sort_by=vote_count.desc&with_genres=${genreId}`, options)
        .then((response) => response.json())
        .then((response) => response.results);

    let div = document.createElement('div');
    div.classList.add('moviesWrapper');
    for (let i = 0; i < results.length; i++) {
        let divMovies = document.createElement('div');
        divMovies.classList.add('movie');
        divMovies.addEventListener('click', openR);
        divMovies.dataset.id = `${results[i].id}`;
        divMovies.dataset.type = 'movie';
        let movieImgCount = 0;
        let movieImg = await fetch(`${TMDB_API_URL}/tv/${results[i].id}/images`, options).then((response) => response.json());
        for (let i = 0; i < movieImg.backdrops.length; i++) {
            if (movieImg.backdrops[i].iso_639_1 == 'en' && movieImgCount == 0 && movieImg.backdrops.length > 0) {
                movieImgCount = 1;
                movieImgPath = movieImg.backdrops[i].file_path;
            }
        }
        if (movieImgCount == 0 && movieImg.backdrops.length > 0) {
            movieImgPath = movieImg.backdrops[0].file_path;
        }
        divMovies.innerHTML = `
                <div class="movieBackdrop">${createLazyImageMarkup(IMG_URL + movieImgPath)}</div>
                <div class="movieInfo"><p class="title">${
                    results[i].title != undefined ? results[i].title : results[i].name
                }</p><svg xmlns="http://www.w3.org/2000/svg" height="2rem" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><style>svg{fill:#ffffff}</style><path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/></svg></div>
                `;
        div.appendChild(divMovies);
    }
    element.appendChild(div);
}

function hoverGenre(event) {
    event.target.parentElement.lastElementChild.style.width = '100%';
}

function leaveGenre(event) {
    event.target.parentElement.lastElementChild.style.width = '0px';
}

function nextAction(event) {
    let divInfo = event.target.innerHTML != ' arrow_forward_ios ' ? event.target.parentElement.children[1] : event.target.parentElement.parentElement.children[1];
    if (divInfo.dataset.currentCount < 5) {
        divInfo.dataset.currentCount++;
        divInfo.firstElementChild.style.transform = `translateX(${-1 * parseInt(divInfo.dataset.currentCount) * 81.5}vw)`;
        divInfo.parentElement.children[0].classList.replace('hidden', 'visible');
        if (divInfo.dataset.currentCount == 4) {
            divInfo.parentElement.children[2].classList.replace('visible', 'hidden');
        }
    }
    divInfo.parentElement.previousElementSibling.children[1].children[parseInt(divInfo.dataset.currentCount) - 1].classList.remove('selecionada');
    divInfo.parentElement.previousElementSibling.children[1].children[divInfo.dataset.currentCount].classList.add('selecionada');
}

function previousAction(event) {
    let divInfo = event.target.innerHTML != ' arrow_back_ios ' ? event.target.parentElement.children[1] : event.target.parentElement.parentElement.children[1];
    if (divInfo.dataset.currentCount > 0) {
        divInfo.dataset.currentCount--;
        divInfo.firstElementChild.style.transform = `translateX(${-1 * parseInt(divInfo.dataset.currentCount) * 81.5}vw)`;
        divInfo.parentElement.children[2].classList.replace('hidden', 'visible');
        if (divInfo.dataset.currentCount == 0) {
            divInfo.parentElement.children[0].classList.replace('visible', 'hidden');
        }
    }
    divInfo.parentElement.previousElementSibling.children[1].children[parseInt(divInfo.dataset.currentCount) + 1].classList.remove('selecionada');
    divInfo.parentElement.previousElementSibling.children[1].children[divInfo.dataset.currentCount].classList.add('selecionada');
}

function hoverEnter(event) {
    if (event.target.children[1].dataset.currentCount > 0) {
        event.target.children[0].classList.replace('hidden', 'visible');
    }
    if (event.target.children[1].dataset.currentCount < 4) {
        event.target.children[2].classList.replace('hidden', 'visible');
    }
}

function hoverLeave(event) {
    event.target.children[0].classList.replace('visible', 'hidden');
    event.target.children[2].classList.replace('visible', 'hidden');
}

function openR(event) {
    if (event.target.dataset.id != undefined) {
        movieId = event.target.dataset.id;
        site = '/pages/watch-shows.html?id=' + movieId;
        window.location.href = site;
    } else {
        movieId = event.target.parentElement.dataset.id;
        site = '/pages/watch-shows.html?id=' + movieId;
        window.location.href = site;
    }
}

function scrollHandler(e) {
    let porcentagem = (e.scrollWidth - e.offsetWidth) / 100;
    e.parentElement.previousElementSibling.lastElementChild.firstElementChild.style.left = `${e.scrollLeft / porcentagem}%`;
}

function constant() {
    genresMovies = document.querySelectorAll('.genresMovies');
    genresMovies.forEach((e) => {
        e.addEventListener('scroll', scrollHandler(e));
    });
    width = body.offsetWidth;
    let movieSla = movies.getBoundingClientRect();

    if (movieSla.left == -(window.innerWidth * 4)) {
        let loading = document.querySelector('.btnLoading');
        movies.classList.remove('delay');
        loading.classList.remove('btnLoading');
        movies.style.transform = `translateX(0rem)`;
        btns[0].firstElementChild.classList.add('btnLoading');
    }
    ms++;
    var loading = document.querySelector('.btnLoading');
    loading.style.width = `${ms / 15}%`;
    if (ms / 15 == 100) {
        ms = 0;
        if (window.getComputedStyle(document.getElementById('suggestions')).getPropertyValue('display') != 'none') {
            trocar();
        }
    }
}

async function mudar(event) {
    const fundos = document.querySelectorAll('.fundo');
    let loading = document.querySelector('.btnLoading');
    if (event.target.firstElementChild != null && event.target.firstElementChild.classList[0] != 'btnLoading') {
        for (let i = 0; i < 4; i++) {
            if (event.target == btns[i] || event.target.parentElement == btns[i]) {
                movies.classList.add('delay');
                movies.style.transform = `translateX(${-1 * i * 100}vw)`;
                currentSuggestion = i;
            }
            if (event.target == btns[i]) {
                event.target.firstElementChild.classList.add('btnLoading');
                loading.classList.remove('btnLoading');
                ms = 0;
            } else if (event.target.parentElement == btns[i]) {
                event.target.classList.add('btnLoading');
                loading.classList.remove('btnLoading');
                ms = 0;
            }
        }
    } else if (event.target.classList[0] == 'btnLoading' || event.target.firstElementChild.classList[0] == 'btnLoading') {
        ms = 0;
    }
}

function trocar() {
    const fundos = document.querySelectorAll('.fundo');
    currentSuggestion++;
    let loading = document.querySelector('.btnLoading');
    if (currentSuggestion == 4) {
        btns[0].firstElementChild.classList.add('btnLoading');
        loading.classList.remove('btnLoading');
        movies.style.transform = `translateX(-${100 * currentSuggestion}vw)`;
        currentSuggestion = 0;
    } else if (loading.parentElement.nextElementSibling != null) {
        movies.classList.add('delay');
        loading.style.width = `0%`;
        loading.parentElement.nextElementSibling.firstElementChild.classList.add('btnLoading');
        loading.classList.remove('btnLoading');
        movies.style.transform = `translateX(-${100 * currentSuggestion}vw)`;
    }
}

main();
