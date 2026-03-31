"""Quick script to inspect what's actually stored in ChromaDB metadata."""
import sys, os
sys.path.insert(0, os.getcwd())

from services.vector_store import init_chroma, get_collection

init_chroma()
col = get_collection("experiences")
print(f"Total documents: {col.count()}")

# Get a sample of 3 documents to see what metadata fields exist
results = col.get(limit=3, include=["metadatas", "documents"])

for i in range(min(3, len(results["ids"]))):
    print(f"\n{'='*60}")
    print(f"Doc ID: {results['ids'][i]}")
    print(f"Metadata keys: {list(results['metadatas'][i].keys())}")
    for key, val in results['metadatas'][i].items():
        val_str = str(val)[:200]
        print(f"  {key}: {val_str}")
    if results.get("documents") and results["documents"][i]:
        print(f"  [document text]: {str(results['documents'][i])[:300]}")
