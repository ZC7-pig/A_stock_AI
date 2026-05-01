# Web 设计资产说明

`docs/design/` 保存 Web 工作台改版过程中的设计说明和 HTML 原型。它们是参考资产，不是生产入口。

## 当前生产方向

生产前端位于 `apps/dsa-web/`，当前 PC 端视觉方向是“投研工作台”：

- 克制的 ink/teal 色系。
- 低装饰、高密度、便于扫描。
- 历史报告、评分、结论和点位优先可读。
- 避免通用 AI/SaaS 风格的霓虹、玻璃、渐变边框和大面积空画布。

更多前端约束见 [前端开发与设计指南](../FRONTEND_GUIDE.md)。

## 文件说明

| 文件 | 用途 |
| --- | --- |
| `a-stock-ai-webui-redesign-proposal.md` | WebUI 改版提案。 |
| `claude-ui-redesign-brief.md` | 早期 UI 改版 brief。 |
| `homepage-terminal-copilot-prototype.html` | terminal/copilot 风格探索原型。 |
| `homepage-copilot-clean-prototype-v2.html` | 更干净的 Copilot 工作台方向探索。 |
| `homepage-focused-workbench-prototype-v3.html` | 聚焦工作台方向 v3。 |
| `homepage-focused-workbench-prototype-v4.html` | 当前 V4 工作台方向参考。 |

## 使用规则

- 生产实现以 `apps/dsa-web/src` 为准。
- 原型只用于提炼布局、色彩、信息层级和交互语气。
- 不要把原型中的假数据或装饰性元素复制进生产。
- 新增原型时补充本 README，说明用途和是否仍推荐参考。
