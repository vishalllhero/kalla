from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session


class AICatalogInterface(ABC):
    """Abstract interface for AI catalog generation from text/voice input."""

    @abstractmethod
    async def generate_catalog(self, text: str, language: str = "en", artwork_id: Optional[str] = None) -> Dict[str, Any]:
        """Generate title, description, category, tags, etc. from text input.

        Args:
            text: Input text (transcribed from voice or typed)
            language: Language code (en, hi, etc.)
            artwork_id: Optional artwork ID for context

        Returns:
            Dict with keys: title, description, category, craft, material,
            region, tags, seo_keywords, care_instructions, dimensions,
            production_time_days, confidence_score
        """
        pass


class AIPriceInterface(ABC):
    """Abstract interface for AI-powered price suggestion."""

    @abstractmethod
    async def suggest_price(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Suggest price based on cost inputs and market factors.

        Args:
            inputs: Dict with material_cost, labour_cost, production_time_days,
            craft_type, complexity, region, etc.

        Returns:
            Dict with suggested_price, min_price, max_price, premium_price,
            confidence_score, factors, explanation
        """
        pass


class AIImageInterface(ABC):
    """Abstract interface for AI image enhancement."""

    @abstractmethod
    async def enhance_image(self, image_path: str, operations: List[str], **kwargs) -> Dict[str, Any]:
        """Enhance an image with specified operations.

        Args:
            image_path: Path to the source image
            operations: List of enhancement operations
            **kwargs: Additional parameters (background_type, etc.)

        Returns:
            Dict with enhanced_url, thumbnail_url, is_enhanced, message
        """
        pass

    @abstractmethod
    async def background_removal(self, image_path: str) -> Dict[str, Any]:
        """Remove the background from an image."""
        pass

    @abstractmethod
    async def background_replacement(self, image_path: str, background_type: str) -> Dict[str, Any]:
        """Replace the background of an image."""
        pass

    @abstractmethod
    async def generate_studio_background(self, image_path: str) -> Dict[str, Any]:
        """Generate a professional studio background for an image."""
        pass


class AIRecommendationInterface(ABC):
    """Abstract interface for AI-powered artwork recommendations."""

    @abstractmethod
    async def get_recommendations(
        self, user_id: str, limit: int = 10, recommendation_type: str = "discovery",
        context_artwork_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get personalized artwork recommendations for a user.

        Args:
            user_id: The user to recommend for
            limit: Number of recommendations
            recommendation_type: discovery, similar, wishlist, purchase_history
            context_artwork_id: Optional artwork for similarity-based recs

        Returns:
            List of recommendation dicts with artwork_id, score, reason
        """
        pass

    @abstractmethod
    async def get_b2b_matches(self, request_params: Dict[str, Any], db: Session, limit: int = 10) -> List[Dict[str, Any]]:
        """Match artisans to B2B requests.

        Args:
            request_params: Dict with craft, category, material, region, budget, quantity, etc.
            limit: Number of matches

        Returns:
            List of match dicts with artisan_id, artwork_id, match_score, match_factors
        """
        pass


class AIBase(ABC):
    """Combined interface for all AI services."""

    @abstractmethod
    def get_provider(self) -> str:
        """Return the provider name."""
        pass
