import React, {useEffect, useState} from 'react';
import Modal from "react-modal";
import {FaRegStar, FaStar, FaStarHalfAlt} from 'react-icons/fa';
import "../../assets/css/CreateGroupChatNameModal.css";
import axiosInstance from "../../axiosInstance.js"; // axios 임포트


const renderStars = (rating) => {
    // rating 값을 0 ~ 10으로 받을 경우
    const validRating = Math.max(0, Math.min(10, rating || 0));  // 0 ~ 10 사이로 제한

    // 2점마다 1개의 꽉 찬 별로 환산
    const fullStars = Math.floor(validRating / 2);  // 꽉 찬 별 개수
    const halfStar = validRating % 2 >= 1 ? 1 : 0;  // 반쪽 별 여부 (나머지가 1 이상이면 반쪽 별)
    const emptyStars = 5 - fullStars - halfStar;  // 빈 별 개수 (총 5개 별이므로 나머지)

    return (
        <>
            {[...Array(fullStars)].map((_, index) => <FaStar key={`full-${index}`} className="star-icon"/>)}
            {halfStar === 1 && <FaStarHalfAlt className="star-icon"/>}
            {[...Array(emptyStars)].map((_, index) => <FaRegStar key={`empty-${index}`} className="star-icon"/>)}
        </>
    );
};

const GetGroupChatInfoModal = ({
                                   isOpen,
                                   onClose,
                                   onConfirm,
                                   onJoin,
                                   selectedCard,
                                   selectedCategory,
                                   onUpdateChatList
                               }) => {

    if (!selectedCard) return null;

    const [chatroomName, setChatroomName] = useState("");
    const [existingRoomInfo, setExistingRoomInfo] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRoomInfo = async () => {
            try {
                const requestBody = {
                    roomName: "방제목",    // 서버에서 사용하지 않으므로 랜덤값 패스
                    contentType: selectedCategory,
                    contentId: selectedCategory === "movie" ? selectedCard.movieId : selectedCard.bookId,
                };

                // POST 요청
                const response = await axiosInstance.post('/chat/group', requestBody);
                console.log('requestBody ' + JSON.stringify(requestBody, null, 2));


                // 응답 값이 null인 경우 처리
                if (response.data === null) {
                    setExistingRoomInfo(null); // 상태를 null로 설정
                    console.log('Received response: 채팅방이 존재하지 않습니다.');
                } else {
                    console.log('Received response:', response.data);
                    setExistingRoomInfo(response.data); // 정상 응답 처리
                }

            } catch (err) {
                console.error('Error fetching room info:', err);
                setError('채팅방 정보를 불러오는 데 실패했습니다.');
            }
        };

        fetchRoomInfo();
    }, []);

    const handleInputChange = (event) => {
        setChatroomName(event.target.value);
    };

    const handleCreateRoom = async () => {
        // "생성하기" 버튼 클릭 시 채팅방 생성 모달 창
        onConfirm(selectedCard, selectedCategory);
    };

    const handleJoinRoom = () => {
        // onJoin을 통해 부모 컴포넌트에 정보 전달
        if (existingRoomInfo) {
            onJoin(existingRoomInfo); // 또는 필요한 정보를 전달
        }
    };


    return (
        <Modal isOpen={isOpen} onRequestClose={onClose} className="custom-modal-2" overlayClassName="custom-overlay"
               ariaHideApp={false}>
            <div className="modal-2-content">
                <div className="modal-header">
                    <h2>채팅방 정보</h2>
                </div>
                <div className="modal-2-body">
                    {selectedCategory === "movie" ? (
                        <>
                            <img src={selectedCard.posterPath} alt={selectedCard.title} className="selected-image"/>
                            <div>{selectedCard.title}</div>
                            {/*<div className="selected-rating">*/}
                            {/*    {renderStars(selectedCard.voteAverage)}*/}
                            {/*</div>*/}
                            <div>
                                <p className="selected-info">
                                    {selectedCard.movieGenre.map((g) => g.genreName).join(', ')}
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <img src={selectedCard.bookImgUrl} alt={selectedCard.title} className="selected-image"/>
                            <div>{selectedCard.title}</div>
                            <div>
                                <p className="selected-info">
                                    {selectedCard.crew.join(', ')}
                                </p>
                            </div>
                        </>
                    )}
                    <div>
                        {existingRoomInfo ? (
                            <div>
                                <h4>채팅방 : {existingRoomInfo.roomName}</h4>
                                {/* existingRoomInfo가 null이 아닐 때 "가입하기" 버튼을 보여줌 */}
                                <div className="modal-footer">
                                    <button className="cancel-button" onClick={onClose}>
                                        취소
                                    </button>
                                    <button onClick={handleJoinRoom}>가입하기</button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p>채팅방이 없습니다. <br/> 새로운 채팅방을 생성해 주세요.</p>
                                {/* existingRoomInfo가 null일 때 채팅방 "생성하기" 버튼을 보여줌 */}
                                <div className="modal-footer">
                                    <button className="cancel-button" onClick={onClose}>
                                        취소
                                    </button>
                                    <button className="modal-confirm" onClick={handleCreateRoom}>
                                        생성하기
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </Modal>
    );
};

export default GetGroupChatInfoModal;