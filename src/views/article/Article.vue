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
      @imgAdd="uploadImgForMavon"
      style="height: calc(100vh - 260px)"
      />
    <!--  弹出框-->
    <el-dialog
        :visible.sync="addOrEdit"
        width="60%"
        itemprop="3vh"
    >
      <div class="dialog-title-container" slot="title">
        <i class="el-icon-warning" style="color:#ff9900" />发布文章
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
                <div>{{item.categoryName}}</div>
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
            :multiple="false"
            :before-upload="beforeUpload"
            :on-success="uploadCover"
            >
<!--            没封面-->
            <i class="el-icon-upload" v-if="article.articleCover === ''"></i>
            <div class="el-upload__text" v-if="article.articleCover === ''">将文件拖到此处，或<em>点击上传</em></div>
<!--            有封面-->
            <img
              v-else
              :src="article.articleCover"
              width="360px"
              height="180px"
              />
          </el-upload>
        </el-form-item>
<!--        form-item:置顶-->
        <el-form-item label="置顶">
          <el-switch
            v-model="article.isTop"
            active-color="#13ce66"
            inactive-color="#F4F4F5"
            :active-value="1"
            :inactive-value="0"
            />
        </el-form-item>
<!--        form-item:发布形式-->
        <el-form-item label="发布形式">
          <el-radio-group v-model="article.status">
            <el-radio :label="1">公开</el-radio>
            <el-radio :label="2">私密</el-radio>
            <el-radio :label="3">评论可见</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
<!--      弹出框页脚-->
      <div slot="footer">
        <el-button @click="addOrEdit = false">取消编辑</el-button>
        <el-button type="danger" @click="saveOrUpdateArticle">发表</el-button>
      </div>
    </el-dialog>
  </el-card>


</template>

<script>
//图片压缩工具
import * as imageConversion from "image-conversion"
export default {
  name: "ArticleView",
  created() {
    const path = this.$route.path;
    const pathArr = path.split("/");
    const articleId = pathArr[2];
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
    //销毁页面时自动保存
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
    // 发送图片前
    beforeUpload(file) {
      //https://developer.mozilla.org/zh-CN/docs/Web/API/File
      //上传文件之前的钩子，参数为上传的文件，若返回 false 或者返回 Promise 且被 reject，则停止上传。
      return new Promise(resolve => {
        if ((file.size / 1024) < this.config.UPLOAD_SIZE) {
          //小于200kb，正常执行
          resolve(file);
        } else {
          //https://github.com/WangYuLue/image-conversion
          //压缩到200kb
          imageConversion.compressAccurately(file, this.config.UPLOAD_SIZE)
              .then(resFile => {
                resolve(resFile);
              });
        }
      })
    },
    // 封面
    uploadCover(res) {
      console.log("更新上传后的封面")
      console.log(res.data)
      this.article.articleCover = res.data
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
    // 搜索标签
    searchTags(keywords, cb) {
      let result = this.tagList.filter(tag => {
        if (tag.tagName.toLowerCase().indexOf(keywords.toLowerCase()) > -1) {
          return true;
        }
      });
      cb(result);
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
    //保存或更新文章
    saveOrUpdateArticle() {
      if (this.article.articleTitle.trim() === '') {
        this.$message.error("文章标题不能为空")
        return false;
      }
      if (this.article.articleContent.trim() === '') {
        this.$message.error("文章内容不能为空")
        return false;
      }
      if (this.article.categoryName === null) {
        this.$message.error("文章分类不能为空")
        return false;
      }
      if (this.article.tagNameList.length === 0) {
        this.$message.error("文章标签不能为空")
        return false;
      }
      if (this.article.articleCover === '') {
        this.$message.error("文章封面不能为空")
        return false;
      }

      this.postRequest("/admin/articles", this.article).then(res => {
        this.addOrEdit = false;
        if (res.data.flag) {
          this.$notify.success({
            title: '成功',
            message: res.data.message
          })
        } else {
          this.$notify.error({
            title: '失败',
            message: res.data.message
          })
        }
      })
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
    uploadImgForMavon(fileIndex, file) {
      //https://github.com/hinesboy/mavonEditor#%E5%9B%BE%E7%89%87%E4%B8%8A%E4%BC%A0
      let formData = new FormData();
      if ((file.size / 1024) < this.config.UPLOAD_SIZE) {
        //添加元素
        formData.append('file', file);
        console.log("表单元素");
        console.log(formData);
        this.postRequest("admin/articles/images", formData).then(res => {
          this.$refs.mdEditor.$img2Url(fileIndex, res.data.data);
        });
      } else {
        //压缩并将压缩后的元素添加
        imageConversion.compressAccurately(file, this.config.UPLOAD_SIZE)
            .then(compressedFile => {
              formData.append('file',
                  new window.File([compressedFile], file.name, {type: file.type})
              )
            });
        this.postRequest("/admin/articles/images", formData).then(res => {
          this.$refs.mdEditor.$img2Url(fileIndex, res.data.data)
        })
      }

    },
    // 搜索建议
    searchCategories(keywords, cb) {
      let result = this.categoryList.filter(category => {
        if (category.categoryName.toLowerCase().indexOf(keywords.toLowerCase()) > -1) {
          return true;
        }
      });
      cb(result);
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

<style lang="less" scoped>
 .main-card {
   .article-title-container {
     display: flex;
     //align-items: center;

     margin-bottom: 1.25rem;
     margin-top: 2.25rem;

     .save-btn {
       margin-left: .75rem;
       background-color: #fff;
       color: #f56c6c;

       transition: .6s 0s ease-in-out;
       &:hover {
         background-color: #f68989;
         color: #fff;
       }
     }

   }


 }
 .tag-item {
   margin-right: 1rem;
   margin-bottom: 1rem;
   cursor: pointer;
 }

 .tag-item-select {
   margin-right: 1rem;
   margin-bottom: 1rem;
   cursor: not-allowed;
   color: #ccccd8 !important;
 }

 .popover-container {
   .category-item {
     cursor: pointer;
     padding: .6rem .5rem;

     &:hover {
       background-color: #f0f9eb;
       color: #67c23a;
     }
   }
 }

 .popover-title {
   margin-bottom: 1rem;
   text-align: center;
 }

 .popover-container {
   margin-top: 1rem;
   height: 260px;
   overflow-y: auto;
 }

</style>