<template>
  <div>
    <h1>Firbase Signup succeeded</h1>
    <button @click='logOut'>Log out</button>
    <hr>
    <img :src="photo" style="height: 120px"> <br>
    <p>{{name}}</p>
    <p>{{email}}</p>
    <p>{{userId}}</p>
    <hr>

    {{msg}}
  </div>
</template>

<script>
import firebase from 'firebase'

let db = firebase.database();
export default {
  data () {
    return {
      photo: '',
      userId: '',
      name: '',
      email: '',
      user: {},
      msg : "관리자 인증 중입니다 기다려주세요"
    }
  },
  created: function () {
    firebase.auth().onAuthStateChanged((user) => {
      console.log("user",user);
      // admin used 확인
      db.ref('admins/' + user.uid + "/isUsed").once('value', snapshot => {
        let isUsed = snapshot.val();
        if(isUsed){
          this.user = user;
          if (this.user) {
            this.name = this.user.displayName
            this.email = this.user.email
            this.photo = this.user.photoURL
            this.userId = this.user.uid
          }
          this.msg = "관리자 권한 인증 완료되었습니다";
        } else {
          this.msg = "관리자 권한 승인 대기중입니다... 승인 이후 로그인하세요";
        }
      });

    })

  },
  methods: {
    logOut () {
      firebase.auth().signOut()
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
a {
  color: #42b983;
}
</style>
