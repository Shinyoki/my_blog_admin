<template>
  <el-card class="main-card">
    <div class="card-container-title">{{ this.$route.name }}</div>
    <div class="operation-container">
      <el-button
        type="primary"
        size="small"
        icon="el-icon-plus"
        @click="openAddOrEditDialog(null)"
        >新增</el-button>
      <el-button
        type="danger"
        size="small"
        icon="el-icon-delete"
        :disabled="linkIdList.length == 0"
        @click="showDeleteFriendLinkDialog = true"
        >批量删除</el-button>
      <div style="margin-left:auto;display: flex">
        <el-input
          v-model="keywords"
          prefix-icon="el-icon-search"
          size="small"
          placeholder="请输入友链名"
          style="width:200px"
          @keyup.enter.native="searchLinks"
          />
        <el-button
          type="primary"
          size="small"
          icon="el-icon-search"
          style="margin-left:1rem"
          @click="searchLinks"
          >搜索</el-button>
      </div>
    </div>
    <el-table
      border
      :data="linkList"
      @selection-change="selectionChange"
      >
<!--      列：多选-->
      <el-table-column type="selection" width="55" />
<!--      列：头像-->
      <el-table-column prop="linkAvatar" label="友链头像" align="center">
        <template slot-scope="scope">
          <img :src="scope.row.linkAvatar" width="40" height="40" />
        </template>
      </el-table-column>
<!--      列：名称-->
      <el-table-column prop="linkName" label="友链名称" align="center" />
<!--      列：介绍-->
      <el-table-column prop="linkIntro" label="友链介绍" align="center" />
<!--      列：地址-->
      <el-table-column prop="linkAddress" label="友链地址" align="center" />
<!--      列：创建时间-->
      <el-table-column prop="createTime" label="创建时间" align="center">
        <template slot-scope="scope">
          {{ scope.row.createTime | date }}
        </template>
      </el-table-column>
<!--      列：操作-->
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="small"
            icon="el-icon-edit"
            @click="openAddOrEditDialog(scope.row)"
            >编辑</el-button>
          <el-button
            type="danger"
            size="small"
            icon="el-icon-delete"
            @click="deleteFriendLink(scope.row.id)"
            >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      class="pagination-container"
      :page-sizes="[10, 20]"
      :page-size="size"
      :current-page="current"
      :total="count"
      @size-change="onSizeChange"
      @current-change="onCurrentChange"
      layout="total, sizes, prev, pager, next, jumper"
      />
    <!--  dialog-->
    <el-dialog :visible.sync="showDeleteFriendLinkDialog">
      <div class="dialog-title-container" slot="title">
        <i class="el-icon-warning"/> 提示
      </div>
      <div>确定要删除选中的友链吗？</div>
      <div slot="footer">
        <el-button @click="showDeleteFriendLinkDialog = false">取消</el-button>
        <el-button type="primary" @click="deleteSelectedFriendLink">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="showAddOrEditFriendLinkDialog">
      <div class="dialog-title-container" slot="title" ref="linkTitle"/>

      <el-form
        :model="linkForm"
        size="medium"
        label-width="100px"
        >
        <el-form-item label="友链名">
          <el-input
            v-model="linkForm.linkName"
            placeholder="请输入友链名"
            />
        </el-form-item>
        <el-form-item label="链接头像地址">
          <el-input
            v-model="linkForm.linkAvatar"
            placeholder="请输入链接头像地址"
            />
        </el-form-item>
        <el-form-item label="友链地址">
          <el-input
            v-model="linkForm.linkAddress"
            placeholder="请输入友链地址"
            />
        </el-form-item>
        <el-form-item label="友链介绍">
          <el-input
            v-model="linkForm.linkIntro"
            placeholder="请输入友链介绍"
            />
        </el-form-item>
      </el-form>

      <div slot="footer">
        <el-button @click="showAddOrEditFriendLinkDialog = false">取消</el-button>
        <el-button type="primary" @click="addOrEditFriendLink">确定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  name: "FriendLink",
  created() {
    this.listFriendLink();
  },
  data() {
    return {
      loading: true,
      showDeleteFriendLinkDialog: false,
      showAddOrEditFriendLinkDialog: false,
      //data
      linkList: [],
      //request
      linkIdList: [],
      linkForm: {
        id: null,
        linkName: "",
        linkAvatar: "",
        linkIntro: "",
        linkAddress: ""
      },
      keywords: null,     //友链名称
      //page
      current: 1,
      size: 10,
      count: 0
    };
  },
  methods: {
    //查询友链
    listFriendLink() {
      let params = {
        keywords: this.keywords,
        current: this.current,
        size: this.size
      }
      this.getRequest("/admin/links", params).then(res => {
        this.linkList = res.data.data.recordList;
        this.count = res.data.data.count;

        this.loading = false;
      })
    },
    //新增友链
    openAddOrEditDialog(friendLink) {
      if (friendLink == null) {
        //init
        this.linkForm = {
          id: null,
          linkName: "",
          linkAvatar: "",
          linkIntro: "",
          linkAddress: ""
        };
        this.$refs.linkTitle.innerHTML = "添加友链";
      } else {
        this.linkForm = JSON.parse(JSON.stringify(friendLink));
        this.$refs.linkTitle.innerHTML = "编辑友链";
      }

      this.showAddOrEditFriendLinkDialog = true;
    },
    //搜索友链
    searchLinks() {
      this.current = 1;
      this.listFriendLink();
    },
    //多选回调
    selectionChange(selected) {
      this.linkIdList = [];
      selected.forEach(link => {
        this.linkIdList.push(link.id)
      })
    },
    //删除友链
    deleteSelectedFriendLink() {
      this.deleteFriendLink(this.linkIdList);
    },
    deleteFriendLink(id) {
      let linkIdList = id.length === undefined ? [id] : [...id];
      this.deleteRequest("/admin/links", linkIdList).then(res => {
        if (res.data.flag) {
          this.$notify.success({
            title: "成功",
            message: "删除成功"
          });
          this.listFriendLink();
        } else {
          this.$notify.error({
            title: "错误",
            message: res.data.message
          });
        }

        this.showDeleteFriendLinkDialog = false;
      })
    },
    //page
    onSizeChange(val) {
      this.size = val;
      this.listFriendLink();
    },
    onCurrentChange(val) {
      this.current = val;
      this.listFriendLink();
    },
    //添加
    addOrEditFriendLink() {
      if (this.linkForm.linkName.trim() == "") {
        this.$notify.error({
          title: "错误",
          message: "友链名不能为空"
        });
        return false;
      }
      if (this.linkForm.linkAvatar.trim() == "") {
        this.$notify.error({
          title: "错误",
          message: "友链头像地址不能为空"
        });
        return false;
      }
      if (this.linkForm.linkIntro.trim() == "") {
        this.$notify.error({
          title: "错误",
          message: "友链介绍不能为空"
        });
        return false;
      }
      if (this.linkForm.linkAddress.trim() == "") {
        this.$notify.error({
          title: "错误",
          message: "友链地址不能为空"
        });
        return false;
      }

      this.postRequest("/admin/links", this.linkForm).then(res => {
        if (res.data.flag) {
          this.$notify.success({
            title: "成功",
            message: "添加成功"
          });
          this.listFriendLink();
        } else {
          this.$notify.error({
            title: "错误",
            message: res.data.message
          });
        }

        this.showAddOrEditFriendLinkDialog = false;
      })

    },
  },
  computed: {

  }
}
</script>

<style scoped>

</style>