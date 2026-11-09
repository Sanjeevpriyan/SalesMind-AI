"""
SalesMind AI - FastAPI Application Server
Provides REST API endpoints for sales data ingestion, validation,
KPI calculations, monthly analysis, forecasting, sentiment, and recommendations.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import io
import pandas as pd

from analytics import (
    clean_sales_dataframe,
    calculate_executive_kpis,
    calculate_monthly_metrics,
    calculate_country_metrics,
    calculate_product_metrics
)
from forecasting import forecast_monthly_sales
from sentiment import analyze_reviews

app = FastAPI(
    title="SalesMind AI Analytics API",
    description="Python & FastAPI backend for Advanced Monthly Sales Analysis, Country Intelligence & Customer Insights",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store for uploaded dataframe session
active_dataset: Optional[pd.DataFrame] = None


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "SalesMind AI Python Analytics Engine"}


@app.post("/api/upload")
async def upload_dataset(file: UploadFile = File(...)):
    """Upload CSV or Excel sales data file and validate schema."""
    global active_dataset
    try:
        contents = await file.read()
        filename = file.filename.lower()
        if filename.endswith(".csv"):
            df_raw = pd.read_csv(io.BytesIO(contents))
        elif filename.endswith((".xls", ".xlsx")):
            df_raw = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Only CSV or Excel files are supported")

        cleaned = clean_sales_dataframe(df_raw)
        active_dataset = cleaned

        return {
            "status": "success",
            "message": f"Successfully ingested {len(cleaned)} records.",
            "totalRows": len(cleaned),
            "dateRange": {
                "start": str(cleaned['order_date'].min().date()),
                "end": str(cleaned['order_date'].max().date())
            },
            "columns": list(cleaned.columns)
        }
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Dataset parsing error: {str(e)}")


@app.get("/api/kpis")
def get_kpis():
    """Returns Executive KPIs computed strictly from the active dataset."""
    if active_dataset is None or active_dataset.empty:
        raise HTTPException(status_code=400, detail="No active dataset loaded")
    return calculate_executive_kpis(active_dataset)


@app.get("/api/monthly-sales")
def get_monthly_sales():
    """Returns chronologically ordered monthly sales, profit, quantity, and MoM growth."""
    if active_dataset is None or active_dataset.empty:
        raise HTTPException(status_code=400, detail="No active dataset loaded")
    return calculate_monthly_metrics(active_dataset)


@app.get("/api/countries")
def get_country_intelligence():
    """Returns country performance, revenue, profit, and loss analysis."""
    if active_dataset is None or active_dataset.empty:
        raise HTTPException(status_code=400, detail="No active dataset loaded")
    return calculate_country_metrics(active_dataset)


@app.get("/api/products")
def get_product_performance():
    """Returns product performance, identifying high-margin and loss-making SKUs."""
    if active_dataset is None or active_dataset.empty:
        raise HTTPException(status_code=400, detail="No active dataset loaded")
    return calculate_product_metrics(active_dataset)


@app.get("/api/forecast")
def get_sales_forecast(horizon: int = Query(3, ge=1, le=12), model: str = "exponential_smoothing"):
    """Returns Holt-Winters or Linear Trend sales forecast with confidence intervals."""
    if active_dataset is None or active_dataset.empty:
        raise HTTPException(status_code=400, detail="No active dataset loaded")
    monthly = calculate_monthly_metrics(active_dataset)
    return forecast_monthly_sales(monthly, horizon_months=horizon, model_name=model)


@app.get("/api/sentiment")
def get_customer_sentiment():
    """Extracts customer complaint themes and rating distributions."""
    if active_dataset is None or active_dataset.empty:
        raise HTTPException(status_code=400, detail="No active dataset loaded")
    records = active_dataset.to_dict(orient='records')
    return analyze_reviews(records)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
