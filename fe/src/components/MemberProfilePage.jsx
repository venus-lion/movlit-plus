import React, {useEffect, useState, useContext} from 'react'; // useContext import 추가
import axiosInstance from '../axiosInstance';
import './MemberProfilePage.css';
import {FaUserCircle} from 'react-icons/fa';
import {useParams} from 'react-router-dom';
import {AppContext} from "../App.jsx"; // AppContext import

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

    // 팔로잉, 팔로우 관련 변수 추가 (기존과 동일)
    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [loginMemberId, setLoginMemberId] = useState(null);
    const { updateSnackbar } = useContext(AppContext); // updateSnackbar context 함수 import

    //현재 로그인한 사용자의 memberId 가져오기 (기존과 동일)
    const fetchLoginMemberId = async () => {
        try {
            const response = await axiosInstance.get('/members/id');
            setLoginMemberId(response.data.memberId);
        } catch (error) {
            console.error('Error fetching member ID:', error);
        }
    };

    // 팔로우 상태 확인 (기존과 동일)
    const checkFollowStatus = async () => {
        try {
            const response = await axiosInstance.get(`/follows/check/${memberId}`);
            setIsFollowing(response.data.following); // 서버로부터 팔로우 상태를 받아옴
        } catch (error) {
            console.error('Error checking follow status : ', error);
        }
    };

    // 팔로워 / 팔로잉 개수 가져오기 (기존과 동일)
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
        fetchLoginMemberId(); // 현재 로그인한 loginMemberId
    }, [memberId]);

    // 팔로우, 언팔로우 기능 처리
    const handleFollowToggle = async () => {
        try {
            if (isFollowing) {
                // 언팔로우 (팔로잉 -> 팔로우)
                await axiosInstance.delete(`/follows/${memberId}/follow`);
                setIsFollowing(false);
                setFollowerCount(prevCount => prevCount - 1);

            } else {
                // 팔로우 (팔로우 -> 팔로잉)
                await axiosInstance.post(`/follows/${memberId}/follow`);
                setIsFollowing(true);
                setFollowerCount(prevCount => prevCount + 1);
            }

            updateSnackbar(isFollowing ? '언팔로우 하였습니다.' : '팔로우 하셨습니다.', 'success'); // toast.success -> updateSnackbar

            // 팔로우 상태 및 카운트 업데이트 이후, 추가 작업 수행 (상태 다시 불러오기) (기존과 동일)
            checkFollowStatus();
            fetchFollowCounts();
        } catch (error) {
            console.error('Error toggling follow status:', error);
            updateSnackbar('팔로우/언팔로우 처리에 실패했습니다.', 'error'); // toast.error -> updateSnackbar
        }
    };

    const handleCreateOneononeChatroom = async () => {
        try {
            const response = await axiosInstance.post(`chat/create/oneOnOne`, {
                receiverId: memberId,
            });

            // 성공적으로 채팅방이 생성되었을 때의 처리 (기존과 동일)
            updateSnackbar('개인 채팅방이 생성되었습니다.', 'success'); // toast.success -> updateSnackbar
            console.log('개인 채팅방 생성 응답 : ', response.data);

        } catch (error) {
            console.error('Error creating one-on-one chatroom:', error);
            updateSnackbar('DM 채팅방 생성에 실패했습니다.', 'error'); // toast.error -> updateSnackbar
        }
    };

    return (
        <div className="memberpage-container">
            <div className="profile-image">
                {userData.profileImgUrl ? (
                    <img src={userData.profileImgUrl} alt="Profile" className="profile-img"/>
                ) : (
                    <FaUserCircle className="default-profile-icon"/>
                )}
            </div>
            <div className="memberpage-header">
                <div className="user-info">
                    <h2>{userData.nickname}</h2>
                    <p>{userData.email}</p>
                    {/*loginMemberId와 memberId가 동일하지 않을 때만 팔로우 버튼 렌더링 (기존과 동일)*/}
                    {loginMemberId !== memberId && (
                        <>
                            <button onClick={handleFollowToggle} className="follow-button">
                                {isFollowing ? '언팔로우' : '팔로우'}
                            </button>
                            {/* DM 버튼 추가 (기존과 동일) */}
                            <button onClick={handleCreateOneononeChatroom} className="dm-button">
                                DM
                            </button>
                        </>
                    )}
                </div>
            </div>
            <div className="memberpage-stats">
                <div className="stat-item">
                    <span>{followerCount}</span>
                    <span>팔로워</span>
                </div>
                <div className="stat-item">
                    <span>{followingCount}</span>
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
            <div className="memberpage-genre-list">
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
    );
}

export default MemberProfilePage;