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
          <span v-if="item.redirect">{{ item.name }}</span>
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
            <el-dropdown-item command="setting">
              <font-awesome-icon icon="fa-solid fa-user" />个人中心
            </el-dropdown-item>
            <el-dropdown-item command="logout" divided>
              <font-awesome-icon icon="fa-solid fa-arrow-right-from-bracket"/>退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

<!--    历史标签栏-->
    <div class="tab-view-container">
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
    let matchedRoutes = this.$route.matched;
    if (matchedRoutes && matchedRoutes[0].name !== '首页') {
      //concat会得到副本
      matchedRoutes = [{path: '/', name: '首页'}].concat(matchedRoutes);
    }
    let index = 0;
    for (let route of matchedRoutes) {
      this.breadcrumbList[index] = {
        name: route.name,
        path: route.path
      }
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
    foldClass() {
      return this.$store.state.collapse ? "el-icon-s-unfold" : "el-icon-s-fold"
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
  }
}
</script>

<style scoped>

</style>