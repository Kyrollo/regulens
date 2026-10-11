from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_audits(client: AsyncClient) -> None:
    resp = await client.get("/api/v1/audits")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 2
    assert any("OmniCredit" in a["system_name"] for a in data)


@pytest.mark.asyncio
async def test_get_audit_detail(client: AsyncClient) -> None:
    resp = await client.get("/api/v1/audits/aud-omni-101")
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == "aud-omni-101"
    assert data["risk_tier"] == "HIGH_RISK"
    assert len(data["framework_scores"]) == 4
    assert len(data["findings"]) >= 3


@pytest.mark.asyncio
async def test_get_system_info(client: AsyncClient) -> None:
    resp = await client.get("/api/v1/info")
    assert resp.status_code == 200
    info = resp.json()
    assert info["slug"] == "regulens"
