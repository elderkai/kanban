import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type {
  KanbanCard,
  KanbanList,
  ListItem,
  Priority,
  Tag,
  KanbanColumn
} from '@/types/kanban'

const STORAGE_KEY = 'kanban-data'

export const useKanbanStore = defineStore('kanban', () => {
  // ========== 状态 ==========
  const columns = ref<KanbanColumn[]>([])
  const searchText = ref('')
  const dialogVisible = ref(false)
  const editingCard = ref<KanbanCard | null>(null)
  const creatingListIndex = ref<number | null>(null)
  let nextKey = 1

  // ========== 辅助函数 ==========
  function newCardKey(): number {
    return nextKey++
  }

  function createDefaultCard(title: string): KanbanCard {
    return {
      key: newCardKey(),
      title,
      type: 'todo',
      move: true,
      description: '',
      priority: 'none',
      tags: [],
      dueDate: null,
      createdAt: new Date().toISOString(),
      assignee: ''
    }
  }

  // ========== 初始化演示数据 ==========
  function initialize() {
    const defaultLists = [
      '需求分析与方案设计',
      '开发中',
      '测试中',
      '发布中',
      '已完成'
    ]
    columns.value = defaultLists.map((title) => {
      const list: KanbanList = { title, children: [] }
      for (let i = 0; i < 10; i++) {
        list.children.push(createDefaultCard(`${title}--${i + 1}`))
      }
      list.children.push({
        key: newCardKey(),
        title: '',
        type: 'add',
        move: false,
        showInput: false,
        inputText: ''
      })
      return list
    })
    columns.value.push({ title: '+添加列表', type: 'add' })
  }

  // ========== 数据持久化：localStorage 存取 ==========
  function saveToStorage() {
    try {
      const data = {
        columns: columns.value,
        nextKey
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      // 存储满或隐私模式下忽略
    }
  }

  function loadFromStorage(): boolean {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return false
      const data = JSON.parse(raw)
      if (data.columns && Array.isArray(data.columns)) {
        columns.value = data.columns
        nextKey = data.nextKey || 1
        return true
      }
    } catch (e) {
      // 数据损坏则用默认数据
    }
    return false
  }

  // 初始化：优先从 localStorage 加载
  if (!loadFromStorage()) {
    initialize()
  }

  // 数据变更自动保存
  watch(columns, () => saveToStorage(), { deep: true })

  // ========== 获取器 ==========
  function getListIndex(list: KanbanList): number {
    return columns.value.indexOf(list)
  }

  function findCardByKey(key: number): { listIndex: number; cardIndex: number } | null {
    for (let i = 0; i < columns.value.length; i++) {
      const col = columns.value[i]
      if (!('children' in col)) continue
      const idx = col.children.findIndex((item) => item.key === key)
      if (idx !== -1) return { listIndex: i, cardIndex: idx }
    }
    return null
  }

  // ========== 卡片操作 ==========

  function createCard(listIndex: number, data: {
    title: string
    description: string
    priority: Priority
    tags: Tag[]
    dueDate: string | null
    assignee: string
  }): KanbanCard | undefined {
    const col = columns.value[listIndex]
    if (!col || !('children' in col)) return
    const card: KanbanCard = {
      key: newCardKey(),
      title: data.title,
      type: 'todo',
      move: true,
      description: data.description,
      priority: data.priority,
      tags: data.tags,
      dueDate: data.dueDate,
      createdAt: new Date().toISOString(),
      assignee: data.assignee
    }
    const addIdx = col.children.findIndex((item) => item.type === 'add')
    const insertIdx = addIdx > -1 ? addIdx : col.children.length
    col.children.splice(insertIdx, 0, card)
    return card
  }

  function updateCard(key: number, updates: Partial<KanbanCard>) {
    const found = findCardByKey(key)
    if (!found) return
    const col = columns.value[found.listIndex] as KanbanList
    const card = col.children[found.cardIndex]
    if (card.type === 'todo') {
      Object.assign(card, updates)
    }
  }

  function deleteCard(key: number) {
    const found = findCardByKey(key)
    if (!found) return
    const col = columns.value[found.listIndex] as KanbanList
    col.children.splice(found.cardIndex, 1)
  }

  // ========== 列表操作 ==========

  function createList(title: string) {
    const addIdx = columns.value.findIndex((col) => 'type' in col && col.type === 'add')
    const insertIdx = addIdx > -1 ? addIdx : columns.value.length
    const newList: KanbanList = {
      title,
      children: [
        {
          key: newCardKey(),
          title: '',
          type: 'add',
          move: false,
          showInput: false,
          inputText: ''
        }
      ]
    }
    columns.value.splice(insertIdx, 0, newList)
  }

  /** 重命名列 */
  function renameList(listIndex: number, newTitle: string) {
    const col = columns.value[listIndex]
    if (!col) return
    if ('title' in col) {
      col.title = newTitle
    }
  }

  /** 清空列内所有卡片 */
  function clearList(listIndex: number) {
    const col = columns.value[listIndex]
    if (!col || !('children' in col)) return
    const list = col as KanbanList
    const addItem = list.children.find((item) => item.type === 'add')
    list.children = addItem ? [addItem] : []
  }

  /** 删除整列 */
  function deleteList(listIndex: number) {
    columns.value.splice(listIndex, 1)
  }

  // ========== 弹窗操作 ==========

  function openCreateDialog(listIndex: number) {
    creatingListIndex.value = listIndex
    editingCard.value = null
    dialogVisible.value = true
  }

  function openEditDialog(card: KanbanCard) {
    creatingListIndex.value = null
    editingCard.value = card
    dialogVisible.value = true
  }

  function closeEditDialog() {
    dialogVisible.value = false
    editingCard.value = null
    creatingListIndex.value = null
  }

  // ========== 拖拽后重排 ==========
  function reSort() {
    columns.value.forEach((col) => {
      if (!('children' in col)) return
      const list = col as KanbanList
      const addIdx = list.children.findIndex((item) => item.type === 'add')
      if (addIdx > -1 && addIdx < list.children.length - 1) {
        list.children.push(...list.children.splice(addIdx, 1))
      }
    })
  }

  return {
    columns,
    searchText,
    dialogVisible,
    editingCard,
    creatingListIndex,
    initialize,
    createCard,
    updateCard,
    deleteCard,
    createList,
    renameList,
    clearList,
    deleteList,
    openCreateDialog,
    openEditDialog,
    closeEditDialog,
    reSort
  }
})
