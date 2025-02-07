import React, {useState, useEffect} from 'react';
import useMovieList from '../hooks/useMovieList';
import MovieCarousel from './MovieCarousel';

function PopularMoviesComponent() {
    const {movies, loading, error} = useMovieList({
        endpoint: '/movies/main/popular',
        params: {pageSize: 20},
    });

    const [startIndex, setStartIndex] = useState(0);  // 화면에 보이는 영화 시작 인덱스
    const [imagesLoaded, setImagesLoaded] = useState(false);

    // 영화 데이터 로딩이 완료되면 모든 이미지 프리로딩 시도
    useEffect(() => {
        if (!loading && movies.length > 0) {
            const imagePromises = movies.map(movie => {
                return new Promise(resolve => {
                    const img = new Image();
                    img.src = movie.posterPath || '/default-poster.jpg';
                    img.onload = resolve;
                    img.onerror = resolve; // 오류가 나도 resolve하여 진행
                });
            });
            Promise.all(imagePromises).then(() => setImagesLoaded(true));
        }
    }, [loading, movies]);

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

    if (loading) return <p>Loading popular movies...</p>;
    if (error) return (
        <div>
            <p>Error loading popular movies.</p>
        </div>
    );

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
