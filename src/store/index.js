import Vue from "vue"
import Vuex from "vuex"
//vuex 刷新网页导致内存中的Vuex.state丢失
import vuexPersistedState from "vuex-persistedstate"

Vue.use(Vuex)

export default new Vuex.Store({
    //全局状态
    state: {
        //路由
        tabList: [
            {name: '首页', path: '/'}
        ],
        //用户Info
        userId: null,
        roles: null,
        userMenuList: [],
        avatar: null,
        nickname: null,
        intro: null,
        webSite: null,
    },
    //同步 commit
    mutations: {
        /**
         * 用户登录，发送/api/login请求后返回UserDetails
         *
         * menu可访菜单另外处理
         * @param state
         * @param userInfo
         */
        login(state, userInfo) {
            state.userId = userInfo.userInfoId
            state.roles = userInfo.roles
            state.avatar = userInfo.avatar
            state.nickname = userInfo.nickname
            state.intro =  userInfo.intro
            state.webSite = userInfo.webSite
        },

        /**
         * 登出后的初始化
         * @param state
         */
        logout(state) {
            state.userId = null;
            state.roles = null;
            state.userMenuList = [];
            state.avatar = null;
            state.nickname = null;
            state.intro = null;
            state.webSite = null;
        },

        /**
         * 保存菜单
         * @param state
         * @param menuList
         */
        saveUserMenuList(state, menuList) {
            state.userMenuList = menuList
        }
    },
    //异步 dispatch
    actions: {

    },
    //插件
    plugins: [
        //vuex-persistedstate插件，可选操作中设置storage为sessionStorage存储方案
        vuexPersistedState({
            storage: window.sessionStorage
        })
    ]
})


