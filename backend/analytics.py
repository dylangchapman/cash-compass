import pandas as pd
import numpy as np
from datetime import datetime
from typing import List, Dict, Optional
from models import (
    Transaction, SpendingInsight, CategoryTrend, Subscription, AnalyticsSummary,
    MerchantFeatures, AnnotatedTransaction, ScoringOutput
)
from config import settings

# ============================================================================
# HEURISTIC SCORING CONSTANTS - Easy to tweak
# ============================================================================

# Subscription scoring weights
SUB_MIN_TXNS = 3
SUB_MONTHLY_INTERVAL_RANGE = (27, 33)
SUB_WEEKLY_INTERVAL_RANGE = (6, 8)
SUB_STD_INTERVAL_THRESHOLD = 3
SUB_AMOUNT_CV_THRESHOLD = 0.05
SUB_AMOUNT_RANGE = (5, 50)
SUB_MICRO_AMOUNT_THRESHOLD = 5
SUB_ACTIVE_DAYS_THRESHOLD = 90
SUB_PRICE_INCREASE_RANGE = (0.05, 0.20)
SUB_CATEGORIES = {'entertainment', 'software', 'fitness', 'services', 'education', 'subscription'}

# Subscription label thresholds
SUB_LIKELY_THRESHOLD = 8
SUB_POSSIBLE_THRESHOLD = 4

# Gray scoring weights
GRAY_MICRO_AMOUNT_THRESHOLD = 5
GRAY_SPEND_RATIO_RANGE = (0.001, 0.02)
GRAY_INTERVAL_RANGE = (25, 45)
GRAY_HIGH_FREQ_TXNS = 6
GRAY_HIGH_FREQ_AMOUNT = 3
GRAY_LONG_ACTIVE_DAYS = 180
GRAY_LONG_ACTIVE_AMOUNT = 10

# Gray tag thresholds
GRAY_TAG_THRESHOLD = 5
GRAY_POSSIBLY_TAG_THRESHOLD = 3

# Known brands allowlist (case-insensitive)
KNOWN_BRANDS = {
    'netflix', 'spotify', 'amazon', 'adobe', 'safeway', 'starbucks',
    'planetfitness', 'apple', 'google', 'microsoft', 'walmart', 'target',
    'costco', 'hulu', 'disney', 'hbo', 'gym membership', 'trader joe'
}


def normalize_merchant(merchant: str) -> str:
    """Normalize merchant name for matching"""
    return merchant.lower().strip().replace("'", "").replace("-", " ")


def is_known_brand(merchant_norm: str) -> bool:
    """Check if merchant is in known brands allowlist"""
    for brand in KNOWN_BRANDS:
        if brand in merchant_norm:
            return True
    return False


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
            # Ensure notes column exists and fill NaN
            if 'notes' not in self.df.columns:
                self.df['notes'] = ''
            self.df['notes'] = self.df['notes'].fillna('')
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

    def get_transactions_by_category(self, category: str, limit: int = 500) -> List[Transaction]:
        """Get transactions filtered by category"""
        if self.df.empty:
            return []

        filtered = self.df[self.df['category'].str.lower() == category.lower()]
        recent = filtered.sort_values('date', ascending=False).head(limit)
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

        income_df = self.df[self.df['type'] == 'credit']
        expense_df = self.df[self.df['type'] == 'debit']

        total_income = income_df['amount'].sum()
        total_expenses = expense_df['amount'].sum()
        net_savings = total_income - total_expenses

        monthly_expenses = expense_df.groupby('month')['amount'].sum()
        avg_monthly_spending = monthly_expenses.mean()

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

        trends = self._get_category_trends()
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

        for category in expense_df['category'].unique():
            cat_df = expense_df[expense_df['category'] == category]
            mean = cat_df['amount'].mean()
            std = cat_df['amount'].std()

            if std == 0:
                continue

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

    # ========================================================================
    # HEURISTIC SCORING SYSTEM
    # ========================================================================

    def compute_merchant_features(self) -> pd.DataFrame:
        """Compute per-merchant features for subscription detection"""
        if self.df.empty:
            return pd.DataFrame()

        expense_df = self.df[self.df['type'] == 'debit'].copy()
        expense_df = expense_df.sort_values('date')

        merchant_features = []

        for merchant in expense_df['merchant'].unique():
            m_df = expense_df[expense_df['merchant'] == merchant].copy()
            m_df = m_df.sort_values('date')

            num_txns = len(m_df)
            amounts = m_df['amount'].values
            dates = m_df['date'].values

            # Interval calculations
            if num_txns >= 2:
                intervals = np.diff(dates).astype('timedelta64[D]').astype(float)
                mean_interval = float(np.mean(intervals))
                std_interval = float(np.std(intervals)) if len(intervals) > 1 else 0.0
            else:
                mean_interval = None
                std_interval = None

            # Amount statistics
            amount_mean = float(np.mean(amounts))
            amount_std = float(np.std(amounts))
            amount_cv = (amount_std / amount_mean) if amount_mean > 0 else None

            # Active days
            active_days = int((dates[-1] - dates[0]) / np.timedelta64(1, 'D')) if num_txns >= 2 else 0

            # Price increase
            first_amount = float(amounts[0])
            last_amount = float(amounts[-1])
            if first_amount > 0 and num_txns >= 2:
                price_increase_pct = (last_amount - first_amount) / first_amount
            else:
                price_increase_pct = None

            # Category mode
            category = m_df['category'].mode().iloc[0] if not m_df['category'].mode().empty else 'Unknown'

            merchant_features.append({
                'merchant': merchant,
                'merchant_norm': normalize_merchant(merchant),
                'num_txns': num_txns,
                'mean_interval_days': mean_interval,
                'std_interval_days': std_interval,
                'amount_mean': amount_mean,
                'amount_std': amount_std,
                'amount_cv': amount_cv,
                'active_days': active_days,
                'price_increase_pct': price_increase_pct,
                'category': category
            })

        return pd.DataFrame(merchant_features)

    def compute_subscription_score(self, row: pd.Series) -> int:
        """Compute subscription score for a merchant"""
        score = 0

        # +2 if num_txns >= 3
        if row['num_txns'] >= SUB_MIN_TXNS:
            score += 2

        # +3 if monthly interval (27-33 days)
        if row['mean_interval_days'] is not None:
            if SUB_MONTHLY_INTERVAL_RANGE[0] <= row['mean_interval_days'] <= SUB_MONTHLY_INTERVAL_RANGE[1]:
                score += 3

        # +3 if weekly interval (6-8 days)
        if row['mean_interval_days'] is not None:
            if SUB_WEEKLY_INTERVAL_RANGE[0] <= row['mean_interval_days'] <= SUB_WEEKLY_INTERVAL_RANGE[1]:
                score += 3

        # +1 if std_interval <= 3 and not NaN
        if row['std_interval_days'] is not None and not np.isnan(row['std_interval_days']):
            if row['std_interval_days'] <= SUB_STD_INTERVAL_THRESHOLD:
                score += 1

        # +2 if amount_cv <= 0.05 and not NaN
        if row['amount_cv'] is not None and not np.isnan(row['amount_cv']):
            if row['amount_cv'] <= SUB_AMOUNT_CV_THRESHOLD:
                score += 2

        # +1 if 5 <= amount_mean <= 50
        if SUB_AMOUNT_RANGE[0] <= row['amount_mean'] <= SUB_AMOUNT_RANGE[1]:
            score += 1

        # +1 if amount_mean < 5 (micro sub)
        if row['amount_mean'] < SUB_MICRO_AMOUNT_THRESHOLD:
            score += 1

        # +1 if category in subscription categories
        if row['category'].lower() in SUB_CATEGORIES:
            score += 1

        # +1 if active_days >= 90 and num_txns >= 3
        if row['active_days'] >= SUB_ACTIVE_DAYS_THRESHOLD and row['num_txns'] >= SUB_MIN_TXNS:
            score += 1

        # +1 if price increase between 5-20%
        if row['price_increase_pct'] is not None and not np.isnan(row['price_increase_pct']):
            if SUB_PRICE_INCREASE_RANGE[0] <= row['price_increase_pct'] <= SUB_PRICE_INCREASE_RANGE[1]:
                score += 1

        return score

    def compute_gray_score(self, row: pd.Series, avg_monthly_spend: float) -> int:
        """Compute gray recurring fee score for a merchant"""
        score = 0

        # +2 if amount_mean < 5
        if row['amount_mean'] < GRAY_MICRO_AMOUNT_THRESHOLD:
            score += 2

        # +1 if amount is 0.1%-2% of monthly spend
        if avg_monthly_spend > 0:
            spend_ratio = row['amount_mean'] / avg_monthly_spend
            if GRAY_SPEND_RATIO_RANGE[0] <= spend_ratio <= GRAY_SPEND_RATIO_RANGE[1]:
                score += 1

        # +2 if not a known brand
        if not is_known_brand(row['merchant_norm']):
            score += 2

        # +2 if interval 25-45 days and amount < 5
        if row['mean_interval_days'] is not None:
            if GRAY_INTERVAL_RANGE[0] <= row['mean_interval_days'] <= GRAY_INTERVAL_RANGE[1]:
                if row['amount_mean'] < GRAY_MICRO_AMOUNT_THRESHOLD:
                    score += 2

        # +2 if num_txns >= 6 and amount < 3
        if row['num_txns'] >= GRAY_HIGH_FREQ_TXNS and row['amount_mean'] < GRAY_HIGH_FREQ_AMOUNT:
            score += 2

        # +1 if active_days > 180 and amount < 10
        if row['active_days'] > GRAY_LONG_ACTIVE_DAYS and row['amount_mean'] < GRAY_LONG_ACTIVE_AMOUNT:
            score += 1

        return score

    def compute_label(self, subscription_score: int) -> str:
        """Compute subscription label from score"""
        if subscription_score >= SUB_LIKELY_THRESHOLD:
            return "likely_subscription"
        elif subscription_score >= SUB_POSSIBLE_THRESHOLD:
            return "possible_subscription"
        else:
            return "not_subscription"

    def compute_tags(self, row: pd.Series) -> List[str]:
        """Compute tags for a merchant"""
        tags = []
        label = row['label']
        gray_score = row['gray_score']
        amount_mean = row['amount_mean']
        category = row['category'].lower()

        # Gray recurring fee tags
        if label in {"likely_subscription", "possible_subscription"}:
            if gray_score >= GRAY_TAG_THRESHOLD:
                tags.append("gray_recurring_fee")
            elif gray_score >= GRAY_POSSIBLY_TAG_THRESHOLD:
                tags.append("possibly_gray_recurring_fee")

        # Micro subscription tag
        if label != "not_subscription" and amount_mean < SUB_MICRO_AMOUNT_THRESHOLD:
            tags.append("micro_subscription")

        # Possibly unused subscription tag
        if label == "likely_subscription" and category in {"fitness", "education"}:
            tags.append("possibly_unused_subscription")

        return tags

    def run_heuristic_scoring(self) -> ScoringOutput:
        """Run the complete heuristic scoring pipeline"""
        if self.df.empty:
            return ScoringOutput(merchants=[], transactions=[])

        # Compute average monthly spend for gray score calculation
        expense_df = self.df[self.df['type'] == 'debit']
        monthly_expenses = expense_df.groupby('month')['amount'].sum()
        avg_monthly_spend = float(monthly_expenses.mean()) if len(monthly_expenses) > 0 else 0

        # Compute merchant features
        merchant_df = self.compute_merchant_features()
        if merchant_df.empty:
            return ScoringOutput(merchants=[], transactions=[])

        # Compute scores
        merchant_df['subscription_score'] = merchant_df.apply(self.compute_subscription_score, axis=1)
        merchant_df['gray_score'] = merchant_df.apply(
            lambda row: self.compute_gray_score(row, avg_monthly_spend), axis=1
        )
        merchant_df['label'] = merchant_df['subscription_score'].apply(self.compute_label)
        merchant_df['tags'] = merchant_df.apply(self.compute_tags, axis=1)

        # Build merchant features list
        merchants = []
        for _, row in merchant_df.iterrows():
            merchants.append(MerchantFeatures(
                merchant=row['merchant'],
                merchant_norm=row['merchant_norm'],
                num_txns=int(row['num_txns']),
                mean_interval_days=row['mean_interval_days'],
                std_interval_days=row['std_interval_days'],
                amount_mean=float(row['amount_mean']),
                amount_std=float(row['amount_std']),
                amount_cv=row['amount_cv'],
                active_days=int(row['active_days']),
                price_increase_pct=row['price_increase_pct'],
                category=row['category'],
                subscription_score=int(row['subscription_score']),
                gray_score=int(row['gray_score']),
                label=row['label'],
                tags=row['tags']
            ))

        # Merge annotations back to transactions
        merchant_lookup = {row['merchant']: row for _, row in merchant_df.iterrows()}

        transactions = []
        for _, txn in self.df.iterrows():
            merchant = txn['merchant']
            m_data = merchant_lookup.get(merchant)

            if m_data is not None:
                transactions.append(AnnotatedTransaction(
                    date=txn['date'].strftime('%Y-%m-%d'),
                    merchant=merchant,
                    category=txn['category'],
                    amount=float(txn['amount']),
                    type=txn['type'],
                    notes=txn.get('notes', ''),
                    label=m_data['label'],
                    merchant_score=int(m_data['subscription_score']),
                    merchant_gray_score=int(m_data['gray_score']),
                    merchant_tags=m_data['tags']
                ))
            else:
                # Credit transactions or others without merchant features
                transactions.append(AnnotatedTransaction(
                    date=txn['date'].strftime('%Y-%m-%d'),
                    merchant=merchant,
                    category=txn['category'],
                    amount=float(txn['amount']),
                    type=txn['type'],
                    notes=txn.get('notes', ''),
                    label="not_subscription",
                    merchant_score=0,
                    merchant_gray_score=0,
                    merchant_tags=[]
                ))

        return ScoringOutput(merchants=merchants, transactions=transactions)

    def detect_subscriptions(self) -> List[Subscription]:
        """Detect recurring charges using new heuristic scoring system"""
        if self.df.empty:
            return []

        scoring_output = self.run_heuristic_scoring()
        subscriptions = []

        expense_df = self.df[self.df['type'] == 'debit']

        for m in scoring_output.merchants:
            # Only include possible or likely subscriptions
            if m.label in {"likely_subscription", "possible_subscription"}:
                m_df = expense_df[expense_df['merchant'] == m.merchant]
                total_spent = m_df['amount'].sum()
                last_charge = m_df['date'].max().strftime('%Y-%m-%d')

                # Determine frequency
                if m.mean_interval_days is not None:
                    if SUB_WEEKLY_INTERVAL_RANGE[0] <= m.mean_interval_days <= SUB_WEEKLY_INTERVAL_RANGE[1]:
                        frequency = "weekly"
                    elif SUB_MONTHLY_INTERVAL_RANGE[0] <= m.mean_interval_days <= SUB_MONTHLY_INTERVAL_RANGE[1]:
                        frequency = "monthly"
                    else:
                        frequency = "recurring"
                else:
                    frequency = "recurring"

                # Determine confidence from label
                if m.label == "likely_subscription":
                    confidence = "high"
                else:
                    confidence = "medium"

                # Check for gray charge
                is_gray = "gray_recurring_fee" in m.tags or "possibly_gray_recurring_fee" in m.tags

                subscriptions.append(Subscription(
                    merchant=m.merchant,
                    amount=float(m.amount_mean),
                    frequency=frequency,
                    last_charge=last_charge,
                    total_spent=float(total_spent),
                    is_gray_charge=is_gray,
                    confidence=confidence
                ))

        return sorted(subscriptions, key=lambda x: x.total_spent, reverse=True)

    def get_scoring_json(self) -> Dict:
        """Get full scoring output as JSON-serializable dict"""
        output = self.run_heuristic_scoring()
        return {
            "merchants": [m.model_dump() for m in output.merchants],
            "transactions": [t.model_dump() for t in output.transactions]
        }

    def calculate_goal_status(self, goal_name: str, target: float, category: str = None) -> Dict:
        """Calculate progress toward a financial goal"""
        if self.df.empty:
            return {}

        expense_df = self.df[self.df['type'] == 'debit']

        if category:
            relevant = expense_df[expense_df['category'] == category]
        else:
            relevant = expense_df

        monthly_spending = relevant.groupby('month')['amount'].sum()
        current_avg = monthly_spending.mean()

        if len(monthly_spending) >= 2:
            recent_avg = monthly_spending.tail(2).mean()
            trend = "improving" if recent_avg < current_avg else "worsening"
        else:
            recent_avg = current_avg
            trend = "stable"

        progress_percent = (current_avg / target * 100) if target > 0 else 0
        status = "on-track" if current_avg <= target else "off-track"

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
