import React, {useEffect, useState} from 'react';
import axiosInstance from '../axiosInstance';
import './FollowList.css';
import {FaUserCircle, FaUserPlus, FaUserCheck} from 'react-icons/fa'; // 아이콘 추가
import FollowToggleButton from "./FollowToggleButton.jsx";
import {Link} from "react-router-dom";

function FollowList({type}) {
    const [followList, setFollowList] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                let response;
                if (type === 'followers') { // 내 팔로워
                    response = await axiosInstance.get(`/follows/my/follow/details`);
                } else { // 내 팔로잉
                    response = await axiosInstance.get(`/follows/my/following/details`);
                }
                console.log('팔로잉 / 팔로우 fetch DATA ');
                console.log(response.data);
                setFollowList(response.data);
            } catch (error) {
                console.error('Error fetching follow list:', error);
            }
        };

        fetchData();

    }, [type]);

    return (
        <div className="follow-list-container">
            <h2>{type === 'followers' ? '나를 팔로우하는 사람들' : '내가 팔로우하는 사람들'}</h2>
            <div className="follow-list">
                {followList.map((follow) => (
                    <div key={follow.memberId} className="follow-item">
                        <div className="profile-image">
                            {follow.profileImgUrl ? (
                                <img src={follow.profileImgUrl} alt="Profile" className="profile-img"/>
                            ) : (
                                <FaUserCircle className="default-profile-icon"/>
                            )}
                        </div>
                        <div className="user-info">
                            <div className="nickname">
                                <Link to={`/members/${follow.memberId}`} className="user-link">
                                    {follow.nickname} {/* nickname 텍스트를 Link 컴포넌트 안으로 이동 */}
                                </Link>
                            </div>
                            <div className="email">{follow.email}</div>
                        </div>
                        {/* 팔로잉/팔로우 버튼 (MemberProfilePage에서 가져옴) */}
                        <FollowToggleButton memberId={follow.memberId} isIcon={true}/> {/* isIcon prop 추가 */}
                    </div>
                ))}
            </div>
        </div>
    );

}

export default FollowList;