package movlit.be.pub_sub.notification;

public enum NotificationType {
    CONTENT_HEART_CHATROOM("contentHeart"),
    FOLLOW("follow"),
    ONE_ON_ONE_CHAT("oneonone"),
    GROUP_CHAT("group");

    private final String value;

    NotificationType(String value) {
        this.value = value;
    }


}
