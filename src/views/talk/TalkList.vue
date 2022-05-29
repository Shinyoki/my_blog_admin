<template>
  <el-card class="main-card">
    <div class="card-container-title">{{ this.$route.name }}</div>
<!--    状态-->
    <div class="status-menu">
      <span @click="changeStatus(null)" :class="isActive(null)">全部</span>
      <span @click="changeStatus(1)" :class="isActive(1)">公开</span>
      <span @click="changeStatus(2)" :class="isActive(2)">私密</span>
    </div>
    <el-empty v-if="talkList == null || talkList.length === 0" description="这里空空如也哦~"/>
    <div v-else class="talk-container">
<!--      说说-->
      <div class="talk-item" v-for="(talk, index) of talkList" :key="index">
<!--        用户信息-->
        <div class="user-info-wrapper">
<!--          头像-->
          <el-avatar
              class="user-avatar"
              :src="talk.avatar"
              :size="36"
              />
<!--          详细信息-->
          <div class="user-detail-wrapper">
            <div class="user-info-container">
              <div>{{ talk.nickname }}</div>
<!--              昵称操作-->
              <el-dropdown
                trigger="click"
                @command="handleCommand"
                >
                <i class="el-icon-more" style="color: #333; cursor: pointer"/>

                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item :command="'1,' + talk.id">
                    <i class="el-icon-edit"/>编辑
                  </el-dropdown-item>
                  <el-dropdown-item :command="'2,' + talk.id">
                    <i class="el-icon-delete"/>删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
            <!--              发表时间-->
            <div class="time">
              {{ talk.createTime | date}}
              <span class="top" v-if="talk.isTop == 1">
                  <i class="iconfont el-icon-zhiding"/>置顶
                </span>
              <span class="secret" v-if="talk.status == 2">
                  <i class="iconfont el-icon-mima"/>私密
                </span>
            </div>
            <!--              说说信息-->
            <div class="talk-content" v-html="talk.content"/>
            <!--              图片列表-->
            <el-row
                :gutter="4"
                class="talk-images"
                v-if="talk.imgList != null && talk.imgList.length > 0"
            >
              <el-col
                  :md="8"
                  :cols="6"
                  v-for="(imgSrc, index) of talk.imgList"
                  :key="index"
              >
                <el-image
                    lazy
                    :src="imgSrc"
                    class="images-items"
                    :preview-src-list="previewList"
                />
              </el-col>
            </el-row>
          </div>
        </div>
      </div>
<!--      分页-->
      <el-pagination
        class="pagination-container"
        :current-page="current"
        :total="count"
        :page-size="size"
        :page-sizes="[10, 20]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="onCurrentChange"
        @size-change="onSizeChange"
        />
    </div>
<!--    dialog-->
    <el-dialog
      :visible.sync="showDeleteDialog"
      width="30%"
      >
      <div class="dialog-title-container" slot="title">
        <i class="el-icon-warning" style="color: #ff9900"/>提示
      </div>
      <div>是否删除该说说？</div>
      <div slot="footer">
        <el-button @click="showDeleteDialog = false">取消</el-button>
        <el-button type="danger" @click="deleteTalk">确定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'TalkList',
  created() {
    this.listTalks();
  },
  data() {
    return {
      loading: true,
      showDeleteDialog: false,
      //data
      talkList: [],
      previewList: [], //大图
      //request
      status: null,
      talkId: null,
      //page
      current: 1,
      size: 10,
      count: 0
    }
  },
  methods: {
    //查询后台说说集合
    listTalks() {
      let params = {
        status: this.status,
        current: this.current,
        size: this.size
      };

      this.getRequest("/admin/talks", params).then(res => {
        this.talkList = res.data.data.recordList;
        //初始化预览图
        this.talkList.forEach(talk => {
          if (talk.imgList) {
            this.previewList.push(...talk.imgList);
          }
        })
        this.count = res.data.data.count;
      });
    },
    //修改状态栏样式
    changeStatus(status) {
      //init
      this.status = status;
      this.current = 1;
      this.previewList = [];

      this.listTalks();
    },
    //dropdown command回调
    handleCommand(command) {
      let commands = command.split(",");
      this.talkId = commands[1];

      switch (commands[0]) {
        case '1':
          //编辑
          this.$router.push({path: '/talks/' + this.talkId});
          break;
        case '2':
          //删除
          this.showDeleteDialog = true;
          break
      }
    },
    //page
    onCurrentChange(newCur) {
      this.previewList = [];
      this.current = newCur;
      this.listTalks();
    },
    onSizeChange(newSize) {
      this.previewList = [];
      this.size = newSize;
      this.listTalks();
    },
    //删除说说
    deleteTalk() {

      this.deleteRequest("/admin/talks", [this.talkId]).then(res => {
        if (res.data.flag) {
          this.$notify.success({
            title: "成功",
            message: res.data.message
          });

          this.listTalks();
        } else {
          this.$notify.error({
            title: "失败",
            message: res.data.message
          });
        }

        this.showDeleteDialog = false;
      })
    }

  },
  computed: {
    isActive() {
      return function (status) {
        return this.status == status ? "active-status" : "status";
      };
    }
  }
}
</script>

<style scoped>
.status-menu {
  margin-top: 1.25rem;
  color: #999;
}
.status-menu span {
  margin-right: 1rem;
}
.active-status {
  cursor: pointer;
  font-weight: bold;
  color: #333;
}
.status {
  cursor: pointer;
}

.talk-item {
  margin-top: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, .1);
  box-shadow: 0 3px 8px 6px rgb(7 17 27 / 0.06);
  transition: all .3s ease 0s;
}
.talk-item:hover {
  box-shadow: 0 3px 8px 6px rgb(7 17 27 / 0.16);
  transform: translateY(-3px);
}
.user-info-wrapper {
  width: 100%;
  display: flex;
}

.user-avatar {
  border-radius: 50%;
  transition: all .5s;
}
.user-avatar:hover {
  transform: scale(1.2);
}

.user-detail-wrapper {
  margin-left: 10px;
  width: 100%;
}
.user-info-container {
  font-size: 15px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
}
.time {
  color: #999;
  margin-top: 2px;
  font-size: 12px;
}
.top {
  color: #ff7242;
  margin-left: 10px;
}
.secret {
  color: #999;
  margin-left: 10px;
}
.talk-content {
  margin-top: 8px;
  font-size: 14px;
  white-space: pre-line;
  word-break: break-all;
  word-wrap: break-word;
}
.talk-images {
  margin-top: 8px;
}
.images-items {
  cursor: pointer;
  object-fit: cover;
  height: 200px;
  width: 100%;
  border-radius: 4px;
}
</style>