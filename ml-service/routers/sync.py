import httpx
import logging
from fastapi import APIRouter, HTTPException, BackgroundTasks
from config.settings import settings
from services.vector_store import get_collection
from services.embedding import get_embeddings

router = APIRouter(prefix="/sync", tags=["Maintenance"])
logger = logging.getLogger(__name__)

async def run_sync():
    """Background task to sync experiences from Node.js to ChromaDB"""
    try:
        NODE_URL = settings.node_backend_url or "https://placement-archive-api.onrender.com"
        logger.info(f"🔄 Starting background sync from {NODE_URL}")
        
        collection = get_collection()
        
        # 1. Fetch from Node.js
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.get(f"{NODE_URL}/api/experiences", params={"limit": 1000})
            if resp.status_code != 200:
                logger.error(f"❌ Failed to fetch: {resp.text}")
                return
                
            data = resp.json()
            experiences = data.get("data", {}).get("experiences", [])
            
            if not experiences:
                logger.warning("⚠️ No experiences found to sync")
                return

        # 2. Clear old data (optional, but cleaner for full re-sync)
        # collection.delete(where={}) # Be careful with this
        
        # 3. Process tags/text
        ids = []
        texts = []
        metadatas = []
        
        for exp in experiences:
            exp_id = str(exp.get("_id"))
            company = exp.get("company", "Unknown")
            role = exp.get("role", "Unknown")
            narrative = exp.get("narrative", "")
            
            # Create a rich text for embedding
            text = f"Company: {company}\nRole: {role}\nExperience: {narrative}"
            
            ids.append(exp_id)
            texts.append(text)
            metadatas.append({
                "company": company,
                "role": role,
                "year": exp.get("year", 0),
                "roundType": exp.get("roundType", "Other")
            })

        # 4. Generate Embeddings
        logger.info(f"🔢 Generating embeddings for {len(texts)} items...")
        embeddings = get_embeddings(texts)
        
        # 5. Store in Chroma
        collection.upsert(
            ids=ids,
            documents=texts,
            embeddings=embeddings,
            metadatas=metadatas
        )
        
        logger.info(f"✅ Sync complete: Indexed {len(ids)} experiences")

    except Exception as e:
        logger.error(f"❌ Sync failed: {str(e)}")

@router.post("/")
async def trigger_sync(background_tasks: BackgroundTasks):
    """Trigger a re-sync from MongoDB to ChromaDB"""
    background_tasks.add_task(run_sync)
    return {"message": "Sync started in background", "status": "processing"}
