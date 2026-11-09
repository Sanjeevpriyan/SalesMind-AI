"""
Unit Tests for SalesMind AI Python Analytics Calculations.
Validates chronological ordering, KPI formulas, and revenue/profit aggregations.
"""

import pytest
import pandas as pd
from analytics import (
    clean_sales_dataframe,
    calculate_executive_kpis,
    calculate_monthly_metrics,
    calculate_country_metrics
)


@pytest.fixture
def sample_test_df():
    data = [
        {"order_date": "2024-01-15", "country": "USA", "product_name": "Monitor", "quantity": 2, "unit_price": 500, "unit_cost": 300},
        {"order_date": "2024-01-20", "country": "Germany", "product_name": "Chair", "quantity": 1, "unit_price": 200, "unit_cost": 250}, # loss item
        {"order_date": "2024-02-10", "country": "USA", "product_name": "Monitor", "quantity": 1, "unit_price": 500, "unit_cost": 300},
    ]
    return pd.DataFrame(data)


def test_clean_sales_dataframe(sample_test_df):
    cleaned = clean_sales_dataframe(sample_test_df)
    assert len(cleaned) == 3
    assert 'revenue' in cleaned.columns
    assert 'profit' in cleaned.columns
    assert 'profit_margin' in cleaned.columns
    # Check revenue: 2 * 500 = 1000
    assert cleaned.loc[0, 'revenue'] == 1000
    assert cleaned.loc[0, 'profit'] == 400


def test_kpi_calculations(sample_test_df):
    cleaned = clean_sales_dataframe(sample_test_df)
    kpis = calculate_executive_kpis(cleaned)
    # Total revenue: 1000 + 200 + 500 = 1700
    assert kpis['totalRevenue'] == 1700.0
    # Total cost: 600 + 250 + 300 = 1150
    assert kpis['totalCost'] == 1150.0
    # Total profit: 1700 - 1150 = 550
    assert kpis['totalProfit'] == 550.0
    assert kpis['totalQuantity'] == 4


def test_chronological_monthly_order(sample_test_df):
    cleaned = clean_sales_dataframe(sample_test_df)
    monthly = calculate_monthly_metrics(cleaned)
    assert len(monthly) == 2
    assert monthly[0]['yearMonth'] == '2024-01'
    assert monthly[1]['yearMonth'] == '2024-02'
    # MoM revenue growth in Feb
    assert monthly[1]['momRevenueGrowth'] is not None


def test_country_loss_detection(sample_test_df):
    cleaned = clean_sales_dataframe(sample_test_df)
    countries = calculate_country_metrics(cleaned)
    germany = next((c for c in countries if c['country'] == 'Germany'), None)
    assert germany is not None
    assert germany['loss'] == 50.0  # 200 - 250 = -50
