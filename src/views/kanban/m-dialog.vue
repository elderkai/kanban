<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isCreate ? '新建卡片' : '编辑卡片'"
    width="520px"
    :before-close="handleClose"
    destroy-on-close
    class="kanban-dialog"
  >
    <el-form v-if="editForm" label-position="top">
      <!-- 标题 -->
      <el-form-item label="标题">
        <el-input v-model="editForm.title" placeholder="卡片标题" />
      </el-form-item>

      <!-- 描述 -->
      <el-form-item label="描述">
        <el-input
          v-model="editForm.description"
          type="textarea"
          :rows="3"
          placeholder="详细描述..."
        />
      </el-form-item>

      <!-- 优先级 - 改为 radio-button 色块风格 -->
      <el-form-item label="优先级">
        <el-radio-group v-model="editForm.priority" class="priority-radio-group">
          <el-radio-button label="high">
            <span class="pri-label">🔴 高</span>
          </el-radio-button>
          <el-radio-button label="medium">
            <span class="pri-label">🟠 中</span>
          </el-radio-button>
          <el-radio-button label="low">
            <span class="pri-label">🟢 低</span>
          </el-radio-button>
          <el-radio-button label="none">
            <span class="pri-label">无</span>
          </el-radio-button>
        </el-radio-group>
      </el-form-item>

      <!-- 标签 -->
      <el-form-item label="标签">
        <div class="tag-list" v-if="editForm.tags.length">
          <el-tag
            v-for="tag in editForm.tags"
            :key="tag.id"
            :color="tag.color"
            closable
            effect="dark"
            size="small"
            class="dialog-tag"
            @close="removeTag(tag.id)"
          >
            {{ tag.name }}
          </el-tag>
        </div>
        <div class="tag-input-row">
          <el-input
            v-model="newTagName"
            placeholder="新标签名称"
            size="small"
            style="flex: 1"
            @keyup.enter="addTag"
            @blur="addTag"
          />
          <el-color-picker v-model="newTagColor" size="small" />
          <el-button :icon="Plus" size="small" type="primary" circle @click="addTag" />
        </div>
      </el-form-item>

      <!-- 截止日期 -->
      <el-form-item label="截止日期">
        <el-date-picker
          v-model="editForm.dueDate"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>

      <!-- 负责人 -->
      <el-form-item label="负责人">
        <el-input v-model="editForm.assignee" placeholder="负责人姓名" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button
          v-if="!isCreate"
          type="danger"
          plain
          :icon="Delete"
          @click="confirmDelete"
          style="float: left"
        >
          删除卡片
        </el-button>
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave">
          {{ isCreate ? '创建' : '保存' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue'
import { ElMessageBox } from 'element-plus'
import { Delete, Plus } from '@element-plus/icons-vue'
import { useKanbanStore } from '@/stores/kanban'
import type { Priority, Tag } from '@/types/kanban'

const store = useKanbanStore()

const newTagName = ref('')
const newTagColor = ref('#409EFF')

const isCreate = computed(() => store.creatingListIndex !== null)

const emptyForm = () => ({
  title: '',
  description: '',
  priority: 'none' as Priority,
  tags: [] as Tag[],
  dueDate: null as string | null,
  assignee: ''
})

const editForm = ref<ReturnType<typeof emptyForm> | null>(null)

// 监听 store 状态变化，同步到本地表单
watch(
  () => ({ card: store.editingCard, creating: store.creatingListIndex }),
  ({ card, creating }) => {
    if (card) {
      editForm.value = {
        title: card.title,
        description: card.description,
        priority: card.priority,
        tags: [...card.tags],
        dueDate: card.dueDate,
        assignee: card.assignee
      }
    } else if (creating !== null) {
      editForm.value = emptyForm()
    } else {
      editForm.value = null
    }
  },
  { immediate: true }
)

const dialogVisible = computed({
  get: () => store.dialogVisible,
  set: (val) => {
    if (!val) store.closeEditDialog()
  }
})

function handleClose() {
  store.closeEditDialog()
}

function handleSave() {
  if (!editForm.value) return

  if (isCreate.value && store.creatingListIndex !== null) {
    store.createCard(store.creatingListIndex, {
      title: editForm.value.title || '未命名卡片',
      description: editForm.value.description,
      priority: editForm.value.priority,
      tags: editForm.value.tags,
      dueDate: editForm.value.dueDate,
      assignee: editForm.value.assignee
    })
  } else if (store.editingCard) {
    store.updateCard(store.editingCard.key, {
      title: editForm.value.title,
      description: editForm.value.description,
      priority: editForm.value.priority,
      tags: editForm.value.tags,
      dueDate: editForm.value.dueDate,
      assignee: editForm.value.assignee
    })
  }
  store.closeEditDialog()
}

// ========== 标签操作 ==========
function addTag() {
  if (!newTagName.value.trim()) return
  if (!editForm.value) return
  editForm.value.tags.push({
    id: Date.now(),
    name: newTagName.value.trim(),
    color: newTagColor.value
  })
  newTagName.value = ''
}

function removeTag(tagId: number) {
  if (!editForm.value) return
  editForm.value.tags = editForm.value.tags.filter((t) => t.id !== tagId)
}

// ========== 删除操作 ==========
function confirmDelete() {
  if (!store.editingCard) return
  ElMessageBox.confirm('确定删除该卡片吗？', '确认删除', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      store.deleteCard(store.editingCard!.key)
      store.closeEditDialog()
    })
    .catch(() => {})
}
</script>

<style lang="less" scoped>
// ========== Dialog 整体美化 ==========
:deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  padding: 20px 24px 16px;
  margin: 0;
  border-bottom: 1px solid #f1f5f9;

  .el-dialog__title {
    font-size: 17px;
    font-weight: 700;
    color: #1e293b;
  }

  .el-dialog__headerbtn {
    top: 20px;
    right: 20px;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    transition: background 0.2s;

    &:hover {
      background: #f1f5f9;
    }
  }
}

:deep(.el-dialog__body) {
  padding: 20px 24px;
}

:deep(.el-dialog__footer) {
  padding: 12px 24px 20px;
  border-top: 1px solid #f1f5f9;
}

// ========== 表单样式 ==========
:deep(.el-form-item__label) {
  font-weight: 600;
  font-size: 13px;
  color: #475569;
  padding-bottom: 6px;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  }

  &.is-focus {
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.15);
  }
}

:deep(.el-textarea__inner) {
  border-radius: 8px;
  transition: all 0.2s;

  &:focus {
    border-color: #4f46e5;
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.15);
  }
}

// ========== 优先级按钮组 ==========
.priority-radio-group {
  width: 100%;

  :deep(.el-radio-button) {
    flex: 1;
  }

  :deep(.el-radio-button__inner) {
    width: 100%;
    border-radius: 8px;
    padding: 8px 0;
    font-size: 13px;
    font-weight: 500;
    border: 2px solid #e2e8f0;
    background: #f8fafc;
    color: #64748b;
    transition: all 0.2s;
  }

  :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    border-color: #4f46e5;
    background: #eef2ff;
    color: #4338ca;
    box-shadow: 0 1px 3px rgba(79, 70, 229, 0.2);
  }
}

// ========== 标签管理 ==========
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;

  .dialog-tag {
    font-size: 12px;
    border-radius: 6px;
  }
}

.tag-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

// ========== 底部按钮 ==========
.dialog-footer {
  width: 100%;
  overflow: hidden;
}
</style>
