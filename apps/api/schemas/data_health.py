from typing import Any

from pydantic import BaseModel


class DataHealthCheckItem(BaseModel):
    category: str
    check_name: str
    status: str
    details: str
    issue_count: int


class DataHealthReport(BaseModel):
    overall_status: str
    health_score: int
    total_checks: int
    passed_checks: int
    warning_checks: int
    failed_checks: int
    checks: list[DataHealthCheckItem]
    metrics: dict[str, Any]
