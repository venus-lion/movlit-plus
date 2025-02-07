import React, {useState} from "react";
import useBookList from "../hooks/useBookList.jsx";
import BookCarousel from "./BookCarousel.jsx";

function NewBooksComponent() {
    const {books, loading, error} = useBookList({
        endpoint: '/books/new',
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

    if (loading) return <p>최신 도서들을 가져오는 중입니다!</p>;
    if (error) return (
        <div>
            <p>Error loading popular books.</p>
        </div>
    );

    return (
        <BookCarousel
            title="최근 들어온 따끈따끈한 신작"
            books={books}
            startIndex={startIndex}
            handleNext={handleNext}
            handlePrev={handlePrev}
        ></BookCarousel>
    );
}

export default NewBooksComponent;