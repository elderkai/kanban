<template>
  <div class="baseKanban">
    <div class="hedader">
      <div class="cover">
        <el-input v-model="searchText" :prefix-icon="Search" class="searchInput" placeholder="搜索相关内容">
        </el-input>
      </div>
    </div>
    <div class="box_cover">
      <div class="list_todo" v-for="(item, key) in myTodos" :key="key">
        <div class="todo_top">
          <div class="title">{{ item.title }}</div>
        </div>
        <draggable v-if="item.children" class="dragArea list-group" :drag-class="'dragClass'" :force-fallback="true" :list="item.children"
          :clone="clone" ghost-class="ghost" chosen-class="chosenClass" animation="300"  :handle="`.mover`" 
          :group="{ name: 'dragArea', pull: pullFunction }" @start="start" @end="onEnd" :move="onMove" item-key="id">
          <template #item="{ element }">
            <div v-if="element.type=='add'" class="todo_item" >
              <div class="add_text" @click.stop="addTodo(item)">
                +添加卡片
              </div>
              </div>
            <div :class="`todo_item ${element.move?'mover':''}`" v-else-if="element.type=='todo'">
              {{ element.title }}</div>
          </template>
        </draggable>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Search } from '@element-plus/icons-vue'
import draggable from "vuedraggable";
import { ref } from "vue";
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
function init() {
  myTodos.value.forEach((it: any) => {
    for (let index = 0; index < 10; index++) {
      it.children.push({
        title: `${it.title}--${index + 1}`,
        type:'todo',
        move:true
      })
    }
    it.children.push({
        title: ``,
        type:'add',
        move:false
      })
  });
  myTodos.value.push({title:"+添加列表"})
  console.log(myTodos.value);

}
init()
function clone(val: any) {
  console.log(val);
  return val


}
function onMove(val: any) {
  console.log(val,111);
  if(val.draggedContext.element.type=='add'){
    console.log(2122);
    
    return false
  }
  return val


}
function start(val: any) {
  console.log(val);
  
  isMove.value = true;

  return val
}
function onEnd(val: any) {
  isMove.value = false;
  console.log(val);
  return val
}
function pullFunction(val:any) {
console.log(val,2222);
// if(val.type=='add'){
//   return false
// }
  return true;
}
function addTodo(val:any){
  console.log(val);
  val.children.splice(val.children.length-1,0,{title:'',type:"todo"})
  
}
</script>

<style lang="less" scoped>
.baseKanban {
  background: #0c3540;
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  .hedader {
    height: 70px;
    background: #041517;
    background-image: linear-gradient(rgb(22 72 87 0.8), rgb(47 106 118 0.8));
    width: 100%;
    -webkit-backdrop-filter: blur(110px);
    backdrop-filter: blur(110px);
    position: relative;
    box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.2);
  }

  .cover {
    width: 100%;
    height: 100%;
    position: absolute;
    background: linear-gradient(to right, rgb(6 24 29 / 20%), rgb(47 106 118 / 50%));

  }

  .searchInput {
    position: absolute;
    margin: 0 auto;
    width: 220px;
    left: 50%;
    top: 19px;
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
    margin-top: 20px;
    padding: 0 20px;
    height: 100%;
    min-width: 220px;
    position: relative;
    height: 100%;
    .list-group{
      height: calc(100vh - 150px);
      max-height: calc(100vh - 150px);
      overflow-y: auto;
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
    }
  }

  .todo_top {
    background: #52bfd1;
    padding: 10px;
    border-radius: 50px;
    margin-bottom: 20px;
    text-align: center;
    box-sizing: border-box;
    box-shadow: 11px 9px 11px rgba(69, 67, 67, 0.2);
  }

  .todo_item {
    position: relative;
    background: #fff4ec;
    padding: 10px;
    border-radius: 15px;
    margin-bottom: 10px;
    width: max-content;
    min-width: 120px;
    width: 100%;
    box-sizing: border-box;
    box-shadow: 11px 9px 11px rgba(69, 67, 67, 0.2);
    cursor: all-scroll;
    min-height: 32px;
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
}
.todo_btn_add{
  background: #FFF;
  border-radius: 15px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  cursor: pointer;
}
.add_text{
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
</style>