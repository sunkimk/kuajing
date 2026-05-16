import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const chartComponentUrl = new URL('../src/components/common/AppTrendChart.vue', import.meta.url)
const packageJsonUrl = new URL('../package.json', import.meta.url)

describe('AppTrendChart source', () => {
  it('keeps chart dependencies installed for Vue ECharts usage', () => {
    const packageJson = JSON.parse(readFileSync(packageJsonUrl, 'utf-8')) as {
      dependencies?: Record<string, string>
    }

    expect(packageJson.dependencies).toHaveProperty('echarts')
    expect(packageJson.dependencies).toHaveProperty('vue-echarts')
  })

  it('wraps ECharts as a reusable responsive line chart component', () => {
    expect(existsSync(chartComponentUrl)).toBe(true)

    const componentSource = readFileSync(chartComponentUrl, 'utf-8')
    expect(componentSource).toContain("import VChart from 'vue-echarts'")
    expect(componentSource).toContain("import { use } from 'echarts/core'")
    expect(componentSource).toContain('CanvasRenderer')
    expect(componentSource).toContain('LineChart')
    expect(componentSource).toContain("type: 'line'")
    expect(componentSource).toContain('autoresize')
    expect(componentSource).toContain('class="app-trend-chart"')
  })
})
