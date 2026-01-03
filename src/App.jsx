import React, { useState, useEffect } from 'react';
import Search from "./conponents/Search.jsx";
import Spinner from "./conponents/Spinner.jsx";
import MovieCard from "./conponents/MovieCard.jsx";
import { useDebounce } from "react-use";

const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
}


const App = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false)
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    // Debounce the search term to prevent making too many API request
    // waiting for the user to stop typing for 500ms
    useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

    const fetchMovies = async (query = '') => {
        setIsLoading(true);
        setErrorMessage('')

        try {
            const endpoint = query ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
            const response = await fetch(endpoint, API_OPTIONS);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if(data.results === 'False') {
                setErrorMessage(data.errors || 'failed to fetch movies');
                setMovies([])
                return;
            }

            setMovies(data.results || [])
        } catch (err) {
            console.log(`Error fetching movies: ${err}`);
            setErrorMessage('Error fetching movies. Please try again later.');
        }finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchMovies(debouncedSearchTerm);
    },[debouncedSearchTerm])

    return (
        <main>
            <div className='pattern' />

            <div className='wrapper'>
                <header>
                    <img src='./hero.png' alt='Hero Banner' className="w-full max-h-64 object-cover rounded-lg mb-4"/>
                    <h1>Your next favorite <span className='text-gradient'>Movie</span>, served instantly</h1>
                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </header>

                <section className='all-movies'>
                    <h2 className='mt-[40px]'>All Movies</h2>

                    {isLoading ? (
                        <Spinner />
                    ): errorMessage ? (
                        <p className='text-red-500'>{errorMessage}</p>
                    ):(
                        <ul>
                            {movies.map((movie) => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </main>
    );
};

export default App;