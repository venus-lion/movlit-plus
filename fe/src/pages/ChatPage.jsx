import React, {useState, useEffect, useRef} from 'react';
import {Client} from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axiosInstance from '../axiosInstance'; // axios 인스턴스 import
import './ChatPage.css'; // CSS 파일 import

function ChatPage() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [stompClient, setStompClient] = useState(null);
    const [roomId, setRoomId] = useState(null); // roomId 상태 추가

    // 채팅방 입장 시 roomId 설정
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const roomIdFromParams = urlParams.get('roomId');
        if (roomIdFromParams) {
            setRoomId(roomIdFromParams);
        } else {
            // roomId가 없을 경우 기본값 또는 생성 로직 추가
            const generatedRoomId = 1; // 임시로 test로 설정.
            setRoomId(generatedRoomId);
        }
    }, []);

    // WebSocket 연결 설정
    useEffect(() => {
        if (!roomId) return; // roomId가 없으면 연결하지 않음

        const client = new Client({
            webSocketFactory: () => new SockJS(`${process.env.VITE_BASE_URL_FOR_CONF}/ws-stomp`),
            connectHeaders: {
                Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
            },
            debug: (str) => {
                console.log('STOMP Debug:', str);
                console.log("메시지  : " + JSON.stringify(messages, null, 2));
            },
        });



        client.onConnect = () => {
            console.log('WebSocket Connected');
            client.subscribe(`/topic/chat/${roomId}`, (message) => {
                const receivedMessage = JSON.parse(message.body);
                setMessages((prevMessages) => [...prevMessages, receivedMessage]);
            });

            // 과거 메시지 로드
            axiosInstance
                .get(`/chat/history?roomId=${roomId}`)
                .then((response) => {
                    setMessages(response.data);
                })
                .catch((error) => {
                    console.error('Error fetching chat history:', error);
                });
        };

        client.onStompError = (frame) => {
            console.error('STOMP Error:', frame);
        };

        client.activate();
        setStompClient(client);

        return () => {
            if (client.connected) {
                client.deactivate();
            }
        };
    }, [roomId]); // roomId가 변경될 때마다 재연결

    const sendMessage = () => {
        if (stompClient && newMessage) {
            const chatMessage = {
                roomId: roomId, // roomId 사용
                senderId: 'currentUserId', // 현재 사용자 ID (실제로는 인증 정보에서 가져와야 함)
                message: newMessage,
                regDt: new Date()
            };

            stompClient.publish({
                destination: '/app/chat/message',
                body: JSON.stringify(chatMessage),
            });

            setNewMessage('');
        }
    };

    // Enter 키로 메시지 보내기
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    };

    const messagesEndRef = useRef(null); // 스크롤을 위한 ref

    // 새 메시지가 추가될 때마다 스크롤을 맨 아래로 이동
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [messages]);

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h2>채팅방: {roomId}</h2>
            </div>
            <div className="chat-messages">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`message ${
                            message.senderId === 'currentUserId' ? 'own-message' : ''
                        }`}
                    >

                        <div className="message-sender">{message.senderId}</div>
                        <div className="message-content">{message.message}</div>
                    </div>
                ))}
                <div ref={messagesEndRef}/>
                {/* 스크롤을 위한 빈 div */}
            </div>
            <div className="chat-input">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="메시지를 입력하세요"
                />
                <button onClick={sendMessage}>보내기</button>
            </div>
        </div>
    );
}

export default ChatPage;