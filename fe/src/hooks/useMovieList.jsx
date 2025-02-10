import {useEffect, useState} from 'react';
import axiosInstance from "../axiosInstance.js";

const useMovieList = ({endpoint, params = {}, pageSize = 20}) => {
    const [movies, setMovies] = useState([]);  // 전체 영화 목록
    const [loading, setLoading] = useState(true);  // 로딩 상태
    const [error, setError] = useState(null);  // 오류 상태

    useEffect(() => {
        console.log(endpoint + " init");
        const fetchMovies = async () => {
            try {
                const response = await axiosInstance.get(endpoint, {
                    params: {...params, pageSize},
                });
                setMovies(response.data.movieList);  // 영화 목록 저장
                console.log(response.data);
            } catch (err) {
                console.error(`Error fetching movies from ${endpoint}:`, err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();  // 컴포넌트가 마운트될 때 API 호출
    }, []);

    return {movies, loading, error};
};

export default useMovieList;
