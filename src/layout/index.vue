<template>

<!--  饿了么顶层容器-->
  <el-container>

<!--    侧边栏：左-->
    <el-aside style="width: auto;">
      <div>
        <MySidebar/>
      </div>
    </el-aside>

<!--    右边的实际内容容器-->
    <el-container :class="'main-container ' + isHidden">

  <!--      header-->
      <el-header style=" height: auto; padding: 0">
<!--        key 属性的另一种用法：触发组件的强制重新渲染-->
<!--        https://juejin.cn/post/6844903976245166088-->
          <NavigatorBar :key="this.$route.fullPath"/>
      </el-header>

<!--      components-->
      <el-main >
        <div onauxclick="fade-transform-box">
          <transition  name="fade-transform" mode="out-in">
            <router-view  :key="$route.fullPath"/>
          </transition>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import MySidebar from "@/layout/components/MySidebar";
import NavigatorBar from "@/layout/components/NavigatorBar";
export default {
  name: "IndexView",
  components: {NavigatorBar, MySidebar },
  created() {
    console.log(this.$router.getRoutes())
  },

  computed: {
    isHidden: function () {
      //将this.$store.state.collapse ?简单的放在data() method中无法实时动态地监听到this.$store.state.collapse的变化
      //需要使用computed
      return this.$store.state.collapse ? "hide" : ""
    }
  },
  methods: {
    changeState() {
      this.$store.state.collapse = !this.$store.state.collapse
    }
  },
}
</script>

<style lang="less" scoped>
.main-container {
  //侧边栏fixed，文档流位置就变了，于是main-container向右移侧边栏的距离
  margin-left: 210px;
  min-height: 100vh;

  transition: margin-left .45s;

  &.hide{
    //切换收缩状态还会改变该class
    margin-left: 64px;
  }

  .fade-transform-box{
    position: relative;
    top: 0;
    width: 100%;
    overflow: hidden;
  }
}
</style>