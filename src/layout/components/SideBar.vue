<template>
  <div>
    <el-menu
      router
      class="side-nav-bar"
      :collapse="this.$store.state.collapse"
      :default-active="this.$route.path"
      background-color="#304156"
      text-color="#BFCB09"
      active-text-color="#409EFF"
      >
<!--      Vertical mode men，启用router，因此之后的:index都是route路径-->
<!--      https://www.cnblogs.com/tingshengshiyu/p/14113134.html-->

<!--      目录-->
      <template v-for="catalog of this.$store.state.userMenuList">
<!--        名字非null：二级菜单（目前后端返回的特性就是，没有子菜单，则一级目录就没有名字...）-->
        <template v-if="catalog.name && catalog.children && !catalog.hidden">
          <el-submenu :key="catalog.path" :index="catalog.path">
<!--            二级菜单：标题-->
            <template slot="title">
              <i :class="catalog.icon"/>
              <span>{{ catalog.name }}</span>
            </template>
<!--            二级菜单：选项-->
            <template v-for="(menu, index) of catalog.children">
              <el-menu-item v-if="!menu.hidden" :index="menu.path" :key="index">
                <i :class="menu.icon"/>
                <span slot="title"> {{ menu.name }} </span>
              </el-menu-item>
            </template>
          </el-submenu>

        </template>

<!--        名字为null：一级菜单-->
        <template v-else-if="!catalog.hidden">
<!--          直接作为item展示-->
          <el-menu-item :index="catalog.path" :key="catalog.path">
            <i :class="catalog.children[0].icon"/>
            <span slot="title">{{ catalog.children[0].name }}</span>
          </el-menu-item>
        </template>

      </template>
    </el-menu>
  </div>
</template>

<script>
export default {
  name: "SideBar"
}
</script>

<style scoped>
.side-nav-bar:not(.el-menu--collapse) {
  width: 210px;
}
.side-nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  overflow-x: hidden;
  overflow-y: auto;
}
.side-nav-bar i {
  margin-right: 1rem;
}
*::-webkit-scrollbar {
  width: 0.5rem;
  height: 1px;
}
*::-webkit-scrollbar-thumb {
  border-radius: 0.5rem;
  background-color: rgba(144, 147, 153, 0.3);
}
</style>