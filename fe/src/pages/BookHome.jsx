// BookHome.jsx
import React, {useState, useEffect, Suspense, lazy, useCallback} from 'react';
import './Home.css';
import {useOutletContext} from 'react-router-dom';
import '../assets/css/loading.css';

// Lazy-load the components
const BestsellerBooksComponent = lazy(() => import('./BestsellerBooksComponent.jsx'));
const PopularBooksComponent = lazy(() => import('./PopularBooksComponent.jsx'));
const NewBooksComponent = lazy(() => import('./NewBooksComponent.jsx'));
const BookCarouselRecommend = lazy(() => import('./BookCarouselRecommend.jsx'));
const RandomGenreBooksComponent = lazy(() => import('./RandomGenreBooksComponent.jsx'));
import useApiData from "../hooks/userRecommendBookApi.jsx";

function BookHome() {
    const {isLoggedIn} = useOutletContext();

    // 사용자 찜한 도서 기반 추천 도서 API 호출
    const {
        data: recommendedBooks,
        loading: loadingRecommended,
        error: errorRecommended
    } = useApiData('/books/search/recommendations', isLoggedIn);

    // 사용자 관심 장르 도서 API 호출
    const {
        data: interestGenreBooks,
        loading: loadingInterestGenre,
        error: errorInterestGenre
    } = useApiData('/books/search/interestGenre', isLoggedIn);


    const [componentsLoaded, setComponentsLoaded] = useState({
        bestseller: false,
        popular: false,
        new: false,
        randomGenre: false,
        recommended: false,
        interestGenre: false,
    });

    // 컴포넌트 내의 모든 책 이미지가 로드되었는지 확인하는 helper-function
    const areBooksLoaded = (books) => {
        return books && books.length > 0 && books.every(book => book.bookImgUrl); // Check if bookImgUrl exists
    };

    // useCallback을 사용하여 컴포넌트 로딩 상태 업데이트 함수를 최적화. 불필요한 리렌더링을 방지.
    const updateComponentLoaded = useCallback((componentName, isLoaded) => {
        setComponentsLoaded(prev => {
            if (prev[componentName] === isLoaded) {
                return prev;
            }
            return {...prev, [componentName]: isLoaded};
        });
    }, []);

    return (
        <div className="book-home">
            <Suspense fallback={<div className="loading-container">
                <div className="spinner"></div>
                <p>로딩 중입니다.</p></div>}>

                {/* Bestseller Books */}
                <BestsellerBooksComponent
                    onBooksLoaded={(books) => updateComponentLoaded('bestseller', areBooksLoaded(books))}
                    hidden={!componentsLoaded.bestseller}
                />

                {/* Popular Books */}
                {componentsLoaded.bestseller && (
                    <PopularBooksComponent
                        onBooksLoaded={(books) => updateComponentLoaded('popular', areBooksLoaded(books))}
                        hidden={!componentsLoaded.popular}
                    />
                )}

                {/* New Books */}
                {componentsLoaded.popular && (
                    <NewBooksComponent
                        onBooksLoaded={(books) => updateComponentLoaded('new', areBooksLoaded(books))}
                        hidden={!componentsLoaded.new}
                    />
                )}

                {/* Random Genre Books */}
                {componentsLoaded.new && (
                    <RandomGenreBooksComponent
                        onBooksLoaded={(books) => updateComponentLoaded('randomGenre', areBooksLoaded(books))}
                        hidden={!componentsLoaded.randomGenre}
                    />
                )}

                {/* Interest Genre Books (Conditional) */}
                {componentsLoaded.randomGenre && isLoggedIn && interestGenreBooks.length > 0 && (
                    <BookCarouselRecommend
                        title="회원님의 취향저격 도서 장르"
                        books={interestGenreBooks}
                        onBooksLoaded={(books) => updateComponentLoaded('interestGenre', areBooksLoaded(books))}
                        hidden={!componentsLoaded.interestGenre}
                    />
                )}


                {/* Recommended Books (Conditional) */}
                {componentsLoaded.interestGenre && isLoggedIn && recommendedBooks.length > 0 && (
                    <BookCarouselRecommend
                        title="회원님이 찜한 책과 닮은 도서들"
                        books={recommendedBooks}
                        onBooksLoaded={(books) => updateComponentLoaded('recommended', areBooksLoaded(books))}
                        hidden={!componentsLoaded.recommended}
                    />
                )}
            </Suspense>
        </div>
    );
}

export default BookHome;