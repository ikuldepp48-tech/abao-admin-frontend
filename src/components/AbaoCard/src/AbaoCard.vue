<script lang="ts" setup>
defineOptions({ name: 'AbaoCard' })

defineProps({
  title: {
    type: String,
    default: ''
  },
  bodyStyle: {
    type: Object,
    default: () => ({ padding: '20px' })
  }
})
</script>

<template>
  <ElCard :body-style="bodyStyle" class="abao-card" shadow="never">
    <template v-if="title || $slots.header" #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <span class="abao-card__dot" />
          <span class="abao-card__title">{{ title }}</span>
        </div>
        <div v-if="$slots.header" class="flex items-center">
          <slot name="header" />
        </div>
      </div>
    </template>
    <slot />
  </ElCard>
</template>

<style scoped lang="scss">
.abao-card {
  border-radius: var(--r-md);
  border: 1px solid var(--ink-100);

  :deep(.el-card__header) {
    padding: 16px 20px;
    border-bottom: 1px solid var(--ink-100);
  }
}

.abao-card__dot {
  display: inline-block;
  width: 4px;
  height: 16px;
  background: var(--abao-red);
  border-radius: 2px;
  margin-right: 10px;
}

.abao-card__title {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  color: var(--ink-900);
}
</style>
