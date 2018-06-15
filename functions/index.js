const functions = require('firebase-functions');
// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const gcs = require('@google-cloud/storage')();
const _ = require('lodash');
const bucketName = 'core-865fc.appspot.com';

admin.initializeApp(functions.config().firebase);

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


// 유저가 제거되었을때 (채팅방 제거, 알림제거, 광고수 제거)
exports.deleteUser = functions.database.ref('/users/{userId}')
  .onDelete(event => {
    admin.database().ref('/Alarm/' + event.params.userId).remove();
    admin.database().ref('/adMob/' + event.params.userId).remove();
    return admin.database().ref('/chatRoomList/' + event.params.userId).remove()

    // return admin.database().ref('/log').push({original:eventSnapshot.id})
  });


// 채팅방 제거시 상대방 채팅방 제거 동기화 및 체팅 로그 제거
exports.deleteChatRoom = functions.database.ref('/chatRoomList/{userId}/{targetId}')
  .onDelete((event) => {
    const eventSnapshot = event.data.previous.val();

    // 상대방 채팅룸 지우기
    admin.database().ref('/chatRoomList/' + event.params.targetId + '/' + event.params.userId).remove();
    // 상대방 채팅방 id
    //return admin.database().ref('/log').push({image:event.params.targetId})

    // 연관된 채팅 기록id
    return admin.database().ref('/chat/' + eventSnapshot.chatRoomid).remove()
    // 채팅 log id
    //admin.database().ref('/log').push({image:eventSnapshot.chatRoomid})
  });


// 채팅 로그가 사라졌을떄 (채팅에 묶인 이미지 제거)
exports.deleteChatMessage = functions.database.ref('/chat/{roomId}/{messageId}')
  .onDelete((event) => {
    const eventSnapshot = event.data.previous.val();
    if (eventSnapshot.isImage === 1) {
      const gcs = require('@google-cloud/storage')();
      const bucket = gcs.bucket('core-865fc.appspot.com');
      const filePath = 'chat/image/' + event.params.roomId + '/';
      const fileName = eventSnapshot.content;
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

// 계정 삭제시에 포스트 제거
function deletePost(uuid) {

  const promises = [];

  const userPostRef = admin.database().ref('/posts/' + uuid);

  return userPostRef.once('value', function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      const postKey = childSnapshot.key;
      const postData = childSnapshot.val();

      console.log(postKey, postData);

      if(postData.isCloud){
        // 관련 코어 클라우드 제거
        promises.push(admin.database().ref('/coreCloud/' + postKey).remove());
      }

      // 관련 스토리지 파일 제거
      // gs://core-865fc.appspot.com/posts/k1WbaTLYQiR1ejg5NuPiE88zZkC3/-LEYfsf88PcZZqVlJ1Fd/picture
      // posts/{cUuid}/{postKey}/picture
      const bucket = gcs.bucket(bucketName); // 경로
      if('pictureUrl' in postData) promises.push(bucket.file('posts/' + uuid + '/' + postKey + '/picture').delete());
      if('soundUrl'   in postData) promises.push(bucket.file('posts/' + uuid + '/' + postKey + '/sound').delete());
    });

    // 관련 데이터베이스 데이터 제거
    promises.push(userPostRef.remove());
    return Promise.all(promises);
  });
}

// 관련된 유저들 삭제, promise 반환
function deleteRelatedUsers(userInfo, mUuid, fieldName, rFieldName) {
  if(!(fieldName in userInfo)) return null;
  console.log('userInfo[fieldName]', userInfo[fieldName]);
  return admin.database().ref('users').update(Object.keys(userInfo[fieldName])
    .reduce((map, uuid) => {
      map[uuid + '/' + rFieldName + '/' + mUuid] = null;
      return map;
    }, {}));
}

// 로케이션 삭제
function deleteLocation(mUuid){
  return admin.database().ref('location/users').child(mUuid).remove();
}

// 계정 삭제
function deleteAboutMyAccount(mUuid){

  const promises = [];

  const mUserRef = admin.database().ref('/users/').child(mUuid);
  return mUserRef.once('value', function(snapshot) {
    const userInfo = snapshot.val();

    // gs://core-865fc.appspot.com/profile/pic/80RZJGZ6cmaHzAubYYJOlZGFd8Z2/profilePic1.jpg
    // profile/pic/{mUuid}/profilePic1.jpg
    // 사진 삭제 // 썸네일 사진 삭제
    if('picUrls' in userInfo) {
      const bucket = gcs.bucket(bucketName); // 경로
      ['1','2','3','4'].forEach(index => {
        if(('picUrl' + index) in userInfo.picUrls) promises.push(bucket.file('profile/pic/' + mUuid + '/profilePic'+index+'.jpg').delete());
        if(('thumbNail_picUrl' + index) in userInfo.picUrls) promises.push(bucket.file('profile/pic/' + mUuid + '/profilePic'+index+'_thumbNail.jpg').delete());
      })
    }

    // Block
    promises.push(deleteRelatedUsers(userInfo, mUuid, 'blockUsers', 'blockMeUsers'));
    promises.push(deleteRelatedUsers(userInfo, mUuid, 'blockMeUsers', 'blockUsers'));

    // Follow
    promises.push(deleteRelatedUsers(userInfo, mUuid, 'followingUsers', 'followerUsers'));
    promises.push(deleteRelatedUsers(userInfo, mUuid, 'followerUsers', 'followingUsers'));
    promises.push(deleteRelatedUsers(userInfo, mUuid, 'friendUsers', 'friendUsers'));

    // location
    promises.push(deleteLocation(mUuid));

    // 포스트 관련 삭제
    promises.push(deletePost(mUuid));

    // 유저 데이터 삭제
    promises.push(mUserRef.remove());

    // prevent 데이터 삭제
    promises.push(admin.database().ref('/prevents/user').child(mUuid).remove());
    promises.push(admin.database().ref('/prevents/post').child(mUuid).remove());

    // report 데이터 삭제
    promises.push(admin.database().ref('/reports/users').child(mUuid).remove());
    promises.push(admin.database().ref('/reports/posts').child(mUuid).remove());

    console.log('promises',promises);
    console.log('_.compact(promises)', _.compact(promises));
    return Promise.all(_.compact(promises));

  });
}

// Auth 삭제시 데이터 전부 삭제
exports.deleteAboutMyAccount = functions.auth.user().onDelete(event => {
  const uid = event.data.uid;
  console.log('delete uid',uid);
  return deleteAboutMyAccount(uid)
});

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

      return admin.database().ref('users').child(cUuid).once('value', function(snapshot) {
        if(snapshot.val() !== null) {
          admin.database().ref('users').child(cUuid).update(updates);
        }
      });
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

  });

exports.deleteAccountByWeb = functions.database.ref('/reports/deleteAccount/{uuid}')
  .onCreate(event => {
    const uuid = event.params.uuid;
    return admin.auth().deleteUser(uuid).then(() => {
      return admin.database().ref('reports/deleteAccount').child(uuid).remove();
    });
  });


