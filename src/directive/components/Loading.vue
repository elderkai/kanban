<template>
    <div
      v-show="visible"
      class="el-loading-mask"
      :style="{ backgroundColor: background }"
    >
      <div class="el-loading-spinner" :style="` background: url(${loadingGif}) no-repeat;background-repeat: no-repeat;background-size: 100%;`">
        <svg v-if="!spinner" class="circular" viewBox="25 25 50 50">
          <circle cx="50" cy="50" r="20" fill="none" class="path"/>
        </svg>
        <slot v-else name="spinner">
          <img v-if="customIcon" :src="customIcon" class="custom-spinner" />
        </slot>
        <p v-if="text" class="el-loading-text">{{ text }}</p>
      </div>
    </div>
  </template>
  
  <script lang="ts" setup>
  import loadingGif from "./loading.gif"
  import { ref, computed } from 'vue'
  const props = defineProps({
    visible: Boolean,
    text: String,
    background: { type: String, default: 'rgba(255,255,255,0.9)' },
    customIcon: String,
    target: { type: [String, Object], default: document.body },
    lock: Boolean
  })
  
  const positionStyle = computed(() => ({
    position: props.lock ? 'fixed' : 'absolute'
  }))
  </script>
  
  <style scoped>
  .el-loading-mask {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
  }
  
  .circular {
    width: 42px;
    height: 42px;
    animation: loading-rotate 2s linear infinite;
  }
  
  .path {
    animation: loading-dash 1.5s ease-in-out infinite;
    stroke: #409eff;
    stroke-width: 2;
    stroke-dasharray: 90,150;
    stroke-dashoffset: 0;
  }
  
  @keyframes loading-rotate {
    100% { transform: rotate(360deg); }
  }
  
  @keyframes loading-dash {
    0% { stroke-dasharray: 1,200; stroke-dashoffset: 0; }
    50% { stroke-dasharray: 90,150; stroke-dashoffset: -40px; }
    100% { stroke-dasharray: 90,150; stroke-dashoffset: -120px; }
  }

  .el-loading-spinner .circular {
    width: 42px;
    height: 42px;
    animation: loading-rotate 2s linear infinite;
    display: none;
}

.el-loading-spinner {
   
    width: 86px;
    height: 86px;
    position: absolute;
    top: 50%;
    left: 50%;
    -webkit-transform: translate(-50%, 0);
    transform: translate(-50%, 0);
}
.el-loading-mask {
    background: rgba(255, 255, 255, .6)!important;
}
  </style>
  