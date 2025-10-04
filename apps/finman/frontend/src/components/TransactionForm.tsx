import React, { useState } from 'react';
import { Transaction } from '../types';
import { DEFAULT_CATEGORIES, ACCOUNT_TYPES } from '../utils/categories';
import { Calendar, DollarSign, Tag, FileText, Image, X } from 'lucide-react';

interface TransactionFormProps {
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  onCancel?: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onAdd, onCancel }) => {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [receipt, setReceipt] = useState<string>('');
  const [receiptPreview, setReceiptPreview] = useState<string>('');
  const [account, setAccount] = useState<string>('');

  const categories = DEFAULT_CATEGORIES.filter(cat => cat.type === type);

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setReceipt(base64);
        setReceiptPreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeReceipt = () => {
    setReceipt('');
    setReceiptPreview('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category || !description) {
      alert('Please fill in all required fields');
      return;
    }

    onAdd({
      type,
      amount: parseFloat(amount),
      category,
      description,
      date,
      receipt: receipt || undefined,
      account: account || undefined,
    });

    // Reset form
    setAmount('');
    setCategory('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setReceipt('');
    setReceiptPreview('');
    setAccount('');
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Add Transaction
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Selection */}
        <div>
          <label className="label">Type</label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                type === 'income'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                type === 'expense'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Expense
            </button>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="label">
            <DollarSign className="inline w-4 h-4 mr-1" />
            Amount (LKR)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input"
            placeholder="0.00"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="label">
            <Tag className="inline w-4 h-4 mr-1" />
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input"
            required
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="label">
            <FileText className="inline w-4 h-4 mr-1" />
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input"
            placeholder="Enter description"
            required
          />
        </div>

        {/* Date */}
        <div>
          <label className="label">
            <Calendar className="inline w-4 h-4 mr-1" />
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input"
            required
          />
        </div>

        {/* Account Selection */}
        <div>
          <label className="label">
            <DollarSign className="inline w-4 h-4 mr-1" />
            Account (Optional)
          </label>
          <select
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            className="input"
          >
            <option value="">Select account</option>
            {ACCOUNT_TYPES.map((acc) => (
              <option key={acc} value={acc}>
                {acc}
              </option>
            ))}
          </select>
        </div>

        {/* Receipt Upload */}
        <div>
          <label className="label">
            <Image className="inline w-4 h-4 mr-1" />
            Receipt (Optional)
          </label>
          {receiptPreview ? (
            <div className="relative">
              <img
                src={receiptPreview}
                alt="Receipt preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={removeReceipt}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <input
              type="file"
              accept="image/*"
              onChange={handleReceiptUpload}
              className="input"
            />
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4">
          <button type="submit" className="btn btn-primary flex-1">
            Add Transaction
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
