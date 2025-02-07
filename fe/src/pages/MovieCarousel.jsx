import React from 'react';
import {Link} from "react-router-dom";
import {FaRegStar, FaStar, FaStarHalfAlt} from 'react-icons/fa'; // 별 아이콘 임포트
import './Home.css';

function MovieCarousel({title, movies, startIndex, handleNext, handlePrev, hasMore, loading, slideSize = 8}) {

    // 별을 표시하는 함수
    const renderStars = (rating) => {
        // rating 값을 0 ~ 10으로 받을 경우
        const validRating = Math.max(0, Math.min(10, rating || 0));  // 0 ~ 10 사이로 제한

        // 2점마다 1개의 꽉 찬 별로 환산
        const fullStars = Math.floor(validRating / 2);  // 꽉 찬 별 개수
        const halfStar = validRating % 2 >= 1 ? 1 : 0;  // 반쪽 별 여부 (나머지가 1 이상이면 반쪽 별)
        const emptyStars = 5 - fullStars - halfStar;  // 빈 별 개수 (총 5개 별이므로 나머지)

        return (
            <>
                {[...Array(fullStars)].map((_, index) => <FaStar key={`full-${index}`} className="star-icon"/>)}
                {halfStar === 1 && <FaStarHalfAlt className="star-icon"/>}
                {[...Array(emptyStars)].map((_, index) => <FaRegStar key={`empty-${index}`} className="star-icon"/>)}
            </>
        );
    };

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
                    {(!movies || movies.length === 0) && !loading ? (
                        <p>데이터가 없습니다.</p>
                    ) : (movies.slice(startIndex, startIndex + slideSize).map((movie, index) => (
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
                                {renderStars(parseFloat(movie.voteAverage))}
                                <span>({Math.round(parseFloat(movie.voteAverage) * 10) / 10})</span>
                                {/*<p className="movie-genres">*/}
                                {/*    {movie.movieGenreList.map((g) => g.genreName).join(', ')}*/}
                                {/*</p>*/}
                                <p className="movie-genres">
                                    {movie.movieGenreList && movie.movieGenreList.length > 0
                                        ? movie.movieGenreList.map((g) => g.genreName).join(', ')
                                        : ''}
                                </p>
                            </div>
                        </Link>
                    )))}
                </div>
                {(startIndex + slideSize < (movies?.length || 0) || hasMore) && (
                    <button
                        className="next-button"
                        onClick={handleNext}
                        aria-label="Next"
                        disabled={loading}
                    >
                        {'>'}
                    </button>
                )}
                {loading && <p>Loading more movies...</p>}
            </div>
        </div>
    );
}

export default MovieCarousel;