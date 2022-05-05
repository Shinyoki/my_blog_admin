<template>
  <div>
    <el-menu
        router
        class="side-nav-bar"
        :collapse="this.$store.state.collapse"
        :default-active="this.$route.fullPath"
        background-color="#304156"
        text-color="rgba(255,255,255,0.6)"
        active-text-color="#BFCB09"
    >

<!--      for循环生成模板：被遍历元素是目录，-->
      <template v-for="catalog of this.$store.state.userMenuList">

<!--        根据目录是否没名字判断是一级菜单还是二级菜单（目前后端返回的特性就是，没有子菜单，则一级目录就没有名字...）-->
        <template v-if="catalog.name == null && catalog.hidden != true">
<!--          一级菜单渲染：此时只渲染menu-item即可-->
          <el-menu-item :index="catalog.path" :key="catalog.path">
            <i :class="catalog.children[0].icon"/>
            <span slot="title">{{ catalog.children[0].name }}</span>
          </el-menu-item>
        </template>
        <template v-else-if="catalog.name != null && catalog.children != null && catalog.hidden != true">
<!--          二级菜单渲染-->
          <!--          一级标签:el-submenu -->
          <el-submenu :index="catalog.path" :key="catalog.path">
            <!--            标题单元：template slot=title-->
            <template slot="title">
              <i :class="catalog.icon"/>
              <span>{{ catalog.name }}</span>
            </template>
            <!--            子菜单选项：v-for catalog.children-->
            <template v-for="(menu, index) of catalog.children">
              <!--              二级菜单：el-menu-item--->
              <el-menu-item :index="menu.path" :key="index" v-if="!menu.hidden">
                <i :class="menu.icon" />
                <span slot="title">{{ menu.name }}</span>
              </el-menu-item>
            </template>
          </el-submenu>

        </template>

      </template>


    </el-menu>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isCollapse: true
    };
  },
  methods: {
    changeState() {
      document.getElementsByClassName("")
    }
  }

}
</script>

<style lang="less" scoped>
.side-nav-bar:not(.el-menu--collapse) {
  width: 210px;
}

.side-nav-bar{
  border: none;
  box-shadow: 4px 0px 2px  rgba(0,0,0,0.2);

  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  overflow-y: auto;


  i {
    margin-right: 1rem;
  }
}
//滑动栏
*::-webkit-scrollbar {
  width: 0.5rem;
  height: 1px;
}
*::-webkit-scrollbar-thumb {
  border-radius: 0.5rem;
  background-color: rgba(144, 147, 153, 0.3);
}
</style>