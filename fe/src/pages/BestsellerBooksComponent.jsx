// BestsellerBooksComponent.jsx
import React, {useEffect, useState} from 'react';
import useBookList from '../hooks/useBookList.jsx';
import BookCarousel from './BookCarousel.jsx';
import '../assets/css/loading.css';

function BestsellerBooksComponent({onBooksLoaded, hidden}) {
    const {books, loading, error} = useBookList({
        endpoint: '/books/bestseller',
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
            <p>베스트셀러 도서들을 가져오는 중입니다!</p>
        </div>
    );
    if (error) return (
        <div>
            <p>Error loading popular books.</p>
        </div>
    );

    if (hidden) return null;

    return (
        <BookCarousel
            title="신간 베스트셀러 순위"
            books={books}
            startIndex={startIndex}
            handleNext={handleNext}
            handlePrev={handlePrev}
        />
    );
}

export default BestsellerBooksComponent;