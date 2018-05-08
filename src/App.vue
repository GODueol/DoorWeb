<template>
  <div id="app">

    <nav class="navbar navbar-expand-lg navbar-dark bg-dark" v-if="menuSeen" >
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
        <div class="navbar-nav">
          <router-link to="/notice" class="nav-item nav-link">Notice</router-link>
          <router-link to="/suggest" class="nav-item nav-link">Suggest</router-link>

          <div class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="reportMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Report
            </a>
            <div class="dropdown-menu" aria-labelledby="reportMenu">
              <router-link to="/report/user" class="dropdown-item">User</router-link>
              <router-link to="/report/post" class="dropdown-item">Post</router-link>
            </div>
          </div>

          <div class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="preventMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Prevent
            </a>
            <div class="dropdown-menu" aria-labelledby="preventMenu">
              <router-link to="/prevent/user" class="dropdown-item">User</router-link>
              <router-link to="/prevent/post" class="dropdown-item">Post</router-link>
            </div>
          </div>

          <div class="nav-item nav-link" @click="logOut">Logout </div>
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

export default {
  name: 'App',
  data: function () {
    return {
      menuSeen: false
    }
  },
  created: function () {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.menuSeen = true
      } else {
        this.menuSeen = false
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
</style>
