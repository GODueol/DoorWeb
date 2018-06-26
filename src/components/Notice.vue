<template>

  <div class="container my-5">

    <h2>공지</h2>

    <!-- Button trigger modal -->
    <div class="row justify-content-end">
      <p>
      <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#noticeWriteModal">
        공지 작성
      </button>
      </p>
    </div>

    <div class="row">

    <ul class="list-group">
      <li class="list-group-item" v-for="(notice, index) in notices">
        <h4>{{notice.title}}</h4>
        <div> {{new Date(notice.writeDate)}} </div>
        <div> {{notice.name}} </div>
        <span>
        <img v-if="notice.pictureUrl" v-bind:src="notice.pictureUrl"
             height="200"
             weight="200"
             @click="detailImg(notice.pictureUrl)">
          </span>
        {{notice.text}}
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

    <!-- Modal -->
    <div class="modal fade" id="noticeWriteModal" tabindex="-1" role="dialog" aria-labelledby="noticeWriteModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="noticeWriteModalLabel">공지 작성</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="container-fluid">

              <div class="row">
                <div class="form-group col">
                  <!--<label class="form-control-label" for="formGroupExampleInput">Example label</label>-->
                  <input type="text" class="form-control" id="formGroupExampleInput" placeholder="제목을 입력하세요" v-model="title">
                </div>
              </div>

              <div class="row">
                <div class="form-group col">
                  <!--<label for="exampleFormControlTextarea1">Example textarea</label>-->
                  <textarea class="form-control" id="exampleFormControlTextarea1" placeholder="내용을 입력하세요" rows="10"
                            v-model="text"></textarea>
                </div>
              </div>

              <div class="row">
                <div class="col">
                  <input type="file"
                         id="image"
                         accept=".jpg, .jpeg, .png"
                         multiple>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">취소</button>
            <button type="button" class="btn btn-primary" @click="createTodo(title, text)"> 공지 등록 </button>
          </div>
        </div>
      </div>
    </div>
  </div>


</template>


<script>
  import firebase from 'firebase'
  import 'bootstrap'
  import $ from 'jquery'
  import cu from '../helpers/commonUtil'

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
        title : "",
        text : "",
        user: {},
        notices: []
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
      let notices = this.notices;
      noticeRef.on('value', snapshot => {
          notices.splice(0);
          snapshot.forEach(childSnapshot => {
            const obj = childSnapshot.val();
            obj['noticekey'] = childSnapshot.key;
            notices.unshift(obj);
          });
      });
    },
    methods: {
      deleteTodo(i) {
        if (confirm("정말 공지를 삭제하시겠습니까?") === true) {
          // 데이터 삭제
          noticeRef.child(this.notices[i].noticekey).remove();
          // 사진 삭제
          firebase.storage().refFromURL(this.notices[i].pictureUrl).delete();
        }
      },
      createTodo(title, text) {
        if(!title){
          alert("제목을 입력하세요");
          return;
        }
        if (!text) {
          alert("내용을 입력하세요");
          return;
        }

        if (confirm("정말 공지를 등록하시겠습니까?") === true) {

          let name = this.name
          let uid = this.userId
          let selectedFile = document.getElementById('image').files[0];

          let key = noticeRef.push({
            name: name,
            uid: uid,
            writeDate: Date.now(),
            text: text,
            title : title
          }).key;

          if (selectedFile != null) {
            storageRef.child(key).put(selectedFile).then(function (snapshot) {
              noticeRef.child(key).child("pictureUrl").set(snapshot.downloadURL);
            })
          }

          this.title = this.text = "";

          $('#noticeWriteModal').modal('hide');
        }
      },
      detailImg : cu.detailImg
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
