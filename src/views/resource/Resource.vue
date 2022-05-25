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
          style="margin-right: 1rem"
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
    </el-table>
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
    //打开AddOrEditDialog
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