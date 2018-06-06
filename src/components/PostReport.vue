<template>
  <div class="container my-5">

    <h2> 포스트 신고 리스트 </h2>

    <!-- 신고된 유저별 -->
    <div v-for="(reportUser, index) in reportUsers" :key=reportUser.uuid>
      <!-- 코어별 -->
      <div class = "cores" >
        <div v-for="(core, coreIndex) in reportUser.cores">
          <!-- 포스트별 -->
          <div class="list-group-item card d-flex flex-row align-items-stretch" v-for="(post, postIndex) in core">
              <div class="row ">
                <!-- 신고된 유저 정보 -->
                <div class="col-sm-4">

                  <!-- 포스트 사진 -->
                  <div class="post-pic-div mb-3">
                    <img v-if="post.post && post.post.pictureUrl" v-bind:src="post.post.pictureUrl" class="img-thumbnail post-pic" @click="detailImg(post.post.pictureUrl)">
                  </div>

                  <table class="table table-bordered">
                    <tbody>
                    <tr>
                      <td>제재 여부</td>
                      <td v-if="reportUser.prevent && !isRelease(reportUser.prevent.releaseDate)"> 제제 중 ({{reportUser.prevent.preventCount}}) {{getDate(reportUser.prevent.releaseDate)}}</td>
                      <td v-else-if="reportUser.prevent"> 제제 중 아님 ({{reportUser.prevent.preventCount}}) {{getDate(reportUser.prevent.releaseDate)}}</td>
                      <td v-else> 제제 이력 없음 </td>
                    </tr>
                    <tr v-if="reportUser.user">
                      <td>이메일</td>
                      <td>{{reportUser.user.email}}</td>
                    </tr>

                    <tr>
                      <td>코어주인</td>
                      <td>{{coreIndex}}</td>
                    </tr>
                    <tr>
                      <td>포스트키</td>
                      <td>{{postIndex}}</td>
                    </tr>
                    <tr v-if="post.post">
                      <td>클라우드 여부</td>
                      <td>{{post.post.isCloud}}</td>
                    </tr>
                    </tbody>
                  </table>

                  <div v-if="post.post && post.post.soundUrl" class="mt-3">
                    <h6>녹음 내용</h6>
                    <div><audio controls v-if="post.post.soundUrl">
                      <source v-bind:src="post.post.soundUrl">
                    </audio></div>
                  </div>
                  <div v-if="post.post" class="mt-3">
                    <h6>포스트 내용</h6>
                    <div class = "border rounded p-2 flex-fill align-self-stretch">{{post.post.text}}</div>
                  </div>

                </div>

                <div class="col-sm-8 category-list">
                  <!-- 신고 유형별 -->
                  <div class = "reportTypes ">
                    <!-- 신고 유형 -->
                    <div class="list-group-item" v-for="(report, reportIndex) in post">
                      <div v-if="reportIndex != 'post'">
                        <h4>
                            {{reportIndex}}
                        </h4>
                        <!-- 신고자별 -->
                        <div>
                          <div class="list-group-item" v-for="(reportedUser, reportedUserIndex) in report">

                            <table class="table table-bordered">
                              <tbody>
                              <tr>
                                <td>신고자</td>
                                <td><div>{{reportedUserIndex}}</div></td>
                              </tr>
                              <tr>
                                <td>신고내용</td>
                                <td>{{reportedUser.contents}}</td>
                              </tr>
                              <tr>
                                <td>신고날</td>
                                <td>{{getDate(reportedUser.date)}}</td>
                              </tr>

                              </tbody>
                            </table>

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
  import dateUtil from '../helpers/dateUtil'
  import cu from '../helpers/commonUtil'
  const _ = require('lodash');

  let db = firebase.database();
  let reportPostRef = db.ref('reports/posts');

  export default {
    name: 'Report',
    data() {
      return {
        user: {},
        reportUsers: []
      }
    },
    created: function () {
      this.user = firebase.auth().currentUser

      let reportUsers = this.reportUsers;
      const vue = this;
      reportPostRef.on('value', function (snapshot) {
        console.log("start!! created");
//        reportUsers.length = 0;
        reportUsers.splice(0);

        snapshot.forEach(function (childSnapshot) {
          const child = {};
          child["uuid"] = childSnapshot.key;
          child["cores"] = childSnapshot.val();
          reportUsers.push(child);

          // get Post
          Object.keys(child["cores"]).map(function(cUuid) {
//            child.cores[cUuid] = {};

            const core = child["cores"][cUuid];

            Object.keys(core).map(function(postKey) {
              let postRef = db.ref('posts/' + cUuid + "/" + postKey);

              postRef.once('value', function (postSnapshot) {
                console.log('cUuid', cUuid);
                console.log('postRef', postSnapshot.key,postSnapshot.val());
                console.log('child', child);

                vue.$set(child.cores[cUuid][postKey], 'post', postSnapshot.val());

              });
            });
          });

          // get profile
          let userRef = db.ref('users/' + childSnapshot.key);
          let preventUserRef = db.ref('prevents/post/' + childSnapshot.key);
          userRef.once('value', function (userSnapshot) {
            vue.$set(child, 'user', userSnapshot.val());

            // get prevent
            preventUserRef.once('value', preventSnapshot =>{
              vue.$set(child, 'prevent', preventSnapshot.val());
            });

          });
        });
      })
    },
    methods: {
      getDate : dateUtil.getDate,
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
            releaseDate = dateUtil.afterWeek(1);  // releaseDate 갱신
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

          const msg = "안녕하세요 회원님. 코어 관리자입니다. \n\n 회원님의 포스트 내용이 "+ type +" 항목으로 신고되었고, 이에 정당한 신고 사유로 인정되어 관리자에 의해 [포스트 삭제 및 7일간 포스트 업로드 금지] 처리됨을 알립니다. \n\n  관리자의 신고 처리 일자로 인해 회원님의 다른 포스트가 정당한 신고 사유로 인정될 시 불가피하게 제재 기간이 늘어날 수 있습니다. 그러므로 회원님이 제재 항목을 위반하여 작성한 포스트를 미리 삭제해 주시길 바랍니다. \n\n 코어는 제재된 회원에 대한 정보를 기록하고 있으며, 제재기간이 끝난 이후에도 항목을 위반한 신고가 누적될 시 계정의 이용 정지 처리될 수 있음을 알립니다."

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
      deletePrevent(reportedUuid, cUuid, postKey) {
        let reportUserRef = db.ref('reports/posts/' + reportedUuid + "/" + cUuid + "/" + postKey);
        reportUserRef.remove();
      },
      deletePreventAndSendMessage(reportedUuid, cUuid, postKey, type, reporterUuid){
        if (!confirm("정말 신고를 삭제 하시겠습니까?")) return;
        this.deletePrevent(reportedUuid, cUuid, postKey);
      },
      detailImg : cu.detailImg,
      isRelease : cu.isRelease,
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
.card{
  height: 700px;
}
.post-pic-div{
  text-align: center;
}
</style>
