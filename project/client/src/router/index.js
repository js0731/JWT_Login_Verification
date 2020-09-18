import Vue from 'vue'
import VueRouter from 'vue-router'
import Register from '../views/Register'
import Login from '../views/Login'
import Index from '../views/Index'
import User from '../views/User'

Vue.use(VueRouter)


const routes = [
  { path: '/register', name: 'register', component: Register },
  { path: '/login', name: 'login', component: Login },
  { path: '/index', name: 'index', component: Index },
  { path: '/user', name: 'user', component: User },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// to: 即將要進入的路由 from : 當前要離開的路由。 next(去哪的路由)
router.beforeEach((to, from, next) => {
  const isLogin = localStorage.myToken ? true : false; //查看localStorage token 是否存在
  if (to.path === '/login' || to.path === '/register') { // "/login"、"/register" 一律放行這兩個路由
    next();
  } else {
    isLogin ? next() : next('/login') // 如果 localStorage token 不存在則導入/login頁面，存在則放行。
  }
})

export default router