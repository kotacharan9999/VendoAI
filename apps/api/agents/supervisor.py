import time
import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.agents.graph import build_procurement_graph
from apps.api.agents.state import ProcurementState
from apps.api.audit.audit_service import AuditService
from apps.api.models.agent import AgentRun


class SupervisorAgent:
    @staticmethod
    async def run_autonomous_procurement(
        db: AsyncSession,
        organization_id: uuid.UUID,
        product_id: uuid.UUID,
        trigger: str = "MANUAL_CYCLE",
    ) -> ProcurementState:
        execution_id = f"EXEC-{uuid.uuid4().hex[:8].upper()}"
        start_time = time.time()

        agent_run = AgentRun(
            organization_id=organization_id,
            agent_name="SupervisorAgent",
            execution_id=execution_id,
            trigger=trigger,
            status="RUNNING",
            input_state={"product_id": str(product_id), "trigger": trigger},
            confidence_score=Decimal("0.950"),
            started_at=datetime.utcnow(),
        )
        db.add(agent_run)
        await db.flush()

        await AuditService.record_agent_event(
            db=db,
            organization_id=organization_id,
            agent_run_id=agent_run.id,
            event_type="AGENT_STARTED",
            message="Autonomous procurement workflow initiated by Supervisor Agent.",
            details={"execution_id": execution_id, "trigger": trigger},
        )

        initial_state: ProcurementState = {
            "organization_id": str(organization_id),
            "product_id": str(product_id),
            "execution_id": execution_id,
            "stage": "MONITOR",
            "events": [],
        }

        try:
            graph = build_procurement_graph(db=db, agent_run_id=agent_run.id)
            final_state = await graph.ainvoke(initial_state)

            duration_ms = int((time.time() - start_time) * 1000)
            agent_run.status = "COMPLETED"
            agent_run.output_state = {
                "po_number": final_state.get("po_number"),
                "total_spend": final_state.get("total_spend"),
                "expected_savings": final_state.get("expected_savings"),
                "gross_margin": final_state.get("calculated_gross_margin"),
                "selected_supplier": final_state.get("selected_supplier_name"),
                "policy_decision": final_state.get("policy_decision"),
            }
            agent_run.execution_duration_ms = duration_ms
            agent_run.completed_at = datetime.utcnow()

            await AuditService.record_agent_event(
                db=db,
                organization_id=organization_id,
                agent_run_id=agent_run.id,
                event_type="AGENT_COMPLETED",
                message=f"Autonomous procurement workflow completed in {duration_ms}ms.",
                details=agent_run.output_state,
            )

            await db.commit()
            return final_state

        except Exception as e:
            await db.rollback()
            duration_ms = int((time.time() - start_time) * 1000)
            agent_run.status = "FAILED"
            agent_run.error_message = str(e)
            agent_run.execution_duration_ms = duration_ms
            agent_run.completed_at = datetime.utcnow()
            db.add(agent_run)
            await db.commit()
            raise
