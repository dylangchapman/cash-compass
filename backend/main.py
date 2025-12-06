from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel
import pandas as pd
import os
from datetime import datetime
from models import (
    Transaction, AnalyticsSummary, Subscription,
    GoalStatus, ChatMessage, ChatResponse,
    PortfolioSummary, NetWorth, NetWorthGoalProgress
)
from analytics import analytics
from ai_service import ai_service
from portfolio_service import portfolio_service
from backtesting_service import backtesting_service
from config import settings

# Auth models
class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str

class AuthResponse(BaseModel):
    success: bool
    message: str
    user: Optional[dict] = None

# Users CSV path
USERS_CSV_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'users.csv')

app = FastAPI(
    title="Smart Financial Coach API",
    description="AI-powered financial insights and coaching for Dylan Chapman",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    """API health check"""
    return {
        "status": "healthy",
        "service": "Smart Financial Coach API",
        "version": "1.0.0"
    }

@app.get("/api/transactions", response_model=List[Transaction])
def get_transactions(limit: int = 100):
    """Get recent transactions"""
    try:
        transactions = analytics.get_transactions(limit=limit)
        return transactions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/transactions/category/{category}")
def get_transactions_by_category(category: str, limit: int = 500):
    """Get transactions filtered by category"""
    try:
        transactions = analytics.get_transactions_by_category(category, limit=limit)
        category_total = sum(t.amount for t in transactions)
        return {
            "transactions": transactions,
            "total": category_total,
            "count": len(transactions),
            "category": category
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/insights/spending")
def get_spending_insights():
    """Get comprehensive spending analytics with AI-generated insights"""
    try:
        # Get numeric analytics
        analytics_data = analytics.get_spending_insights()

        # Convert to dict for AI processing
        analytics_dict = analytics_data.model_dump()

        # Generate AI insights
        ai_insights = ai_service.generate_spending_insights(analytics_dict)

        return {
            "analytics": analytics_data,
            "ai_insights": ai_insights
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/insights/subscriptions")
def get_subscription_insights():
    """Detect subscriptions and gray charges with AI analysis"""
    try:
        # Detect subscriptions
        subscriptions = analytics.detect_subscriptions()

        # Convert to dict for AI processing
        subs_dict = [sub.model_dump() for sub in subscriptions]

        # Generate AI insights
        ai_insights = ai_service.generate_subscription_insights(subs_dict)

        return {
            "subscriptions": subscriptions,
            "ai_insights": ai_insights,
            "total_monthly": sum(sub.amount for sub in subscriptions),
            "gray_charges_detected": sum(1 for sub in subscriptions if sub.is_gray_charge)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/insights/goals")
def analyze_goals(goals: List[dict]):
    """
    Analyze progress toward financial goals
    Expected input: [{"goal_name": str, "target": float, "category": str (optional)}]
    """
    try:
        results = []

        for goal in goals:
            goal_status = analytics.calculate_goal_status(
                goal_name=goal.get("goal_name"),
                target=goal.get("target"),
                category=goal.get("category")
            )
            results.append(goal_status)

        # Generate AI insights about goals
        ai_insights = ai_service.generate_goal_insights(results)

        return {
            "goals": results,
            "ai_insights": ai_insights
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/coach", response_model=ChatResponse)
def chat_with_coach(chat_message: ChatMessage):
    """
    Interactive chat with AI financial coach
    Optionally include context (analytics summary) for personalized advice
    """
    try:
        # If no context provided, get current financial snapshot
        context = chat_message.context
        if not context:
            analytics_data = analytics.get_spending_insights()
            context = {
                "total_income": analytics_data.total_income,
                "total_expenses": analytics_data.total_expenses,
                "net_savings": analytics_data.net_savings,
                "top_categories": [
                    {"category": cat.category, "amount": cat.total}
                    for cat in analytics_data.spending_by_category[:5]
                ]
            }

        # Get AI response
        result = ai_service.chat_with_coach(chat_message.message, context)

        return ChatResponse(
            response=result["response"],
            suggestions=result.get("suggestions")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/summary")
def get_dashboard_summary():
    """Get summary data for dashboard visualization"""
    try:
        analytics_data = analytics.get_spending_insights()
        subscriptions = analytics.detect_subscriptions()

        return {
            "total_income": analytics_data.total_income,
            "total_expenses": analytics_data.total_expenses,
            "net_savings": analytics_data.net_savings,
            "savings_rate": (analytics_data.net_savings / analytics_data.total_income * 100) if analytics_data.total_income > 0 else 0,
            "top_categories": analytics_data.spending_by_category[:5],
            "monthly_trends": analytics_data.trends[:6],
            "recent_anomalies": analytics_data.anomalies[:3],
            "active_subscriptions": len(subscriptions),
            "subscription_cost": sum(sub.amount for sub in subscriptions)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/portfolio", response_model=PortfolioSummary)
def get_portfolio():
    """Get portfolio holdings with current values"""
    try:
        return portfolio_service.get_portfolio_summary()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/portfolio/refresh")
def refresh_portfolio():
    """Refresh stock prices from yfinance"""
    try:
        portfolio_service.update_prices()
        return {"status": "success", "message": "Portfolio prices updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/networth", response_model=NetWorth)
def get_net_worth():
    """Calculate total net worth (cash + investments)"""
    try:
        analytics_data = analytics.get_spending_insights()
        cash_savings = analytics_data.net_savings
        return portfolio_service.get_net_worth(cash_savings)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/networth/goal", response_model=NetWorthGoalProgress)
def analyze_net_worth_goal(goal_amount: float):
    """Analyze progress toward net worth goal"""
    try:
        analytics_data = analytics.get_spending_insights()
        cash_savings = analytics_data.net_savings
        return portfolio_service.calculate_net_worth_goal_progress(cash_savings, goal_amount)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============== Backtesting Endpoints ==============

@app.get("/api/backtest/presets")
def get_backtest_presets():
    """Get available portfolio allocation presets"""
    try:
        return backtesting_service.get_preset_allocations()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/backtest/compare")
def compare_strategies(symbol: str = "SPY", years: int = 5, initial_capital: float = 10000):
    """Compare buy-and-hold vs SMA crossover strategies for a symbol"""
    try:
        return backtesting_service.compare_strategies(symbol, years, initial_capital)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/backtest/allocation")
def backtest_allocation(preset: str = "60_40", years: int = 5, initial_capital: float = 10000):
    """Run backtest for a preset portfolio allocation"""
    try:
        return backtesting_service.backtest_allocation(preset, years, initial_capital)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class CustomAllocation(BaseModel):
    allocation: dict
    years: int = 5
    initial_capital: float = 10000

@app.post("/api/backtest/custom")
def backtest_custom_allocation(config: CustomAllocation):
    """Run backtest for a custom portfolio allocation"""
    try:
        result = backtesting_service.run_portfolio_allocation(
            config.allocation,
            config.years,
            config.initial_capital
        )
        return {
            'allocation': config.allocation,
            'period_years': config.years,
            'initial_capital': config.initial_capital,
            'result': {
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
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============== Authentication Endpoints ==============

@app.post("/api/auth/login", response_model=AuthResponse)
def login(request: LoginRequest):
    """Validate user credentials against users.csv"""
    try:
        if not os.path.exists(USERS_CSV_PATH):
            raise HTTPException(status_code=500, detail="Users database not found")

        users_df = pd.read_csv(USERS_CSV_PATH)

        # Find user by email
        user = users_df[users_df['email'].str.lower() == request.email.lower()]

        if user.empty:
            return AuthResponse(
                success=False,
                message="Invalid email or password"
            )

        # Check password
        if user.iloc[0]['password'] != request.password:
            return AuthResponse(
                success=False,
                message="Invalid email or password"
            )

        # Success
        return AuthResponse(
            success=True,
            message="Login successful",
            user={
                "email": user.iloc[0]['email'],
                "name": user.iloc[0]['name']
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/register", response_model=AuthResponse)
def register(request: RegisterRequest):
    """Register a new user account"""
    try:
        if not os.path.exists(USERS_CSV_PATH):
            # Create the file with headers if it doesn't exist
            users_df = pd.DataFrame(columns=['email', 'password', 'name', 'created_at'])
        else:
            users_df = pd.read_csv(USERS_CSV_PATH)

        # Check if email already exists
        if not users_df.empty and (users_df['email'].str.lower() == request.email.lower()).any():
            return AuthResponse(
                success=False,
                message="An account with this email already exists"
            )

        # Validate inputs
        if len(request.password) < 6:
            return AuthResponse(
                success=False,
                message="Password must be at least 6 characters"
            )

        if not request.name.strip():
            return AuthResponse(
                success=False,
                message="Name is required"
            )

        # Add new user
        new_user = pd.DataFrame([{
            'email': request.email.lower(),
            'password': request.password,
            'name': request.name.strip(),
            'created_at': datetime.now().strftime('%Y-%m-%d')
        }])

        users_df = pd.concat([users_df, new_user], ignore_index=True)
        users_df.to_csv(USERS_CSV_PATH, index=False)

        return AuthResponse(
            success=True,
            message="Account created successfully",
            user={
                "email": request.email.lower(),
                "name": request.name.strip()
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
