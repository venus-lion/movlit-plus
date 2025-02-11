import React, {useEffect, useState} from 'react';
import useMovieList from '../hooks/useMovieList';
import MovieCarousel from './MovieCarousel';
import '../assets/css/loading.css';

function PopularMoviesComponent({onMoviesLoaded, hidden}) {
    const {movies, loading, error} = useMovieList({
        endpoint: '/movies/main/popular',
        params: {pageSize: 20},
    });

    const [startIndex, setStartIndex] = useState(0);

    const handleNext = () => {
        const newIndex = startIndex + 5;
        if (newIndex < movies.length) {
            setStartIndex(newIndex);
        }
    };

    const handlePrev = () => {
        const newIndex = startIndex - 5;
        if (newIndex >= 0) {
            setStartIndex(newIndex);
        }
    };

    useEffect(() => {
        if (onMoviesLoaded && movies) {
            onMoviesLoaded(movies);
        }
    }, [movies, onMoviesLoaded]);

    if (loading) return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p>인기 있는 영화 목록을 불러오는 중입니다!</p>
        </div>
    );
    if (error) return (
        <div>
            <p>Error loading popular movies.</p>
        </div>
    );
    if (hidden) return null;

    return (
        <MovieCarousel
            title="인기 많은 영화"
            movies={movies}
            startIndex={startIndex}
            handleNext={handleNext}
            handlePrev={handlePrev}
        />
    );
}

export default PopularMoviesComponent;