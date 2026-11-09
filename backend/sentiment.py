"""
SalesMind AI - Python Sentiment & Review Analysis
Extracts complaint themes, computes sentiment distributions, and correlates ratings.
"""

from typing import List, Dict, Any
import re


THEME_KEYWORDS = {
    "Product Quality": ["defect", "broke", "screw", "tension", "plastic", "flimsy", "stripped", "quality issue"],
    "Delivery & Shipping": ["delay", "customs", "carrier", "late", "shipping took", "transit", "lost tracking"],
    "Packaging & Handling": ["packaging", "box", "scuffed", "dented", "crushed", "wrap"],
    "Pricing & Value": ["expensive", "steep", "overpriced", "costly", "value for money"],
    "Customer Service": ["service", "support", "replacement", "agent", "warranty", "unhelpful"],
    "Performance Praise": ["exceptional", "rock-solid", "ahead of schedule", "exceeds", "great ergonomics"]
}


def analyze_reviews(reviews_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Analyzes customer reviews, rating counts, and extracted themes."""
    ratings = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    sentiments = {"Positive": 0, "Neutral": 0, "Negative": 0}
    theme_counts = {k: 0 for k in THEME_KEYWORDS}
    sample_feedback = {k: [] for k in THEME_KEYWORDS}

    valid_count = 0
    for r in reviews_data:
        rating = r.get('review_rating')
        text = str(r.get('review_text', '')).lower()

        if rating and rating in ratings:
            ratings[rating] += 1
            valid_count += 1
            if rating >= 4:
                sentiments["Positive"] += 1
            elif rating <= 2:
                sentiments["Negative"] += 1
            else:
                sentiments["Neutral"] += 1

        if text:
            for theme, kws in THEME_KEYWORDS.items():
                if any(kw in text for kw in kws):
                    theme_counts[theme] += 1
                    if len(sample_feedback[theme]) < 2 and r.get('review_text'):
                        sample_feedback[theme].append(r.get('review_text'))

    themes_result = []
    for theme, cnt in theme_counts.items():
        if cnt > 0:
            themes_result.append({
                "theme": theme,
                "count": cnt,
                "samples": sample_feedback[theme]
            })

    return {
        "ratingCounts": ratings,
        "sentimentBreakdown": sentiments,
        "themes": themes_result,
        "totalEvaluated": valid_count
    }
