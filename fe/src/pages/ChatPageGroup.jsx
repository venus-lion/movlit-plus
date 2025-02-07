import React, {useEffect, useRef, useState} from 'react';
import {Client} from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axiosInstance from '../axiosInstance';
import './ChatPageGroup.css';
import {FaUserCircle} from 'react-icons/fa';
import {useNavigate} from "react-router-dom"; // react-icons에서 기본 프로필 이미지 아이콘을 가져옵니다.
import DateTimeUtil, {getNowDate} from "../util/DateTimeUtil.jsx";

function ChatPageGroup({roomId, roomInfo, refreshChatList, refreshChatComponent}) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [stompClient, setStompClient] = useState(null);
    const [members, setMembers] = useState([]);
    const messagesContainerRef = useRef(null); // 스크롤 컨테이너에 대한 ref
    const [isComposing, setIsComposing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        axiosInstance
            .get(`/members/id`)
            .then((response) => {
                setCurrentUserId(response.data.memberId);
            })
            .catch((error) => {
                console.error('Error fetching current user ID:', error);
            });
    }, []);

    useEffect(() => {
        if (roomId) {
            axiosInstance
                .get(`/chat/${roomId}/members`)
                .then((response) => {
                    setMembers(response.data);
                    console.log('fetched members :: (response.data) : ', response.data);
                    response.data.forEach(member => {
                    });
                })
                .catch((error) => {
                    console.error('Error fetching chatroom members:', error);
                });
        }
    }, [roomId]);

    useEffect(() => {
        if (!roomId) return;

        const client = new Client({
            webSocketFactory: () => new SockJS(`${process.env.VITE_BASE_URL_FOR_CONF}/ws-stomp`),
            connectHeaders: {
                Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
            },
        });

        client.onConnect = () => {
            // 1. /topic/chat/message/group/{roomId} 구독 (그룹채팅메세지 수신)
            client.subscribe(`/topic/chat/message/group/${roomId}`, (message) => {
                const receivedMessage = JSON.parse(message.body);
                setMessages((prevMessages) => [...prevMessages, receivedMessage]);
            });

            // 2. /topic/chat/room/{roomId} 구독 (업데이트된 멤버 목록 수신)
            client.subscribe(`/topic/chat/room/${roomId}`, (message => {
                const receivedData = JSON.parse(message.body);

                // 1. receivedData가 배열(멤버 목록)인지, 객체(UpdateRoomDto)인지 체크
                if (Array.isArray(receivedData)) {
                    // 1-1. 멤버 프로필 업데이트 이벤트
                    console.log('멤버 프로필 업데이트 이벤트 발행 후, 프론트 적용 !!');
                    setMembers(receivedData);
                } else if (receivedData.hasOwnProperty('updateRoomDto')) {
                    // 1-2. receivedData에 updateRoomDto 속성이 있으면, MEMBER_JOIN 이벤트로 간주
                    const updateRoomDto = receivedData.updateRoomDto;
                    const cachedMembers = receivedData.cachedMembers;

                    if (updateRoomDto.eventType === 'MEMBER_JOIN') {
                        // MEMBER_JOIN 이벤트 처리
                        setMembers(cachedMembers);

                        // joinMessage 처리
                        const joinMessage = updateRoomDto.eventMessage;
                        console.log('updatedMembers의 joinMessage :: ' + joinMessage);

                        // 1-5. joinMessage를 채팅 메시지와 구분하여 화면에 표시
                        setMessages((prevMessages) => [
                            ...prevMessages,
                            {
                                type: 'join', // 메시지 유형을 'join'으로 설정
                                message: joinMessage,
                                regDt: DateTimeUtil(getNowDate()), //new Date(),
                            },
                        ]);
                    } else if (updateRoomDto.eventType === 'MEMBER_LEAVE') {
                        console.log('member leave 이벤트 발행 ... !');

                        // MEMBER_LEAVE 이벤트 처리
                        setMembers(cachedMembers);

                        const leaveMessage = updateRoomDto.eventMessage;

                        console.log('leaveMsg >>> ');
                        console.log(leaveMessage);

                        setMessages((prevMessages) => [
                            ...prevMessages,
                            {
                                type: 'join', // (중요) 나간 멤버 알림 메시지 유형을 'join'으로 설정
                                message: leaveMessage, // "ㅇㅇ님이 나갔습니다" 메시지 설정
                                regDt: DateTimeUtil(getNowDate()), //new Date(),
                            },
                        ]);
                    }


                }

            }))

            axiosInstance
                .get(`/chat/history?roomId=${roomId}`)
                .then((response) => {
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
                regDt: getNowDate(),
            };

            stompClient.publish({
                destination: '/app/chat/message/group',
                body: JSON.stringify(chatMessage),
            });

            setNewMessage('');
        }
    };

    // 그룹채팅방 나가기 함수
    const handleLeaveChatroom = async () => {
        try {
            // 나가기 api 호출
            await axiosInstance.delete(`/chat/group/${roomId}/leave`);

            alert("채팅방을 나갔습니다.");

            // 채팅방 목록 갱신
            refreshChatList();

            console.log('Chat 컴포넌트 새로고침');

            // Chat 컴포넌트 새로고침
            refreshChatComponent();

            console.log('/chatMain으로 navigate');
            // // 채팅방 목록 페이지로 이동
            navigate('/chatMain');

        } catch (error) {
            console.error("Error leaving chatroom:", error);
            alert("채팅방 나가기 실패: " + error.response.data.message); // 에러 메시지 표시
        }
    };

    const handleCompositionStart = () => setIsComposing(true);
    const handleCompositionEnd = () => setIsComposing(false);

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !isComposing) {
            sendMessage();
        }
    };

    // messages가 변경될 때마다 스크롤을 맨 하단으로 이동
    useEffect(() => {
        // 스크롤을 맨 하단으로 이동하는 로직
        const scrollToBottom = () => {
            if (messagesContainerRef.current) {
                messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            }
        };
        scrollToBottom();
    }, [messages]);

    return (
        <div className="chat-container-group" style={{display: 'flex', flexDirection: 'column', height: '90%'}}>
            <div className="chat-header-group">
                <h2>채팅방: {roomInfo.roomName}</h2>
                <button onClick={handleLeaveChatroom} className="leave-button">나가기</button>
            </div>
            <div className="chat-messages-group" ref={messagesContainerRef}>
                {messages.map((message, index) => {
                    const sender = members.find((m) => m.memberId === message.senderId);
                    const isCurrentUser = message.senderId === currentUserId;
                    const isJoinMessage = message.type === 'join'; // join 메세지 여부 확인

                    return (
                        <div
                            key={index}
                            className={`message-group ${isCurrentUser ? 'own-message-group' : ''} ${
                                isJoinMessage ? 'join-message-group' : '' // join 메시지에 대한 CSS 클래스 추가
                            }`}
                        >
                            {!isCurrentUser && sender && !isJoinMessage && ( // message null 체크 추가
                                <div className="message-profile-group">
                                    {/* profileImgUrl이 있으면 이미지를 표시하고, 없으면 FaUserCircle 아이콘을 표시합니다. */}
                                    {sender && sender.profileImgUrl ? (
                                        <img
                                            src={sender.profileImgUrl}
                                            alt="Profile"
                                            className="profile-img-group"
                                        />
                                    ) : (
                                        <FaUserCircle size={40} className="profile-img"/>
                                    )}
                                    <strong>{sender.nickname}</strong>
                                </div>
                            )}
                            <div className="message-content-group">
                                <div
                                    className={`message-bubble-group ${isCurrentUser ? 'own-bubble' : ''} ${
                                        isJoinMessage ? 'join-bubble' : ''
                                    }`}
                                    style={isJoinMessage ? {whiteSpace: 'nowrap'} : {}} // joinMessage인 경우 한 줄로 표시
                                >
                                    {message.message}
                                </div>
                                <div className="message-time-group">
                                    {new Date(message.regDt).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div/>
            </div>
            <div className="chat-input-container-group">
                <input
                    type="text"
                    className="chat-input-group"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onCompositionStart={handleCompositionStart}
                    onCompositionEnd={handleCompositionEnd}
                    placeholder="메시지를 입력하세요..."
                />
                <button onClick={sendMessage}>보내기</button>
            </div>
        </div>
    );
}

export default ChatPageGroup;