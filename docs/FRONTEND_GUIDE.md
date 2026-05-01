# 前端开发与设计指南

本文档覆盖 `apps/dsa-web`。目标是让后续 agent 能快速理解 Web 工作台结构，并继续沿用当前投研产品的视觉方向。

## 技术栈

- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4（通过 `src/index.css` + `tailwind.config.js`）
- React Router
- Zustand
- Axios

## 目录结构

| 路径 | 职责 |
| --- | --- |
| `src/App.tsx` | 路由、认证守卫和 Shell 嵌套。 |
| `src/pages/` | 页面级容器：Home、Chat、Settings、Login、NotFound。 |
| `src/components/common/` | Button、Card、Drawer、Input、Toast、Tooltip 等共享组件。 |
| `src/components/layout/` | Shell、SidebarNav。 |
| `src/components/history/` | 首页历史报告列表。 |
| `src/components/report/` | 报告摘要、详情、新闻、Markdown 抽屉。 |
| `src/components/settings/` | 系统设置页面组件。 |
| `src/hooks/` | 数据加载、任务流、自动补全、系统配置 hooks。 |
| `src/stores/` | Zustand 状态，如首页分析池、问股会话。 |
| `src/api/` | Axios API 封装。 |
| `src/types/` | 前端 API 数据类型。 |
| `src/utils/` | 格式化、股票搜索、Markdown、校验等工具。 |
| `src/index.css` | 全局 token、主题、V4 工作台视觉系统和页面级样式。 |

## 设计方向

当前 PC 端定位是“投研工作台”，不是通用 AI landing page。优先级如下：

1. 高扫描效率：历史列表、评分、结论、点位和时间要便于快速比较。
2. 冷静可信：少用发光、玻璃、彩虹渐变和装饰性图形。
3. 数据语义明确：涨跌色保留 A 股语义，评分颜色按分数区间表达风险。
4. PC 优先：1440px 和 1920px 宽度优先，但不得制造明显移动端遮挡。

### 颜色语义

- 主色：沉稳 teal/ink，围绕 `--v4-theme`、`--v4-theme-strong`、`--v4-theme-soft`。
- 风险/低分：复用 `getSentimentColor(score)`，低分红/橙，中位黄，高分绿。
- A 股涨跌：红涨、绿跌，使用现有 `--home-price-up` / `--home-price-down` 或 V4 token。
- 不再把 purple/cyan glow 当默认强调色。

### 组件习惯

- 卡片圆角优先 8-10px，边框和轻阴影优先，避免大面积 glass/blur。
- 工具按钮优先使用现有 `Button` variant；如果新增 variant，保持 API 向后兼容。
- 图标只在承载功能含义时使用，不给每个标题装饰性配图。
- 空态不编造统计数据；用真实能力提示和明确下一步操作。
- 固定格式元素（历史卡、评分卡、按钮）要设置稳定尺寸，避免内容变化导致布局跳动。

## 首页关键文件

- `pages/HomePage.tsx`：首页壳层、搜索、左侧历史、报告区域和抽屉。
- `components/history/HistoryList.tsx`：历史列表容器、批量管理、滚动加载。
- `components/history/HistoryListItem.tsx`：单条历史卡片。股票名称和代码在第一行，第二行保留建议和时间。
- `components/report/ReportSummary.tsx`：报告摘要、主评分、维度评分、内容 tabs。
- `index.css`：`.v4-*`、`.home-*` 等视觉系统。

## API 与状态流

首页主链路：

1. `HomePage` 调用 `useHomeDashboardState()`。
2. `useDashboardLifecycle()` 加载历史、订阅任务流、同步任务变化。
3. 提交分析走 `analysisApi.analyzeAsync()`。
4. 历史列表走 `historyApi.getList()` / `historyApi.getDetail()`。
5. 完整报告和新闻通过 `ReportMarkdown` / `ReportNews` 懒加载。

问股主链路：

1. `ChatPage` 读取 URL 中的 stock/name/recordId。
2. `agentChatStore` 管理会话、消息、completion badge。
3. `api/agent.ts` 与后端 Agent SSE/API 交互。

## 验证入口

当前仓库已删除前端测试套件。常用前端验证：

```bash
cd apps/dsa-web
npm run lint
npm run build
```

视觉改动建议额外打开浏览器检查 1440x960 light/dark 效果。后端未启动时，先确认页面空态不会遮挡或崩溃。

## 常见坑

- `npm run build` 会输出到项目根 `static/`，这是构建产物，不应作为源码维护。
- `src/index.css` 里有历史 token 和 V4 token 并存；新视觉优先改 V4 区域，避免全局破坏旧页面。
- `next-themes` 默认主题为 dark；截图验证要覆盖 light/dark。
- 不要重新加入设计原型 HTML；视觉方案应直接沉淀为生产组件、token 和样式。
