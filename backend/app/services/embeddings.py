from __future__ import annotations

import hashlib
import logging
from typing import List

from app.core.config import settings

logger = logging.getLogger(__name__)


class LocalHashEmbeddings:
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [self._hash(t) for t in texts]

    def embed_query(self, text: str) -> List[float]:
        return self._hash(text)

    def _hash(self, text: str) -> List[float]:
        digest = hashlib.sha256(text.encode("utf-8")).digest()
        return [b / 255 for b in digest]


class SafeEmbeddings:
    def __init__(self, primary, fallback):
        self.primary = primary
        self.fallback = fallback

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        try:
            return self.primary.embed_documents(texts)
        except Exception as exc:
            logger.warning("Primary embeddings failed, falling back to hash: %s", exc)
            return self.fallback.embed_documents(texts)

    def embed_query(self, text: str) -> List[float]:
        try:
            return self.primary.embed_query(text)
        except Exception as exc:
            logger.warning("Primary query embedding failed, falling back to hash: %s", exc)
            return self.fallback.embed_query(text)


def get_embeddings():
    if settings.GOOGLE_API_KEY:
        try:
            from langchain_google_genai import GoogleGenerativeAIEmbeddings
            primary = GoogleGenerativeAIEmbeddings(
                google_api_key=settings.GOOGLE_API_KEY,
                model="models/text-embedding-004",
            )
            return SafeEmbeddings(primary, LocalHashEmbeddings())
        except Exception:
            return LocalHashEmbeddings()
    return LocalHashEmbeddings()
