# 文档索引

本文档作为后续开发者和 AI agent 的入口。新 agent 进入项目时，建议先读根目录 `README.md` 和 `AGENTS.md`，再读本索引中与任务相关的专题文档。

## Agent 入口

- [Agent Onboarding](./AGENT_ONBOARDING.md)：项目地图、运行命令、常见改动路径、验证方式和本地注意事项。
- [前端开发与设计指南](./FRONTEND_GUIDE.md)：`apps/dsa-web` 的目录结构、视觉系统、组件约束和构建入口。
- [更新日志](./CHANGELOG.md)：用户可见变更与维护记录。
- [Git / GitHub 新手笔记](../GIT_GITHUB_NOTES.md)：本项目的 Git 基础概念和日常操作。

## 用户与部署文档

- [完整指南](./full-guide.md)：完整配置、运行模式、数据源、模型渠道、通知和 WebUI 说明。
- [常见问题](./FAQ.md)：运行、配置和部署排障。
- [部署说明](./DEPLOY.md)：服务部署、Docker、静态资源和 WebUI 排障。
- [LLM 配置指南](./LLM_CONFIG_GUIDE.md)：模型渠道、API Key、多模型配置和本地模型说明。
- [Tushare 股票列表指南](./TUSHARE_STOCK_LIST_GUIDE.md)：Tushare 股票列表生成与维护。

## 架构资产

- `architecture/api_spec.json`：API 规范快照。

## 当前精简状态

仓库已经移除以下非产品运行必需内容：

- 后端和前端测试目录。
- Vitest、Playwright、Testing Library 等测试配置与依赖。
- GitHub Actions、Issue/PR 模板、自动审查脚本。
- Claude/Superpowers 工作流痕迹。
- 设计探索 HTML 原型和历史评审文件。
- 大体积文档图片、赞助图、PSD/AI 等素材源文件。
