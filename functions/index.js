const functions = require('firebase-functions');
// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const gcs = require('@google-cloud/storage')();
const _ = require('lodash');

admin.initializeApp(functions.config().firebase);
const db = admin.database();

// TeamCore  메세지 푸시알림
exports.fcmTeamCore = functions.database.ref('/chatRoomList/{userId}/TeamCore/lastChatTime')
  .onCreate((event) => {

    return admin.database().ref('chatRoomList').child(event.params.userId).child('TeamCore').child('chatRoomid').once('value').then(function (snapshot) {
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

    return admin.database().ref('chatRoomList').child(event.params.userId).child('TeamCore').child('chatRoomid').once('value').then(function (snapshot) {
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
    // 실패ㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐㅐ
    var eventSnapshot = event.data.previous.val()
    if (eventSnapshot.isImage == 1) {
      const gcs = require('@google-cloud/storage')()
      const bucket = gcs.bucket('core-865fc.appspot.com')
      const filePath = 'chat/image/' + event.params.roomId + '/'
      const fileName = eventSnapshot.content
      console.log(filePath);
      console.log(fileName);
      return bucket.file(filePath + fileName).delete()
    }

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

  return sendReplySuggestEmail(targetEmail, contents);
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

// 포스트 삭제 Http Test
exports.httpTestDeletePost = functions.https.onRequest((req, res) => {
  return deletePost("J1DGC0SV74Nw7d38BkSfK6i949z2");
});

// 계정 삭제시에 포스트 제거
function deletePost(uuid) {

  const userPostRef = db.ref('/posts/' + uuid);

  return userPostRef.once('value', function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      const postKey = childSnapshot.key;
      const postData = childSnapshot.val();

      if (postData.isCloud) {
        // 관련 코어 클라우드 제거
        // admin.database.ref('/coreCloud/' + postKey).remove();
      }

      // 관련 스토리지 파일 제거
      // if("pictureUrl" in postData) storage.refFromURL(postData.pictureUrl).delete();
      // if("soundUrl" in postData) storage.refFromURL(postData.soundUrl).delete();

      //test

      if ("pictureUrl" in postData) console.log("pictureUrl : " + db.refFromURL(postData.pictureUrl));


      // if("soundUrl" in postData) storage.refFromURL(postData.soundUrl).delete();

      return "pictureUrl : " + db.refFromURL(postData.pictureUrl);

    });

    // 관련 데이터베이스 데이터 제거
    // admin.database.ref('posts/' + uuid).remove();


  });

}

// TODO : 프렌즈 삭제
function deleteFriend(uuid) {

}


// TODO : 블럭 삭제

// TODO : 로케이션 삭제

// TODO : 계정 삭제

// 삭제후 남아있을 것이라고 생각되는 부분
// >> 좋아요, 익명글, 알람, 신고


// 포스트 삭제시 PostCount 동기화
exports.writePost = functions.database.ref('/posts/{cUuid}/{postKey}')
  .onWrite(event => {
    const cUuid = event.params.cUuid;
    return admin.database().ref('posts').child(cUuid).once('value').then(snapshot => {
      console.log(cUuid, snapshot.numChildren());

      const updates = {};
      updates['/corePostCount'] = snapshot.numChildren();
      updates['/summaryUser/corePostCount'] = snapshot.numChildren();

      return admin.database().ref('users').child(cUuid).update(updates);

    });
  });

// 삭제 시, 포스트 키에 해당하는 신고를 삭제
exports.deletePost = functions.database.ref('/posts/{cUuid}/{postKey}')
  .onDelete((event) => {
    const cUuid = event.params.cUuid;
    const postKey = event.params.postKey;

    const preData = event.data.previous.val();
    const wUuid = preData.uuid;
    console.log('preData', preData);

    const ref = admin.database().ref('reports/posts').child(wUuid).child(cUuid).child(postKey);
    console.log("repostsRef", ref.toString());

    return ref.remove();


    // const ref = admin.database().ref('reports/posts').child(cUuid);
    // return ref.once('value').then(snapshot => {
    //   const data = snapshot.val();  // [{wUuid : {postKey:..., ...  }}, {}]
    //
    //   // find wUuid
    //   const wUuid = _
    //     .chain(Object.keys(data))
    //     .filter(o => _.has(data[o], postKey))
    //     .head().value();
    //
    //   const ref = admin.database().ref('reports/posts').child(cUuid).child(wUuid).child(postKey);
    //   console.log("repostsRef", ref.toString());
    //
    //   return ref.remove();
    // });
    //
  });






