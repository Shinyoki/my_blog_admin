<template>
  <el-card class="main-card">
    <div class="card-container-title"> {{ this.$route.name }}</div>
<!--    评论状态-->
    <div class="is-review-menu" style="margin-top: 2rem">
      <span @click="changeReview(null)" :class="isActive(null)">全部</span>
      <span @click="changeReview(1)" :class="isActive(1)">正常</span>
      <span @click="changeReview(0)" :class="isActive(0)">审核中</span>
    </div>
<!--    操作-->
    <div class="operation-container">
<!--      修改-->
      <el-button
        type="danger"
        size="small"
        icon="el-icon-delete"
        :disabled="commentIdList.length == 0"
        @click="showRemoveDialog = true"
        >
        批量删除
      </el-button>
      <el-button
        type="success"
        size="small"
        icon="el-icon-success"
        :disabled="commentIdList == 0"
        @click="doUpdateSelectedCommentIsReviewed"
        >
        批量通过
      </el-button>
<!--      筛选-->
      <div class="operation-filter">
<!--        以type-->
        <el-select
          v-model="type"
          clearable
          placeholder="评论来源"
          style="margin-left: 1rem"
          size="small"
          >
          <el-option
            v-for="(type,index) of commentTypes"
            :key="index"
            :label="type.label"
            :value="type.value"
            />
        </el-select>
<!--        以用户名-->
        <el-input
          size="small"
          prefix-icon="el-icon-search"
          style="width: 200px;margin-left: 1rem"
          v-model="keywords"
          placeholder="用户昵称"
          @keyup.enter.native="searchComments"
          />
<!--        搜索按钮-->
        <el-button
            type="primary"
            size="small"
            style="margin-left: 1rem"
            icon="el-icon-search"
            @click="searchComments"
        >
          搜索
        </el-button>
      </div>
    </div>
<!--    表格展示-->
    <el-table
      border
      :data="commentList"
      @selection-change="onSelectionChange"
      v-loading="loading"
      >
<!--      列：多选-->
      <el-table-column type="selection" width="55"/>
<!--      列：头像-->
      <el-table-column label="头像" prop="avatar" align="center" width="120">
        <template slot-scope="scope">
          <img :src="scope.row.avatar" width="40" height="40"/>
        </template>
      </el-table-column>
<!--      列：评论人名称-->
      <el-table-column label="评论者" prop="nickname" align="center" width="120"/>
<!--      列：被回复人名称-->
      <el-table-column label="被回复者" prop="replyNickname" align="center" width="120">
        <template slot-scope="scope">
          <span v-if="scope.row.replyNickname">
            {{ scope.row.replyNickname }}
          </span>
          <span v-else>
            无
          </span>
        </template>
      </el-table-column>
<!--      列：评论文章标题-->
      <el-table-column label="文章标题" prop="articleTitle" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.articleTitle">
            {{ scope.row.articleTitle }}
          </span>
          <span v-else>无</span>
        </template>
      </el-table-column>
<!--      列：评论内容-->
      <el-table-column label="评论内容"  prop="commentContent" align="center" >
        <template slot-scope="scope" >
          <span v-if="scope.row.commentContent" > {{ scope.row.commentContent }}</span>
          <span v-else>无</span>
        </template>
      </el-table-column>
<!--      列：评论时间-->
      <el-table-column label="评论时间" prop="createTime" width="100" align="center">
        <template slot-scope="scope">
          {{formatLocalDateTime(scope.row.createTime)}}
        </template>
      </el-table-column>
<!--      列：审核状态-->
      <el-table-column label="审核状态" prop="isReview" width="80" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.isReview == 0" type="warning">审核中</el-tag>
          <el-tag v-else-if="scope.row.isReview == 1" type="success">正常</el-tag>
        </template>
      </el-table-column>
<!--      列：评论来源-->
      <el-table-column label="评论来源" prop="type" width="80" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.type == 1">文章</el-tag>
          <el-tag v-else-if="scope.row.type == 2" type="warning">友链</el-tag>
          <el-tag v-else-if="scope.row.type == 3" type="danger">说说</el-tag>
        </template>
      </el-table-column>
<!--      列：操作-->
      <el-table-column label="操作" width="160" align="center">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.isReview == 0"
            size="small"
            type="success"
            @click="doUpdateCommentIsReviewed(scope.row.id)"
            >
            通过
          </el-button>
          <el-popconfirm
            style="margin-left: 10px"
            title="确定删除该评论吗？"
            @confirm="deleteComment(scope.row.id)"
            >
            <el-button
              slot="reference"
              size="mini"
              type="danger"
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
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="onSizeChange"
      @cuechange="onCurrentChange"
      />
<!--    dialog-->
    <el-dialog
      :visible.sync="showRemoveDialog"
      width="30%"
      >
      <div class="dialog-title-container" slot="title">
        <i class="el-icon-warning" style="color: #ff9900"/>
        提示
      </div>
      <div>是否彻底删除选中项?</div>
      <div slot="footer">
        <el-button @click="showRemoveDialog = false">取消</el-button>
        <el-button type="danger" @click="deleteSelectedComments">确定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  name: "CommentView",
  created() {
    this.listComments();
  },
  data() {
    return {
      loading: true,
      showRemoveDialog: false,
      //param
      //keywords:用户昵称
      keywords: null,
      isReview: null,
      type: null,
      commentTypes: [
        {
          value: 1,
          label: '文章'
        },
        {
          value: 2,
          label: '友链'
        },
        {
          value: 3,
          label: '说说'
        }
      ],
      //data
      commentList: [],
      commentIdList: [],
      //page
      current: 1,
      size: 10,
      count: 0
    }
  },
  methods: {
    //修改isReview
    changeReview(value) {
      this.isReview = value;
    },
    //查询后台评论
    listComments() {
      let params = {
        current: this.current,
        size: this.size,
        keywords: this.keywords,
        type: this.type,
        isReview: this.isReview
      }
      this.getRequest("/admin/comments", params).then(res => {
        this.commentList = res.data.data.recordList;
        this.count = res.data.data.count;
        this.loading = false;
      })
    },
    searchComments() {
      this.current = 1;
      this.listComments();
    },
    //更新评论的审核状态为通过
    doUpdateSelectedCommentIsReviewed() {
      this.doUpdateCommentIsReviewed(this.commentIdList)
    },
    doUpdateCommentIsReviewed(id) {
      let commentIdList = id.length == undefined ? [id] : [...id];
      let params = {
        idList: commentIdList,
        isReview: 1
      }
      this.putRequest("/admin/comments/review", params).then(res => {
        if (res.data.flag) {
          this.$notify.success({
            title: '成功',
            message: res.data.message
          })
          this.listComments();
        } else {
          this.$notify.error({
            title: '失败',
            message: res.data.message
          })
        }
      })
    },
    //多选事件回调
    onSelectionChange(selectedComment) {
      this.commentIdList = [];
      selectedComment.forEach(comment => {
        this.commentIdList.push(comment.id);
      })
    },
    //删除评论
    deleteSelectedComments() {
      this.deleteComment(this.commentIdList)
    },
    deleteComment(id) {
      let commentIdList = id.length == undefined ? [id] : [...id];
      this.deleteRequest("/admin/comments", commentIdList).then(res => {
        if (res.data.flag) {
          this.$notify.success({
            title: "成功",
            message: res.data.message
          });
          this.listComments();
        } else {
          this.$notify.error({
            title: "失败",
            message: res.data.message
          });
        }
        this.showRemoveDialog = false;
      })
    },
    //page
    onSizeChange(newSize) {
      this.size = newSize;
      this.listComments();
    },
    onCurrentChange(newCur) {
      this.current = newCur;
      this.listComments();
    }
  },
  computed: {
    //激活标签样式
    isActive() {
      return function (reviewValue) {
        return this.isReview == reviewValue ? 'active-review' : 'review';
      };
    },
    //格式化LocalDateTime
    formatLocalDateTime() {
      return function (dateStr) {
        return this.$dayjs(dateStr).format("YYYY年MM月DD日 HH时mm分ss秒");
      };
    }
  },
  watch: {
    isReview() {
      this.current = 1;
      this.listComments();
    },
    //选择框选择
    type() {
      this.current = 1;
      this.listComments();
    }
  }
}
</script>

<style scoped>
  .is-review-menu {
    color: #999;
  }
  .is-review-menu span {
    margin-right: 24px;
  }
  .review {
    cursor: pointer;
  }
  .active-review {
    cursor: pointer;
    font-size: 1.1rem;
    color: #333;
    font-weight: bold;
  }
  .operation-filter {
    margin-left: auto;
    display: flex;
    align-items: center;

  }

</style>