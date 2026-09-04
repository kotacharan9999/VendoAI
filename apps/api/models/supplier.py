import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from apps.api.database import Base

if TYPE_CHECKING:
    from apps.api.models.negotiation import Negotiation


class Supplier(Base):
    __tablename__ = "suppliers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    rating: Mapped[Decimal] = mapped_column(Numeric(3, 2), default=Decimal("4.00"), nullable=False)
    reliability_score: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("85.00"), nullable=False)
    delivery_score: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("85.00"), nullable=False)
    quality_score: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("85.00"), nullable=False)
    payment_terms: Mapped[str] = mapped_column(String(100), default="Net 30", nullable=False)
    risk_score: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("20.00"), nullable=False)
    negotiation_style: Mapped[str] = mapped_column(String(50), default="Reliable Supplier", nullable=False)
    min_order_qty: Mapped[int] = mapped_column(Integer, default=50, nullable=False)
    lead_time_days: Mapped[int] = mapped_column(Integer, default=7, nullable=False)
    location: Mapped[str] = mapped_column(String(255), default="Bengaluru, India", nullable=False)
    categories: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    organization = relationship("Organization", back_populates="suppliers")
    products: Mapped[list["SupplierProduct"]] = relationship("SupplierProduct", back_populates="supplier", cascade="all, delete-orphan")
    quotes: Mapped[list["SupplierQuote"]] = relationship("SupplierQuote", back_populates="supplier", cascade="all, delete-orphan")
    negotiations: Mapped[list["Negotiation"]] = relationship("Negotiation", back_populates="supplier", cascade="all, delete-orphan")
    purchase_orders = relationship("PurchaseOrder", back_populates="supplier")


class SupplierProduct(Base):
    __tablename__ = "supplier_products"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    supplier_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("suppliers.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    supplier_sku: Mapped[str | None] = mapped_column(String(100), nullable=True)
    base_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    min_order_qty: Mapped[int] = mapped_column(Integer, default=50, nullable=False)
    lead_time_days: Mapped[int] = mapped_column(Integer, default=7, nullable=False)
    is_preferred: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    supplier = relationship("Supplier", back_populates="products")
    product = relationship("Product", back_populates="supplier_products")


class SupplierQuote(Base):
    __tablename__ = "supplier_quotes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    supplier_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("suppliers.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    shipping_cost: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    total_quote: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    payment_terms: Mapped[str] = mapped_column(String(100), default="Net 30", nullable=False)
    lead_time_days: Mapped[int] = mapped_column(Integer, default=7, nullable=False)
    validity_days: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="RECEIVED", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    supplier = relationship("Supplier", back_populates="quotes")
    product = relationship("Product")
