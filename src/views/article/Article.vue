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
  data() {
    return {
      categoryName: "",
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
      addOrEdit: true
    }
  },
  methods: {
    //TODO 保存文章草稿
    saveArticleDraft() {
      if (this.article.articleTitle.trim() === "") {
        this.$message.error("文章标题不能为空")
        return false;
      }
      if (this.article.articleContent.trim() === "") {
        this.$message.error("文章内容不能为空")
        return false;
      }

    },
    //TODO 发布前的弹窗确认
    openModel() {

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
    saveCategory() {
      if (this.categoryName.trim() !== "") {
        this.article.categoryName = this.categoryName
        this.categoryName = ""
      }
    },
    handleSelectCategories(item) {
      console.log("点击了候选内容")
      console.log(item)
    }
    // setCategory()?
  }

}
</script>

<style scoped>
 .container {
   background-color: red;
 }
</style>