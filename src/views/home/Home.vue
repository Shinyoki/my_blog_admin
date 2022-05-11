<template>
  <div>
<!--    first-row：统计数据-->
    <el-row :gutter="30">
      <el-col :span="6">
<!--        卡片一：访问量-->
        <el-card>
          <div class="card-icon-container">
            <i class="iconfont el-icon-fangwenliang" style="font-size: 3rem"/>
          </div>
          <div class="card-desc">
            <div class="card-title">访问量</div>
            <div class="card-count">{{ viewsCount }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
<!--          卡片二：用户量-->
          <div class="card-icon-container">
            <i class="iconfont el-icon-user" style="color: #34BFA3;font-size: 3rem"/>
          </div>
          <div class="card-desc">
            <div class="card-title">用户量</div>
            <div class="card-count">{{ usersCount }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <!--        卡片三：留言量-->
        <el-card>
          <div class="card-icon-container">
            <i class="el-icon-s-comment" style="color: #36A3F7; font-size: 3rem"/>
          </div>
          <div class="card-desc">
            <div class="card-title">留言量</div>
            <div class="card-count">{{ messagesCount }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
<!--        卡片四：文章量-->
        <el-card>
          <div class="card-icon-container">
            <i class="iconfont el-icon-fabiaowenzhang" style="font-size: 3rem"/>
          </div>
          <div class="card-desc">
            <div class="card-title">文章量</div>
            <div class="card-count">{{ articlesCount }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
<!--    echarts:-->
    <el-card style="margin-top: 1.2rem">
      <div class="e-title">一周访问量</div>
      <div style="height: 350px">
        <v-chart
            :options="weekViewsOptions"
            v-loading="loading"
            />
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "IndexView",
  data() {
    return {
      viewsCount: 0,
      usersCount: 0,
      messagesCount: 0,
      articlesCount: 0,
      //echarts:
      loading: true,
      weekViewsOptions: {

      }
    }
  },
  created() {
    this.initData()
  },
  methods: {
    initData() {
      this.getRequest("/admin").then(res=>{
        let data = res.data.data;
        //counts...
        this.viewsCount = data.viewsCount;
        this.usersCount = data.usersCount;
        this.messagesCount = data.messagesCount;
        this.articlesCount = data.articlesCount;

        //echarts...

        //element loading
        this.loading = false;
        console.log(data)
      })
    }
  }
}
</script>

<style lang="less" scoped>
/* counts card */
.card-icon-container {
  font-size: 3rem;

  display: inline-block;
}
.card-desc {
  font-weight: bold;
  float: right;

  .card-title {
    margin-top: .3rem;
    color: rgba(0, 0, 0, .45);
  }

  .card-count {
    color: #666;
    font-size: 1.25rem;
  }
}
</style>