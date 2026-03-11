from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "DHUN AI"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "CHANGE_ME"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    DATABASE_URL: str = "postgresql+asyncpg://postgres:Himanshu%401@localhost:5432/dhun"
    GOOGLE_API_KEY: str | None = None
    CHROMA_API_KEY: str | None = None
    CHROMA_TENANT: str | None = None
    CHROMA_DATABASE: str | None = None
    CHROMA_COLLECTION: str = "dhun_ai"
    CHROMA_CLOUD_HOST: str = "api.trychroma.com"
    CHROMA_CLOUD_PORT: int = 443
    CHROMA_RESET: bool = False
    AUDIO_STORAGE_PATH: str = "./audio"
    VECTOR_DB_PATH: str = "./vector_db"
    RAG_CHUNK_SIZE: int = 800
    RAG_CHUNK_OVERLAP: int = 120
    ENV: str = "development"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
