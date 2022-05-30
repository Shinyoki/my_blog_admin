<template>
  <el-card class="main-card">
    <div class="card-container-title">{{ this.$route.name }}</div>
<!--    操作-->
    <div class="operation-container">
      <el-button
        type="primary"
        size="small"
        icon="el-icon-plus"
        @click="openRoleMenuModel(null)"
        >
        新增
      </el-button>
      <el-popconfirm
        title="确定要删除选中项吗？"
        style="margin-left: 1rem"
        @confirm="deleteSelectedRoles"
        >
        <el-button type="danger" slot="reference" size="small">批量删除</el-button>
      </el-popconfirm>
<!--      筛选-->
      <div style="display: flex; margin-left: auto">
        <el-input
          v-model="keywords"
          prefix-icon="el-icon-search"
          size="small"
          placeholder="角色名"
          @keyup.native.enter="searchRoles"
          />
        <el-button
          type="primary"
          icon="el-icon-search"
          size="small"
          style="margin-left: 1rem"
          @click="searchRoles"
          >搜索</el-button>
      </div>
    </div>
<!--    表格展示-->
    <el-table
      border
      :data="roleList"
      v-loading="loading"
      @selection-change="onSelectionChange"
      >
<!--      列：多选-->
      <el-table-column type="selection" width="55"/>
<!--      列：角色名-->
      <el-table-column label="角色名" prop="roleName" align="center"/>
<!--      列：权限标签-->
      <el-table-column label="权限标签" prop="roleLabel" align="center">
        <template slot-scope="scope">
          <el-tag>
            {{ scope.row.roleLabel }}
          </el-tag>
        </template>
      </el-table-column>
<!--      列：是否禁用-->
      <el-table-column label="禁用" prop="isDisable" align="center" width="100">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.isDisable"
            :active-value="1"
            :inactive-value="0"
            active-color="#13ce66"
            inactive-color="#F4F4F5"
            disabled
            />
        </template>
      </el-table-column>
<!--      列：创建时间-->
      <el-table-column label="创建时间" prop="createTime" align="center" width="150">
        <template slot-scope="scope">
          {{ scope.row.createTime | date}}
        </template>
      </el-table-column>
<!--      列：操作-->
      <el-table-column label="操作" align="center" width="220">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="mini"
            @click="openRoleMenuModel(scope.row)"
            >
            <i class="el-icon-plus"/>菜单权限
          </el-button>
          <el-button
            type="text"
            size="mini"
            icon="el-icon-checked"
            @click="openRoleResourceModel(scope.row)"
            >资源权限</el-button>
          <el-popconfirm
            title="确定要删除吗？"
            @confirm="deleteRoles(scope.row.id)"
            >
            <el-button type="text" slot="reference" size="mini" icon="el-icon-delete">删除</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
<!--    分页-->
    <el-pagination
      background
      :current-page="current"
      :page-size="size"
      :page-sizes="[10, 20]"
      :total="count"
      @current-change="onCurrentChange"
      @size-change="onSizeChange"
      layout="total, sizes, prev, pager, next, jumper"
      />
<!--      dialog-->
    <el-dialog
      :visible.sync="showRoleMenuDialog"
      width="30%"
      >
      <div class="dialog-title-container" slot="title" ref="roleTitle"/>

<!--      form表单-->
      <el-form
        size="medium"
        label-width="80px"
        :model="roleForm"
        >
        <el-form-item label="角色名">
          <el-input v-model="roleForm.roleName"/>
        </el-form-item>
        <el-form-item label="权限标签">
          <el-input v-model="roleForm.roleLabel"/>
        </el-form-item>
        <el-form-item label="菜单权限">
<!--          设置check-strictly是为了让父级也被选中-->
          <el-tree
            :data="roleMenuList"
            :default-checked-keys="roleForm.menuIdList"
            node-key="id"
            ref="roleMenuTree"
            check-strictly
            show-checkbox
            />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="showRoleMenuDialog = false">取消</el-button>
        <el-button type="primary" @click="saveOrUpdateRoleMenu">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :visible.sync="showRoleResourceDialog"
      width="30%"
      >
      <div class="dialog-title-container" slot="title">修改资源权限</div>
      <el-form size="medium" :model="roleForm" label-width="80px">
        <el-form-item label="角色名">
          <el-input v-model="roleForm.roleName"/>
        </el-form-item>
        <el-form-item label="权限标签">
          <el-input v-model="roleForm.roleLabel"/>
        </el-form-item>
        <el-form-item label="资源权限">
          <el-tree
            :data="roleResourceList"
            node-key="id"
            :default-checked-keys="roleForm.resourceIdList"
            ref="roleResourceTree"
            show-checkbox
            />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="showRoleResourceDialog = false">取消</el-button>
        <el-button type="primary" @click="saveOrUpdateRoleResource">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :visible.sync="showDeleteDialog"
      width="30%"
      >
      <div class="dialog-title-container" slot="title">
        <i class="el-icon-warning"/>提示
      </div>
      <div>是否删除选中项？</div>
      <div slot="footer">
        <el-button @click="showDeleteDialog = false">取消</el-button>
        <el-button type="primary" @click="deleteSelectedRoles">确定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  name: "RoleView",
  created() {
    this.initData();
  },
  data() {
    return {
      loading: true,
      showDeleteDialog: false, //删除
      showRoleMenuDialog: false, //角色-菜单 关联
      showRoleResourceDialog: false, //角色-资源 管理
      //data
      roleList: [],
      roleIdList: [],
      roleMenuList: [],
      roleResourceList: [],
      //params
      roleForm: {
        resourceIdList: [],
        menuIdList: [],
        roleName: "",
        roleLabel: ""
      },
      keywords: "", //keywords：角色名
      //page
      current: 1,
      size: 10,
      count: 0
    }
  },
  methods: {
    initData() {
      this.listRoles();
      this.listRoleMenus();
      this.listRoleResources();
    },
    //查询角色
    searchRoles() {
      this.current = 1;
      this.listRoles();
    },
    listRoles() {
      let params = {
        current: this.current,
        size: this.size,
        keywords: this.keywords
      }
      this.getRequest("/admin/roles", params).then(res => {
        this.roleList = res.data.data.recordList;
        this.count = res.data.data.count;

        this.loading = false;
      })
    },
    //查询 角色-菜单 关联
    listRoleMenus() {
      this.getRequest("/admin/role/menus").then(res => {
        this.roleMenuList = res.data.data;
      })
    },
    //查询 角色-资源 关联
    listRoleResources() {
      this.getRequest("/admin/role/resources").then(res => {
        this.roleResourceList = res.data.data;
      })
    },
    //新增或修改 role-menu dialog
    openRoleMenuModel(role) {
      /**
       * https://blog.csdn.net/qq_39141511/article/details/108799371
       *
       * ref需要在dom渲染完成之后才会有，在使用的时候确保dom已经渲染完成，比如在生命周期mounted（）{}中调用，或者在this.$nextTick(()=>{})中调用
       *
       * 直接修改CheckedKeys时会提示'setCheckedKeys'未定义，因为此时DOM元素并未加载完毕，
       * 因此需要使用Vue提供的API $nextTick来等待DOM更新循环结束后延迟回调
       */
      this.$nextTick(function (){
        //清空选中的keys， key : node-key="id"
        this.$refs.roleMenuTree.setCheckedKeys([]);
      })

      this.$refs.roleTitle.innerHTML = role ? "修改角色" : "新增橘色";
      if (role) {
        //修改
        this.roleForm = JSON.parse(JSON.stringify(role));
      } else {
        //新增
        this.roleForm = {
          roleResourceIdList: [],
          roleMenuIdList: [],
          roleName: "",
          roleLabel: ""
        };
      }

      this.showRoleMenuDialog = true;
    },
    //新增或修改 role-menu form
    saveOrUpdateRoleMenu() {
      if (this.roleForm.roleName.trim() == "") {
        this.$message.error("角色名不能为空")
        return false;
      }
      if (this.roleForm.roleLabel.trim() == "") {
        this.$message.error("权限标签不能为空")
        return false;
      }

      //新增或修改role-menu，需先清空role-resource
      this.roleForm.resourceIdList = null
      this.roleForm.menuIdList = this.$refs.roleMenuTree.getCheckedKeys();

      this.postRequest("/admin/role", this.roleForm).then(res => {
        if (res.data.flag) {
          this.$notify.success({
            title: "成功",
            message: res.data.message
          });

          this.listRoles();
        } else {
          this.$notify.error({
            title: "失败",
            message: res.data.message
          });
        }

        this.showRoleMenuDialog = false;
      })
    },
    //修改 role-resource dialog
    openRoleResourceModel(role) {
      /**
       * 直接修改CheckedKeys时会提示'setCheckedKeys'未定义，因为此时DOM元素并未加载完毕，
       * 因此需要使用Vue提供的API $nextTick来等待DOM更新循环结束后延迟回调
       */
      this.$nextTick(function (){
        this.$refs.roleResourceTree.setCheckedKeys([]);
      })

      this.roleForm = JSON.parse(JSON.stringify(role));

      this.showRoleResourceDialog = true;
    },
    saveOrUpdateRoleResource() {
      if (this.roleForm.roleName.trim() == "") {
        this.$message.error("角色名不能为空")
        return false;
      }
      if (this.roleForm.roleLabel.trim() == "") {
        this.$message.error("权限标签不能为空")
        return false;
      }

      //保存或修改role-resource时，先清空role-menu
      this.roleForm.menuIdList = null
      this.roleForm.resourceIdList = this.$refs.roleResourceTree.getCheckedKeys();

      this.postRequest("/admin/role", this.roleForm).then(res => {
        if (res.data.flag) {
          this.$notify.success({
            title: "成功",
            message: res.data.message
          });

          this.listRoles();
        } else {
          this.$notify.error({
            title: "失败",
            message: res.data.message
          });
        }

        this.showRoleResourceDialog = false;
      })
    },
    //批量删除
    deleteSelectedRoles() {
      this.deleteRoles(this.roleIdList);
    },
    deleteRoles(id) {
      let roleIdList = id.length == undefined ? [id] : [...id];

      this.deleteRequest("/admin/roles",roleIdList).then(res => {
        if (res.data.flag) {
          this.$notify.success({
            title: "成功",
            message: res.data.message
          });
          this.listRoles();
        } else {
          this.$notify.error({
            title: "失败",
            message: res.data.message
          });
        }

        this.showDeleteDialog = false;
      })
    },
    //多选
    onSelectionChange(selectedRoles) {
      this.roleIdList = [];
      selectedRoles.forEach(role => {
        this.roleIdList.push(role.id)
      })
    },
    //page
    onCurrentChange(newCur) {
      this.current = newCur;
      this.listRoles();
    },
    onSizeChange(newSize) {
      this.size = newSize;
      this.listRoles();
    }

  },
  computed: {

  }
}
</script>

<style scoped>

</style>