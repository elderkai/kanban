<template>
  <div class="baseKanban">
    <Header @change="filterText"></Header>
    <div class="box_cover">
      <div class="list_todo" v-for="(item, key) in myTodos" :key="key">
        <div class="todo_top add_btn_top" v-if="item.type" @click="addList">
          <div class="title">{{ item.title }}
          </div>
        </div>
        <div class="todo_top" v-else>
          <div class="title">{{ item.title }}（<span v-if="item.children">
              {{ item.children.length + 1 }}）
            </span></div>
        </div>
        <draggable v-if="item.children" class="dragArea list-group" :drag-class="'dragClass'" :force-fallback="true"
          :list="item.children" :clone="clone" ghost-class="ghost" chosen-class="chosenClass" animation="300"
          :handle="`.mover`" :group="{ name: 'dragArea', pull: pullFunction }" @start="start" @end="onEnd" :move="onMove"
          item-key="id">
          <template #item="{ element }">
            <div v-if="element.type == 'add'" class="todo_item">
              <div v-show="element.showInput">
                <el-input class="no_border" v-model="element.inputText" ref="kbInput" placeholder="输入卡片名称"
                  @blur="blurInput" resize="none" :autosize="{ minRows: 2, maxRows: 4 }" type="textarea"> </el-input>
              </div>
              <div v-show="!element.showInput" class="add_text" @click.stop="addTodo(key, element)">
                +添加卡片
              </div>
            </div>
            <div :class="`todo_item ${element.move ? 'mover' : ''}`" @click="editKb(key, element)"
              v-else-if="element.type == 'todo'" v-show="searchText == '' || element.title.indexOf(searchText) > -1">
              {{ element.title }}</div>
          </template>
        </draggable>
      </div>
    </div>
    <mDialog ref="dialogVue"></mDialog>
  </div>
</template>

<script lang="ts" setup>
import Header from "../../components/header/Header.vue"
import mDialog from './m-dialog.vue';
import draggable from "vuedraggable";
import { ref } from "vue";
let fourKey: any = 0;
let kbInput = ref(), dialogVue = ref();
let searchText = ref('');
let myTodos: any = ref([
  {
    title: '需求分析与方案设计',
    children: [],
  },
  {
    title: '开发中',
    children: [],
  },
  {
    title: '测试中',
    children: [],
  },
  {
    title: '发布中',
    children: [],
  },
  {
    title: '已完成',
    children: [],
  },
]);
let isMove = ref(false);
function filterText(val: any) {
  searchText.value = val;

}
function init() {
  let key = 1;
  myTodos.value.forEach((it: any) => {
    for (let index = 0; index < 10; index++) {
      it.children.push({
        title: `${it.title}--${index + 1}`,
        type: 'todo',
        move: true,
        key
      })
      key++
    }
    it.children.push({
      title: ``,
      type: 'add',
      move: false,
      showInput: false,
      inputText: '',
      key
    })
    key++
  });
  myTodos.value.push({ title: "+添加列表", type: 'add' })
  console.log(myTodos.value);

}
init()
function blurInput(val: any) {
  let list = myTodos.value[fourKey].children
  if (list[list.length - 1].inputText) {
    list.splice(list.length - 1, 0, { title: list[list.length - 1].inputText, type: "todo", move: true, })
    list[list.length - 1].inputText = ''
  }
  list[list.length - 1].showInput = !list[list.length - 1].showInput
}
function clone(val: any) {
  return val
}
function editKb(key: any, ele: any) {
  console.log(key, ele);
  dialogVue.value.dialogVisible = true
}
function onMove(val: any) {
  console.log('move', val);
  return val
}
function start(val: any) {
  console.log('start', val);
  isMove.value = true;
  return val
}
function reSort(list: any) {
  let tKay = list.findIndex((it: any) => { return it.type == 'add' })
  if (tKay > -1) {
    list.push(...list.splice(tKay, 1))
  }
  console.log(list);

}
function onEnd(val: any) {
  isMove.value = false;
  console.log('onEnd', val);
  myTodos.value.forEach((el: any) => {
    if (el.children) {
      let last = el.children[el.children.length - 1]
      if (last.type != 'add') {
        reSort(el.children)
      }
    }
  })
  return val
}
function pullFunction(val: any) {
  console.log('pullFunc', val);

  // if(val.type=='add'){
  //   return false
  // }
  return true;
}
function addTodo(key: any, it: any) {
  it.showInput = true;
  fourKey = key;
  myTodos.value.forEach((el: any, elKey: any) => {
    if (key != elKey && el.children && el.children[el.children.length - 1].showInput) {
      el.children[el.children.length - 1].showInput = !el.children[el.children.length - 1].showInput;
    }
  })
  setTimeout(() => {
    kbInput.value[key].focus()
  }, 200);

  // val.children.splice(val.children.length - 1, 0, { title: '', type: "todo", move: true, })
}
function addList() {
  alert('请稍后')
}
</script>

<style lang="less" scoped>
.baseKanban {
  background: #3b99a6;
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  .searchInput {
    position: absolute;
    width: 230px;
    left: 50%;
    top: 50%;
    transform: translateY(-50%);
    margin-left: -110px;

  }
}

::v-deep .searchInput .el-input__wrapper {
  border-radius: 50px;
  box-shadow: 11px 9px 11px #0003
}

.box_cover {
  display: flex;
  justify-content: start;
  padding-left: 20px;
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
  height: calc(100vh - 70px);

  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: #0c3540;
    border-radius: 20px;
  }

  &::-webkit-scrollbar-thumb {
    background: #6ac1cd;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #6ac1cd;
    border-radius: 20px;
  }

  &::-webkit-scrollbar-thumb:active {
    background: #6ac1cd;
    border-radius: 20px;
  }

  .list_todo {
    margin-top: 10px;
    height: 100%;
    min-width: 230px;
    position: relative;
    height: 100%;
    padding: 0 20px;
    border-radius: 15px;
    padding-top: 20px;

    &:hover {
      background: #048496;
    }

    .list-group {
      height: calc(100vh - 268px);
      max-height: calc(100vh - 268px);
      overflow-y: auto;
      // padding: 0 20px;
      overflow-x: hidden;

      &::-webkit-scrollbar {
        width: 5px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
        border-radius: 20px;
      }

      &::-webkit-scrollbar-thumb {
        background: #6ac1cd;
        border-radius: 10px;
      }

      &::-webkit-scrollbar-thumb:hover {
        background: #6ac1cd;
        border-radius: 20px;
      }

      &::-webkit-scrollbar-thumb:active {
        background: #6ac1cd;
        border-radius: 20px;
      }
    }
  }

  .todo_top {
    // background: #52bfd1;
    // padding: 20px;
    border-radius: 50px;
    margin-bottom: 20px;
    text-align: left;
    box-sizing: border-box;
    color: #fff;
    padding-left: 20px;
    // box-shadow: 11px 9px 11px rgba(69, 67, 67, 0.2);
  }

  .todo_item {
    position: relative;
    background: #fff;
    padding: 10px;
    border-radius: 10px;
    margin-bottom: 10px;
    width: 210px;
    max-width: 210px;
    box-sizing: border-box;
    box-shadow: 5px 5px 5px 1px rgb(40 102 125);
    cursor: pointer;
    min-height: 32px;
  }

  .mover {
    min-height: 49px;
  }
}

.chosenClass {
  background-color: #fff;

}

.ghost {
  opacity: 0;
}

.ghost {
  background: #fff;
}

.dragClass {
  background: #fff !important;
  opacity: 1 !important;
  transform: rotate(3deg);
  cursor: all-scroll !important;
}

.todo_btn_add {
  background: #FFF;
  border-radius: 15px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  cursor: pointer;
}

.add_text {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 15px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  cursor: pointer;
  left: 0;
  top: 0;
}


.box_cover .add_btn_top {
  background: transparent;
  box-shadow: none;
  cursor: pointer;
  color: #ddd;
}

::v-deep .no_border .el-textarea__inner {
  border: none;
  box-shadow: none;
}
</style>