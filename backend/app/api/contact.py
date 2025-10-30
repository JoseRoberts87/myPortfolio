"""
Contact Form API Endpoints
Handles contact form submissions
"""
from fastapi import APIRouter, status, Request, HTTPException, Depends
from fastapi.responses import JSONResponse
from datetime import datetime
from sqlalchemy.orm import Session
from app.schemas.contact import ContactMessageCreate, ContactMessageResponse
from app.models.contact_message import ContactMessage
from app.db.database import get_db
from app.core.logging_config import get_logger
from app.core.config import settings
import uuid

logger = get_logger(__name__)

router = APIRouter()


@router.post(
    "/contact",
    response_model=ContactMessageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit contact form",
    description="Submit a contact form message. Messages are logged and can trigger email notifications.",
)
async def submit_contact_form(
    contact_data: ContactMessageCreate,
    request: Request,
    db: Session = Depends(get_db)
) -> ContactMessageResponse:
    """
    Submit a contact form message

    Args:
        contact_data: Contact form data including name, email, subject, and message
        request: FastAPI request object for extracting IP and user agent

    Returns:
        ContactMessageResponse with success status and message ID

    Raises:
        HTTPException: If submission fails
    """
    try:
        # Generate unique message ID
        message_id = str(uuid.uuid4())

        # Extract metadata
        client_host = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")

        # Log the contact form submission
        logger.info(
            f"Contact form submission received",
            extra={
                "message_id": message_id,
                "contact_name": contact_data.name,
                "contact_email": contact_data.email,
                "contact_subject": contact_data.subject,
                "contact_company": contact_data.company,
                "ip_address": client_host,
                "user_agent": user_agent,
            }
        )

        # Save to database
        email_status = "pending"
        try:
            db_message = ContactMessage(
                message_id=message_id,
                name=contact_data.name,
                email=contact_data.email,
                subject=contact_data.subject,
                message=contact_data.message,
                company=contact_data.company,
                phone=contact_data.phone,
                ip_address=client_host,
                user_agent=user_agent,
                status="pending",
                email_sent="pending"
            )
            db.add(db_message)
            db.commit()
            db.refresh(db_message)
            logger.info(f"Contact message saved to database with ID {db_message.id}")
        except Exception as db_error:
            logger.error(f"Failed to save contact message to database: {str(db_error)}")
            db.rollback()
            # Don't fail the request if database save fails, continue with email

        # Send email notification if enabled
        if settings.CONTACT_EMAIL_ENABLED:
            try:
                # Select email service based on configuration
                if settings.EMAIL_SERVICE == "gmail":
                    from app.services.email_service import email_service
                    service = email_service
                elif settings.EMAIL_SERVICE == "resend":
                    from app.services.resend_email_service import resend_email_service
                    service = resend_email_service
                else:
                    logger.error(f"Unknown email service: {settings.EMAIL_SERVICE}")
                    service = None

                if service:
                    email_sent = await service.send_contact_notification(
                        name=contact_data.name,
                        email=contact_data.email,
                        subject=contact_data.subject,
                        message=contact_data.message,
                        company=contact_data.company,
                        phone=contact_data.phone,
                        message_id=message_id,
                    )
                    if email_sent:
                        email_status = "sent"
                        logger.info(
                            f"Email notification sent via {settings.EMAIL_SERVICE} for message {message_id}"
                        )
                    else:
                        email_status = "failed"
                        logger.warning(
                            f"Email notification failed via {settings.EMAIL_SERVICE} for message {message_id}"
                        )

                    # Update database with email status
                    try:
                        db_message.email_sent = email_status
                        db_message.email_sent_at = datetime.utcnow() if email_status == "sent" else None
                        db.commit()
                    except Exception as update_error:
                        logger.error(f"Failed to update email status in database: {str(update_error)}")
                        db.rollback()
            except Exception as email_error:
                # Don't fail the request if email fails, just log it
                email_status = "failed"
                logger.error(
                    f"Email notification error: {str(email_error)}",
                    extra={"message_id": message_id, "error": str(email_error)}
                )
                # Update database with failed status
                try:
                    db_message.email_sent = "failed"
                    db.commit()
                except Exception as update_error:
                    logger.error(f"Failed to update email failed status: {str(update_error)}")
                    db.rollback()

        return ContactMessageResponse(
            success=True,
            message="Thank you for your message! I'll get back to you soon.",
            message_id=message_id,
            timestamp=datetime.utcnow()
        )

    except Exception as e:
        logger.error(
            f"Error processing contact form submission: {str(e)}",
            extra={
                "email": contact_data.email,
                "error": str(e)
            }
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process contact form submission. Please try again later."
        )


@router.get(
    "/contact/health",
    summary="Contact form health check",
    description="Check if the contact form endpoint is operational",
)
async def contact_health_check() -> dict:
    """
    Health check for contact form endpoint

    Returns:
        Status message
    """
    return {
        "status": "healthy",
        "endpoint": "contact-form",
        "timestamp": datetime.utcnow().isoformat()
    }
