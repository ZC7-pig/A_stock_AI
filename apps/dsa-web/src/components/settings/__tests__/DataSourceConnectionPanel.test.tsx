import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DataSourceConnectionPanel } from '../DataSourceConnectionPanel';

const { testDataSourceConnection } = vi.hoisted(() => ({
  testDataSourceConnection: vi.fn(),
}));

vi.mock('../../../api/systemConfig', () => ({
  systemConfigApi: {
    testDataSourceConnection,
  },
}));

describe('DataSourceConnectionPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('tests configured data-source fields and renders the result', async () => {
    testDataSourceConnection.mockResolvedValue({
      success: true,
      message: 'Data source connection succeeded',
      error: null,
      code: 'ok',
      testedKey: 'TAVILY_API_KEYS',
      provider: 'Tavily',
      latencyMs: 123,
    });

    render(
      <DataSourceConnectionPanel
        items={[
          {
            key: 'TAVILY_API_KEYS',
            value: 'tvly-key-1,tvly-key-2',
            rawValueExists: true,
            isMasked: false,
          },
          {
            key: 'REALTIME_SOURCE_PRIORITY',
            value: 'tencent,akshare_sina',
            rawValueExists: true,
            isMasked: false,
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '测试本组连接' }));

    await waitFor(() => {
      expect(testDataSourceConnection).toHaveBeenCalledWith({
        key: 'TAVILY_API_KEYS',
        value: 'tvly-key-1,tvly-key-2',
        timeoutSeconds: 10,
      });
    });
    expect(await screen.findByText('Tavily 连接成功')).toBeInTheDocument();
    expect(screen.getByText('123 ms')).toBeInTheDocument();
  });

  it('does not render when the group has no testable data-source fields', () => {
    const { container } = render(
      <DataSourceConnectionPanel
        items={[
          {
            key: 'REALTIME_SOURCE_PRIORITY',
            value: 'tencent,akshare_sina',
            rawValueExists: true,
            isMasked: false,
          },
        ]}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
