import { ClassifyResult, IncomeClassifyResult, ModelProvider } from './types';

const EXPENSE_PROMPT = `你是一个支出分类助手。用户告诉你一笔支出的名称和金额，请判断分类。

分类规则：
1. **投资性支出 (investment)**：预期能带来回报的支出。
   - 学习课程、书籍（正在学或计划学）
   - 生产力工具（AI 工具、开发工具、域名服务器）
   - 营销投入
   - 社交/人脉（有明确商业目的）

2. **消费性支出 (consumption)**：
   - **必选 (required)**：生活必需，无法削减——房租、水电、基本餐饮、交通、通信
   - **可选 (optional)**：可以削减或替代——外卖溢价、娱乐、会员订阅、非必要购物

请严格返回以下 JSON 格式（不要包含其他文本）：
{
  "category": "investment" 或 "consumption",
  "subCategory": "required" 或 "optional",
  "confidence": 0.0到1.0的数字,
  "reasoning": "一句话说明理由"
}

注意：
- 对于投资性支出，subCategory 填 "optional"（投资性支出没有"必选"的概念）
- confidence 低于 0.7 时说明分类不确定，用户应该自行判断
- 如果金额异常大或名称模糊，降低 confidence`;

const INCOME_PROMPT = `你是一个收入分类助手。用户告诉你一笔收入的名称和金额，请判断是劳动收入还是被动收入。

分类规则：
1. **劳动收入 (labor)**：需要持续投入时间和精力才能获得的收入。
   - 工资/薪水
   - 接单/外包/咨询
   - 自由职业服务
   - 兼职/临时工

2. **被动收入 (passive)**：不需要持续投入大量时间即可获得的收入。
   - 投资回报/分红
   - 租金收入
   - 版税/知识产权
   - 课程/模板/工具等数字产品销售
   - 广告收入
   - 联盟营销

请严格返回以下 JSON 格式（不要包含其他文本）：
{
  "type": "labor" 或 "passive",
  "confidence": 0.0到1.0的数字,
  "reasoning": "一句话说明理由"
}

注意：
- 如果名称模糊，降低 confidence
- 有些收入可能介于两者之间（如需前期大量投入但后续被动的），按主要特征分类`;

type ProviderCall = {
  provider: ModelProvider;
  kind: 'expense' | 'income';
  name: string;
  amount: number;
};

async function callProvider({
  provider,
  kind,
  name,
  amount,
}: ProviderCall): Promise<Record<string, unknown> | null> {
  const systemPrompt = kind === 'income' ? INCOME_PROMPT : EXPENSE_PROMPT;
  const userContent =
    kind === 'income'
      ? `收入名称：${name}\n金额：¥${amount}`
      : `支出名称：${name}\n金额：¥${amount}`;

  try {
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const content: string = data.choices?.[0]?.message?.content ?? '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
}

/**
 * Classify an expense by calling the configured provider directly from the client.
 * Returns null if AI is not configured or the call fails.
 */
export async function classifyExpense(
  name: string,
  amount: number,
  provider: ModelProvider | undefined,
): Promise<ClassifyResult | null> {
  if (!provider || !provider.apiKey || !provider.model || !provider.baseUrl) {
    return null;
  }

  const data = await callProvider({ provider, kind: 'expense', name, amount });
  if (!data) return null;

  return {
    category: data.category as ClassifyResult['category'],
    subCategory: data.subCategory as ClassifyResult['subCategory'],
    confidence: (data.confidence as number) ?? 0.5,
    reasoning: (data.reasoning as string) ?? '',
  };
}

/**
 * Classify an income by calling the configured provider directly from the client.
 * Returns null if AI is not configured or the call fails.
 */
export async function classifyIncome(
  name: string,
  amount: number,
  provider: ModelProvider | undefined,
): Promise<IncomeClassifyResult | null> {
  if (!provider || !provider.apiKey || !provider.model || !provider.baseUrl) {
    return null;
  }

  const data = await callProvider({ provider, kind: 'income', name, amount });
  if (!data) return null;

  return {
    type: data.type as IncomeClassifyResult['type'],
    confidence: (data.confidence as number) ?? 0.5,
    reasoning: (data.reasoning as string) ?? '',
  };
}
