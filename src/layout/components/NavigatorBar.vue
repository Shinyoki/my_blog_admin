<template>
  <div class="top-container">
<!--    导航栏-->
    <div class="nav-bar">

<!--      折叠按钮-->
      <div class="collapse-container" @click="changeCollapse">
        <i :class="foldClass"/>
      </div>

<!--      面包屑-->
      <el-breadcrumb>
        <el-breadcrumb-item
            v-for="(item, index) of breadcrumbList"
            :key="index"
        >
<!--          当该面包屑元素是否具有可重定向内容，来决定选择哪种显示方式-->
          <span v-if="index===1 || item.redirect">{{ item.name }}</span>
          <router-link v-else :to="item.path">{{ item.name }}</router-link>
        </el-breadcrumb-item>
      </el-breadcrumb>

<!--      右侧菜单-->
      <div class="right-menu">
<!--        全屏-->
        <div class="screen-full" @click="changeFullScreen">
          <font-awesome-icon icon="fa-solid fa-magnifying-glass"/>
        </div>
<!--        下拉用户选项：指令事件-->
        <el-dropdown @command="handleCommand">
<!--          用户头像-->
          <el-avatar :size="40" :src="this.$store.state.avatar"/>
<!--          选项菜单-->
          <el-dropdown-menu slot="dropdown">

            <el-dropdown-item command="setting" >
              <span>
                <font-awesome-icon icon="fa-solid fa-user" />
              </span>
              个人中心
            </el-dropdown-item>

            <el-dropdown-item command="logout" divided>
              <span>
                <font-awesome-icon icon="fa-solid fa-arrow-right-from-bracket"/>
              </span>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

<!--    历史标签栏-->
    <div class="tabs-view-container">
<!--      展示添加到state.tablist里的元素-->
      <div class="tabs-wrapper">
<!--        这时候就体现出Vuex里存的tablist路由历史的作用了-->
        <span
          :class="isActive(element)"
          :key="element.path"
          v-for="element of this.$store.state.tabList"
          @click="pushTo(element)"
          >
          {{ element.name }}
          <i
            class="el-icon-close"
            v-if="element.path != '/'"
            @click.stop="removeTab(element)"
          />
        </span>

      </div>
<!--      全部关闭-->
      <div
          class="tabs-close-element"
          style="float: right"
          @click="closeAllTab"
          >
        全部关闭
      </div>
    </div>

  </div>
</template>

<script>
import {resetRouter} from "@/router";

export default {
  name: "NavigatorBar",
  data() {
    return {
      //面包屑
      breadcrumbList: [],
      //是否全屏
      fullscreen: false
    }
  },
  created() {
    /**
     * $route.matched应用在面包屑上
     * 得到的实际是 从父路由到children路由的数组，但是，不包含 {path:"/"}根路由
     * https://blog.csdn.net/mochenangel/article/details/109855840
     */
    //效果：过滤掉name为null的一级标签
    let matchedRoutes = this.$route.matched.filter(item => item.name);
    // console.table(matchedRoutes)
    if (matchedRoutes && matchedRoutes[0].name !== '首页') {
      //concat会得到副本
      matchedRoutes = [{path: '/', name: '首页'}].concat(matchedRoutes);
    }
    for (let index = 0; index < matchedRoutes.length; index++) {
        this.breadcrumbList[index] = {
          name: matchedRoutes[index].name,
          path: matchedRoutes[index].path,
          redirect: matchedRoutes[index].redirect,
        };
    }

    //添加点击过的tabList
    this.$store.commit("addTab", this.$route)
  },
  methods: {
    pushTo(routeElement) {
      this.$router.push({path: routeElement.path})
    },
    removeTab(routeElement) {
      this.$store.commit("removeTab", routeElement);
    },
    closeAllTab() {
      this.$store.commit("resetTabList");
      this.$router.push({path: '/'})
    },
    isActive :function (routeElement) {
      if (routeElement.path == this.$route.path) {
        return "tabs-view-element-active";
      } else {
        return "tabs-view-element";
      }
    },
    changeCollapse() {
      this.$store.commit("changeCollapse")
    },
    handleCommand(command) {
      if (command === "setting") {
        this.$router.push({path: '/setting'})
      }else if (command === "logout") {
        //恢复信息
        this.postRequest("/logout");
        this.$store.commit("resetTabList");
        this.$store.commit("logout");
        //初始化路由
        resetRouter();
        this.$router.push({path: '/login'})
      }
    },
    /**
     * 切换浏览器全屏
     */
    changeFullScreen() {
      let element = document.documentElement;
      if (this.fullscreen) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      } else {
        if (element.requestFullscreen) {
          element.requestFullscreen();
        } else if (element.webkitRequestFullScreen) {
          element.webkitRequestFullScreen();
        } else if (element.mozRequestFullScreen) {
          element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
          element.msRequestFullscreen();
        }
      }
      this.fullscreen = !this.fullscreen;
    }
  },
  computed: {
    foldClass() {
      return this.$store.state.collapse ? "el-icon-s-unfold" : "el-icon-s-fold"
    }
  }
}
</script>

<style lang="less" scoped>
.top-container{
  //上层导航栏
  .nav-bar{
    display: flex;
    align-items: center;

    padding-left: 15px;
    padding-right: 30px;

    height: 50px;

    box-shadow: 0 1px 4px rgba(0, 21, 41, .08);

    //折叠按钮
    .collapse-container{
      font-size: 1.25rem;
      cursor: pointer;
      margin-right: 24px;
    }

    //右侧菜单
    .right-menu {
      margin-left: auto;
      display: flex;
      align-items: center;

      //全屏
      .screen-full{
        cursor: pointer;
        margin-right: 1rem;
        font-size: 1.1rem;
      }

    }

  }

  //历史标签栏
  .tabs-view-container {
    display: flex;
    padding-left: 2vh;
    padding-right: 2vh;
    height: 33px;
    border-bottom: 1px solid #d8dce5;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .12),
    0 0 3px 0 rgba(0, 0, 0, .04);

    position: relative;

    //历史标签
    .tabs-wrapper{
      width: 90%;
      overflow-y: hidden;
      overflow-x: auto;

      //未激活样式
      .tabs-view-element {
        display: inline-block;
        height: 26px;
        cursor: pointer;
        line-height: 26px;
        padding: 0 8px;
        font-size: 1rem;
        margin-top: 4px;
        margin-left: 5px;

        background-color: #fff;
        color: #495060;
        border: solid 1px #d8dce5;
        border-radius: 10%;

        transition:.4s .4s ease-in-out;

        &:hover{
          background-color: #2299dd;
        }
      }

      //已激活样式
      .tabs-view-element-active {
        //复制
        display: inline-block;
        height: 26px;
        line-height: 26px;
        cursor: pointer;
        padding: 0 8px;
        font-size: 1rem;
        margin-top: 4px;
        margin-left: 5px;

        background-color: #42b983;
        color: #fff;
        border: solid 1px #3ebb34;
        border-radius: 10%;

        transition: .4s .4s ease-in-out;
      }


    }

    //全部关闭
    .tabs-close-element {
      position: absolute;
      right: 10px;
      height: 25px;
      line-height: 25px;

      border: solid 1px #d8dce5;
      color: #495060;
      background-color: #ffffff;
      cursor: pointer;
      border-radius: 10%;

      padding: 0 8px;
      font-size: .9rem;
      margin-top: 4px;
      margin-left: 5px;

      transition: .4s .4s ease-in-out;

      &:hover{
        background-color: red;
      }
    }
  }
}
//可能存在的滑动栏
*::-webkit-scrollbar {
  width: 0.5rem;
  height: 6px;
}
*::-webkit-scrollbar-thumb {
  border-radius: 0.5rem;
  background-color: rgba(144, 147, 153, 0.3);
}

</style>