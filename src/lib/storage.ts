import { AppData, TimeCategory, ModelProvider, AppSettings } from './types';

const KEY = 'freedao';

export const defaultTimeCategories: TimeCategory[] = [
  { id: 'dev',     name: '产品开发',      color: 'oklch(0.68 0.13 245)', hoursPerWeek: 0 },
  { id: 'learn',   name: '学习 / 研究',   color: 'oklch(0.66 0.14 305)', hoursPerWeek: 0 },
  { id: 'content', name: '内容创作',      color: 'oklch(0.72 0.14 155)', hoursPerWeek: 0 },
  { id: 'service', name: '接单 / 服务',   color: 'oklch(0.76 0.14 55)',  hoursPerWeek: 0 },
  { id: 'admin',   name: '行政 / 杂事',   color: 'oklch(0.55 0.01 260)', hoursPerWeek: 0 },
];

export const defaultProviders: ModelProvider[] = [
  { id: 'deepseek',    name: 'DeepSeek',         baseUrl: 'https://api.deepseek.com/v1',                              apiKey: '', model: 'deepseek-chat' },
  { id: 'gemini',      name: 'Gemini',           baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',   apiKey: '', model: 'gemini-2.0-flash' },
  { id: 'qwen',        name: '通义千问',          baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',         apiKey: '', model: 'qwen-turbo' },
  { id: 'volcengine',  name: '火山引擎 (豆包)',   baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',                  apiKey: '', model: '' },
  { id: 'custom',      name: '自定义',            baseUrl: '',                                                          apiKey: '', model: '' },
];

const defaultSettings: AppSettings = {
  activeProviderId: '',
  providers: defaultProviders,
  theme: 'dark',
};

const defaultData: AppData = {
  savings: 0,
  expenses: [],
  incomes: [],
  timeCategories: defaultTimeCategories,
  settings: defaultSettings,
};

export function load(): AppData {
  if (typeof window === 'undefined') return defaultData;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw);
    // Backward-compatible merge: add missing fields from defaults
    return {
      savings: parsed.savings ?? 0,
      expenses: (parsed.expenses ?? []).map((e: Record<string, unknown>) => {
        const { aiSuggested, ...rest } = e;
        return {
          ...rest,
          createdAt: e.createdAt || new Date().toISOString(),
          classifiedBy: e.classifiedBy ?? (aiSuggested ? 'ai' : null),
        };
      }),
      incomes: (parsed.incomes ?? []).map((i: Record<string, unknown>) => ({
        ...i,
        createdAt: i.createdAt || new Date().toISOString(),
        classifiedBy: i.classifiedBy ?? null,
      })),
      timeCategories: parsed.timeCategories ?? defaultTimeCategories,
      settings: {
        activeProviderId: parsed.settings?.activeProviderId ?? '',
        providers: mergeProviders(parsed.settings?.providers),
        theme: parsed.settings?.theme ?? 'dark',
      },
    };
  } catch {
    return defaultData;
  }
}

/** Keep user-configured keys while adding any new default providers */
function mergeProviders(saved?: ModelProvider[]): ModelProvider[] {
  if (!saved || saved.length === 0) return defaultProviders;
  const map = new Map(saved.map(p => [p.id, p]));
  for (const dp of defaultProviders) {
    if (!map.has(dp.id)) map.set(dp.id, dp);
  }
  return Array.from(map.values());
}

export function save(data: AppData) {
  localStorage.setItem(KEY, JSON.stringify(data));
}
