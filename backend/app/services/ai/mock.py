import random
from typing import Dict, Any, List, Optional
from datetime import datetime
from uuid import uuid4

from sqlalchemy.orm import Session

from .base import (
    AICatalogInterface, AIPriceInterface, AIImageInterface,
    AIRecommendationInterface, AIBase
)
from ...core.config import settings
from ...models.user import User, ArtisanProfile
from ...models.artwork import Artwork
from ...models.b2b_ai import B2BRequest

CRAFTS = [
    "Blue Pottery", "Madhubani Painting", "Pattachitra", "Warli Art",
    "Phulkari", "Banarasi Weaving", "Dhokra", "Wood Carving",
    "Terracotta", "Handloom Textiles", "Brass Casting", "Stone Carving",
    "Paper Mache", "Block Printing", "Tie and Dye", "Zari Work",
    "Kalamkari", "Gond Painting", "Mithila Painting", "Kantha Embroidery",
]

MATERIALS = [
    "Ceramic", "Terracotta", "Cotton", "Silk", "Wood", "Brass",
    "Stone", "Clay", "Metal", "Bamboo", "Jute", "Cane",
    "Paper", "Fabric", "Leather", "Glass", "Copper", "Silver",
]

REGIONS = [
    "Jaipur, Rajasthan", "Varanasi, Uttar Pradesh", "Patna, Bihar",
    "Mumbai, Maharashtra", "Kolkata, West Bengal", "Chennai, Tamil Nadu",
    "Hyderabad, Telangana", "Bengaluru, Karnataka", "Pune, Maharashtra",
    "Ahmedabad, Gujarat", "Lucknow, Uttar Pradesh", "Chandigarh, Chandigarh",
]

REGIONS_IN_HINDI = {
    "en": {
        "Jaipur, Rajasthan": "Jaipur, Rajasthan",
        "Varanasi, Uttar Pradesh": "Varanasi, Uttar Pradesh",
        "Patna, Bihar": "Patna, Bihar",
    },
    "hi": {
        "Blue Pottery": "नीली मिट्टी की मूर्ति",
        "Madhubani Painting": "मधुबनी चित्रण",
        "Pattachitra": "पटचित्रा",
        "Warli Art": "वार्ली कला",
        "Phulkari": "फूलकरी",
        "Terracotta": "टेराकोटा",
        "Handloom Textiles": "हस्तकुंभलुई बुनावट वाले वस्त्र",
        "Wood Carving": "लकड़ी के नक़की",
    },
}


class MockAICatalogService(AICatalogInterface, AIBase):
    """Mock AI catalog generation service that produces realistic output."""

    def get_provider(self) -> str:
        return "mock"

    async def generate_catalog(self, text: str, language: str = "en", artwork_id: Optional[str] = None) -> Dict[str, Any]:
        """Generate catalog data from text input using rule-based mock logic."""
        import asyncio
        await asyncio.sleep(0.5)

        lower_text = text.lower()

        craft = self._detect_craft(lower_text)
        material = self._detect_material(lower_text)
        region = self._detect_region(lower_text)
        title = self._generate_title(craft, material, region)
        description = self._generate_description(text, craft, material, region, language)
        tags = self._generate_tags(craft, material, region)
        seo_keywords = tags + [craft.lower().replace(" ", "_"), material.lower(), region.split(",")[0].lower()]
        care = self._generate_care_instructions(craft, material)
        dimensions = self._generate_dimensions(craft)
        prod_time = self._generate_production_time(craft)

        return {
            "title": title,
            "description": description,
            "category": "Handicraft",
            "craft": craft,
            "material": material,
            "region": region,
            "tags": tags,
            "seo_keywords": seo_keywords,
            "care_instructions": care,
            "dimensions": dimensions,
            "production_time_days": prod_time,
            "confidence_score": round(random.uniform(0.85, 0.98), 2),
            "_provider": "mock",
            "_language": language,
        }

    def _detect_craft(self, text: str) -> str:
        for craft in CRAFTS:
            if craft.lower() in text:
                return craft
        return random.choice(CRAFTS)

    def _detect_material(self, text: str) -> str:
        for mat in MATERIALS:
            if mat.lower() in text:
                return mat
        return random.choice(MATERIALS)

    def _detect_region(self, text: str) -> str:
        for region in REGIONS:
            if region.lower().split(",")[0] in text:
                return region
        return random.choice(REGIONS)

    def _generate_title(self, craft: str, material: str, region: str) -> str:
        adjectives = ["Handcrafted", "Traditional", "Artisan", "Authentic", "Premium", "Heritage", "Master"]
        adj = random.choice(adjectives)
        city = region.split(",")[0]
        return f"{adj} {craft} {material} Artwork from {city}"

    def _generate_description(self, text: str, craft: str, material: str, region: str, language: str) -> str:
        city = region.split(",")[0]
        state = region.split(",")[1].strip() if "," in region else "India"

        descriptions = [
            f"This authentic handmade {craft} artwork is crafted from {material} by skilled artisans in {city}, {state}. Each piece is unique and tells a story of traditional craftsmanship passed down through generations.",
            f"A beautiful {craft} creation made from {material} in {city}, {state}. This piece showcases the rich artistic heritage of Indian handicrafts, with intricate details that reflect the artisan's dedication to their craft.",
            f"Handcrafted {craft} from {city}, {state} using premium {material}. This artwork represents the timeless tradition of Indian artisan craftsmanship, blending traditional techniques with artistic mastery.",
        ]
        return random.choice(descriptions)

    def _generate_tags(self, craft: str, material: str, region: str) -> List[str]:
        city = region.split(",")[0]
        return [craft, material, city, "handmade", "artisan", "traditional", "gift"]

    def _generate_care_instructions(self, craft: str, material: str) -> str:
        instructions = {
            "Ceramic": "Clean with a soft dry cloth. Avoid exposure to water and humidity.",
            "Terracotta": "Wipe with a soft cloth. Apply natural oil periodically to preserve the surface.",
            "Cotton": "Hand wash gently in cold water. Do not use bleach. Air dry in shade.",
            "Silk": "Dry clean only. Store in a cool, dry place away from direct sunlight.",
            "Wood": "Wipe with a damp cloth. Apply wood polish periodically. Avoid water damage.",
            "Brass": "Clean with a soft cloth. Apply brass polish to maintain shine. Avoid moisture.",
        }
        for key in instructions:
            if key.lower() in material.lower():
                return instructions[key]
        return "Handle with care. Clean gently with a soft, dry cloth. Keep away from direct sunlight and moisture."

    def _generate_dimensions(self, craft: str) -> str:
        sizes = ["12 x 8 x 8 inches", "10 x 10 inches", "8 x 6 inches", "15 x 12 inches", "6 inch diameter"]
        return random.choice(sizes)

    def _generate_production_time(self, craft: str) -> int:
        times = {"Phulkari": 15, "Kalamkari": 10, "Madhubani Painting": 8, "Warli Art": 5, "Blue Pottery": 7}
        for key, val in times.items():
            if key.lower() in craft.lower():
                return val
        return random.randint(3, 14)


class MockAIPriceService(AIPriceInterface, AIBase):
    """Mock AI price suggestion service."""

    def get_provider(self) -> str:
        return "mock"

    async def suggest_price(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        import asyncio
        await asyncio.sleep(0.3)

        material_cost = int(inputs.get("material_cost", 500))
        labour_cost = int(inputs.get("labour_cost", 500))
        production_time = int(inputs.get("production_time_days", 5))
        craft = inputs.get("craft_type", "Handicraft")
        region = inputs.get("region", "India")
        complexity = inputs.get("complexity", "medium")

        base_cost = material_cost + labour_cost

        complexity_multiplier = {"low": 0.2, "medium": 0.5, "high": 1.0}
        complexity_factor = complexity_multiplier.get(complexity, 0.5)

        time_factor = min(production_time / 7.0, 2.0)

        craft_multiplier = 1.0
        craft_premium = {
            "Blue Pottery": 1.3,
            "Madhubani Painting": 1.4,
            "Pattachitra": 1.5,
            "Warli Art": 1.2,
            "Terracotta": 1.1,
            "Brass Casting": 1.3,
            "Wood Carving": 1.25,
        }
        for key, val in craft_premium.items():
            if key.lower() in craft.lower():
                craft_multiplier = val
                break

        market_multiplier = random.uniform(1.8, 2.5) * craft_multiplier

        suggested = int(base_cost * market_multiplier * (1 + complexity_factor + time_factor * 0.1))
        min_price = int(suggested * 0.88)
        max_price = int(suggested * 1.12)
        premium_price = int(suggested * 1.3)

        confidence = 0.82
        if production_time >= 7:
            confidence += 0.05
        if complexity == "high":
            confidence += 0.03

        factors = {
            "material_cost": material_cost,
            "labour_cost": labour_cost,
            "production_time_days": production_time,
            "craft_premium": craft_multiplier,
            "market_multiplier": round(market_multiplier, 2),
            "complexity_factor": complexity_factor,
            "time_factor": round(time_factor, 2),
        }

        return {
            "suggested_price": suggested,
            "min_price": min_price,
            "max_price": max_price,
            "premium_price": premium_price,
            "confidence_score": round(min(confidence, 0.99), 2),
            "factors": factors,
            "explanation": (
                f"Based on material cost (₹{material_cost}) + labor cost (₹{labour_cost}) = "
                f"base cost ₹{base_cost}. Applied craft premium ({craft_multiplier}x for {craft}), "
                f"market multiplier ({round(market_multiplier, 2)}x), and complexity/time adjustments. "
                f"Suggested price: ₹{suggested}. Price range: ₹{min_price}–₹{max_price}."
            ),
        }


class MockAIImageService(AIImageInterface, AIBase):
    """Mock AI image enhancement service."""

    def get_provider(self) -> str:
        return "mock"

    async def enhance_image(self, image_path: str, operations: List[str], **kwargs) -> Dict[str, Any]:
        import asyncio
        await asyncio.sleep(1.0)

        from ..storage.local import LocalStorageService
        storage = LocalStorageService()

        enhanced_url = storage.get_url(image_path)
        thumbnail_url = storage.get_thumbnail_url(image_path)

        if "background_removal" in operations:
            enhanced_url = storage.get_url("enhanced_" + image_path.split("/")[-1])
        if "background_replacement" in operations or "generate_studio_background" in operations:
            bg_type = kwargs.get("background_type", "studio")
            enhanced_url = storage.get_url(f"studio_{bg_type}_" + image_path.split("/")[-1])

        is_enhanced = len(operations) > 0 and "none" not in operations

        return {
            "enhanced_url": enhanced_url,
            "thumbnail_url": thumbnail_url,
            "is_enhanced": is_enhanced,
            "message": f"Applied operations: {', '.join(operations)}",
            "width": 1024,
            "height": 1024,
        }

    async def background_removal(self, image_path: str) -> Dict[str, Any]:
        import asyncio
        await asyncio.sleep(0.8)
        from ..storage.local import LocalStorageService
        storage = LocalStorageService()
        filename = image_path.split("/")[-1]
        return {
            "enhanced_url": storage.get_url(f"nobg_{filename}"),
            "is_enhanced": True,
            "message": "Background removed successfully",
        }

    async def background_replacement(self, image_path: str, background_type: str) -> Dict[str, Any]:
        import asyncio
        await asyncio.sleep(0.8)
        from ..storage.local import LocalStorageService
        storage = LocalStorageService()
        filename = image_path.split("/")[-1]
        return {
            "enhanced_url": storage.get_url(f"bg_{background_type}_{filename}"),
            "is_enhanced": True,
            "message": f"Background replaced with {background_type}",
        }

    async def generate_studio_background(self, image_path: str) -> Dict[str, Any]:
        import asyncio
        await asyncio.sleep(0.8)
        from ..storage.local import LocalStorageService
        storage = LocalStorageService()
        filename = image_path.split("/")[-1]
        return {
            "enhanced_url": storage.get_url(f"studio_{filename}"),
            "is_enhanced": True,
            "message": "Studio background generated",
        }


class MockAIRecommendationService(AIRecommendationInterface, AIBase):
    """Mock AI recommendation service."""

    def get_provider(self) -> str:
        return "mock"

    async def get_recommendations(
        self, user_id: str, limit: int = 10, recommendation_type: str = "discovery",
        context_artwork_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        import asyncio
        await asyncio.sleep(0.3)

        results = []
        for i in range(limit):
            score = round(random.uniform(0.65, 0.98), 2)
            results.append({
                "artwork_id": str(uuid4()),
                "title": f"Recommended Artwork {i+1}",
                "price": random.randint(500, 15000),
                "image_url": f"https://placehold.co/400x400/ddd/999?text=Art+{i+1}",
                "artisan_name": f"Artisan {chr(65+i)}",
                "score": score,
                "reason": random.choice(["Similar craft", "Based on your region", "Trending in your area", "From your wishlist"]),
            })
        return results

    async def get_b2b_matches(self, request_params: Dict[str, Any], db: Session, limit: int = 10) -> List[Dict[str, Any]]:
        """Match real artisans/artworks to a B2B request using database data."""
        import asyncio
        await asyncio.sleep(0.5)

        craft = request_params.get("craft", "Handicraft")
        material = request_params.get("material")
        region = request_params.get("region")
        budget_min = request_params.get("budget_min") or 0
        budget_max = request_params.get("budget_max") or 999999999
        quantity = request_params.get("quantity", 1)
        category_id = request_params.get("category_id")

        # Query all artisans with their profiles and artworks
        artisans = db.query(User).filter(User.role.has(name="artisan")).all()

        results = []
        for artisan in artisans:
            profile = getattr(artisan, "artisan_profile", None)
            if profile is None:
                continue
            if not profile.is_approved_to_sell:
                continue

            # Gather this artisan's artworks
            artworks = db.query(Artwork).filter(Artwork.artisan_id == artisan.id).all()
            if not artworks:
                continue

            best_artwork = None
            best_score = 0

            for aw in artworks:
                score = self._calculate_match_score(
                    aw, profile, artisan, craft, material, region,
                    budget_min, budget_max, quantity, category_id
                )
                if score > best_score:
                    best_score = score
                    best_artwork = aw

            if best_artwork is not None and best_score >= 20:
                image_url = None
                if best_artwork.images:
                    image_url = best_artwork.images[0].url

                artisan_name = profile.artisan_name or artisan.display_name or artisan.full_name or "Unknown Artisan"

                results.append({
                    "artisan_id": str(artisan.id),
                    "artisan_name": artisan_name,
                    "artwork_id": str(best_artwork.id),
                    "artwork_title": best_artwork.title,
                    "artwork_image_url": image_url,
                    "match_score": round(best_score, 1),
                    "match_factors": {
                        "craft_match": self._craft_match(craft, best_artwork.craft),
                        "material_match": self._material_match(material, best_artwork.material),
                        "price_match": self._price_match(budget_min, budget_max, best_artwork.price),
                        "region_match": self._region_match(region, profile.region or best_artwork.region),
                        "verified_artisan": profile.is_verified,
                        "availability": best_artwork.status == "listed",
                    },
                    "estimated_unit_price": best_artwork.price or 0,
                })

        results.sort(key=lambda x: x["match_score"], reverse=True)
        return results[:limit]

    @staticmethod
    def _calculate_match_score(artwork, profile, artisan, craft, material, region,
                                budget_min, budget_max, quantity, category_id) -> int:
        score = 0
        # Base score for having an artwork available for matching
        score += 10
        # Craft match: +25
        if craft and artwork.craft and craft.lower() in artwork.craft.lower():
            score += 25
        # Material match: +15
        if material and artwork.material and material.lower() == artwork.material.lower():
            score += 15
        # Category match: +15
        if category_id and artwork.category_id and int(category_id) == artwork.category_id:
            score += 15
        # Price compatibility: +20
        if artwork.price:
            unit = artwork.price
            if budget_min <= unit <= budget_max:
                score += 20
            elif budget_min <= unit * 1.2 <= budget_max:
                score += 15
            else:
                score += 5
        # Region match: +10
        if region:
            r_lower = region.lower()
            if profile.region and r_lower in profile.region.lower():
                score += 10
            elif artwork.region and r_lower in artwork.region.lower():
                score += 10
        # Verified artisan: +10
        if profile.is_verified:
            score += 10
        # Artwork listed: +5
        if artwork.is_listed:
            score += 5
        return score

    @staticmethod
    def _craft_match(craft, artwork_craft) -> int:
        if not craft or not artwork_craft:
            return 0
        return 100 if craft.lower() in artwork_craft.lower() else 50

    @staticmethod
    def _material_match(material, artwork_material) -> int:
        if not material or not artwork_material:
            return 0
        return 100 if material.lower() == artwork_material.lower() else 50

    @staticmethod
    def _price_match(budget_min, budget_max, price) -> int:
        if not price:
            return 0
        if budget_min <= price <= budget_max:
            return 100
        if budget_min <= price * 1.2 <= budget_max:
            return 75
        return 25

    @staticmethod
    def _region_match(region, artisan_region) -> int:
        if not region or not artisan_region:
            return 50
        return 100 if region.lower() in artisan_region.lower() else 50
