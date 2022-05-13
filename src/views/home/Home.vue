<template>
  <div style="min-width: 600px">
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
    <!--    echarts:浏览量-->
    <el-row :gutter="30" style="margin-top: 1.2rem">
      <el-col span="14" >
        <el-card >
          <div class="e-title">一周访问量</div>
          <div style="height: 400px">
            <v-chart
                :options="viewsCountOptions"
                v-loading="loading"
            />
          </div>
        </el-card>
      </el-col>

    </el-row>

<!--    heatMap文章贡献统计-->
    <el-card style="margin-top: 1.2rem">
      <div class="e-title">文章贡献统计</div>
      <div>
        <calendar-heatmap
          v-loading="loading"
          :end-date="new Date()"
          :values="articlesOnOneDayList"
         />
      </div>
    </el-card>
<!--    文章浏览量 分类-->
    <el-row :gutter="20" style="margin-top: 1.2rem">
      <!--    文章浏览量排行-->
      <el-col :span="14">
        <el-card>
          <div class="e-title">文章浏览量排行</div>
          <div style="height: 400px">
            <v-chart :options="articlesRankOptions" v-loading="loading"/>
          </div>
        </el-card>
      </el-col>
<!--      分类数据统计-->
      <el-col :span="10">
        <el-card>
          <div class="e-title">文章分类统计</div>
          <div style="height: 400px">
            <v-chart :options="categoryOptions" v-loading="loading"/>
          </div>
        </el-card>
      </el-col>
    </el-row>
<!--  用户地理分布 -->
    <el-row :gutter="20" style="margin-top: 1.2rem">
      <el-col>
        <el-card>
          <div class="e-title">用户地理分布</div>
          <div style="height: 400px" v-loading="loading">
            <div class="area-wrapper">
              <el-radio-group v-model="typeOfUser">
                <el-radio :label="1">用户</el-radio>
                <el-radio :label="2">访客</el-radio>
              </el-radio-group>
            </div>
            <v-chart :options="userAreaMapOptions"/>
          </div>
        </el-card>
      </el-col>
    </el-row>
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
      //vue calender heatmap热点图
      articlesOnOneDayList: [],
      //标签云
      tagDtoList: [],
      loading: true,
      //echarts:
      //访问量
      viewsCountOptions: {
        //悬浮提示框
        tooltip:{
          //触发区域：位于整个坐标轴内
          trigger: 'axis',
          //指示器
          axisPointer: {
            type: 'cross' //十字线
          }
        },

        //调色板
        color: ["#3888fa"],

        //图例
        legend: {
          data: ['访问量']
        },

        //图表定位
        grid: {
          left: "0%",
          right: "0%",
          bottom: "0%",
          top: "10%",
          containLabel: true
        },

        //x轴
        xAxis: {
          data: [],
          //轴线
          axisLine: {
            lineStyle: {
              color: "#666"
            }
          }
        },
        //y轴
        yAxis: {
          axisLine: {
            lineStyle: {
              color: '#048CCE'
            }
          }
        },

        //折线
        series: [
          {
            type: 'line',
            name: '访问量',
            data: [],
            smooth: true
          }
        ]
      },
      //文章浏览量排行
      articlesRankOptions: {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        color: ["#58AFFF"],
        grid: {
          left: "0%",
          right: "0%",
          bottom: "0%",
          top: "10%",
          containLabel: true
        },
        xAxis: {
          data: []
        },
        yAxis: {},
        series: [
          {
            type: 'bar',
            name: ["浏览量"],
            data: []
          }
        ]
      },
      //文章分类
      categoryOptions: {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          top: '5%',
          left: 'center',
          data: []
        },
        series: [
          {
            name: '文章分类',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '30',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: []
          }
        ]
      },
      //地理map
      userAreaMapOptions: {
        tooltip: {
          formatter: function (params) {
            let value = params.value ? params.value : 0;
            return params.seriesName + "<br />" + params.name + ": " + value;
          }
        },
        visualMap: {
          min: 0,
          max: 1000,
          right: 26,
          bottom: 40,
          showLabel: !0,
          pieces: [
            {
              gt: 100,
              label: "100人以上",
              color: "#ED5351"
            },
            {
              gte: 51,
              lte: 100,
              label: "51-100人",
              color: "#59D9A5"
            },
            {
              gte: 21,
              lte: 50,
              label: "21-50人",
              color: "#F6C021"
            },
            {
              label: "1-20人",
              gt: 0,
              lte: 20,
              color: "#6DCAEC"
            }
          ],
          show: 10
        },
        geo: {
          map: 'china',
          zoom: 1.2,
          layoutCenter: ["50%", "50%"],
          itemStyle: {
            normal: {
              borderColor: "rgba(0, 0, 0, .2)"
            },
            emphasis: {
              areaColor: "#F5DEB3",
              shadowOffsetX: 0,
              shadowOffsetY: 0,
              borderWidth: 0
            }
          }
        },
        series: [
          {
            name: "用户人数",
            type: 'map',
            geoIndex: 0,
            areaColor: "#0F88F0",
            data: []
          }
        ]
      },
      typeOfUser: 1

    }
  },
  created() {
    this.initData()
    //TODO 用户分布
  },
  methods: {
    initData() {
      this.getRequest("/admin").then(res => {
        let data = res.data.data;
        //counts...
        this.viewsCount = data.viewsCount;
        this.usersCount = data.usersCount;
        this.messagesCount = data.messagesCount;
        this.articlesCount = data.articlesCount;

        //echarts...
        //浏览量
        if (data.uniqueViewDTOList) {
          data.uniqueViewDTOList.forEach(uniqueViewDTO => {
            if (uniqueViewDTO.day && uniqueViewDTO.viewsCount) {
              //类目轴添加类（日）
              this.viewsCountOptions.xAxis.data.push(uniqueViewDTO.day);
              //第一个系列也就是该chart添加数据
              this.viewsCountOptions.series[0].data.push(uniqueViewDTO.viewsCount)
            }
          })
        }
        //热力图
        if (data.articlesOnOneDayList) {
          this.articlesOnOneDayList = data.articlesOnOneDayList
        }

        //文章排行
        if (data.articleViewsRankList) {
          data.articleViewsRankList.forEach(articleViewsRankDTO => {
            if (data.articleViewsRankDTO.articleTitle && data.articleViewsRankDTO.viewsCount) {
              this.articlesRankOptions.xAxis.data.push(articleViewsRankDTO.articleTitle);
              this.articlesRankOptions.series[0].data.push(articleViewsRankDTO.viewsCount)
            }
          })
        }

        //文章分类
        if (data.categoryList) {
          data.categoryList.forEach(categoryDTO => {
            this.categoryOptions.series[0].data.push({
              name: categoryDTO.categoryName,
              value: categoryDTO.articlesCount
            })
            this.categoryOptions.legend.data.push(categoryDTO.categoryName)
          })
        }


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