// Initialize Firebase
import firebase from 'firebase'

let db = firebase.database();
export default {
  sendMessge(targetUuid, msg){

    const messaging = firebase.messaging()

    let chatRef = db.ref('chat');
    let newChatKey;
    let chatRoomRef = db.ref('chatRoomList/'+targetUuid);
    let timestamp = new Date().getTime();
    chatRoomRef.child('TeamCore').once('value').then(function (snapshot) {
      if(snapshot.val()){
        // 이미 코어팀한테 메세지를 받은적이 있을때
        newChatKey = snapshot.val().chatRoomid;

        chatRoomRef.child('TeamCore').update({
          lastChatTime : timestamp,
          lastChat : msg
        })
      }else{
        // 코어팀한테 메세지를 받은적이 없을때

        // 키 생성
        newChatKey = chatRef.push().key;
        // 방생성
        chatRoomRef.child('TeamCore').set({
          badgeCount : 0,
          chatRoomid : newChatKey,
          lastChatTime : timestamp,
          lastViewTime : 0,
          targetUuid: "TeamCore",
          lastChat : msg
        })
      }
      chatRef.child(newChatKey).push({
        check : 1,
        content : msg,
        isImage : 0,
        nickname : "TeamCore",
        time : timestamp,
        writer : "TeamCore"
      })
    })

  }
}

