import React, {useEffect, useState} from 'react';
import {Link} from "react-router-dom";
import {FaRegStar, FaStar, FaStarHalfAlt} from 'react-icons/fa'; // 별 아이콘 임포트
import './Home.css';

function usePreloadImages(imageUrls = []) {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (imageUrls.length === 0) {
            setLoaded(true);
            return;
        }
        let loadedCount = 0;
        imageUrls.forEach(url => {
            const img = new Image();
            img.src = url;
            img.onload = img.onerror = () => {
                loadedCount++;
                if (loadedCount === imageUrls.length) {
                    setLoaded(true);
                }
            };
        });
    }, [imageUrls]);

    return loaded;
}

function MovieCarousel({ title, movies, startIndex, handleNext, handlePrev, slideSize = 8 }) {
    // 현재 슬라이드에 해당하는 이미지 URL 배열 만들기
    const imageUrls = movies.slice(startIndex, startIndex + slideSize).map(movie => movie.posterPath || '/default-poster.jpg');
    const allImagesLoaded = usePreloadImages(imageUrls);

    if (!allImagesLoaded) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>이미지를 불러오는 중입니다!</p>
            </div>
        );
    }

    return (
        <div className="movie-carousel-section">
            <h2 className="carousel-title">{title}</h2>
            <div className="movie-carousel">
                {startIndex > 0 && (
                    <button className="prev-button" onClick={handlePrev} aria-label="Previous">
                        {'<'}
                    </button>
                )}
                <div className="movie-list">
                    {movies.slice(startIndex, startIndex + slideSize).map((movie, index) => (
                        <Link className="movie-card" key={movie.movieId} to={`/movie/${movie.movieId}`}>
                            <div className="movie-rank">{startIndex + index + 1}</div>
                            <div className="movie-image">
                                <img
                                    src={movie.posterPath || '/default-poster.jpg'}
                                    alt={movie.title || '이미지를 준비중입니다.'}
                                    className="movie-image"
                                />
                            </div>
                            <div className="movie-info">
                                <h3 className="movie-title">{movie.title}</h3>
                                {/* 별 아이콘 렌더링 등 기타 정보 */}
                            </div>
                        </Link>
                    ))}
                </div>
                {(startIndex + slideSize < (movies?.length || 0)) && (
                    <button className="next-button" onClick={handleNext} aria-label="Next">
                        {'>'}
                    </button>
                )}
            </div>
        </div>
    );
}


export default MovieCarousel;