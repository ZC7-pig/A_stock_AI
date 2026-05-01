# AGENTS.md

本文件面向后续接手 `A_stock_AI` 的 AI agent。`daily_stock_analysis` 是原始参考项目，不是当前目标项目，除非用户明确要求，否则不要修改它。

## 项目定位

`A_stock_AI` 是股票智能分析系统，当前保留产品源码、运行配置和必要文档。仓库已移除测试、CI、历史设计原型和排查脚本，后续开发以实际运行、构建和人工检查为主要验证方式。

核心能力：

- 股票分析主流程：数据抓取、行情/新闻/资金/基本面聚合、AI 分析、报告落盘。
- Web 工作台：手动分析、历史报告、任务进度、问股 Agent、系统设置。
- Agent 能力：多角色投研 Agent、策略工具、SSE 事件流和对话状态。
- 部署形态：本地 CLI、FastAPI 服务、Docker、Web UI。

## 目录边界

| 路径 | 职责 |
| --- | --- |
| `main.py` | CLI、调度和服务模式主入口。 |
| `server.py` | FastAPI 服务入口包装。 |
| `api/` | FastAPI app、中间件、v1 路由和 API schema。 |
| `src/core/` | 分析管线、配置注册、市场复盘核心编排。 |
| `src/services/` | 分析、历史、任务、系统配置、导入解析等业务服务。 |
| `src/repositories/` | SQLite 持久化访问层。 |
| `src/agent/` | Agent 运行器、工具、技能、角色 Agent 和对话状态。 |
| `src/data/` | 股票索引和映射数据加载。 |
| `data_provider/` | AkShare、Tushare、YFinance、Longbridge 等数据源适配。 |
| `apps/dsa-web/` | React/Vite Web 工作台。 |
| `strategies/` | 内置策略 YAML。 |
| `templates/` | 报告模板。 |
| `scripts/` | 股票索引生成、数据抓取和打包辅助脚本。 |
| `docs/` | 项目文档。 |

## 先读顺序

1. `README.md`
2. `docs/INDEX.md`
3. `docs/AGENT_ONBOARDING.md`
4. `docs/FRONTEND_GUIDE.md`，仅当前端任务相关时阅读
5. `docs/CHANGELOG.md` 的 `[Unreleased]`

## 常用命令

后端：

```bash
python main.py --dry-run
python main.py --serve-only
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

前端：

```bash
cd apps/dsa-web
npm ci
npm run dev -- --host 127.0.0.1
npm run lint
npm run build
```

Docker：

```bash
docker compose -f docker/docker-compose.yml up --build
```

## 改动原则

- Web 前端改动优先放在 `apps/dsa-web/`。
- 后端业务逻辑优先放在 `src/services/`、`src/core/`、`src/agent/` 或 `data_provider/`。
- API 字段变化需要同步 `api/v1/schemas/`、前端 `apps/dsa-web/src/types/` 和相关文档。
- 用户可见能力、配置语义、报告结构、部署方式变化，需要更新 `docs/CHANGELOG.md` 的 `[Unreleased]`。
- 不要把测试、CI、临时原型或排查脚本重新加入仓库，除非用户明确要求恢复工程化验证体系。
- 不要提交 `.env`、API Key、token、本地数据库、运行数据、`node_modules/`、`.venv/` 或构建产物。

## 验证建议

当前仓库不保留测试套件。完成改动后根据影响面选择验证：

| 改动面 | 推荐验证 |
| --- | --- |
| Web UI / React | `cd apps/dsa-web && npm run lint && npm run build`，必要时打开浏览器人工检查。 |
| Python 后端 | 启动相关入口，或运行最小命令如 `python main.py --dry-run`。 |
| API / Web 联动 | 同时启动后端和前端，人工走一遍对应页面流程。 |
| 文档-only | 检查命令、路径、配置名是否与当前文件一致。 |

## 常见任务定位

- 首页、历史报告、报告摘要：`apps/dsa-web/src/pages/HomePage.tsx`、`components/history/`、`components/report/`、`src/index.css`。
- 问股 Agent 页面：`apps/dsa-web/src/pages/ChatPage.tsx`、`stores/agentChatStore.ts`、`api/agent.ts`。
- 系统设置：`apps/dsa-web/src/pages/SettingsPage.tsx`、`components/settings/`、`api/systemConfig.ts`、后端 `src/services/system_config_service.py`。
- 分析任务流：前端 `hooks/useTaskStream.ts`，后端 `src/services/task_service.py`、`api/v1/endpoints/analysis.py`。
- 历史报告：前端 `api/history.ts`、后端 `src/services/history_service.py`、`api/v1/endpoints/history.py`。
- 数据源适配：`data_provider/`。
- Agent 工具和策略：`src/agent/tools/`、`src/agent/strategies/`、`strategies/*.yaml`。
