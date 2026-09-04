import abc
from pathlib import Path

from apps.api.config import settings


class StorageProvider(abc.ABC):
    @abc.abstractmethod
    async def save_file(self, file_bytes: bytes, relative_path: str) -> str:
        pass

    @abc.abstractmethod
    async def get_file(self, relative_path: str) -> bytes:
        pass


class LocalStorageProvider(StorageProvider):
    def __init__(self, base_path: str = settings.STORAGE_PATH):
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)

    async def save_file(self, file_bytes: bytes, relative_path: str) -> str:
        target_path = self.base_path / relative_path
        target_path.parent.mkdir(parents=True, exist_ok=True)
        with open(target_path, "wb") as f:
            f.write(file_bytes)
        return str(target_path.as_posix())

    async def get_file(self, relative_path: str) -> bytes:
        target_path = self.base_path / relative_path
        with open(target_path, "rb") as f:
            return f.read()


def get_storage_provider() -> StorageProvider:
    return LocalStorageProvider()
