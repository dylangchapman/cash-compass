from openai import OpenAI
from config import settings
from typing import List, Dict
import json


class FinancialCoachAI:
    # Designated prompts and makes GPT API call to generate financial coaching language
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL

    def generate_spending_insights(self, analytics_data: Dict) -> str:
        """Spend page call"""

        system_prompt = """You are a financial coach helping the user understand their finances.
                        Your job is to analyze spending data and provide clear, actionable insights in a conversational tone.
                        Focus on patterns, trends, and practical suggestions. Be encouraging but honest about areas needing improvement."""

        user_prompt = f"""Analyze this spending data and provide personalized insights:
                        Total Income: ${analytics_data['total_income']:.2f}
                        Total Expenses: ${analytics_data['total_expenses']:.2f}
                        Net Savings: ${analytics_data['net_savings']:.2f}
                        Average Monthly Spending: ${analytics_data['avg_monthly_spending']:.2f}
                        Top Spending Categories:
                        {self._format_categories(analytics_data['spending_by_category'])}
                        Trends:
                        {self._format_trends(analytics_data.get('trends', []))}
                        Anomalies Detected:
                        {self._format_anomalies(analytics_data.get('anomalies', []))}
                        Provide:
                        1. Overall financial health assessment
                        2. Key insights about spending patterns
                        3. Notable trends or changes
                        4. Specific, actionable recommendations
                        5. Positive reinforcement for good habits
                        Keep it concise and focused on helping the user improve their financial wellness."""

        # make api call
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=800
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error generating insights: {str(e)}"

    def generate_goal_insights(self, goals_data: List[Dict]) -> str:
        """ goal page call"""

        # prompts
        system_prompt = """You are a supportive financial coach helping the user achieve their financial goals.
                        Provide encouraging feedback, celebrate wins, and give practical advice for getting back on track when needed."""
        goals_summary = "\n".join([
            f"- {g['goal_name']}: Target ${g['target']:.2f}/month, Current ${g['current']:.2f}/month ({g['status']})"
            for g in goals_data
        ])
        user_prompt = f"""Analyze the user's progress on these financial goals:
                            {goals_summary}
                        For each goal, provide:
                        1. Assessment of current progress
                        2. Specific actions to improve or maintain progress
                        3. Motivation and encouragement
                        4. Realistic timeline expectations

                        Be supportive but realistic. Focus on actionable steps."""
        # API call
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=600
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error generating goal insights: {str(e)}"

    def generate_subscription_insights(self, subscriptions: List[Dict]) -> str:
        """ subs page call"""

        system_prompt = """You are a financial coach helping the user identify and manage recurring charges.
                        Help them understand what they're subscribed to, identify potential savings, and spot suspicious charges."""
        total_monthly = sum(s['amount'] for s in subscriptions)
        subs_summary = "\n".join([
            f"- {s['merchant']}: ${s['amount']:.2f}/{s['frequency']} (Total: ${s['total_spent']:.2f}){' ⚠️ POTENTIAL GRAY CHARGE' if s.get('is_gray_charge') else ''}"
            for s in subscriptions
        ])

        user_prompt = f"""Analyze the user's recurring subscriptions and charges:
                        Total Monthly Recurring: ${total_monthly:.2f}
                        Subscriptions:
                        {subs_summary}
                        Provide:
                        1. Summary of total subscription costs
                        2. Identify any suspicious or gray charges that should be reviewed
                        3. Suggestions for subscriptions to cancel or downgrade
                        4. Potential monthly savings
                        5. Best practices for managing subscriptions
                        Be specific and help the user take control of recurring expenses."""
        # API call
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=600
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error generating subscription insights: {str(e)}"

    def chat_with_coach(self, message: str, context: Dict = None) -> Dict:
        """ coach API call """

        system_prompt = """You are the user's personal financial coach. You have access to their transaction data and spending patterns.
                            Provide helpful, personalized advice in a friendly conversational tone. Ask clarifying questions when needed.
                            Keep responses concise but informative. Focus on actionable advice."""
        messages = [{"role": "system", "content": system_prompt}]
        if context:
            context_msg = f"Here's the user's current financial snapshot:\n{json.dumps(context, indent=2)}"
            messages.append({"role": "system", "content": context_msg})
        messages.append({"role": "user", "content": message})
        # API call
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.8,
                max_tokens=500
            )

            reply = response.choices[0].message.content

            # if response is formatted in a list, pull that directly
            suggestions = self._extract_suggestions(reply)
            return {
                "response": reply,
                "suggestions": suggestions
            }
        except Exception as e:
            return {
                "response": f"I'm having trouble connecting right now. Error: {str(e)}",
                "suggestions": []
            }

    def _format_categories(self, categories: List[Dict]) -> str:
        """ format spending categories for prompt """
        return "\n".join([
            f"- {cat['category']}: ${cat['total']:.2f} ({cat['percentage']:.1f}%) - Trend: {cat['trend']}"
            for cat in categories[:8]
        ])

    def _format_trends(self, trends: List[Dict]) -> str:
        """ format trend data for prompt """
        if not trends:
            return "No significant trends detected"

        summary = []
        for trend in trends[:5]:
            data = trend.get('monthly_data', [])
            if len(data) >= 2:
                first = data[0]['amount']
                last = data[-1]['amount']
                change = ((last - first) / first * 100) if first > 0 else 0
                direction = "↑" if change > 0 else "↓"
                summary.append(f"- {trend['category']}: {direction} {abs(change):.1f}% over period")

        return "\n".join(summary) if summary else "Spending relatively stable across categories"

    def _format_anomalies(self, anomalies: List[Dict]) -> str:
        """Format anomaly data for prompt"""
        if not anomalies:
            return "No unusual transactions detected"

        return "\n".join([
            f"- {a['merchant']} on {a['date']}: ${a['amount']:.2f} (unusual for {a['category']})"
            for a in anomalies[:5]
        ])

    def generate_portfolio_insight(self, allocation: Dict, holdings: List[Dict]) -> str:
        """Generate a brief 2-3 sentence insight about portfolio allocation"""

        stocks_pct = allocation.get('stocks', {}).get('percent', 0)
        etfs_pct = allocation.get('etfs', {}).get('percent', 0)
        bonds_pct = allocation.get('bonds', {}).get('percent', 0)

        holdings_summary = ", ".join([f"{h['symbol']} (${h['current_value']:.0f})" for h in holdings[:5]])

        system_prompt = """You are a concise financial advisor. Provide exactly 2-3 sentences about the user's investment allocation.
                        Focus on risk/reward balance and one key observation. Be direct and insightful, not generic.
                        Do not use bullet points or lists. Write in flowing prose."""

        user_prompt = f"""Portfolio allocation:
- Stocks: {stocks_pct:.1f}%
- ETFs: {etfs_pct:.1f}%
- Bonds: {bonds_pct:.1f}%

Top holdings: {holdings_summary}

Provide a 2-3 sentence insight about this allocation's risk profile and one specific observation."""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=150
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Unable to generate portfolio insight: {str(e)}"

    def _extract_suggestions(self, text: str) -> List[str]:
        """ extract suggestions from AI response """
        suggestions = []
        lines = text.split('\n')

        for line in lines:
            line = line.strip()
            # Look for bullet points, numbers, or action-oriented phrases
            if line.startswith(('-', '•', '*')) or (len(line) > 0 and line[0].isdigit() and '.' in line[:3]):
                # Clean up the suggestion
                cleaned = line.lstrip('-•*0123456789. ').strip()
                if len(cleaned) > 10 and len(cleaned) < 200:
                    suggestions.append(cleaned)

        return suggestions[:5]

ai_service = FinancialCoachAI()
