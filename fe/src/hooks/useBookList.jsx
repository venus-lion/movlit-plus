import {useEffect, useState} from "react";
import axiosInstance from "../axiosInstance.js";

const useBookList = ({endpoint, params = {}}) => {
    const [books, setBooks] = useState([]); // 전체 도서 목록
    const [loading, setLoading] = useState(true); // 로딩 상태
    const [error, setError] = useState(null); // 에러 상태

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await axiosInstance.get(endpoint, {
                    params: {...params},
                });

                console.log('response.data.books :: ', response.data.books);
                setBooks(response.data.books);
            } catch (err) {
                console.error(`Error fetching books from ${endpoint}: `, err);
            } finally {
                setLoading(false); // 로딩 다함
            }
        }

        fetchBooks();
    }, []);

    return {books, loading, error};
};

export default useBookList;
