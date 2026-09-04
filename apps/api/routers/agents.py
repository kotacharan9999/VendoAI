from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from apps.api.agents.supervisor import SupervisorAgent
from apps.api.database import get_db
from apps.api.models import AgentRun, Product, User
from apps.api.schemas.agent import AgentRunResponse, AgentTriggerRequest
from apps.api.services.auth import get_current_user

router = APIRouter(prefix="/agents", tags=["agents"])


@router.get("", response_model=list[AgentRunResponse])
async def list_agent_runs(
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(AgentRun)
        .options(selectinload(AgentRun.events))
        .where(AgentRun.organization_id == current_user.organization_id)
        .order_by(AgentRun.started_at.desc())
        .limit(limit)
    )
    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("/run", response_model=dict)
async def trigger_agent(
    data: AgentTriggerRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not data.product_id:
        stmt_p = select(Product).where(Product.organization_id == current_user.organization_id, Product.title.ilike("%Wireless Earbuds%"))
        res_p = await db.execute(stmt_p)
        product = res_p.scalar_one_or_none()
        if not product:
            stmt_p_any = select(Product).where(Product.organization_id == current_user.organization_id)
            product = (await db.execute(stmt_p_any)).scalar_one_or_none()
        if not product:
            raise HTTPException(status_code=400, detail="No products available to run agent against.")
        product_id = product.id
    else:
        product_id = data.product_id

    result_state = await SupervisorAgent.run_autonomous_procurement(
        db=db,
        organization_id=current_user.organization_id,
        product_id=product_id,
        trigger=f"MANUAL_API_{data.agent_name}",
    )
    return {
        "status": "success",
        "stage": result_state.get("stage"),
        "po_number": result_state.get("po_number"),
        "total_spend": result_state.get("total_spend"),
        "expected_savings": result_state.get("expected_savings"),
        "calculated_gross_margin": result_state.get("calculated_gross_margin"),
        "selected_supplier": result_state.get("selected_supplier_name"),
    }
