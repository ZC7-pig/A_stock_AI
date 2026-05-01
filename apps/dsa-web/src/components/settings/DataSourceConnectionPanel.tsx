import React, { useMemo, useState } from 'react';
import { CheckCircle2, Loader2, Wifi, XCircle } from 'lucide-react';
import { systemConfigApi } from '../../api/systemConfig';
import type { SystemConfigItem, TestDataSourceConnectionResponse } from '../../types/systemConfig';
import { Badge, Button } from '../common';

const TESTABLE_SOURCE_LABELS: Record<string, string> = {
  ANSPIRE_API_KEYS: 'Anspire',
  BOCHA_API_KEYS: 'Bocha',
  BRAVE_API_KEYS: 'Brave',
  MINIMAX_API_KEYS: 'MiniMax',
  SEARXNG_BASE_URLS: 'SearXNG',
  SERPAPI_API_KEYS: 'SerpAPI',
  TAVILY_API_KEYS: 'Tavily',
  TICKFLOW_API_KEY: 'TickFlow',
  TUSHARE_TOKEN: 'Tushare',
};

type ConnectionState =
  | { status: 'idle' }
  | { status: 'testing' }
  | { status: 'success'; response: TestDataSourceConnectionResponse }
  | { status: 'error'; response?: TestDataSourceConnectionResponse; message: string };

interface DataSourceConnectionPanelProps {
  items: SystemConfigItem[];
  disabled?: boolean;
}

function getProviderLabel(item: SystemConfigItem): string {
  return TESTABLE_SOURCE_LABELS[item.key] ?? item.key;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return '连接测试失败';
}

export const DataSourceConnectionPanel: React.FC<DataSourceConnectionPanelProps> = ({
  items,
  disabled = false,
}) => {
  const testableItems = useMemo(
    () => items.filter((item) => TESTABLE_SOURCE_LABELS[item.key]),
    [items],
  );
  const [states, setStates] = useState<Record<string, ConnectionState>>({});
  const [isTesting, setIsTesting] = useState(false);

  if (testableItems.length === 0) {
    return null;
  }

  const configuredItems = testableItems.filter((item) => String(item.value || '').trim());

  const runTests = async () => {
    if (!configuredItems.length) {
      return;
    }
    setIsTesting(true);
    setStates((previous) => {
      const next = { ...previous };
      configuredItems.forEach((item) => {
        next[item.key] = { status: 'testing' };
      });
      return next;
    });

    for (const item of configuredItems) {
      try {
        const response = await systemConfigApi.testDataSourceConnection({
          key: item.key,
          value: item.value,
          timeoutSeconds: 10,
        });
        setStates((previous) => ({
          ...previous,
          [item.key]: response.success
            ? { status: 'success', response }
            : { status: 'error', response, message: response.error || response.message },
        }));
      } catch (error) {
        setStates((previous) => ({
          ...previous,
          [item.key]: { status: 'error', message: getErrorMessage(error) },
        }));
      }
    }
    setIsTesting(false);
  };

  return (
    <div className="rounded-[1.1rem] border border-[var(--settings-border)] bg-[var(--settings-surface)] p-4 shadow-soft-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4 text-[var(--settings-accent)]" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-foreground">连接测试</h3>
            <Badge variant="default" size="sm">{configuredItems.length}/{testableItems.length} 已配置</Badge>
          </div>
          <p className="mt-1 text-xs leading-6 text-muted-text">
            对本组可测试的数据源执行一次轻量请求，不会保存或改写配置。
          </p>
        </div>
        <Button
          type="button"
          variant="settings-secondary"
          size="sm"
          onClick={() => void runTests()}
          disabled={disabled || isTesting || configuredItems.length === 0}
          isLoading={isTesting}
          loadingText="测试中..."
        >
          测试本组连接
        </Button>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
        {testableItems.map((item) => {
          const state = states[item.key] || { status: 'idle' };
          const provider = getProviderLabel(item);
          const isConfigured = Boolean(String(item.value || '').trim());
          return (
            <div
              key={item.key}
              className="rounded-xl border border-[var(--settings-border)] bg-background/35 px-3 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-foreground">{provider}</span>
                {state.status === 'testing' ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-text" aria-hidden="true" />
                ) : state.status === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                ) : state.status === 'error' ? (
                  <XCircle className="h-4 w-4 text-danger" aria-hidden="true" />
                ) : (
                  <span className="text-[11px] text-muted-text">{isConfigured ? '待测试' : '未配置'}</span>
                )}
              </div>
              {state.status === 'success' ? (
                <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-300">
                  <span>{provider} 连接成功</span>
                  {state.response.latencyMs != null ? (
                    <>
                      <span className="mx-1">·</span>
                      <span>{state.response.latencyMs} ms</span>
                    </>
                  ) : null}
                </p>
              ) : null}
              {state.status === 'error' ? (
                <p className="mt-1 line-clamp-2 text-xs text-danger">{state.message}</p>
              ) : null}
              {state.status === 'idle' && !isConfigured ? (
                <p className="mt-1 text-xs text-muted-text">填写后可测试</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
