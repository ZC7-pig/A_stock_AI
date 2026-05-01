import type { SystemConfigCategory } from '../types/systemConfig';

const categoryTitleMap: Record<SystemConfigCategory, string> = {
  base: '基础设置',
  analysis: '分析报告',
  data_source: '数据源',
  ai_model: 'AI 模型',
  system: '系统设置',
  agent: 'Agent 设置',
  uncategorized: '其他',
};

const categoryDescriptionMap: Partial<Record<SystemConfigCategory, string>> = {
  base: '管理自选股与基础运行参数。',
  analysis: '管理报告格式、语言、渲染和质量检查。',
  data_source: '管理行情数据源与优先级策略。',
  ai_model: '管理模型供应商、模型名称与推理参数。',
  system: '管理调度、日志、端口等系统级参数。',
  agent: '管理 Agent 模式、策略与多 Agent 编排配置。',
  uncategorized: '其他未归类的配置项。',
};

const fieldTitleMap: Record<string, string> = {
  STOCK_LIST: '自选股列表',
  TUSHARE_TOKEN: 'Tushare Token',
  OPENAI_API_KEY: 'OpenAI API Key',
  OPENAI_API_KEYS: 'OpenAI API Keys',
  BOCHA_API_KEYS: 'Bocha API Keys',
  TAVILY_API_KEYS: 'Tavily API Keys',
  ANSPIRE_API_KEYS: 'Anspire API Keys',
  SERPAPI_API_KEYS: 'SerpAPI API Keys',
  BRAVE_API_KEYS: 'Brave API Keys',
  SEARXNG_BASE_URLS: 'SearXNG Base URLs',
  SEARXNG_PUBLIC_INSTANCES_ENABLED: 'SearXNG 公共实例自动发现',
  MINIMAX_API_KEYS: 'MiniMax API Keys',
  NEWS_STRATEGY_PROFILE: '新闻策略窗口档位',
  NEWS_MAX_AGE_DAYS: '新闻最大时效（天）',
  REALTIME_SOURCE_PRIORITY: '实时数据源优先级',
  ENABLE_REALTIME_TECHNICAL_INDICATORS: '盘中实时技术面',
  LITELLM_MODEL: '主模型',
  AGENT_LITELLM_MODEL: 'Agent 主模型',
  LITELLM_FALLBACK_MODELS: '备选模型',
  LLM_CHANNELS: 'LLM 渠道列表',
  LLM_TEMPERATURE: '采样温度',
  REPORT_TYPE: '报告类型',
  REPORT_LANGUAGE: '报告语言',
  REPORT_TEMPLATES_DIR: '报告模板目录',
  REPORT_RENDERER_ENABLED: '启用模板渲染',
  REPORT_INTEGRITY_ENABLED: '报告完整性检查',
  REPORT_INTEGRITY_RETRY: '完整性重试次数',
  REPORT_HISTORY_COMPARE_N: '历史信号对比数量',
  MAX_WORKERS: '最大并发线程数',
  SCHEDULE_TIME: '定时任务时间',
  HTTP_PROXY: 'HTTP 代理',
  LOG_LEVEL: '日志级别',
  WEBUI_PORT: 'WebUI 端口',
  AGENT_MODE: '启用 Agent 策略问股',
  AGENT_MAX_STEPS: 'Agent 最大步数',
  AGENT_SKILLS: 'Agent 激活策略',
  AGENT_SKILL_DIR: 'Agent 策略目录',
  AGENT_ARCH: 'Agent 架构模式',
  AGENT_ORCHESTRATOR_MODE: '编排模式',
  AGENT_ORCHESTRATOR_TIMEOUT_S: 'Agent 超时（秒）',
  AGENT_RISK_OVERRIDE: '风控 Agent 否决',
  AGENT_SKILL_AUTOWEIGHT: '策略自动加权',
  AGENT_SKILL_ROUTING: '策略路由模式',
  AGENT_MEMORY_ENABLED: '记忆与校准',
};

const fieldDescriptionMap: Record<string, string> = {
  STOCK_LIST: '使用逗号分隔股票代码，例如：600519,300750。',
  TUSHARE_TOKEN: '用于接入 Tushare Pro 数据服务的凭据。',
  BOCHA_API_KEYS: '用于新闻检索的 Bocha 密钥，支持逗号分隔多个（最高优先级）。',
  TAVILY_API_KEYS: '用于新闻检索的 Tavily 密钥，支持逗号分隔多个。',
  ANSPIRE_API_KEYS: '用于新闻检索的 Anspire 密钥，支持逗号分隔多个。',
  SERPAPI_API_KEYS: '用于新闻检索的 SerpAPI 密钥，支持逗号分隔多个。',
  BRAVE_API_KEYS: '用于新闻检索的 Brave Search 密钥，支持逗号分隔多个。',
  SEARXNG_BASE_URLS: 'SearXNG 自建实例地址（逗号分隔，无配额兜底，需在 settings.yml 启用 format: json）。',
  SEARXNG_PUBLIC_INSTANCES_ENABLED: '当未配置 SearXNG 自建实例时，自动从 searx.space 获取公共实例并轮询使用；设为 false 可禁用该默认行为。',
  MINIMAX_API_KEYS: '用于新闻检索的 MiniMax 密钥，支持逗号分隔多个（最低优先级）。',
  NEWS_STRATEGY_PROFILE: '新闻窗口档位：ultra_short=1天，short=3天，medium=7天，long=30天。',
  NEWS_MAX_AGE_DAYS: '新闻最大时效上限。实际窗口 = min(策略档位天数, NEWS_MAX_AGE_DAYS)。例如 ultra_short + 7 仍为 1 天。',
  REALTIME_SOURCE_PRIORITY: '按逗号分隔填写数据源调用优先级。',
  ENABLE_REALTIME_TECHNICAL_INDICATORS: '盘中分析时用实时价计算 MA5/MA10/MA20 与多头排列（Issue #234）；关闭则用昨日收盘。',
  LITELLM_MODEL: '主模型，格式 provider/model（如 gemini/gemini-2.5-flash）。配置渠道后自动推断。',
  AGENT_LITELLM_MODEL: 'Agent 专用主模型。留空时继承主模型；无 provider 前缀时会按 openai/<model> 解析。',
  LITELLM_FALLBACK_MODELS: '备选模型，逗号分隔，主模型失败时按序尝试。',
  LLM_CHANNELS: '渠道名称列表（逗号分隔）。推荐使用上方渠道编辑器管理。',
  LLM_TEMPERATURE: '控制模型输出随机性，0 为确定性输出，2 为最大随机性，推荐 0.7。',
  REPORT_TYPE: '控制报告详细程度。',
  REPORT_LANGUAGE: '控制分析报告输出语言。',
  REPORT_TEMPLATES_DIR: 'Jinja2 报告模板目录，相对项目根目录。',
  REPORT_RENDERER_ENABLED: '启用模板渲染输出。',
  REPORT_INTEGRITY_ENABLED: '检查 LLM 输出中的必要报告字段，缺失时按配置补救。',
  REPORT_INTEGRITY_RETRY: '必要字段缺失时的重试次数。',
  REPORT_HISTORY_COMPARE_N: '展示最近 N 次分析信号对比，0 表示关闭。',
  MAX_WORKERS: '异步任务队列最大并发数。配置保存后，队列空闲时会自动应用；繁忙时延后生效。',
  SCHEDULE_TIME: '每日定时任务执行时间，格式为 HH:MM。',
  HTTP_PROXY: '网络代理地址，可留空。',
  LOG_LEVEL: '设置日志输出级别。',
  WEBUI_PORT: 'Web 页面服务监听端口。',
  AGENT_MODE: '是否启用 ReAct Agent 策略问股。对外文案仍叫“策略”，内部配置字段统一使用 skill。',
  AGENT_MAX_STEPS: 'Agent 最大推理步数上限。保持默认 10 时，各子 Agent 按自身预设步数运行；调高到高于默认值时，所有子 Agent 统一采用该值；调低到低于某子 Agent 默认值时，该 Agent 会被封顶。',
  AGENT_SKILLS: '逗号分隔的交易策略列表。留空时使用 metadata 里声明的主默认策略 skill（内置默认是 bull_trend）；也可填写 all 启用全部策略。',
  AGENT_SKILL_DIR: '存放 Agent 策略定义文件的目录路径，支持 YAML 与 SKILL.md bundle。',
  AGENT_ARCH: "选择 Agent 执行架构。single 为经典单 Agent；multi 为多 Agent 编排（实验性）。",
  AGENT_ORCHESTRATOR_MODE: "Multi-Agent 编排深度。quick（技术→决策）、standard（技术→情报→决策）、full（含风控）、specialist（含策略专家评估）。",
  AGENT_ORCHESTRATOR_TIMEOUT_S: "Agent 执行总超时预算（秒）。single-agent 用作整体 ReAct 循环预算，multi-agent 用作协作编排预算；0 表示不限制。",
  AGENT_RISK_OVERRIDE: "允许风控 Agent 在发现关键风险时否决买入信号。",
  AGENT_SKILL_AUTOWEIGHT: "存在可用表现信号时自动调整策略权重。",
  AGENT_SKILL_ROUTING: "策略选择方式。auto 按市场状态自动选择，manual 使用 AGENT_SKILLS 列表。",
  AGENT_MEMORY_ENABLED: "启用记忆与校准系统，追踪历史分析准确率并自动调节置信度。",
};

export function getCategoryTitleZh(category: SystemConfigCategory, fallback?: string): string {
  return categoryTitleMap[category] || fallback || category;
}

export function getCategoryDescriptionZh(category: SystemConfigCategory, fallback?: string): string {
  return categoryDescriptionMap[category] || fallback || '';
}

export function getFieldTitleZh(key: string, fallback?: string): string {
  return fieldTitleMap[key] || fallback || key;
}

export function getFieldDescriptionZh(key: string, fallback?: string): string {
  return fieldDescriptionMap[key] || fallback || '';
}
