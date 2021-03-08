const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const axios = require('axios').default;
const API_KEY = require('../config').TMDB;

const extractEntity = (nlp, entity) => {
  if (nlp.intents[0].confidence < 0.8) return null;
  if (entity === 'intent') {
    return nlp.intents[0].name;
  }
  else if (entity === 'movie') {
    for (const elem in nlp.entities) {
      if (elem.startsWith('movie'))
        return nlp.entities[elem][0].role;
    }
    return null;
  }
  else if (entity === 'releaseYear'){
    for (const elem in nlp.entities) {
      if (elem.startsWith('wit$phone_number')){
        return nlp.entities[elem][0].value;
      }
    }
  }
  return null;
}

const getMovieData = async (movie, releaseYear=null) => {
  const URL = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=en-US&query=${movie}&page=1&include_adult=false${releaseYear === null ? "" : `&year=${releaseYear}`}`
  return await axios({
    method: 'get',
    url: URL,
    reponseType: 'json'
  })
  .then(response => { return new Promise((resolve, reject) => {
    try {
      const movie = response.data.results[0];
      resolve({ 
        id: movie.id,
        title: movie.original_title,
        overview: movie.overview,
        release_date: movie.release_date,
        poster_path: IMG_URL + movie.poster_path,
        director: getDirector(movie.id)
      });
    } catch {
      reject(`No results for '${movie}' in ${releaseYear}`);
    }
  })}, error => console.log(error))
  
};

const getDirector = async (movieId) => {
  const URL = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${API_KEY}`;
  return await axios({
    method: 'get',
    url: URL,
    reponseType: 'json'
  })
  .then(response => { 
    const cast = response.data.cast;
    const directorName = cast.find(x => x.job == 'director');
    console.log(directorName);
    return resolve(directorName);
    return new Promise((resolve, reject) => {
      if (directorName !== null)
        resolve(directorName);
      else
        reject("No director found");
    })
  });
}


module.exports = nlpData => {
  return new Promise((resolve, reject) => {
    let intent = extractEntity(nlpData, 'intent');
    if (intent) {
      let movie = extractEntity(nlpData, 'movie');
      let releaseYear = extractEntity(nlpData, 'releaseYear');
      try {
        let movieData = getMovieData(movie, releaseYear);
        resolve(movieData);
      } catch (error) {
        reject(error);
      }
    }
    else {
      resolve({txt: "I'm not sure I understand you!"});
    }
  });
};