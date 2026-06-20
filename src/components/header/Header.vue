<template>
  <div class="header">
    <div class="header-left">
      <div class="app-logo">
        <svg class="logo-svg" viewBox="0 0 32 32" width="28" height="28">
          <rect x="2" y="4" width="8" height="24" rx="2" fill="#4f46e5" opacity="0.9"/>
          <rect x="12" y="8" width="8" height="20" rx="2" fill="#6366f1" opacity="0.7"/>
          <rect x="22" y="2" width="8" height="26" rx="2" fill="#818cf8" opacity="0.5"/>
        </svg>
        <span class="logo-text">看板</span>
      </div>
    </div>

    <div class="header-center">
      <el-input
        v-model="searchText"
        :prefix-icon="Search"
        class="searchInput"
        placeholder="搜索卡片、标签、负责人..."
        clearable
        @input="filterText"
      />
    </div>

    <div class="header-right">
      <div class="board-stats">
        <span class="stat-item">
          <el-icon><Grid /></el-icon>
          {{ columnCount }} 列
        </span>
        <span class="stat-divider">·</span>
        <span class="stat-item">
          <el-icon><Document /></el-icon>
          {{ cardCount }} 卡片
        </span>
      </div>
      <button class="theme-toggle" @click="toggleTheme" :title="isDark ? '切换亮色' : '切换暗色'">
        <el-icon :size="18"><Moon v-if="!isDark" /><Sunny v-else /></el-icon>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { Search, Grid, Document, Moon, Sunny } from '@element-plus/icons-vue'
import { useKanbanStore } from '@/stores/kanban'

const store = useKanbanStore()
const searchText = ref('')
const emit = defineEmits(['change'])

// 暗色模式切换
const isDark = ref(false)
function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : '')
  localStorage.setItem('kanban-theme', isDark.value ? 'dark' : 'light')
}
// 初始化时读取
const saved = localStorage.getItem('kanban-theme')
if (saved === 'dark') {
  isDark.value = true
  document.documentElement.setAttribute('data-theme', 'dark')
}

const columnCount = computed(() =>
  store.columns.filter((col) => !('type' in col) || col.type !== 'add').length
)

const cardCount = computed(() => {
  let count = 0
  for (const col of store.columns) {
    if ('children' in col) {
      count += col.children.filter((item) => item.type === 'todo').length
    }
  }
  return count
})

function filterText(val: string | number) {
  emit('change', val)
}
</script>

<style lang="less" scoped>
.header {
  position: relative;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 24px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  box-sizing: border-box;
}

// ========== Logo ==========
.header-left {
  display: flex;
  align-items: center;
  min-width: 120px;
}

.app-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  user-select: none;

  .logo-svg {
    flex-shrink: 0;
  }

  .logo-text {
    font-size: 20px;
    font-weight: 700;
    background: linear-gradient(135deg, #4f46e5, #818cf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: 1px;
  }
}

// ========== 搜索框 ==========
.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.searchInput {
  width: 380px;
  max-width: 60vw;

  :deep(.el-input__wrapper) {
    border-radius: 50px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    transition: all 0.25s ease;

    &:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    &.is-focus {
      background: #fff;
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }
  }

  :deep(.el-input__inner) {
    font-size: 14px;
    color: #334155;

    &::placeholder {
      color: #94a3b8;
    }
  }
}

// ========== 统计信息 ==========
.header-right {
  display: flex;
  align-items: center;
  min-width: 160px;
  justify-content: flex-end;
}

.board-stats {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #64748b;
  font-weight: 500;

  .stat-item {
    display: inline-flex;
    align-items: center;
    gap: 4px;

    .el-icon {
      font-size: 15px;
      color: #94a3b8;
    }
  }

  .stat-divider {
    color: #cbd5e1;
    font-weight: 400;
  }
}

.theme-toggle {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border: none; border-radius: 8px;
  background: transparent; color: #94a3b8; cursor: pointer;
  transition: all 0.2s; margin-left: 8px;
  &:hover { background: #f1f5f9; color: var(--col-accent, #4f46e5); }
}
</style>
