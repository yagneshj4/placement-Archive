"""
Integration tests for all FastAPI endpoints.
Run from ml-service/: pytest tests/ -v
"""
import pytest


# ── Health ────────────────────────────────────────────────────
class TestHealth:
	def test_health_returns_ok(self, client):
		res = client.get("/health")
		assert res.status_code == 200
		data = res.json()
		assert data["status"] == "ok"
		assert data["model_loaded"] is True
		assert data["chroma_ready"] is True
		assert "collections" in data

	def test_health_shows_collection_counts(self, client):
		res = client.get("/health")
		collections = res.json()["collections"]
		assert "experiences" in collections
		assert "questions" in collections
		assert isinstance(collections["experiences"], int)


# ── Embed ─────────────────────────────────────────────────────
class TestEmbed:
	def test_embed_single_document(self, client, auth_headers):
		res = client.post(
			"/embed",
			json={
				"text": "Amazon technical interview had LRU Cache and binary tree traversal questions.",
				"doc_id": "pytest_test_001",
				"collection": "experiences",
				"metadata": {"company": "Amazon", "year": 2024},
			},
			headers=auth_headers,
		)
		assert res.status_code == 200
		data = res.json()
		assert data["success"] is True
		assert data["doc_id"] == "pytest_test_001"
		assert data["dimension"] == 384
		assert data["embedding_id"] == "pytest_test_001"

	def test_embed_requires_api_key(self, client):
		res = client.post(
			"/embed",
			json={
				"text": "This is a long enough text to pass validation requirements",
				"doc_id": "test",
				"collection": "experiences",
			},
		)
		assert res.status_code == 401

	def test_embed_rejects_short_text(self, client, auth_headers):
		res = client.post(
			"/embed",
			json={"text": "short", "doc_id": "test", "collection": "experiences"},
			headers=auth_headers,
		)
		assert res.status_code == 422  # Pydantic validation error

	def test_embed_batch(self, client, auth_headers):
		res = client.post(
			"/embed/batch",
			json={
				"collection": "experiences",
				"items": [
					{
						"text": "First experience about system design interviews at Google.",
						"doc_id": "pytest_batch_001",
					},
					{
						"text": "Second experience about DSA rounds at Amazon including graphs.",
						"doc_id": "pytest_batch_002",
					},
				],
			},
			headers=auth_headers,
		)
		assert res.status_code == 200
		data = res.json()
		assert data["embedded"] == 2
		assert data["failed"] == 0


# ── Search ────────────────────────────────────────────────────
class TestSearch:
	def test_semantic_search_returns_results(self, client, auth_headers):
		# First embed something so collection is not empty
		client.post(
			"/embed",
			json={
				"text": "Google technical interview with graph algorithms including BFS DFS and Tarjan bridges.",
				"doc_id": "pytest_search_001",
				"collection": "experiences",
			},
			headers=auth_headers,
		)

		res = client.post(
			"/search",
			json={
				"query": "graph traversal interview",
				"collection": "experiences",
				"n_results": 3,
			},
			headers=auth_headers,
		)
		assert res.status_code == 200
		data = res.json()
		assert data["success"] is True
		assert isinstance(data["results"], list)
		# Should find at least the one we just embedded
		assert len(data["results"]) >= 1
		# Verify result structure
		for r in data["results"]:
			assert "doc_id" in r
			assert "similarity" in r
			assert "distance" in r
			assert 0.0 <= r["similarity"] <= 1.0

	def test_search_similarity_ordering(self, client, auth_headers):
		"""Results must be ordered by similarity descending."""
		res = client.post(
			"/search",
			json={
				"query": "LRU Cache HashMap data structure",
				"collection": "experiences",
				"n_results": 5,
			},
			headers=auth_headers,
		)
		results = res.json()["results"]
		if len(results) >= 2:
			for i in range(len(results) - 1):
				assert results[i]["similarity"] >= results[i + 1]["similarity"]

	def test_hybrid_search_filters_by_min_similarity(self, client, auth_headers):
		res = client.post(
			"/search/hybrid",
			json={
				"query": "interview question",
				"collection": "experiences",
				"n_results": 10,
				"min_similarity": 0.99,  # Very high threshold
			},
			headers=auth_headers,
		)
		assert res.status_code == 200
		# Results may be empty at 0.99 threshold but shouldn't crash
		assert isinstance(res.json()["results"], list)


# ── Auto-tag ──────────────────────────────────────────────────
class TestAutotag:
	def test_autotag_returns_all_fields(self, client, auth_headers):
		res = client.post(
			"/autotag",
			json={
				"text": "Amazon SDE-1 technical interview had 3 rounds. First round was LRU Cache implementation. Second was binary tree zigzag traversal. Third was system design — URL shortener.",
				"experience_id": "pytest_autotag_001",
			},
			headers=auth_headers,
		)
		assert res.status_code == 200
		data = res.json()
		assert data["success"] is True
		tags = data["tags"]
		assert "roundType" in tags
		assert "topics" in tags
		assert "difficulty" in tags
		assert "role" in tags
		assert "company" in tags
		assert tags["roundType"] in [
			"coding",
			"technical",
			"hr",
			"system_design",
			"managerial",
			"aptitude",
			"group_discussion",
		]
		assert isinstance(tags["topics"], list)

	def test_autotag_technical_round(self, client, auth_headers):
		res = client.post(
			"/autotag",
			json={
				"text": "JP Morgan technical interview focused on Java concurrency. Questions on thread-safe LRU Cache, ConcurrentHashMap vs HashMap.",
			},
			headers=auth_headers,
		)
		tags = res.json()["tags"]
		assert tags["roundType"] == "technical"

	def test_autotag_hr_round(self, client, auth_headers):
		res = client.post(
			"/autotag",
			json={
				"text": "Amazon HR round was 45 minutes. All questions were based on leadership principles. Tell me about a time you failed.",
			},
			headers=auth_headers,
		)
		tags = res.json()["tags"]
		assert tags["roundType"] == "hr"


# ── Difficulty ────────────────────────────────────────────────
class TestDifficulty:
	def test_difficulty_in_valid_range(self, client, auth_headers):
		res = client.post(
			"/difficulty",
			json={
				"company": "Google",
				"round_type": "system_design",
				"topics": ["System Design", "Distributed Systems"],
				"skip_rate": 0.4,
				"avg_time_seconds": 250,
				"self_rated_difficulty": 4.5,
				"attempt_count": 8,
			},
			headers=auth_headers,
		)
		assert res.status_code == 200
		data = res.json()
		assert 1 <= data["difficulty"] <= 5
		assert data["difficulty_label"] in [
			"Easy",
			"Easy-Medium",
			"Medium",
			"Hard",
			"Expert",
		]
		assert 0.0 <= data["probability"] <= 1.0
		assert len(data["probabilities"]) == 5

	def test_difficulty_shap_values_present(self, client, auth_headers):
		res = client.post(
			"/difficulty",
			json={
				"company": "Amazon",
				"round_type": "technical",
				"topics": ["DSA"],
				"skip_rate": 0.2,
			},
			headers=auth_headers,
		)
		shap = res.json()["shap_values"]
		assert isinstance(shap, list)
		if shap:  # SHAP present when model is loaded
			assert "feature" in shap[0]
			assert "shap_value" in shap[0]
			assert "direction" in shap[0]
			assert shap[0]["direction"] in ["up", "down"]

	def test_hard_question_scores_higher_than_easy(self, client, auth_headers):
		hard = client.post(
			"/difficulty",
			json={
				"company": "Google",
				"round_type": "system_design",
				"topics": ["Distributed Systems", "Scalability"],
				"skip_rate": 0.6,
				"avg_time_seconds": 400,
				"self_rated_difficulty": 5.0,
				"attempt_count": 5,
			},
			headers=auth_headers,
		).json()

		easy = client.post(
			"/difficulty",
			json={
				"company": "Wipro",
				"round_type": "hr",
				"topics": ["HR", "Behavioral"],
				"skip_rate": 0.05,
				"avg_time_seconds": 40,
				"self_rated_difficulty": 1.0,
				"attempt_count": 40,
			},
			headers=auth_headers,
		).json()

		assert hard["difficulty"] >= easy["difficulty"]
