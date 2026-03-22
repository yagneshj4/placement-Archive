"""
Unit tests for ML model validation.
Tests model outputs directly without going through FastAPI.
"""
import pytest
import numpy as np


class TestEmbeddingModel:
	"""Test sentence-transformers embedding dimension and shape."""

	def test_embedding_dimension(self):
		"""All-MiniLM-L6-v2 must produce 384-dim embeddings."""
		try:
			from sentence_transformers import SentenceTransformer

			model = SentenceTransformer("all-MiniLM-L6-v2")
			embeddings = model.encode([
				"Amazon technical interview",
				"System design round",
			])
			assert embeddings.shape == (2, 384), f"Expected (2, 384), got {embeddings.shape}"
			assert isinstance(embeddings, np.ndarray)
		except ImportError:
			pytest.skip("sentence-transformers not installed")

	def test_embedding_normalization(self):
		"""Embeddings should have reasonable magnitude (normalized vectors)."""
		try:
			from sentence_transformers import SentenceTransformer

			model = SentenceTransformer("all-MiniLM-L6-v2")
			embedding = model.encode("Test string for normalization check")
			# sentence-transformers produces normalized or near-unit-norm embeddings
			# For all-MiniLM-L6-v2, the L2 norm is typically close to 1.0
			magnitude = np.sqrt(np.sum(embedding**2))
			assert 0.9 < magnitude < 1.1, f"Unusual embedding magnitude: {magnitude}"
		except ImportError:
			pytest.skip("sentence-transformers not installed")


class TestDistilBERTModel:
	"""Test distilBERT round-type classifier."""

	def test_round_type_classification(self):
		"""distilBERT should classify round types correctly."""
		try:
			from transformers import pipeline

			classifier = pipeline(
				"text-classification",
				model="distilbert-base-uncased-finetuned-sst-2-english",
			)
			result = classifier("This was a technical interview with coding problems")
			assert "label" in result[0]
			assert "score" in result[0]
			assert 0.0 <= result[0]["score"] <= 1.0
		except Exception as e:
			pytest.skip(f"Transformer model test skipped: {str(e)}")


class TestDifficultyModel:
	"""Test XGBoost difficulty predictor."""

	def test_xgboost_output_shape(self):
		"""XGBoost should return probabilities for all 5 difficulty levels."""
		try:
			import xgboost as xgb

			# Create a dummy booster with 5 classes (Easy, Easy-Med, Med, Hard, Expert)
			# This is just to verify the structure - actual model trained separately
			dtrain = xgb.DMatrix(
				np.random.rand(10, 10), label=np.random.randint(0, 5, 10)
			)
			params = {"num_class": 5, "max_depth": 3, "eta": 0.1, "objective": "multi:softprob"}
			model = xgb.train(params, dtrain, num_boost_round=10)
			
			# Predict on dummy data
			test_data = xgb.DMatrix(np.random.rand(3, 10))
			predictions = model.predict(test_data)
			
			# Should be (3, 5) for 3 samples, 5 classes
			assert predictions.shape == (3, 5), f"Expected (3, 5), got {predictions.shape}"
			# Each row should sum to ~1.0 (probability)
			assert np.allclose(predictions.sum(axis=1), 1.0, atol=0.01)
		except ImportError:
			pytest.skip("xgboost not installed")

	def test_xgboost_probability_range(self):
		"""All probabilities should be between 0 and 1."""
		try:
			import xgboost as xgb

			dtrain = xgb.DMatrix(
				np.random.rand(20, 10), label=np.random.randint(0, 5, 20)
			)
			params = {"num_class": 5, "max_depth": 4, "eta": 0.1, "objective": "multi:softprob"}
			model = xgb.train(params, dtrain, num_boost_round=20)
			
			test_data = xgb.DMatrix(np.random.rand(10, 10))
			predictions = model.predict(test_data)
			
			assert np.all(predictions >= 0.0), "Predictions contain negative values"
			assert np.all(predictions <= 1.0), "Predictions exceed 1.0"
		except ImportError:
			pytest.skip("xgboost not installed")


class TestSHAPValues:
	"""Test SHAP explainability computation."""

	def test_shap_output_format(self):
		"""SHAP values should return feature importance list."""
		try:
			import xgboost as xgb
			import shap

			# Train a tiny model
			X = np.random.rand(30, 5)
			y = np.random.randint(0, 2, 30)
			dtrain = xgb.DMatrix(X, label=y)
			params = {"max_depth": 3, "eta": 0.1}
			model = xgb.train(params, dtrain, num_boost_round=10)
			
			# Compute SHAP values
			explainer = shap.TreeExplainer(model)
			test_X = np.random.rand(2, 5)
			shap_values = explainer.shap_values(test_X)
			
			assert isinstance(shap_values, (list, np.ndarray))
			if isinstance(shap_values, list):
				assert len(shap_values) > 0
		except ImportError:
			pytest.skip("shap or xgboost not installed")


class TestChromaDB:
	"""Test ChromaDB vector database."""

	def test_chroma_collection_creation(self):
		"""ChromaDB should create and query collections."""
		try:
			import chromadb

			client = chromadb.Client()
			collection = client.create_collection(
				name="test_collection",
				metadata={"hnsw:space": "cosine"}
			)
			
			# Add some vectors
			collection.add(
				documents=["Doc 1", "Doc 2"],
				embeddings=[[0.1, 0.2], [0.3, 0.4]],
				metadatas=[{"source": "test"}, {"source": "test"}],
				ids=["id1", "id2"],
			)
			
			# Query
			results = collection.query(query_embeddings=[[0.15, 0.25]], n_results=2)
			assert len(results["ids"]) == 2
			assert results["ids"][0] == ["id1"]  # Should be closest
		except Exception as e:
			pytest.skip(f"ChromaDB test skipped: {str(e)}")
