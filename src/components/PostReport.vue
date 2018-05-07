<template>
  <div id = "users">
    <!-- 신고된 유저별 -->
    <div class="list-group-item" v-for="(reportUser, index) in reportUsers">
      <div class="row">

        <!-- 신고된 유저 정보 -->
        <div class="col-4">
          <div>
            Email :
            {{reportUser.user.email}}
          </div>

          <div v-if="reportUser.prevent">
            제재횟수 :
            {{reportUser.prevent.preventCount}}
          </div>

          <div v-if="reportUser.prevent && reportUser.prevent.releaseDate">
            제재 해제 시점 :
            {{getDate(reportUser.prevent.releaseDate)}}
          </div>

          <img v-if="reportUser.user.picUrls && reportUser.user.picUrls.picUrl1" v-bind:src="reportUser.user.picUrls.picUrl1" class="img-thumbnail"/>
        </div>

        <!-- 코어별 -->
        <div class = "cores col-8" >
          <div v-for="(core, coreIndex) in reportUser.cores">

            <!-- 포스트별 -->
            <div class = "posts" >
              <div class="list-group-item" v-for="(post, postIndex) in core">
                <div>
                  cUuid : {{coreIndex}}
                </div>
                <div>
                  postKey : {{postIndex}}
                </div>
                <div>
                  isCloud : {{post.post.isCloud}}
                </div>

                <!-- Post 정보 -->
                <div v-if="post.post">
                  <!--{{post.post}}-->

                  <!-- 사진 -->

                  <img v-if="post.post.pictureUrl" v-bind:src="post.post.pictureUrl" class="img-thumbnail">

                  <!-- 내용 -->
                  <h3>{{post.post.text}} </h3>

                  <!-- 음성 -->
                  <div v-if="post.post.soundUrl">
                    <audio controls style="width: 600px;">
                      <source v-bind:src="post.post.soundUrl">
                    </audio>
                  </div>
                </div>

                <!-- 신고 유형별 -->
                <div class = "reportTypes">
                  <!-- 신고 유형 -->
                  <div class="list-group-item" v-for="(report, reportIndex) in post">
                    <div v-if="reportIndex != 'post'">
                      <h4>
                          {{reportIndex}}
                      </h4>
                      <!-- 신고자별 -->
                      <div>
                        <div class="list-group-item" v-for="(reportedUser, reportedUserIndex) in report">
                          <div>
                            신고자 : {{reportedUserIndex}}
                          </div>
                          <div>
                            신고내용 : {{reportedUser.contents}}
                          </div>
                          <div>
                            신고날 : {{getDate(reportedUser.date)}}
                          </div>

                          <!--버튼-->
                          <div class="dropdown">
                            <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                              조치
                            </button>
                            <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                              <a class="dropdown-item" @click="setPrevent(reportUser.uuid, coreIndex, postIndex, reportIndex, reportedUserIndex, reportedUser, post.post)">포스트 삭제 / 7일 업로드 중지</a>
                              <a class="dropdown-item" @click="deletePreventAndSendMessage(reportUser.uuid, coreIndex, postIndex, reportIndex, reportedUserIndex)">신고 삭제</a>
                              <a class="dropdown-item" href="#">계정 정지</a>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>

                </div>


              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  </div>
</template>

<script>
  import firebase from 'firebase'
  import message from '../helpers/message'

  let db = firebase.database();
  let reportUserRef = db.ref('reports/posts');

  export default {
    name: 'Report',
    data() {
      return {
        msg: 'Welcome to Your Vue.js App',
        noticekey: String,
        photo: String,
        userId: String,
        name: String,
        email: String,
        user: {},
        reportUsers: []
      }
    },
    created: function () {
      this.user = firebase.auth().currentUser
      if (this.user) {
        this.name = this.user.displayName
        this.email = this.user.email
        this.photo = this.user.photoURL
        this.userId = this.user.uid
      }

      let reportUsers = this.reportUsers;
      reportUserRef.on('value', function (snapshot) {
        reportUsers.length = 0
        snapshot.forEach(function (childSnapshot) {
          const child = {};
          child["uuid"] = childSnapshot.key;
          child["cores"] = childSnapshot.val();

          // get Post
          Object.keys(child["cores"]).map(function(cUuid) {
            const core = child["cores"][cUuid];
            Object.keys(core).map(function(postKey) {
              let postRef = db.ref('posts/' + cUuid + "/" + postKey);

              postRef.once('value', function (postSnapshot) {
                core[postKey]["post"] = postSnapshot.val();
              });
            });
          });

          // get profile
          let userRef = db.ref('users/' + childSnapshot.key);
          let preventUserRef = db.ref('prevents/post/' + childSnapshot.key);
          userRef.once('value', function (userSnapshot) {
            child["user"] = userSnapshot.val();

            // get prevent
            preventUserRef.once('value', preventSnapshot =>{
              child["prevent"] = preventSnapshot.val();
              reportUsers.push(child);
            });

          });
        });
      })
    },
    methods: {
      getDate(date) {
        return new Date(date).toLocaleString();
      },
      setPrevent(reportedUuid, cUuid, postKey, type, reporterUuid, reportObj, postObj){
        console.log(reportedUuid, cUuid, postKey, type, reporterUuid, reportObj, postObj);

        if (!confirm("정말 조치를 하시겠습니까?")) return;

        // 제재 내역 조회
        let preventRef = db.ref('prevents/post/' + reportedUuid);
        preventRef.once('value', snapshot => {
          const preventObj = snapshot.val();

          // 현재 재재중이면 포스트 삭제만
          let releaseDate = (preventObj === null? null :preventObj.releaseDate);

          const now = new Date().getTime();

          // 제재기간이 아닐때만 제재
          if(releaseDate <= now){
            // 제재
            let preventCount = 1;
            if(preventObj !== null){
              preventCount = preventObj.preventCount+1;
            }
            releaseDate = this.afterWeek(1);  // releaseDate 갱신
            preventRef.set({
              cUuid : cUuid,
              postKey : postKey,
              reportType : type,
              reporterUuid : reporterUuid,
              reportContents : reportObj.contents,
              reportDate : reportObj.date,
              releaseDate : releaseDate,
              preventCount : preventCount
            });
          }

          deleteMedia(postObj);
          deletePost(cUuid, postKey);
          this.deletePrevent(reportedUuid, cUuid, postKey);

          const msg = "[프로필 제재를 가할 때 회원에게 보내는 메세지] : 안녕하세요 회원님. 코어 관리자입니다. \n\n 회원님의 프로필 내용이 "+type+" 항목으로 신고되었고, 이에 정당한 신고 사유로 인정되어 관리자에 의해 [프로필 삭제 및 7일간 프로필 업로드 금지] 처리됨을 알립니다. \n\n 코어는 제재된 회원에 대한 정보를 기록하고 있으며, 제재기간이 끝난 이후에도 항목을 위반한 신고가 누적될 시 계정의 이용 정지 처리될 수 있음을 알립니다."

          message.sendMessge(reportedUuid, msg);
        });

        // 사진, 음성 삭제
        function deleteMedia(postObj){
          const storage = firebase.storage();
          if("pictureUrl" in postObj) storage.refFromURL(postObj.pictureUrl).delete();
          if("soundUrl" in postObj) storage.refFromURL(postObj.soundUrl).delete();
        }

        // 포스트 삭제
        function deletePost(cUuid, postKey) {
          let postRef = db.ref('posts/' + cUuid + "/" + postKey);
          postRef.remove();
          let cloudRef = db.ref('coreCloud/' + postKey);
          cloudRef.remove()
        }

      },
      afterWeek(weeks) {
        const d = new Date();
        const dayOfMonth = d.getDate();
        d.setDate(dayOfMonth + 7*weeks);
        return d.getTime()
      },
      deletePrevent(reportedUuid, cUuid, postKey) {
        let reportUserRef = db.ref('reports/posts/' + reportedUuid + "/" + cUuid + "/" + postKey);
        reportUserRef.remove();
      },
      deletePreventAndSendMessage(reportedUuid, cUuid, postKey, type, reporterUuid){
        if (!confirm("정말 신고를 삭제 하시겠습니까?")) return;
        this.deletePrevent(reportedUuid, cUuid, postKey);
      }
    }
  }


</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
</style>
