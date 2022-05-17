<template>
  <el-card class="main-card">
    <div class="card-container-title">{{this.$route.name}} </div>
<!--    文章状态-->
    <div class="article-status-menu" style="margin-top: 1.25rem">
      <span>文章状态</span>
      <span @click="changeStatus('all')" :class="isActive('all')">全部</span>
      <span @click="changeStatus('public')" :class="isActive('public')">公开</span>
      <span @click="changeStatus('secret')" :class="isActive('secret')">私密</span>
      <span @click="changeStatus('draft')" :class="isActive('draft')">草稿箱</span>
      <span @click="changeStatus('delete')" :class="isActive('delete')">回收站</span>
    </div>
<!--    表格：操作-->
    <div class="operation-container">
<!--      删除按钮：isDelete == 0，-->
      <el-button
        type="danger"
        size="small"
        icon="el-icon-delete"
        @click="updateDeletedArticle = true"
        v-if="isDelete === 0"
        :disabled="articleIdList.length === 0"
        >
        批量删除
      </el-button>
      <el-button
        v-else
        type="danger"
        size="small"
        icon="el-icon-delete"
        :disabled="articleIdList.length === 0"
        @click="remove = true"
        >
        批量删除
      </el-button>

    </div>
  </el-card>
</template>

<script>
export default {
  name: "ArticleList",
  created() {
    this.listArticles();
    this.listCategories();
    this.listTags();
  },
  data() {
    return {
      updateDeletedArticle: false,
      remove: false,
      typeList: [
        {
          value: 1,
          label: '原创'
        },
        {
          value: 2,
          label: '转载'
        },
        {
          value: 3,
          label: '翻译'
        }
      ],
      //element 遮罩
      loading: true,
      //当前选中的状态
      activeStatus: 'all',

      //文章集合
      articleList: [],
      //以选择的文章ids
      articleIdList: [],
      tagList: [],

      //查询用
      //已删除 false: 0, true: 1
      isDelete: 0,
      //状态：1公开 2私密 3草稿
      status: null,
      categoryId: null,
      tagId: null,
      keywords: null,
      //1原创 2转载 3翻译
      type: null,
      //page
      current: 1,
      size: 10,
      //查询结果总数
      count: 0
    }
  },
  methods: {
    //查询所有文章
    listArticles() {
      let params = {
        //分页
        current: this.current,
        size: this.size,
        //查询
        keywords: this.keywords,
        categoryId: this.categoryId,
        status: this.status,
        tagId: this.tagId,
        type: this.type,
        isDelete: this.isDelete
      }
      this.getRequest("/admin/articles",{ params }).then(res => {
        console.log("查询结果")
        console.log(res.data.data);
        this.articleList = res.data.data.recordList;
        this.count = res.data.data.count;
        this.loading = false;
      })
    },
    //查询 目录
    listCategories() {
      //搜索全部
      this.getRequest("/admin/categories/search").then(res => {
        this.categoryList =  res.data.data;
      })
    },
    //查询 标签
    listTags() {
      this.getRequest("/admin/tags/search").then(res => {
        this.tagList = res.data.data;
      })
    },
    //选择状态
    changeStatus(status) {
      this.current = 1;
      this.activeStatus = status;
      switch (status) {
        case 'all':
          this.isDelete = 0;
          this.status = null;
          break;
        case 'public':
          this.isDelete = 0;
          this.status = 1;
          break;
        case 'secret':
          this.isDelete = 0;
          this.status = 2;
          break;
        case 'draft':
          this.isDelete = 0;
          this.status = 3;
          break;
        case 'delete':
          this.isDelete = 1;
          this.status = null;
          break;
      }
    }
  },
  computed: {
    //选中标签时的样式
    isActive() {
      return function (status) {
        return this.activeStatus === status ? "active-status" : "status";
      };
    }
  }
}
</script>

<style scoped>

</style>