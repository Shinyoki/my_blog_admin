<template>
  <el-card class="main-card">
    <div class="card-container-title"> {{ this.$route.name }}</div>
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
        :disabled="tagIdList.length === 0"
        @click="showDeleteDialog = true"
        >
        批量删除
      </el-button>
<!--      搜索-->
      <div style="margin-left: auto; display: flex">
        <el-input
          size="small"
          placeholder="标签名"
          prefix-icon="el-icon-search"
          v-model="keywords"
          @keyup.enter.native="searchTags"
          />
        <el-button
          size="small"
          type="primary"
          icon="el-icon-search"
          style="margin-left: 1.2rem"
          @click="searchTags"
          >
          搜索
        </el-button>
      </div>
    </div>
<!--    表格展示-->
    <el-table
      border
      :data="tagList"
      v-loading="loading"
      @selection-change="onSelectionChange"
      >
<!--      列：多选-->
      <el-table-column type="selection" width="55"/>
<!--      列：标签名-->
      <el-table-column label="标签名" prop="tagName" align="center">
        <template slot-scope="scope">
          <el-tag>
            {{ scope.row.tagName }}
          </el-tag>
        </template>
      </el-table-column>
<!--      列：文章量-->
      <el-table-column label="文章量" prop="articleCount" align="center"/>
<!--      列：标签创建事件-->
      <el-table-column label="创建时间" prop="createTime" align="center">
        <template slot-scope="scope">
          <i class="el-icon-time" style="margin-right: 5px"/>
          {{ formatLocalDateTime(scope.row.createTime) }}
        </template>
      </el-table-column>
<!--      列：操作-->
      <el-table-column label="操作" align="center" width="160">
        <template slot-scope="scope">
          <el-button
            size="mini"
            @click="openAEDialog(scope.row)"
            >
            编辑
          </el-button>
          <el-popconfirm
            title="确定要删除吗？"
            style="margin-right: 1rem"
            @confirm="deleteTag(scope.row.id)"
            >
            <el-button
              slot="reference"
              type="danger"
              size="mini"
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
      @current-change="onCurrentChange"
      @size-change="onSizeChange"
      />
<!--    dialog-->
    <el-dialog
        :visible.sync="showDeleteDialog"
        width="30%"
        >
      <div class="dialog-title-container" slot="title">
        <i class="el-icon-warning"/>
        提示
      </div>
      <div>是否删除选中项？</div>
      <div slot="footer">
        <el-button @click="showDeleteDialog = false">取消</el-button>
        <el-button type="danger" @click="deleteSelectedTags">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :visible.sync="showAddOrEditDialog"
      width="30%"
      >
      <div class="dialog-title-container" slot="title" ref="tagTitle"/>
      <el-form
        label-width="80px"
        size="medium"
        :model="tagForm"
        @submit.native.prevent
        >
        <el-form-item label="标签名">
          <el-input @keyup.enter.native="doAddOrEditTag" v-model="tagForm.tagName"/>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="showAddOrEditDialog = false">取消</el-button>
        <el-button type="primary" :disabled="checkAddOrEditTag" @click="doAddOrEditTag">确定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Tag",
  created() {
    this.listTags();
  },
  data() {
    return {
      showDeleteDialog: false,
      showAddOrEditDialog: false,
      loading: true,
      //page
      current: 1,
      size: 10,
      count: 0,
      //data
      tagList: [],
      //request
      tagIdList: [],
      keywords: null,
      tagForm: {
        id: null,
        tagName: ""
      }
    }
  },
  methods: {
    //搜索标签
    listTags() {
      let params = {
        curren: this.curren,
        size: this.size,
        keywords: this.keywords
      }
      this.getRequest("/admin/tags", params).then(res => {
        this.tagList = res.data.data.recordList;
        this.count = res.data.data.count;

        this.loading = false;
      })
    },
    //打开添加、修改对话框
    openAEDialog(tag) {
      if (tag) {
        //not null修改
        this.$refs.tagTitle.innerHTML = "修改标签";
        this.tagForm = tag
      } else {
        //null 添加
        this.$refs.tagTitle.innerHTML = "添加标签";
        this.tagForm.id = null;
        this.tagForm.tagName = "";
      }

      this.showAddOrEditDialog = true;
    },
    //添加或修改
    doAddOrEditTag() {
      this.postRequest("/admin/tags", this.tagForm).then(res => {
        if (res.data.flag) {
          this.$notify.success({
            title: "成功",
            message: res.data.message
          });
          this.listTags();
        } else {
          this.$notify.error({
            title: "失败",
            message: res.data.message
          });
        }
      })

      this.showAddOrEditDialog = false;
    },
    //搜索标签
    searchTags() {
      this.current = 1;
      this.listTags();
    },
    //多选事件回调
    onSelectionChange(selectedTags) {
      this.tagIdList = [];
      selectedTags.forEach(tag => {
        this.tagIdList.push(tag.id);
      });
    },
    //删除标签
    deleteSelectedTags() {
      this.deleteTag(this.tagIdList);
    },
    deleteTag(id) {
      let idList = id.length == undefined ? [id] : [...id];
      this.deleteRequest("/admin/tags", idList).then(res => {
        if (res.data.flag) {
          this.$notify.success({
            title: "成功",
            message: res.data.message
          });
          this.listTags();
        } else {
          this.$notify.error({
            title: "失败",
            message: res.data.message
          });
        }
      })

      this.showDeleteDialog = false;
    },
    //分页回调
    onCurrentChange(newCur) {
      this.current = newCur;
      this.listTags();
    },
    onSizeChange(newSize) {
      this.size = newSize;
      this.listTags();
    },

  },
  computed: {
    //格式化LocalDateTime
    formatLocalDateTime() {
      return function (dateStr) {
        return this.$dayjs(dateStr).format("YYYY年MM月DD日 HH时mm分ss秒");
      };
    },
    //校验
    checkAddOrEditTag() {
      return this.tagForm.tagName.trim() == "";
    }
  }
}
</script>

<style scoped>

</style>