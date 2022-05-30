<template>
<!--
 自定义编辑框
 http://t.zoukankan.com/10manongit-p-12939674.html
-->
  <div
    ref="editor"
    class="edit-container"
    v-html="innerText"
    :placeholder="innerTextPlaceholder"
    :contenteditable="editable"
    @input="onInput"
    @focus="onFocus"
    @blur="onBlur"
    />
</template>

<script>
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'TextEditor',
  /**
   * 自定义组件 实现v-model必须要注意的点：
   *
   * v-model本质上是 v-bind:value和v-on:input的组合，他们分别是向自定义组件的
   * prop#value传值以及监听input事件，从而实现了自定义组件的双向绑定。
   * 默认传递value值和input事件是模拟v-model的默认规则
   * https://segmentfault.com/a/1190000040859213
   */
  //组件属性
  props: {
    //v-model实现双向绑定前提：prop#value
    value: {
      type: String,
      default: ""
    },
    innerTextPlaceholder: {
      type: String,
      default: ""
    },
    editable: {
      type: Boolean,
      default: true
    }
  },
  //局部数据
  data() {
    return {
      //通过与prop#value绑定，从而实时接收到来自父组件v-bind传来的值
      innerText: this.value,
      //锁定编辑
      isLock: false,
      //选中的文本
      selectedRange: null
    }
  },
  methods: {
    onFocus(){
      /**
       *  使用$refs 与 $el 获取DOM的区别，在 Role.vue中就有提到过
       *  具体看下面的地址
       *  https://blog.csdn.net/qq_39141511/article/details/108799371
       */
      //@focus监听用于<Editor @focus="callBackFun"> callBackFun(text){}
      this.$emit("focus", this.$el.innerHTML);
      this.isLock = true;
    },
    onBlur() {
      this.isLock = false;

      /**
       * windows#selection选择区域相关
       * https://www.cnblogs.com/yuxingyoucan/p/5686134.html
       * https://blog.csdn.net/weixin_42420703/article/details/84892528
       */
      //失去焦点后自动将选中的内容存储
      let selection = window.getSelection();
      this.selectedRange = selection.getRangeAt(0);

      //@blur监听用于<Editor @blur="callBackFun"> callBackFun(text){}
      this.$emit("blur", this.$el.innerHTML);
    },
    //v-model双向绑定前提：@input监听
    onInput() {
      //@input监听用于<Editor @input="callBackFun)"> callBackFun(text){}
      this.$emit("input", this.$el.innerHTML);
    },
    //重置内容
    clear() {
      this.$el.innerHTML = "";
      this.$emit("input", this.$el.innerHTML);
    },
    //添加文本
    addHtmlText(text) {
      /**
       * 如果是添加如<i class="el-icon-search"/>这样的html字段，会被渲染为<i xxx></i>，
       * this.$refs.editor.addHtmlText(`<i class="el-icon-search"/>`)
       * 此时鼠标focus会选中到i标签内部，这是i标签继承了父标签<div>的contenteditable属性导致的
       * 因此在添加时要手动标注该属性为false <i contenteditable='false' class="el-icon-search"/>
       */
      if (window.getSelection()) {
        //添加的时候如果正在选择文本，则先删除该selection的range再添加自定义的range
        let selection = window.getSelection();
        selection.removeAllRanges();

        //如果没有因onBlur事件导致选取被记录，则手动记录
        if (this.selectedRange == null) {
          this.$refs.editor.focus();
          //记录focus后的range
          this.selectedRange = selection.getRangeAt(0);
        }

        //删除自定义range里的内容
        this.selectedRange.deleteContents();

        //将文本转换为dom元素，并添加到自定义range里
        /**
         * 通过该函数直接创建HTML结构
         * http://www.qiutianaimeili.com/html/page/2020/09/20564hbbcljywix.html
         */
        let htmlDOM = this.selectedRange.createContextualFragment(text);
        this.selectedRange.insertNode(htmlDOM);

        /**
         *  更新DOM显示的效果
         *  折叠开始和结束点到同一个位置
         *  Range#collapse
         *  https://developer.mozilla.org/zh-CN/docs/Web/API/Range/collapse
         */
        //添加自定义range
        selection.addRange(this.selectedRange);
        this.selectedRange.collapse(false); //光标移动到range末端

        //v-model的必备，将内容变动后的内容以$emit的形式回调给父组件
        this.$emit("input", this.$el.innerHTML);
      }
    }
  },
  watch: {
    //v-model实现双向绑定前提：prop#value
    //监听父组件值变动导致prop#value属性发生变化
    value() {
      if (!this.isLock) {
        this.innerText = this.value;
      }
    }
  }
}
</script>

<style scoped>
.edit-container {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background: #f0f1f4;
  font-size: 14px;
  line-height: 1.5;
  padding: 6px 12px;
  box-sizing: border-box;
  overflow: auto;
  word-break: break-all;
  outline: none;
  user-select: text;
  white-space: pre-wrap;
  text-align: left;
  -webkit-user-modify: read-write-plaintext-only;
}
/*当container内容为empty时，content显示attr(placeholder)*/
.edit-container:empty::before {
  content: attr(placeholder);
  color: #999;
}
</style>