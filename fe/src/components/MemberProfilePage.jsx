import React, {useContext, useEffect, useState} from 'react';
import axiosInstance from '../axiosInstance';
import './MemberProfilePage.css'; // Make sure to import the CSS file
import {FaUserCircle} from 'react-icons/fa';
import {useNavigate, useParams} from 'react-router-dom';
import {AppContext} from "../App.jsx";

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
    const {memberId} = useParams();

    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [loginMemberId, setLoginMemberId] = useState(null);
    const {updateSnackbar} = useContext(AppContext);
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
        <div className="mypage-container"> {/* Changed to mypage-container */}
            <div className="mypage-content-wrapper"> {/* Added mypage-content-wrapper */}
                <div className="mypage-section"> {/* Changed to mypage-section */}
                    <div className="mypage-header"> {/* Changed to mypage-header */}
                        <div className="profile-image"> {/* Keep profile-image */}
                            {userData.profileImgUrl ? (
                                <img src={userData.profileImgUrl} alt="Profile" className="profile-img"/>
                            ) : (
                                <FaUserCircle className="default-profile-icon"/>
                            )}
                        </div>
                        <div className="user-info"> {/* Keep user-info */}
                            <h2>{userData.nickname}</h2>
                            <p>{userData.email}</p>
                            <div className="mypage-follow-stats"> {/* Added mypage-follow-stats */}
                                <div className="stat-item"> {/* Keep stat-item */}
                                    팔로워 <span onClick={handleFollowerClick}
                                              className="'link-button">{followerCount}</span>
                                </div>
                                <span className="separator" style={{margin: '0 8px', color: '#ccc'}}>|</span>
                                <div className="stat-item"> {/* Keep stat-item */}
                                    팔로잉 <span onClick={handleFollowingClick}
                                              className="link-button">{followingCount}</span>
                                </div>
                            </div>
                            {loginMemberId !== memberId && (
                                <div style={{marginTop: '10px'}}> {/* Added wrapper div for buttons */}
                                    <button onClick={handleFollowToggle} className="follow-button">
                                        {isFollowing ? '언팔로우' : '팔로우'}
                                    </button>
                                    <button onClick={handleCreateOneononeChatroom} className="dm-button">
                                        DM
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mypage-stats-header"> {/* Added mypage-stats-header */}
                        <div className="stat-item-header"> {/* Added stat-item-header */}
                            <span>{userData.movieHeartCount}</span>
                            <span>평가</span>
                        </div>
                        <div className="stat-item-header"> {/* Added stat-item-header */}
                            <span>{userData.movieCommentCount + userData.bookCommentCount}</span>
                            <span>코멘트</span>
                        </div>
                        <div className="stat-item-header"> {/* Added stat-item-header */}
                            <span>{userData.bookHeartCount}</span>
                            <span>컬렉션</span>
                        </div>
                    </div>
                </div>

                <div className="mypage-section"> {/* Changed to mypage-section */}
                    <div className="mypage-genre-list"> {/* Changed to mypage-genre-list */}
                        <h3>선호 장르</h3>
                        <div className="genre-chips"> {/* Changed to genre-chips */}
                            {genreList.map((genre) => (
                                <div key={genre.genreId} className="genre-chip"> {/* Changed to genre-chip */}
                                    {genre.genreName}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Remove the sections below 선호 장르 */}

            </div>
            {/* End of mypage-content-wrapper */}
        </div> // Changed to mypage-container
    );
}

export default MemberProfilePage;