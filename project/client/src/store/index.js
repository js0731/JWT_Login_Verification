import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
  isAuthenticated: false,  // 是否授權
  user: {}  // 用戶資訊
}

const getters = {
  isAuthenticated: state => state.isAuthenticated,
  user: state => state.user
}

const mutations = {
  SET_AUTHENTICATED(state, isAuthenticated) {
    if (isAuthenticated) state.isAuthenticated = isAuthenticated
    else state.isAuthenticated = false
  },
  SET_USER(state, user) {
    if (user) state.user = user
    else state.user = {}
  }
}

const actions = {
  setAuthenticated: ({ commit }, isAuthenticated) => {
    commit('SET_AUTHENTICATED', isAuthenticated)
  },
  setUser: ({ commit }, user) => {
    commit('SET_USER', user)
  }
}

export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions
})