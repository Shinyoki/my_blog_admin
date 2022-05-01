<template>
  <div class="component">
    <div class="main-container">
      <div class="img-container container-item">
        <img class="inner-image" :src="image404">
      </div>
      <div class="text-container container-item">
        <div class="code">404SenkoNotFound</div>
        <div class="msg">你查看的页面貌似丢失了呢...</div>
        <router-link to="/">
          <el-button type="primary" round class="action">返回首页</el-button>
        </router-link>
      </div>
    </div>
  </div>

</template>

<script src="./_404.js" lang="js"></script>
<style src="./_404.less" lang="less" scoped></style>

