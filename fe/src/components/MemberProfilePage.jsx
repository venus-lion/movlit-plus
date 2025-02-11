// MemberProfilePage.jsx
import React, { useContext, useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import './MemberProfilePage.css';
import { FaUserCircle } from 'react-icons/fa';
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
            const response = await axiosInstance.post(`chat/create/oneOnOne`, {
                receiverId: memberId,
            });
            updateSnackbar('개인 채팅방이 생성되었습니다.', 'success');
            console.log('개인 채팅방 생성 응답 : ', response.data);

        } catch (error) {
            console.error('Error creating one-on-one chatroom:', error);
            updateSnackbar('DM 채팅방 생성에 실패했습니다.', 'error');
        }
    };

    return (
        <div className="mypage-container">
            <div className="mypage-content-wrapper">
                {/* Section 1: Profile Info (Modified) */}
                <div className="mypage-section">
                    <div className="profile-image">
                        {userData.profileImgUrl ? (
                            <img src={userData.profileImgUrl} alt="Profile" className="profile-img" />
                        ) : (
                            <FaUserCircle className="default-profile-icon" />
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
                            {/* 팔로우/DM 버튼 위치 조정 */}
                            {loginMemberId !== memberId && (
                                <div className="button-group">
                                    <button onClick={handleFollowToggle} className={`follow-button ${isFollowing ? 'following' : ''}`}>
                                        {isFollowing ? '언팔로우' : '팔로우'}
                                    </button>
                                    <button onClick={handleCreateOneononeChatroom} className="dm-button">
                                        DM
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

            </div>
        </div>
    );
}

export default MemberProfilePage;