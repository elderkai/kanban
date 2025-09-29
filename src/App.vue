<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
const router = useRouter()
import { ref } from "vue"
let arr = ref(['ComponentA', 'ComponentB', 'test'])
// function click(type: any) {
//   console.log(type);
//   if (type == 1) {
//     router.push('/test?type=1')
//   } else if (type == 3) {
//     router.push('/')
//   }
//   else {
//     router.push('/test?type=2')
//   }
// }
// function clear() {
//   arr.value = []
// }
</script>
<template>
  <div>
    <!-- <el-button @click="click(1)">1</el-button>
    <el-button @click="click(2)">2</el-button>
    <el-button @click="click(3)">3</el-button>
    <el-button @click="clear()">clear</el-button> -->
    <router-view v-slot="{ Component }">
      <KeepAlive :include="arr">
        <component :is="Component" :key="$route.fullPath" />
      </KeepAlive>
    </router-view>
  </div>
</template>
<style scoped></style>
