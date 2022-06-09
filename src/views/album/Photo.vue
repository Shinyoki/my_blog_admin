<template>
  <el-card class="main-card">
    <!--    标题-->
    <div class="card-container-title" v-if="$route.name">{{ this.$route.name }}</div>
    <!--相册信息-->
    <div class="album-info">
      <!--      相册封面-->
      <el-image
          :src="albumInfo.albumCover"
          class="album-cover"
          fit="cover"
      />
      <!--      相册细节-->
      <div class="album-detail">
        <!--        名称和拥有图片数量-->
        <div style="margin-bottom: .6rem">
          <span class="album-name">{{ albumInfo.albumName }}</span>
          <span class="album-count">数量：{{ albumInfo.photoCount }}</span>
        </div>
        <!--        相册描述-->
        <div>
          <span v-if="albumInfo.albumDesc" class="album-desc">
            描述：{{ albumInfo.albumDesc }}
          </span>
        </div>
        <el-button
            icon="el-icon-picture"
            type="primary"
            size="small"
            @click="showUploadPhotoDialog = true"
        >上传照片
        </el-button>
      </div>
      <!--      相册操作-->
      <div class="operation">
        <div class="all-check">
          <el-checkbox
              v-model="allChecked"
              @change="handleCheckAllChange"
              :indeterminate="isIndeterminate"
          >全选
          </el-checkbox>
          <div class="check-count">当前已选中{{ selectedPhotoIdList.length }}张图片</div>
        </div>
        <el-button
            type="success"
            size="small"
            icon="el-icon-deleteItem"
            @click="showMovePhotoDialog = true"
            :disabled="selectedPhotoIdList.length == 0"
        >
          移动到其他相册
        </el-button>
        <el-button
            type="danger"
            size="small"
            icon="el-icon-deleteItem"
            @click="showDeletePhotoDialog = true"
            :disabled="selectedPhotoIdList.length == 0"
        >批量删除
        </el-button>
      </div>
    </div>
    <!--    照片列表-->
    <el-row
        class="photo-container"
        :gutter="10"
        v-loading="loading"
    >
      <!--      空-->
      <el-empty
          v-if="photoList.length == 0"
          description="暂无图片"
      />
      <!--      多选元素：-->
      <el-checkbox-group
          v-model="selectedPhotoIdList"
          @change="onCheckedPhotoChange"
      >
        <!--        列-->
        <el-col
            :md="4"
            v-for="(photo, index) of photoList"
            :key="index"
        >
          <!--          单选元素：下拉框和图片-->
          <el-checkbox :label="photo.id">
            <div class="photo-item">
              <!--              下拉框-->
              <div class="photo-operation">
                <el-dropdown @command="handleCommand">
                  <i class="el-icon-more"/>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item :command="'edit'+JSON.stringify(photo)">
                      <i class="el-icon-edit"/>编辑
                    </el-dropdown-item>
                    <el-dropdown-item :command="'dele'+photo.id">
                      <i class="el-icon-delete"/> 删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
              <!--              图片-->
              <el-image
                  fit="cover"
                  :src="photo.photoSrc"
                  :preview-src-list="photoSrcList"
                  class="photo-img"/>
              <!--              图片名-->
              <div class="photo-name">{{ photo.photoName }}</div>
            </div>
          </el-checkbox>
        </el-col>
      </el-checkbox-group>
    </el-row>
    <!--    分页-->
    <el-pagination
        class="pagination-container"
        @current-change="onCurrentChange"
        @size-change="onSizeChange"
        :hide-on-single-page="true"
        :page-sizes="[10, 20]"
        :page-size="size"
        :current-page="current"
        layout="total, sizes, prev, pager, next, jumper"
    />
    <!--    dialog-->
    <!--    上传-->
    <el-dialog
        :visible.sync="showUploadPhotoDialog"
        top="10vh"
    >
      <div class="dialog-title-container" slot="title">上传图片</div>
      <div class="upload-container">
        <!--        上传样式1：当已经选择了图片时-->
        <el-upload
            multiple
            action="/api/admin/photos/albums/cover"
            v-show="uploadPhotoList.length > 0"
            list-type="picture-card"
            :file-list="uploadPhotoList"
            :before-upload="beforeUpload"
            :on-success="onSuccess"
            :on-remove="onRemove"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
        <div class="upload">
          <!--          上传样式2：还没上传时-->
          <el-upload
              drag
              multiple
              v-show="uploadPhotoList.length == 0"
              action="/api/admin/photos/albums/cover"
              :before-upload="beforeUpload"
              :on-success="onSuccess"
              :show-file-list="false"
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <div class="el-upload__tip" slot="tip">
              支持上传jpg/png文件
            </div>
          </el-upload>
        </div>
      </div>
      <!--            dialog footer-->
      <div slot="footer">
        <div class="upload-footer">
          <div class="upload-count">本次将上传{{ uploadPhotoList.length }}张图片</div>
          <div style="margin-left: auto">
            <el-button @click="showUploadPhotoDialog = false">取消</el-button>
            <el-button type="primary" :disabled="uploadPhotoList.length == 0" @click="uploadPhoto">确定</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
    <!--    编辑-->
    <el-dialog
        :visible.sync="showEditPhotoDialog"
        width="30%"
    >
      <div class="dialog-title-container" slot="title">编辑图片信息</div>
      <el-form :model="photoForm">
        <!--        名称-->
        <el-form-item label="照片名称">
          <el-input v-model="photoForm.photoName" placeholder="请输入照片名称"></el-input>
        </el-form-item>
        <!--        描述-->
        <el-form-item label="图片描述">
          <el-input v-model="photoForm.photoDesc" placeholder="请输入图片描述"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <div class="dialog-footer">
          <el-button @click="showEditPhotoDialog = false">取消</el-button>
          <el-button type="primary" @click="editPhoto">确定</el-button>
        </div>
      </div>
    </el-dialog>
    <!--    批量删除-->
    <el-dialog :visible.sync="showDeletePhotoDialog">
      <div class="dialog-title-container" slot="title">
        <i class="el-icon-warning" style="color: #ff9900"/> 批量删除图片
      </div>
      <div>是否删除所选图片？</div>
      <div slot="footer">
        <div class="dialog-footer">
          <el-button @click="showDeletePhotoDialog = false">取消</el-button>
          <el-button type="primary" @click="updateSelectedPhotoDelete">确定</el-button>
        </div>
      </div>
    </el-dialog>
    <!--    移动照片-->
    <el-dialog :visible.sync="showMovePhotoDialog" width="30%">
      <div class="dialog-title-container" slot="title">移动照片</div>
      <el-empty v-if="albumList.length <= 1" description="暂无其他相册，无法移动照片"/>
      <el-form v-else label-width="80px" size="medium" :model="photoForm">
        <!--        单选框，目标相册-->
        <el-radio-group v-model="albumId">
          <div class="album-check-item">
            <template v-for="(album) of albumList">
              <!--              只渲染不是当前的相册-->
              <el-radio
                  v-if="album.id != albumInfo.id"
                  :key="album.id"
                  :label="album.id"
                  style="display: inline-flex;margin-bottom: 1rem"
              >
                <div class="album-check">
                  <el-image
                      :src="album.albumCover"
                      fit="cover"
                      style="width: 250px; height: auto"
                      class="album-check-cover"/>
                  <div style="margin-left: .5rem;margin-bottom: .3rem">{{ album.albumName }}</div>
                </div>
              </el-radio>
            </template>
          </div>
        </el-radio-group>
      </el-form>
      <div slot="footer">
        <div class="dialog-footer">
          <el-button @click="showMovePhotoDialog = false">取消</el-button>
          <el-button type="primary" :disabled="albumId == null" @click="moveSelectedPhoto">确定</el-button>
        </div>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
import * as imageConversion from "image-conversion"

export default {
  name: "PhotoView",
  created() {
    this.getAlbumInfo();
    this.listPhotos();
    this.listAlbums();
  },
  data() {
    return {
      loading: true,
      showUploadPhotoDialog: false,
      showEditPhotoDialog: false,
      showMovePhotoDialog: false,
      showDeletePhotoDialog: false,
      isIndeterminate: false,
      allChecked: false,
      //data
      photoList: [],
      photoSrcList: [],
      uploadPhotoList: [],
      selectedPhotoIdList: [],
      albumList: [],
      albumInfo: {  //当前相册信息
        id: null,
        albumName: "",
        albumDesc: "",
        albumCover: "",
        photoCount: 0
      },
      albumId: null,
      //request
      photoIdList: [],
      photoForm: {
        id: null,
        photoName: "",
        photoDesc: "",
      },
      //page
      current: 1,
      size: 10,
      count: 0
    }
  },
  methods: {
    //根据路由上的相册id寻找相应相册
    getAlbumInfo() {
      this.getRequest("/admin/photos/albums/" + this.$route.params.albumId + "/info")
          .then(res => {
            this.albumInfo = res.data.data;
          })
    },
    //查询所有的相册
    listAlbums() {
      this.getRequest("/admin/photos/albums")
          .then(res => {
            this.albumList = res.data.data.recordList;
          })
    },
    //查询当前路由上相册ID所对应的所有照片
    listPhotos() {
      let params = {
        isDelete: 0,
        albumId: this.$route.params.albumId,

        current: this.current,
        size: this.size
      }

      this.getRequest("/admin/photos", params).then(res => {
        this.photoList = res.data.data.recordList;
        this.count = res.data.data.count;

        this.loading = false;
      })
    },
    //复选框全选
    handleCheckAllChange(val) {
      //如果全选，则将所有的照片id放入selectedPhotoIdList
      this.selectedPhotoIdList = val ? this.photoIdList : [];
      this.isIndeterminate = false; //全选或全不选时，是确定态
    },
    //复选框变化
    onCheckedPhotoChange(selectedPhoto) {
      let checkedCount = selectedPhoto.length;
      //选中数量为所有图片数量时标为全选
      this.allChecked = checkedCount === this.photoIdList.length;
      //非0且小于总数时为不确定态
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.photoIdList.length;
    },
    //下拉框
    handleCommand(command) {
      let data = command.substring(4);
      switch (command.substring(0, 4)) {
        case "edit":
          this.photoForm = JSON.parse(data);
          this.showEditPhotoDialog = true;
          break;
        case 'dele':
          this.deletePhoto(data);
          break;
      }
    },
    //page
    onCurrentChange(newCurrent) {
      this.current = newCurrent;
      this.listPhotos();
    },
    onSizeChange(newSize) {
      this.size = newSize;
      this.listPhotos();
    },
    //上传
    beforeUpload(file) {
      return new Promise((resolve) => {
        if (file.size / 1024 > this.config.UPLOAD_SIZE) {
          imageConversion.compressAccurately(file, this.config.UPLOAD_SIZE)
              .then(res => {
                resolve(res)
              });
        } else {
          resolve(file);
        }
      })
    },
    onSuccess(ajaxResult) {
      this.uploadPhotoList.push({url: ajaxResult.data});
    },
    onRemove(file) {
      this.uploadPhotoList.forEach((item, index) => {
        if (item.url == file.url) {
          this.uploadPhotoList.splice(index, 1);
        }
      })
    },
    //上传图片
    uploadPhoto() {
      //图片本身已上传，只需上传URL集合
      let uploadPhotoUrlList = [];
      this.uploadPhotoList.forEach(item => {
        uploadPhotoUrlList.push(item.url);
      })
      let params = {
        albumId: this.$route.params.albumId,
        photoUrlList: uploadPhotoUrlList
      }

      this.postRequest("/admin/photos", params).then(res => {
        if (res.data.flag) {
          this.$notify.success({
            title: "成功",
            message: "上传成功"
          });

          //init upload
          this.uploadPhotoList = [];
          this.listPhotos();
        } else {
          this.$notify.error({
            title: "失败",
            message: res.data.message
          });
        }
        this.showUploadPhotoDialog = false;
      })
    },
    //更新图片信息
    editPhoto() {
      if (this.photoForm.photoName.trim() == "") {
        this.$notify.error({
          title: "失败",
          message: "图片名称不能为空"
        });
        return false;
      }

      this.putRequest("/admin/photos", this.photoForm).then(res => {
        if (res.data.flag) {
          this.$notify.success({
            title: "成功",
            message: "更新成功"
          });

          this.listPhotos();
        } else {
          this.$notify.error({
            title: "失败",
            message: res.data.message
          });
        }

        this.showEditPhotoDialog = false;
      })
    },
    //批量逻辑删除图片
    updateSelectedPhotoDelete() {
      this.deletePhoto(this.selectedPhotoIdList);
    },
    deletePhoto(id) {
      let params = {
        idList: id.length === undefined ? [id] : [...id],
        isDelete: 1
      }

      this.putRequest("/admin/photos/delete", params).then(res => {
        if (res.data.flag) {
          this.$notify.success({
            title: "成功",
            message: "删除成功"
          });

          this.listPhotos();
        } else {
          this.$notify.error({
            title: "失败",
            message: res.data.message
          });
        }

        this.showDeletePhotoDialog = false;
      })
    },
    //移动选择的图片到对应相册
    moveSelectedPhoto() {
      let params = {
        albumId: this.albumId,
        photoIdList: this.selectedPhotoIdList
      }
      this.putRequest("/admin/photos/album", params).then(res => {
        if (res.data.flag) {
          this.$notify.success({
            title: "成功",
            message: "移动成功"
          });

          this.getAlbumInfo();
          this.listPhotos();
        } else {
          this.$notify.error({
            title: "失败",
            message: res.data.message
          });
        }

        this.showMovePhotoDialog = false;
      })
    },
  },
  watch: {
    //监听当前相册的图片，并转换为图片id数组
    photoList() {
      this.photoIdList = [];
      this.photoSrcList = [];
      this.photoList.forEach(item => {
        this.photoIdList.push(item.id);
      });
      this.photoList.forEach(item => {
        this.photoSrcList.push(item.photoSrc);
      });
    },
  },
  computed: {},
}
</script>

<style scoped>
.album-info {
  margin-top: 2.25rem;
  margin-bottom: 2rem;
  display: flex;
}

.album-cover {
  border-radius: 4px;
  width: 6.5rem;
  height: auto;
}

.album-detail {
  margin-top: .4rem;
  margin-left: .8rem;
}

.album-desc {
  font-size: 14px;
  margin-inside: .8rem;
}

.album-name {
  font-size: 16px;
  font-weight: bold;
}

.album-count {
  font-size: 12px;
  margin-left: .5rem;
}

.album-check {
  display: flex;
  align-items: center;
}
.album-check-cover {
  border-radius: 4px;
  width: 4rem;
  height: 4rem;
}
.operation {
  padding-top: 1.5rem;
  margin-left: auto;
}

.all-check {
  display: inline-flex;
  align-items: center;
  margin-right: 1rem;
}

.check-count {
  margin-left: 1rem;
  font-size: 12px;
}


.photo-item {
  width: 100%;
  position: relative;
  cursor: pointer;
  margin-bottom: 1rem;
}

.photo-operation {
  position: absolute;
  z-index: 1000;
  top: .3rem;
  right: .5rem;
}
.photo-container .el-checkbox__input {
  position: absolute !important;
  top: 0.3rem;
  left: 0.8rem;
}

.photo-img {
  height: 7rem;
  width: 100%;
  text-align: center;
  border-radius: 4px;
}
.photo-name {
  text-align: center;
}


.upload-container {
  height: 400px;
}

.upload {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-footer {
  display: flex;
  align-items: center;
}

</style>