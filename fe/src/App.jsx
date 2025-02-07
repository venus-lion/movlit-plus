import React, {createContext, useCallback, useEffect, useState} from 'react';
import {NavLink, Outlet, useNavigate} from 'react-router-dom';
import axiosInstance from './axiosInstance';
import './App.css';
import {FaUserCircle} from 'react-icons/fa';
import {EventSourcePolyfill} from 'event-source-polyfill';
import notificationIcon from './images/notification.jpg';

// Material-UI 컴포넌트 import (Snackbar, Alert 추가)
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

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


    const handleLogout = async () => {
        try {
            await axiosInstance.post('/members/logout');
            localStorage.removeItem('accessToken');
            document.cookie =
                'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            updateLoginStatus(false);
            setProfileImage(null);
            navigate('/member/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
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
        navigate('/notifications');
    };


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

                            // 알림 종 (기존과 동일)
                            setNotifications((prev) => [...prev, notification]);
                            setNewNotification(true); // 새로운 알림 발생

                            noti.onclick = () => {
                                // window.focus(); // 브라우저 창에 포커스
                                window.location.href = notification.url; // notification.url로 페이지 이동
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
                        placeholder="검색어를 입력하세요"
                        className="search-box"
                        onChange={(e) => setInputStr(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e)}
                    />
                    <button className="search-button" onClick={handleSearch}>
                        검색
                    </button>
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

                            <button onClick={handleLogout} className="logout-button">
                                로그아웃
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            {/* Outlet에 context 전달 (기존과 동일) */}
            <Outlet context={{updateLoginStatus, isLoggedIn, updateSnackbar}}/>

            {/* Material-UI Snackbar 추가 (ToastContainer 대신) */}
            <Snackbar
                open={isSnackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{vertical: 'top', horizontal: 'right'}}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{width: '100%'}}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>

        </AppContext.Provider>
    );
}

export default App;