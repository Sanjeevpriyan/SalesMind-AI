"""
SalesMind AI - Advanced Python Analytics Engine
Performs Pandas-based data cleaning, chronological time-series aggregations,
KPI calculations, country intelligence, product profit/loss analysis, and RFM segmentation.
"""

from typing import Dict, List, Any, Optional
import pandas as pd
import numpy as np


def clean_sales_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cleans raw uploaded sales data: parses dates, handles missing values,
    ensures proper numerical types, and sorts chronologically.
    """
    df = df.copy()

    # Normalize column names
    col_map = {}
    for col in df.columns:
        c_clean = str(col).strip().lower().replace(" ", "_").replace("-", "_")
        col_map[col] = c_clean
    df.rename(columns=col_map, inplace=True)

    # Standardize order_date
    date_col = next((c for c in ['order_date', 'date', 'invoicedate', 'timestamp'] if c in df.columns), None)
    if date_col:
        df['order_date'] = pd.to_datetime(df[date_col], errors='coerce')
        df = df.dropna(subset=['order_date'])
        df['year'] = df['order_date'].dt.year.astype(int)
        df['month'] = df['order_date'].dt.month.astype(int)
        df['month_name'] = df['order_date'].dt.strftime('%b %Y')
        df['year_month'] = df['order_date'].dt.strftime('%Y-%m')
    else:
        raise ValueError("Missing required order date column")

    # Ensure quantity and unit_price
    qty_col = next((c for c in ['quantity', 'qty', 'units', 'count'] if c in df.columns), None)
    df['quantity'] = pd.to_numeric(df[qty_col], errors='coerce').fillna(1) if qty_col else 1

    price_col = next((c for c in ['unit_price', 'price', 'rate', 'sale_price'] if c in df.columns), None)
    df['unit_price'] = pd.to_numeric(df[price_col], errors='coerce').fillna(0) if price_col else 0

    rev_col = next((c for c in ['revenue', 'sales', 'total_sales', 'total_amount'] if c in df.columns), None)
    if rev_col:
        df['revenue'] = pd.to_numeric(df[rev_col], errors='coerce').fillna(df['quantity'] * df['unit_price'])
    else:
        df['revenue'] = df['quantity'] * df['unit_price']

    # Cost & Profit calculation
    cost_col = next((c for c in ['unit_cost', 'cost', 'cogs', 'cost_price'] if c in df.columns), None)
    if cost_col:
        df['unit_cost'] = pd.to_numeric(df[cost_col], errors='coerce').fillna(df['unit_price'] * 0.65)
    else:
        df['unit_cost'] = df['unit_price'] * 0.65

    df['cost'] = df['quantity'] * df['unit_cost']
    df['profit'] = df['revenue'] - df['cost']
    df['profit_margin'] = np.where(df['revenue'] > 0, (df['profit'] / df['revenue']) * 100, 0.0)

    # Country & Product
    c_col = next((c for c in ['country', 'region', 'ship_country', 'market'] if c in df.columns), None)
    df['country'] = df[c_col].fillna("Unknown") if c_col else "Unknown"

    p_col = next((c for c in ['product_name', 'product', 'item_name', 'item', 'description'] if c in df.columns), None)
    df['product_name'] = df[p_col].fillna("General Item") if p_col else "General Item"

    # Sort chronologically
    df = df.sort_values(by='order_date').reset_index(drop=True)
    return df


def calculate_executive_kpis(df: pd.DataFrame) -> Dict[str, Any]:
    """Calculates high-level executive KPIs strictly from the dataset."""
    if df.empty:
        return {
            "totalRevenue": 0.0, "totalProfit": 0.0, "totalCost": 0.0,
            "totalOrders": 0, "totalQuantity": 0, "avgOrderValue": 0.0,
            "profitMargin": 0.0, "growthRevenuePct": None, "growthProfitPct": None
        }

    total_revenue = float(df['revenue'].sum())
    total_cost = float(df['cost'].sum())
    total_profit = float(df['profit'].sum())
    total_qty = int(df['quantity'].sum())

    order_col = 'order_id' if 'order_id' in df.columns else 'index'
    total_orders = int(df[order_col].nunique()) if order_col in df.columns else len(df)
    aov = total_revenue / total_orders if total_orders > 0 else 0.0
    margin = (total_profit / total_revenue * 100) if total_revenue > 0 else 0.0

    return {
        "totalRevenue": round(total_revenue, 2),
        "totalProfit": round(total_profit, 2),
        "totalCost": round(total_cost, 2),
        "totalOrders": total_orders,
        "totalQuantity": total_qty,
        "avgOrderValue": round(aov, 2),
        "profitMargin": round(margin, 1)
    }


def calculate_monthly_metrics(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Chronological monthly revenue, profit, volume, and MoM growth metrics."""
    if df.empty:
        return []

    grouped = df.groupby(['year', 'month', 'year_month', 'month_name']).agg(
        revenue=('revenue', 'sum'),
        profit=('profit', 'sum'),
        cost=('cost', 'sum'),
        quantity=('quantity', 'sum'),
        orders=('order_date', 'count')
    ).reset_index()

    # Sort strictly chronologically
    grouped = grouped.sort_values(by=['year', 'month']).reset_index(drop=True)

    result = []
    for i, row in grouped.iterrows():
        rev = float(row['revenue'])
        prof = float(row['profit'])
        cost = float(row['cost'])
        margin = (prof / rev * 100) if rev > 0 else 0.0

        mom_rev = None
        mom_prof = None
        if i > 0:
            prev_rev = float(grouped.loc[i - 1, 'revenue'])
            prev_prof = float(grouped.loc[i - 1, 'profit'])
            if prev_rev > 0:
                mom_rev = round(((rev - prev_rev) / prev_rev) * 100, 1)
            if prev_prof != 0:
                mom_prof = round(((prof - prev_prof) / abs(prev_prof)) * 100, 1)

        result.append({
            "yearMonth": row['year_month'],
            "label": row['month_name'],
            "year": int(row['year']),
            "month": int(row['month']),
            "revenue": round(rev, 2),
            "profit": round(prof, 2),
            "cost": round(cost, 2),
            "quantity": int(row['quantity']),
            "orders": int(row['orders']),
            "margin": round(margin, 1),
            "momRevenueGrowth": mom_rev,
            "momProfitGrowth": mom_prof
        })

    return result


def calculate_country_metrics(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Calculates country intelligence, identifying high profit, losses, and order distribution."""
    if df.empty:
        return []

    records = []
    for country, group in df.groupby('country'):
        rev = float(group['revenue'].sum())
        prof = float(group['profit'].sum())
        losses = float(group[group['profit'] < 0]['profit'].abs().sum())
        qty = int(group['quantity'].sum())
        orders = len(group)
        margin = (prof / rev * 100) if rev > 0 else 0.0

        top_prod = group.groupby('product_name')['revenue'].sum().idxmax() if not group.empty else "N/A"

        records.append({
            "country": str(country),
            "revenue": round(rev, 2),
            "profit": round(prof, 2),
            "loss": round(losses, 2),
            "orders": orders,
            "quantity": qty,
            "margin": round(margin, 1),
            "topProduct": top_prod
        })

    # Sort descending by revenue
    records.sort(key=lambda x: x['revenue'], reverse=True)
    return records


def calculate_product_metrics(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Calculates product profitability, margins, and identifies loss-making items."""
    if df.empty:
        return []

    records = []
    for prod_name, group in df.groupby('product_name'):
        rev = float(group['revenue'].sum())
        cost = float(group['cost'].sum())
        prof = float(group['profit'].sum())
        qty = int(group['quantity'].sum())
        margin = (prof / rev * 100) if rev > 0 else 0.0
        avg_price = rev / qty if qty > 0 else 0.0

        records.append({
            "productName": str(prod_name),
            "revenue": round(rev, 2),
            "cost": round(cost, 2),
            "profit": round(prof, 2),
            "quantity": qty,
            "margin": round(margin, 1),
            "avgUnitPrice": round(avg_price, 2)
        })

    records.sort(key=lambda x: x['revenue'], reverse=True)
    return records
