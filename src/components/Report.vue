<template>
  <div>
    <!-- 신고된 유저별 -->
    <div class="list-group-item col-md-auto row" v-for="(reportUser, index) in reportUsers">
      <div class="row">

        <!-- 신고된 유저 정보 -->
        <div class="col-4">

          <div>
            Email : {{reportUser.user.email}}
          </div>

          <div>
            Name : {{reportUser.user.id}}
          </div>

          <div>
            Profile : {{reportUser.user.totalProfile}}
          </div>

          <div v-if="reportUser.prevent">
            제재횟수 :
            {{reportUser.prevent.preventCount}}
          </div>

          <div v-if="reportUser.prevent && reportUser.prevent.releaseDate">
            제재 해제 시점 :
            {{getDate(reportUser.prevent.releaseDate)}}
          </div>

          <div v-if="reportUser.user.picUrls" :id="reportUser.uuid" class="carousel slide" data-ride="carousel" data-interval="false" >
            <ol class="carousel-indicators">
              <li v-if="reportUser.user.picUrls.picUrl1" data-target="#carouselExampleIndicators" data-slide-to="0" class="active"></li>
              <li v-if="reportUser.user.picUrls.picUrl2" data-target="#carouselExampleIndicators" data-slide-to="1"></li>
              <li v-if="reportUser.user.picUrls.picUrl3" data-target="#carouselExampleIndicators" data-slide-to="2"></li>
              <li v-if="reportUser.user.picUrls.picUrl4" data-target="#carouselExampleIndicators" data-slide-to="3"></li>
            </ol>
            <div class="carousel-inner">
              <div class="carousel-item active" v-if="reportUser.user.picUrls.picUrl1">
                <img class="d-block w-100" v-bind:src="reportUser.user.picUrls.picUrl1" alt="First slide">
              </div>
              <div class="carousel-item" v-if="reportUser.user.picUrls.picUrl2">
                <img class="d-block w-100" v-bind:src="reportUser.user.picUrls.picUrl2" alt="Second slide">
              </div>
              <div class="carousel-item" v-if="reportUser.user.picUrls.picUrl3">
                <img class="d-block w-100" v-bind:src="reportUser.user.picUrls.picUrl3" alt="Third slide">
              </div>

              <div class="carousel-item" v-if="reportUser.user.picUrls.picUrl4">
                <img class="d-block w-100" v-bind:src="reportUser.user.picUrls.picUrl4" alt="Third slide">
              </div>
            </div>
            <a class="carousel-control-prev" :href="'#'+reportUser.uuid" role="button" data-slide="prev">
              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
              <span class="sr-only">Previous</span>
            </a>
            <a class="carousel-control-next" :href="'#'+reportUser.uuid" role="button" data-slide="next">
              <span class="carousel-control-next-icon" aria-hidden="true"></span>
              <span class="sr-only">Next</span>
            </a>
          </div>

        </div>

        <!-- 신고 유형별 -->
        <div class="col-8">
          <div class="list-group-item col-md-auto" v-for="(report, reportIndex) in reportUser.report">
            <!-- 신고 유형 -->
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
                    <a class="dropdown-item" @click="setPrevent(reportUser.uuid, reportIndex, reportedUserIndex, reportedUser, reportUser.user)">프로필 사진 삭제 삭제 / 7일 업로드 중지</a>
                    <a class="dropdown-item" @click="deletePreventAndSendMessage(reportUser.uuid, reportIndex, reportedUserIndex)">신고 삭제</a>
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
</template>

<script>
  import firebase from 'firebase'
  import message from '../helpers/message'

  let db = firebase.database();
  let reportUserRef = db.ref('reports/users');


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

      var reportUsers = this.reportUsers;
      reportUserRef.on('value', function (snapshot) {
        reportUsers.length = 0;
        snapshot.forEach(function (childSnapshot) {
          const child = {};
          child["uuid"] = childSnapshot.key;
          child["report"] = childSnapshot.val();

          // get profile
          let userRef = db.ref('users/' + childSnapshot.key);
          let preventUserRef = db.ref('prevents/user/' + childSnapshot.key);
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
      setPrevent(reportedUuid, type, reporterUuid, reportObj, userObj){
        console.log(reportedUuid, type, reporterUuid, reportObj, userObj);

        if (!confirm("정말 조치를 하시겠습니까?")) return;

        // 제재 내역 조회
        let preventRef = db.ref('prevents/user/' + reportedUuid);
        preventRef.once('value', snapshot => {

          const preventObj = snapshot.val();

          // 현재 재재중이면 포스트 삭제만
          let releaseDate = (preventObj === null? null :preventObj.releaseDate);
          const now = new Date().getTime();

          // 제재기간이 아닐때만 제재
          if(releaseDate === null || releaseDate <= now){
            // 제재
            let preventCount = 1;
            if(preventObj !== null){
              preventCount = preventObj.preventCount+1;
            }
            releaseDate = this.afterWeek(1);  // releaseDate 갱신
            preventRef.set({
              reportType : type,
              reporterUuid : reporterUuid,
              reportContents : reportObj.contents,
              reportDate : reportObj.date,
              releaseDate : releaseDate,
              preventCount : preventCount
            });
          }

          deleteMedia(userObj, reportedUuid);
          this.deletePrevent(reportedUuid);

          const msg = "안녕하세요 회원님. 코어 관리자입니다. \n\n 회원님의 포스트 내용이 "+type+" 항목으로 신고되었고, 이에 정당한 신고 사유로 인정되어 관리자에 의해 [포스트 삭제 및 7일간 포스트 업로드 금지] 처리됨을 알립니다. \n\n  관리자의 신고 처리 일자로 인해 회원님의 다른 포스트가 정당한 신고 사유로 인정될 시 불가피하게 제재 기간이 늘어날 수 있습니다. 그러므로 회원님이 제재 항목을 위반하여 작성한 포스트를 미리 삭제해 주시길 바랍니다. \n\n 코어는 제재된 회원에 대한 정보를 기록하고 있으며, 제재기간이 끝난 이후에도 항목을 위반한 신고가 누적될 시 계정의 이용 정지 처리될 수 있음을 알립니다."
          message.sendMessge(reportedUuid, msg);
        });

        // 사진 삭제
        function deleteMedia(userObj, reportedUuid){
          const storage = firebase.storage();
          if("picUrl1" in userObj.picUrls) storage.refFromURL(userObj.picUrls.picUrl1).delete();
          if("picUrl2" in userObj.picUrls) storage.refFromURL(userObj.picUrls.picUrl2).delete();
          if("picUrl3" in userObj.picUrls) storage.refFromURL(userObj.picUrls.picUrl3).delete();
          if("picUrl4" in userObj.picUrls) storage.refFromURL(userObj.picUrls.picUrl4).delete();

          if("thumbNail_picUrl1" in userObj.picUrls) storage.refFromURL(userObj.picUrls.thumbNail_picUrl1).delete();
          if("thumbNail_picUrl2" in userObj.picUrls) storage.refFromURL(userObj.picUrls.thumbNail_picUrl2).delete();
          if("thumbNail_picUrl3" in userObj.picUrls) storage.refFromURL(userObj.picUrls.thumbNail_picUrl3).delete();
          if("thumbNail_picUrl4" in userObj.picUrls) storage.refFromURL(userObj.picUrls.thumbNail_picUrl4).delete();

          let userRef = db.ref('users/' + reportedUuid + "/picUrls").remove();
        }

      },
      afterWeek(weeks) {
        const d = new Date();
        const dayOfMonth = d.getDate();
        d.setDate(dayOfMonth + 7*weeks);
        return d.getTime()
      },
      deletePrevent(reportedUuid) {
        let reportUserRef = db.ref('reports/users/' + reportedUuid);
        reportUserRef.remove();
      },
      deletePreventAndSendMessage(reportedUuid, type, reporterUuid){
        if (!confirm("정말 신고를 삭제 하시겠습니까?")) return;
        this.deletePrevent(reportedUuid);
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
.carousel-item{
  overflow: auto;

}
</style>
