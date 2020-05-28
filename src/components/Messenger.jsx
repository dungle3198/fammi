import { CometChat } from "@cometchat-pro/chat";
import msg from "./Data/msg"

export default class GroupMessenger {
    static LISTENER_KEY_MESSAGE = "msglistener";
    static appId = msg.appId;
    static apiKey = msg.apiKey;
    static LISTENER_KEY_GROUP = "grouplistener";
    static init() {
        let cometChatSettings = new CometChat.AppSettingsBuilder().subscribePresenceForAllUsers().setRegion('us').build();
        return CometChat.init(GroupMessenger.appId,cometChatSettings);
    }
    static getTextMessage(uid, text, msgType) {
        if (msgType === "user") {
            return new CometChat.TextMessage(
                uid,
                text,
                CometChat.MESSAGE_TYPE.TEXT,
                CometChat.RECEIVER_TYPE.USER
            );
        } else {
            return new CometChat.TextMessage(
                uid,
                text,
                CometChat.MESSAGE_TYPE.TEXT,
                CometChat.RECEIVER_TYPE.GROUP
            );  
        }
    }
    static getLoggedinUser() {
        //console.log(CometChat.getLoggedinUser())
        return CometChat.getLoggedinUser();
    }
    static Login(UID) {
        //console.log(UID);
        return CometChat.login(UID, 'fae743651e432f171ee21ba834d8af048bd9e841');
    }
    static getGroupMessages(GUID, callback, limit = 30) {
        const messagesRequest = new CometChat.MessagesRequestBuilder()
            .setGUID(GUID)
            .setLimit(limit)
            .build();
        callback();
        return messagesRequest.fetchPrevious();
    }
    static sendGroupMessage(UID, message) {
        const textMessage = this.getTextMessage(UID, message, "group");
        return CometChat.sendMessage(textMessage);
    }
    static joinGroup(GUID) {
        return CometChat.joinGroup(GUID, CometChat.GROUP_TYPE.PUBLIC, "");
    }
    static addMessageListener(callback) {
        CometChat.addMessageListener(
            this.LISTENER_KEY_MESSAGE,
            new CometChat.MessageListener({
                onTextMessageReceived: textMessage => {
                    callback(textMessage);
                }
            })
        )
    }
}