const functions = require('firebase-functions');
// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp(functions.config().firebase);

// TeamCore  메세지 푸시알림
exports.fcmTeamCore = functions.database.ref('/chatRoomList/{userId}/TeamCore/lastChatTime')
  .onCreate((event) => {

    admin.database().ref('chatRoomList').child(event.params.userId).child('TeamCore').child('chatRoomid').once('value').then(function (snapshot) {
      let message = {
        data: {
          message: '알림',
          room: snapshot.val(),
          type: 'chat',
          nick: 'TeamCore'
        },
      };

      admin.database().ref('users').child(event.params.userId).child('token').once('value').then(function (snapshot) {
        admin.messaging().sendToDevice(snapshot.val(), message)
      })
    })
  });

exports.fcmTeamCoreUpdate = functions.database.ref('/chatRoomList/{userId}/TeamCore/lastChatTime')
  .onUpdate((event) => {

    admin.database().ref('chatRoomList').child(event.params.userId).child('TeamCore').child('chatRoomid').once('value').then(function (snapshot) {
      let message = {
        data: {
          message: '알림',
          room: snapshot.val(),
          type: 'chat',
          nick: 'TeamCore'
        },
      };

      admin.database().ref('users').child(event.params.userId).child('token').once('value').then(function (snapshot) {
        admin.messaging().sendToDevice(snapshot.val(), message)
      })
    })
  });

// https 트리거 테스트
exports.addMessage = functions.https.onRequest((req, res) => {
  // Grab the text parameter.
  const original = req.query.text;
  // Push the new message into the Realtime Database using the Firebase Admin SDK.
  return admin.database().ref('/messages').push({original: original}).then((snapshot) => {
    // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
    return res.redirect(303, snapshot.ref);
  });
});


// 유저가 제거되었을때 (채팅방 제거, 알림제거)
exports.deleteUser = functions.database.ref('/users/{userId}')
  .onDelete(event => {
    var eventSnapshot = event.data.previous.val();

    admin.database.ref('/Alarm/' + event.params.userId).remove()
    return admin.database.ref('/chatRoomList/' + event.params.userId).remove()

    // return admin.database().ref('/log').push({original:eventSnapshot.id})
  });


// 채팅방 제거시 상대방 채팅방 제거 동기화 및 체팅 로그 제거
exports.deleteChatRoom = functions.database.ref('/chatRoomList/{userId}/{targetId}')
  .onDelete((event) => {
    var eventSnapshot = event.data.previous.val();

    // 상대방 채팅룸 지우기
    admin.database.ref('/chatRoomList/' + event.params.targetId + '/' + event.params.userId).remove()
    // 상대방 채팅방 id
    //return admin.database().ref('/log').push({image:event.params.targetId})

    // 연관된 채팅 기록id
    return admin.database.ref('/chat/' + eventSnapshot.chatRoomid).remove()
    // 채팅 log id
    //admin.database().ref('/log').push({image:eventSnapshot.chatRoomid})
  });


// 채팅 로그가 사라졌을떄 (채팅에 묶인 이미지 제거)
exports.deleteChatMessage = functions.database.ref('/chat/{roomId}/{messageId}')
  .onDelete((event) => {
    var eventSnapshot = event.data.previous.val();

    // 실패ㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐ
    const bucket = admin.storage.bucket('core-865fc.appspot.com')
    return bucket.file(eventSnapshot.image).delete()
    //해당 이미지 url
    //admin.database().ref('/log').push({image:eventSnapshot.image})
  });


// Admin Email
const adminEmail = "coreapp0729@gmail.com";
const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: adminEmail,
    pass: "zjvlqlswlgk1cmd",
  },
});

// Sends a welcome email to the given user.
function sendReplySuggestEmail(email, contents) {
  const mailOptions = {
    from: adminEmail,
    to: email,
  };

  // The user subscribed to the newsletter.
  mailOptions.subject = `Core Reply`;
  mailOptions.text = contents;
  return mailTransport.sendMail(mailOptions).then(() => {
    return console.log('New Reply email sent to:', email);
  });
}


/*
 [sendMailLogs]
 pushId : {
  targetEmail : "",
  writeDate : "",
  contents : ""
 }
 */
exports.sendMail = functions.database.ref('/sendMailLogs/{pushId}').onWrite((event) => {
  const eventSnapshot = event.data;
  const targetEmail = eventSnapshot.child('targetEmail').val();
  const contents = eventSnapshot.child('contents').val();

  sendReplySuggestEmail(targetEmail, contents);
});

// 구글 계정 생성시
// 데이터베이스 admins에 정보 삽입, 사용중은 false
exports.putUserInfoAdmin = functions.auth.user().onCreate((event) => {
// [END onCreateTrigger]
  // [START eventAttributes]
  const email = event.data.email; // The email of the user.
  const displayName = event.data.displayName; // The display name of the user.
  const providerId = event.data.providerData[0].providerId; // for example, "google.com" for the Google provider

  console.log("event : " + JSON.stringify(event));
  if (providerId === "google.com") {
    return admin.database().ref('/admins/' + event.data.uid).set({
      email: email,
      displayName: displayName,
      isUsed: false
    }).then(() => {
      // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
      return "Success to put UserInfo Admin"
    });

  } else {
    return "Join Normal User : " + email
  }
});
