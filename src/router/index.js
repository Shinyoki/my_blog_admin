import Vue from "vue"
import VueRouter from "vue-router"

Vue.use(VueRouter)

//路由列表
const routers = [
    {
      path: "/",
      name: "首页",
      component: () => import("@/App")
    },
    {
      path: '/test1',
        name: '测试页面',
        component: () => import("@/views/test/TestProxy")
    },
    {
        path: "/login",
        name: "登录",
        hidden: true,
        component: () => import("../views/login/LoginView.vue")
    },
    {
        //应置于数组最低端
        path: "*",
        name: "资源不存在",
        component: () => import("@/views/error/404/404View")
    }
]


export default new VueRouter({
    mode: "history",
    routes: routers
})
