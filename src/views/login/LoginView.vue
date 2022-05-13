<template>
  <div class="container">
    <div class="forms-container">
      <!--        登录表单-->
      <div class="sign-signup">
        <form action="" method="post" id="sign-in-form" class="sign-in-form">
          <h2 class="title">用户登录</h2>
<!--          用户名-->
          <div class="input-field">
            <font-awesome-icon  class="front-fa" :icon="['fas', 'fa-user']"/>
            <input type="email" @keyup="valid" id="sign_username" v-model="sign.username" name="username" placeholder="用户邮箱"/>
          </div>
<!--          密码-->
          <div class="input-field">
            <font-awesome-icon class="front-fa" :icon="['fas', 'fa-lock']"/>
            <input type="password" @keyup="valid" id="sign_password" v-model="sign.password" name="password" placeholder="密码"/>
          </div>
          <div v-loading.fullscreen.lock="lLoading">
            <input type="button" @click="doLogin()"  value="登录" class="btn sign"/>
          </div>
<!--          其他登录方式-->
          <p class="social-text">选择其他登录方式</p>
          <div class="social-media">
            <div to="" @click="notSupportYet()"  class="social-icon">
              <font-awesome-icon icon="fa-brands fa-qq" />
            </div>
            <div @click="notSupportYet()" class="social-icon">
              <font-awesome-icon icon="fa-brands fa-weibo"/>
            </div>
            <div to="" @click="notSupportYet()" class="social-icon">
              <font-awesome-icon icon="fa-brands fa-weixin"/>
            </div>
          </div>
        </form>

        <!--        注册表单-->
        <form action="" method="post" id="sign-up-form" class="sign-up-form">
          <h2 class="title">用户注册</h2>
          <!--          用户名-->
          <div class="input-field">
            <font-awesome-icon  class="front-fa" :icon="['fas', 'fa-user']"/>
            <input type="text" @keyup="valid" id="sign_up_nickname" v-model="sign_up.nickname" name="nickname" placeholder="用户昵称"/>
          </div>
          <!--          邮箱-->
          <div class="input-field">
            <font-awesome-icon  class="front-fa" :icon="['fas', 'fa-envelope']"/>
            <input type="email" @keyup="valid" id="sign_up_username" v-model="sign_up.username" name="username" placeholder="用户邮箱"/>
          </div>
          <!--          密码-->
          <div class="input-field">
            <font-awesome-icon class="front-fa" :icon="['fas', 'fa-lock']"/>
            <input type="password" @keyup="valid" id="sign_up_password" v-model="sign_up.password" name="password" placeholder="密码"/>
          </div>
          <input type="button" @click="doRegist()" v-loading.fullscreen.lock="rLoading" value="注册" class="btn signup"/>
        </form>
      </div>

    </div>

    <div class="panels-container">

      <div class="panel left-panel">
        <div class="content">
          <h3>还没有账号？</h3>
<!--          不要在admin项目里面用-->
          <p>要是没有账号可以点击下面的按钮来注册哦~</p>
          <button class="btn transparent" id="sign-up-btn" >去注册</button>
        </div>

        <img src="https://cdn.jsdelivr.net/gh/Shinyoki/blog_images_repository/images/register.svg" class="images">
      </div>

      <div class="panel right-panel">
        <div class="content">
          <h3>想起账号了？</h3>
          <p>那就点击下面的按钮回去登录吧~</p>
          <button class="btn transparent" id="sign-in-btn">去登录</button>
        </div>

        <img src="https://cdn.jsdelivr.net/gh/Shinyoki/blog_images_repository/images/log.svg" class="images">
      </div>

    </div>
  </div>
</template>


<script>
import {initMenus} from "@/utils/menu";


export default {
  name: "LoginView",
  watch: {

  },
  data() {
    return {
      rLoading: false,
      lLoading: false,
      sign: {
        username: "",
        password: ""
      },
      sign_up: {
        nickname: "",
        username: "",
        password: ""
      }
    }
  },
  methods: {
    notSupportYet() {
      this.$message({
        type: 'warning',
        message: '目前暂不支持'
      })
    },
    doLogin() {
      this.lLoading = true;
      //验证表单
      if (this.signin()) {
        //腾讯防水墙
        //eslint强行忽略注释
        // eslint-disable-next-line no-undef
        let captcha = new TencentCaptcha(
            //参数一 AppId
            this.config.TENCENT_CAPTCHA_APP_ID,
            //第二参数 回调函数  https://cloud.tencent.com/document/product/1110/36841
            (res) => {
              //ret 0
              if (res.ret === 0) {

                //向后端发送登录请求，然而Spring security的登录请求必须是post form类型，不能直接传一个对象
                let userDetails = new URLSearchParams();
                userDetails.append("username", this.sign.username);
                userDetails.append("password", this.sign.password);

                this.postRequest("/login", userDetails).then(res=>{
                  if (res.data.flag) {
                    //res.data ==> userDetails
                    //存储用户信息
                    this.$store.commit("login", res.data.data);
                    //初始化vuex userMenuList 和 router
                    initMenus();
                    this.$message.success("登陆成功")
                    //跳转
                    this.$router.push({path: '/'})
                    this.lLoading = false
                    return;
                  }
                })
              }
              this.lLoading = false
            }
        )
        //显示验证码
        captcha.show();
      }
    },
    doRegist() {
      this.$message({
        type: 'error',
        message: 'Admin系统不支持注册新用户'
      })
    },
    signin() {
      //验证表单
      let flag = true;
      for(let val in this.sign) {
        flag = this.validateFatherElement(document.getElementById("sign_" + val))
      }
      if (flag === false) {
        this.$message({
          message: '不大对劲，有什么写错了吧',
          type: 'warning'
        });
        return flag;
      }
      return true;
    },
    signup() {
      //验证表单
      let flag = true;
      for(let val in this.sign_up) {
        flag = this.validFormElement(document.getElementById("sign_up_" + val))
      }
      if (flag === false) {
        this.$message({
          message: '不大对劲，有什么写错了吧',
          type: 'warning'
        });
        return flag;
      }
      return true;
    },
    valid(event) {
      return this.validateFatherElement(event.currentTarget, event.currentTarget.getAttribute("type"))
    },
    validFormElement(element) {
      return this.validateFatherElement(element, element.getAttribute("type"))
    },
    validateEmail(str){
      if (str == null) {
        return false;
      } else {
        let pattern = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
        return pattern.test(str);
      }
    },
    validateFatherElement(element, text="text") {
      if (element == null) {
        return false
      }
      const father = element.parentElement
      switch (text) {
        case "text":
          if (element.value != null && element.value != "" && father.classList.length > 0) {
            if (father.classList.contains("bad_valid")) {
              father.classList.remove("bad_valid");
            }
            return true;
          }
          break;
        case "email":
          if (element.value != null && element.value != "" && father.classList.length > 0) {
            if (this.validateEmail(element.value)) {
              if (father.classList.contains("bad_valid")) {
                  father.classList.remove("bad_valid");
              }
              return true;
            } else {
              //验证不通过
              father.classList.add("bad_valid");
              return false;
            }


          }
          break;
        case "password":
          if (element.value != null && element.value != "" && father.classList.length > 0 ) {
            if (father.classList.contains("bad_valid")) {
              father.classList.remove("bad_valid");
            }
            return true;
          }
          break;
      }
      father.classList.add("bad_valid")
      return false;
    }
  },
  mounted() {
    /**
     * 卧槽，原来生命周期是这样用的，tnnd在原生js中写了老久，
     * 第一次进页面只能得到null undefined对象，进来后刷新才有。
     *
     * 是我太菜了，前端学不懂
     */
    const sign_in = document.getElementById("sign-in-btn");
    const sign_up = document.getElementById("sign-up-btn");
    const container = document.querySelector(".container");
    sign_up.addEventListener("click", ()=>{
      container.classList.add("sign-up-mode")
    })
    sign_in.addEventListener("click", ()=>{
      container.classList.remove("sign-up-mode")
    })

  }

}
</script>

<style lang="less" scoped>
  *{
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  }

  .btn {
    width: 150px;
    height: 49px;
    border: none;
    border-radius: 40px;
    cursor: pointer;
    background-color: #5959fd;
    color: #fff;
    font-weight: 600;
    margin: 10px 0;
    transition: .5s;

  }

  .btn:hover {
    background-color: #4d84e2;
  }

  .btn.transparent{
    margin: 0;
    border: 2px solid #fff;
    width: 130px;
    height: 41px;
    font-weight: 600;
    font-size: 0.8rem;
  }

  .container:before{
    content: '233';
    //脱离文档流
    position: absolute;
    //超大边框，中心和relative模式有很大不同
    width: 2000px;
    height: 2000px;
    border-radius: 50%;
    background: linear-gradient(-45deg, #4481eb, #04befe);

    top: -10%;
    right: 40%;
    transform: translateY(-50%);


    //生成的图形正好比 panel低index
    z-index: 6;

    transition: 1.8s ease-in-out;
  }

  .container {
    position: relative;
    width: 100%;
    min-height: 100vh;
    background-color: aliceblue;
    overflow: hidden;

    .forms-container {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;

      .sign-signup {
        //再次脱离文档流
        position: absolute;
        top: 50%;
        left: 75%;
        transform: translate(-50%, -50%);
        transition: 1s 0.7s ease-in-out;

        //宽度、以及改为grid排版，将两个form按比例填充
        width: 50%;
        display: grid;
        grid-template-columns: 1fr;

        //最低优先级
        z-index: 5;

        form {
          //表单是flex排布
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;

          //设置grid比例
          grid-column: 1 / 2;
          grid-row: 1 / 2;

          padding: 0 5rem;
          overflow: hidden;

          //form渐变
          transition: .2s .7s ease-in-out;

          .title {
            font-size: 2rem;
            color: #444;
            margin-bottom: 10px;
          }

          .input-field {
            max-width: 300px;
            //撑满width
            width: 100%;
            height: 55px;
            background-color: #f0f0f0;
            margin: 10px 0;
            border-radius: 55px;

            //网格分离内部标签
            display: grid;
            grid-template-columns: 15% 85%;
            padding: 0 .4rem;
            transition: .9s .3s ease-in-out;

            &.bad_valid {
              background-color: rgba(204, 44, 44, 0.77);
              border: solid 3px coral;
            }
            .front-fa {
              align-self: center;
              width: 100%;
              color: #acacac;
              font-size: 1.1rem;
            }

            input {
              //取消输入框样式
              background: none;
              outline: none;
              border: none;

              line-height: 1;
              font-weight: 600;
              font-size: 1.1rem;
              color: #333;
            }

            input::placeholder {
              color: #aaa;
              font-weight: 550;
            }
          }

          .social-text {
            padding: .7rem 0;
            font-size: 1rem;
          }

          .social-media{
            display: flex;
            justify-content: center;

            .social-icon {
              width: 46px;
              height: 46px;
              border: solid #333 1px;
              margin: 0 0.45rem;

              //修改FontAwesome摆放位置
              display: flex;
              justify-content: center;
              align-items: center;

              color: #333;
              font-size: 1.1rem;
              border-radius: 50%;

              transition: .5s;
            }

            .social-icon:hover {
              border-color: #4481eb;
              background-color: #fff;
              color: #4481eb;

              /**
                鼠标样式：暂不支持
               */
              cursor: not-allowed;
            }
          }

          &.sign-in-form{
            z-index: 2;
          }

          &.sign-up-form {
            z-index: 1;
            opacity: 0;
          }
        }

      }


    }

    .panels-container{
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;

      //将images内容分为grid item
      display: grid;
      //竖着分出两个
      grid-template-columns: 1fr 1fr;

      .panel {
        //panel里的各种元素被flex
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-around;
        text-align: center;

        //最高优先级
        z-index: 7;

        &.left-panel{
          pointer-events: all;

          padding: 3rem 17% 2rem 12%;
        }

        &.right-panel{
          //鼠标事件会完全被省略，相当于变成了彻底的透明人（而且是摸不到的那种
          pointer-events: none;

          padding: 3rem 12% 2rem 17%;

          .content,
          .images {
            //单纯的移动图片、组件，没用，当前的absolute grid item仍然会阻挡底层的面板
            //只是视觉上的移动，文档流不变
            transform: translateX(800px);
          }
        }

        .content {
          color: #fff;

          //动画
          transition: 1.1s .4s ease-in-out;

          h3{
            font-weight: 600;
            line-height: 1;
            font-size: 1.5rem;
          }

          p{
            font-size: 0.95rem;
            padding: 0.7rem 0;
          }
        }

        .images{
          width: 100%;

          //动画
          transition: 1.1s .4s ease-in-out;
        }
      }


    }

    &.sign-up-mode:before {
      //让处于sign-up-mode的container的before右移
      transform: translate(100%, -50%);
      right: 52%;
    }

    /**
    卧槽，巨坑，选择器必须越详细越有优先级，经常因为这个导致样式失效
     */
    &.sign-up-mode {
      .sign-signup {
        //这个可不是panel，是要手动定位的
        left: 25%;
      }

      .panel {
        //处于signupmode的container，此时左panel图标和内容都会移动
        &.left-panel{
          pointer-events: none;

          .content,
          .images{
            transform: translateX(-800px);
          }
        }
        &.right-panel{
          pointer-events: all;
          .content,
          .images{
            //恢复原位置，不过此时因为pointers-event:none，导致无法正常触发，
            transform: translateX(0);
          }
        }
      }

      .forms-container {
        .sign-signup {
          form {
            &.sign-in-form {
              //此时记得将登录form隐藏，恢复注册form
              z-index: 1;
              opacity: 0;
            }

            &.sign-up-form {
              z-index: 2;
              opacity: 1;
            }
          }
        }
      }
    }
  }

  @media (max-width: 570px) {
    form {
      padding: 0 1.5rem;
    }

    .image {
      display: none;
    }
    .panel .content {
      padding: 0.5rem 1rem;
    }
    .container {
      padding: 1.5rem;
    }

    .container:before {
      bottom: 72%;
      left: 50%;
    }

    .container.sign-up-mode:before {
      bottom: 28%;
      left: 50%;
    }
  }
  @media (max-width: 870px) {
    .container {
      //固定高度，防止继续变形
      min-height: 800px;
      height: 100vh;

      &:before
      {
        width: 1500px;
        height: 1500px;
        left: 30%;
        bottom: 60%;
        transform: translateX(-50%);
        transition: 2s ease-in-out;

        //默认值
        top: initial;
      }

      &.sign-up-mode {
        &:before{
          transform: translate(-50%, 100%);
          bottom: 32%;
          right: initial;
        }

        .forms-container{
          .sign-signup{
            top: 5%;
            transform: translate(-50%, 0);
            left: 50%;
          }
        }

        .panels-container {
          .panel{
            &.right-panel {
              .content,
              .images{
                transform: translateY(0);
              }
            }

            &.left-panel{
              .content,
              .images{
                transform: translateY(-300px);
              }
            }

          }
        }
      }

      .forms-container {
        .sign-signup {
          //撑满空间
          width: 100%;
          left: 50%;
          top: 95%;
          transform: translate(-50%, -100%);
        }
      }

      .panels-container {

        //这次竖着只能分出一列
        grid-template-columns: 1fr;
        //横着分出三行
        grid-template-rows: 1fr 2fr 1fr;
        .panel {
          //改回row div的形式
          flex-direction: row;
          justify-content: space-around;
          align-items: center;
          padding: 2.5rem 0;

          .content {
            //和图标拉点距离
            padding-right: 5%;
            transition: .9s .8s ease-in-out;


            .btn {
              &.transparent {
                width: 100px;
                height: 30px;
                font-size: .7rem;
              }
            }
            h3 {
              font-size: 1.2rem;
            }

            p {
              font-size: .7rem;
              padding: .7rem 0;
            }
          }

          .images {
            //缩小尺寸
            width: 200px;
            transition: .9s .6s ease-in-out;
          }

          &.left-panel{
            grid-row: 1 / 2;
          }
          &.right-panel{
            grid-row: 3 / 4;

            .content,
            .images{
              transform: translateY(300px);
            }
          }


        }
      }
    }
  }
</style>