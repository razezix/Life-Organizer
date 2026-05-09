import warnings

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_INSECURE_DEFAULTS = {
    "change-me-to-a-very-long-random-secret-key-in-production",
    "CHANGE_ME_generate_with_openssl_rand_hex_32",
}


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @model_validator(mode="after")
    def _check_secret_key(self):
        if self.SECRET_KEY in _INSECURE_DEFAULTS:
            warnings.warn(
                "SECRET_KEY is set to an insecure default! "
                "Generate a real key: python -c \"import secrets; print(secrets.token_hex(32))\"",
                stacklevel=2,
            )
        return self


settings = Settings()
