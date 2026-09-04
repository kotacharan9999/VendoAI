# Vendo AI — Database Design

## Overview

PostgreSQL 16+ with SQLAlchemy 2.x async ORM. All tables use UUID primary keys, tenant isolation via `organization_id`, and appropriate indexes for query performance.

---

## Entity Relationship Diagram

```
organizations 1───∞ users
organizations 1───∞ products
organizations 1───∞ suppliers
organizations 1───∞ purchase_orders
organizations 1───∞ approvals
organizations 1───∞ agent_runs
organizations 1───∞ audit_logs
organizations 1───∞ notifications

products 1───1 inventory
products 1───∞ product_images
products 1───∞ sales_history
products 1───∞ forecasts
products 1───∞ procurement_opportunities
products 1───∞ supplier_products
products 1───∞ supplier_quotes

suppliers 1───∞ supplier_products
suppliers 1───∞ supplier_quotes
suppliers 1───∞ negotiations
suppliers 1───∞ purchase_orders

negotiations 1───∞ negotiation_messages
purchase_orders 1───∞ purchase_order_items
purchase_orders 1───∞ payments
agent_runs 1───∞ agent_events
```

---

## Tables

### Core Tenancy

```sql
organizations (
    id UUID PK,
    name VARCHAR(255),
    slug VARCHAR(100) UNIQUE,
    currency VARCHAR(10) DEFAULT 'INR',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)

users (
    id UUID PK,
    organization_id UUID FK → organizations.id,
    email VARCHAR(255) UNIQUE,
    hashed_password VARCHAR(255),
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'BUYER',  -- ADMIN/MANAGER/BUYER/VIEWER
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

### Product Catalog

```sql
products (
    id UUID PK,
    organization_id UUID FK → organizations.id,
    title VARCHAR(255),
    description TEXT,
    category VARCHAR(100),
    sku VARCHAR(100),
    source VARCHAR(50) DEFAULT 'internal',
    source_product_id VARCHAR(100),
    selling_price NUMERIC(12,2),
    cost_price NUMERIC(12,2),
    currency VARCHAR(10) DEFAULT 'INR',
    dimensions JSONB,
    metadata_json JSONB,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    INDEX(org_id), INDEX(category), INDEX(sku), INDEX(source_product_id)
)

product_images (
    id UUID PK,
    product_id UUID FK → products.id,
    original_url VARCHAR(1024),
    primary_path VARCHAR(1024),
    thumbnail_path VARCHAR(1024),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    INDEX(product_id)
)

inventory (
    id UUID PK,
    organization_id UUID FK → organizations.id,
    product_id UUID FK → products.id UNIQUE,
    current_stock INTEGER DEFAULT 0,
    reserved_stock INTEGER DEFAULT 0,
    expected_inbound INTEGER DEFAULT 0,
    reorder_point INTEGER DEFAULT 10,
    safety_stock INTEGER DEFAULT 5,
    suggested_reorder_qty INTEGER DEFAULT 50,
    days_of_inventory NUMERIC(10,2) DEFAULT 0,
    stockout_risk_level VARCHAR(50) DEFAULT 'LOW',
    last_checked_at TIMESTAMP,
    updated_at TIMESTAMP,
    INDEX(org_id), UNIQUE(product_id)
)

inventory_movements (
    id UUID PK,
    organization_id UUID FK → organizations.id,
    product_id UUID FK → products.id,
    reference_type VARCHAR(50),
    reference_id VARCHAR(100),
    movement_type VARCHAR(50),
    quantity INTEGER,
    previous_stock INTEGER,
    new_stock INTEGER,
    reason VARCHAR(255),
    created_at TIMESTAMP,
    INDEX(org_id), INDEX(product_id)
)

sales_history (
    id UUID PK,
    organization_id UUID FK → organizations.id,
    product_id UUID FK → products.id,
    date DATE,
    units_sold INTEGER,
    unit_price NUMERIC(12,2),
    total_revenue NUMERIC(12,2),
    channel VARCHAR(50) DEFAULT 'direct',
    created_at TIMESTAMP,
    INDEX(org_id), INDEX(product_id), INDEX(date)
)

forecasts (
    id UUID PK,
    organization_id UUID FK → organizations.id,
    product_id UUID FK → products.id,
    horizon_days INTEGER DEFAULT 30,
    predicted_demand NUMERIC(10,2),
    confidence_score NUMERIC(4,3) DEFAULT 0.850,
    model_name VARCHAR(100) DEFAULT 'WeightedMovingAverageWithTrend',
    baseline_demand NUMERIC(10,2) DEFAULT 0,
    trend_factor NUMERIC(6,3) DEFAULT 1.000,
    seasonality_factor NUMERIC(6,3) DEFAULT 1.000,
    generated_at TIMESTAMP,
    actual_demand NUMERIC(10,2),
    INDEX(org_id), INDEX(product_id)
)
```

### Supplier Network

```sql
suppliers (
    id UUID PK,
    organization_id UUID FK → organizations.id,
    name VARCHAR(255),
    rating NUMERIC(3,2) DEFAULT 4.00,
    reliability_score NUMERIC(5,2) DEFAULT 85.00,
    delivery_score NUMERIC(5,2) DEFAULT 85.00,
    quality_score NUMERIC(5,2) DEFAULT 85.00,
    payment_terms VARCHAR(100) DEFAULT 'Net 30',
    risk_score NUMERIC(5,2) DEFAULT 20.00,
    negotiation_style VARCHAR(50) DEFAULT 'Reliable Supplier',
    min_order_qty INTEGER DEFAULT 50,
    lead_time_days INTEGER DEFAULT 7,
    location VARCHAR(255) DEFAULT 'Bengaluru, India',
    categories JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    INDEX(org_id), INDEX(name)
)

supplier_products (
    id UUID PK,
    supplier_id UUID FK → suppliers.id,
    product_id UUID FK → products.id,
    supplier_sku VARCHAR(100),
    base_price NUMERIC(12,2),
    min_order_qty INTEGER DEFAULT 50,
    lead_time_days INTEGER DEFAULT 7,
    is_preferred BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    INDEX(supplier_id), INDEX(product_id)
)

supplier_quotes (
    id UUID PK,
    organization_id UUID FK → organizations.id,
    supplier_id UUID FK → suppliers.id,
    product_id UUID FK → products.id,
    unit_price NUMERIC(12,2),
    shipping_cost NUMERIC(12,2) DEFAULT 0,
    total_quote NUMERIC(12,2),
    payment_terms VARCHAR(100) DEFAULT 'Net 30',
    lead_time_days INTEGER DEFAULT 7,
    validity_days INTEGER DEFAULT 30,
    status VARCHAR(50) DEFAULT 'RECEIVED',
    created_at TIMESTAMP,
    INDEX(org_id), INDEX(supplier_id), INDEX(product_id)
)
```

### Negotiation & Procurement

```sql
negotiations (
    id UUID PK,
    organization_id UUID FK → organizations.id,
    product_id UUID FK → products.id,
    supplier_id UUID FK → suppliers.id,
    target_price NUMERIC(12,2),
    initial_quote NUMERIC(12,2),
    final_price NUMERIC(12,2),
    quantity INTEGER DEFAULT 1,
    rounds_completed INTEGER DEFAULT 0,
    max_rounds INTEGER DEFAULT 4,
    status VARCHAR(50) DEFAULT 'IN_PROGRESS',
    strategy VARCHAR(100) DEFAULT 'Volume Discount & Free Shipping',
    expected_margin NUMERIC(5,2),
    expected_savings NUMERIC(12,2),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    INDEX(org_id), INDEX(product_id), INDEX(supplier_id)
)

negotiation_messages (
    id UUID PK,
    negotiation_id UUID FK → negotiations.id,
    round_number INTEGER,
    sender VARCHAR(50),
    offer_price NUMERIC(12,2),
    shipping_cost NUMERIC(12,2) DEFAULT 0,
    payment_terms VARCHAR(100) DEFAULT 'Net 30',
    message_text VARCHAR(1000),
    supplier_counter_price NUMERIC(12,2),
    supplier_response_text VARCHAR(1000),
    created_at TIMESTAMP,
    INDEX(negotiation_id)
)

procurement_opportunities (
    id UUID PK,
    organization_id UUID FK → organizations.id,
    product_id UUID FK → products.id,
    urgency VARCHAR(50) DEFAULT 'MEDIUM',
    current_stock INTEGER,
    days_of_coverage NUMERIC(10,2),
    predicted_demand INTEGER,
    recommended_quantity INTEGER,
    recommended_supplier_id UUID FK → suppliers.id,
    expected_unit_cost NUMERIC(12,2),
    expected_total_cost NUMERIC(12,2),
    expected_margin NUMERIC(5,2),
    expected_savings NUMERIC(12,2) DEFAULT 0,
    risk_score NUMERIC(5,2) DEFAULT 20.00,
    policy_result VARCHAR(50) DEFAULT 'ALLOWED',
    recommended_action VARCHAR(100) DEFAULT 'NEGOTIATE_AND_ORDER',
    status VARCHAR(50) DEFAULT 'OPEN',
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    INDEX(org_id), INDEX(product_id)
)

purchase_orders (
    id UUID PK,
    organization_id UUID FK → organizations.id,
    po_number VARCHAR(100) UNIQUE,
    supplier_id UUID FK → suppliers.id,
    subtotal NUMERIC(12,2),
    shipping_cost NUMERIC(12,2) DEFAULT 0,
    total_amount NUMERIC(12,2),
    currency VARCHAR(10) DEFAULT 'INR',
    expected_delivery_date DATE,
    status VARCHAR(50) DEFAULT 'DRAFT',  -- DRAFT/PENDING_APPROVAL/APPROVED/SENT/CONFIRMED/RECEIVED/CANCELLED
    payment_status VARCHAR(50) DEFAULT 'PENDING',  -- PENDING/AUTHORIZED/CAPTURED/FAILED/REFUNDED
    created_by_id UUID FK → users.id,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    INDEX(org_id), INDEX(po_number), INDEX(supplier_id)
)

purchase_order_items (
    id UUID PK,
    purchase_order_id UUID FK → purchase_orders.id,
    product_id UUID FK → products.id,
    quantity INTEGER,
    unit_price NUMERIC(12,2),
    total_price NUMERIC(12,2),
    created_at TIMESTAMP,
    INDEX(po_id), INDEX(product_id)
)

approvals (
    id UUID PK,
    organization_id UUID FK → organizations.id,
    entity_type VARCHAR(50),
    entity_id VARCHAR(100),
    requested_by_id UUID FK → users.id,
    approved_by_id UUID FK → users.id,
    requested_action VARCHAR(100),
    amount NUMERIC(12,2),
    expected_margin NUMERIC(5,2),
    risk_score NUMERIC(5,2) DEFAULT 20.00,
    reason VARCHAR(500),
    policy_violations JSONB,
    status VARCHAR(50) DEFAULT 'PENDING',  -- PENDING/APPROVED/REJECTED/EXPIRED/CANCELLED
    comments VARCHAR(500),
    created_at TIMESTAMP,
    decided_at TIMESTAMP,
    INDEX(org_id)
)

payments (
    id UUID PK,
    organization_id UUID FK → organizations.id,
    purchase_order_id UUID FK → purchase_orders.id,
    amount NUMERIC(12,2),
    currency VARCHAR(10) DEFAULT 'INR',
    provider VARCHAR(50) DEFAULT 'MockPaymentProvider',
    transaction_id VARCHAR(100) UNIQUE,
    status VARCHAR(50) DEFAULT 'CAPTURED',  -- PENDING/AUTHORIZED/CAPTURED/FAILED/REFUNDED
    payment_method VARCHAR(50) DEFAULT 'SIMULATED_ESCROW',
    metadata_json JSONB,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    INDEX(org_id), INDEX(po_id), UNIQUE(transaction_id)
)
```

### Agents & Observability

```sql
agent_runs (
    id UUID PK,
    organization_id UUID FK → organizations.id,
    agent_name VARCHAR(100),
    execution_id VARCHAR(100),
    trigger VARCHAR(50) DEFAULT 'MANUAL',
    status VARCHAR(50) DEFAULT 'RUNNING',
    input_state JSONB,
    output_state JSONB,
    confidence_score NUMERIC(4,3) DEFAULT 0.900,
    execution_duration_ms INTEGER,
    error_message VARCHAR(1000),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    INDEX(org_id), INDEX(agent_name), INDEX(execution_id)
)

agent_events (
    id UUID PK,
    organization_id UUID FK → organizations.id,
    agent_run_id UUID FK → agent_runs.id,
    event_type VARCHAR(100),
    message VARCHAR(500),
    details JSONB,
    timestamp TIMESTAMP,
    INDEX(org_id), INDEX(agent_run_id), INDEX(event_type)
)

business_rules (
    id UUID PK,
    organization_id UUID FK → organizations.id,
    rule_name VARCHAR(100),
    rule_key VARCHAR(100),
    value_numeric NUMERIC(12,4),
    value_text VARCHAR(255),
    value_boolean BOOLEAN,
    value_json JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP,
    INDEX(org_id), INDEX(rule_key)
)

notifications (
    id UUID PK,
    organization_id UUID FK → organizations.id,
    user_id UUID FK → users.id,
    type VARCHAR(50),
    title VARCHAR(255),
    message VARCHAR(1000),
    link VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    INDEX(org_id), INDEX(user_id), INDEX(type), INDEX(is_read)
)

audit_logs (
    id UUID PK,
    organization_id UUID FK → organizations.id,
    actor_type VARCHAR(50) DEFAULT 'SYSTEM',
    actor_id VARCHAR(100),
    action VARCHAR(100),
    entity_type VARCHAR(100),
    entity_id VARCHAR(100),
    financial_amount NUMERIC(12,2),
    policy_result VARCHAR(50),
    confidence_score NUMERIC(4,3),
    reason_summary VARCHAR(1000),
    metadata_json JSONB,
    timestamp TIMESTAMP,
    INDEX(org_id), INDEX(action), INDEX(entity_type), INDEX(entity_id), INDEX(timestamp)
)
```

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| UUID PKs | Distributed systems friendly; no sequence conflicts |
| `organization_id` on every business table | Tenant isolation at row level; RLS-ready |
| `NUMERIC(12,2)` for all monetary fields | Decimal precision; prevents floating-point errors |
| JSONB for flexible metadata | Dimensions, categories, policy violations, agent state |
| `created_at` + `updated_at` on all entities | Audit trail; change tracking |
| Composite indexes on `(organization_id, product_id)` | Multi-tenant query performance |
| Soft deletes via `is_active` / status fields | Audit preservation; no data loss |
| `CASCADE` on dependent relationships | Referential integrity; cleanup automation |

---

## Migration Strategy

```bash
# Development
alembic revision --autogenerate -m "description"
alembic upgrade head

# Production (safe, no destructive operations)
alembic upgrade head  # Run against managed PostgreSQL
```

- Never run `alembic downgrade` or destructive operations in production
- All migrations are additive (new columns, tables, indexes)
- Data migrations use Python scripts + Alembic `op.execute()` when needed

---

## Performance Indexes

| Table | Index | Purpose |
|-------|-------|---------|
| products | `(org_id, sku)` | Fast SKU lookup per tenant |
| products | `(org_id, category)` | Category filtering |
| inventory | `(org_id, product_id)` | Stock queries |
| inventory | `(org_id, stockout_risk_level)` | Risk dashboard |
| sales_history | `(org_id, product_id, date)` | Time-series queries |
| supplier_quotes | `(org_id, product_id, status)` | Active quote sourcing |
| negotiations | `(org_id, supplier_id, status)` | Negotiation tracking |
| purchase_orders | `(org_id, po_number)` | PO lookup |
| purchase_orders | `(org_id, supplier_id, status)` | Supplier order history |
| agent_events | `(org_id, timestamp DESC)` | Activity feed |
| audit_logs | `(org_id, timestamp DESC)` | Audit trail |
| notifications | `(org_id, is_read, created_at)` | Inbox queries |