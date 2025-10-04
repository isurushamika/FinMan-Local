import React, { useMemo } from 'react';
import { Transaction } from '../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { format, startOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { DEFAULT_CATEGORIES } from '../utils/categories';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartsProps {
  transactions: Transaction[];
}

const Charts: React.FC<ChartsProps> = ({ transactions }) => {
  const monthlyData = useMemo(() => {
    const months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date(),
    });

    const data = months.map((month) => {
      const monthStart = startOfMonth(month);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

      const monthTransactions = transactions.filter((t) => {
        const tDate = new Date(t.date);
        return tDate >= monthStart && tDate <= monthEnd;
      });

      const income = monthTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        month: format(month, 'MMM yyyy'),
        income,
        expenses,
        balance: income - expenses,
      };
    });

    return data;
  }, [transactions]);

  const categoryData = useMemo(() => {
    const now = new Date();
    const thisMonth = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return (
        tDate >= startOfMonth(now) &&
        tDate <= new Date(now.getFullYear(), now.getMonth() + 1, 0)
      );
    });

    const expensesByCategory = thisMonth
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const categories = Object.entries(expensesByCategory).map(([name, amount]) => {
      const cat = DEFAULT_CATEGORIES.find((c) => c.name === name);
      return {
        name,
        amount,
        color: cat?.color || '#64748b',
      };
    });

    return categories.sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const lineChartData = {
    labels: monthlyData.map((d) => d.month),
    datasets: [
      {
        label: 'Income',
        data: monthlyData.map((d) => d.income),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: monthlyData.map((d) => d.expenses),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const barChartData = {
    labels: monthlyData.map((d) => d.month),
    datasets: [
      {
        label: 'Net Balance',
        data: monthlyData.map((d) => d.balance),
        backgroundColor: monthlyData.map((d) =>
          d.balance >= 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)'
        ),
      },
    ],
  };

  const doughnutData = {
    labels: categoryData.map((c) => c.name),
    datasets: [
      {
        label: 'Expenses by Category',
        data: categoryData.map((c) => c.amount),
        backgroundColor: categoryData.map((c) => c.color),
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#9ca3af',
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
      },
      y: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#9ca3af',
          padding: 10,
          font: {
            size: 11,
          },
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Trend */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Income vs Expenses (6 Months)
          </h3>
          <div className="h-64">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        {/* Monthly Balance */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Monthly Net Balance
          </h3>
          <div className="h-64">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Expenses by Category */}
      {categoryData.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Expenses by Category (This Month)
          </h3>
          <div className="h-80 flex items-center justify-center">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Charts;
