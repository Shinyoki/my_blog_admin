<template>
  <el-card class="main-card">
    <div class="card-container-title">{{ $route.name }}</div>
    <mavon-editor
      ref="md"
      @imgAdd="uploadImg"
      v-model="aboutContent"
      style="height:calc(100vh - 250px);margin-top:2.25rem"
      />
    <el-button
      type="danger"
      size="medium"
      style="float: right; margin: 1rem 0"
      @click="updateAboutMe"
      >更新修改</el-button>
  </el-card>
</template>

<script>
import * as imageConversion from "image-conversion";

export default {
  name: "AboutMe",
  created() {
    this.initData();
  },
  data() {
    return {
      aboutContent: ""
    };
  },
  methods: {
    initData() {
      this.getRequest("/about").then(res => {
        this.aboutContent = res.data.data;
      });
    },
    //上传图片预处理
    uploadImg(pos, file) {
      //post request表单数据
      let formData = new FormData();

      if (file.size / 1024 > this.config.UPLOAD_SIZE) {
        imageConversion.compressAccurately(file, this.config.UPLOAD_SIZE).then(res => {
          let newFile = new window.File([res], file.name, { type: file.type });
          formData.append("file", newFile); //添加图片文件到请求表单数据中

          this.postRequest("/api/admin/articles/images", formData).then(res => {
            this.$refs.md.$img2Url(pos, res.data.data);   //将图片url插入到富文本编辑器中
          });
        });
      } else {
        formData.append("file", file);  //添加图片文件到请求表单数据中
        this.postRequest("/api/admin/articles/images", formData).then(res => {
          this.$refs.md.$img2Url(pos, res.data.data);   //将图片url插入到富文本编辑器中
        });
      }
    },
    //更新内容
    updateAboutMe() {
      let params = {
        aboutContent: this.aboutContent
      }
      this.putRequest("/admin/about", params).then(res => {
        if (res.data.flag) {
          this.$notify.success({
            title: "成功",
            message: "修改成功"
          });
        } else {
          this.$notify.error({
            title: "失败",
            message: res.data.message
          });
        }
      })
    },
  }
}
</script>

<style scoped>

</style>