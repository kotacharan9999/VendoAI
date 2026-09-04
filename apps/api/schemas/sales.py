import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class SalesHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    organization_id: uuid.UUID
    product_id: uuid.UUID
    date: date
    units_sold: int
    unit_price: Decimal
    total_revenue: Decimal
    channel: str
    created_at: datetime


class SalesVelocity(BaseModel):
    product_id: uuid.UUID
    days_analyzed: int
    total_units_sold: int
    total_revenue: Decimal
    avg_daily_sales: Decimal
    recent_7d_avg: Decimal
    prior_30d_avg: Decimal
    sales_trend_pct: Decimal
