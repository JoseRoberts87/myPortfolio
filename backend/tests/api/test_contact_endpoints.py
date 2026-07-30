"""
Tests for the contact form API endpoints (`app/api/contact.py`).

Email sending is disabled by default (`CONTACT_EMAIL_ENABLED=False`), so these
tests exercise validation + the DB-persist path without any external services.
"""

VALID_PAYLOAD = {
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "subject": "Project inquiry",
    "message": "I would love to talk about a data engineering project.",
    "company": "Analytical Engines",
    "phone": "+1 555 123 4567",
}


class TestSubmitContactForm:
    def test_valid_submission_returns_201(self, client):
        response = client.post("/api/v1/contact", json=VALID_PAYLOAD)
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert data["message_id"]
        assert "timestamp" in data

    def test_submission_persists_to_database(self, client, test_db):
        from app.models.contact_message import ContactMessage

        client.post("/api/v1/contact", json=VALID_PAYLOAD)
        saved = test_db.query(ContactMessage).filter_by(email="ada@example.com").first()
        assert saved is not None
        assert saved.subject == "Project inquiry"

    def test_optional_fields_may_be_omitted(self, client):
        payload = {k: VALID_PAYLOAD[k] for k in ("name", "email", "subject", "message")}
        response = client.post("/api/v1/contact", json=payload)
        assert response.status_code == 201

    def test_missing_required_fields_returns_422(self, client):
        response = client.post("/api/v1/contact", json={"name": "A"})
        assert response.status_code == 422

    def test_invalid_email_returns_422(self, client):
        payload = {**VALID_PAYLOAD, "email": "not-an-email"}
        response = client.post("/api/v1/contact", json=payload)
        assert response.status_code == 422

    def test_message_too_short_returns_422(self, client):
        payload = {**VALID_PAYLOAD, "message": "short"}
        response = client.post("/api/v1/contact", json=payload)
        assert response.status_code == 422

    def test_name_too_short_returns_422(self, client):
        payload = {**VALID_PAYLOAD, "name": "A"}
        response = client.post("/api/v1/contact", json=payload)
        assert response.status_code == 422


class TestContactHealth:
    def test_health_endpoint(self, client):
        response = client.get("/api/v1/contact/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
