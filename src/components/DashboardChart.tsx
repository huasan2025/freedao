'use client';

import { Expense, Income } from '@/lib/types';

interface Props {
  savings: number;
  expenses: Expense[];
  incomes: Income[];
}

export default function DashboardChart({ savings, expenses, incomes }: Props) {
  const monthlyExpense = expenses.reduce((s, e) => s + e.amount, 0);
  const monthlyIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const gap = monthlyExpense - monthlyIncome;
  const months = gap > 0 ? savings / gap : Infinity;

  const investmentTotal = expenses.filter(e => e.category === 'investment').reduce((s, e) => s + e.amount, 0);
  const requiredTotal = expenses.filter(e => e.category === 'consumption' && e.subCategory === 'required').reduce((s, e) => s + e.amount, 0);
  const optionalTotal = expenses.filter(e => e.category === 'consumption' && e.subCategory === 'optional').reduce((s, e) => s + e.amount, 0);

  const laborTotal = incomes.filter(i => i.type === 'labor').reduce((s, i) => s + i.amount, 0);
  const passiveTotal = incomes.filter(i => i.type === 'passive').reduce((s, i) => s + i.amount, 0);

  const maxBar = Math.max(monthlyExpense, monthlyIncome, 1);

  const runwayPct = months === Infinity ? 100 : Math.min((months / 24) * 100, 100);
  const runwayColor = months === Infinity ? 'bg-emerald-500' : months > 12 ? 'bg-emerald-500' : months > 6 ? 'bg-yellow-500' : 'bg-rose-500';

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
      <h2 className="text-lg font-semibold mb-4">仪表盘</h2>

      {/* Runway bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-zinc-500 mb-2">
          <span>跑道</span>
          <span>{months === Infinity ? '安全' : `${Math.floor(months)} 个月`} / 24 个月</span>
        </div>
        <div className="h-4 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${runwayColor} rounded-full transition-all duration-500`}
            style={{ width: `${runwayPct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-zinc-600 mt-1">
          <span>0</span>
          <span>6</span>
          <span>12</span>
          <span>18</span>
          <span>24+</span>
        </div>
      </div>

      {/* Income vs Expense stacked bars */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-zinc-400">月支出</span>
            <span className="text-rose-400">¥{monthlyExpense.toLocaleString()}</span>
          </div>
          <div className="h-6 bg-zinc-800 rounded overflow-hidden flex">
            {investmentTotal > 0 && (
              <div
                className="h-full bg-blue-500/70"
                style={{ width: `${(investmentTotal / maxBar) * 100}%` }}
                title={`投资 ¥${investmentTotal}`}
              />
            )}
            {requiredTotal > 0 && (
              <div
                className="h-full bg-zinc-500/70"
                style={{ width: `${(requiredTotal / maxBar) * 100}%` }}
                title={`必选 ¥${requiredTotal}`}
              />
            )}
            {optionalTotal > 0 && (
              <div
                className="h-full bg-amber-500/70"
                style={{ width: `${(optionalTotal / maxBar) * 100}%` }}
                title={`可选 ¥${optionalTotal}`}
              />
            )}
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-zinc-400">月收入</span>
            <span className="text-emerald-400">¥{monthlyIncome.toLocaleString()}</span>
          </div>
          <div className="h-6 bg-zinc-800 rounded overflow-hidden flex">
            {laborTotal > 0 && (
              <div
                className="h-full bg-emerald-500/70"
                style={{ width: `${(laborTotal / maxBar) * 100}%` }}
                title={`劳动 ¥${laborTotal}`}
              />
            )}
            {passiveTotal > 0 && (
              <div
                className="h-full bg-purple-500/70"
                style={{ width: `${(passiveTotal / maxBar) * 100}%` }}
                title={`被动 ¥${passiveTotal}`}
              />
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500/70" />投资性</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-zinc-500/70" />必选消费</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500/70" />可选消费</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500/70" />劳动收入</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500/70" />被动收入</span>
      </div>
    </div>
  );
}
