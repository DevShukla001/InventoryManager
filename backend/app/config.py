from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql://inventory:inventory@db:5432/inventory_db"
    cors_origins: str = "http://localhost:3000,http://localhost:5173"
    low_stock_threshold: int = 10

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
