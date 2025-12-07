# Architecture Documentation

## System Overview

The Smart Financial Coach is a full-stack web application built with a clear separation between backend analytics/AI processing and frontend visualization/interaction.

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │ Dashboard  │  │  Insights  │  │   Goals    │  │ Subscript. │ │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘ │
│        │               │               │               │          │
│        └───────────────┴───────────────┴───────────────┘          │
│                        │                                           │
│                   ┌────▼─────┐                                    │
│                   │ API      │                                    │
│                   │ Service  │                                    │
│                   └────┬─────┘                                    │
└────────────────────────┼──────────────────────────────────────────┘
                         │ HTTP/REST
┌────────────────────────▼──────────────────────────────────────────┐
│                      Backend Layer                                 │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    FastAPI Router                           │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │  │
│  │  │/dashboard│ │/insights │ │  /goals  │ │  /coach  │      │  │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘      │  │
│  └───────┼────────────┼────────────┼────────────┼─────────────┘  │
│          │            │            │            │                 │
│  ┌───────▼────────────▼────────────▼────────────┘                │
│  │         Analytics Engine (Pandas)                             │
│  │  • Load & parse CSV data                                      │
│  │  • Compute aggregations & statistics                          │
│  │  • Detect trends & anomalies                                  │
│  │  • Identify subscriptions                                     │
│  │  • Calculate goal progress                                    │
│  └──────────────┬────────────────────────────────────────────────┘
│                 │                                                  │
│  ┌──────────────▼────────────────┐                               │
│  │    AI Service (OpenAI)         │                               │
│  │  • Generate spending insights  │                               │
│  │  • Analyze goal progress       │                               │
│  │  • Review subscriptions        │                               │
│  │  • Interactive coaching        │                               │
│  └────────────────────────────────┘                               │
└────────────────────────────────────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │   Data Layer     │
              │  CSV Transaction │
              │      Data        │
              └──────────────────┘
```

## Component Responsibilities

### Frontend (React + Chakra UI + Recharts)

**Layout.jsx**
- Provides consistent navigation and layout
- Sidebar with route links
- Responsive container for page content

**Dashboard.jsx**
- Fetches summary data from `/api/dashboard/summary`
- Displays KPI cards (income, expenses, savings, subscriptions)
- Renders visualizations (bar chart, pie chart, line chart)
- Shows recent anomalies

**SpendingInsights.jsx**
- Calls `/api/insights/spending`
- Displays AI-generated insights in highlighted card
- Shows category breakdown with trend indicators
- Lists detected anomalies with context

**Goals.jsx**
- Manages goal creation and tracking
- Posts goals to `/api/insights/goals`
- Displays progress bars and status badges
- Shows AI coaching feedback on goal progress

**Subscriptions.jsx**
- Fetches from `/api/insights/subscriptions`
- Summarizes total monthly subscription cost
- Highlights potential gray charges
- Displays AI recommendations for optimization

**Coach.jsx**
- Interactive chat interface
- Posts messages to `/api/coach`
- Displays conversation history
- Extracts and displays AI suggestions

**api.js**
- Centralized API client using axios
- Configurable base URL
- Typed request/response handling

### Backend (FastAPI + Pandas + OpenAI)

**main.py** - FastAPI Application
- Defines all REST endpoints
- CORS middleware configuration
- Request validation using Pydantic models
- Exception handling and HTTP responses

**analytics.py** - Financial Analytics Engine
```python
class FinancialAnalytics:
    def load_data()
        # Loads CSV, parses dates, converts amounts

    def get_transactions(limit)
        # Returns recent transactions

    def get_spending_insights()
        # Computes category totals, trends, anomalies
        # Returns AnalyticsSummary model

    def detect_subscriptions()
        # Identifies recurring charges
        # Flags potential gray charges
        # Returns list of Subscription models

    def calculate_goal_status(goal_name, target, category)
        # Compares current spending to target
        # Calculates progress percentage
        # Generates forecast

    def _calculate_trend(category)
        # Month-over-month comparison
        # Returns direction (increasing/decreasing/stable)

    def _detect_anomalies()
        # Statistical outlier detection (>2 std dev)
        # Checks notes for anomaly keywords
        # Returns list of unusual transactions
```

**ai_service.py** - OpenAI Integration
```python
class FinancialCoachAI:
    def generate_spending_insights(analytics_data)
        # System prompt: "You are a friendly financial coach..."
        # User prompt: Includes numeric stats + trends
        # Returns natural language summary

    def generate_goal_insights(goals_data)
        # System prompt: "You are a supportive coach..."
        # Analyzes progress for each goal
        # Returns actionable recommendations

    def generate_subscription_insights(subscriptions)
        # System prompt: "Help identify recurring charges..."
        # Flags gray charges, suggests savings
        # Returns optimization advice

    def chat_with_coach(message, context)
        # Interactive conversation
        # Includes financial snapshot as context
        # Extracts suggestions from response

    def _extract_suggestions(text)
        # Parses bullet points and numbered lists
        # Returns actionable items
```

**models.py** - Pydantic Models
- `Transaction`: Single transaction record
- `SpendingInsight`: Category spending with trend
- `CategoryTrend`: Monthly data for charting
- `Subscription`: Recurring charge details
- `GoalStatus`: Progress tracking
- `AnalyticsSummary`: Complete analytics package
- `ChatMessage/ChatResponse`: Chat interface models

**config.py** - Configuration
- Loads environment variables
- Manages OpenAI API key
- CORS origins
- Data file path

## Data Flow

### Dashboard Loading
1. User navigates to Dashboard
2. `Dashboard.jsx` calls `financialAPI.getDashboardSummary()`
3. Request hits `/api/dashboard/summary` endpoint
4. `analytics.get_spending_insights()` processes data
5. Response includes aggregated stats + trends
6. React state updates, triggers re-render
7. Recharts renders visualizations

### AI Insight Generation
1. User navigates to Spending Insights
2. `SpendingInsights.jsx` calls `financialAPI.getSpendingInsights()`
3. Backend calls `analytics.get_spending_insights()` for numeric data
4. Analytics data converted to dict
5. `ai_service.generate_spending_insights(analytics_dict)` called
6. OpenAI API request with system + user prompts
7. ChatGPT generates natural language insights
8. Response combines analytics + AI text
9. Frontend displays both in separate sections

### Goal Analysis
1. User creates goals in `Goals.jsx`
2. User clicks "Analyze Progress"
3. POST request to `/api/insights/goals` with goal array
4. For each goal, `analytics.calculate_goal_status()` runs
5. Computes current vs target spending
6. Generates status (on-track/off-track) and forecast
7. All goal results sent to `ai_service.generate_goal_insights()`
8. AI provides personalized coaching for each goal
9. Frontend displays progress bars + AI feedback

### Interactive Chat
1. User types message in `Coach.jsx`
2. Message + optional context sent to `/api/coach`
3. If no context, backend fetches current financial snapshot
4. `ai_service.chat_with_coach()` called with message + context
5. OpenAI generates conversational response
6. Response parsed for suggestions (bullet points, etc.)
7. Chat message added to conversation history
8. Suggestions displayed as badges

## Key Design Decisions

### Why CSV Instead of Database?
**Decision**: Use CSV file for transaction storage

**Reasoning**:
- Hackathon prototype - prioritize speed
- Data fits in memory (6 months of transactions)
- No write operations needed
- Pandas excels at CSV processing
- Easy to inspect and modify test data

**Trade-off**: Not scalable for production, no concurrent writes

**Migration Path**: Switch to PostgreSQL or SQLite for multi-user support

### Why Pandas for Analytics?
**Decision**: Use Pandas DataFrame operations

**Reasoning**:
- Optimized for tabular data operations
- Rich aggregation and grouping functions
- Built-in statistical methods (mean, std, etc.)
- Easy date/time handling
- Familiar to data scientists

**Trade-off**: Memory overhead for large datasets

**Alternative**: Raw SQL queries if using database

### Why Separate AI Service?
**Decision**: Isolate OpenAI logic in `ai_service.py`

**Reasoning**:
- Single responsibility (analytics vs AI)
- Easy to mock for testing
- Prompts centralized for tuning
- Could swap AI provider without touching analytics
- Rate limiting and caching can be added here

**Trade-off**: Extra abstraction layer

### Why Client-Side State Instead of Redux?
**Decision**: Use React useState hooks

**Reasoning**:
- Simple data flow (fetch → display)
- No complex state interactions
- Each page independent
- Reduces bundle size
- Faster development

**Trade-off**: Less suitable if state sharing needed

**Migration Path**: Add Zustand or Redux if complexity grows

### Why Recharts Instead of D3?
**Decision**: Use Recharts for visualizations

**Reasoning**:
- React-friendly declarative API
- Responsive by default
- Common chart types built-in
- Less code than D3
- Good TypeScript support

**Trade-off**: Less customization than D3

**Alternative**: D3 for advanced visualizations

## Performance Considerations

### Backend Optimization
- **Data Loading**: CSV loaded once on startup, cached in memory
- **Analytics Caching**: Could add Redis to cache computed results
- **AI Request Batching**: Currently each insight is separate API call
  - Could batch related prompts
  - Could cache common responses

### Frontend Optimization
- **Code Splitting**: Vite handles automatically
- **Chart Rendering**: Recharts virtualization for large datasets
- **API Calls**: Each page fetches independently
  - Could add React Query for caching
  - Could prefetch on route transitions

### API Rate Limiting
- **OpenAI**: No built-in rate limiting currently
  - Add Redis-based token bucket
  - Implement request queuing
  - Show loading states to user

## Security Considerations

### Current Security
- CORS enabled with specific origins
- No authentication (single-user prototype)
- OpenAI API key in backend `.env` (not exposed to client)
- Input validation via Pydantic models

### Production Requirements
- **Authentication**: Add JWT or session-based auth
- **Authorization**: User-specific transaction data
- **Input Sanitization**: Validate all user inputs
- **Rate Limiting**: Prevent API abuse
- **HTTPS**: TLS in production
- **API Key Rotation**: Secure credential management
- **SQL Injection**: N/A (using CSV, but relevant if migrating to DB)

## Testing Strategy

### Backend Testing (pytest)
```python
def test_spending_insights():
    analytics = FinancialAnalytics()
    insights = analytics.get_spending_insights()
    assert insights.total_income > 0
    assert len(insights.spending_by_category) > 0

def test_subscription_detection():
    subs = analytics.detect_subscriptions()
    netflix = [s for s in subs if s.merchant == "Netflix"]
    assert len(netflix) == 1
    assert netflix[0].frequency == "monthly"
```

### Frontend Testing (Jest + React Testing Library)
```javascript
test('Dashboard displays summary cards', async () => {
  render(<Dashboard />)
  await waitFor(() => {
    expect(screen.getByText('Total Income')).toBeInTheDocument()
    expect(screen.getByText('Total Expenses')).toBeInTheDocument()
  })
})
```

### Integration Testing
- Test full flow: API request → Analytics → AI → Response
- Mock OpenAI API to avoid cost
- Verify data transformations

## Deployment Architecture

### Development
- Backend: `python main.py` (Uvicorn)
- Frontend: `npm run dev` (Vite dev server)
- Proxy: Vite proxies `/api` to localhost:8000

### Production
```
┌─────────────┐
│   Nginx     │  (Reverse proxy, static files)
└──────┬──────┘
       │
   ┌───┴────┐
   │        │
┌──▼──┐  ┌─▼────┐
│React│  │FastAPI│
│Build│  │+ Uvicorn│
└─────┘  └───┬───┘
             │
        ┌────▼────┐
        │OpenAI API│
        └──────────┘
```

**Containerization (Docker)**:
```dockerfile
# Backend
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0"]

# Frontend
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
```

## Monitoring & Observability

### Recommended Additions
- **Logging**: Structured logs (JSON) with correlation IDs
- **Metrics**: Prometheus for API latency, error rates
- **Tracing**: OpenTelemetry for request tracing
- **Alerting**: Alert on high error rates or API failures
- **Dashboard**: Grafana for system metrics

### Key Metrics to Track
- API response times (p50, p95, p99)
- OpenAI API cost per request
- Error rates by endpoint
- User actions (page views, chat messages)
- Cache hit rates (if caching added)

## Future Enhancements

### Multi-User Support
- Add user authentication (Auth0, Firebase)
- Migrate to PostgreSQL with user_id foreign key
- Isolate data by user
- Add user preferences/settings

### Real-Time Updates
- WebSocket connection for live transaction feeds
- Push notifications for anomalies
- Real-time goal progress tracking

### Advanced Analytics
- Predictive modeling (ARIMA for spending forecasts)
- Clustering similar users for benchmarking
- Anomaly detection with ML (Isolation Forest)
- Natural language query interface

### Mobile App
- React Native for iOS/Android
- Shared API backend
- Push notifications for important alerts

## Conclusion

This architecture prioritizes:
1. **Rapid Development**: Simple stack, minimal dependencies
2. **Clear Separation**: Analytics, AI, and UI are decoupled
3. **Extensibility**: Easy to add features or swap components
4. **Cost Efficiency**: Minimal infrastructure, pay-per-use AI
5. **User Experience**: Fast, responsive, intuitive interface

The system is production-ready for single-user scenarios and provides a solid foundation for scaling to multi-user with database, authentication, and caching additions.
