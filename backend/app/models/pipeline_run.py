"""
Pipeline Run Model
Tracks execution history, metrics, and performance of pipeline runs
"""
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, Boolean
from sqlalchemy.sql import func
from app.db.database import Base


class PipelineRun(Base):
    """Pipeline execution tracking model"""
    __tablename__ = "pipeline_runs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    run_id = Column(String, unique=True, index=True, nullable=False)  # UUID

    # Run Information
    pipeline_name = Column(String(100), nullable=False, index=True)  # e.g., "reddit_pipeline"
    trigger_type = Column(String(50), nullable=False)  # manual, scheduled, api
    status = Column(String(50), nullable=False, index=True)  # running, success, failed, partial

    # Timing
    started_at = Column(DateTime, server_default=func.now(), nullable=False, index=True)
    completed_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Float, nullable=True)  # Calculated duration

    # Metrics
    records_processed = Column(Integer, default=0)
    records_stored = Column(Integer, default=0)
    records_updated = Column(Integer, default=0)
    records_failed = Column(Integer, default=0)

    # Data Quality
    data_quality_score = Column(Float, nullable=True)  # 0-100 score
    validation_errors = Column(Integer, default=0)

    # Performance
    avg_processing_time_ms = Column(Float, nullable=True)  # Average time per record in ms

    # Error Information
    error_message = Column(Text, nullable=True)
    error_type = Column(String(100), nullable=True)
    stack_trace = Column(Text, nullable=True)

    # Source-specific metrics (JSON stored as text)
    source_metrics = Column(Text, nullable=True)  # JSON string with per-source stats

    # Retry Information
    retry_count = Column(Integer, default=0)
    is_retry = Column(Boolean, default=False)
    original_run_id = Column(String, nullable=True)  # If this is a retry

    def __repr__(self):
        return f"<PipelineRun(id={self.id}, name={self.pipeline_name}, status={self.status}, started={self.started_at})>"

    @property
    def success_rate(self) -> float:
        """Calculate success rate of processing"""
        total = self.records_processed
        if total == 0:
            return 0.0
        return (self.records_stored / total) * 100

    @property
    def failure_rate(self) -> float:
        """Calculate failure rate of processing"""
        total = self.records_processed
        if total == 0:
            return 0.0
        return (self.records_failed / total) * 100
