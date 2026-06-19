// 优先级
export type Priority = 'high' | 'medium' | 'low' | 'none'

// 标签
export interface Tag {
  id: number
  name: string
  color: string // hex 颜色
}

// 普通卡片
export interface KanbanCard {
  key: number
  title: string
  type: 'todo'
  move: boolean
  description: string
  priority: Priority
  tags: Tag[]
  dueDate: string | null // ISO 日期字符串，null 表示无截止日期
  createdAt: string      // ISO 日期字符串
  assignee: string
}

// "+添加卡片"占位项
export interface AddPlaceholderCard {
  key: number
  title: string
  type: 'add'
  move: false
  showInput: boolean
  inputText: string
}

// 列表中可包含的项
export type ListItem = KanbanCard | AddPlaceholderCard

// 列/列表
export interface KanbanList {
  title: string
  children: ListItem[]
}

// "+添加列表"特殊列
export interface AddListPlaceholder {
  title: string
  type: 'add'
}

// 看板列联合类型
export type KanbanColumn = KanbanList | AddListPlaceholder
