# CashCompass Documentation

## Architecture Diagram

![CashCompass Architecture](CashCompassDiagram.png)

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

## Future Improvements

### 1. Self-Hosted LLM Integration
Replace OpenAI API dependency with self-hosted open-source models for complete data privacy. Financial data would never leave the server, reducing costs and enabling offline capability. Offer an opt-out AI clause.

### 2. Secure Authentication
Migrate from CSV-based auth to production-ready security:
- OAuth 2.0 / OpenID Connect with identity providers
- JWT tokens with refresh rotation
- TOTP-based two-factor authentication

### 3. Database Migration (PostgreSQL/MySQL)
Replace CSV storage with a relational database for:
- Multi-user support with data isolation
- ACID compliance and transaction integrity
- Complex analytical queries
- Proper backup and replication

### 4. ML-Based Transaction Classification
Upgrade from heuristic scoring to machine learning:
- **Subscription Detection**: Gradient boosted trees trained on user-labeled data
- **Category Prediction**: Fine-tuned model for automatic merchant categorization
- **Anomaly Detection**: Isolation Forest for flagging unusual transactions
- Active learning loop where user corrections improve model accuracy over time

## Video
[Link to presentation video](https://youtu.be/nPSECGk6Shg)

## Contact
For questions or feedback, reach out @ dchapman.jp@gmail.com
