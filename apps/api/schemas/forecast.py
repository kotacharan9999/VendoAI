import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from apps.api.schemas.product import ProductResponse


class ForecastResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    organization_id: uuid.UUID
    product_id: uuid.UUID
    horizon_days: int
    predicted_demand: Decimal
    confidence_score: Decimal
    model_name: str
    baseline_demand: Decimal
    trend_factor: Decimal
    seasonality_factor: Decimal
    generated_at: datetime
    actual_demand: Decimal | None = None
    product: ProductResponse | None = None


class ForecastGenerationRequest(BaseModel):
    product_id: uuid.UUID
    horizon_days: int = 30
    model_name: str | None = "WeightedMovingAverageWithTrend"
