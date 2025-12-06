from openai import OpenAI
from config import settings
from typing import List, Dict
import json

class FinancialCoachAI:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL

    def generate_spending_insights(self, analytics_data: Dict) -> str:
        """GPT API call to generate spendin insights"""

        system_prompt = """You are a financial coach helping Dylan Chapman understand their finances.
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

        Keep it concise and focused on helping Dylan improve their financial wellness."""

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
        """Generate insights about financial goals"""

        system_prompt = """You are a supportive financial coach helping Dylan achieve their financial goals.
                        Provide encouraging feedback, celebrate wins, and give practical advice for getting back on track when needed."""

        goals_summary = "\n".join([
            f"- {g['goal_name']}: Target ${g['target']:.2f}/month, Current ${g['current']:.2f}/month ({g['status']})"
            for g in goals_data
        ])

        user_prompt = f"""Analyze Dylan's progress on these financial goals:
                            {goals_summary}
                        For each goal, provide:
                        1. Assessment of current progress
                        2. Specific actions to improve or maintain progress
                        3. Motivation and encouragement
                        4. Realistic timeline expectations

                        Be supportive but realistic. Focus on actionable steps."""

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
        """Generate insights about subscriptions and recurring charges"""

        system_prompt = """You are a financial coach helping Dylan identify and manage recurring charges.
Help them understand what they're subscribed to, identify potential savings, and spot suspicious charges."""

        total_monthly = sum(s['amount'] for s in subscriptions)
        subs_summary = "\n".join([
            f"- {s['merchant']}: ${s['amount']:.2f}/{s['frequency']} (Total: ${s['total_spent']:.2f}){' ⚠️ POTENTIAL GRAY CHARGE' if s.get('is_gray_charge') else ''}"
            for s in subscriptions
        ])

        user_prompt = f"""Analyze Dylan's recurring subscriptions and charges:

Total Monthly Recurring: ${total_monthly:.2f}

Subscriptions:
{subs_summary}

Provide:
1. Summary of total subscription costs
2. Identify any suspicious or gray charges that should be reviewed
3. Suggestions for subscriptions to cancel or downgrade
4. Potential monthly savings
5. Best practices for managing subscriptions

Be specific and help Dylan take control of recurring expenses."""

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
        """Interactive chat with financial coach"""

        system_prompt = """You are Dylan's personal financial coach. You have access to their transaction data and spending patterns.
Provide helpful, personalized advice in a friendly conversational tone. Ask clarifying questions when needed.
Keep responses concise but informative. Focus on actionable advice."""

        messages = [{"role": "system", "content": system_prompt}]

        # Add context if provided
        if context:
            context_msg = f"Here's Dylan's current financial snapshot:\n{json.dumps(context, indent=2)}"
            messages.append({"role": "system", "content": context_msg})

        messages.append({"role": "user", "content": message})

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.8,
                max_tokens=500
            )

            reply = response.choices[0].message.content

            # Extract suggestions (simple heuristic: look for bullet points or numbered lists)
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
        """Format spending categories for prompt"""
        return "\n".join([
            f"- {cat['category']}: ${cat['total']:.2f} ({cat['percentage']:.1f}%) - Trend: {cat['trend']}"
            for cat in categories[:8]
        ])

    def _format_trends(self, trends: List[Dict]) -> str:
        """Format trend data for prompt"""
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

    def _extract_suggestions(self, text: str) -> List[str]:
        """Extract actionable suggestions from AI response"""
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

        return suggestions[:5]  # Return top 5 suggestions

ai_service = FinancialCoachAI()
