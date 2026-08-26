"""
VitaHealth - Vitamin / Nutritional Consideration
"""

VITAMIN_RECOMMENDATIONS = {

    "Atopic Dermatitis": {
        "nutrient": "Vitamin D",
        "role": "Supports normal immune function and overall health.",
        "food_sources": [
            "Fatty fish",
            "Egg yolks",
            "Fortified foods"
        ],
        "note": (
            "This is a nutritional consideration only. "
            "A skin image cannot confirm Vitamin D deficiency."
        )
    },

    "Contact Dermatitis": {
        "nutrient": "Vitamin C",
        "role": "Supports collagen formation and normal skin health.",
        "food_sources": [
            "Oranges",
            "Guava",
            "Bell peppers",
            "Broccoli"
        ],
        "note": (
            "This is a nutritional consideration only. "
            "A skin image cannot confirm Vitamin C deficiency."
        )
    },

    "Eczema": {
        "nutrient": "Vitamin D",
        "role": "Supports normal immune function and overall health.",
        "food_sources": [
            "Fatty fish",
            "Egg yolks",
            "Fortified foods"
        ],
        "note": (
            "Vitamin D has been studied in relation to inflammatory "
            "skin conditions. This does not confirm a deficiency."
        )
    },

    "Scabies": {
        "nutrient": "Zinc",
        "role": "Supports normal immune function and wound healing.",
        "food_sources": [
            "Meat",
            "Eggs",
            "Beans",
            "Nuts"
        ],
        "note": (
            "Zinc is a mineral, not a vitamin. "
            "This is general nutritional guidance and does not "
            "confirm zinc deficiency."
        )
    },

    "Seborrheic Dermatitis": {
        "nutrient": "Vitamin B2",
        "role": "Supports energy metabolism and normal skin health.",
        "food_sources": [
            "Milk",
            "Eggs",
            "Almonds",
            "Mushrooms"
        ],
        "note": (
            "This is a nutritional consideration only. "
            "A skin image cannot confirm Vitamin B2 deficiency."
        )
    },

    "Tinea Corporis": {
        "nutrient": "Vitamin C",
        "role": "Supports collagen formation and normal immune function.",
        "food_sources": [
            "Oranges",
            "Guava",
            "Bell peppers",
            "Broccoli"
        ],
        "note": (
            "This is general nutritional guidance. "
            "A skin image cannot confirm Vitamin C deficiency."
        )
    }
}


def get_vitamin_recommendation(predicted_class):

    return VITAMIN_RECOMMENDATIONS.get(
        predicted_class,
        {
            "nutrient": "General balanced nutrition",
            "role": "Supports overall health.",
            "food_sources": [
                "Fruits",
                "Vegetables",
                "Whole grains",
                "Protein-rich foods"
            ],
            "note": (
                "Nutritional information is general guidance "
                "and does not confirm a vitamin deficiency."
            )
        }
    )