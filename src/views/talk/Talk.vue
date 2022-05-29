<template>
  <el-card class="main-card">
    <div class="card-container-title">{{ this.$route.name }}</div>
    👶
  </el-card>
</template>

<script>
  export default {
    // eslint-disable-next-line vue/multi-word-component-names
    name: 'Talk',
    created() {

    },
    data() {
      return {
        //request
        talkForm: {
          id: null,
          content: "",
          isTop: 0,
          status: 1,
          images: null
        }
      }
    },
    methods: {

    },
    computed: {

    }
  }
</script>

<style scoped>

</style>