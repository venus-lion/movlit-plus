import React, {useEffect, useState} from 'react';
import MovieCarousel from './MovieCarousel';
import useAuthMovieList from "../hooks/useAuthMovieList.jsx";

function InterestGenreMoviesComponent({onMoviesLoaded, hidden}) {
    const {movies, loading, error} = useAuthMovieList({
        endpoint: '/movies/search/interestGenre',
        params: {pageSize: 30},
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
            <p>회원님이 좋아하실 만한 영화 목록을 불러오는 중입니다!</p>
        </div>
    );
    if (error) return (
        <div>
            <p>Error loading latest movies.</p>
        </div>
    );

    if (hidden) return null;
    return (
        <MovieCarousel
            title="회원님의 관심 장르와 비슷한 영화"
            movies={movies}
            startIndex={startIndex}
            handleNext={handleNext}
            handlePrev={handlePrev}
        />
    );
}

export default InterestGenreMoviesComponent;