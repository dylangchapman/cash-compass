# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Smart Financial Coach - An AI-powered financial coaching web application that analyzes transaction data, tracks goals, manages subscriptions, and provides interactive financial guidance using OpenAI GPT-4.

**Tech Stack:**
- Backend: FastAPI + Pandas + OpenAI API
- Frontend: React + Vite + Chakra UI + Recharts
- Data: CSV-based transaction storage

## Development Commands

### Backend (Python FastAPI)

```bash
# Navigate to backend
cd panw-financial-coach/backend

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run development server (auto-reload enabled)
python main.py
# Runs on http://localhost:8000

# Access API documentation
# http://localhost:8000/docs (Swagger UI)
```

### Frontend (React + Vite)

```bash
# Navigate to frontend
cd panw-financial-coach/frontend

# Install dependencies
npm install

# Run development server (hot-reload enabled)
npm run dev
# Runs on http://localhost:3000

# Build for production
npm run build
# Output in dist/

# Preview production build
npm run preview
```

### Environment Setup

Backend requires `.env` file in `backend/` directory:
```
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4
CORS_ORIGINS=http://localhost:3000
```

## Architecture

### High-Level Flow

```
User → React Frontend → FastAPI Backend → Analytics (Pandas) → OpenAI API
                                        → Data (CSV)
```

### Backend Architecture

**main.py** - FastAPI application with REST endpoints
- All routes defined here
- Coordinates between analytics and AI services
- Handles CORS, validation, error handling

**analytics.py** - Financial analytics engine (Pandas-based)
- `FinancialAnalytics` class loads and processes CSV transaction data
- Computes spending insights, trends, anomalies, subscriptions
- No AI logic - purely numeric/statistical analysis
- Data loaded once on startup and cached in memory

**ai_service.py** - OpenAI integration layer
- `FinancialCoachAI` class wraps OpenAI API calls
- Converts numeric analytics into natural language insights
- All prompts centralized here for easy tuning
- Four main prompt types: spending insights, goal analysis, subscription review, interactive chat

**portfolio_service.py** - Investment portfolio tracking
- Uses yfinance for real-time stock prices
- Calculates total net worth (cash + investments)
- Tracks portfolio allocation and performance

**models.py** - Pydantic models for request/response validation
- All API contracts defined here
- Ensures type safety between frontend and backend

**config.py** - Configuration management
- Loads environment variables
- Centralizes settings (API keys, CORS origins, data paths)

### Frontend Architecture

**Structure:**
```
src/
├── pages/          # Route components (Dashboard, Goals, Coach, etc.)
├── components/     # Reusable UI components (Layout)
├── services/       # API client (api.js - centralized axios calls)
├── theme/          # Chakra UI theme customization
├── App.jsx         # Route configuration
└── main.jsx        # Entry point
```

**State Management:**
- Uses React hooks (useState, useEffect) - no Redux
- Each page fetches its own data independently
- No shared state between pages (stateless API design)

**API Integration:**
- All backend calls go through `services/api.js`
- Uses axios with configurable base URL
- Error handling per component

**Visualization:**
- Recharts for all charts (bar, pie, line, area)
- Responsive by default
- Charts render from analytics data returned by backend

## Key Patterns

### Adding New Analytics

1. Add computation logic in `analytics.py` (FinancialAnalytics class)
2. Define Pydantic model in `models.py` for response shape
3. Create endpoint in `main.py` that calls analytics method
4. Optionally enhance with AI insights via `ai_service.py`
5. Frontend: Add API call in `services/api.js` and consume in page component

### AI Prompt Engineering

All prompts in `ai_service.py` follow this pattern:
```python
messages = [
    {"role": "system", "content": "You are a friendly financial coach..."},
    {"role": "user", "content": f"Analyze this data: {data}"}
]
```

System prompts define:
- Role/personality (friendly, encouraging, actionable)
- Expected output format (bullet points, structured sections)
- Tone guidelines

User prompts include:
- Numeric analytics results
- Specific question or task

### Data Flow Example: Dashboard Loading

1. `Dashboard.jsx` calls `financialAPI.getDashboardSummary()`
2. Request hits `/api/dashboard/summary` in `main.py`
3. Endpoint calls `analytics.get_spending_insights()` and `analytics.detect_subscriptions()`
4. Analytics loads CSV data (cached), computes aggregations with Pandas
5. Response combines metrics, trends, anomalies, subscriptions
6. Frontend receives JSON, updates state, triggers re-render
7. Recharts visualizes data in bar/pie/line charts

### CSV Data Structure

Transaction data in `data/dylanData.yaml` (CSV format):
- Columns: Date, Category, Amount, Merchant, Notes
- Negative amounts = expenses
- Positive amounts = income
- Loaded once on backend startup via `analytics.py`

## Common Development Tasks

### Testing AI Prompts

1. Modify prompt in `ai_service.py` (e.g., `generate_spending_insights`)
2. Backend auto-reloads (uvicorn watching)
3. Trigger endpoint via frontend or curl:
   ```bash
   curl http://localhost:8000/api/insights/spending
   ```
4. Check response quality, iterate on prompt

### Adding New Page

1. Create `NewPage.jsx` in `frontend/src/pages/`
2. Add route in `App.jsx`:
   ```jsx
   <Route path="/new-page" element={<NewPage />} />
   ```
3. Add navigation link in `components/Layout.jsx` sidebar
4. Create backend endpoint if needed
5. Add API method in `services/api.js`

### Modifying Charts

Charts in Recharts are declarative:
```jsx
<LineChart data={monthlyTrends}>
  <Line dataKey="amount" stroke="#3182CE" />
  <XAxis dataKey="month" />
  <YAxis />
</LineChart>
```

- `data` = array of objects
- `dataKey` = object property to plot
- Customize via props (colors, labels, tooltips)

### Portfolio Integration

Portfolio tracking uses yfinance for live stock data:
- Holdings defined in `portfolio_service.py`
- Prices fetched via `/api/portfolio/refresh`
- Net worth combines cash savings + investment value
- Frontend: `Portfolio.jsx` displays allocation charts and performance

## Performance Considerations

### Backend Caching

- CSV data loaded once on startup (not per request)
- Analytics computed per request (no caching currently)
- **Optimization opportunity:** Add Redis to cache analytics results

### OpenAI API Costs

- GPT-4: ~$0.01-0.03 per insight request
- **Cost reduction:** Change `OPENAI_MODEL` to `gpt-3.5-turbo` in `.env`
- **Caching opportunity:** Store AI responses for repeated queries

### Frontend Performance

- Vite handles code splitting automatically
- Each page loads independently (no over-fetching)
- Recharts virtualizes large datasets
- **Optimization opportunity:** Add React Query for client-side caching

## Important Constraints

### Single-User Design

- No authentication/authorization
- All data belongs to "Dylan Chapman"
- CSV data is stateless (no writes from app)
- For multi-user: migrate to PostgreSQL, add JWT auth

### Data Persistence

- CSV is read-only data source
- No database for user preferences/state
- Goals, chat history not persisted (session-only)
- For persistence: add SQLite or PostgreSQL

### API Rate Limiting

- No rate limiting on OpenAI calls currently
- **Production requirement:** Add token bucket with Redis
- Show loading states to prevent spam

## Deployment Notes

### Production Checklist

- Use PostgreSQL instead of CSV for multi-user support
- Enable HTTPS (TLS certificates)
- Add JWT authentication
- Implement API rate limiting
- Set up error monitoring (Sentry, etc.)
- Add Redis for caching
- Containerize with Docker
- Use environment-specific `.env` files

### Docker Build (Example)

Backend Dockerfile:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0"]
```

Frontend: Build static files (`npm run build`), serve with Nginx

## Troubleshooting

**Backend won't start:**
- Check Python version (3.9+): `python --version`
- Verify venv activated (prompt shows `(venv)`)
- Ensure `.env` exists with valid `OPENAI_API_KEY`
- Check port 8000 not in use: `netstat -ano | findstr :8000` (Windows)

**Frontend can't connect:**
- Verify backend running at http://localhost:8000
- Check CORS settings in `backend/config.py`
- Inspect browser console for errors
- Verify `CORS_ORIGINS` in `.env` includes frontend URL

**AI insights not generating:**
- Test OpenAI API key: curl with Authorization header
- Check API quota at https://platform.openai.com/usage
- Review backend logs for error traces
- Try `gpt-3.5-turbo` if quota issue

**Module import errors:**
- Backend: Reinstall deps `pip install -r requirements.txt`
- Frontend: Clear cache `rm -rf node_modules && npm install`

## Code Style

### Backend (Python)

- Follow PEP 8 conventions
- Use type hints for function signatures
- Pydantic models for all data validation
- Descriptive variable names (no abbreviations)
- Docstrings for all endpoints and public methods

### Frontend (JavaScript/JSX)

- Functional components with hooks (no classes)
- Chakra UI for all styling (avoid custom CSS)
- Destructure props in component signature
- Use `const` for all variables (avoid `let`/`var`)
- Arrow functions for callbacks

## Additional Resources

- FastAPI docs: https://fastapi.tiangolo.com
- Pandas docs: https://pandas.pydata.org/docs
- OpenAI API docs: https://platform.openai.com/docs
- Chakra UI: https://chakra-ui.com
- Recharts: https://recharts.org
- Vite: https://vitejs.dev
