// FollowToggleButton.jsx (새 파일 생성)
import React, {useEffect, useState, useContext} from 'react'; // useContext import 추가
import axiosInstance from '../axiosInstance';
import {AppContext} from "../App.jsx"; // AppContext import

function FollowToggleButton({memberId}) {
    const [isFollowing, setIsFollowing] = useState(false);
    const { updateSnackbar } = useContext(AppContext); // updateSnackbar context 함수 import

    const checkFollowStatus = async () => {
        try {
            const response = await axiosInstance.get(`/follows/check/${memberId}`);
            setIsFollowing(response.data.following);
        } catch (error) {
            console.error('Error checking follow status:', error);
        }
    };

    useEffect(() => {
        checkFollowStatus();
    }, [memberId]);

    const handleFollowToggle = async () => {
        try {
            if (isFollowing) {
                await axiosInstance.delete(`/follows/${memberId}/follow`);
                setIsFollowing(false);
                updateSnackbar('언팔로우 하였습니다.', 'success'); // toast.success -> updateSnackbar
            } else {
                await axiosInstance.post(`/follows/${memberId}/follow`);
                setIsFollowing(true);
                updateSnackbar('팔로우 하였습니다.', 'success'); // toast.success -> updateSnackbar
            }
        } catch (error) {
            console.error('Error toggling follow status:', error);
            updateSnackbar('팔로우/언팔로우 처리에 실패했습니다.', 'error'); // toast.error -> updateSnackbar
        }
    };

    return (
        <button onClick={handleFollowToggle} className="follow-button">
            {isFollowing ? '언팔로우' : '팔로우'}
        </button>
    );
}

export default FollowToggleButton;