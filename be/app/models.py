from pydantic import BaseModel
from typing import Dict, List

class ThreadStatistics(BaseModel):
    total: int
    pending: int
    in_progress: int
    resolved: int
    escalated: int
    by_department: Dict[str, int]
