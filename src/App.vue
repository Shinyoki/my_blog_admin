<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import {initMenus} from "@/utils/menu";

export default {
  name: 'App',
  created() {
    //默认没用 router.route ==> {path: '/', component: xxx首页}，是通过后来的addRoute添加的
    //貌似Vue Router和Vuex都有刷新缓存失效的问题
    //前端这块不是很懂，以后有问题再研究吧，这个博客的动态路由方案也不太合适，以后得重构
    if (this.$store.state.userId != null) {
      initMenus()
    }
  }
}
</script>


