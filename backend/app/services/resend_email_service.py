"""
Email Service using Resend API
Simple, modern email service with no complex SMTP setup required
Get API key from: https://resend.com/
"""
import httpx
from typing import Optional
from app.core.config import settings
from app.core.logging_config import get_logger

logger = get_logger(__name__)


class ResendEmailService:
    """Service for sending emails via Resend API"""

    def __init__(self):
        self.api_url = "https://api.resend.com/emails"
        self.api_key = settings.RESEND_API_KEY
        self.from_email = settings.RESEND_FROM_EMAIL

    async def send_contact_notification(
        self,
        name: str,
        email: str,
        subject: str,
        message: str,
        company: Optional[str] = None,
        phone: Optional[str] = None,
        message_id: Optional[str] = None,
    ) -> bool:
        """
        Send email notification for contact form submission using Resend API

        Args:
            name: Sender's name
            email: Sender's email
            subject: Message subject
            message: Message content
            company: Optional company name
            phone: Optional phone number
            message_id: Optional unique message ID

        Returns:
            bool: True if email sent successfully, False otherwise
        """
        try:
            # Create HTML email body
            html_body = f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">
                            New Contact Form Submission
                        </h2>

                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                            <p style="margin: 10px 0;"><strong>From:</strong> {name}</p>
                            <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:{email}">{email}</a></p>
                            {f'<p style="margin: 10px 0;"><strong>Company:</strong> {company}</p>' if company else ''}
                            {f'<p style="margin: 10px 0;"><strong>Phone:</strong> {phone}</p>' if phone else ''}
                            <p style="margin: 10px 0;"><strong>Subject:</strong> {subject}</p>
                            {f'<p style="margin: 10px 0; color: #6b7280; font-size: 0.875rem;"><strong>Message ID:</strong> {message_id}</p>' if message_id else ''}
                        </div>

                        <div style="margin: 20px 0;">
                            <h3 style="color: #4b5563; margin-bottom: 10px;">Message:</h3>
                            <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #6366f1; white-space: pre-wrap;">
{message}
                            </div>
                        </div>

                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 0.875rem;">
                            <p>This email was sent from your portfolio contact form.</p>
                            <p>Reply directly to respond to {name} at {email}.</p>
                        </div>
                    </div>
                </body>
            </html>
            """

            # Prepare email payload for Resend API
            payload = {
                "from": self.from_email,
                "to": [settings.RESEND_TO_EMAIL],
                "subject": f"Portfolio Contact: {subject}",
                "html": html_body,
                "reply_to": email,
            }

            # Send via Resend API
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.api_url,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                    timeout=10.0,
                )

                if response.status_code == 200:
                    logger.info(
                        f"Contact notification email sent successfully via Resend for message {message_id}",
                        extra={"message_id": message_id, "recipient_email": email}
                    )
                    return True
                else:
                    logger.error(
                        f"Resend API error: {response.status_code} - {response.text}",
                        extra={"message_id": message_id, "status_code": response.status_code}
                    )
                    return False

        except Exception as e:
            logger.error(
                f"Failed to send contact notification email via Resend: {str(e)}",
                extra={"message_id": message_id, "error": str(e)}
            )
            return False


# Singleton instance
resend_email_service = ResendEmailService()
