<template>
  <el-card class="main-card">
    <div class="card-container-title">{{this.$route.name}} </div>
<!--    文章状态-->
    <div class="article-status-menu" style="margin-top: 1.55rem">
<!--      <span style="font-weight: bold; color: black">状态：</span>-->
      <span @click="changeStatus('all')" :class="isActive('all')">全部</span>
      <span @click="changeStatus('public')" :class="isActive('public')">公开</span>
      <span @click="changeStatus('secret')" :class="isActive('secret')">私密</span>
      <span @click="changeStatus('draft')" :class="isActive('draft')">草稿箱</span>
      <span @click="changeStatus('delete')" :class="isActive('delete')">回收站</span>
    </div>
<!--    表格操作：删除/筛选-->
    <div class="operation-container">
<!--      删除按钮：isDelete == 0，-->
      <el-button
        type="danger"
        size="small"
        icon="el-icon-delete"
        @click="showLogicDeleteUpdateDialog = true"
        v-if="isDelete == 0"
        :disabled="articleIdList.length == 0"
        >
        移入回收站
      </el-button>
      <el-button
        v-else
        type="danger"
        size="small"
        icon="el-icon-delete"
        :disabled="articleIdList.length === 0"
        @click="showTotalRemoveDialog = true"
        >
        完全删除
      </el-button>

<!--      批量 逻辑删除 弹出框-->
      <el-dialog
        :visible.sync="showLogicDeleteUpdateDialog"
        width="30%"
        >
        <div class="dialog-title-container" slot="title">
          <i class="el-icon-warning" style="color: #ff9900"/> 提示
        </div>
        <div>是否删除选择项？</div>
        <div slot="footer">
          <el-button @click="showLogicDeleteUpdateDialog = false">取消</el-button>
          <el-button type="danger" @click="updateArticleIdListDelete">确定</el-button>
        </div>
      </el-dialog>
<!--      批量 完全删除 弹出框-->
      <el-dialog :visible="showTotalRemoveDialog" width="30%">
        <div class="dialog-title-container" slot="title">
          <i class="el-icon-warning" style="color: #ff9900"/> 提示
        </div>
        <div>是否要彻底删除选中项</div>
        <div slot="footer">
          <el-button @click="showTotalRemoveDialog = false">取消</el-button>
          <el-button type="danger" @click="totalDeleteArticleIds">确定</el-button>
        </div>
      </el-dialog>
      <!--筛选栏-->
      <div class="operation-container" style="margin-left: auto">
<!--        选择：文章类型-->
        <el-select
          clearable
          v-model="type"
          size="small"
          placeholder="文章类型"
          >
          <el-option
            v-for="(type, index) of typeList"
            :key="index"
            :label="type.label"
            :value="type.value"
            />
        </el-select>
<!--        选择：分类-->
        <el-select
          clearable
          filterable
          size="small"
          style="margin-left: 1rem"
          placeholder="所属分类"
          v-model="categoryId"
          >
          <el-option
            v-for="(category, index) of categoryList"
            :key="index"
            :label="category.categoryName"
            :value="category.id"
            />
        </el-select>
<!--        选择：标签-->
        <el-select
          clearable
          filterable
          size="small"
          placeholder="文章标签"
          style="margin-left: 1rem"
          v-model="tagId"
          >
          <el-option
            v-for="(tag, index) of tagList"
            :key="index"
            :label="tag.tagName"
            :value="tag.id"
            />
        </el-select>
<!--        输入：文章名-->
        <el-input
          clearable
          size="small"
          v-model="keywords"
          @keyup.enter.native="searchArticles"
          prefix-icon="el-icon-search"
          placeholder="文章名"
          style="margin-left: 15px"
          >
        </el-input>
        <el-button
          type="primary"
          size="small"
          icon="el-icon-search"
          style="margin: 0 1rem"
          @click="searchArticles"
          >
          搜索
        </el-button>
      </div>
    </div>

<!--    表格：展示-->
    <el-table
      border
      :data="articleList"
      @selection-change="selectionChange"
      v-loading="loading"
      >
<!--    选择列-->
      <el-table-column type="selection" width="55"/>
<!--      列：文章封面-->
      <el-table-column
        prop="articleCover"
        label="文章封面"
        width="180"
        >
<!--        饿了么表格显示图片-->
<!--        https://blog.csdn.net/Feast_aw/article/details/80945399-->
        <template slot-scope="scope">
<!--          图片-->
          <el-image
            class="article-cover"
            :src="scope.row.articleCover ? scope.row.articleCover : 'https://cdn.jsdelivr.net/gh/Shinyoki/images_repository/blog_imagesdefalutArticleCover.png'"
            />
<!--          图标-->
          <i
            v-if="scope.row.status === 1"
            class="iconfont el-icon-gongkai article-status-icon"/>
          <i
            v-else-if="scope.row.status === 2"
            class="iconfont el-icon-mima article-status-icon"/>
          <i
            v-else-if="scope.row.status === 3"
            class="iconfont el-icon-caogaoxiang article-status-icon"/>
        </template>
      </el-table-column>
<!--      列：文章标题-->
      <el-table-column prop="articleTitle" label="标题" align="center"/>
<!--      列：文章分类-->
      <el-table-column prop="categoryName" label="分类" width="110" align="center" />
<!--      列：文章标签-->
      <el-table-column
        prop="tagDTOList"
        label="标签"
        width="170"
        align="center"
        >
        <template slot-scope="scope">
          <el-tag
            v-for="(tag, index) of scope.row.tagDTOList"
            :key="index"
            style="margin-right: .2rem; margin-top: .2rem"
            >
            {{tag.tagName}}
          </el-tag>
        </template>
      </el-table-column>
<!--      列：文章浏览量-->
      <el-table-column
        prop="viewsCount"
        label="浏览量"
        width="70"
        align="center"
        >
        <template slot-scope="scope">
          <span v-if="scope.row.viewsCount">
            {{scope.row.viewsCount}}
          </span>
          <span v-else>
            0
          </span>
        </template>
      </el-table-column>
<!--      列：文章点赞量-->
      <el-table-column
        prop="likeCount"
        label="点赞量"
        width="70"
        align="center"
        >
        <template slot-scope="scope">
          <span v-if="scope.row.likeCount">
            {{ scope.row.likeCount }}
          </span>
          <span v-else>
            0
          </span>
        </template>
      </el-table-column>
<!--      列：文章类型-->
      <el-table-column
        prop="type"
        label="类型"
        width="80"
        align="center"
        >
        <template slot-scope="scope">
          <el-tag :type="calcArticleType(scope.row.type).tagType">
            {{ calcArticleType(scope.row.type).tagName }}
          </el-tag>
        </template>
      </el-table-column>
<!--      列：文章发表时间-->
      <el-table-column
        prop="createTime"
        label="发表时间"
        width="130"
        align="center"
        >
        <template slot-scope="scope">
          <i class="el-icon-time" style="margin-right: 5px"/>
          {{ formatLocalDateTime(scope.row.createTime) }}
        </template>
      </el-table-column>
<!--      列：文章置顶-->
      <el-table-column
        prop="isTop"
        label="置顶"
        width="80"
        align="center"
        >
        <!--        TODO 待修复isTop渲染问题-->
        <template slot-scope="scope">
          {{ scope.row.isTop }}
          <el-switch
            v-model="scope.row.isTop"
            :active-value="true"
            :inactive-value="false"
            :disabled="scope.row.isDelete == 1"
            active-color="#13ce66"
            inactive-color="#F4F4F5"
            @change="changeTop(scope.row)"
            ></el-switch>
        </template>
      </el-table-column>
<!--      列：编辑 删除 回收站恢复-->
      <el-table-column
        label="操作"
        width="150"
        align="center"
        >
        <template slot-scope="scope">
<!--          编辑-->
          <el-button
              type="primary"
              size="small"
              v-if="scope.row.isDelete == 0"
              @click="editArticle(scope.row.id)"
              >
            编辑
          </el-button>
<!--          确认删除（当文章逻辑删除为假时出现）-->
          <el-popconfirm
            title="确定要删除吗?"
            style="margin-left: 10px"
            @confirm="updateArticleDelete(scope.row.id)"
            v-if="scope.row.isDelete == 0"
            >
            <el-button
                slot="reference"
                size="small"
                type="danger"
                >
              删除
            </el-button>
          </el-popconfirm>
<!--          确认恢复：（当文章逻辑删除为真时出现） -->
          <el-popconfirm
            title="确认恢复吗?"
            @confirm="updateArticleDelete(scope.row.id)"
            v-if="scope.row.isDelete == 1"
            >
            <el-button
              type="success"
              size="small"
              slot="reference"
              >
              恢复
            </el-button>
          </el-popconfirm>
<!--          彻底删除：忽略逻辑删除，直接remove掉数据-->
          <el-popconfirm
            style="margin-left: 10px"
            v-if="scope.row.isDelete == 1"
            title="这将完全删除回收站内的数据，真的要彻底删除吗？"
            @confirm="totalDeleteArticle(scope.row.id)"
            >
            <el-button
              type="danger"
              size="small"
              slot="reference"
              >
              完全删除
            </el-button>
          </el-popconfirm>

        </template>
      </el-table-column>
    </el-table>
<!--    分页-->
    <el-pagination
      class="pagination-container"
      background
      :current-page="current"
      :page-size="size"
      :page-sizes="[10, 20]"
      :total="count"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="sizeChange"
      @current-change="currentChange"
      />
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
      showLogicDeleteUpdateDialog: false,
      showTotalRemoveDialog: false,
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
      //默认封面
      defaultArticleCover: 'https://cdn.jsdelivr.net/gh/Shinyoki/images_repository/blog_images/defalutArticleCover.png',

      //文章集合
      articleList: [],
      //以选择的文章ids
      articleIdList: [],
      categoryList: [],
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
    //当总数有变化时
    sizeChange(newSize) {
      //初始化查询用参数size
      this.size = newSize
      this.listArticles()
    },
    //当前页有变化时
    currentChange(newCur) {
      this.current = newCur;
      this.listArticles();
    },
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
      this.axios.get("/api/admin/articles",{ params }).then(res => {
        console.log(res)
        this.articleList = res.data.data.recordList;
        this.count = res.data.data.count;
        this.loading = false;
        console.log(this.count)
      })
    },
    //查询对应文章
    searchArticles() {
      //需要重新定位
      this.current = 1;
      this.listArticles();
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
      this.current = 1;
      this.activeStatus = status;
    },
    //多选时
    selectionChange(selectedArticles) {
      this.articleIdList = [];
      selectedArticles.forEach(article => {
        this.articleIdList.push(article.id)
      })
    },
    //修改文章的 置顶状态
    changeTop(curArticle) {
      let params = {
              id: curArticle.id,
              isTop: curArticle.isTop == true ? 1 : 0
            }
      this.putRequest("/admin/articles/top", params)
          .then(( res ) => {
            if (res.data.flag) {
              this.$notify.success({
                title: "成功",
                message: "置顶成功"
              });
            } else {
              this.$notify.error({
                title: "失败",
                message: res.data.message
              });
            }
            this.showTotalRemoveDialog = false;
          });
    },
    //编辑文章：带着ArticleId跳转到文章发布页，读取并saveOrUpdate
    editArticle(articleId) {
      this.$router.push({path: '/articles/' + articleId})
    },
    //更新articleIdList对应文章的逻辑删除状态
    updateArticleIdListDelete() {
      this.updateArticleDelete(...this.articleIdList)
    },
    //更新文章的isDelete状态
    updateArticleDelete(articleId) {
      let params = {
        idList: [articleId],
        //取反
        isDelete: this.isDelete == 0 ? 1 : 0
      };
      this.putRequest("/admin/articles", params).then(res => {
        if (res.data.flag) {
          this.$notify.success({
            title: '成功',
            message: res.data.message
          })
          //初始化
          this.listArticles();
        } else {
          this.$notify.error({
            title: '失败',
            message: res.data.message
          })
        }

        this.showLogicDeleteUpdateDialog = false;
      });

    },
    //彻底删除articleIdList对应文章
    totalDeleteArticleIds() {
      this.totalDeleteArticle(this.articleIdList)
    },
    //完全删除（忽略逻辑删除状态）
    totalDeleteArticle(articleId) {
      let articleIdList = articleId.length === undefined ? [articleId] : [...articleId];
      this.deleteRequest("/admin/articles", articleIdList).then(res => {
        if (res.data.flag) {
          this.$notify.success({
            title: "成功",
            message: res.data.message
          });
          //初始化
          this.listArticles();
        } else {
          this.$notify.error({
            title: "失败",
            message: res.data.message
          });
        }

        this.showTotalRemoveDialog = false;
      });

    }
  },
  computed: {
    //选中标签时的样式
    isActive() {
      return function (status) {
        return this.activeStatus === status ? "active-status" : "status";
      };
    },
    //计算文章类型为相应tag
    calcArticleType() {
      return function (type) {
        let tagType = '', tagName = '';
        switch (type) {
          case 1:
            tagType = 'danger';
            tagName = '原创'
            break;
          case 2:
            tagType = 'success';
            tagName = '转载';
            break;
          case 3:
            tagType = 'primary';
            tagName = '翻译';
            break;
        }
        return {
          tagType,
          tagName
        }
      }
    },
    //格式化日期
    formatLocalDateTime() {
      return function (dateStr) {
        return this.$dayjs(dateStr).format("YYYY年MM月DD日 HH点mm分ss秒")
      }
    }
  },
  watch: {
    /**
     * 对scope.row.中的元素进行修改时
     */
    //文章类型
    type() {
      this.current = 1;
      this.listArticles();
    },
    //分类ID
    categoryId() {
      this.current = 1;
      this.listArticles();
    },
    //标签id
    tagId() {
      this.current = 1;
      this.listArticles();
    },
    //逻辑删除
    isDelete() {
      this.current = 1;
      this.listArticles();
    },
    //文章状态
    status() {
      this.current = 1;
      this.listArticles();
    }
  }
}
</script>

<style lang="less" scoped>
 .article-status-menu {
   font-size: 14px;
   color: #999;

   span {
     margin-right: 24px;
   }

   .status {
     cursor: pointer;
   }

   .active-status {
     cursor: pointer;
     color: #333;
     font-weight: bold;
   }
 }

// 封面
 .article-cover {
   position: relative;
   width: 100%;
   height: 90px;
   border-radius: 4px;

   &:after {
     position: absolute;
     top: 0;
     bottom: 0;
     left: 0;
     right: 0;
     content: '';
     //加深颜色，突出图标
     background: rgba(0, 0, 0, .2);
   }
 }
// 封面图标
 .article-status-icon {
   position: absolute;
   right: 1rem;
   bottom: 1.4rem;

   color: #fff;
   font-size: 1.5rem;

 }
</style>