<template>
  <div class="container my-5">

    <h2> 관리자 계정 관리 </h2>

    <!-- 신고된 유저별 -->
    <div class="list-group-item col-md-auto row" v-for="(adminUser, index) in adminUsers">
      <div class="row">

        <!-- 신고된 유저 정보 -->
        <div class="col-sm-4">

          <table class="table table-bordered">
            <tbody>
            <tr>
              <td>displayName</td>
              <td>{{adminUser.user.displayName}}</td>
            </tr>
            <tr>
              <td>email</td>
              <td>{{adminUser.user.email}}</td>
            </tr>
            <tr>
              <td>사용 여부</td>
              <td>
                <!-- 버튼 -->
                <div class="col-sm-1">
                  <label class="btn btn-secondary">
                    <input type="checkbox" autocomplete="off" v-model="adminUser.user.isUsed" @click="setAdminUsed(adminUser)"> {{adminUser.user.isUsed}}
                  </label>
                </div>
              </td>
            </tr>

            </tbody>
          </table>

        </div>



      </div>
    </div>
  </div>
</template>

<script>
  import firebase from 'firebase'
  import dateUtil from '../helpers/dateUtil'

  let db = firebase.database();
  let adminUserRef = db.ref('admins');

  export default {
    name: 'Report',
    data() {
      return {
        user : {},
        adminUsers: []
      }
    },
    created: function () {
      this.user = firebase.auth().currentUser

      const adminUsers = this.adminUsers;
      adminUserRef.on('value', function (snapshot) {
        adminUsers.length = 0;
        snapshot.forEach(function (childSnapshot) {
          const child = {};
          child["uuid"] = childSnapshot.key;
          child["user"] = childSnapshot.val();

          adminUsers.push(child);

        });
      })
    },
    methods: {
      getDate : dateUtil.getDate,
      setAdminUsed(adminUser){
        db.ref('admins/' + adminUser.uuid + "/isUsed").set(!adminUser.user.isUsed);
        debugger;
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
