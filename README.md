# A_stock_AI

`A_stock_AI` 是基于 `daily_stock_analysis` 二次开发的股票智能分析项目，目标是提供一个更适合个人使用和后续 AI agent 接手开发的投研工作台。

项目核心能力：

- 股票分析：聚合行情、技术面、基本面、新闻舆情和资金信息。
- AI 报告：调用大模型生成结构化分析结论、评分、买卖观察点和风险提示。
- Web 工作台：支持手动分析、历史报告、任务进度、问股对话和系统设置。
- 策略能力：内置多种 A 股策略 YAML，可用于 Agent 问股和分析辅助。
- 本地部署：支持 CLI、FastAPI 服务、Web UI 和 Docker。

## 项目结构

```text
A_stock_AI/
├── main.py                 # CLI、调度、WebUI 启动入口
├── server.py               # FastAPI 服务入口
├── api/                    # FastAPI app、路由、中间件和 schema
├── src/                    # 核心分析、服务、Agent、配置和报告逻辑
├── data_provider/          # AkShare、Tushare、YFinance 等数据源适配
├── apps/dsa-web/           # React + Vite 前端工作台
├── strategies/             # 内置策略 YAML
├── templates/              # 报告模板
├── scripts/                # 数据生成和打包辅助脚本
├── docker/                 # Docker 配置
└── docs/                   # 项目文档
```

已清理掉与当前产品运行无关的测试、CI、设计探索原型、历史排查脚本和本地缓存目录。当前仓库更偏向“产品源码 + 必要文档”。

## 快速开始

### 1. 安装后端依赖

```bash
pip install -r requirements.txt
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

然后编辑 `.env`，至少配置一个可用的大模型 API Key。详细说明见：

- [LLM 配置指南](docs/LLM_CONFIG_GUIDE.md)
- [完整指南](docs/full-guide.md)

### 3. 启动 Web 工作台

```bash
python main.py --webui
```

浏览器访问：

```text
http://127.0.0.1:8000
```

### 4. 单次命令行分析

```bash
python main.py --stocks 600519
python main.py --market-review
python main.py --dry-run
```

## 前端开发

```bash
cd apps/dsa-web
npm ci
npm run dev -- --host 127.0.0.1
```

前端构建：

```bash
cd apps/dsa-web
npm run lint
npm run build
```

构建产物会输出到项目根目录的 `static/`，用于后端托管。

## 常用文档

- [Agent 接手说明](docs/AGENT_ONBOARDING.md)
- [文档索引](docs/INDEX.md)
- [前端开发与设计指南](docs/FRONTEND_GUIDE.md)
- [Git / GitHub 新手笔记](GIT_GITHUB_NOTES.md)
- [完整配置与部署指南](docs/full-guide.md)
- [常见问题](docs/FAQ.md)
- [更新日志](docs/CHANGELOG.md)

## GitHub 仓库

当前远程仓库：

```text
https://github.com/ZC7-pig/A_stock_AI
```

日常修改流程：

```bash
git status
git add .
git commit -m "描述这次修改"
git push
```

## 安全提醒

不要提交以下内容：

- `.env`
- API Key
- GitHub token
- 数据库密码
- 本地数据库和运行数据

项目根目录的 `.gitignore` 已经忽略常见敏感文件和本地产物，但提交前仍建议先执行 `git status` 检查。

## 免责声明

本项目仅用于学习、研究和个人投研辅助，不构成投资建议。市场有风险，投资需谨慎。
