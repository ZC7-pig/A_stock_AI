# Git 与 GitHub 新手学习笔记

这份笔记用于理解 `A_stock_AI` 项目的版本管理关系。先不用追求一次性掌握全部概念，日常开发先记住“改文件、提交、推送”这条主线即可。

## 1. Git 和 GitHub 的关系

`Git` 是安装在电脑上的版本管理工具。

`GitHub` 是网上托管 Git 仓库的网站。

可以这样理解：

```text
Git      = 本地版本管理系统
GitHub   = 云端代码仓库平台
本地项目  = 你电脑上的 A_stock_AI 文件夹
远程仓库  = GitHub 上的 ZC7-pig/A_stock_AI
```

当前项目关系：

```text
本地项目
/Users/zhangxiuchao/Desktop/AI_coding/股票分析/A_stock_AI

        git push 上传
              ↓

GitHub 仓库
https://github.com/ZC7-pig/A_stock_AI
```

## 2. Repository：仓库

仓库就是一个被 Git 管理的项目。

当前本地仓库：

```text
/Users/zhangxiuchao/Desktop/AI_coding/股票分析/A_stock_AI
```

当前 GitHub 远程仓库：

```text
https://github.com/ZC7-pig/A_stock_AI
```

一个项目可以同时存在于本地和 GitHub。Git 负责记录版本，GitHub 负责远程备份和协作。

## 3. Working Tree：工作区

`working tree` 就是你电脑上正在编辑的项目文件夹。

比如你修改了这些文件：

```text
apps/dsa-web/src/pages/HomePage.tsx
docs/AGENT_ONBOARDING.md
README.md
```

这些未提交的文件变化都属于工作区变化。

查看当前工作区状态：

```bash
git status
```

常见结果：

```text
modified:   某个文件
```

表示这个文件被修改过，但还没有正式保存成 Git 版本。

## 4. Stage：暂存区

暂存区是“准备放进下一次 commit 的改动列表”。

把某个文件加入暂存区：

```bash
git add 文件名
```

把当前所有改动加入暂存区：

```bash
git add .
```

可以这样理解：

```text
工作区 = 我实际改了哪些文件
暂存区 = 我准备把哪些改动放进下一次版本记录
```

## 5. Commit：提交

`commit` 是 Git 的一次正式版本记录，可以理解为“游戏存档”。

创建提交：

```bash
git commit -m "描述这次修改"
```

示例：

```bash
git commit -m "Improve stock history card layout"
git commit -m "Fix npm audit vulnerabilities"
git commit -m "Add project onboarding docs"
```

不要长期使用太模糊的提交信息：

```bash
git commit -m "update"
git commit -m "fix"
```

提交信息应该让未来的自己或其他 agent 大概知道这次改了什么。

## 6. Branch：分支

分支是不同的开发路线。

当前项目主分支是：

```text
main
```

`main` 通常代表项目的主线版本，也就是比较正式、稳定的版本。

以后如果要开发一个比较大的新功能，可以新建分支：

```bash
git switch -c codex/redesign-dashboard
```

新手阶段可以先只使用 `main`，等熟悉之后再学习分支协作。

## 7. origin 是什么

`origin` 是远程仓库的默认昵称。

当前项目中：

```text
origin = https://github.com/ZC7-pig/A_stock_AI.git
```

查看远程仓库地址：

```bash
git remote -v
```

这条命令：

```bash
git push origin main
```

意思是：

```text
把本地 main 分支上传到 origin 对应的 GitHub 仓库
```

当前项目已经建立了本地 `main` 和远程 `origin/main` 的跟踪关系，所以以后通常直接运行：

```bash
git push
```

即可。

## 8. push、pull、clone

### push：上传

把本地 commit 上传到 GitHub：

```bash
git push
```

### pull：拉取

把 GitHub 上的新变化同步到本地：

```bash
git pull
```

如果以后你在另一台电脑、GitHub 网页、或者其他 agent 修改了代码，回到本机开发前建议先执行：

```bash
git pull
```

### clone：第一次下载

如果换一台电脑，要从 GitHub 下载项目：

```bash
git clone https://github.com/ZC7-pig/A_stock_AI.git
```

## 9. 日常最常用流程

平时开发最常用这四步：

```bash
git status
git add .
git commit -m "描述这次修改"
git push
```

含义：

```text
1. git status
   查看当前改了哪些文件

2. git add .
   把所有改动加入暂存区

3. git commit -m "描述这次修改"
   创建一个本地版本记录

4. git push
   上传到 GitHub
```

## 10. 给 agent 协作时的推荐说法

让 agent 修改代码前，可以这样说：

```text
请只修改 A_stock_AI 项目，不要动 daily_stock_analysis。
```

让 agent 改完后，可以这样说：

```text
请检查 git status，总结这次修改了哪些文件，不要立刻提交。
```

确认没问题后，再说：

```text
请帮我提交并推送到 GitHub。
```

如果希望提交信息更清楚，可以指定：

```text
请用 commit message: Improve frontend history layout
```

## 11. 当前 A_stock_AI 的 Git 状态

截至本笔记创建时，项目已经完成：

```text
已初始化 Git 仓库
已有第一次 commit
主分支为 main
远程仓库为 https://github.com/ZC7-pig/A_stock_AI
本地 main 已推送到 GitHub
本地 main 已跟踪 origin/main
```

项目地址：

```text
https://github.com/ZC7-pig/A_stock_AI
```

## 12. 常用命令速查

查看状态：

```bash
git status
```

查看最近提交：

```bash
git log --oneline -5
```

查看远程仓库：

```bash
git remote -v
```

加入暂存区：

```bash
git add .
```

创建提交：

```bash
git commit -m "描述这次修改"
```

上传到 GitHub：

```bash
git push
```

从 GitHub 拉取更新：

```bash
git pull
```

查看当前分支：

```bash
git branch
```

## 13. 安全提醒

不要把这些内容提交到 GitHub：

```text
.env
API Key
GitHub token
数据库密码
真实账号密码
```

如果 token 不小心发出来或提交过，应立刻去 GitHub 后台删除并重新生成。

当前项目已经通过 `.gitignore` 忽略常见敏感文件，但仍然要养成提交前看一眼 `git status` 的习惯。
