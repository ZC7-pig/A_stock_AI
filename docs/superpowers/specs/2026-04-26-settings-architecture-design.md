# Settings Architecture Design

Date: 2026-04-26

## Context

`A_stock_AI` has been trimmed to focus on the core analysis chain, multi-source data, Web workspace, and Agent Q&A. The Settings page still reflects the old broad product shape in two ways:

- Some configuration fields and labels still carry legacy concepts from removed features or old interaction modes.
- The page uses a flat category layout: left-side top-level category navigation, then all fields in the selected category rendered as one long list.

This design defines the next step: improve Settings as a configuration workspace before adding new analysis features.

## Decision

Use the incremental layout option A:

- Keep the current page route, save flow, auth cards, and category navigation.
- Clean residual or misleading configuration fields first.
- Add second-level collapsible groups inside each category.
- Keep advanced or compatibility fields available, but place them behind explicit advanced groups.

This avoids a full rebuild while making the page more usable and easier to evolve.

## Goals

- Make Settings reflect the trimmed product scope.
- Reduce visual noise in dense categories, especially AI model, data source, notification, system, and Agent.
- Separate common operational settings from advanced or compatibility settings.
- Preserve the existing single-page save model and validation behavior.
- Create a structure that can later evolve into a drawer or full configuration console.

## Non-Goals

- Do not add new stock analysis capability in this phase.
- Do not redesign the Home or Agent pages.
- Do not introduce a standalone data quality panel.
- Do not replace the entire Settings page with a new route or wizard.
- Do not keep interactive Bot, command Bot, or Bot callback configuration. Those features were removed from the product baseline.

## Information Architecture

The existing top-level categories remain:

- Base
- AI Model
- Data Source
- Notification
- System
- Agent

Each category gets second-level groups. The front end should render these groups as collapsible sections within the active category.

### Base

- Watchlist: `STOCK_LIST`
- Import: intelligent import component
- Report Output: report type, language, summary-only, templates, report integrity, history comparison
- Market Review: market review enablement and region

### AI Model

- Model Selector: choose model service/provider and model mode from controlled dropdowns.
- Provider Drawer: configure provider-specific base URL, API key, model list, headers, and enablement in a drawer instead of rendering every provider field in a flat list.
- Active Runtime: primary model, Agent model override, fallback models, temperature.
- Advanced Routing: `LITELLM_CONFIG` and YAML routing for expert users only.
- Legacy Compatibility: remove old provider-specific key fields from the visible Settings UI unless they are required for current runtime behavior. If still needed internally, keep them out of the flat form and migrate the user-facing path to the provider drawer.

### Data Source

- Market Data Credentials: Tushare, Longbridge, TickFlow
- Realtime Quote Policy: realtime source priority, realtime quote toggles
- Search Intelligence: Tavily, Anspire, MiniMax, Bocha, Brave, SerpAPI, SearXNG
- Data Enhancements: chip distribution, industry or concept enrichment, market review universe toggles

### Notification

- Primary Channels: WeChat Work webhook, Feishu webhook, Email
- Webhook Channels: custom webhook URLs that send one-way HTTP notifications.
- Domestic Push: PushPlus, ServerChan, Pushover
- Rendering and Limits: Markdown-to-image, message length, SSL verification
- Removed Channels: Telegram Bot, Discord Bot/API delivery, Slack Bot API, interactive Bot callbacks, Stream Bot, command Bot, and related tokens/channel IDs should be removed from schema, Settings, documentation, and runtime notification code.

### System

- Authentication: auth enablement and password management cards
- Schedule and Runtime: schedule time, run immediately, workers, logging
- Persistence: database path, SQLite WAL and retry settings
- Build Info: Web build version, build id, build time

### Agent

- Agent Runtime: Agent enablement, max steps, timeout, memory, cache
- Strategy Skills: strategy mode, skill registry, skill weighting
- Tool Behavior: tool limits and strictness
- Advanced Agent Debugging: verbose or diagnostic switches if present

## Field Cleanup Rules

Fields should be removed from schema/UI and runtime when they belong to removed Bot notification or interactive Bot features.

Fields should be hidden from the generic form when they are managed by a dedicated component. For example:

- `LLM_CHANNELS` remains managed by `LLMChannelEditor`.
- Channel-derived `LLM_*` keys stay hidden when channel config is active.
- `ADMIN_AUTH_ENABLED` remains handled by auth-specific UI rather than generic fields.

Labels should avoid Bot terminology unless the third-party platform URL itself uses it, such as Feishu webhook paths. User-facing Settings should describe these as one-way notification channels.

AI provider fields should not appear as a long compatibility list. Provider-specific credentials move behind provider selection and drawer editing. Legacy service-provider key names should be removed from the generic form and either migrated into drawer-backed channel config or dropped if the runtime no longer consumes them.

## Component Design

Add a small grouping layer rather than replacing the page:

- `SettingsGroupSection`: collapsible group container with title, description, item count, and dirty/error indicators.
- `ProviderConfigDrawer`: model-provider drawer opened from the AI Model section after the user selects provider/type from dropdown controls.
- `getSettingsGroups(category, items)`: front-end grouping helper that maps keys to group IDs and returns ordered groups.
- Group metadata should live close to the Settings UI at first, because it is presentation structure, not runtime behavior.
- If grouping rules become shared or API-driven later, they can move into `config_registry.py`.

`SettingsSectionCard` should remain the outer category shell. Inside it, grouped sections replace the single flat `activeItems.map(...)`.

## Interaction Behavior

- Default open groups should prioritize common settings:
  - Base: Watchlist and Import
  - AI Model: Model Channels
  - Data Source: Market Data Credentials and Realtime Quote Policy
  - Notification: Primary Channels
  - System: Authentication and Schedule
  - Agent: Agent Runtime
- Groups containing validation errors should automatically open.
- Groups containing dirty fields should show a visible dirty indicator.
- The top save/reset buttons remain global for this phase.
- Empty groups are not rendered.
- Advanced groups are collapsed by default unless they contain dirty fields or validation errors.
- AI provider selection uses dropdowns first, then a drawer for provider-specific details. The drawer avoids showing every old model provider credential at once.
- Pending product decisions use default rules in this document rather than blocking implementation.

## Data Flow

No backend API shape changes are required for the first implementation.

Existing flow remains:

1. `useSystemConfig()` loads schema and current values.
2. `SettingsPage` filters hidden fields.
3. Grouping helper partitions `activeItems` into UI groups.
4. `SettingsField` renders normal editable fields.
5. AI provider drawer writes channel-backed config items through existing config update APIs.
6. Save submits changed fields through the existing config API.
7. Backend validation returns issues by key.
8. Front end maps issues to fields and opens affected groups.

## Error Handling

- Existing load/save API error handling remains unchanged.
- Group headers should surface warning/error counts derived from `issueByKey`.
- If a field is unmapped by grouping rules, put it in an `Other` group rather than dropping it.
- If schema is missing, preserve existing uncategorized behavior.
- If a removed Bot notification key is present in an old `.env`, it should be ignored by Settings and not reintroduced into schema. Runtime should not attempt to start or send through removed Bot channels.

## Testing

Frontend tests should cover:

- Category navigation still renders.
- Settings page renders grouped sections instead of a flat generic list.
- Dirty fields show a group-level indicator.
- Validation issues open the affected group.
- Hidden fields remain hidden from the generic form.
- Removed features do not reappear in Settings navigation or fields.
- AI provider credentials are configured through provider selection plus drawer, not through a flat legacy-provider list.
- Bot notification fields and Bot delivery code paths are absent.

Backend/static tests should cover:

- Removed runtime fields stay absent from config registry.
- Trimmed API surface tests continue to pass.
- Existing config registry schema build still succeeds.
- Notification runtime no longer exposes Telegram Bot, Discord Bot/API, Slack Bot API, or Stream Bot delivery fields.

Manual checks:

- Open `/settings` and confirm common groups are visible first.
- Switch categories and confirm advanced groups are collapsed.
- Edit one field, verify global save count and group dirty indicator.
- Trigger a validation warning, verify affected group is visible.

## Implementation Order

1. Remove Bot notification schema fields, runtime senders, tests, documentation entries, and environment examples that survived trimming.
2. Add grouping metadata and helper tests.
3. Add collapsible `SettingsGroupSection`.
4. Add AI provider dropdown + drawer design backed by existing channel config APIs.
5. Replace flat Settings field rendering with grouped rendering.
6. Remove or migrate stale AI legacy-provider key fields from the generic Settings form.
7. Update Settings page tests.
8. Run frontend lint/build/tests and Python compile/static checks.

## Open Decisions

Use the following defaults unless changed during implementation review:

- Keep global save/reset buttons.
- Do not add per-group save in this phase.
- Keep grouping metadata front-end local for first implementation.
- Use a drawer now for AI provider-specific configuration, because flat legacy-provider fields are too noisy.
- Treat full-page drawer editing for all Settings categories as a future phase after the core framework stabilizes.
- Remove Bot notification features by default rather than hiding them.
