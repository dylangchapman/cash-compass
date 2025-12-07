from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel
import pandas as pd
import os
from datetime import datetime
from models import (
    AnalyticsSummary, Subscription,
    GoalStatus, ChatMessage, ChatResponse,
    PortfolioSummary, NetWorth, NetWorthGoalProgress,
    TimeMachineScenario, TimeMachineProjection,
    ScoringOutput, MerchantFeatures, AnnotatedTransaction
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


@app.get("/api/insights/income")
def get_income_insights():
    """Get income sources breakdown"""
    try:
        income_data = analytics.get_income_breakdown()
        savings_data = analytics.get_savings_summary()
        return {
            "income": income_data,
            "savings": savings_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/insights/portfolio")
def get_portfolio_insight():
    """Get AI-generated portfolio allocation insight"""
    try:
        portfolio = portfolio_service.get_portfolio_summary()
        insight = ai_service.generate_portfolio_insight(
            portfolio['allocation'],
            portfolio['holdings']
        )
        return {
            "insight": insight,
            "allocation": portfolio['allocation'],
            "total_value": portfolio['total_value']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/insights/scoring")
def get_heuristic_scoring():
    """Get full heuristic scoring output with merchant features and annotated transactions"""
    try:
        scoring_output = analytics.run_heuristic_scoring()
        return {
            "merchants": [m.model_dump() for m in scoring_output.merchants],
            "transactions": [t.model_dump() for t in scoring_output.transactions],
            "summary": {
                "total_merchants": len(scoring_output.merchants),
                "likely_subscriptions": sum(1 for m in scoring_output.merchants if m.label == "likely_subscription"),
                "possible_subscriptions": sum(1 for m in scoring_output.merchants if m.label == "possible_subscription"),
                "gray_recurring_fees": sum(1 for m in scoring_output.merchants if "gray_recurring_fee" in m.tags),
                "micro_subscriptions": sum(1 for m in scoring_output.merchants if "micro_subscription" in m.tags),
                "possibly_unused": sum(1 for m in scoring_output.merchants if "possibly_unused_subscription" in m.tags)
            }
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

# ============== Time Machine Endpoints ==============

@app.get("/api/time-machine/baseline")
def get_time_machine_baseline():
    """Get current baseline data for Time Machine"""
    try:
        analytics_data = analytics.get_spending_insights()
        subscriptions = analytics.detect_subscriptions()

        # Calculate monthly averages
        months_of_data = len(analytics_data.trends[0].monthly_data) if analytics_data.trends else 6
        monthly_income = analytics_data.total_income / max(months_of_data, 1)
        monthly_expenses = analytics_data.total_expenses / max(months_of_data, 1)

        # Get category breakdown
        category_spending = {}
        for cat in analytics_data.spending_by_category:
            category_spending[cat.category.lower()] = cat.total / max(months_of_data, 1)

        return {
            "monthly_income": round(monthly_income, 2),
            "monthly_expenses": round(monthly_expenses, 2),
            "monthly_savings": round(monthly_income - monthly_expenses, 2),
            "savings_rate": round((monthly_income - monthly_expenses) / monthly_income * 100, 1) if monthly_income > 0 else 0,
            "category_spending": {
                "restaurants": round(category_spending.get("restaurants", 0), 2),
                "groceries": round(category_spending.get("groceries", 0), 2),
                "shopping": round(category_spending.get("shopping", 0), 2),
                "entertainment": round(category_spending.get("entertainment", 0), 2),
                "transportation": round(category_spending.get("transportation", 0), 2),
                "subscriptions": round(sum(sub.amount for sub in subscriptions), 2),
                "rent": round(category_spending.get("rent", category_spending.get("housing", 0)), 2),
                "utilities": round(category_spending.get("utilities", 0), 2),
                "other": round(sum(v for k, v in category_spending.items()
                    if k not in ["restaurants", "groceries", "shopping", "entertainment",
                                 "transportation", "rent", "housing", "utilities"]), 2)
            },
            "subscription_total": round(sum(sub.amount for sub in subscriptions), 2),
            "months_of_data": months_of_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/time-machine/project", response_model=TimeMachineProjection)
def project_time_machine(scenario: TimeMachineScenario):
    """Calculate projections based on user's what-if scenario"""
    try:
        # Get baseline data
        analytics_data = analytics.get_spending_insights()
        subscriptions = analytics.detect_subscriptions()

        # Calculate current baseline
        months_of_data = len(analytics_data.trends[0].monthly_data) if analytics_data.trends else 6
        current_monthly_income = analytics_data.total_income / max(months_of_data, 1)
        current_monthly_expenses = analytics_data.total_expenses / max(months_of_data, 1)
        current_monthly_savings = current_monthly_income - current_monthly_expenses
        current_savings_rate = (current_monthly_savings / current_monthly_income * 100) if current_monthly_income > 0 else 0

        # Get category breakdown for baseline
        category_spending = {}
        for cat in analytics_data.spending_by_category:
            category_spending[cat.category.lower()] = cat.total / max(months_of_data, 1)

        # Build category comparison
        categories = [
            ("restaurants", scenario.restaurants_adjustment),
            ("groceries", scenario.groceries_adjustment),
            ("shopping", scenario.shopping_adjustment),
            ("entertainment", scenario.entertainment_adjustment),
            ("transportation", scenario.transportation_adjustment),
            ("subscriptions", scenario.subscriptions_adjustment),
            ("rent", scenario.rent_adjustment),
        ]

        category_comparison = []
        scenario_expenses = 0
        sub_total = sum(sub.amount for sub in subscriptions)

        for cat_name, adjustment in categories:
            if cat_name == "subscriptions":
                current = sub_total
            elif cat_name == "rent":
                current = category_spending.get("rent", category_spending.get("housing", 0))
            else:
                current = category_spending.get(cat_name, 0)

            scenario_amount = current * (1 + adjustment / 100)
            difference = scenario_amount - current

            category_comparison.append({
                "category": cat_name.capitalize(),
                "current": round(current, 2),
                "scenario": round(scenario_amount, 2),
                "difference": round(difference, 2),
                "adjustment_percent": adjustment
            })
            scenario_expenses += scenario_amount

        # Add "other" expenses
        other_current = sum(v for k, v in category_spending.items()
            if k not in ["restaurants", "groceries", "shopping", "entertainment",
                        "transportation", "rent", "housing", "utilities"])
        other_scenario = other_current * (1 + scenario.other_adjustment / 100)
        scenario_expenses += other_scenario

        category_comparison.append({
            "category": "Other",
            "current": round(other_current, 2),
            "scenario": round(other_scenario, 2),
            "difference": round(other_scenario - other_current, 2),
            "adjustment_percent": scenario.other_adjustment
        })

        # Add utilities (no adjustment)
        utilities = category_spending.get("utilities", 0)
        scenario_expenses += utilities

        # Calculate scenario income
        scenario_monthly_income = current_monthly_income * (1 + scenario.income_adjustment / 100)

        # Calculate scenario savings
        scenario_monthly_savings = scenario_monthly_income - scenario_expenses
        scenario_savings_rate = (scenario_monthly_savings / scenario_monthly_income * 100) if scenario_monthly_income > 0 else 0

        # Calculate differences
        savings_difference = scenario_monthly_savings - current_monthly_savings
        savings_difference_percent = (savings_difference / current_monthly_savings * 100) if current_monthly_savings != 0 else 0

        # Generate 12-month projections
        projection_months = []
        current_cumulative = 0
        scenario_cumulative = 0

        for month in range(1, 13):
            current_cumulative += current_monthly_savings
            scenario_cumulative += scenario_monthly_savings
            projection_months.append({
                "month": month,
                "current_savings": round(current_cumulative, 2),
                "scenario_savings": round(scenario_cumulative, 2),
                "difference": round(scenario_cumulative - current_cumulative, 2)
            })

        # Emergency fund calculations
        monthly_expenses_for_ef = current_monthly_expenses  # Use current as baseline
        current_emergency_months = current_monthly_savings * 6 / monthly_expenses_for_ef if monthly_expenses_for_ef > 0 else 0
        scenario_emergency_months = scenario_monthly_savings * 6 / scenario_expenses if scenario_expenses > 0 else 0

        # Time to reach emergency fund goal
        ef_target = scenario.emergency_fund_target
        months_to_ef = None
        if scenario_monthly_savings > 0:
            months_to_ef = max(0, ef_target / scenario_monthly_savings)

        # Investment growth projection (compound growth)
        investment_projection = []
        current_balance = 0
        scenario_balance = 0
        monthly_return = scenario.investment_return_rate / 100 / 12

        for year in range(1, 11):  # 10 year projection
            for _ in range(12):  # Monthly compounding
                current_balance = current_balance * (1 + monthly_return) + current_monthly_savings
                scenario_balance = scenario_balance * (1 + monthly_return) + scenario_monthly_savings

            investment_projection.append({
                "year": year,
                "current_balance": round(current_balance, 2),
                "scenario_balance": round(scenario_balance, 2),
                "difference": round(scenario_balance - current_balance, 2)
            })

        # Goal progress (time to reach retirement goal)
        retirement_goal = scenario.retirement_goal
        current_time_to_goal = None
        scenario_time_to_goal = None
        goal_time_saved = None

        if current_monthly_savings > 0:
            # Simple calculation (not accounting for compound growth for simplicity)
            # More accurate: use future value formula
            current_time_to_goal = retirement_goal / (current_monthly_savings * 12)  # in years

        if scenario_monthly_savings > 0:
            scenario_time_to_goal = retirement_goal / (scenario_monthly_savings * 12)  # in years

        if current_time_to_goal is not None and scenario_time_to_goal is not None:
            goal_time_saved = current_time_to_goal - scenario_time_to_goal

        return TimeMachineProjection(
            current_monthly_income=round(current_monthly_income, 2),
            current_monthly_expenses=round(current_monthly_expenses, 2),
            current_monthly_savings=round(current_monthly_savings, 2),
            current_savings_rate=round(current_savings_rate, 1),
            scenario_monthly_income=round(scenario_monthly_income, 2),
            scenario_monthly_expenses=round(scenario_expenses, 2),
            scenario_monthly_savings=round(scenario_monthly_savings, 2),
            scenario_savings_rate=round(scenario_savings_rate, 1),
            savings_difference=round(savings_difference, 2),
            savings_difference_percent=round(savings_difference_percent, 1),
            category_comparison=category_comparison,
            projection_months=projection_months,
            current_emergency_fund_months=round(current_emergency_months, 1),
            scenario_emergency_fund_months=round(scenario_emergency_months, 1),
            months_to_emergency_fund_goal=round(months_to_ef, 1) if months_to_ef else None,
            investment_growth_projection=investment_projection,
            current_time_to_goal=round(current_time_to_goal, 1) if current_time_to_goal else None,
            scenario_time_to_goal=round(scenario_time_to_goal, 1) if scenario_time_to_goal else None,
            goal_time_saved=round(goal_time_saved, 1) if goal_time_saved else None
        )
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
