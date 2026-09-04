import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from apps.api.database import Base


class Forecast(Base):
    __tablename__ = "forecasts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    horizon_days: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    predicted_demand: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    confidence_score: Mapped[Decimal] = mapped_column(Numeric(4, 3), default=Decimal("0.850"), nullable=False)
    model_name: Mapped[str] = mapped_column(String(100), default="WeightedMovingAverageWithTrend", nullable=False)
    baseline_demand: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.0"), nullable=False)
    trend_factor: Mapped[Decimal] = mapped_column(Numeric(6, 3), default=Decimal("1.000"), nullable=False)
    seasonality_factor: Mapped[Decimal] = mapped_column(Numeric(6, 3), default=Decimal("1.000"), nullable=False)
    generated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    actual_demand: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)

    product = relationship("Product", back_populates="forecasts")
