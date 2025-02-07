import React, {useEffect, useState, useContext} from "react"; // useContext 임포트 추가
import Modal from "react-modal";
import {FaRegStar, FaStar, FaStarHalfAlt} from 'react-icons/fa';
import "../../assets/css/CreateGroupChatModal.css";
import axiosInstance from "../../axiosInstance.js";
import {AppContext} from "../../App.jsx"; // AppContext 임포트

// 별을 표시하는 함수 (기존과 동일)
const renderStars = (rating) => {
    const validRating = Math.max(0, Math.min(10, rating || 0));
    const fullStars = Math.floor(validRating / 2);
    const halfStar = validRating % 2 >= 1 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    return (
        <>
            {[...Array(fullStars)].map((_, index) => (
                <FaStar key={`full-${index}`} className="star-icon"/>
            ))}
            {halfStar === 1 && <FaStarHalfAlt className="star-icon"/>}
            {[...Array(emptyStars)].map((_, index) => (
                <FaRegStar key={`empty-${index}`} className="star-icon"/>
            ))}
        </>
    );
};

// 제목이 길 경우 ...으로 줄여주는 함수 (기존과 동일)
const truncateTitle = (title, maxLength = 15) => {
    if (title.length > maxLength) {
        return `${title.slice(0, maxLength)}...`;
    }
    return title;
};

const CreateGroupChatModal = ({isOpen, onClose, onConfirm}) => {
    const [selectedCategory, setSelectedCategory] = useState("movie");
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);
    const [hasSearched, setHasSearched] = useState(false); // 검색 여부 상태 추가
    const { updateSnackbar } = useContext(AppContext); // updateSnackbar context 함수 import

    const handleCategoryChange = (event) => {
        setSearchResults([]);
        setSelectedCard(null);
        setSelectedCategory(event.target.value);
        setHasSearched(false); // 카테고리 변경 시 검색 상태 초기화
    };

    useEffect(() => {
        setSearchResults([]);
    }, [selectedCategory]);

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            updateSnackbar('검색어를 입력해주세요.', 'warning'); // toast.error -> updateSnackbar
            return;
        }
        setSearchResults([]);
        setSelectedCard(null);
        setHasSearched(true); // 검색 시작 상태 설정

        try {
            const response = await axiosInstance.get(
                selectedCategory === "movie"
                    ? `/movies/search/searchMovie`
                    : `/books/search/searchBook`,
                {
                    params: {
                        page: 1,
                        pageSize: 50,
                        inputStr: searchTerm,
                    },
                }
            );

            const data = selectedCategory === "movie"
                ? response.data.movieList
                : response.data.bookESVoList;

            setSearchResults(data);
        } catch (error) {
            console.error("Error fetching search results:", error);
            setSearchResults([]);
        }
    };

    const handleCardClick = (result) => {
        setSelectedCard((prev) => (prev === result ? null : result));
    };

    const handleConfirm = () => {
        if (!selectedCard) {
            updateSnackbar('카드를 선택해주세요.', 'warning'); // toast.error -> updateSnackbar
            return;
        }
        onConfirm(selectedCard, selectedCategory);
    };

    const handleCancel = () => {
        setSearchTerm("");
        setSearchResults([]);
        setHasSearched(false); // 검색 상태 초기화
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={handleCancel}
            className="custom-modal"
            overlayClassName="custom-overlay"
            ariaHideApp={false}
        >
            <div className="modal-content">
                <div className="modal-header">
                    <h2>채팅방 생성</h2>
                </div>

                <div className="modal-body">
                    <div className="modal-tab-container">
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="category"
                                value="movie"
                                checked={selectedCategory === "movie"}
                                onChange={handleCategoryChange}
                                className="radio radio-item"
                            />
                            영화
                        </label>
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="category"
                                value="book"
                                checked={selectedCategory === "book"}
                                onChange={handleCategoryChange}
                                className="radio radio-item"
                            />
                            책
                        </label>
                    </div>

                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="검색어를 입력하세요"
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="search-button" onClick={handleSearch}>
                            검색
                        </button>
                    </div>

                    {/* 검색 결과 (기존과 동일) */}
                    <div className="result-container">
                        {hasSearched && ( // 검색이 이루어진 경우에만 결과 표시
                            <>
                                <h3>검색 결과</h3>
                                <div className="results-scroll">
                                    {searchResults.length > 0 ? (
                                        <div className="results-grid">
                                            {searchResults.map((result, index) => (
                                                <div key={index}
                                                     className={`result-card ${selectedCard === result ? 'selected' : ''}`}
                                                     onClick={() => handleCardClick(result)}
                                                >
                                                    {selectedCategory === "movie" ? (
                                                        <>
                                                            <img src={result.posterPath} alt={result.title}
                                                                 className="result-image"/>
                                                            <div
                                                                className="result-title">{truncateTitle(result.title)}</div>
                                                            <div className="result-rating">
                                                                ⭐<span>({Math.round(parseFloat(result.voteAverage) * 10) / 10})</span>
                                                            </div>
                                                            <div>
                                                                <p className="result-info">
                                                                    {result.movieGenre.map((g) => g.genreName).join(', ')}
                                                                </p>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <img src={result.bookImgUrl} alt={result.title}
                                                                 className="result-image"/>
                                                            <div
                                                                className="result-title">{truncateTitle(result.title)}</div>
                                                            <div>
                                                                <p className="result-info">
                                                                    {result.crew.join(', ')}
                                                                </p>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        hasSearched && <p>검색결과가 없습니다.</p> // 검색 후 결과 없을 시
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="modal-cancel" onClick={handleCancel}>취소</button>
                    <button className="modal-confirm" onClick={handleConfirm}>선택</button>
                </div>
            </div>
        </Modal>
    );
};

export default CreateGroupChatModal;