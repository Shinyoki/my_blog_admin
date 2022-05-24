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
    </div>
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
      let messageIdList = id.len == undefined ? [id] : [...id];
      let params = {
        idList: messageIdList,
        isReview: 1
      }
      //TODO UPDATE
    }
  },
  computed: {
    isActive() {
      return function (isReview) {
        return this.isReview == isReview ? "active-review" : 'review';
      };
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