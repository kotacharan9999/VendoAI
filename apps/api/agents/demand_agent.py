import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.agents.state import ProcurementState
from apps.api.audit.audit_service import AuditService
from apps.api.forecasting.engine import ForecastingEngine
from apps.api.models.forecast import Forecast
from apps.api.models.sales import SalesHistory


async def run_demand_agent(state: ProcurementState, db: AsyncSession, agent_run_id: uuid.UUID) -> ProcurementState:
    org_id = uuid.UUID(state["organization_id"])
    prod_id = uuid.UUID(state["product_id"])

    stmt = (
        select(SalesHistory)
        .where(SalesHistory.product_id == prod_id, SalesHistory.organization_id == org_id)
        .order_by(SalesHistory.date.desc())
        .limit(60)
    )
    res = await db.execute(stmt)
    records = [{"date": s.date, "units_sold": s.units_sold} for s in res.scalars().all()]

    engine = ForecastingEngine()
    forecast_res = engine.forecast(str(prod_id), records, horizon_days=30)

    db_forecast = Forecast(
        organization_id=org_id,
        product_id=prod_id,
        horizon_days=30,
        predicted_demand=forecast_res.predicted_demand,
        confidence_score=forecast_res.confidence_score,
        model_name=forecast_res.model_name,
        baseline_demand=forecast_res.baseline_demand,
        trend_factor=forecast_res.trend_factor,
        seasonality_factor=forecast_res.seasonality_factor,
    )
    db.add(db_forecast)
    await db.flush()

    event_msg = f"Generated 30-day demand forecast of {forecast_res.predicted_demand} units with {int(forecast_res.confidence_score * 100)}% confidence."
    await AuditService.record_agent_event(
        db=db,
        organization_id=org_id,
        agent_run_id=agent_run_id,
        event_type="FORECAST_GENERATED",
        message=event_msg,
        details={
            "predicted_demand_30d": float(forecast_res.predicted_demand),
            "confidence": float(forecast_res.confidence_score),
            "trend_factor": float(forecast_res.trend_factor),
        },
    )

    state["predicted_demand_30d"] = float(forecast_res.predicted_demand)
    state["forecast_confidence"] = float(forecast_res.confidence_score)
    state["stage"] = "SOURCE"
    return state
