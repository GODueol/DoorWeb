<template>
  <div>
    <!-- 신고된 유저별 -->
    <div class="list-group-item col-md-auto row" v-for="(reportUser, index) in reportUsers">
      <div class="row">

        <!-- 신고된 유저 정보 -->
        <div class="col-sm-6 col-md-4">

          <div>
            Email : {{reportUser.user.email}}
          </div>

          <div>
            Name : {{reportUser.user.id}}
          </div>

          <div>
            Profile : {{reportUser.user.totalProfile}}
          </div>

          <div :id="reportUser.uuid" class="carousel slide" data-ride="carousel" data-interval="false" >
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
<!--

          <img v-if="reportUser.user.picUrls.picUrl1" v-bind:src="reportUser.user.picUrls.picUrl1" class="img-thumbnail">
          <img v-if="reportUser.user.picUrls.picUrl1" v-bind:src="reportUser.user.picUrls.picUrl2" class="img-thumbnail">
          <img v-if="reportUser.user.picUrls.picUrl1" v-bind:src="reportUser.user.picUrls.picUrl3" class="img-thumbnail">
          <img v-if="reportUser.user.picUrls.picUrl1" v-bind:src="reportUser.user.picUrls.picUrl4" class="img-thumbnail">
-->


        </div>

        <!-- 신고 유형별 -->
        <div class="col-md-auto">
          <div class="list-group-item col-md-auto" v-for="(report, reportIndex) in reportUser.report">
            <!-- 신고 유형 -->
            <h4>
            {{reportIndex}}
            </h4>

            <!-- 신고자별 -->
            <div>
              <div class="list-group-item" v-for="(reportUser, reportUserIndex) in report">
                <div>
                  신고자 : {{reportUserIndex}}
                </div>
                <div>
                  신고내용 : {{reportUser.contents}}
                </div>
                <div>
                  신고날 : {{getDate(reportUser.date)}}
                </div>

                <!--버튼-->
                <div class="dropdown">
                  <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    조치
                  </button>
                  <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    <a class="dropdown-item" href="#">프로필 사진 삭제 삭제 / 7일 업로드 중지</a>
                    <a class="dropdown-item" href="#">신고 삭제</a>
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
          userRef.once('value', function (userSnapshot) {
            child["user"] = userSnapshot.val();
            reportUsers.push(child);
          });
        });
      })
    },
    methods: {
      getDate(date) {
        return new Date(date).toLocaleString();
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
