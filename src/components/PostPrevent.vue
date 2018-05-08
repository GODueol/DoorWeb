<template>
  <div class="container my-5">

    <h2> 포스트 제재 유저 리스트 </h2>

    <!-- 제재 유저별 -->
    <div class="list-group-item col-md-auto row" v-for="(preventUser) in preventUsers">
      <div class="row">

        <!-- 유저 정보 -->
        <div class="col-sm">
          <h4> 유저 정보 </h4>

          <table class="table table-bordered">
            <tbody>
            <tr>
              <td>Email</td>
              <td>{{preventUser.user.email}}</td>
            </tr>
            <tr>
              <td>Name</td>
              <td>{{preventUser.user.id}}</td>
            </tr>
            <tr>
              <td>Profile</td>
              <td>{{preventUser.user.totalProfile}}</td>
            </tr>

            <tr v-if="preventUser.prevent">
              <td>제재횟수</td>
              <td>{{preventUser.prevent.preventCount}}</td>
            </tr>

            <tr v-if="preventUser.prevent && preventUser.prevent.releaseDate">
              <td>제재 해제 시점</td>
              <td>{{getDate(preventUser.prevent.releaseDate)}}</td>
            </tr>

            <tr>
              <td>신고내용</td>
              <td>{{preventUser.prevent.reportContents}}</td>
            </tr>

            <tr>
              <td>신고자</td>
              <td>{{preventUser.prevent.reporterUuid}}</td>
            </tr>
            </tbody>
          </table>
        </div>
        <div class="col-sm">
          <h4> 프로필 사진 </h4>

          <!-- 프로필 사진 -->
          <div v-if="preventUser.user.picUrls" :id="preventUser.uuid" class="carousel slide" data-ride="carousel" data-interval="false" >
            <ol class="carousel-indicators">
              <li v-if="preventUser.user.picUrls.picUrl1" data-target="#carouselExampleIndicators" data-slide-to="0" class="active"></li>
              <li v-if="preventUser.user.picUrls.picUrl2" data-target="#carouselExampleIndicators" data-slide-to="1"></li>
              <li v-if="preventUser.user.picUrls.picUrl3" data-target="#carouselExampleIndicators" data-slide-to="2"></li>
              <li v-if="preventUser.user.picUrls.picUrl4" data-target="#carouselExampleIndicators" data-slide-to="3"></li>
            </ol>
            <div class="carousel-inner">
              <div class="carousel-item active" v-if="preventUser.user.picUrls.picUrl1">
                <img class="d-block w-100" v-bind:src="preventUser.user.picUrls.picUrl1" alt="First slide">
              </div>
              <div class="carousel-item" v-if="preventUser.user.picUrls.picUrl2">
                <img class="d-block w-100" v-bind:src="preventUser.user.picUrls.picUrl2" alt="Second slide">
              </div>
              <div class="carousel-item" v-if="preventUser.user.picUrls.picUrl3">
                <img class="d-block w-100" v-bind:src="preventUser.user.picUrls.picUrl3" alt="Third slide">
              </div>

              <div class="carousel-item" v-if="preventUser.user.picUrls.picUrl4">
                <img class="d-block w-100" v-bind:src="preventUser.user.picUrls.picUrl4" alt="Third slide">
              </div>
            </div>
            <a class="carousel-control-prev" :href="'#'+preventUser.uuid" role="button" data-slide="prev">
              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
              <span class="sr-only">Previous</span>
            </a>
            <a class="carousel-control-next" :href="'#'+preventUser.uuid" role="button" data-slide="next">
              <span class="carousel-control-next-icon" aria-hidden="true"></span>
              <span class="sr-only">Next</span>
            </a>
          </div>

        </div>


      </div>
    </div>
  </div>
</template>

<script>
  import firebase from 'firebase'
  import dateUtil from '../helpers/dateUtil'

  let db = firebase.database();
  let preventUserListRef = db.ref('prevents/post');

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
        preventUsers: []
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

      const preventUsers = this.preventUsers;
      preventUserListRef.on('value', function (snapshot) {
        preventUsers.length = 0;
        snapshot.forEach(function (childSnapshot) {
          const child = {};
          child["uuid"] = childSnapshot.key;
          child["prevent"] = childSnapshot.val();

          // get userInfo
          let userRef = db.ref('users/' + childSnapshot.key);
          userRef.once('value', function (userSnapshot) {
            child["user"] = userSnapshot.val();
            preventUsers.push(child);
          });
        });
      })
    },
    methods: {
      getDate : dateUtil.getDate,
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
table{
  table-layout: fixed;
}
table tr{
  word-wrap: break-word;
}
</style>
