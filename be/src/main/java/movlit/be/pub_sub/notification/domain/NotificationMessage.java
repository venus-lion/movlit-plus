package movlit.be.pub_sub.notification.domain;

import lombok.Getter;

@Getter
public class NotificationMessage {

    // 생성 예
    public static String generateFollowingMessage(String senderNickname, String recipientNickname) {
        return senderNickname + " 님이 " + recipientNickname + "님을 팔로우 하셨습니다.";
    }

    public static String generateChatMessage(String senderNickname, String message) {
        return senderNickname + ": " + message;
    }

    // 새로운 그룹 채팅방 생성에 대한 알림 메시지
    public static String generateNewGroupChatroomNotiMessage(String contentType, String contentName, String roomName) {

        if (contentType.equals("MV")) {
            return "[영화] " + contentName + " 에 대한 채팅방 ( " + roomName + " ) 이(가) 생성되었습니다.";
        } else {
            return "[책] " + contentName + " 에 대한 채팅방 ( " + roomName + ") 이(가) 생성되었습니다.";
        }

    }

    public static String generateGroupChatMessage(String senderNickname, String roomName, String message) {
        return senderNickname + "[" + roomName + "] : " + message;
    }

}
