<template>
  <el-card class="main-card">
    <div class="card-container-title">{{ $route.name }}</div>
    <div class="operation-container">
<!--      批量删除-->
      <el-button
        type="danger"
        size="small"
        icon="el-icon-delete"
        :disabled="logList.length == 0"
        @click="showLogDeleteDialog = true"
        >
        批量删除
      </el-button>
<!--      数据筛选-->
      <div style="margin-left: auto; display: flex">
        <el-input
          v-model="keywords"
          size="small"
          placeholder="请输入模块名或操作描述"
          prefix-icon="el-icon-search"
          @keyup.enter.native="searchOperationLogs"
          />
        <el-button
          type="primary"
          size="small"
          icon="el-icon-search"
          @click="searchOperationLogs"
          style="margin-left: 1rem"
          >搜索</el-button>
      </div>
    </div>
    <el-table
      @selection-change="onSelectionChange"
      v-loading="loading"
      :data="logList"
      >
<!--      列：多选-->
      <el-table-column type="selection" width="55" align="center"/>
<!--      列：所属模块-->
      <el-table-column label="系统模块" prop="optModule" align="center"/>
<!--      列：操作类型-->
      <el-table-column label="操作类型" prop="optType" align="center"/>
<!--      列：操作描述-->
      <el-table-column label="操作描述" prop="optDesc" align="center"/>
<!--      列：请求方式-->
      <el-table-column label="请求方式" prop="requestMethod" align="center">
        <template slot-scope="scope">
          <el-tag :type="requestTag(scope.row.requestMethod)">
            {{ scope.row.requestMethod }}
          </el-tag>
        </template>
      </el-table-column>
<!--      列：操作人-->
      <el-table-column label="操作人" prop="nickname" align="center"/>
<!--      列：登录位置-->
      <el-table-column label="登录地址" prop="ipSource" align="center"/>
<!--      列：操作日期-->
      <el-table-column label="操作日期" prop="createTime" align="center">
        <template slot-scope="scope">
          {{ scope.row.createTime | dateTime }}
        </template>
      </el-table-column>
<!--      列：操作-->
      <el-table-column label="操作" align="center" width="150">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            @click="openLogFormDialog(scope.row)"
            >
            <i class="el-icon-view"/>详细信息
          </el-button>
          <el-popconfirm
            @confirm="deleteLog(scope.row.id)"
            title="确认删除该条日志记录吗？"
            >
            <el-button
              slot="reference"
              size="mini"
              type="text"
              icon="el-icon-delete"
              >删除</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
<!--    分页-->
    <el-pagination
      background
      class="pagination-container"
      @current-change="onCurrentChange"
      @size-change="onSizeChange"
      :current-page="current"
      :page-sizes="[10, 20]"
      :page-size="size"
      :total="count"
      layout="total, sizes, prev, pager, next, jumper"
      />
<!--    详细信息-->
    <el-dialog
      :visible.sync="showLogFormDialog"
      width="40%"
      >
      <div slot="title" class="dialog-title-container">
        <i class="el-icon-more"/>
        <span class="dialog-title">详细信息</span>
      </div>

      <el-form
        :model="logForm"
        ref="form"
        >
        <el-form-item label="操作模块">{{logForm.optModule}}</el-form-item>
        <el-form-item label="请求地址：">{{logForm.optUrl}}</el-form-item>
        <el-form-item label="请求方式">
          <el-tag
            :type="requestTag(logForm.requestMethod)">
            {{ logForm.requestMethod }}
          </el-tag>
        </el-form-item>
        <el-form-item label="操作方法">{{logForm.optMethod}}</el-form-item>
        <el-form-item label="请求参数">{{logForm.requestParam}}</el-form-item>
        <el-form-item label="返回数据">{{logForm.responseData}}</el-form-item>
        <el-form-item label="操作人">{{logForm.nickname}}</el-form-item>
      </el-form>
    </el-dialog>
    <el-dialog
      :visible.sync="showLogDeleteDialog"
      width="40%"
      >
      <div class="dialog-title-container" slot="title">
        <i class="el-icon-warning" style="color: #ff9900"/> 提示
      </div>
      <div>是否删选中的日志？</div>
      <div slot="footer">
        <el-button @click="showLogDeleteDialog = false">取消</el-button>
        <el-button type="primary" @click="deleteSelectedLogs">确定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  name: "OperationView",
  created() {
    this.listOperationLogs();
  },
  data() {
    return {
      loading: true,
      showLogFormDialog: false,
      showLogDeleteDialog: false,
      //data
      logList: [],
      logForm: {},
      //request
      logIdList: [],
      keywords: null,
      //page
      current: 1,
      size: 10,
      count: 0
    }
  },
  methods: {
    //查询日志
    listOperationLogs() {
      let params = {
        keywords: this.keywords,
        current: this.current,
        size: this.size
      }
      this.getRequest("/admin/operation/logs", params).then(res => {
        this.logList = res.data.data.recordList;
        this.count = res.data.data.count;
        this.loading = false;
      })
    },
    //搜索后台日志记录
    searchOperationLogs() {
      this.current = 1;
      this.listOperationLogs();
    },
    //多选回调
    onSelectionChange(selected) {
      this.logIdList = [];
      console.log(selected)
      selected.forEach(log => {
        this.logIdList.push(log.id)
      })
    },
    //打开详细日志面板
    openLogFormDialog(log) {
      this.logForm = JSON.parse(JSON.stringify(log));
      console.log("数据")
      console.log(this.logForm)
      this.showLogFormDialog = true;
    },
    //删除日志
    deleteSelectedLogs() {
      this.deleteLog(this.logIdList);
    },
    deleteLog(id) {
      let logIdList = id.length === undefined ? [id] : [...id];
      this.deleteRequest("/admin/operation/logs", logIdList).then(res => {
        if (res.data.flag) {
          this.$notify.success({
            title: "成功",
            message: "删除成功"
          });
          this.listOperationLogs();
        } else {
          this.$notify.error({
            title: "错误",
            message: res.data.message
          });
        }
        this.showLogDeleteDialog = false;
      })
    },
    //page
    onCurrentChange(newCur) {
      this.current = newCur;
      this.listOperationLogs();
    },
    onSizeChange(newSize) {
      this.size = newSize;
      this.listOperationLogs();
    },
  },
  computed: {
    requestTag() {
      return function (requestMethod) {
        switch (requestMethod) {
          case "GET":
            return "success";
          case "POST":
            return "primary";
          case "PUT":
            return "warning";
          case "DELETE":
            return "danger";
          default:
            return "info";
        }
      };
    },
  }
}
</script>

<style scoped>

</style>