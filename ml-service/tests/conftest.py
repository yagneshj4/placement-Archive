"""
Pytest fixtures — shared across all test files.
Loads the FastAPI app once for the entire test session.
"""
import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add parent directory to path so we can import main
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app


@pytest.fixture(scope="session")
def client():
	"""TestClient shares the same lifespan as the app — models load once."""
	with TestClient(app) as c:
		yield c


@pytest.fixture(scope="session")
def api_key():
	return "ml-service-dev-key"


@pytest.fixture(scope="session")
def auth_headers(api_key):
	return {"X-API-Key": api_key}
