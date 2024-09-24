import React, { useState } from 'react';

export const App = () => {
  const [busqueda, setBusqueda] = useState('');
  const [peliculas, setPeliculas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => setBusqueda(e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchBuscarPelicula();
    setBusqueda(''); // resetea el valor del input tras ejecutarse el submit
  };

  const api_key = 'c33b4d6515fb658f5a760a329696b155';
  const urlBase = 'https://api.themoviedb.org/3/search/movie';
  const urlImg = 'https://image.tmdb.org/t/p/w500';

  const fetchBuscarPelicula = async () => {
    setLoading(true); // Comienza la carga
    setError(''); // Resetea el error
    try {
      const response = await fetch(`${urlBase}?query=${busqueda}&api_key=${api_key}`);
      const data = await response.json();
      if (data.results.length === 0) {
        setError('No se encontraron coincidencias');
        setPeliculas([]);
      } else {
        const peliculasConTraduccion = await Promise.all(data.results.map(async (pelicula) => {
          const tituloTraducido = await fetchTraduccion(pelicula.original_title);
          const sinopsisTraducida = await fetchTraduccion(pelicula.overview);
          return { ...pelicula, tituloTraducido, sinopsisTraducida };
        }));
        setPeliculas(peliculasConTraduccion);
      }
    } catch (error) {
      console.log('ERROR, ', error);
      setError('Error al buscar películas');
    } finally {
      setLoading(false); // Finaliza la carga
    }
  };

  const url_API_Traductor = 'https://text-translator2.p.rapidapi.com/translate';
  const fetchTraduccion = async (texto) => {
    const options = {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'X-RapidAPI-Key': '862e79fc33msh236b922f0d2a484p158209jsn1b6178be1b3b',
        'X-RapidAPI-Host': 'text-translator2.p.rapidapi.com'
      },
      body: new URLSearchParams({
        source_language: 'en',
        target_language: 'es',
        text: texto
      })
    };

    try {
      const response = await fetch(url_API_Traductor, options);
      const result = await response.json();
      return result.data.translatedText; // Retorna el texto traducido
    } catch (error) {
      console.error('Error:', error);
      return 'Error en la traducción'; // Retorna un mensaje de error si la traducción falla
    }
  };

  return (
    <>
      <div className="container">
        <h2>Cuevana Nerfeado 2.0</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder='Ingrese el nombre de una película'
            value={busqueda}
            onChange={handleInputChange}
          />
          <button type='submit'>Buscar</button>
        </form>

        {peliculas.length > 0 && !loading && (
          <>
            <h4>Películas encontradas</h4>
            <hr />
          </>
        )}

        <div className="results">
          {loading ? (
            <p>Cargando...</p>
          ) : error ? (
            <p>{error}</p>
          ) : (
            peliculas.map((pelicula) => (
              <div key={pelicula.id} className='movie'>
                <img src={urlImg + pelicula.poster_path} alt="poster-pelicula" />
                <h2>{pelicula.tituloTraducido}</h2>
                <p>Fecha de estreno: {pelicula.release_date}</p>
                <p>Sinopsis: {pelicula.sinopsisTraducida}</p>
                <p>Calificación: {pelicula.vote_average.toFixed(1)}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};
