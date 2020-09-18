
<template>
  <div>
    <form class="loginForm" action>
      <h1>使用者登入</h1>
      <label for="email">電子郵件</label>
      <input v-model="loginUser.email" type="email" />
      <label for="password.password">密碼</label>
      <input v-model="loginUser.password" type="password" />
      <button @click.prevent="toRegister()">註冊</button>
      <button @click.prevent="submitLoginForm()">登入</button>
    </form>
  </div>
</template>

<style>
.loginForm {
  width: 300px;
  display: flex;
  flex-direction: column;
  padding: 0 20px 40px;
  border: 1px solid black;
}
.loginForm h1 {
  text-align: center;
}
.loginForm label {
  margin: 5px 0;
}
.loginForm input {
  font-size: 18px;
  height: 25px;
  padding-left: 10px;
}
.loginForm button {
  color: white;
  font-size: 18px;
  margin-top: 20px;
  border: none;
  background: #576574;
  border-radius: 5px;
  padding: 5px 0;
}
.loginForm button:hover {
  cursor: pointer;
}
</style>

<script>
import jwt_decode from "jwt-decode";

export default {
  data() {
    return {
      loginUser: {
        email: "",
        password: "",
      },
    };
  },

  methods: {
    submitLoginForm() {
      const loginUserData = this.loginUser;
      this.$axios
        .post("/api/user/login", loginUserData)
        .then((res) => {
          console.log(res);
          // 取出token
          const { token } = res.data;
          // 存儲到 localStorage
          localStorage.setItem("myToken", token);

          const decoded = jwt_decode(token); // 解析token
          console.log(decoded);
          this.$store.dispatch("setAuthenticated", !this.isEmpty(decoded));
          this.$store.dispatch("setUser", decoded);

          this.$router.push("/index");
        })
        .catch((err) => {
          console.log(err);
        });
    },
    toRegister() {
      this.$router.push("/register");
    },

    isEmpty(value) {
      // 空值為true 有值為false
      return (
        value === undefined ||
        value === null ||
        (typeof value === "object" && Object.keys(value).length === 0) ||
        (typeof value === "string" && value.trim().length === 0)
      );
    },
  },
};
</script>
