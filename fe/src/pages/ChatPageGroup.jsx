import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axiosInstance from '../axiosInstance';
import './ChatPage.css';

function ChatPageGroup({ roomId, roomInfo }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [stompClient, setStompClient] = useState(null);
    const [members, setMembers] = useState([]);
    const messagesEndRef = useRef(null);
    const [isComposing, setIsComposing] = useState(false); // 한글 입력 상태를 추적하는 상태 변수

    // 현재 로그인한 userId
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        axiosInstance
            .get(`/members/id`)
            .then((response) => {
                setCurrentUserId(response.data.memberId);
                console.log('현재 로그인한 사람 :::: ' + response.data.memberId);
            })
            .catch((error) => {
                console.error('Error fetching current user ID:', error);
            });
    }, []);

    // 그룹 채팅방 멤버 목록 불러오기
    useEffect(() => {
        if (roomId) {
            axiosInstance
                .get(`/chat/${roomId}/members`)
                .then((response) => {
                    setMembers(response.data);
                    console.log('fetched members :: (response.data) : ', response.data);
                    response.data.forEach(member => {
                        console.log("Member ID:", member.memberId);
                        console.log("Nickname:", member.nickname);
                        console.log("Profile Image URL:", member.profileImgUrl);
                    });
                })
                .catch((error) => {
                    console.error('Error fetching chatroom members:', error);
                });
        }
    }, [roomId]);

    // WebSocket 연결 설정 및 메시지 수신
    useEffect(() => {
        if (!roomId) return;

        const client = new Client({
            webSocketFactory: () => new SockJS(`${process.env.VITE_BASE_URL_FOR_CONF}/ws-stomp`),
            connectHeaders: {
                Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
            },
        });

        client.onConnect = () => {
            client.subscribe(`/topic/chat/message/group/${roomId}`, (message) => {
                const receivedMessage = JSON.parse(message.body);
                setMessages((prevMessages) => [...prevMessages, receivedMessage]);
            });

            axiosInstance
                .get(`/chat/history?roomId=${roomId}`)
                .then((response) => {
                    console.log('------- response --------', response.data);
                    setMessages(response.data);
                })
                .catch((error) => {
                    console.error('Error fetching chat history:', error);
                });
        };

        client.activate();
        setStompClient(client);

        return () => {
            if (client.connected) client.deactivate();
        };
    }, [roomId]);

    const sendMessage = () => {
        if (stompClient && newMessage && currentUserId) {
            const chatMessage = {
                roomId: roomId,
                senderId: currentUserId,
                message: newMessage,
                regDt: new Date(),
            };

            stompClient.publish({
                destination: '/app/chat/message/group',
                body: JSON.stringify(chatMessage),
            });

            setNewMessage('');
        }
    };

    // Composition Event 핸들러
    const handleCompositionStart = () => setIsComposing(true);
    const handleCompositionEnd = () => setIsComposing(false);

    // Enter 키 입력 핸들러
    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !isComposing) { // isComposing이 false일 때만 sendMessage 호출
            sendMessage();
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="chat-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="chat-header">
                <h2>채팅방: {roomInfo.roomName}</h2>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '10px' }}>
                {messages.map((message, index) => {
                    let member = null;
                    if (members.length > 1) {
                        member = members.find((m) => m.memberId !== currentUserId);
                    }
                    const isCurrentUser = message.senderId === currentUserId;

                    return (
                        <div
                            key={index}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                marginBottom: '10px',
                                flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                            }}
                            className={`message ${isCurrentUser ? 'own-message' : ''}`}
                        >
                            {!isCurrentUser && member && (
                                <div className="message-profile">
                                    <img
                                        src={member?.profileImgUrl}
                                        alt="Profile"
                                        className="profile-img"
                                    />
                                    <strong>{member?.nickname}</strong>
                                </div>
                            )}
                            <div className="message-content">
                                <div className={`message-bubble ${isCurrentUser ? 'own-bubble' : ''}`}>
                                    {message.message}
                                </div>
                                <div className="message-time">
                                    {new Date(message.regDt).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            <div className="chat-input-container">
                <input
                    type="text"
                    className="chat-input"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onCompositionStart={handleCompositionStart} // Composition Event 핸들러 등록
                    onCompositionEnd={handleCompositionEnd} // Composition Event 핸들러 등록
                    placeholder="메시지를 입력하세요..."
                />
                <button onClick={sendMessage}>보내기</button>
            </div>
        </div>
    );
}

export default ChatPageGroup;