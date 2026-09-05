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
    ProcurementOpportunity,
    Negotiation,
    NegotiationMessage,
    PurchaseOrder,
    PurchaseOrderItem,
    Approval,
)
from apps.api.services.auth import get_password_hash


import sys
import io
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

async def seed_rayalaseema_ap_data():
    print("[+] Seeding Authentic Rayalaseema & Andhra Pradesh Locality Procurement Data...")
    async with AsyncSessionLocal() as db:
        stmt_org = select(Organization).where(Organization.slug == "acme-retail")
        res_org = await db.execute(stmt_org)
        org = res_org.scalar_one_or_none()

        if not org:
            org = Organization(
                name="Acme Retail India (Rayalaseema Procurement Hub)",
                slug="acme-retail",
                currency="INR",
            )
            db.add(org)
            await db.flush()
        else:
            org.name = "Acme Retail India (Rayalaseema Procurement Hub)"

        org_id = org.id

        # 1. Update/Ensure Users with authentic credentials
        users_config = [
            ("admin@vendo.ai", "Aarav Sharma", "ADMIN", "Admin@Rayalaseema2026!"),
            ("manager@vendo.ai", "Priya Patel", "MANAGER", "Manager@Andhra2026!"),
            ("buyer@vendo.ai", "Rohan Verma", "BUYER", "Buyer@Tirupati2026!"),
            ("kurnool.procurement@vendo.ai", "K. Venkata Reddy", "BUYER", "Kurnool@2026!"),
            ("kadapa.procurement@vendo.ai", "S. Lakshmi Narayana", "MANAGER", "Kadapa@2026!"),
        ]

        user_map = {}
        for email, full_name, role, pwd in users_config:
            stmt_u = select(User).where(User.email == email)
            res_u = await db.execute(stmt_u)
            user = res_u.scalar_one_or_none()
            if not user:
                user = User(
                    organization_id=org_id,
                    email=email,
                    hashed_password=get_password_hash(pwd),
                    full_name=full_name,
                    role=role,
                    is_active=True,
                )
                db.add(user)
                await db.flush()
            else:
                user.full_name = full_name
                user.role = role
                # Ensure password123 or new password works
                user.hashed_password = get_password_hash("password123")
            user_map[role] = user
            user_map[email] = user

        # 2. Authentic Rayalaseema & Andhra Pradesh Regional Suppliers
        ap_suppliers_data = [
            {
                "name": "Rayalaseema Agro Commodities Pvt Ltd",
                "rating": Decimal("4.60"),
                "reliability_score": Decimal("94.00"),
                "delivery_score": Decimal("92.00"),
                "quality_score": Decimal("96.00"),
                "payment_terms": "Net 30",
                "risk_score": Decimal("8.00"),
                "negotiation_style": "Reliable Mandi Partner",
                "min_order_qty": 100,
                "lead_time_days": 3,
                "location": "Kurnool Industrial Estate, Andhra Pradesh",
            },
            {
                "name": "Tungabhadra Mills & Cold Storage",
                "rating": Decimal("4.40"),
                "reliability_score": Decimal("90.00"),
                "delivery_score": Decimal("88.00"),
                "quality_score": Decimal("92.00"),
                "payment_terms": "Net 15",
                "risk_score": Decimal("12.00"),
                "negotiation_style": "Volume Grain Supplier",
                "min_order_qty": 200,
                "lead_time_days": 4,
                "location": "Yemmiganur, Kurnool District, Andhra Pradesh",
            },
            {
                "name": "Guntur Mirchi Yard Traders Consortium",
                "rating": Decimal("4.80"),
                "reliability_score": Decimal("96.00"),
                "delivery_score": Decimal("95.00"),
                "quality_score": Decimal("98.00"),
                "payment_terms": "Net 30",
                "risk_score": Decimal("6.00"),
                "negotiation_style": "Premium Spice Supplier",
                "min_order_qty": 50,
                "lead_time_days": 2,
                "location": "APMC Mirchi Yard, Guntur, Andhra Pradesh",
            },
            {
                "name": "Sri Sathya Sai Oilseeds & Agro Tech",
                "rating": Decimal("4.30"),
                "reliability_score": Decimal("86.00"),
                "delivery_score": Decimal("89.00"),
                "quality_score": Decimal("88.00"),
                "payment_terms": "Net 30",
                "risk_score": Decimal("15.00"),
                "negotiation_style": "Direct Farmer Producer Co",
                "min_order_qty": 80,
                "lead_time_days": 5,
                "location": "Dharmavaram, Anantapur District, Andhra Pradesh",
            },
            {
                "name": "Penna Spices & Processing Corp",
                "rating": Decimal("4.10"),
                "reliability_score": Decimal("82.00"),
                "delivery_score": Decimal("85.00"),
                "quality_score": Decimal("84.00"),
                "payment_terms": "Net 15",
                "risk_score": Decimal("22.00"),
                "negotiation_style": "Competitive Negotiator",
                "min_order_qty": 60,
                "lead_time_days": 4,
                "location": "Kadapa Bypass Road, YSR Kadapa, Andhra Pradesh",
            },
            {
                "name": "Tirumala Agri-Logistics & Warehousing",
                "rating": Decimal("4.70"),
                "reliability_score": Decimal("95.00"),
                "delivery_score": Decimal("96.00"),
                "quality_score": Decimal("93.00"),
                "payment_terms": "Net 45",
                "risk_score": Decimal("7.00"),
                "negotiation_style": "Multi-Modal Cold Chain",
                "min_order_qty": 150,
                "lead_time_days": 2,
                "location": "Renigunta Industrial Park, Tirupati, Andhra Pradesh",
            },
            {
                "name": "Chittoor Fruit Processing & Puree Ltd",
                "rating": Decimal("4.50"),
                "reliability_score": Decimal("91.00"),
                "delivery_score": Decimal("90.00"),
                "quality_score": Decimal("94.00"),
                "payment_terms": "Net 30",
                "risk_score": Decimal("10.00"),
                "negotiation_style": "Contract Agro Processor",
                "min_order_qty": 100,
                "lead_time_days": 5,
                "location": "Chittoor-Bengaluru Highway, Chittoor, Andhra Pradesh",
            },
            {
                "name": "Betamcherla Natural Stone & Slabs Works",
                "rating": Decimal("4.20"),
                "reliability_score": Decimal("85.00"),
                "delivery_score": Decimal("82.00"),
                "quality_score": Decimal("90.00"),
                "payment_terms": "Advance 20%",
                "risk_score": Decimal("20.00"),
                "negotiation_style": "Quarry Direct Supplier",
                "min_order_qty": 250,
                "lead_time_days": 7,
                "location": "Betamcherla, Nandyal / Kurnool District, Andhra Pradesh",
            },
            {
                "name": "Sri City Precision Components Pvt Ltd",
                "rating": Decimal("4.85"),
                "reliability_score": Decimal("98.00"),
                "delivery_score": Decimal("97.00"),
                "quality_score": Decimal("99.00"),
                "payment_terms": "Net 60",
                "risk_score": Decimal("4.00"),
                "negotiation_style": "High-Precision OEM Partner",
                "min_order_qty": 500,
                "lead_time_days": 6,
                "location": "Sri City SEZ, Tirupati District, Andhra Pradesh",
            },
            {
                "name": "Krishna-Godavari Packaging & Corrugated Hub",
                "rating": Decimal("4.35"),
                "reliability_score": Decimal("89.00"),
                "delivery_score": Decimal("91.00"),
                "quality_score": Decimal("87.00"),
                "payment_terms": "Net 30",
                "risk_score": Decimal("14.00"),
                "negotiation_style": "Bulk Packaging Supplier",
                "min_order_qty": 300,
                "lead_time_days": 3,
                "location": "Autonagar, Vijayawada, Andhra Pradesh",
            },
        ]

        supplier_map = {}
        for s_data in ap_suppliers_data:
            stmt_s = select(Supplier).where(Supplier.organization_id == org_id, Supplier.name == s_data["name"])
            existing_s = (await db.execute(stmt_s)).scalar_one_or_none()
            if not existing_s:
                s = Supplier(organization_id=org_id, **s_data)
                db.add(s)
                await db.flush()
                supplier_map[s_data["name"]] = s
            else:
                for k, v in s_data.items():
                    setattr(existing_s, k, v)
                supplier_map[s_data["name"]] = existing_s

        # 3. Authentic Rayalaseema & Andhra Pradesh Local Commodities & Products
        ap_products_data = [
            {
                "title": "Kurnool Sona Masoori Rice (Super Fine Raw - 25kg)",
                "description": "Aromatic, aged 12-month pure Sona Masoori raw rice grown in the Tungabhadra river basin, Kurnool APMC grade.",
                "category": "Agro Commodities",
                "sku": "KRN-RICE-SONA-25",
                "selling_price": Decimal("1650.00"),
                "cost_price": Decimal("1280.00"),
                "current_stock": 42,
                "reorder_point": 120,
                "safety_stock": 60,
                "suggested_reorder_qty": 350,
                "stockout_risk_level": "CRITICAL",
                "avg_daily_sales": 28,
                "image_url": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80",
                "quotes": [
                    ("Rayalaseema Agro Commodities Pvt Ltd", Decimal("1210.00"), Decimal("20.00"), 3, "Net 30"),
                    ("Tungabhadra Mills & Cold Storage", Decimal("1240.00"), Decimal("15.00"), 4, "Net 15"),
                ],
            },
            {
                "title": "Guntur Teja Red Chilli (Export Grade Stemless - 10kg)",
                "description": "High pungency (SHU 75,000+) sun-dried premium stemless red chilli sourced directly from Guntur APMC Yard.",
                "category": "Spices & Condiments",
                "sku": "GNT-CHILLI-TEJA-10",
                "selling_price": Decimal("2450.00"),
                "cost_price": Decimal("1820.00"),
                "current_stock": 35,
                "reorder_point": 90,
                "safety_stock": 45,
                "suggested_reorder_qty": 200,
                "stockout_risk_level": "HIGH",
                "avg_daily_sales": 18,
                "image_url": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80",
                "quotes": [
                    ("Guntur Mirchi Yard Traders Consortium", Decimal("1740.00"), Decimal("30.00"), 2, "Net 30"),
                    ("Penna Spices & Processing Corp", Decimal("1790.00"), Decimal("25.00"), 4, "Net 15"),
                ],
            },
            {
                "title": "Kadiri Lepakshi Groundnut Oil (Cold-Pressed Wood Churn - 15L Tin)",
                "description": "100% pure cold-pressed unrefined groundnut oil extracted from Grade-1 Kadiri-6 groundnut pods in Anantapur district.",
                "category": "Edible Oils",
                "sku": "ATP-OIL-KADIRI-15L",
                "selling_price": Decimal("3200.00"),
                "cost_price": Decimal("2550.00"),
                "current_stock": 16,
                "reorder_point": 50,
                "safety_stock": 25,
                "suggested_reorder_qty": 140,
                "stockout_risk_level": "CRITICAL",
                "avg_daily_sales": 14,
                "image_url": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80",
                "quotes": [
                    ("Sri Sathya Sai Oilseeds & Agro Tech", Decimal("2420.00"), Decimal("40.00"), 5, "Net 30"),
                    ("Rayalaseema Agro Commodities Pvt Ltd", Decimal("2490.00"), Decimal("30.00"), 3, "Net 30"),
                ],
            },
            {
                "title": "Kadapa Batavian Sathgudi Sweet Oranges (Grade A - 20kg Crate)",
                "description": "Juicy, high brix content Sathgudi citrus fruits freshly harvested from orchards across YSR Kadapa and Pulivendula.",
                "category": "Fresh Produce",
                "sku": "KDP-ORANGE-SATH-20",
                "selling_price": Decimal("1400.00"),
                "cost_price": Decimal("980.00"),
                "current_stock": 65,
                "reorder_point": 40,
                "safety_stock": 20,
                "suggested_reorder_qty": 120,
                "stockout_risk_level": "LOW",
                "avg_daily_sales": 22,
                "image_url": "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=600&auto=format&fit=crop&q=80",
                "quotes": [
                    ("Penna Spices & Processing Corp", Decimal("920.00"), Decimal("25.00"), 3, "Net 15"),
                    ("Tirumala Agri-Logistics & Warehousing", Decimal("950.00"), Decimal("15.00"), 2, "Net 45"),
                ],
            },
            {
                "title": "Chittoor Totapuri Mango Pulp (Aseptic Canned Puree - 3.1kg Can)",
                "description": "Processed pasteurized Totapuri mango puree with 14% TSS minimum, ready for beverage and commercial bakery supply.",
                "category": "Processed Foods",
                "sku": "CTR-MANGO-TOTA-3K",
                "selling_price": Decimal("480.00"),
                "cost_price": Decimal("320.00"),
                "current_stock": 140,
                "reorder_point": 80,
                "safety_stock": 40,
                "suggested_reorder_qty": 300,
                "stockout_risk_level": "LOW",
                "avg_daily_sales": 25,
                "image_url": "https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80",
                "quotes": [
                    ("Chittoor Fruit Processing & Puree Ltd", Decimal("295.00"), Decimal("10.00"), 5, "Net 30"),
                    ("Tirumala Agri-Logistics & Warehousing", Decimal("310.00"), Decimal("8.00"), 2, "Net 45"),
                ],
            },
            {
                "title": "Betamcherla Natural Polished Cuddapah Black Stone Slabs (Sq Ft)",
                "description": "High density, weather-resistant natural limestone paving slabs extracted from Betamcherla quarries in Rayalaseema.",
                "category": "Building Materials",
                "sku": "BTC-STONE-BLK-SQFT",
                "selling_price": Decimal("85.00"),
                "cost_price": Decimal("52.00"),
                "current_stock": 850,
                "reorder_point": 500,
                "safety_stock": 250,
                "suggested_reorder_qty": 1500,
                "stockout_risk_level": "LOW",
                "avg_daily_sales": 70,
                "image_url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80",
                "quotes": [
                    ("Betamcherla Natural Stone & Slabs Works", Decimal("48.00"), Decimal("3.00"), 7, "Advance 20%"),
                ],
            },
            {
                "title": "Sri City Precision M10 High-Tensile Flange Fasteners (Pack of 500)",
                "description": "Grade 10.9 zinc-nickel plated automotive grade fasteners manufactured under IATF 16949 certification in Sri City SEZ.",
                "category": "Industrial Hardware",
                "sku": "SRC-FAST-M10-500",
                "selling_price": Decimal("4850.00"),
                "cost_price": Decimal("3400.00"),
                "current_stock": 24,
                "reorder_point": 60,
                "safety_stock": 30,
                "suggested_reorder_qty": 100,
                "stockout_risk_level": "HIGH",
                "avg_daily_sales": 8,
                "image_url": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80",
                "quotes": [
                    ("Sri City Precision Components Pvt Ltd", Decimal("3250.00"), Decimal("50.00"), 6, "Net 60"),
                ],
            },
            {
                "title": "Tirupati Agro-Herbal Extracts (Licensed Amla & Ashwagandha 10kg)",
                "description": "Standardized herbal botanical active extract certified by AP AYUSH Board, vacuum-sealed in food-grade drums.",
                "category": "Healthcare & Pharma",
                "sku": "TRP-HERB-EXT-10K",
                "selling_price": Decimal("8900.00"),
                "cost_price": Decimal("6400.00"),
                "current_stock": 8,
                "reorder_point": 20,
                "safety_stock": 10,
                "suggested_reorder_qty": 40,
                "stockout_risk_level": "CRITICAL",
                "avg_daily_sales": 3,
                "image_url": "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&auto=format&fit=crop&q=80",
                "quotes": [
                    ("Tirumala Agri-Logistics & Warehousing", Decimal("6100.00"), Decimal("80.00"), 2, "Net 45"),
                    ("Rayalaseema Agro Commodities Pvt Ltd", Decimal("6250.00"), Decimal("60.00"), 3, "Net 30"),
                ],
            },
            {
                "title": "Rayalaseema Pulivendula Grand Naine Bananas (Export Grade 13kg Box)",
                "description": "Tissue-cultured Cavendish banana hands from Pulivendula agro-cluster, uniform calibration, cold-chain conditioned.",
                "category": "Fresh Produce",
                "sku": "PLV-BANANA-G9-13K",
                "selling_price": Decimal("650.00"),
                "cost_price": Decimal("440.00"),
                "current_stock": 110,
                "reorder_point": 80,
                "safety_stock": 40,
                "suggested_reorder_qty": 250,
                "stockout_risk_level": "LOW",
                "avg_daily_sales": 35,
                "image_url": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80",
                "quotes": [
                    ("Penna Spices & Processing Corp", Decimal("410.00"), Decimal("15.00"), 3, "Net 15"),
                    ("Tirumala Agri-Logistics & Warehousing", Decimal("425.00"), Decimal("10.00"), 2, "Net 45"),
                ],
            },
            {
                "title": "Heavy-Duty 5-Ply Corrugated Shipping Boxes (Vijayawada Hub - Pack of 100)",
                "description": "High burst factor Kraft corrugated outer cartons designed for regional agro and hardware logistics dispatch across AP.",
                "category": "Packaging & Shipping",
                "sku": "VJW-BOX-5PLY-100",
                "selling_price": Decimal("2800.00"),
                "cost_price": Decimal("1950.00"),
                "current_stock": 45,
                "reorder_point": 75,
                "safety_stock": 35,
                "suggested_reorder_qty": 200,
                "stockout_risk_level": "HIGH",
                "avg_daily_sales": 15,
                "image_url": "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80",
                "quotes": [
                    ("Krishna-Godavari Packaging & Corrugated Hub", Decimal("1850.00"), Decimal("40.00"), 3, "Net 30"),
                ],
            },
        ]

        today = date.today()

        for p_data in ap_products_data:
            stmt_p = select(Product).where(Product.organization_id == org_id, Product.sku == p_data["sku"])
            product = (await db.execute(stmt_p)).scalar_one_or_none()

            if not product:
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
            else:
                product.title = p_data["title"]
                product.description = p_data["description"]
                product.selling_price = p_data["selling_price"]
                product.cost_price = p_data["cost_price"]

            prod_id = product.id

            # Image
            stmt_img = select(ProductImage).where(ProductImage.product_id == prod_id)
            if not (await db.execute(stmt_img)).first():
                img = ProductImage(
                    product_id=prod_id,
                    original_url=p_data["image_url"],
                    primary_path=f"/storage/products/{p_data['sku'].lower()}.jpg",
                    thumbnail_path=f"/storage/thumbnails/{p_data['sku'].lower()}_thumb.jpg",
                    is_primary=True,
                )
                db.add(img)

            # Inventory
            stmt_inv = select(Inventory).where(Inventory.product_id == prod_id)
            inv = (await db.execute(stmt_inv)).scalar_one_or_none()
            if not inv:
                inv = Inventory(
                    organization_id=org_id,
                    product_id=prod_id,
                    current_stock=p_data["current_stock"],
                    reserved_stock=4,
                    expected_inbound=0,
                    reorder_point=p_data["reorder_point"],
                    safety_stock=p_data["safety_stock"],
                    suggested_reorder_qty=p_data["suggested_reorder_qty"],
                    days_of_inventory=Decimal(str(round(p_data["current_stock"] / p_data["avg_daily_sales"], 1))),
                    stockout_risk_level=p_data["stockout_risk_level"],
                )
                db.add(inv)
            else:
                inv.current_stock = p_data["current_stock"]
                inv.reorder_point = p_data["reorder_point"]
                inv.safety_stock = p_data["safety_stock"]
                inv.suggested_reorder_qty = p_data["suggested_reorder_qty"]
                inv.days_of_inventory = Decimal(str(round(p_data["current_stock"] / p_data["avg_daily_sales"], 1)))
                inv.stockout_risk_level = p_data["stockout_risk_level"]

            # 30-day historical sales
            stmt_sh = select(SalesHistory).where(SalesHistory.product_id == prod_id)
            if not (await db.execute(stmt_sh)).first():
                for day_offset in range(30, 0, -1):
                    s_date = today - timedelta(days=day_offset)
                    base_rate = p_data["avg_daily_sales"]
                    sold = max(2, base_rate + ((day_offset * 7) % 9) - 4)
                    rev = Decimal(str(sold)) * p_data["selling_price"]
                    sales_entry = SalesHistory(
                        organization_id=org_id,
                        product_id=prod_id,
                        date=s_date,
                        units_sold=sold,
                        unit_price=p_data["selling_price"],
                        total_revenue=rev,
                        channel="rayalaseema-apmc-direct",
                    )
                    db.add(sales_entry)

            # Quotes & Supplier links
            primary_supplier = None
            primary_quote_price = None
            for supp_name, unit_q, ship_q, lead_t, p_terms in p_data["quotes"]:
                supplier = supplier_map.get(supp_name)
                if supplier:
                    if primary_supplier is None:
                        primary_supplier = supplier
                        primary_quote_price = unit_q

                    stmt_sp = select(SupplierProduct).where(
                        SupplierProduct.supplier_id == supplier.id,
                        SupplierProduct.product_id == prod_id,
                    )
                    if not (await db.execute(stmt_sp)).first():
                        sp_link = SupplierProduct(
                            supplier_id=supplier.id,
                            product_id=prod_id,
                            supplier_sku=f"{p_data['sku']}-{supplier.name[:3].upper()}",
                            base_price=unit_q,
                            min_order_qty=supplier.min_order_qty,
                            lead_time_days=lead_t,
                            is_preferred=(supplier.rating >= Decimal("4.5")),
                        )
                        db.add(sp_link)

                    stmt_q = select(SupplierQuote).where(
                        SupplierQuote.supplier_id == supplier.id,
                        SupplierQuote.product_id == prod_id,
                    )
                    if not (await db.execute(stmt_q)).first():
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

            # Create realistic Opportunities and Negotiations for Critical & High risk items
            if p_data["stockout_risk_level"] in ["CRITICAL", "HIGH"] and primary_supplier:
                stmt_opp = select(ProcurementOpportunity).where(
                    ProcurementOpportunity.product_id == prod_id,
                    ProcurementOpportunity.status == "OPEN",
                )
                if not (await db.execute(stmt_opp)).first():
                    exp_cost = primary_quote_price * Decimal(str(p_data["suggested_reorder_qty"]))
                    exp_rev = p_data["selling_price"] * Decimal(str(p_data["suggested_reorder_qty"]))
                    exp_margin = ((exp_rev - exp_cost) / exp_rev) * Decimal("100.00") if exp_rev > 0 else Decimal("25.00")
                    savings = (p_data["cost_price"] - primary_quote_price) * Decimal(str(p_data["suggested_reorder_qty"]))

                    opp = ProcurementOpportunity(
                        organization_id=org_id,
                        product_id=prod_id,
                        urgency=p_data["stockout_risk_level"],
                        current_stock=p_data["current_stock"],
                        days_of_coverage=Decimal(str(round(p_data["current_stock"] / p_data["avg_daily_sales"], 1))),
                        predicted_demand=p_data["avg_daily_sales"] * 14,
                        recommended_quantity=p_data["suggested_reorder_qty"],
                        recommended_supplier_id=primary_supplier.id,
                        expected_unit_cost=primary_quote_price,
                        expected_total_cost=exp_cost,
                        expected_margin=round(exp_margin, 2),
                        expected_savings=max(Decimal("0.00"), round(savings, 2)),
                        risk_score=primary_supplier.risk_score,
                        policy_result="ALLOWED",
                        recommended_action="NEGOTIATE_AND_ORDER",
                        status="OPEN",
                    )
                    db.add(opp)

        # 4. Create Active Rayalaseema Negotiations with realistic messages
        kurnool_rice = (await db.execute(select(Product).where(Product.sku == "KRN-RICE-SONA-25"))).scalar_one_or_none()
        rayalaseema_agro = supplier_map.get("Rayalaseema Agro Commodities Pvt Ltd")
        if kurnool_rice and rayalaseema_agro:
            stmt_neg = select(Negotiation).where(
                Negotiation.product_id == kurnool_rice.id,
                Negotiation.supplier_id == rayalaseema_agro.id,
            )
            if not (await db.execute(stmt_neg)).first():
                neg = Negotiation(
                    organization_id=org_id,
                    product_id=kurnool_rice.id,
                    supplier_id=rayalaseema_agro.id,
                    target_price=Decimal("1160.00"),
                    initial_quote=Decimal("1210.00"),
                    final_price=Decimal("1175.00"),
                    quantity=350,
                    rounds_completed=2,
                    max_rounds=4,
                    status="IN_PROGRESS",
                    strategy="Rayalaseema APMC Volume Contract (350 Bags)",
                    expected_margin=Decimal("28.78"),
                    expected_savings=Decimal("12250.00"),
                )
                db.add(neg)
                await db.flush()

                m1 = NegotiationMessage(
                    negotiation_id=neg.id,
                    round_number=1,
                    sender="BUYER_AI",
                    offer_price=Decimal("1150.00"),
                    shipping_cost=Decimal("0.00"),
                    payment_terms="Net 30",
                    message_text="Greetings from Vendo AI Procurement Hub. For Kurnool Sona Masoori 25kg (350 bags delivery to Kurnool NH-44 Hub), our AI model targets ₹1,150/bag with direct freight pickup.",
                    supplier_counter_price=Decimal("1190.00"),
                    supplier_response_text="Namaste Rohan garu. Current Kurnool mandi procurement index is high due to harvest arrival timing. Best we can counter is ₹1,190/bag with subsidized loading.",
                )
                db.add(m1)

                m2 = NegotiationMessage(
                    negotiation_id=neg.id,
                    round_number=2,
                    sender="BUYER_AI",
                    offer_price=Decimal("1175.00"),
                    shipping_cost=Decimal("0.00"),
                    payment_terms="Net 15 Early Settlement",
                    message_text="We appreciate the regional quality assurance. We can commit to ₹1,175/bag backed by automated Net-15 escrow settlement for 350 bags.",
                    supplier_counter_price=Decimal("1175.00"),
                    supplier_response_text="Agreed ₹1,175/bag for 350 bags. Ready for dispatch from Kurnool Industrial Estate warehouse upon PO generation.",
                )
                db.add(m2)

        # 5. Create Pending Approvals for Manager
        guntur_chilli = (await db.execute(select(Product).where(Product.sku == "GNT-CHILLI-TEJA-10"))).scalar_one_or_none()
        guntur_supp = supplier_map.get("Guntur Mirchi Yard Traders Consortium")
        if guntur_chilli and guntur_supp:
            stmt_app = select(Approval).where(Approval.entity_type == "PURCHASE_ORDER", Approval.reason.like("%Guntur%"))
            if not (await db.execute(stmt_app)).first():
                appr = Approval(
                    organization_id=org_id,
                    entity_type="PURCHASE_ORDER",
                    entity_id=f"PO-AP-GNT-{uuid.uuid4().hex[:6].upper()}",
                    requested_by_id=user_map.get("buyer@vendo.ai").id if user_map.get("buyer@vendo.ai") else None,
                    requested_action="APPROVE_HIGH_VALUE_PROCUREMENT",
                    amount=Decimal("348000.00"),
                    expected_margin=Decimal("28.98"),
                    risk_score=Decimal("6.00"),
                    reason="Bulk Sourcing: 200 bags of Guntur Teja Stemless Chilli for Rayalaseema-AP retail distribution. Amount ₹3,48,000 exceeds Buyer single-order auto-threshold (₹50,000).",
                    policy_violations={"threshold_exceeded": "Order value ₹3,48,000 > ₹50,000 auto-limit. Requires Manager sign-off."},
                    status="PENDING",
                    comments="Urgent procurement required before export market price spike.",
                )
                db.add(appr)

        # 6. Notifications
        stmt_notif = select(Notification).where(Notification.organization_id == org_id, Notification.title.like("%Rayalaseema%"))
        if not (await db.execute(stmt_notif)).first():
            n1 = Notification(
                organization_id=org_id,
                type="STOCKOUT_RISK",
                title="Rayalaseema Hub Alert: Kurnool Sona Masoori Rice Critical",
                message="Stock down to 42 units at Kurnool Warehouse (1.5 days coverage). Auto-negotiation completed at ₹1,175/bag.",
                link="/opportunities",
                is_read=False,
            )
            db.add(n1)
            n2 = Notification(
                organization_id=org_id,
                type="APPROVAL_REQUIRED",
                title="Manager Action Required: Guntur Mirchi PO Authorization",
                message="Priya Patel garu, Purchase Order ₹3,48,000 awaits managerial sign-off.",
                link="/approvals",
                is_read=False,
            )
            db.add(n2)

        await db.commit()
        print("[OK] Successfully seeded authentic Rayalaseema & Andhra Pradesh procurement data!")


if __name__ == "__main__":
    asyncio.run(seed_rayalaseema_ap_data())
