# Quick Start Guide

Get the Smart Financial Coach running in 5 minutes!

## Prerequisites Check

Before starting, verify you have:
- Python 3.9 or higher: `python --version`
- Node.js 18 or higher: `node --version`
- npm: `npm --version`
- OpenAI API key (get one at https://platform.openai.com/api-keys)

## Step 1: Backend Setup (2 minutes)

```bash
# Navigate to backend
cd panw-financial-coach/backend

# Create virtual environment
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env

# Edit .env and add your OpenAI API key
# OPENAI_API_KEY=sk-your-key-here

# Start backend
python main.py
```

Backend should now be running at http://localhost:8000

## Step 2: Frontend Setup (2 minutes)

Open a new terminal:

```bash
# Navigate to frontend
cd panw-financial-coach/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend should now be running at http://localhost:3000

## Step 3: Use the App (1 minute)

Open your browser to http://localhost:3000 and explore:

1. **Dashboard** - Overview of finances with charts
2. **Spending Insights** - AI analysis of spending patterns
3. **Goals** - Set and track financial goals
4. **Subscriptions** - View recurring charges and gray charges
5. **Coach Chat** - Ask your AI coach anything!

## Test the API

While the backend is running, visit http://localhost:8000/docs for interactive API documentation.

Try these example requests:

**Get Dashboard Summary:**
```bash
curl http://localhost:8000/api/dashboard/summary
```

**Chat with AI Coach:**
```bash
curl -X POST http://localhost:8000/api/coach \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"What should I focus on to improve my finances?\"}"
```

## Common Issues

**Backend Error: "No module named 'fastapi'"**
- Make sure virtual environment is activated
- Run `pip install -r requirements.txt` again

**Frontend Error: "Module not found"**
- Run `npm install` again
- Clear node_modules: `rm -rf node_modules && npm install`

**OpenAI API Error**
- Check your API key in `.env`
- Verify you have API credits at https://platform.openai.com/usage
- Try using gpt-3.5-turbo instead of gpt-4 (cheaper)

**CORS Error**
- Verify backend is running on port 8000
- Check CORS_ORIGINS in backend `.env` includes http://localhost:3000

## Next Steps

- Customize the transaction data in `data/dylanData.yaml`
- Modify AI prompts in `backend/ai_service.py`
- Customize the theme in `frontend/src/theme/theme.js`
- Add new analytics in `backend/analytics.py`
- Create additional visualizations in the frontend pages

## Development Workflow

1. Backend changes auto-reload with uvicorn
2. Frontend changes hot-reload with Vite
3. Test APIs at http://localhost:8000/docs
4. View app at http://localhost:3000

Happy coding!
