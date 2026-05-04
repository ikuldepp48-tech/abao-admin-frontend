<template>
  <div class="station-selector">
    <h1 class="title">阿堡 KDS - 请选择档口</h1>
    <div class="station-list">
      <button
        v-for="station in stations"
        :key="station.id"
        class="station-btn"
        @click="$emit('select', station.id)"
      >
        <span class="station-name">{{ station.name }}</span>
        <span class="station-arrow">→</span>
      </button>
    </div>
    <p v-if="stations.length === 0" class="empty">暂无可用档口</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import request from '@/config/axios'

interface Station {
  id: number
  name: string
  status: number
}

defineEmits<{
  select: [id: number]
}>()

const stations = ref<Station[]>([])

onMounted(async () => {
  try {
    const res = await request.get({ url: '/restaurant/kitchen-station/page', params: { pageNo: 1, pageSize: 100 } })
    stations.value = (res.list || []).filter((s: Station) => s.status === 1)
  } catch (e) {
    console.error('获取档口列表失败', e)
  }
})
</script>

<style scoped>
.station-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #111;
  color: #fff;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.title {
  font-size: 28pt;
  margin-bottom: 40px;
  color: #aaa;
}

.station-list {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: center;
}

.station-btn {
  width: 280px;
  padding: 32px 24px;
  font-size: 24pt;
  font-weight: 700;
  background: #222;
  color: #fff;
  border: 2px solid #555;
  border-radius: 16px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: border-color 0.2s;
}

.station-btn:hover {
  border-color: #f5a623;
}

.station-arrow {
  font-size: 24pt;
  color: #f5a623;
}

.empty {
  font-size: 18pt;
  color: #666;
}
</style>
