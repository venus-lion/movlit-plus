import React, {useEffect, useRef, useState, useContext} from 'react';
import {Link, useParams} from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import {FaComment, FaHeart, FaRegHeart, FaRegStar, FaStar, FaStarHalfAlt, FaUserCircle,} from 'react-icons/fa';
import MovieCarousel from '../pages/MovieCarousel';
import useAuthMovieList from '../hooks/useAuthMovieList';
import useBookList from '../hooks/useBookList';
import BookGenreCarousel from '../pages/BookGenreCarousel';
import {buildStyles, CircularProgressbar} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import GetGroupChatInfoModal from "./chat/GetGroupChatInfoModal.jsx";
import CreateGroupChatNameModal from "./chat/CreateGroupChatNameModal.jsx";
import './MovieDetailPage.css'; // CSS 파일 import
import {AppContext} from "../App.jsx"; // AppContext import

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
    const { updateSnackbar } = useContext(AppContext); // updateSnackbar context 함수 import

    const initialVisibleCrews = 14;

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
                    <FaStar key={`full-${index}`} style={styles.starFilled}/>
                ))}
                {halfStar && <FaStarHalfAlt style={styles.starFilled}/>}
                {[...Array(emptyStars)].map((_, index) => (
                    <FaRegStar key={`empty-${index}`} style={styles.starEmpty}/>
                ))}
            </>
        );
    };

    if (!movieData) {
        return <div style={styles.loading}>Loading...</div>;
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
            const param = {
                contentId: movieId,
                contentType: "movie",
            };

            const response = await axiosInstance.post(`/chat/group/checkJoin`, param);
            const isJoined = response.data
            if (isJoined === true) {
                alert("이미 가입된 채팅방입니다.");
                return;
            }

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
            handleOpenGroupChatInfoModal(selectedCard, "movie");

        } catch (err) {
            console.error('Error fetching room info:', err);
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
        <div style={styles.container}>
            <div
                style={{
                    ...styles.header,
                    backgroundImage: `url(http://image.tmdb.org/t/p/original${movieData.backdropUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    color: 'white',
                }}
            >
                <div style={styles.breadcrumbs}>
                    홈 / 영화 / {movieData.title}
                </div>
                <div style={styles.title}>{movieData.title}</div>
                <div style={styles.subtitle}>
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

            <div style={styles.mainContent}>
                <div style={styles.poster}>
                    <img src={movieData.posterUrl} alt={movieData.title}/>
                    <button
                        id="groupChatButton"
                        style={{
                            ...styles.button,
                            backgroundColor: '#FF3366',
                            marginTop: '20px',
                        }}
                        onClick={() => handleJoinGroupChatroom(movieId)}
                    >
                        그룹채팅 입장
                    </button>
                </div>

                <div style={styles.info}>
                    <div style={styles.ratingAndWish}>
                        <div style={styles.myRating}>
                            <span style={styles.ratingLabel}>내 별점</span>
                            <div style={styles.stars}>
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
                                                <FaStar style={styles.starFilled}/>
                                            ) : starIndex * 2 === rating + 1 ? (
                                                <FaStarHalfAlt style={styles.starFilled}/>
                                            ) : (
                                                <FaRegStar style={styles.starEmpty}/>
                                            )}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                        <div style={styles.averageRating}>
                            <span style={styles.ratingLabel}>평균 별점</span>
                            <div style={styles.starsAndProgress}>
                                <div style={styles.stars}>
                                    {renderStars(movieData.voteAverage)}
                                </div>
                                <div style={styles.progressBarContainer}>
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
                        <div style={styles.buttonGroup}>
                            <button
                                id="wishButton"
                                style={{
                                    ...styles.button,
                                    backgroundColor: movieData.isHearted
                                        ? '#FF3366'
                                        : '#4080ff',
                                }}
                                onClick={handleWishClick}
                            >
                                {movieData.isHearted ? '찜 완료' : '찜'}
                            </button>
                            <span id="heartCount" style={styles.heartCountContainer}>
                {movieData.heartCount.toLocaleString()}
              </span>
                        </div>
                    </div>

                    {userComment && userComment.score > 0 && (
                        <div style={styles.userCommentDisplay}>
                            <div style={styles.userInfo}>
                                {userComment.profileImgUrl ? (
                                    <img
                                        src={userComment.profileImgUrl}
                                        alt="프로필 이미지"
                                        style={styles.profileImage}
                                    />
                                ) : (
                                    <FaUserCircle style={styles.defaultProfileIcon}/>
                                )}
                                <span style={styles.userNickname}>{userComment.nickname}</span>
                            </div>
                            <div style={styles.userCommentContent}>
                                <FaComment style={styles.commentIcon}/>
                                <p style={styles.userCommentText}>{userComment.comment}</p>
                            </div>
                        </div>
                    )}

                    {myRating > 0 && showCommentInput && (
                        <div style={styles.commentSection}>
                            <textarea
                                style={styles.commentInput}
                                placeholder="이 작품에 대한 생각을 자유롭게 표현해주세요"
                                value={userComment ? myComment : comment}
                                onChange={handleCommentChange}
                            />
                            <button style={styles.submitButton} onClick={handleSubmitComment}>
                                {userComment ? '수정하기' : '코멘트 남기기'}
                            </button>
                        </div>
                    )}

                    {!showCommentInput && userComment && (
                        <div style={styles.commentActions}>
                            <button
                                style={styles.editButton}
                                onClick={() => {
                                    setMyRating(userComment.score);
                                    setMyComment(userComment.comment);
                                    setShowCommentInput(true);
                                }}
                            >
                                수정하기
                            </button>
                            <button style={styles.deleteButton} onClick={handleDeleteComment}>
                                삭제하기
                            </button>
                        </div>
                    )}

                    <div style={{marginTop: '20px'}}/>

                    <div style={styles.details}>
                        <div style={styles.section}>
                            <div style={styles.sectionTitle}>줄거리</div>
                            <div style={styles.sectionContent}>{movieData.overview}</div>
                        </div>

                        <div style={styles.section}>
                            <div style={styles.sectionTitle}>출연/제작</div>
                            <div style={styles.sectionContent}>
                                <div style={styles.crewGrid}>
                                    {visibleCrews.map((crew) => (
                                        <div key={crew.name} style={styles.crewMember}>
                                            <img
                                                src={
                                                    crew.profileImgUrl
                                                        ? 'http://image.tmdb.org/t/p/w200' +
                                                        crew.profileImgUrl
                                                        : '/default-profile-image.jpg'
                                                }
                                                alt={crew.name}
                                                style={styles.crewImage}
                                            />
                                            <div style={styles.crewInfo}>
                                                <div style={styles.crewName}>{crew.name}</div>
                                                <div style={styles.crewCharName}>
                                                    {crew.charName}
                                                </div>
                                                <div style={styles.crewRole}>
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
                                    <div style={styles.moreButtonContainer}>
                                        <button
                                            style={styles.moreButton}
                                            onClick={handleShowMoreCrews}
                                        >
                                            더보기
                                        </button>
                                    </div>
                                )}
                                {showMoreCrews && (
                                    <div style={styles.moreButtonContainer}>
                                        <button
                                            style={styles.moreButton}
                                            onClick={handleShowLessCrews}
                                        >
                                            더보기 취소
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={styles.section}>
                            <div style={styles.sectionTitle}>
                                코멘트{' '}
                                <span style={styles.commentCount}>
                  {totalComments.toLocaleString()}
                </span>
                            </div>

                            <div style={styles.sectionContent}>
                                {comments.map((comment) => (
                                    <div key={comment.movieCommentId} style={styles.commentItem}>
                                        <div style={styles.commentHeader}>
                                            <Link
                                                to={
                                                    comment.memberId === currentMemberId
                                                        ? `/mypage`
                                                        : `/members/${comment.memberId}`
                                                }
                                                className="comment-user-link"
                                                style={styles.commentUserInfo}
                                            >
                                                {comment.profileImgUrl ? (
                                                    <img
                                                        src={comment.profileImgUrl}
                                                        alt="프로필 이미지"
                                                        style={styles.commentProfileImage}
                                                    />
                                                ) : (
                                                    <FaUserCircle style={styles.defaultProfileIcon}/>
                                                )}
                                                <span style={styles.commentUser}>{comment.nickname}</span>
                                            </Link>
                                            <div style={styles.commentActions}>
                                                <div style={styles.commentRating}>
                                                    {[...Array(5)].map((_, index) => {
                                                        const starIndex = (index + 1);
                                                        return (
                                                            <span key={index} style={{display: 'inline-block'}}>
                                                                {starIndex * 2 <= comment.score ? (
                                                                    <FaStar style={styles.commentStarFilled}/>
                                                                ) : starIndex * 2 === comment.score + 1 ? (
                                                                    <FaStarHalfAlt style={styles.commentStarFilled}/>
                                                                ) : (
                                                                    <FaRegStar style={styles.commentStarEmpty}/>
                                                                )}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                                <div style={styles.likeContainer}>
                                                    <button
                                                        style={styles.likeButton}
                                                        onClick={() => handleLikeClick(comment.movieCommentId, comment.isLiked)}
                                                    >
                                                        {comment.isLiked ? <FaHeart style={styles.likedIcon}/> :
                                                            <FaRegHeart style={styles.likeIcon}/>}
                                                    </button>
                                                    <span
                                                        style={styles.likeCountContainer}>{comment.commentLikeCount}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={styles.commentContent}>
                                            <FaComment style={styles.commentIcon}/>
                                            <p style={styles.commentText}>{comment.comment}</p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={loader}/>
                                {hasMore && isInitialLoad && (
                                    <div style={styles.moreButtonContainer}>
                                        <button style={styles.moreButton} onClick={handleLoadMore}>
                                            더보기
                                        </button>
                                    </div>
                                )}
                                {showLessComments && (
                                    <div style={styles.moreButtonContainer}>
                                        <button style={styles.moreButton} onClick={handleShowLessComments}>
                                            더보기 취소
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={styles.section}>
                            <div style={styles.sectionTitle}>관련 영화 추천</div>
                            <div style={styles.sectionContent}>
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

                        <div style={styles.section}>
                            <div style={styles.sectionTitle}>관련 도서 추천</div>
                            <div style={styles.sectionContent}>
                                {relatedBooksLoading && <p>Loading related books...</p>}
                                {relatedBooksError && (
                                    <div>
                                        <p>Error loading related books.</p>
                                    </div>
                                )}
                                {!relatedBooksLoading && !relatedBooksError && (
                                    <BookGenreCarousel
                                        books={relatedBooks}
                                        startIndex={relatedBooksStartIndex}
                                        handleNext={handleRelatedBooksNext}
                                        handlePrev={handleRelatedBooksPrev}
                                    />
                                )}
                            </div>
                        </div>
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


const styles = {
    container: {
        width: '100%',
        fontFamily: 'Arial, sans-serif',
    },
    header: {
        padding: '210px 20px',
        borderBottom: '1px solid #e7e7e7',
        marginBottom: '20px',
    },
    breadcrumbs: {
        marginBottom: '10px',
        fontSize: '14px',
        color: '#ffffff',
    },
    title: {
        fontSize: '28px',
        fontWeight: 'bold',
        marginBottom: '5px',
        color: '#ffffff',
    },
    subtitle: {
        fontSize: '16px',
        color: '#ffffff',
    },
    mainContent: {
        display: 'flex',
        padding: '20px',
    },
    poster: {
        width: '200px',
        marginRight: '30px',
        flexShrink: 0,

        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    info: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    ratingAndWish: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    myRating: {
        //marginBottom: '20px',
    },
    ratingLabel: {
        fontSize: '18px',
        fontWeight: 'bold',
        marginRight: '10px',
        color: '#000000',
    },
    stars: {
        display: 'inline-block',
        alignItems: 'center',
        //marginLeft: '10px',
    },
    starFilled: {
        color: '#f8d90f',
        cursor: 'pointer',
        fontSize: '40px',
    },
    starEmpty: {
        color: '#ccc',
        cursor: 'pointer',
        fontSize: '40px',
    },
    starIcon: {
        fontSize: '40px',
    },
    buttonGroup: {
        display: 'flex',
        alignItems: 'center',
    },
    button: {
        //marginRight: '10px',
        padding: '10px 20px',
        //backgroundColor: '#4080ff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    details: {
        marginTop: 'auto',
    },
    section: {
        marginBottom: '20px',
    },
    sectionTitle: {
        fontSize: '20px',
        fontWeight: 'bold',
        marginBottom: '10px',
        color: '#000000',
    },
    sectionContent: {
        color: '#000000',
    },
    book: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10px',
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
    },
    crewGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '10px',
    },
    crewMember: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
    },
    crewImage: {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        objectFit: 'cover',
        marginBottom: '5px',
    },
    crewInfo: {},
    crewName: {
        fontWeight: 'bold',
        color: '#000000',
    },
    crewCharName: {
        color: '#000000',
    },
    crewRole: {
        fontSize: '0.9em',
        color: '#000000',
    },
    commentSection: {
        marginTop: '20px',
        display: 'flex',
        flexDirection: 'column',
    },
    commentInput: {
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        marginBottom: '10px',
        resize: 'vertical',
        height: '100px',
    },
    submitButton: {
        padding: '10px 20px',
        backgroundColor: '#4080ff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        alignSelf: 'flex-end',
    },
    commentCount: {
        fontSize: '16px',
        color: '#656565',
    },
    commentItem: {
        borderBottom: '1px solid #ccc',
        padding: '10px 0',
    },
    commentHeader: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '5px',
        justifyContent: 'space-between'
    },
    commentStarFilled: {
        color: '#f8d90f',
        marginLeft: '5px',
    },
    commentStarEmpty: {
        color: '#ccc',
        marginLeft: '5px',
    },
    commentText: {
        color: '#000000',
    },
    moreButtonContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '10px',
    },
    moreButton: {
        padding: '5px 10px',
        backgroundColor: '#4080ff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    userCommentDisplay: {
        marginTop: '20px',
        padding: '15px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        backgroundColor: '#f8f8f8',
    },
    commentActions: {
        marginTop: '10px',
        display: 'flex',
        gap: '10px',
        justifyContent: 'flex-end',
    },
    deleteButton: {
        padding: '10px 20px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    editButton: {
        padding: '10px 20px',
        backgroundColor: '#ffc107',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10px',
    },
    profileImage: {
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        marginRight: '5px',
    },
    userNickname: {
        fontWeight: 'bold',
    },
    heartCountContainer: {
        marginLeft: '8px',
        padding: '4px 8px',
        backgroundColor: '#f2f2f2',
        borderRadius: '10px',
        border: '1px solid #ccc',
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#333',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    likeButton: {
        marginLeft: '10px',
        padding: '0px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
        background: 'none',
    },
    likeIcon: {
        color: '#4080ff',
        fontSize: '1.2em',
    },
    likedIcon: {
        color: '#FF3366',
        fontSize: '1.2em',
    },
    likeContainer: {
        display: 'flex',
        alignItems: 'center',
    },
    likeCountContainer: {
        marginLeft: '5px',
        padding: '3px 6px',
        backgroundColor: '#f2f2f2',
        borderRadius: '8px',
        border: '1px solid #ccc',
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#333',
    },
    defaultProfileIcon: {
        fontSize: '30px',
        color: '#999',
        marginRight: '10px',
    },
    userCommentContent: {
        display: 'flex',
    },
    commentIcon: {
        fontSize: '18px',
        color: '#666',
        marginRight: '5px',
        marginTop: '3px'
    },
    userCommentText: {
        fontSize: '14px',
        lineHeight: '1.4',
    },
    commentUserInfo: {
        display: 'flex',
        alignItems: 'center',
    },
    commentUser: {
        fontWeight: 'bold',
        marginRight: '5px',
    },
    commentProfileImage: {
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        marginRight: '5px',
    },
    commentRating: {
        display: 'flex',
        alignItems: 'center',
        marginLeft: 'auto',
    },
    commentScore: {
        marginLeft: '5px',
        color: '#000000',
    },
    commentContent: {
        display: 'flex',
        alignItems: 'flex-start',
        marginLeft: '5px',
    },
    averageRating: {
        marginLeft: '20px',
        display: 'flex',
        alignItems: 'center',
    },
    voteAverage: {
        marginLeft: '10px',
        fontSize: '16px',
        color: '#000000',
    },
    starsAndProgress: {
        display: 'flex',
        alignItems: 'center',
    },
    progressBarContainer: {
        width: '60px',
        marginLeft: '15px',
    }
};

export default MovieDetailPage;