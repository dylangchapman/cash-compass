# Smart Financial Coach

An AI-powered financial coaching web application that provides personalized insights, goal tracking, subscription management, and interactive financial guidance using ChatGPT.

## Overview

The Smart Financial Coach analyzes Dylan Chapman's 6-month transaction history to provide:
- **Real-time spending analytics** with visual dashboards
- **AI-generated insights** for spending patterns and trends
- **Goal tracking and forecasting** with personalized recommendations
- **Subscription detection** including gray charge identification
- **Interactive AI coach** for conversational financial guidance

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  React Frontend │ ──────> │  FastAPI Backend │ ──────> │  OpenAI GPT-4   │
│  (Chakra UI +   │ <────── │  (Pandas         │ <────── │  (AI Insights)  │
│   Recharts)     │         │   Analytics)     │         │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │  CSV Data Store │
                            │  (Transactions) │
                            └─────────────────┘
```

## Tech Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **Pandas** - Data analytics and processing
- **OpenAI API** - ChatGPT integration for natural language insights
- **Pydantic** - Data validation and settings management
- **Uvicorn** - ASGI server

### Frontend
- **React** - UI framework
- **Vite** - Build tool and dev server
- **Chakra UI** - Component library
- **Recharts** - Data visualization
- **React Router** - Client-side routing
- **Axios** - HTTP client

## Features

### 1. Dashboard
- Total income, expenses, and net savings overview
- Spending breakdown by category (bar chart & pie chart)
- Monthly spending trends (line chart)
- Anomaly detection and alerts
- Subscription summary

### 2. Spending Insights
- AI-generated financial health assessment
- Category-by-category spending analysis
- Trend detection (increasing, decreasing, stable)
- Unusual transaction identification
- Actionable recommendations

### 3. Goal Tracking
- Custom goal creation with category targeting
- Progress monitoring with visual indicators
- On-track/off-track status
- AI-powered improvement suggestions
- Savings forecasting

### 4. Subscription Manager
- Automatic recurring charge detection
- Gray charge identification
- Total monthly subscription cost
- Per-subscription analytics
- AI recommendations for optimization

### 5. Financial Coach Chat
- Interactive AI conversation
- Context-aware responses using transaction data
- Suggested quick questions
- Real-time financial advice
- Actionable suggestion extraction

## Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 18+
- OpenAI API key

### Backend Setup

1. Navigate to the backend directory:
```bash
cd panw-financial-coach/backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file:
```bash
cp .env.example .env
```

5. Add your OpenAI API key to `.env`:
```
OPENAI_API_KEY=your_actual_api_key_here
OPENAI_MODEL=gpt-4
CORS_ORIGINS=http://localhost:3000
```

6. Run the backend server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd panw-financial-coach/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## API Endpoints

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/transactions` | GET | Retrieve recent transactions |
| `/api/dashboard/summary` | GET | Get dashboard summary data |
| `/api/insights/spending` | GET | Get spending analytics + AI insights |
| `/api/insights/subscriptions` | GET | Detect subscriptions + AI analysis |
| `/api/insights/goals` | POST | Analyze goal progress + AI recommendations |
| `/api/coach` | POST | Interactive chat with AI coach |

### Example API Usage

**Get Spending Insights:**
```bash
curl http://localhost:8000/api/insights/spending
```

**Chat with Coach:**
```bash
curl -X POST http://localhost:8000/api/coach \
  -H "Content-Type: application/json" \
  -d '{"message": "How can I save more money?"}'
```

**Analyze Goals:**
```bash
curl -X POST http://localhost:8000/api/insights/goals \
  -H "Content-Type: application/json" \
  -d '[{"goal_name": "Monthly Budget", "target": 2500}]'
```

## Data Flow

1. **Transaction Loading**: Backend loads CSV data using Pandas
2. **Analytics Processing**: Compute statistics (trends, anomalies, subscriptions)
3. **AI Enhancement**: Send numeric stats to ChatGPT with contextual prompts
4. **Natural Language Generation**: ChatGPT converts stats into friendly insights
5. **Frontend Display**: React components visualize data with charts and AI insights

## AI Prompt Strategy

The system uses role-based prompts optimized for each feature:

- **Spending Insights**: "You are a friendly financial coach analyzing spending patterns..."
- **Goal Analysis**: "You are a supportive coach helping achieve financial goals..."
- **Subscription Review**: "You are helping identify and manage recurring charges..."
- **Interactive Chat**: "You are a personal financial coach with access to transaction data..."

Each prompt includes:
- Clear role definition
- Relevant numeric analytics
- Expected output format
- Tone guidelines (friendly, actionable, encouraging)

## Project Structure

```
panw-financial-coach/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── models.py            # Pydantic models
│   ├── analytics.py         # Pandas analytics engine
│   ├── ai_service.py        # OpenAI integration
│   ├── config.py            # Configuration management
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment template
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   └── Layout.jsx
│   │   ├── pages/           # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── SpendingInsights.jsx
│   │   │   ├── Goals.jsx
│   │   │   ├── Subscriptions.jsx
│   │   │   └── Coach.jsx
│   │   ├── services/        # API service
│   │   │   └── api.js
│   │   ├── theme/           # Chakra UI theme
│   │   │   └── theme.js
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── data/
│   └── dylanData.yaml       # Transaction data (CSV)
└── README.md
```

## Development Tips

### Backend
- Use `/docs` endpoint for interactive API documentation (Swagger UI)
- Analytics engine caches data on load for performance
- Add new endpoints in `main.py`
- Extend analytics in `analytics.py`
- Customize AI prompts in `ai_service.py`

### Frontend
- Components use Chakra UI for consistent styling
- API calls centralized in `services/api.js`
- Charts use Recharts for responsive visualizations
- State management uses React hooks (no Redux needed for this scope)

## Optimization Opportunities

### Current Implementation
- CSV data source (simple, fast for prototyping)
- In-memory analytics (recomputed per request)
- Stateless API (no user sessions)

### Production Enhancements
- **Database**: Migrate to PostgreSQL or SQLite for persistence
- **Caching**: Add Redis for analytics result caching
- **Authentication**: Implement user auth (JWT, OAuth)
- **Real-time**: WebSocket for live transaction updates
- **Rate Limiting**: Protect OpenAI API usage
- **Error Handling**: Enhanced error boundaries and retry logic
- **Testing**: Add pytest (backend) and Jest (frontend) suites
- **Deployment**: Containerize with Docker, deploy to cloud

## Cost Considerations

- **OpenAI API**: ~$0.01-0.03 per insight request (using GPT-4)
- **Optimization**: Use GPT-3.5-turbo for cost reduction (change `OPENAI_MODEL` in `.env`)
- **Caching**: Cache AI responses for repeated queries

## Future Features

- [ ] Multi-user support with authentication
- [ ] Bank integration (Plaid API)
- [ ] Budget creation wizard
- [ ] Savings goals with visual progress
- [ ] Email alerts for anomalies
- [ ] Export reports (PDF)
- [ ] Mobile app (React Native)
- [ ] Voice assistant integration

## Troubleshooting

**Backend won't start:**
- Check Python version (3.9+)
- Verify virtual environment is activated
- Ensure OpenAI API key is set in `.env`

**Frontend won't connect to backend:**
- Verify backend is running on port 8000
- Check CORS settings in `config.py`
- Inspect browser console for errors

**AI insights not generating:**
- Verify OpenAI API key is valid
- Check API quota/billing
- Review backend logs for error messages

## License

MIT

## Contact

For questions or feedback, reach out to Dylan Chapman.
