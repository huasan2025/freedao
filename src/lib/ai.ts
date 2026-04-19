import { ClassifyResult, IncomeClassifyResult, ModelProvider } from './types';

/**
 * Call the AI classify API route to categorize an expense.
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

  try {
    const res = await fetch('/api/ai/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        amount,
        kind: 'expense',
        baseUrl: provider.baseUrl,
        apiKey: provider.apiKey,
        model: provider.model,
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (data.error) return null;

    return {
      category: data.category,
      subCategory: data.subCategory,
      confidence: data.confidence ?? 0.5,
      reasoning: data.reasoning ?? '',
    };
  } catch {
    return null;
  }
}

/**
 * Call the AI classify API route to categorize an income.
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

  try {
    const res = await fetch('/api/ai/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        amount,
        kind: 'income',
        baseUrl: provider.baseUrl,
        apiKey: provider.apiKey,
        model: provider.model,
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (data.error) return null;

    return {
      type: data.type,
      confidence: data.confidence ?? 0.5,
      reasoning: data.reasoning ?? '',
    };
  } catch {
    return null;
  }
}
