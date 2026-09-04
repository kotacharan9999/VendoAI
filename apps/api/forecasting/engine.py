import abc
from decimal import Decimal
from typing import Any

from pydantic import BaseModel


class ForecastResult(BaseModel):
    product_id: str
    horizon_days: int
    predicted_demand: Decimal
    confidence_score: Decimal
    model_name: str
    baseline_demand: Decimal
    trend_factor: Decimal
    seasonality_factor: Decimal


class BaseForecastingModel(abc.ABC):
    @abc.abstractmethod
    def predict(
        self,
        product_id: str,
        sales_records: list[dict[str, Any]],
        horizon_days: int = 30,
    ) -> ForecastResult:
        pass


class WeightedMovingAverageWithTrend(BaseForecastingModel):
    def predict(
        self,
        product_id: str,
        sales_records: list[dict[str, Any]],
        horizon_days: int = 30,
    ) -> ForecastResult:
        if not sales_records:
            return ForecastResult(
                product_id=product_id,
                horizon_days=horizon_days,
                predicted_demand=Decimal("0.00"),
                confidence_score=Decimal("0.500"),
                model_name="WeightedMovingAverageWithTrend",
                baseline_demand=Decimal("0.00"),
                trend_factor=Decimal("1.000"),
                seasonality_factor=Decimal("1.000"),
            )

        sorted_sales = sorted(sales_records, key=lambda x: x["date"], reverse=True)
        recent_7 = sorted_sales[:7]
        total_recent_units = sum(r["units_sold"] for r in recent_7)
        avg_7d = Decimal(str(total_recent_units)) / Decimal(str(max(1, len(recent_7))))

        all_units = sum(r["units_sold"] for r in sorted_sales)
        baseline_avg = Decimal(str(all_units)) / Decimal(str(max(1, len(sorted_sales))))

        if baseline_avg > Decimal(0):
            trend_factor = (avg_7d / baseline_avg).quantize(Decimal("0.001"))
            trend_factor = max(Decimal("0.700"), min(Decimal("1.400"), trend_factor))
        else:
            trend_factor = Decimal("1.000")

        seasonality_factor = Decimal("1.050")

        daily_rate = (avg_7d * Decimal("0.70") + baseline_avg * Decimal("0.30")) * seasonality_factor
        predicted_total = (daily_rate * Decimal(str(horizon_days))).quantize(Decimal("0.01"))

        data_points = len(sorted_sales)
        if data_points >= 30:
            confidence = Decimal("0.920")
        elif data_points >= 14:
            confidence = Decimal("0.850")
        elif data_points >= 7:
            confidence = Decimal("0.750")
        else:
            confidence = Decimal("0.600")

        return ForecastResult(
            product_id=product_id,
            horizon_days=horizon_days,
            predicted_demand=predicted_total,
            confidence_score=confidence,
            model_name="WeightedMovingAverageWithTrend",
            baseline_demand=(baseline_avg * Decimal(str(horizon_days))).quantize(Decimal("0.01")),
            trend_factor=trend_factor,
            seasonality_factor=seasonality_factor,
        )


class ForecastingEngine:
    def __init__(self):
        self.models: dict[str, BaseForecastingModel] = {
            "WeightedMovingAverageWithTrend": WeightedMovingAverageWithTrend(),
        }

    def forecast(
        self,
        product_id: str,
        sales_records: list[dict[str, Any]],
        horizon_days: int = 30,
        model_name: str = "WeightedMovingAverageWithTrend",
    ) -> ForecastResult:
        model = self.models.get(model_name, self.models["WeightedMovingAverageWithTrend"])
        return model.predict(product_id, sales_records, horizon_days)
