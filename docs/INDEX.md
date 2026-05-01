# 文档索引

本文档作为后续开发者和 AI agent 的入口。新 agent 进入项目时，建议先读 `AGENTS.md`，再读本索引中与任务相关的专题文档。

## Agent 入口

- [Agent Onboarding](./AGENT_ONBOARDING.md)：项目地图、运行命令、常见改动路径、验证矩阵和本地注意事项。
- [前端开发与设计指南](./FRONTEND_GUIDE.md)：`apps/dsa-web` 的目录结构、视觉系统、组件约束和测试入口。
- [更新日志](./CHANGELOG.md)：用户可见变更与维护记录。

## 用户与部署文档

- [完整指南](./full-guide.md)：完整配置、运行模式、数据源、模型渠道、通知和 WebUI 说明。
- [常见问题](./FAQ.md)：运行、配置和部署排障。
- [部署说明](./DEPLOY.md)：服务部署、Docker、静态资源和 WebUI 排障。
- [LLM 配置指南](./LLM_CONFIG_GUIDE.md)：模型渠道、API Key、多模型配置和本地模型说明。
- [Tushare 股票列表指南](./TUSHARE_STOCK_LIST_GUIDE.md)：Tushare 股票列表生成与维护。

## 设计与架构资产

- [Web 设计资产说明](./design/README.md)：当前 Web 工作台设计方向和历史原型说明。
- `architecture/api_spec.json`：API 规范快照。
- `superpowers/specs/`：已确认的设计规格。
- `superpowers/plans/`：已执行或待执行的实现计划。

## 贡献与治理

- [贡献指南](./CONTRIBUTING.md)：贡献流程、测试和 PR 习惯。
- 根目录 [AGENTS.md](../AGENTS.md)：AI 协作规则、目录边界、验证要求和文档维护要求。
