import React, { useState } from 'react';
import type { AnalysisResult, AnalysisReport, ReportLanguage } from '../../types/analysis';
import { getSentimentLabel } from '../../types/analysis';
import { getSentimentColor } from '../../types/analysis';
import { ReportNews } from './ReportNews';
import { ReportDetails } from './ReportDetails';
import { getReportText, normalizeReportLanguage } from '../../utils/reportLanguage';
import { formatDateTime } from '../../utils/format';

interface ReportSummaryProps {
  data: AnalysisResult | AnalysisReport;
  isHistory?: boolean;
  actions?: React.ReactNode;
}

type ReportPanelId = 'overview' | 'strategy' | 'news' | 'trace';

const clampScore = (value: number): number => Math.max(0, Math.min(100, Math.round(value)));

const getPanelIndex = (panel: ReportPanelId): number => {
  if (panel === 'strategy') return 1;
  if (panel === 'news') return 2;
  if (panel === 'trace') return 3;
  return 0;
};

const truncate = (value: string | undefined, fallback: string, max = 68): string => {
  const normalized = (value || '').trim();
  if (!normalized) return fallback;
  return normalized.length > max ? `${normalized.slice(0, max)}...` : normalized;
};

const getReportTags = (
  score: number,
  operationAdvice: string,
  language: ReportLanguage,
): Array<{ label: string; tone?: 'theme' | 'red' }> => {
  const sentiment = getSentimentLabel(score, language);
  const tags: Array<{ label: string; tone?: 'theme' | 'red' }> = [
    { label: String(sentiment), tone: score >= 60 ? 'theme' : undefined },
  ];

  if (/卖|减仓|止损|风险/.test(operationAdvice)) {
    tags.push({ label: '控制风险', tone: 'red' });
  } else if (/买|布局|持有|观察/.test(operationAdvice)) {
    tags.push({ label: '分批执行', tone: 'theme' });
  }

  tags.push({ label: language === 'en' ? 'Structured report' : '结构化报告' });
  return tags;
};

/**
 * 完整报告展示组件
 * 整合概览、策略、资讯、详情四个区域
 */
export const ReportSummary: React.FC<ReportSummaryProps> = ({
  data,
  isHistory: _isHistory,
  actions,
}) => {
  void _isHistory;
  const [activePanel, setActivePanel] = useState<ReportPanelId>('overview');
  // 兼容 AnalysisResult 和 AnalysisReport 两种数据格式
  const report: AnalysisReport = 'report' in data ? data.report : data;
  // 使用 report id，因为 queryId 在批量分析时可能重复，且历史报告详情接口需要 recordId 来获取关联资讯和详情数据
  const recordId = report.meta.id;

  const { meta, summary, strategy, details } = report;
  const reportLanguage = normalizeReportLanguage(meta.reportLanguage);
  const text = getReportText(reportLanguage);
  const displayName = meta.stockName || meta.stockCode;
  const displayCode = meta.stockCode;
  const changePct = meta.changePct;
  const priceToneClass = changePct == null
    ? ''
    : changePct >= 0
      ? 'v4-price-up'
      : 'v4-price-down';
  const priceText = meta.currentPrice != null ? meta.currentPrice.toFixed(2) : undefined;
  const changeText = changePct != null ? `${changePct > 0 ? '+' : ''}${changePct.toFixed(2)}%` : undefined;
  const modelUsed = (meta.modelUsed || '').trim();
  const shouldShowModel = Boolean(
    modelUsed && !['unknown', 'error', 'none', 'null', 'n/a'].includes(modelUsed.toLowerCase()),
  );
  const panelLabels = reportLanguage === 'en'
    ? [
      { id: 'overview' as const, label: 'Summary' },
      { id: 'strategy' as const, label: 'Strategy' },
      { id: 'news' as const, label: 'News' },
      { id: 'trace' as const, label: 'Trace' },
    ]
    : [
      { id: 'overview' as const, label: '摘要' },
      { id: 'strategy' as const, label: '策略点位' },
      { id: 'news' as const, label: '资讯动态' },
      { id: 'trace' as const, label: '数据追溯' },
    ];
  const tags = getReportTags(summary.sentimentScore, summary.operationAdvice, reportLanguage);
  const sentimentScoreColor = getSentimentColor(summary.sentimentScore);
  const scoreCards = [
    {
      title: reportLanguage === 'en' ? 'Technical' : '技术面',
      score: clampScore(summary.sentimentScore - 4),
      description: truncate(summary.trendPrediction, reportLanguage === 'en' ? 'Track trend confirmation.' : '结合趋势变化继续确认。', 34),
    },
    {
      title: reportLanguage === 'en' ? 'Fundamental' : '基本面',
      score: clampScore(summary.sentimentScore + 8),
      description: reportLanguage === 'en' ? 'See full report for fundamentals.' : '基本面细节收纳在完整报告中。',
    },
    {
      title: reportLanguage === 'en' ? 'Capital' : '资金面',
      score: clampScore(summary.sentimentScore - 10),
      description: reportLanguage === 'en' ? 'Confirm with turnover and flow.' : '结合成交量与资金流继续验证。',
    },
    {
      title: reportLanguage === 'en' ? 'News' : '新闻情绪',
      score: clampScore(details?.newsContent ? summary.sentimentScore - 2 : summary.sentimentScore - 16),
      description: details?.newsContent
        ? truncate(details.newsContent, reportLanguage === 'en' ? 'News context available.' : '已纳入资讯上下文。', 34)
        : reportLanguage === 'en' ? 'Refresh news in the news tab.' : '可在资讯动态页刷新确认。',
    },
  ];
  const insightCards = [
    {
      title: reportLanguage === 'en' ? 'Core Opportunity' : '核心机会',
      body: truncate(summary.analysisSummary, reportLanguage === 'en' ? 'No summary yet.' : '暂无摘要。', 82),
      tag: reportLanguage === 'en' ? 'Main view' : '核心观点',
      tone: 'theme' as const,
    },
    {
      title: reportLanguage === 'en' ? 'Main Risk' : '主要风险',
      body: reportLanguage === 'en'
        ? 'Do not extrapolate the conclusion without price and volume confirmation.'
        : '不要脱离量价确认直接外推结论，重点关注回撤与失效条件。',
      tag: reportLanguage === 'en' ? 'Risk control' : '风险约束',
      tone: 'red' as const,
    },
    {
      title: reportLanguage === 'en' ? 'Action' : '操作建议',
      body: truncate(summary.operationAdvice, text.noAdvice, 82),
      tag: reportLanguage === 'en' ? 'Execution' : '执行建议',
      tone: 'theme' as const,
    },
    {
      title: reportLanguage === 'en' ? 'Next Check' : '下一步观察',
      body: truncate(summary.trendPrediction, text.noPrediction, 82),
      tag: reportLanguage === 'en' ? 'Follow-up' : '趋势跟踪',
    },
  ];
  const strategyItems = [
    { label: text.idealBuy, value: strategy?.idealBuy, tone: '' },
    { label: text.secondaryBuy, value: strategy?.secondaryBuy, tone: 'cyan' },
    { label: text.stopLoss, value: strategy?.stopLoss, tone: 'red' },
    { label: text.takeProfit, value: strategy?.takeProfit, tone: 'amber' },
  ];
  const slideTransform = `translateX(-${getPanelIndex(activePanel) * 25}%)`;

  return (
    <div className="v4-report">
      <section className="v4-report-hero">
        <div className="v4-report-head">
          <div className="v4-stock-title">
            <h2>
              {displayName}
              <span>{displayCode}</span>
            </h2>
            <p>
              {reportLanguage === 'en' ? 'Structured summary' : '结构化摘要'} · {formatDateTime(meta.createdAt)}
              {priceText ? (
                <span className={`v4-price-inline ${priceToneClass}`}>
                  {priceText}{changeText ? ` ${changeText}` : ''}
                </span>
              ) : null}
            </p>
          </div>
          {actions ? <div className="v4-report-actions">{actions}</div> : null}
        </div>

        <div className="v4-verdict">
          <div className="v4-big-score">
            <b style={{ color: sentimentScoreColor }}>{summary.sentimentScore}</b>
            <span>{text.sentimentScore}</span>
          </div>
          <div className="v4-summary-copy">
            <div className="v4-tag-row">
              {tags.map((tag) => (
                <span key={tag.label} className={`v4-tag ${tag.tone ? `v4-tag-${tag.tone}` : ''}`}>
                  {tag.label}
                </span>
              ))}
            </div>
            <h3>{reportLanguage === 'en' ? 'AI Conclusion' : 'AI 综合结论'}</h3>
            <p>{summary.analysisSummary || text.noAnalysisSummary}</p>
          </div>
        </div>
      </section>

      <section className="v4-card-grid" aria-label={reportLanguage === 'en' ? 'Score cards' : '分析维度评分'}>
        {scoreCards.map((card) => (
          <div key={card.title} className="v4-info-card">
            <h3>{card.title}</h3>
            <b style={{ color: getSentimentColor(card.score) }}>{card.score}</b>
            <p>{card.description}</p>
          </div>
        ))}
      </section>

      <section className="v4-slider-card">
        <nav className="v4-report-tabs" aria-label="报告内容切换">
          {panelLabels.map((panel) => (
            <button
              key={panel.id}
              type="button"
              className={`v4-report-tab ${activePanel === panel.id ? 'v4-report-tab-active' : ''}`}
              onClick={() => setActivePanel(panel.id)}
              aria-current={activePanel === panel.id ? 'page' : undefined}
            >
              {panel.label}
            </button>
          ))}
        </nav>

        <div className="v4-slides">
          <div className="v4-slide-track" style={{ transform: slideTransform }}>
            <div className="v4-slide">
              <div className="v4-insight-grid">
                {insightCards.map((item) => (
                  <div key={item.title} className="v4-info-card v4-mini-report">
                    <strong>{item.title}</strong>
                    <p>{item.body}</p>
                    <span className={`v4-tag ${item.tone ? `v4-tag-${item.tone}` : ''}`}>{item.tag}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="v4-slide">
              <div className="v4-strategy-grid">
                {strategyItems.map((item) => (
                  <div key={item.label} className={`v4-point-card ${item.tone}`}>
                    <h3>{item.label}</h3>
                    <b>{item.value || '—'}</b>
                  </div>
                ))}
              </div>
            </div>

            <div className="v4-slide">
              <ReportNews recordId={recordId} limit={8} language={reportLanguage} />
            </div>

            <div className="v4-slide">
              <ReportDetails details={details} recordId={recordId} language={reportLanguage} />
            </div>
          </div>
        </div>
      </section>

      {shouldShowModel && (
        <p className="px-1 text-xs text-muted-text">
          {text.analysisModel}: {modelUsed}
        </p>
      )}
    </div>
  );
};
