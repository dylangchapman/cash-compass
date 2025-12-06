import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from dataclasses import dataclass

@dataclass
class BacktestResult:
    strategy_name: str
    total_return: float
    cagr: float
    sharpe_ratio: float
    sortino_ratio: float
    max_drawdown: float
    volatility: float
    win_rate: float
    total_trades: int
    final_value: float
    equity_curve: List[Dict]

class BacktestingService:
    def __init__(self):
        self.risk_free_rate = 0.05  # 5% annual risk-free rate

    def fetch_historical_data(self, symbols: List[str], years: int = 5) -> Dict[str, pd.DataFrame]:
        """Fetch historical price data for given symbols"""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=years * 365)

        data = {}
        for symbol in symbols:
            try:
                ticker = yf.Ticker(symbol)
                df = ticker.history(start=start_date, end=end_date)
                if not df.empty:
                    df = df[['Open', 'High', 'Low', 'Close', 'Volume']]
                    df.index = pd.to_datetime(df.index)
                    data[symbol] = df
            except Exception as e:
                print(f"Error fetching {symbol}: {e}")

        return data

    def calculate_metrics(self, returns: pd.Series, initial_value: float = 10000) -> Dict:
        """Calculate performance metrics for a return series"""
        if returns.empty or len(returns) < 2:
            return self._empty_metrics()

        # Remove NaN values
        returns = returns.dropna()
        if returns.empty:
            return self._empty_metrics()

        # Calculate cumulative returns
        cumulative_returns = (1 + returns).cumprod()

        # Total return
        total_return = cumulative_returns.iloc[-1] - 1

        # CAGR (Compound Annual Growth Rate)
        years = len(returns) / 252  # Trading days
        if years > 0 and cumulative_returns.iloc[-1] > 0:
            cagr = (cumulative_returns.iloc[-1]) ** (1 / years) - 1
        else:
            cagr = 0

        # Volatility (annualized)
        volatility = returns.std() * np.sqrt(252)

        # Sharpe Ratio
        excess_returns = returns - (self.risk_free_rate / 252)
        if returns.std() > 0:
            sharpe = np.sqrt(252) * excess_returns.mean() / returns.std()
        else:
            sharpe = 0

        # Sortino Ratio (only downside volatility)
        downside_returns = returns[returns < 0]
        if len(downside_returns) > 0 and downside_returns.std() > 0:
            sortino = np.sqrt(252) * excess_returns.mean() / downside_returns.std()
        else:
            sortino = 0

        # Maximum Drawdown
        wealth_index = initial_value * cumulative_returns
        previous_peaks = wealth_index.cummax()
        drawdowns = (wealth_index - previous_peaks) / previous_peaks
        max_drawdown = drawdowns.min()

        # Win rate
        winning_days = (returns > 0).sum()
        total_days = len(returns)
        win_rate = winning_days / total_days if total_days > 0 else 0

        # Final value
        final_value = initial_value * cumulative_returns.iloc[-1]

        return {
            'total_return': float(total_return * 100),  # Percentage
            'cagr': float(cagr * 100),  # Percentage
            'sharpe_ratio': float(sharpe),
            'sortino_ratio': float(sortino),
            'max_drawdown': float(max_drawdown * 100),  # Percentage (negative)
            'volatility': float(volatility * 100),  # Percentage
            'win_rate': float(win_rate * 100),  # Percentage
            'final_value': float(final_value),
        }

    def _empty_metrics(self) -> Dict:
        return {
            'total_return': 0,
            'cagr': 0,
            'sharpe_ratio': 0,
            'sortino_ratio': 0,
            'max_drawdown': 0,
            'volatility': 0,
            'win_rate': 0,
            'final_value': 0,
        }

    def run_buy_and_hold(self, prices: pd.DataFrame, initial_capital: float = 10000) -> BacktestResult:
        """Simple buy and hold strategy"""
        if prices.empty:
            return self._empty_result('Buy & Hold')

        close = prices['Close']
        returns = close.pct_change().dropna()

        metrics = self.calculate_metrics(returns, initial_capital)

        # Generate equity curve
        cumulative = (1 + returns).cumprod()
        equity_curve = [
            {'date': str(date.date()), 'value': float(initial_capital * value)}
            for date, value in cumulative.items()
        ]

        # Sample to reduce data points (every 5th point)
        equity_curve = equity_curve[::5]

        return BacktestResult(
            strategy_name='Buy & Hold',
            total_return=metrics['total_return'],
            cagr=metrics['cagr'],
            sharpe_ratio=metrics['sharpe_ratio'],
            sortino_ratio=metrics['sortino_ratio'],
            max_drawdown=metrics['max_drawdown'],
            volatility=metrics['volatility'],
            win_rate=metrics['win_rate'],
            total_trades=1,
            final_value=metrics['final_value'],
            equity_curve=equity_curve
        )

    def run_sma_crossover(self, prices: pd.DataFrame, short_window: int = 50, long_window: int = 200, initial_capital: float = 10000) -> BacktestResult:
        """SMA Crossover strategy: Buy when short SMA crosses above long SMA, sell when it crosses below"""
        if prices.empty or len(prices) < long_window:
            return self._empty_result(f'SMA {short_window}/{long_window}')

        close = prices['Close']

        # Calculate SMAs
        short_sma = close.rolling(window=short_window).mean()
        long_sma = close.rolling(window=long_window).mean()

        # Generate signals
        signals = pd.DataFrame(index=prices.index)
        signals['price'] = close
        signals['short_sma'] = short_sma
        signals['long_sma'] = long_sma
        signals['signal'] = 0

        # 1 when short > long (buy), 0 otherwise
        signals.loc[short_sma > long_sma, 'signal'] = 1
        signals['positions'] = signals['signal'].diff()

        # Calculate returns
        signals['returns'] = close.pct_change()
        signals['strategy_returns'] = signals['signal'].shift(1) * signals['returns']

        # Drop NaN
        strategy_returns = signals['strategy_returns'].dropna()

        if strategy_returns.empty:
            return self._empty_result(f'SMA {short_window}/{long_window}')

        metrics = self.calculate_metrics(strategy_returns, initial_capital)

        # Count trades
        total_trades = int((signals['positions'].abs() > 0).sum())

        # Generate equity curve
        cumulative = (1 + strategy_returns).cumprod()
        equity_curve = [
            {'date': str(date.date()), 'value': float(initial_capital * value)}
            for date, value in cumulative.items()
        ]
        equity_curve = equity_curve[::5]  # Sample

        return BacktestResult(
            strategy_name=f'SMA {short_window}/{long_window}',
            total_return=metrics['total_return'],
            cagr=metrics['cagr'],
            sharpe_ratio=metrics['sharpe_ratio'],
            sortino_ratio=metrics['sortino_ratio'],
            max_drawdown=metrics['max_drawdown'],
            volatility=metrics['volatility'],
            win_rate=metrics['win_rate'],
            total_trades=total_trades,
            final_value=metrics['final_value'],
            equity_curve=equity_curve
        )

    def run_portfolio_allocation(self, allocation: Dict[str, float], years: int = 5, initial_capital: float = 10000) -> BacktestResult:
        """
        Run backtest for a portfolio allocation.
        allocation: Dict mapping symbols to weights (e.g., {'SPY': 0.6, 'BND': 0.4})
        """
        symbols = list(allocation.keys())
        weights = list(allocation.values())

        # Normalize weights
        total_weight = sum(weights)
        weights = [w / total_weight for w in weights]

        # Fetch data
        data = self.fetch_historical_data(symbols, years)

        if not data:
            return self._empty_result('Portfolio')

        # Align dates and calculate portfolio returns
        price_df = pd.DataFrame()
        for symbol in symbols:
            if symbol in data:
                price_df[symbol] = data[symbol]['Close']

        if price_df.empty:
            return self._empty_result('Portfolio')

        # Forward fill missing values and drop remaining NaN
        price_df = price_df.ffill().dropna()

        if price_df.empty:
            return self._empty_result('Portfolio')

        # Calculate returns
        returns_df = price_df.pct_change().dropna()

        # Portfolio returns (weighted average)
        portfolio_returns = pd.Series(0, index=returns_df.index, dtype=float)
        for i, symbol in enumerate(symbols):
            if symbol in returns_df.columns:
                portfolio_returns += weights[i] * returns_df[symbol]

        metrics = self.calculate_metrics(portfolio_returns, initial_capital)

        # Generate equity curve
        cumulative = (1 + portfolio_returns).cumprod()
        equity_curve = [
            {'date': str(date.date()), 'value': float(initial_capital * value)}
            for date, value in cumulative.items()
        ]
        equity_curve = equity_curve[::5]  # Sample

        # Strategy name based on allocation
        strategy_name = ' / '.join([f"{s} {int(w*100)}%" for s, w in zip(symbols, weights)])

        return BacktestResult(
            strategy_name=strategy_name,
            total_return=metrics['total_return'],
            cagr=metrics['cagr'],
            sharpe_ratio=metrics['sharpe_ratio'],
            sortino_ratio=metrics['sortino_ratio'],
            max_drawdown=metrics['max_drawdown'],
            volatility=metrics['volatility'],
            win_rate=metrics['win_rate'],
            total_trades=1,  # Rebalancing not implemented
            final_value=metrics['final_value'],
            equity_curve=equity_curve
        )

    def _empty_result(self, strategy_name: str) -> BacktestResult:
        return BacktestResult(
            strategy_name=strategy_name,
            total_return=0,
            cagr=0,
            sharpe_ratio=0,
            sortino_ratio=0,
            max_drawdown=0,
            volatility=0,
            win_rate=0,
            total_trades=0,
            final_value=0,
            equity_curve=[]
        )

    def get_preset_allocations(self) -> Dict[str, Dict[str, float]]:
        """Return preset portfolio allocations"""
        return {
            '60_40': {
                'name': '60/40 Stock/Bond',
                'description': 'Classic balanced portfolio with 60% stocks, 40% bonds',
                'allocation': {'SPY': 0.6, 'BND': 0.4}
            },
            'sp500': {
                'name': 'S&P 500 Only',
                'description': '100% invested in S&P 500 index',
                'allocation': {'SPY': 1.0}
            },
            'aggressive': {
                'name': 'Aggressive Growth',
                'description': '80% stocks, 10% international, 10% bonds',
                'allocation': {'SPY': 0.8, 'VEU': 0.1, 'BND': 0.1}
            },
            'conservative': {
                'name': 'Conservative',
                'description': '40% stocks, 60% bonds',
                'allocation': {'SPY': 0.4, 'BND': 0.6}
            },
            'all_weather': {
                'name': 'All Weather',
                'description': 'Ray Dalio inspired diversified allocation',
                'allocation': {'SPY': 0.3, 'TLT': 0.4, 'IEI': 0.15, 'GLD': 0.075, 'DBC': 0.075}
            }
        }

    def compare_strategies(self, symbol: str = 'SPY', years: int = 5, initial_capital: float = 10000) -> Dict:
        """Compare buy-and-hold vs SMA crossover strategies"""
        data = self.fetch_historical_data([symbol], years)

        if symbol not in data or data[symbol].empty:
            return {
                'error': f'No data available for {symbol}',
                'strategies': []
            }

        prices = data[symbol]

        # Run strategies
        buy_hold = self.run_buy_and_hold(prices, initial_capital)
        sma_50_200 = self.run_sma_crossover(prices, 50, 200, initial_capital)
        sma_20_50 = self.run_sma_crossover(prices, 20, 50, initial_capital)

        return {
            'symbol': symbol,
            'period_years': years,
            'initial_capital': initial_capital,
            'strategies': [
                self._result_to_dict(buy_hold),
                self._result_to_dict(sma_50_200),
                self._result_to_dict(sma_20_50),
            ]
        }

    def _result_to_dict(self, result: BacktestResult) -> Dict:
        return {
            'strategy_name': result.strategy_name,
            'total_return': result.total_return,
            'cagr': result.cagr,
            'sharpe_ratio': result.sharpe_ratio,
            'sortino_ratio': result.sortino_ratio,
            'max_drawdown': result.max_drawdown,
            'volatility': result.volatility,
            'win_rate': result.win_rate,
            'total_trades': result.total_trades,
            'final_value': result.final_value,
            'equity_curve': result.equity_curve
        }

    def backtest_allocation(self, preset: str = '60_40', years: int = 5, initial_capital: float = 10000) -> Dict:
        """Run backtest for a preset allocation"""
        presets = self.get_preset_allocations()

        if preset not in presets:
            return {'error': f'Unknown preset: {preset}'}

        preset_info = presets[preset]
        result = self.run_portfolio_allocation(preset_info['allocation'], years, initial_capital)

        return {
            'preset': preset,
            'name': preset_info['name'],
            'description': preset_info['description'],
            'allocation': preset_info['allocation'],
            'period_years': years,
            'initial_capital': initial_capital,
            'result': self._result_to_dict(result)
        }

# Singleton instance
backtesting_service = BacktestingService()
