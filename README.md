# CashCompass

An AI-powered financial coaching application that provides insights, goal tracking, subscription management, portfolio tracking, and interactive financial guidance using the OpenAI api.

## Overview

CashCompass analyzes transaction history and investment portfolio to provide:
- **Real-time spending analytics** with visual dashboards
- **AI-generated insights** for spending patterns and trends
- **Income & savings analysis** with source breakdown
- **Goal tracking and forecasting** with personalized recommendations
- **Subscription detection** with heuristic scoring for gray charge identification
- **Portfolio tracking** with real-time stock prices via yfinance
- **Backtesting tools** for comparing investment strategies
- **Time Machine** for what-if financial scenarios
- **Interactive AI coach** for conversational financial guidance

## Tech Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **Pandas** - Data analytics and processing
- **NumPy** - Numerical computing for heuristic scoring
- **OpenAI API** - ChatGPT integration for natural language insights
- **yfinance** - Real-time stock price data

### Frontend
- **React** - UI framework
- **Vite** - Build tool and dev server
- **Chakra UI** - Component library
- **Recharts** - Data visualization
- **React Router** - Client-side routing

## Features

### 1. Dashboard
- Total income, expenses, and net savings overview
- Net worth tracking with milestone progress
- Spending breakdown by category (bar chart & pie chart)
- Monthly spending trends (line chart)
- Subscription summary with gray charge alerts

### 2. Financial Insights
- **Income Sources** - Breakdown by source with monthly averages
- **Savings Summary** - Monthly savings rate and trends
- **AI Portfolio Insight** - Risk/reward analysis of investments
- AI-generated financial health assessment
- Category-by-category spending analysis
- Trend detection (increasing, decreasing, stable)
- Unusual transaction identification (limited to top 5)

### 3. Goal Tracking
- Custom goal creation with category targeting
- Progress monitoring with visual indicators
- On-track/off-track status
- AI-powered improvement suggestions

### 4. Subscription Manager
- **Heuristic scoring system** for subscription detection
- Subscription score based on: transaction frequency, interval consistency, amount stability, category
- **Gray charge detection** for suspicious micro-fees
- Labels: `likely_subscription`, `possible_subscription`, `not_subscription`
- Tags: `gray_recurring_fee`, `micro_subscription`, `possibly_unused_subscription`
- Excluded categories: rent, groceries, gas, restaurants, utilities

### 5. Portfolio Tracker
- Real-time stock prices via yfinance
- Holdings table with cost basis, current value, return %
- Asset allocation pie chart (Stocks, ETFs, Bonds)
- AI-generated portfolio risk assessment
- **Backtesting tools:**
  - Preset allocations (60/40, S&P 500, Aggressive, Conservative, All Weather)
  - Custom stock/bond mix sliders
  - Multi-portfolio comparison with indicators (SMA, EMA)
  - Strategy comparison (Buy & Hold vs SMA Crossover)
- Performance metrics: Total Return, CAGR, Sharpe Ratio, Sortino Ratio, Max Drawdown

### 6. Time Machine
- What-if scenario modeling
- Adjust spending, income, and savings rates
- 12-month and 10-year projections
- Emergency fund and goal tracking

### 7. Financial Coach Chat
- Interactive AI conversation
- Context-aware responses using transaction data
- Suggested quick questions
- Real-time financial advice

## Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 18+
- OpenAI API key

### Backend Setup

1. Navigate to the backend directory:
```bash
cd panw-financial-coach/backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file:
```bash
cp .env.example .env
```

5. Add your OpenAI API key to `.env`:
```
OPENAI_API_KEY=your_actual_api_key_here
OPENAI_MODEL=gpt-4
CORS_ORIGINS=http://localhost:3000
```

6. Run the backend server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd panw-financial-coach/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## API Endpoints

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/transactions` | GET | Retrieve recent transactions |
| `/api/dashboard/summary` | GET | Get dashboard summary data |
| `/api/insights/spending` | GET | Get spending analytics + AI insights |
| `/api/insights/income` | GET | Get income sources and savings breakdown |
| `/api/insights/portfolio` | GET | Get AI portfolio risk assessment |
| `/api/insights/subscriptions` | GET | Detect subscriptions + AI analysis |
| `/api/insights/scoring` | GET | Get full heuristic scoring output |
| `/api/insights/goals` | POST | Analyze goal progress + AI recommendations |
| `/api/portfolio` | GET | Get portfolio holdings and allocation |
| `/api/portfolio/refresh` | POST | Refresh stock prices |
| `/api/networth` | GET | Get total net worth |
| `/api/coach` | POST | Interactive chat with AI coach |
| `/api/backtest/*` | Various | Backtesting endpoints |
| `/api/time-machine/*` | Various | Scenario projection endpoints |

## Heuristic Scoring System

The subscription detection uses a rule-based scoring system:

### Subscription Score (0-14 points)
- +2 if merchant has 3+ transactions
- +3 if interval is monthly (27-33 days) or weekly (6-8 days)
- +1 if interval standard deviation ≤ 3 days
- +2 if amount coefficient of variation ≤ 0.05
- +1 if average amount is $5-50 (typical subscription range)
- +1 if amount < $5 (micro subscription)
- +1 if category is entertainment, software, fitness, services, or education
- +1 if active for 90+ days with 3+ transactions
- +1 if price increased 5-20% (typical annual hikes)

### Labels
- `likely_subscription`: score ≥ 8
- `possible_subscription`: score 4-7
- `not_subscription`: score ≤ 3

### Gray Charge Detection
Separate scoring for suspicious small recurring fees based on amount, brand recognition, and frequency.

## Data Format

### Transactions (dylanData.csv)
```csv
date,merchant,category,amount,type,notes
2024-01-15,Netflix,Subscription,15.99,debit,Monthly streaming
2024-01-15,Employer,Income,3200.00,credit,Salary
```

### Portfolio (portfolio.csv)
```csv
symbol,shares,purchase_price,purchase_date,notes
AAPL,15,150.25,2024-01-15,Apple Inc. - Long term hold
VTI,25,220.00,2024-01-20,Vanguard Total Market ETF
```

### Contact
For questions or feedback, reach out @ dchapman.jp@gmail.com
