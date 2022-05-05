import Vue from "vue"
import Vuex from "vuex"
//vuex 刷新网页导致内存中的Vuex.state丢失
import vuexPersistedState from "vuex-persistedstate"

Vue.use(Vuex)

export default new Vuex.Store({
    //全局状态
    state: {
        //路由历史
        tabList: [
            {name: '首页', path: '/'}
        ],
        //用户Info
        userId: null,
        roles: null,
        avatar: null,
        nickname: null,
        intro: null,
        webSite: null,
        //可访菜单
        userMenuList: [],
        //是否折叠隐藏
        collapse: false
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
        },

        /**
         * 切换侧边栏是否折叠状态
         * @param state
         */
        changeCollapse(state) {
            state.collapse = !state.collapse;
        },

        /**
         * 删除点击侧边栏元素后位于头部导航栏处生成的历史标签
         * @param state
         * @param routeElement  element of Tablist
         */
        removeTab(state, routeElement) {
            let index = state.tabList.findIndex(item => item.name == routeElement.name);
            state.tabList.splice(index, 1);
        },

        /**
         * 重置到只有首页的路由历史状态
         * @param state
         */
        resetTabList(state) {
            state.tabList = [{name: '首页', path: '/'}];
        },

        /**
         * 添加新的路由
         * @param state
         * @param curRoute
         */
        addTab(state, curRoute) {
            //找不到路由，就添加
            if (-1 === state.tabList.findIndex(element => element.name === curRoute.name)) {
                state.tabList.push({
                    name: curRoute.name,
                    path: curRoute.path
                })
            }
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


