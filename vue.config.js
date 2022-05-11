const { defineConfig } = require('@vue/cli-service')
const path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: "127.0.0.1",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://localhost:8888",
        changeOrigin: true,
        pathRewrite: {
          "^/api": ""
        }
      }
    }
  },
  configureWebpack: {
    devtool: 'source-map',
    name: "admin管理系统",
    resolve: {
      alias: {
        '@': resolve('src')
      }
    }
  }
})
