// Client-side fallback dataset when FastAPI backend is waking up from idle on Render free tier

export const FALLBACK_DASHBOARD = {
  inventory_value: {
    label: "Inventory Value",
    value: "₹384,500",
    numeric_value: "384500.00",
    change_pct: "4.2",
    trend: "up",
    description: "Across active catalog SKU base",
  },
  products_at_risk: {
    label: "Products At Risk",
    value: "2",
    numeric_value: "2",
    change_pct: "-12.5",
    trend: "down",
    description: "Stockout risk within 7 days",
  },
  procurement_spend: {
    label: "Procurement Spend",
    value: "₹165,750",
    numeric_value: "165750.00",
    change_pct: "8.1",
    trend: "up",
    description: "Committed PO volume this month",
  },
  ai_savings: {
    label: "AI Savings",
    value: "₹11,250",
    numeric_value: "11250.00",
    change_pct: "15.4",
    trend: "up",
    description: "Secured via multi-round negotiation",
  },
  average_margin: {
    label: "Average Margin",
    value: "42.5%",
    numeric_value: "42.50",
    change_pct: "2.3",
    trend: "up",
    description: "Gross margin across inventory",
  },
  active_negotiations: {
    label: "Active Negotiations",
    value: "1",
    numeric_value: "1",
    change_pct: "0.0",
    trend: "neutral",
    description: "Autonomous rounds currently active",
  },
  pending_approvals: {
    label: "Pending Approvals",
    value: "1",
    numeric_value: "1",
    change_pct: "0.0",
    trend: "neutral",
    description: "Orders awaiting management sign-off",
  },
  revenue_protected: {
    label: "Revenue Protected",
    value: "₹299,850",
    numeric_value: "299850",
    change_pct: "18.2",
    trend: "up",
    description: "Estimated stockout revenue saved",
  },
  forecast_accuracy: {
    label: "Forecast Accuracy",
    value: "94.2%",
    numeric_value: "94.2",
    change_pct: "1.8",
    trend: "up",
    description: "30-day baseline precision",
  },
  supplier_reliability: {
    label: "Supplier Reliability",
    value: "85.4%",
    numeric_value: "85.40",
    change_pct: "3.1",
    trend: "up",
    description: "Weighted fulfillment reliability index",
  },
};

export const FALLBACK_CHARTS = {
  spend_trend: [
    { month: "Apr", spend: 120000, budget: 1500000 },
    { month: "May", spend: 185000, budget: 1500000 },
    { month: "Jun", spend: 140000, budget: 1500000 },
    { month: "Jul", spend: 210000, budget: 1500000 },
    { month: "Aug", spend: 195000, budget: 1500000 },
    { month: "Sep", spend: 165750.0, budget: 1500000 },
  ],
  savings_trend: [
    { month: "Apr", savings: 8200 },
    { month: "May", savings: 14500 },
    { month: "Jun", savings: 9800 },
    { month: "Jul", savings: 18200 },
    { month: "Aug", savings: 15600 },
    { month: "Sep", savings: 11250.0 },
  ],
  inventory_risk_distribution: [
    { name: "Critical", value: 1, color: "#ef4444" },
    { name: "High", value: 1, color: "#f97316" },
    { name: "Medium", value: 1, color: "#eab308" },
    { name: "Low / Safe", value: 3, color: "#22c55e" },
  ],
  demand_forecast_chart: [
    { day: "Day 1-5", predicted: 60, actual: 58 },
    { day: "Day 6-10", predicted: 65, actual: 63 },
    { day: "Day 11-15", predicted: 70, actual: 68 },
    { day: "Day 16-20", predicted: 55, actual: 57 },
    { day: "Day 21-25", predicted: 62, actual: null },
    { day: "Day 26-30", predicted: 68, actual: null },
  ],
  supplier_performance_comparison: [
    { name: "Rayalaseema Agro", reliability: 94, cost: 92, delivery: 92, composite: 93.8 },
    { name: "Guntur Mirchi Yard", reliability: 96, cost: 95, delivery: 95, composite: 96.4 },
    { name: "Tungabhadra Mills", reliability: 90, cost: 88, delivery: 88, composite: 89.5 },
    { name: "Tirumala Logistics", reliability: 95, cost: 93, delivery: 96, composite: 94.7 },
  ],
  top_opportunities: [],
  recent_activity: [],
};

export const FALLBACK_PRODUCTS = [
  {
    id: "aa010000-0000-0000-0000-000000000001",
    title: "Kurnool BPT 5204 Sona Masoori Rice (25kg Bag)",
    description: "Premium aged raw rice sourced from Tungabhadra basin mandis across Kurnool district.",
    category: "Agro Commodities",
    sku: "KRN-RICE-BPT-25KG",
    selling_price: 1550.0,
    cost_price: 1220.0,
    currency: "INR",
    current_stock: 18,
    stockout_risk_level: "CRITICAL",
    days_of_inventory: 1.5,
    images: [{ id: "img-1", original_url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80", is_primary: true }],
  },
  {
    id: "aa020000-0000-0000-0000-000000000002",
    title: "Guntur Teja Red Chilli S17 (Grade A Stemless, 10kg Bag)",
    description: "Export-grade hot chilli sourced directly from Asia's largest yard at APMC Guntur.",
    category: "Spices & Seasonings",
    sku: "GNT-CHILLI-S17-10K",
    selling_price: 2600.0,
    cost_price: 1980.0,
    currency: "INR",
    current_stock: 12,
    stockout_risk_level: "HIGH",
    days_of_inventory: 2.4,
    images: [{ id: "img-2", original_url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80", is_primary: true }],
  },
  {
    id: "aa030000-0000-0000-0000-000000000003",
    title: "Anantapur Cold-Pressed Groundnut Oil (15L Tin)",
    description: "Traditional cold-pressed unfiltered peanut oil extracted from Kadiri-6 groundnut pods.",
    category: "Edible Oils",
    sku: "ATP-GNOIL-15LTIN",
    selling_price: 2950.0,
    cost_price: 2380.0,
    currency: "INR",
    current_stock: 45,
    stockout_risk_level: "MEDIUM",
    days_of_inventory: 9.0,
    images: [{ id: "img-3", original_url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80", is_primary: true }],
  },
  {
    id: "aa040000-0000-0000-0000-000000000004",
    title: "Kadapa Turmeric Finger (Curcumin 4.5%, 25kg Gunny Bag)",
    description: "High-curcumin unpolished whole turmeric rhizomes harvested from irrigated black soil tracts.",
    category: "Spices & Seasonings",
    sku: "KDP-TURM-FNG-25K",
    selling_price: 3400.0,
    cost_price: 2650.0,
    currency: "INR",
    current_stock: 85,
    stockout_risk_level: "LOW",
    days_of_inventory: 17.0,
    images: [{ id: "img-4", original_url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80", is_primary: true }],
  },
];

export const FALLBACK_INVENTORY = FALLBACK_PRODUCTS.map((p, idx) => ({
  id: `inv-${idx + 1}`,
  product_id: p.id,
  current_stock: p.current_stock,
  reserved_stock: 5,
  expected_inbound: idx === 0 ? 150 : 0,
  reorder_point: idx < 2 ? 40 : 25,
  safety_stock: idx < 2 ? 20 : 15,
  suggested_reorder_qty: idx < 2 ? 150 : 50,
  days_of_inventory: p.days_of_inventory,
  stockout_risk_level: p.stockout_risk_level,
  last_checked_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  product: p,
}));

export const FALLBACK_SUPPLIERS = [
  {
    id: "bb010000-0000-0000-0000-000000000001",
    name: "Rayalaseema Agro Commodities Pvt Ltd",
    rating: 4.6,
    reliability_score: 94.0,
    delivery_score: 92.0,
    quality_score: 96.0,
    payment_terms: "Net 30",
    risk_score: 8.0,
    negotiation_style: "Reliable Mandi Partner",
    min_order_qty: 100,
    lead_time_days: 3,
    location: "Kurnool Industrial Estate, Andhra Pradesh",
    is_active: true,
    procurement_score: 93.8,
  },
  {
    id: "bb020000-0000-0000-0000-000000000002",
    name: "Guntur Mirchi Yard Traders Consortium",
    rating: 4.8,
    reliability_score: 96.0,
    delivery_score: 95.0,
    quality_score: 98.0,
    payment_terms: "Net 30",
    risk_score: 6.0,
    negotiation_style: "Premium Spice Supplier",
    min_order_qty: 50,
    lead_time_days: 2,
    location: "APMC Mirchi Yard, Guntur, Andhra Pradesh",
    is_active: true,
    procurement_score: 96.4,
  },
  {
    id: "bb030000-0000-0000-0000-000000000003",
    name: "Tungabhadra Mills & Cold Storage",
    rating: 4.4,
    reliability_score: 90.0,
    delivery_score: 88.0,
    quality_score: 92.0,
    payment_terms: "Net 15",
    risk_score: 12.0,
    negotiation_style: "Volume Grain Supplier",
    min_order_qty: 200,
    lead_time_days: 4,
    location: "Yemmiganur, Kurnool District, Andhra Pradesh",
    is_active: true,
    procurement_score: 89.5,
  },
];

export const FALLBACK_OPPORTUNITIES = [
  {
    id: "dd010000-0000-0000-0000-000000000001",
    product_id: FALLBACK_PRODUCTS[0].id,
    urgency: "CRITICAL",
    current_stock: 18,
    days_of_coverage: 1.5,
    predicted_demand: 150,
    recommended_quantity: 150,
    recommended_supplier_id: FALLBACK_SUPPLIERS[0].id,
    expected_unit_cost: 1105.0,
    expected_total_cost: 165750.0,
    expected_margin: 44.72,
    expected_savings: 11250.0,
    risk_score: 8.0,
    policy_result: "ALLOWED",
    recommended_action: "Execute Autonomous APMC Negotiation with Rayalaseema Agro",
    status: "IDENTIFIED",
    created_at: new Date().toISOString(),
    product: FALLBACK_PRODUCTS[0],
    recommended_supplier: FALLBACK_SUPPLIERS[0],
  },
];

export const FALLBACK_APPROVALS = [
  {
    id: "ee010000-0000-0000-0000-000000000001",
    entity_type: "PURCHASE_ORDER",
    entity_id: "VAI-PO-2026-1048",
    requested_action: "Autonomous Reorder: 150 Bags Kurnool Sona Masoori Rice",
    amount: 165750.0,
    expected_margin: 44.72,
    risk_score: 8.0,
    reason: "Stockout risk imminent within 36 hours. Secured ₹11,250 AI negotiation savings below APMC market baseline.",
    status: "PENDING",
    created_at: new Date().toISOString(),
  },
];

export const FALLBACK_PURCHASE_ORDERS = [
  {
    id: "ff010000-0000-0000-0000-000000000001",
    po_number: "VAI-PO-2026-1048",
    supplier_id: FALLBACK_SUPPLIERS[0].id,
    subtotal: 165750.0,
    shipping_cost: 0.0,
    total_amount: 165750.0,
    currency: "INR",
    expected_delivery_date: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
    status: "CONFIRMED",
    payment_status: "CAPTURED",
    created_at: new Date().toISOString(),
    supplier: FALLBACK_SUPPLIERS[0],
    items: [
      {
        id: "item-1",
        product_id: FALLBACK_PRODUCTS[0].id,
        quantity: 150,
        unit_price: 1105.0,
        total_price: 165750.0,
        product: FALLBACK_PRODUCTS[0],
      },
    ],
    payments: [
      {
        id: "pay-1",
        amount: 165750.0,
        currency: "INR",
        provider: "ESCROW",
        transaction_id: "TXN-AP-ESCROW-998811",
        status: "COMPLETED",
        payment_method: "NEFT / RTGS Corporate Mandi Escrow",
      },
    ],
  },
];

export const FALLBACK_NEGOTIATIONS = [
  {
    id: "99010000-0000-0000-0000-000000000001",
    product_id: FALLBACK_PRODUCTS[0].id,
    supplier_id: FALLBACK_SUPPLIERS[0].id,
    target_price: 1100.0,
    initial_quote: 1180.0,
    quantity: 150,
    max_rounds: 4,
    strategy: "Volume Discount & Free Freight (NH-44 Corridor)",
    final_price: 1105.0,
    rounds_completed: 3,
    status: "COMPLETED",
    expected_margin: 44.72,
    expected_savings: 11250.0,
    created_at: new Date().toISOString(),
    product: FALLBACK_PRODUCTS[0],
    supplier: FALLBACK_SUPPLIERS[0],
    messages: [
      {
        id: "msg-1",
        round_number: 1,
        sender: "BUYER_AI",
        offer_price: 1090.0,
        shipping_cost: 0.0,
        payment_terms: "Net 30",
        message_text: "We require 150 bags of Kurnool BPT Sona Masoori. Considering spot mandi rates in Kurnool APMC, we propose ₹1,090/bag with freight included.",
        supplier_counter_price: 1140.0,
        supplier_response_text: "Spot arrival costs are elevated. We can offer ₹1,140/bag for prompt dispatch.",
      },
      {
        id: "msg-2",
        round_number: 2,
        sender: "BUYER_AI",
        offer_price: 1100.0,
        shipping_cost: 0.0,
        payment_terms: "Net 30",
        message_text: "We can increase to ₹1,100/bag with guaranteed 24-hr payment clearance upon receipt at Kurnool hub.",
        supplier_counter_price: 1110.0,
        supplier_response_text: "Meet us halfway at ₹1,110 and we waive loading cess charges.",
      },
      {
        id: "msg-3",
        round_number: 3,
        sender: "BUYER_AI",
        offer_price: 1105.0,
        shipping_cost: 0.0,
        payment_terms: "Net 30",
        message_text: "Final confirmation at ₹1,105/bag for full 150-bag lot. Purchase Order issued immediately.",
        supplier_counter_price: 1105.0,
        supplier_response_text: "Agreed at ₹1,105/bag. Dispatch initiated via NH-44 terminal.",
      },
    ],
  },
];

export const FALLBACK_ANALYTICS = {
  total_procurement_spend: 165750.0,
  total_ai_savings: 11250.0,
  average_gross_margin: 44.7,
  inventory_turnover_rate: 5.8,
  stockout_incident_count: 0,
  forecast_accuracy_pct: 94.2,
  supplier_average_reliability: 86.5,
  negotiation_success_rate: 91.7,
  approval_rate: 96.0,
  average_cycle_time_hours: 1.4,
  spend_by_category: [
    { category: "Agro Commodities", spend: 107737.5, percentage: 65 },
    { category: "Spices & Seasonings", spend: 33150.0, percentage: 20 },
    { category: "Edible Oils", spend: 24862.5, percentage: 15 },
  ],
  savings_by_supplier: [
    { supplier: "Rayalaseema Agro", savings: 11250, orders: 1 },
    { supplier: "Guntur Mirchi Yard", savings: 3500, orders: 1 },
    { supplier: "Tungabhadra Mills", savings: 2800, orders: 1 },
  ],
  monthly_spend_savings: [
    { month: "May", spend: 185000, savings: 14500 },
    { month: "Jun", spend: 140000, savings: 9800 },
    { month: "Jul", spend: 210000, savings: 18200 },
    { month: "Aug", spend: 195000, savings: 15600 },
    { month: "Sep", spend: 165750.0, savings: 11250.0 },
  ],
  negotiation_rounds_distribution: [
    { rounds: "1 Round", count: 2 },
    { rounds: "2 Rounds", count: 5 },
    { rounds: "3 Rounds", count: 3 },
    { rounds: "4 Rounds", count: 1 },
  ],
  margin_distribution: [
    { range: "25-35%", count: 2 },
    { range: "35-45%", count: 6 },
    { range: "45-55%", count: 3 },
    { range: ">55%", count: 1 },
  ],
};

export const FALLBACK_SETTINGS = {
  organization_name: "Acme Retail India (Rayalaseema Procurement Hub)",
  currency: "INR",
  ai_provider: "mock",
  minimum_margin: 0.25,
  target_margin: 0.35,
  auto_approval_limit: 50000,
  human_approval_limit: 200000,
  monthly_budget: 1500000,
  minimum_supplier_rating: 3.8,
  maximum_supplier_risk: 60,
  minimum_quotes: 2,
  max_negotiation_rounds: 4,
  auto_purchase_enabled: false,
  regional_default_hub: "Kurnool Central Agro-Terminal (NH-44)",
  ap_gstin_code: "37",
  apmc_mandi_cess_percent: 1.0,
  local_freight_tariff_per_ton_km: 4.5,
  negotiation_aggressiveness: "BALANCED",
  auto_counter_threshold: 0.05,
  enable_security_verification: true,
  whatsapp_supplier_dispatch: true,
  email_po_dispatch: true,
};

export const FALLBACK_DATA_HEALTH = {
  overall_status: "OPTIMAL",
  health_score: 100,
  total_checks: 5,
  passed_checks: 5,
  warning_checks: 0,
  failed_checks: 0,
  checks: [
    { category: "Catalog Integrity", check_name: "Duplicate SKU Detection", status: "PASSED", details: "0 duplicate SKUs found across catalog.", issue_count: 0 },
    { category: "Inventory Consistency", check_name: "Non-Negative Stock Constraints", status: "PASSED", details: "All inventory levels are non-negative.", issue_count: 0 },
    { category: "Pricing & Margins", check_name: "Positive Price Validation", status: "PASSED", details: "All products have positive selling prices.", issue_count: 0 },
    { category: "Supplier Network", check_name: "Supplier Quote Coverage", status: "PASSED", details: "All catalog products have competitive supplier quotes.", issue_count: 0 },
    { category: "Financial Compliance", check_name: "Currency Consistency (INR)", status: "PASSED", details: "100% monetary entries normalized to INR.", issue_count: 0 },
  ],
  metrics: {
    total_products: 4,
    total_suppliers: 3,
    total_sales_records: 120,
  },
};

export const FALLBACK_ACTIVITY = [
  {
    id: "act-1",
    event_type: "NEGOTIATION_SUCCESS",
    message: "AI secured ₹11,250 savings on Kurnool Sona Masoori Rice with Rayalaseema Agro Commodities.",
    details: { po_number: "VAI-PO-2026-1048", margin: "44.72%" },
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
  },
  {
    id: "act-2",
    event_type: "STOCKOUT_ALERT",
    message: "Critical stockout warning: Guntur Teja Chilli S17 down to 12 bags (2.4 days coverage).",
    details: { sku: "GNT-CHILLI-S17-10K", stock: 12 },
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
  },
];

export const FALLBACK_NOTIFICATIONS = [
  {
    id: "notif-1",
    type: "APPROVAL",
    title: "PO VAI-PO-2026-1048 Awaiting Sign-Off",
    message: "Procurement order for ₹1,65,750 requires management sign-off for Andhra Pradesh agro fulfillment.",
    link: "/approvals",
    is_read: false,
    created_at: new Date(Date.now() - 60 * 60000).toISOString(),
  },
  {
    id: "notif-2",
    type: "MARKET_INTEL",
    title: "APMC Mandi Price Update",
    message: "Guntur Mirchi Yard prices rose +4.2% today. Recommended early lock-in on S17 grade.",
    link: "/products",
    is_read: true,
    created_at: new Date(Date.now() - 300 * 60000).toISOString(),
  },
];

export const FALLBACK_FORECASTS = FALLBACK_PRODUCTS.map((p) => ({
  product_id: p.id,
  product_title: p.title,
  sku: p.sku,
  forecast_period: "30d",
  predicted_demand: Math.round(Math.random() * 50 + 30),
  confidence: 0.94,
  trend: "stable",
}));

export const FALLBACK_AGENTS = [
  { id: "agent-demand", name: "Demand Forecasting Agent", status: "idle", last_run: new Date(Date.now() - 3600000).toISOString(), accuracy: 94.2 },
  { id: "agent-negotiate", name: "Negotiation Agent", status: "idle", last_run: new Date(Date.now() - 7200000).toISOString(), accuracy: 91.7 },
  { id: "agent-reorder", name: "Auto-Reorder Agent", status: "active", last_run: new Date(Date.now() - 1800000).toISOString(), accuracy: 96.0 },
  { id: "agent-market", name: "Market Intelligence Agent", status: "idle", last_run: new Date(Date.now() - 5400000).toISOString(), accuracy: 88.5 },
];

export function getFallbackData<T>(endpoint: string): T | null {
  const path = endpoint.split("?")[0];
  if (path === "/api/dashboard/stats") return FALLBACK_DASHBOARD as unknown as T;
  if (path === "/api/dashboard/charts") return FALLBACK_CHARTS as unknown as T;
  if (path === "/api/products" || path.startsWith("/api/products/")) return FALLBACK_PRODUCTS as unknown as T;
  if (path === "/api/inventory" || path === "/api/inventory/status") return FALLBACK_INVENTORY as unknown as T;
  if (path === "/api/suppliers" || path.startsWith("/api/suppliers/")) return FALLBACK_SUPPLIERS as unknown as T;
  if (path === "/api/opportunities") return FALLBACK_OPPORTUNITIES as unknown as T;
  if (path === "/api/approvals") return FALLBACK_APPROVALS as unknown as T;
  if (path === "/api/purchase-orders" || path.startsWith("/api/purchase-orders/")) return FALLBACK_PURCHASE_ORDERS as unknown as T;
  if (path === "/api/negotiations" || path.startsWith("/api/negotiations/")) return FALLBACK_NEGOTIATIONS as unknown as T;
  if (path === "/api/forecasts" || path.startsWith("/api/forecasts/")) return FALLBACK_FORECASTS as unknown as T;
  if (path === "/api/agents" || path === "/api/agents/status") return FALLBACK_AGENTS as unknown as T;
  if (path === "/api/analytics" || path.startsWith("/api/analytics")) return FALLBACK_ANALYTICS as unknown as T;
  if (path === "/api/settings") return FALLBACK_SETTINGS as unknown as T;
  if (path === "/api/data-health") return FALLBACK_DATA_HEALTH as unknown as T;
  if (path === "/api/activity") return FALLBACK_ACTIVITY as unknown as T;
  if (path === "/api/notifications") return FALLBACK_NOTIFICATIONS as unknown as T;
  if (path === "/api/auth/me") {
    return {
      id: "demo-user-1",
      email: "demo@vendo.ai",
      name: "Andhra Procurement Officer",
      role: "admin",
    } as unknown as T;
  }
  return null;
}
