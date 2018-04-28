<template>
  <div id = "users">
    <!-- 신고된 유저별 -->
    <div class="list-group-item" v-for="(reportUser, index) in reportUsers">
      <div class="row">

        <!-- 신고된 유저 정보 -->
        <div class="col-sm-6 col-md-4">
          <img v-if="reportUser.user.picUrls.picUrl1" v-bind:src="reportUser.user.picUrls.picUrl1"
               height="200"
               weight="200">
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

        </div>

        <!-- 코어별 -->
        <div id = "cores" >
          <div v-for="(core, coreIndex) in reportUser.cores">

            <!-- 포스트별 -->
            <div id = "posts" >
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

                  <img v-if="post.post.pictureUrl" v-bind:src="post.post.pictureUrl"
                       height="200"
                       weight="200">

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
                <div id = "reportTypes">
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
                              <a class="dropdown-item" href="#">삭제</a>
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



        <div class="btn-group pull-right"
             style="font-size: 12px; line-height: 1;">
          <ul>
            <li>
              <a href="#" @click="deleteTodo(index)">삭제</a>
            </li>
          </ul>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
  import firebase from 'firebase'

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

        // 제재 내역 추가
        let preventRef = db.ref('prevents/post/' + reportedUuid);
        preventRef.once('value', snapshot => {
          const preventObj = snapshot.val();
          let preventCount = 1;
          if(preventObj !== null){
            preventCount = preventObj.preventCount+1;
          }

          const releaseDate = this.afterWeek(1);
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
        });

        // 사진, 음성 삭제
        var storage = firebase.storage();
        if("pictureUrl" in postObj) storage.refFromURL(postObj.pictureUrl).delete();
        if("soundUrl" in postObj) storage.refFromURL(postObj.soundUrl).delete();

        // 포스트 삭제
        let postRef = db.ref('posts/' + cUuid + "/" + postKey);
        postRef.remove();

        // 신고 내역 삭제
        let reportUserRef = db.ref('reports/posts/' + reportedUuid + "/" + cUuid + "/" + postKey);
        reportUserRef.remove();

        // TODO : 메세지 보내기 => 요부분은 주열이가 해야할듯..
        // 코어 관리자한테 메세지 받고, 그사람이 관리자 계정에 메세지를 하면 어떻게되나
        // 허위 신고자에 대한 제재는?


      },
      afterWeek(weeks) {
        const d = new Date();
        const dayOfMonth = d.getDate();
        d.setDate(dayOfMonth + 7*weeks);
        return d.getTime()
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
