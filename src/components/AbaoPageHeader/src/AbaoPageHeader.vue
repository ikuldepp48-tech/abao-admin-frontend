<script lang="ts" setup>
defineOptions({ name: 'AbaoPageHeader' })

defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div class="abao-page-header">
    <div class="abao-page-header__left">
      <h1 class="abao-page-header__title">{{ title }}</h1>
      <p v-if="description" class="abao-page-header__desc">{{ description }}</p>
    </div>
    <div v-if="$slots.extra" class="abao-page-header__extra">
      <slot name="extra" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.abao-page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 0;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--ink-100);
}

.abao-page-header__left {
  flex: 1;
}

.abao-page-header__title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: var(--ink-900);
  margin: 0;
  line-height: 1.4;
}

.abao-page-header__desc {
  font-size: 13px;
  color: var(--ink-500);
  margin: 4px 0 0;
}

.abao-page-header__extra {
  flex-shrink: 0;
  margin-left: 24px;
}
</style>
