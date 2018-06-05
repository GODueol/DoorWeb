<template>
  <div id="app">

    <nav class="navbar navbar-expand-lg navbar-dark bg-dark" v-if="menuSeen" >
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
        <div class="navbar-nav">
          <router-link to="/notice" class="nav-item nav-link">공지사항</router-link>

          <router-link to="/suggest" class="nav-item nav-link">의견 보내기</router-link>

          <div class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="reportMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              신고 관리
            </a>
            <div class="dropdown-menu" aria-labelledby="reportMenu">
              <router-link to="/report/user" class="dropdown-item">회원</router-link>
              <router-link to="/report/post" class="dropdown-item">포스트</router-link>
            </div>
          </div>

          <div class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="preventMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              제재 중인 회원
            </a>
            <div class="dropdown-menu" aria-labelledby="preventMenu">
              <router-link to="/prevent/user" class="dropdown-item">회원</router-link>
              <router-link to="/prevent/post" class="dropdown-item">포스트</router-link>
            </div>
          </div>

          <router-link to="/account/admin" class="nav-item nav-link">관리자 설정</router-link>

          <div class="nav-item nav-link" @click="logOut"> 로그아웃 </div>
        </div>
      </div>
    </nav>

    <router-view/>
  </div>
</template>

<script>
import firebase from 'firebase'
import {config} from './helpers/firebaseConfig'

firebase.initializeApp(config);
let db = firebase.database();
export default {
  name: 'App',
  data: function () {
    return {
      menuSeen: false
    }
  },
  created: function () {
    firebase.auth().onAuthStateChanged((user) => {
      if(!user) {
        this.menuSeen = !!user;
      } else {
        db.ref('admins/' + user.uid + "/isUsed").once('value', snapshot => {
          let isUsed = snapshot.val();
          if(isUsed){
            this.menuSeen = !!user;
          } else {
            this.menuSeen = false;
          }
        });
      }
    })
  },
  methods: {
    logOut () {
      firebase.auth().signOut()
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
table{
  table-layout: fixed;
}
table tr{
  word-wrap: break-word;
}

nav.navbar{
  position: sticky;
  top: 0;
  z-index: 1040;
}

.border-success{
  border: 5px solid #28a745 !important;
}

.border-danger{
  border: 5px solid #dc3545 !important;
}

.border-warning{
  border: 5px solid #ffc107 !important;
}


.carousel-item {
  text-align: center;
  background: gray;

}
.carousel-item img, .post-pic {
  height: 200px;
  width: auto;
}
.category-list{
  overflow: auto;
}

</style>
