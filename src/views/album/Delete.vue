<template>
  <el-card class="main-card">
    <div class="card-container-title">{{ $route.name }}</div>
    <div class="operation">
      <!--      全选-->
      <div class="all-check">
        <el-checkbox
            :indeterminate="isIndeterminate"
            v-model="allChecked"
            @change="handleCheckAllChange"
        >全选
        </el-checkbox>
        <div class="check-count">当前已选中{{ selectedPhotoIdList.length }}张图片</div>
      </div>
      <!--      操作按钮-->
      <el-button
          type="success"
          @click="updateSelectedPhotoDelete"
          :disabled="selectedPhotoIdList.length == 0"
          size="small"
          icon="el-icon-deleteItem"
      >批量恢复
      </el-button>
      <el-button
          type="danger"
          @click="showUpdatePhotoDeleteDialog = true"
          :disabled="selectedPhotoIdList.length == 0"
          size="small"
          icon="el-icon-deleteItem"
      >批量删除
      </el-button>
    </div>
    <!--    被删除照片列表-->
    <el-row :gutter="10" v-loading="loading" class="photo-container" style="position:relative;">
      <el-empty
          v-if="photoList.length == 0"
          description="暂无照片"/>
      <el-checkbox-group
          v-else
          v-model="selectedPhotoIdList"
          @change="handleCheckedPhotoChange"
      >
        <el-col
            :md="4"
            v-for="photo in photoList"
            :key="photo.id"
        >
          <el-checkbox :label="photo.id">
            <div class="photo-item">
              <el-image
                  fit="cover"
                  class="photo-img"
                  :src="photo.photoSrc"
                  :preview-src-list="photoUrlList"
              />
              <div class="photo-name">{{ photo.photoName }}</div>
            </div>
          </el-checkbox>
        </el-col>
      </el-checkbox-group>
    </el-row>
    <!--    分页-->
    <el-pagination
        @size-change="onSizeChange"
        @current-change="onCurrentChange"
        class="pagination-container"
        :page-sizes="[10, 20]"
        :page-size="size"
        :total="count"
        :current-page="current"
        layout="total, sizes, prev, pager, next, jumper"
    />
    <!--    批量删除dialog-->
    <el-dialog :visible.sync="showUpdatePhotoDeleteDialog">
      <div slot="title" class="dialog-title-container">
        <i class="el-icon-warning" style="color: #ff9900"/>提示
      </div>
      <div>是否删除所选中的图片？</div>
      <div slot="footer" class="dialog-footer-container">
        <el-button @click="showUpdatePhotoDeleteDialog = false">取 消</el-button>
        <el-button type="primary" @click="deleteSelectedPhotos">确 定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  name: "DeleteView",
  created() {
    this.listDeletedPhotos();
  },
  data() {
    return {
      loading: true,
      isIndeterminate: false,
      allChecked: false,
      showUpdatePhotoDeleteDialog: false,
      //data
      photoList: [],
      photoUrlList: [],
      selectedPhotoIdList: [],
      //request
      photoIdList: [],
      current: 1,
      size: 10,
      count: 0
    }
  },
  methods: {
    //查询所有被删除的图片
    listDeletedPhotos() {
      let params = {
        current: this.current,
        size: this.size,
        isDelete: 1
      }
      this.getRequest("/admin/photos", params).then(res => {
        this.photoList = res.data.data.recordList;
        this.count = res.data.data.count;

        this.loading = false;
      });
    },
    //全选事件
    handleCheckAllChange(selection) {
      this.selectedPhotoIdList = selection ? this.photoIdList : [];
      this.isIndeterminate = false;
    },
    handleCheckedPhotoChange(checked) {
      let checkedCount = checked.length;
      this.allChecked = checkedCount === this.photoIdList.length;
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.photoIdList.length;
    },
    //更新图片删除状态为逻辑假
    updateSelectedPhotoDelete() {
      this.updatePhotoDelete(this.selectedPhotoIdList);
    },
    updatePhotoDelete(id) {
      let params = {
        idList: id.length === undefined ? [id] : [...id],
        isDelete: 0
      }
      this.putRequest("/admin/photos/delete", params).then(res => {
        if (res.data.flag) {
          this.$notify.success({
            title: "恢复成功",
            message: res.data.message
          })

          this.selectedPhotoIdList = [];
          this.listDeletedPhotos();
        } else {
          this.$notify.error({
            title: "错误",
            message: res.data.message
          });
        }

      })
    },
    //删除图片
    deleteSelectedPhotos() {
      this.deleteRequest("/admin/photos", this.selectedPhotoIdList).then(res => {
        if (res.data.flag) {
          this.$notify.success({
            title: "删除成功",
            message: res.data.message
          })

          this.selectedPhotoIdList = [];
          this.listDeletedPhotos();
        } else {
          this.$notify.error({
            title: "错误",
            message: res.data.message
          });
        }

        this.showUpdatePhotoDeleteDialog = false;
      })
    },
    //page
    onSizeChange(newSize) {
      this.size = newSize;
      this.listDeletedPhotos();
    },
    onCurrentChange(newCurrent) {
      this.current = newCurrent;
      this.listDeletedPhotos();
    }
  },
  watch: {
    photoList() {
      this.photoIdList = [];
      this.photoUrlList = [];
      this.photoList.forEach(item => {
        this.photoIdList.push(item.id);
      });
      this.photoList.forEach(item => {
        this.photoUrlList.push(item.photoSrc);
      });
    },
  }
}
</script>

<style scoped>
.operation {
  display: flex;
  justify-content: flex-end;
  margin-top: 2.25rem;
  margin-bottom: 2rem;
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
  position: relative;
  cursor: pointer;
  margin-bottom: 1rem;
}

.photo-img {
  width: 100%;
  height: 7rem;
  border-radius: 4px;
}

.photo-name {
  font-size: 14px;
  margin-top: 0.3rem;
  text-align: center;
}
</style>