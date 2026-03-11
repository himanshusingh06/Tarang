import os


def load_knowledge_chunks():
    base_dir = os.path.join(os.path.dirname(__file__), "knowledge_base")
    chunks = []
    for filename in os.listdir(base_dir):
        if not filename.endswith(".md"):
            continue
        path = os.path.join(base_dir, filename)
        with open(path, "r", encoding="utf-8") as f:
            text = f.read()
        chunks.append({"text": text, "source": filename})
    return chunks
