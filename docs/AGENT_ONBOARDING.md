# Agent Onboarding

本文件面向接手 `A_stock_AI` 的后续 AI agent。目标是在 10-15 分钟内建立项目结构、运行方式和改动边界的共同理解。

## 当前项目定位

`A_stock_AI` 是基于原始 `daily_stock_analysis` 二次开发的股票智能分析系统，覆盖 A 股、港股和美股。核心能力包括：

- 股票分析主流程：数据抓取、技术/基本面/资讯聚合、LLM 分析、报告持久化。
- Web 工作台：手动分析、历史报告、任务流、问股 Agent、系统设置。
- Agent 能力：多角色投研 Agent、策略技能、工具调用和 SSE 事件流。
- 部署形态：本地 CLI、FastAPI 服务、Docker、GitHub Actions 和桌面端打包链路。

## 先读顺序

1. `AGENTS.md`：仓库协作规则和验证矩阵，是 AI 协作真源。
2. `docs/INDEX.md`：文档入口。
3. `docs/FRONTEND_GUIDE.md`：涉及 Web 前端时必读。
4. `docs/CHANGELOG.md` 的 `[Unreleased]`：理解最近行为变化。
5. 任务相关测试文件：不要只读实现，不读测试。

## 目录地图

| 路径 | 职责 |
| --- | --- |
| `main.py` | CLI、调度和服务模式主入口。 |
| `server.py` | FastAPI 服务入口包装。 |
| `api/` | FastAPI app、中间件、v1 路由和 API schema。 |
| `src/core/` | 分析管线、配置注册、回测和市场复盘核心编排。 |
| `src/services/` | 业务服务层，如分析、历史、任务、系统配置、导入解析。 |
| `src/repositories/` | SQLite 持久化访问层。 |
| `src/agent/` | Agent 运行器、工具、技能、角色 Agent 和对话状态。 |
| `src/data/` | 股票索引和映射数据加载。 |
| `data_provider/` | AkShare、Tushare、YFinance、Longbridge 等数据源适配。 |
| `apps/dsa-web/` | React/Vite Web 工作台。 |
| `scripts/` | CI、静态资源、股票索引和打包辅助脚本。 |
| `strategies/` | 内置策略 YAML。 |
| `tests/` | 后端 pytest 测试。 |
| `docs/` | 用户文档、设计规格、实现计划和架构资产。 |

## 常用命令

后端：

```bash
cd A_stock_AI
python main.py --dry-run
python main.py --serve-only
uvicorn server:app --reload --host 0.0.0.0 --port 8000
python -m pytest -m "not network"
./scripts/ci_gate.sh
```

前端：

```bash
cd A_stock_AI/apps/dsa-web
npm run dev -- --host 127.0.0.1
npm run test
npm run lint
npm run build
```

AI 协作资产：

```bash
cd A_stock_AI
python scripts/check_ai_assets.py
```

## 改动边界

- Web 前端改动只放在 `apps/dsa-web/`，除非 API contract 也需要同步。
- 后端业务逻辑优先放在 `src/services/`、`src/core/`、`src/agent/` 或 `data_provider/`，不要新增平行实现。
- API 字段变化需要同步 `api/v1/schemas/`、前端 `src/types/`、相关测试和文档。
- 用户可见能力、部署方式、通知、报告结构或配置语义变化，需要更新 `docs/CHANGELOG.md` 的 `[Unreleased]`。
- 不要修改 `daily_stock_analysis`；它是原始项目参考，不是当前目标项目。

## 验证矩阵

| 改动面 | 推荐验证 |
| --- | --- |
| Web UI / React | `cd apps/dsa-web && npm run test && npm run build`，必要时补 Playwright 截图。 |
| Web 类型/API 调用 | `npm run build`，并跑受影响页面或 hook 测试。 |
| Python 后端 | `python -m pytest -m "not network"` 或更小范围 pytest。 |
| 配置/脚本/CI | 运行最接近的脚本，并说明未覆盖项。 |
| AI 协作规则 | `python scripts/check_ai_assets.py`。 |
| 文档-only | 检查命令、路径、配置名是否与代码一致。 |

## 本地状态和清理规则

以下内容是本地产物，通常可清理且不应入库：

- `.DS_Store`
- `__pycache__/`、`*.pyc`
- `.pytest_cache/`
- `logs/`
- `static/`
- `.superpowers/`

以下内容不要随手删除：

- `.env`：本机配置和密钥。
- `data/`：可能包含本地数据库和运行数据。
- `.venv/`：本机 Python 环境。
- `apps/dsa-web/node_modules/`：本机前端依赖。

## Git 注意事项

当前工作副本可能来自 worktree 或复制目录。若 `git status` 报 `.git/worktrees/...` 不存在，说明 `.git` 指针已失效。此时不要强行执行 `git reset` 或 `git checkout`；应先让用户确认是否重新克隆、恢复 worktree metadata，或把当前目录初始化为新的独立仓库。

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
- 不要把临时设计原型直接当生产实现；先确认它是否在 `docs/design/README.md` 标为参考资产。
- 不要把 `.env` 或本地数据库内容写入文档、测试快照或提交说明。
- 前端视觉改动要同时检查 light/dark 主题，PC 优先，但不能造成明显移动端遮挡或按钮溢出。
