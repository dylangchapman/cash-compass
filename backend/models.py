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
    next_milestone: Optional[dict] = None
    milestones_achieved: List[dict]
