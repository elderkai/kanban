<template>
  <div class="baseKanban" @keydown="handleHotkey">
    <Header @change="store.searchText = $event" />

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-left">
        <el-button
          v-for="f in filters"
          :key="f.value"
          size="small"
          :type="activeFilter === f.value ? 'primary' : ''"
          :plain="activeFilter !== f.value"
          @click="activeFilter = activeFilter === f.value ? '' : f.value"
        >
          {{ f.label }}
        </el-button>
      </div>
      <div class="filter-right">
        <span class="filter-count" v-if="activeFilter">
          {{ filteredCardCount }} 张卡片
        </span>
      </div>
    </div>

    <!-- 看板容器 -->
    <div class="box_cover">
      <TransitionGroup name="column">
        <div
          class="list_todo"
          v-for="(item, key) in store.columns"
          :key="key"
          :class="{ 'drag-over': dragOverCol === key }"
        >
          <!-- "+添加列表"按钮 -->
          <div
            class="todo_top add_btn_top"
            v-if="'type' in item && item.type === 'add'"
            @click="addList"
          >
            <el-icon :size="18"><Plus /></el-icon>
            <div class="title">{{ item.title }}</div>
          </div>

          <!-- 列表头部 -->
          <div class="todo_top" v-else>
            <div class="col-header">
              <div class="col-title-row">
                <span class="col-icon">{{ getColumnIcon(key) }}</span>
                <span
                  class="title"
                  :title="'双击重命名'"
                  @dblclick="startRenameCol(key)"
                >
                  <template v-if="renamingCol === key">
                    <input
                      v-model="renameColText"
                      class="col-rename-input"
                      @blur="finishRenameCol(key)"
                      @keyup.enter="finishRenameCol(key)"
                      @keyup.esc="renamingCol = null"
                      @click.stop
                      ref="colRenameInput"
                    />
                  </template>
                  <template v-else>{{ item.title }}</template>
                </span>
              </div>
              <div class="col-actions-row">
                <span class="col-count" v-if="'children' in item">
                  {{ getTodoCount(item.children) }}
                </span>
                <!-- 列菜单 -->
                <el-dropdown trigger="click" @command="(cmd: string) => handleColCommand(cmd, key)">
                  <span class="col-menu-btn" @click.stop><el-icon><MoreFilled /></el-icon></span>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="rename">✏️ 重命名</el-dropdown-item>
                      <el-dropdown-item command="clear">🗑️ 清空卡片</el-dropdown-item>
                      <el-dropdown-item command="delete" divided>❌ 删除列表</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </div>

          <!-- 拖拽区域 -->
          <draggable
            v-if="'children' in item && item.children"
            class="dragArea list-group"
            :list="item.children"
            item-key="key"
            :group="{ name: 'dragArea', pull: pullFunction }"
            :handle="'.mover'"
            :force-fallback="true"
            :clone="clone"
            animation="300"
            ghost-class="ghost"
            chosen-class="chosenClass"
            :drag-class="'dragClass'"
            @start="start"
            @end="onEnd"
            @move="onMove"
          >
            <template #item="{ element }">
              <TransitionGroup name="card" tag="div">
                <div :key="element.key">
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
                    v-show="matchesFilter(element) && matchesSearch(element)"
                    class="todo_item card-item"
                    :class="{
                      mover: element.move,
                      'priority-high': element.priority === 'high',
                      'priority-medium': element.priority === 'medium',
                      'priority-low': element.priority === 'low',
                      'due-soon': getDueClass(element) === 'soon',
                      'due-today': getDueClass(element) === 'today',
                      overdue: getDueClass(element) === 'overdue'
                    }"
                  >
                    <!-- 卡片内容区 -->
                    <div class="card-body" @click="store.openEditDialog(element)">
                      <!-- 标题（支持内联编辑） -->
                      <div
                        class="card-title"
                        @click.stop="startInlineEdit(element)"
                        :title="'点击编辑'"
                      >
                        <template v-if="inlineEditKey === element.key">
                          <input
                            v-model="inlineEditText"
                            class="inline-edit-input"
                            @blur="finishInlineEdit(element)"
                            @keyup.enter="finishInlineEdit(element)"
                            @keyup.esc="inlineEditKey = null"
                            ref="inlineEditInput"
                          />
                        </template>
                        <template v-else>{{ element.title }}</template>
                      </div>

                      <!-- 标签行 -->
                      <div class="card-tags" v-if="element.tags && element.tags.length">
                        <el-tag
                          v-for="tag in element.tags" :key="tag.id"
                          :color="tag.color" size="small" effect="dark" class="card-tag"
                        >{{ tag.name }}</el-tag>
                      </div>

                      <!-- 元信息行 -->
                      <div class="card-meta" v-if="element.dueDate || element.assignee">
                        <span
                          v-if="element.dueDate"
                          class="due-date"
                          :class="{
                            'text-soon': getDueClass(element) === 'soon',
                            'text-today': getDueClass(element) === 'today',
                            'text-danger': getDueClass(element) === 'overdue'
                          }"
                        >
                          <el-icon><Calendar /></el-icon>
                          {{ formatDate(element.dueDate) }}
                          <span class="due-label" v-if="getDueClass(element) !== 'normal'">
                            {{ getDueLabel(element) }}
                          </span>
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
              </TransitionGroup>
            </template>
          </draggable>

          <!-- 空列拖入提示 -->
          <div
            v-if="'children' in item && getTodoCount(item.children) === 0"
            class="empty-drop-zone"
            :class="{ 'drag-over': dragOverCol === key }"
          >
            <el-icon :size="24"><Plus /></el-icon>
            <span>拖放卡片到此处</span>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <mDialog />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { ElMessageBox } from 'element-plus'
import { Edit, Delete, Calendar, User, Plus, MoreFilled } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import Header from '../../components/header/Header.vue'
import mDialog from './m-dialog.vue'
import draggable from 'vuedraggable'
import { useKanbanStore } from '@/stores/kanban'
import type { KanbanCard } from '@/types/kanban'

const store = useKanbanStore()
const isMove = ref(false)
const dragOverCol = ref<number | null>(null)

// ========== 列图标 ==========
const columnIcons = ['📋', '🚀', '🧪', '📦', '✅', '📝', '🔧', '⭐']
function getColumnIcon(index: number): string {
  return columnIcons[index % columnIcons.length]
}

// ========== 筛选栏 ==========
const activeFilter = ref('')
const filters = [
  { label: '🔴 高优先', value: 'high' },
  { label: '🟠 中优先', value: 'medium' },
  { label: '🟢 低优先', value: 'low' },
  { label: '⏰ 即将到期', value: 'due' },
]
const filteredCardCount = computed(() => {
  let count = 0
  for (const col of store.columns) {
    if (!('children' in col)) continue
    count += col.children.filter(
      (c) => c.type === 'todo' && matchesFilter(c as KanbanCard)
    ).length
  }
  return count
})

function matchesFilter(card: KanbanCard): boolean {
  if (!activeFilter.value) return true
  if (['high', 'medium', 'low'].includes(activeFilter.value)) {
    return card.priority === activeFilter.value
  }
  if (activeFilter.value === 'due') {
    return ['today', 'soon'].includes(getDueClass(card))
  }
  return true
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

// ========== 日期分级 ==========
function getDueClass(card: KanbanCard): 'overdue' | 'today' | 'soon' | 'normal' {
  if (!card.dueDate) return 'normal'
  const due = dayjs(card.dueDate)
  const today = dayjs().startOf('day')
  const diff = due.diff(today, 'day')
  if (diff < 0) return 'overdue'
  if (diff === 0) return 'today'
  if (diff <= 3) return 'soon'
  return 'normal'
}
function getDueLabel(card: KanbanCard): string {
  const cls = getDueClass(card)
  if (cls === 'overdue') return '已过期'
  if (cls === 'today') return '今天'
  if (cls === 'soon') return '即将'
  return ''
}
function formatDate(date: string): string {
  return dayjs(date).format('MM-DD')
}

// ========== 卡片计数 ==========
function getTodoCount(children: any[]): number {
  return children.filter((c: any) => c.type === 'todo').length
}

// ========== 内联编辑卡片标题 ==========
const inlineEditKey = ref<number | null>(null)
const inlineEditText = ref('')
const inlineEditInput = ref<any>(null)

function startInlineEdit(card: KanbanCard) {
  inlineEditKey.value = card.key
  inlineEditText.value = card.title
  nextTick(() => {
    const inputs = document.querySelectorAll('.inline-edit-input')
    const el = inputs[inputs.length - 1] as HTMLInputElement
    el?.focus()
    el?.select()
  })
}
function finishInlineEdit(card: KanbanCard) {
  if (inlineEditText.value.trim() && inlineEditText.value !== card.title) {
    store.updateCard(card.key, { title: inlineEditText.value.trim() })
  }
  inlineEditKey.value = null
}

// ========== 列重命名 ==========
const renamingCol = ref<number | null>(null)
const renameColText = ref('')
function startRenameCol(index: number) {
  renamingCol.value = index
  const col = store.columns[index]
  renameColText.value = 'title' in col ? col.title : ''
  nextTick(() => {
    const inputs = document.querySelectorAll('.col-rename-input')
    const el = inputs[inputs.length - 1] as HTMLInputElement
    el?.focus()
    el?.select()
  })
}
function finishRenameCol(index: number) {
  if (renameColText.value.trim()) {
    store.renameList(index, renameColText.value.trim())
  }
  renamingCol.value = null
}

// ========== 列菜单操作 ==========
function handleColCommand(cmd: string, index: number) {
  if (cmd === 'rename') {
    startRenameCol(index)
  } else if (cmd === 'clear') {
    ElMessageBox.confirm('确定清空该列所有卡片？', '确认清空', { type: 'warning' })
      .then(() => store.clearList(index))
      .catch(() => {})
  } else if (cmd === 'delete') {
    ElMessageBox.confirm('确定删除整列？列内卡片也会被删除。', '确认删除', { type: 'warning' })
      .then(() => store.deleteList(index))
      .catch(() => {})
  }
}

// ========== 删除卡片 ==========
function confirmDelete(card: KanbanCard) {
  ElMessageBox.confirm('确定删除该卡片吗？', '确认删除', {
    confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning'
  }).then(() => store.deleteCard(card.key)).catch(() => {})
}

// ========== 添加列表 ==========
function addList() {
  ElMessageBox.prompt('请输入列表名称', '添加列表', {
    confirmButtonText: '确定', cancelButtonText: '取消',
    inputPattern: /\S/, inputErrorMessage: '列表名称不能为空'
  }).then(({ value }) => store.createList(value.trim())).catch(() => {})
}

// ========== 键盘快捷键 ==========
function handleHotkey(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    const input = document.querySelector('.searchInput input') as HTMLInputElement
    input?.focus()
  }
}

// ========== 拖拽事件 ==========
/** 跨列拖拽时克隆数据对象 */
function clone(val: any) { return val }
/** 拖拽移动中，返回 false 可阻止本次移动 */
function onMove(val: any) { return true }
/** 拖拽开始 */
function start(val: any) { isMove.value = true }
/** 拖拽结束：重置标记 + 确保 "+添加卡片" 在列末尾 */
function onEnd(val: any) {
  isMove.value = false
  store.reSort()
}
/** 是否允许拖出/拖入 */
function pullFunction(val: any) { return true }
</script>

<style lang="less" scoped>
// ==========================================
// CSS 变量：亮色 / 暗色主题
// ==========================================
.baseKanban {
  --bg-board: #f0f2f5;
  --bg-col: #ebecf0;
  --bg-card: #ffffff;
  --bg-card-hover: #fafbfc;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --border: #e2e8f0;
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.06);
  --shadow-card-hover: 0 4px 16px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.06);
  --col-accent: #4f46e5;
  --due-soon-bg: #fffbeb;
  --due-today-bg: #fff7ed;
  --due-overdue-bg: #fef2f2;
  --dot-pattern: radial-gradient(circle, rgba(0, 0, 0, 0.04) 1px, transparent 1px);

  background: var(--bg-board);
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  transition: background 0.3s ease;
}

// 暗色模式
html[data-theme='dark'] .baseKanban {
  --bg-board: #1a1a2e;
  --bg-col: #16213e;
  --bg-card: #1e2a4a;
  --bg-card-hover: #243356;
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --border: #2d3a5c;
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.3);
  --shadow-card-hover: 0 4px 20px rgba(0, 0, 0, 0.4), 0 1px 4px rgba(0, 0, 0, 0.2);
  --due-soon-bg: #2d2410;
  --due-today-bg: #2d1a10;
  --due-overdue-bg: #2d1010;
  --dot-pattern: radial-gradient(circle, rgba(255, 255, 255, 0.03) 1px, transparent 1px);

  .list_todo { background: var(--bg-col) !important; }
  .card-item {
    background: var(--bg-card) !important;
    &:hover { background: var(--bg-card-hover) !important; }
  }
  .card-title { color: var(--text-primary) !important; }
  .card-meta .due-date, .card-meta .assignee { background: rgba(255,255,255,0.05) !important; }
  .todo_top { background: transparent !important; }
  .title { color: var(--text-primary) !important; }
  .col-count { background: rgba(255,255,255,0.08) !important; color: var(--text-muted) !important; }
  .add_text { color: var(--text-muted) !important; &:hover { color: var(--text-primary) !important; } }
  .empty-drop-zone { color: var(--text-muted) !important; border-color: var(--border) !important; }
}

// ========== 筛选栏 ==========
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 24px;
  gap: 8px;
  flex-wrap: wrap;

  .filter-left {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .filter-right {
    .filter-count {
      font-size: 12px;
      color: var(--text-muted);
    }
  }
}

// ========== 看板容器 ==========
.box_cover {
  display: flex;
  justify-content: start;
  padding: 8px 24px 20px;
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
  height: calc(100vh - 112px);
  gap: 14px;
  box-sizing: border-box;
  background-size: 16px 16px;
  background-image: var(--dot-pattern);

  &::-webkit-scrollbar { height: 6px; }
  &::-webkit-scrollbar-track { background: transparent; margin: 0 24px; }
  &::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.1); border-radius: 10px; }
  &::-webkit-scrollbar-thumb:hover { background: rgba(0, 0, 0, 0.2); }

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
    background: var(--bg-col);
    transition: background 0.2s ease, box-shadow 0.2s ease;
    flex-shrink: 0;

    &.drag-over {
      box-shadow: inset 0 0 0 3px rgba(99, 102, 241, 0.4);
    }

    .list-group {
      height: calc(100vh - 210px);
      max-height: calc(100vh - 210px);
      overflow-y: auto;
      overflow-x: hidden;
      padding: 6px 0 8px;

      &::-webkit-scrollbar { width: 4px; }
      &::-webkit-scrollbar-track { background: transparent; }
      &::-webkit-scrollbar-thumb { background: transparent; border-radius: 4px; }
      &:hover::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.12); }
      &:hover::-webkit-scrollbar-thumb:hover { background: rgba(0, 0, 0, 0.25); }
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
    }
    .col-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      margin-bottom: 4px;
    }
    .col-icon { font-size: 16px; flex-shrink: 0; line-height: 1; }
    .title {
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      color: var(--text-primary); font-size: 14px; font-weight: 700;
      letter-spacing: 0.3px; cursor: default;
    }
    .col-rename-input {
      width: 100%; border: 2px solid var(--col-accent); border-radius: 6px;
      padding: 2px 8px; font-size: 14px; font-weight: 700;
      background: var(--bg-card); color: var(--text-primary); outline: none;
    }
    .col-actions-row {
      display: flex; align-items: center; justify-content: space-between; width: 100%;
    }
    .col-count {
      flex-shrink: 0; font-size: 12px; font-weight: 600;
      color: var(--text-muted); background: rgba(0, 0, 0, 0.06);
      border-radius: 10px; padding: 2px 8px; min-width: 22px; text-align: center;
    }
    .col-menu-btn {
      cursor: pointer; padding: 2px 4px; border-radius: 4px; color: var(--text-muted);
      transition: all 0.15s; font-size: 14px; display: flex; align-items: center;
      &:hover { background: rgba(0,0,0,0.08); color: var(--text-primary); }
    }
  }

  // ========== "+添加列表"按钮 ==========
  .add_btn_top {
    justify-content: center; gap: 6px; cursor: pointer; opacity: 0.7;
    transition: all 0.25s ease; border: 2px dashed var(--border);
    background: rgba(255, 255, 255, 0.5) !important; color: var(--text-secondary);
    .title { color: var(--text-secondary); font-weight: 600; }
    .el-icon { color: var(--text-muted); }
    &:hover {
      opacity: 1; background: rgba(255, 255, 255, 0.9) !important;
      border-color: var(--col-accent); color: var(--col-accent);
      transform: translateY(-1px); box-shadow: 0 2px 8px rgba(79, 70, 229, 0.12);
      .title { color: var(--col-accent); }
      .el-icon { color: var(--col-accent); }
    }
  }

  // ========== 卡片 ==========
  .todo_item { position: relative; }

  .card-item {
    position: relative;
    background: var(--bg-card);
    padding: 12px 74px 12px 10px;
    border-radius: 10px;
    margin-bottom: 8px;
    width: 100%; max-width: 100%;
    box-sizing: border-box;
    box-shadow: var(--shadow-card);
    min-height: 32px;
    display: flex; flex-direction: row;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid transparent;

    &:hover {
      box-shadow: var(--shadow-card-hover);
      border-color: var(--border);
      background: var(--bg-card-hover);
    }

    // 优先级左侧边框
    &.priority-high { border-left: 4px solid #ef4444; padding-left: 8px; }
    &.priority-medium { border-left: 4px solid #f59e0b; padding-left: 8px; }
    &.priority-low { border-left: 4px solid #22c55e; padding-left: 8px; }

    // 到期日分级
    &.due-soon {
      background: var(--due-soon-bg); border-color: #fde68a;
      &:hover { border-color: #fcd34d; }
    }
    &.due-today {
      background: var(--due-today-bg); border-color: #fdba74;
      &:hover { border-color: #fb923c; }
    }
    &.overdue {
      background: var(--due-overdue-bg); border-color: #fecaca;
      &:hover { border-color: #fca5a5; box-shadow: 0 4px 16px rgba(239, 68, 68, 0.1); }
    }

    .card-body { flex: 1; min-width: 0; }

    .card-title {
      font-weight: 600; font-size: 14px; line-height: 1.45;
      color: var(--text-primary); word-break: break-word;
      cursor: pointer;
      &:hover { color: var(--col-accent); }
    }
    .inline-edit-input {
      width: 100%; border: 2px solid var(--col-accent); border-radius: 6px;
      padding: 2px 6px; font-size: 14px; font-weight: 600;
      background: var(--bg-card); color: var(--text-primary); outline: none;
    }

    .card-tags {
      display: flex; flex-wrap: wrap; gap: 4px; margin-top: 7px;
      .card-tag { font-size: 10px; border-radius: 4px; padding: 0 7px; height: 18px; line-height: 18px; font-weight: 500; }
    }

    .card-meta {
      display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;
      font-size: 11px; color: var(--text-muted);
      .due-date, .assignee {
        display: inline-flex; align-items: center; gap: 3px;
        padding: 2px 6px; background: var(--bg-card-hover); border-radius: 5px; font-weight: 500;
        .el-icon { font-size: 12px; }
      }
      .due-label { margin-left: 2px; font-weight: 700; font-size: 10px; }
      .text-soon { color: #d97706; font-weight: 600; background: #fffbeb; }
      .text-today { color: #ea580c; font-weight: 700; background: #fff7ed; }
      .text-danger { color: #dc2626; font-weight: 700; background: #fef2f2; }
    }

    // Hover 操作按钮
    .card-actions {
      position: absolute; top: 8px; right: 10px;
      display: flex; flex-direction: row; gap: 4px;
      opacity: 0; transform: translateX(4px);
      transition: all 0.2s ease; z-index: 5; pointer-events: none;
      .el-button { width: 28px; height: 28px; min-width: 28px; .el-icon { font-size: 15px; } }
    }
    &:hover .card-actions { opacity: 1; transform: translateX(0); pointer-events: auto; }
  }

  .mover {
    min-height: 49px; cursor: grab !important;
    &:active { cursor: grabbing !important; }
  }
}

// ========== 空列拖入提示 ==========
.empty-drop-zone {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px; padding: 24px 12px; margin: 8px 0;
  border: 2px dashed var(--border); border-radius: 10px;
  color: var(--text-muted); font-size: 13px; transition: all 0.2s;
  &.drag-over { border-color: var(--col-accent); background: rgba(99,102,241,0.06); }
}

// ========== 列入场动画 ==========
.column-enter-active { transition: all 0.4s ease; }
.column-enter-from { opacity: 0; transform: translateX(20px); }

// ========== 卡片入场动画 ==========
.card-enter-active { transition: all 0.3s ease; }
.card-enter-from { opacity: 0; transform: translateY(8px); }
.card-leave-active { transition: all 0.2s ease; position: absolute; }
.card-leave-to { opacity: 0; transform: translateX(-20px); }

// ========== 拖拽样式 ==========
.chosenClass { opacity: 0.5 !important; filter: grayscale(30%); }
.ghost {
  opacity: 1;
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%) !important;
  border: 2px dashed #818cf8; border-radius: 10px;
  box-shadow: inset 0 0 0 1px rgba(99, 102, 241, 0.1);
  animation: ghostPulse 1.2s ease-in-out infinite;
  * { visibility: hidden; }
}
@keyframes ghostPulse {
  0%, 100% { border-color: #818cf8; }
  50% { border-color: #c7d2fe; }
}
.dragClass {
  background: #fff !important; opacity: 1 !important; cursor: grabbing !important;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.18), 0 0 0 3px rgba(99, 102, 241, 0.25), 0 0 20px rgba(99, 102, 241, 0.12) !important;
  z-index: 200; border-radius: 10px !important;
  .card-body { transform: scale(1.03); transform-origin: center center; }
  .card-actions { display: none !important; }
}
.list_todo:has(.ghost) { background: #dde4f0 !important; transition: background 0.2s ease; }

// ========== "+添加卡片"按钮 ==========
.add_text {
  width: 100%; border-radius: 8px; line-height: 36px; text-align: center;
  cursor: pointer; color: var(--text-secondary); font-size: 13px; font-weight: 500;
  display: flex; align-items: center; justify-content: center; gap: 4px;
  transition: all 0.2s ease; border: 1px dashed transparent; background: transparent;
  &:hover { color: var(--text-primary); background: rgba(0, 0, 0, 0.04); border-color: var(--border); }
}

// ========== 输入框无边框（dialog 使用） ==========
::v-deep .no_border .el-textarea__inner {
  border: none; box-shadow: none; border-radius: 10px; background: #f7fafc;
  font-size: 14px; resize: none; padding: 10px 12px;
  &:focus { background: #fff; box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2); }
}
</style>
