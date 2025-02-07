import React, {useEffect, useRef, useState} from 'react';
import {Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import {FaComment, FaHeart, FaRegHeart, FaRegStar, FaStar, FaStarHalfAlt, FaUserCircle,} from 'react-icons/fa';
import BookCarouselRecommend from "../pages/BookCarouselRecommend.jsx";
import {buildStyles, CircularProgressbar} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import MovieCarousel from "../pages/MovieCarousel.jsx";
import CreateGroupChatNameModal from "./chat/CreateGroupChatNameModal.jsx";
import GetGroupChatInfoModal from "./chat/GetGroupChatInfoModal.jsx";
import './BookDetailPage.css'; // CSS 파일 import

function BookDetailPage() {
    const {bookId} = useParams();
    const [bookData, setBookData] = useState(null);

    const [myRating, setMyRating] = useState(0); // 0~10 사이의 값 (0.5 단위)
    const [hoverRating, setHoverRating] = useState(0); // 마우스 호버 시 별점 상태
    const [dbRating, setDbRating] = useState(0); // 최신 별점 저장
    const [myComment, setMyComment] = useState('');
    const [crews, setCrews] = useState([]);
    const [member, setMember] = useState(null);
    const [isWish, setIsWish] = useState(false);
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
    const [bookCommentId, setBookCommentId] = useState(null);
    const loader = useRef(null);

    // 추천 책 리스트
    const [recommendedBooks, setRecommendedBooks] = useState([]); // 전체 도서 목록
    const [startIndex, setStartIndex] = useState(0); // 화면에 보이는 도서 시작 인덱스
    const [startIndexRecommended, setStartIndexRecommended] = useState(0);

    // 추천 영화 리스트
    const [recommendedMovies, setRecommendedMovies] = useState([]); // 전체 영화 목록
    const [mStartIndex, setMStartIndex] = useState(0); // 화면에 보이는 영화 시작 인덱스
    const [mStartIndexRecommended, setMStartIndexRecommended] = useState(0);

    const [isGetGroupChatInfoModalOpen, setIsGetGroupChatInfoModalOpen] = useState(false); // 채팅방 존재여무 모달 열림 상태
    const [isCreateGroupChatNameModalOpen, setIsCreateGroupChatNameModalOpen] = useState(false); // 모달2 열림 상태
    const [selectedCard, setSelectedCard] = useState(null); // 선택된 데이터
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0); // 채팅 리스트 새로고침 키 추가
    const [currentMemberId, setCurrentMemberId] = useState(null); // 현재 로그인된 memberId 상태 추가

    // 알림(새 그룹채팅방 생성됨)을 통해 상세페이지 접속 -> 바로 "그룹채팅방 입장" 모달 띄우기
    const location = useLocation(); // 현재 URL의 location 객체 가져오기
    const params = new URLSearchParams(location.search); // 쿼리 파라미터 읽기
    const navigate = useNavigate();

    useEffect(() => {
        axiosInstance
            .get(`/books/${bookId}/detail`)
            .then((response) => {
                const data = response.data;
                setBookData({
                    booId: data.book_id,
                    isbn: data.isbn,
                    title: data.title,
                    publisher: data.publisher,
                    pubDate: data.pub_date,
                    overview: data.description,
                    bookImgUrl: data.book_img_url,
                    categoryName: data.category_name,
                    stockStatus: data.stock_status,
                    mallUrl: data.mall_url,
                    averageScore: data.average_score,
                    isHearted: data.is_hearted,
                    heartCount: data.heart_count
                });
                setCrews(data.book_crew)
            })
            .catch((error) => console.error('Error fetching book data:', error));



        fetchUserComment();
        fetchComments(0);


        axiosInstance
            .get(`/members/id`)
            .then((response) => {
                setCurrentMemberId(response.data.memberId);
            })
            .catch((error) => console.error('Error fetching member id:', error));
    }, [bookId]);

    // 알림(새 그룹채팅방 생성됨)을 통해 상세페이지 접속 -> 바로 "그룹채팅방 입장" 모달 띄우기
    useEffect(() => {
        const fromNoti = params.get('fromNoti'); // 'fromNoti' 쿼리 파라미터 값을 가져오기

        if (fromNoti === 'true' && bookId && bookData && crews) {
            handleJoinGroupChatroom(bookId, bookData.bookImgUrl, bookData.title, crews);
        }
    }, [bookId, params, bookData, crews]); // bookData와 crews를 의존성 배열에 추가

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

    // 관련 책 추천
    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await axiosInstance.get(`/books/${bookId}/recommendedBooks`);
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

    // 관련 영화 추천
    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await axiosInstance.get(`/books/${bookId}/recommendedMovies`);
                // const response = await axios.get('/api/books/popular', {
                //     params: {limit : 30},
                // });

                //const response = await axiosInstance.get(`/api/books/popular`);
                console.log('#### 추천영화 response 값 :' + response.data);
                setRecommendedMovies(response.data);
            } catch (err) {
                console.error(`Error fetching books : `, err);
            }
        }

        fetchMovies();
    }, []);

    //API에서 책 정보 가져오기
    const handleNext = (startIndex, setStartIndex, length) => {
        const newIndex = startIndex + 5;
        if (newIndex < length) {
            setStartIndex(newIndex);
        }
    };

    const handlePrev = (startIndex, setStartIndex) => {
        const newIndex = startIndex - 5;
        if (newIndex >= 0) {
            setStartIndex(newIndex);
        }
    };
    const mHandleNext = (mStartIndex, setMStartIndex, length) => {
        const newIndex = mStartIndex + 5;
        if (newIndex < length) {
            setMStartIndex(newIndex);
        }
    };

    const mHandlePrev = (mStartIndex, setMStartIndex) => {
        const newIndex = mStartIndex - 5;
        if (newIndex >= 0) {
            setMStartIndex(newIndex);
        }
    };

    const handleNextRecommended = () => handleNext(startIndexRecommended, setStartIndexRecommended, recommendedBooks.length);
    const handlePrevRecommended = () => handlePrev(startIndexRecommended, setStartIndexRecommended);
    const mHandleNextRecommended = () => mHandleNext(mStartIndexRecommended, setMStartIndexRecommended, recommendedMovies.length);
    const mHandlePrevRecommended = () => mHandlePrev(mStartIndexRecommended, setMStartIndexRecommended);

    // 사용자 코멘트 가져오기
    const fetchUserComment = async () => {
        try {
            const response = await axiosInstance.get(`/books/${bookId}/myComment`);
            if (response.data) {
                const {bookCommentId, comment, score, nickname, profileImgUrl, regDt, updDt} =
                    response.data;
                setUserComment({
                    nickname,
                    profileImgUrl,
                    comment,
                    score,
                    regDt,
                    updDt
                });
                setBookCommentId(bookCommentId);
                setMyRating(score);
                setDbRating(score); // dbRating 업데이트
                setMyComment(comment);
                if (score > 0) {
                    setShowCommentInput(false);
                } else {
                    setShowCommentInput(true);
                }
            } else {
                console.log("## 내 코멘트 없다~~");
                setUserComment(null);
                setBookCommentId(null);
                setMyRating(0);
                setDbRating(0); // dbRating 업데이트
                setMyComment('');
                setShowCommentInput(false);
            }
        } catch (error) {
            console.error('Error fetching user comment:', error);
            setUserComment(null);
            setBookCommentId(null);
        }
    };

    // 코멘트 불러오기
    const fetchComments = (currentPage = 0) => {
        axiosInstance
            .get(`/books/${bookId}/comments?page=${currentPage}`)
            .then((response) => {
                const fetchedTotalComments =
                    response.data.content && response.data.content.length > 0
                        ? response.data.content[0].allCommentsCount
                        : 0;
                setTotalComments(fetchedTotalComments); // 총 댓글 수 업데이트

                // 댓글에 필요한 필드 추가
                const updatedComments = response.data.content.map(comment => ({
                    ...comment,
                    isLiked: comment.liked || false,
                    commentLikeCount: comment.likeCount || 0,
                    profileImgUrl: comment.profileImgUrl || null,
                }));

                if (currentPage === 0) {
                    // 페이지가 0인 경우 처음 댓글 설정
                    setComments(updatedComments); // 새로운 댓글 세팅
                    setHasMore(response.data.content.length > 4 || fetchedTotalComments > 4);
                } else {
                    // 이전 댓글과 새로운 댓글 합치기
                    setComments((prevComments) => {
                        const allComments = [...prevComments, ...updatedComments];
                        const uniqueCommentsMap = {};
                        allComments.forEach(comment => {
                            uniqueCommentsMap[comment.bookCommentId] = comment; // id를 키로 하여 중복 제거
                        });
                        return Object.values(uniqueCommentsMap); // 고유한 댓글 값만 반환
                    });
                    setHasMore(!response.data.last);
                }
                setPage(currentPage + 1);
            })
            .catch((error) => console.error('Error fetching comments:', error));
    };


    // Intersection Observer 콜백 함수
    const handleObserver = (entities) => {
        const target = entities[0];
        if (target.isIntersecting && hasMore && !isInitialLoad) {
            fetchComments(page);
        }
    };

    // 코멘트 별점 클릭 핸들러
    const handleRatingClick = (newRating, e) => {
        // 클릭 위치에 따라 반 별 또는 온전한 별로 설정
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const halfWidth = rect.width / 2;
        const starIndex = newRating / 2;

        if (x <= halfWidth) {
            setMyRating(starIndex * 2 - 1);
        } else {
            setMyRating(starIndex * 2);
        }
        setShowCommentInput(true); // 별점 클릭 시 코멘트 입력란을 보이도록 설정
    };

    // 찜하기/찜해제 처리
    const handleWishClick = async () => {
        try {
            let updatedHeartCount;

            if (bookData.isHearted) {
                // 찜 해제 (DELETE 요청)
                await axiosInstance.delete(`/books/${bookId}/hearts`);
                updatedHeartCount = bookData.heartCount - 1;
                setBookData((prevbookData) => ({
                    ...prevbookData,
                    heartCount: updatedHeartCount,
                    isHearted: false,
                }));
                console.log('찜하기 완료' + updatedHeartCount);
            } else {
                // 찜하기 (POST 요청)
                const bookIdJson = JSON.stringify(bookId);
                const response = await axiosInstance.post(`/books/${bookId}/hearts`);
                updatedHeartCount = bookData.heartCount + 1;
                setBookData((prevbookData) => ({
                    ...prevbookData,
                    heartCount: updatedHeartCount,
                    isHearted: true,
                }));
                console.log('찜하기 완료' + updatedHeartCount);
            }

            // 찜 상태에 따라 버튼 및 카운트 업데이트
            const button = document.getElementById('wishButton');
            const heartCountSpan = document.getElementById('heartCount');

            if (button) {
                button.style.backgroundColor = !bookData.isHearted
                    ? '#FF3366'
                    : '#4080ff';
            }

            // if (heartCountSpan) {
            heartCountSpan.textContent = updatedHeartCount;
            // }
        } catch (error) {
            console.error('Error updating wish status:', error);
            alert('찜하기/찜해제 처리에 실패했습니다.');
        }
    };

    const handleCommentChange = (event) => {
        if (userComment) {
            setMyComment(event.target.value);
        } else {
            setComment(event.target.value);
        }
    };

    // 코멘트 제출
    const handleSubmitComment = async () => {
        if (myRating === 0) {
            alert('별점을 입력해주세요.');
            return;
        }
        const currentComment = userComment ? myComment : comment;
        if (currentComment.trim() === '') {
            alert('코멘트를 입력해주세요.');
            return;
        }

        const requestBody = {
            score: myRating,
            comment: currentComment,
        };

        try {
            if (bookCommentId) {
                // 코멘트 수정 (POST 요청)
                await axiosInstance.post(
                    `/books/${bookId}/comments/${bookCommentId}`,
                    requestBody
                );
                alert('코멘트가 수정되었습니다.');
            } else {
                // 새 코멘트 저장 (POST 요청)
                await axiosInstance.post(`/books/${bookId}/comments`, requestBody);
                alert('코멘트가 저장되었습니다.');
            }

            // 코멘트 상태 업데이트
            fetchUserComment();
            fetchComments(0);
        } catch (error) {
            console.error('코멘트 저장/수정 실패:', error);
            alert('코멘트 저장/수정에 실패했습니다.');
        } finally {
            setComment('');
            setMyRating(0); // 코멘트 제출 후 별점을 다시 0으로 설정
            setShowCommentInput(false);
        }
    };

    // 코멘트 삭제
    const handleDeleteComment = async () => {
        if (!bookCommentId) return;

        try {
            // 코멘트 삭제 (DELETE 요청)
            await axiosInstance.delete(`/books/${bookId}/comments/${bookCommentId}/delete`);
            alert('코멘트가 삭제되었습니다.');
            fetchUserComment();
            fetchComments(0);
        } catch (error) {
            console.error('Error deleting comment:', error);
            alert('코멘트 삭제에 실패했습니다.');
        }
    };


    // 코멘트 더보기 처리
    const handleLoadMore = () => {
        setIsInitialLoad(false);
        fetchComments(page);
        setShowLessComments(true);
    };

    // 코멘트 더보기 취소 처리
    const handleShowLessComments = () => {
        setComments(comments.slice(0, 4));
        setShowLessComments(false);
        setHasMore(true);
        setPage(1);
        setIsInitialLoad(true);
    };

    // 좋아요/좋아요 취소 처리
    const handleLikeClick = async (comment, commentId, isLiked) => {
        try {
            console.log("코멘트 내용 : " + JSON.stringify(comment, null, 2))
            console.log("is 좋아요 상태 : " + isLiked);
            console.log("like 좋아요 상태2 " + comment.liked)
            if (comment.liked) {
                // 좋아요 취소 (DELETE 요청)
                await axiosInstance.delete(`/books/comments/${commentId}/likes`);
            } else {
                // 좋아요 (POST 요청)
                await axiosInstance.post(`/books/comments/${commentId}/likes`);
            }

            // 코멘트 목록 다시 불러오기
            fetchComments(0);
        } catch (error) {
            console.error('Error updating like status:', error);
            alert('좋아요/좋아요 취소 처리에 실패했습니다.');
        }
    };

    // 별을 표시하는 함수 수정 (반 별: 1점, 온전한 별: 2점으로 계산)
    const renderStars = (rating) => {
        const fullStars = Math.floor(rating / 2); // 온전한 별의 개수 (2점당 1개)
        const halfStar = rating % 2 === 1; // 반 별의 여부 (나머지가 1이면 반 별)
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0); // 빈 별의 개수

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

    // HTML 엔티티를 꺽쇠로 변환하는 함수
    function replaceHtmlEntities(str) {
        return str
            .replace(/&lt;/g, '<') // &lt;를 <
            .replace(/&gt;/g, '>'); // &gt;를 >
    }


    if (!bookData) {
        return <div style={styles.loading}>Loading...</div>;
    }

    const handleJoinGroupChatroom = async (bookId) => {
        try {
            const param = {
                contentId: bookId,
                contentType: "book",
            };

            const response = await axiosInstance.post(`/chat/group/checkJoin`, param);
            const isJoined = response.data
            if (isJoined === true) {
                alert("이미 가입된 채팅방입니다.");
                return;
            }

            const selectedCard = {
                bookId: bookId,
                bookImgUrl: bookData.bookImgUrl,
                title: bookData.title,
                crew: crews.map(crew => crew.name),
            };

            console.log(selectedCard);

            // 모달창 호출 후 fromNoti를 false로 설정
            params.set('fromNoti', 'false');
            navigate({ search: params.toString() }, { replace: true });

            handleOpenGroupChatInfoModal(selectedCard, "book");

        } catch (err) {
            console.error('Error fetching room info:', err);
        }
    }

    const handleJoinRoom = async (existingRoomInfo) => {
        // existingRoomInfo가 null이 아닌지 확인
        if (!existingRoomInfo || !existingRoomInfo.groupChatroomId) {
            alert("채팅방 정보가 유효하지 않습니다.");
            return;
        }

        const groupChatroomId = existingRoomInfo.groupChatroomId; // 채팅방 ID 추출
        try {
            const response = await axiosInstance.post(`/chat/group/${groupChatroomId}`);
            alert("채팅방 가입에 성공하였습니다.");
            setRefreshKey(prevKey => prevKey + 1); // 키를 업데이트하여 ChatList를 다시 렌더링함
            handleCloseGroupChatInfoModal(); // 현재 두번째 모달창 닫기
        } catch (error) {
            alert("채팅방 가입에 실패했습니다.");
        }
    };

    const handleOpenGroupChatInfoModal = (card, category) => {
        setSelectedCard(card);
        setSelectedCategory(category);
        setIsGetGroupChatInfoModalOpen(true); // 두 번째 모달 열기
    };
    const handleCloseGroupChatInfoModal = () => {
        setIsGetGroupChatInfoModalOpen(false);
        setSelectedCard(null);
        setSelectedCategory(null);
    };

    const handleOpenGroupChatNameModal = (card, category) => {
        setSelectedCard(card); // 선택된 카드 데이터 저장
        setSelectedCategory(category); // 선택된 카테고리 저장
        setIsCreateGroupChatNameModalOpen(true); // 모달 열기
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
                    backgroundColor: 'gray',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    color: 'white',
                }}
            >
                <div style={styles.breadcrumbs}>홈 / 도서 / {bookData.title}</div>
                <div style={styles.title}>{bookData.title}</div>
                <div style={styles.subtitle}>
                    {bookData.pubDate ? bookData.pubDate.substring(0, 10).replaceAll('-', ' ・ ') : ''}
                    <br/><br/>
                    {bookData.categoryName}
                    <br/><br/>
                    {/* 장르 목록 출력 */}
                    {/*{genres.map((genre, index) => (*/}
                    {/*    <span key={index}>{genre.name}*/}
                    {/*        /!* 마지막 장르 뒤에는 쉼표를 붙이지 않음 *!/*/}
                    {/*        {index < genres.length - 1 ? ', ' : ''}*/}
                    {/*    </span>*/}
                    {/*))}*/}
                </div>
                {/*<div style={styles.score}>*/}
                {/*    평점 : {bookData.averageScore} / 5*/}
                {/*</div>*/}
            </div>

            <div style={styles.mainContent}>
                <div style={styles.poster}>
                    <img src={bookData.bookImgUrl} alt={bookData.title} style={styles.image}/>
                    <br/>
                    <div>
                        <br/>
                        <p style={{lineHeight: '1.8', margin: '0'}}>재고 상태 </p>
                        <p style={{lineHeight: '1.8', margin: '0'}}><strong>{bookData.stockStatus}</strong></p>
                        <br/>
                        <a href={bookData.mallUrl} target="_blank" rel="noopener noreferrer">
                            <button>구매하기</button>
                        </a>

                    </div>
                    <button
                        id="groupChatButton"
                        style={{
                            ...styles.button,
                            backgroundColor: '#FF3366',
                            marginTop: '20px', // 이미지와 버튼 사이 간격 조절
                        }}
                        onClick={() => handleJoinGroupChatroom(bookId)}
                    >
                        그룹채팅 입장
                    </button>
                </div>


                <div style={styles.info}>
                    <div style={styles.ratingAndWish}>
                        <div style={styles.myRating}>
                            <span style={styles.ratingLabel}>내 별점</span>
                            <div style={styles.stars}>
                                {/* 별 5개로 10점 만점 표현 */}
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

                                                // 클릭된 별점이 있든 없든 마우스 호버 이벤트는 항상 감지
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
                                            {/* 클릭된 별점이 없으면 마우스 호버 상태에 따라 별을 표시하고, 클릭된 별점이 있으면 클릭된 별점을 기준으로 별을 표시 */}
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
                                    {renderStars(bookData.averageScore)}
                                </div>
                                {/* Circular Progress Bar 추가 */}
                                <div style={styles.progressBarContainer}>
                                    <CircularProgressbar
                                        value={bookData.averageScore * 10} s
                                        maxValue={100}
                                        text={`${Math.round(bookData.averageScore * 10) / 10}`}
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
                                    backgroundColor: bookData.isHearted
                                        ? '#FF3366'
                                        : '#4080ff',
                                }}
                                onClick={handleWishClick}
                            >
                                {bookData.isHearted ? '찜 완료' : '찜'}
                            </button>
                            <span id="heartCount" style={styles.heartCountContainer}>
                        {bookData.heartCount}
              </span>
                        </div>
                    </div>

                    {/* 사용자 코멘트 표시 */}
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
                            <div>
                                <p style={styles.userNickname}>등록일 : {userComment.updDt.substring(0, 10)}</p>
                            </div>
                        </div>
                    )}

                    {/* 코멘트 입력 및 수정/삭제 버튼 */}
                    {showCommentInput && (
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

                    {/* 코멘트 삭제 및 수정 버튼 */}
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
                            <div style={styles.sectionContent}>
                                {bookData?.overview ? replaceHtmlEntities(bookData.overview) : '읽을 내용이 없습니다.'}
                            </div>
                        </div>

                        <div style={styles.section}>
                            <div style={styles.sectionTitle}>출연/제작</div>
                            <div style={styles.sectionContent}>
                                <div style={styles.crewGrid}>
                                    {crews.map((crew) => (
                                        <div key={crew.name} style={styles.crewMember}>
                                            {/*<img*/}
                                            {/*    src={*/}
                                            {/*        crew.profileImageUrl*/}
                                            {/*    }*/}
                                            {/*    alt={crew.name}*/}
                                            {/*    style={styles.crewImage}*/}
                                            {/*/>*/}
                                            <div style={styles.crewInfo}>
                                                <div style={styles.crewName}>{crew.name}</div>
                                                <div style={styles.crewCharName}>{crew.charName}</div>
                                                <div style={styles.crewRole}>
                                                    {crew.role === 'AUTHOR'
                                                        ? '지은이'
                                                        : crew.role === 'TRANSLATOR'
                                                            ? '옮긴이'
                                                            : crew.role}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>


                        <div style={styles.section}>
                            <div style={styles.sectionTitle}>
                                코멘트 <span style={styles.commentCount}>{totalComments}</span>
                            </div>
                            <div style={styles.sectionContent}>
                                {comments.map((comment) => (
                                    <div key={comment.bookCommentId} style={styles.commentItem}>
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
                                            {/* 별점 및 좋아요 컨테이너 */}
                                            <div style={styles.commentActions}>
                                                {/* 코멘트 별점 표시 */}
                                                <div style={styles.commentRating}>
                                                    {/* 별 5개로 10점 만점 표현 */}
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
                                                    {/*<span style={styles.commentScore}>{comment.score}</span>*/}
                                                </div>
                                                {/* 좋아요 버튼 및 카운트 컨테이너 */}
                                                <div style={styles.likeContainer}>
                                                    <button
                                                        style={styles.likeButton}
                                                        onClick={() => handleLikeClick(comment, comment.bookCommentId, comment.isLiked)}
                                                    >
                                                        {comment.isLiked ? <FaHeart style={styles.likedIcon}/> :
                                                            <FaRegHeart style={styles.likeIcon}/>}

                                                    </button>
                                                    {/* 좋아요 카운트 */}
                                                    <span
                                                        style={styles.likeCountContainer}>{comment.commentLikeCount}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* 코멘트 내용 */}
                                        <div style={styles.commentContent}>
                                            <FaComment style={styles.commentIcon}/>
                                            <p style={styles.commentText}>{comment.comment}</p>
                                        </div>
                                    </div>
                                ))}
                                {/* 무한 스크롤 로딩 감지 Element */}
                                <div ref={loader}/>
                                {/* 더보기 버튼 */}
                                {hasMore && isInitialLoad && (
                                    <div style={styles.moreButtonContainer}>
                                        <button style={styles.moreButton} onClick={handleLoadMore}>
                                            더보기
                                        </button>
                                    </div>
                                )}
                                {/* 더보기 취소 버튼 */}
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
                            <div style={styles.sectionTitle}>관련 도서</div>

                            <BookCarouselRecommend
                                books={recommendedBooks}
                                startIndex={startIndexRecommended}
                                handlePrev={handlePrevRecommended}
                                handleNext={handleNextRecommended}
                            />
                        </div>
                        <div style={styles.section}>
                            <div style={styles.sectionTitle}>관련 영화</div>
                            <MovieCarousel
                                movies={recommendedMovies}
                                startIndex={mStartIndexRecommended}
                                handleNext={mHandleNextRecommended}
                                handlePrev={mHandlePrevRecommended}
                            />


                        </div>
                    </div>
                </div>

                <GetGroupChatInfoModal
                    isOpen={isGetGroupChatInfoModalOpen}
                    onClose={handleCloseGroupChatInfoModal}
                    selectedCard={selectedCard} // 선택된 데이터 전달
                    selectedCategory={selectedCategory} // 선택된 카테고리 전달
                    onConfirm={(card, category) => handleOpenGroupChatNameModal(card, category)} // 선택된 데이터 전달
                    onJoin={handleJoinRoom} // "가입하기" 버튼의 핸들러 추가
                />
                <CreateGroupChatNameModal
                    isOpen={isCreateGroupChatNameModalOpen}
                    onClose={handleCloseGroupChatNameModal}
                    selectedCard={selectedCard} // 선택된 데이터 전달
                    selectedCategory={selectedCategory} // 선택된 카테고리 전달
                    onUpdateChatList={() => {
                        setRefreshKey(prevKey => prevKey + 1); // 채팅방 리스트 새로고침 키 업데이트
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
        padding: '110px 20px',
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
    score: {
        fontSize: '20px',
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
    },
    image: {
        width: '100%', // 불러오는 div의 100% 크기로 설정
        height: 'auto', // 비율에 맞게 자동 조정
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
        alignItems: 'center', // 세로 중앙 정렬
        //marginLeft: '10px',
    },
    starFilled: {
        color: '#f8d90f',
        cursor: 'pointer',
        fontSize: '40px', // 크기 조정
    },
    starEmpty: {
        color: '#ccc',
        cursor: 'pointer',
        fontSize: '40px', // 크기 조정
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
    commentUser: {
        fontWeight: 'bold',
        marginRight: '5px',
        color: '#000000',
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
        display: 'flex', // 가로 정렬
        alignItems: 'center', // 세로 중앙 정렬
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
        width: '60px', // 원하는 크기로 조정
        marginLeft: '15px', // 별점과의 간격 조정
    }
};

export default BookDetailPage;