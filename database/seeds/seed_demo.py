import asyncio
import uuid
from datetime import datetime, date, timedelta
from decimal import Decimal
from sqlalchemy import select
from apps.api.database import AsyncSessionLocal
from apps.api.models import (
    Organization,
    User,
    Product,
    ProductImage,
    Inventory,
    InventoryMovement,
    SalesHistory,
    Supplier,
    SupplierProduct,
    SupplierQuote,
    BusinessRule,
    Notification,
    AuditLog,
)
from apps.api.services.auth import get_password_hash


async def seed_database():
    async with AsyncSessionLocal() as db:
        stmt_org = select(Organization).where(Organization.slug == "acme-retail")
        res_org = await db.execute(stmt_org)
        org = res_org.scalar_one_or_none()

        if not org:
            org = Organization(
                name="Acme Retail India",
                slug="acme-retail",
                currency="INR",
            )
            db.add(org)
            await db.flush()

        org_id = org.id

        users_data = [
            ("admin@vendo.ai", "Aarav Sharma", "ADMIN"),
            ("manager@vendo.ai", "Priya Patel", "MANAGER"),
            ("demo@vendo.ai", "Rohan Verma", "BUYER"),
        ]
        for email, full_name, role in users_data:
            stmt_u = select(User).where(User.email == email)
            res_u = await db.execute(stmt_u)
            if not res_u.scalar_one_or_none():
                user = User(
                    organization_id=org_id,
                    email=email,
                    hashed_password=get_password_hash("password123"),
                    full_name=full_name,
                    role=role,
                    is_active=True,
                )
                db.add(user)

        rules_data = [
            ("minimum_margin", Decimal("0.25"), None, None),
            ("target_margin", Decimal("0.35"), None, None),
            ("auto_approval_limit", Decimal("50000"), None, None),
            ("human_approval_limit", Decimal("200000"), None, None),
            ("monthly_budget", Decimal("1500000"), None, None),
            ("minimum_supplier_rating", Decimal("3.8"), None, None),
            ("maximum_supplier_risk", Decimal("60"), None, None),
            ("minimum_quotes", Decimal("2"), None, None),
            ("max_negotiation_rounds", Decimal("4"), None, None),
            ("auto_purchase_enabled", None, None, False),
        ]
        for r_key, num_val, str_val, bool_val in rules_data:
            stmt_r = select(BusinessRule).where(BusinessRule.organization_id == org_id, BusinessRule.rule_key == r_key)
            if not (await db.execute(stmt_r)).scalar_one_or_none():
                rule = BusinessRule(
                    organization_id=org_id,
                    rule_name=r_key.replace("_", " ").title(),
                    rule_key=r_key,
                    value_numeric=num_val,
                    value_text=str_val,
                    value_boolean=bool_val,
                    is_active=True,
                )
                db.add(rule)

        suppliers_data = [
            {
                "name": "NovaTech Industrial Solutions",
                "rating": Decimal("4.20"),
                "reliability_score": Decimal("88.00"),
                "delivery_score": Decimal("90.00"),
                "quality_score": Decimal("85.00"),
                "payment_terms": "Net 30",
                "risk_score": Decimal("15.00"),
                "negotiation_style": "Reliable Supplier",
                "min_order_qty": 50,
                "lead_time_days": 7,
                "location": "Bengaluru, Karnataka",
            },
            {
                "name": "PrimeSource Global",
                "rating": Decimal("4.00"),
                "reliability_score": Decimal("82.00"),
                "delivery_score": Decimal("80.00"),
                "quality_score": Decimal("84.00"),
                "payment_terms": "Net 30",
                "risk_score": Decimal("25.00"),
                "negotiation_style": "Aggressive Negotiator",
                "min_order_qty": 100,
                "lead_time_days": 5,
                "location": "Mumbai, Maharashtra",
            },
            {
                "name": "Orbit Electronics & Components",
                "rating": Decimal("3.90"),
                "reliability_score": Decimal("78.00"),
                "delivery_score": Decimal("85.00"),
                "quality_score": Decimal("80.00"),
                "payment_terms": "Net 15",
                "risk_score": Decimal("35.00"),
                "negotiation_style": "Volume Supplier",
                "min_order_qty": 150,
                "lead_time_days": 10,
                "location": "New Delhi, Delhi",
            },
            {
                "name": "Zenith Manufacturing Hub",
                "rating": Decimal("4.50"),
                "reliability_score": Decimal("94.00"),
                "delivery_score": Decimal("92.00"),
                "quality_score": Decimal("95.00"),
                "payment_terms": "Net 60",
                "risk_score": Decimal("10.00"),
                "negotiation_style": "Premium Supplier",
                "min_order_qty": 50,
                "lead_time_days": 6,
                "location": "Pune, Maharashtra",
            },
            {
                "name": "Apex Supply Direct",
                "rating": Decimal("3.80"),
                "reliability_score": Decimal("75.00"),
                "delivery_score": Decimal("70.00"),
                "quality_score": Decimal("78.00"),
                "payment_terms": "Advance",
                "risk_score": Decimal("40.00"),
                "negotiation_style": "Budget Supplier",
                "min_order_qty": 200,
                "lead_time_days": 12,
                "location": "Surat, Gujarat",
            },
        ]
        supplier_map = {}
        for s_data in suppliers_data:
            stmt_s = select(Supplier).where(Supplier.organization_id == org_id, Supplier.name == s_data["name"])
            existing_s = (await db.execute(stmt_s)).scalar_one_or_none()
            if not existing_s:
                s = Supplier(organization_id=org_id, **s_data)
                db.add(s)
                await db.flush()
                supplier_map[s_data["name"]] = s
            else:
                supplier_map[s_data["name"]] = existing_s

        products_data = [
            {
                "title": "Wireless Earbuds Pro",
                "description": "Active noise cancelling wireless earbuds with transparency mode, 32-hour battery life, and wireless charging case.",
                "category": "Electronics",
                "sku": "WBR-AUD-1048",
                "selling_price": Decimal("1999.00"),
                "cost_price": Decimal("1250.00"),
                "current_stock": 18,
                "reorder_point": 50,
                "safety_stock": 36,
                "suggested_reorder_qty": 150,
                "stockout_risk_level": "CRITICAL",
                "avg_daily_sales": 12,
                "quotes": [
                    ("NovaTech Industrial Solutions", Decimal("1180.00"), Decimal("0.00"), 7, "Net 30"),
                    ("PrimeSource Global", Decimal("1230.00"), Decimal("0.00"), 5, "Net 30"),
                    ("Orbit Electronics & Components", Decimal("1155.00"), Decimal("0.00"), 10, "Net 15"),
                ],
            },
            {
                "title": "Ergonomic Mesh Office Chair",
                "description": "High-back mesh executive desk chair with adjustable lumbar support, 3D armrests, and synchro-tilt mechanism.",
                "category": "Furniture",
                "sku": "OFF-CHR-2041",
                "selling_price": Decimal("8499.00"),
                "cost_price": Decimal("4800.00"),
                "current_stock": 42,
                "reorder_point": 30,
                "safety_stock": 15,
                "suggested_reorder_qty": 60,
                "stockout_risk_level": "LOW",
                "avg_daily_sales": 4,
                "quotes": [
                    ("Zenith Manufacturing Hub", Decimal("4600.00"), Decimal("200.00"), 6, "Net 60"),
                    ("NovaTech Industrial Solutions", Decimal("4750.00"), Decimal("150.00"), 8, "Net 30"),
                ],
            },
            {
                "title": "Smart Fitness Tracker Band",
                "description": "Waterproof AMOLED fitness wristband with heart rate tracking, SpO2 sensor, sleep analytics, and 14-day battery.",
                "category": "Electronics",
                "sku": "FIT-TRK-3092",
                "selling_price": Decimal("2499.00"),
                "cost_price": Decimal("1400.00"),
                "current_stock": 28,
                "reorder_point": 40,
                "safety_stock": 20,
                "suggested_reorder_qty": 100,
                "stockout_risk_level": "HIGH",
                "avg_daily_sales": 9,
                "quotes": [
                    ("NovaTech Industrial Solutions", Decimal("1320.00"), Decimal("0.00"), 7, "Net 30"),
                    ("PrimeSource Global", Decimal("1350.00"), Decimal("0.00"), 5, "Net 30"),
                    ("Orbit Electronics & Components", Decimal("1290.00"), Decimal("20.00"), 9, "Net 15"),
                ],
            },
            {
                "title": "Ceramic Pour-Over Coffee Brewer",
                "description": "Artisan matte ceramic coffee dripper with heat-resistant base and precision flow extraction spiral.",
                "category": "Home & Kitchen",
                "sku": "KIT-COF-4180",
                "selling_price": Decimal("1299.00"),
                "cost_price": Decimal("620.00"),
                "current_stock": 85,
                "reorder_point": 35,
                "safety_stock": 20,
                "suggested_reorder_qty": 80,
                "stockout_risk_level": "LOW",
                "avg_daily_sales": 5,
                "quotes": [
                    ("Apex Supply Direct", Decimal("590.00"), Decimal("30.00"), 10, "Advance"),
                    ("Zenith Manufacturing Hub", Decimal("610.00"), Decimal("10.00"), 7, "Net 60"),
                ],
            },
            {
                "title": "Ultra-Fast 65W GaN Charger",
                "description": "Compact dual USB-C + USB-A gallium nitride fast wall charger supporting PD 3.0 and PPS protocols.",
                "category": "Electronics",
                "sku": "ACC-PWR-5510",
                "selling_price": Decimal("1699.00"),
                "cost_price": Decimal("850.00"),
                "current_stock": 22,
                "reorder_point": 60,
                "safety_stock": 30,
                "suggested_reorder_qty": 120,
                "stockout_risk_level": "HIGH",
                "avg_daily_sales": 11,
                "quotes": [
                    ("Orbit Electronics & Components", Decimal("780.00"), Decimal("0.00"), 8, "Net 15"),
                    ("NovaTech Industrial Solutions", Decimal("810.00"), Decimal("0.00"), 6, "Net 30"),
                ],
            },
            {
                "title": "Mechanical RGB Gaming Keyboard",
                "description": "Tenkeyless mechanical keyboard with hot-swappable linear switches, PBT keycaps, and per-key RGB backlighting.",
                "category": "Electronics",
                "sku": "GAM-KBD-6204",
                "selling_price": Decimal("3999.00"),
                "cost_price": Decimal("2200.00"),
                "current_stock": 64,
                "reorder_point": 30,
                "safety_stock": 15,
                "suggested_reorder_qty": 50,
                "stockout_risk_level": "LOW",
                "avg_daily_sales": 6,
                "quotes": [
                    ("PrimeSource Global", Decimal("2050.00"), Decimal("50.00"), 7, "Net 30"),
                    ("Zenith Manufacturing Hub", Decimal("2120.00"), Decimal("0.00"), 5, "Net 60"),
                ],
            },
        ]

        today = date.today()

        for p_data in products_data:
            stmt_p = select(Product).where(Product.organization_id == org_id, Product.sku == p_data["sku"])
            existing_p = (await db.execute(stmt_p)).scalar_one_or_none()

            if not existing_p:
                product = Product(
                    organization_id=org_id,
                    title=p_data["title"],
                    description=p_data["description"],
                    category=p_data["category"],
                    sku=p_data["sku"],
                    source="internal",
                    selling_price=p_data["selling_price"],
                    cost_price=p_data["cost_price"],
                    currency="INR",
                )
                db.add(product)
                await db.flush()
                prod_id = product.id

                img = ProductImage(
                    product_id=prod_id,
                    original_url=f"https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80" if "Earbuds" in p_data["title"] else f"https://images.unsplash.com/photo-1580481077191-236b32525ec1?w=600&auto=format&fit=crop&q=80",
                    primary_path=f"/storage/products/{p_data['sku'].lower()}.jpg",
                    thumbnail_path=f"/storage/thumbnails/{p_data['sku'].lower()}_thumb.jpg",
                    is_primary=True,
                )
                db.add(img)

                inv = Inventory(
                    organization_id=org_id,
                    product_id=prod_id,
                    current_stock=p_data["current_stock"],
                    reserved_stock=2,
                    expected_inbound=0,
                    reorder_point=p_data["reorder_point"],
                    safety_stock=p_data["safety_stock"],
                    suggested_reorder_qty=p_data["suggested_reorder_qty"],
                    days_of_inventory=Decimal(str(round(p_data["current_stock"] / p_data["avg_daily_sales"], 1))),
                    stockout_risk_level=p_data["stockout_risk_level"],
                )
                db.add(inv)

                for day_offset in range(60, 0, -1):
                    s_date = today - timedelta(days=day_offset)
                    base_rate = p_data["avg_daily_sales"]
                    variation = (day_offset % 5) - 2
                    sold = max(1, base_rate + variation)
                    rev = Decimal(str(sold)) * p_data["selling_price"]
                    sales_entry = SalesHistory(
                        organization_id=org_id,
                        product_id=prod_id,
                        date=s_date,
                        units_sold=sold,
                        unit_price=p_data["selling_price"],
                        total_revenue=rev,
                        channel="direct",
                    )
                    db.add(sales_entry)

                for supp_name, unit_q, ship_q, lead_t, p_terms in p_data["quotes"]:
                    supplier = supplier_map.get(supp_name)
                    if supplier:
                        sp_link = SupplierProduct(
                            supplier_id=supplier.id,
                            product_id=prod_id,
                            supplier_sku=f"{p_data['sku']}-{supplier.name[:3].upper()}",
                            base_price=unit_q,
                            min_order_qty=supplier.min_order_qty,
                            lead_time_days=lead_t,
                            is_preferred=(supp_name == "NovaTech Industrial Solutions"),
                        )
                        db.add(sp_link)

                        quote = SupplierQuote(
                            organization_id=org_id,
                            supplier_id=supplier.id,
                            product_id=prod_id,
                            unit_price=unit_q,
                            shipping_cost=ship_q,
                            total_quote=unit_q + ship_q,
                            payment_terms=p_terms,
                            lead_time_days=lead_t,
                            validity_days=30,
                            status="RECEIVED",
                        )
                        db.add(quote)

        stmt_notif = select(Notification).where(Notification.organization_id == org_id)
        if not (await db.execute(stmt_notif)).first():
            notif = Notification(
                organization_id=org_id,
                type="STOCKOUT_RISK",
                title="Critical Stockout Alert: Wireless Earbuds Pro",
                message="Stock remaining: 18 units (~1.5 days coverage). Immediate procurement recommended.",
                link="/opportunities",
                is_read=False,
            )
            db.add(notif)

        await db.commit()


if __name__ == "__main__":
    asyncio.run(seed_database())
