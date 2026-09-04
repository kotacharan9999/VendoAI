import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from apps.api.database import get_db
from apps.api.forecasting.engine import ForecastingEngine
from apps.api.models import Forecast, Product, SalesHistory, User
from apps.api.schemas.forecast import ForecastGenerationRequest, ForecastResponse
from apps.api.services.auth import get_current_user

router = APIRouter(prefix="/forecasts", tags=["forecasts"])


@router.get("", response_model=list[ForecastResponse])
async def list_forecasts(
    product_id: uuid.UUID | None = None,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Forecast)
        .options(selectinload(Forecast.product).selectinload(Product.images))
        .where(Forecast.organization_id == current_user.organization_id)
        .order_by(Forecast.generated_at.desc())
        .limit(limit)
    )
    if product_id:
        stmt = stmt.where(Forecast.product_id == product_id)
    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("/generate", response_model=ForecastResponse)
async def generate_forecast(
    data: ForecastGenerationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(SalesHistory)
        .where(SalesHistory.product_id == data.product_id, SalesHistory.organization_id == current_user.organization_id)
        .order_by(SalesHistory.date.desc())
        .limit(60)
    )
    res = await db.execute(stmt)
    sales = [{"date": s.date, "units_sold": s.units_sold} for s in res.scalars().all()]

    engine = ForecastingEngine()
    result = engine.forecast(str(data.product_id), sales, data.horizon_days, data.model_name or "WeightedMovingAverageWithTrend")

    forecast = Forecast(
        organization_id=current_user.organization_id,
        product_id=data.product_id,
        horizon_days=data.horizon_days,
        predicted_demand=result.predicted_demand,
        confidence_score=result.confidence_score,
        model_name=result.model_name,
        baseline_demand=result.baseline_demand,
        trend_factor=result.trend_factor,
        seasonality_factor=result.seasonality_factor,
    )
    db.add(forecast)
    await db.commit()
    await db.refresh(forecast)
    return forecast
