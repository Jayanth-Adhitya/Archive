import torch
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import numpy as np
from typing import List, Tuple


class CLIPService:
    """Service for CLIP-based image tagging and embedding generation"""

    def __init__(self):
        """Initialize CLIP model and processor"""
        self.model_name = "openai/clip-vit-large-patch14"
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Loading CLIP model on {self.device}...")

        self.model = CLIPModel.from_pretrained(self.model_name).to(self.device)
        self.processor = CLIPProcessor.from_pretrained(self.model_name)

        # Common categories for zero-shot classification
        self.categories = [
            "person", "people", "group", "crowd",
            "cat", "dog", "bird", "animal", "pet",
            "car", "vehicle", "motorcycle", "bicycle", "truck", "bus",
            "building", "house", "architecture", "city", "street",
            "tree", "forest", "nature", "landscape", "mountain",
            "beach", "ocean", "sea", "water", "lake", "river",
            "food", "meal", "restaurant", "dining",
            "sunset", "sunrise", "sky", "clouds",
            "flower", "plant", "garden",
            "indoor", "outdoor", "interior", "room",
            "night", "dark", "evening",
            "day", "daytime", "bright",
            "summer", "winter", "spring", "fall", "autumn",
            "snow", "rain", "sunny",
            "portrait", "selfie", "face",
            "sports", "game", "playing",
            "work", "office", "business",
            "art", "painting", "drawing",
            "book", "reading", "library",
            "computer", "technology", "phone",
            "party", "celebration", "event",
            "wedding", "birthday",
            "travel", "vacation", "tourism",
            "urban", "rural", "countryside"
        ]

        print(f"CLIP model loaded successfully with {len(self.categories)} categories")

    def generate_tags(self, image_path: str, top_k: int = 10, threshold: float = 0.2) -> List[Tuple[str, float]]:
        """
        Generate tags for an image using zero-shot classification

        Args:
            image_path: Path to the image file
            top_k: Number of top tags to return
            threshold: Minimum confidence threshold (0-1)

        Returns:
            List of tuples (tag, confidence)
        """
        # Load and preprocess image
        image = Image.open(image_path).convert("RGB")

        # Prepare text prompts
        text_prompts = [f"a photo of {category}" for category in self.categories]

        # Process inputs
        inputs = self.processor(
            text=text_prompts,
            images=image,
            return_tensors="pt",
            padding=True
        ).to(self.device)

        # Get predictions
        with torch.no_grad():
            outputs = self.model(**inputs)
            logits_per_image = outputs.logits_per_image
            probs = logits_per_image.softmax(dim=1)[0]

        # Get top-k predictions
        top_probs, top_indices = torch.topk(probs, k=min(top_k, len(self.categories)))

        # Filter by threshold and create results
        results = []
        for prob, idx in zip(top_probs, top_indices):
            confidence = prob.item()
            if confidence >= threshold:
                tag = self.categories[idx.item()]
                results.append((tag, confidence))

        return results

    def generate_embedding(self, image_path: str) -> np.ndarray:
        """
        Generate CLIP embedding for an image

        Args:
            image_path: Path to the image file

        Returns:
            Numpy array of embedding (512 dimensions)
        """
        # Load and preprocess image
        image = Image.open(image_path).convert("RGB")

        # Process image
        inputs = self.processor(images=image, return_tensors="pt").to(self.device)

        # Get image embedding
        with torch.no_grad():
            image_features = self.model.get_image_features(**inputs)
            # Normalize embedding
            image_features = image_features / image_features.norm(dim=-1, keepdim=True)

        # Convert to numpy array
        embedding = image_features.cpu().numpy()[0]

        return embedding

    def generate_description(self, image_path: str) -> str:
        """
        Generate a simple description based on top tags

        Args:
            image_path: Path to the image file

        Returns:
            String description
        """
        tags = self.generate_tags(image_path, top_k=5, threshold=0.2)

        if not tags:
            return "An image"

        tag_names = [tag for tag, _ in tags]
        if len(tag_names) == 1:
            return f"An image of {tag_names[0]}"
        elif len(tag_names) == 2:
            return f"An image of {tag_names[0]} and {tag_names[1]}"
        else:
            return f"An image of {', '.join(tag_names[:-1])}, and {tag_names[-1]}"


# Create a singleton instance
_clip_service = None


def get_clip_service() -> CLIPService:
    """Get or create the CLIP service singleton"""
    global _clip_service
    if _clip_service is None:
        _clip_service = CLIPService()
    return _clip_service
