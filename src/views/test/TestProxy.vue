<template>
  <div>
    <el-button type="primary" @click="execute">点我发送请求</el-button>
    <el-select v-model="value" placeholder="请选择">
      <el-option
          v-for="item in list"
          :key="item.value"
          :label="item.label"
          :value="item.value">
      </el-option>
    </el-select>
  </div>
</template>

<script>
export default {
  name: "TestProxy",
  data() {
    return {
      value: '',
      list: [
        {value: 'doRequest', label: 'ping请求'},
        {value: 'doLogin', label: '登录'}
      ],
      user: {
        username: 'admin@qq.com',
        password: '1234567'
      }
    }
  },
  methods: {
    execute() {
      this[this.value]()
    },
    doRequest: function () {
      this.getRequest("/test/ping")
          .then(res=>{
            console.log(res);
          })
    },
    doLogin() {
      let userDetails = new URLSearchParams();
      userDetails.append("username", "admin@qq.com");
      userDetails.append("password", "1234567");


      this.postRequest("/login", userDetails).then(res=>{
        this.success("得到响应")
        console.log(res)
      })
    },
    success(message) {
      this.$message.success(message)
    }
  }
}
</script>

<style scoped>

</style>