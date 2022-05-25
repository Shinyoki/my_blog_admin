<template>
  <el-card class="main-card">
    <div class="card-container-title"> {{ this.$route.name }}</div>
<!--    操作-->
    <div class="operation-container">
<!--      增加菜单-->
      <el-button
        type="primary"
        size="small"
        icon="el-icon-plus"
        @click="openModel"
      >
        新增菜单
      </el-button>
<!--      筛选-->
      <div style="display: flex;margin-left: auto">
        <el-input
          v-model="keywords"
          prefix-icon="el-icon-search"
          size="small"
          placeholder="菜单名"
          @keyup.enter.native="listMenus"
          />
        <el-button
          type="primary"
          size="small"
          icon="el-icon-search"
          @click="listMenus"
          >
          搜索
        </el-button>
      </div>
    </div>
<!--    表格展示-->
    <el-table
      v-loading="loading"
      :data="menuList"
      row-key="id"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      >
<!--      列：菜单名称-->
      <el-table-column label="菜单名称" prop="name" align="center" width="160"/>
<!--      列：菜单图标-->
      <el-table-column label="图标" prop="icon" align="center" width="100">
        <template slot-scope="scope">
          <i :class="'iconfont ' + scope.row.icon"/>
        </template>
      </el-table-column>
<!--      列：菜单排序-->
      <el-table-column label="排序" prop="orderNum" align="center" width="100"/>
<!--      列：访问路径-->
      <el-table-column label="访问路径" prop="path"/>
<!--      列：是否隐藏-->
      <el-table-column label="隐藏" prop="isHidden" align="center" width="80">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.isHidden"
            :active-value="1"
            :inactive-value="0"
            active-color="#13ce66"
            inactive-color="#F4F4F5"
            disabled
            />
        </template>
      </el-table-column>
<!--      列：创建时间-->
      <el-table-column label="创建时间" prop="createTime" align="center" width="200">
        <template slot-scope="scope">
          <i class="el-icon-time" style="margin-right: 5px"/>
          {{formatLocalDateTime(scope.row.createTime)}}
        </template>
      </el-table-column>
<!--      列：操作-->
      <el-table-column label="操作" align="center" width="200">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="mini"
            @click="addSubMenu(scope.row, 1)"
            v-if="scope.row.children"
            >
            <i class="el-icon-plus" />新增
          </el-button>
          <el-button
            type="text"
            size="mini"
            @click="editCurMenu(scope.row)"
            >
            <i class="el-icon-edit"/>修改
          </el-button>
          <el-popconfirm
            title="确定要删除吗？"
            style="margin-left: 10px"
            @confirm="deleteMenu(scope.row.id)"
            >
            <el-button size="mini" type="text" slot="reference">
             <i class="el-icon-delete"/> 删除
            </el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
<!--    dialog-->
    <el-dialog
      :visible.sync="showAddOrEditDialog"
      width="30%"
      top="12vh"
      >
      <div
          class="dialog-title-container"
          slot="title"
          ref="menuTitle"
          />
      <el-form
        size="medium"
        :model="menuForm"
        label-width="80px"
        >
<!--        菜单类型选项-->
        <el-form-item label="菜单类型" v-if="showMenuTypeSelector">
          <el-radio-group v-model="isCatalog">
            <el-radio :label="true">目录</el-radio>
            <el-radio :label="false">一级菜单</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
<!--TODO 剩余的修改页-->
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  name: "MenuView",
  created() {
    this.listMenus();
  },
  data() {
    return {
      loading: false,
      showAddOrEditDialog: false,
      isCatalog: true,
      showMenuTypeSelector: true,
      //data
      menuList: [],
      //request form
      menuForm: {
        id: null,
        name: "",
        icon: "",
        component: "",
        path: "",
        orderNum: 1,
        parentId: null,
        isHidden: 0
      },
      //菜单名
      keywords: "",
    }
  },
  methods: {
    //查询后台菜单
    listMenus() {
      let params = {
        keywords: this.keywords
      }
      this.getRequest("/admin/menus", params).then(res => {
        if (res.data.flag) {
          this.menuList = res.data.data;

          this.loading = false;
        } else {
          this.$notify.error({
            title: '错误',
            message: res.data.message
          })
        }
      })
    },
    //新增菜单
    addSubMenu(menu) {
      this.openModel(menu, 1);
    },
    editCurMenu(menu) {
      this.openModel(menu, 2)
    },
    openModel(menu, type) {
      if (menu) {
        //有则给该menu添加 子菜单
        //关闭菜单类型选项的显示
        this.showMenuTypeSelector = false;
        this.isCatalog = false;

        //操作类型
        switch (type) {
          case 1:
            //添加子菜单
            this.menuForm = {
              id: null,
              name: "",
              icon: "",
              component: "",
              path: "",
              orderNum: 1,
              parentId: null,
              isHidden: 0
            }
            this.$refs.menuTitle.innerHTML = "新增菜单";
            this.menuForm.parentId = menu.id;
            break;
          case 2:
            //修改
            this.$refs.menuTitle.innerHTML = "修改菜单";
            //深拷贝
            this.menuForm = JSON.parse(JSON.stringify(menu))
            break;
        }
      } else {
        //无则对应添加 目录
        this.$refs.menuTitle.innerHTML = "新增菜单";
        //初始化表单数据
        this.menuForm = {
          id: null,
          name: "",
          icon: "",
          //目录组件
          component: "Layout",
          path: "",
          orderNum: 1,
          parentId: null,
          isHidden: 0
        }

        this.showAddOrEditDialog = true;
      }
    },
    deleteMenu(id) {
      this.deleteMenu("/admin/menus/" + id).then(res => {
        if (res.data.flag) {
          this.$notify.success({
            title: "成功",
            message: "删除成功"
          });
          this.listMenus();
        } else {
          this.$notify.error({
            title: "失败",
            message: res.data.message
          });
        }
      })
    }
  },
  computed: {
    //格式化LocalDateTime
    formatLocalDateTime() {
      return function (dateStr) {
        return this.$dayjs(dateStr).format("YYYY年MM月DD日 HH时mm分ss秒");
      };
    },
  },
  watch: {

  }
}
</script>

<style scoped>

</style>