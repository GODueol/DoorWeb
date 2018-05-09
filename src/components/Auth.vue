<template lang="html">
  <div class="starter-template">
    <h1> Core Web </h1>
    <div id="firebaseui-auth-container"/>
  </div>
</template>

<script>
import firebase from 'firebase'
import firebaseui from 'firebaseui'
import routerPath from '../helpers/routerPath'

export default {
  name: 'auth',
  mounted: function () {
    var uiConfig = {
      signInSuccessUrl: routerPath.default,
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID
      ]
    }
    var ui = new firebaseui.auth.AuthUI(firebase.auth())
    ui.start('#firebaseui-auth-container', uiConfig)
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
.starter-template {
  padding: 3rem 1.5rem;
  text-align: center;
}

</style>
