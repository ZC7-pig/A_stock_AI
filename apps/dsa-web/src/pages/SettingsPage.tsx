import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSystemConfig } from '../hooks/useSystemConfig';
import { ApiErrorAlert, Badge, Button, Drawer, EmptyState } from '../components/common';
import {
  AuthSettingsCard,
  ChangePasswordCard,
  DataSourceConnectionPanel,
  IntelligentImport,
  LLMChannelEditor,
  SettingsCategoryNav,
  SettingsAlert,
  SettingsField,
  SettingsLoading,
  SettingsSectionCard,
} from '../components/settings';
import { WEB_BUILD_INFO } from '../utils/constants';
import { getCategoryDescriptionZh, getCategoryTitleZh, getFieldTitleZh } from '../utils/systemConfigI18n';
import type { SystemConfigCategory, SystemConfigItem } from '../types/systemConfig';

type SettingsGroup = {
  id: string;
  title: string;
  description: string;
  keys?: string[];
  match?: (item: SystemConfigItem) => boolean;
};

const LLM_CHANNEL_KEY_RE = /^LLM_[A-Z0-9]+_(PROTOCOL|BASE_URL|API_KEY|API_KEYS|MODELS|EXTRA_HEADERS|ENABLED)$/;
const REMOVED_SETTING_CATEGORIES = new Set(['notification']);

const CATEGORY_GROUPS: Partial<Record<SystemConfigCategory, SettingsGroup[]>> = {
  base: [
    {
      id: 'watchlist',
      title: '自选股与导入',
      description: '维护分析股票池、导入结果和基础输入。',
      match: (item) => item.key === 'STOCK_LIST' || item.key.includes('STOCK'),
    },
    {
      id: 'runtime',
      title: '基础运行参数',
      description: '分析间隔、并发、快照等基础参数。',
    },
  ],
  analysis: [
    {
      id: 'report-output',
      title: '报告输出',
      description: '报告类型、语言、模板渲染和历史对比。',
      match: (item) => item.key.startsWith('REPORT_') || item.key.includes('TEMPLATE'),
    },
    {
      id: 'analysis-other',
      title: '其他分析参数',
      description: '未归入上方分组的分析报告配置。',
    },
  ],
  data_source: [
    {
      id: 'market-data',
      title: '行情数据源',
      description: 'Tushare、AkShare、TickFlow、Baostock、YFinance 等行情源配置。',
      match: (item) => /TUSHARE|AKSHARE|EFINANCE|PYTDX|BAOSTOCK|YFINANCE|LONG_BRIDGE|TICKFLOW|REALTIME|QUOTE|CHIP/.test(item.key),
    },
    {
      id: 'news-search',
      title: '新闻搜索源',
      description: 'Bocha、Tavily、Brave、SerpAPI、Anspire、SearXNG 等新闻检索源。',
      match: (item) => /BOCHA|TAVILY|BRAVE|SERPAPI|ANSPIRE|SEARXNG|MINIMAX|NEWS/.test(item.key),
    },
    {
      id: 'priority',
      title: '优先级与兜底',
      description: '数据源优先级、超时、重试和开关类设置。',
    },
  ],
  system: [
    {
      id: 'schedule',
      title: '调度与服务',
      description: 'Web 服务、定时任务、交易日规则和队列并发。',
      match: (item) => /WEBUI|SCHEDULE|TRADING_DAY|MARKET_REVIEW|MAX_WORKERS|ANALYSIS_DELAY/.test(item.key),
    },
    {
      id: 'logging',
      title: '日志与网络',
      description: '日志级别、代理和调试设置。',
      match: (item) => /LOG|DEBUG|HTTP_PROXY|HTTPS_PROXY/.test(item.key),
    },
    {
      id: 'storage',
      title: '存储与数据库',
      description: 'SQLite、历史上下文和本地存储参数。',
      match: (item) => /DATABASE|SQLITE|CONTEXT|HISTORY|SAVE_/.test(item.key),
    },
    {
      id: 'system-other',
      title: '其他系统参数',
      description: '未归入上方分组的系统级配置。',
    },
  ],
  agent: [
    {
      id: 'agent-core',
      title: '问股 Agent 核心',
      description: 'Agent 开关、架构、最大步数和主模型继承。',
      match: (item) => /AGENT_MODE|AGENT_ARCH|AGENT_MAX_STEPS|AGENT_LITELLM/.test(item.key),
    },
    {
      id: 'agent-strategy',
      title: '策略与编排',
      description: '策略选择、编排模式、风险否决和策略自动加权。',
      match: (item) => /SKILL|ORCHESTRATOR|RISK|ROUTING/.test(item.key),
    },
    {
      id: 'agent-research',
      title: '深度研究与事件监控',
      description: '研究预算、超时、事件监控频率和规则。',
      match: (item) => /DEEP_RESEARCH|EVENT_MONITOR|MEMORY/.test(item.key),
    },
    {
      id: 'agent-other',
      title: '其他 Agent 参数',
      description: '未归入上方分组的 Agent 设置。',
    },
  ],
  uncategorized: [
    {
      id: 'uncategorized',
      title: '其他配置',
      description: '尚未归类但仍可编辑的配置项。',
    },
  ],
};

function groupItems(items: SystemConfigItem[], groups: SettingsGroup[]): Array<SettingsGroup & { items: SystemConfigItem[] }> {
  const remaining = new Set(items.map((item) => item.key));
  return groups
    .map((group) => {
      const matched = items.filter((item) => {
        if (!remaining.has(item.key)) {
          return false;
        }
        if (group.keys?.includes(item.key) || group.match?.(item)) {
          remaining.delete(item.key);
          return true;
        }
        if (!group.keys && !group.match) {
          remaining.delete(item.key);
          return true;
        }
        return false;
      });
      return { ...group, items: matched };
    })
    .filter((group) => group.items.length > 0);
}

function getItemDirtyCount(items: SystemConfigItem[], dirtyKeys: string[]): number {
  const dirtyKeySet = new Set(dirtyKeys);
  return items.filter((item) => dirtyKeySet.has(item.key)).length;
}

const SettingsPage: React.FC = () => {
  const { passwordChangeable } = useAuth();
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);

  // Set page title
  useEffect(() => {
    document.title = '系统设置 - DSA';
  }, []);

  const {
    categories,
    itemsByCategory,
    issueByKey,
    activeCategory,
    setActiveCategory,
    hasDirty,
    dirtyCount,
    dirtyKeys,
    toast,
    clearToast,
    isLoading,
    isSaving,
    loadError,
    saveError,
    retryAction,
    load,
    retry,
    save,
    resetDraft,
    setDraftValue,
    refreshAfterExternalSave,
    configVersion,
    maskToken,
  } = useSystemConfig();

  useEffect(() => {
    void load();
  }, [load]);

  const visibleCategories = categories.filter(
    (category) => !REMOVED_SETTING_CATEGORIES.has(category.category),
  );
  const visibleItemsByCategory = Object.fromEntries(
    Object.entries(itemsByCategory).filter(([category]) => !REMOVED_SETTING_CATEGORIES.has(category)),
  );
  const effectiveActiveCategory = REMOVED_SETTING_CATEGORIES.has(activeCategory)
    ? (visibleCategories[0]?.category ?? 'base')
    : activeCategory;

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => {
      clearToast();
    }, 3200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [clearToast, toast]);

  const rawActiveItems = useMemo(
    () => visibleItemsByCategory[effectiveActiveCategory] || [],
    [effectiveActiveCategory, visibleItemsByCategory],
  );

  const AI_MODEL_HIDDEN_KEYS = new Set([
    'LLM_CHANNELS',
    'LLM_TEMPERATURE',
    'LITELLM_MODEL',
    'AGENT_LITELLM_MODEL',
    'LITELLM_FALLBACK_MODELS',
  ]);
  const SYSTEM_HIDDEN_KEYS = new Set([
    'ADMIN_AUTH_ENABLED',
  ]);
  const AGENT_HIDDEN_KEYS = new Set<string>();
  const activeItems =
    effectiveActiveCategory === 'ai_model'
      ? rawActiveItems.filter((item) => {
        if (LLM_CHANNEL_KEY_RE.test(item.key)) {
          return false;
        }
        if (AI_MODEL_HIDDEN_KEYS.has(item.key)) {
          return false;
        }
        return true;
      })
      : effectiveActiveCategory === 'system'
        ? rawActiveItems.filter((item) => !SYSTEM_HIDDEN_KEYS.has(item.key))
      : effectiveActiveCategory === 'agent'
        ? rawActiveItems.filter((item) => !AGENT_HIDDEN_KEYS.has(item.key))
      : rawActiveItems;
  const activeGroups = useMemo(() => {
    if (effectiveActiveCategory === 'ai_model') {
      return [];
    }
    const categoryGroups = CATEGORY_GROUPS[effectiveActiveCategory as SystemConfigCategory] ?? CATEGORY_GROUPS.uncategorized ?? [];
    return groupItems(activeItems, categoryGroups);
  }, [effectiveActiveCategory, activeItems]);
  const openGroup = activeGroups.find((group) => group.id === openGroupId) ?? null;
  const openGroupDirtyCount = openGroup ? getItemDirtyCount(openGroup.items, dirtyKeys) : 0;
  return (
    <div className="v4-page v4-settings-page settings-page min-h-screen px-4 pb-6 pt-4 md:px-6">
      <div className="v4-settings-header mb-5 px-5 py-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">系统设置</h1>
            <p className="text-xs leading-6 text-muted-text">
              统一管理模型、数据源、安全认证、导入能力与 Agent 参数。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="settings-secondary"
              onClick={resetDraft}
              disabled={isLoading || isSaving}
            >
              重置
            </Button>
            <Button
              type="button"
              variant="settings-primary"
              onClick={() => void save()}
              disabled={!hasDirty || isSaving || isLoading}
              isLoading={isSaving}
              loadingText="保存中..."
            >
              {isSaving ? '保存中...' : `保存配置${dirtyCount ? ` (${dirtyCount})` : ''}`}
            </Button>
          </div>
        </div>

        {saveError ? (
          <ApiErrorAlert
            className="mt-3"
            error={saveError}
            actionLabel={retryAction === 'save' ? '重试保存' : undefined}
            onAction={retryAction === 'save' ? () => void retry() : undefined}
          />
        ) : null}
      </div>

      {loadError ? (
        <ApiErrorAlert
          error={loadError}
          actionLabel={retryAction === 'load' ? '重试加载' : '重新加载'}
          onAction={() => void retry()}
          className="mb-4"
        />
      ) : null}

      {isLoading ? (
        <SettingsLoading />
      ) : (
        <div className="v4-settings-grid grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr]">
          <aside className="lg:sticky lg:top-4 lg:self-start">
            <SettingsCategoryNav
              categories={visibleCategories}
              itemsByCategory={visibleItemsByCategory}
              activeCategory={effectiveActiveCategory}
              onSelect={(category) => {
                setOpenGroupId(null);
                setActiveCategory(category);
              }}
            />
          </aside>

          <section className="space-y-4">
            {effectiveActiveCategory === 'system' ? <AuthSettingsCard /> : null}
            {effectiveActiveCategory === 'system' ? (
              <SettingsSectionCard
                title="版本信息"
                description="用于确认当前 WebUI 静态资源是否已经切换到最新构建。"
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border settings-border bg-background/40 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-text">
                      WebUI 版本
                    </p>
                    <p className="mt-2 break-all font-mono text-sm text-foreground">
                      {WEB_BUILD_INFO.version}
                    </p>
                  </div>
                  <div className="rounded-2xl border settings-border bg-background/40 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-text">
                      构建标识
                    </p>
                    <p className="mt-2 break-all font-mono text-sm text-foreground">
                      {WEB_BUILD_INFO.buildId}
                    </p>
                  </div>
                  <div className="rounded-2xl border settings-border bg-background/40 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-text">
                      构建时间
                    </p>
                    <p className="mt-2 break-all font-mono text-sm text-foreground">
                      {WEB_BUILD_INFO.buildTime}
                    </p>
                  </div>
                </div>
                <p className="text-xs leading-6 text-muted-text">
                  重新执行前端构建或 Docker 镜像构建后，此处的构建标识和构建时间会更新，可用来确认当前页面资源是否已切换。
                </p>
                {WEB_BUILD_INFO.isFallbackVersion ? (
                  <p className="text-xs leading-6 text-amber-700 dark:text-amber-300">
                    当前 package.json 仍为占位版本 0.0.0，页面已自动回退展示构建标识，避免误判旧资源仍在生效。
                  </p>
                ) : null}
              </SettingsSectionCard>
            ) : null}
            {effectiveActiveCategory === 'base' ? (
              <SettingsSectionCard
                title="智能导入"
                description="从图片、文件或剪贴板中提取股票代码，并合并到自选股列表。"
              >
                <IntelligentImport
                  stockListValue={
                    (activeItems.find((i) => i.key === 'STOCK_LIST')?.value as string) ?? ''
                  }
                  configVersion={configVersion}
                  maskToken={maskToken}
                  onMerged={async () => {
                    await refreshAfterExternalSave(['STOCK_LIST']);
                  }}
                  disabled={isSaving || isLoading}
                />
              </SettingsSectionCard>
            ) : null}
            {effectiveActiveCategory === 'ai_model' ? (
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
            {effectiveActiveCategory === 'system' && passwordChangeable ? (
              <ChangePasswordCard />
            ) : null}
            {effectiveActiveCategory !== 'ai_model' && activeGroups.length ? (
              <SettingsSectionCard
                title={`${getCategoryTitleZh(effectiveActiveCategory as SystemConfigCategory, '当前分类')}分组`}
                description={getCategoryDescriptionZh(effectiveActiveCategory as SystemConfigCategory, '') || '按用途归并配置项，打开抽屉进行编辑。'}
              >
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                  {activeGroups.map((group) => {
                      const groupDirtyCount = getItemDirtyCount(group.items, dirtyKeys);
                      return (
                        <button
                          key={group.id}
                          type="button"
                          className="group rounded-[1.1rem] border border-[var(--settings-border)] bg-[var(--settings-surface)] p-4 text-left shadow-soft-card transition-[background-color,border-color,transform] hover:-translate-y-0.5 hover:border-[var(--settings-border-strong)] hover:bg-[var(--settings-surface-hover)]"
                          onClick={() => setOpenGroupId(group.id)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-sm font-semibold text-foreground">{group.title}</h3>
                                <Badge variant="default" size="sm">{group.items.length} 项</Badge>
                                {groupDirtyCount ? (
                                  <Badge variant="warning" size="sm">{groupDirtyCount} 项待保存</Badge>
                                ) : null}
                              </div>
                              <p className="mt-2 text-xs leading-6 text-muted-text">{group.description}</p>
                              <p className="mt-2 line-clamp-2 text-xs leading-6 text-secondary-text">
                                {group.items.slice(0, 5).map((item) => getFieldTitleZh(item.key, item.key)).join(' / ')}
                              </p>
                            </div>
                            <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-text transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                          </div>
                        </button>
                      );
                    })}
                </div>
              </SettingsSectionCard>
            ) : effectiveActiveCategory !== 'ai_model' ? (
              <EmptyState
                title="当前分类下暂无配置项"
                description="当前分类没有可编辑字段；可切换左侧分类继续查看其它系统配置。"
                className="settings-surface-panel settings-border-strong border-none bg-transparent shadow-none"
              />
            ) : null}
          </section>
        </div>
      )}

      <Drawer
        isOpen={Boolean(openGroup)}
        onClose={() => setOpenGroupId(null)}
        title={openGroup?.title}
        width="max-w-3xl"
      >
        {openGroup ? (
          <div className="space-y-5">
            <div className="rounded-[1.1rem] border border-[var(--settings-border)] bg-[var(--settings-surface)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="default" size="sm">{openGroup.items.length} 项配置</Badge>
                  {openGroupDirtyCount ? (
                    <Badge variant="warning" size="sm">{openGroupDirtyCount} 项待保存</Badge>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="settings-primary"
                  size="sm"
                  onClick={() => void save()}
                  disabled={!openGroupDirtyCount || isSaving || isLoading}
                  isLoading={isSaving}
                  loadingText="保存中..."
                >
                  {isSaving ? '保存中...' : '保存本组'}
                </Button>
              </div>
              <p className="mt-2 text-xs leading-6 text-muted-text">{openGroup.description}</p>
            </div>

            <div className="space-y-3">
              {effectiveActiveCategory === 'data_source' ? (
                <DataSourceConnectionPanel items={openGroup.items} disabled={isSaving || isLoading} />
              ) : null}
              {openGroup.items.map((item) => (
                <SettingsField
                  key={item.key}
                  item={item}
                  value={item.value}
                  disabled={isSaving}
                  onChange={setDraftValue}
                  issues={issueByKey[item.key] || []}
                />
              ))}
            </div>
          </div>
        ) : null}
      </Drawer>

      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 w-[320px] max-w-[calc(100vw-24px)]">
          {toast.type === 'success'
            ? <SettingsAlert title="操作成功" message={toast.message} variant="success" />
            : <ApiErrorAlert error={toast.error} />}
        </div>
      ) : null}
    </div>
  );
};

export default SettingsPage;
