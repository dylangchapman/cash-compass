import pandas as pd
import yfinance as yf
from datetime import datetime
from typing import Dict, List
from config import settings
import os

class PortfolioService:
    def __init__(self):
        self.portfolio_path = os.path.join(os.path.dirname(__file__), "..", "data", "portfolio.csv")
        self.df = None
        self.current_prices = {}
        self.load_portfolio()
        self.update_prices()

    def load_portfolio(self):
        """Load portfolio from CSV"""
        try:
            self.df = pd.read_csv(self.portfolio_path)
            self.df['purchase_date'] = pd.to_datetime(self.df['purchase_date'])
        except Exception as e:
            print(f"Error loading portfolio: {e}")
            self.df = pd.DataFrame()

    def update_prices(self):
        """Fetch current prices from yfinance"""
        if self.df.empty:
            return

        symbols = self.df['symbol'].unique().tolist()

        try:
            # Fetch data for all symbols at once
            tickers = yf.Tickers(' '.join(symbols))

            for symbol in symbols:
                try:
                    ticker = tickers.tickers[symbol]
                    info = ticker.info

                    # Get current price (try multiple fields)
                    current_price = (
                        info.get('currentPrice') or
                        info.get('regularMarketPrice') or
                        info.get('previousClose')
                    )

                    self.current_prices[symbol] = {
                        'price': current_price,
                        'name': info.get('longName', symbol),
                        'change': info.get('regularMarketChangePercent', 0),
                        'currency': info.get('currency', 'USD')
                    }
                except Exception as e:
                    print(f"Error fetching {symbol}: {e}")
                    # Use purchase price as fallback
                    purchase_price = self.df[self.df['symbol'] == symbol]['purchase_price'].iloc[0]
                    self.current_prices[symbol] = {
                        'price': purchase_price,
                        'name': symbol,
                        'change': 0,
                        'currency': 'USD'
                    }
        except Exception as e:
            print(f"Error updating prices: {e}")

    def get_portfolio_summary(self) -> Dict:
        """Calculate portfolio value and returns"""
        if self.df.empty:
            return self._empty_summary()

        holdings = []
        total_value = 0
        total_cost = 0

        for _, row in self.df.iterrows():
            symbol = row['symbol']
            shares = row['shares']
            purchase_price = row['purchase_price']

            price_data = self.current_prices.get(symbol, {})
            current_price = price_data.get('price', purchase_price)

            cost_basis = shares * purchase_price
            current_value = shares * current_price
            gain_loss = current_value - cost_basis
            gain_loss_percent = (gain_loss / cost_basis * 100) if cost_basis > 0 else 0

            holdings.append({
                'symbol': symbol,
                'name': price_data.get('name', symbol),
                'shares': float(shares),
                'purchase_price': float(purchase_price),
                'current_price': float(current_price),
                'cost_basis': float(cost_basis),
                'current_value': float(current_value),
                'gain_loss': float(gain_loss),
                'gain_loss_percent': float(gain_loss_percent),
                'day_change': float(price_data.get('change', 0)),
                'purchase_date': row['purchase_date'].strftime('%Y-%m-%d'),
                'notes': row.get('notes', '')
            })

            total_value += current_value
            total_cost += cost_basis

        total_gain_loss = total_value - total_cost
        total_return_percent = (total_gain_loss / total_cost * 100) if total_cost > 0 else 0

        # Calculate allocation by type
        allocation = self._calculate_allocation(holdings)

        return {
            'holdings': holdings,
            'total_value': float(total_value),
            'total_cost': float(total_cost),
            'total_gain_loss': float(total_gain_loss),
            'total_return_percent': float(total_return_percent),
            'allocation': allocation,
            'last_updated': datetime.now().isoformat()
        }

    def _calculate_allocation(self, holdings: List[Dict]) -> Dict:
        """Calculate portfolio allocation by asset type"""
        stocks = ['AAPL', 'PANW', 'GOOGL', 'NVDA', 'TSLA', 'SNDK', 'LITE', 'COHR', 'MU']
        etfs = ['VTI', 'VOO']
        bonds = ['BND']

        stock_value = sum(h['current_value'] for h in holdings if h['symbol'] in stocks)
        etf_value = sum(h['current_value'] for h in holdings if h['symbol'] in etfs)
        bond_value = sum(h['current_value'] for h in holdings if h['symbol'] in bonds)
        total = stock_value + etf_value + bond_value

        return {
            'stocks': {
                'value': float(stock_value),
                'percent': float((stock_value / total * 100) if total > 0 else 0)
            },
            'etfs': {
                'value': float(etf_value),
                'percent': float((etf_value / total * 100) if total > 0 else 0)
            },
            'bonds': {
                'value': float(bond_value),
                'percent': float((bond_value / total * 100) if total > 0 else 0)
            }
        }

    def get_net_worth(self, cash_savings: float) -> Dict:
        """Calculate total net worth including cash and investments"""
        portfolio = self.get_portfolio_summary()
        portfolio_value = portfolio['total_value']
        total_net_worth = cash_savings + portfolio_value

        return {
            'total_net_worth': float(total_net_worth),
            'cash_savings': float(cash_savings),
            'portfolio_value': float(portfolio_value),
            'portfolio_percent': float((portfolio_value / total_net_worth * 100) if total_net_worth > 0 else 0),
            'cash_percent': float((cash_savings / total_net_worth * 100) if total_net_worth > 0 else 0)
        }

    def calculate_net_worth_goal_progress(self, cash_savings: float, goal_amount: float) -> Dict:
        """Calculate progress toward net worth goal"""
        net_worth_data = self.get_net_worth(cash_savings)
        current = net_worth_data['total_net_worth']

        progress_percent = (current / goal_amount * 100) if goal_amount > 0 else 0
        remaining = max(0, goal_amount - current)

        # Calculate months to goal based on average savings rate
        # This could be enhanced with actual savings data
        monthly_savings_estimate = cash_savings / 6  # Rough estimate from 6 months data
        months_to_goal = (remaining / monthly_savings_estimate) if monthly_savings_estimate > 0 else 0

        # Motivational milestones
        milestones = self._get_milestones(goal_amount)
        next_milestone = next((m for m in milestones if m['amount'] > current), None)

        return {
            'current_net_worth': float(current),
            'goal_amount': float(goal_amount),
            'progress_percent': float(progress_percent),
            'remaining': float(remaining),
            'months_to_goal': float(months_to_goal),
            'on_track': progress_percent >= 50,  # Simple heuristic
            'next_milestone': next_milestone,
            'milestones_achieved': [m for m in milestones if m['amount'] <= current]
        }

    def _get_milestones(self, goal_amount: float) -> List[Dict]:
        """Generate motivational milestones"""
        milestones = []
        percentages = [25, 50, 75, 90, 100]

        for pct in percentages:
            amount = goal_amount * (pct / 100)
            milestones.append({
                'percent': pct,
                'amount': float(amount),
                'label': self._get_milestone_label(pct)
            })

        return milestones

    def _get_milestone_label(self, percent: int) -> str:
        """Get encouraging milestone labels"""
        labels = {
            25: "Quarter Way There!",
            50: "Halfway Milestone!",
            75: "Three Quarters Complete!",
            90: "Almost There!",
            100: "Goal Achieved!"
        }
        return labels.get(percent, f"{percent}% Complete")

    def _empty_summary(self) -> Dict:
        """Return empty summary when no portfolio"""
        return {
            'holdings': [],
            'total_value': 0,
            'total_cost': 0,
            'total_gain_loss': 0,
            'total_return_percent': 0,
            'allocation': {
                'stocks': {'value': 0, 'percent': 0},
                'etfs': {'value': 0, 'percent': 0},
                'bonds': {'value': 0, 'percent': 0}
            },
            'last_updated': datetime.now().isoformat()
        }

portfolio_service = PortfolioService()
