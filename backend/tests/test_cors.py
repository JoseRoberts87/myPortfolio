"""Tests for CORS config (issue #169): stable origins + a Vercel-preview regex.

The old default pinned a single per-deployment Vercel URL that went stale on every
deploy. Now the stable production alias is listed and preview URLs are matched by
regex, so browser calls from the frontend keep working across deploys.
"""
import re

from app.core.config import Settings


class TestCorsDefaults:
    def test_default_origins_drop_the_stale_deployment_url(self):
        default = Settings.model_fields["CORS_ORIGINS"].default
        assert "60sng8hin" not in default  # the stale per-deployment hash is gone
        assert "http://localhost:3000" in default
        assert "https://portfolio-joseroberts87s-projects.vercel.app" in default  # stable alias

    def test_regex_matches_project_previews_only(self):
        pat = re.compile(Settings.model_fields["CORS_ORIGIN_REGEX"].default)
        assert pat.match("https://portfolio-60sng8hin-joseroberts87s-projects.vercel.app")
        assert pat.match("https://portfolio-git-main-joseroberts87s-projects.vercel.app")
        assert not pat.match("https://evil.vercel.app")
        # scoped to this team — another team's project doesn't match
        assert not pat.match("https://portfolio-x-someoneelses-projects.vercel.app")


class TestCorsMiddleware:
    def test_allows_a_vercel_preview_origin_via_regex(self, client):
        origin = "https://portfolio-abc123-joseroberts87s-projects.vercel.app"
        r = client.get("/health", headers={"Origin": origin})
        assert r.headers.get("access-control-allow-origin") == origin

    def test_rejects_an_unknown_origin(self, client):
        r = client.get("/health", headers={"Origin": "https://evil.example.com"})
        assert r.headers.get("access-control-allow-origin") is None
