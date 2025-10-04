# Item Price Tracking Feature

## Overview
Track prices of commonly purchased items over time to monitor price fluctuations, identify trends, and make informed purchasing decisions.

## Features

### 1. **Item Management**
- Add items to track (name, category, unit, description)
- Organize items by category
- Delete items when no longer needed
- Search and filter items

### 2. **Price History Tracking**
- Automatic tracking of item purchases
- Price per unit calculation
- Purchase date and store information
- Notes for each purchase

### 3. **Analytics & Insights**
- **Average Price**: Mean price across all purchases
- **Lowest Price**: Best deal you've gotten
- **Highest Price**: Peak price paid
- **Price Change %**: Percentage change from first to last purchase
- **Price Trend Chart**: Visual representation of price changes over time

### 4. **Price Visualization**
- Interactive line charts showing price trends
- Color-coded price indicators (green for decreases, red for increases)
- Detailed purchase history with dates and stores

## How to Use

### Adding Items to Track
1. Navigate to the **Price Tracker** tab
2. Click **"Add Item"**
3. Enter item details:
   - Item Name (e.g., "Rice", "Milk", "Chicken")
   - Category (e.g., "Groceries", "Household")
   - Unit (optional, e.g., "kg", "liters", "pieces")
   - Description (optional)
4. Click **"Add Item"**

### Viewing Price History
1. Click on any item card to view detailed price history
2. View statistics:
   - Average, lowest, and highest prices
   - Price change percentage
3. See price trend chart
4. Review complete purchase history with dates and stores

### Tracking Purchases
Currently, purchases need to be added manually through the **Price Tracker** interface. Future updates will integrate automatic tracking when creating transactions.

## Data Structure

### Item
```typescript
{
  id: string;
  name: string;
  category: string;
  unit?: string;
  description?: string;
}
```

### ItemPurchase
```typescript
{
  id: string;
  itemId: string;
  itemName: string;
  transactionId: string;
  price: number;
  quantity: number;
  unit?: string;
  purchaseDate: string;
  store?: string;
  notes?: string;
}
```

## Storage
- Items stored in localStorage: `financial_items`
- Purchases stored in localStorage: `financial_purchases`
- Data persists across sessions
- Can be exported/imported with other financial data

## Future Enhancements

### Planned Features
1. **Transaction Integration**
   - Add items directly when creating expense transactions
   - Link item purchases to transactions automatically
   - Track items per receipt image

2. **Advanced Analytics**
   - Price predictions using trend analysis
   - Best time to buy recommendations
   - Store comparison (which store has best prices)
   - Budget impact analysis

3. **Backend Integration**
   - PostgreSQL storage for items and purchases
   - API endpoints for item management
   - User-specific item tracking

4. **Smart Features**
   - Barcode scanning (PWA/mobile)
   - Price alert notifications
   - Bulk import from receipts
   - Share price data with family members

5. **Reports**
   - Monthly price comparison reports
   - Inflation tracking dashboard
   - Cost of living analysis
   - Shopping list optimization

## Technical Implementation

### Components
- **ItemTracker.tsx**: Main component for item management and visualization
- **Types**: Item, ItemPurchase, PriceHistory interfaces
- **Storage**: loadItems(), saveItems(), loadPurchases(), savePurchases()
- **Charts**: Price trend visualization using Chart.js

### Integration Points
- App.tsx: New "Price Tracker" tab added
- Navigation: Package icon for easy access
- Responsive design: Works on desktop and mobile

## Usage Examples

### Example 1: Track Grocery Prices
```
Item: Rice (White, 5kg bag)
Category: Groceries
Unit: kg

Purchases:
- Jan 15, 2025: LKR 1,200 @ SuperMart
- Feb 10, 2025: LKR 1,350 @ FreshMart (+12.5%)
- Mar 5, 2025: LKR 1,280 @ SuperMart (-5.2%)
```

### Example 2: Monitor Gas Prices
```
Item: Diesel
Category: Vehicle
Unit: liters

Purchases:
- Week 1: LKR 385/liter
- Week 2: LKR 390/liter (+1.3%)
- Week 3: LKR 388/liter (-0.5%)
- Week 4: LKR 395/liter (+1.8%)

Average: LKR 389.50/liter
Trend: Rising (+2.6% overall)
```

## Benefits

1. **Price Awareness**: Know if you're getting a good deal
2. **Budget Planning**: Anticipate price increases
3. **Store Comparison**: Identify which stores are cheaper
4. **Inflation Tracking**: Monitor real-world cost of living
5. **Smart Shopping**: Buy when prices are low
6. **Historical Data**: Long-term price trend analysis

## Currency
All prices displayed in **LKR (Sri Lankan Rupees)** to match the application's currency setting.

---

**Status**: ✅ Frontend Implementation Complete  
**Build**: ✅ Successfully compiled (418 KB JS bundle)  
**Next Steps**: Backend integration with PostgreSQL and API endpoints
