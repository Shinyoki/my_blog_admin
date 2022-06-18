<template>
  <el-card class="main-card">
    <div class="card-container-title">{{ $route.name }}</div>
    <div class="operation-container">
      <el-button
          type="primary"
          icon="el-icon-plus"
          size="small"
          @click="openModel(null)"
      >添加页面
      </el-button>
    </div>
    <el-row
        class="page-container"
        v-loading="loading"
        :gutter="12"
    >
      <el-empty
          v-if="pageList.length == 0"
          description="暂无页面"
      />
      <!--        页面元素-->
      <el-col
          v-for="(page, index) of pageList"
          :key="index"
          :md="6"
      >
        <div class="page-item">
          <!--          页面操作-->
          <div class="page-operation">
            <el-dropdown @command="handleCommand">
              <i class="el-icon-more" style="color:#fff; font-size: 1.5rem"/>
              <el-dropdown-menu
                  slot="dropdown"
              >
                <el-dropdown-item
                    :command="'update' + JSON.stringify(page)"
                >
                  <i class="el-icon-edit"/> 编辑
                </el-dropdown-item>
                <el-dropdown-item
                    :command="'delete' + page.id"
                >
                  <i class="el-icon-delete"/> 删除
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
          <!--          封面-->
          <el-image
              fit="cover"
              class="page-cover"
              :src="page.pageCover"
              :preview-src-list="[page.pageCover]"
          />
          <!--          名称-->
          <div class="page-name">{{ page.pageName }}</div>
        </div>
      </el-col>
    </el-row>

    <el-dialog
        :visible.sync="showAddOrEditPageDialog"
        width="35%"
        top="10vh"
    >
      <div class="dialog-title-container" slot="title" ref="pageTitle"/>
      <el-form
          :model="pageForm"
          size="medium"
          label-width="80px"
      >
        <el-form-item label="页面名称">
          <el-input
              v-model="pageForm.pageName"
              placeholder="请输入页面名称"
          />
        </el-form-item>
        <el-form-item label="页面标签">
          <el-input
              v-model="pageForm.pageLabel"
              placeholder="请输入页面标签"
          />
        </el-form-item>
        <el-form-item label="页面封面">
          <el-upload
              drag
              :multiple="false"
              :show-file-list="false"
              :before-upload="onBeforeUpload"
              :on-success="onSuccess"
              action="/api/admin/config/images"
          >
            <i class="el-icon-upload" v-if="pageForm.pageCover == ''"/>
            <div class="el-upload__text" v-if="pageForm.pageCover == ''">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <img
                v-else
                :src="pageForm.pageCover"
                width="360px"
                height="180px"
            />
          </el-upload>
        </el-form-item>
      </el-form>

      <div slot="footer">
        <el-button @click="showAddOrEditPageDialog = false">取消</el-button>
        <el-button type="primary" @click="addOrEditPage">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog
        :visible.sync="showDeletePageDialog"
        width="35%"
    >
      <div class="dialog-title-container" slot="title">
        <i class="el-icon-warning" style="color: #ff9900"/> 提示
      </div>
      <div>确定要删除该页面吗？</div>
      <div slot="footer">
        <el-button @click="showDeletePageDialog = false">取消</el-button>
        <el-button type="primary" @click="deletePage">确定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
import * as imageConversion from "image-conversion"

export default {
  name: "PageView",
  created() {
    this.listPage();
  },
  data() {
    return {
      loading: true,
      showDeletePageDialog: false,
      showAddOrEditPageDialog: false,
      //data
      pageList: [],
      //request
      pageForm: {
        id: null,
        pageName: "",
        pageLabel: "",
        pageCover: "",
        createTime: "",
      },
      keywords: null,
      //page
      current: 1,
      size: 10,
      count: 0
    }
  },
  methods: {
    //查询页面列表
    listPage() {
      this.getRequest("/admin/pages").then(res => {
        this.pageList = res.data.data;
        this.count = this.pageList.length;

        this.loading = false;
      })
    },
    //新增或修改
    openModel(page) {
      if (page == null) {
        this.pageForm = {
          id: null,
          pageName: "",
          pageLabel: "",
          pageCover: ""
        }
        this.$refs.pageTitle.innerHTML = "添加页面";
      } else {
        this.pageForm = page;
        this.$refs.pageTitle.innerHTML = "修改页面";
      }

      this.showAddOrEditPageDialog = true;
    },
    //下拉框回调
    handleCommand(command) {
      let optType = command.substring(0, 6);
      let data = command.substring(6);
      switch (optType) {
        case "update":
          this.openModel(JSON.parse(data));
          break;
        case "delete":
          this.openDeletePageDialog(data);
          break;
      }
    },
    //删除页面
    openDeletePageDialog(id) {
      this.pageForm.id = id;

      this.showDeletePageDialog = true;
    },
    //上传图片预处理
    onBeforeUpload(file) {
      return new Promise(resolve => {
        if (file.size / 1024 > this.confg.UPLOAD_SIZE) {
          imageConversion.compressAccurately(file, this.confg.UPLOAD_SIZE).then(resFile => {
            resolve(resFile);
          });
        } else {
          resolve(file);
        }
      })
    },
    onSuccess(ajaxResponse) {
      this.pageForm.pageCover = ajaxResponse.data
    },
    //编辑或更新页面
    addOrEditPage() {
      if (this.pageForm.pageName.trim() == "") {
        this.$notify.error({
          title: "错误",
          message: "页面名称不能为空"
        });
        return false;
      }
      if (this.pageForm.pageLabel.trim() == "") {
        this.$notify.error({
          title: "错误",
          message: "页面标签不能为空"
        });
        return false;
      }
      if (this.pageForm.pageCover.trim() == "") {
        this.$notify.error({
          title: "错误",
          message: "页面封面不能为空"
        });
        return false;
      }
      this.postRequest("/admin/pages/" + this.pageForm.id).then(res => {
        if (res.data.flag) {
          this.$notify.success({
            title: "成功",
            message: "操作成功"
          });
          this.listPage();
        } else {
          this.$notify.error({
            title: "错误",
            message: res.data.message
          });
        }
        this.showAddOrEditPageDialog = false;
      })
    },
    //删除页面
    deletePage() {
      this.deleteRequest("/admin/pages/" + this.pageForm.id).then(res => {
        if (res.data.flag) {
          this.$notify.success({
            title: "成功",
            message: "操作成功"
          });
          this.listPage();
        } else {
          this.$notify.error({
            title: "错误",
            message: res.data.message
          });
        }
        this.showDeletePageDialog = false;
      })
    }
  },
}
</script>

<style scoped>
.page-item {
  position: relative;
  cursor: pointer;
  margin-bottom: 1rem;
}
.page-cover {
  position: relative;
  border-radius: 4px;
  width: 100%;
  height: 170px;
}
.page-name {
  text-align: center;
  margin-top: .5rem;
}
.page-operation {
  position: absolute;
  z-index: 1000;
  top: 0.5rem;
  right: 0.5rem;
}
</style>