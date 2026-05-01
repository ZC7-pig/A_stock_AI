import type React from 'react';
import type { HistoryItem } from '../../types/analysis';
import { getSentimentColor } from '../../types/analysis';
import { formatDateTime } from '../../utils/format';
import { truncateStockName, isStockNameTruncated } from '../../utils/stockName';

interface HistoryListItemProps {
  item: HistoryItem;
  isViewing: boolean; // Indicates if this report is currently being viewed in the right panel
  isChecked: boolean; // Indicates if the checkbox is checked for bulk operations
  isDeleting: boolean;
  selectable?: boolean;
  onToggleChecked: (recordId: number) => void;
  onClick: (recordId: number) => void;
}

const getOperationBadgeLabel = (advice?: string) => {
  const normalized = advice?.trim();
  if (!normalized) {
    return '情绪';
  }
  if (normalized.includes('减仓')) {
    return '减仓';
  }
  if (normalized.includes('卖')) {
    return '卖出';
  }
  if (normalized.includes('观望') || normalized.includes('等待')) {
    return '观望';
  }
  if (normalized.includes('买') || normalized.includes('布局')) {
    return '买入';
  }
  return normalized.split(/[，。；、\s]/)[0] || '建议';
};

export const HistoryListItem: React.FC<HistoryListItemProps> = ({
  item,
  isViewing,
  isChecked,
  isDeleting,
  selectable = true,
  onToggleChecked,
  onClick,
}) => {
  const sentimentColor = item.sentimentScore !== undefined ? getSentimentColor(item.sentimentScore) : null;
  const stockName = item.stockName || item.stockCode;
  const isTruncated = isStockNameTruncated(stockName);

  return (
    <div className="flex items-start gap-2 group">
      {selectable ? (
        <div className="pt-4">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => onToggleChecked(item.id)}
            disabled={isDeleting}
            className="h-3.5 w-3.5 cursor-pointer rounded border-subtle-hover bg-transparent accent-primary focus:ring-primary/30 disabled:opacity-50"
          />
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => onClick(item.id)}
        className={`home-history-item flex-1 text-left group/item ${
          isViewing ? 'home-history-item-selected' : ''
        }`}
      >
        <div className={`relative z-10 grid min-w-0 grid-cols-[minmax(0,1fr)_42px] items-center gap-2${isTruncated ? ' group-hover/item:z-20' : ''}`}>
          <div className="min-w-0">
            <div className="flex min-w-0 items-baseline gap-2">
              <span className="min-w-0 truncate text-sm font-semibold tracking-tight text-foreground">
                <span className="group-hover/item:hidden">
                  {truncateStockName(stockName)}
                </span>
                <span className="hidden group-hover/item:inline">
                  {stockName}
                </span>
              </span>
              <span className="shrink-0 font-mono text-[11px] text-muted-text">
                {item.stockCode}
              </span>
            </div>
            <div className="mt-1 flex min-w-0 items-center gap-2">
              <span className="text-[11px] text-muted-text">
                {getOperationBadgeLabel(item.operationAdvice)}
              </span>
              <span className="w-1 h-1 rounded-full bg-subtle-hover" />
              <span className="min-w-0 truncate text-[11px] text-muted-text">
                {formatDateTime(item.createdAt)}
              </span>
            </div>
          </div>
          <div
            className="home-history-score"
            style={sentimentColor ? { color: sentimentColor } : undefined}
          >
            {item.sentimentScore ?? '—'}
          </div>
        </div>
      </button>
    </div>
  );
};
