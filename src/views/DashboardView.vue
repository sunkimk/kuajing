<script setup lang="ts">
const stats = [
  { label: '今日销售额', value: '¥ 284,600', trend: '+12.6%', color: 'arcoblue' },
  { label: '待采购商品', value: '128', trend: '+8', color: 'orangered' },
  { label: '广告 ROI', value: '3.42', trend: '+0.18', color: 'green' },
  { label: '异常物流单', value: '19', trend: '-3', color: 'purple' },
]

const todoItems = [
  { title: '补货建议待确认', desc: '俄罗斯站 8 个 SKU 已进入安全库存线', level: '高优先级' },
  { title: '广告预算即将触顶', desc: 'Wildberries 广告组 3 个计划今日预算使用率超过 85%', level: '中优先级' },
  { title: '物流签收异常', desc: '3 个头程批次超过预计到仓时间 48 小时', level: '高优先级' },
]

const timeline = [
  { time: '10:30', title: '商品专员完成 SKU 映射校验', desc: '新增 48 条 SKU 与平台映射关系' },
  { time: '09:10', title: '广告推广日报已生成', desc: '系统同步完成昨日广告数据与 ROI 汇总' },
  { time: '08:45', title: '采购补货任务已创建', desc: '根据销量预测自动生成 12 条采购建议' },
]
</script>

<template>
  <div class="page-shell">
    <div class="page-hero">
      <div>
        <p class="eyebrow">Cross-border Operations</p>
        <h1>运营看板</h1>
        <p class="hero-text">
          这里先作为整站的首页模板，后面可以继续接真实指标卡、趋势图、待办区和异常提醒。
        </p>
      </div>

      <a-space wrap>
        <a-button type="primary">创建任务</a-button>
        <a-button>导出日报</a-button>
      </a-space>
    </div>

    <a-grid :cols="{ xs: 1, sm: 2, xl: 4 }" :col-gap="16" :row-gap="16">
      <a-grid-item v-for="stat in stats" :key="stat.label">
        <a-card class="glass-card stat-card" :bordered="false">
          <p class="stat-label">{{ stat.label }}</p>
          <div class="stat-row">
            <strong>{{ stat.value }}</strong>
            <a-tag :color="stat.color">{{ stat.trend }}</a-tag>
          </div>
        </a-card>
      </a-grid-item>
    </a-grid>

    <a-row :gutter="[16, 16]" class="dashboard-grid">
      <a-col :xs="24" :xl="15">
        <a-card class="glass-card" title="关键待办" :bordered="false">
          <a-list :bordered="false">
            <a-list-item v-for="item in todoItems" :key="item.title">
              <a-list-item-meta :title="item.title" :description="item.desc" />
              <template #actions>
                <a-tag color="red">{{ item.level }}</a-tag>
              </template>
            </a-list-item>
          </a-list>
        </a-card>
      </a-col>

      <a-col :xs="24" :xl="9">
        <a-card class="glass-card" title="最近动态" :bordered="false">
          <a-timeline>
            <a-timeline-item v-for="item in timeline" :key="item.title" :label="item.time">
              <div class="timeline-item">
                <strong>{{ item.title }}</strong>
                <span>{{ item.desc }}</span>
              </div>
            </a-timeline-item>
          </a-timeline>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<style scoped>
.page-shell {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  padding: 28px;
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(255, 125, 0, 0.12), transparent 22%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.94), rgba(247, 249, 252, 0.92));
  box-shadow: 0 22px 60px rgba(15, 23, 42, 0.08);
}

.eyebrow {
  margin: 0 0 8px;
  color: #165dff;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.page-hero h1 {
  margin: 0;
  color: #101828;
  font-size: clamp(30px, 4vw, 42px);
}

.hero-text {
  max-width: 760px;
  margin: 12px 0 0;
  color: #526072;
  line-height: 1.8;
}

.glass-card {
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.07);
  backdrop-filter: blur(12px);
}

.stat-card {
  min-height: 132px;
}

.stat-label {
  margin: 0 0 18px;
  color: #667085;
  font-size: 14px;
}

.stat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.stat-row strong {
  color: #101828;
  font-size: 30px;
  line-height: 1;
}

.dashboard-grid {
  margin-top: 0;
}

.timeline-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.timeline-item strong {
  color: #101828;
}

.timeline-item span {
  color: #667085;
  line-height: 1.7;
}

@media (max-width: 768px) {
  .page-hero {
    align-items: flex-start;
    flex-direction: column;
    padding: 24px;
  }
}
</style>
