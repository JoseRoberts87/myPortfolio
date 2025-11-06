"""
Pipeline Run Schemas
Pydantic models for pipeline run request/response validation
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any


class PipelineRunCreate(BaseModel):
    """Schema for creating a pipeline run record"""
    run_id: str
    pipeline_name: str
    trigger_type: str = Field(..., description="manual, scheduled, or api")


class PipelineRunUpdate(BaseModel):
    """Schema for updating a pipeline run"""
    status: Optional[str] = None
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[float] = None
    records_processed: Optional[int] = None
    records_stored: Optional[int] = None
    records_updated: Optional[int] = None
    records_failed: Optional[int] = None
    data_quality_score: Optional[float] = None
    validation_errors: Optional[int] = None
    avg_processing_time_ms: Optional[float] = None
    error_message: Optional[str] = None
    error_type: Optional[str] = None
    stack_trace: Optional[str] = None
    source_metrics: Optional[str] = None
    retry_count: Optional[int] = None


class PipelineRunResponse(BaseModel):
    """Schema for pipeline run response"""
    id: int
    run_id: str
    pipeline_name: str
    trigger_type: str
    status: str
    started_at: datetime
    completed_at: Optional[datetime]
    duration_seconds: Optional[float]
    records_processed: int
    records_stored: int
    records_updated: int
    records_failed: int
    data_quality_score: Optional[float]
    validation_errors: int
    avg_processing_time_ms: Optional[float]
    error_message: Optional[str]
    error_type: Optional[str]
    retry_count: int
    is_retry: bool

    class Config:
        from_attributes = True


class PipelineMetrics(BaseModel):
    """Aggregated pipeline metrics"""
    total_runs: int
    successful_runs: int
    failed_runs: int
    running_runs: int
    avg_duration_seconds: float
    avg_records_per_run: float
    total_records_processed: int
    avg_success_rate: float
    last_run: Optional[PipelineRunResponse]
    recent_runs: list[PipelineRunResponse]


class JobScheduleRequest(BaseModel):
    """Schema for scheduling a job"""
    job_id: str = Field(..., description="Unique identifier for the job")
    pipeline_name: str = Field(..., description="Name of the pipeline to run")
    trigger_type: str = Field(..., description="interval or cron")
    trigger_args: Dict[str, Any] = Field(..., description="Arguments for the trigger (e.g., {hours: 6} for interval)")


class JobResponse(BaseModel):
    """Schema for job information response"""
    id: str
    name: str
    next_run_time: Optional[str]
    trigger: str
    pending: bool
    metadata: Dict[str, Any]


class JobStatusResponse(BaseModel):
    """Schema for overall scheduler status"""
    running: bool
    total_jobs: int
    jobs: list[JobResponse]
