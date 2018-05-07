<template>

  <div class="container my-5">

    <h2>공지</h2>

    <div class="input-group" style="margin-bottom:10px;">
      <input type="text" class="form-control"
             placeholder="제목을 입력하세요"
             v-model="title">
      <input type="text" class="form-control"
             placeholder="내용을 입력하세요"
             v-model="text"
             v-on:keyup.enter="createTodo(title, text)">
      <input type="file"
             id="image"
             accept=".jpg, .jpeg, .png"
             multiple>
      <span class="input-group-btn">
		<button class="btn btn-default" type="button"
            @click="createTodo(title, text)">추가</button>
	</span>
    </div>
    <ul class="list-group">
      <li class="list-group-item" v-for="(todo, index) in todos">
        <span>
        <img v-if="todo.pictureUrl" v-bind:src="todo.pictureUrl"
             height="200"
             weight="200"
             @click="detailImg(todo.pictureUrl)">
          </span>
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
  import 'bootstrap'

  let db = firebase.database();
  let noticeRef = db.ref('notice');
  let storageRef = firebase.storage().ref('notice');
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
      let todos = this.todos;
      noticeRef.on('child_added', function (data) {

        if (data.val().pictureUrl != null) {

          firebase.storage().refFromURL(data.val().pictureUrl).getDownloadURL().then(function (url) {
            var xhr = new XMLHttpRequest();
            xhr.responseType = 'blob';
            xhr.onload = function (event) {
              var blob = xhr.response;
            };
            xhr.open('GET', url);
            xhr.send();

            // Or inserted into an <img> element:
            //var img = document.getElementById('listimage');
            //img.src = url;

            todos.unshift({name: data.val().text, userId: data.val().uid, noticekey: data.key, pictureUrl: url})
          }).catch(function (error) {

          })
        } else {
          todos.unshift({name: data.val().text, userId: data.val().uid, noticekey: data.key})
        }
      });
    },
    methods: {
      deleteTodo(i) {
        if (confirm("정말 공지를 삭제하시겠습니까?") === true) {
          noticeRef.child(this.todos[i].noticekey).remove()
          this.todos.splice(0, 1)

        }
      },
      createTodo(title, text) {
        if(title == null){
          alert("제목을 입력하세요")
        }
        if (text == null) {
          alert("내용을 입력하세요")
        }

        if (confirm("정말 공지를 등록하시겠습니까?") === true) {

          let name = this.name
          let uid = this.userId
          let selectedFile = document.getElementById('image').files[0]
          if (selectedFile != null) {
            storageRef.child(selectedFile.name).put(selectedFile).then(function (snapshot) {

              noticeRef.push({
                name: name,
                pictureUrl: snapshot.downloadURL,
                uid: uid,
                writeDate: Date.now(),
                text: text,
                title : title
              });
            })
          } else {
            noticeRef.push({
              name: name,
              uid: uid,
              writeDate: Date.now(),
              text: text,
              title : title
            });
          }
        }
      },
      detailImg(url) {
        console.log("dsadsad")
        let img1 = new Image();
        img1.src = (url);
        if ((img1.width != 0) && (img1.height != 0)) {
          let W = img1.width;
          let H = img1.height;
          let O = "width=" + W + ",height=" + H + ",scrollbars=yes";
          let imgWin = window.open("", "", O);
          imgWin.document.write("<html><head><title>:*:*:*: 이미지상세보기 :*:*:*:*:*:*:</title></head>");
          imgWin.document.write("<body topmargin=0 leftmargin=0>");
          imgWin.document.write("<img src=" + url + " onclick='self.close()' style='cursor:pointer;' title ='클릭하시면 창이 닫힙니다.'>");
          imgWin.document.close();

        }
        else {
          let controller = "imgControll('" + url + "')";
          intervalID = setTimeout(controller, 20);
        }
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

  span {
    display: block
  }

  li {
    margin: 0 10px;
  }

  a {
    color: #42b983;
  }
</style>
