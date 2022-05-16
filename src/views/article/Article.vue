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
<!--      文章数据-->
      <el-form
          label-width="80px"
          size="medium"
          :model="article"
          >
<!--        form-item:文章分类-->
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
<!--          分类候补选项-->
          <el-popover
            placement="bottom-start"
            width="460"
            trigger="click"
            v-if="!article.categoryName"
            >
            <!--          添加分类-->
            <el-button
                type="success"
                plain
                slot="reference"
                size="small"
            >
              添加分类
            </el-button>
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
<!--              https://blog.csdn.net/mouday/article/details/107426163-->
              <template slot-scope="{item}">
                <div>{{item}}</div>
              </template>
            </el-autocomplete>
            <!--          分类显示-->
            <div class="popover-container">
              <div
                  v-for="category of categoryList"
                  :key="category.id"
                  class="category-item"
                  @close="addCategory(category)"
              >
                {{ category.categoryName }}
              </div>
            </div>

          </el-popover>

        </el-form-item>
<!--        form-item:文章标签-->
        <el-form-item label="文章标签">
<!--          tag:-->
          <el-tag
            v-for="(tag, index) of article.tagNameList"
            :key="index"
            style="margin: 0 1rem 0 0"
            :closable="true"
            @close="removeTag(tag)"
            >
            {{ tag }}
          </el-tag>
<!--          popover-->
          <el-popover
            placement="bottom-start"
            width="460"
            trigger="click"
            v-if="article.tagNameList.length < 3"
            >
            <el-button
              type="primary"
              plain
              slot="reference"
              size="small"
              >
              添加标签
            </el-button>
            <div class="popover-title">标签</div>
<!--            标签搜索候补-->
            <el-autocomplete
              style="width: 100%"
              v-model="tagName"
              :fetch-suggestions="searchTags"
              placeholder="请输入标签名搜索，按回车键可以添加自定义标签"
              :trigger-on-focus="false"
              @keyup.enter.native="saveTag"
              @select="handleSelectTag"
              >
              <template slot-scope="{ item }">
                {{item.tagName}}
              </template>
            </el-autocomplete>
<!--            已有标签-->
            <div class="popover-container">
<!--              <div style="margin-bottom: 1rem">添加标签</div>-->
              <el-tag
                v-for="(tag, index) of tagList"
                :key="index"
                :class="tagClass(tag)"
                @click="addTag(tag.tagName)"
                >
                {{ tag.tagName }}
              </el-tag>
            </div>
          </el-popover>
        </el-form-item>
<!--        form-item:文章类型-->
        <el-form-item label="文章类型">
          <el-select
            v-model="article.type"
            placeholder="请选择类型"
            >
            <el-option
              v-for="(type, index) of typeList"
              :key="index"
              :label="type.desc"
              :value="type.type"
              >
            </el-option>
          </el-select>
        </el-form-item>
<!--        form-item:原文地址-->
        <el-form-item label="原文地址" v-if="article.type !== 1">
          <input
            v-model="article.originalUrl"
            placeholder="请填写原文地址"
            />
        </el-form-item>
<!--        form-item:上传封面-->
        <el-form-item label="上传封面">
          <el-upload
            class="upload-cover"
            drag
            action="/api/admin/articles/images"
            multiple
            :before-upload="beforeUpload"
            :on-success="uploadCover"
            >

          </el-upload>
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
      tagName: "",
      categoryList: [],
      tagList: [],
      typeList: [
        {
          type: 1,
          desc: '原创'
        },
        {
          type: 2,
          desc: '转载'
        },
        {
          type: 3,
          desc: '翻译'
        }
      ],
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
  computed: {
    tagClass() {
      return function (tag) {
        const index = this.article.tagNameList.indexOf(tag.tagName);
        return index !== -1 ? "tag-item-select" : "tag-item";
      };
    }
  },
  methods: {
    //TODO 发送图片前
    beforeUpload() {

    },
    //TODO 封面
    uploadCover() {

    },
    //保存标签
    saveTag() {
      if (this.tagName.trim() !== "") {
        this.addTag(this.tagName);
        this.tagName = "";
      }
    },
    //添加标签
    addTag(tagName) {
      if (this.article.tagNameList.indexOf(tagName) === -1) {
        //找不到就添加
        this.article.tagNameList.push(tagName);
      }
    },
    //TODO 搜索标签
    searchTags(keywords, cb) {
      let result = this.tagList.filter(tag => {
        if (tag.tagName.toLowerCase().indexOf(keywords.toLowerCase()) > -1) {
          return true;
        }
      });
      cb(result);
      // let params = {
      //   keywords
      // }
      // this.axios.get("/api/admin/tags/search", {params}).then(res => {
      //   cb(res.data.data)
      // })
    },
    //处理点击标签候选
    handleSelectTag(tag) {
      this.addTag(tag.tagName)
    },
    //移除标签
    removeTag(tag) {
      const index = this.article.tagNameList.indexOf(tag);
      this.article.tagNameList.splice(index, 1);
    },
    //查询 目录
    listCategories() {
      //搜索全部
      this.getRequest("/admin/categories/search").then(res => {
        console.log("搜索到的所有分类：")
        console.table(res.data.data)
        this.categoryList =  res.data.data;
      })
    },
    //查询 标签
    listTags() {
      this.getRequest("/admin/tags/search").then(res => {
        console.log("搜索到的所有分类：")
        console.table(res.data.data)
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
      let result = this.categoryList.filter(category => {
        if (category.categoryName.toLowerCase().indexOf(keywords.toLowerCase()) > -1) {
          return true;
        }
      });
      cb(result);
      // let params = {
      //   keywords
      // }
      // this.axios
      //     .get("/api/admin/categories/search",{ params })
      //     .then(res => {
      //       console.log("搜索结果")
      //       console.table(res.data.data)
      //       cb(res.data.data)
      //     })
    },
    //保存
    saveCategory() {
      if (this.categoryName.trim() !== "") {
        this.article.categoryName = this.categoryName
        this.categoryName = ""
      }
    },
    addCategory(item) {
      this.article.categoryName = item.categoryName;
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
          //启用自动上传 && 不存在articleId
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