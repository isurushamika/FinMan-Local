import React, { useState, useMemo } from 'react';
import { Item, ItemPurchase, PriceHistory } from '../types';
import { TrendingUp, TrendingDown, Package, Search, Plus, X, ShoppingCart, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Line } from 'react-chartjs-2';

interface ItemTrackerProps {
  items: Item[];
  purchases: ItemPurchase[];
  onAddItem: (item: Omit<Item, 'id'>) => void;
  onDeleteItem: (id: string) => void;
}

const ItemTracker: React.FC<ItemTrackerProps> = ({ items, purchases, onAddItem, onDeleteItem }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: '',
    description: '',
  });

  // Calculate price history for each item
  const priceHistories: PriceHistory[] = useMemo(() => {
    return items.map((item) => {
      const itemPurchases = purchases
        .filter((p) => p.itemId === item.id)
        .sort((a, b) => new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime());

      if (itemPurchases.length === 0) {
        return {
          itemId: item.id,
          itemName: item.name,
          purchases: [],
          averagePrice: 0,
          lowestPrice: 0,
          highestPrice: 0,
          priceChange: 0,
        };
      }

      const prices = itemPurchases.map((p) => p.price / (p.quantity || 1)); // Price per unit
      const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      const lowestPrice = Math.min(...prices);
      const highestPrice = Math.max(...prices);
      const priceChange = itemPurchases.length > 1
        ? ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100
        : 0;

      return {
        itemId: item.id,
        itemName: item.name,
        purchases: itemPurchases,
        averagePrice,
        lowestPrice,
        highestPrice,
        priceChange,
      };
    });
  }, [items, purchases]);

  // Filter items based on search
  const filteredHistories = useMemo(() => {
    if (!searchTerm) return priceHistories;
    return priceHistories.filter((history) =>
      history.itemName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [priceHistories, searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddItem(formData);
    setFormData({ name: '', category: '', unit: '', description: '' });
    setShowAddForm(false);
  };

  const getSelectedHistory = () => {
    return priceHistories.find((h) => h.itemId === selectedItem);
  };

  const renderPriceChart = (history: PriceHistory) => {
    if (history.purchases.length === 0) return null;

    const data = {
      labels: history.purchases.map((p) => format(new Date(p.purchaseDate), 'MMM dd, yyyy')),
      datasets: [
        {
          label: 'Price per Unit (LKR)',
          data: history.purchases.map((p) => p.price / (p.quantity || 1)),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.3,
          fill: true,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context: any) => `LKR ${context.parsed.y.toFixed(2)}`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: (value: any) => `LKR ${value}`,
          },
        },
      },
    };

    return (
      <div className="h-64">
        <Line data={data} options={options} />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Package className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            Item Price Tracker
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track prices of common items over time
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary flex items-center gap-2"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? 'Cancel' : 'Add Item'}
        </button>
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Add New Item to Track
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Item Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="e.g., Rice, Milk, Chicken"
                  required
                />
              </div>
              <div>
                <label className="label">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input"
                  placeholder="e.g., Groceries, Household"
                  required
                />
              </div>
              <div>
                <label className="label">Unit (Optional)</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="input"
                  placeholder="e.g., kg, liters, pieces"
                />
              </div>
              <div>
                <label className="label">Description (Optional)</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  placeholder="Additional details"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-full">
              Add Item
            </button>
          </form>
        </div>
      )}

      {/* Search Bar */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
            placeholder="Search items..."
          />
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredHistories.map((history) => {
          const latestPurchase = history.purchases[history.purchases.length - 1];
          const pricePerUnit = latestPurchase
            ? latestPurchase.price / (latestPurchase.quantity || 1)
            : 0;

          return (
            <div
              key={history.itemId}
              className="card hover:shadow-lg transition-all cursor-pointer"
              onClick={() => setSelectedItem(history.itemId)}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    {history.itemName}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {history.purchases.length} purchase{history.purchases.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete ${history.itemName}?`)) {
                      onDeleteItem(history.itemId);
                    }
                  }}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {history.purchases.length > 0 ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Latest Price:
                      </span>
                      <span className="font-bold text-gray-800 dark:text-white">
                        LKR {pricePerUnit.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Average:
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        LKR {history.averagePrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Price Change:
                      </span>
                      <span
                        className={`text-sm font-semibold flex items-center gap-1 ${
                          history.priceChange > 0
                            ? 'text-red-600 dark:text-red-400'
                            : history.priceChange < 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {history.priceChange > 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : history.priceChange < 0 ? (
                          <TrendingDown className="w-3 h-3" />
                        ) : null}
                        {Math.abs(history.priceChange).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  No purchases recorded yet
                </p>
              )}
            </div>
          );
        })}
      </div>

      {filteredHistories.length === 0 && (
        <div className="card text-center py-12">
          <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? 'No items found' : 'No items to track yet. Add an item to get started!'}
          </p>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const history = getSelectedHistory();
              if (!history) return null;

              return (
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                        {history.itemName}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Price History & Statistics
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Statistics Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                        Average Price
                      </p>
                      <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                        LKR {history.averagePrice.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <p className="text-xs text-green-600 dark:text-green-400 mb-1">
                        Lowest Price
                      </p>
                      <p className="text-lg font-bold text-green-700 dark:text-green-300">
                        LKR {history.lowestPrice.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                      <p className="text-xs text-red-600 dark:text-red-400 mb-1">
                        Highest Price
                      </p>
                      <p className="text-lg font-bold text-red-700 dark:text-red-300">
                        LKR {history.highestPrice.toFixed(2)}
                      </p>
                    </div>
                    <div
                      className={`rounded-lg p-4 ${
                        history.priceChange > 0
                          ? 'bg-red-50 dark:bg-red-900/20'
                          : 'bg-green-50 dark:bg-green-900/20'
                      }`}
                    >
                      <p
                        className={`text-xs mb-1 ${
                          history.priceChange > 0
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-green-600 dark:text-green-400'
                        }`}
                      >
                        Price Change
                      </p>
                      <p
                        className={`text-lg font-bold flex items-center gap-1 ${
                          history.priceChange > 0
                            ? 'text-red-700 dark:text-red-300'
                            : 'text-green-700 dark:text-green-300'
                        }`}
                      >
                        {history.priceChange > 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {Math.abs(history.priceChange).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Price Chart */}
                  {history.purchases.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                        Price Trend
                      </h3>
                      {renderPriceChart(history)}
                    </div>
                  )}

                  {/* Purchase History */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      Purchase History
                    </h3>
                    <div className="space-y-2">
                      {history.purchases.length > 0 ? (
                        history.purchases
                          .slice()
                          .reverse()
                          .map((purchase) => (
                            <div
                              key={purchase.id}
                              className="border dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                              <div className="flex flex-wrap justify-between items-start gap-2">
                                <div>
                                  <p className="font-semibold text-gray-800 dark:text-white">
                                    LKR {purchase.price.toFixed(2)}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {purchase.quantity} {purchase.unit || 'unit'}
                                    {purchase.quantity !== 1 ? 's' : ''} @ LKR{' '}
                                    {(purchase.price / (purchase.quantity || 1)).toFixed(2)} each
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {format(new Date(purchase.purchaseDate), 'MMM dd, yyyy')}
                                  </p>
                                  {purchase.store && (
                                    <p className="text-xs text-gray-500 dark:text-gray-500">
                                      {purchase.store}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {purchase.notes && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                  {purchase.notes}
                                </p>
                              )}
                            </div>
                          ))
                      ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                          No purchases recorded yet
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemTracker;
