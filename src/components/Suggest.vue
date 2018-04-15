<template>

  <div class="container">
    <h2>{{userId}}</h2>

    <ul class="list-group">
      <li class="list-group-item" v-for="(suggest, index) in suggestList">
        <span>
        <img v-if="suggest.photo" v-bind:src="suggest.photo"
             height="200"
             weight="200"
             @click="detailImg(suggest.photo)">
          </span>
        <span> ● &nbsp; 유저이메일 : {{suggest.email}}</span>
        <span> ● &nbsp; 수신이메일 : {{suggest.recive_email}}</span>
        <span> ● &nbsp; 브랜드 : {{suggest.brand}}</span>
        <span> ● &nbsp; os버전 : {{suggest.os}}</span>
        <span> ● &nbsp; 유저id : {{suggest.sendUser}}</span>
        <span> ● &nbsp; 내용 : {{suggest.content}}</span>
        <div class="btn-group pull-right"
             style="font-size: 12px; line-height: 1;">
          <ul>
            <li>
              <div class="input-group" style="margin-bottom:10px;">
                <textarea class="form-control"
                       placeholder="내용을 입력해주세요"
                       v-model="text"
                       v-on:keyup.enter="createTodo(text)"
                          rows="10"
                          cols="50"
                ></textarea>
                  <span class="input-group-btn">
                    <button class="btn btn-default" type="button"
                            @click="judgment(suggest.recive_email)">답변하기</button>
              	  </span>
              </div>
            </li>
          </ul>
        </div>
      </li>
    </ul>
  </div>


</template>


<script>
  import firebase from 'firebase'

  let db = firebase.database();
  let suggestRef = db.ref('suggestion');
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
        suggestList: []
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
      let suggestList = this.suggestList;
      suggestRef.on('child_added', function (data) {

        if (data.val().photo != null) {

          firebase.storage().refFromURL(data.val().photo).getDownloadURL().then(function (url) {
            var xhr = new XMLHttpRequest();
            xhr.responseType = 'blob';
            xhr.onload = function (event) {
              var blob = xhr.response;
            };
            xhr.open('GET', url);
            xhr.send();

            suggestList.unshift({
              brand: data.val().brand,
              email: data.val().email,
              recive_email: data.val().recive_email,
              sendUser: data.val().uuid,
              os: data.val().version,
              content: data.val().content,
              photo: url
            })
          }).catch(function (error) {

          })
        } else {
          suggestList.unshift({
            brand: data.val().brand,
            email: data.val().email,
            recive_email: data.val().recive_email,
            sendUser: data.val().uuid,
            os: data.val().version,
            content: data.val().content
          })
        }
      });
    },
    methods: {
      judgment(email) {
        if (confirm("답변을 하시겠습니까??") === true) {
          //suggestRef.child(this.suggestList[i].noticekey).remove()
          //this.suggestList.splice(0, 1)
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
    display: block;
    text-align: left;
    margin-left: 30px
  }

  li {
    margin: 0 10px;
  }

  a {
    color: #42b983;
  }
</style>
