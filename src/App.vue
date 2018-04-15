<template>
  <div id="app">

    <b-nav tabs>
      <b-nav-item v-if="menuSeen"> <router-link to="/notice">Notice</router-link> </b-nav-item>
      <b-nav-item v-if="menuSeen"> <router-link to="/report">Report</router-link> </b-nav-item>
      <b-nav-item v-if="menuSeen"> <router-link to="/suggest">Suggest</router-link> </b-nav-item>
      <b-nav-item v-if="menuSeen" v-on:click="logOut"> Logout </b-nav-item>
    </b-nav>

    <router-view/>
  </div>
</template>

<script>
import firebase from 'firebase'

export const config = {
  apiKey: 'AIzaSyBvt4z9T0Db3aM-1tCocjrBbC62Ch6QY-8',
  authDomain: 'core-865fc.firebaseapp.com',
  databaseURL: 'https://core-865fc.firebaseio.com',
  projectId: 'core-865fc',
  storageBucket: 'core-865fc.appspot.com',
  messagingSenderId: '699214818051'
}


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
  text-align: center;
  color: #2c3e50;
}
</style>
