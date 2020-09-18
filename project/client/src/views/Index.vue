<template>
  <div>index</div>
</template>

<style>
</style>

<template>
  <div>
    <button class="btn" @click="getInformation()">驗證token獲取資訊</button>
  </div>
</template>

<style>
.btn {
  color: red;
  padding: 10px;
  border-radius: 5px;
  font-size: 20px;
}
.btn:hover {
  cursor: pointer;
}
.btn:focus {
  outline: none;
}
</style>

<script>
export default {
  methods: {
    getInformation() {
      this.$axios
        .get("/api/user/information")
        .then((res) => {
          console.log(res.data);
        })
        .catch((err) => console.log(err));
    },
  },
};
</script>