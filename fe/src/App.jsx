import React, {createContext, useCallback, useEffect, useState, useRef } from 'react';
import {NavLink, Outlet, useNavigate} from 'react-router-dom';
import axiosInstance from './axiosInstance';
import './App.css';
import {FaUserCircle} from 'react-icons/fa';
import {EventSourcePolyfill} from 'event-source-polyfill';
import notificationIcon from './images/notification.jpg';
import NotiDropdown from './pages/Notification.jsx'; // SSE 연결 -> Notificatoin 설정으로 동명파일 import 불가 (NotiDropdown으로 파일명 대체)


// Material-UI 컴포넌트 import (Snackbar, Alert 추가)
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Modal from "react-modal";

export const AppContext = createContext();

function App() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem('accessToken')
    );
    const [profileImage, setProfileImage] = useState(null);
    console.log('profileImage = {}', profileImage);

    const updateLoginStatus = useCallback((status) => {
        setIsLoggedIn(status);
    }, []);

    // 알림 관련 (기존 알림 관련 상태 및 함수 유지)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 알림 목록 드롭다운
    const dropdownRef = useRef(null); // 드롭다운 참조
    const [notifications, setNotifications] = useState([]);
    const [newNotification, setNewNotification] = useState(false);

    // Snackbar 관련 상태 및 함수 추가 (Material-UI Snackbar)
    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const updateSnackbar = useCallback((message, severity = 'success') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setIsSnackbarOpen(true);
    }, []);

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setIsSnackbarOpen(false);
    };

    // Enter 키 이벤트 처리 (기존과 동일)
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    const [inputStr, setInputStr] = useState('');

    // 입력 값 변경 시 실행 (기존과 동일)
    const handleInputChange = (event) => {
        setInputStr(event.target.value);
    };

    const handleSearch = async () => {
        if (inputStr.trim() === '') {
            // toast.success('검색어를 입력해주세요!'); // react-toastify toast 그대로 사용 (일단 임시적으로)
            updateSnackbar('검색어를 입력해주세요!', 'warning'); // Material-UI Snackbar 호출로 변경
            return;
        }

        navigate(`/search/${encodeURIComponent(inputStr)}`);
    };

    // 알림 클릭 시 (기존과 동일)
    const handleBellClick = () => {
        setNewNotification(false);
        setIsDropdownOpen((prev) => !prev); // 드롭다운 열기/닫기 토글
        //navigate('/notifications');
    };
    const closeDropdown = () => {
        setIsDropdownOpen(false); // 드롭다운 닫기
    };

    // 알림 드롭다운 (알림 창 밖의 페이지 클릭 시 드롭다운 사라짐)
    useEffect(() => {
        const handleClickOutside = (event) => {
            // 드롭다운이 열려있고, 클릭한 요소가 드롭다운 안이 아닐 경우 닫기
            if (isDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                closeDropdown();
            }
        };

        // 이벤트 리스너 추가
        document.addEventListener('mousedown', handleClickOutside);

        // 컴포넌트 언마운트 시 리스너 제거
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);



    useEffect(() => {
        const fetchProfileImage = async () => {
            try {
                const response = await axiosInstance.get('/images/profile');
                setProfileImage(response.data);
            } catch (error) {
                console.error('Error fetching profile image:', error);
                setProfileImage(null);
            }
        };

        if (isLoggedIn) {
            fetchProfileImage();
        }
    }, [isLoggedIn]);

    useEffect(() => {
        let eventSource = null;
        let reconnectTimer = null;

        const setupSSE = async () => {
            try {
                // 사용자 ID 가져오기 (기존과 동일)
                const profileRes = await axiosInstance.get('/members/id');
                const userId = profileRes.data.memberId;

                if (Notification.permission !== 'granted') {
                    await Notification.requestPermission();
                }

                console.log('SSE 연결 설정, userId : ' + userId);
                //SSE 연결 설정 (기존과 동일)
                eventSource = new EventSourcePolyfill(
                    `${import.meta.env.VITE_BASE_URL}/subscribe/${userId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                            'Last-Event-ID': Date.now().toString()
                        },
                        withCredentials: true,
                        heartbeatTimeout: 45000,
                        connectionTimeout: 5000
                    }
                );

                // 연결 상태 관리 (기존과 동일)
                eventSource.onopen = () => {
                    console.log('로그인 이후 -- SSE 연결 성공');
                    if (reconnectTimer) {
                        clearTimeout(reconnectTimer);
                        reconnectTimer = null;
                    }
                };

                // 하트비트 이벤트 처리 (기존과 동일)
                eventSource.addEventListener('heartbeat', () => {
                    console.debug('SSE 연결 활성 상태 유지');
                });

                // 알림 이벤트 처리 - 'notification' 이벤트 수신 시.. (기존과 동일)
                eventSource.addEventListener('notification', (e) => {
                    try {
                        console.log('notification 이벤트를 받았다!!');
                        console.log('e.data : ', e.data); // e.data 값 확인

                        const notification = JSON.parse(e.data);
                        console.log('받은 notification :: ' + notification);

                        if (Notification.permission === 'granted') {
                            console.log('Notifcation.permission이 granted 됨');
                            console.log(notification.message);
                            console.log(notification.url)
                            const noti = new Notification('Movlit', {
                                body: notification.message, // 알림 메세지 표시
                                url: notification.url,
                                icon: notificationIcon,
                            });

                            // 페이지 내 알림 종(bell) 설정 (기존과 동일)
                            setNotifications((prev) => [...prev, notification]);
                            setNewNotification(true); // 새로운 알림 발생

                            // 브라우저 알림 카드 클릭 시
                            noti.onclick = () => {
                                // window.focus(); // 브라우저 창에 포커스
                                console.log('클릭한 URL:', notification.url); // URL 값을 로그로 확인
                                var url = notification.url;
                                // URL이 'http'로 시작하면 절대 경로, 아니면 상대 경로로 처리
                                if (url) {
                                    url += '?fromNoti=true';
                                    if (url.startsWith('http')) {
                                        window.location.href = url; // 절대 URL로 이동
                                    } else {
                                        navigate(url); // 상대 URL로 이동
                                    }
                                }
                            };

                        }
                    } catch (error) {
                        console.error('알림 처리 오류:', error);
                    }
                });

                // 오류 처리 (기존과 동일)
                eventSource.onerror = (e) => {
                    console.error('SSE 연결 오류:', e);
                    if (eventSource) {
                        eventSource.close();
                        eventSource = null;
                    }
                    if (!reconnectTimer) {
                        reconnectTimer = setTimeout(setupSSE, 5000);
                    }
                };

            } catch (error) {
                console.error('SSE 초기화 실패:', error);
                if (!reconnectTimer) {
                    reconnectTimer = setTimeout(setupSSE, 10000);
                }
            }
        };

        if (isLoggedIn) setupSSE();

        return () => {
            if (eventSource) {
                eventSource.close();
                console.log('SSE 연결 종료');
            }
            if (reconnectTimer) clearTimeout(reconnectTimer);
        };
    }, [isLoggedIn]);

    // 읽지 않은 알림 조회 (기존과 동일)
    useEffect(() => {
        const fetchUnreadNotifications = async () => {
            // 로그인 시 확인하지 않은 새로운 알림만 불러오기
            try {
                const response = await axiosInstance.get('/notification/unread');
                const data = response.data; // response.data로 수정

                if (data.length > 0) {
                    setNewNotification(true); // 새로운 알림 존재 시 배지 표시
                } else {
                    setNewNotification(false); // 새로운 알림 없으면 배지 숨김
                }
                setNotifications(data);
            } catch (error) {
                console.error("안읽은 알림 가져오기 오류:", error);
            }
        };
        fetchUnreadNotifications();

    }, [isLoggedIn]);




    return (
        <AppContext.Provider value={{updateLoginStatus, isLoggedIn, updateSnackbar}}> {/* updateSnackbar 추가 */}
            <nav className="navbar">
                <div className="nav-left">
                    <NavLink
                        to="/"
                        className={({isActive}) => (isActive ? 'active' : '')}
                    >
                        Movlit
                    </NavLink>
                    <NavLink
                        to="/"
                        className={({isActive}) => (isActive ? 'active' : '')}
                    >
                        영화
                    </NavLink>
                    <NavLink
                        to="/book"
                        className={({isActive}) => (isActive ? 'active' : '')}
                    >
                        책
                    </NavLink>
                    <NavLink
                        to="/chatMain"
                        className={({isActive}) => (isActive ? 'active' : '')}
                    >
                        채팅
                    </NavLink>
                </div>
                <div className="nav-right">
                    <input
                        id={'searchInput'}
                        type="text"
                        placeholder="콘텐츠, 인물, 장르, 태그 검색"
                        className="search-box"
                        onChange={(e) => setInputStr(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e)}
                    />
                    {/*<button className="search-button" onClick={handleSearch}>*/}
                    {/*    검색*/}
                    {/*</button>*/}
                    {!isLoggedIn && (
                        <>
                            <NavLink
                                to="/member/login"
                                className={({isActive}) => (isActive ? 'active' : '')}
                            >
                                로그인
                            </NavLink>
                            <NavLink
                                to="/member/register"
                                className={({isActive}) => (isActive ? 'active' : '')}
                            >
                                회원가입
                            </NavLink>
                        </>
                    )}
                    {isLoggedIn && (
                        <div className="nav-right-logged-in">

                            <div onClick={handleBellClick} style={{position: 'relative', cursor: 'pointer'}}>
                                <img src="/images/notification-bell-icon.png" alt="알림" className="noti-img"/>
                                {newNotification && <span className="badge">N</span>}
                            </div>
                            {/* 알림 드롭다운 영역 */}
                            {/* 알림 드롭다운 영역 */}
                            {isDropdownOpen && (
                                <div className="notification-dropdown" ref={dropdownRef}>
                                    <NotiDropdown />
                                    <button className="close-dropdown-btn" onClick={closeDropdown}>닫기</button>
                                </div>
                            )}

                            <NavLink
                                to="/mypage"
                                className={({isActive}) =>
                                    isActive ? 'active nav-mypage' : 'nav-mypage'
                                }
                            >
                                {profileImage ? (
                                    <img
                                        src={profileImage.url}
                                        alt="프로필"
                                        className="nav-mypage-img"
                                    />
                                ) : (
                                    <FaUserCircle className="nav-mypage-icon"/>
                                )}
                            </NavLink>
                        </div>
                    )}
                </div>
            </nav>

            {/* Outlet에 context 전달 (기존과 동일) */}
            <Outlet context={{updateLoginStatus, isLoggedIn, updateSnackbar}}/>

            {/* Material-UI Snackbar 추가 (ToastContainer 대신) */}
            <Snackbar
                open={isSnackbarOpen}
                autoHideDuration={2000} // 2초로 변경
                onClose={handleSnackbarClose}
                anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{width: '100%'}}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>

        </AppContext.Provider>
    );
}

export default App;