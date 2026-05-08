<script lang="ts" setup>
defineOptions({ name: 'AbaoStatCard' })

defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    default: ''
  },
  unit: {
    type: String,
    default: ''
  },
  trend: {
    type: Number,
    default: 0
  },
  icon: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <ElCard class="abao-stat-card" shadow="never">
    <div class="abao-stat-card__body">
      <div class="abao-stat-card__info">
        <span class="abao-stat-card__label">{{ label }}</span>
        <div class="abao-stat-card__value-row">
          <span class="abao-stat-card__value">{{ value }}</span>
          <span v-if="unit" class="abao-stat-card__unit">{{ unit }}</span>
        </div>
        <span v-if="trend !== 0" class="abao-stat-card__trend" :class="trend > 0 ? 'is-up' : 'is-down'">
          {{ trend > 0 ? '+' : '' }}{{ trend }}%
        </span>
      </div>
      <div v-if="icon" class="abao-stat-card__icon">
        <Icon :icon="icon" :size="28" color="var(--abao-red)" />
      </div>
    </div>
  </ElCard>
</template>

<style scoped lang="scss">
.abao-stat-card {
  border-radius: var(--r-md);
  border: 1px solid var(--ink-100);
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: var(--shadow-md);
  }

  :deep(.el-card__body) {
    padding: 20px;
  }
}

.abao-stat-card__body {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.abao-stat-card__info {
  flex: 1;
}

.abao-stat-card__label {
  font-size: 13px;
  color: var(--ink-500);
  display: block;
}

.abao-stat-card__value-row {
  margin-top: 8px;
  display: flex;
  align-items: baseline;
}

.abao-stat-card__value {
  font-family: var(--font-num);
  font-size: 28px;
  font-weight: 700;
  color: var(--ink-900);
  line-height: 1;
}

.abao-stat-card__unit {
  font-size: 13px;
  color: var(--ink-500);
  margin-left: 4px;
}

.abao-stat-card__trend {
  display: inline-block;
  font-size: 12px;
  font-weight: 500;
  margin-top: 6px;

  &.is-up {
    color: var(--accent-mint);
  }

  &.is-down {
    color: var(--abao-red);
  }
}

.abao-stat-card__icon {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: var(--r-lg);
  background: var(--abao-red-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 16px;
}
</style>
