import React, { useState } from 'react';
import { Subscription } from '../types';
import { Plus, Edit2, Trash2, Calendar, DollarSign, ToggleLeft, ToggleRight, RefreshCw, X } from 'lucide-react';
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

  const toggleAutoRenew = (subscription: Subscription) => {
    onUpdate(subscription.id, { autoRenew: !subscription.autoRenew });
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Subscription Tracker
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your recurring subscriptions and billing cycles
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Subscription
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">Monthly Cost (Est.)</p>
            <p className="text-3xl font-bold mt-1">${getTotalMonthlyCost().toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm">Active Subscriptions</p>
            <p className="text-3xl font-bold mt-1">{activeSubscriptions.length}</p>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingId ? 'Edit Subscription' : 'New Subscription'}
              </h3>
              <button
                type="button"
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Subscription Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="Netflix, Spotify, etc."
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
                <label className="label">Amount *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="input pl-10"
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
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.nextBillingDate}
                    onChange={(e) => setFormData({ ...formData, nextBillingDate: e.target.value })}
                    className="input pl-10"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.autoRenew}
                    onChange={(e) => setFormData({ ...formData, autoRenew: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Auto-Renew</span>
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows={2}
                  placeholder="Optional notes about this subscription"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" className="btn-primary">
                {editingId ? 'Update' : 'Add'} Subscription
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Subscriptions */}
      {activeSubscriptions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Active Subscriptions
          </h3>
          <div className="grid gap-4">
            {activeSubscriptions.map((subscription) => {
              const daysUntil = getDaysUntilBilling(subscription.nextBillingDate);
              const isOverdue = daysUntil < 0;
              const isDueSoon = daysUntil >= 0 && daysUntil <= 7;

              return (
                <div
                  key={subscription.id}
                  className={`card border-l-4 ${
                    isOverdue ? 'border-l-red-500' :
                    isDueSoon ? 'border-l-yellow-500' :
                    'border-l-green-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {subscription.name}
                        </h4>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          {subscription.category}
                        </span>
                        {subscription.autoRenew && (
                          <span title="Auto-Renew Enabled">
                            <RefreshCw className="w-4 h-4 text-green-600" />
                          </span>
                        )}
                      </div>
                      
                      {subscription.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {subscription.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-semibold">${subscription.amount}</span>
                          <span className="text-gray-500">/ {subscription.billingCycle}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          <span className={`${
                            isOverdue ? 'text-red-600 font-semibold' :
                            isDueSoon ? 'text-yellow-600 font-semibold' :
                            'text-gray-700 dark:text-gray-300'
                          }`}>
                            {isOverdue ? 'Overdue' :
                             isDueSoon ? `Due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}` :
                             format(parseISO(subscription.nextBillingDate), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {isOverdue && (
                        <button
                          onClick={() => renewSubscription(subscription)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                          title="Renew to next billing date"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => toggleActive(subscription)}
                        className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        title="Mark as inactive"
                      >
                        <ToggleRight className="w-5 h-5 text-green-600" />
                      </button>
                      <button
                        onClick={() => handleEdit(subscription)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete ${subscription.name}?`)) {
                            onDelete(subscription.id);
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
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
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Inactive Subscriptions
          </h3>
          <div className="grid gap-4">
            {inactiveSubscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="card opacity-60 border-l-4 border-l-gray-400"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {subscription.name}
                      </h4>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {subscription.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <DollarSign className="w-4 h-4" />
                      <span>${subscription.amount} / {subscription.billingCycle}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => toggleActive(subscription)}
                      className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      title="Mark as active"
                    >
                      <ToggleLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(subscription)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete ${subscription.name}?`)) {
                          onDelete(subscription.id);
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
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
        <div className="card text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Subscriptions Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start tracking your recurring subscriptions to manage your monthly expenses.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Your First Subscription
          </button>
        </div>
      )}
    </div>
  );
};
