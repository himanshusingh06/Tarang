from __future__ import annotations

from typing import List

from app.services.embeddings import get_embeddings
from app.core.config import settings
import os
import hashlib
import logging

try:
    import chromadb
except Exception:  # pragma: no cover
    chromadb = None


class VectorIndex:
    def __init__(self):
        self.embeddings = get_embeddings()
        self.index = []
        self.documents = []

    def add_texts(self, texts: List[str], metadatas: List[dict]):
        vectors = self.embeddings.embed_documents(texts)
        for vec, meta, text in zip(vectors, metadatas, texts):
            self.index.append(vec)
            self.documents.append({"text": text, "metadata": meta})

    def similarity_search(self, query: str, k: int = 5):
        query_vec = self.embeddings.embed_query(query)

        def cosine(a, b):
            dot = sum(x * y for x, y in zip(a, b))
            na = sum(x * x for x in a) ** 0.5
            nb = sum(x * x for x in b) ** 0.5
            return dot / (na * nb + 1e-9)

        scored = []
        for vec, doc in zip(self.index, self.documents):
            score = cosine(query_vec, vec)
            scored.append((score, doc))
        scored.sort(key=lambda x: x[0], reverse=True)
        return scored[:k]


_vector_index: VectorIndex | None = None
logger = logging.getLogger(__name__)


class ChromaIndex:
    def __init__(self, client, collection_name: str):
        self.embeddings = get_embeddings()
        self.client = client
        self.collection = self.client.get_or_create_collection(name=collection_name)

    def reset(self):
        try:
            self.client.delete_collection(name=self.collection.name)
        except Exception:
            pass
        self.collection = self.client.get_or_create_collection(name=self.collection.name)

    def add_texts(self, texts: List[str], metadatas: List[dict]):
        ids = []
        for text, meta in zip(texts, metadatas):
            key = f"{text}|{sorted(meta.items())}"
            digest = hashlib.sha1(key.encode("utf-8")).hexdigest()
            ids.append(f"doc_{digest}")
        embeddings = self.embeddings.embed_documents(texts)
        if hasattr(self.collection, "upsert"):
            self.collection.upsert(
                documents=texts,
                metadatas=metadatas,
                embeddings=embeddings,
                ids=ids,
            )
        else:
            self.collection.add(
                documents=texts,
                metadatas=metadatas,
                embeddings=embeddings,
                ids=ids,
            )

    def similarity_search(self, query: str, k: int = 5):
        query_vec = self.embeddings.embed_query(query)
        results = self.collection.query(
            query_embeddings=[query_vec],
            n_results=k,
            include=["documents", "metadatas", "distances"],
        )
        docs = []
        for doc, meta, dist in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0],
        ):
            score = 1 / (1 + dist)
            docs.append((score, {"text": doc, "metadata": meta}))
        return docs


async def build_index(audio_programs: List[dict], knowledge_chunks: List[dict]):
    global _vector_index
    if (
        chromadb is not None
        and settings.CHROMA_TENANT
        and settings.CHROMA_DATABASE
        and settings.CHROMA_API_KEY
    ):
        try:
            client = chromadb.CloudClient(
                tenant=settings.CHROMA_TENANT,
                database=settings.CHROMA_DATABASE,
                api_key=settings.CHROMA_API_KEY,
                cloud_host=settings.CHROMA_CLOUD_HOST,
                cloud_port=settings.CHROMA_CLOUD_PORT,
                enable_ssl=True,
            )
            index = ChromaIndex(client=client, collection_name=settings.CHROMA_COLLECTION)
            if settings.CHROMA_RESET:
                index.reset()
        except Exception as exc:
            logger.warning("Chroma cloud unavailable, falling back to local index: %s", exc)
            index = VectorIndex()
    elif chromadb is not None:
        os.makedirs(settings.VECTOR_DB_PATH, exist_ok=True)
        client = chromadb.PersistentClient(path=settings.VECTOR_DB_PATH)
        index = ChromaIndex(client=client, collection_name=settings.CHROMA_COLLECTION)
        if settings.CHROMA_RESET:
            index.reset()
    else:
        index = VectorIndex()
    texts = []
    metas = []
    for program in audio_programs:
        text = (
            f"{program['name']} {program['frequency']} {program['brainwave_type']} "
            f"{program.get('benefits','')} {program.get('tags','')}"
        )
        texts.append(text)
        metas.append(
            {
                "type": "audio_program",
                "id": program["id"],
                "name": program["name"],
                "brainwave_type": program.get("brainwave_type"),
                "chakra": program.get("chakra"),
                "frequency": program.get("frequency"),
                "tags": program.get("tags"),
                "benefits": program.get("benefits"),
            }
        )
    for chunk in knowledge_chunks:
        texts.append(chunk["text"])
        metas.append({"type": "knowledge", "source": chunk["source"]})
    index.add_texts(texts, metas)
    _vector_index = index


async def search(query: str, k: int = 5):
    if _vector_index is None:
        return []
    return _vector_index.similarity_search(query, k=k)
