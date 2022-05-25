<template>
  <el-card class="main-card">
    <div class="card-container-title">{{ this.$route.name }}</div>
<!--    审核状态-->
    <div class="is-review-menu">
      <span @click="changeReview(null)" :class="isActive(null)">全部</span>
      <span @click="changeReview(1)" :class="isActive(1)">正常</span>
      <span @click="changeReview(0)" :class="isActive(0)">审核中</span>
    </div>
<!--    操作-->
    <div class="operation-container">
      <el-button
        type="danger"
        size="small"
        icon="el-icon-delete"
        :disabled="this.messageIdList.length == 0"
        @click="showDeleteDialog = true"
        >
        批量删除
      </el-button>
      <el-button
          type="success"
          size="small"
          icon="el-icon-success"
          :disabled="this.messageIdList.length == 0"
          @click="doUpdateSelectedMessageIsReviewed"
      >
        批量通过
      </el-button>
<!--      筛选-->
      <div style="display: flex; margin-left: auto">
        <el-input
          size="small"
          placeholder="用户昵称"
          v-model="keywords"
          prefix-icon="el-icon-search"
          @keyup.enter.native="doSearchMessages"
          />
        <el-button
          type="primary"
          size="small"
          icon="el-icon-search"
          style="margin-left: 24px"
          @click="doSearchMessages"
          >
          搜索
        </el-button>
      </div>
    </div>
<!--    表格展示-->
    <el-table
      border
      v-loading="loading"
      :data="messageList"
      @selection-change="onSelectionChange"
      >
<!--      多选-->
      <el-table-column type="selection" width="55"/>
<!--      头像-->
      <el-table-column label="头像" prop="avatar" align="center" width="150">
        <template slot-scope="scope">
          <img :src="scope.row.avatar" width="40" height="40"/>
        </template>
      </el-table-column>
      <!--    发言人-->
      <el-table-column label="发言人" prop="nickname" align="center" width="100"/>
      <!--    留言内容-->
      <el-table-column label="留言内容" prop="messageContent" align="center"/>
      <!--    ip地址-->
      <el-table-column label="IP地址" prop="ipAddress" align="center" width="100"/>
      <!--    ip来源-->
      <el-table-column label="IP来源" prop="ipSource" align="center" width="100">
        <template slot-scope="scope">
          <span v-if="scope.row.ipSource">{{ scope.row.ipSource }}</span>
          <span v-else>未知</span>
        </template>
      </el-table-column>
      <!--    审核状态-->
      <el-table-column label="审核状态" prop="isReview" align="center" width="80">
        <el-tag v-if="isReview == 0" type="warning">审核中</el-tag>
        <el-tag v-else-if="isReview == 1" type="success">正常</el-tag>
      </el-table-column>
      <!--    留言时间-->
      <el-table-column label="留言时间" prop="createTime" width="150" align="center">
        <template slot-scope="scope">
          <i class="el-icon-time" style="margin-right: 5px"/>
          {{formatLocalDateTime(scope.row.createTime)}}
        </template>
      </el-table-column>
<!--      操作-->
      <el-table-column label="操作" width="160" align="center">
        <template slot-scope="scope">
          <el-button
            type="success"
            size="small"
            v-if="scope.row.isReview == 0"
            @click="doUpdateMessageIsReview(scope.row.id)"
            >
            通过
          </el-button>
          <el-popconfirm
            style="margin-left: 5px"
            title="确定要删除吗？"
            @confirm="doDeleteMessage(scope.row.id)"
            >
            <el-button
              slot="reference"
              type="danger"
              size="small"
              >
              删除
            </el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
<!--    分页-->
    <el-pagination
      background
      class="pagination-container"
      :current-page="current"
      :page-size="size"
      :page-sizes="[10, 20]"
      :total="count"
      @current-change="onCurrentChange"
      @size-change="onSizeChange"
      layout="total, sizes, prev, pager, next, jumper"
      />
<!--    dialog-->
    <el-dialog
      :visible.sync="showDeleteDialog"
      width="30%"
      >
      <div class="dialog-title-container" slot="title">
        <i class="el-icon-warning" style="color:#999"/>
        提示
      </div>
      <div>是否要删除所选项？</div>
      <div slot="footer">
        <el-button @click="showDeleteDialog = false">取消</el-button>
        <el-button @click="doDeleteSelectedMessaegs" type="danger">确定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  name: "MessageView",
  created() {
    this.listMessages();
  },
  data() {
    return {
      loading: false,
      showDeleteDialog: false,
      //data
      messageIdList: [],
      messageList: [],
      //request
      //keywords:用户昵称
      keywords: null,
      isReview: null,
      //page
      current: 1,
      size: 10,
      count: 0
    }
  },
  methods: {
    //查询
    doSearchMessages() {
      this.current = 1;
      this.listMessages();
    },
    //查询后台消息
    listMessages() {
      let params = {
        current: this.current,
        size: this.size,
        keywords: this.keywords,
        isReview: this.isReview
      };

      this.getRequest("/admin/messages", params).then(res => {
        this.count = res.data.data.count;
        this.messageList = res.data.data.recordList;

        this.loading = false;
      })
    },
    //改变审核状态
    changeReview(isReview) {
      this.isReview = isReview;
    },
    //审核通过
    doUpdateSelectedMessageIsReviewed() {
      this.doUpdateMessageIsReview(this.messageIdList)
    },
    doUpdateMessageIsReview(id) {
      let messageIdList = id.length == undefined ? [id] : [...id];
      let params = {
        idList: messageIdList,
        isReview: 1
      }
      this.putRequest("/admin/messages/review", params).then(res => {
        if (res.data.flag) {
          this.$notify.success({
            title: '成功',
            message: res.data.message
          })

          this.listMessages();
        } else {
          this.$notify.error({
            title: "失败",
            message: res.data.message
          });
        }
      })
    },
    //删除
    doDeleteSelectedMessaegs() {
      this.doDeleteMessage(this.messageIdList);
    },
    doDeleteMessage(id) {
      let messageIdList = id.length == undefined ? [id] : [...id];
      this.deleteRequest("/admin/messages", messageIdList).then(res => {
        if (res.data.flag) {
          this.$notify.success({
            title: "成功",
            message: res.data.message
          })

          this.listMessages();
        } else {
          this.$notify.error({
            title: "失败",
            message: res.data.message
          });
        }

        this.showDeleteDialog = false;
      })
    },
    //多选
    onSelectionChange(selectedMessages) {
      this.messageIdList = [];
      selectedMessages.forEach(message => {
        this.messageIdList.push(message.id)
      })
    },
    onCurrentChange(newCur) {
      this.current = newCur;
      this.listMessages();
    },
    onSizeChange(newSize) {
      this.size = newSize;
      this.listMessages();
    }
  },
  computed: {
    isActive() {
      return function (isReview) {
        return this.isReview == isReview ? "active-review" : 'review';
      };
    },
    formatLocalDateTime() {
      return function (dateStr) {
        return this.$dayjs(dateStr).format("YYYY年MM月DD日 HH点mm分ss秒")
      }
    }

  },
  watch: {
    isReview() {
      this.current = 1;
      this.listMessages();
    }
  }
}
</script>

<style scoped>
  .is-review-menu {
    margin-top: 1.5rem;
    color: #999;
  }

  .is-review-menu span{
    margin-right: 24px;
  }

  .review {
    cursor: pointer;
  }

  .active-review {
    cursor: pointer;
    font-weight: bold;
    color: #333;
  }
</style>