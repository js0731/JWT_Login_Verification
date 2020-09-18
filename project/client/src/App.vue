<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
#app {
  width: 100vw;
  height: 80vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

<script>
import jwt_decode from "jwt-decode";
export default {
  name: "app",
  components: {},
  created() {
    if (localStorage.myToken) {
      const decoded = jwt_decode(localStorage.myToken);
      // 將 token 儲存到 vuex 中
      this.$store.dispatch("setAuthenticated", !this.isEmpty(decoded));
      this.$store.dispatch("setUser", decoded);
    }
  },
  methods: {
    isEmpty(value) {
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