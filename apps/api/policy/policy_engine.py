from decimal import Decimal
from typing import Any

from pydantic import BaseModel

from apps.api.config import settings


class PolicyEvaluationResult(BaseModel):
    decision: str
    allowed: bool
    requires_human_approval: bool
    blocked: bool
    violated_rules: list[str] = []
    warnings: list[str] = []
    calculated_margin: Decimal
    procurement_amount: Decimal
    reason_summary: str
    metadata: dict[str, Any] = {}


class PolicyEngine:
    @staticmethod
    def evaluate_procurement(
        procurement_amount: Decimal,
        calculated_margin_pct: Decimal,
        supplier_rating: Decimal,
        supplier_risk: Decimal,
        quotes_count: int,
        monthly_spent: Decimal = Decimal(0),
        auto_purchase_enabled: bool = settings.AUTO_PURCHASE_ENABLED,
        min_margin: Decimal = settings.MINIMUM_MARGIN * Decimal(100),
        target_margin: Decimal = settings.TARGET_MARGIN * Decimal(100),
        auto_approval_limit: Decimal = settings.AUTO_APPROVAL_LIMIT,
        human_approval_limit: Decimal = settings.HUMAN_APPROVAL_LIMIT,
        monthly_budget: Decimal = settings.MONTHLY_BUDGET,
        min_supplier_rating: Decimal = settings.MINIMUM_SUPPLIER_RATING,
        max_supplier_risk: Decimal = settings.MAXIMUM_SUPPLIER_RISK,
        min_quotes: int = settings.MINIMUM_QUOTES,
    ) -> PolicyEvaluationResult:
        violated_rules: list[str] = []
        warnings: list[str] = []
        requires_approval = False

        if calculated_margin_pct < min_margin:
            violated_rules.append(
                f"Gross margin ({calculated_margin_pct}%) is below minimum requirement ({min_margin}%)."
            )

        if monthly_spent + procurement_amount > monthly_budget:
            violated_rules.append(
                f"Total spend with this order (₹{monthly_spent + procurement_amount}) exceeds monthly budget (₹{monthly_budget})."
            )

        if supplier_risk > max_supplier_risk:
            violated_rules.append(
                f"Supplier risk score ({supplier_risk}) exceeds maximum allowable threshold ({max_supplier_risk})."
            )

        if supplier_rating < min_supplier_rating:
            violated_rules.append(
                f"Supplier rating ({supplier_rating}) is below minimum acceptable rating ({min_supplier_rating})."
            )

        if quotes_count < min_quotes:
            warnings.append(
                f"Fewer quotes collected ({quotes_count}) than standard minimum ({min_quotes})."
            )

        if calculated_margin_pct < target_margin and calculated_margin_pct >= min_margin:
            warnings.append(
                f"Gross margin ({calculated_margin_pct}%) meets minimum ({min_margin}%) but is under target ({target_margin}%)."
            )

        if procurement_amount > human_approval_limit:
            violated_rules.append(
                f"Order amount (₹{procurement_amount}) exceeds maximum human approval ceiling (₹{human_approval_limit})."
            )
        elif procurement_amount > auto_approval_limit:
            requires_approval = True
            warnings.append(
                f"Order amount (₹{procurement_amount}) exceeds auto-approval threshold (₹{auto_approval_limit}). Human sign-off required."
            )

        if not auto_purchase_enabled:
            requires_approval = True

        if violated_rules:
            decision = "BLOCKED"
            is_allowed = False
            requires_human_approval = False
            is_blocked = True
            reason = f"Procurement blocked due to policy violations: {'; '.join(violated_rules)}"
        elif requires_approval:
            decision = "REQUIRES_HUMAN_APPROVAL"
            is_allowed = False
            requires_human_approval = True
            is_blocked = False
            reason = f"Policy checks passed with conditions. Human approval required: {'; '.join(warnings) if warnings else 'Auto-purchase disabled.'}"
        else:
            decision = "ALLOWED"
            is_allowed = True
            requires_human_approval = False
            is_blocked = False
            reason = "All deterministic policy and margin constraints satisfied. Order cleared for execution."

        return PolicyEvaluationResult(
            decision=decision,
            allowed=is_allowed,
            requires_human_approval=requires_human_approval,
            blocked=is_blocked,
            violated_rules=violated_rules,
            warnings=warnings,
            calculated_margin=calculated_margin_pct,
            procurement_amount=procurement_amount,
            reason_summary=reason,
            metadata={
                "min_margin_threshold": float(min_margin),
                "target_margin_threshold": float(target_margin),
                "auto_approval_limit": float(auto_approval_limit),
                "monthly_budget": float(monthly_budget),
                "supplier_rating": float(supplier_rating),
                "supplier_risk": float(supplier_risk),
            },
        )
