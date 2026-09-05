import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Any

from apps.api.schemas.agent import AgentEventResponse, AgentRunResponse
from apps.api.schemas.analytics import AnalyticsResponse
from apps.api.schemas.audit import AuditLogResponse
from apps.api.schemas.data_health import DataHealthCheckItem, DataHealthReport
from apps.api.schemas.forecast import ForecastResponse
from apps.api.schemas.inventory import InventoryMovementResponse, InventoryResponse
from apps.api.schemas.negotiation import (
    NegotiationDetailResponse,
    NegotiationMessageResponse,
    NegotiationResponse,
)
from apps.api.schemas.notification import NotificationResponse
from apps.api.schemas.procurement import (
    ApprovalResponse,
    OpportunityResponse,
    PaymentResponse,
    PurchaseOrderItemResponse,
    PurchaseOrderResponse,
)
from apps.api.schemas.product import ProductDetailResponse, ProductImageResponse, ProductResponse
from apps.api.schemas.supplier import (
    SupplierDetailResponse,
    SupplierQuoteResponse,
    SupplierResponse,
    SupplierScoringBreakdown,
)

ORG_ID = uuid.UUID("11111111-1111-1111-1111-111111111111")
ADMIN_ID = uuid.UUID("22222222-2222-2222-2222-222222222222")

# Fixed deterministic UUIDs for relational consistency
PROD_IDS = [
    uuid.UUID("aa010000-0000-0000-0000-000000000001"),
    uuid.UUID("aa020000-0000-0000-0000-000000000002"),
    uuid.UUID("aa030000-0000-0000-0000-000000000003"),
    uuid.UUID("aa040000-0000-0000-0000-000000000004"),
    uuid.UUID("aa050000-0000-0000-0000-000000000005"),
    uuid.UUID("aa060000-0000-0000-0000-000000000006"),
]

SUPP_IDS = [
    uuid.UUID("bb010000-0000-0000-0000-000000000001"),
    uuid.UUID("bb020000-0000-0000-0000-000000000002"),
    uuid.UUID("bb030000-0000-0000-0000-000000000003"),
    uuid.UUID("bb040000-0000-0000-0000-000000000004"),
    uuid.UUID("bb050000-0000-0000-0000-000000000005"),
    uuid.UUID("bb060000-0000-0000-0000-000000000006"),
]

INV_IDS = [
    uuid.UUID("cc010000-0000-0000-0000-000000000001"),
    uuid.UUID("cc020000-0000-0000-0000-000000000002"),
    uuid.UUID("cc030000-0000-0000-0000-000000000003"),
    uuid.UUID("cc040000-0000-0000-0000-000000000004"),
    uuid.UUID("cc050000-0000-0000-0000-000000000005"),
    uuid.UUID("cc060000-0000-0000-0000-000000000006"),
]

NOW = datetime.utcnow()

# Seed Suppliers
DEMO_SUPPLIERS = [
    SupplierResponse(
        id=SUPP_IDS[0],
        organization_id=ORG_ID,
        name="Rayalaseema Agro Commodities Pvt Ltd",
        rating=Decimal("4.60"),
        reliability_score=Decimal("94.00"),
        delivery_score=Decimal("92.00"),
        quality_score=Decimal("96.00"),
        payment_terms="Net 30",
        risk_score=Decimal("8.00"),
        negotiation_style="Reliable Mandi Partner",
        min_order_qty=100,
        lead_time_days=3,
        location="Kurnool Industrial Estate, Andhra Pradesh",
        categories={"agro": True, "grains": True},
        is_active=True,
        procurement_score=Decimal("93.80"),
        created_at=NOW - timedelta(days=60),
        updated_at=NOW,
    ),
    SupplierResponse(
        id=SUPP_IDS[1],
        organization_id=ORG_ID,
        name="Tungabhadra Mills & Cold Storage",
        rating=Decimal("4.40"),
        reliability_score=Decimal("90.00"),
        delivery_score=Decimal("88.00"),
        quality_score=Decimal("92.00"),
        payment_terms="Net 15",
        risk_score=Decimal("12.00"),
        negotiation_style="Volume Grain Supplier",
        min_order_qty=200,
        lead_time_days=4,
        location="Yemmiganur, Kurnool District, Andhra Pradesh",
        categories={"paddy": True, "rice": True},
        is_active=True,
        procurement_score=Decimal("89.50"),
        created_at=NOW - timedelta(days=60),
        updated_at=NOW,
    ),
    SupplierResponse(
        id=SUPP_IDS[2],
        organization_id=ORG_ID,
        name="Guntur Mirchi Yard Traders Consortium",
        rating=Decimal("4.80"),
        reliability_score=Decimal("96.00"),
        delivery_score=Decimal("95.00"),
        quality_score=Decimal("98.00"),
        payment_terms="Net 30",
        risk_score=Decimal("6.00"),
        negotiation_style="Premium Spice Supplier",
        min_order_qty=50,
        lead_time_days=2,
        location="APMC Mirchi Yard, Guntur, Andhra Pradesh",
        categories={"spices": True, "chilli": True},
        is_active=True,
        procurement_score=Decimal("96.40"),
        created_at=NOW - timedelta(days=60),
        updated_at=NOW,
    ),
    SupplierResponse(
        id=SUPP_IDS[3],
        organization_id=ORG_ID,
        name="Sri Sathya Sai Oilseeds & Agro Tech",
        rating=Decimal("4.30"),
        reliability_score=Decimal("86.00"),
        delivery_score=Decimal("89.00"),
        quality_score=Decimal("88.00"),
        payment_terms="Net 30",
        risk_score=Decimal("15.00"),
        negotiation_style="Direct Farmer Producer Co",
        min_order_qty=80,
        lead_time_days=5,
        location="Dharmavaram, Anantapur District, Andhra Pradesh",
        categories={"oilseeds": True, "edible_oil": True},
        is_active=True,
        procurement_score=Decimal("87.20"),
        created_at=NOW - timedelta(days=60),
        updated_at=NOW,
    ),
    SupplierResponse(
        id=SUPP_IDS[4],
        organization_id=ORG_ID,
        name="Penna Spices & Processing Corp",
        rating=Decimal("4.10"),
        reliability_score=Decimal("82.00"),
        delivery_score=Decimal("85.00"),
        quality_score=Decimal("84.00"),
        payment_terms="Net 15",
        risk_score=Decimal("22.00"),
        negotiation_style="Competitive Negotiator",
        min_order_qty=60,
        lead_time_days=4,
        location="Kadapa Bypass Road, YSR Kadapa, Andhra Pradesh",
        categories={"spices": True, "turmeric": True},
        is_active=True,
        procurement_score=Decimal("83.50"),
        created_at=NOW - timedelta(days=60),
        updated_at=NOW,
    ),
    SupplierResponse(
        id=SUPP_IDS[5],
        organization_id=ORG_ID,
        name="Tirumala Agri-Logistics & Warehousing",
        rating=Decimal("4.70"),
        reliability_score=Decimal("95.00"),
        delivery_score=Decimal("96.00"),
        quality_score=Decimal("93.00"),
        payment_terms="Net 30",
        risk_score=Decimal("7.00"),
        negotiation_style="Integrated Mandi Logistics",
        min_order_qty=150,
        lead_time_days=2,
        location="Renigunta Logistics Park, Tirupati, Andhra Pradesh",
        categories={"logistics": True, "cold_storage": True},
        is_active=True,
        procurement_score=Decimal("94.70"),
        created_at=NOW - timedelta(days=60),
        updated_at=NOW,
    ),
]

# Seed Products
DEMO_PRODUCTS = [
    ProductResponse(
        id=PROD_IDS[0],
        organization_id=ORG_ID,
        title="Kurnool BPT 5204 Sona Masoori Rice (25kg Bag)",
        description="Premium aged raw rice sourced from Tungabhadra basin mandis across Kurnool district. Highly aromatic with low starch content.",
        category="Agro Commodities",
        sku="KRN-RICE-BPT-25KG",
        source="internal",
        selling_price=Decimal("1550.00"),
        cost_price=Decimal("1220.00"),
        currency="INR",
        current_stock=18,
        stockout_risk_level="CRITICAL",
        days_of_inventory=Decimal("1.5"),
        created_at=NOW - timedelta(days=45),
        updated_at=NOW,
        images=[
            ProductImageResponse(
                id=uuid.uuid4(),
                product_id=PROD_IDS[0],
                original_url="https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80",
                is_primary=True,
            )
        ],
    ),
    ProductResponse(
        id=PROD_IDS[1],
        organization_id=ORG_ID,
        title="Guntur Teja Red Chilli S17 (Grade A Stemless, 10kg Bag)",
        description="Export-grade hot chilli sourced directly from Asia's largest yard at APMC Guntur. High SHU rating with intense red hue.",
        category="Spices & Seasonings",
        sku="GNT-CHILLI-S17-10K",
        source="internal",
        selling_price=Decimal("2600.00"),
        cost_price=Decimal("1980.00"),
        currency="INR",
        current_stock=12,
        stockout_risk_level="HIGH",
        days_of_inventory=Decimal("2.4"),
        created_at=NOW - timedelta(days=40),
        updated_at=NOW,
        images=[
            ProductImageResponse(
                id=uuid.uuid4(),
                product_id=PROD_IDS[1],
                original_url="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80",
                is_primary=True,
            )
        ],
    ),
    ProductResponse(
        id=PROD_IDS[2],
        organization_id=ORG_ID,
        title="Anantapur Cold-Pressed Groundnut Oil (15L Tin)",
        description="Traditional cold-pressed unfiltered peanut oil extracted from Kadiri-6 groundnut pods grown in red loamy soils.",
        category="Edible Oils",
        sku="ATP-GNOIL-15LTIN",
        source="internal",
        selling_price=Decimal("2950.00"),
        cost_price=Decimal("2380.00"),
        currency="INR",
        current_stock=45,
        stockout_risk_level="MEDIUM",
        days_of_inventory=Decimal("9.0"),
        created_at=NOW - timedelta(days=35),
        updated_at=NOW,
        images=[
            ProductImageResponse(
                id=uuid.uuid4(),
                product_id=PROD_IDS[2],
                original_url="https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80",
                is_primary=True,
            )
        ],
    ),
    ProductResponse(
        id=PROD_IDS[3],
        organization_id=ORG_ID,
        title="Kadapa Turmeric Finger (Curcumin 4.5%, 25kg Gunny Bag)",
        description="High-curcumin unpolished whole turmeric rhizomes harvested from irrigated black soil tracts in Kadapa valley.",
        category="Spices & Seasonings",
        sku="KDP-TURM-FNG-25K",
        source="internal",
        selling_price=Decimal("3400.00"),
        cost_price=Decimal("2650.00"),
        currency="INR",
        current_stock=85,
        stockout_risk_level="LOW",
        days_of_inventory=Decimal("17.0"),
        created_at=NOW - timedelta(days=30),
        updated_at=NOW,
        images=[
            ProductImageResponse(
                id=uuid.uuid4(),
                product_id=PROD_IDS[3],
                original_url="https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80",
                is_primary=True,
            )
        ],
    ),
    ProductResponse(
        id=PROD_IDS[4],
        organization_id=ORG_ID,
        title="Kurnool Premium Bengal Gram (Chana Dal, 50kg)",
        description="Machine-cleaned bold yellow chickpea split pulses sourced from Allagadda and Dhone mandis.",
        category="Pulses & Legumes",
        sku="KRN-CHANA-DAL-50K",
        source="internal",
        selling_price=Decimal("4100.00"),
        cost_price=Decimal("3350.00"),
        currency="INR",
        current_stock=110,
        stockout_risk_level="LOW",
        days_of_inventory=Decimal("22.0"),
        created_at=NOW - timedelta(days=25),
        updated_at=NOW,
        images=[
            ProductImageResponse(
                id=uuid.uuid4(),
                product_id=PROD_IDS[4],
                original_url="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80",
                is_primary=True,
            )
        ],
    ),
    ProductResponse(
        id=PROD_IDS[5],
        organization_id=ORG_ID,
        title="Nandyal Yellow Foxtail Millet (Navane / Korra, 25kg)",
        description="Gluten-free nutrient dense staple crop cultivated sustainably in semi-arid Rayalaseema black soils.",
        category="Millets & Superfoods",
        sku="NDL-FOXMIL-25KG",
        source="internal",
        selling_price=Decimal("1850.00"),
        cost_price=Decimal("1420.00"),
        currency="INR",
        current_stock=92,
        stockout_risk_level="LOW",
        days_of_inventory=Decimal("18.4"),
        created_at=NOW - timedelta(days=20),
        updated_at=NOW,
        images=[
            ProductImageResponse(
                id=uuid.uuid4(),
                product_id=PROD_IDS[5],
                original_url="https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80",
                is_primary=True,
            )
        ],
    ),
]

# Seed Inventory
DEMO_INVENTORY = [
    InventoryResponse(
        id=INV_IDS[i],
        organization_id=ORG_ID,
        product_id=p.id,
        current_stock=p.current_stock or 0,
        reserved_stock=5,
        expected_inbound=150 if i == 0 else 0,
        reorder_point=40 if i in [0, 1] else 25,
        safety_stock=20 if i in [0, 1] else 15,
        suggested_reorder_qty=150 if i in [0, 1] else 50,
        days_of_inventory=p.days_of_inventory or Decimal("10.0"),
        stockout_risk_level=p.stockout_risk_level or "LOW",
        last_checked_at=NOW,
        updated_at=NOW,
        product=p,
    )
    for i, p in enumerate(DEMO_PRODUCTS)
]

# Seed Quotes
DEMO_QUOTES = [
    SupplierQuoteResponse(
        id=uuid.uuid4(),
        organization_id=ORG_ID,
        supplier_id=SUPP_IDS[0],
        product_id=PROD_IDS[0],
        unit_price=Decimal("1180.00"),
        shipping_cost=Decimal("1250.00"),
        total_quote=Decimal("178250.00"),
        payment_terms="Net 30",
        lead_time_days=3,
        validity_days=14,
        status="RECEIVED",
        created_at=NOW - timedelta(days=2),
        supplier=DEMO_SUPPLIERS[0],
    ),
    SupplierQuoteResponse(
        id=uuid.uuid4(),
        organization_id=ORG_ID,
        supplier_id=SUPP_IDS[1],
        product_id=PROD_IDS[0],
        unit_price=Decimal("1210.00"),
        shipping_cost=Decimal("1100.00"),
        total_quote=Decimal("182600.00"),
        payment_terms="Net 15",
        lead_time_days=4,
        validity_days=14,
        status="RECEIVED",
        created_at=NOW - timedelta(days=2),
        supplier=DEMO_SUPPLIERS[1],
    ),
    SupplierQuoteResponse(
        id=uuid.uuid4(),
        organization_id=ORG_ID,
        supplier_id=SUPP_IDS[2],
        product_id=PROD_IDS[1],
        unit_price=Decimal("1920.00"),
        shipping_cost=Decimal("950.00"),
        total_quote=Decimal("96950.00"),
        payment_terms="Net 30",
        lead_time_days=2,
        validity_days=10,
        status="RECEIVED",
        created_at=NOW - timedelta(days=1),
        supplier=DEMO_SUPPLIERS[2],
    ),
]

# Seed Opportunities
DEMO_OPPORTUNITIES = [
    OpportunityResponse(
        id=uuid.UUID("dd010000-0000-0000-0000-000000000001"),
        organization_id=ORG_ID,
        product_id=PROD_IDS[0],
        urgency="CRITICAL",
        current_stock=18,
        days_of_coverage=Decimal("1.5"),
        predicted_demand=150,
        recommended_quantity=150,
        recommended_supplier_id=SUPP_IDS[0],
        expected_unit_cost=Decimal("1105.00"),
        expected_total_cost=Decimal("165750.00"),
        expected_margin=Decimal("44.72"),
        expected_savings=Decimal("11250.00"),
        risk_score=Decimal("8.00"),
        policy_result="ALLOWED",
        recommended_action="Execute Autonomous APMC Negotiation with Rayalaseema Agro",
        status="IDENTIFIED",
        created_at=NOW - timedelta(hours=6),
        updated_at=NOW,
        product=DEMO_PRODUCTS[0],
        recommended_supplier=DEMO_SUPPLIERS[0],
    ),
    OpportunityResponse(
        id=uuid.UUID("dd020000-0000-0000-0000-000000000002"),
        organization_id=ORG_ID,
        product_id=PROD_IDS[1],
        urgency="HIGH",
        current_stock=12,
        days_of_coverage=Decimal("2.4"),
        predicted_demand=50,
        recommended_quantity=50,
        recommended_supplier_id=SUPP_IDS[2],
        expected_unit_cost=Decimal("1850.00"),
        expected_total_cost=Decimal("92500.00"),
        expected_margin=Decimal("40.54"),
        expected_savings=Decimal("3500.00"),
        risk_score=Decimal("6.00"),
        policy_result="ALLOWED",
        recommended_action="Bulk Guntur Mirchi Yard Purchase Order",
        status="IDENTIFIED",
        created_at=NOW - timedelta(hours=12),
        updated_at=NOW,
        product=DEMO_PRODUCTS[1],
        recommended_supplier=DEMO_SUPPLIERS[2],
    ),
]

# Seed Approvals
DEMO_APPROVALS = [
    ApprovalResponse(
        id=uuid.UUID("ee010000-0000-0000-0000-000000000001"),
        organization_id=ORG_ID,
        entity_type="PURCHASE_ORDER",
        entity_id="VAI-PO-2026-1048",
        requested_by_id=ADMIN_ID,
        requested_action="Autonomous Reorder: 150 Bags Kurnool Sona Masoori Rice",
        amount=Decimal("165750.00"),
        expected_margin=Decimal("44.72"),
        risk_score=Decimal("8.00"),
        reason="Stockout risk imminent within 36 hours. Secured ₹11,250 AI negotiation savings below APMC market baseline.",
        status="PENDING",
        created_at=NOW - timedelta(hours=3),
    ),
]

# Seed Purchase Orders
DEMO_POS = [
    PurchaseOrderResponse(
        id=uuid.UUID("ff010000-0000-0000-0000-000000000001"),
        organization_id=ORG_ID,
        po_number="VAI-PO-2026-1048",
        supplier_id=SUPP_IDS[0],
        subtotal=Decimal("165750.00"),
        shipping_cost=Decimal("0.00"),
        total_amount=Decimal("165750.00"),
        currency="INR",
        expected_delivery_date=(NOW + timedelta(days=3)).date(),
        status="CONFIRMED",
        payment_status="CAPTURED",
        created_at=NOW - timedelta(days=1),
        updated_at=NOW,
        supplier=DEMO_SUPPLIERS[0],
        items=[
            PurchaseOrderItemResponse(
                id=uuid.uuid4(),
                purchase_order_id=uuid.UUID("ff010000-0000-0000-0000-000000000001"),
                product_id=PROD_IDS[0],
                quantity=150,
                unit_price=Decimal("1105.00"),
                total_price=Decimal("165750.00"),
                created_at=NOW - timedelta(days=1),
                product=DEMO_PRODUCTS[0],
            )
        ],
        payments=[
            PaymentResponse(
                id=uuid.uuid4(),
                organization_id=ORG_ID,
                purchase_order_id=uuid.UUID("ff010000-0000-0000-0000-000000000001"),
                amount=Decimal("165750.00"),
                currency="INR",
                provider="MOCK_ESCROW",
                transaction_id="TXN-AP-ESCROW-998811",
                status="COMPLETED",
                payment_method="NEFT / RTGS Corporate Mandi Escrow",
                created_at=NOW - timedelta(days=1),
                updated_at=NOW,
            )
        ],
    ),
]

# Seed Negotiations
DEMO_NEGOTIATIONS = [
    NegotiationDetailResponse(
        id=uuid.UUID("99010000-0000-0000-0000-000000000001"),
        organization_id=ORG_ID,
        product_id=PROD_IDS[0],
        supplier_id=SUPP_IDS[0],
        target_price=Decimal("1100.00"),
        initial_quote=Decimal("1180.00"),
        quantity=150,
        max_rounds=4,
        strategy="Volume Discount & Free Freight (NH-44 Corridor)",
        final_price=Decimal("1105.00"),
        rounds_completed=3,
        status="COMPLETED",
        expected_margin=Decimal("44.72"),
        expected_savings=Decimal("11250.00"),
        created_at=NOW - timedelta(hours=8),
        updated_at=NOW - timedelta(hours=3),
        product=DEMO_PRODUCTS[0],
        supplier=DEMO_SUPPLIERS[0],
        messages=[
            NegotiationMessageResponse(
                id=uuid.uuid4(),
                negotiation_id=uuid.UUID("99010000-0000-0000-0000-000000000001"),
                round_number=1,
                sender="BUYER_AI",
                offer_price=Decimal("1090.00"),
                shipping_cost=Decimal("0.00"),
                payment_terms="Net 30",
                message_text="We require 150 bags of Kurnool BPT Sona Masoori. Considering spot mandi rates in Kurnool APMC, we propose ₹1,090/bag with freight included.",
                supplier_counter_price=Decimal("1140.00"),
                supplier_response_text="Spot arrival costs are elevated due to diesel rates. We can offer ₹1,140/bag for prompt dispatch.",
                created_at=NOW - timedelta(hours=7),
            ),
            NegotiationMessageResponse(
                id=uuid.uuid4(),
                negotiation_id=uuid.UUID("99010000-0000-0000-0000-000000000001"),
                round_number=2,
                sender="BUYER_AI",
                offer_price=Decimal("1100.00"),
                shipping_cost=Decimal("0.00"),
                payment_terms="Net 30",
                message_text="We can increase to ₹1,100/bag with guaranteed 24-hr payment clearance upon receipt at Kurnool hub.",
                supplier_counter_price=Decimal("1110.00"),
                supplier_response_text="Meet us halfway at ₹1,110 and we waive loading cess charges.",
                created_at=NOW - timedelta(hours=5),
            ),
            NegotiationMessageResponse(
                id=uuid.uuid4(),
                negotiation_id=uuid.UUID("99010000-0000-0000-0000-000000000001"),
                round_number=3,
                sender="BUYER_AI",
                offer_price=Decimal("1105.00"),
                shipping_cost=Decimal("0.00"),
                payment_terms="Net 30",
                message_text="Final confirmation at ₹1,105/bag for full 150-bag lot. Purchase Order issued immediately.",
                supplier_counter_price=Decimal("1105.00"),
                supplier_response_text="Agreed at ₹1,105/bag. Dispatch initiated via NH-44 terminal.",
                created_at=NOW - timedelta(hours=3),
            ),
        ],
    ),
]

# Seed Activity Events
DEMO_ACTIVITY = [
    AgentEventResponse(
        id=uuid.uuid4(),
        organization_id=ORG_ID,
        agent_run_id=uuid.uuid4(),
        event_type="NEGOTIATION_SUCCESS",
        message="AI secured ₹11,250 savings on Kurnool Sona Masoori Rice with Rayalaseema Agro Commodities.",
        details={"po_number": "VAI-PO-2026-1048", "margin": "44.72%"},
        timestamp=NOW - timedelta(minutes=25),
    ),
    AgentEventResponse(
        id=uuid.uuid4(),
        organization_id=ORG_ID,
        agent_run_id=uuid.uuid4(),
        event_type="STOCKOUT_ALERT",
        message="Critical stockout warning: Guntur Teja Chilli S17 down to 12 bags (2.4 days coverage).",
        details={"sku": "GNT-CHILLI-S17-10K", "stock": 12},
        timestamp=NOW - timedelta(hours=2),
    ),
    AgentEventResponse(
        id=uuid.uuid4(),
        organization_id=ORG_ID,
        agent_run_id=uuid.uuid4(),
        event_type="DISPATCH_NOTIFICATION",
        message="Supplier dispatch verified: 150 bags dispatched via Tirumala Logistics (Vehicle AP21-TX-9988).",
        details={"status": "IN_TRANSIT"},
        timestamp=NOW - timedelta(hours=4),
    ),
]

# Seed Audit Logs
DEMO_AUDIT = [
    AuditLogResponse(
        id=uuid.uuid4(),
        organization_id=ORG_ID,
        actor_type="AI_AGENT",
        actor_id="SUPERVISOR_AGENT",
        action="AUTONOMOUS_PURCHASE_ORDER_ISSUED",
        entity_type="PURCHASE_ORDER",
        entity_id="VAI-PO-2026-1048",
        financial_amount=Decimal("165750.00"),
        policy_result="ALLOWED",
        reason_summary="Automated order issued within regional ceiling limit under Rayalaseema procurement policy.",
        timestamp=NOW - timedelta(hours=3),
    ),
]

# Seed Notifications
DEMO_NOTIFICATIONS = [
    NotificationResponse(
        id=uuid.uuid4(),
        organization_id=ORG_ID,
        type="APPROVAL",
        title="PO VAI-PO-2026-1048 Awaiting Sign-Off",
        message="Procurement order for ₹1,65,750 requires management sign-off for Andhra Pradesh agro fulfillment.",
        link="/approvals",
        is_read=False,
        created_at=NOW - timedelta(hours=1),
    ),
    NotificationResponse(
        id=uuid.uuid4(),
        organization_id=ORG_ID,
        type="MARKET_INTEL",
        title="APMC Mandi Price Update",
        message="Guntur Mirchi Yard prices rose +4.2% today. Recommended early lock-in on S17 grade.",
        link="/products",
        is_read=True,
        created_at=NOW - timedelta(hours=5),
    ),
]

# Seed Movements
DEMO_MOVEMENTS = [
    InventoryMovementResponse(
        id=uuid.uuid4(),
        organization_id=ORG_ID,
        product_id=PROD_IDS[0],
        reference_type="PURCHASE_ORDER",
        reference_id="VAI-PO-2026-1048",
        movement_type="INBOUND",
        quantity=150,
        previous_stock=18,
        new_stock=168,
        reason="Autonomous restocking via Rayalaseema Agro",
        created_at=NOW - timedelta(hours=1),
    ),
    InventoryMovementResponse(
        id=uuid.uuid4(),
        organization_id=ORG_ID,
        product_id=PROD_IDS[1],
        reference_type="SALES_ORDER",
        reference_id="SO-AP-8821",
        movement_type="OUTBOUND",
        quantity=18,
        previous_stock=30,
        new_stock=12,
        reason="Fulfillment to Hyderabad retail distribution partner",
        created_at=NOW - timedelta(hours=6),
    ),
]

# Seed Forecasts
DEMO_FORECASTS = [
    ForecastResponse(
        id=uuid.uuid4(),
        organization_id=ORG_ID,
        product_id=PROD_IDS[0],
        horizon_days=30,
        predicted_demand=Decimal("152.0"),
        confidence_score=Decimal("94.5"),
        model_name="WeightedMovingAverageWithTrend",
        baseline_demand=Decimal("140.0"),
        trend_factor=Decimal("1.08"),
        seasonality_factor=Decimal("1.02"),
        generated_at=NOW - timedelta(days=1),
        product=DEMO_PRODUCTS[0],
    ),
    ForecastResponse(
        id=uuid.uuid4(),
        organization_id=ORG_ID,
        product_id=PROD_IDS[1],
        horizon_days=30,
        predicted_demand=Decimal("54.0"),
        confidence_score=Decimal("92.8"),
        model_name="WeightedMovingAverageWithTrend",
        baseline_demand=Decimal("48.0"),
        trend_factor=Decimal("1.12"),
        seasonality_factor=Decimal("1.01"),
        generated_at=NOW - timedelta(days=1),
        product=DEMO_PRODUCTS[1],
    ),
]

# Seed Agent Runs
DEMO_AGENT_RUNS = [
    AgentRunResponse(
        id=uuid.uuid4(),
        organization_id=ORG_ID,
        agent_name="SupervisorAgent",
        execution_id="EXEC-APMC-AUTONOMOUS-01",
        trigger="SCHEDULED_STOCKOUT_SCAN",
        status="SUCCESS",
        confidence_score=Decimal("95.2"),
        execution_duration_ms=1840,
        started_at=NOW - timedelta(hours=3),
        completed_at=NOW - timedelta(hours=3),
        events=[DEMO_ACTIVITY[0]],
    ),
]


def get_demo_products(category: str | None = None, search: str | None = None, risk_level: str | None = None) -> list[ProductResponse]:
    prods = list(DEMO_PRODUCTS)
    if category:
        prods = [p for p in prods if p.category == category]
    if search:
        s = search.lower()
        prods = [p for p in prods if s in p.title.lower() or s in p.sku.lower()]
    if risk_level:
        prods = [p for p in prods if p.stockout_risk_level == risk_level]
    return prods


def get_demo_product_detail(product_id: uuid.UUID) -> ProductDetailResponse:
    for p in DEMO_PRODUCTS:
        if p.id == product_id or str(p.id) == str(product_id):
            return ProductDetailResponse(
                **p.model_dump(),
                avg_daily_sales=Decimal("12.0"),
                forecasted_demand_30d=Decimal("360.0"),
                safety_stock=20,
                reorder_point=40,
                suggested_reorder_qty=150,
                active_suppliers_count=2,
                lowest_quote_price=Decimal("1105.00"),
            )
    # Default fallback
    p0 = DEMO_PRODUCTS[0]
    return ProductDetailResponse(
        **p0.model_dump(),
        avg_daily_sales=Decimal("12.0"),
        forecasted_demand_30d=Decimal("360.0"),
        safety_stock=20,
        reorder_point=40,
        suggested_reorder_qty=150,
        active_suppliers_count=2,
        lowest_quote_price=Decimal("1105.00"),
    )


def get_demo_inventory(risk_level: str | None = None) -> list[InventoryResponse]:
    inv = list(DEMO_INVENTORY)
    if risk_level:
        inv = [i for i in inv if i.stockout_risk_level == risk_level]
    return inv


def get_demo_inventory_movements(product_id: uuid.UUID | None = None, limit: int = 50) -> list[InventoryMovementResponse]:
    movs = list(DEMO_MOVEMENTS)
    if product_id:
        movs = [m for m in movs if m.product_id == product_id or str(m.product_id) == str(product_id)]
    return movs[:limit]


def get_demo_suppliers() -> list[SupplierResponse]:
    return list(DEMO_SUPPLIERS)


def get_demo_supplier_detail(supplier_id: uuid.UUID) -> SupplierDetailResponse:
    for s in DEMO_SUPPLIERS:
        if s.id == supplier_id or str(s.id) == str(supplier_id):
            return SupplierDetailResponse(
                **s.model_dump(),
                scoring_breakdown=SupplierScoringBreakdown(
                    cost_score=Decimal("92.00"),
                    reliability_score=s.reliability_score,
                    delivery_score=s.delivery_score,
                    quality_score=s.quality_score,
                    payment_terms_score=Decimal("95.00"),
                    composite_procurement_score=s.procurement_score or Decimal("93.80"),
                ),
                products_count=3,
                active_quotes_count=2,
                completed_orders_count=5,
            )
    s0 = DEMO_SUPPLIERS[0]
    return SupplierDetailResponse(
        **s0.model_dump(),
        scoring_breakdown=SupplierScoringBreakdown(
            cost_score=Decimal("92.00"),
            reliability_score=s0.reliability_score,
            delivery_score=s0.delivery_score,
            quality_score=s0.quality_score,
            payment_terms_score=Decimal("95.00"),
            composite_procurement_score=Decimal("93.80"),
        ),
        products_count=3,
        active_quotes_count=2,
        completed_orders_count=5,
    )


def get_demo_quotes(product_id: uuid.UUID | None = None, supplier_id: uuid.UUID | None = None) -> list[SupplierQuoteResponse]:
    quotes = list(DEMO_QUOTES)
    if product_id:
        quotes = [q for q in quotes if q.product_id == product_id or str(q.product_id) == str(product_id)]
    if supplier_id:
        quotes = [q for q in quotes if q.supplier_id == supplier_id or str(q.supplier_id) == str(supplier_id)]
    return quotes


def get_demo_opportunities(urgency: str | None = None, status: str | None = None) -> list[OpportunityResponse]:
    opps = list(DEMO_OPPORTUNITIES)
    if urgency:
        opps = [o for o in opps if o.urgency == urgency]
    if status:
        opps = [o for o in opps if o.status == status]
    return opps


def evaluate_demo_opportunity(opp_id: uuid.UUID) -> OpportunityResponse:
    for o in DEMO_OPPORTUNITIES:
        if o.id == opp_id or str(o.id) == str(opp_id):
            o.status = "EVALUATED"
            return o
    return DEMO_OPPORTUNITIES[0]


def get_demo_approvals(status: str | None = None) -> list[ApprovalResponse]:
    apps = list(DEMO_APPROVALS)
    if status:
        apps = [a for a in apps if a.status == status]
    return apps


def decide_demo_approval(approval_id: uuid.UUID, decision: str, comments: str | None = None) -> ApprovalResponse:
    for a in DEMO_APPROVALS:
        if a.id == approval_id or str(a.id) == str(approval_id):
            a.status = decision
            a.comments = comments or f"{decision.title()} by management"
            a.decided_at = datetime.utcnow()
            return a
    a0 = DEMO_APPROVALS[0]
    a0.status = decision
    a0.comments = comments
    return a0


def get_demo_purchase_orders(status: str | None = None) -> list[PurchaseOrderResponse]:
    pos = list(DEMO_POS)
    if status:
        pos = [p for p in pos if p.status == status]
    return pos


def get_demo_purchase_order_detail(po_id: uuid.UUID) -> PurchaseOrderResponse:
    for p in DEMO_POS:
        if p.id == po_id or str(p.id) == str(po_id):
            return p
    return DEMO_POS[0]


def get_demo_negotiations(product_id: uuid.UUID | None = None, status: str | None = None) -> list[NegotiationResponse]:
    negs: list[NegotiationResponse] = [
        NegotiationResponse(**n.model_dump(exclude={"messages"})) for n in DEMO_NEGOTIATIONS
    ]
    if product_id:
        negs = [n for n in negs if n.product_id == product_id or str(n.product_id) == str(product_id)]
    if status:
        negs = [n for n in negs if n.status == status]
    return negs


def get_demo_negotiation_detail(neg_id: uuid.UUID) -> NegotiationDetailResponse:
    for n in DEMO_NEGOTIATIONS:
        if n.id == neg_id or str(n.id) == str(neg_id):
            return n
    return DEMO_NEGOTIATIONS[0]


def counter_demo_negotiation(
    neg_id: uuid.UUID, offer_price: Decimal, shipping_cost: Decimal = Decimal("0.00"), payment_terms: str = "Net 30", message_text: str = ""
) -> NegotiationDetailResponse:
    item = get_demo_negotiation_detail(neg_id)
    new_round = len(item.messages) + 1
    counter_price = max(offer_price, (offer_price + item.target_price) / Decimal(2))
    new_msg = NegotiationMessageResponse(
        id=uuid.uuid4(),
        negotiation_id=item.id,
        round_number=new_round,
        sender="BUYER_AI",
        offer_price=offer_price,
        shipping_cost=shipping_cost,
        payment_terms=payment_terms,
        message_text=message_text or f"Counter offer submitted: ₹{offer_price:,.2f}",
        supplier_counter_price=counter_price,
        supplier_response_text=f"Supplier accepted counter offer at ₹{counter_price:,.2f} with {payment_terms}.",
        created_at=datetime.utcnow(),
    )
    item.messages.append(new_msg)
    item.rounds_completed = new_round
    item.final_price = counter_price
    return item


def get_demo_forecasts(product_id: uuid.UUID | None = None, limit: int = 50) -> list[ForecastResponse]:
    fc = list(DEMO_FORECASTS)
    if product_id:
        fc = [f for f in fc if f.product_id == product_id or str(f.product_id) == str(product_id)]
    return fc[:limit]


def generate_demo_forecast(product_id: uuid.UUID, horizon_days: int = 30) -> ForecastResponse:
    p = next((p for p in DEMO_PRODUCTS if p.id == product_id or str(p.id) == str(product_id)), DEMO_PRODUCTS[0])
    return ForecastResponse(
        id=uuid.uuid4(),
        organization_id=ORG_ID,
        product_id=p.id,
        horizon_days=horizon_days,
        predicted_demand=Decimal(str(horizon_days * 5)),
        confidence_score=Decimal("94.2"),
        model_name="WeightedMovingAverageWithTrend",
        baseline_demand=Decimal(str(horizon_days * 4)),
        trend_factor=Decimal("1.08"),
        seasonality_factor=Decimal("1.02"),
        generated_at=datetime.utcnow(),
        product=p,
    )


def get_demo_analytics() -> AnalyticsResponse:
    spend = Decimal("165750.00")
    savings = Decimal("11250.00")
    return AnalyticsResponse(
        total_procurement_spend=spend,
        total_ai_savings=savings,
        average_gross_margin=Decimal("44.7"),
        inventory_turnover_rate=Decimal("5.8"),
        stockout_incident_count=0,
        forecast_accuracy_pct=Decimal("94.2"),
        supplier_average_reliability=Decimal("86.5"),
        negotiation_success_rate=Decimal("91.7"),
        approval_rate=Decimal("96.0"),
        average_cycle_time_hours=Decimal("1.4"),
        spend_by_category=[
            {"category": "Agro Commodities", "spend": 107737.5, "percentage": 65},
            {"category": "Spices & Seasonings", "spend": 33150.0, "percentage": 20},
            {"category": "Edible Oils", "spend": 24862.5, "percentage": 15},
        ],
        savings_by_supplier=[
            {"supplier": "Rayalaseema Agro", "savings": 11250, "orders": 1},
            {"supplier": "Guntur Mirchi Yard", "savings": 3500, "orders": 1},
            {"supplier": "Tungabhadra Mills", "savings": 2800, "orders": 1},
        ],
        monthly_spend_savings=[
            {"month": "May", "spend": 185000, "savings": 14500},
            {"month": "Jun", "spend": 140000, "savings": 9800},
            {"month": "Jul", "spend": 210000, "savings": 18200},
            {"month": "Aug", "spend": 195000, "savings": 15600},
            {"month": "Sep", "spend": float(spend), "savings": float(savings)},
        ],
        negotiation_rounds_distribution=[
            {"rounds": "1 Round", "count": 2},
            {"rounds": "2 Rounds", "count": 5},
            {"rounds": "3 Rounds", "count": 3},
            {"rounds": "4 Rounds", "count": 1},
        ],
        margin_distribution=[
            {"range": "25-35%", "count": 2},
            {"range": "35-45%", "count": 6},
            {"range": "45-55%", "count": 3},
            {"range": ">55%", "count": 1},
        ],
    )


def get_demo_agent_runs(limit: int = 20) -> list[AgentRunResponse]:
    return DEMO_AGENT_RUNS[:limit]


def run_demo_agent(agent_name: str, product_id: uuid.UUID | None = None) -> dict[str, Any]:
    return {
        "status": "success",
        "stage": "COMPLETED",
        "po_number": "VAI-PO-2026-1048",
        "total_spend": 165750.0,
        "expected_savings": 11250.0,
        "calculated_gross_margin": 44.72,
        "selected_supplier": "Rayalaseema Agro Commodities Pvt Ltd",
    }


def get_demo_activity(limit: int = 50) -> list[AgentEventResponse]:
    return DEMO_ACTIVITY[:limit]


def get_demo_audit(limit: int = 50) -> list[AuditLogResponse]:
    return DEMO_AUDIT[:limit]


def get_demo_notifications() -> list[NotificationResponse]:
    return DEMO_NOTIFICATIONS


def mark_demo_notification_read(notif_id: uuid.UUID) -> NotificationResponse:
    for n in DEMO_NOTIFICATIONS:
        if n.id == notif_id or str(n.id) == str(notif_id):
            n.is_read = True
            return n
    return DEMO_NOTIFICATIONS[0]


def get_demo_settings() -> dict[str, Any]:
    return {
        "organization_name": "Acme Retail India (Rayalaseema Procurement Hub)",
        "currency": "INR",
        "ai_provider": "mock",
        "minimum_margin": Decimal("0.25"),
        "target_margin": Decimal("0.35"),
        "auto_approval_limit": Decimal(50000),
        "human_approval_limit": Decimal(200000),
        "monthly_budget": Decimal(1500000),
        "minimum_supplier_rating": Decimal("3.8"),
        "maximum_supplier_risk": Decimal(60),
        "minimum_quotes": 2,
        "max_negotiation_rounds": 4,
        "auto_purchase_enabled": False,
        "regional_default_hub": "Kurnool Central Agro-Terminal (NH-44)",
        "ap_gstin_code": "37",
        "apmc_mandi_cess_percent": Decimal("1.00"),
        "local_freight_tariff_per_ton_km": Decimal("4.50"),
        "negotiation_aggressiveness": "BALANCED",
        "auto_counter_threshold": Decimal("0.05"),
        "enable_security_verification": True,
        "whatsapp_supplier_dispatch": True,
        "email_po_dispatch": True,
    }


def get_demo_data_health() -> DataHealthReport:
    checks = [
        DataHealthCheckItem(
            category="Catalog Integrity",
            check_name="Duplicate SKU Detection",
            status="PASSED",
            details="0 duplicate SKUs found across catalog.",
            issue_count=0,
        ),
        DataHealthCheckItem(
            category="Inventory Consistency",
            check_name="Non-Negative Stock Constraints",
            status="PASSED",
            details="All inventory levels are non-negative.",
            issue_count=0,
        ),
        DataHealthCheckItem(
            category="Pricing & Margins",
            check_name="Positive Price Validation",
            status="PASSED",
            details="All products have positive selling prices.",
            issue_count=0,
        ),
        DataHealthCheckItem(
            category="Supplier Network",
            check_name="Supplier Quote Coverage",
            status="PASSED",
            details="All catalog products have competitive supplier quotes.",
            issue_count=0,
        ),
        DataHealthCheckItem(
            category="Financial Compliance",
            check_name="Currency Consistency (INR)",
            status="PASSED",
            details="100% monetary entries normalized to INR.",
            issue_count=0,
        ),
    ]
    return DataHealthReport(
        overall_status="OPTIMAL",
        health_score=100,
        total_checks=5,
        passed_checks=5,
        warning_checks=0,
        failed_checks=0,
        checks=checks,
        metrics={
            "total_products": len(DEMO_PRODUCTS),
            "total_suppliers": len(DEMO_SUPPLIERS),
            "total_sales_records": 180,
        },
    )


def run_demo_workflow() -> dict[str, Any]:
    return {
        "status": "COMPLETED",
        "product_title": "Kurnool BPT 5204 Sona Masoori Rice (25kg Bag)",
        "initial_stock": 18,
        "avg_daily_sales": 12,
        "reorder_quantity": 150,
        "selected_supplier": "Rayalaseema Agro Commodities Pvt Ltd",
        "initial_price": 1180.0,
        "final_price": 1105.0,
        "total_spend": 165750.0,
        "total_savings": 11250.0,
        "gross_margin_pct": 44.72,
        "po_number": "VAI-PO-2026-1048",
        "payment_status": "CAPTURED",
        "policy_decision": "ALLOWED_AUTOMATIC_RESTOCK",
        "stages": [
            {"step": 1, "name": "Monitoring Inventory", "status": "completed"},
            {"step": 2, "name": "Detecting Stockout Risk", "status": "completed"},
            {"step": 3, "name": "Forecasting 30-Day Demand", "status": "completed"},
            {"step": 4, "name": "Sourcing Multi-Supplier Quotes", "status": "completed"},
            {"step": 5, "name": "Autonomous Supplier Negotiation", "status": "completed"},
            {"step": 6, "name": "Deterministic Margin Analysis", "status": "completed"},
            {"step": 7, "name": "Policy Engine Verification", "status": "completed"},
            {"step": 8, "name": "Purchase Order Generation", "status": "completed"},
            {"step": 9, "name": "Payment Simulation", "status": "completed"},
            {"step": 10, "name": "Expected Inventory Inbound Update", "status": "completed"},
            {"step": 11, "name": "Audit Trail Logged", "status": "completed"},
        ],
        "negotiation_rounds": [
            {"round": 1, "bid": 1090.0, "counter": 1140.0, "status": "countered"},
            {"round": 2, "bid": 1100.0, "counter": 1110.0, "status": "countered"},
            {"round": 3, "bid": 1105.0, "counter": 1105.0, "status": "agreed"},
        ],
    }

