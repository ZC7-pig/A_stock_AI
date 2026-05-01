# V4 Frontend Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the real React frontend around the approved v4 homepage design language.

**Architecture:** Keep the existing React/Vite/Tailwind structure and data hooks. Introduce a v4 visual foundation in global CSS, then restyle Shell, Home, report modules, Chat, Settings, Login, and common surfaces without changing backend contracts.

**Tech Stack:** React, TypeScript, Vite, Tailwind utility classes, existing component library, Vitest.

---

## Context Compression

- Approved visual reference: `docs/design/homepage-focused-workbench-prototype-v4.html`.
- Global navigation: left vertical rail only has Home, Ask Agent, Settings; no History route. History remains inside Home.
- Top bar: keep product title/status/search style from v4. Search aligns with the report column and should be visible but not heavy.
- Home layout: left column for current tasks and history; center for report canvas; right-side auxiliary column removed.
- Report area: all center content is one report. Use a unified report canvas, light internal cards, and minimal hard borders to avoid nested-line density.
- Report actions: `完整报告` and `展开追问` both open right-side drawers.
- Report tabs/slider: keep `摘要 / 策略点位 / 资讯动态 / 数据追溯`; lower-priority report content belongs in later horizontal pages.
- Current ask/follow-up can remain placeholder if the real Agent follow-up path is not implemented yet.
- Theme system: deep graphite rail + teal research accent; red/green only for A-share price/risk/opportunity semantics.

## Files

- Modify: `apps/dsa-web/src/index.css` for v4 tokens and reusable classes.
- Modify: `apps/dsa-web/src/components/layout/Shell.tsx`.
- Modify: `apps/dsa-web/src/components/layout/SidebarNav.tsx`.
- Modify: `apps/dsa-web/src/pages/HomePage.tsx`.
- Modify: `apps/dsa-web/src/components/tasks/TaskPanel.tsx`.
- Modify: `apps/dsa-web/src/components/history/HistoryList.tsx`.
- Modify: `apps/dsa-web/src/components/history/HistoryListItem.tsx`.
- Modify: `apps/dsa-web/src/components/report/ReportSummary.tsx`.
- Modify: `apps/dsa-web/src/components/report/ReportOverview.tsx`.
- Modify: `apps/dsa-web/src/components/report/ReportStrategy.tsx`.
- Modify: `apps/dsa-web/src/components/report/ReportNews.tsx`.
- Modify: `apps/dsa-web/src/components/report/ReportDetails.tsx`.
- Modify: `apps/dsa-web/src/pages/ChatPage.tsx`.
- Modify: `apps/dsa-web/src/pages/SettingsPage.tsx`.
- Modify: `apps/dsa-web/src/pages/LoginPage.tsx`.
- Test: existing page/component tests under `apps/dsa-web/src/**/__tests__`.

## Tasks

### Task 1: V4 Visual Foundation

- [ ] Add v4 CSS variables and reusable classes to `apps/dsa-web/src/index.css`: rail, topbar, report canvas, soft cards, horizontal report tabs, right drawer surfaces.
- [ ] Keep existing class names where possible to reduce test churn.
- [ ] Run `npm test -- Button.test.tsx SidebarNav.test.tsx Shell.test.tsx`.

### Task 2: Shell And Navigation

- [ ] Restyle `Shell.tsx` to match v4: dark compact rail, content grid, mobile drawer preserved.
- [ ] Restyle `SidebarNav.tsx`: only Home, Ask Agent, Settings as primary items; theme/logout stay bottom.
- [ ] Run `npm test -- Shell.test.tsx SidebarNav.test.tsx`.

### Task 3: Home Layout

- [ ] Rework `HomePage.tsx` into v4 structure: top search aligned to report column, left task/history, center report canvas.
- [ ] Remove right auxiliary panels from the real home layout.
- [ ] Keep mobile history drawer behavior.
- [ ] Run `npm test -- HomePage.test.tsx TaskPanel.test.tsx HistoryList.test.tsx`.

### Task 4: Report Modules

- [ ] Restyle `ReportSummary.tsx` as one report canvas with compact top overview, metric cards, and horizontal tab sections.
- [ ] Restyle `ReportOverview.tsx`, `ReportStrategy.tsx`, `ReportNews.tsx`, `ReportDetails.tsx` to share the same soft-card language.
- [ ] Keep `ReportMarkdown` as the right-side full report drawer.
- [ ] Add or reuse a right-side ask placeholder drawer from Home report actions.
- [ ] Run `npm test -- ReportOverview.test.tsx ReportNews.test.tsx ReportDetails.test.tsx ReportMarkdown.test.tsx`.

### Task 5: Chat, Settings, Login

- [ ] Apply the same graphite/teal surface language to `ChatPage.tsx` while preserving chat store behavior.
- [ ] Apply v4 settings surfaces to `SettingsPage.tsx`, keeping drawer-based config and data-source connection tests.
- [ ] Restyle `LoginPage.tsx` as a minimal trusted access screen.
- [ ] Run `npm test -- ChatPage.test.tsx SettingsPage.test.tsx LoginPage.test.tsx`.

### Task 6: Verification

- [ ] Run frontend targeted tests.
- [ ] Run `npm run build`.
- [ ] If a dev server is running, verify the pages manually in browser.
- [ ] Commit design prototypes and implementation changes separately if practical.
