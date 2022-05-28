<template>
  <el-card class="main-card">
    <div class="card-container-title">{{ this.$route.name }}</div>
<!--    筛选-->
    <div class="operation-container">
<!--      筛选-->
      <div style="display: flex; margin-left: auto">
        <el-input
          style="margin-right: 1rem"
          v-model="keywords"
          size="small"
          placeholder="用户昵称"
          prefix-icon="el-icon-search"
          @keyup.enter.native="listOnlineUsers"
          />
        <el-button
          type="primary"
          size="small"
          @click="listOnlineUsers"
          >搜索</el-button>
      </div>
    </div>
<!--    表格展示-->
    <el-table
      border
      v-loading="loading"
      :data="userList"
      >
<!--      列：多选-->
      <el-table-column type="selection" align="center"/>
<!--      列：头像-->
      <el-table-column label="头像" prop="avatar" align="center">
        <template slot-scope="scope">
          <img :src="scope.row.avatar" width="40" height="40"/>
        </template>
      </el-table-column>
<!--      列：用户昵称-->
      <el-table-column label="昵称" prop="nickname" align="center"/>
<!--      列：IP地址-->
      <el-table-column label="IP地址" prop="ipAddress" align="center"/>
<!--      列：来源-->
      <el-table-column label="登录地址" prop="ipSource" align="center"/>
<!--      登录时间-->
      <el-table-column label="最近登录时间" prop="lastLoginTime" align="center">
        <template slot-scope="scope">
          <i class="el-icon-time" style="margin-right: .4rem"/>
          {{ scope.row.lastLoginTime | date}}
        </template>
      </el-table-column>
<!--      列：浏览器-->
      <el-table-column label="浏览器" prop="browser" align="center"/>
<!--      列：系统-->
      <el-table-column label="操作系统" prop="os" align="center"/>
<!--      列：操作-->
      <el-table-column label="操作" align="center" width="200">
        <template slot-scope="scope">
          <el-popconfirm
            title="确定要踢下线吗？"
            @confirm="kickOnlineUser(scope.row.userInfoId)"
            >
            <el-button slot="reference" size="mini" type="primary" icon="el-icon-delete">下线</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script>
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Online",
  created() {
    this.listOnlineUsers();
  },
  data() {
    return {
      loading: false,
      //data
      userList: [],
      //request
      keywords: null, //用户昵称
      //page
      current: 1,
      size: 10,
      count: 0
    }
  },
  methods: {
    //查询此时的在线用户
    listOnlineUsers() {
      let params ={
        keywords: this.keywords,

        current: this.current,
        size: this.size
      }
      this.getRequest("/admin/users/online", params).then(res => {
        this.userList = res.data.data.recordList;
        this.count = res.data.data.count;
        this.loading = false;
      })
    }
  },
  //踢下线
  kickOnlineUser(userInfoId) {
    this.deleteRequest("/admin/users/" + userInfoId + "/online").then(res => {
      if (res.data.flag) {
        this.$notify.success({
          title: "成功",
          message: res.data.message
        });

        this.listOnlineUsers();
      } else {
        this.$notify.error({
          title: "失败",
          message: res.data.message
        });
      }
    })
  }
}
</script>

<style scoped>

</style>