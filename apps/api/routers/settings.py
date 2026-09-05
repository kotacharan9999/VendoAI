from decimal import Decimal
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.config import settings
from apps.api.database import get_db
from apps.api.models import BusinessRule, Organization, User
from apps.api.schemas.rule import SettingsUpdate
from apps.api.services.auth import get_current_user, require_roles
from apps.api.services.demo_data import get_demo_settings

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("", response_model=dict[str, Any])
async def get_settings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if db is None:
        return get_demo_settings()

    try:
        stmt = select(BusinessRule).where(BusinessRule.organization_id == current_user.organization_id)
        rules = (await db.execute(stmt)).scalars().all()
        rule_dict = {r.rule_key: (r.value_numeric if r.value_numeric is not None else r.value_boolean if r.value_boolean is not None else r.value_text) for r in rules}

        stmt_org = select(Organization).where(Organization.id == current_user.organization_id)
        org = (await db.execute(stmt_org)).scalar_one_or_none()

        return {
            "organization_name": org.name if org else "Acme Retail India (Rayalaseema Procurement Hub)",
            "currency": org.currency if org else "INR",
            "ai_provider": settings.AI_PROVIDER,
            "minimum_margin": rule_dict.get("minimum_margin", Decimal("0.25")),
            "target_margin": rule_dict.get("target_margin", Decimal("0.35")),
            "auto_approval_limit": rule_dict.get("auto_approval_limit", Decimal(50000)),
            "human_approval_limit": rule_dict.get("human_approval_limit", Decimal(200000)),
            "monthly_budget": rule_dict.get("monthly_budget", Decimal(1500000)),
            "minimum_supplier_rating": rule_dict.get("minimum_supplier_rating", Decimal("3.8")),
            "maximum_supplier_risk": rule_dict.get("maximum_supplier_risk", Decimal(60)),
            "minimum_quotes": rule_dict.get("minimum_quotes", 2),
            "max_negotiation_rounds": rule_dict.get("max_negotiation_rounds", 4),
            "auto_purchase_enabled": rule_dict.get("auto_purchase_enabled", False),
            "regional_default_hub": rule_dict.get("regional_default_hub", "Kurnool Central Agro-Terminal (NH-44)"),
            "ap_gstin_code": rule_dict.get("ap_gstin_code", "37"),
            "apmc_mandi_cess_percent": rule_dict.get("apmc_mandi_cess_percent", Decimal("1.00")),
            "local_freight_tariff_per_ton_km": rule_dict.get("local_freight_tariff_per_ton_km", Decimal("4.50")),
            "negotiation_aggressiveness": rule_dict.get("negotiation_aggressiveness", "BALANCED"),
            "auto_counter_threshold": rule_dict.get("auto_counter_threshold", Decimal("0.05")),
            "enable_security_verification": rule_dict.get("enable_security_verification", True),
            "whatsapp_supplier_dispatch": rule_dict.get("whatsapp_supplier_dispatch", True),
            "email_po_dispatch": rule_dict.get("email_po_dispatch", True),
        }
    except Exception:
        return get_demo_settings()


@router.put("", response_model=dict[str, Any])
async def update_settings(
    data: SettingsUpdate,
    current_user: User = Depends(require_roles(["ADMIN", "MANAGER"])),
    db: AsyncSession = Depends(get_db),
):
    updates = data.model_dump(exclude_unset=True)
    for key, val in updates.items():
        if key in ["organization_name", "currency", "ai_provider"]:
            continue
        stmt = select(BusinessRule).where(
            BusinessRule.organization_id == current_user.organization_id, BusinessRule.rule_key == key
        )
        rule = (await db.execute(stmt)).scalar_one_or_none()
        if not rule:
            rule = BusinessRule(
                organization_id=current_user.organization_id,
                rule_name=key.replace("_", " ").title(),
                rule_key=key,
            )
            db.add(rule)

        if isinstance(val, bool):
            rule.value_boolean = val
        elif isinstance(val, (int, float, Decimal)):
            rule.value_numeric = Decimal(str(val))
        elif isinstance(val, str):
            rule.value_text = val

    await db.commit()
    return await get_settings(current_user=current_user, db=db)
