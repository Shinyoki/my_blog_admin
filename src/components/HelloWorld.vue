<template>
  <div class="hello">
    <el-button type="primary" @click="show">主要按钮</el-button>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data() {
    return {
      map: {
        name: 'sun',
        age: 1,
        list: [1, 2, 3]
      }
    }
  },
  props: {
    msg: String
  },
  methods: {
    show() {
      this.axios.post("/api/test/post1",this.map)
      .then(res=>{
        this.$message("得到消息：" + res.data.name);
        console.log(res)
      })

    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
