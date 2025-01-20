import React, {useEffect, useState} from 'react';
import axiosInstance from "../../axiosInstance.js";

const ChatList = ({activeTab, searchTerm, onSelectChat}) => {
    const [oneOnOneChats, setOneOnOneChats] = useState([]);

    const groupChats = [
        {id: 1, name: '콘텐츠기획팀', lastMessage: '점심 같이 먹어요.', time: '4시간 전'},
        {id: 2, name: '마케팅팀', lastMessage: '프로젝트 진행 상황 보고.', time: '1시간 전'},
    ];

    const [popularChats, setPopularChats] = useState([]);

    const [chats, setChats] = useState(null);

    // 검색어 필터링
    const [filteredChats, setFilteredChats] = useState([]);

    // 개인 채팅방 불러오기
    useEffect(() => {
        // 채팅방 로드
        axiosInstance
            .get(`/chatRoom/oneOnOne/list`)
            .then((response) => {
                setOneOnOneChats(response.data);
                console.log(response.data);
            })
            .catch((error) => {
                console.error('Error fetching chat history:', error);
            });

        switch (activeTab) {
            case 'oneOnOne':
                setChats(oneOnOneChats);
                break;
            case 'group':
                setChats(groupChats);
                break;
            case 'popular':
                setChats(popularChats);
                break;
            default:
                setChats(null);
        }

        // setFilteredChats(chats.filter((chat) =>
        //     chat.name.toLowerCase().includes(searchTerm.toLowerCase()))
        // );
    }, [activeTab, oneOnOneChats, groupChats, popularChats]);

    useEffect(() => {
        console.log("chats: " + chats);
        if (chats && chats.length > 0) {
            setFilteredChats(
                chats.filter((chat) =>
                    chat && chat.roomName &&
                    chat.roomName.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        } else {
            setFilteredChats([]);
        }
    }, [chats, searchTerm]);

    return (
        <div>
            {filteredChats && filteredChats.length > 0 ? (
                filteredChats.map((chat) => (
                    <div
                        key={chat.id}
                        style={{
                            padding: '10px',
                            borderBottom: '1px solid #ddd',
                            cursor: 'pointer',
                        }}
                        onClick={() => onSelectChat(chat)}
                    >
                        <div style={{fontWeight: 'bold'}}>{chat.roomName}</div>
                        <div style={{fontSize: '0.9em', color: '#666'}}>{/*chat.lastMessage*/}0000-00-00</div>
                        <div style={{fontSize: '0.8em', color: '#aaa'}}>{/*chat.time*/}00:00</div>
                    </div>
                ))) : (
                <div style={{textAlign: 'center', marginTop: '20px', color: '#aaa'}}>
                    채팅 목록이 없습니다.
                </div>

            )}
        </div>
    );
};

export default ChatList;
