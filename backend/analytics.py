import pandas as pd
from datetime import datetime
from typing import List, Dict
from models import Transaction, SpendingInsight, CategoryTrend, Subscription, AnalyticsSummary
from config import settings

class FinancialAnalytics:
    def __init__(self):
        self.df = None
        self.load_data()

    def load_data(self):
        """Load transaction data from CSV"""
        try:
            self.df = pd.read_csv(settings.DATA_PATH)
            self.df['date'] = pd.to_datetime(self.df['date'])
            self.df['month'] = self.df['date'].dt.to_period('M')
            self.df['amount'] = pd.to_numeric(self.df['amount'])
        except Exception as e:
            print(f"Error loading data: {e}")
            self.df = pd.DataFrame()

    def get_transactions(self, limit: int = 100) -> List[Transaction]:
        """Get recent transactions"""
        if self.df.empty:
            return []

        recent = self.df.sort_values('date', ascending=False).head(limit)
        return [
            Transaction(
                date=row['date'].strftime('%Y-%m-%d'),
                merchant=row['merchant'],
                category=row['category'],
                amount=float(row['amount']),
                type=row['type'],
                notes=row.get('notes', '')
            )
            for _, row in recent.iterrows()
        ]

    def get_spending_insights(self) -> AnalyticsSummary:
        """Compute comprehensive spending analytics"""
        if self.df.empty:
            return self._empty_summary()

        # Calculate totals
        income_df = self.df[self.df['type'] == 'credit']
        expense_df = self.df[self.df['type'] == 'debit']

        total_income = income_df['amount'].sum()
        total_expenses = expense_df['amount'].sum()
        net_savings = total_income - total_expenses

        # Monthly spending average
        monthly_expenses = expense_df.groupby('month')['amount'].sum()
        avg_monthly_spending = monthly_expenses.mean()

        # Category breakdown with trends
        category_spending = expense_df.groupby('category')['amount'].sum().sort_values(ascending=False)
        total_spending = category_spending.sum()

        spending_insights = []
        for category, amount in category_spending.items():
            trend_data = self._calculate_trend(category)
            spending_insights.append(
                SpendingInsight(
                    category=category,
                    total=float(amount),
                    percentage=float(amount / total_spending * 100),
                    trend=trend_data['direction'],
                    change_percent=trend_data.get('change_percent')
                )
            )

        # Get trends over time
        trends = self._get_category_trends()

        # Detect anomalies
        anomalies = self._detect_anomalies()

        return AnalyticsSummary(
            total_income=float(total_income),
            total_expenses=float(total_expenses),
            net_savings=float(net_savings),
            avg_monthly_spending=float(avg_monthly_spending),
            spending_by_category=spending_insights,
            trends=trends,
            anomalies=anomalies
        )

    def _calculate_trend(self, category: str) -> Dict:
        """Calculate spending trend for a category"""
        if self.df.empty:
            return {"direction": "stable", "change_percent": 0}

        expense_df = self.df[(self.df['type'] == 'debit') & (self.df['category'] == category)]
        monthly = expense_df.groupby('month')['amount'].sum()

        if len(monthly) < 2:
            return {"direction": "stable", "change_percent": 0}

        # Compare last month to previous month
        last_month = monthly.iloc[-1]
        prev_month = monthly.iloc[-2]

        if prev_month == 0:
            return {"direction": "stable", "change_percent": 0}

        change_percent = ((last_month - prev_month) / prev_month) * 100

        if change_percent > 10:
            direction = "increasing"
        elif change_percent < -10:
            direction = "decreasing"
        else:
            direction = "stable"

        return {"direction": direction, "change_percent": float(change_percent)}

    def _get_category_trends(self) -> List[CategoryTrend]:
        """Get monthly trends for top categories"""
        if self.df.empty:
            return []

        expense_df = self.df[self.df['type'] == 'debit']
        top_categories = expense_df.groupby('category')['amount'].sum().nlargest(6).index

        trends = []
        for category in top_categories:
            cat_df = expense_df[expense_df['category'] == category]
            monthly = cat_df.groupby('month')['amount'].sum()

            monthly_data = [
                {"month": str(month), "amount": float(amount)}
                for month, amount in monthly.items()
            ]

            trends.append(CategoryTrend(
                category=category,
                monthly_data=monthly_data
            ))

        return trends

    def _detect_anomalies(self) -> List[Dict]:
        """Detect unusual transactions"""
        if self.df.empty:
            return []

        expense_df = self.df[self.df['type'] == 'debit']
        anomalies = []

        # Group by category and find outliers
        for category in expense_df['category'].unique():
            cat_df = expense_df[expense_df['category'] == category]
            mean = cat_df['amount'].mean()
            std = cat_df['amount'].std()

            if std == 0:
                continue

            # Transactions > 2 standard deviations
            outliers = cat_df[cat_df['amount'] > mean + 2 * std]

            for _, row in outliers.iterrows():
                anomalies.append({
                    "date": row['date'].strftime('%Y-%m-%d'),
                    "merchant": row['merchant'],
                    "category": category,
                    "amount": float(row['amount']),
                    "avg_for_category": float(mean),
                    "deviation": float((row['amount'] - mean) / std)
                })

        # Also check notes for anomaly indicators
        anomaly_notes = expense_df[expense_df['notes'].str.contains('Anomaly|anomaly', na=False, case=False)]
        for _, row in anomaly_notes.iterrows():
            if not any(a['merchant'] == row['merchant'] and a['date'] == row['date'].strftime('%Y-%m-%d') for a in anomalies):
                anomalies.append({
                    "date": row['date'].strftime('%Y-%m-%d'),
                    "merchant": row['merchant'],
                    "category": row['category'],
                    "amount": float(row['amount']),
                    "note": row['notes']
                })

        return sorted(anomalies, key=lambda x: x['amount'], reverse=True)

    def detect_subscriptions(self) -> List[Subscription]:
        """Detect recurring charges and potential gray charges"""
        if self.df.empty:
            return []

        expense_df = self.df[self.df['type'] == 'debit']
        merchant_counts = expense_df['merchant'].value_counts()

        subscriptions = []

        for merchant, count in merchant_counts.items():
            if count >= 3:  # Appears at least 3 times
                merchant_df = expense_df[expense_df['merchant'] == merchant]
                amounts = merchant_df['amount'].unique()

                # Check if amounts are consistent (subscription-like)
                if len(amounts) <= 2:  # Same or very similar amounts
                    avg_amount = merchant_df['amount'].mean()
                    total_spent = merchant_df['amount'].sum()
                    last_charge = merchant_df['date'].max().strftime('%Y-%m-%d')

                    # Check for gray charge indicators
                    notes = merchant_df['notes'].str.lower().fillna('')
                    is_gray = any('gray' in n or 'trial' in n or 'suspicious' in n or 'protection' in n for n in notes)

                    # Determine confidence
                    if count >= 5 and len(amounts) == 1:
                        confidence = "high"
                    elif count >= 3:
                        confidence = "medium"
                    else:
                        confidence = "low"

                    subscriptions.append(Subscription(
                        merchant=merchant,
                        amount=float(avg_amount),
                        frequency="monthly" if count >= 4 else "recurring",
                        last_charge=last_charge,
                        total_spent=float(total_spent),
                        is_gray_charge=is_gray,
                        confidence=confidence
                    ))

        return sorted(subscriptions, key=lambda x: x.total_spent, reverse=True)

    def calculate_goal_status(self, goal_name: str, target: float, category: str = None) -> Dict:
        """Calculate progress toward a financial goal"""
        if self.df.empty:
            return {}

        expense_df = self.df[self.df['type'] == 'debit']

        if category:
            relevant = expense_df[expense_df['category'] == category]
        else:
            relevant = expense_df

        # Calculate current spending
        monthly_spending = relevant.groupby('month')['amount'].sum()
        current_avg = monthly_spending.mean()

        # Trend analysis
        if len(monthly_spending) >= 2:
            recent_avg = monthly_spending.tail(2).mean()
            trend = "improving" if recent_avg < current_avg else "worsening"
        else:
            recent_avg = current_avg
            trend = "stable"

        progress_percent = (current_avg / target * 100) if target > 0 else 0
        status = "on-track" if current_avg <= target else "off-track"

        # Generate forecast
        if status == "on-track":
            forecast = f"Maintaining current spending keeps you under ${target:.2f}/month target"
        else:
            overage = current_avg - target
            forecast = f"Currently ${overage:.2f}/month over target. Reduce spending by {(overage/current_avg*100):.1f}% to reach goal"

        return {
            "goal_name": goal_name,
            "target": target,
            "current": float(current_avg),
            "progress_percent": float(progress_percent),
            "status": status,
            "forecast": forecast,
            "trend": trend
        }

    def _empty_summary(self) -> AnalyticsSummary:
        """Return empty summary when no data"""
        return AnalyticsSummary(
            total_income=0,
            total_expenses=0,
            net_savings=0,
            avg_monthly_spending=0,
            spending_by_category=[],
            trends=[],
            anomalies=[]
        )

analytics = FinancialAnalytics()
