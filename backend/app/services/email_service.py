"""
Email Service for sending notifications via Gmail SMTP
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from app.core.config import settings
from app.core.logging_config import get_logger

logger = get_logger(__name__)


class EmailService:
    """Service for sending emails via Gmail SMTP"""

    def __init__(self):
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.sender_email = settings.GMAIL_USER
        self.sender_password = settings.GMAIL_APP_PASSWORD

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
        Send email notification for contact form submission

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
            # Create message
            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"Portfolio Contact Form: {subject}"
            msg["From"] = self.sender_email
            msg["To"] = self.sender_email  # Send to yourself
            msg["Reply-To"] = email

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
                            <p>Reply directly to this email to respond to {name}.</p>
                        </div>
                    </div>
                </body>
            </html>
            """

            # Create plain text version as fallback
            text_body = f"""
New Contact Form Submission
{'=' * 50}

From: {name}
Email: {email}
{f'Company: {company}' if company else ''}
{f'Phone: {phone}' if phone else ''}
Subject: {subject}
{f'Message ID: {message_id}' if message_id else ''}

Message:
{'-' * 50}
{message}

{'=' * 50}
This email was sent from your portfolio contact form.
Reply directly to this email to respond to {name}.
            """

            # Attach both versions
            part1 = MIMEText(text_body, "plain")
            part2 = MIMEText(html_body, "html")
            msg.attach(part1)
            msg.attach(part2)

            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.sender_email, self.sender_password)
                server.send_message(msg)

            logger.info(
                f"Contact notification email sent successfully for message {message_id}",
                extra={"message_id": message_id, "recipient_email": email}
            )
            return True

        except Exception as e:
            logger.error(
                f"Failed to send contact notification email: {str(e)}",
                extra={"message_id": message_id, "error": str(e)}
            )
            return False


# Singleton instance
email_service = EmailService()
