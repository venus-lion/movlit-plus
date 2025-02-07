import React, {useState, useEffect} from 'react';
import MovieCarousel from './MovieCarousel';
import useGenreMovieList from "../hooks/useGenreMovieList.jsx";

function GenreMoviesComponent({genreId, onMoviesLoaded, hidden}) {
    const {movies, loading, error, genreName} = useGenreMovieList({
        endpoint: '/movies/main/genre',
        params: {genreId: genreId, pageSize: 50},
    });

    const [startIndex, setStartIndex] = useState(0);  // 화면에 보이는 영화 시작 인덱스

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
            <p>장르에 따른 영화 목록을 불러오는 중입니다!</p>
        </div>
    );
    if (error) return (
        <div>
            <p>Error loading movies.</p>
        </div>
    );
    if (hidden) return null;
    return (
        <MovieCarousel
            title={`${genreName} 리스트`}  // genreId에 따라 제목 변경 가능
            movies={movies}
            startIndex={startIndex}
            handleNext={handleNext}
            handlePrev={handlePrev}
        />
    );
}

export default GenreMoviesComponent;