//请求
import {getRequest} from "@/utils/axios-apis";
//引入布局页
import Layout from "@/layout/index"
//全局状态
import vuex from "@/store/index"
//路由
import router from "@/router/index"

export function initMenus() {
    // getRequest("/admin/user/menus").then(res=>{
    getRequest("/menus/user/list").then(res=>{
        if (res) {
            let userMenus = res.data.data;
            console.log("得到结果：");
            console.log(userMenus);
            //第一层元素都是目录，children都是菜单
            userMenus.forEach(curCatalog => {
                //目录

                //设置目录图标
                if (curCatalog.icon != null) {
                    //阿里巴巴iconfont
                    curCatalog.icon = "iconfont " + curCatalog.icon;
                }
                //绑定目录到layout组件，从单纯的路径到Layout对象
                curCatalog.component = Layout;
                //绑定目录下子菜单的路由
                if (curCatalog.children && curCatalog.children.length > 0) {
                    curCatalog.children.forEach(curMenu => {
                        curMenu.icon = "iconfont " + curMenu.icon;

                        //将对应component的路径require，得到对应的Vue模组
                        curMenu.component = generateComponentView(curMenu.component)
                    })
                }
            });

            //记录组件信息加载到全局状态vuex中
            vuex.commit("saveUserMenuList", userMenus);
            //更新router
            router.addRoutes(userMenus);

            router.addRoute({
                //应置于数组最低端
                path: "*",
                name: "资源不存在",
                component: () => import("@/views/error/404/404View")
            });
        }
    })
}


/**
 * https://www.cnblogs.com/chenxi188/p/13947891.html
 * require是运行时调用，所以require理论上可以运用在代码的任何地方
 * import是编译时调用，所以必须放在文件开头
 * 本质
 * require是赋值过程，其实require的结果就是对象、数字、字符串、函数等，再把require的结果赋值给某个变量
 * import是解构过程，但是目前所有的引擎都还没有实现import，我们在node中使用babel支持ES6，也仅仅是将ES6转码为ES5再执行，import语法会被转码为require
 */
export const generateComponentView = component => {
    return resolve => require([`@/views${component}.vue`], resolve);
}
