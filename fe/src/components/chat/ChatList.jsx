import React, {useEffect, useMemo, useState} from 'react';
import axiosInstance from '../../axiosInstance.js';
import {Client} from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import DateTimeUtil, {getNowDate} from "../../util/DateTimeUtil.jsx";

const ChatList = ({refreshKey, activeTab, searchTerm, onSelectChat}) => {
    const [groupChats, setGroupChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [personalChats, setPersonalChats] = useState([]);
    const [stompClient, setStompClient] = useState(null);

    // fetch 관련 로직만 별도 useEffect로 분리 (refreshKey 변화에 따라 재호출)
    useEffect(() => {
        const fetchChats = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    (async () => {
                        const response = await axiosInstance.get('/chat/group/rooms/my');
                        setGroupChats(response.data);
                        console.log(response.data);
                    })(),
                    (async () => {
                        const response = await axiosInstance.get('/chat/oneOnOne');
                        setPersonalChats(response.data);
                    })(),
                ]);
            } catch (err) {
                setError(err.message || '네트워크 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchChats();
    }, [refreshKey]);

    // 웹소켓 연결 관련 로직은 최초 한 번만 실행하도록 [] 의존성 사용
    useEffect(() => {
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
            console.log('WebSocket Connected');
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
    }, []); // 웹소켓 연결은 최초 마운트 시 한 번만 실행

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

    // 스타일 객체
    const style = {
        conTitle: {
            fontSize: '0.9em',
            color: 'black',
            width: '70%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        },
        recentMsg: {
            fontSize: '0.9em',
            color: '#666',
            backgroundColor: '#faf9d7',
            padding: '5px',
            width: '100%',
            borderRadius: '10px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        },
        chatListContainer: {
            maxHeight: '550px',
            overflowY: 'auto',
            border: '1px solid #ddd',
            padding: '10px',
            borderRadius: '4px',
        },
    };

    if (loading) return <div>로딩 중...</div>;
    if (error) return <div>오류: {error}</div>;

    return (
        <div style={style.chatListContainer}>
            {/* 그룹 채팅 목록 */}
            {activeTab === 'group' && (

                <div>
                    {filteredChats.map((chat) => (
                        <div
                            key={chat.groupChatroomId}
                            style={{
                                padding: '10px',
                                borderBottom: '1px solid #ddd',
                                cursor: 'pointer',
                            }}
                            onClick={() => onSelectChat(chat)}
                        >
                            <div style={{fontWeight: 'bold', color: 'black'}}>
                                {chat.roomName}
                            </div>
                            <div style={style.conTitle}>
                                [콘텐츠] <strong>{chat.contentName}</strong>
                            </div>
                            <div>
                                {chat.recentMessage ? (
                                    <div>
                                        <div style={style.recentMsg}>
                                            <strong>[New] </strong>
                                            {chat.recentMessage.message}
                                            <br/>
                                            {DateTimeUtil(chat.recentMessage.regDt)}
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div style={style.recentMsg}>메시지 없음</div>
                                    </div>
                                )}
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
                            style={{
                                padding: '15px',
                                marginBottom: '10px',
                                backgroundColor: '#f9f9f9',
                                border: '1px solid #ccc',
                                borderRadius: '5px',
                                cursor: 'pointer',
                            }}
                            onClick={() => onSelectChat(chat)}
                        >
                            <div style={{fontWeight: 'bold', color: 'black', fontSize: '1.2em'}}>
                                {chat.receiverNickname}
                            </div>
                            {chat.recentMessage ? (
                                <div>
                                    <div style={style.recentMsg}>
                                        <strong>[New] </strong>
                                        {chat.recentMessage.message}
                                        <br/>
                                        {DateTimeUtil(chat.recentMessage.regDt)}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div style={style.recentMsg}>메시지 없음</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ChatList;