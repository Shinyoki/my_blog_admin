<template>
  <el-card class="main-card">
    <div class="title">{{ this.$route.name }}</div>
<!--    修改：文章标题-->
    <div class="article-title-container">
<!--      输入-保存-发布-->
      <el-input
        v-model="article.articleTitle"
        size="medium"
        placeholder="输入文章标题"
        />
      <el-button
        type="danger"
        size="medium"
        class="save-btn"
        @click="saveArticleDraft"
        v-if="null == article.id || article.status == 3"
        >
        保存草稿
      </el-button>
      <el-button
        type="danger"
        size="medium"
        @click="openModel"
        style="margin-left: 10px"
        >
        发布文章
      </el-button>
    </div>
<!--    修改：文章内容-->
    <mavon-editor
      ref="mdEditor"
      v-model="article.articleContent"
      @imgAdd="uploadImg"
      style="height: calc(100vh - 260px)"
      />
    <!--  弹出框-->
    <el-dialog
        :visible.sync="addOrEdit"
        width="60%"
        itemprop="3vh"
    >
      <div class="dialog-title-container" slot="title">
        发布文章
      </div>
<!--      文章数据：分类相关-->
      <el-form
          label-width="80px"
          size="medium"
          :model="article"
          >
<!--        文章分类-->
        <el-form-item label="文章分类">
          <el-tag
            type="success"
            v-show="article.categoryName"
            style="margin: 0 1rem 0 0"
            :closable="true"
            @close="removeCategory"
            >
            {{ article.categoryName }}
          </el-tag>
<!--          分类选项-->
          <el-popover
            placement="bottom-start"
            width="460"
            trigger="click"
            v-if="!article.categoryName"
            >
            <div class="popover-title">分类</div>
<!--            搜索框：带输入建议-->
            <el-autocomplete
              style="width: 100%"
              v-model="categoryName"
              :fetch-suggestions="searchCategories"
              placeholder="请输入分类名来搜索，按回车键可以添加自定义分类"
              :trigger-on-focus="false"
              @keyup.enter.native="saveCategory"
              @select="handleSelectCategories"
              >

            </el-autocomplete>
          </el-popover>

        </el-form-item>
      </el-form>
    </el-dialog>
  </el-card>


</template>

<script>
export default {
  name: "ArticleView",
  created() {
    const path = this.$route.path;
    const pathArr = path.split("/");
    const articleId = pathArr[2];
    this.$message.success(path)
    if (articleId) {
      this.getRequest("/admin/articles/" + articleId).then(res => {
        //有id就初始化为对应article
        this.article = res.data.data;
      })
    } else {
      //没有就去sessionStorage里取
      const article = sessionStorage.getItem("article");
      if (article) {
        this.article = JSON.parse(article);
      }
    }
  },
  destroyed() {
    //自动保存
    this.autoSaveArticle();
  },
  data() {
    return {
      categoryName: "",
      categoryList: [],
      tagList: [],
      article: {
        id: null,
        articleTitle: this.$dayjs(new Date()).format("YYYY-MM-DD"),
        articleContent: "",
        articleCover: "",
        categoryName: null,
        tagNameList: [],
        originalUrl: "",
        isTop: 0,
        type: 1,
        status: 1 //1.公开 2.私密 3.评论可见
      },
      addOrEdit: false,
      autoSave: true
    }
  },
  methods: {
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
    //不显示分类标签
    removeCategory() {
      this.article.categoryName = null
    },
    //验证
    valid() {
      if (this.article.articleTitle.trim() === "") {
        this.$message.error("文章标题不能为空")
        return false;
      }
      if (this.article.articleContent.trim() === "") {
        this.$message.error("文章内容不能为空")
        return false;
      }
      return true;
    },
    // 保存文章草稿
    saveArticleDraft() {
      if (!this.valid()) {
        return false;
      }
      //草稿模式下不会保存文章的分类
      this.article.status = 3;
      this.postRequest("/admin/articles", this.article).then(res => {
        if (res.data.flag) {
          this.$notify.success({
            title: '成功',
            message: '保存草稿成功'
          })
        } else {
          this.$notify.error({
            title: '失败',
            message: '保存草稿失败'
          })
        }
      })
      //保存完草稿，不需要自动保存
      this.autoSave = false;
    },
    // 发布前的弹窗确认
    openModel() {
      if (!this.valid()) {
        return false;
      }
      this.listCategories();
      this.listTags();

      this.addOrEdit = true
    },
    //TODO mavon-editor 添加图标事件回调函数
    uploadImg() {

    },
    //TODO 搜索建议
    searchCategories(keywords, cb) {
      let params = {
        keywords
      }
      this.axios
          .get("/api/admin/categories/search",{ params })
          .then(res => {
            console.log("搜索结果")
            console.log(res.data.data)
            cb(res.data.data)
          })
    },
    //保存
    saveCategory() {
      if (this.categoryName.trim() !== "") {
        this.article.categoryName = this.categoryName
        this.categoryName = ""
      }
    },
    //选中候选内容处理
    handleSelectCategories(item) {
      this.article.categoryName = item.categoryName
    },
    //执行自动保存
    autoSaveArticle() {
      if (
          //启用自动上传 && 验证通过 && 已有articleId
          this.autoSave &&
          this.valid()  &&
          this.article.id != null
      ) {
        //上传到服务器
        this.postRequest("/admin/articles", this.article).then(res => {
          if (res.data.flag) {
            this.$notify.success({
              title: '成功',
              message: '自动保存成功'
            })
          } else {
            this.$notify.error({
              title: '失败',
              message: '自动保存失败'
            })
          }
        });
      }
      if (
          //启用自动上传 && 没有已有的articleId
          this.autoSave &&
          this.article.id == null
      ) {
        //临时存储到sessionStorage中
        sessionStorage.setItem("article", JSON.stringify(this.article));
      }
    }
  }

}
</script>

<style scoped>
 .container {
   background-color: red;
 }
</style>