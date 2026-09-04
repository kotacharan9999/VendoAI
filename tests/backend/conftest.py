import pytest

from apps.api.database import async_engine


@pytest.fixture(autouse=True)
async def cleanup_engine():
    yield
    await async_engine.dispose()
