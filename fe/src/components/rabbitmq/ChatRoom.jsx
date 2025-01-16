// src/components/ChatRoom.jsx
import React, {useEffect, useState} from 'react';
import axiosInstance from '../api/axiosInstance';

function ChatRoom({roomId}) {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (!roomId) return;

        // 특정 채팅방의 메시지를 백엔드로부터 가져옴
        axiosInstance.get(`/api/chat/room/${roomId}/messages`)
            .then(response => {
                setMessages(response.data);
            })
            .catch(error => {
                console.error('Failed to fetch chat messages:', error);
            });
    }, [roomId]);

    return (
        <div>
            <h2>채팅방 {roomId}</h2>
            <div>
                {messages.map(msg => (
                    <div key={msg.id}>
                        <strong>{msg.senderId}: </strong>
                        <span>{msg.message}</span>
                        <em style={{fontSize: '0.8em', color: 'gray'}}> {msg.timestamp}</em>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ChatRoom;