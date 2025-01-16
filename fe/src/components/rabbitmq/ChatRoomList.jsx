// src/components/ChatRoomList.jsx
import React, {useEffect, useState} from 'react';
import axiosInstance from '../api/axiosInstance';

function ChatRoomList({onSelectRoom}) {
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        // 채팅방 목록을 백엔드로부터 가져옴
        axiosInstance.get('/api/chat/rooms')
            .then(response => {
                setRooms(response.data);
            })
            .catch(error => {
                console.error('Failed to fetch chat rooms:', error);
            });
    }, []);

    return (
        <div>
            <h2>채팅방 목록</h2>
            <ul>
                {rooms.map(room => (
                    <li key={room.id}>
                        <button onClick={() => onSelectRoom(room.id)}>
                            {room.roomName}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ChatRoomList;