from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class Transaction(BaseModel):
    date: str
    merchant: str
    category: str
    amount: float
    type: str
    notes: Optional[str] = ""

class SpendingInsight(BaseModel):
    category: str
    total: float
    percentage: float
    trend: str
    change_percent: Optional[float] = None

class CategoryTrend(BaseModel):
    category: str
    monthly_data: List[dict]

class GoalStatus(BaseModel):
    goal_name: str
    target: float
    current: float
    progress_percent: float
    status: str
    forecast: str
    suggestions: List[str]

class Subscription(BaseModel):
    merchant: str
    amount: float
    frequency: str
    last_charge: str
    total_spent: float
    is_gray_charge: bool
    confidence: str


class MerchantFeatures(BaseModel):
    """Per-merchant computed features for subscription detection"""
    merchant: str
    merchant_norm: str
    num_txns: int
    mean_interval_days: Optional[float] = None
    std_interval_days: Optional[float] = None
    amount_mean: float
    amount_std: float
    amount_cv: Optional[float] = None
    active_days: int
    price_increase_pct: Optional[float] = None
    category: str
    subscription_score: int
    gray_score: int
    label: str
    tags: List[str]


class AnnotatedTransaction(BaseModel):
    """Transaction with merchant-level annotations"""
    date: str
    merchant: str
    category: str
    amount: float
    type: str
    notes: Optional[str] = ""
    label: str
    merchant_score: int
    merchant_gray_score: int
    merchant_tags: List[str]


class ScoringOutput(BaseModel):
    """Full output of the heuristic scoring system"""
    merchants: List[MerchantFeatures]
    transactions: List[AnnotatedTransaction]

class AnalyticsSummary(BaseModel):
    total_income: float
    total_expenses: float
    net_savings: float
    avg_monthly_spending: float
    spending_by_category: List[SpendingInsight]
    trends: List[CategoryTrend]
    anomalies: List[dict]

class ChatMessage(BaseModel):
    message: str
    context: Optional[dict] = None

class ChatResponse(BaseModel):
    response: str
    suggestions: Optional[List[str]] = None

class Holding(BaseModel):
    symbol: str
    name: str
    shares: float
    purchase_price: float
    current_price: float
    cost_basis: float
    current_value: float
    gain_loss: float
    gain_loss_percent: float
    day_change: float
    purchase_date: str
    notes: str

class PortfolioAllocation(BaseModel):
    stocks: dict
    etfs: dict
    bonds: dict

class PortfolioSummary(BaseModel):
    holdings: List[Holding]
    total_value: float
    total_cost: float
    total_gain_loss: float
    total_return_percent: float
    allocation: PortfolioAllocation
    last_updated: str

class NetWorth(BaseModel):
    total_net_worth: float
    cash_savings: float
    portfolio_value: float
    portfolio_percent: float
    cash_percent: float

class NetWorthGoalProgress(BaseModel):
    current_net_worth: float
    goal_amount: float
    progress_percent: float
    remaining: float
    months_to_goal: float
    on_track: bool


# Time Machine Models
class TimeMachineScenario(BaseModel):
    """User-adjustable parameters for the what-if simulator"""
    # Category spending adjustments (percentage change, e.g., -20 means 20% reduction)
    restaurants_adjustment: float = 0
    groceries_adjustment: float = 0
    shopping_adjustment: float = 0
    entertainment_adjustment: float = 0
    transportation_adjustment: float = 0
    subscriptions_adjustment: float = 0
    other_adjustment: float = 0

    # Income adjustment
    income_adjustment: float = 0

    # Fixed costs
    rent_adjustment: float = 0

    # Savings rate (if provided, overrides calculated)
    target_savings_rate: Optional[float] = None

    # Investment parameters
    investment_return_rate: float = 7.0  # Annual return %
    inflation_rate: float = 3.0  # Annual inflation %

    # Goals
    emergency_fund_target: float = 10000
    retirement_goal: float = 500000


class TimeMachineProjection(BaseModel):
    """Projection results from the Time Machine"""
    # Current baseline
    current_monthly_income: float
    current_monthly_expenses: float
    current_monthly_savings: float
    current_savings_rate: float

    # What-if scenario
    scenario_monthly_income: float
    scenario_monthly_expenses: float
    scenario_monthly_savings: float
    scenario_savings_rate: float

    # Differences
    savings_difference: float
    savings_difference_percent: float

    # Category breakdown (current vs scenario)
    category_comparison: List[dict]

    # 12-month projections
    projection_months: List[dict]

    # Emergency fund
    current_emergency_fund_months: float
    scenario_emergency_fund_months: float
    months_to_emergency_fund_goal: Optional[float]

    # Investment growth (simple projection)
    investment_growth_projection: List[dict]

    # Goal progress
    current_time_to_goal: Optional[float]
    scenario_time_to_goal: Optional[float]
    goal_time_saved: Optional[float]
