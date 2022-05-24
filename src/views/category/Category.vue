<template>
  <el-card class="main-card">
<!--    标题-->
    <div class="card-container-title">{{this.$route.name}}</div>
<!--    操作-->
    <div class="operation-container">
<!--      新增-->
      <el-button
        type="primary"
        size="small"
        icon="el-icon-plus"
        @click="openAEDialog(null)"
        >
        新增
      </el-button>
<!--      批量删除-->
      <el-button
        type="danger"
        size="small"
        icon="el-icon-delete"
        :disabled="this.categoryIdList.length == 0"
        @click="showDeleteDialog = true"
        >
        批量删除
      </el-button>
<!--      搜索筛选-->
      <div style="margin-left: auto; display: flex;">
        <el-input
          size="small"
          placeholder="分类名"
          prefix-icon="el-icon-search"
          v-model="keywords"
          @keyup.enter.native="searchCategories"
          />
        <el-button
          type="primary"
          size="small"
          icon="el-icon-search"
          style="margin-left: 1rem"
          @click="searchCategories"
          >
          搜索
        </el-button>
      </div>
    </div>
<!--    表格展示-->
    <el-table
      border
      v-loading="loading"
      :data="categoryList"
      @selection-change="onSelectionChange"
      >
<!--form：多选-->
      <el-table-column type="selection" width="55"/>
<!--      form：分类名-->
      <el-table-column label="分类名" prop="categoryName" align="center"/>
<!--      form：绑定的文章量-->
      <el-table-column label="文章量" prop="articleCount" align="center"/>
<!--      form：分类创建时间-->
      <el-table-column label="创建时间" prop="createTime" align="center">
        <template slot-scope="scope">
          <i class="el-icon-time" style="margin-right: 5px" />
          {{ formatLocalDateTime(scope.row.createTime) }}
        </template>
      </el-table-column>
<!--      form：操作-->
      <el-table-column label="操作" width="160" align="center">
        <template slot-scope="scope">
<!--          编辑-->
          <el-button
            type="primary"
            size="mini"
            @click="openAEDialog(scope.row)"
            >
            编辑
          </el-button>
<!--          删除-->
          <el-popconfirm
            title="确定删除吗?"
            style="margin-right: 1rem"
            @confirm="deleteCategory(scope.row.id)"
            >
            <el-button type="danger" size="mini" slot="reference">
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
        @current-change="onCurrentChange"
        />
<!--    dialog-->
    <!--      批量删除dialog-->
    <el-dialog :visible.sync="showDeleteDialog" width="30%">
      <!--        标题-->
      <div class="dialog-title-container" slot="title">
        <i class="el-icon-warning" style="color: #ff9900"/>
        提示
      </div>
      <div>是否删除被选中的分类？</div>
      <!--        footer-->
      <div slot="footer">
        <el-button @click="showDeleteDialog = false">取消</el-button>
        <el-button type="danger" @click="deleteSelectedCategories">确定</el-button>
      </div>
    </el-dialog>
<!--    添加/编辑dialog-->
    <el-dialog :visible.sync="showAddOrEditDialog" width="30%">
      <div ref="categoryTitle" slot="title" class="dialog-title-container">
<!--        this.$refs.categoryTitle.innerHtml-->
      </div>
<!--      form-->
      <el-form
        size="medium"
        label-width="80px"
        v-model="categoryForm"
        @submit.native.prevent
        >
        <el-form-item label="分类名">
          <el-input v-model="categoryForm.categoryName"  @keyup.enter.native="doAddOrEdit"/>
        </el-form-item>
      </el-form>
<!--      footer-->
      <div slot="footer">
        <el-button @click="showAddOrEditDialog = false">取消</el-button>
        <el-button type="danger" @click="doAddOrEdit" :disabled="checkAddOrEdit">
          确定
        </el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Category",
  created() {
    this.listCategories();
  },
  data() {
    return {
      loading: true,
      //dialog
      showAddOrEditDialog: false,
      showDeleteDialog: false,
      //page
      current: 0,
      size: 10,
      count: 0,
      //queryParams
      keywords: null,
      //data list
      categoryIdList: [],
      categoryList: [],
      categoryForm: {
        id: null,
        categoryName: ""
      }
    }
  },
  methods: {
    //查询后台分类
    listCategories() {
      let params = {
        current: this.current,
        size: this.size,
        keywords: this.keywords
      }
      this.getRequest("/admin/categories", params).then(res => {
        this.count = res.data.data.count;
        this.categoryList = res.data.data.recordList;

        this.loading = false;
      })
    },
    //打开dialog
    openAEDialog(category) {
      if (category) {
        //已有分类：修改
        this.categoryForm.categoryName = category.categoryName;
        this.categoryForm.id = category.id;

        this.$refs.categoryTitle.innerHTML = "修改分类"
      } else {
        //传入null：新增
        //init
        this.categoryForm.id = null;
        this.categoryForm.categoryName = "";
        //dialog dom
        this.$refs.categoryTitle.innerHTML = "添加分类";
      }

      this.showAddOrEditDialog = true;
    },
    //增加或删除分类
    doAddOrEdit() {
      this.postRequest("/admin/categories", this.categoryForm).then(res => {
        if (res.data.flag) {
          this.$notify.success({
            title: "成功",
            message: res.data.message
          });

          this.listCategories();
        } else {
          this.$notify.error({
            title: "失败",
            message: res.data.message
          });
        }

        this.showAddOrEditDialog = false;
      })
    },
    //搜索筛选
    searchCategories() {
      this.current = 1;
      this.listCategories();
    },
    //表格展示多选回调
    onSelectionChange(selectedCategories) {
      this.categoryIdList = [];
      selectedCategories.forEach(categoryBackDTO => {
        this.categoryIdList.push(categoryBackDTO.id);
      });
    },
    //删除选中的分类
    deleteSelectedCategories() {
      this.deleteCategory(this.categoryIdList)
    },
    //删除分类
    deleteCategory(id) {
      const categoryIdList = id.length === undefined ? [id] : [...id];
      this.deleteRequest("/admin/categories", categoryIdList).then(res => {
        if (res.data.flag) {
          this.$notify.success({
            title: '删除成功',
            message: res.data.message
          })

          //init
          this.listCategories();
        } else {
          this.$notify.error({
            title: '删除失败',
            message: res.data.message
          })
        }
      })

      this.showDeleteDialog = false;
    },
    //onSizeChange
    onSizeChange(newSize) {
      this.size = newSize;
      this.listCategories();
    },
    //onCurrentChange
    onCurrentChange(newCur) {
      this.current = newCur;
      this.listCategories();
    }
  },
  computed: {
    formatLocalDateTime() {
      return function (dateStr) {
        return this.$dayjs(dateStr).format("YYYY年MM月DD日 HH时mm分ss秒");
      };
    },
    checkAddOrEdit() {
      return this.categoryForm.categoryName.trim() === "";
    }
  }

}
</script>

<style scoped>

</style>