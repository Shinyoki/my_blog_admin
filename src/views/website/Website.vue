<template>
  <el-card class="main-card">

  </el-card>
</template>

<script>
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
        weiXinQRCode: "", // 微信二维码
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
    getWebsiteConfig() {
      this.getRequest("/api/admin/website/config").then(res => {
        this.websiteConfig = res.data.data;
      });
    },
  },
}
</script>

<style scoped>

</style>