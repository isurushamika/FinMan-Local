import React, { useState } from 'react';
import { Subscription } from '../types';
import { Plus, Edit2, Trash2, Calendar, ToggleLeft, ToggleRight, RefreshCw, X } from 'lucide-react';
import { format, parseISO, addWeeks, addMonths, addYears } from 'date-fns';

interface SubscriptionsProps {
  subscriptions: Subscription[];
  onAdd: (subscription: Omit<Subscription, 'id'>) => void;
  onUpdate: (id: string, subscription: Partial<Subscription>) => void;
  onDelete: (id: string) => void;
}

export const Subscriptions: React.FC<SubscriptionsProps> = ({
  subscriptions,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Subscription, 'id'>>({
    name: '',
    amount: 0,
    billingCycle: 'monthly',
    nextBillingDate: format(new Date(), 'yyyy-MM-dd'),
    category: 'Entertainment',
    description: '',
    isActive: true,
    autoRenew: true,
  });

  const categories = [
    'Entertainment',
    'Software',
    'Utilities',
    'Health & Fitness',
    'News & Media',
    'Cloud Services',
    'Music & Audio',
    'Video Streaming',
    'Gaming',
    'Education',
    'Other',
  ];

  const billingCycles = [
    { value: 'weekly', label: 'Weekly', days: 7 },
    { value: 'monthly', label: 'Monthly', days: 30 },
    { value: 'quarterly', label: 'Quarterly', days: 90 },
    { value: 'yearly', label: 'Yearly', days: 365 },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdate(editingId, formData);
      setEditingId(null);
    } else {
      onAdd(formData);
    }
    resetForm();
  };

  const handleEdit = (subscription: Subscription) => {
    setFormData({
      name: subscription.name,
      amount: subscription.amount,
      billingCycle: subscription.billingCycle,
      nextBillingDate: subscription.nextBillingDate,
      category: subscription.category,
      description: subscription.description,
      isActive: subscription.isActive,
      autoRenew: subscription.autoRenew,
    });
    setEditingId(subscription.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      amount: 0,
      billingCycle: 'monthly',
      nextBillingDate: format(new Date(), 'yyyy-MM-dd'),
      category: 'Entertainment',
      description: '',
      isActive: true,
      autoRenew: true,
    });
    setShowForm(false);
    setEditingId(null);
  };

  const toggleActive = (subscription: Subscription) => {
    onUpdate(subscription.id, { isActive: !subscription.isActive });
  };

  const calculateNextBilling = (subscription: Subscription): string => {
    const currentDate = parseISO(subscription.nextBillingDate);
    const today = new Date();
    
    if (currentDate > today) {
      return subscription.nextBillingDate;
    }

    let nextDate = currentDate;
    while (nextDate <= today) {
      switch (subscription.billingCycle) {
        case 'weekly':
          nextDate = addWeeks(nextDate, 1);
          break;
        case 'monthly':
          nextDate = addMonths(nextDate, 1);
          break;
        case 'quarterly':
          nextDate = addMonths(nextDate, 3);
          break;
        case 'yearly':
          nextDate = addYears(nextDate, 1);
          break;
      }
    }
    
    return format(nextDate, 'yyyy-MM-dd');
  };

  const renewSubscription = (subscription: Subscription) => {
    const nextDate = calculateNextBilling(subscription);
    onUpdate(subscription.id, { nextBillingDate: nextDate });
  };

  const getDaysUntilBilling = (dateString: string): number => {
    const billingDate = parseISO(dateString);
    const today = new Date();
    const diff = Math.ceil((billingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getTotalMonthlyCost = () => {
    return subscriptions
      .filter(sub => sub.isActive)
      .reduce((total, sub) => {
        const monthlyCost = 
          sub.billingCycle === 'weekly' ? sub.amount * 4.33 :
          sub.billingCycle === 'monthly' ? sub.amount :
          sub.billingCycle === 'quarterly' ? sub.amount / 3 :
          sub.amount / 12;
        return total + monthlyCost;
      }, 0);
  };

  const activeSubscriptions = subscriptions.filter(sub => sub.isActive);
  const inactiveSubscriptions = subscriptions.filter(sub => !sub.isActive);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Subscription Tracker
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your recurring subscriptions and billing cycles
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Add Subscription
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-blue-100 text-sm uppercase tracking-wide">Monthly Cost (Est.)</p>
            <p className="text-3xl md:text-4xl font-bold mt-2">LKR {getTotalMonthlyCost().toFixed(2)}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-blue-100 text-sm uppercase tracking-wide">Active Subscriptions</p>
            <p className="text-3xl md:text-4xl font-bold mt-2">{activeSubscriptions.length}</p>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingId ? 'Edit Subscription' : 'New Subscription'}
              </h3>
              <button
                type="button"
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Subscription Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="e.g., Netflix, Spotify"
                  required
                />
              </div>

              <div>
                <label className="label">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Amount (LKR) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-gray-600 dark:text-gray-400">
                    LKR
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="input pl-16"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Billing Cycle *</label>
                <select
                  value={formData.billingCycle}
                  onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as 'monthly' | 'yearly' | 'weekly' | 'quarterly' })}
                  className="input"
                  required
                >
                  {billingCycles.map((cycle) => (
                    <option key={cycle.value} value={cycle.value}>
                      {cycle.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Next Billing Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.nextBillingDate}
                    onChange={(e) => setFormData({ ...formData, nextBillingDate: e.target.value })}
                    className="input pl-12"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.autoRenew}
                    onChange={(e) => setFormData({ ...formData, autoRenew: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Auto-Renew</span>
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input resize-none"
                  rows={3}
                  placeholder="Add optional notes about this subscription..."
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button type="submit" className="btn-primary flex-1 sm:flex-none">
                {editingId ? 'Update' : 'Add'} Subscription
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary flex-1 sm:flex-none">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Subscriptions */}
      {activeSubscriptions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Active Subscriptions
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              ({activeSubscriptions.length})
            </span>
          </h3>
          <div className="grid gap-4">
            {activeSubscriptions.map((subscription) => {
              const daysUntil = getDaysUntilBilling(subscription.nextBillingDate);
              const isOverdue = daysUntil < 0;
              const isDueSoon = daysUntil >= 0 && daysUntil <= 7;

              return (
                <div
                  key={subscription.id}
                  className={`card border-l-4 transition-all hover:shadow-xl ${
                    isOverdue ? 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10' :
                    isDueSoon ? 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10' :
                    'border-l-green-500'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <h4 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate">
                          {subscription.name}
                        </h4>
                        <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 whitespace-nowrap">
                          {subscription.category}
                        </span>
                        {subscription.autoRenew && (
                          <span title="Auto-Renew Enabled" className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <RefreshCw className="w-4 h-4" />
                            <span className="text-xs font-medium hidden sm:inline">Auto-Renew</span>
                          </span>
                        )}
                      </div>
                      
                      {subscription.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                          {subscription.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 md:gap-6">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            LKR {subscription.amount.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            / {subscription.billingCycle}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <span className={`text-sm font-medium ${
                            isOverdue ? 'text-red-600 dark:text-red-400' :
                            isDueSoon ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-gray-700 dark:text-gray-300'
                          }`}>
                            {isOverdue ? `Overdue by ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''}` :
                             isDueSoon ? `Due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}` :
                             format(parseISO(subscription.nextBillingDate), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex md:flex-col items-center gap-2 md:ml-4">
                      {isOverdue && (
                        <button
                          onClick={() => renewSubscription(subscription)}
                          className="p-2 md:p-2.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Renew to next billing date"
                        >
                          <RefreshCw className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => toggleActive(subscription)}
                        className="p-2 md:p-2.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                        title="Mark as inactive"
                      >
                        <ToggleRight className="w-6 h-6" />
                      </button>
                      <button
                        onClick={() => handleEdit(subscription)}
                        className="p-2 md:p-2.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Edit subscription"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete ${subscription.name}?`)) {
                            onDelete(subscription.id);
                          }
                        }}
                        className="p-2 md:p-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete subscription"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Inactive Subscriptions */}
      {inactiveSubscriptions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Inactive Subscriptions
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              ({inactiveSubscriptions.length})
            </span>
          </h3>
          <div className="grid gap-4">
            {inactiveSubscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="card opacity-70 hover:opacity-100 border-l-4 border-l-gray-400 dark:border-l-gray-600 transition-all hover:shadow-xl"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <h4 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate">
                        {subscription.name}
                      </h4>
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {subscription.category}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-gray-700 dark:text-gray-300">
                        LKR {subscription.amount.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        / {subscription.billingCycle}
                      </span>
                    </div>
                  </div>
                  <div className="flex md:flex-col items-center gap-2 md:ml-4">
                    <button
                      onClick={() => toggleActive(subscription)}
                      className="p-2 md:p-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Mark as active"
                    >
                      <ToggleLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => handleEdit(subscription)}
                      className="p-2 md:p-2.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Edit subscription"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete ${subscription.name}?`)) {
                          onDelete(subscription.id);
                        }
                      }}
                      className="p-2 md:p-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Delete subscription"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {subscriptions.length === 0 && (
        <div className="card text-center py-16 border-2 border-dashed border-gray-300 dark:border-gray-600">
          <Calendar className="w-20 h-20 text-gray-400 dark:text-gray-500 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            No Subscriptions Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Start tracking your recurring subscriptions to better manage your monthly expenses and never miss a payment.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary inline-flex items-center gap-2 text-lg px-6 py-3"
          >
            <Plus className="w-5 h-5" />
            Add Your First Subscription
          </button>
        </div>
      )}
    </div>
  );
};
