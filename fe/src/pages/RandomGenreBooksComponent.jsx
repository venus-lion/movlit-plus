// RandomGenreBooksComponent.jsx
import React, {useEffect, useState} from 'react';
import useBookList from '../hooks/useBookList.jsx';
import BookGenreCarousel from './BookGenreCarousel.jsx';
import '../assets/css/loading.css';

function RandomGenreBooksComponent({onBooksLoaded, hidden}) {
    const {books, loading, error} = useBookList({
        endpoint: '/books/genres/random',
        params: {limit: 30},
    });

    const [startIndex, setStartIndex] = useState(0);

    const handleNext = () => {
        const newIndex = startIndex + 5;
        if (newIndex < books.length) {
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
        if (onBooksLoaded && books) {
            onBooksLoaded(books);
        }
    }, [books, onBooksLoaded]);


    if (loading) return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p>랜덤 장르의 도서들을 가져오는 중입니다!</p>
        </div>
    );
    if (error) return <div><p>Error loading popular books.</p></div>;
    if (hidden) return null;

    const uniqueGenres = new Set();

    if (books) {
        books.forEach(book => {
            if (book.genres && Array.isArray(book.genres)) {
                book.genres.forEach(genre => uniqueGenres.add(genre.genreName));
            }
        });
    }

    const uniqueGenreList = Array.from(uniqueGenres);

    return (
        <BookGenreCarousel
            title={`마니아를 위해: ${uniqueGenreList.join(', ')}`}
            books={books}
            startIndex={startIndex}
            handleNext={handleNext}
            handlePrev={handlePrev}
        ></BookGenreCarousel>
    );
}

export default RandomGenreBooksComponent;