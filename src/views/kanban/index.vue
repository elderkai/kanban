<template>
  <div class="baseKanban">
    <Header @change="store.searchText = $event" />
    <div class="box_cover">
      <div class="list_todo" v-for="(item, key) in store.columns" :key="key">
        <!-- "+添加列表"按钮 -->
        <div class="todo_top add_btn_top" v-if="'type' in item && item.type === 'add'" @click="addList">
          <el-icon :size="18"><Plus /></el-icon>
          <div class="title">{{ item.title }}</div>
        </div>

        <!-- 列表头部 -->
        <div class="todo_top" v-else>
          <div class="col-header">
            <div class="col-title-row">
              <span class="col-icon">{{ getColumnIcon(key) }}</span>
              <span class="title">{{ item.title }}</span>
            </div>
            <span class="col-count" v-if="'children' in item">{{ getTodoCount(item.children) }}</span>
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
                  <el-icon :size="15"><Plus /></el-icon>
                  <span>添加卡片</span>
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
import { Edit, Delete, Calendar, User, Plus } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import Header from '../../components/header/Header.vue'
import mDialog from './m-dialog.vue'
import draggable from 'vuedraggable'
import { useKanbanStore } from '@/stores/kanban'
import type { KanbanCard, KanbanList } from '@/types/kanban'

const store = useKanbanStore()
let isMove = ref(false)

// ========== 列图标 ==========
const columnIcons = ['📋', '🚀', '🧪', '📦', '✅', '📝', '🔧', '⭐']

function getColumnIcon(index: number): string {
  return columnIcons[index % columnIcons.length]
}

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
  return true
}

function start(val: any) {
  isMove.value = true
}

function onEnd(val: any) {
  isMove.value = false
  store.reSort()
}

function pullFunction(val: any) {
  return true
}
</script>

<style lang="less" scoped>
// ========== 看板背景 ==========
.baseKanban {
  background: #f0f2f5;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

// ========== 看板容器 ==========
.box_cover {
  display: flex;
  justify-content: start;
  padding: 20px 24px;
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
  height: calc(100vh - 56px);
  gap: 14px;
  box-sizing: border-box;

  // 自定义滚动条
  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
    margin: 0 24px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.2);
  }

  // ========== 列容器 ==========
  .list_todo {
    margin-top: 4px;
    height: 100%;
    min-width: 295px;
    max-width: 295px;
    position: relative;
    padding: 0 12px;
    border-radius: 14px;
    padding-top: 14px;
    background: #ebecf0;
    transition: background 0.2s ease;
    flex-shrink: 0;

    .list-group {
      height: calc(100vh - 180px);
      max-height: calc(100vh - 180px);
      overflow-y: auto;
      overflow-x: hidden;
      padding: 6px 0 8px;

      // 列内滚动条 — 仅 hover 时显示
      &::-webkit-scrollbar {
        width: 4px;
      }
      &::-webkit-scrollbar-track {
        background: transparent;
      }
      &::-webkit-scrollbar-thumb {
        background: transparent;
        border-radius: 4px;
      }
      &:hover::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.12);
      }
      &:hover::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 0, 0, 0.25);
      }
    }
  }

  // ========== 列标题 ==========
  .todo_top {
    border-radius: 10px;
    margin-bottom: 12px;
    box-sizing: border-box;
    padding: 10px 14px;
    display: flex;
    align-items: center;

    .col-header {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .col-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      flex: 1;
    }

    .col-icon {
      font-size: 16px;
      flex-shrink: 0;
      line-height: 1;
    }

    .title {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #1e293b;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.3px;
    }

    .col-count {
      flex-shrink: 0;
      font-size: 12px;
      font-weight: 600;
      color: #94a3b8;
      background: rgba(0, 0, 0, 0.06);
      border-radius: 10px;
      padding: 2px 8px;
      min-width: 22px;
      text-align: center;
    }
  }

  // ========== "+添加列表"按钮 ==========
  .add_btn_top {
    justify-content: center;
    gap: 6px;
    cursor: pointer;
    opacity: 0.7;
    transition: all 0.25s ease;
    border: 2px dashed #cbd5e1;
    background: rgba(255, 255, 255, 0.5) !important;
    color: #64748b;

    .title {
      color: #64748b;
      font-weight: 600;
    }

    .el-icon {
      color: #94a3b8;
    }

    &:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.9) !important;
      border-color: #4f46e5;
      color: #4f46e5;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(79, 70, 229, 0.12);

      .title {
        color: #4f46e5;
      }
      .el-icon {
        color: #4f46e5;
      }
    }
  }

  // ========== 卡片 ==========
  .todo_item {
    position: relative;
  }

  .card-item {
    position: relative;
    background: #ffffff;
    padding: 12px 74px 12px 10px;
    border-radius: 10px;
    margin-bottom: 8px;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    min-height: 32px;
    display: flex;
    flex-direction: row;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid transparent;

    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.06);
      transform: translateY(-2px);
      border-color: #e2e8f0;
    }

    // 优先级色条
    .priority-bar {
      position: absolute;
      left: 0;
      top: 4px;
      bottom: 4px;
      width: 4px;
      border-radius: 4px;
      background: #e8e8e8;

      &.priority-high {
        background: linear-gradient(180deg, #ef4444, #dc2626);
      }
      &.priority-medium {
        background: linear-gradient(180deg, #f59e0b, #d97706);
      }
      &.priority-low {
        background: linear-gradient(180deg, #22c55e, #16a34a);
      }
      &.priority-none {
        background: #e8e8e8;
      }
    }

    &.overdue {
      background: #fef2f2;
      border-color: #fecaca;

      &:hover {
        border-color: #fca5a5;
        box-shadow: 0 4px 16px rgba(239, 68, 68, 0.1);
      }
    }

    .card-body {
      flex: 1;
      min-width: 0;
      padding-left: 6px;
    }

    .card-title {
      font-weight: 600;
      font-size: 14px;
      line-height: 1.45;
      color: #1e293b;
      word-break: break-word;
    }

    .card-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 7px;

      .card-tag {
        font-size: 10px;
        border-radius: 4px;
        padding: 0 7px;
        height: 18px;
        line-height: 18px;
        font-weight: 500;
        letter-spacing: 0.2px;
      }
    }

    .card-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
      font-size: 11px;
      color: #94a3b8;

      .due-date,
      .assignee {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        padding: 2px 6px;
        background: #f8fafc;
        border-radius: 5px;
        font-weight: 500;

        .el-icon {
          font-size: 12px;
        }
      }
      .text-danger {
        color: #dc2626;
        font-weight: 700;
        background: #fef2f2;
      }
    }

    // Hover 操作按钮
    .card-actions {
      position: absolute;
      top: 8px;
      right: 10px;
      display: flex;
      flex-direction: row;
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
  }

  // ========== 可拖拽卡片标记 ==========
  .mover {
    min-height: 49px;
    cursor: grab !important;

    &:active {
      cursor: grabbing !important;
    }
  }
}

// ========== 卡片入场动画 ==========
@keyframes cardEnter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// ========== 拖拽样式 ==========
.chosenClass {
  background: #fff !important;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18) !important;
  transform: rotate(2deg) scale(1.03) !important;
  z-index: 100;
  border-radius: 10px !important;
}
.ghost {
  opacity: 1;
  background: #e8ecf1 !important;
  border: 2px dashed #b0bec5;
  border-radius: 10px;

  * {
    visibility: hidden;
  }
}
.dragClass {
  background: #fff !important;
  opacity: 1 !important;
  cursor: grabbing !important;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2) !important;
  z-index: 200;
  border-radius: 10px !important;

  .card-body {
    transform: rotate(3.5deg) scale(1.05);
    transform-origin: center center;
  }
  .priority-bar {
    transform: rotate(3.5deg) scale(1.05);
    transform-origin: left center;
  }
}

// ========== "+添加卡片"按钮 ==========
.add_text {
  width: 100%;
  border-radius: 8px;
  line-height: 36px;
  text-align: center;
  cursor: pointer;
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.2s ease;
  border: 1px dashed transparent;
  background: transparent;

  &:hover {
    color: #1e293b;
    background: rgba(0, 0, 0, 0.04);
    border-color: #cbd5e1;
  }
}

// ========== 输入框无边框（dialog 中使用） ==========
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
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
  }
}
</style>
