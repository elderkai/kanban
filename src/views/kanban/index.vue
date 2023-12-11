<template>
  <div class="baseKanban">
    <div class="hedader">
      <div class="cover">
        <el-input v-model="searchText" :prefix-icon="Search" class="searchInput" placeholder="搜索相关内容">
        </el-input>
      </div>
    </div>
    <div class="box_cover">
      <div class="list_todo" v-for="(item,key) in myTodos" :key="key">
        <div class="todo_top">
          <div class="title">{{ item.title }}</div>
        </div>
        <draggable
        class="dragArea list-group"
        :list="item.children"
        :clone="clone"
        :group="{ name: 'people', pull: pullFunction }"
        @start="start"
        item-key="id"
      >
      <template #item="{ element }">
        <div class="todo_item" >
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
let myTodos:any = ref([]);
function init(){
  console.log(draggable);
  
  for (let i = 0; i < 20; i++) {
    let obj:any = {
      title:`list${i}`,
      children:[]
    }
    let key = 0;
    for (let j = 0; j < 101; j++) {
      obj.children.push({
        title:`list${i}-todo${j}`,
        key
      })
      key++;
    }
    myTodos.value.push(obj)
  }
}
init()
function clone(val:any){
  console.log(val);
  return val
  

}
function start(val:any) {
  console.log(val);
  return  val
    }
function pullFunction(){
  return true;
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
.box_cover{
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
  .list_todo{
    margin-top: 20px;
    padding: 0 20px;
    overflow-y: auto;
    height: 100%;
    min-width: 220px;
    position: relative;
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
  .todo_top{
    background: #52bfd1;
    padding: 10px;
    border-radius: 50px;
    margin-bottom: 20px;
    text-align: center;
    box-sizing: border-box;
    box-shadow: 11px 9px 11px rgba(69, 67, 67, 0.2);
  }
  .todo_item{
    background: #fff4ec;
    padding: 20px;
    border-radius: 15px;
    margin-bottom: 10px;
    width: max-content;
    min-width: 120px;
    width: 100%;
    box-sizing: border-box;
    box-shadow: 11px 9px 11px rgba(69, 67, 67, 0.2);

  }
}
</style>