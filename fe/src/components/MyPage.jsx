import React, {useContext, useEffect, useRef, useState} from 'react';
import axiosInstance from '../axiosInstance';
import './MyPage.css';
import {FaCamera, FaUserCircle} from 'react-icons/fa';
import {IoSettingsOutline} from 'react-icons/io5';
import {Link, useNavigate} from 'react-router-dom';
import {AppContext} from '../App';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import DialogContentText from "@mui/material/DialogContentText";

function MyPage() {
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
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const {updateLoginStatus, updateSnackbar} = useContext(AppContext); // updateSnackbar context 함수 import
    const fileInputRef = useRef(null);
    const [isHovering, setIsHovering] = useState(false);

    // 팔로우, 팔로잉 관련 변수
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [memberId, setMemberId] = useState(null);

    // Material-UI Dialog 관련 상태
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // Material-UI Dialog 열기
    const openDeleteDialog = () => {
        setIsDeleteDialogOpen(true);
    };

    // Material-UI Dialog 닫기
    const closeDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
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
            setUserData({...userData, profileImgUrl: response.data.imageUrl});
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

    return (
        <div className="mypage-container">
            <input
                type="file"
                ref={fileInputRef}
                style={{display: 'none'}}
                onChange={handleFileChange}
                accept="image/*"
            />
            <div
                className="profile-image"
                onClick={handleProfileImageClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{cursor: 'pointer'}}
            >
                {userData.profileImgUrl ? (
                    <img src={userData.profileImgUrl} alt="Profile" className="profile-img"/>
                ) : (
                    <FaUserCircle className="default-profile-icon"/>
                )}
                {isHovering && (
                    <div className="overlay">
                        <FaCamera className="camera-icon"/>
                    </div>
                )}
            </div>
            <div className="mypage-header">
                <div className="user-info">
                    <h2>{userData.nickname}</h2>
                    <p>{userData.email}</p>
                </div>
                <div className="settings-icon" onClick={toggleDropdown}>
                    <IoSettingsOutline className="settings-icon-comp"/>
                    {isDropdownOpen && (
                        <div className="dropdown-menu">
                            <Link to="/member/update" className="dropdown-item">
                                회원 수정
                            </Link>
                            <button onClick={openDeleteDialog} className="dropdown-item delete-button">
                                회원 탈퇴
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className="mypage-stats">
                <div className="stat-item">
                    <span onClick={handleFollowerClick} className="link-button">{followerCount}</span>
                    <span>팔로워</span>
                </div>
                <div className="stat-item">
                    <span onClick={handleFollowingClick} className="link-button">{followingCount}</span>
                    <span>팔로잉</span>
                </div>
                <div className="stat-item">
                    <span>{userData.movieHeartCount}</span>
                    <span>영화 찜</span>
                </div>
                <div className="stat-item">
                    <span>{userData.movieCommentCount}</span>
                    <span>영화 코멘트</span>
                </div>
                <div className="stat-item">
                    <span>{userData.bookHeartCount}</span>
                    <span>도서 찜</span>
                </div>
                <div className="stat-item">
                    <span>{userData.bookCommentCount}</span>
                    <span>도서 코멘트</span>
                </div>
            </div>
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

            {/* Material-UI Dialog 추가 (유지) */}
            <Dialog
                open={isDeleteDialogOpen}
                onClose={closeDeleteDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"회원 탈퇴 확인"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        정말로 탈퇴하시겠습니까?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteDialog} color="primary">
                        아니오
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="primary" autoFocus>
                        예
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ToastContainer 컴포넌트 완전 제거 */}
            {/* <ToastContainer // ToastContainer 컴포넌트 완전 제거
                position="top-right"
                autoClose={1000}
                hideProgressBar={false}
                closeOnClick
                pauseOnHover={false}
                draggable
                progress={undefined}
            /> */}
        </div>
    );
}

export default MyPage;