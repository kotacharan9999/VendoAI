import uuid

from langgraph.graph import END, StateGraph
from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.agents.demand_agent import run_demand_agent
from apps.api.agents.inventory_agent import run_inventory_agent
from apps.api.agents.margin_agent import run_margin_agent
from apps.api.agents.negotiation_agent import run_negotiation_agent
from apps.api.agents.procurement_agent import run_procurement_agent
from apps.api.agents.risk_agent import run_risk_agent
from apps.api.agents.state import ProcurementState
from apps.api.agents.supplier_agent import run_supplier_agent


def build_procurement_graph(db: AsyncSession, agent_run_id: uuid.UUID):
    workflow = StateGraph(ProcurementState)

    async def inventory_step(state: ProcurementState) -> ProcurementState:
        return await run_inventory_agent(state, db, agent_run_id)

    async def demand_step(state: ProcurementState) -> ProcurementState:
        return await run_demand_agent(state, db, agent_run_id)

    async def supplier_step(state: ProcurementState) -> ProcurementState:
        return await run_supplier_agent(state, db, agent_run_id)

    async def negotiation_step(state: ProcurementState) -> ProcurementState:
        return await run_negotiation_agent(state, db, agent_run_id)

    async def margin_step(state: ProcurementState) -> ProcurementState:
        return await run_margin_agent(state, db, agent_run_id)

    async def risk_step(state: ProcurementState) -> ProcurementState:
        return await run_risk_agent(state, db, agent_run_id)

    async def procurement_step(state: ProcurementState) -> ProcurementState:
        return await run_procurement_agent(state, db, agent_run_id)

    workflow.add_node("inventory", inventory_step)
    workflow.add_node("demand", demand_step)
    workflow.add_node("supplier", supplier_step)
    workflow.add_node("negotiation", negotiation_step)
    workflow.add_node("margin", margin_step)
    workflow.add_node("risk", risk_step)
    workflow.add_node("procurement", procurement_step)

    workflow.set_entry_point("inventory")
    workflow.add_edge("inventory", "demand")
    workflow.add_edge("demand", "supplier")
    workflow.add_edge("supplier", "negotiation")
    workflow.add_edge("negotiation", "margin")
    workflow.add_edge("margin", "risk")
    workflow.add_edge("risk", "procurement")
    workflow.add_edge("procurement", END)

    return workflow.compile()
