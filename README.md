# CashCompass

An AI-powered financial coaching application that provides insights, goal tracking, subscription management, portfolio tracking, and interactive financial guidance using the OpenAI API.

## Tech Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **Pandas** - Data analytics and processing
- **NumPy** - Numerical computing for heuristic scoring
- **OpenAI API** - ChatGPT integration for natural language insights
- **yfinance** - Real-time stock price data

### Frontend
- **React** - UI framework
- **Vite** - Build tool and dev server
- **Chakra UI** - Component library
- **Recharts** - Data visualization
- **React Router** - Client-side routing

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

## Video
[Link to presentation video](https://youtu.be/nPSECGk6Shg)

## Contact
For questions or feedback, reach out @ dchapman.jp@gmail.com
