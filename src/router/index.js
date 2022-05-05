import Vue from "vue"
import VueRouter from "vue-router"

Vue.use(VueRouter)

//路由列表
const routers = [
    {
        path: "/login",
        name: "登录",
        hidden: true,
        component: () => import("../views/login/LoginView.vue")
    },
    {
        //虽然加了就Duplicate named routes definition = =，反正以后也不用addRoutes()了，碍眼就碍眼吧
        path: '/',
        name: "首页",
        component: () => import("@/layout/index")
    }

]

// 防止连续点击多次路由报错
let routerPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
    return routerPush.call(this, location).catch(err => err)
}


const createRouter = () => new VueRouter({
    mode: "history",
    routes: routers
});

const router = createRouter();

/**
 * 重置路由方案：
 * 不再直接export default new VueRouter({config...})
 * 而是将new VueRouter封装为静态自调用函数，当需要重置路由后，
 * 重新new 出路由，将存储routes的matcher替换为初始的matcher
 */
export function resetRouter() {
    const newRouter = createRouter();
    router.matcher = newRouter.matcher;
}

export default router;
