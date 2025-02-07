import React from 'react';
import {Link} from 'react-router-dom';

function BookCarouselRecommend({title, books, startIndex, handlePrev, handleNext}) {
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
                    {books.slice(startIndex, startIndex + 5).map((book, index) => (
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
                                        {/* 작가 정보가 존재하는 경우에만 렌더링 */}
                                        {book.crew && book.crew.length > 0 && (
                                            <span>
                                              {book.crew.join(', ')}
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