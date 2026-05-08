<script lang="ts" setup>
defineOptions({ name: 'AbaoSearchBar' })

const emit = defineEmits<{
  search: []
  reset: []
}>()
</script>

<template>
  <div class="abao-search-bar">
    <div class="abao-search-bar__form">
      <slot />
    </div>
    <div class="abao-search-bar__actions">
      <ElButton type="primary" @click="emit('search')">
        <Icon icon="ep:search" :size="14" class="mr-4px" />
        查询
      </ElButton>
      <ElButton @click="emit('reset')">
        <Icon icon="ep:refresh" :size="14" class="mr-4px" />
        重置
      </ElButton>
      <slot name="extra" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.abao-search-bar {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 20px;
  background: var(--bg);
  border-radius: var(--r-md);
  margin-bottom: 16px;
}

.abao-search-bar__form {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;

  :deep(.el-form-item) {
    margin-bottom: 0;
    margin-right: 0;
  }
}

.abao-search-bar__actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 2px;
}
</style>
