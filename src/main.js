import Vue from 'vue'
import App from './App.vue'
//element js & css
import ElementUI, {Message} from "element-ui"
import "element-ui/lib/theme-chalk/index.css"
//axios & plugin
import Axios from "axios"
import VueAxios from "vue-axios";
//custom axios utils
import { getRequest, postRequest, putRequest, deleteRequest} from "@/utils/axios-apis";
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
import "echarts/lib/chart/line" //lib:折线、饼图、、、 js绘制资源
import "echarts/lib/chart/pie"
import "echarts/lib/chart/bar"
import "echarts/lib/chart/map"
import "echarts/lib/component/tooltip" //lib:悬浮面板、图例、标题组件
import "echarts/lib/component/legend"
import "echarts/lib/component/title"
//Vuex
import store from "./store/index"
/**
 * font-awesome 引入libraries存储库
 * https://blog.csdn.net/zyj362633491/article/details/86422353
 */
import { library } from '@fortawesome/fontawesome-svg-core'
//引入所有免费fas图标和部分商标
import { fas } from '@fortawesome/free-solid-svg-icons'
import { faQq, faWeibo, faWeixin } from '@fortawesome/free-brands-svg-icons'
//引入vueFontAwesome
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
//添加所有fas图标到所需库中
library.add(fas, faQq, faWeibo, faWeixin)
//引入阿里巴巴的iconfont：项目自定义了前缀是el-icon-，定义字体名称为iconfont
import "@/assets/css/iconfont/iconfont.css"
import "@/assets/css/iconfont/iconfont"
//静态配置
import config from "@/assets/js/config"


/**
 * 进度条渲染逻辑
 *
 * 页面跳转 和 请求发起与响应
 * 时都进行进度加载
 */
router.beforeEach((to, from, next) => {
  NProgress.start()
  document.title = to.name

  if (to.path == "/login") {
    //防止进入"/login"无限循环
    next();
  } else if (store.state.userId == null) {
    next({path: "/login"});
  } else {
    next();
  }
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

function errorRedirect(code) {
  if (code === 401) {
    router.push({name: '登录'})
  }else if (code === 404) {
    router.push({name: '资源不存在'})
  }
}
Axios.interceptors.response.use(function (response) {
  //后端将所有的rest请求都转为json字符串，基本上得到的都是200响应码，因此要拦截处理自定义的响应码
  if (response.data.flag) {
    //true 成功 原样返回response
  } else {
    //false 失败
    errorRedirect(response.data.code)
    Message({
      dangerouslyUseHTMLString: true,
      message: `<strong style="color: red">触发错误：</strong><br/><div>${response.data.message}</div>`
    })

  }
  changeNPColor("green");
  NProgress.done()

  return response;
}, function (error) {
  errorRedirect(error.status)
  changeNPColor("red")
  NProgress.done()
  Message.error("触发" + error.status + "错误")
  return Promise.reject(error);
});

Vue.config.productionTip = false

// 组件内引用外部script
Vue.component('remote-script', {
  render: function (createElement) {
    var self = this;
    return createElement('script', {
      attrs: {
        type: 'text/javascript',
        src: this.src
      },
      on: {
        load: function (event) {
          self.$emit('load', event);
        },
        error: function (event) {
          self.$emit('error', event);
        },
        readystatechange: function (event) {
          if (this.readyState == 'complete') {
            self.$emit('load', event);
          }
        }
      }
    });
  },
  props: {
    src: {
      type: String,
      required: true
    }
  }
});


//安装组件
Vue.use(ElementUI)
Vue.use(VueAxios, Axios)
Vue.use(VueCalenderHeatmap)
//给VueEcharts组件改个名
Vue.component("v-chart", VueEcharts)
//弄几个全局函数
Vue.prototype.getRequest = getRequest;
Vue.prototype.postRequest = postRequest;
Vue.prototype.deleteRequest = deleteRequest;
Vue.prototype.putRequest = putRequest;
//组件注册
Vue.component("font-awesome-icon", FontAwesomeIcon)
//自定义配置
Vue.prototype.config = config

new Vue({
  //this.$router
  router,
  //this.$store
  store,
  render: h => h(App)
}).$mount('#app')
