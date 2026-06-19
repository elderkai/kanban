<template>
  <div class="baseKanban">
    <Header @change="store.searchText = $event"></Header>
    <div class="box_cover">
      <div class="list_todo" v-for="(item, key) in store.columns" :key="key">
        <!-- "+添加列表"按钮 -->
        <div class="todo_top add_btn_top" v-if="'type' in item && item.type === 'add'" @click="addList">
          <div class="title">{{ item.title }}</div>
        </div>
        <!-- 列表头部 -->
        <div class="todo_top" v-else>
          <div class="title">
            {{ item.title }}（<span v-if="item.children">{{ getTodoCount(item.children) }}</span>）
          </div>
        </div>
        <!-- 拖拽区域 -->
        <draggable
          v-if="'children' in item && item.children"
          class="dragArea list-group"
          :drag-class="'dragClass'"
          :force-fallback="true"
          :list="item.children"
          :clone="clone"
          ghost-class="ghost"
          chosen-class="chosenClass"
          animation="300"
          :handle="'.mover'"
          :group="{ name: 'dragArea', pull: pullFunction }"
          @start="start"
          @end="onEnd"
          @move="onMove"
          item-key="key"
        >
          <template #item="{ element }">
            <div>
              <!-- "+添加卡片"按钮 -->
              <div v-if="element.type === 'add'" class="todo_item">
                <div class="add_text" @click.stop="store.openCreateDialog(key)">
                  +添加卡片
                </div>
              </div>

              <!-- 普通卡片 -->
              <div
                v-else
                v-show="matchesSearch(element)"
                class="todo_item card-item"
                :class="{
                  mover: element.move,
                  'priority-high': element.priority === 'high',
                  'priority-medium': element.priority === 'medium',
                  'priority-low': element.priority === 'low',
                  overdue: isOverdue(element)
                }"
              >
                <!-- 优先级色条 -->
                <div class="priority-bar" :class="'priority-' + element.priority"></div>

                <!-- 卡片内容区（点击打开编辑弹窗） -->
                <div class="card-body" @click="store.openEditDialog(element)">
                  <!-- 标题 -->
                  <div class="card-title">{{ element.title }}</div>

                  <!-- 标签行 -->
                  <div class="card-tags" v-if="element.tags && element.tags.length">
                    <el-tag
                      v-for="tag in element.tags"
                      :key="tag.id"
                      :color="tag.color"
                      size="small"
                      effect="dark"
                      class="card-tag"
                    >
                      {{ tag.name }}
                    </el-tag>
                  </div>

                  <!-- 元信息行：日期 + 负责人 -->
                  <div class="card-meta" v-if="element.dueDate || element.assignee">
                    <span v-if="element.dueDate" class="due-date" :class="{ 'text-danger': isOverdue(element) }">
                      <el-icon><Calendar /></el-icon>
                      {{ formatDate(element.dueDate) }}
                    </span>
                    <span v-if="element.assignee" class="assignee">
                      <el-icon><User /></el-icon>
                      {{ element.assignee }}
                    </span>
                  </div>
                </div>

                <!-- Hover 操作按钮 -->
                <div class="card-actions">
                  <el-button :icon="Edit" size="small" circle @click.stop="store.openEditDialog(element)" title="编辑" />
                  <el-button :icon="Delete" size="small" circle type="danger" @click.stop="confirmDelete(element)" title="删除" />
                </div>
              </div>
            </div>
          </template>
        </draggable>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <mDialog />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { Edit, Delete, Calendar, User } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import Header from '../../components/header/Header.vue'
import mDialog from './m-dialog.vue'
import draggable from 'vuedraggable'
import { useKanbanStore } from '@/stores/kanban'
import type { KanbanCard, KanbanList } from '@/types/kanban'

const store = useKanbanStore()
let isMove = ref(false)

// ========== 搜索过滤 ==========
function matchesSearch(card: KanbanCard): boolean {
  const s = store.searchText
  if (!s) return true
  const lower = s.toLowerCase()
  return (
    card.title.toLowerCase().includes(lower) ||
    (card.tags && card.tags.some((t) => t.name.toLowerCase().includes(lower))) ||
    (card.assignee && card.assignee.toLowerCase().includes(lower))
  )
}

// ========== 日期辅助 ==========
function isOverdue(card: KanbanCard): boolean {
  if (!card.dueDate) return false
  return dayjs(card.dueDate).isBefore(dayjs(), 'day')
}

function formatDate(date: string): string {
  return dayjs(date).format('MM-DD')
}

// ========== 卡片计数 ==========
function getTodoCount(children: any[]): number {
  return children.filter((c) => c.type === 'todo').length
}

// ========== 删除卡片 ==========
function confirmDelete(card: KanbanCard) {
  ElMessageBox.confirm('确定删除该卡片吗？', '确认删除', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      store.deleteCard(card.key)
    })
    .catch(() => {})
}

// ========== 添加列表 ==========
function addList() {
  ElMessageBox.prompt('请输入列表名称', '添加列表', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /\S/,
    inputErrorMessage: '列表名称不能为空'
  })
    .then(({ value }) => {
      store.createList(value.trim())
    })
    .catch(() => {})
}

// ========== 拖拽事件 ==========
function clone(val: any) {
  return val
}

function onMove(val: any) {
  console.log('move', val)
  return true
}

function start(val: any) {
  console.log('start', val)
  isMove.value = true
}

function onEnd(val: any) {
  isMove.value = false
  console.log('onEnd', val)
  store.reSort()
}

function pullFunction(val: any) {
  console.log('pullFunc', val)
  return true
}
</script>

<style lang="less" scoped>
.baseKanban {
  background: linear-gradient(135deg, #1a3c47 0%, #2d6a7d 30%, #3b99a6 60%, #4db8c7 100%);
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

// ========== 搜索框美化 ==========
::v-deep .searchInput .el-input__wrapper {
  border-radius: 50px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover,
  &.is-focus {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
    background: #fff;
  }
}

// ========== 看板容器 ==========
.box_cover {
  display: flex;
  justify-content: start;
  padding: 10px 0 10px 24px;
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
  height: calc(100vh - 70px);
  gap: 4px;

  // 自定义滚动条
  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.08);
    border-radius: 10px;
    margin: 0 20px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.35);
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.55);
  }

  .list_todo {
    margin-top: 8px;
    height: 100%;
    min-width: 280px;
    max-width: 280px;
    position: relative;
    padding: 0 12px;
    border-radius: 16px;
    padding-top: 16px;
    background: rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(4px);
    transition: background 0.25s ease;
    flex-shrink: 0;

    &:hover {
      background: rgba(255, 255, 255, 0.13);
    }

    .list-group {
      height: calc(100vh - 260px);
      max-height: calc(100vh - 260px);
      overflow-y: auto;
      overflow-x: hidden;
      padding: 2px 4px;

      &::-webkit-scrollbar {
        width: 4px;
      }
      &::-webkit-scrollbar-track {
        background: transparent;
      }
      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 4px;
      }
      &::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.4);
      }
    }
  }

  // ========== 列标题 ==========
  .todo_top {
    border-radius: 12px;
    margin-bottom: 16px;
    text-align: left;
    box-sizing: border-box;
    color: #fff;
    padding: 8px 16px;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 1px;
    background: rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(6px);
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    gap: 8px;

    .title {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .add_btn_top {
    justify-content: center;
    cursor: pointer;
    opacity: 0.75;
    transition: all 0.25s ease;
    border: 2px dashed rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.04) !important;

    &:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.12) !important;
      border-color: rgba(255, 255, 255, 0.6);
      transform: scale(1.02);
    }
  }

  // ========== 卡片主体 ==========
  .card-item {
    position: relative;
    background: #fff;
    padding: 12px 36px 12px 8px;
    border-radius: 12px;
    margin-bottom: 8px;
    width: 252px;
    max-width: 252px;
    box-sizing: border-box;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06);
    cursor: pointer;
    min-height: 32px;
    display: flex;
    flex-direction: row;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid rgba(0, 0, 0, 0.04);

    &:hover {
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
      border-color: rgba(0, 0, 0, 0.08);
    }

    // 优先级色条
    .priority-bar {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 5px;
      border-radius: 12px 0 0 12px;
      background: #e0e0e0;

      &.priority-high {
        background: linear-gradient(180deg, #ff6b6b, #ee5a24);
      }
      &.priority-medium {
        background: linear-gradient(180deg, #ffa726, #ff9800);
      }
      &.priority-low {
        background: linear-gradient(180deg, #66bb6a, #43a047);
      }
      &.priority-none {
        background: #e8e8e8;
      }
    }

    // 优先级色条替代 border-left
    &.priority-high,
    &.priority-medium,
    &.priority-low {
      border-left: none;
    }
    &.overdue {
      background: linear-gradient(135deg, #fff5f5, #fff0f0);
      border-color: #ffcdd2;

      &:hover {
        border-color: #ef9a9a;
      }
    }

    .card-body {
      flex: 1;
      min-width: 0;
      padding-left: 4px;
    }

    .card-title {
      font-weight: 600;
      font-size: 14px;
      line-height: 1.5;
      color: #2c3e50;
      word-break: break-word;
    }

    .card-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      margin-top: 8px;

      .card-tag {
        font-size: 11px;
        border-radius: 6px;
        padding: 0 8px;
        height: 20px;
        line-height: 20px;
        font-weight: 500;
      }
    }

    .card-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 8px;
      font-size: 12px;
      color: #a0aec0;

      .due-date,
      .assignee {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        padding: 2px 6px;
        background: #f7fafc;
        border-radius: 6px;

        .el-icon {
          font-size: 13px;
        }
      }
      .text-danger {
        color: #e53e3e;
        font-weight: 700;
        background: #fff5f5;
      }
    }

    // Hover 操作按钮
    .card-actions {
      position: absolute;
      top: 6px;
      right: 4px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      opacity: 0;
      transform: translateX(4px);
      transition: all 0.2s ease;
      z-index: 5;
      pointer-events: none;

      .el-button {
        width: 28px;
        height: 28px;
        min-width: 28px;
        pointer-events: auto;

        .el-icon {
          font-size: 15px;
        }
      }
    }
    &:hover .card-actions {
      opacity: 1;
      transform: translateX(0);
      pointer-events: auto;
    }
    &:hover .card-actions {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .mover {
    min-height: 49px;
    cursor: grab;

    &:active {
      cursor: grabbing;
    }
    &:hover {
      cursor: grab;
    }
  }
}

// ========== 拖拽样式 ==========
.chosenClass {
  background: #fff !important;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2) !important;
  transform: rotate(2deg) scale(1.03) !important;
  z-index: 100;
}
.ghost {
  opacity: 0.35;
  background: #e2e8f0;
  border: 2px dashed #a0aec0;
  border-radius: 12px;

  * {
    visibility: hidden;
  }
}
.dragClass {
  background: #fff !important;
  opacity: 1 !important;
  transform: rotate(3.5deg) scale(1.05) !important;
  cursor: grabbing !important;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25) !important;
  z-index: 200;
}

// ========== "+添加卡片"占位容器 ==========
.todo_item {
  position: relative;
  min-height: 36px;
}

// ========== "+添加卡片"按钮 ==========
.add_text {
  width: 100%;
  border-radius: 10px;
  line-height: 36px;
  text-align: center;
  cursor: pointer;
  color: #a0aec0;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    color: #4a5568;
    background: rgba(0, 0, 0, 0.04);
  }
}

// ========== 输入框无边框 ==========
::v-deep .no_border .el-textarea__inner {
  border: none;
  box-shadow: none;
  border-radius: 10px;
  background: #f7fafc;
  font-size: 14px;
  resize: none;
  padding: 10px 12px;

  &:focus {
    background: #fff;
    box-shadow: 0 0 0 2px #409eff33;
  }
}
</style>
