import React, {useContext, useEffect, useRef, useState} from 'react';
import {Link, useLocation, useNavigate, useParams} from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import {
    FaComment,
    FaHeart,
    FaRegHeart,
    FaRegStar,
    FaStar,
    FaStarHalfAlt,
    FaUserCircle,
    FaEdit,
    FaTrashAlt,
    FaCheck, // FaCheck 아이콘 추가
} from 'react-icons/fa';
import MovieCarousel from '../pages/MovieCarousel';
import useAuthMovieList from '../hooks/useAuthMovieList';
import useBookList from '../hooks/useBookList';
import BookGenreCarousel from '../pages/BookGenreCarousel';
import {buildStyles, CircularProgressbar} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import GetGroupChatInfoModal from "./chat/GetGroupChatInfoModal.jsx";
import CreateGroupChatNameModal from "./chat/CreateGroupChatNameModal.jsx";
import './MovieDetailPage.css'; // CSS 파일 import
import {AppContext} from "../App.jsx";
import BookCarouselRecommend from "../pages/BookCarouselRecommend.jsx"; // AppContext import

function MovieDetailPage() {
    const {movieId} = useParams();
    const [movieData, setMovieData] = useState(null);
    const [myRating, setMyRating] = useState(0); // 0~10 사이의 값 (0.5 단위)
    const [hoverRating, setHoverRating] = useState(0); // 마우스 호버 시 별점 상태
    const [dbRating, setDbRating] = useState(0); // 최신 별점 저장
    const [myComment, setMyComment] = useState('');
    const [crews, setCrews] = useState([]);
    const [visibleCrews, setVisibleCrews] = useState([]);
    const [showMoreCrews, setShowMoreCrews] = useState(false);
    const [genres, setGenres] = useState([]);
    const [showCommentInput, setShowCommentInput] = useState(false);
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [showLessComments, setShowLessComments] = useState(false);
    const [totalComments, setTotalComments] = useState(0);
    const [page, setPage] = useState(0);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [userComment, setUserComment] = useState(null);
    const [userCommentId, setUserCommentId] = useState(null);
    const loader = useRef(null);
    const [isGetGroupChatInfoModalOpen, setIsGetGroupChatInfoModalOpen] = useState(false); // 채팅방 존재여무 모달 열림 상태
    const [isCreateGroupChatNameModalOpen, setIsCreateGroupChatNameModalOpen] = useState(false); // 모달2 열림 상태
    const [selectedCard, setSelectedCard] = useState(null); // 선택된 데이터
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0); // 채팅 리스트 새로고침 키 추가
    const [currentMemberId, setCurrentMemberId] = useState(null); // 현재 로그인된 memberId 상태 추가
    const {updateSnackbar} = useContext(AppContext); // updateSnackbar context 함수 import

    const initialVisibleCrews = 14;


    // 알림(새 그룹채팅방 생성됨)을 통해 상세페이지 접속 -> 바로 "그룹채팅방 입장" 모달 띄우기
    const location = useLocation(); // 현재 URL의 location 객체 가져오기
    const params = new URLSearchParams(location.search); // 쿼리 파라미터 읽기
    const navigate = useNavigate();

    // 추천 책 리스트
    const [recommendedBooks, setRecommendedBooks] = useState([]); // 전체 도서 목록
    const [startIndex, setStartIndex] = useState(0); // 화면에 보이는 도서 시작 인덱스
    const [startIndexRecommended, setStartIndexRecommended] = useState(0);

    const handleNextRecommended = () => handleNext(startIndexRecommended, setStartIndexRecommended, recommendedBooks.length);
    const handlePrevRecommended = () => handlePrev(startIndexRecommended, setStartIndexRecommended);

    // 관련 책 추천
    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await axiosInstance.get(`/books/9791138485593/recommendedBooks`);
                // const response = await axios.get('/api/books/popular', {
                //     params: {limit : 30},
                // });

                //const response = await axiosInstance.get(`/api/books/popular`);
                console.log('#### 추천책 response 값 :' + response.data);
                setRecommendedBooks(response.data);
            } catch (err) {
                console.error(`Error fetching books : `, err);
            }
        }

        fetchBooks();
    }, []);

    // 관련 영화 데이터 가져오기
    const {
        movies: relatedMovies,
        loading: relatedMoviesLoading,
        error: relatedMoviesError,
    } = useAuthMovieList({
        endpoint: `/movies/${movieId}/detail/related`,
        params: {pageSize: 30},
    });
    const [relatedMoviesStartIndex, setRelatedMoviesStartIndex] = useState(0);

    const handleRelatedMoviesNext = () => {
        const newIndex = relatedMoviesStartIndex + 5;
        if (newIndex < relatedMovies.length) {
            setRelatedMoviesStartIndex(newIndex);
        }
    };

    const handleRelatedMoviesPrev = () => {
        const newIndex = relatedMoviesStartIndex - 5;
        if (newIndex >= 0) {
            setRelatedMoviesStartIndex(newIndex);
        }
    };

    const {
        books: relatedBooks,
        loading: relatedBooksLoading,
        error: relatedBooksError,
    } = useBookList({
        endpoint: `/books/genres/movies/${movieId}/detail`,
        params: {limit: 30},
    });
    const [relatedBooksStartIndex, setRelatedBooksStartIndex] = useState(0);

    const handleRelatedBooksNext = () => {
        const newIndex = relatedBooksStartIndex + 5;
        if (newIndex < relatedBooks.length) {
            setRelatedBooksStartIndex(newIndex);
        }
    };

    const handleRelatedBooksPrev = () => {
        const newIndex = relatedBooksStartIndex - 5;
        if (newIndex >= 0) {
            setRelatedBooksStartIndex(newIndex);
        }
    };

    useEffect(() => {
        axiosInstance
            .get(`/movies/${movieId}/detail`)
            .then((response) => {
                const data = response.data;
                setMovieData({
                    id: data.movieId,
                    title: data.title,
                    originalTitle: data.originalTitle,
                    overview: data.overview,
                    popularity: data.popularity,
                    heartCount: data.heartCount,
                    posterUrl: data.posterPath.replace('original', 'w200'),
                    backdropUrl: data.backdropPath,
                    releaseDate: data.releaseDate,
                    country: data.productionCountry,
                    language: data.originalLanguage,
                    runtime: data.runtime,
                    status: data.status,
                    voteAverage: data.voteAverage,
                    tagline: data.tagline,
                    ratingCount: data.voteCount,
                    isHearted: data.isHearted,
                });
            })
            .catch((error) => console.error('Error fetching movie data:', error));

        axiosInstance
            .get(`/movies/${movieId}/crews`)
            .then((response) => {
                const sortedCrews = response.data.sort((a, b) => {
                    if (a.role === 'DIRECTOR' && b.role !== 'DIRECTOR') {
                        return -1;
                    } else if (a.role !== 'DIRECTOR' && b.role === 'DIRECTOR') {
                        return 1;
                    } else {
                        return 0;
                    }
                });
                setCrews(sortedCrews);
                setVisibleCrews(sortedCrews.slice(0, initialVisibleCrews));
            })
            .catch((error) => console.error('Error fetching crew data:', error));

        axiosInstance
            .get(`/movies/${movieId}/genres`)
            .then((response) => {
                const formattedGenres = response.data.map((genre) => ({
                    name: genre.genreName,
                }));
                setGenres(formattedGenres);
            })
            .catch((error) => console.error('Error fetching genre data:', error));

        fetchUserComment();
        fetchComments(0);

        axiosInstance
            .get(`/members/id`)
            .then((response) => {
                setCurrentMemberId(response.data.memberId);
            })
            .catch((error) => console.error('Error fetching member id:', error));
    }, [movieId]);


    // 알림(새 그룹채팅방 생성됨)을 통해 상세페이지 접속 -> 바로 "그룹채팅방 입장" 모달 띄우기
    useEffect(() => {
        const fromNoti = params.get('fromNoti'); // 'fromNoti' 쿼리 파라미터 값을 가져오기

        if (fromNoti === 'true' && movieId && movieData && crews) {
            handleJoinGroupChatroom(movieId, movieData.posterUrl, movieData.title, crews);
        }
    }, [movieId, movieData, crews]); // bookData와 crews를 의존성 배열에 추가


    // Intersection Observer 설정 (코멘트 무한 스크롤)
    useEffect(() => {
        if (!isInitialLoad) {
            const options = {
                root: null,
                rootMargin: '20px',
                threshold: 1.0,
            };

            const observer = new IntersectionObserver(handleObserver, options);
            if (loader.current) {
                observer.observe(loader.current);
            }

            return () => observer.disconnect();
        }
    }, [comments, hasMore, isInitialLoad]);

    const fetchUserComment = async () => {
        try {
            const response = await axiosInstance.get(`/movies/${movieId}/myComment`);
            if (response.data) {
                const {movieCommentId, comment, score, nickname, profileImgUrl} =
                    response.data;
                setUserComment({
                    nickname,
                    profileImgUrl,
                    comment,
                    score,
                });
                setUserCommentId(movieCommentId);
                setMyRating(score);
                setDbRating(score);
                setMyComment(comment);
                if (score > 0) {
                    setShowCommentInput(false);
                } else {
                    setShowCommentInput(false);
                }
            } else {
                setUserComment(null);
                setUserCommentId(null);
                setMyRating(0);
                setDbRating(0);
                setMyComment('');
                setShowCommentInput(false);
            }
        } catch (error) {
            console.error('Error fetching user comment:', error);
            setUserComment(null);
            setUserCommentId(null);
        }
    };

    const fetchComments = (currentPage = 0) => {
        axiosInstance
            .get(`/movies/${movieId}/comments?page=${currentPage}`)
            .then((response) => {
                const fetchedTotalComments =
                    response.data.content && response.data.content.length > 0
                        ? response.data.content[0].commentCount
                        : 0;
                setTotalComments(fetchedTotalComments);

                if (currentPage === 0) {
                    const updatedComments = response.data.content.map((comment) => ({
                        ...comment,
                        isLiked: comment.isLiked || false,
                        commentLikeCount: comment.commentLikeCount || 0,
                        profileImgUrl: comment.profileImgUrl || null,
                    }));
                    setComments(updatedComments);
                    setHasMore(
                        response.data.content.length > 4 || fetchedTotalComments > 4
                    );
                } else {
                    const updatedComments = response.data.content.map((comment) => ({
                        ...comment,
                        isLiked: comment.isLiked || false,
                        commentLikeCount: comment.commentLikeCount || 0,
                        profileImgUrl: comment.profileImgUrl || null,
                    }));
                    setComments((prevComments) => [...prevComments, ...updatedComments]);
                    setHasMore(!response.data.last);
                }
                setPage(currentPage + 1);
            })
            .catch((error) => console.error('Error fetching comments:', error));
    };

    const handleObserver = (entities) => {
        const target = entities[0];
        if (target.isIntersecting && hasMore && !isInitialLoad) {
            fetchComments(page);
        }
    };

    const handleRatingClick = (newRating, e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const halfWidth = rect.width / 2;
        const starIndex = newRating / 2;

        if (x <= halfWidth) {
            setMyRating(starIndex * 2 - 1);
        } else {
            setMyRating(starIndex * 2);
        }
        setShowCommentInput(true);
    };

    const handleWishClick = async () => {
        try {
            let updatedHeartCount;

            if (movieData.isHearted) {
                await axiosInstance.delete(`/movies/${movieId}/hearts`);
                updatedHeartCount = movieData.heartCount - 1;
                setMovieData((prevMovieData) => ({
                    ...prevMovieData,
                    heartCount: updatedHeartCount,
                    isHearted: false,
                }));
                updateSnackbar('찜 목록에서 제거되었습니다.', 'success');
            } else {
                const response = await axiosInstance.post(`/movies/${movieId}/hearts`);
                updatedHeartCount = response.data.movieHeartCnt;
                setMovieData((prevMovieData) => ({
                    ...prevMovieData,
                    heartCount: updatedHeartCount,
                    isHearted: true,
                }));
                updateSnackbar('찜 목록에 추가되었습니다.', 'success');
            }

            const button = document.getElementById('wishButton');
            const heartCountSpan = document.getElementById('heartCount');

            if (button) {
                button.style.backgroundColor = !movieData.isHearted
                    ? '#FF3366'
                    : '#4080ff';
            }

            if (heartCountSpan) {
                heartCountSpan.textContent = updatedHeartCount.toLocaleString();
            }
        } catch (error) {
            console.error('Error updating wish status:', error);
            updateSnackbar('찜하기/찜해제 처리에 실패했습니다.', 'error');
        }
    };

    const handleCommentChange = (event) => {
        if (userComment) {
            setMyComment(event.target.value);
        } else {
            setComment(event.target.value);
        }
    };

    const handleSubmitComment = async () => {
        if (myRating === 0) {
            updateSnackbar('별점을 입력해주세요.', 'warning');
            return;
        }
        const currentComment = userComment ? myComment : comment;
        if (currentComment.trim() === '') {
            updateSnackbar('코멘트를 입력해주세요.', 'warning');
            return;
        }

        const requestBody = {
            score: myRating,
            comment: currentComment,
        };

        try {
            if (userCommentId) {
                await axiosInstance.put(
                    `/movies/comments/${userCommentId}`,
                    requestBody
                );
                updateSnackbar('코멘트가 수정되었습니다.', 'success');
            } else {
                await axiosInstance.post(`/movies/${movieId}/comments`, requestBody);
                updateSnackbar('코멘트가 저장되었습니다.', 'success');
            }

            fetchUserComment();
            fetchComments(0);
        } catch (error) {
            console.error('코멘트 저장/수정 실패:', error);
            updateSnackbar('코멘트 저장/수정에 실패했습니다.', 'error');
        } finally {
            setComment('');
            setMyRating(0);
            setShowCommentInput(false);
        }
    };

    const handleDeleteComment = async () => {
        if (!userCommentId) return;

        try {
            await axiosInstance.delete(`/movies/comments/${userCommentId}`);
            updateSnackbar('코멘트가 삭제되었습니다.', 'success');
            fetchUserComment();
            fetchComments(0);
        } catch (error) {
            console.error('Error deleting comment:', error);
            updateSnackbar('코멘트 삭제에 실패했습니다.', 'error');
        }
    };

    const handleShowMoreCrews = () => {
        setShowMoreCrews(true);
        setVisibleCrews(crews);
    };

    const handleShowLessCrews = () => {
        setShowMoreCrews(false);
        setVisibleCrews(crews.slice(0, initialVisibleCrews));
    };

    const handleLoadMore = () => {
        setIsInitialLoad(false);
        fetchComments(page);
        setShowLessComments(true);
    };

    const handleShowLessComments = () => {
        setComments(comments.slice(0, 4));
        setShowLessComments(false);
        setHasMore(true);
        setPage(1);
        setIsInitialLoad(true);
    };

    const handleLikeClick = async (commentId, isLiked) => {
        try {
            if (isLiked) {
                await axiosInstance.delete(`/movies/comments/${commentId}/likes`);
                updateSnackbar('좋아요를 취소했습니다.', 'success');
            } else {
                await axiosInstance.post(`/movies/comments/${commentId}/likes`);
                updateSnackbar('좋아요를 눌렀습니다.', 'success');
            }

            fetchComments(0);
        } catch (error) {
            console.error('Error updating like status:', error);
            updateSnackbar('좋아요/좋아요 취소 처리에 실패했습니다.', 'error');
        }
    };

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating / 2);
        const halfStar = rating % 2 === 1;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

        return (
            <>
                {[...Array(fullStars)].map((_, index) => (
                    <FaStar key={`full-${index}`} className="starFilled"/>
                ))}
                {halfStar && <FaStarHalfAlt className="starFilled"/>}
                {[...Array(emptyStars)].map((_, index) => (
                    <FaRegStar key={`empty-${index}`} className="starEmpty"/>
                ))}
            </>
        );
    };

    if (!movieData) {
        return <div className="loading">Loading...</div>;
    }

    const uniqueGenres = new Set();
    if (relatedBooks) {
        relatedBooks.forEach((book) => {
            if (book.genres && Array.isArray(book.genres)) {
                book.genres.forEach((genre) => uniqueGenres.add(genre.genreName));
            }
        });
    }
    const uniqueGenreList = Array.from(uniqueGenres);


    const handleJoinGroupChatroom = async (movieId) => {
        try {

            toChatRoomUrl(false); // 해당 채팅방 페이지로 이동

            const selectedCard = {
                movieId: movieId,
                posterPath: movieData.posterUrl,
                title: movieData.title,
                voteAverage: movieData.voteAverage,
                crew: visibleCrews.map(crew => crew.name),
                movieGenre: genres.map(genre => ({
                    ...genre,
                    genreName: genre.name
                })),
            };
            console.log(selectedCard);

            // 모달창 호출 후 fromNoti를 false로 설정
            params.set('fromNoti', 'false');
            navigate({search: params.toString()}, {replace: true});

            handleOpenGroupChatInfoModal(selectedCard, "movie");


        } catch (err) {
            console.error('Error fetching room info:', err);
        }
    }

    // 해당 채팅방 페이지로 이동
    const toChatRoomUrl = async (shouldShowAlert = false) => {
        const param = {
            contentId: movieId,
            contentType: "movie",
        };

        const response = await axiosInstance.post(`/chat/group/checkJoin`, param);
        const checkJoinedRes = response.data;
        const isJoined = checkJoinedRes.isJoined;
        console.log('%%%% 가입여부 ' + JSON.stringify(response, null, 2));
        if (isJoined === true ) {
            if (shouldShowAlert === false) { // 매개변수를 사용하여 알림 표시 여부 결정 **//*******
                alert("이미 가입된 채팅방입니다. ");
            }
            var url = checkJoinedRes.url;
            if (url) {
                url += '?fromNoti=true';
                if (url.startsWith('http')) {
                    window.location.href = url; // 절대 URL로 이동
                } else {
                    navigate(url); // 상대 URL로 이동
                }
            }

            // fromNoti를 false로 설정하고 URL 업데이트
            // params.set('fromNoti', 'false');
            // navigate({search: params.toString()}, {replace: true});

            return;
        }
    }

    const handleJoinRoom = async (existingRoomInfo) => {
        if (!existingRoomInfo || !existingRoomInfo.groupChatroomId) {
            alert("채팅방 정보가 유효하지 않습니다.");
            return;
        }

        const groupChatroomId = existingRoomInfo.groupChatroomId;
        try {
            const response = await axiosInstance.post(`/chat/group/${groupChatroomId}`);
            alert("채팅방 가입에 성공하였습니다.");
            setRefreshKey(prevKey => prevKey + 1);
            handleCloseGroupChatInfoModal();
            toChatRoomUrl(true); // 해당 채팅방 페이지로 이동
        } catch (err) {
            alert("채팅방 가입에 실패했습니다.");
        }
    };


    const handleOpenGroupChatInfoModal = (card, category) => {
        setSelectedCard(card);
        setSelectedCategory(category);
        setIsGetGroupChatInfoModalOpen(true);
    };
    const handleCloseGroupChatInfoModal = () => {
        setIsGetGroupChatInfoModalOpen(false);
        setSelectedCard(null);
        setSelectedCategory(null);
    };


    const handleOpenGroupChatNameModal = (card, category) => {
        setSelectedCard(card);
        setSelectedCategory(category);
        setIsCreateGroupChatNameModalOpen(true);
    };

    const handleCloseGroupChatNameModal = () => {
        setIsCreateGroupChatNameModalOpen(false);
        setSelectedCard(null);
        setSelectedCategory(null);
    };


    return (
        <div className="container">
            <div
                className="header"
                style={{
                    backgroundImage: `url(http://image.tmdb.org/t/p/original${movieData.backdropUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    color: 'white',
                }}
            >
                <div className="breadcrumbs">
                    홈 / 영화 / {movieData.title}
                </div>
                <div className="title">{movieData.title}</div>
                <div className="subtitle">
                    {movieData.releaseDate
                        ? movieData.releaseDate.substring(0, 4)
                        : ''}{' '}
                    ・{' '}
                    {genres.map((genre, index) => (
                        <span key={index}>
              {genre.name}
                            {index < genres.length - 1 ? ', ' : ''}
            </span>
                    ))}{' '}
                    ・ {movieData.country}
                </div>
            </div>

            <div className="mainContent">
                <div className="poster">
                    <img src={movieData.posterUrl} alt={movieData.title}/>
                    <button
                        id="groupChatButton"
                        // className="button"
                        className="button-common join-button"
                        onClick={() => handleJoinGroupChatroom(movieId)}
                    >
                        그룹채팅 입장
                    </button>
                </div>

                <div className="info">
                    <div className="ratingAndWish">
                        <div className="myRating">
                            <span className="ratingLabel">내 별점</span>
                            <div className="stars">
                                {[...Array(5)].map((_, index) => {
                                    const starIndex = (index + 1);
                                    const rating = myRating === 0 ? hoverRating : myRating;
                                    return (
                                        <span
                                            key={index}
                                            onClick={(e) => handleRatingClick(starIndex * 2, e)}
                                            style={{cursor: 'pointer', position: 'relative', display: 'inline-block'}}
                                            onMouseMove={(e) => {
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                const x = e.clientX - rect.left;
                                                const halfWidth = rect.width / 2;

                                                if (x <= halfWidth) {
                                                    setHoverRating(starIndex * 2 - 1);
                                                } else {
                                                    setHoverRating(starIndex * 2);
                                                }
                                            }}
                                            onMouseLeave={() => {
                                                setHoverRating(0);
                                            }}
                                        >
                                            {starIndex * 2 <= rating ? (
                                                <FaStar className="starFilled"/>
                                            ) : starIndex * 2 === rating + 1 ? (
                                                <FaStarHalfAlt className="starFilled"/>
                                            ) : (
                                                <FaRegStar className="starEmpty"/>
                                            )}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="averageRating">
                            <span className="ratingLabel">평균 별점</span>
                            <div className="starsAndProgress">
                                <div className="stars">
                                    {renderStars(movieData.voteAverage)}
                                </div>
                                <div className="progressBarContainer">
                                    <CircularProgressbar
                                        value={movieData.voteAverage * 10}
                                        maxValue={100}
                                        text={`${Math.round(movieData.voteAverage * 10) / 10}`}
                                        styles={buildStyles({
                                            textSize: '22px',
                                            pathColor: '#f8d90f',
                                            textColor: '#000000',
                                            trailColor: '#d6d6d6',
                                        })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="buttonGroup">
                            <button
                                id="wishButton"
                                className={`heart-button ${movieData.isHearted ? 'button-hearted' : 'button-not-hearted'}`}
                                onClick={handleWishClick}
                            >
                                {movieData.isHearted ? <FaHeart className="wishIcon"/> : <FaRegHeart className="wishIcon"/>}
                            </button>
                            <span id="heartCount" className="heartCountContainer">
                {movieData.heartCount.toLocaleString()}
              </span>
                        </div>
                    </div>

                    {userComment && userComment.score > 0 && (
                        <div className="userCommentDisplay">
                            <div className="userInfo">
                                {userComment.profileImgUrl ? (
                                    <img
                                        src={userComment.profileImgUrl}
                                        alt="프로필 이미지"
                                        className="profileImage"
                                    />
                                ) : (
                                    <FaUserCircle className="defaultProfileIcon"/>
                                )}
                                <span className="userNickname">{userComment.nickname}</span>
                            </div>
                            <div className="userCommentContent">
                                <FaComment className="commentIcon"/>
                                <p className="userCommentText">{userComment.comment}</p>
                            </div>
                        </div>
                    )}

                    {myRating > 0 && showCommentInput && (
                        <div className="commentSection">
                            <textarea
                                className="commentInput"
                                placeholder="이 작품에 대한 생각을 자유롭게 표현해주세요"
                                value={userComment ? myComment : comment}
                                onChange={handleCommentChange}
                            />
                            <button className="submit-button" onClick={handleSubmitComment}>
                                <FaCheck className="editDeleteIcon"/> {/* FaCheck 아이콘으로 변경 */}
                            </button>
                        </div>
                    )}

                    {!showCommentInput && userComment && (
                        <div className="commentActions">
                            <button
                                className="edit-button"
                                onClick={() => {
                                    setMyRating(userComment.score);
                                    setMyComment(userComment.comment);
                                    setShowCommentInput(true);
                                }}
                            >
                                <FaEdit className="editDeleteIcon"/>
                            </button>
                            <button className="delete-button" onClick={handleDeleteComment}>
                                <FaTrashAlt className="editDeleteIcon"/>
                            </button>
                        </div>
                    )}

                    <div style={{marginTop: '20px'}}/>

                    <div className="details">
                        <div className="section">
                            <div className="sectionTitle">줄거리</div>
                            <div className="sectionContent">{movieData.overview}</div>
                        </div>

                        <div className="section">
                            <div className="sectionTitle">출연/제작</div>
                            <div className="sectionContent">
                                <div className="crewGrid">
                                    {visibleCrews.map((crew) => (
                                        <div key={crew.name} className="crewMember">
                                            <img
                                                src={
                                                    crew.profileImgUrl
                                                        ? 'http://image.tmdb.org/t/p/w200' +
                                                        crew.profileImgUrl
                                                        : '/default-profile-image.jpg'
                                                }
                                                alt={crew.name}
                                                className="crewImage"
                                            />
                                            <div className="crewInfo">
                                                <div className="crewName">{crew.name}</div>
                                                <div className="crewCharName">
                                                    {crew.charName}
                                                </div>
                                                <div className="crewRole">
                                                    {crew.role === 'CAST'
                                                        ? '출연'
                                                        : crew.role === 'DIRECTOR'
                                                            ? '감독'
                                                            : crew.role}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {!showMoreCrews && crews.length > initialVisibleCrews && (
                                    <div className="moreButtonContainer">
                                        <button
                                            className="more-btn"
                                            onClick={handleShowMoreCrews}
                                        >
                                            더보기
                                        </button>
                                    </div>
                                )}
                                {showMoreCrews && (
                                    <div className="moreButtonContainer">
                                        <button
                                            className="more-btn"
                                            onClick={handleShowLessCrews}
                                        >
                                            더보기 취소
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="section">
                            <div className="sectionTitle">
                                코멘트{' '}
                                <span className="commentCount">
                  {totalComments.toLocaleString()}
                </span>
                            </div>

                            <div className="sectionContent">
                                {comments.map((comment) => (
                                    <div key={comment.movieCommentId} className="commentItem">
                                        <div className="commentHeader">
                                            <Link
                                                to={
                                                    comment.memberId === currentMemberId
                                                        ? `/mypage`
                                                        : `/members/${comment.memberId}`
                                                }
                                                className="comment-user-link"
                                                // className="commentUserInfo"
                                            >
                                                {comment.profileImgUrl ? (
                                                    <img
                                                        src={comment.profileImgUrl}
                                                        alt="프로필 이미지"
                                                        className="commentProfileImage"
                                                    />
                                                ) : (
                                                    <FaUserCircle className="defaultProfileIcon"/>
                                                )}
                                                <span className="commentUser">{comment.nickname}</span>
                                            </Link>
                                            <div className="commentActions">
                                                <div className="commentRating">
                                                    {[...Array(5)].map((_, index) => {
                                                        const starIndex = (index + 1);
                                                        return (
                                                            <span key={index} style={{display: 'inline-block'}}>
                                                                {starIndex * 2 <= comment.score ? (
                                                                    <FaStar className="commentStarFilled"/>
                                                                ) : starIndex * 2 === comment.score + 1 ? (
                                                                    <FaStarHalfAlt className="commentStarFilled"/>
                                                                ) : (
                                                                    <FaRegStar className="commentStarEmpty"/>
                                                                )}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                                <div className="likeContainer">
                                                    <button
                                                        className="likeButton"
                                                        onClick={() => handleLikeClick(comment.movieCommentId, comment.isLiked)}
                                                    >
                                                        {comment.isLiked ? <FaHeart className="likedIcon"/> :
                                                            <FaRegHeart className="likeIcon"/>}
                                                    </button>
                                                    <span
                                                        className="likeCountContainer">{comment.commentLikeCount}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="commentContent">
                                            <FaComment className="commentIcon"/>
                                            <p className="commentText">{comment.comment}</p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={loader}/>
                                {hasMore && isInitialLoad && (
                                    <div className="moreButtonContainer">
                                        <button className="moreButton" onClick={handleLoadMore}>
                                            더보기
                                        </button>
                                    </div>
                                )}
                                {showLessComments && (
                                    <div className="moreButtonContainer">
                                        <button className="moreButton" onClick={handleShowLessComments}>
                                            더보기 취소
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="section">
                            <div className="sectionTitle">관련 영화 추천</div>
                            <div className="sectionContent">
                                {relatedMoviesLoading && <p>Loading related movies...</p>}
                                {relatedMoviesError && (
                                    <div>
                                        <p>Error loading related movies.</p>
                                    </div>
                                )}
                                {!relatedMoviesLoading && !relatedMoviesError && (
                                    <MovieCarousel
                                        movies={relatedMovies}
                                        startIndex={relatedMoviesStartIndex}
                                        handleNext={handleRelatedMoviesNext}
                                        handlePrev={handleRelatedMoviesPrev}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="section">
                            <div className="sectionTitle">관련 도서 추천</div>

                            <div className="sectionContent">
                                <BookCarouselRecommend
                                    books={recommendedBooks}
                                    startIndex={startIndexRecommended}
                                    handlePrev={handlePrevRecommended}
                                    handleNext={handleNextRecommended}
                                />
                            </div>
                        </div>

                        {/*<div className="section">*/}
                        {/*    <div className="sectionTitle">관련 도서 추천</div>*/}
                        {/*    <div className="sectionContent">*/}
                        {/*        {relatedBooksLoading && <p>Loading related books...</p>}*/}
                        {/*        {relatedBooksError && (*/}
                        {/*            <div>*/}
                        {/*                <p>Error loading related books.</p>*/}
                        {/*            </div>*/}
                        {/*        )}*/}
                        {/*        {!relatedBooksLoading && !relatedBooksError && (*/}
                        {/*            <BookGenreCarousel*/}
                        {/*                books={relatedBooks}*/}
                        {/*                startIndex={relatedBooksStartIndex}*/}
                        {/*                handleNext={handleRelatedBooksNext}*/}
                        {/*                handlePrev={handleRelatedBooksPrev}*/}
                        {/*            />*/}
                        {/*        )}*/}
                        {/*    </div>*/}
                        {/*</div>*/}
                    </div>
                </div>
                <GetGroupChatInfoModal
                    isOpen={isGetGroupChatInfoModalOpen}
                    onClose={handleCloseGroupChatInfoModal}
                    selectedCard={selectedCard}
                    selectedCategory={selectedCategory}
                    onConfirm={(card, category) => handleOpenGroupChatNameModal(card, category)}
                    onJoin={handleJoinRoom}
                />
                <CreateGroupChatNameModal
                    isOpen={isCreateGroupChatNameModalOpen}
                    onClose={handleCloseGroupChatNameModal}
                    selectedCard={selectedCard}
                    selectedCategory={selectedCategory}
                    onUpdateChatList={() => {
                        setRefreshKey(prevKey => prevKey + 1);
                    }}
                />
            </div>
        </div>
    );
}

export default MovieDetailPage;