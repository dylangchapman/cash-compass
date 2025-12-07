# Portfolio & Net Worth Feature

## Overview

New feature that adds investment portfolio tracking and net worth goal management with real-time stock prices and motivational progress tracking.

## What Was Added

### 1. **Portfolio Dataset**
- **File**: `data/portfolio.csv`
- Contains 8 equity holdings:
  - Individual stocks: AAPL, MSFT, GOOGL, NVDA, TSLA
  - ETFs: VTI, VOO
  - Bonds: BND
- Tracks: symbol, shares, purchase price, purchase date, notes

### 2. **Backend Services**

#### Portfolio Service (`backend/portfolio_service.py`)
- **Real-time price fetching** using yfinance
- Calculates current portfolio value
- Tracks gain/loss per position
- Asset allocation breakdown (stocks/ETFs/bonds)
- Net worth calculation (cash + investments)
- **Net worth goal tracking** with milestones

#### New API Endpoints
```python
GET  /api/portfolio              # Get portfolio with current prices
POST /api/portfolio/refresh      # Manually refresh stock prices
GET  /api/networth              # Calculate total net worth
POST /api/networth/goal         # Analyze progress toward goal
```

### 3. **Frontend Components**

#### Portfolio Page (`/portfolio`)
- **Real-time portfolio value** with live stock prices
- **Holdings table** with detailed position data
- **Asset allocation pie chart**
- **Gain/loss tracking** for each position
- **Refresh button** to update prices on demand
- Professional table with all position details

#### Enhanced Goals Page (`/goals`)
- **Net Worth Goal Tracker** section at top
- Shows current net worth (cash + investments)
- Breakdown: cash savings vs portfolio value
- **Motivational progress system**:
  - Visual progress bar
  - 5 milestone markers (25%, 50%, 75%, 90%, 100%)
  - Emoji indicators for each milestone
  - Encouraging messages based on progress
  - Estimated time to goal
- Adjustable goal amount
- Color-coded based on progress (green when on-track)

## Data Flow

```
App Boot
  ↓
portfolio_service.py loads portfolio.csv
  ↓
Fetches real-time prices from yfinance
  ↓
Calculates current value, gain/loss, allocation
  ↓
Combines with cash savings from analytics
  ↓
Generates net worth + goal progress
  ↓
Frontend displays with motivational UI
```

## Motivational Design

### Progress Milestones
- **25% (🌱)**: "Quarter Way There!"
- **50% (🎯)**: "Halfway Milestone!"
- **75% (🚀)**: "Three Quarters Complete!"
- **90% (⭐)**: "Almost There!"
- **100% (🎉)**: "Goal Achieved!"

### Visual Cues
- **Green background**: On track (>50% progress)
- **Orange background**: Keep building (<50%)
- **Checkmark icons**: Achieved milestones
- **Large encouraging text**: "You're Crushing It!" / "Keep Building!"
- **Months to goal**: Realistic timeline based on savings rate

### Metric Cards
- Clean, professional display
- Icons for visual interest
- Percentage breakdowns
- Clear labels

## Technical Details

### yfinance Integration
```python
import yfinance as yf

# Fetch multiple tickers at once
tickers = yf.Tickers('AAPL MSFT GOOGL')

# Get current price
current_price = ticker.info.get('currentPrice')
```

### Portfolio Calculations
```python
# Per holding
cost_basis = shares * purchase_price
current_value = shares * current_price
gain_loss = current_value - cost_basis
return_percent = (gain_loss / cost_basis) * 100

# Total portfolio
total_value = sum(all current_values)
total_return = (total_value - total_cost) / total_cost * 100
```

### Net Worth
```python
net_worth = cash_savings + portfolio_value

# From analytics (6 months of transaction data)
cash_savings = total_income - total_expenses

# From portfolio service
portfolio_value = sum(shares * current_price)
```

## Setup Instructions

### 1. Install yfinance

```bash
cd backend
pip install yfinance==0.2.32
```

### 2. Start Backend

```bash
python main.py
```

On boot, the backend will:
- Load portfolio.csv
- Fetch real-time prices from Yahoo Finance
- Calculate all metrics

### 3. Start Frontend

```bash
cd frontend
npm run dev
```

Navigate to:
- `/portfolio` - View holdings
- `/goals` - Track net worth goal

## Customization

### Add New Holdings

Edit `data/portfolio.csv`:
```csv
symbol,shares,purchase_price,purchase_date,notes
AAPL,10,150.00,2024-01-15,Your note here
```

### Change Net Worth Goal

In Goals page, use the "Adjust Your Goal" input at the bottom of the net worth section.

Default goal: $50,000

### Update Asset Allocation

In `backend/portfolio_service.py`, update the categorization:
```python
def _calculate_allocation(self, holdings):
    stocks = ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'TSLA']  # Add/remove
    etfs = ['VTI', 'VOO']
    bonds = ['BND']
```

## Performance Notes

### Price Fetching
- **On boot**: Fetches all prices automatically
- **Manual refresh**: Click "Refresh Prices" button on Portfolio page
- **Caching**: Prices cached in memory until refresh
- **API calls**: One batch request for all symbols

### Optimization
- Uses yfinance batch API (`yf.Tickers()`) for efficiency
- Fallback to purchase price if API fails
- Error handling per symbol (one failure doesn't break all)

## Example Data

Current demo portfolio:
- **Total Value**: ~$20,000 (varies with market)
- **Holdings**: 8 positions
- **Allocation**: ~60% stocks, 30% ETFs, 10% bonds
- **Combined with savings**: Net worth ~$22,000

With $50K goal:
- Progress: ~44%
- Achieved: 25% milestone
- Next milestone: 50% (Halfway!)

## Future Enhancements

- [ ] Auto-refresh prices every 15 minutes
- [ ] Historical performance charts
- [ ] Dividend tracking
- [ ] Tax-loss harvesting suggestions
- [ ] Rebalancing recommendations
- [ ] Multiple portfolios (IRA, taxable, etc.)
- [ ] Crypto support
- [ ] Real-time WebSocket updates
- [ ] Custom milestones
- [ ] Share goal progress (social features)

## Troubleshooting

**yfinance not fetching prices:**
- Check internet connection
- Verify symbol is valid (use Yahoo Finance website)
- Check rate limits (usually generous for personal use)

**Portfolio not loading:**
- Verify `data/portfolio.csv` exists
- Check CSV format (no extra commas/quotes)
- Check backend logs for errors

**Net worth seems wrong:**
- Verify transaction data is accurate
- Check portfolio holdings are correct
- Cash savings = total income - total expenses from last 6 months

**Prices outdated:**
- Click "Refresh Prices" button
- Restart backend to fetch latest prices

## API Examples

### Get Portfolio
```bash
curl http://localhost:8000/api/portfolio
```

Response:
```json
{
  "holdings": [...],
  "total_value": 20456.78,
  "total_cost": 18945.50,
  "total_gain_loss": 1511.28,
  "total_return_percent": 7.98,
  "allocation": {
    "stocks": {"value": 12500, "percent": 61.1},
    "etfs": {"value": 6200, "percent": 30.3},
    "bonds": {"value": 1756, "percent": 8.6}
  }
}
```

### Analyze Net Worth Goal
```bash
curl -X POST "http://localhost:8000/api/networth/goal?goal_amount=50000"
```

Response:
```json
{
  "current_net_worth": 22345.67,
  "goal_amount": 50000,
  "progress_percent": 44.69,
  "remaining": 27654.33,
  "months_to_goal": 94.3,
  "on_track": false,
  "next_milestone": {
    "percent": 50,
    "amount": 25000,
    "label": "🎯 Halfway Milestone!"
  },
  "milestones_achieved": [
    {"percent": 25, "amount": 12500, "label": "🌱 Quarter Way There!"}
  ]
}
```

## Motivational Copy

The UI includes encouraging messages based on progress:

**On Track (>50%)**:
- "🎉 You're Crushing It!"
- Green background
- Positive reinforcement

**Building (<50%)**:
- "💪 Keep Building!"
- Orange background
- Growth mindset messaging

**Milestones**:
- Visual celebration when achieved
- Clear next target
- Emoji rewards for gamification
- Realistic timeline estimates

This creates a positive feedback loop that encourages consistent saving and investing behavior.
