import React, {useState, useEffect} from 'react';
import MovieCarousel from './MovieCarousel';
import useAuthMovieList from "../hooks/useAuthMovieList.jsx";

function RecentHeartSimilarCrewMoviesComponent({ onMoviesLoaded, hidden }) {
    const {movies, loading, error} = useAuthMovieList({
        endpoint: '/movies/search/lastHeart',
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

    if (loading) return <p>Loading latest movies...</p>;
    if (error) return (
        <div>
            <p>Error loading latest movies.</p>
        </div>
    );
    if (hidden) return null;

    // ★ movies가 비어있으면 빈 내용을 반환
    if (!movies || movies.length === 0) {
        return null; // 또는 return <></>; (빈 fragment)
    }

    return (
        <MovieCarousel
            title="찜한 콘텐츠와 유사한 영화"
            movies={movies}
            startIndex={startIndex}
            handleNext={handleNext}
            handlePrev={handlePrev}
        />
    );
}

export default RecentHeartSimilarCrewMoviesComponent;