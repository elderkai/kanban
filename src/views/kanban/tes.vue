<template>
  <div>
    <el-input v-model="text"></el-input>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({ name: "test" });
</script>
<script lang="ts" setup>
import {useRoute} from "vue-router"
import {ref} from "vue"
const text = ref(); 
const route = useRoute()
console.log(route);

</script>
<style lang="scss" scoped></style>