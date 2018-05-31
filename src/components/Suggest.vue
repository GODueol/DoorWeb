<template>

  <div class="container-fluid my-5">
    <h2>제안</h2>

    <ul class="list-group" >
      <li class="list-group-item mb-2 border" v-for="(suggest, index) in suggestList" :class="getBorder(suggest.answerContents)" >
        <div class="row">

          <div class="col-sm-5">

            <div class="row">
              <img v-if="suggest.photo" v-bind:src="suggest.photo"
                   height="200"
                   weight="200"
                   @click="detailImg(suggest.photo)">
            </div>

            <div class="row">
              <label class="col-sm-3">유저이메일</label>
              <div class="col-sm-9">{{suggest.email}}</div>
            </div>

            <div class="row">
              <label class="col-sm-3">수신이메일</label>
              <div class="col-sm-9">{{suggest.recive_email}}</div>
            </div>

            <div class="row">
              <label class="col-sm-3">브랜드</label>
              <div class="col-sm-8">{{suggest.brand}}</div>
            </div>

            <div class="row">
              <label class="col-sm-3">os버전</label>
              <div class="col-sm-8">{{suggest.os}}</div>
            </div>

            <div class="row">
              <label class="col-sm-3">유저id</label>
              <div class="col-sm-8">{{suggest.sendUser}}</div>
            </div>

            <div class="row" v-show="suggest.answerDate">
              <label class="col-sm-3">답변 날짜</label>
              <div class="col-sm-8">{{getDate(suggest.answerDate)}}</div>
            </div>

          </div>
          <div class = "col-sm-7 d-flex flex-column">
            <div class="p-2">
              의견 내용
            </div>
            <div class="border rounded p-2 flex-fill align-self-stretch" style="overflow: auto">
              {{suggest.content}}
            </div>
          </div>

        </div>

        <div class = "row">
          <div class = "col-sm-11 mt-3">
            <textarea class="form-control"
                      placeholder="답을 입력해주세요"
                      v-model="suggest.answerContents"
                      rows="10"
                      cols="50"
            ></textarea>
          </div>
          <div class = "col-sm-1 d-flex align-items-end flex-column mt-3">
            <button type="button" class="btn btn-primary mt-auto" @click="judgment(suggest.recive_email, suggest.answerContents, suggest.uuid)">
              답변하기
            </button>

          </div>
        </div>


        <div class="btn-group pull-right"
             style="font-size: 12px; line-height: 1;">
          <ul>
            <li>
              <div class="input-group" style="margin-bottom:10px;">

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
  import dateUtil from '../helpers/dateUtil'

  const config2 = {
    mailer: {
      service: 'Gmail',
      host: 'localhost',
      port: '465',
      user: 'coreapp0729@gmail.com',
      password: 'zjvlqlswlgk1cmd',
    },
  };
  let db = firebase.database();
  let suggestRef = db.ref('suggestion');
  let storageRef = firebase.storage().ref('notice');
  let sendMailLogsRef = db.ref('sendMailLogs');
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
        suggestList: [],
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

        let obj = {};
        if (data.val().photo != null) {

          firebase.storage().refFromURL(data.val().photo).getDownloadURL().then(function (url) {
            var xhr = new XMLHttpRequest();
            xhr.responseType = 'blob';
            xhr.onload = function (event) {
              var blob = xhr.response;
            };
            xhr.open('GET', url);
            xhr.send();

            obj = {
              brand: data.val().brand,
              email: data.val().email,
              recive_email: data.val().recive_email,
              sendUser: data.val().uuid,
              os: data.val().version,
              content: data.val().content,
              answerDate : data.val().answerDate,
              answerContents : data.val().answerContents,
              uuid: data.key,
              photo: url
            }
          }).catch(function (error) {

          })
        } else {
          obj = {
            brand: data.val().brand,
            email: data.val().email,
            recive_email: data.val().recive_email,
            sendUser: data.val().uuid,
            os: data.val().version,
            content: data.val().content,
            answerDate : data.val().answerDate,
            answerContents : data.val().answerContents,
            uuid: data.key
          }
        }
        if(obj.answerDate) suggestList.push(obj);
        else suggestList.unshift(obj);
      });
    },
    methods: {
      judgment(email, contents, uuid) {
        if (confirm("답변을 하시겠습니까??") === true) {
          // 메일 보내기
          var timestamp = new Date().getTime();

          // DB insert
          sendMailLogsRef.push({
            targetEmail : email,
            writeDate : timestamp,
            contents : contents
          })

          suggestRef.child(uuid).child('answerDate').set(timestamp)
          suggestRef.child(uuid).child('answerContents').set(contents)

        }
      },
      getBorder(answerContents){
        if(answerContents) return "border-success";
        return "border-danger";
      },
      getDate : dateUtil.getDate
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
