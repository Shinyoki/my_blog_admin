<template>
  <el-card class="main-card">
    <div class="card-container-title" >{{ this.$route.name }}</div>
<!--    说说-->
    <div class="talk-container">
<!--      自定义输入框-->
      <Editor
          ref="editor"
          :disable="true"
          class="editor-wrapper"
          v-model="talkForm.content"
          placeholder="说点什么吧"
      />
<!--      操作-->
      <div class="operation-container">
<!--        表情-->
        <el-popover
          placement="bottom-start"
          width="460"
          trigger="click"
          >
          <i style="font-size: 1.5rem; cursor: pointer" class="iconfont el-icon-biaoqing" slot="reference"/>
          <span
            class="emoji-item"
            v-for="(val, key, index) of emojiList"
            :key="index"
            @click="addEmoji(key, val)"
            :title="formatEmojiKey(key)"
            >{{ val }}</span>
        </el-popover>
<!--        上传图片-->
        <el-upload
          multiple
          action="/api/admin/talks/images"
          :before-upload="beforeUpload"
          :on-success="uploadSuccess"
          :show-file-list="false"
          >
          <i class="iconfont el-icon-tupian" style="font-size: 1.5rem"/>
        </el-upload>

        <div style="display: flex; margin-left: auto">
<!--          是否置顶-->
          <el-switch
            v-model="talkForm.isTop"
            :active-value="1"
            :inactive-value="0"
            inactive-text="置顶"
            active-color="#13ce66"
            inactive-color="#F4F4F5"
            style="margin-right: 1rem"
            />
<!--          说说状态-->
          <el-dropdown
            style="margin-right: 1rem"
            @command="handleCommand"
            trigger="click"
            >
            <span class="talk-status">
              {{ dropdownTitle }}
              <i class="el-icon-arrow-down el-icon--right"/>
            </span>
            <el-dropdown-menu
              slot="dropdown"
              >
              <el-dropdown-item
                v-for="(val, index) of statusList"
                :key="index"
                :command="val.status"
                >
                {{ val.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
<!--          发布-->
          <el-button
            type="primary"
            size="small"
            @click="saveOrUpdateTalk"
            :disabled="talkForm.content == ''"
            icon="el-icon-plus"
            >
            发布
          </el-button>
        </div>
      </div>
<!--      图片显示+添加-->
      <el-upload
          multiple
          list-type="picture-card"
          :file-list="photoUploadList"
          class="talk-image-upload"
          v-show="photoUploadList.length > 0"
          action="/api/admin/talks/images"
          :before-upload="beforeUpload"
          :on-success="uploadSuccess"
          :on-remove="handleRemove"
      >
        <i class="el-icon-plus" />
      </el-upload>

    </div>

  </el-card>
</template>

<script>
  import EmojiList from "@/assets/js/emoji";
  import Editor from "@/components/talk/Editor";
  import * as imageConversion from "image-conversion";
  export default {
    // eslint-disable-next-line vue/multi-word-component-names
    name: 'Talk',
    components: {
      Editor
    },
    mounted() {

    },
    created() {
      this.initTalk();
    },
    data() {
      return {
        statusList: [
          {
            status: 1,
            label: '公开'
          },
          {
            status: 2,
            label: '私密'
          }
        ],
        //data
        emojiList: EmojiList,
        //符合 le-upload :file-list="fileList""的数据结构 [{name: '', url: ''}, {name: '', url: ''}]
        photoUploadList: [],
        //request
        talkForm: {
          id: null,
          content: "",
          isTop: 0,
          status: 1,
          images: null
        }
      }
    },
    methods: {
      //如果路由参数中是带有id，则初始化为对应内容
      initTalk() {
        if (this.$route.params.talkId) {
          this.getRequest("/admin/talks/" + this.$route.params.talkId).then(res => {
            this.talkForm = res.data.data;
            res.data.data.imgList.forEach(imgUrl => {
              this.photoUploadList.push({url: imgUrl})
            })
          });
        }
      },
      //添加表情内容到输入框中
      addEmoji(key, value) {
        this.$refs.editor.addHtmlText(value)
      },
      //通过Promise在处理前先压缩图片
      beforeUpload(file) {
        return new Promise(resolve => {
          if ((file.size / 1024) < this.config.UPLOAD_SIZE) {
            resolve(file);
          } else {
            imageConversion.compressAccurately(file, this.config.UPLOAD_SIZE).then(resFile => {
              resolve(resFile);
            })
          }
        })
      },
      //上传成功回调
      uploadSuccess(ajaxResult) {
        this.photoUploadList.push({url: ajaxResult.data})
      },
      //删除图片
      handleRemove(file) {
        this.photoUploadList.forEach((item, index) => {
          if (item.url == file.url) {
            this.photoUploadList.splice(index, 1);
          }
        })
      },
      //下拉框回调
      handleCommand(status) {
        this.talkForm.status = status;
      },
      // 添加或修改 talk
      saveOrUpdateTalk() {
        if (this.talkForm.content.trim() == "") {
          this.$message.error("动态内容不能为空!");
          return false;
        }

        //提取imageUrl
        if (this.photoUploadList.length > 0) {
          let imageUrlList = [];
          this.photoUploadList.forEach(item => {
            imageUrlList.push(item.url);
          })
          //直接转换为字符串存给images属性，而非imageList
          this.talkForm.images = JSON.stringify(imageUrlList);
        }

        //上传
        this.postRequest("/admin/talks", this.talkForm).then(res => {
          if (res.data.flag) {
            //init
            this.$refs.editor.clear();
            this.photoUploadList = [];

            this.$notify.success({
              title: "成功",
              message: res.data.message
            });
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
      formatEmojiKey() {
        return function (key) {
          return key.substring(1, key.length - 1);
        };
      },
      dropdownTitle:function () {
          let result = "";
          this.statusList.forEach(item => {
            if (item.status == this.talkForm.status) {
              result = item.label;
            }
          })
          return result;
      }
    }
  }
</script>

<style scoped>
.talk-container {
  margin-top: 1.5rem;
}
.emoji-item {
  font-size: 1.25rem;
  width: 35px;
  height: 28px;
  display: inline-block;
  cursor: pointer;
  text-align: center;
}
.emoji-item:hover {
  transition: all .2s;
  border-radius: .25rem;
  transform: scale(1.1);
  background: #ddd;
}

.talk-status {
  cursor: pointer;
  font-size: 12px;
  color: #999
}


</style>