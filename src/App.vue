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
    if (this.$store.state.userId != null) {
      initMenus()
    }
  }
}
</script>


