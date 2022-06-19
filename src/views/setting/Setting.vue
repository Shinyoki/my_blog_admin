<template>
  <el-card class="main-card">
    <el-tabs v-model="activeName">
      <!-- 个人信息 -->
      <el-tab-pane label="修改信息" name="info">
        <div class="info-container">
          <el-upload
            :multiple="false"
            class="avatar-uploader"
            :show-file-list="false"
            :on-success="updateAvatar"
            >
            <img v-if="avatar" :src="avatar" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
          <el-form
            label-width="70px"
            :model="userInfo"
            style="width:320px;margin-left:3rem"
            >
            <el-form-item label="用户昵称">
              <el-input v-model="userInfo.nickname" size="small" />
            </el-form-item>
            <el-form-item label="个人简介">
              <el-input v-model="userInfo.intro" size="small" />
            </el-form-item>
            <el-form-item label="个人网站">
              <el-input v-model="userInfo.webSite" size="small" />
            </el-form-item>
            <el-button
              @click="updateInfo"
              type="primary"
              size="medium"
              style="margin-left:4.375rem"
              >
              修改
            </el-button>
          </el-form>
        </div>
      </el-tab-pane>
<!--      修改密码-->
      <el-tab-pane label="修改密码" name="password">
        <el-form :model="passwordForm" label-width="70px" style="width:320px">
          <el-form-item label="旧密码">
            <el-input
              @keyup.enter.native="updatePassword"
              v-model="passwordForm.oldPassword"
              size="small"
              show-password
              />
          </el-form-item>
          <el-form-item label="新密码">
            <el-input
              @keyup.enter.native="updatePassword"
              v-model="passwordForm.newPassword"
              size="small"
              show-password
              />
          </el-form-item>
          <el-form-item label="确认密码">
            <el-input
              @keyup.enter.native="updatePassword"
              v-model="passwordForm.confirmPassword"
              size="small"
              show-password
              />
          </el-form-item>
          <el-button
            type="primary"
            @click="updatePassword"
            size="medium"
            style="margin-left:4.4rem"
            >
            修改
          </el-button>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Setting",
  created() {

  },
  data() {
    return {
      activeName: "info",
      userInfo: {
        nickname: this.$store.state.nickname,
        intro: this.$store.state.intro,
        webSite: this.$store.state.webSite,
      },
      passwordForm: {
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
      avatar: this.$store.state.avatar,
    }
  },
  methods: {
    // 修改头像
    updateAvatar(ajaxResponse) {
      this.avatar = ajaxResponse.data;
      this.$store.commit("updateAvatar", ajaxResponse.data);
    },
    // 修改个人信息
    updateInfo() {
      if (this.userInfo.nickname.trim() == "") {
        this.$notify.error({
          title: "错误",
          message: "昵称不能为空",
        });
        return false;
      }
      this.putRequest("/user/info", this.userInfo).then(res => {
        if (res.flag) {
          this.$notify.success({
            title: "成功",
            message: "修改成功",
          });
          this.$store.commit("updateInfo", this.userInfo);
        } else {
          this.$notify.error({
            title: "错误",
            message: res.message,
          });
        }
      });
    },
    // 修改密码
    updatePassword() {
      if (this.passwordForm.oldPassword.trim() == "") {
        this.$notify.error({
          title: "错误",
          message: "旧密码不能为空",
        });
        return false;
      }
      if (this.passwordForm.newPassword.trim() == "") {
        this.$notify.error({
          title: "错误",
          message: "新密码不能为空",
        });
        return false;
      }
      if (this.passwordForm.newPassword != this.passwordForm.confirmPassword) {
        this.$notify.error({
          title: "错误",
          message: "两次密码不一致",
        });
        return false;
      }
      this.putRequest("/admin/users/password", this.passwordForm).then(res => {
        if (res.flag) {
          this.$notify.success({
            title: "成功",
            message: "修改成功",
          });
        } else {
          this.$notify.error({
            title: "错误",
            message: res.message,
          });
        }
      });
    },
  }
}
</script>

<style>
.info-container {
  display: flex;
  align-items: center;
  margin-left: 20%;
  margin-top: 5rem;
}
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}
.avatar {
  width: 120px;
  height: 120px;
  display: block;
}

</style>