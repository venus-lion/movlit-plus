import React, {useEffect, useState} from "react";
import {Link, useParams} from 'react-router-dom';
import {FaRegStar, FaStar, FaStarHalfAlt} from 'react-icons/fa';
import './SearchDetailPage.css'; // SearchPage.css 기반
import axiosInstance from "../axiosInstance.js";

function MovieSearchPage() {
    const [movieList, setMovieList] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const {inputStr} = useParams();
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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

    useEffect(() => {
        console.log("input Str : " + inputStr);
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get(`/movies/search/searchMovie`, {
                    params: {page, pageSize, inputStr},
                }); // 9개씩 가져오도록 pageSize 설정
                const data = response.data;

                setMovieList(data.movieList); // movieList로 응답하도록 수정
                setPageSize(pageSize);

                // setTotalPages(data.totalPages); // totalPages 설정 (API 응답에 totalPages가 있다고 가정)


            } catch (error) {
                console.error('데이터 가져오기 실패:', error);
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [page]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    if (error) return <div>Error: {error.message}</div>;
    return (
        <div className="search-body-detail">
            <div className="search-section-detail">
                <h2>영화 {'"' + inputStr + '" 의 전체 결과'}</h2>
            </div>
            <div className="search-results-detail movies">
                {movieList.map((movie) => (
                    <div key={movie.movieId} className="search-item-detail">
                        <Link to={`/movie/${movie.movieId}`}>
                            <div className="movie-info">
                                <img src={movie.posterPath} alt={movie.title}/>
                                <div className="movie-info">
                                    <h3 className="movie-title">{movie.title}</h3>
                                    {renderStars(parseFloat(movie.voteAverage))}
                                    <span>({Math.round(parseFloat(movie.voteAverage) * 10) / 10})</span>
                                    <p className="movie-genres">
                                        {movie.movieGenre.map((g) => g.genreName).join(', ')}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            {loading && <div>열심히 일하고 있어요!</div>}

            <div className="pagination-detail">
                {Array.from({length: totalPages}, (_, index) => index + 1).map((pageNum) => (
                    <button
                        key={pageNum}
                        className={page === pageNum ? "active" : ""}
                        onClick={() => handlePageChange(pageNum)}
                    >
                        {pageNum}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default MovieSearchPage;