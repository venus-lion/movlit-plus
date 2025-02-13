import React, {useContext, useEffect, useState, useRef} from 'react'; // useContext import 추가
import ChatTabs from './ChatTabs';
import ChatList from './ChatList';
import {useLocation, useNavigate, useParams} from "react-router-dom";
import ChatPage from '../../pages/ChatPage.jsx';
import CreateGroupChatModal from "./CreateGroupChatModal.jsx";
import ChatPageGroup from "../../pages/ChatPageGroup.jsx";
import CreateGroupChatNameModal from "./CreateGroupChatNameModal.jsx";
import axiosInstance from "../../axiosInstance.js";
import GetGroupChatInfoModal from "./GetGroupChatInfoModal.jsx"; // axios 임포트
import {AppContext} from "../../App.jsx";
import {Client} from "@stomp/stompjs";
import SockJS from "sockjs-client"; // AppContext import
import DateTimeUtil, {getNowDate} from "../../util/DateTimeUtil.jsx";

const Chat = () => {
    // 알림(새로운 채팅 메시지)을 통해 채팅 메뉴 접속 -> 바로 "해당 채팅방" 띄우기
    const location = useLocation();
    const params = new URLSearchParams(location.search); // 쿼리 파라미터를 다루기 위해 URLSearchParams 사용
    const {type, chatId} = useParams(); // URL 파라미터에서 type과 chatId 가져오기
    const [chatrooms, setChatrooms] = useState([]);

    const [activeTab, setActiveTab] = useState(type || 'personal'); // 기본값 'personal'로 설정하기
    const [searchTerm, setSearchTerm] = useState(''); // 검색어
    const [selectedChat, setSelectedChat] = useState(null); // 현재 선택된 채팅방
    const selectedChatRef = useRef(selectedChat);
    const {isLoggedIn, updateSnackbar} = useContext(AppContext); // updateSnackbar context 함수 import
    const navigate = useNavigate();
    const [refreshKey, setRefreshKey] = useState(0); // 채팅 리스트 새로고침 키 추가
    const [chatComponentKey, setChatComponentKey] = useState(0); // Chat 컴포넌트 새로고침 키

    const [isCreateGroupChatModalOpen, setIsCreateGroupChatModalOpen] = useState(false); // 모달1 열림 상태
    const [isGetGroupChatInfoModalOpen, setIsGetGroupChatInfoModalOpen] = useState(false); // 채팅방 존재여무 모달2 열림 상태
    const [isCreateGroupChatNameModalOpen, setIsCreateGroupChatNameModalOpen] = useState(false); // 모달2 열림 상태
    const [selectedCard, setSelectedCard] = useState(null); // 선택된 데이터
    const [selectedCategory, setSelectedCategory] = useState(null);

    const [personalChats, setPersonalChats] = useState([]);
    const [groupChats, setGroupChats] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [stompClient, setStompClient] = useState(null);
    const [isStompConnected, setIsStompConnected] = useState(false);
    const [currentChatMessages, setCurrentChatMessages] = useState([]);
    const [currentGroupChatMembers, setCurrentGroupChatMembers] = useState(null);
    const subscribedTopicsRef = useRef(new Set()); // 구독 관리

    useEffect(() => {
        selectedChatRef.current = selectedChat;
    }, [selectedChat]);

    // 로그인 상태 확인 및 리다이렉트 로직 추가
    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/member/login', {replace: true}); // 리다이렉트 할 때, 브라우저 히스토리에 현재 경로를 남기지 않음
        }
    }, [isLoggedIn, navigate]);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                // 병렬 요청
                const [groupRes, personalRes] = await Promise.all([
                    axiosInstance.get('/chat/group/rooms/my'),
                    axiosInstance.get('/chat/oneOnOne'),
                ]);
                setGroupChats(groupRes.data);
                setPersonalChats(personalRes.data);
            } catch (err) {
                console.error('채팅방 목록 가져오기 실패:', err);
            }
        };

        fetchChats();
    }, [refreshKey]);
    useEffect(() => {
        // 탭이 변경되면 선택된 채팅방을 초기화하여 채팅 페이지를 감춥니다.
        setSelectedChat(null);
    }, [activeTab]);

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const response = await axiosInstance.get('/members/id');
                setCurrentUserId(response.data.memberId); // 여기서 state에 저장
                console.log(response.data.memberId);
            } catch (error) {
                console.error('Error fetching current user ID:', error);
            }
        };
        fetchUserId();
    }, []);

    // useEffect(() => {
    //     if (!currentUserId) return; // 아직 ID가 없다면 연결 안 함
    //
    //     const client = new Client({
    //         webSocketFactory: () =>
    //             new SockJS(`${process.env.VITE_BASE_URL_FOR_CONF}/ws-stomp`),
    //         connectHeaders: {
    //             Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
    //         },
    //         debug: (str) => {
    //             console.log('STOMP Debug:', str);
    //         },
    //     });
    //
    //     client.onConnect = () => {
    //         console.log('WebSocket Connected : ' + currentUserId);
    //         setIsStompConnected(true);
    //         // 일대일 채팅방 생성 토픽 구독
    //         const createTopic = `/topic/oneononeChatroom/create/publish/${currentUserId}`;
    //         if (!client.subscriptions || !client.subscriptions[createTopic]) {
    //             client.subscribe(createTopic, (message) => {
    //                 try {
    //                     const createdChat = JSON.parse(message.body);
    //                     setPersonalChats((prevChats) => {
    //                         // createdChat.roomId가 이미 존재하는지 검사
    //                         const exists = prevChats.some(chat => chat.roomId === createdChat.roomId);
    //                         return exists ? prevChats : [...prevChats, createdChat];
    //                     });
    //                 } catch (e) {
    //                     console.error("Error parsing message:", e);
    //                 }
    //
    //             });
    //         }
    //
    //         personalChats.forEach((chat) => {
    //             // 일대일 sendMessage 토픽 구독
    //             const msgSubId = `/topic/chat/message/one-on-one/${chat.roomId}`;
    //             if (!client.subscriptions || !client.subscriptions[msgSubId]) {
    //                 client.subscribe(msgSubId, (message) => {
    //                     const receivedMessage = JSON.parse(message.body);
    //                     setPersonalChats((prevChats) =>
    //                         prevChats.map((c) =>
    //                             c.roomId === receivedMessage.roomId
    //                                 ? {...c, recentMessage: receivedMessage}
    //                                 : c
    //                         )
    //                     );
    //                     // if (checkIsSelectedChat('personal', receivedMessage)) {
    //                     if (selectedChat.roomId && selectedChat.roomId === chat.roomId) {
    //                         setCurrentChatMessages((prev) => [...prev, receivedMessage]);
    //                     }
    //                 });
    //             }
    //
    //             // 일대일 프로필변경 토픽 구독
    //             const profileSubId = `/topic/chat/room/${chat.roomId}`;
    //             if (!client.subscriptions || !client.subscriptions[profileSubId]) {
    //                 client.subscribe(profileSubId, (message) => {
    //                     const receivedData = JSON.parse(message.body);
    //                     console.log('updateRoom');
    //                     console.log(receivedData);
    //                     // 1. receivedData가 배열(멤버 목록)인지, 객체(UpdateRoomDto)인지 체크
    //                     // setRoomInfoData(receivedData);
    //                     setPersonalChats((prevChats) =>
    //                         prevChats.map((c) =>
    //                             c.roomId === receivedData.roomId
    //                                 ? {...c, receiverProfileImgUrl: receivedData.receiverProfileImgUrl}
    //                                 : c
    //                         )
    //                     );
    //                 });
    //             }
    //         });
    //
    //         groupChats.forEach((chat) => {
    //             // 그룹 sendMessage 토픽 구독
    //             const groupMsgSubId = `/topic/chat/message/group/${chat.groupChatroomId}`;
    //             if (!client.subscriptions || !client.subscriptions[groupMsgSubId]) {
    //                 client.subscribe(groupMsgSubId, (message) => {
    //                     const receivedMessage = JSON.parse(message.body);
    //                     setGroupChats((prevChats) =>
    //                         prevChats.map((c) =>
    //                             c.groupChatroomId === receivedMessage.roomId
    //                                 ? {...c, recentMessage: receivedMessage}
    //                                 : c
    //                         )
    //                     );
    //                     // if (checkIsSelectedChat('group', receivedMessage)) {
    //                     if (selectedChat.groupChatroomId && selectedChat.groupChatroomId === chat.groupChatroomId) {
    //                         setCurrentChatMessages((prev) => [...prev, receivedMessage]);
    //                     }
    //                 });
    //             }
    //
    //             const groupUpdateSubId = `/topic/chat/room/${chat.groupChatroomId}`;
    //             if (!client.subscriptions || !client.subscriptions[groupUpdateSubId]) {
    //                 client.subscribe(groupUpdateSubId, (message) => {
    //                     const receivedData = JSON.parse(message.body);
    //                     // 1. receivedData가 배열(멤버 목록)인지, 객체(UpdateRoomDto)인지 체크
    //
    //                     if (selectedChat.groupChatroomId && selectedChat.groupChatroomId === chat.groupChatroomId) {
    //                         if (Array.isArray(receivedData)) {
    //                             // 1-1. 멤버 프로필 업데이트 이벤트
    //                             // setMembers(receivedData);
    //
    //                             setCurrentGroupChatMembers(receivedData);
    //
    //
    //                         } else if (receivedData.hasOwnProperty('updateRoomDto')) {
    //                             // 1-2. receivedData에 updateRoomDto 속성이 있으면, MEMBER_JOIN 이벤트로 간주
    //                             const updateRoomDto = receivedData.updateRoomDto;
    //                             const cachedMembers = receivedData.cachedMembers;
    //
    //                             if (updateRoomDto.eventType === 'MEMBER_JOIN') {
    //                                 // MEMBER_JOIN 이벤트 처리
    //
    //                                 setCurrentGroupChatMembers(cachedMembers);
    //
    //                                 // joinMessage 처리
    //                                 const joinMessage = updateRoomDto.eventMessage;
    //
    //                                 // 1-5. joinMessage를 채팅 메시지와 구분하여 화면에 표시
    //                                 setCurrentChatMessages((prevMessages) => [
    //                                     ...prevMessages,
    //                                     {
    //                                         type: 'join', // 메시지 유형을 'join'으로 설정
    //                                         message: joinMessage,
    //                                         // regDt: DateTimeUtil(getNowDate()), //new Date(),
    //                                         regDt: getNowDate(),
    //                                     },
    //                                 ]);
    //
    //                             } else if (updateRoomDto.eventType === 'MEMBER_LEAVE') {
    //                                 // MEMBER_LEAVE 이벤트 처리
    //                                 // setMembers(cachedMembers);
    //                                 setCurrentGroupChatMembers(cachedMembers);
    //
    //                                 const leaveMessage = updateRoomDto.eventMessage;
    //                                 // setMessages((prevMessages) => [
    //                                 setCurrentChatMessages((prevMessages) => [
    //                                     ...prevMessages,
    //                                     {
    //                                         type: 'join', // (중요) 나간 멤버 알림 메시지 유형을 'join'으로 설정
    //                                         message: leaveMessage, // "ㅇㅇ님이 나갔습니다" 메시지 설정
    //                                         regDt: getNowDate()
    //                                     },
    //                                 ]);
    //                             }
    //                         }
    //                     }
    //                 });
    //             }
    //         });
    //
    //     };
    //
    //
    //     client.activate();
    //     setStompClient(client);
    //
    //     return () => {
    //         if (client.connected){
    //             client.deactivate();
    //         }
    //     };
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [currentUserId, personalChats, groupChats, selectedChat]);
    // 현재 유저 ID 불러오기
    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const response = await axiosInstance.get('/members/id');
                setCurrentUserId(response.data.memberId);
                console.log('내 사용자 ID:', response.data.memberId);
            } catch (error) {
                console.error('Error fetching current user ID:', error);
            }
        };
        fetchUserId();
    }, []);

    // =========================
    // 1) 소켓 연결 로직 분리
    // =========================
    useEffect(() => {
        // 유저 ID가 있어야 연결 가능
        if (!currentUserId) return;

        const client = new Client({
            webSocketFactory: () =>
                new SockJS(`${process.env.VITE_BASE_URL_FOR_CONF}/ws-stomp`),
            connectHeaders: {
                Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
            },
            debug: (str) => {
                console.log('STOMP Debug:', str);
            },
            onConnect: () => {
                console.log('WebSocket Connected : ' + currentUserId);
                setIsStompConnected(true);
            },
        });

        // 실제로 연결 시도
        client.activate();
        // 연결된 client를 상태에 저장
        setStompClient(client);

        // 언마운트 시 연결 해제
        return () => {
            if (client.connected) {
                client.deactivate();
            }
            setIsStompConnected(false);
            subscribedTopicsRef.current.clear(); // 구독 목록 초기화
        };
    }, [currentUserId]);

    // =====================================
    // 2) 구독(Subscription) 로직 분리
    // =====================================
    useEffect(() => {
        // 소켓 연결이 되었다면, 실제 Topic 구독을 진행
        if (!isStompConnected || !stompClient) return;

        console.log('Subscribing to topics...');
        const subscribeToTopic = (topic, callback) => {
            if (!subscribedTopicsRef.current.has(topic)) {
                const subscription = stompClient.subscribe(topic, callback);
                subscribedTopicsRef.current.add(topic);
                return subscription;
            }
            return null;
        };

        const unsubscribeAll = () => {
            subscribedTopicsRef.current.forEach((topic) => {
                stompClient.unsubscribe(topic);
            });
            subscribedTopicsRef.current.clear();
            console.log('🛑 모든 구독 해제 완료');
        };


        // ----------------------------------
        // (A) 1:1 채팅방 생성 토픽 구독
        // ----------------------------------
        const createTopic = `/topic/oneononeChatroom/create/publish/${currentUserId}`;
        if (subscribedTopicsRef.current.has(createTopic)) return;
        subscribedTopicsRef.current.add(createTopic);
        stompClient.subscribe(createTopic, (message) => {
            try {
                const createdChat = JSON.parse(message.body);
                setPersonalChats((prevChats) => {
                    const exists = prevChats.some(chat => chat.roomId === createdChat.roomId);
                    return exists ? prevChats : [...prevChats, createdChat];
                });
            } catch (e) {
                console.error("Error parsing message:", e);
            }
        });

        // ----------------------------------
        // (B) 1:1 채팅 관련 토픽 구독
        // ----------------------------------
        personalChats.forEach((chat) => {
            // 메시지 토픽
            const msgSubId = `/topic/chat/message/one-on-one/${chat.roomId}`;
            if (subscribedTopicsRef.current.has(msgSubId)) return;
            subscribedTopicsRef.current.add(msgSubId);

            stompClient.subscribe(msgSubId, (message) => {
                const receivedMessage = JSON.parse(message.body);
                setPersonalChats((prevChats) =>
                    prevChats.map((c) =>
                        c.roomId === receivedMessage.roomId
                            ? {...c, recentMessage: receivedMessage}
                            : c
                    )
                );
                // 현재 선택된 채팅방이라면 메시지 리스트에 추가
                // if (selectedChat?.roomId && selectedChat.roomId === chat.roomId) {
                //     setCurrentChatMessages((prev) => [...prev, receivedMessage]);
                // }
            });


            // 프로필 변경 토픽
            const profileSubId = `/topic/chat/room/${chat.roomId}`;
            if (!stompClient.subscriptions || !stompClient.subscriptions[profileSubId]) {
                stompClient.subscribe(profileSubId, (message) => {
                    const receivedData = JSON.parse(message.body);
                    setPersonalChats((prevChats) =>
                        prevChats.map((c) =>
                            c.roomId === receivedData.roomId
                                ? {...c, receiverProfileImgUrl: receivedData.receiverProfileImgUrl}
                                : c
                        )
                    );
                });
            }
        });

        return () => {
            unsubscribeAll(); // 언마운트 시 기존 구독 제거
        };

    }, [
        isStompConnected,
        stompClient,
        personalChats,
        selectedChat
        // currentUserId
    ]);

    // ----------------------------------
    // (C) 그룹 채팅 관련 토픽 구독
    // ----------------------------------
    useEffect(() => {
        // 소켓 연결이 되었다면, 실제 Topic 구독을 진행
        if (!isStompConnected || !stompClient) return;

        const groupMsgTopics = new Set();
        const groupUpdateTopics = new Set();

        groupChats.forEach((chat) => {
            // 메시지 토픽
            const groupMsgSubId = `/topic/chat/message/group/${chat.groupChatroomId}`;
            if (groupMsgTopics.has(groupMsgSubId)) return;
            groupMsgTopics.add(groupMsgSubId);

            stompClient.subscribe(groupMsgSubId, (message) => {
                console.log('채팅 도착');
                const receivedMessage = JSON.parse(message.body);
                setGroupChats((prevChats) =>
                    prevChats.map((c) =>
                        c.groupChatroomId === receivedMessage.roomId
                            ? {...c, recentMessage: receivedMessage}
                            : c
                    )
                );
                // 현재 열려있는 그룹 채팅방이면 메시지 리스트에 추가
                // if (
                //     selectedChat?.groupChatroomId &&
                //     selectedChat.groupChatroomId === chat.groupChatroomId
                // ) {
                //     setCurrentChatMessages((prev) => [...prev, receivedMessage]);
                // }
            });


            // 멤버 업데이트 토픽
            const groupUpdateSubId = `/topic/chat/room/${chat.groupChatroomId}`;
            if (!stompClient.subscriptions || !stompClient.subscriptions[groupUpdateSubId]) {
                stompClient.subscribe(groupUpdateSubId, (message) => {
                    const receivedData = JSON.parse(message.body);

                    // 현재 열려있는 채팅방과 일치하는 경우만 처리
                    if (
                        selectedChat?.groupChatroomId &&
                        selectedChat.groupChatroomId === chat.groupChatroomId
                    ) {
                        if (Array.isArray(receivedData)) {
                            // 멤버 프로필 업데이트 이벤트
                            setCurrentGroupChatMembers(receivedData);
                        } else if (receivedData.hasOwnProperty('updateRoomDto')) {
                            // MEMBER_JOIN or MEMBER_LEAVE 이벤트
                            const {updateRoomDto, cachedMembers} = receivedData;

                            // 새 멤버 리스트 반영
                            setCurrentGroupChatMembers(cachedMembers);

                            if (updateRoomDto.eventType === 'MEMBER_JOIN') {
                                // 참여 메시지
                                const joinMessage = updateRoomDto.eventMessage;
                                setCurrentChatMessages((prev) => [
                                    ...prev,
                                    {
                                        type: 'join',
                                        message: joinMessage,
                                        regDt: getNowDate(),
                                    },
                                ]);
                            } else if (updateRoomDto.eventType === 'MEMBER_LEAVE') {
                                // 퇴장 메시지
                                const leaveMessage = updateRoomDto.eventMessage;
                                setCurrentChatMessages((prev) => [
                                    ...prev,
                                    {
                                        type: 'join',
                                        message: leaveMessage,
                                        regDt: getNowDate(),
                                    },
                                ]);
                            }
                        }
                    }
                });
            }
        });
    }, [
        isStompConnected,
        stompClient,
        groupChats,
        selectedChat
        // currentUserId
    ]);

    // URL 쿼리 파라미터에서 fromNoti 값 추출하는 함수
    const useQuery = () => {
        return new URLSearchParams(location.search);
    };

    // 알림(새로운 채팅 메시지)을 통해 채팅 메뉴 접속 -> 바로 "해당 채팅방" 띄우기
    const fetchRoomInfoFromNoti = async () => {
        try {
            let response;

            // type에 따라 적절한 API를 호출하여 채팅방 리스트 가져오기
            if (type === 'group') {
                response = await axiosInstance.get('/chat/group/rooms/my');

            } else if (type === 'personal') {
                response = await axiosInstance.get('/chat/oneOnOne');
            }

            // 전체 채팅방 리스트 상태에 저장
            setChatrooms(response.data);


            // chatId에 해당하는 채팅방 찾기
            const chatRoom = response.data.find(room =>
                type === 'group' ? room.groupChatroomId === chatId : room.roomId === chatId
            );

            if (type === 'group' && chatId) {
                fetchGroupChatMembers(chatId);
            }

            console.log('@@ 선택된 방 : ' + JSON.stringify(chatRoom, null, 2));
            if (chatRoom) {
                setSelectedChat(chatRoom); // 찾은 채팅방 정보를 선택
            }
        } catch (error) {
            console.error("알림 받은 채팅방 정보 받아오기 오류:", error);
        }
    };

    // 알림(새로운 채팅 메시지)을 통해 채팅 메뉴 접속 -> 바로 "해당 채팅방" 띄우기
    // 컴포넌트가 마운트될 때 chatId와 fromNoti가 true일 때만 채팅방 리스트 업데이트
    useEffect(() => {
        const query = useQuery();
        const fromNoti = query.get('fromNoti'); // 'fromNoti' 쿼리 파라미터 가져오기

        if (fromNoti === 'true') {
            fetchRoomInfoFromNoti(); // fromNoti가 true일 때만 비동기 함수 호출
        }
    }, [type, chatId, location.search]); // type, chatId, location.search가 변경될 때마다 실행

    const handleCreateGroupChatModal = () => {
        setIsCreateGroupChatModalOpen(true);
    };

    const handleCloseGroupChatModal = () => {
        setIsCreateGroupChatModalOpen(false);
        setSelectedCard(null);
        setSelectedCategory(null);
    };

    // 채팅방 존재여무 모달2 (기존과 동일)
    const handleOpenGroupChatInfoModal = (card, category) => {
        setSelectedCard(card);
        setSelectedCategory(category);
        setIsCreateGroupChatModalOpen(false); // 첫 번째 모달 닫기
        setIsGetGroupChatInfoModalOpen(true); // 두 번째 모달 열기
    };
    const handleCloseGroupChatInfoModal = () => {
        setIsGetGroupChatInfoModalOpen(false);
        setSelectedCard(null);
        setSelectedCategory(null);
    };

    const handleOpenGroupChatNameModal = (card, category) => {
        setSelectedCard(card); // 선택된 카드 데이터 저장
        setSelectedCategory(category); // 선택된 카테고리 저장
        setIsGetGroupChatInfoModalOpen(false); // 두 번째 모달 닫기
        setIsCreateGroupChatNameModalOpen(true); // 세 번째 모달 열기
    };

    const handleCloseGroupChatNameModal = () => {
        setIsCreateGroupChatNameModalOpen(false);
        setSelectedCard(null);
        setSelectedCategory(null);
    };

    // 검색 핸들러 (기존과 동일)
    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    // 채팅방 생성 핸들러 (기존과 동일)
    const handleCreateChat = () => {
        if (!isLoggedIn) { // 로그인을 하지 않았다면..
            alert('로그인이 필요합니다.'); // alert -> Material-UI Snackbar로 대체는 X (alert 유지)
            navigate('/member/login');
            return;
        }
        setIsCreateGroupChatModalOpen(true); // 모달 열기
    };

    const handleJoinRoom = async (existingRoomInfo) => {
        // existingRoomInfo가 null이 아닌지 확인 (기존과 동일)
        if (!existingRoomInfo || !existingRoomInfo.groupChatroomId) {
            updateSnackbar("채팅방 정보가 유효하지 않습니다.", 'warning'); // toast.error -> updateSnackbar
            return;
        }

        const groupChatroomId = existingRoomInfo.groupChatroomId; // 채팅방 ID 추출 (기존과 동일)
        try {
            await axiosInstance.post(`/chat/group/${groupChatroomId}`);
            updateSnackbar("채팅방 가입에 성공하였습니다.", 'success'); // toast.success -> updateSnackbar
            setRefreshKey(prevKey => prevKey + 1); // 키를 업데이트하여 ChatList를 다시 렌더링함 (기존과 동일)
            handleCloseGroupChatInfoModal(); // 현재 두번째 모달창 닫기 (기존과 동일)
        } catch (error) {
            updateSnackbar("채팅방 가입에 실패했습니다.", 'error'); // toast.error -> updateSnackbar
        }
    };

    // 선택된 채팅방에 따라 URL 변경 (기존과 동일)
    useEffect(() => {
        if (selectedChat) {
            const chatId = activeTab === 'personal' ? selectedChat.roomId : selectedChat.groupChatroomId;
            navigate(`/chatMain/${chatId}/${activeTab}`);

            setCurrentChatMessages([]);
            fetchChatMessages(chatId);
        }
    }, [selectedChat, activeTab, navigate]);


    // 일대일 채팅방 정보 변경될 때
    useEffect(() => {
        if (selectedChat) {
            // const updatedSelected = personalChats.find(chat => String(chat.roomId) === String(selectedChat.roomId));
            // if (updatedSelected) {
            //     setSelectedChat(updatedSelected);
            // }
            const updatedSelected = personalChats.find(
                (chat) => String(chat.roomId) === String(selectedChat.roomId)
            );
            if (updatedSelected && updatedSelected.receiverProfileImgUrl !== selectedChat.receiverProfileImgUrl) {
                setSelectedChat(prev => ({
                    ...prev,
                    receiverProfileImgUrl: updatedSelected.receiverProfileImgUrl
                }));
            }
        }
    }, [personalChats]);

    // ChatList 갱신 함수 (기존과 동일)
    const refreshChatList = () => {
        setRefreshKey(prevKey => prevKey + 1);
        setSelectedChat(null); // selectedChat을 null로 설정
        // setCurrentChatMessages(null);
        // setCurrentGroupChatMembers(null);
    };

    // Chat 컴포넌트 새로고침 함수 (기존과 동일)
    const refreshChatComponent = () => {
        setChatComponentKey(prevKey => prevKey + 1);
        setSelectedChat(null); // selectedChat을 null로 설정
        // setCurrentChatMessages(null);
        // setCurrentGroupChatMembers(null);
    };

    const fetchChatMessages = async (chatId) => {
        // 과거 메시지 로드
        await axiosInstance
            .get(`/chat/history?roomId=${chatId}`)
            .then((response) => {
                setCurrentChatMessages(response.data);
            })
            .catch((error) => {
                console.error('Error fetching chat history:', error);
            });
    }

    const checkIsSelectedChat = (type, target) => {
        let roomId;
        if (type === 'personal') {
            roomId = target.roomId;
            if (selectedChatRef.current && selectedChatRef.current.roomId === roomId) {
                return true;
            } else {
                false;
            }
        }
        // else {
        //     roomId = target.groupChatroomId;
        //     if (selectedChatRef.current && selectedChatRef.current.groupChatroomId === roomId) {
        //         return true;
        //     } else {
        //         return false;
        //     }
        // }
    }

    const fetchGroupChatMembers = async (roomId) => {
        await axiosInstance.get(`/chat/${roomId}/members`)
            .then((response) => {
                // setMembers(response.data);
                setCurrentGroupChatMembers(response.data);
                console.log('fetched members :: (response.data) : ', response.data);
            })
            .catch((error) => {
                console.error('Error fetching chatroom members:', error);
            });
    }

    const handleChatSelect = (type, chat) => {
        if (type === 'group') {
            console.log('handleChatSelect !! ');
            console.log(chat);
            fetchGroupChatMembers(chat.groupChatroomId).then(() => setSelectedChat(chat));
        } else {
            setSelectedChat(chat);
        }
        // setSelectedChat(chat);
    }

    const handleChatMessage = (type, receivedMessage) => {
        if (type === 'group') {
            setGroupChats((prev) =>
                prev.map((chat) =>
                    chat.roomId === receivedMessage.roomId
                        ? {...chat, recentMessage: receivedMessage}
                        : chat
                )
            );
            // 현재 선택된 그룹 채팅방에 해당하는 메시지라면
            if (selectedChat && selectedChat.groupChatroomId === receivedMessage.roomId) {
                setCurrentChatMessages((prev) => [...prev, receivedMessage]);
            }
        }
    };

    return (
        <div style={{display: 'flex', height: 'calc(100vh - 60px)'}}>
            {/* 왼쪽: 채팅 목록 (기존과 동일) */}
            <div style={{
                width: '30%',
                borderRight: '1px solid #ddd',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative' // 상대적 위치 설정
            }}>
                <ChatTabs activeTab={activeTab} setActiveTab={setActiveTab}/>
                <input
                    type="text"
                    placeholder={activeTab === 'personal' ? '개인 채팅 검색' : '그룹 채팅 검색'}
                    value={searchTerm}
                    onChange={handleSearch}
                    style={{
                        width: '100%',
                        padding: '10px',
                        marginBottom: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                    }}
                />
                <ChatList
                    currentUserId={currentUserId}
                    personalChats={personalChats}
                    groupChats={groupChats}
                    refreshKey={refreshKey} // 새로고침 키 전달
                    activeTab={activeTab}
                    searchTerm={searchTerm}
                    // onSelectChat={(chat) => setSelectedChat(chat)} // 선택된 채팅방 설정
                    onSelectChat={handleChatSelect}
                    selectedChat={selectedChat} // 선택된 채팅방을 ChatList에 전달
                />

                {/* 채팅방 생성 버튼 (기존과 동일) */}
                {activeTab === "group" && (

                    <button
                        onClick={handleCreateGroupChatModal}
                        className="add-groupchat-btn"
                    >
                        +
                    </button>
                )}
            </div>

            {/* 오른쪽: 채팅방 창 (기존과 동일) */}
            <div style={{flex: 1, padding: '10px'}}>
                {selectedChat ? (
                    activeTab === 'personal' ? (
                        <ChatPage
                            key={selectedChat.roomId}
                            roomId={selectedChat.roomId}
                            roomInfo={selectedChat}
                            currentUserId={currentUserId}
                            stompClient={stompClient}
                            isStompConnected={isStompConnected}
                            messages={currentChatMessages}
                        /> /* 개인 채팅방 */
                    ) : (
                        <ChatPageGroup
                            roomId={selectedChat.groupChatroomId}
                            roomInfo={selectedChat}
                            stompClient={stompClient}
                            isStompConnected={isStompConnected}
                            refreshChatList={refreshChatList}
                            refreshChatComponent={refreshChatComponent} // refreshChatComponent 함수 전달
                            messages={currentChatMessages}
                            currentUserId={currentUserId}
                            currentGroupChatMembers={currentGroupChatMembers}
                            onReceiveMessage={handleChatMessage}
                        /> /* 그룹 채팅방 */
                    )
                ) : (
                    <div style={{textAlign: 'center', marginTop: '20%'}}>
                        {activeTab === 'personal' ? '개인' : '그룹'} 채팅방을 선택해주세요.
                    </div>
                )}
            </div>

            {/* 모달 창 (기존과 동일) */}
            <CreateGroupChatModal
                isOpen={isCreateGroupChatModalOpen}
                onClose={handleCloseGroupChatModal}
                onConfirm={(card, category) => handleOpenGroupChatInfoModal(card, category)} // 선택된 데이터 전달
            />
            <GetGroupChatInfoModal
                isOpen={isGetGroupChatInfoModalOpen}
                onClose={handleCloseGroupChatInfoModal}
                selectedCard={selectedCard} // 선택된 데이터 전달
                selectedCategory={selectedCategory} // 선택된 카테고리 전달
                onConfirm={(card, category) => handleOpenGroupChatNameModal(card, category)} // 선택된 데이터 전달
                onJoin={handleJoinRoom} // "가입하기" 버튼의 핸들러 추가
            />
            <CreateGroupChatNameModal
                isOpen={isCreateGroupChatNameModalOpen}
                onClose={handleCloseGroupChatNameModal}
                selectedCard={selectedCard} // 선택된 데이터 전달
                selectedCategory={selectedCategory} // 선택된 카테고리 전달
                onUpdateChatList={() => {
                    setRefreshKey(prevKey => prevKey + 1); // 채팅방 리스트 새로고침 키 업데이트
                }}
            />
        </div>
    );
};

export default Chat;