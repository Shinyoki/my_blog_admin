import Vue from 'vue'
import App from './App.vue'
//element js & css
import ElementUI from "element-ui"
import "element-ui/lib/theme-chalk/index.css"
//axios & plugin
import Axios from "axios"
import VueAxios from "vue-axios";
//Vue router
import router from "./router"
//加载进度条 js & css
import NProgress from "nprogress"
import "nprogress/nprogress.css"
import "./assets/css/my_nprogress.css"
//vue-calender-heatmap 模仿github热点图
import VueCalenderHeatmap from "vue-calendar-heatmap"
import "vue-calendar-heatmap/dist/vue-calendar-heatmap.css"
//VueEcharts组件 & js resources
import VueEcharts from "vue-echarts"
import "echarts/lib/chart/line"
import "echarts/lib/chart/pie"
import "echarts/lib/chart/bar"
import "echarts/lib/chart/map"
import "echarts/lib/component/tooltip"
import "echarts/lib/component/legend"
import "echarts/lib/component/title"
//Vuex
import store from "./store/index"

/**
 * 进度条渲染逻辑
 *
 * 页面跳转 和 请求发起与响应
 * 时都进行进度加载
 */
router.beforeEach((to, from, next) => {
  NProgress.start()

  if (to.path == "/login") {
    //防止进入"/login"无限循环
    next();
  } else if (store.state.userId == null) {
    next({path: "/login"});
  } else {
    next();
  }
  next();
})
router.afterEach(() => {
  changeNPColor("green")
  NProgress.done()
});
NProgress.configure({
  //配置
  easing: "ease",       //缓入缓出 a CSS easing string
  speed: 500,           //速度    ms
  showSpinner: false,    //加载ICON
  trickleSpeed: 200,    //自动递增间隔 trickle: true默认为true自动递增
  minimum: 0.3          //初始化时进度
})
function changeNPColor(color) {
  document.getElementsByClassName('bar')[0].style.setProperty("background", color)
}

/**
 * Axios拦截器
 */
Axios.interceptors.request.use(
    config => {
      NProgress.start();
      return config;
    },
    error => {
      changeNPColor("red");
      console.log(error)
      return Promise.reject(error);
    }
)
Axios.interceptors.response.use(function (response) {
  changeNPColor("green")
  NProgress.done()
  return response;
}, function (error) {
  changeNPColor("red")
  NProgress.done()
  console.log(error)
  return Promise.reject(error);
});
Vue.config.productionTip = false

//安装组件
Vue.use(ElementUI)
Vue.use(VueAxios, Axios)
Vue.use(VueCalenderHeatmap)
//给VueEcharts组件改个名
Vue.component("v-chart", VueEcharts)

new Vue({
  //this.$router
  router,
  //this.$store
  store,
  render: h => h(App)
}).$mount('#app')
