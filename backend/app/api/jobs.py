"""
Job Management API Endpoints
Manages scheduled jobs and pipeline execution monitoring
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime
from typing import List
from app.db import get_db
from app.models.pipeline_run import PipelineRun
from app.schemas.pipeline_run import (
    JobScheduleRequest,
    JobResponse,
    JobStatusResponse,
    PipelineRunResponse,
    PipelineMetrics
)
from app.services.scheduler_service import scheduler_service
from app.api.pipeline import _execute_pipeline
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/status", response_model=JobStatusResponse)
async def get_scheduler_status():
    """
    Get current scheduler status and all scheduled jobs

    Returns:
        Scheduler status with list of jobs
    """
    try:
        status_info = scheduler_service.get_status()
        return JobStatusResponse(**status_info)
    except Exception as e:
        logger.error(f"Error getting scheduler status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/schedule", status_code=status.HTTP_201_CREATED)
async def schedule_job(request: JobScheduleRequest):
    """
    Schedule a new job

    Args:
        request: Job scheduling parameters

    Returns:
        Success message and job details

    Example request:
        {
            "job_id": "reddit_daily",
            "pipeline_name": "reddit_pipeline",
            "trigger_type": "interval",
            "trigger_args": {"hours": 6}
        }

        or

        {
            "job_id": "reddit_daily",
            "pipeline_name": "reddit_pipeline",
            "trigger_type": "cron",
            "trigger_args": {"hour": 2, "minute": 0}
        }
    """
    try:
        # Map pipeline_name to actual function
        pipeline_func = _execute_pipeline

        # Add job to scheduler
        success = scheduler_service.add_job(
            func=pipeline_func,
            job_id=request.job_id,
            trigger_type=request.trigger_type,
            **request.trigger_args
        )

        if not success:
            raise HTTPException(
                status_code=500,
                detail="Failed to schedule job"
            )

        # Get job info
        job_info = scheduler_service.get_job(request.job_id)

        return {
            "message": f"Job '{request.job_id}' scheduled successfully",
            "job": job_info
        }

    except Exception as e:
        logger.error(f"Error scheduling job: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{job_id}", status_code=status.HTTP_200_OK)
async def remove_job(job_id: str):
    """
    Remove a scheduled job

    Args:
        job_id: ID of the job to remove

    Returns:
        Success message
    """
    try:
        success = scheduler_service.remove_job(job_id)

        if not success:
            raise HTTPException(
                status_code=404,
                detail=f"Job '{job_id}' not found"
            )

        return {"message": f"Job '{job_id}' removed successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing job: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{job_id}/pause")
async def pause_job(job_id: str):
    """
    Pause a scheduled job

    Args:
        job_id: ID of the job to pause

    Returns:
        Success message
    """
    try:
        success = scheduler_service.pause_job(job_id)

        if not success:
            raise HTTPException(
                status_code=404,
                detail=f"Job '{job_id}' not found"
            )

        return {"message": f"Job '{job_id}' paused successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error pausing job: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{job_id}/resume")
async def resume_job(job_id: str):
    """
    Resume a paused job

    Args:
        job_id: ID of the job to resume

    Returns:
        Success message
    """
    try:
        success = scheduler_service.resume_job(job_id)

        if not success:
            raise HTTPException(
                status_code=404,
                detail=f"Job '{job_id}' not found"
            )

        return {"message": f"Job '{job_id}' resumed successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resuming job: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: str):
    """
    Get information about a specific job

    Args:
        job_id: ID of the job

    Returns:
        Job information
    """
    try:
        job_info = scheduler_service.get_job(job_id)

        if not job_info:
            raise HTTPException(
                status_code=404,
                detail=f"Job '{job_id}' not found"
            )

        return JobResponse(**job_info)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting job: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Pipeline Run Endpoints

@router.get("/runs/history", response_model=List[PipelineRunResponse])
async def get_pipeline_runs(
    limit: int = 20,
    pipeline_name: str = None,
    status: str = None,
    db: Session = Depends(get_db)
):
    """
    Get pipeline run history

    Args:
        limit: Maximum number of runs to return
        pipeline_name: Filter by pipeline name
        status: Filter by status (success, failed, running)
        db: Database session

    Returns:
        List of pipeline runs
    """
    try:
        query = db.query(PipelineRun).order_by(desc(PipelineRun.started_at))

        if pipeline_name:
            query = query.filter(PipelineRun.pipeline_name == pipeline_name)

        if status:
            query = query.filter(PipelineRun.status == status)

        runs = query.limit(limit).all()
        return runs

    except Exception as e:
        logger.error(f"Error fetching pipeline runs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/runs/{run_id}", response_model=PipelineRunResponse)
async def get_pipeline_run(run_id: str, db: Session = Depends(get_db)):
    """
    Get details of a specific pipeline run

    Args:
        run_id: UUID of the pipeline run
        db: Database session

    Returns:
        Pipeline run details
    """
    try:
        run = db.query(PipelineRun).filter(PipelineRun.run_id == run_id).first()

        if not run:
            raise HTTPException(
                status_code=404,
                detail=f"Pipeline run '{run_id}' not found"
            )

        return run

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching pipeline run: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics/summary", response_model=PipelineMetrics)
async def get_pipeline_metrics(
    pipeline_name: str = None,
    days: int = 7,
    db: Session = Depends(get_db)
):
    """
    Get aggregated pipeline metrics

    Args:
        pipeline_name: Filter by pipeline name (optional)
        days: Number of days to include in metrics (default: 7)
        db: Database session

    Returns:
        Aggregated pipeline metrics
    """
    try:
        from datetime import timedelta

        # Filter by time range
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        query = db.query(PipelineRun).filter(PipelineRun.started_at >= cutoff_date)

        if pipeline_name:
            query = query.filter(PipelineRun.pipeline_name == pipeline_name)

        # Calculate metrics
        total_runs = query.count()
        successful_runs = query.filter(PipelineRun.status == "success").count()
        failed_runs = query.filter(PipelineRun.status == "failed").count()
        running_runs = query.filter(PipelineRun.status == "running").count()

        # Average duration
        avg_duration = db.query(func.avg(PipelineRun.duration_seconds)).filter(
            PipelineRun.started_at >= cutoff_date,
            PipelineRun.duration_seconds.isnot(None)
        )
        if pipeline_name:
            avg_duration = avg_duration.filter(PipelineRun.pipeline_name == pipeline_name)
        avg_duration = avg_duration.scalar() or 0.0

        # Average records per run
        avg_records = db.query(func.avg(PipelineRun.records_processed)).filter(
            PipelineRun.started_at >= cutoff_date
        )
        if pipeline_name:
            avg_records = avg_records.filter(PipelineRun.pipeline_name == pipeline_name)
        avg_records = avg_records.scalar() or 0.0

        # Total records
        total_records = db.query(func.sum(PipelineRun.records_processed)).filter(
            PipelineRun.started_at >= cutoff_date
        )
        if pipeline_name:
            total_records = total_records.filter(PipelineRun.pipeline_name == pipeline_name)
        total_records = total_records.scalar() or 0

        # Success rate
        avg_success_rate = (successful_runs / total_runs * 100) if total_runs > 0 else 0.0

        # Last run
        last_run_query = query.order_by(desc(PipelineRun.started_at))
        last_run = last_run_query.first()

        # Recent runs
        recent_runs = last_run_query.limit(10).all()

        return PipelineMetrics(
            total_runs=total_runs,
            successful_runs=successful_runs,
            failed_runs=failed_runs,
            running_runs=running_runs,
            avg_duration_seconds=avg_duration,
            avg_records_per_run=avg_records,
            total_records_processed=total_records,
            avg_success_rate=avg_success_rate,
            last_run=last_run,
            recent_runs=recent_runs
        )

    except Exception as e:
        logger.error(f"Error calculating pipeline metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
