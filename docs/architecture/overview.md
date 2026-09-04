# Vendo AI — Architecture Overview

## System Purpose

Vendo AI is an **autonomous procurement intelligence platform** for e-commerce businesses. It continuously monitors inventory and sales, detects procurement opportunities, forecasts demand, finds and evaluates suppliers, negotiates supplier quotes, checks margins and business policies, requests human approval when necessary, creates purchase orders, simulates procurement/payment, updates expected inventory, and records every important decision in an auditable system.

**Vendo AI is not a chatbot. It is an autonomous procurement operating system.**

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            VENDO AI PLATFORM                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌───────────┐ │
│  │   Next.js    │    │   FastAPI    │    │  PostgreSQL  │    │   Redis   │ │
│  │   Frontend   │◄───►│   Backend    │◄───►│   (Primary)  │    │ (Cache/   │ │
│  │   (Vercel)   │    │  (Render)    │    │  16+ / Async │    │  Jobs)    │ │
│  └──────────────┘    └──────────────┘    └──────────────┘    └───────────┘ │
│         │                   │                   │                  │        │
│         │                   │                   ▼                  ▼        │
│         │                   │    ┌──────────────────────────────────────┐   │
│         │                   │    │         LANGGRAPH ORCHESTRATION      │   │
│         │                   │    │  Inventory → Demand → Supplier →     │   │
│         │                   │    │  Negotiation → Margin → Risk →       │   │
│         │                   │    │  Procurement (Supervisor Agent)      │   │
│         │                   │    └──────────────────────────────────────┘   │
│         │                   │                   │                           │
│         │                   │    ┌──────────────┐  ┌──────────────────┐    │
│         │                   │    │ AI Provider  │  │ Payment Provider │    │
│         │                   │    │ (Mock/OpenAI/│  │ (Mock/Stripe/    │    │
│         │                   │    │  Gemini/Anth)│  │  PayPal/Adyen)   │    │
│         │                   │    └──────────────┘  └──────────────────┘    │
│         │                   │                   │                           │
│         │                   │    ┌──────────────────────────────────────┐   │
│         │                   │    │        DETERMINISTIC ENGINES         │   │
│         │                   │    │  • Forecasting (Weighted MA + Trend) │   │
│         │                   │    │  • Supplier Scoring (5-factor)       │   │
│         │                   │    │  • Negotiation Sim (Stateful Personas)│   │
│         │                   │    │  • Margin Engine (Decimal precision) │   │
│         │                   │    │  • Policy Engine (Configurable Rules)│   │
│         │                   │    └──────────────────────────────────────┘   │
│         │                   │                   │                           │
│         │                   │    ┌──────────────────────────────────────┐   │
│         │                   │    │         AUDIT & COMPLIANCE           │   │
│         │                   │    │  • Agent Events (11 event types)     │   │
│         │                   │    │  • Financial Audit Logs (Immutable)  │   │
│         │                   │    │  • Approval Trail (Manager Sign-off) │   │
│         │                   │    │  • Inventory Movements (ACID)        │   │
│         │                   │    └──────────────────────────────────────┘   │
│         │                   │                   │                           │
│         │                   ▼                   ▼                           │
│         │         ┌──────────────────┐  ┌──────────────────┐               │
│         │         │  Object Storage  │  │   Monitoring     │               │
│         │         │  (S3/Local/Cloud)│  │  (Health Checks) │               │
│         │         └──────────────────┘  └──────────────────┘               │
│         │                                                                   │
│         └───────────────────────────────────────────────────────────────────│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Design Principles

### 1. **Deterministic Financial Controls**
- All financial calculations use `Decimal` / PostgreSQL `NUMERIC` — never floating point
- Policy Engine is the **single authority** on whether financial actions execute
- LLMs propose actions; deterministic engines decide if they can execute

### 2. **Multi-Agent Graph Orchestration**
- LangGraph defines explicit state transitions between specialized agents
- Each agent produces validated Pydantic state, not free-form text
- Supervisor Agent coordinates; never overrides policy decisions

### 3. **Local-First Development**
- Complete stack runs locally: PostgreSQL, Redis, FastAPI, Next.js, LangGraph
- Mock AI Provider and Mock Payment Provider for zero-dependency demos
- No external API keys required for core functionality

### 4. **Audit-First Architecture**
- Every financial decision logged with: actor, action, entity, amount, policy result, confidence, reason
- No hidden chain-of-thought exposed
- Immutable audit trail with 11 event types

### 5. **Multi-Tenant from Day One**
- All business entities scoped by `organization_id`
- Row-level isolation at service layer
- Role-based access: ADMIN / MANAGER / BUYER / VIEWER

---

## Agent Architecture

| Agent | Responsibility | Input | Output |
|-------|----------------|-------|--------|
| **Inventory Agent** | Stock monitoring, burn velocity, risk classification | Inventory + Sales history | Days of inventory, risk level, reorder qty |
| **Demand Agent** | 30-day forecast via weighted MA + trend + seasonality | 60-day sales history | Predicted demand, confidence, trend factor |
| **Supplier Agent** | Multi-factor procurement scoring (35/25/20/10/10) | Active quotes | Ranked suppliers with composite scores |
| **Negotiation Agent** | Stateful multi-round counter-offers (4 rounds max) | Target price, supplier persona | Final price, savings, round transcript |
| **Margin Agent** | Deterministic gross/net margin, ROI, savings | Selling price, negotiated cost | Margin %, profit/unit, ROI %, total savings |
| **Risk Agent** | Policy evaluation + opportunity creation | Margin, spend, supplier risk | Policy decision (ALLOW/BLOCK/REQUIRES_APPROVAL) |
| **Procurement Agent** | PO creation, payment sim, inbound inventory update | Approved opportunity | PO record, payment txn, inventory movement |
| **Supervisor Agent** | End-to-end workflow coordination | Product ID | Complete execution state |

---

## Data Flow: Autonomous Procurement Loop

```
MONITOR (Inventory Agent)
    │
    ▼
DETECT stockout risk (days_of_inventory < threshold)
    │
    ▼
FORECAST 30-day demand (Demand Agent)
    │
    ▼
SOURCE multi-supplier quotes (Supplier Agent)
    │
    ▼
NEGOTIATE with top supplier (Negotiation Agent)
    │
    ▼
EVALUATE margin & savings (Margin Agent)
    │
    ▼
POLICY CHECK deterministic rules (Risk/Policy Agent)
    │
    ├──► BLOCKED (margin < 25% or risk > 60 or budget exceeded)
    │
    ├──► REQUIRES_HUMAN_APPROVAL (amount > ₹50k or auto_purchase=false)
    │        │
    │        ▼ Manager Approve/Reject
    │
    └──► ALLOWED (auto_purchase=true, amount ≤ ₹50k)
             │
             ▼
       CREATE Purchase Order
             │
             ▼
       SIMULATE Payment (MockPaymentProvider)
             │
             ▼
       UPDATE Expected Inbound Inventory
             │
             ▼
       LOG Audit Events (11 event types)
```

---

## Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | Next.js + TypeScript + React | 14.2+ / 18.3+ |
| UI | Tailwind CSS + shadcn/ui + Lucide + Recharts | 3.4+ |
| Backend | FastAPI + Pydantic v2 + SQLAlchemy 2.x | 0.115+ / 2.8+ / 2.0+ |
| Database | PostgreSQL + asyncpg | 16+ |
| Cache/Jobs | Redis | 7+ |
| Orchestration | LangGraph + LangChain Core | 0.2+ / 0.3+ |
| AI Providers | Abstracted (Mock/OpenAI/Gemini/Anthropic) | — |
| Migrations | Alembic | 1.13+ |
| Auth | JWT (HS256) + bcrypt | — |
| Deployment | Vercel (FE) + Render/Fly.io (BE) | — |

---

## Security Model

- **Authentication**: JWT with 7-day expiry, bcrypt password hashing
- **Authorization**: Role-based (ADMIN > MANAGER > BUYER > VIEWER)
- **Tenant Isolation**: All queries scoped by `organization_id`
- **Secrets**: Environment variables only; `.env` never committed
- **CORS**: Restricted to configured origins
- **Audit**: Financial decisions immutable; no PII in logs

---

## Scalability Considerations

- Async FastAPI + asyncpg for high-concurrency API
- Redis for caching frequent queries (supplier scores, forecasts)
- Background job abstraction for scheduled tasks
- Horizontal scaling via stateless API workers
- Database indexing on `organization_id`, `product_id`, timestamps