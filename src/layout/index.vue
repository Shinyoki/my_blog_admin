<template>
<!--  //TODO 布局页-->

<!--  饿了么顶层容器-->
  <el-container>

<!--    侧边栏：左-->
    <el-aside style="width: auto;">
      <div>
        <SideBar/>
      </div>
    </el-aside>

<!--    右边的实际内容容器-->
    <el-container :class="'main-container ' + isHidden">

  <!--      header-->
      <el-header style="background-color: #4d84e2; height: 84px; padding: 0">
          导航栏
      </el-header>

<!--      components-->
      <el-main style="background-color: yellow">
        <div onauxclick="fade-transform-box">
          <transition name="fade-transform" mode="out-in">
            <router-view :key="$route.fullPath" />
          </transition>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import SideBar from "@/layout/components/SideBar";

export default {
  name: "IndexView",
  components: {SideBar},
  data() {
    return {
      isHidden: this.$store.state.collapse ? "hide" : ""
    }
  }
}
</script>

<style lang="less" scoped>
.main-container {
  margin-left: 210px;
  min-height: 100vh;

  transition: margin-left .45s;

  &.hide{
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