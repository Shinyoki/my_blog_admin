<template>
  <el-card class="main-card">
    <div class="card-container-title">{{ this.$route.name }}</div>
    <div class="operation-container">
      <el-button
          type="primary"
          size="small"
          icon="el-icon-plus"
          @click="openAlbumModel(null)"
      >
        新增相册
      </el-button>
      <div style="display: flex; margin-left: auto">
        <el-button
            type="text"
            size="small"
            icon="el-icon-delete"
            @click="push2DeleteAlbumView"
        >
          回收站
        </el-button>
        <el-input
            size="small"
            v-model="keywords"
            placeholder="请输入相册名称"
            style="margin-left: 10px"
            @keyup.enter.native="searchAlbums"
        />
        <el-button
            type="primary"
            size="small"
            icon="el-icon-search"
            style="margin-left: 10px"
            @click="searchAlbums"
        >搜索
        </el-button>
      </div>
    </div>
    <!--    相册集合-->
    <el-row
        :gutter="12"
        v-loading="loading"
        class="album-container"
    >
      <!--      空显示-->
      <el-empty v-if="albumList == null || albumList.length == 0" description="暂无相册"></el-empty>
      <el-col
          v-for="(album, index) of albumList"
          :key="index"
          :md="6"
      >
        <div class="album-item" @click="checkAlbumInfoById(album.id)">
          <!--         相册 操作-->
          <div class="album-operation">
            <el-dropdown @command="handleCommand">
              <i class="el-icon-more" style="color: #fff"/>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="'edit' + JSON.stringify(album)">
                  <i class="el-icon-edit"/>编辑
                </el-dropdown-item>
                <el-dropdown-item :command="'dele' + album.id">
                  <i class="el-icon-delete"/>删除
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
          <!--         相册 照片数量-->
          <div class="album-photo-count">
            <div>{{ album.photoCount }}</div>
            <i v-if="album.status == 2" class="iconfont el-icon-mima"/>
          </div>
          <!--         相册 封面-->
          <el-image
              :src="album.albumCover"
              class="album-cover"
              fit="cover"
          />
          <!--         相册 名称-->
          <div class="album-name">{{ album.albumName }}</div>
        </div>
      </el-col>
    </el-row>
    <!--    分页-->
    <el-pagination
        background
        class="pagination-container"
        :page-sizes="[10, 20]"
        :page-size="size"
        :total="count"
        :current-page.sync="current"
        @current-change="onCurrentChange"
        @size-change="onSizeChange"
        layout="total, sizes, prev, pager, next, jumper"
    />
    <!--    dialog-->
    <el-dialog
        :visible.sync="showAddOrEditAlbumDialog"
    >
      <!--    title -->
      <div slot="title" ref="albumTitle" class="dialog-title-container"/>
      <!--      表单-->
      <el-form
          label-width="80px"
          size="medium"
          v-model="albumForm"
      >
        <!--        相册名称-->
        <el-form-item label="相册名称">
          <el-input
              size="medium"
              v-model="albumForm.albumName"/>
        </el-form-item>
        <!--        相册描述-->
        <el-form-item label="相册描述">
          <el-input
              size="medium"
              v-model="albumForm.albumDesc"/>
        </el-form-item>
        <!--        发布形式-->
        <el-form-item label="发布形式">
          <el-radio-group
              v-model="albumForm.status"
          >
            <el-radio
                :label="1"
            >
              公开
            </el-radio>
            <el-radio
                :label="2"
            >
              私密
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <!--        封面-->
        <el-form-item label="封面">
          <el-upload
              :multiple="false"
              :show-file-list="false"
              drag
              class="upload-cover"
              action="/api/admin/photos/albums/cover"
              :before-upload="beforeUpload"
              :on-success="onUploadSuccess"
          >
            <div v-if="albumForm.albumCover == ''">
              <i class="el-icon-upload"/>
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            </div>
            <img
                v-else
                :src="albumForm.albumCover"
                height="auto"
            />
          </el-upload>
        </el-form-item>
      </el-form>
      <!--      dialog footer-->
      <div slot="footer">
        <el-button
            size="small"
            @click="showAddOrEditAlbumDialog = false">取消
        </el-button>
        <el-button
            size="small"
            type="primary"
            @click="addOrEditAlbum">确定
        </el-button>
      </div>
    </el-dialog>
    <!--    delete-->
    <el-dialog :visible.sync="showDeleteAlbumDialog">
      <div class="dialog-title-container" slot="title">
        <i class="el-icon-warning" style="color: #f56c6c;"/>提示
      </div>
      <div>
        <p>确认删除该相册？</p>
      </div>
      <div slot="footer" class="dialog-footer-container">
        <el-button size="small" @click="showDeleteAlbumDialog = false">取消</el-button>
        <el-button size="small" type="primary" @click="deleteAlbum">确定</el-button>
      </div>
    </el-dialog>

  </el-card>
</template>

<script>
import * as imageConversion from "image-conversion"

export default {
  name: "AlbumView",
  created() {
    this.listAlbums();
  },
  data() {
    return {
      loading: true,
      showDeleteAlbumDialog: false,
      showAddOrEditAlbumDialog: false,
      //data
      albumList: [],
      //query
      albumForm: {
        id: null,
        albumName: "",
        albumDesc: "",
        albumCover: "",
        status: 1 //1:公开，2:私有
      },
      keywords: "",  //相册名
      //page
      current: 1,
      size: 10,
      count: 0
    }
  },
  methods: {
    //查询相册集合
    listAlbums() {
      let params = {
        keywords: this.keywords,

        current: this.current,
        size: this.size,
      }

      this.getRequest("/admin/photos/albums", params).then(res => {
        this.albumList = res.data.data.recordList;
        this.count = res.data.data.count;

        this.loading = false;
      })
    },
    //打开addOrEditAlbumDialog
    openAlbumModel(album) {
      if (album) {
        //编辑
        this.$refs.albumTitle.innerHTML = "编辑相册";
        this.albumForm = JSON.parse(JSON.stringify(album));
      } else {
        //新增
        this.$refs.albumTitle.innerHTML = "新增相册";
        this.albumForm = {
          id: null,
          albumName: "",
          albumDesc: "",
          albumCover: "",
          status: 1
        }
      }

      this.showAddOrEditAlbumDialog = true;
    },
    //push到删除页面
    push2DeleteAlbumView() {
      this.$router.push({ path: "/photos/delete" })
    },
    //查询相册
    searchAlbums() {
      this.current = 1;
      this.listAlbums();
    },
    //查看相册的详细信息
    checkAlbumInfoById(id) {
      this.$router.push({
        path: '/albums/' + id
      })
    },
    //dropdown指令回调
    handleCommand(command) {
      let data = command.substring(4);
      console.log("数据：", data);
      switch (command.substring(0, 4)) {
        case "edit":
          this.openAlbumModel(JSON.parse(data));
          break;
        case "dele":
          this.albumForm.id = data;
          this.showDeleteAlbumDialog = true;
          break;
      }
    },
    //page
    onCurrentChange(newCurrent) {
      this.current = newCurrent;
      this.listAlbums();
    },
    onSizeChange(newSize) {
      this.size = newSize;
      this.listAlbums();
    },
    //上传封面
    beforeUpload(file) {
      return new Promise((resolve) => {
        if (file.size / 1024 > this.config.UPLOAD_SIZE) {
          imageConversion.compressAccurately(file, this.config.UPLOAD_SIZE)
              .then(res => {
                resolve(res);
              });
        } else {
          resolve(file);
        }
      })
    },
    onUploadSuccess(res) {
      this.albumForm.albumCover = res.data
    },
    //添加或编辑相册
    addOrEditAlbum() {
      if (this.albumForm.albumName.trim() == "") {
        this.$message.error("相册名称不能为空");
        return false;
      }
      if (this.albumForm.albumDesc.trim() == "") {
        this.$message.error("相册描述不能为空");
        return false;
      }
      if (this.albumForm.albumCover.trim() == "") {
        this.$message.error("相册封面不能为空");
        return false;
      }

      this.postRequest("/admin/photos/albums", this.albumForm).then(res => {
        this.$message.success("操作成功");
        this.showAddOrEditAlbumDialog = false;
        this.listAlbums();
      })
    },
    //删除Album
    deleteAlbum() {
      this.deleteRequest("/admin/photos/albums/" + this.albumForm.id).then(res => {
        this.$message.success("操作成功");
        this.showDeleteAlbumDialog = false;
        this.listAlbums();
      })
    }
  },
  computed: {}
}
</script>

<style scoped>
.album-cover {
  position: relative;
  border-radius: 4px;
  width: 100%;
  height: 170px;
}

.album-cover::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.album-photo-count {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1.5rem;
  z-index: 1000;
  position: absolute;
  left: 0;
  padding: 0 0.5rem;
  bottom: 2.6rem;
  color: #fff;
}

.album-name {
  text-align: center;
  margin-top: 0.5rem;
}

.album-item {
  position: relative;
  margin-bottom: 1rem;
}

.album-operation {
  position: absolute;
  cursor: pointer;
  z-index: 10000;
  top: 0rem;
  right: .8rem;
  color: #fff;
}
</style>