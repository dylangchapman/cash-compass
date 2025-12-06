from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from models import (
    Transaction, AnalyticsSummary, Subscription,
    GoalStatus, ChatMessage, ChatResponse,
    PortfolioSummary, NetWorth, NetWorthGoalProgress
)
from analytics import analytics
from ai_service import ai_service
from portfolio_service import portfolio_service
from config import settings

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
