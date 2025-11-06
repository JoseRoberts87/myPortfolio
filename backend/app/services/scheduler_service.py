"""
Scheduler Service
Handles automated scheduling of data pipeline jobs using APScheduler
"""
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.jobstores.base import JobLookupError
from datetime import datetime
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


class SchedulerService:
    """Service for managing scheduled jobs"""

    def __init__(self):
        """Initialize the scheduler"""
        self.scheduler = AsyncIOScheduler()
        self._jobs: Dict[str, Dict[str, Any]] = {}

    def start(self):
        """Start the scheduler"""
        if not self.scheduler.running:
            self.scheduler.start()
            logger.info("Scheduler started successfully")
        else:
            logger.warning("Scheduler is already running")

    def shutdown(self, wait: bool = True):
        """
        Shutdown the scheduler

        Args:
            wait: Wait for all running jobs to complete
        """
        if self.scheduler.running:
            self.scheduler.shutdown(wait=wait)
            logger.info("Scheduler shut down successfully")

    def add_job(
        self,
        func,
        job_id: str,
        trigger_type: str = "interval",
        args: tuple = None,
        kwargs: dict = None,
        **trigger_args
    ) -> bool:
        """
        Add a scheduled job

        Args:
            func: The function to execute
            job_id: Unique identifier for the job
            trigger_type: Type of trigger ('interval' or 'cron')
            args: Positional arguments to pass to the function
            kwargs: Keyword arguments to pass to the function
            **trigger_args: Arguments for the trigger

        Returns:
            bool: True if job added successfully

        Example:
            # Interval trigger (every 6 hours)
            add_job(my_func, 'my_job', 'interval', hours=6)

            # With function arguments
            add_job(my_func, 'my_job', 'interval', kwargs={'category': 'tech'}, hours=12)

            # Cron trigger (daily at 2 AM)
            add_job(my_func, 'my_job', 'cron', hour=2, minute=0)
        """
        try:
            # Create appropriate trigger
            if trigger_type == "interval":
                trigger = IntervalTrigger(**trigger_args)
            elif trigger_type == "cron":
                trigger = CronTrigger(**trigger_args)
            else:
                raise ValueError(f"Unsupported trigger type: {trigger_type}")

            # Add job to scheduler
            job = self.scheduler.add_job(
                func,
                trigger,
                args=args or (),
                kwargs=kwargs or {},
                id=job_id,
                replace_existing=True,
                max_instances=1  # Prevent overlapping executions
            )

            # Store job metadata
            self._jobs[job_id] = {
                "function": func.__name__,
                "trigger_type": trigger_type,
                "trigger_args": trigger_args,
                "function_args": args,
                "function_kwargs": kwargs,
                "next_run_time": job.next_run_time,
                "added_at": datetime.utcnow()
            }

            logger.info(f"Job '{job_id}' added successfully. Next run: {job.next_run_time}")
            return True

        except Exception as e:
            logger.error(f"Error adding job '{job_id}': {str(e)}")
            return False

    def remove_job(self, job_id: str) -> bool:
        """
        Remove a scheduled job

        Args:
            job_id: ID of the job to remove

        Returns:
            bool: True if job removed successfully
        """
        try:
            self.scheduler.remove_job(job_id)
            if job_id in self._jobs:
                del self._jobs[job_id]
            logger.info(f"Job '{job_id}' removed successfully")
            return True
        except JobLookupError:
            logger.warning(f"Job '{job_id}' not found")
            return False
        except Exception as e:
            logger.error(f"Error removing job '{job_id}': {str(e)}")
            return False

    def pause_job(self, job_id: str) -> bool:
        """
        Pause a scheduled job

        Args:
            job_id: ID of the job to pause

        Returns:
            bool: True if job paused successfully
        """
        try:
            self.scheduler.pause_job(job_id)
            logger.info(f"Job '{job_id}' paused")
            return True
        except JobLookupError:
            logger.warning(f"Job '{job_id}' not found")
            return False
        except Exception as e:
            logger.error(f"Error pausing job '{job_id}': {str(e)}")
            return False

    def resume_job(self, job_id: str) -> bool:
        """
        Resume a paused job

        Args:
            job_id: ID of the job to resume

        Returns:
            bool: True if job resumed successfully
        """
        try:
            self.scheduler.resume_job(job_id)
            logger.info(f"Job '{job_id}' resumed")
            return True
        except JobLookupError:
            logger.warning(f"Job '{job_id}' not found")
            return False
        except Exception as e:
            logger.error(f"Error resuming job '{job_id}': {str(e)}")
            return False

    def get_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        """
        Get information about a specific job

        Args:
            job_id: ID of the job

        Returns:
            Dict with job information or None if not found
        """
        try:
            job = self.scheduler.get_job(job_id)
            if not job:
                return None

            return {
                "id": job.id,
                "name": job.name or job.func.__name__,
                "next_run_time": job.next_run_time.isoformat() if job.next_run_time else None,
                "trigger": str(job.trigger),
                "pending": job.pending,
                "metadata": self._jobs.get(job_id, {})
            }
        except Exception as e:
            logger.error(f"Error getting job '{job_id}': {str(e)}")
            return None

    def get_all_jobs(self) -> List[Dict[str, Any]]:
        """
        Get information about all scheduled jobs

        Returns:
            List of job dictionaries
        """
        jobs = []
        for job in self.scheduler.get_jobs():
            job_info = {
                "id": job.id,
                "name": job.name or job.func.__name__,
                "next_run_time": job.next_run_time.isoformat() if job.next_run_time else None,
                "trigger": str(job.trigger),
                "pending": job.pending,
                "metadata": self._jobs.get(job.id, {})
            }
            jobs.append(job_info)
        return jobs

    def is_running(self) -> bool:
        """Check if scheduler is running"""
        return self.scheduler.running

    def get_status(self) -> Dict[str, Any]:
        """
        Get scheduler status

        Returns:
            Dict with scheduler status information
        """
        return {
            "running": self.scheduler.running,
            "total_jobs": len(self.scheduler.get_jobs()),
            "jobs": self.get_all_jobs()
        }


# Global scheduler instance
scheduler_service = SchedulerService()
