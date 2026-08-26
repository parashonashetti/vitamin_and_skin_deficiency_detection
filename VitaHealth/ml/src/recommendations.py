"""
VitaHealth - Diet and Lifestyle Recommendations

IMPORTANT:
These are general educational recommendations.
They are NOT a diagnosis, treatment plan, or prescription.

The AI prediction should always be confirmed by
a qualified healthcare professional.
"""

RECOMMENDATIONS = {

    "Atopic Dermatitis": {

        "diet": [
            "Eat a balanced diet with vegetables, fruits, whole grains and adequate protein.",
            "Drink adequate water throughout the day.",
            "Do not eliminate foods automatically just because the model predicts eczema.",
            "If a particular food repeatedly causes symptoms, discuss it with a doctor or dietitian."
        ],

        "lifestyle": [
            "Keep the skin moisturized regularly.",
            "Prefer fragrance-free skin-care products.",
            "Try to identify personal triggers such as irritating products, heat or dry air.",
            "Avoid scratching affected areas."
        ],

        "medical_note":
            "Food elimination is not a general cure for atopic dermatitis. "
            "Discuss suspected food allergies with a healthcare professional."
    },


    "Contact Dermatitis": {

        "diet": [
            "Maintain a normal balanced diet.",
            "Eat vegetables, fruits, whole grains and adequate protein.",
            "Drink adequate water.",
            "There is no general special diet recommended solely from this image prediction."
        ],

        "lifestyle": [
            "Try to identify and avoid products that may be irritating your skin.",
            "Be cautious with new soaps, cosmetics, detergents and fragrances.",
            "Use gentle, fragrance-free skin-care products.",
            "Avoid scratching irritated areas."
        ],

        "medical_note":
            "Contact dermatitis is commonly related to exposure to an irritant "
            "or allergen. A healthcare professional can help identify the trigger."
    },


    "Eczema": {

        "diet": [
            "Eat a varied and balanced diet.",
            "Include vegetables and fruits regularly.",
            "Include adequate protein and whole grains.",
            "Drink adequate water.",
            "Do not remove major food groups without medical advice."
        ],

        "lifestyle": [
            "Moisturize regularly.",
            "Use fragrance-free skin-care products.",
            "Avoid known personal triggers.",
            "Take short, lukewarm showers or baths.",
            "Avoid scratching the affected skin."
        ],

        "medical_note":
            "For most people with eczema, eliminating foods does not "
            "significantly improve symptoms. Suspected food allergies should "
            "be evaluated by a healthcare professional."
    },


    "Scabies": {

        "diet": [
            "Maintain a normal balanced diet.",
            "Eat vegetables, fruits, whole grains and adequate protein.",
            "Drink adequate water.",
            "There is no special diet that eliminates scabies mites."
        ],

        "lifestyle": [
            "Seek medical evaluation for appropriate scabies treatment.",
            "Avoid prolonged close skin-to-skin contact until appropriately treated.",
            "Wash clothing, bedding and towels according to healthcare guidance.",
            "Avoid sharing personal items such as towels and clothing."
        ],

        "medical_note":
            "Scabies requires appropriate medical treatment. Diet does not "
            "eliminate the mites."
    },


    "Seborrheic Dermatitis": {

        "diet": [
            "Maintain a balanced diet.",
            "Include vegetables and fruits regularly.",
            "Include adequate protein and whole grains.",
            "Drink adequate water.",
            "Avoid unnecessary restrictive diets based only on this prediction."
        ],

        "lifestyle": [
            "Keep affected skin clean using gentle products.",
            "Avoid harsh or strongly fragranced skin-care products.",
            "Avoid scratching irritated areas.",
            "Follow a healthcare professional's treatment recommendations if symptoms persist."
        ],

        "medical_note":
            "There is no general food restriction that should be prescribed "
            "solely from an image-based prediction."
    },


    "Tinea Corporis": {

        "diet": [
            "Maintain a balanced diet.",
            "Eat vegetables, fruits, whole grains and adequate protein.",
            "Drink adequate water.",
            "No special diet is recommended to cure ringworm."
        ],

        "lifestyle": [
            "Keep the affected skin clean and dry.",
            "Avoid scratching the affected area.",
            "Do not share towels, clothing or bedding.",
            "Wash towels and bedding regularly.",
            "Seek medical or pharmacy advice about appropriate antifungal treatment."
        ],

        "medical_note":
            "Tinea corporis is a fungal infection. Appropriate antifungal "
            "treatment is important; diet alone does not cure the infection."
    }
}


def get_recommendation(condition):

    if condition not in RECOMMENDATIONS:

        return {
            "diet": [],
            "lifestyle": [],
            "medical_note":
                "Please consult a healthcare professional."
        }

    return RECOMMENDATIONS[condition]