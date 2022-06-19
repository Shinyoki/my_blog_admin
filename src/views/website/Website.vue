<template>
  <el-card class="main-card">
    <el-tabs v-model="activeName">
      <!--      修改标签-->
      <el-tab-pane label="网站信息" name="info">
        <el-form
            label-width="100px"
            :model="websiteConfig"
            label-position="left"
        >
          <el-form-item label="网站名称">
            <el-input v-model="websiteConfig.websiteName" style="width: 400px" size="small"></el-input>
          </el-form-item>
          <el-form-item label="网站头像">
            <el-upload
                class="avatar-uploader"
                action="/api/admin/config/images"
                :show-file-list="false"
                :on-success="onSuccess"
            >
              <img
                  v-if="websiteConfig.websiteAvatar"
                  :src="websiteConfig.websiteAvatar"
                  class="avatar"
              />
              <i v-else class="el-icon-plus avatar-uploader-icon" />
            </el-upload>
          </el-form-item>
          <el-form-item label="网站作者">
            <el-input v-model="websiteConfig.websiteAuthor" style="width: 400px" size="small"></el-input>
          </el-form-item>
          <el-form-item label="网站描述">
            <el-input v-model="websiteConfig.websiteIntro" style="width: 400px" size="small"></el-input>
          </el-form-item>
          <el-form-item label="网站创建日期">
            <el-date-picker
                style="width: 400px"
                v-model="websiteConfig.websiteCreateTime"
                type="date"
                value-format="yyyy年MM月dd日"
                placeholder="选择日期"
            />
          </el-form-item>
          <el-form-item label="网站公告">
            <el-input v-model="websiteConfig.websiteNotice" type="textarea" :rows="5" style="width: 400px"/>
          </el-form-item>
          <el-form-item label="备案号">
            <el-input v-model="websiteConfig.websiteRecordNo" style="width: 400px" size="small"></el-input>
          </el-form-item>
          <el-form-item label="第三方登录">
            <el-checkbox-group v-model="websiteConfig.socialLoginList">
              <el-checkbox label="qq">QQ</el-checkbox>
              <el-checkbox label="weibo">微博</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-button
              type="primary"
              size="medium"
              @click="handleSubmit"
          >修改
          </el-button>
        </el-form>
      </el-tab-pane>
      <!--      网站公告标签-->
      <el-tab-pane label="社交信息" name="notice">
        <el-form :model="websiteConfig" label-width="80px">
          <el-checkbox-group v-model="websiteConfig.socialUrlList">
            <el-form-item label="QQ">
              <el-input v-model="websiteConfig.qq" size="small" style="margin-right: 1rem;width: 400px"></el-input>
              <el-checkbox label="qq">是否展示</el-checkbox>
            </el-form-item>
          </el-checkbox-group>
          <el-form-item label="Github">
            <el-input
                v-model="websiteConfig.github"
                size="small"
                style="width:400px;margin-right:1rem"
            />
            <el-checkbox label="github">是否展示</el-checkbox>
          </el-form-item>
          <el-form-item label="Gitee">
            <el-input
                v-model="websiteConfig.gitee"
                size="small"
                style="width:400px;margin-right:1rem"
            />
            <el-checkbox label="gitee">是否展示</el-checkbox>
          </el-form-item>
          <el-button
              type="primary"
              size="medium"
              style="margin-left:4.375rem"
              @click="handleSubmit"
          >
            修改
          </el-button>
        </el-form>
      </el-tab-pane>
      <!--      修改密码-->
      <el-tab-pane label="修改密码" name="password">
        <el-form :model="websiteConfig" label-position="left" label-width="120px">
          <el-row style="width: 600px">
            <el-col :md="12">
              <el-form-item label="用户头像">
                <el-upload
                    :multiple="false"
                    class="avatar-uploader"
                    :show-file-list="false"
                    action="/api/admin/config/images"
                    :on-success="onUserAvatarUploadSuccess"
                    :before-upload="beforeUpload"
                >
                  <img
                      v-if="websiteConfig.userAvatar"
                      :src="websiteConfig.userAvatar"
                      class="avatar"
                  />
                  <i v-else class="el-icon-plus avatar-uploader-icon"/>
                </el-upload>
              </el-form-item>
            </el-col>
            <el-col :md="12">
              <el-form-item label="游客头像">
                <el-upload
                    :multiple="false"
                    class="avatar-uploader"
                    :show-file-list="false"
                    action="/api/admin/config/images"
                    :on-success="onTouristAvatarUploadSuccess"
                    :before-upload="beforeUpload"
                >
                  <img
                      v-if="websiteConfig.touristAvatar"
                      :src="websiteConfig.touristAvatar"
                      class="avatar"
                  />
                  <i v-else class="el-icon-plus avatar-uploader-icon"/>
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="邮箱通知">
            <el-radio-group v-model="websiteConfig.isEmailNotice">
              <el-radio :label="1">开启</el-radio>
              <el-radio :label="0">关闭</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="评论审核">
            <el-radio-group v-model="websiteConfig.isCommentReview">
              <el-radio :label="1">开启</el-radio>
              <el-radio :label="0">关闭</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="留言审核">
            <el-radio-group v-model="websiteConfig.isCommentReview">
              <el-radio :label="1">开启</el-radio>
              <el-radio :label="0">关闭</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="打赏提示">
            <el-radio-group v-model="websiteConfig.isReward">
              <el-radio :label="1">开启</el-radio>
              <el-radio :label="0">关闭</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-row style="width: 600px" v-show="websiteConfig.isReward == 1">
            <el-col :md="12">
              <el-form-item label="微信收款码">
                <el-upload
                    :multiple="false"
                    class="avatar-uploader"
                    action="/api/admin/config/images"
                    :show-file-list="false"
                    :on-success="onWechatPaymentUploadSuccess"
                    :before-upload="beforeUpload"
                    >
                  <img
                      v-if="websiteConfig.weixinQRCode"
                      :src="websiteConfig.weixinQRCode"
                      class="avatar"
                      />
                  <i v-else class="el-icon-plus avatar-uploader-icon"/>
                </el-upload>
              </el-form-item>
            </el-col>
            <el-col :md="12">
              <el-form-item label="支付宝收款码">
                <el-upload
                    :multiple="false"
                    class="avatar-uploader"
                    action="/api/admin/config/images"
                    :show-file-list="false"
                    :on-success="onAlipayPaymentUploadSuccess"
                    :before-upload="beforeUpload"
                    >
                  <img
                      v-if="websiteConfig.alipayQRCode"
                      :src="websiteConfig.alipayQRCode"
                      class="avatar"
                      />
                  <i v-else class="el-icon-plus avatar-uploader-icon"/>
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="聊天室状态">
            <el-radio-group v-model="websiteConfig.isChatRoom">
              <el-radio :label="1">开启</el-radio>
              <el-radio :label="0">关闭</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="Websocket地址" v-show="websiteConfig.isChatRoom == 1">
            <el-input
              placeholder="请输入Websocket地址"
              size="small"
              style="width: 400px"
              v-model="websiteConfig.websocketUrl"
              />
          </el-form-item>
          <el-form-item label="音乐播放器状态">
            <el-radio-group v-model="websiteConfig.isMusicPlayer">
              <el-radio :label="1">开启</el-radio>
              <el-radio :label="0">关闭</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-button type="primary" @click="handleSubmit">修改</el-button>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
import * as imageConversion from "image-conversion"

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Website",
  created() {
    this.getWebsiteConfig();
  },
  data() {
    return {
      websiteConfig: {
        //网站
        websiteAvatar: "", // 网站头像
        websiteName: "", // 网站名称
        websiteAuthor: "", // 网站作者
        websiteIntro: "", // 网站简介
        websiteNotice: "", // 网站公告
        websiteCreateTime: "", // 网站创建时间
        websiteRecordNo: "", // 网站备案号

        //社交平台
        socialLoginList: [], // 社交登录列表
        socialUrlList: [], // 社交账号链接
        qq: "", // QQ
        wechat: "", // 微信
        github: "", // Github
        gitee: "", // Gitee

        //用户
        userAvatar: "", // 用户头像
        touristAvatar: "", // 游客头像
        isReward: 1, // 是否开启打赏
        weixinQRCode: "", // 微信二维码
        aliPayQRCode: "", // 支付宝二维码

        //聊天室
        isChatRoom: 1, // 是否开启聊天室
        websocketUrl: "", // websocket地址
        //音乐播放器
        isMusicPlayer: 1, // 是否开启音乐播放器
        //邮箱通知
        isEmailNotice: 1, // 是否开启邮箱通知
        //审核
        isCommentReview: 0, // 是否开启评论审核
        isMessageReview: 0, // 是否开启留言审核
      },
      activeName: "info" // 当前激活的tab页
    };
  },
  methods: {
    //获取网站配置
    getWebsiteConfig() {
      this.getRequest("/admin/website/config").then(res => {
        this.websiteConfig = res.data.data;
        console.log(this.websiteConfig);
      });
    },
    //上传预处理
    beforeUpload(file) {
      return new Promise(resolve => {
        if (file.size / 1024 > this.config.UPLOAD_SIZE) {
          imageConversion.compressAccurately(file, this.config.UPLOAD_SIZE).then(res => {
            this.resolve(res);
          });
        } else {
          this.resolve(file);
        }
      })
    },
    onUserAvatarUploadSuccess(ajaxResult) {
      this.websiteConfig.userAvatar = ajaxResult.data;
    },
    onTouristAvatarUploadSuccess(ajaxResult) {
      this.websiteConfig.touristAvatar = ajaxResult.data;
    },
    onWechatPaymentUploadSuccess(ajaxResult) {
      this.websiteConfig.weixinQRCode = ajaxResult.data;
    },
    onAlipayPaymentUploadSuccess(ajaxResult) {
      this.websiteConfig.aliPayQRCode = ajaxResult.data;
    },
    onSuccess(ajaxResult) {
      this.websiteConfig.websiteAvatar = ajaxResult.data;
    },
    //修改配置
    handleSubmit() {
      this.putRequest("/admin/website/config", this.websiteConfig).then(res => {
        if (res.data.flag) {
          this.$notify.success({
            title: "成功",
            message: "修改成功"
          });
          this.getWebsiteConfig();
        } else {
          this.$notify.error({
            title: "错误",
            message: res.data.message
          });
        }
      });
    },
  },
}
</script>

<style>
.avatar-uploader {
  width: 120px;
}
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}
.avatar {
  width: 120px;
  height: 120px;
  display: block;
}
</style>