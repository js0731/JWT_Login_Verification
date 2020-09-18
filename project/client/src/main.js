import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios';

//請求發送攔截，把資料發送给後端之前做些什麼......
axios.interceptors.request.use(config => {
  if (localStorage.myToken) { // 如果token存在
    config.headers.Authorization = localStorage.myToken; // 在http header都加上 token
  }
  return config
}, error => {
  return Promise.reject(error)
})

//請求返回攔截，把資料返回到頁面之前做些什麼...
axios.interceptors.response.use(response => {
  return response
}, err => {
  const { status } = err.response;
  if (status === 401) { // 用戶未認證
    console.log('token無效，請重新登錄');
    localStorage.removeItem('myToken');  // 清除token
    router.push('/login');
  }
  return Promise.reject(err)
})

Vue.config.productionTip = false
Vue.prototype.$axios = axios // 透過JS的prototype將自行定義的方法/物件直接掛上Vue的實體上，這樣在每個Vue組件中都可取用。

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
