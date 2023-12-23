<script lang="ts" setup>
import { ref } from "vue";
let dialogVisible = ref(false);
function handleClose(){
    console.log(`close`);
    
}
defineExpose({dialogVisible})
</script>

<template>
    <div>
        <el-dialog
    v-model="dialogVisible"
    title="Tips"
    width="30%"
    :before-close="handleClose"
  >
    <span>This is a message</span>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="dialogVisible = false">
          Confirm
        </el-button>
      </span>
    </template>
  </el-dialog>
    </div>
</template>