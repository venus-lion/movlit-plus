// MemberProfilePage.jsx
import React, { useContext, useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import './MemberProfilePage.css';
import { FaUserCircle, FaUserPlus, FaUserCheck, FaEnvelope } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from "../App.jsx";

function MemberProfilePage() {
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
    const { memberId } = useParams();

    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [loginMemberId, setLoginMemberId] = useState(null);
    const { updateSnackbar } = useContext(AppContext);
    const navigate = useNavigate();

    const handleFollowerClick = () => {
        navigate(`/members/${memberId}/followers`);
    };

    const handleFollowingClick = () => {
        navigate(`/members/${memberId}/followings`);
    };

    const fetchLoginMemberId = async () => {
        try {
            const response = await axiosInstance.get('/members/id');
            setLoginMemberId(response.data.memberId);
        } catch (error) {
            console.error('Error fetching member ID:', error);
        }
    };

    const checkFollowStatus = async () => {
        try {
            const response = await axiosInstance.get(`/follows/check/${memberId}`);
            setIsFollowing(response.data.following);
        } catch (error) {
            console.error('Error checking follow status : ', error);
        }
    };

    const fetchFollowCounts = async () => {
        const followerCountResponse =
            await axiosInstance.get(`/follows/${memberId}/followers/count`);
        setFollowerCount(followerCountResponse.data);

        const followeeCountResponse =
            await axiosInstance.get(`/follows/${memberId}/follows/count`);
        setFollowingCount(followeeCountResponse.data);
    };

    useEffect(() => {
        const fetchMemberPageData = async () => {
            try {
                const response = await axiosInstance.get(`/members/${memberId}/profile`);
                setUserData(response.data);
            } catch (error) {
                console.error('Error fetching member page data:', error);
            }
        };

        const fetchGenreList = async () => {
            try {
                const response = await axiosInstance.get(`/members/${memberId}/genres`);
                setGenreList(response.data);
            } catch (error) {
                console.error('Error fetching genre list:', error);
            }
        };

        fetchMemberPageData();
        fetchGenreList();
        checkFollowStatus();
        fetchFollowCounts();
        fetchLoginMemberId();
    }, [memberId]);

    const handleFollowToggle = async () => {
        try {
            if (isFollowing) {
                await axiosInstance.delete(`/follows/${memberId}/follow`);
                setIsFollowing(false);
                setFollowerCount(prevCount => prevCount - 1);

            } else {
                await axiosInstance.post(`/follows/${memberId}/follow`);
                setIsFollowing(true);
                setFollowerCount(prevCount => prevCount + 1);
            }

            updateSnackbar(isFollowing ? '언팔로우 하였습니다.' : '팔로우 하셨습니다.', 'success');
            checkFollowStatus();
            fetchFollowCounts();
        } catch (error) {
            console.error('Error toggling follow status:', error);
            updateSnackbar('팔로우/언팔로우 처리에 실패했습니다.', 'error');
        }
    };

    const handleCreateOneononeChatroom = async () => {
        try {
            await axiosInstance.post(`chat/create/oneOnOne`, {
                receiverId: memberId,
            });

            const response = await axiosInstance.get(`chat/oneOnOne/${memberId}`);
            const roomId = response.data.roomId;

            let url = `http://localhost:3000/chatMain/${roomId}/personal`;
            // URL이 'http'로 시작하면 절대 경로, 아니면 상대 경로로 처리
            if (url) {
                url += '?fromNoti=true';
                if (url.startsWith('http')) {
                    window.location.href = url; // 절대 URL로 이동
                } else {
                    navigate(url); // 상대 URL로 이동
                }
            }

            updateSnackbar('개인 채팅방이 생성되었습니다.', 'success');
            console.log('개인 채팅방 생성 응답 : ', response.data);

        } catch (error) {
            console.error('Error creating one-on-one chatroom:', error);
            // 에러 메시지를 확인하여 `OneOnOneChatroomAlreadyExistsException` 인 경우에만 navigate
            if (error.response && error.response.data && error.response.data.message === "해당 컨텐츠의 일대일 채팅이 이미 존재합니다.") {
                const response = await axiosInstance.get(`chat/oneOnOne/${memberId}`);
                const roomId = response.data.roomId;
                console.log('roomId==========', roomId);

                let url = `http://localhost:3000/chatMain/${roomId}/personal`;
                // URL이 'http'로 시작하면 절대 경로, 아니면 상대 경로로 처리
                if (url) {
                    url += '?fromNoti=true';
                    if (url.startsWith('http')) {
                        window.location.href = url; // 절대 URL로 이동
                    } else {
                        navigate(url); // 상대 URL로 이동
                    }
                }

                updateSnackbar('채팅방이 이미 존재하므로 이동하겠습니다.', 'success');
            }
            else {
                updateSnackbar('DM 채팅방 생성에 실패했습니다.', 'error');
            }
        }
    };

    return (
        <div className="mypage-container">
            <div className="mypage-content-wrapper">
                <div className="mypage-section">
                    <div className="profile-image">
                        {userData.profileImgUrl ? (
                            <img src={userData.profileImgUrl} alt="Profile" className="profile-img" />
                        ) : (
                            <FaUserCircle className="default-profile-icon" />
                        )}
                    </div>
                    <div className="mypage-header">
                        {/* user-info와 button-group을 감싸는 div 추가 */}
                        <div className="user-info-button-wrapper">
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

                            {loginMemberId !== memberId && (
                                <div className="button-group">
                                    <button onClick={handleFollowToggle} className={`follow-button ${isFollowing ? 'following' : ''}`}>
                                        {isFollowing ? <FaUserCheck /> : <FaUserPlus />}
                                    </button>
                                    <button onClick={handleCreateOneononeChatroom} className="dm-button">
                                        <FaEnvelope />
                                    </button>
                                </div>
                            )}
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
                </div>

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
            </div>
        </div>
    );
}

export default MemberProfilePage;