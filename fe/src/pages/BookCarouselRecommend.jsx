// BookCarouselRecommend.jsx
import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import '../assets/css/loading.css';

function BookCarouselRecommend({title, books, onBooksLoaded, hidden}) {
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

    if (hidden) return null;


    return (
        <div>
            <h2 className="carousel-title">{title}</h2>
            <div className="book-carousel">
                {startIndex > 0 && (
                    <button className="prev-button" onClick={handlePrev}>
                        {'<'}
                    </button>
                )}
                <div className="book-list">
                    {books && books.slice(startIndex, startIndex + 5).map((book, index) => (
                        <Link className="book-card" to={`/book/${book.bookId}`} key={book.bookId}>
                            <div>
                                {title !== "추천 도서" && (
                                    <div className="book-rank">
                                        {startIndex + index + 1}
                                    </div>
                                )}
                                <img src={book.bookImgUrl} alt={book.title} className="book-image"/>
                                <div className="book-info">
                                    <h3 className="book-title">{book.title}</h3>
                                    <p className="book-writer">
                                        {book.crew && book.crew.length > 0 && (
                                            <span>
                                                {book.crew.map(crewMember => crewMember.name).join(', ')}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
                {startIndex + 5 < books.length && (
                    <button className="next-button" onClick={handleNext}>
                        {'>'}
                    </button>
                )}
            </div>
        </div>
    );
}

export default BookCarouselRecommend;