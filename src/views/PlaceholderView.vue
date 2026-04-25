<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const title = computed(() => String(route.meta.title ?? '页面建设中'))
const sectionTitle = computed(() => String(route.meta.sectionTitle ?? '模块'))
</script>

<template>
  <a-card class="placeholder-card" :bordered="false">
    <p class="eyebrow">{{ sectionTitle }}</p>
    <h1>{{ title }}</h1>
    <p class="desc">
      这个页面已经接进整站模板和路由结构，后面我们可以直接按统一的 Arco 组件规范继续开发真实业务内容。
    </p>

    <a-space wrap>
      <a-tag color="arcoblue">布局已接入</a-tag>
      <a-tag color="green">菜单已映射</a-tag>
      <a-tag color="orangered">等待业务内容</a-tag>
    </a-space>
  </a-card>
</template>

<style scoped>
.placeholder-card {
  border-radius: 28px;
  padding: 24px;
  background:
    radial-gradient(circle at top right, rgba(22, 93, 255, 0.12), transparent 22%),
    rgba(255, 255, 255, 0.9);
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
}

.eyebrow {
  margin: 0 0 8px;
  color: #165dff;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  margin: 0 0 12px;
  color: #101828;
  font-size: clamp(28px, 4vw, 40px);
}

.desc {
  max-width: 720px;
  margin: 0 0 20px;
  color: #526072;
  line-height: 1.8;
}
</style>
