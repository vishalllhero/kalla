import os
import hashlib
from typing import Optional
from ...core.config import settings


class LocalStorageService:
    """Local file storage service (simulates cloud storage / IPFS)."""

    def __init__(self):
        self.base_path = os.path.abspath(settings.LOCAL_STORAGE_PATH)
        os.makedirs(self.base_path, exist_ok=True)
        os.makedirs(os.path.join(self.base_path, "thumbnails"), exist_ok=True)
        os.makedirs(os.path.join(self.base_path, "enhanced"), exist_ok=True)
        os.makedirs(os.path.join(self.base_path, "certificates"), exist_ok=True)
        os.makedirs(os.path.join(self.base_path, "qrcodes"), exist_ok=True)

    def save_file(self, filename: str, content: bytes, subdir: str = "") -> str:
        """Save a file and return the path."""
        dir_path = os.path.join(self.base_path, subdir) if subdir else self.base_path
        os.makedirs(dir_path, exist_ok=True)
        filepath = os.path.join(dir_path, filename)
        with open(filepath, "wb") as f:
            f.write(content)
        return filepath

    def save_upload_file(self, file, subdir: str = "") -> dict:
        """Save an uploaded file (FastAPI UploadFile). Returns file info dict."""
        import shutil
        filename = file.filename or "unnamed"
        safe_name = self._sanitize_filename(filename)
        dir_path = os.path.join(self.base_path, subdir) if subdir else self.base_path
        os.makedirs(dir_path, exist_ok=True)
        filepath = os.path.join(dir_path, safe_name)
        with open(filepath, "wb") as f:
            shutil.copyfileobj(file.file, f)
        file_size = os.path.getsize(filepath)
        return {
            "filename": safe_name,
            "filepath": filepath,
            "size": file_size,
            "url": self.get_url(safe_name, subdir),
            "thumbnail_url": self.get_thumbnail_url(safe_name, subdir),
        }

    def get_url(self, filename: str, subdir: str = "") -> str:
        """Get the public URL for a file."""
        base = f"/uploads/{subdir}" if subdir else "/uploads"
        return f"{base}/{filename}".replace("//", "/")

    def get_thumbnail_url(self, filename: str, subdir: str = "") -> str:
        """Generate a thumbnail URL (in real impl, would generate actual thumbnail)."""
        return self.get_url(filename, "thumbnails/" + (subdir or ""))

    def get_ipfs_cid(self, data: dict) -> str:
        """Generate a mock IPFS CID for metadata."""
        serialized = str(sorted(data.items()))
        return "Qm" + hashlib.sha256(serialized.encode()).hexdigest()[:44]

    def get_metadata_hash(self, data: dict) -> str:
        """Compute a deterministic hash of metadata."""
        import json
        serialized = json.dumps(data, sort_keys=True, default=str)
        return hashlib.sha256(serialized.encode()).hexdigest()

    def _sanitize_filename(self, filename: str) -> str:
        """Remove path components and special characters from filename."""
        filename = os.path.basename(filename)
        name, ext = os.path.splitext(filename)
        name = "".join(c for c in name if c.isalnum() or c in ("-", "_"))
        ext = "".join(c for c in ext if c.isalnum() or c in (".", "-"))
        if not ext:
            ext = ".jpg"
        return f"{name}{ext}"

    def ensure_dir(self, subdir: str) -> str:
        path = os.path.join(self.base_path, subdir)
        os.makedirs(path, exist_ok=True)
        return path

    def file_exists(self, filepath: str) -> bool:
        return os.path.exists(filepath)
