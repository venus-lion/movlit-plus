import React, {useState} from "react";
import useBookList from "../hooks/useBookList.jsx";
import BookCarousel from "./BookCarousel.jsx";

function PopularBooksComponent() {
    const {books, loading, error} = useBookList({
        endpoint: '/books/popular',
        params: {limit: 30},
    });

    const [startIndex, setStartIndex] = useState(0); // 화면에 보이는 도서 시작 인덱스

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

    if (loading) return <p>인기 있는 도서들을 가져오는 중입니다!</p>;
    if (error) return (
        <div>
            <p>Error loading popular books.</p>
        </div>
    );

    return (
        <BookCarousel
            title="신간 인기 순위"
            books={books}
            startIndex={startIndex}
            handleNext={handleNext}
            handlePrev={handlePrev}
        ></BookCarousel>
    );
}

export default PopularBooksComponent;