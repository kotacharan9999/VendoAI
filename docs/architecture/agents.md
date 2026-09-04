# Vendo AI — Agent Architecture

Vendo AI implements a **multi-agent autonomous procurement system** using **LangGraph** as the orchestration layer. Each agent is a specialized module with validated state transitions. The Supervisor Agent coordinates the end-to-end workflow through a deterministic graph.

---

## Agent Catalog

### 1. Inventory Agent
- **Role**: Monitors current inventory, calculates burn velocity, detects stockout risk, and computes reorder recommendations.
- **Inputs**: `Inventory` table + `SalesHistory` (30-day window)
- **Outputs**: `current_stock`, `days_of_inventory`, `reorder_point`, `safety_stock`, `suggested_reorder_qty`, `stockout_risk_level`
- **Events**: `INVENTORY_RISK_DETECTED`

### 2. Demand Forecasting Agent
- **Role**: Produces 30-day demand predictions using a weighted moving average with trend and seasonality adjustments.
- **Model**: `WeightedMovingAverageWithTrend`
- **Outputs**: `predicted_demand`, `confidence_score`, `trend_factor`, `seasonality_factor`
- **Future-ready**: Architecture allows Prophet, XGBoost, LightGBM, LSTM
- **Events**: `FORECAST_GENERATED`

### 3. Supplier Discovery Agent
- **Role**: Evaluates active supplier quotes based on a 5-factor composite score (35% cost / 25% reliability / 20% delivery / 10% quality / 10% terms).
- **Output**: Ranked `supplier_quotes` with normalized component scores
- **Events**: `SUPPLIER_SELECTED`

### 4. Negotiation Agent
- **Role**: Conducts deterministic, stateful multi-round negotiations based on supplier personas (Aggressive / Rigid / Premium / Volume / Fast Delivery / Budget / Reliable / High-Risk).
- **Rounds**: Configurable (`MAX_NEGOTIATION_ROUNDS`), default 4
- **Output**: `NegotiationMessage` records with buyer offer, supplier response, and status (`IN_PROGRESS` → `COMPLETED` / `BLOCKED`)
- **Canonical Scenario**: Wireless Earbuds Pro → NovaTech negotiation from ₹1,180 → ₹1,105/unit
- **Events**: `NEGOTIATION_STARTED`, `NEGOTIATION_COUNTERED`, `NEGOTIATION_COMPLETED`

### 5. Margin Agent
- **Role**: Calculates deterministic gross/net margins, ROI, savings, and per-unit profit using `Decimal` arithmetic.
- **Inputs**: `selling_price`, `negotiated_unit_cost`, `quantity`, `shipping_per_unit`, `operational_cost_per_unit`
- **Outputs**: `gross_margin_pct`, `net_margin_pct`, `gross_profit_per_unit`, `total_savings`, `roi_pct`, `expected_revenue`
- **Events**: `MARGIN_CALCULATED`

### 6. Risk Agent
- **Role**: Evaluates procurement against deterministic policy rules and supplier risk thresholds.
- **Inputs**: `calculated_margin`, `procurement_amount`, `supplier_risk_score`, `supplier_rating`, `monthly_spent`, `monthly_budget`, `auto_purchase_enabled`
- **Outputs**: `PolicyEvaluationResult` (`ALLOWED` / `REQUIRES_HUMAN_APPROVAL` / `BLOCKED`)
- **Events**: `POLICY_CHECKED`

### 7. Procurement Agent
- **Role**: Creates `PurchaseOrder`, executes `MockPaymentProvider` (simulated escrow), updates expected inbound inventory, and records `InventoryMovement`.
- **Inputs**: `PO` with `PurchaseOrderItem` list, `supplier_id`, `quantity`, `unit_price`
- **Outputs**: `PO` (`DRAFT` → `APPROVED` → `CONFIRMED` → `RECEIVED`), `Payment` (`PENDING` → `CAPTURED`), `InventoryMovement` (`PURCHASE_ORDER_CREATED` → `EXPECTED_INBOUND`)
- **Events**: `PO_CREATED`, `PAYMENT_SIMULATED`, `INVENTORY_UPDATED`

### 8. Supervisor Agent
- **Role**: Orchestrates the full LangGraph workflow using validated Pydantic `ProcurementState` transitions. Never allows LLM overrides of policy decisions.
- **Graph Flow**: `MONITOR` → `DETECT` → `FORECAST` → `SOURCE` → `NEGOTIATE` → `EVALUATE` → `POLICY_CHECK` → `APPROVE` → `PURCHASE` → `UPDATE` → `LEARN`
- **State**: `ProcurementState` (TypedDict) with structured fields for all intermediate values
- **Events**: `AGENT_STARTED`, `AGENT_COMPLETED`

---

## State Schema (ProcurementState)

```python
class ProcurementState(TypedDict, total=False):
    organization_id: str
    product_id: str
    execution_id: str
    stage: str  # MONITOR / DETECT / FORECAST / SOURCE / ... / COMPLETE
    product_title: str
    selling_price: float
    current_stock: int
    avg_daily_sales: float
    days_of_inventory: float
    reorder_point: int
    safety_stock: int
    suggested_reorder_qty: int
    stockout_risk_level: str
    predicted_demand_30d: float
    forecast_confidence: float
    quotes: List[Dict[str, Any]]
    selected_supplier_id: str
    selected_supplier_name: str
    initial_quote: float
    target_price: float
    negotiated_price: float
    negotiation_rounds: List[Dict[str, Any]]
    expected_savings: float
    calculated_gross_margin: float
    total_spend: float
    supplier_risk_score: float
    supplier_rating: float
    policy_decision: str      # ALLOWED / REQUIRES_HUMAN_APPROVAL / BLOCKED
    policy_violations: List[str]
    policy_warnings: List[str]
    requires_human_approval: bool
    approval_id: Optional[str]
    po_number: Optional[str]
    payment_status: Optional[str]
    transaction_id: Optional[str]
    inventory_updated: bool
    events: List[Dict[str, Any]]
    error: Optional[str]
```

---

## Policy Engine Rules

The Policy Engine is a **deterministic Python module** (`PolicyEngine`) that evaluates structured inputs and returns structured results. The LLM has zero authority to modify these rules.

```python
class PolicyEngine:
    def evaluate_procurement(
        procurement_amount: Decimal,
        calculated_margin_pct: Decimal,
        supplier_rating: Decimal,
        supplier_risk: Decimal,
        quotes_count: int,
        monthly_spent: Decimal,
        ...
    ) -> PolicyEvaluationResult:  # ALLOWED / REQUIRES_APPROVAL / BLOCKED
```

### Default Rules (Configurable via `/api/settings`)

| Rule | Default | Purpose |
|------|---------|---------|
| `minimum_margin` | 25% | Block transactions that destroy gross margin |
| `target_margin` | 35% | Target negotiated outcome |
| `auto_approval_limit` | ₹50,000 | Auto-proceed threshold |
| `human_approval_limit` | ₹200,000 | Maximum order size |
| `monthly_budget` | ₹1,500,000 | Monthly spend cap |
| `minimum_supplier_rating` | 3.8 / 5.0 | Vendor quality floor |
| `maximum_supplier_risk` | 60 / 100 | Maximum vendor risk |
| `minimum_quotes` | 2 | Competitive sourcing floor |
| `max_negotiation_rounds` | 4 | Negotiation complexity cap |
| `auto_purchase_enabled` | False | Manual demo mode; future toggle for production |

---

## Security Model

- **Never commit `.env` files**; `.env` is in `.gitignore`; only `.env.example` committed
- **Environment variables**: All secrets, API keys, and database URLs configured via `.env`
- **Local auth**: JWT (HS256) with `SECRET_KEY`; `MockPaymentProvider` for simulated payments
- **Multi-tenancy**: `organization_id` enforced in all database queries via SQLAlchemy filters
- **Role-based access**: ADMIN, MANAGER, BUYER, VIEWER — enforced via `require_roles()`

---

## Demo Scenario Details

The canonical autonomous demo scenario uses the **Wireless Earbuds Pro** product (`SKU: WBR-AUD-1048`). The workflow is deterministic; the same inputs always produce the same outputs.

| Parameter | Canonical Value |
|-----------|----------------|
| Product Title | Wireless Earbuds Pro |
| Selling Price | ₹1,999 |
| Current Stock | 18 units |
| Average Daily Sales | 12 units/day |
| Days of Coverage | 1.5 days |
| Reorder Quantity | 150 units |

### Negotiation Timeline (NovaTech)

| Round | Buyer Counter | Supplier Response | Status |
|-------|----------------|-------------------|--------|
| Round 1 | ₹1,080 / unit (freight included) | ₹1,140 / unit (freight included) | Countered |
| Round 2 | ₹1,100 / unit (freight + Net 30) | ₹1,105 / unit (freight + Net 30) | Final Agreement |

### Final Demo Result

- **PO Number**: `VAI-PO-2026-1048`
- **Supplier**: NovaTech
- **Unit Price**: ₹1,105 (includes shipping)
- **Quantity**: 150
- **Savings**: ₹11,250 (vs initial ₹1,180 quote)
- **Gross Margin**: 44.7%
- **Payment**: Simulated (`CAPTURED` via MockPaymentProvider)
- **Policy**: `REQUIRES_HUMAN_APPROVAL` (amount exceeds auto-approval; manual sign-off via `/api/approvals` required)

---

## Provider Abstraction

Both AI and Payment providers are abstracted behind interfaces. The application selects providers through environment configuration.

```python
AIProvider = MockAIProvider | OpenAIProvider | GeminiProvider | AnthropicProvider
PaymentProvider = MockPaymentProvider | StripeProvider | PayPalProvider | AdyenProvider
```

- **Mock AI Provider**: Produces deterministic structured responses based on input data (no external LLM call)
- **Mock Payment Provider**: Produces deterministic simulated escrow transactions (no real money processed)
- **Local Demo Mode**: `DEMO_MODE=true` + `AI_PROVIDER=mock` ensures full functionality without any external API keys
