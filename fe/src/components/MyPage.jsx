// MyPage.jsx
import React, { useContext, useEffect, useRef, useState } from 'react';
import axiosInstance from '../axiosInstance';
import './MyPage.css';
import { FaCamera, FaUserCircle } from 'react-icons/fa';
import { IoSettingsOutline } from 'react-icons/io5';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { AppContext } from '../App';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import DialogContentText from "@mui/material/DialogContentText";
import RecentHeartSimilarCrewMoviesComponent from "../pages/RecentHeartSimilarCrewMoviesComponent.jsx";
import InterestGenreMoviesComponent from "../pages/InterestGenreMoviesComponent.jsx";
import BookCarouselRecommend from "../pages/BookCarouselRecommend.jsx";
import useApiData from "../hooks/userRecommendBookApi.jsx";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';


function MyPage() {
    useEffect(() => {

        // 1부터 16까지 숫자 중 랜덤하게 4개의 숫자 뽑기
        const getRandomGenreIds = () => {

            const genreIds = [];
            while (genreIds.length < 4) {
                const randomId = Math.floor(Math.random() * 16) + 1; // 1 ~ 16 사이의 랜덤 값
                if (!genreIds.includes(randomId)) {
                    genreIds.push(randomId);
                }
            }
            return genreIds;
        };
        setRandomGenreIds(getRandomGenreIds());
    }, []);

    const { isLoggedIn } = useOutletContext();

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

    console.log('interestgenreBooks :: ' + interestGenreBooks);

    const [startIndexRecommended, setStartIndexRecommended] = useState(0);
    const [startIndexInterestGenre, setStartIndexInterestGenre] = useState(0);

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

    const [userData, setUserData] = useState({
        profileImgUrl: null,
        nickname: '',
        email: '',
        movieHeartCount: 0,
        movieCommentCount: 1,
        bookHeartCount: 0,
        bookCommentCount: 0
    });
    const [genreList, setGenreList] = useState([]);
    const navigate = useNavigate();
    const { updateLoginStatus, updateSnackbar } = useContext(AppContext); // updateSnackbar context 함수 import
    const fileInputRef = useRef(null);
    const [isHovering, setIsHovering] = useState(false);

    // 팔로우, 팔로잉 관련 변수
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [memberId, setMemberId] = useState(null);

    // Material-UI Dialog 관련 상태
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false); // 로그아웃 확인 다이얼로그 상태 추가

    // Material-UI Menu 관련 상태
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleDropdownOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleDropdownClose = () => {
        setAnchorEl(null);
    };


    const fetchMemberId = async () => {
        try {
            const response = await axiosInstance.get('/members/id');
            setMemberId(response.data.memberId);
        } catch (error) {
            console.error('Error fetching member ID:', error);
        }
    };

    const fetchFollowCounts = async (currentMemberId) => {
        const followerCountResponse =
            await axiosInstance.get(`/follows/${memberId}/followers/count`);
        setFollowerCount(followerCountResponse.data);

        const followeeCountResponse =
            await axiosInstance.get(`/follows/${memberId}/follows/count`);
        setFollowingCount(followeeCountResponse.data);
    };

    const handleFollowerClick = () => {
        navigate('/my-followers');
    };

    const handleFollowingClick = () => {
        navigate('/my-followings');
    };


    // Material-UI Dialog 열기
    const openDeleteDialog = () => {
        setIsDeleteDialogOpen(true);
        handleDropdownClose(); // 드롭다운 메뉴 닫기
    };

    // Material-UI Dialog 닫기
    const closeDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
    };

    // Material-UI Logout Dialog 열기
    const openLogoutDialog = () => {
        setIsLogoutDialogOpen(true);
        handleDropdownClose(); // 드롭다운 메뉴 닫기
    };

    // Material-UI Logout Dialog 닫기
    const closeLogoutDialog = () => {
        setIsLogoutDialogOpen(false);
    };

    const handleDeleteConfirm = async () => {
        try {
            await axiosInstance.delete('/members/delete');
            updateSnackbar('회원 탈퇴가 완료되었습니다.', 'success'); // Material-UI Snackbar 호출
            sessionStorage.removeItem('accessToken');
            updateLoginStatus(false);
            navigate('/');
        } catch (error) {
            console.error('Error during member deletion:', error);
            updateSnackbar('회원 탈퇴 중 오류가 발생했습니다.', 'error'); // Material-UI Snackbar 호출
        } finally {
            closeDeleteDialog();
        }
    };


    const handleLogoutConfirm = async () => {
        try {
            await axiosInstance.post('/members/logout');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');

            document.cookie =
                'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            updateLoginStatus(false);
            updateSnackbar('로그아웃 되었습니다.', 'success'); // Material-UI Snackbar 호출 (로그아웃 성공 알림)
            navigate('/member/login');
        } catch (error) {
            console.error('Logout error:', error);
            updateSnackbar('로그아웃 중 오류가 발생했습니다.', 'error'); // Material-UI Snackbar 호출 (로그아웃 실패 알림)
        } finally {
            closeLogoutDialog();
        }
    };

    useEffect(() => {
        const fetchMyPageData = async () => {
            try {
                const response = await axiosInstance.get('/members/myPage');
                setUserData(response.data);
            } catch (error) {
                console.error('Error fetching my page data:', error);
            }
        };

        const fetchGenreList = async () => {
            try {
                const response = await axiosInstance.get('/members/genreList');
                setGenreList(response.data);
            } catch (error) {
                console.error('Error fetching genre list:', error);
            }
        };

        fetchMemberId();
        fetchMyPageData();
        fetchGenreList();
    }, []);

    useEffect(() => {
        if (memberId) {
            fetchFollowCounts(memberId);
        }
    }, [memberId]);

    const handleProfileImageClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        const MAX_FILE_SIZE = 2800 * 1024;

        if (!file) {
            updateSnackbar('이미지를 선택해주세요.', 'warning'); // Material-UI Snackbar 호출
            return;
        }

        if (file.size === 0) {
            updateSnackbar('빈 파일은 업로드할 수 없습니다.', 'error'); // Material-UI Snackbar 호출
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            updateSnackbar('이미지 크기가 2800KB를 초과합니다.', 'error'); // Material-UI Snackbar 호출
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axiosInstance.post('/images/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setUserData({ ...userData, profileImgUrl: response.data.imageUrl });
            updateSnackbar('프로필 사진이 성공적으로 변경되었습니다. 새로고침을 해주세요.', 'success'); // Material-UI Snackbar 호출
        } catch (error) {
            if (error.response && error.response.status === 413) {
                updateSnackbar('이미지 크기가 너무 큽니다. 2800KB 이하의 이미지를 업로드해주세요.', 'error'); // Material-UI Snackbar 호출
            } else {
                updateSnackbar('이미지 업로드 중 오류가 발생했습니다.', 'error'); // Material-UI Snackbar 호출
            }
        }
    };

    const handleMouseEnter = () => {
        setIsHovering(true);
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
    };


    const handleUpdateClick = () => { // 수정하기 버튼 클릭 핸들러
        navigate('/member/update');
        handleDropdownClose(); // 드롭다운 메뉴 닫기
    };

    const [randomGenreIds, setRandomGenreIds] = useState([]);

    const handleNextRecommended = () => handleNext(startIndexRecommended, setStartIndexRecommended, recommendedBooks.length);
    const handlePrevRecommended = () => handlePrev(startIndexRecommended, setStartIndexRecommended);
    const handleNextInterestGenre = () => handleNext(startIndexInterestGenre, setStartIndexInterestGenre, interestGenreBooks.length);
    const handlePrevInterestGenre = () => handlePrev(startIndexInterestGenre, setStartIndexInterestGenre);

    return (
        <div className="mypage-container">
            <div className="mypage-content-wrapper">
                {/* Section 1: Profile Info */}
                <div className="mypage-section">
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                        accept="image/*"
                    />
                    <div
                        className="profile-image"
                        onClick={handleProfileImageClick}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        style={{ cursor: 'pointer' }}
                    >
                        {userData.profileImgUrl ? (
                            <img src={userData.profileImgUrl} alt="Profile" className="profile-img" />
                        ) : (
                            <FaUserCircle className="default-profile-icon" />
                        )}
                        {isHovering && (
                            <div className="overlay">
                                <FaCamera className="camera-icon" />
                            </div>
                        )}
                    </div>
                    <div className="mypage-header">
                        <div className="user-info">
                            <h2>{userData.nickname}</h2>
                            <p>{userData.email}</p>
                            <div className="mypage-follow-stats">
                                <div className="stat-item">
                                    <span className="stat-label">팔로워</span>
                                    <span onClick={handleFollowerClick} className="link-button count-button">
                                        {followerCount}
                                    </span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">팔로잉</span>
                                    <span onClick={handleFollowingClick} className="link-button count-button">
                                        {followingCount}
                                    </span>
                                </div>
                            </div>

                        </div>
                        <div className="settings-icon" onClick={handleDropdownOpen}>
                            <IoSettingsOutline className="settings-icon-comp" />
                        </div>
                    </div>
                    <div className="mypage-stats-header">
                        <div className="stat-item-header">
                            <span>{userData.movieHeartCount + userData.bookHeartCount}</span>
                            <span>평가</span>
                        </div>
                        <div className="stat-item-header">
                            <span>{userData.movieCommentCount + userData.bookCommentCount}</span>
                            <span>코멘트</span>
                        </div>
                    </div>
                    <Menu
                        id="basic-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleDropdownClose}
                        MenuListProps={{
                            'aria-labelledby': 'basic-button',
                        }}
                        PaperProps={{
                            style: {
                                borderRadius: 12,
                                boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
                            },
                        }}
                    >
                        <MenuItem onClick={openLogoutDialog}
                                  style={{ fontWeight: 'bold', color: '#333', backgroundColor: 'transparent' }}>
                            로그아웃
                        </MenuItem>
                        <MenuItem onClick={handleUpdateClick} style={{ backgroundColor: 'transparent' }}>
                            수정하기
                        </MenuItem>
                        <Divider sx={{ borderBottomWidth: 2 }} />
                        <MenuItem onClick={openDeleteDialog} style={{ color: '#F44336', backgroundColor: 'transparent' }}>
                            탈퇴하기
                        </MenuItem>
                    </Menu>
                </div>

                {/* Section 2: 선호 장르 (Preferred Genres) */}
                <div className="mypage-section">
                    <div className="mypage-genre-list">
                        <h3>선호 장르</h3>
                        <div className="genre-chips">
                            {genreList.map((genre) => (
                                <div key={genre.genreId} className="genre-chip">
                                    {genre.genreName}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>


                {/* Section 3: Movie Home */}
                <div className="mypage-section">
                    <div className="movie-home">
                        {isLoggedIn && <RecentHeartSimilarCrewMoviesComponent />}
                        {isLoggedIn && <InterestGenreMoviesComponent />}
                    </div>
                </div>

                {/* Section 4: Book Home */}
                <div className="mypage-section">
                    <div className="book-home">
                        {isLoggedIn && interestGenreBooks.length > 0 && (
                            <BookCarouselRecommend
                                title="회원님의 취향저격 도서 장르"
                                books={interestGenreBooks}
                                startIndex={startIndexInterestGenre}
                                handlePrev={handlePrevInterestGenre}
                                handleNext={handleNextInterestGenre}
                            />
                        )}

                        {isLoggedIn && recommendedBooks.length > 0 && (
                            <BookCarouselRecommend
                                title="회원님이 찜한 책과 닮은 도서들"
                                books={recommendedBooks}
                                startIndex={startIndexRecommended}
                                handlePrev={handlePrevRecommended}
                                handleNext={handleNextRecommended}
                            />
                        )}
                    </div>
                </div>

                {/* Material-UI Dialog (Keep it outside sections as it's a modal) */}
                <Dialog
                    open={isDeleteDialogOpen}
                    onClose={closeDeleteDialog}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    PaperProps={{ // `PaperProps` to style the Dialog's paper container
                        style: {
                            borderRadius: 12,
                            maxWidth: 500,
                            width: '25%',
                        },
                    }}
                >
                    <DialogTitle id="alert-dialog-title" sx={{
                        fontWeight: 'bold',
                        fontSize: '1.5rem',
                        textAlign: 'center'
                    }}> {/* DialogTitle 스타일 변경 */}
                        {"회원 탈퇴"}
                    </DialogTitle>
                    <DialogContent sx={{ padding: '1.5rem', textAlign: 'center' }}> {/* DialogContent 스타일 변경 */}
                        <DialogContentText id="alert-dialog-description" sx={{
                            fontSize: '1rem',
                            color: 'text.secondary'
                        }}> {/* DialogContentText 스타일 변경 */}
                            정말로 탈퇴하시겠습니까? <br /> 탈퇴 후에는 계정 복구가 불가능합니다.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ padding: '1.25rem', justifyContent: 'center' }}> {/* DialogActions 스타일 변경 */}
                        <Button onClick={closeDeleteDialog} color="primary"
                                sx={{ minWidth: 100 }}> {/* "아니오" 버튼 스타일 변경 */}
                            아니오
                        </Button>
                        <Button onClick={handleDeleteConfirm} color="error" autoFocus
                                sx={{ minWidth: 100 }}> {/* "예" 버튼 스타일 변경 */}
                            예, 탈퇴합니다
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Logout Confirmation Dialog */}
                <Dialog
                    open={isLogoutDialogOpen}
                    onClose={closeLogoutDialog}
                    aria-labelledby="logout-dialog-title"
                    aria-describedby="logout-dialog-description"
                    PaperProps={{
                        style: {
                            borderRadius: 12,
                            maxWidth: 500,
                            width: '25%',
                        },
                    }}
                >
                    <DialogTitle id="logout-dialog-title" sx={{
                        fontWeight: 'bold',
                        fontSize: '1.5rem',
                        textAlign: 'center'
                    }}>
                        {"로그아웃"}
                    </DialogTitle>
                    <DialogContent sx={{ padding: '1.5rem', textAlign: 'center' }}>
                        <DialogContentText id="logout-dialog-description" sx={{
                            fontSize: '1rem',
                            color: 'text.secondary'
                        }}>
                            정말로 로그아웃 하시겠습니까?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ padding: '1.25rem', justifyContent: 'center' }}>
                        <Button onClick={handleLogoutConfirm} color="error" autoFocus sx={{ minWidth: 100 }}>
                            예
                        </Button>
                        <Button onClick={closeLogoutDialog} color="primary" sx={{ minWidth: 100 }}>
                            아니오
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    );
}

export default MyPage;