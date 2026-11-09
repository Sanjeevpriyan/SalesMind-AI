# SalesMind AI - Python Backend & Business Intelligence System

## 1. Project Overview
**SalesMind AI** is a comprehensive Data Analytics and Business Intelligence application designed to evaluate monthly sales performance, country revenue distributions, SKU unit profitability, customer sentiment themes, and statistical sales forecasting using Python, Pandas, NumPy, Scikit-learn, and Statsmodels.

## 2. Directory Structure
```
backend/
├── main.py              # FastAPI application & REST API routing
├── analytics.py         # Pandas/NumPy cleaning, KPIs, and monthly MoM engine
├── forecasting.py       # Holt-Winters Exponential Smoothing & Linear Trend forecasting
├── sentiment.py         # NLP Customer Review keyword theme extraction
├── test_analytics.py    # Pytest unit tests for analytical formulas
└── requirements.txt     # Python dependencies
```

## 3. Installation & Setup Instructions

### Prerequisites
- Python 3.10 or higher
- pip package manager

### Step 1: Create Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### Step 2: Install Python Dependencies
```bash
pip install -r backend/requirements.txt
```

### Step 3: Run Unit Tests
```bash
pytest backend/test_analytics.py -v
```

### Step 4: Launch FastAPI Server
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive API documentation will be available at: `http://localhost:8000/docs`

## 4. Frontend Integration
The React web application can connect directly to `http://localhost:8000` or utilize the full-stack Express service proxy, providing seamless standalone demo data exploration and live API uploads.
