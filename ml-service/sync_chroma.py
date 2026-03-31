"""
Re-sync ChromaDB with real MongoDB experiences.
Fetches all experiences from MongoDB via the Node.js API,
then embeds and indexes them into ChromaDB.
"""
import sys
import os
import json
import logging

sys.path.insert(0, os.getcwd())

import httpx
from services.embedding import load_model, encode_batch
from services.vector_store import init_chroma, get_collection, add_embeddings_batch

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

NODE_URL = os.environ.get("NODE_BACKEND_URL", "http://localhost:5000")


def fetch_all_experiences():
    """Fetch all experiences from MongoDB via the Node.js API."""
    all_experiences = []
    page = 1
    
    while True:
        try:
            resp = httpx.get(
                f"{NODE_URL}/api/experiences",
                params={"page": page, "limit": 50},
                timeout=30,
            )
            data = resp.json()
            
            if not data.get("success"):
                logger.error(f"API error: {data}")
                break
            
            experiences = data.get("data", {}).get("experiences", [])
            if not experiences:
                break
            
            all_experiences.extend(experiences)
            logger.info(f"Fetched page {page}: {len(experiences)} experiences")
            
            pagination = data.get("data", {}).get("pagination", {})
            if page >= pagination.get("pages", 1):
                break
            page += 1
            
        except Exception as e:
            logger.error(f"Failed to fetch page {page}: {e}")
            break
    
    return all_experiences


def build_embedding_text(exp):
    """Build rich text for embedding from an experience document."""
    parts = []
    
    company = exp.get("company", "")
    role = exp.get("role", "")
    round_type = exp.get("roundType", "")
    year = exp.get("year", "")
    narrative = exp.get("narrative", "")
    tips = exp.get("preparationTips", "") or exp.get("tips", "")
    
    if company:
        parts.append(f"Company: {company}")
    if role:
        parts.append(f"Role: {role}")
    if round_type:
        parts.append(f"Round: {round_type.replace('_', ' ')}")
    if year:
        parts.append(f"Year: {year}")
    if narrative:
        parts.append(f"Experience: {narrative}")
    if tips:
        parts.append(f"Tips: {tips}")
    
    return " | ".join(parts)


def build_metadata(exp):
    """Build ChromaDB metadata from an experience document."""
    meta = {}
    if exp.get("company"):
        meta["company"] = exp["company"]
    if exp.get("role"):
        meta["role"] = exp["role"]
    if exp.get("roundType"):
        meta["roundType"] = exp["roundType"]
    if exp.get("year"):
        meta["year"] = int(exp["year"])
    
    # Store a preview of the narrative for the RAG answer builder
    narrative = exp.get("narrative", "")
    if narrative:
        meta["narrative_preview"] = narrative[:500]
    
    tips = exp.get("preparationTips", "") or exp.get("tips", "")
    if tips:
        meta["tips_preview"] = tips[:200]
    
    if exp.get("offerReceived") is not None:
        meta["offerReceived"] = str(exp["offerReceived"])
    
    topics = exp.get("extractedTags", {}).get("topics", [])
    if topics:
        meta["topics"] = ", ".join(topics[:10])
    
    return meta


def main():
    print("=" * 60)
    print("🔄 ChromaDB Re-Sync with MongoDB Experiences")
    print("=" * 60)
    
    # Step 1: Load the embedding model
    print("\n📦 Loading embedding model...")
    load_model()
    
    # Step 2: Initialize ChromaDB
    print("🗄️  Initializing ChromaDB...")
    init_chroma()
    collection = get_collection("experiences")
    
    # Step 3: Clear old test data
    old_count = collection.count()
    if old_count > 0:
        print(f"🧹 Clearing {old_count} old entries from ChromaDB...")
        # Get all IDs and delete them
        all_ids = collection.get(limit=old_count)["ids"]
        if all_ids:
            collection.delete(ids=all_ids)
        print(f"   ✅ Cleared {len(all_ids)} entries")
    
    # Step 4: Fetch all experiences from MongoDB
    print("\n📡 Fetching experiences from MongoDB...")
    experiences = fetch_all_experiences()
    print(f"   Found {len(experiences)} experiences in MongoDB")
    
    if not experiences:
        print("⚠️  No experiences found. Make sure the Node.js server is running!")
        return
    
    # Step 5: Build texts and metadata for embedding (with deduplication)
    print("\n🧮 Preparing texts for embedding...")
    texts = []
    doc_ids = []
    metadatas = []
    seen_ids = set()
    
    for exp in experiences:
        exp_id = exp.get("_id")
        if not exp_id or str(exp_id) in seen_ids:
            continue
        seen_ids.add(str(exp_id))
        
        text = build_embedding_text(exp)
        if len(text) < 20:
            continue
        
        meta = build_metadata(exp)
        
        texts.append(text)
        doc_ids.append(str(exp_id))
        metadatas.append(meta)
    
    print(f"   Prepared {len(texts)} unique experiences for embedding")
    
    # Step 6: Batch embed
    print("\n🔢 Generating embeddings (this may take a moment)...")
    embeddings = encode_batch(texts)
    print(f"   ✅ Generated {len(embeddings)} embeddings")
    
    # Step 7: Store in ChromaDB
    print("\n💾 Storing in ChromaDB...")
    count = add_embeddings_batch(
        collection_name="experiences",
        doc_ids=doc_ids,
        embeddings=embeddings,
        metadatas=metadatas,
    )
    
    print(f"\n{'=' * 60}")
    print(f"✅ SUCCESS! Indexed {count} real experiences into ChromaDB")
    print(f"   Companies: {', '.join(sorted(set(m.get('company', '?') for m in metadatas)))}")
    print(f"   Years: {', '.join(sorted(set(str(m.get('year', '?')) for m in metadatas), reverse=True))}")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
