import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiErrorAlert, ConfirmDialog, Button, Drawer, InlineAlert } from '../components/common';
import { DashboardStateBlock } from '../components/dashboard';
import { StockAutocomplete } from '../components/StockAutocomplete';
import { HistoryList } from '../components/history';
import { ReportMarkdown, ReportSummary } from '../components/report';
import { TaskPanel } from '../components/tasks';
import { useDashboardLifecycle, useHomeDashboardState } from '../hooks';
import { getReportText, normalizeReportLanguage } from '../utils/reportLanguage';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [askDrawerOpen, setAskDrawerOpen] = useState(false);

  const {
    query,
    inputError,
    duplicateError,
    error,
    isAnalyzing,
    historyItems,
    selectedHistoryIds,
    isDeletingHistory,
    isLoadingHistory,
    isLoadingMore,
    hasMore,
    selectedReport,
    isLoadingReport,
    activeTasks,
    markdownDrawerOpen,
    setQuery,
    clearError,
    loadInitialHistory,
    refreshHistory,
    loadMoreHistory,
    selectHistoryItem,
    toggleHistorySelection,
    toggleSelectAllVisible,
    deleteSelectedHistory,
    submitAnalysis,
    syncTaskCreated,
    syncTaskUpdated,
    syncTaskFailed,
    removeTask,
    openMarkdownDrawer,
    closeMarkdownDrawer,
    selectedIds,
  } = useHomeDashboardState();

  useEffect(() => {
    document.title = '每日选股分析 - DSA';
  }, []);
  const reportLanguage = normalizeReportLanguage(selectedReport?.meta.reportLanguage);
  const reportText = getReportText(reportLanguage);

  useDashboardLifecycle({
    loadInitialHistory,
    refreshHistory,
    syncTaskCreated,
    syncTaskUpdated,
    syncTaskFailed,
    removeTask,
  });

  const handleHistoryItemClick = useCallback((recordId: number) => {
    void selectHistoryItem(recordId);
    setSidebarOpen(false);
  }, [selectHistoryItem]);

  const handleSubmitAnalysis = useCallback(
    (
      stockCode?: string,
      stockName?: string,
      selectionSource?: 'manual' | 'autocomplete' | 'import' | 'image',
    ) => {
      void submitAnalysis({
        stockCode,
        stockName,
        originalQuery: query,
        selectionSource: selectionSource ?? 'manual',
      });
    },
    [query, submitAnalysis],
  );

  const handleAskFollowUp = useCallback(() => {
    if (selectedReport?.meta.id === undefined) {
      return;
    }

    const code = selectedReport.meta.stockCode;
    const name = selectedReport.meta.stockName;
    const rid = selectedReport.meta.id;
    navigate(`/chat?stock=${encodeURIComponent(code)}&name=${encodeURIComponent(name)}&recordId=${rid}`);
  }, [navigate, selectedReport]);

  const handleReanalyze = useCallback(() => {
    if (!selectedReport) {
      return;
    }

    void submitAnalysis({
      stockCode: selectedReport.meta.stockCode,
      stockName: selectedReport.meta.stockName,
      originalQuery: selectedReport.meta.stockCode,
      selectionSource: 'manual',
      forceRefresh: true,
    });
  }, [selectedReport, submitAnalysis]);

  const handleDeleteSelectedHistory = useCallback(() => {
    void deleteSelectedHistory();
    setShowDeleteConfirm(false);
  }, [deleteSelectedHistory]);

  const sidebarContent = useMemo(
    () => (
      <div className="flex min-h-0 h-full flex-col gap-3 overflow-hidden">
        <TaskPanel tasks={activeTasks} />
        <HistoryList
          items={historyItems}
          isLoading={isLoadingHistory}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          selectedId={selectedReport?.meta.id}
          selectedIds={selectedIds}
          isDeleting={isDeletingHistory}
          onItemClick={handleHistoryItemClick}
          onLoadMore={() => void loadMoreHistory()}
          onToggleItemSelection={toggleHistorySelection}
          onToggleSelectAll={toggleSelectAllVisible}
          onDeleteSelected={() => setShowDeleteConfirm(true)}
          className="flex-1 overflow-hidden"
        />
      </div>
    ),
    [
      activeTasks,
      hasMore,
      historyItems,
      isDeletingHistory,
      isLoadingHistory,
      isLoadingMore,
      handleHistoryItemClick,
      loadMoreHistory,
      selectedIds,
      selectedReport?.meta.id,
      toggleHistorySelection,
      toggleSelectAllVisible,
    ],
  );

  return (
    <div data-testid="home-dashboard" className="v4-page flex min-h-screen w-full flex-col overflow-hidden">
      <header className="v4-topbar" aria-label="股票分析输入">
        <div className="v4-topbar-title">
          <h1>A_stock_AI 投研工作台</h1>
          <p>首页聚焦：分析任务、历史报告、结构化摘要</p>
        </div>

        <div className="v4-search-box">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-secondary-text transition-colors hover:bg-hover hover:text-foreground"
            aria-label="历史记录"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="relative min-w-0">
            <StockAutocomplete
              value={query}
              onChange={setQuery}
              onSubmit={(stockCode, stockName, selectionSource) => {
                handleSubmitAnalysis(stockCode, stockName, selectionSource);
              }}
              placeholder="输入股票代码或名称，如 600519、贵州茅台、AAPL"
              disabled={isAnalyzing}
              className={inputError ? 'border-danger/50' : undefined}
            />
          </div>
          <button
            type="button"
            onClick={() => handleSubmitAnalysis()}
            disabled={!query || isAnalyzing}
            className="btn-primary h-[34px] whitespace-nowrap px-3 text-sm"
          >
            {isAnalyzing ? '分析中' : '开始分析'}
          </button>
        </div>

        <div className="v4-status hidden items-center lg:flex">
          <span className="chip"><span className="dot" />Gemini 已连接</span>
          <span className="chip"><span className="dot" />数据源正常</span>
          <span className="chip"><span className="dot warn" />T+0 更新</span>
        </div>
      </header>

      {inputError || duplicateError ? (
        <div className="px-4 pt-3">
          {inputError ? (
            <InlineAlert
              variant="danger"
              title="输入有误"
              message={inputError}
              className="rounded-xl px-3 py-2 text-xs shadow-none"
            />
          ) : null}
          {!inputError && duplicateError ? (
            <InlineAlert
              variant="warning"
              title="任务已存在"
              message={duplicateError}
              className="rounded-xl px-3 py-2 text-xs shadow-none"
            />
          ) : null}
        </div>
      ) : null}

      <div className="v4-content-grid flex-1">
        <aside aria-label="研究侧栏" className="hidden min-h-0 flex-col overflow-hidden md:flex">
          {sidebarContent}
        </aside>

        {sidebarOpen ? (
          <div className="fixed inset-0 z-40 md:hidden" onClick={() => setSidebarOpen(false)}>
            <div className="page-drawer-overlay absolute inset-0" />
            <div
              className="v4-panel absolute bottom-0 left-0 top-0 flex w-72 flex-col overflow-hidden !rounded-none !rounded-r-xl p-3 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              {sidebarContent}
            </div>
          </div>
        ) : null}

        <section aria-label="报告阅读区" className="min-h-0 min-w-0 overflow-x-auto overflow-y-auto touch-pan-y">
          {error ? (
            <ApiErrorAlert error={error} className="mb-3" onDismiss={clearError} />
          ) : null}
          {isLoadingReport ? (
            <div className="flex h-full flex-col items-center justify-center">
              <DashboardStateBlock title="加载报告中..." loading />
            </div>
          ) : selectedReport ? (
            <div className="v4-report-canvas pb-6">
              <ReportSummary
                data={selectedReport}
                isHistory
                actions={(
                  <>
                    <Button
                      variant="home-action-ai"
                      size="sm"
                      disabled={isAnalyzing || selectedReport.meta.id === undefined}
                      onClick={handleReanalyze}
                    >
                      {reportText.reanalyze}
                    </Button>
                    <Button
                      variant="home-action-ai"
                      size="sm"
                      disabled={selectedReport.meta.id === undefined}
                      onClick={openMarkdownDrawer}
                    >
                      {reportText.fullReport}
                    </Button>
                    <Button
                      variant="settings-primary"
                      size="sm"
                      disabled={selectedReport.meta.id === undefined}
                      onClick={() => setAskDrawerOpen(true)}
                    >
                      展开追问
                    </Button>
                  </>
                )}
              />
            </div>
          ) : (
            <div className="v4-empty-workspace">
              <div className="v4-empty-main" aria-labelledby="home-empty-title">
                <div className="v4-empty-kicker">研究准备区</div>
                <h2 id="home-empty-title">开始单股分析</h2>
                <p>
                  在顶部输入股票代码或名称后生成结构化报告；已有报告会显示在左侧历史列表，
                  可继续打开全文或进入问股 Agent 追问。
                </p>
                <div className="v4-empty-action-row">
                  <span>主操作</span>
                  <b>顶部搜索框输入代码或名称，然后点击“开始分析”</b>
                </div>
              </div>

              <div className="v4-empty-side" aria-label="暂无报告状态">
                <div className="v4-empty-status">
                  <span className="dot" />
                  <div>
                    <h3>暂无报告</h3>
                    <p>当前没有选中的历史报告，也没有生成中的结果。</p>
                  </div>
                </div>
                <div className="v4-empty-capability-grid">
                  <div>
                    <span>01</span>
                    <strong>输入代码分析</strong>
                    <p>支持股票代码或名称触发单股分析。</p>
                  </div>
                  <div>
                    <span>02</span>
                    <strong>选择历史报告</strong>
                    <p>左侧列表会展示已生成报告，便于回看。</p>
                  </div>
                  <div>
                    <span>03</span>
                    <strong>报告支持追问</strong>
                    <p>生成报告后可基于报告上下文进入问股 Agent。</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {markdownDrawerOpen && selectedReport?.meta.id ? (
        <ReportMarkdown
          recordId={selectedReport.meta.id}
          stockName={selectedReport.meta.stockName || ''}
          stockCode={selectedReport.meta.stockCode}
          reportLanguage={reportLanguage}
          onClose={closeMarkdownDrawer}
        />
      ) : null}

      <Drawer
        isOpen={askDrawerOpen}
        onClose={() => setAskDrawerOpen(false)}
        title="基于当前报告追问"
        width="max-w-xl"
      >
        <div className="space-y-3">
          <p className="text-sm leading-6 text-muted-text">
            追问入口先按 v4 右侧抽屉形态占位。后续接入真实 Agent 上下文后，会基于当前报告继续分析。
          </p>
          <textarea
            className="min-h-36 w-full rounded-xl border border-[var(--v4-line-strong)] bg-[var(--v4-surface-soft)] p-3 text-sm outline-none focus:border-[var(--v4-theme)]"
            defaultValue="如果明天低开 2%，当前判断是否需要调整？请结合估值约束、资金面和止损价位回答。"
          />
          <div className="flex justify-end">
            <Button
              variant="settings-primary"
              size="sm"
              disabled={selectedReport?.meta.id === undefined}
              onClick={handleAskFollowUp}
            >
              进入问股 Agent
            </Button>
          </div>
        </div>
      </Drawer>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="删除历史记录"
        message={
          selectedHistoryIds.length === 1
            ? '确认删除这条历史记录吗？删除后将不可恢复。'
            : `确认删除选中的 ${selectedHistoryIds.length} 条历史记录吗？删除后将不可恢复。`
        }
        confirmText={isDeletingHistory ? '删除中...' : '确认删除'}
        cancelText="取消"
        isDanger={true}
        onConfirm={handleDeleteSelectedHistory}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default HomePage;
