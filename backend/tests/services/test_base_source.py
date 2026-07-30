"""Tests for the data-source abstraction (`app/services/base_source.py`)."""
import pytest
from datetime import datetime

from app.services.base_source import (
    BaseDataSource,
    DataSourceConfig,
    SourceType,
)


class _StubSource(BaseDataSource):
    """Concrete source used to exercise the base-class behavior."""

    def __init__(self, config, raw):
        super().__init__(config)
        self._raw = raw

    async def fetch(self, **kwargs):
        return self._raw

    def transform(self, raw_data):
        return raw_data  # already in unified shape for the test


def _config():
    return DataSourceConfig(source_type=SourceType.NEWS, api_key="k", rate_limit=42, timeout=7)


VALID_ITEM = {
    "id": "1",
    "title": "A headline",
    "source_type": "news",
    "published_at": datetime.utcnow(),
}


class TestValidate:
    def test_valid_item(self):
        source = _StubSource(_config(), [])
        assert source.validate(VALID_ITEM) is True

    def test_missing_required_field(self):
        source = _StubSource(_config(), [])
        item = {k: v for k, v in VALID_ITEM.items() if k != "title"}
        assert source.validate(item) is False

    def test_empty_title(self):
        source = _StubSource(_config(), [])
        assert source.validate({**VALID_ITEM, "title": "   "}) is False

    def test_invalid_published_at_type(self):
        source = _StubSource(_config(), [])
        assert source.validate({**VALID_ITEM, "published_at": 12345}) is False


class TestMetadataAndConfig:
    def test_get_metadata(self):
        source = _StubSource(_config(), [])
        meta = source.get_metadata()
        assert meta["source_type"] == "news"
        assert meta["rate_limit"] == 42
        assert meta["timeout"] == 7

    def test_source_type_enum_values(self):
        assert SourceType.REDDIT.value == "reddit"
        assert SourceType.NEWS.value == "news"


class TestFetchAndTransform:
    @pytest.mark.asyncio
    async def test_filters_invalid_items(self):
        invalid = {"id": "2", "source_type": "news"}  # missing title/published_at
        source = _StubSource(_config(), [VALID_ITEM, invalid])
        result = await source.fetch_and_transform()
        assert result == [VALID_ITEM]

    @pytest.mark.asyncio
    async def test_empty_fetch_returns_empty(self):
        source = _StubSource(_config(), [])
        assert await source.fetch_and_transform() == []
