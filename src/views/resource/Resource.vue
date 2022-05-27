<template>
  <el-card class="main-card">
    <div class="card-container-title">{{ this.$route.name }}</div>
<!--    操作-->
    <div class="operation-container">
<!--      添加-->
      <el-button
        type="primary"
        size="small"
        icon="el-icon-plus"
        @click="openModel(null)"
        >
        新增模块
      </el-button>
<!--     筛选 -->
      <div style="display: flex; margin-left: auto">
        <el-input
          v-model="keywords"
          prefix-icon="el-icon-search"
          size="small"
          placeholder="资源名"
          @keyup.enter.native="listResources"
          />
        <el-button
          style="margin-left: 1rem"
          type="primary"
          size="small"
          icon="el-icon-search"
          @click="listResources"
          >
          搜索
        </el-button>
      </div>
    </div>
<!--    表格展示-->
    <el-table
      v-loading="loading"
      :data="resourceList"
      row-key="id"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      >
<!--      列：资源名-->
      <el-table-column label="资源名" prop="resourceName" width="220"/>
<!--      列：资源路径-->
      <el-table-column label="资源路径" prop="url" width="300">
        <template slot-scope="scope">
          <span v-if="scope.row.url">{{ scope.row.url }}</span>
        </template>
      </el-table-column>
<!--      列：请求方式-->
      <el-table-column label="请求方式" prop="requestMethod">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.requestMethod" :type="tagType(scope.row.requestMethod)">
            {{ scope.row.requestMethod }}
          </el-tag>
        </template>
      </el-table-column>
<!--      列：是否允许匿名访问-->
      <el-table-column label="可否匿名访问" prop="isAnonymous" align="center">
        <template slot-scope="scope">
<!--          只对非模块资源启用-->
          <el-switch
            v-if="scope.row.url"
            v-model="scope.row.isAnonymous"
            :active-value="1"
            :inactive-value="0"
            active-color="#13ce66"
            inactive-color="#F4F4F5"
            @change="changeResource(scope.row)"
            />
        </template>
      </el-table-column>
<!--      列：日期-->
      <el-table-column label="创建时间" prop="createTime" align="center">
        <template slot-scope="scope">
          <i class="el-icon-item"/>
          {{ scope.row.createTime | date }}
        </template>
      </el-table-column>
<!--      列：操作-->
      <el-table-column label="操作" align="center" width="200">
<!--        有孩子时是模块-->
        <template slot-scope="scope">
          <el-button
            type="text"
            size="mini"
            icon="el-icon-plus"
            v-if="scope.row.children"
            @click="openAddSubResourceModel(scope.row)"
            >
            新增
          </el-button>
<!--          修改-->
          <el-button
            type="text"
            size="mini"
            icon="el-icon-edit"
            @click="openEditResourceModel(scope.row)"
            >修改</el-button>
          <el-popconfirm
            title="确定要删除吗？"
            @confirm="deleteResource(scope.row.id)"
            >
            <el-button
              slot="reference"
              type="text"
              size="mini"
              >
              <i class="el-icon-delete" />删除
            </el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
<!--    dialog-->
    <el-dialog
      :visible.sync="showAddOrEditModuleDialog"
      width="30%"
      >
<!--      模块-->
      <div class="dialog-title-container" slot="title" ref="moduleTitle"/>
      <el-form
        :model="resourceForm"
        @submit.native.prevent
        size="medium"
        label-width="80px"
        >
<!--        模块名-->
        <el-form-item label="模块名">
          <el-input v-model="resourceForm.resourceName" @keyup.enter.native="addOrEditResource" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="showAddOrEditModuleDialog = false">取消</el-button>
        <el-button type="primary" @click="addOrEditResource">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :visible.sync="showAddOrEditResourceDialog"
      width="30%"
      >
<!--      子资源-->
      <div class="dialog-title-container" slot="title" ref="resourceTitle"/>
      <el-form
        label-width="80px"
        size="medium"
        :model="resourceForm"
        >
        <el-form-item label="资源名">
          <el-input v-model="resourceForm.resourceName"/>
        </el-form-item>
        <el-form-item label="请求路径">
          <el-input v-model="resourceForm.url"/>
        </el-form-item>
        <el-form-item label="请求方式">
          <el-radio-group v-model="resourceForm.requestMethod">
            <el-radio :label="'GET'">GET</el-radio>
            <el-radio :label="'POST'">POST</el-radio>
            <el-radio :label="'PUT'">PUT</el-radio>
            <el-radio :label="'DELETE'">DELETE</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <div slot="footer">
        <el-button @click="showAddOrEditResourceDialog = false">取消</el-button>
        <el-button type="primary" @click="addOrEditResource">确定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Resource",
  created() {
    this.listResources();
  },
  data() {
    return {
      loading: true,
      showAddOrEditModuleDialog: false,
      showAddOrEditResourceDialog: false,
      //keywords：资源名
      keywords: "",
      resourceForm: {},
      //data
      resourceList: [],
    }
  },
  methods: {
    //查询资源集合
    listResources() {
      let params = {
        keywords: this.keywords
      };

      this.getRequest("/admin/resources", params).then(res => {
        console.log("得到的resource")
        console.log(res.data.data)
        this.resourceList = res.data.data;

        this.loading = false;
      })
    },
    //打开AddOrEditDialog：修改模块或资源
    openEditResourceModel(resource) {
      //修改模块
      if (resource.url == null) {
        this.openModel(resource);
        return false;
      }
      //修改资源
      this.resourceForm = JSON.parse(JSON.stringify(resource));
      this.$refs.resourceTitle.innerHTML = "修改资源";

      this.showAddOrEditResourceDialog = true;
    },
    //打开AddOrEditDialog:处理资源
    openAddSubResourceModel(resource) {
      this.resourceForm = {};
      this.resourceForm.parentId = resource.id;
      this.$refs.resourceTitle.innerHTML = "添加资源";

      this.showAddOrEditResourceDialog = true;
    },
    //打开AddOrEditDialog:处理模块
    openModel(resource) {
      if (resource) {
        //存在：修改
        this.resourceForm = JSON.parse(JSON.stringify(resource));
        this.$refs.moduleTitle.innerHTML = "修改模块"
      } else {
        //不存在：新增
        this.resourceForm = {};
        this.$refs.moduleTitle.innerHTML = "新增模块";
      }

      this.showAddOrEditModuleDialog = true;
    },
    //修改resource
    changeResource(resource) {
      this.postRequest("/admin/resources", resource).then(res => {
        if (res.data.flag) {
          this.$notify.success({
            title: "成功",
            message: res.data.message
          });

          this.listResources();
        } else {
          this.$notify.error({
            title: "失败",
            message: res.data.message
          });
        }
      })
    },
    //删除资源
    deleteResource(id) {
      this.deleteRequest("/admin/resources/" + id).then(res => {
        if (res.data.flag) {
          this.$notify.success({
            title: '删除成功',
            message: res.data.message
          })

          this.listResources();
        } else {
          this.$notify.success({
            title: '删除失败',
            message: res.data.message
          })
        }
      })
    },
    //添加或修改资源
    addOrEditResource() {
      if (this.resourceForm.resourceName.trim() == "") {
        this.$message.error("资源名不能为空");
        return false;
      }

      this.postRequest("/admin/resources", this.resourceForm).then(res => {
        if (res.data.flag) {
          this.$notify.success({
            title: "成功",
            message: res.data.message
          });
          this.listResources();
        } else {
          this.$notify.error({
            title: "失败",
            message: res.data.message
          });
        }

        this.showAddOrEditModuleDialog = false;
        this.showAddOrEditResourceDialog = false;
      })
    }
  },
  computed: {
    //请求方法tag样式
    tagType() {
      return function (method) {
        switch (method) {
          case 'GET':
            return "";
          case 'POST':
            return "success";
          case 'PUT':
            return 'warning';
          case 'DELETE':
            return 'danger';
        }
      };
    }
  }
}
</script>

<style scoped>

</style>