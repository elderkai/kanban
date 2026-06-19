<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isCreate ? '新建卡片' : '编辑卡片'"
    width="520px"
    :before-close="handleClose"
    destroy-on-close
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

      <!-- 优先级 -->
      <el-form-item label="优先级">
        <el-select v-model="editForm.priority" style="width: 100%">
          <el-option label="无" value="none" />
          <el-option label="🔴 高" value="high" />
          <el-option label="🟠 中" value="medium" />
          <el-option label="🟢 低" value="low" />
        </el-select>
      </el-form-item>

      <!-- 标签 -->
      <el-form-item label="标签">
        <div class="tag-list">
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
            placeholder="新标签"
            size="small"
            style="width: 140px"
            @keyup.enter="addTag"
          />
          <el-color-picker v-model="newTagColor" size="small" />
          <el-button :icon="Plus" size="small" circle @click="addTag" />
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
      // 新建模式：展示空表单
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
    // 新建模式
    store.createCard(store.creatingListIndex, {
      title: editForm.value.title || '未命名卡片',
      description: editForm.value.description,
      priority: editForm.value.priority,
      tags: editForm.value.tags,
      dueDate: editForm.value.dueDate,
      assignee: editForm.value.assignee
    })
  } else if (store.editingCard) {
    // 编辑模式
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
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;

  .dialog-tag {
    font-size: 12px;
  }
}

.tag-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dialog-footer {
  width: 100%;
  overflow: hidden;
}
</style>
