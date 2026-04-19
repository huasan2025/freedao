/* ── Financial ────────────────────────────────────────────────────────── */

export interface Expense {
  id: string;
  name: string;
  amount: number; // monthly
  category: 'investment' | 'consumption';
  subCategory: 'required' | 'optional';
  createdAt: string; // ISO date
  classifiedBy?: 'ai' | 'user' | null; // who set the category
}

export interface Income {
  id: string;
  name: string;
  amount: number; // monthly
  type: 'labor' | 'passive';
  createdAt: string; // ISO date
  classifiedBy?: 'ai' | 'user' | null; // who set the type
}

/* ── Time tracking ───────────────────────────────────────────────────── */

export interface TimeCategory {
  id: string;
  name: string;
  color: string;
  hoursPerWeek: number;
}

/* ── AI / Model ──────────────────────────────────────────────────────── */

export interface ModelProvider {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface AppSettings {
  activeProviderId: string;
  providers: ModelProvider[];
  theme: 'dark' | 'light';
}

/* ── Root ─────────────────────────────────────────────────────────────── */

export interface AppData {
  savings: number;
  expenses: Expense[];
  incomes: Income[];
  timeCategories: TimeCategory[];
  settings: AppSettings;
}

/* ── AI classification result ────────────────────────────────────────── */

export interface ClassifyResult {
  category: 'investment' | 'consumption';
  subCategory: 'required' | 'optional';
  confidence: number;
  reasoning: string;
}

export interface IncomeClassifyResult {
  type: 'labor' | 'passive';
  confidence: number;
  reasoning: string;
}
