import React, { useMemo } from 'react';
import { Transaction } from '../types';
import { startOfMonth, endOfMonth } from 'date-fns';
import { TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';

interface SummaryCardsProps {
  transactions: Transaction[];
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ transactions }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return (
        tDate >= startOfMonth(now) &&
        tDate <= endOfMonth(now)
      );
    });

    const totalIncome = thisMonth
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = thisMonth
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    const allTimeBalance = transactions.reduce((sum, t) => {
      return t.type === 'income' ? sum + t.amount : sum - t.amount;
    }, 0);

    return {
      income: totalIncome,
      expenses: totalExpenses,
      balance,
      allTimeBalance,
    };
  }, [transactions]);

  const Card = ({ title, amount, icon: Icon, color, trend }: any) => (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>
            ${Math.abs(amount).toFixed(2)}
          </p>
          {trend && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              This month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        title="Total Income"
        amount={stats.income}
        icon={TrendingUp}
        color="text-green-600 dark:text-green-400"
        trend
      />
      <Card
        title="Total Expenses"
        amount={stats.expenses}
        icon={TrendingDown}
        color="text-red-600 dark:text-red-400"
        trend
      />
      <Card
        title="Monthly Balance"
        amount={stats.balance}
        icon={DollarSign}
        color={stats.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
        trend
      />
      <Card
        title="All-Time Balance"
        amount={stats.allTimeBalance}
        icon={Wallet}
        color={stats.allTimeBalance >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-red-600 dark:text-red-400'}
      />
    </div>
  );
};

export default SummaryCards;
