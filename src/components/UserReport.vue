<template>
  <div class="container my-5">

    <h2> 프로필 신고 리스트 </h2>

    <!-- 신고된 유저별 -->
    <div class="list-group-item col-md-auto row" v-for="(reportUser, index) in reportUsers">
      <div class="row">

        <!-- 신고된 유저 정보 -->
        <div class="col-sm-5">


          <!-- 프로필 사진 -->
          <div v-if="reportUser.user.picUrls" :id="reportUser.uuid" class="carousel slide mb-3" data-ride="carousel" data-interval="false" >
            <ol class="carousel-indicators">
              <li v-if="reportUser.user.picUrls.picUrl1" data-target="#carouselExampleIndicators" data-slide-to="0" class="active"></li>
              <li v-if="reportUser.user.picUrls.picUrl2" data-target="#carouselExampleIndicators" data-slide-to="1"></li>
              <li v-if="reportUser.user.picUrls.picUrl3" data-target="#carouselExampleIndicators" data-slide-to="2"></li>
              <li v-if="reportUser.user.picUrls.picUrl4" data-target="#carouselExampleIndicators" data-slide-to="3"></li>
            </ol>
            <div class="carousel-inner">
              <div class="carousel-item active" v-if="reportUser.user.picUrls.picUrl1">
                <img v-bind:src="reportUser.user.picUrls.picUrl1" alt="First slide" @click="detailImg(reportUser.user.picUrls.picUrl1)">
              </div>
              <div class="carousel-item" v-if="reportUser.user.picUrls.picUrl2">
                <img v-bind:src="reportUser.user.picUrls.picUrl2" alt="Second slide" @click="detailImg(reportUser.user.picUrls.picUrl2)">
              </div>
              <div class="carousel-item" v-if="reportUser.user.picUrls.picUrl3">
                <img v-bind:src="reportUser.user.picUrls.picUrl3" alt="Third slide" @click="detailImg(reportUser.user.picUrls.picUrl3)">
              </div>

              <div class="carousel-item" v-if="reportUser.user.picUrls.picUrl4">
                <img v-bind:src="reportUser.user.picUrls.picUrl4" alt="Third slide" @click="detailImg(reportUser.user.picUrls.picUr4)">
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

          <!-- 프로필 정보 -->
          <table class="table table-bordered">
            <tbody>
            <tr>
              <td>제재 여부</td>
              <td v-if="reportUser.prevent && !isRelease(reportUser.prevent.releaseDate)"> 제제 중 ({{reportUser.prevent.preventCount}}) {{getDate(reportUser.prevent.releaseDate)}}</td>
              <td v-else-if="reportUser.prevent"> 제제 중 아님 ({{reportUser.prevent.preventCount}}) {{getDate(reportUser.prevent.releaseDate)}}</td>
              <td v-else> 제제 이력 없음 </td>
            </tr>

            <tr>
              <td>이메일</td>
              <td>{{reportUser.user.email}}</td>
            </tr>
            <tr>
              <td>닉네임</td>
              <td>{{reportUser.user.id}}</td>
            </tr>
            <tr>
              <td>프로필</td>
              <td>{{reportUser.user.totalProfile}}</td>
            </tr>
            <tr>
              <td>소개</td>
              <td>{{reportUser.user.intro}}</td>
            </tr>




            </tbody>
          </table>



        </div>

        <!-- 신고 유형별 -->
        <div class="col-sm-7">
          <div class="list-group-item col-md-auto" v-for="(report, reportIndex) in reportUser.report">
            <!-- 신고 유형 -->
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
  import dateUtil from '../helpers/dateUtil'
  import cu from '../helpers/commonUtil'

  let db = firebase.database();
  let reportUserRef = db.ref('reports/users');

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

      const reportUsers = this.reportUsers;
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
      getDate : dateUtil.getDate,
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
            releaseDate = dateUtil.afterWeek(1);  // releaseDate 갱신
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


          const msg = "안녕하세요 회원님. 코어 관리자입니다. \n\n 회원님의 프로필 내용이 "+ type +" 항목으로 신고되었고, 이에 정당한 신고 사유로 인정되어 관리자에 의해 [프로필 삭제 및 7일간 프로필 업로드 금지] 처리됨을 알립니다. \n\n 코어는 제재된 회원에 대한 정보를 기록하고 있으며, 제재기간이 끝난 이후에도 항목을 위반한 신고가 누적될 시 계정의 이용 정지 처리될 수 있음을 알립니다."
          message.sendMessge(reportedUuid, msg);
        });

        // 사진 삭제
        function deleteMedia(userObj, reportedUuid){

          // file 삭제
          const storage = firebase.storage();

          if(userObj.hasOwnProperty("picUrls")){
            if(userObj.picUrls.hasOwnProperty("picUrl1")) storage.refFromURL(userObj.picUrls.picUrl1).delete();
            if(userObj.picUrls.hasOwnProperty("picUrl2")) storage.refFromURL(userObj.picUrls.picUrl2).delete();
            if(userObj.picUrls.hasOwnProperty("picUrl3")) storage.refFromURL(userObj.picUrls.picUrl3).delete();
            if(userObj.picUrls.hasOwnProperty("picUrl4")) storage.refFromURL(userObj.picUrls.picUrl4).delete();

            db.ref('users/' + reportedUuid + "/picUrls").remove();

            if(userObj.picUrls.hasOwnProperty("thumbNail_picUrl1")) storage.refFromURL(userObj.picUrls.thumbNail_picUrl1).delete();
            if(userObj.picUrls.hasOwnProperty("thumbNail_picUrl2")) storage.refFromURL(userObj.picUrls.thumbNail_picUrl2).delete();
            if(userObj.picUrls.hasOwnProperty("thumbNail_picUrl3")) storage.refFromURL(userObj.picUrls.thumbNail_picUrl3).delete();
            if(userObj.picUrls.hasOwnProperty("thumbNail_picUrl4")) storage.refFromURL(userObj.picUrls.thumbNail_picUrl4).delete();

            db.ref('users/' + reportedUuid + "/summaryUser/pictureUrl").remove();
          }


          // text 삭제
          db.ref('users/' + reportedUuid + "/intro").set("");
//          db.ref('users/' + reportedUuid + "/name").set("");
        }

      },
      deletePrevent(reportedUuid) {
        let reportUserRef = db.ref('reports/users/' + reportedUuid);
        reportUserRef.remove();
      },
      deletePreventAndSendMessage(reportedUuid, type, reporterUuid){
        if (!confirm("정말 신고를 삭제 하시겠습니까?")) return;
        this.deletePrevent(reportedUuid);
      },
      detailImg : cu.detailImg,
      isRelease : cu.isRelease,

    },
    computed:{

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
