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
const play = document.getElementById('play');
/* play.addEventListener('click', abrir); */
const iframe = document.getElementById('iframe');
const mainHtml = document.querySelector('main');
var similarFull = [];
var similar = [];
const similarMovies = document.getElementById('similarMovies');

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
    const [info, img, credits] = await Promise.all([
        fetch(`${TMDB_API_URL}/movie/${movieId}?language=en-US`, options).then((response) => response.json()),
        fetch(`${TMDB_API_URL}/movie/${movieId}/images`, options).then((response) => response.json()),
        fetch(`${TMDB_API_URL}/movie/${movieId}/credits?language=en-US`, options).then((response) => response.json()),
    ]);
    nome.innerText = info.title;

    window.top.document.title = 'Watch ' + info.title;

    var foto = img.backdrops[0].file_path;
    var fotoLink = DETAIL_IMG_URL + foto;
    bgImg.style.backgroundImage = `-webkit-linear-gradient(bottom, rgba(5, 21, 30, 1) 0%, rgba(0, 0, 0, 0) 30%), url('${fotoLink}')`;

    for (let i = 0; i < credits.crew.length; i++) {
        if (credits.crew[i].job == 'Director' && diretores.length < 2) {
            diretores[diretores.length] = credits.crew[i].name;
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
    var votosRating = votosAvg.toFixed(2);
    rating.innerText = votosRating;

    releaseDate = info.release_date.split('-');
    mes = months[parseInt(releaseDate[1] - 1)];
    data = mes + ' ' + releaseDate[2] + ', ' + releaseDate[0];
    release.innerText = data;

    budget.innerText = '$' + info.budget / 1000000 + 'M';

    length.innerText = info.runtime + ' min';

    description.innerText = info.overview;

    credits.cast.forEach((e) => {
        if (j < 12) {
            var actor = document.createElement('div');
            actor.classList.add('actor');

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
            character.innerText = `(${e.character})`;
            character.classList.add('character');
            actor.appendChild(character);

            cast.appendChild(actor);
            j++;
        }
    });

    const similarPages = await Promise.all(
        Array.from({ length: 5 }, (_, index) =>
            fetch(`${TMDB_API_URL}/movie/${movieId}/similar?language=en-US&page=${index + 1}`, options)
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
}

main();

function getColor(vote) {
    if (vote >= 8) {
        return 'green';
    } else if (vote >= 5) {
        return 'orange';
    } else {
        return 'red';
    }
}

function abrir() {
    iframe.src = `https://vidsrc.to/embed/movie/${movieId}`;
    bgImg.classList.replace('fechadoImg', 'abertoImg');
    iframe.classList.replace('iframeFechado', 'iframeAberto');
    mainHtml.classList.replace('top200', 'top');
}

function abrirSimilar(event) {
    var similarMovieId = event.target.offsetParent.id;
    site = '/pages/watch-movies.html?id=' + similarMovieId;
    window.location.href = site;
}
