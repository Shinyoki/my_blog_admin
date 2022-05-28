<template>
  <el-card class="main-card">
    <div class="card-container-title">{{ this.$route.name }}</div>
<!--    操作-->
    <div class="operation-container">
<!--      筛选-->
      <div style="display: flex; margin-left: auto">
        <el-select
          clearable
          v-model="loginType"
          placeholder="登陆方式"
          size="small"
          style="margin-right: 1rem"
          >
          <el-option
            v-for="(login, index) of typeList"
            :key="index"
            :label="login.label"
            :value="login.type"
            />
        </el-select>
        <el-input
            size="small"
            v-model="keywords"
            prefix-icon="el-icon-search"
            placeholder="用户昵称"
            style="margin-right: 1rem"
            @keyup.enter.native="searchUsers"
            />
        <el-button
          type="primary"
          size="small"
          icon="el-icon-search"
          @click="searchUsers"
          >搜索</el-button>
      </div>
    </div>
    <!--      表格展示-->
    <el-table
        border
        :data="userList"
        v-loading="loading"
    >
      <!--        列：头像-->
      <el-table-column label="头像" prop="avatar" align="center">
        <template slot-scope="scope">
          <img :src="scope.row.avatar" width="40" height="40"/>
        </template>
      </el-table-column>
      <!--        列：昵称-->
      <el-table-column label="昵称" prop="nickname" align="center"/>
      <!--        列：登录方式-->
      <el-table-column label="登录方式" prop="loginType" align="center">
        <template slot-scope="scope">
          <el-tag type="success" v-if="scope.row.loginType == 1">邮箱</el-tag>
          <el-tag type="warning" v-else-if="scope.row.loginType == 2">QQ</el-tag>
          <el-tag type="danger" v-else-if="scope.row.loginType == 3">微博</el-tag>
        </template>
      </el-table-column>
      <!--          列：角色-->
      <el-table-column label="用户角色" prop="roleList" align="center">
        <template slot-scope="scope">
          <el-tag
              v-for="(role, index) of scope.row.roleList"
              :key="index"
          >{{ role.roleName }}</el-tag>
        </template>
      </el-table-column>
<!--      列：禁用-->
      <el-table-column prop="isDisable" label="禁用" align="center">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.isDisable"
            active-value="1"
            inactive-value="0"
            @change="changeDisable(scope.row)"
            active-color="#13ce66"
            inactive-color="#F4F4F5"
            />
        </template>
      </el-table-column>
<!--      列：登录IP地址-->
      <el-table-column label="IP" align="center" prop="ipAddress"/>
<!--      列：来源-->
      <el-table-column label="登录地址" align="center" prop="ipSource"/>
<!--      列：创建时间-->
      <el-table-column label="创建时间" prop="createTime" align="center">
        <template slot-scope="scope">
          <i class="el-icon-time"/>
          {{ scope.row.createTime | date }}
        </template>
      </el-table-column>
      <!--        列：最后登录时间-->
      <el-table-column label="最近登录时间" prop="lastLoginTime" align="center">
        <template slot-scope="scope">
          <i class="el-icon-time"/>
          {{ scope.row.lastLoginTime | date }}
        </template>
      </el-table-column>
<!--      列：操作-->
      <el-table-column label="操作" align="center" width="100">
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            @click="openEditModel(scope.row)"
            >编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
<!--    分页-->
    <el-pagination
      background
      class="pagination-container"
      :current-page="current"
      :page-size="10"
      :page-sizes="[10, 20]"
      :total="count"
      @current-change="onCurrentChange"
      @size-change="onSizeChange"
      layout="total, sizes, prev, pager, next, jumper"
      />
<!--    dialog-->
    <el-dialog
      :visible.sync="showEditUserDialog"
      width="30%"
      >
      <div class="dialog-title-container" slot="title">修改用户</div>
      <el-form
        v-model="userForm"
        size="medium"
        label-width="60px"
        >
        <el-form-item label="用户昵称">
          <el-input v-model="userForm.nickname"/>
        </el-form-item>
        <el-form-item label="角色">
          <el-checkbox-group v-model="roleIdList">
            <el-checkbox
              v-for="(role, index) of userRoleList"
              :key="index"
              :label="role.id"
              >
              {{ role.roleName }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="showEditUserDialog = false">取消</el-button>
        <el-button type="primary" @click="doEditUserRole">确定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "User",
  created() {
    this.initData()
  },
  data() {
    return {
      loading: true,
      showEditUserDialog: false,
      typeList: [
        {
          type: 1,
          label: '邮箱'
        },
        {
          type: 2,
          label: 'QQ'
        },
        {
          type: 3,
          label: '微博'
        }
      ],
      //data
      userList: [],
      userRoleList: [],
      //request
      userIdList: [], //后台用户ID，不是用户信息ID
      roleIdList: [],
      keywords: "", //用户昵称
      loginType: null,
      userForm: {
        userInfoId: null,
        nickname: "",
        roleIdList: []
      },
      //page
      current: 1,
      size: 10,
      count: 0
    }
  },
  methods: {
    initData() {
      this.listUserRoles();
      this.listUsers();
    },
    //查询后台用户列表
    listUsers() {
      let params = {
        keywords: this.keywords,
        loginType: this.loginType,

        current: this.current,
        size: this.size
      }

      this.getRequest("/admin/users", params).then(res => {
        this.userList = res.data.data.recordList;
        console.log(this.userList)
        this.count = res.data.data.count;
        this.loading = false;
      })
    },
    //查询全部角色
    listUserRoles() {
      this.getRequest("/admin/users/role").then(res => {
        this.userRoleList = res.data.data;
      })
    },
    //搜索用户
    searchUsers() {
      this.current = 1;
      this.listUsers();
    },
    //更新disable状态
    changeDisable(userInfo) {
      let params = {
        id: userInfo.userInfoId,
        isDisable: userInfo.isDisable
      }
      this.putRequest("/admin/users/disable", params).then(res => {
        if (res.data.flag) {
          this.$notify.success({
            title: '更新状态成功',
            message: res.data.message
          })
        } else {
          this.$notify.error({
            title: '更新状态失败',
            message: res.data.message
          })
          userInfo.isDisable = !userInfo.isDisable;
        }
      });
    },
    //修改user的角色 dialog
    openEditModel(user) {
      this.userForm = JSON.parse(JSON.stringify(user))
      //抽出独立的roleIdList，防止在操作后取消，数据却已经被修改
      this.roleIdList = [];
      this.userForm.roleList.forEach(role => {
        this.roleIdList.push(role.id)
      })

      this.showEditUserDialog = true;
    },
    //修改user的角色
    doEditUserRole() {
      this.userForm.roleIdList = this.roleIdList;
      this.putRequest("/admin/users/role", this.userForm).then(res => {
        if (res.data.flag) {
          this.$notify.success({
            title: "成功",
            message:res. data.message
          });
          this.listUsers();
        } else {
          this.$notify.error({
            title: "失败",
            message: res.data.message
          });
        }

        this.showEditUserDialog = false;
      })
    },
    //paeg
    onCurrentChange(newCur) {
      this.current = newCur;
      this.listUsers();
    },
    onSizeChange(newSize) {
      this.size = newSize;
      this.listUsers();
    }
  },
  computed: {

  }
}
</script>

<style scoped>

</style>