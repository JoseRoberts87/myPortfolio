"""Tests for the Gmail SMTP email service (`app/services/email_service.py`)."""
import pytest
from unittest.mock import MagicMock

import app.services.email_service as email_module
from app.services.email_service import EmailService

ARGS = dict(
    name="Ada",
    email="ada@example.com",
    subject="Hello",
    message="A message body long enough.",
    message_id="abc-123",
)


class TestSendContactNotification:
    @pytest.mark.asyncio
    async def test_success_returns_true(self, monkeypatch):
        smtp_instance = MagicMock()
        # `with smtplib.SMTP(...) as server:` -> context manager returns the mock.
        smtp_cm = MagicMock()
        smtp_cm.__enter__.return_value = smtp_instance
        smtp_cm.__exit__.return_value = False
        monkeypatch.setattr(email_module.smtplib, "SMTP", MagicMock(return_value=smtp_cm))

        result = await EmailService().send_contact_notification(**ARGS)
        assert result is True
        smtp_instance.send_message.assert_called_once()

    @pytest.mark.asyncio
    async def test_failure_returns_false(self, monkeypatch):
        # Any SMTP error must be swallowed and reported as False, not raised.
        monkeypatch.setattr(
            email_module.smtplib,
            "SMTP",
            MagicMock(side_effect=OSError("connection refused")),
        )
        result = await EmailService().send_contact_notification(**ARGS)
        assert result is False
