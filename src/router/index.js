import Vue from "vue"
import VueRouter from "vue-router"

Vue.use(VueRouter)

//路由列表
const routers = [
    {
        path: '/test2',
        name: 'iconfont',
        component: () => import("@/views/test/iconFontVIew")
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
    }

]


export default new VueRouter({
    mode: "history",
    routes: routers
})
