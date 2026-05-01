# A_stock_AI WebUI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the WebUI interaction and visual structure into a professional research console while preserving the current analysis, chat, settings, auth, and responsive behavior.

**Architecture:** Keep the current React/Vite/Tailwind structure and refactor in thin vertical slices. First normalize design tokens and action semantics, then redesign Shell, Home, Chat, Settings, Login, and mobile states with focused tests after each page.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, Zustand, React Router, Vitest, Testing Library, Playwright-compatible DOM.

---

## Scope And Boundaries

This plan implements the approved design direction from:

- `docs/design/claude-ui-redesign-brief.md`
- `docs/design/a-stock-ai-webui-redesign-proposal.md`

Keep these product boundaries:

- Keep: Web 工作台, 股票分析首页, 历史记录, 任务状态, 报告展示, 问股 Agent, AI 模型接入, 多数据源配置, 通知渠道, 系统设置, Agent 设置, 登录保护, 明暗主题。
- Do not reintroduce: Bot 机器人通知入口, Electron 桌面端, 持仓管理, 回测, 数据质量面板, 营销首页。
- Do not lock button locations from the old UI. Preserve operations and accessibility labels, but reorganize action areas by task flow.

## File Structure

### Existing Files To Modify

- `apps/dsa-web/src/index.css`  
  Own semantic tokens, page surfaces, action role colors, report typography, responsive shell constants.

- `apps/dsa-web/src/App.css`  
  Keep root-level sizing only unless a global layout reset is needed.

- `apps/dsa-web/src/components/common/Button.tsx`  
  Normalize action roles: primary, secondary, tertiary/ghost, danger, stateful. Keep old variants temporarily mapped to the new system to avoid broad breakage.

- `apps/dsa-web/src/components/common/Card.tsx`  
  Tighten card radius and surface variants for research-console density.

- `apps/dsa-web/src/components/common/Badge.tsx`  
  Keep semantic state badges aligned with new tokens.

- `apps/dsa-web/src/components/layout/Shell.tsx`  
  Keep app shell behavior, update density and responsive containment.

- `apps/dsa-web/src/components/layout/ShellHeader.tsx`  
  Convert into a concise context bar with page title, page description, sidebar controls, theme control, and light status area.

- `apps/dsa-web/src/components/layout/SidebarNav.tsx`  
  Keep three core navigation entries and rename the home entry to `分析`.

- `apps/dsa-web/src/pages/HomePage.tsx`  
  Refactor into Home Workspace: workspace header, research sidebar, report canvas.

- `apps/dsa-web/src/components/history/HistoryList.tsx`  
  Adjust density and selection affordances.

- `apps/dsa-web/src/components/history/HistoryListItem.tsx`  
  Improve scanability for stock, advice, score, date.

- `apps/dsa-web/src/components/tasks/TaskPanel.tsx`  
  Align task states with research-console status style.

- `apps/dsa-web/src/components/report/ReportSummary.tsx`  
  Preserve orchestration of report sections.

- `apps/dsa-web/src/components/report/ReportOverview.tsx`  
  Make conclusion layer clearer: score, advice, summary, risk indicators.

- `apps/dsa-web/src/components/report/ReportStrategy.tsx`  
  Emphasize strategy conditions and evidence.

- `apps/dsa-web/src/components/report/ReportNews.tsx`  
  Keep news as evidence layer, improve empty/loading/error states.

- `apps/dsa-web/src/components/report/ReportDetails.tsx`  
  Improve data section readability and compact layout.

- `apps/dsa-web/src/pages/ChatPage.tsx`  
  Refactor into research assistant layout: session rail, research context, conversation canvas, composer.

- `apps/dsa-web/src/stores/agentChatStore.ts`  
  Preserve behavior; only update if the new UI needs derived state helpers.

- `apps/dsa-web/src/pages/SettingsPage.tsx`  
  Keep grouped settings and drawers. Improve category status, AI model entry, data source grouping, notification grouping, Agent grouping.

- `apps/dsa-web/src/components/settings/LLMChannelEditor.tsx`  
  Preserve unified model channel model. Improve layout labels and connection-test affordance.

- `apps/dsa-web/src/components/settings/SettingsCategoryNav.tsx`  
  Add status/dirty/error readability.

- `apps/dsa-web/src/components/settings/SettingsSectionCard.tsx`  
  Align with new surface density.

- `apps/dsa-web/src/components/settings/SettingsField.tsx`  
  Improve field label, description, validation issue, secret state display.

- `apps/dsa-web/src/pages/LoginPage.tsx`  
  Simplify to secure login panel.

### Tests To Update Or Add

- `apps/dsa-web/src/components/common/__tests__/Button.test.tsx`
- `apps/dsa-web/src/pages/__tests__/HomePage.test.tsx`
- `apps/dsa-web/src/pages/__tests__/ChatPage.test.tsx`
- `apps/dsa-web/src/pages/__tests__/SettingsPage.test.tsx`
- `apps/dsa-web/src/pages/__tests__/LoginPage.test.tsx`
- `apps/dsa-web/src/components/report/__tests__/ReportOverview.test.tsx`
- `apps/dsa-web/src/components/settings/__tests__/LLMChannelEditor.test.tsx`

If `apps/dsa-web/src/components/common/__tests__/Button.test.tsx` does not exist, create it.

## Task 1: Normalize Visual Tokens And Action Roles

**Files:**
- Modify: `apps/dsa-web/src/index.css`
- Modify: `apps/dsa-web/src/components/common/Button.tsx`
- Modify: `apps/dsa-web/src/components/common/Card.tsx`
- Modify: `apps/dsa-web/src/components/common/Badge.tsx`
- Create: `apps/dsa-web/src/components/common/__tests__/Button.test.tsx`

- [ ] **Step 1: Create Button semantic role tests**

Create `apps/dsa-web/src/components/common/__tests__/Button.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from '../Button';

describe('Button', () => {
  it('keeps primary actions accessible and non-layout-specific', () => {
    render(<Button variant="primary">开始分析</Button>);

    const button = screen.getByRole('button', { name: '开始分析' });
    expect(button).toHaveAttribute('data-variant', 'primary');
    expect(button.className).toContain('inline-flex');
  });

  it('marks loading actions as busy and swaps visible text', () => {
    render(
      <Button variant="primary" isLoading loadingText="分析中">
        分析
      </Button>
    );

    const button = screen.getByRole('button', { name: '分析中' });
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();
  });

  it('keeps danger actions visually and semantically separate', () => {
    render(<Button variant="danger">删除</Button>);

    const button = screen.getByRole('button', { name: '删除' });
    expect(button).toHaveAttribute('data-variant', 'danger');
    expect(button.className).toContain('danger');
  });
});
```

- [ ] **Step 2: Run the new test and verify it passes against current behavior**

Run:

```bash
cd apps/dsa-web
PATH="$PWD/node_modules/.bin:$PATH" vitest run src/components/common/__tests__/Button.test.tsx
```

Expected: `3 passed`. If the directory did not exist before, this confirms the baseline behavior is test-covered before styling changes.

- [ ] **Step 3: Add research-console token aliases**

In `apps/dsa-web/src/index.css`, add semantic aliases under `:root` near existing token blocks:

```css
  /* Research console semantic tokens */
  --console-bg: hsl(var(--background));
  --console-surface: hsl(var(--card));
  --console-surface-muted: hsl(var(--muted));
  --console-border: hsl(var(--border));
  --console-border-strong: hsl(var(--foreground) / 0.16);
  --console-text: hsl(var(--foreground));
  --console-text-muted: hsl(var(--muted-text));
  --console-accent: hsl(var(--primary));
  --console-positive: hsl(var(--success));
  --console-negative: hsl(var(--danger));
  --console-warning: hsl(var(--warning));
  --console-info: hsl(var(--primary) / 0.82);
  --console-radius-sm: 0.5rem;
  --console-radius-md: 0.75rem;
  --console-radius-lg: 1rem;
  --console-shadow-panel: 0 10px 28px hsl(220 20% 30% / 0.08);
```

In the dark theme block in the same file, override these aliases only when the existing dark tokens need different contrast:

```css
  --console-surface-muted: hsl(var(--muted) / 0.72);
  --console-border-strong: hsl(var(--foreground) / 0.2);
  --console-shadow-panel: 0 14px 34px hsl(220 40% 4% / 0.28);
```

- [ ] **Step 4: Map Button variants to role-based styling**

In `apps/dsa-web/src/components/common/Button.tsx`, keep the public `variant` API, but align styles to the new tokens. Preserve old variants to avoid changing every caller in one pass:

```tsx
const BUTTON_VARIANT_STYLES = {
  primary: 'border border-[var(--console-accent)]/30 bg-primary-gradient text-primary-foreground shadow-sm hover:brightness-105',
  secondary: 'border border-[var(--console-border)] bg-[var(--console-surface)] text-foreground hover:bg-hover',
  outline: 'border border-[var(--console-border-strong)] bg-transparent text-foreground hover:bg-hover',
  ghost: 'border border-transparent bg-transparent text-secondary-text hover:bg-hover hover:text-foreground',
  gradient: 'border border-[var(--console-accent)]/30 bg-primary-gradient text-primary-foreground shadow-sm hover:brightness-105',
  danger: 'border border-danger/40 bg-danger text-destructive-foreground shadow-sm hover:brightness-105',
  'danger-subtle': 'border border-danger/40 bg-danger/10 text-danger hover:bg-danger/15',
  'settings-primary': 'border settings-button-primary hover:brightness-105',
  'settings-secondary': 'border settings-button-secondary',
  'action-primary': ACTION_AI_STYLES,
  'action-secondary': ACTION_REPORT_STYLES,
  'home-action-ai': ACTION_AI_STYLES,
  'home-action-report': ACTION_REPORT_STYLES,
} as const;
```

- [ ] **Step 5: Tighten Card and Badge density**

In `Card.tsx`, change the base rounded class from `rounded-2xl` to `rounded-[var(--console-radius-lg)]`.

In `Badge.tsx`, keep rounded pills but ensure semantic variants are still driven by success/warning/danger/info tokens. No API change.

- [ ] **Step 6: Run focused component checks**

Run:

```bash
cd apps/dsa-web
PATH="$PWD/node_modules/.bin:$PATH" vitest run src/components/common/__tests__/Button.test.tsx
npm run lint
```

Expected:

- Button tests pass.
- ESLint exits 0.

- [ ] **Step 7: Commit visual foundation**

```bash
git add apps/dsa-web/src/index.css apps/dsa-web/src/components/common/Button.tsx apps/dsa-web/src/components/common/Card.tsx apps/dsa-web/src/components/common/Badge.tsx apps/dsa-web/src/components/common/__tests__/Button.test.tsx
git commit -m "Refine WebUI visual foundation"
```

## Task 2: Refine Global Shell And Navigation

**Files:**
- Modify: `apps/dsa-web/src/components/layout/Shell.tsx`
- Modify: `apps/dsa-web/src/components/layout/ShellHeader.tsx`
- Modify: `apps/dsa-web/src/components/layout/SidebarNav.tsx`
- Test: `apps/dsa-web/src/components/layout/__tests__/Shell.test.tsx`
- Test: `apps/dsa-web/src/components/layout/__tests__/SidebarNav.test.tsx`

- [ ] **Step 1: Update Shell tests to assert core navigation only**

In `SidebarNav.test.tsx`, ensure the tests assert the three retained entries:

```tsx
expect(screen.getByRole('link', { name: '分析' })).toBeInTheDocument();
expect(screen.getByRole('link', { name: '问股' })).toBeInTheDocument();
expect(screen.getByRole('link', { name: '设置' })).toBeInTheDocument();
expect(screen.queryByRole('link', { name: /回测|持仓|Bot|桌面端/ })).not.toBeInTheDocument();
```

- [ ] **Step 2: Rename nav labels to research-console copy**

In `SidebarNav.tsx`, use exactly these retained entries:

```tsx
const NAV_ITEMS: NavItem[] = [
  { key: 'home', label: '分析', to: '/', icon: Home, exact: true },
  { key: 'chat', label: '问股', to: '/chat', icon: MessageSquareQuote, badge: 'completion' },
  { key: 'settings', label: '设置', to: '/settings', icon: Settings2 },
];
```

Keep `SidebarNav.test.tsx` aligned with `分析`, `问股`, and `设置`.

- [ ] **Step 3: Refine ShellHeader copy**

In `ShellHeader.tsx`, keep route mapping concise:

```tsx
const TITLES: Record<string, { title: string; description: string }> = {
  '/': { title: '分析工作台', description: '股票分析、任务与历史报告' },
  '/chat': { title: '问股 Agent', description: '围绕股票与报告进行策略追问' },
  '/settings': { title: '系统设置', description: '模型、数据源、通知与 Agent 配置' },
};
```

- [ ] **Step 4: Run layout tests**

Run:

```bash
cd apps/dsa-web
PATH="$PWD/node_modules/.bin:$PATH" vitest run src/components/layout/__tests__/Shell.test.tsx src/components/layout/__tests__/SidebarNav.test.tsx
```

Expected: existing layout tests pass after copy updates.

- [ ] **Step 5: Commit shell refinement**

```bash
git add apps/dsa-web/src/components/layout/Shell.tsx apps/dsa-web/src/components/layout/ShellHeader.tsx apps/dsa-web/src/components/layout/SidebarNav.tsx apps/dsa-web/src/components/layout/__tests__/Shell.test.tsx apps/dsa-web/src/components/layout/__tests__/SidebarNav.test.tsx
git commit -m "Refine WebUI shell navigation"
```

## Task 3: Rebuild Home Workspace Structure

**Files:**
- Modify: `apps/dsa-web/src/pages/HomePage.tsx`
- Modify: `apps/dsa-web/src/components/history/HistoryList.tsx`
- Modify: `apps/dsa-web/src/components/history/HistoryListItem.tsx`
- Modify: `apps/dsa-web/src/components/tasks/TaskPanel.tsx`
- Test: `apps/dsa-web/src/pages/__tests__/HomePage.test.tsx`

- [ ] **Step 1: Update HomePage semantic tests**

In `HomePage.test.tsx`, replace class-specific assertions such as `h-[calc(100vh-5rem)]` with semantic regions:

```tsx
expect(await screen.findByTestId('home-dashboard')).toBeInTheDocument();
expect(screen.getByRole('region', { name: '股票分析输入' })).toBeInTheDocument();
expect(screen.getByRole('region', { name: '研究侧栏' })).toBeInTheDocument();
expect(screen.getByRole('region', { name: '报告阅读区' })).toBeInTheDocument();
```

Keep functional assertions:

```tsx
expect(screen.getByPlaceholderText('输入股票代码或名称，如 600519、贵州茅台、AAPL')).toBeInTheDocument();
expect(await screen.findByText('趋势维持强势')).toBeInTheDocument();
expect(screen.getByRole('button', { name: '追问 AI' })).toBeInTheDocument();
```

- [ ] **Step 2: Add semantic regions to HomePage**

In `HomePage.tsx`, add `aria-label="股票分析输入"` to the existing top input `<header>` element.

Wrap the desktop sidebar container in an `<aside aria-label="研究侧栏">` element and keep `{sidebarContent}` as its child.

Add `aria-label="报告阅读区"` to the main report `<section>` that renders loading, selected report, and empty states.

Use the redesign proposal to reorganize these areas, but preserve all existing handler calls:

- `handleSubmitAnalysis`
- `handleAskFollowUp`
- `handleReanalyze`
- `openMarkdownDrawer`
- `toggleHistorySelection`
- `deleteSelectedHistory`

- [ ] **Step 3: Keep mobile history drawer behavior**

Preserve this behavior from existing tests:

```tsx
const trigger = await screen.findByRole('button', { name: '历史记录' });
fireEvent.click(trigger);
expect(container.querySelector('.page-drawer-overlay')).toBeTruthy();
```

If the trigger label changes, update the test to the new accessible name, and keep the overlay behavior.

- [ ] **Step 4: Improve history and task density without changing APIs**

In `HistoryList.tsx`, `HistoryListItem.tsx`, and `TaskPanel.tsx`:

- Keep props unchanged.
- Use tighter row spacing.
- Make selected state visible through border/background tokens.
- Keep delete and selection controls keyboard accessible.

- [ ] **Step 5: Run HomePage tests**

Run:

```bash
cd apps/dsa-web
PATH="$PWD/node_modules/.bin:$PATH" vitest run src/pages/__tests__/HomePage.test.tsx
```

Expected: all HomePage tests pass.

- [ ] **Step 6: Commit Home workspace**

```bash
git add apps/dsa-web/src/pages/HomePage.tsx apps/dsa-web/src/components/history/HistoryList.tsx apps/dsa-web/src/components/history/HistoryListItem.tsx apps/dsa-web/src/components/tasks/TaskPanel.tsx apps/dsa-web/src/pages/__tests__/HomePage.test.tsx
git commit -m "Redesign home research workspace"
```

## Task 4: Improve Report Reading Hierarchy

**Files:**
- Modify: `apps/dsa-web/src/components/report/ReportSummary.tsx`
- Modify: `apps/dsa-web/src/components/report/ReportOverview.tsx`
- Modify: `apps/dsa-web/src/components/report/ReportStrategy.tsx`
- Modify: `apps/dsa-web/src/components/report/ReportNews.tsx`
- Modify: `apps/dsa-web/src/components/report/ReportDetails.tsx`
- Test: `apps/dsa-web/src/components/report/__tests__/ReportOverview.test.tsx`
- Test: `apps/dsa-web/src/components/report/__tests__/ReportDetails.test.tsx`
- Test: `apps/dsa-web/src/components/report/__tests__/ReportNews.test.tsx`

- [ ] **Step 1: Add conclusion-layer test coverage**

In `ReportOverview.test.tsx`, assert conclusion layer copy remains visible:

```tsx
expect(screen.getByText(/趋势维持强势|analysis summary/i)).toBeInTheDocument();
expect(screen.getByText(/买入|继续观察|operation/i)).toBeInTheDocument();
```

Use existing fixture names in the file. Keep the assertions semantic and avoid class names.

- [ ] **Step 2: Refactor ReportOverview into conclusion layer**

In `ReportOverview.tsx`, structure the section visually as:

- Stock identity and timestamp.
- Score / sentiment.
- Operation advice.
- Analysis summary.
- Risk or board signals when available.

Preserve props:

```tsx
interface ReportOverviewProps {
  meta: ReportMeta;
  summary: ReportSummaryType;
  details?: ReportDetailsType;
}
```

- [ ] **Step 3: Refactor evidence sections**

In `ReportStrategy.tsx`, `ReportNews.tsx`, and `ReportDetails.tsx`:

- Keep current data contracts.
- Use section headers that map to evidence layers.
- Avoid adding fake data.
- Keep empty states explicit when arrays are empty.

- [ ] **Step 4: Run report tests**

Run:

```bash
cd apps/dsa-web
PATH="$PWD/node_modules/.bin:$PATH" vitest run src/components/report/__tests__/ReportOverview.test.tsx src/components/report/__tests__/ReportDetails.test.tsx src/components/report/__tests__/ReportNews.test.tsx
```

Expected: report tests pass.

- [ ] **Step 5: Commit report hierarchy**

```bash
git add apps/dsa-web/src/components/report/ReportSummary.tsx apps/dsa-web/src/components/report/ReportOverview.tsx apps/dsa-web/src/components/report/ReportStrategy.tsx apps/dsa-web/src/components/report/ReportNews.tsx apps/dsa-web/src/components/report/ReportDetails.tsx apps/dsa-web/src/components/report/__tests__/ReportOverview.test.tsx apps/dsa-web/src/components/report/__tests__/ReportDetails.test.tsx apps/dsa-web/src/components/report/__tests__/ReportNews.test.tsx
git commit -m "Improve report reading hierarchy"
```

## Task 5: Rebuild Ask-AI Agent Page As Research Assistant

**Files:**
- Modify: `apps/dsa-web/src/pages/ChatPage.tsx`
- Test: `apps/dsa-web/src/pages/__tests__/ChatPage.test.tsx`

- [ ] **Step 1: Add semantic region tests**

In `ChatPage.test.tsx`, update the workspace test:

```tsx
expect(await screen.findByTestId('chat-workspace')).toBeInTheDocument();
expect(screen.getByRole('region', { name: '会话列表' })).toBeInTheDocument();
expect(screen.getByRole('region', { name: '研究上下文' })).toBeInTheDocument();
expect(screen.getByRole('region', { name: '问答内容' })).toBeInTheDocument();
expect(screen.getByRole('form', { name: '发送问题' })).toBeInTheDocument();
```

Keep existing behavioral tests for:

- session switching
- delete confirmation
- export
- follow-up context hydration
- streaming progress
- jump-to-bottom behavior

- [ ] **Step 2: Add semantic regions in ChatPage**

In `ChatPage.tsx`, structure the page with:

```tsx
<aside aria-label="会话列表">{sessionListContent}</aside>
<section aria-label="研究上下文">{researchContextContent}</section>
<main aria-label="问答内容">{conversationContent}</main>
<form aria-label="发送问题" onSubmit={handleComposerSubmit}>{composerContent}</form>
```

If keeping a single `<main>`, make `问答内容` the main region and use nested `section` for context.

- [ ] **Step 3: Convert skill selector into research strategy language**

Keep the skill IDs sent to the API unchanged. Only change user-facing presentation:

```tsx
const strategyLabel = skills.find((skill) => skill.id === selectedSkill)?.name || '通用分析';
```

Show skill descriptions as secondary text or a tooltip, not as the primary label.

- [ ] **Step 4: Reframe progress steps**

Keep `progressSteps` data flow unchanged. Present it as a collapsible research process. Preserve text content from the backend so no data is hidden.

- [ ] **Step 5: Run ChatPage tests**

Run:

```bash
cd apps/dsa-web
PATH="$PWD/node_modules/.bin:$PATH" vitest run src/pages/__tests__/ChatPage.test.tsx src/stores/__tests__/agentChatStore.test.ts
```

Expected: all ChatPage and store tests pass.

- [ ] **Step 6: Commit Ask-AI redesign**

```bash
git add apps/dsa-web/src/pages/ChatPage.tsx apps/dsa-web/src/pages/__tests__/ChatPage.test.tsx
git commit -m "Redesign ask AI research workspace"
```

## Task 6: Refine Settings Console

**Files:**
- Modify: `apps/dsa-web/src/pages/SettingsPage.tsx`
- Modify: `apps/dsa-web/src/components/settings/SettingsCategoryNav.tsx`
- Modify: `apps/dsa-web/src/components/settings/SettingsSectionCard.tsx`
- Modify: `apps/dsa-web/src/components/settings/SettingsField.tsx`
- Modify: `apps/dsa-web/src/components/settings/LLMChannelEditor.tsx`
- Test: `apps/dsa-web/src/pages/__tests__/SettingsPage.test.tsx`
- Test: `apps/dsa-web/src/components/settings/__tests__/LLMChannelEditor.test.tsx`
- Test: `apps/dsa-web/src/hooks/__tests__/useSystemConfig.test.tsx`

- [ ] **Step 1: Add settings console semantic tests**

In `SettingsPage.test.tsx`, keep the existing tests and add:

```tsx
expect(screen.getByRole('navigation', { name: /设置分类|系统设置分类/ })).toBeInTheDocument();
expect(screen.getByText('AI 模型接入')).toBeInTheDocument();
expect(screen.queryByText('模型服务商配置')).not.toBeInTheDocument();
expect(screen.queryByText('AI 模型分组')).not.toBeInTheDocument();
```

If `SettingsCategoryNav` does not expose a named navigation region, add `aria-label="设置分类"` to its `<nav>`.

- [ ] **Step 2: Improve category status display**

In `SettingsCategoryNav.tsx`, use existing props to show:

- total item count
- dirty count
- error count
- active category state

Do not add new backend fields. Derive counts from `itemsByCategory`, `dirtyKeys`, and `issueByKey` already available in the settings flow.

- [ ] **Step 3: Keep unified AI model entry**

In `SettingsPage.tsx`, preserve the current rule:

```tsx
{activeCategory === 'ai_model' ? (
  <SettingsSectionCard
    title="AI 模型接入"
    description="统一管理模型渠道、基础地址、API Key、主模型与备选模型。"
  >
    <LLMChannelEditor
      items={rawActiveItems}
      configVersion={configVersion}
      maskToken={maskToken}
      onSaved={async (updatedItems) => {
        await refreshAfterExternalSave(updatedItems.map((item) => item.key));
      }}
      disabled={isSaving || isLoading}
    />
  </SettingsSectionCard>
) : null}
```

Do not reintroduce these UI sections:

- `模型服务商配置`
- `AI 模型分组`
- `高级模型路由`

- [ ] **Step 4: Improve LLMChannelEditor as a connection-first card**

In `LLMChannelEditor.tsx`:

- Keep `LLM_CHANNELS`, `LLM_<NAME>_PROTOCOL`, `LLM_<NAME>_BASE_URL`, `LLM_<NAME>_API_KEY`, `LLM_<NAME>_MODELS`.
- Keep Gemini special case with no required Base URL.
- Keep `systemConfigApi.testLLMChannel`.
- Present test result as state feedback near the channel context, without changing API payloads.

- [ ] **Step 5: Run settings tests**

Run:

```bash
cd apps/dsa-web
PATH="$PWD/node_modules/.bin:$PATH" vitest run src/pages/__tests__/SettingsPage.test.tsx src/components/settings/__tests__/LLMChannelEditor.test.tsx src/hooks/__tests__/useSystemConfig.test.tsx
```

Expected: settings tests pass.

- [ ] **Step 6: Commit settings console**

```bash
git add apps/dsa-web/src/pages/SettingsPage.tsx apps/dsa-web/src/components/settings/SettingsCategoryNav.tsx apps/dsa-web/src/components/settings/SettingsSectionCard.tsx apps/dsa-web/src/components/settings/SettingsField.tsx apps/dsa-web/src/components/settings/LLMChannelEditor.tsx apps/dsa-web/src/pages/__tests__/SettingsPage.test.tsx apps/dsa-web/src/components/settings/__tests__/LLMChannelEditor.test.tsx apps/dsa-web/src/hooks/__tests__/useSystemConfig.test.tsx
git commit -m "Refine settings console experience"
```

## Task 7: Simplify Login Page

**Files:**
- Modify: `apps/dsa-web/src/pages/LoginPage.tsx`
- Test: `apps/dsa-web/src/pages/__tests__/LoginPage.test.tsx`

- [ ] **Step 1: Keep login behavior tests focused**

In `LoginPage.test.tsx`, assert:

```tsx
expect(screen.getByLabelText(/密码/)).toBeInTheDocument();
expect(screen.getByRole('button', { name: /登录/ })).toBeInTheDocument();
```

Keep existing failure and redirect tests.

- [ ] **Step 2: Simplify visual structure**

In `LoginPage.tsx`, keep:

- product mark
- password field
- login button
- loading state
- error alert

Remove or avoid marketing-style content. Do not add a landing-page hero.

- [ ] **Step 3: Run login tests**

Run:

```bash
cd apps/dsa-web
PATH="$PWD/node_modules/.bin:$PATH" vitest run src/pages/__tests__/LoginPage.test.tsx
```

Expected: login tests pass.

- [ ] **Step 4: Commit login page**

```bash
git add apps/dsa-web/src/pages/LoginPage.tsx apps/dsa-web/src/pages/__tests__/LoginPage.test.tsx
git commit -m "Simplify login experience"
```

## Task 8: Responsive And Accessibility Pass

**Files:**
- Modify: `apps/dsa-web/src/pages/HomePage.tsx`
- Modify: `apps/dsa-web/src/pages/ChatPage.tsx`
- Modify: `apps/dsa-web/src/pages/SettingsPage.tsx`
- Modify: `apps/dsa-web/src/components/common/Drawer.tsx`
- Modify: `apps/dsa-web/src/components/common/Tooltip.tsx`
- Tests: existing page tests and lint

- [ ] **Step 1: Audit accessible region names**

Run:

```bash
cd apps/dsa-web
PATH="$PWD/node_modules/.bin:$PATH" vitest run src/pages/__tests__/HomePage.test.tsx src/pages/__tests__/ChatPage.test.tsx src/pages/__tests__/SettingsPage.test.tsx
```

Expected: tests pass and accessible region assertions confirm the new layout names.

- [ ] **Step 2: Verify mobile drawers remain reachable**

For drawer triggers, ensure buttons have explicit accessible names:

```tsx
aria-label="历史记录"
aria-label="历史对话"
aria-label="打开导航菜单"
```

Keep `ConfirmDialog` for destructive actions.

- [ ] **Step 3: Run lint and build**

Run:

```bash
cd apps/dsa-web
npm run lint
npm run build
```

Expected:

- ESLint exits 0.
- TypeScript and Vite build succeeds.
- Vite may warn about chunk size; this is acceptable if the build exits 0.

- [ ] **Step 4: Commit responsive polish**

```bash
git add apps/dsa-web/src/pages/HomePage.tsx apps/dsa-web/src/pages/ChatPage.tsx apps/dsa-web/src/pages/SettingsPage.tsx apps/dsa-web/src/components/common/Drawer.tsx apps/dsa-web/src/components/common/Tooltip.tsx
git commit -m "Polish responsive WebUI interactions"
```

## Task 9: Final Regression Verification

**Files:**
- No planned source edits unless verification exposes a defect.

- [ ] **Step 1: Run frontend unit tests**

Run:

```bash
cd apps/dsa-web
PATH="$PWD/node_modules/.bin:$PATH" vitest run src/pages/__tests__/HomePage.test.tsx src/pages/__tests__/ChatPage.test.tsx src/pages/__tests__/SettingsPage.test.tsx src/pages/__tests__/LoginPage.test.tsx src/components/report/__tests__/ReportOverview.test.tsx src/components/settings/__tests__/LLMChannelEditor.test.tsx src/components/layout/__tests__/Shell.test.tsx src/components/layout/__tests__/SidebarNav.test.tsx
```

Expected: selected frontend tests pass.

- [ ] **Step 2: Run full frontend checks**

Run:

```bash
cd apps/dsa-web
npm run lint
npm run build
```

Expected: both commands exit 0.

- [ ] **Step 3: Run backend smoke tests that guard trimmed scope**

Run:

```bash
.venv/bin/python -m unittest tests.test_config_registry tests.test_system_config_service tests.test_system_config_api
.venv/bin/python -m pytest tests/test_trimmed_api_surface.py tests/test_config_validate_structured.py
```

Expected:

- Unittest suite exits 0.
- Pytest suite exits 0.

- [ ] **Step 4: Start WebUI for manual review**

Run:

```bash
.venv/bin/python webui.py
```

Expected:

- Web server starts and prints a localhost URL.
- Open the URL in the in-app browser.
- Review `/`, `/chat`, `/settings`, `/login` if auth is enabled.

- [ ] **Step 5: Commit final regression fixes**

Only if Step 1-4 required changes:

```bash
git add apps/dsa-web/src tests
git commit -m "Fix WebUI redesign regressions"
```

If no changes were required, do not create an empty commit.

## Final Acceptance Criteria

- The app still has only the intended top-level routes: `/`, `/chat`, `/settings`, `/login`.
- Home clearly supports stock input, task status, history, report reading, reanalysis, AI follow-up, and Markdown report access.
- Chat clearly supports session management, strategy selection, report-context follow-up, streaming progress, copy/export, and message composition.
- Settings keeps unified AI model access and does not show old provider sections.
- Login is simple and non-marketing.
- Deleted scope remains absent from UI: Bot notification, Electron, holdings, backtest, data quality panel.
- Desktop is efficient for research workflows.
- Mobile remains usable through drawers or responsive stacking.
- `npm run lint` passes.
- `npm run build` passes.
- Focused frontend tests pass.
- Trimmed backend/API guard tests pass.
