# Settings Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework Settings around the trimmed product baseline by removing Bot notification remnants, grouping settings into collapsible sections, and moving AI provider-specific configuration behind dropdown + drawer controls.

**Architecture:** Keep the existing `/settings` route, global save/reset flow, and system-config API. Remove removed notification channels from runtime/config schema first, then layer a front-end grouping helper and collapsible group component over the existing `SettingsField` renderer. AI provider setup uses the existing channel config API surface but is presented through a provider selector and drawer instead of flat legacy provider fields.

**Tech Stack:** FastAPI/Python config registry and notification service, React + TypeScript, Vitest, existing settings components and Tailwind utility classes.

---

### Task 1: Remove Bot Notification Runtime And Schema

**Files:**
- Modify: `src/config.py`
- Modify: `src/core/config_registry.py`
- Modify: `src/notification.py`
- Modify: `src/core/pipeline.py`
- Modify: `src/notification_sender/__init__.py`
- Delete: `src/notification_sender/telegram_sender.py`
- Delete: `src/notification_sender/discord_sender.py`
- Delete: `src/notification_sender/slack_sender.py`
- Modify: `tests/test_config_registry.py`
- Modify: `tests/test_config_validate_structured.py`
- Modify: `tests/test_notification.py`
- Modify: `tests/test_notification_sender.py`
- Modify: `tests/test_trimmed_api_surface.py`

- [ ] **Step 1: Add failing static assertions for removed notification fields**

Add a `unittest.TestCase` class to `tests/test_trimmed_api_surface.py`:

```python
import unittest


class TestTrimmedNotificationSurface(unittest.TestCase):
    def test_bot_notification_channels_are_removed_from_runtime_surface(self):
        forbidden = [
            "TELEGRAM_BOT_TOKEN",
            "TELEGRAM_CHAT_ID",
            "DISCORD_BOT_TOKEN",
            "DISCORD_MAIN_CHANNEL_ID",
            "DISCORD_WEBHOOK_URL",
            "SLACK_BOT_TOKEN",
            "SLACK_CHANNEL_ID",
            "SLACK_WEBHOOK_URL",
            "TelegramSender",
            "DiscordSender",
            "SlackSender",
            "send_to_telegram",
            "send_to_discord",
            "send_to_slack",
        ]
        paths = [
            "src/config.py",
            "src/core/config_registry.py",
            "src/notification.py",
            "src/notification_sender/__init__.py",
            "src/core/pipeline.py",
        ]
        for path in paths:
            text = Path(path).read_text(encoding="utf-8")
            for token in forbidden:
                self.assertNotIn(token, text, f"{token} still found in {path}")
```

- [ ] **Step 2: Run the focused static test and confirm failure**

Run:

```bash
python -m unittest tests.test_trimmed_api_surface
```

Expected: fail while the old notification tokens still exist.

- [ ] **Step 3: Remove config and schema fields**

In `src/config.py`, remove dataclass fields and `_load_from_env()` assignments for:

```python
telegram_bot_token
telegram_chat_id
telegram_message_thread_id
telegram_webhook_secret
discord_bot_token
discord_main_channel_id
discord_webhook_url
discord_max_words
slack_webhook_url
slack_bot_token
slack_channel_id
```

Also remove those channels from `has_notification`.

In `src/core/config_registry.py`, remove field definitions and provider inference prefixes for:

```python
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
TELEGRAM_MESSAGE_THREAD_ID
DISCORD_WEBHOOK_URL
DISCORD_BOT_TOKEN
DISCORD_MAIN_CHANNEL_ID
DISCORD_MAX_WORDS
SLACK_BOT_TOKEN
SLACK_CHANNEL_ID
SLACK_WEBHOOK_URL
```

- [ ] **Step 4: Remove notification senders and branches**

In `src/notification.py`, remove imports, mixins, enum values, detection branches, initialization calls, image-sending branches, and text-sending branches for Telegram, Discord, and Slack.

In `src/core/pipeline.py`, remove the branches that dispatch to Telegram, Discord, and Slack. Keep WeChat, Feishu, Email, Custom Webhook, PushPlus, ServerChan, Pushover, and AstrBot if still present.

In `src/notification_sender/__init__.py`, remove exports for deleted senders.

Delete:

```bash
src/notification_sender/telegram_sender.py
src/notification_sender/discord_sender.py
src/notification_sender/slack_sender.py
```

- [ ] **Step 5: Remove or update obsolete tests**

Delete tests that only validate removed senders. Update remaining notification tests to expect the reduced channel set.

If a test helper constructs config objects, remove the removed keyword arguments from those helpers.

- [ ] **Step 6: Verify Task 1**

Run:

```bash
python -m compileall -q src tests/test_trimmed_api_surface.py
python -m unittest tests.test_trimmed_api_surface
```

Expected: both pass.

- [ ] **Step 7: Commit Task 1**

```bash
git add src tests
git commit -m "Remove bot notification channels"
```

### Task 2: Clean Docs And Environment Examples For Removed Notification Channels

**Files:**
- Modify: `.env.example`
- Modify: `README.md`
- Modify: `docs/README_EN.md`
- Modify: `docs/README_CHT.md`
- Modify: `docs/full-guide.md`
- Modify: `docs/full-guide_EN.md`
- Modify: `docs/FAQ.md`
- Modify: `docs/FAQ_EN.md`
- Modify: `docs/INDEX_EN.md`
- Modify: `docs/superpowers/specs/2026-04-26-settings-architecture-design.md`

- [ ] **Step 1: Add static documentation scan**

Add this method to `TestTrimmedNotificationSurface` in `tests/test_trimmed_api_surface.py`:

```python
    def test_removed_bot_notification_docs_are_cleaned(self):
        forbidden = [
            "TELEGRAM_BOT_TOKEN",
            "TELEGRAM_CHAT_ID",
            "DISCORD_BOT_TOKEN",
            "DISCORD_MAIN_CHANNEL_ID",
            "SLACK_BOT_TOKEN",
            "SLACK_CHANNEL_ID",
        ]
        docs = [
            ".env.example",
            "README.md",
            "docs/README_EN.md",
            "docs/README_CHT.md",
            "docs/full-guide.md",
            "docs/full-guide_EN.md",
            "docs/FAQ.md",
            "docs/FAQ_EN.md",
        ]
        for path in docs:
            text = Path(path).read_text(encoding="utf-8")
            for token in forbidden:
                self.assertNotIn(token, text, f"{token} still found in {path}")
```

- [ ] **Step 2: Run the documentation scan and confirm failure**

Run:

```bash
python -m unittest tests.test_trimmed_api_surface
```

Expected: fail until docs/env examples are cleaned.

- [ ] **Step 3: Remove obsolete docs and examples**

Remove dedicated Telegram, Discord, and Slack setup sections. Keep generic `CUSTOM_WEBHOOK_URLS` as one-way HTTP delivery, but do not list removed dedicated channels as first-class product features.

Update channel summaries to say the trimmed baseline supports:

```text
企业微信 / 飞书 / 邮件 / PushPlus / Server酱 / Pushover / 自定义 Webhook
```

- [ ] **Step 4: Verify Task 2**

Run:

```bash
python -m unittest tests.test_trimmed_api_surface
```

Expected: pass.

- [ ] **Step 5: Commit Task 2**

```bash
git add .env.example README.md docs tests/test_trimmed_api_surface.py
git commit -m "Clean removed notification channel docs"
```

### Task 3: Add Settings Grouping Model And Tests

**Files:**
- Create: `apps/dsa-web/src/components/settings/settingsGroups.ts`
- Create: `apps/dsa-web/src/components/settings/__tests__/settingsGroups.test.ts`
- Modify: `apps/dsa-web/src/components/settings/index.ts`

- [ ] **Step 1: Write grouping tests**

Create `apps/dsa-web/src/components/settings/__tests__/settingsGroups.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getSettingsGroups } from '../settingsGroups';
import type { SystemConfigItem } from '../../../types/systemConfig';

function item(key: string, category = 'base'): SystemConfigItem {
  return {
    key,
    value: '',
    rawValueExists: false,
    isMasked: false,
    schema: {
      key,
      category: category as never,
      dataType: 'string',
      uiControl: 'text',
      isSensitive: false,
      isRequired: false,
      isEditable: true,
      options: [],
      validation: {},
      displayOrder: 1,
    },
  };
}

describe('getSettingsGroups', () => {
  it('groups base settings into watchlist and report output', () => {
    const groups = getSettingsGroups('base', [
      item('STOCK_LIST', 'base'),
      item('REPORT_TYPE', 'base'),
    ]);

    expect(groups.map((group) => group.id)).toEqual(['watchlist', 'report_output']);
    expect(groups[0].items.map((entry) => entry.key)).toEqual(['STOCK_LIST']);
  });

  it('places unmapped fields in other group', () => {
    const groups = getSettingsGroups('system', [item('UNMAPPED_KEY', 'system')]);

    expect(groups).toHaveLength(1);
    expect(groups[0].id).toBe('other');
    expect(groups[0].items[0].key).toBe('UNMAPPED_KEY');
  });
});
```

- [ ] **Step 2: Run tests and confirm failure**

Run:

```bash
cd apps/dsa-web
PATH="$PWD/node_modules/.bin:$PATH" vitest run src/components/settings/__tests__/settingsGroups.test.ts
```

Expected: fail because `settingsGroups.ts` does not exist.

- [ ] **Step 3: Implement grouping helper**

Create `apps/dsa-web/src/components/settings/settingsGroups.ts` with:

```ts
import type { SystemConfigItem } from '../../types/systemConfig';

export interface SettingsGroup {
  id: string;
  title: string;
  description: string;
  defaultOpen?: boolean;
  advanced?: boolean;
  items: SystemConfigItem[];
}

interface GroupDefinition {
  id: string;
  title: string;
  description: string;
  defaultOpen?: boolean;
  advanced?: boolean;
  keys?: string[];
  prefixes?: string[];
}

const GROUPS: Record<string, GroupDefinition[]> = {
  base: [
    { id: 'watchlist', title: '自选股', description: '维护分析范围和股票导入。', defaultOpen: true, keys: ['STOCK_LIST'] },
    { id: 'report_output', title: '报告输出', description: '控制报告语言、类型和渲染策略。', keys: ['REPORT_TYPE', 'REPORT_LANGUAGE', 'REPORT_SUMMARY_ONLY', 'REPORT_TEMPLATES_DIR', 'REPORT_RENDERER_ENABLED', 'REPORT_INTEGRITY_ENABLED', 'REPORT_INTEGRITY_RETRY', 'REPORT_HISTORY_COMPARE_N'] },
    { id: 'market_review', title: '大盘复盘', description: '控制大盘复盘范围和运行开关。', keys: ['MARKET_REVIEW_ENABLED', 'MARKET_REVIEW_REGION'] },
  ],
  ai_model: [
    { id: 'model_channels', title: '模型渠道', description: '通过服务商选择和抽屉配置模型接入。', defaultOpen: true, keys: ['LLM_CHANNELS'] },
    { id: 'active_runtime', title: '运行模型', description: '选择主模型、Agent 模型、fallback 和温度。', keys: ['LITELLM_MODEL', 'AGENT_LITELLM_MODEL', 'LITELLM_FALLBACK_MODELS', 'LLM_TEMPERATURE'] },
    { id: 'advanced_routing', title: '高级路由', description: 'LiteLLM YAML 等专家配置。', advanced: true, keys: ['LITELLM_CONFIG'] },
  ],
  data_source: [
    { id: 'market_credentials', title: '行情凭证', description: '配置行情和增强数据源凭证。', defaultOpen: true, keys: ['TUSHARE_TOKEN', 'TICKFLOW_API_KEY'], prefixes: ['LONGBRIDGE_'] },
    { id: 'realtime_policy', title: '实时行情策略', description: '控制实时源优先级和实时指标。', defaultOpen: true, keys: ['REALTIME_SOURCE_PRIORITY', 'PREFETCH_REALTIME_QUOTES', 'ENABLE_REALTIME_QUOTE', 'ENABLE_REALTIME_TECHNICAL_INDICATORS'] },
    { id: 'search_intel', title: '搜索与情报源', description: '配置新闻搜索和情报检索 API。', prefixes: ['TAVILY_', 'ANSPIRE_', 'MINIMAX_', 'BOCHA_', 'BRAVE_', 'SERPAPI_', 'SEARXNG_'] },
    { id: 'data_enhancement', title: '数据增强', description: '筹码、行业、市场广度等增强数据。', advanced: true, keys: ['ENABLE_CHIP_DISTRIBUTION'] },
  ],
  notification: [
    { id: 'primary_channels', title: '主要通知', description: '企业微信、飞书和邮件等一向通知。', defaultOpen: true, prefixes: ['WECHAT_', 'FEISHU_', 'EMAIL_'] },
    { id: 'custom_webhook', title: '自定义 Webhook', description: '任意 POST JSON 的一向通知。', keys: ['CUSTOM_WEBHOOK_URLS', 'CUSTOM_WEBHOOK_BEARER_TOKEN', 'WEBHOOK_VERIFY_SSL'] },
    { id: 'domestic_push', title: '国内推送', description: 'PushPlus、Server酱和 Pushover。', prefixes: ['PUSHPLUS_', 'SERVERCHAN3_', 'PUSHOVER_'] },
    { id: 'rendering_limits', title: '渲染与长度限制', description: '消息分段和 Markdown 转图片。', advanced: true, prefixes: ['MARKDOWN_TO_IMAGE_', 'MD2IMG_'], keys: ['FEISHU_MAX_BYTES', 'WECHAT_MAX_BYTES'] },
  ],
  system: [
    { id: 'schedule_runtime', title: '调度与运行', description: '定时、并发、日志和运行控制。', defaultOpen: true, prefixes: ['SCHEDULE_', 'LOG_'], keys: ['MAX_WORKERS', 'DEBUG'] },
    { id: 'persistence', title: '数据持久化', description: '数据库路径和 SQLite 写入策略。', keys: ['DATABASE_PATH'], prefixes: ['SQLITE_'] },
  ],
  agent: [
    { id: 'agent_runtime', title: 'Agent 运行', description: 'Agent 开关、步数、超时和缓存。', defaultOpen: true, prefixes: ['AGENT_'] },
  ],
};

function matches(definition: GroupDefinition, key: string): boolean {
  return Boolean(
    definition.keys?.includes(key)
    || definition.prefixes?.some((prefix) => key.startsWith(prefix)),
  );
}

export function getSettingsGroups(category: string, items: SystemConfigItem[]): SettingsGroup[] {
  const definitions = GROUPS[category] ?? [];
  const used = new Set<string>();
  const groups: SettingsGroup[] = [];

  for (const definition of definitions) {
    const matched = items.filter((entry) => matches(definition, entry.key));
    if (!matched.length) {
      continue;
    }
    matched.forEach((entry) => used.add(entry.key));
    groups.push({ ...definition, items: matched });
  }

  const other = items.filter((entry) => !used.has(entry.key));
  if (other.length) {
    groups.push({
      id: 'other',
      title: '其他配置',
      description: '尚未归入明确分组的配置项。',
      advanced: true,
      items: other,
    });
  }

  return groups;
}
```

- [ ] **Step 4: Export helper**

Add to `apps/dsa-web/src/components/settings/index.ts`:

```ts
export * from './settingsGroups';
```

- [ ] **Step 5: Verify Task 3**

Run:

```bash
cd apps/dsa-web
PATH="$PWD/node_modules/.bin:$PATH" vitest run src/components/settings/__tests__/settingsGroups.test.ts
```

Expected: pass.

- [ ] **Step 6: Commit Task 3**

```bash
git add apps/dsa-web/src/components/settings/settingsGroups.ts apps/dsa-web/src/components/settings/__tests__/settingsGroups.test.ts apps/dsa-web/src/components/settings/index.ts
git commit -m "Add settings grouping model"
```

### Task 4: Add Collapsible Settings Group UI

**Files:**
- Create: `apps/dsa-web/src/components/settings/SettingsGroupSection.tsx`
- Create: `apps/dsa-web/src/components/settings/__tests__/SettingsGroupSection.test.tsx`
- Modify: `apps/dsa-web/src/components/settings/index.ts`

- [ ] **Step 1: Write component tests**

Create `apps/dsa-web/src/components/settings/__tests__/SettingsGroupSection.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { SettingsGroupSection } from '../SettingsGroupSection';

describe('SettingsGroupSection', () => {
  it('renders open content by default', () => {
    render(
      <SettingsGroupSection title="运行模型" description="主模型与 fallback" itemCount={2} defaultOpen>
        <div>字段内容</div>
      </SettingsGroupSection>,
    );

    expect(screen.getByText('运行模型')).toBeVisible();
    expect(screen.getByText('字段内容')).toBeVisible();
  });

  it('opens when toggled', async () => {
    const user = userEvent.setup();
    render(
      <SettingsGroupSection title="高级路由" description="专家配置" itemCount={1}>
        <div>YAML 配置</div>
      </SettingsGroupSection>,
    );

    expect(screen.queryByText('YAML 配置')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /高级路由/ }));
    expect(screen.getByText('YAML 配置')).toBeVisible();
  });
});
```

- [ ] **Step 2: Run tests and confirm failure**

Run:

```bash
cd apps/dsa-web
PATH="$PWD/node_modules/.bin:$PATH" vitest run src/components/settings/__tests__/SettingsGroupSection.test.tsx
```

Expected: fail because the component does not exist.

- [ ] **Step 3: Implement component**

Create `apps/dsa-web/src/components/settings/SettingsGroupSection.tsx`:

```tsx
import type React from 'react';
import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '../common';
import { cn } from '../../utils/cn';

interface SettingsGroupSectionProps {
  title: string;
  description: string;
  itemCount: number;
  defaultOpen?: boolean;
  advanced?: boolean;
  dirtyCount?: number;
  issueCount?: number;
  children: React.ReactNode;
}

export const SettingsGroupSection: React.FC<SettingsGroupSectionProps> = ({
  title,
  description,
  itemCount,
  defaultOpen = false,
  advanced = false,
  dirtyCount = 0,
  issueCount = 0,
  children,
}) => {
  const shouldForceOpen = dirtyCount > 0 || issueCount > 0;
  const [open, setOpen] = useState(defaultOpen || shouldForceOpen);

  useEffect(() => {
    if (shouldForceOpen) {
      setOpen(true);
    }
  }, [shouldForceOpen]);

  return (
    <div className="rounded-2xl border settings-border bg-background/35">
      <button
        type="button"
        className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span className="flex min-w-0 gap-3">
          <span className="mt-0.5 text-muted-text">
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-foreground">{title}</span>
            <span className="mt-1 block text-xs leading-5 text-muted-text">{description}</span>
          </span>
        </span>
        <span className="flex shrink-0 flex-wrap justify-end gap-1.5">
          {advanced ? <Badge size="sm" variant="default">高级</Badge> : null}
          {dirtyCount ? <Badge size="sm" variant="warning">已改 {dirtyCount}</Badge> : null}
          {issueCount ? <Badge size="sm" variant="danger">问题 {issueCount}</Badge> : null}
          <Badge size="sm" variant="default" className={cn('border-[var(--settings-border)] bg-[var(--settings-surface-hover)] text-muted-text')}>
            {itemCount}
          </Badge>
        </span>
      </button>
      {open ? <div className="space-y-4 border-t settings-border px-4 py-4">{children}</div> : null}
    </div>
  );
};
```

- [ ] **Step 4: Export component**

Add to `apps/dsa-web/src/components/settings/index.ts`:

```ts
export * from './SettingsGroupSection';
```

- [ ] **Step 5: Verify Task 4**

Run:

```bash
cd apps/dsa-web
PATH="$PWD/node_modules/.bin:$PATH" vitest run src/components/settings/__tests__/SettingsGroupSection.test.tsx
```

Expected: pass.

- [ ] **Step 6: Commit Task 4**

```bash
git add apps/dsa-web/src/components/settings/SettingsGroupSection.tsx apps/dsa-web/src/components/settings/__tests__/SettingsGroupSection.test.tsx apps/dsa-web/src/components/settings/index.ts
git commit -m "Add collapsible settings groups"
```

### Task 5: Replace Flat Settings Rendering With Groups

**Files:**
- Modify: `apps/dsa-web/src/pages/SettingsPage.tsx`
- Modify: `apps/dsa-web/src/pages/__tests__/SettingsPage.test.tsx`

- [ ] **Step 1: Update SettingsPage test expectations**

In `apps/dsa-web/src/pages/__tests__/SettingsPage.test.tsx`, add an assertion that grouped section titles render, using mocked components if present:

```tsx
expect(screen.getByText('当前分类配置项')).toBeInTheDocument();
expect(screen.getByText(/自选股|运行模型|Agent 运行/)).toBeInTheDocument();
```

- [ ] **Step 2: Run SettingsPage tests and confirm failure**

Run:

```bash
cd apps/dsa-web
PATH="$PWD/node_modules/.bin:$PATH" vitest run src/pages/__tests__/SettingsPage.test.tsx
```

Expected: fail until grouped rendering exists.

- [ ] **Step 3: Implement grouped rendering**

In `SettingsPage.tsx`, import:

```ts
import { getSettingsGroups, SettingsGroupSection } from '../components/settings';
```

Compute dirty keys:

```ts
const dirtyKeySet = new Set(
  rawActiveItems
    .filter((item) => String(item.value ?? '') !== rawActiveItemMap.get(item.key))
    .map((item) => item.key),
);
```

Then replace the flat `activeItems.map(...)` block inside "当前分类配置项" with:

```tsx
{getSettingsGroups(activeCategory, activeItems).map((group) => {
  const groupIssueCount = group.items.reduce(
    (count, item) => count + (issueByKey[item.key]?.length ?? 0),
    0,
  );
  const groupDirtyCount = group.items.filter((item) => dirtyKeySet.has(item.key)).length;

  return (
    <SettingsGroupSection
      key={group.id}
      title={group.title}
      description={group.description}
      itemCount={group.items.length}
      defaultOpen={group.defaultOpen}
      advanced={group.advanced}
      dirtyCount={groupDirtyCount}
      issueCount={groupIssueCount}
    >
      {group.items.map((item) => (
        <SettingsField
          key={item.key}
          item={item}
          value={item.value}
          disabled={isSaving}
          onChange={setDraftValue}
          issues={issueByKey[item.key] || []}
        />
      ))}
    </SettingsGroupSection>
  );
})}
```

If the existing dirty comparison needs access to server values, expose `dirtyKeys` from `useSystemConfig()` instead of recomputing incorrectly.

- [ ] **Step 4: Verify Task 5**

Run:

```bash
cd apps/dsa-web
PATH="$PWD/node_modules/.bin:$PATH" vitest run src/pages/__tests__/SettingsPage.test.tsx src/components/settings/__tests__/settingsGroups.test.ts src/components/settings/__tests__/SettingsGroupSection.test.tsx
```

Expected: pass.

- [ ] **Step 5: Commit Task 5**

```bash
git add apps/dsa-web/src/pages/SettingsPage.tsx apps/dsa-web/src/pages/__tests__/SettingsPage.test.tsx
git commit -m "Group settings fields by category"
```

### Task 6: Add AI Provider Selector And Drawer

**Files:**
- Create: `apps/dsa-web/src/components/settings/AIProviderSettings.tsx`
- Create: `apps/dsa-web/src/components/settings/__tests__/AIProviderSettings.test.tsx`
- Modify: `apps/dsa-web/src/components/settings/LLMChannelEditor.tsx`
- Modify: `apps/dsa-web/src/components/settings/index.ts`
- Modify: `apps/dsa-web/src/pages/SettingsPage.tsx`

- [ ] **Step 1: Write AI provider UI test**

Create `apps/dsa-web/src/components/settings/__tests__/AIProviderSettings.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AIProviderSettings } from '../AIProviderSettings';

vi.mock('../LLMChannelEditor', () => ({
  LLMChannelEditor: () => <div>模型渠道编辑器</div>,
}));

describe('AIProviderSettings', () => {
  it('opens provider drawer from dropdown selection', async () => {
    const user = userEvent.setup();
    render(
      <AIProviderSettings
        items={[]}
        configVersion="v1"
        maskToken="******"
        onSaved={vi.fn()}
        disabled={false}
      />,
    );

    await user.selectOptions(screen.getByLabelText('模型服务商'), 'openai_compatible');
    await user.click(screen.getByRole('button', { name: '配置服务商' }));

    expect(screen.getByRole('dialog', { name: /配置模型服务商/ })).toBeVisible();
    expect(screen.getByText('模型渠道编辑器')).toBeVisible();
  });
});
```

- [ ] **Step 2: Run test and confirm failure**

Run:

```bash
cd apps/dsa-web
PATH="$PWD/node_modules/.bin:$PATH" vitest run src/components/settings/__tests__/AIProviderSettings.test.tsx
```

Expected: fail because `AIProviderSettings` does not exist.

- [ ] **Step 3: Implement AIProviderSettings**

Create `apps/dsa-web/src/components/settings/AIProviderSettings.tsx`:

```tsx
import type React from 'react';
import { useState } from 'react';
import { Button, Drawer } from '../common';
import type { SystemConfigItem, SystemConfigUpdateItem } from '../../types/systemConfig';
import { LLMChannelEditor } from './LLMChannelEditor';

interface AIProviderSettingsProps {
  items: SystemConfigItem[];
  configVersion: string;
  maskToken: string;
  onSaved: (updatedItems: SystemConfigUpdateItem[]) => Promise<void>;
  disabled?: boolean;
}

const providerOptions = [
  { value: 'openai_compatible', label: 'OpenAI 兼容服务' },
  { value: 'deepseek', label: 'DeepSeek 官方' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'custom', label: '自定义 LiteLLM 渠道' },
];

export const AIProviderSettings: React.FC<AIProviderSettingsProps> = ({
  items,
  configVersion,
  maskToken,
  onSaved,
  disabled = false,
}) => {
  const [provider, setProvider] = useState(providerOptions[0].value);
  const [open, setOpen] = useState(false);
  const selected = providerOptions.find((entry) => entry.value === provider) ?? providerOptions[0];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <label className="space-y-2">
          <span className="text-xs font-semibold text-secondary-text">模型服务商</span>
          <select
            className="h-10 w-full rounded-xl border settings-border bg-background/70 px-3 text-sm text-foreground"
            value={provider}
            onChange={(event) => setProvider(event.target.value)}
            disabled={disabled}
            aria-label="模型服务商"
          >
            {providerOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <Button
          type="button"
          variant="settings-primary"
          disabled={disabled}
          onClick={() => setOpen(true)}
        >
          配置服务商
        </Button>
      </div>
      <p className="text-xs leading-6 text-muted-text">
        当前选择：{selected.label}。具体 API Key、Base URL、模型列表和启用状态在抽屉中维护。
      </p>

      <Drawer
        isOpen={open}
        onClose={() => setOpen(false)}
        title={`配置模型服务商：${selected.label}`}
        side="right"
        width="max-w-4xl"
      >
        <LLMChannelEditor
          items={items}
          configVersion={configVersion}
          maskToken={maskToken}
          onSaved={onSaved}
          disabled={disabled}
        />
      </Drawer>
    </div>
  );
};
```

- [ ] **Step 4: Replace AI model card usage**

In `SettingsPage.tsx`, replace direct `LLMChannelEditor` rendering with:

```tsx
<AIProviderSettings
  items={rawActiveItems}
  configVersion={configVersion}
  maskToken={maskToken}
  onSaved={async (updatedItems) => {
    await refreshAfterExternalSave(updatedItems.map((item) => item.key));
  }}
  disabled={isSaving || isLoading}
/>
```

Export `AIProviderSettings` from `apps/dsa-web/src/components/settings/index.ts`.

- [ ] **Step 5: Verify Task 6**

Run:

```bash
cd apps/dsa-web
PATH="$PWD/node_modules/.bin:$PATH" vitest run src/components/settings/__tests__/AIProviderSettings.test.tsx src/pages/__tests__/SettingsPage.test.tsx
```

Expected: pass.

- [ ] **Step 6: Commit Task 6**

```bash
git add apps/dsa-web/src/components/settings/AIProviderSettings.tsx apps/dsa-web/src/components/settings/__tests__/AIProviderSettings.test.tsx apps/dsa-web/src/components/settings/index.ts apps/dsa-web/src/pages/SettingsPage.tsx
git commit -m "Add AI provider drawer settings"
```

### Task 7: Hide Legacy AI Provider Fields From Generic Settings

**Files:**
- Modify: `apps/dsa-web/src/pages/SettingsPage.tsx`
- Modify: `src/core/config_registry.py`
- Modify: `tests/test_trimmed_api_surface.py`
- Modify: `apps/dsa-web/src/pages/__tests__/SettingsPage.test.tsx`

- [ ] **Step 1: Add static assertion for legacy flat fields**

Add this method to `TestTrimmedNotificationSurface` in `tests/test_trimmed_api_surface.py`:

```python
    def test_legacy_ai_provider_keys_are_not_first_class_settings(self):
        registry = Path("src/core/config_registry.py").read_text(encoding="utf-8")
        forbidden_visible_keys = [
            '"DEEPSEEK_API_KEY"',
            '"DEEPSEEK_API_KEYS"',
            '"GEMINI_API_KEY"',
            '"GEMINI_API_KEYS"',
            '"ANTHROPIC_API_KEY"',
            '"ANTHROPIC_API_KEYS"',
            '"OPENAI_API_KEY"',
            '"OPENAI_API_KEYS"',
            '"OPENAI_BASE_URL"',
            '"OPENAI_MODEL"',
        ]
        for token in forbidden_visible_keys:
            self.assertNotIn(
                token,
                registry,
                f"{token} still exposed as first-class registry field",
            )
```

- [ ] **Step 2: Run test and confirm failure**

Run:

```bash
python -m unittest tests.test_trimmed_api_surface
```

Expected: fail until legacy registry definitions are removed or migrated.

- [ ] **Step 3: Remove first-class registry definitions**

In `src/core/config_registry.py`, remove old provider-specific field definitions for OpenAI, DeepSeek, Gemini, Anthropic, and AIHubmix. Keep channel-backed fields and `LITELLM_CONFIG`, `LITELLM_MODEL`, `AGENT_LITELLM_MODEL`, `LITELLM_FALLBACK_MODELS`, `LLM_TEMPERATURE`.

- [ ] **Step 4: Keep runtime fallback but not UI exposure if needed**

If `src/config.py` still reads old environment keys for backward compatibility, leave that runtime behavior for now, but do not expose those keys in Settings schema. Add a code comment near the runtime parser:

```python
# Legacy env keys remain runtime-only. New UI configuration should use LLM channel settings.
```

- [ ] **Step 5: Verify Task 7**

Run:

```bash
python -m unittest tests.test_trimmed_api_surface
python -m compileall -q src/core/config_registry.py src/config.py
```

Expected: pass.

- [ ] **Step 6: Commit Task 7**

```bash
git add src/core/config_registry.py src/config.py tests/test_trimmed_api_surface.py apps/dsa-web/src/pages/SettingsPage.tsx apps/dsa-web/src/pages/__tests__/SettingsPage.test.tsx
git commit -m "Hide legacy AI provider settings"
```

### Task 8: Final Verification

**Files:**
- Verify all modified files.

- [ ] **Step 1: Run Python compile**

```bash
python -m compileall -q main.py analyzer_service.py server.py api src data_provider tests/test_trimmed_api_surface.py tests/test_system_config_service.py tests/test_system_config_api.py tests/test_config_registry.py tests/test_config_validate_structured.py
```

Expected: exit code 0.

- [ ] **Step 2: Run static trimmed surface checks**

```bash
python -m unittest tests.test_trimmed_api_surface
```

Expected: pass.

- [ ] **Step 3: Run frontend tests**

```bash
cd apps/dsa-web
PATH="$PWD/node_modules/.bin:$PATH" vitest run \
  src/components/settings/__tests__/settingsGroups.test.ts \
  src/components/settings/__tests__/SettingsGroupSection.test.tsx \
  src/components/settings/__tests__/AIProviderSettings.test.tsx \
  src/pages/__tests__/SettingsPage.test.tsx \
  src/components/settings/__tests__/AuthSettingsCard.test.tsx \
  src/stores/__tests__/agentChatStore.test.ts
```

Expected: all listed tests pass.

- [ ] **Step 4: Run frontend lint and build**

```bash
cd apps/dsa-web
npm run lint
npm run build
```

Expected: exit code 0. Vite chunk-size warnings are acceptable.

- [ ] **Step 5: Run residue scan**

```bash
rg -n "TELEGRAM_BOT_TOKEN|DISCORD_BOT_TOKEN|SLACK_BOT_TOKEN|TelegramSender|DiscordSender|SlackSender|bot-command|desktop-package|/backtest|/portfolio" . \
  --glob '!docs/CHANGELOG.md' \
  --glob '!docs/superpowers/**' \
  --glob '!node_modules/**' \
  --glob '!static/**'
```

Expected: no matches except tests explicitly asserting absence.

- [ ] **Step 6: Final commit**

If any final verification-only edits were needed:

```bash
git add -A
git commit -m "Verify settings architecture cleanup"
```

If no edits are pending, skip this commit.
