<template>

  <div class="container">
    <h2>Todo List</h2>
    <div class="input-group" style="margin-bottom:10px;">
      <input type="text" class="form-control"
             placeholder="할일을 입력하세요"
             v-model="name"
             v-on:keyup.enter="createTodo(name)">
      <span class="input-group-btn">
		<button class="btn btn-default" type="button"
            @click="createTodo(name)">추가</button>
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

  export default {
    name: 'Notice',
    methods:{
      deleteTodo(i){
        this.todos.splice(0,1);
      },
      createTodo(name){
        if(name != null){
          this.todos.push({name:name});
          this.name = null
        }
      }
    },
    data() {
      return {
        msg: 'Welcome to Your Vue.js App',
        todos: [
          {
            name: '청소'
          },
          {
            name: '블로그 쓰기'
          },
          {
            name: '밥먹기'
          },
          {
            name: '안녕'
          }
        ]
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
