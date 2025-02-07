import React, {useState} from "react";

import BookCarousel from "./BookCarousel.jsx";
import UserRecommendedBooks from "../hooks/UserRecommendedBooks.jsx";

function UserRecommendationComponent() {

    const {recommendedBooks, loading, error} = UserRecommendedBooks(
        isLoggedIn,
    );

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

    if (loading) return <p>추천 도서들을 가져오는 중입니다!</p>;
    if (error) return (
        <div>
            <p>Error loading popular books.</p>
        </div>
    );

    return (
        <BookCarousel
            title="신간 베스트셀러 순위"
            books={books}
            startIndex={startIndex}
            handleNext={handleNext}
            handlePrev={handlePrev}
        ></BookCarousel>
    );
}

export default UserRecommendationComponent;