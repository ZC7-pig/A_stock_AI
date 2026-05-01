# Agent Onboarding

本文件面向接手 `A_stock_AI` 的后续 AI agent。目标是在 10-15 分钟内建立项目结构、运行方式和改动边界的共同理解。

## 当前项目定位

`A_stock_AI` 是基于原始 `daily_stock_analysis` 二次开发的股票智能分析系统，覆盖 A 股、港股和美股。当前仓库已精简为产品源码、运行配置和必要文档，不再保留测试、CI、设计探索原型和历史排查脚本。

核心能力：

- 股票分析主流程：数据抓取、技术/基本面/资讯聚合、LLM 分析、报告持久化。
- Web 工作台：手动分析、历史报告、任务流、问股 Agent、系统设置。
- Agent 能力：多角色投研 Agent、策略技能、工具调用和 SSE 事件流。
- 部署形态：本地 CLI、FastAPI 服务、Docker 和 Web UI。

## 先读顺序

1. `README.md`：项目概览和运行方式。
2. `AGENTS.md`：AI agent 协作边界和常见任务定位。
3. `docs/INDEX.md`：文档入口。
4. `docs/FRONTEND_GUIDE.md`：涉及 Web 前端时必读。
5. `docs/CHANGELOG.md` 的 `[Unreleased]`：理解最近行为变化。

## 目录地图

| 路径 | 职责 |
| --- | --- |
| `main.py` | CLI、调度和服务模式主入口。 |
| `server.py` | FastAPI 服务入口包装。 |
| `api/` | FastAPI app、中间件、v1 路由和 API schema。 |
| `src/core/` | 分析管线、配置注册和市场复盘核心编排。 |
| `src/services/` | 分析、历史、任务、系统配置、导入解析等业务服务。 |
| `src/repositories/` | SQLite 持久化访问层。 |
| `src/agent/` | Agent 运行器、工具、技能、角色 Agent 和对话状态。 |
| `src/data/` | 股票索引和映射数据加载。 |
| `data_provider/` | AkShare、Tushare、YFinance、Longbridge 等数据源适配。 |
| `apps/dsa-web/` | React/Vite Web 工作台。 |
| `scripts/` | 股票索引生成、数据抓取和打包辅助脚本。 |
| `strategies/` | 内置策略 YAML。 |
| `templates/` | 报告模板。 |
| `docs/` | 用户文档和维护说明。 |

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

## 改动边界

- Web 前端改动只放在 `apps/dsa-web/`，除非 API contract 也需要同步。
- 后端业务逻辑优先放在 `src/services/`、`src/core/`、`src/agent/` 或 `data_provider/`，不要新增平行实现。
- API 字段变化需要同步 `api/v1/schemas/`、前端 `apps/dsa-web/src/types/` 和相关文档。
- 用户可见能力、部署方式、报告结构或配置语义变化，需要更新 `docs/CHANGELOG.md` 的 `[Unreleased]`。
- 不要修改 `daily_stock_analysis`；它是原始项目参考，不是当前目标项目。

## 验证矩阵

当前仓库已删除测试套件。后续验证以构建、启动和人工流程检查为主。

| 改动面 | 推荐验证 |
| --- | --- |
| Web UI / React | `cd apps/dsa-web && npm run lint && npm run build`，必要时打开页面人工检查。 |
| Web 类型/API 调用 | `npm run build`，并人工走一遍相关页面。 |
| Python 后端 | 运行相关入口，如 `python main.py --dry-run` 或 `python main.py --serve-only`。 |
| 文档-only | 检查命令、路径、配置名是否与代码一致。 |

## 本地状态和清理规则

以下内容是本地产物，通常可清理且不应入库：

- `.DS_Store`
- `__pycache__/`、`*.pyc`
- `logs/`
- `static/`
- `.venv/`
- `apps/dsa-web/node_modules/`

以下内容不要随手删除：

- `.env`：本机配置和密钥。
- `data/`：可能包含本地数据库和运行数据。

## 常见任务定位

- 首页、历史报告、报告摘要：`apps/dsa-web/src/pages/HomePage.tsx`、`components/history/`、`components/report/`、`src/index.css`。
- 问股 Agent 页面：`apps/dsa-web/src/pages/ChatPage.tsx`、`stores/agentChatStore.ts`、`api/agent.ts`。
- 系统设置：`apps/dsa-web/src/pages/SettingsPage.tsx`、`components/settings/`、`api/systemConfig.ts`、后端 `src/services/system_config_service.py`。
- 分析任务流：前端 `hooks/useTaskStream.ts`，后端 `src/services/task_service.py`、`api/v1/endpoints/analysis.py`。
- 历史报告：前端 `api/history.ts`、后端 `src/services/history_service.py`、`api/v1/endpoints/history.py`。
- 数据源适配：`data_provider/`。
- Agent 工具和策略：`src/agent/tools/`、`src/agent/strategies/`、`strategies/*.yaml`。

## 风险提示

- 不要编造股票数据、行情、收益率或报告内容；没有真实数据时用明确空态或占位。
- 不要把 `.env` 或本地数据库内容写入文档或提交说明。
- 前端视觉改动要同时检查 light/dark 主题，PC 优先，但不能造成明显移动端遮挡或按钮溢出。
