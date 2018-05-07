<template>
  <div id="app">

    <b-nav tabs>
      <b-nav-item v-if="menuSeen"> <router-link to="/notice">Notice</router-link> </b-nav-item>
      <b-nav-item v-if="menuSeen"> <router-link to="/report/user">User Report</router-link> </b-nav-item>
      <b-nav-item v-if="menuSeen"> <router-link to="/report/post">Post Report</router-link> </b-nav-item>
      <b-nav-item v-if="menuSeen"> <router-link to="/suggest">Suggest</router-link> </b-nav-item>
      <b-nav-item v-if="menuSeen" v-on:click="logOut"> Logout </b-nav-item>
    </b-nav>

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
</style>
