// FollowToggleButton.jsx
import React, {useContext, useEffect, useState} from 'react';
import axiosInstance from '../axiosInstance';
import {AppContext} from "../App.jsx";
import {FaUserPlus, FaUserCheck} from 'react-icons/fa'; // 아이콘 import


function FollowToggleButton({memberId, isIcon}) { // isIcon prop 추가
    const [isFollowing, setIsFollowing] = useState(false);
    const {updateSnackbar} = useContext(AppContext);

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
                updateSnackbar('언팔로우 하였습니다.', 'success');
            } else {
                await axiosInstance.post(`/follows/${memberId}/follow`);
                setIsFollowing(true);
                updateSnackbar('팔로우 하였습니다.', 'success');
            }
        } catch (error) {
            console.error('Error toggling follow status:', error);
            updateSnackbar('팔로우/언팔로우 처리에 실패했습니다.', 'error');
        }
    };

    return (
        <button onClick={handleFollowToggle} className={`follow-button ${isFollowing ? 'following' : ''}`}>
            {/* isIcon prop에 따라 아이콘 또는 텍스트 표시 */}
            {isIcon ? (
                isFollowing ? <FaUserCheck /> : <FaUserPlus />
            ) : (
                isFollowing ? '언팔로우' : '팔로우'
            )}
        </button>
    );
}

export default FollowToggleButton;