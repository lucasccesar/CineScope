const bgImg = document.getElementById('bgImg');
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('id');
var diretores = [];
const diretor = document.getElementById('diretores');
const nome = document.getElementById('nome');
const generos = document.getElementById('generos');
const rating = document.getElementById('rating');
const release = document.getElementById('release');
const budget = document.getElementById('budget');
const length = document.getElementById('length');
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var mes = '';
var releaseDate = '';
var data = '';
const description = document.getElementById('description');
const cast = document.getElementById('cast');
var j = 0;
const filme = document.getElementById('filme');
const iframe = document.getElementById('iframe');
const mainHtml = document.querySelector('main');
var similarFull = [];
var similar = [];
const similarMovies = document.getElementById('similarMovies');
const avancar = document.getElementById('avancar');
const anterior = document.getElementById('anterior');
avancar.addEventListener('click', proximo);
anterior.addEventListener('click', voltar);
var current = 0;
const seasons = document.getElementById('seasons');
const episodes = document.getElementById('episodes');
var divCount = 0;
var episodesCount = 0;
var divCountFloat = 0;
var epNum = 0;
const btnEp = document.getElementById('btnEp');
btnEp.addEventListener('mouseenter', btnsAppear);
btnEp.addEventListener('mouseleave', btnsDisappear);

function btnsAppear() {
    if (current + 1 > 1 && current + 1 < Math.ceil(episodesCount / 4)) {
        avancar.classList.replace('hidden', 'visible');
        anterior.classList.replace('hidden', 'visible');
    } else if (current + 1 < Math.ceil(episodesCount / 4)) {
        avancar.classList.replace('hidden', 'visible');
    } else {
        anterior.classList.replace('hidden', 'visible');
    }
}

function btnsDisappear() {
    avancar.classList.replace('visible', 'hidden');
    anterior.classList.replace('visible', 'hidden');
}

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
    var info = await fetch(`${TMDB_API_URL}/tv/${movieId}?language=en-US`, options).then((response) => response.json());
    if (info.seasons[0].name == 'Specials') {
        var seasonsNum = info.seasons.length - 1;
    } else {
        var seasonsNum = info.seasons.length;
    }
    nome.innerText = info.name;

    seasonFunc();

    window.top.document.title = 'Watch ' + info.name;

    const [img, creditsA] = await Promise.all([
        fetch(`${TMDB_API_URL}/tv/${movieId}/images`, options).then((response) => response.json()),
        fetch(`${TMDB_API_URL}/tv/${movieId}/aggregate_credits?language=en-US`, options).then((response) => response.json()),
    ]);

    var foto = img.backdrops[0].file_path;
    var fotoLink = DETAIL_IMG_URL + foto;
    bgImg.style.backgroundImage = `-webkit-linear-gradient(bottom, rgba(5, 21, 30, 1) 0%, rgba(0, 0, 0, 0) 30%), url('${fotoLink}')`;

    if (info.seasons[0].name == 'Specials') {
        for (let i = 0; i < seasonsNum; i++) {
            var option = document.createElement('option');
            option.value = `${i + 1}`;
            option.innerHTML = `${info.seasons[i + 1].name}`;
            seasons.appendChild(option);
        }
    } else {
        for (let i = 0; i < seasonsNum; i++) {
            var option = document.createElement('option');
            option.value = `${i + 1}`;
            option.innerHTML = `${info.seasons[i].name}`;
            seasons.appendChild(option);
        }
    }

    /* var credits = await fetch(`${TMDB_API_URL}/tv/${movieId}/credits?language=en-US`, options).then((response) => response.json()); */
    var creditsCast = creditsA.cast;
    var creditsCrew = creditsA.crew;
    creditsCast.sort((a, b) => Number(b.total_episode_count) - Number(a.total_episode_count));
    creditsCrew.sort((a, b) => Number(b.popularity) - Number(a.popularity));

    for (let i = 0; i < info.created_by.length; i++) {
        if (diretores.length < 2) {
            diretores[diretores.length] = info.created_by[i].name;
        }
    }
    diretores.forEach((e) => {
        var d = document.createElement('p');
        d.innerText = e;
        diretor.appendChild(d);
    });

    info.genres.forEach((e) => {
        var genero = document.createElement('p');
        genero.innerText = e.name;
        genero.classList.add('genero');
        generos.appendChild(genero);
    });

    var votosAvg = info.vote_average;
    var votosRating = votosAvg.toFixed(1);
    rating.innerText = votosRating;

    releaseDate = info.first_air_date.split('-');
    mes = months[parseInt(releaseDate[1] - 1)];
    data = mes + ' ' + releaseDate[2] + ', ' + releaseDate[0];
    release.innerText = data;

    budget.innerText = info.status;

    length.innerText = info.number_of_episodes;

    description.innerText = info.overview;

    creditsCast.forEach((e) => {
        if (j < 12 && e.known_for_department == 'Acting') {
            var actor = document.createElement('div');
            actor.classList.add('actor');
            actor.dataset.id = e.id;

            var face = document.createElement('img');
            face.classList.add('face');
            face.loading = 'lazy';
            face.decoding = 'async';
            face.alt = e.name;
            if (e.profile_path != null) {
                face.src = PROFILE_IMG_URL + e.profile_path;
            } else {
                face.src = 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRkmcrd-1DlsghkUmszTsMtJtjTj2avxELvWWjDfbIrqboIQMdL';
                face.classList.replace('face', 'guest');
            }

            actor.appendChild(face);

            var nome = document.createElement('p');
            nome.innerText = e.name;
            actor.appendChild(nome);

            var character = document.createElement('p');
            character.innerText = `(${e.roles[0].character})`;
            character.classList.add('character');
            actor.appendChild(character);

            cast.appendChild(actor);
            j++;
        }
    });

    const similarPages = await Promise.all(
        Array.from({ length: 5 }, (_, index) =>
            fetch(`${TMDB_API_URL}/tv/${movieId}/similar?language=en-US&page=${index + 1}`, options)
                .then((res) => res.json())
                .then((data) => data.results),
        ),
    );
    similarFull = similarPages.flat();

    similarFull.sort((a, b) => Number(b.vote_count) - Number(a.vote_count));

    jsonObject = similarFull.map(JSON.stringify);
    uniqueSet = new Set(jsonObject);
    uniqueSimilar = Array.from(uniqueSet).map(JSON.parse);

    for (let i = uniqueSimilar.length; i > 7; i--) {
        uniqueSimilar.pop();
    }

    uniqueSimilar.forEach((movie) => {
        const { title, poster_path, vote_average, id } = movie;
        const movieEl = document.createElement('div');
        movieEl.classList.add('movie');
        movieEl.classList.add('gradient-border');
        movieEl.id = `${id}`;
        movieEl.innerHTML = createLazyImageMarkup(POSTER_IMG_URL + poster_path, '', 'imagem');

        similarMovies.appendChild(movieEl);

        var imgId = movieEl.querySelector('.imagem');
        imgId.addEventListener('click', abrirSimilar);
    });

    var actorMovies = await fetch(`${TMDB_API_URL}/person/59410/movie_credits?language=en-US`, options).then((response) => response.json());
    var actorMoviesActing = [...actorMovies.cast];
    actorMoviesActing = actorMoviesActing.filter((object) => {
        return object.backdrop_path != null;
    });
    actorMoviesActing.sort((a, b) => Number(b.vote_count) - Number(a.vote_count));

    var actorMoviesJob = [...actorMovies.crew];
    actorMoviesJob = actorMoviesJob.filter((object) => {
        return object.backdrop_path != null;
    });
    actorMoviesJob.sort((a, b) => Number(b.vote_count) - Number(a.vote_count));

    var actorShows = await fetch(`${TMDB_API_URL}/person/59410/tv_credits?language=en-US`, options).then((response) => response.json());
    var actorShowsActing = [...actorShows.cast];
    actorShowsActing = actorShowsActing.filter((object) => {
        return object.backdrop_path != null;
    });
    actorShowsActing.sort((a, b) => Number(b.episode_count) - Number(a.episode_count));

    var actorShowsJob = [...actorShows.crew];
    actorShowsJob = actorShowsJob.filter((object) => {
        return object.backdrop_path != null;
    });
    actorShowsJob.sort((a, b) => Number(b.episode_count) - Number(a.episode_count));
}

main();

async function seasonFunc() {
    current = 0;
    episodes.innerHTML = '';
    episodes.style.transform = `translateX(0vw)`;
    var seasonInfo = await fetch(`${TMDB_API_URL}/tv/${movieId}/season/${seasons.value == '' ? 1 : seasons.value}?language=en-US`, options).then((response) => response.json());
    episodesCount = seasonInfo.episodes.length;
    divCount = Math.ceil(episodesCount / 4);
    divCountFloat = episodesCount / 4;
    const episodeInfos = await Promise.all(
        Array.from({ length: episodesCount }, (_, index) =>
            fetch(`${TMDB_API_URL}/tv/${movieId}/season/${seasons.value == '' ? 1 : seasons.value}/episode/${index + 1}?language=en-US`, options)
                .then((response) => response.json()),
        ),
    );
    for (let i = 0; i < episodesCount; i++) {
        const episodeInfo = episodeInfos[i];
        let divEp = document.createElement('div');
        divEp.id = `${i + 1}`;
        divEp.addEventListener('mouseenter', hover);
        divEp.addEventListener('mouseleave', leave);
        /* divEp.addEventListener('click', abrir); */
        divEp.classList.add('episode');
        let divImg = document.createElement('img');
        let divInfo = document.createElement('div');
        divImg.loading = 'lazy';
        divImg.decoding = 'async';
        divImg.alt = '';
        if (episodeInfo.still_path) {
            divImg.src = EPISODE_IMG_URL + episodeInfo.still_path;
        }
        divImg.classList.add('episodeImg');
        if(window.getComputedStyle(document.querySelector('#btnEp button')).getPropertyValue('display') != 'none'){
            divImg.style.filter = 'grayscale(70%)';
        }
        divEp.appendChild(divImg);
        episodes.appendChild(divEp);
        divInfo.classList.add('episodeInfo');
        divInfo.innerHTML = `
                    <span class="material-symbols-outlined" id="playEp">play_circle</span>
                    <div class="episodeInfoClass">
                    <p class="epNum">EP${i + 1} - ${episodeInfo.name}</p>
                    <p>${episodeInfo.runtime} min</p>
                    </div>
                    
                    `;
        divEp.appendChild(divInfo);
    }
}

function proximo() {
    if (current < Math.floor(episodesCount / 4)) {
        current++;
        if (current + 1 >= episodesCount / 4) {
            avancar.classList.replace('visible', 'hidden');
        }
        anterior.classList.replace('hidden', 'visible');
        if (current != Math.ceil(episodesCount / 4) - 1 || episodesCount % 4 == 0) {
            episodes.style.transform = `translateX(${-current * 81.5}vw)`;
        } else {
            episodes.style.transform = `translateX(${-(current - 1) * 81.5 - 18.875 * (episodesCount % 4) - 1.5 * (episodesCount % 4)}vw)`;
        }
    }
}

function voltar() {
    if (current > 0) {
        current--;
        if (current == 0) {
            anterior.classList.replace('visible', 'hidden');
        }
        avancar.classList.replace('hidden', 'visible');
        if (current > 0) {
            episodes.style.transform = `translateX(${parseFloat(episodes.style.transform.split('(')[1].split('v')[0]) + 81.5}vw)`;
        } else {
            episodes.style.transform = `translateX(0vw)`;
        }
    }
}

function getColor(vote) {
    if (vote >= 8) {
        return 'green';
    } else if (vote >= 5) {
        return 'orange';
    } else {
        return 'red';
    }
}

function abrirSimilar(event) {
    var similarMovieId = event.target.offsetParent.id;
    site = '/pages/watch-shows.html?id=' + similarMovieId;
    window.location.href = site;
}

function hover(event) {
    event.target.children[0].style.filter = 'grayscale(0%)';
}

function leave(event) {
    event.target.children[0].style.filter = 'grayscale(70%)';
}

function abrir(event) {
    window.scrollTo(0, bgImg);
    if (event.target.classList[0] == 'episodeImg' || event.target.classList[0] == 'episodeInfo') {
        epNum = event.target.parentElement.id;
    } else if (event.target.nodeName == 'SPAN' || event.target.nodeName == 'DIV') {
        epNum = event.target.parentElement.parentElement.id;
    } else if (event.target.nodeName == 'P') {
        epNum = event.target.parentElement.parentElement.parentElement.id;
    }
    iframe.src = `https://vidsrc.to/embed/tv/${movieId}/${seasons.value}/${epNum}`;
    bgImg.classList.replace('fechadoImg', 'abertoImg');
    iframe.classList.replace('iframeFechado', 'iframeAberto');
    mainHtml.classList.replace('top200', 'top');
}

