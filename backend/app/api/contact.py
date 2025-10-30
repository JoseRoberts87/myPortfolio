"""
Contact Form API Endpoints
Handles contact form submissions
"""
from fastapi import APIRouter, status, Request, HTTPException
from fastapi.responses import JSONResponse
from datetime import datetime
from app.schemas.contact import ContactMessageCreate, ContactMessageResponse
from app.core.logging_config import get_logger
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
    request: Request
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
                "name": contact_data.name,
                "email": contact_data.email,
                "subject": contact_data.subject,
                "company": contact_data.company,
                "ip_address": client_host,
                "user_agent": user_agent,
            }
        )

        # TODO: Save to database (will implement with database model)
        # For now, we'll just log and return success

        # TODO: Send email notification (optional - can be implemented with AWS SES)
        # await send_email_notification(contact_data, message_id)

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
