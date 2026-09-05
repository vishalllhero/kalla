from .base import (
    AICatalogInterface, AIPriceInterface, AIImageInterface,
    AIRecommendationInterface, AIBase
)
from .mock import (
    MockAICatalogService, MockAIPriceService, MockAIImageService,
    MockAIRecommendationService
)
from ...core.config import settings


class AIServiceFactory:
    """Factory to get the appropriate AI service implementation based on config."""

    _catalog_service: AICatalogInterface | None = None
    _price_service: AIPriceInterface | None = None
    _image_service: AIImageInterface | None = None
    _recommendation_service: AIRecommendationInterface | None = None

    @classmethod
    def get_catalog_service(cls) -> AICatalogInterface:
        if cls._catalog_service is None:
            provider = settings.AI_PROVIDER
            if provider == "openai" and settings.OPENAI_API_KEY:
                from ..ai.openai import OpenAICatalogService
                cls._catalog_service = OpenAICatalogService()
            else:
                cls._catalog_service = MockAICatalogService()
        return cls._catalog_service

    @classmethod
    def get_price_service(cls) -> AIPriceInterface:
        if cls._price_service is None:
            provider = settings.AI_PROVIDER
            if provider == "openai" and settings.OPENAI_API_KEY:
                from ..ai.openai import OpenAIPriceService
                cls._price_service = OpenAIPriceService()
            else:
                cls._price_service = MockAIPriceService()
        return cls._price_service

    @classmethod
    def get_image_service(cls) -> AIImageInterface:
        if cls._image_service is None:
            provider = settings.AI_IMAGE_MODEL
            if provider == "openai" and settings.OPENAI_API_KEY:
                from ..ai.openai import OpenAIImageService
                cls._image_service = OpenAIImageService()
            else:
                cls._image_service = MockAIImageService()
        return cls._image_service

    @classmethod
    def get_recommendation_service(cls) -> AIRecommendationInterface:
        if cls._recommendation_service is None:
            provider = settings.AI_PROVIDER
            if provider == "openai" and settings.OPENAI_API_KEY:
                from ..ai.openai import OpenAIRecommendationService
                cls._recommendation_service = OpenAIRecommendationService()
            else:
                cls._recommendation_service = MockAIRecommendationService()
        return cls._recommendation_service

    @classmethod
    def is_mock_mode(cls) -> bool:
        return settings.AI_PROVIDER == "mock" or (not settings.OPENAI_API_KEY)


# Convenience functions
def get_ai_catalog_service() -> AICatalogInterface:
    return AIServiceFactory.get_catalog_service()


def get_ai_price_service() -> AIPriceInterface:
    return AIServiceFactory.get_price_service()


def get_ai_image_service() -> AIImageInterface:
    return AIServiceFactory.get_image_service()


def get_ai_recommendation_service() -> AIRecommendationInterface:
    return AIServiceFactory.get_recommendation_service()
