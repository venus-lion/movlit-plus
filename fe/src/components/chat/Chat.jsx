import React, {useEffect, useState, useContext} from 'react'; // useContext import 추가
import ChatTabs from './ChatTabs';
import ChatList from './ChatList';
import {useNavigate, useOutletContext} from "react-router-dom";
import ChatPage from '../../pages/ChatPage.jsx';
import CreateGroupChatModal from "./CreateGroupChatModal.jsx";
import ChatPageGroup from "../../pages/ChatPageGroup.jsx";
import CreateGroupChatNameModal from "./CreateGroupChatNameModal.jsx";
import axiosInstance from "../../axiosInstance.js";
import GetGroupChatInfoModal from "./GetGroupChatInfoModal.jsx"; // axios 임포트
import {AppContext} from "../../App.jsx"; // AppContext import

const Chat = () => {
    const [activeTab, setActiveTab] = useState('personal'); // 개인 채팅 또는 그룹 채팅
    const [searchTerm, setSearchTerm] = useState(''); // 검색어
    const [selectedChat, setSelectedChat] = useState(null); // 현재 선택된 채팅방
    const {isLoggedIn, updateSnackbar} = useContext(AppContext); // updateSnackbar context 함수 import
    const navigate = useNavigate();
    const [refreshKey, setRefreshKey] = useState(0); // 채팅 리스트 새로고침 키 추가
    const [chatComponentKey, setChatComponentKey] = useState(0); // Chat 컴포넌트 새로고침 키

    const [isCreateGroupChatModalOpen, setIsCreateGroupChatModalOpen] = useState(false); // 모달1 열림 상태
    const [isGetGroupChatInfoModalOpen, setIsGetGroupChatInfoModalOpen] = useState(false); // 채팅방 존재여무 모달2 열림 상태
    const [isCreateGroupChatNameModalOpen, setIsCreateGroupChatNameModalOpen] = useState(false); // 모달2 열림 상태
    const [selectedCard, setSelectedCard] = useState(null); // 선택된 데이터
    const [selectedCategory, setSelectedCategory] = useState(null);

    // 로그인 상태 확인 및 리다이렉트 로직 추가
    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/member/login', {replace: true}); // 리다이렉트 할 때, 브라우저 히스토리에 현재 경로를 남기지 않음
        }
    }, [isLoggedIn, navigate]);

    // 채팅방 리스트 업데이트 함수 (기존과 동일)
    const updateChatList = async () => {
        try {
            const response = await axiosInstance.get('/chat/group/rooms/my');
            setSelectedChat(response.data); // 상태 업데이트
        } catch (error) {
            console.error("채팅 리스트 업데이트 오류:", error);
        }
    };

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
        }
    }, [selectedChat, activeTab, navigate]);

    // ChatList 갱신 함수 (기존과 동일)
    const refreshChatList = () => {
        setRefreshKey(prevKey => prevKey + 1);
    };

    // Chat 컴포넌트 새로고침 함수 (기존과 동일)
    const refreshChatComponent = () => {
        setChatComponentKey(prevKey => prevKey + 1);
        setSelectedChat(null); // selectedChat을 null로 설정
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
                    refreshKey={refreshKey} // 새로고침 키 전달
                    activeTab={activeTab}
                    searchTerm={searchTerm}
                    onSelectChat={(chat) => setSelectedChat(chat)} // 선택된 채팅방 설정

                />

                {/* 채팅방 생성 버튼 (기존과 동일) */}
                {activeTab === "group" && (

                    <button
                        onClick={handleCreateGroupChatModal}
                        style={{
                            backgroundColor: 'green',
                            color: 'white',
                            borderRadius: '15px',
                            width: '50px',
                            height: '50px',
                            aspectRatio: '1 / 1', // 가로 세로 비율 유지 (원형 유지)
                            fontSize: '30px',
                            cursor: 'pointer',
                            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                            position: 'absolute', // 사이드바 내부에서 절대 위치 설정
                            bottom: '40px', // 하단 여백
                            right: '15px', // 오른쪽 정렬
                            display: 'flex',   // 중앙 정렬을 위한 flex 적용
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,  // 부모 flex 영향을 받지 않도록 고정
                            overflow: 'hidden' // 내부 요소 넘침 방지
                        }}
                    >
                        +
                    </button>
                )}
            </div>

            {/* 오른쪽: 채팅방 창 (기존과 동일) */}
            <div style={{flex: 1, padding: '10px'}}>
                {selectedChat ? (
                    activeTab === 'personal' ? (
                        <ChatPage roomId={selectedChat.roomId} roomInfo={selectedChat}/> /* 개인 채팅방 */
                    ) : (
                        <ChatPageGroup
                            roomId={selectedChat.groupChatroomId}
                            roomInfo={selectedChat}
                            refreshChatList={refreshChatList}
                            refreshChatComponent={refreshChatComponent} // refreshChatComponent 함수 전달
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