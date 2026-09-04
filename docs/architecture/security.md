# Vendo AI — Security Architecture

## Overview

Security is built into every layer of Vendo AI, from infrastructure to application logic. The platform follows defense-in-depth principles with particular attention to financial data integrity and multi-tenant isolation.

---

## Authentication

### Local Development (Demo Mode)
- **JWT (HS256)** with configurable secret (`SECRET_KEY` in `.env`)
- **bcrypt** password hashing (cost factor 12)
- **7-day token expiry** (configurable)
- **Demo credentials** seeded: `admin@vendo.ai`, `manager@vendo.ai`, `demo@vendo.ai` (all `password123`)

### Production-Ready Abstraction
```python
AuthProvider = LocalAuthProvider | Auth0Provider | ClerkProvider | SupabaseAuthProvider
```
- Interface allows swapping auth providers without code changes
- `require_roles(["ADMIN", "MANAGER"])` decorator enforces RBAC

---

## Authorization

### Role Hierarchy
| Role | Permissions |
|------|-------------|
| **ADMIN** | Full system access, user management, policy configuration |
| **MANAGER** | Approve/reject procurement, manage business rules, view analytics |
| **BUYER** | Manage procurement, negotiations, suppliers, view inventory |
| **VIEWER** | Read-only access to all dashboards and reports |

### Multi-Tenant Isolation
- **Every query** implicitly filtered by `organization_id` via service layer
- **Database-level**: Row-level security (RLS) policies can be enabled
- **API-level**: `current_user.organization_id` injected into all repository calls
- **Frontend**: JWT contains `organization_id`; validated on each request

---

## Financial Controls (Deterministic)

### The Core Principle
> **LLMs propose. Deterministic engines decide.**

### Policy Engine
```python
# Never overridable by LLM
class PolicyEngine:
    @staticmethod
    def evaluate_procurement(...) -> PolicyEvaluationResult:
        # Pure Python logic — no AI, no randomness
        if margin < MIN_MARGIN: return BLOCKED
        if amount > HUMAN_APPROVAL_LIMIT: return BLOCKED
        if amount > AUTO_APPROVAL_LIMIT: return REQUIRES_APPROVAL
        if auto_purchase_enabled: return ALLOWED
        return REQUIRES_APPROVAL
```

### Immutable Financial Rules
| Rule | Enforcement |
|------|-------------|
| **Minimum 25% gross margin** | `BLOCKED` if violated |
| **Auto-approval ≤ ₹50,000** | `REQUIRES_APPROVAL` if exceeded |
| **Human ceiling ₹200,000** | `BLOCKED` if exceeded |
| **Monthly budget ₹1.5M** | `BLOCKED` if exceeded |
| **Supplier rating ≥ 3.8** | `BLOCKED` if violated |
| **Supplier risk ≤ 60** | `BLOCKED` if violated |
| **≥ 2 competitive quotes** | `WARNING` if fewer |

### Decimal Precision
- **All monetary fields**: PostgreSQL `NUMERIC(12,2)` / Python `Decimal`
- **Zero floating-point** in financial calculations
- **Margin calculations**: Quantized to 2 decimal places (`Decimal("0.01")`)

---

## Audit Trail

### Immutable Decision Log
Every financial decision recorded with:
```sql
audit_logs (
    actor_type,        -- USER / SYSTEM / AUTONOMOUS_SUPERVISOR
    actor_id,          -- UUID or 'system'
    action,            -- APPROVAL_GRANTED / PO_CREATED / NEGOTIATION_COMPLETED
    entity_type,       -- PURCHASE_ORDER / NEGOTIATION / APPROVAL
    entity_id,         -- UUID
    financial_amount,  -- NUMERIC(12,2)
    policy_result,     -- ALLOWED / BLOCKED / REQUIRES_HUMAN_APPROVAL
    confidence_score,  -- 0.000-1.000
    reason_summary,    -- "Selected NovaTech: strongest composite score (89.4) maintaining 44.7% margin"
    metadata_json,     -- {po_number, savings, margin_pct, ...}
    timestamp
)
```

### Chain-of-Thought Protection
- **No hidden reasoning** exposed in logs or UI
- **Structured summaries only**: "Negotiated ₹1,105/unit saving ₹11,250 while maintaining 44.7% margin"
- **No raw LLM output** stored in audit trail

---

## Data Protection

### Secrets Management
- **`.env` in `.gitignore`** — never committed
- **`.env.example`** committed with placeholder values
- **Production**: Environment variables injected by platform (Vercel, Render, Fly.io)
- **No API keys** in frontend code (`NEXT_PUBLIC_*` only for non-secrets)

### Encryption
- **In transit**: TLS 1.3 (enforced by platform)
- **At rest**: PostgreSQL managed encryption + Redis encryption
- **Passwords**: bcrypt (never plaintext, never logged)

### PII Handling
- **Minimal PII**: Email, full name only
- **No credit cards, SSN, banking details** stored
- **Payment data**: Simulated only in demo; production uses PCI-compliant providers

---

## API Security

### CORS
```python
CORS_ORIGINS = ["https://vendo-ai.vercel.app", "https://app.vendo-ai.com"]
# Never ["*"] in production
```

### Rate Limiting
- **Auth endpoints**: 5 req/min per IP (configurable via Redis)
- **API endpoints**: 60 req/min per authenticated user
- **Demo endpoints**: 1 req/5min per user

### Input Validation
- **Pydantic v2** schemas on all request bodies
- **SQLAlchemy ORM** — no raw SQL, prevents injection
- **UUID validation** on all path parameters

---

## Infrastructure Security

### Docker Compose (Local)
- Non-root containers
- No privileged ports
- Health checks on all services
- Volume persistence for data

### Production Deployment
| Component | Platform | Security |
|-----------|----------|----------|
| Frontend | Vercel | WAF, DDoS, TLS, edge caching |
| Backend | Render/Fly.io | VPC, private networking, managed TLS |
| Database | Managed PostgreSQL | Automated backups, PITR, encryption |
| Redis | Managed Redis | TLS, AUTH, private networking |
| Storage | S3/Cloudinary | Signed URLs, private buckets |

### Network
- **Database**: Not publicly accessible; VPC-only
- **Redis**: Private network only
- **Backend ↔ Frontend**: HTTPS only
- **Health checks**: `/health` endpoint (no auth required, no secrets exposed)

---

## Incident Response

### Logging
- Structured JSON logs (stdout)
- No secrets in logs
- Correlation IDs for request tracing
- Error tracking via Sentry (optional)

### Monitoring
- `/health` — liveness probe
- `/api/data-health` — data integrity checks
- Agent execution duration & success rates
- Database connection pool health

### Backup & Recovery
- **PostgreSQL**: Daily automated backups + point-in-time recovery (7 days)
- **Redis**: RDB snapshots (optional)
- **Secrets**: Rotated via platform secret management

---

## Compliance Notes

- **Not SOC 2 certified** — portfolio/demo project
- **GDPR-ready**: Data deletion via `DELETE` cascade on user/org
- **PCI-DSS**: Not applicable (no real payments in demo; production uses Stripe/Adyen)
- **Audit readiness**: Full immutable trail with financial amounts, policy results, actors

---

## Developer Security Checklist

- [ ] Never commit `.env` or real credentials
- [ ] Use `Decimal` for all money
- [ ] All financial logic in deterministic engines
- [ ] LLM outputs validated via Pydantic before use
- [ ] All queries scoped by `organization_id`
- [ ] Role checks on every mutating endpoint
- [ ] Audit log on every financial action
- [ ] Run `ruff` and `pytest` before commit