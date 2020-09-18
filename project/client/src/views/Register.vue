<template>
  <form class="reigsterForm" action>
    <h1>使用者註冊</h1>
    <label for="name">姓名</label>
    <input v-model="registerUser.name" type="text" />
    <label for="account">帳號</label>
    <input v-model="registerUser.email" type="email" />
    <label for="password">密碼</label>
    <input v-model="registerUser.password" type="password" />
    <!-- form下的button 在沒有明確的給出type型別時，預設值為type=”submit”
    如果該按鈕的作用不是為了提交表單的話，加上type屬性或是@click.prevent取消預設方法就行了設方法就行了-->
    <button @click.prevent="submitRegisterForm()">註冊</button>
    <button @click.prevent="toLogin()">登入</button>
  </form>
</template>

<style>
.reigsterForm {
  width: 300px;
  display: flex;
  flex-direction: column;
  padding: 0 20px 40px;
  border: 1px solid black;
}
.reigsterForm h1 {
  text-align: center;
}
.reigsterForm label {
  margin: 5px 0;
}
.reigsterForm input {
  font-size: 18px;
  height: 25px;
  padding-left: 10px;
}

.reigsterForm button {
  color: white;
  font-size: 18px;
  margin-top: 20px;
  border: none;
  background: #576574;
  border-radius: 5px;
  padding: 5px 0;
}
.reigsterForm button:hover {
  cursor: pointer;
}
</style>

<script>
export default {
  data() {
    return {
      registerUser: {
        name: "",
        email: "",
        password: "",
      },
    };
  },
  methods: {
    submitRegisterForm() {
      const registerUserData = this.registerUser;
      this.$axios
        .post("/api/user/register", registerUserData) // 跨域路由加上'/api'
        .then((res) => {
          console.log(res);
          this.$router.push("/login");
        })
        .catch((err) => {
          console.log(err);
        });
    },
    toLogin() {
      this.$router.push("/login");
    },
  },
};
</script>