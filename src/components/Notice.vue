<template>

  <div class="container">
    <h2>{{userId}}</h2>
    <div class="input-group" style="margin-bottom:10px;">
      <input type="text" class="form-control"
             placeholder="할일을 입력하세요"
             v-model="text"
             v-on:keyup.enter="createTodo(text)">

      <input type="file"
             id="image"
             accept=".jpg, .jpeg, .png"
             multiple>
      <span class="input-group-btn">
		<button class="btn btn-default" type="button"
            @click="createTodo(text)">추가</button>
	</span>
    </div>
    <ul class="list-group">
      <li class="list-group-item" v-for="(todo, index) in todos">
        {{todo.name}}
        <div class="btn-group pull-right"
             style="font-size: 12px; line-height: 1;">
          <ul>
            <li>
              <a href="#" @click="deleteTodo(index)">삭제</a>
            </li>
          </ul>
        </div>
      </li>
    </ul>
  </div>


</template>


<script>
  import firebase from 'firebase'

  let config = {
    apiKey: "AIzaSyBvt4z9T0Db3aM-1tCocjrBbC62Ch6QY-8",
    authDomain: "core-865fc.firebaseapp.com",
    databaseURL: "https://core-865fc.firebaseio.com",
    projectId: "core-865fc",
    storageBucket: "core-865fc.appspot.com",
    messagingSenderId: "699214818051"
  };

  let app = firebase.initializeApp(config);
  let db = app.database();
  let noticeRef = db.ref('notice');
  export default {

    name: 'Notice',
    data() {
      return {
        msg: 'Welcome to Your Vue.js App',
        noticekey: String,
        photo: String,
        userId: String,
        name: String,
        email: String,
        user: {},
        todos: []
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
      var todos = this.todos;
      noticeRef.on('child_added', function (data) {
        todos.unshift({name: data.val().text, userId: data.val().uid, noticekey: data.key})
      });

      var noticeData = noticeRef;
      noticeData.on('value', function (snapshot) {
        //updateStarCount(postElement, snapshot.val());
      });
    },
    methods: {
      deleteTodo(i) {
        if (confirm("정말 공지를 삭제하시겠습니까?") == true) {
          noticeRef.child(this.todos[i].noticekey).remove()
          this.todos.splice(0, 1)

        }
      },
      createTodo(text) {
        if (text != null) {
          if (confirm("정말 공지를 등록하시겠습니까?") == true) {

            var name = this.name
            var uid = this.userId
            var selectedFile = document.getElementById('image').files[0]
            if (selectedFile != null) {
              var storageRef = firebase.storage().ref();
              storageRef.child('notice').child(selectedFile.name).put(selectedFile).then(function (snapshot) {

                noticeRef.push({
                  name: name,
                  photo :snapshot.downloadURL,
                  uid: uid,
                  writeDate: Date.now(),
                  text: text
                });
              })
            } else {
              noticeRef.push({
                name: name,
                uid: uid,
                writeDate: Date.now(),
                text: text
              });
            }
          }
        }
      }
    },
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
