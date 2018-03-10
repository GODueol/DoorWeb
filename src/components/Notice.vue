<template>
  <div>
    Notice
    <pre>{{ anObject }}</pre>
    <ul>
      <li v-for="item in anArray" :key="item.id">{{ item.text }}</li>
    </ul>
  </div>
</template>

<script>
import firebase from 'firebase'
var db = firebase.database()

export default {
  name: 'Notice',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  },
  firebase: {
    // simple syntax, bind as an array by default
    anArray: db.ref('posts/AE5w1CD9s8bz7Dmb5PdsqE51SaG2'),
    // can also bind to a query
    // anArray: db.ref('url/to/my/collection').limitToLast(25)
    // full syntax
    anObject: {
      source: db.ref('posts/AE5w1CD9s8bz7Dmb5PdsqE51SaG2'),
      // optionally bind as an object
      asObject: true,
      // optionally provide the cancelCallback
      cancelCallback: function () {},
      // this is called once the data has been retrieved from firebase
      readyCallback: function () {}
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
