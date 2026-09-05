from typing import Any, Dict, Generic, List, Optional, Type, TypeVar
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc, func
import math

T = TypeVar("T")


class BaseRepository(Generic[T]):
    """Generic repository with basic CRUD operations."""

    def __init__(self, model: Type[T], db: Session):
        self.model = model
        self.db = db

    def get(self, id: Any) -> Optional[T]:
        return self.db.get(self.model, id)

    def get_by(self, **kwargs) -> Optional[T]:
        query = self.db.query(self.model)
        for key, value in kwargs.items():
            query = query.filter(getattr(self.model, key) == value)
        return query.first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[T]:
        return self.db.query(self.model).offset(skip).limit(limit).all()

    def get_many_by(self, skip: int = 0, limit: int = 100, **kwargs) -> List[T]:
        query = self.db.query(self.model)
        for key, value in kwargs.items():
            query = query.filter(getattr(self.model, key) == value)
        return query.order_by(self.model.created_at.desc() if hasattr(self.model, "created_at") else self.model.id).offset(skip).limit(limit).all()

    def create(self, obj_data: Dict[str, Any]) -> T:
        obj = self.model(**obj_data)
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update(self, obj: T, obj_data: Dict[str, Any]) -> T:
        for key, value in obj_data.items():
            if value is not None:
                setattr(obj, key, value)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, id: Any) -> bool:
        obj = self.db.get(self.model, id)
        if not obj:
            return False
        self.db.delete(obj)
        self.db.commit()
        return True

    def search(self, search_term: str, fields: List[str], skip: int = 0, limit: int = 100) -> List[T]:
        ilike_pattern = f"%{search_term}%"
        query = self.db.query(self.model)
        conditions = []
        for field in fields:
            col = getattr(self.model, field, None)
            if col is not None:
                conditions.append(col.ilike(ilike_pattern))
        if conditions:
            query = query.filter(*conditions)
        return query.offset(skip).limit(limit).all()


class PaginatedResult:
    """Helper for paginated results."""

    def __init__(self, items: list, total: int, page: int, limit: int):
        self.items = items
        self.total = total
        self.page = page
        self.limit = limit
        self.pages = math.ceil(total / limit) if limit > 0 else 0
        self.has_next = page < self.pages
        self.has_prev = page > 1

    def to_dict(self):
        return {
            "items": self.items,
            "total": self.total,
            "page": self.page,
            "limit": self.limit,
            "pages": self.pages,
            "has_next": self.has_next,
            "has_prev": self.has_prev,
        }
