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
    <div v-if="show">

    </div>
  </div>
</template>

<script>
import {initMenus} from "@/utils/menu";

export default {
  name: "TestProxy",
  data() {
    return {
      show: true,
      value: '',
      list: [
        {value: 'doRequest', label: 'ping请求'},
        {value: 'doLogin', label: '登录'},
        {value: 'redirect404', label: 'push到404'},
        {value: 'testMessageHtml', label: '测试html格式的message'},
        {value: 'testInitMenu', label: '测试初始菜单函数'},
        {value: 'push1', label: '测试路由'},
        {value: 'arrayRemove', label: '测试js数组的删除'},
        {value: 'arrayFilter', label: '测试数组filter'}
      ],
      user: {
        username: 'admin@qq.com',
        password: '1234567'
      }
    }
  },
  methods: {
    execute() {
      this[this.value]();
    },
    arrayFilter() {
      let arr = [1, 2, 3, 4, 5];
      let arr2 = [233, 444];
      // arr.splice(0, 0, arr2);
      // arr.push(arr2);
      arr = arr.concat(arr2);
      console.table(arr);
    },
    arrayRemove() {
      let arr = [1, 2, 3, 4, 5];
      console.table(arr)
      let index = arr.findIndex(item => item == 3);
      arr.splice(index, 1);
      console.table(arr)
      console.log(arr.length)
    },
    push1() {
      console.table(this.$router.getRoutes())
    },
    testMessageHtml() {
      this.$message({
        dangerouslyUseHTMLString: true,
        message: `<strong style="color: red">触发错误：</strong><br></br><div>${this.user.toJSON()}</div>`
      })
    },
    redirect404() {
      this.$router.push({name:"资源不存在"})
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
    },
    testInitMenu() {
      if (this.$store.state.userId == null) {
        this.$message.error("先登录");
        this.$router.push("/login");
        return;
      } else {
        initMenus()
      }
    }
  }
}
</script>

<style scoped>

</style>