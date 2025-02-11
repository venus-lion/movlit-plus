import React, {useEffect, useMemo, useState} from 'react';
import axiosInstance from '../../axiosInstance.js';
import {Client} from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import DateTimeUtil, {getNowDate} from "../../util/DateTimeUtil.jsx";
import './ChatList.css';

const ChatList = ({
                      currentUserId,
                      personalChats,
                      groupChats,
                      refreshKey,
                      activeTab,
                      searchTerm,
                      onSelectChat,
                      selectedChat
                  }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stompClient, setStompClient] = useState(null);
    // 선택된 채팅방의 ID를 상태로 관리
    const [selectedChatId, setSelectedChatId] = useState(null);

    const [posterImages, setPosterImages] = useState({}); // 포스터 이미지 URL 상태


    // fetch 관련 로직만 별도 useEffect로 분리 (refreshKey 변화에 따라 재호출)
    useEffect(() => {
        // const fetchChats = async () => {
        //     setLoading(true);
        //     try {
        //         await Promise.all([
        //             (async () => {
        //                 const response = await axiosInstance.get('/chat/group/rooms/my');
        //                 setGroupChats(response.data);
        //             })(),
        //             (async () => {
        //                 const response = await axiosInstance.get('/chat/oneOnOne');
        //                 setPersonalChats(response.data);
        //             })(),
        //         ]);
        //     } catch (err) {
        //         setError(err.message || '네트워크 오류가 발생했습니다.');
        //     } finally {
        //         setLoading(false);
        //     }
        // };
        //
        // fetchChats();

    }, [refreshKey]);

    // 웹소켓 연결 관련 로직은 최초 한 번만 실행하도록 [] 의존성 사용
    useEffect(() => {
        if (!currentUserId) return; // 아직 ID가 없다면 연결 안 함

        const client = new Client({
            webSocketFactory: () =>
                new SockJS(`${process.env.VITE_BASE_URL_FOR_CONF}/ws-stomp`),
            connectHeaders: {
                Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
            },
            debug: (str) => {
                console.log('STOMP Debug:', str);
            },
        });

        client.onConnect = () => {
            console.log('WebSocket Connected : ' + currentUserId);
            const tempId = `/topic/oneononeChatroom/create/publish/${currentUserId}`;
            console.log(tempId);
            client.subscribe(`/topic/oneononeChatroom/create/publish/${currentUserId}`, (message) => {
                try {
                    const createdChat = JSON.parse(message.body);
                    console.log('개인채팅방 생성건! ');
                    console.log(createdChat);
                    setPersonalChats((prevChats) => [...prevChats, createdChat]);
                } catch (e) {
                    console.error("Error parsing message:", e);
                }

            });

            personalChats.forEach((chat) => {
                const subId = `/topic/chat/message/one-on-one/${chat.roomId}`;
                client.subscribe(subId, (message) => {
                    const receivedMessage = JSON.parse(message.body);
                    setPersonalChats((prevChats) =>
                        prevChats.map((c) =>
                            c.roomId === receivedMessage.roomId
                                ? {...c, recentMessage: receivedMessage}
                                : c
                        )
                    );
                });
            });

            // 그룹 채팅에 대한 구독 처리
            groupChats.forEach((chat) => {
                const subId = `/topic/chat/message/group/${chat.groupChatroomId}`;
                client.subscribe(subId, (message) => {
                    const receivedMessage = JSON.parse(message.body);
                    setGroupChats((prevChats) =>
                        prevChats.map((c) =>
                            c.groupChatroomId === receivedMessage.roomId
                                ? {...c, recentMessage: receivedMessage}
                                : c
                        )
                    );
                });
            });
        };

        client.activate();
        setStompClient(client);

        return () => {
            client.deactivate();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUserId]);

    useEffect(() => {
        console.log('***********');
        console.log(personalChats);
    }, [personalChats]);  // personalChats 변경될 때마다 실행


    // 개인 채팅에 대한 구독 처리 (개인 채팅 배열이 변경될 때마다 추가)
    useEffect(() => {
        if (stompClient && stompClient.connected) {
            personalChats.forEach((chat) => {
                const subId = `/topic/chat/message/one-on-one/${chat.roomId}`;
                // 이미 구독되어 있는지 확인
                if (!stompClient.subscriptions || !stompClient.subscriptions[subId]) {
                    stompClient.subscribe(subId, (message) => {
                        const receivedMessage = JSON.parse(message.body);
                        setPersonalChats((prevChats) =>
                            prevChats.map((c) =>
                                c.roomId === receivedMessage.roomId
                                    ? {...c, recentMessage: receivedMessage}
                                    : c
                            )
                        );
                    });
                }
            });
        }
    }, [personalChats, stompClient]);

    // groupChats 값이 변경되었을 때 아직 구독되지 않은 topic만 추가
    useEffect(() => {
        // stompClient가 존재하고 연결된 상태일 때
        if (stompClient && stompClient.connected) {
            groupChats.forEach((chat) => {
                const subId = `/topic/chat/message/group/${chat.groupChatroomId}`;
                // 만약 해당 채팅방에 대한 구독이 아직 없다면
                if (!stompClient.subscriptions || !stompClient.subscriptions[subId]) {
                    stompClient.subscribe(subId, (message) => {
                        const receivedMessage = JSON.parse(message.body);
                        console.log('receivedMessage: ' + receivedMessage);
                        setGroupChats((prevChats) =>
                            prevChats.map((c) =>
                                c.groupChatroomId === receivedMessage.roomId
                                    ? {...c, recentMessage: receivedMessage}
                                    : c
                            )
                        );
                    });
                }
            });
        }
    }, [groupChats, stompClient]);

    // 필터링된 채팅 목록 (메모이제이션)
    const filteredChats = useMemo(() => {
        const chats = activeTab === 'personal' ? personalChats : groupChats;
        if (activeTab === 'personal') {
            chats.forEach((chat) =>
                console.log('개인채팅, chat :: ', chat)
            );

            return chats.filter((chat) =>
                chat.receiverNickname
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase())
            );
        } else {
            return chats.filter((chat) =>
                chat.roomName?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
    }, [activeTab, searchTerm, personalChats, groupChats]);

    // 각 채팅 아이템 클릭 시 호출되는 함수
    const handleChatSelect = (chat) => {
        // 선택된 채팅방의 ID를 설정
        if (activeTab === 'group') {
            setSelectedChatId(chat.groupChatroomId);
        } else {
            setSelectedChatId(chat.roomId);
        }
        onSelectChat(chat); // 선택된 채팅방을 상위 컴포넌트에 전달
    };

    // 선택된 채팅방에 따라 배경색 변하게 하기
    const getChatItemStyle = (chat) => {
        const isSelected = (activeTab === 'group' && selectedChat && selectedChat.groupChatroomId === chat.groupChatroomId) ||
            (activeTab === 'personal' && selectedChat && selectedChat.roomId === chat.roomId);
        return {
            backgroundColor: isSelected ? '#e0f7fa' : '#f9f9f9', // 선택된 배경색
        };
    };

    // 스타일 객체
    const style = {
        textContainer: { // 텍스트 영역 (roomName, contentName, recentMessage)
            display: 'flex',
            flexDirection: 'column', // 세로로 쌓이도록
            flexGrow: 1,          // 남은 공간 차지
            marginRight: '10px',   // 이미지와의 간격
        },
        roomName: {
            fontWeight: 'bold',
            color: 'black',
        },
        conTitle: {
            fontSize: '0.9em',
            color: 'black',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        },
        recentMsg: {
            fontSize: '0.9em',
            color: '#666',
            backgroundColor: '#faf9d7',
            padding: '5px',
            borderRadius: '10px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        },
        posterImage: {
            width: '50px',
            height: '70px',
            objectFit: 'cover',
        },
        noMessage: { // 메시지 없음 스타일 (필요한 경우)
            fontSize: '0.9em',
            color: '#666',
            backgroundColor: '#faf9d7', // 배경색 추가
            padding: '5px',          // 패딩 추가
            borderRadius: '10px',     // 둥근 모서리
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        }
    };


    // 포스터 이미지 URL 가져오는 함수
    const fetchPosterImage = async (contentId) => {
        if (!contentId) return;
        console.log('contentId :: ', contentId);

        const [contentType, id] = contentId.split('_');
        let url = '';

        try {
            if (contentType === 'MV') {
                const response = await axiosInstance.get(`/movies/${id}/detail`);
                url = response.data.posterPath;
            } else if (contentType === 'BK') {
                console.log('BK에서 fetchPosterIMage 실행 !!');

                const response = await axiosInstance.get(`/books/${id}/detail`);
                url = response.data.book_img_url;

            }
            if (url) {
                setPosterImages(prevImages => ({
                    ...prevImages,
                    [contentId]: url
                }));
            }


        } catch (error) {
            console.error("Error fetching poster image:", error);

        }
    };

    // groupChats가 변경될 때마다 포스터 이미지 가져오기
    useEffect(() => {
        console.log('ChatList -- groupChats 변경될 때마다..');

        if (activeTab === 'group') {
            groupChats.forEach(chat => {
                console.log(chat);
                if (chat.contentId && !posterImages[chat.contentId]) {
                    fetchPosterImage(chat.contentId);
                }
            });
        }
    }, [groupChats, activeTab, posterImages]);


    // if (loading) return <div>로딩 중...</div>;
    if (error) return <div>오류: {error}</div>;

    return (
        <div className="chat-list-container" style={style.chatListContainer}>
            {/* 그룹 채팅 목록 */}
            {activeTab === 'group' && (
                <div>
                    {filteredChats.map((chat) => (
                        <div
                            key={chat.groupChatroomId}
                            style={getChatItemStyle(chat)}
                            className='chat-item' // chat-item 클래스 적용
                            onClick={() => handleChatSelect(chat)}
                        >
                        {/* 포스터 이미지 */}
                        {posterImages[chat.contentId] && (
                            <img
                                src={posterImages[chat.contentId]}
                                alt="Poster"
                                className="poster-image" // 클래스 적용
                            />
                        )}

                        <div className="chat-info"> {/* 채팅 정보 컨테이너 */}
                            <div className="room-name">
                                {chat.roomName}
                            </div>
                            <div className="con-title">
                                <strong>{chat.contentName}</strong>
                            </div>
                            {chat.recentMessage ? (
                                <div className="recent-message">
                                    {chat.recentMessage.message}
                                </div>
                            ) : (
                                <div className="recent-message">메시지 없음</div>
                            )}
                        </div>
                        {/* 시간 */}
                        <div className="message-time">
                            {chat.recentMessage ? DateTimeUtil(chat.recentMessage.regDt) : ""}
                        </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 일대일 채팅 목록 */}
            {activeTab === 'personal' && (
                <div>
                    {filteredChats.map((chat) => (
                        <div
                            key={chat.roomId}
                            className='chat-item'
                            style={getChatItemStyle(chat)}
                            onClick={() => handleChatSelect(chat)} // 클릭 시 채팅방 선택
                        >
                            {/* 프로필 이미지 */}
                            {chat.receiverProfileImgUrl ? (
                                <img
                                    src={chat.receiverProfileImgUrl}
                                    alt="Profile"
                                    className="profile-image"
                                />
                            ) : (
                                // 기본 이미지 (FaUserCircle 같은 것)를 여기에 넣을 수 있음
                                <div className="profile-image"
                                     style={{
                                         backgroundColor: '#ccc',
                                         display: 'flex',
                                         justifyContent: 'center',
                                         alignItems: 'center',
                                         color: '#fff'
                                     }}>
                                </div>
                            )}

                            <div className="chat-info">
                                <div className="receiver-nickname">
                                    {chat.receiverNickname}
                                </div>
                                {chat.recentMessage ? (
                                    <div className="recent-message">
                                        {chat.recentMessage.message}
                                    </div>
                                ) : (
                                    <div className="recent-message">메시지 없음</div>
                                )}
                            </div>

                            <div className="message-time">
                                {chat.recentMessage ? DateTimeUtil(chat.recentMessage.regDt) : ""}
                            </div>
                            {/*<div style={{fontWeight: 'bold', color: 'black', fontSize: '1.2em'}}>*/}
                            {/*    {chat.receiverNickname}*/}
                            {/*</div>*/}
                            {/*{chat.recentMessage ? (*/}
                            {/*    <div>*/}
                            {/*        <div style={style.recentMsg}>*/}
                            {/*            {chat.recentMessage.message}*/}
                            {/*            <br/>*/}
                            {/*            {DateTimeUtil(chat.recentMessage.regDt)}*/}
                            {/*        </div>*/}
                            {/*    </div>*/}
                            {/*) : (*/}
                            {/*    <div>*/}
                            {/*        <div style={style.recentMsg}>메시지 없음</div>*/}
                            {/*    </div>*/}
                            {/*)}*/}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ChatList;