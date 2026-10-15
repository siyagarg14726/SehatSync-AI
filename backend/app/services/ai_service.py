import json
import logging
import re
from typing import Any, Dict, List, Optional

from app.config import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = (
    "You are Aarogya, a helpful health assistant for the Aarogya360 AI platform. "
    "Provide helpful, empathetic wellness guidance. Always clarify you are not a doctor "
    "and recommendations should be discussed with healthcare professionals."
)


def _get_genai_client():
    """Return a configured google.genai Client, or None if API key is missing."""
    api_key = settings.GEMINI_API_KEY
    if api_key and api_key.strip() and api_key != "your_gemini_api_key_here":
        try:
            from google import genai
            return genai.Client(api_key=api_key.strip())
        except Exception as e:
            logger.warning(f"Failed to create Google Gemini client: {e}")
    return None


def _clean_json_text(text: str) -> str:
    """Strip markdown code blocks or wrapping text to extract valid JSON."""
    text = text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        return match.group(1).strip()
    return text


class AIService:
    @classmethod
    async def chat(
        cls,
        message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        user_name: Optional[str] = None,
    ) -> str:
        """Process conversational user inquiry with Aarogya system persona."""
        client = _get_genai_client()
        if client:
            try:
                from google.genai import types as genai_types

                contents = []
                if conversation_history:
                    for turn in conversation_history:
                        role = "user" if turn.get("role") in ["user", "human"] else "model"
                        content = turn.get("content", "")
                        if content:
                            contents.append(genai_types.Content(role=role, parts=[genai_types.Part(text=content)]))

                prompt = message
                if user_name:
                    prompt = f"[User Name: {user_name}]\n{message}"
                contents.append(genai_types.Content(role="user", parts=[genai_types.Part(text=prompt)]))

                response = client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=contents,
                    config=genai_types.GenerateContentConfig(system_instruction=SYSTEM_PROMPT),
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                logger.error(f"Gemini chat API error: {e}. Falling back to rule-based assistant.", exc_info=True)

        # Fallback response when GEMINI_API_KEY is unset or API call fails
        name_str = f", {user_name}" if user_name else ""
        return (
            f"Hello{name_str}! I am Aarogya, your wellness companion on Aarogya360 AI.\n\n"
            f"Thank you for reaching out with your question: \"{message}\".\n\n"
            "Key wellness best practices to consider:\n"
            "• **Hydration**: Maintain at least 2-3 liters of water intake daily.\n"
            "• **Restful Sleep**: Strive for 7-8 hours of uninterrupted sleep with a consistent wind-down routine.\n"
            "• **Movement**: Integrate at least 30 minutes of moderate activity or walking into your day.\n"
            "• **Stress Management**: Practice 5-10 minutes of deep box-breathing or mindfulness.\n\n"
            "*Notice: Aarogya is an AI wellness assistant and does not provide formal medical diagnoses or prescriptions. "
            "Please consult a licensed medical professional for clinical concerns.*"
        )

    @classmethod
    async def generate_wellness_insights(
        cls, checkins: List[Dict[str, Any]], user_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate explainable wellness insights & recommendations from past check-ins."""
        if not checkins:
            return {
                "overview": "No wellness check-ins recorded yet. Record daily check-ins to receive personalized AI health trends and actionable advice.",
                "explainable_factors": ["Check-in data is empty."],
                "recommendations": [
                    "Log your daily stress, sleep hours, fatigue, and mood for at least 3 consecutive days."
                ],
                "stress_level_status": "Unknown",
                "sleep_status": "Unknown",
            }

        # Calculate statistics
        count = len(checkins)
        avg_stress = sum(c["stress"] for c in checkins) / count
        avg_sleep = sum(c["sleep_hours"] for c in checkins) / count
        avg_fatigue = sum(c["fatigue"] for c in checkins) / count
        avg_mood = sum(c["mood"] for c in checkins) / count

        stress_status = (
            "Elevated" if avg_stress >= 7 else "Moderate" if avg_stress >= 4 else "Optimal"
        )
        sleep_status = (
            "Insufficient" if avg_sleep < 6.5 else "Optimal" if avg_sleep <= 9 else "Excessive"
        )

        has_gemini = _configure_gemini()
        client = _get_genai_client()
        if client:
            try:
                prompt = (
                    f"You are the RakshakAI wellness engine of Aarogya360. Analyze the user's last {count} days of wellness data:\n"
                    f"- Average Stress (1-10): {avg_stress:.1f}\n"
                    f"- Average Sleep (hrs): {avg_sleep:.1f}\n"
                    f"- Average Fatigue (1-10): {avg_fatigue:.1f}\n"
                    f"- Average Mood (1-10): {avg_mood:.1f}\n"
                    f"Detailed logs: {json.dumps(checkins, default=str)}\n\n"
                    "Return a strictly valid JSON object with the following keys:\n"
                    "{\n"
                    '  "overview": "A compassionate, clear 2-3 sentence overview of their wellness trajectory",\n'
                    '  "explainable_factors": ["Factor 1 explaining correlation between sleep/stress/fatigue", "Factor 2", "Factor 3"],\n'
                    '  "recommendations": ["Actionable step 1", "Actionable step 2", "Actionable step 3"],\n'
                    f'  "stress_level_status": "{stress_status}",\n'
                    f'  "sleep_status": "{sleep_status}"\n'
                    "}\n"
                    "Do not include any markdown fences or extra commentary outside the JSON."
                )

                response = client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=prompt,
                )
                if response and response.text:
                    cleaned_json = _clean_json_text(response.text)
                    parsed = json.loads(cleaned_json)
                    return parsed
            except Exception as e:
                logger.error(f"Gemini wellness insights error: {e}. Falling back to heuristic insights.", exc_info=True)

        # Fallback explainable heuristic insights
        factors = []
        recommendations = []

        if avg_sleep < 7.0:
            factors.append(f"Sleep deficit noted (averaging {avg_sleep:.1f} hrs/night), directly contributing to fatigue ratings of {avg_fatigue:.1f}/10.")
            recommendations.append("Establish a consistent sleep schedule and minimize blue light exposure 45 minutes before bed.")
        else:
            factors.append(f"Healthy sleep duration maintained (averaging {avg_sleep:.1f} hrs/night), supporting neurological recovery.")

        if avg_stress > 6.0:
            factors.append(f"Elevated stress index of {avg_stress:.1f}/10 correlates with lower reported mood scores.")
            recommendations.append("Incorporate 10-minute mid-day somatic breath breaks or progressive muscle relaxation.")
        else:
            factors.append(f"Stress resilience is stable with an average level of {avg_stress:.1f}/10.")

        if avg_fatigue > 6.0 and avg_sleep >= 7.0:
            factors.append("Persistent fatigue despite adequate sleep hours may indicate hydration gaps or poor sleep architecture.")
            recommendations.append("Review evening meal timing and increase daytime water consumption.")

        if not recommendations:
            recommendations.append("Maintain your balanced daily rhythm, prioritize morning natural sunlight, and continue daily check-ins.")

        overview = (
            f"Over the last {count} check-ins, your wellness index shows an average stress score of {avg_stress:.1f}/10 "
            f"and sleep duration of {avg_sleep:.1f} hours. Mood has averaged {avg_mood:.1f}/10, reflecting overall {stress_status.lower()} stress load."
        )

        return {
            "overview": overview,
            "explainable_factors": factors,
            "recommendations": recommendations,
            "stress_level_status": stress_status,
            "sleep_status": sleep_status,
        }

    @classmethod
    async def generate_weekly_meal_plan(
        cls,
        dietary_profile: Dict[str, Any],
        special_notes: Optional[str] = None,
        daily_budget: Optional[float] = None,
    ) -> Dict[str, Any]:
        """Generate a complete 7-day budget-aware weekly meal plan."""
        dietary_type = dietary_profile.get("dietary_type", "veg")
        allergies = dietary_profile.get("allergies", "None")
        goals = dietary_profile.get("goals", "maintenance")
        budget = daily_budget or dietary_profile.get("daily_budget") or 350.0

        client = _get_genai_client()
        if client:
            try:
                prompt = (
                    "You are a clinical and nutritional dietitian for Aarogya360.\n"
                    f"Create a nutritious, balanced 7-day weekly meal plan with the following constraints:\n"
                    f"- Dietary Type: {dietary_type}\n"
                    f"- Known Allergies / Intolerances: {allergies}\n"
                    f"- Health Goal: {goals}\n"
                    f"- Estimated Daily Budget: ₹{budget} (or equivalent local currency)\n"
                    f"- Special Requests: {special_notes or 'Balanced nutritious meals'}\n\n"
                    "Return a valid JSON object matching this structure exactly:\n"
                    "{\n"
                    '  "weekly_summary": "Short 2-sentence summary of the nutrition strategy and calorie distribution",\n'
                    '  "daily_budget_estimate": 350.0,\n'
                    '  "target_dietary_type": "veg",\n'
                    '  "days": {\n'
                    '    "Monday": {\n'
                    '      "breakfast": "Meal description with protein/fiber focus",\n'
                    '      "lunch": "Nutritious balanced lunch",\n'
                    '      "dinner": "Light, easily digestible dinner",\n'
                    '      "snacks": "Healthy budget-friendly snack",\n'
                    '      "approx_calories": 2100\n'
                    "    },\n"
                    '    "Tuesday": { ... },\n'
                    '    "Wednesday": { ... },\n'
                    '    "Thursday": { ... },\n'
                    '    "Friday": { ... },\n'
                    '    "Saturday": { ... },\n'
                    '    "Sunday": { ... }\n'
                    "  },\n"
                    '  "grocery_highlights": ["Key item 1", "Key item 2", "Key item 3"]\n'
                    "}\n"
                    "Only return valid JSON, no markdown codeblocks or formatting around it."
                )

                response = client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=prompt,
                )
                if response and response.text:
                    cleaned_json = _clean_json_text(response.text)
                    return json.loads(cleaned_json)
            except Exception as e:
                logger.error(f"Gemini meal plan generation error: {e}. Falling back to preset nutritional plan.", exc_info=True)

        # Diverse, high-quality fallback meal plan tailored to dietary type
        days_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        if dietary_type.lower() in ["vegan", "veg"]:
            sample_meals = [
                {
                    "breakfast": "Moong dal chilla with mint chutney and soaked almonds",
                    "lunch": "Brown rice / quinoa with mixed vegetable curry, spinach dal, and cucumber salad",
                    "dinner": "Paneer / tofu stir-fry with sauteed vegetables and 2 multigrain rotis",
                    "snacks": "Roasted chana and coconut water",
                    "approx_calories": 1950,
                },
                {
                    "breakfast": "Oatmeal cooked with chia seeds, banana slices, and crushed walnuts",
                    "lunch": "Whole wheat rotis with rajma masala, tossed cabbage salad, and curd",
                    "dinner": "Lentil vegetable soup with toasted multigrain bread and grilled zucchini",
                    "snacks": "Seasonal fruit (papaya/apple) with pumpkin seeds",
                    "approx_calories": 2000,
                },
                {
                    "breakfast": "Sprouted bean salad with lemon, herbs, and warm green tea",
                    "lunch": "Methi thepla with curd and roasted baingan bharta",
                    "dinner": "Mixed vegetable khichdi tempered with cumin and a side of fresh raita",
                    "snacks": "Fox nuts (makhana) roasted in olive oil with black pepper",
                    "approx_calories": 1850,
                },
                {
                    "breakfast": "Vegetable poha with roasted peanuts, carrots, and peas",
                    "lunch": "Chickpea (chole) bowl with brown rice, sliced radishes, and lemon",
                    "dinner": "Palak paneer / palak tofu with 2 jowar rotis and tomato salad",
                    "snacks": "Handful of roasted peanuts and boiled corn chaat",
                    "approx_calories": 2050,
                },
                {
                    "breakfast": "Idli with sambar and fresh coriander-coconut chutney",
                    "lunch": "Toor dal, steamed rice, beans poriyal, and spiced buttermilk",
                    "dinner": "Stir-fried broccoli, bell peppers, and mushrooms with quinoa",
                    "snacks": "Green apple slices with peanut butter",
                    "approx_calories": 1900,
                },
                {
                    "breakfast": "Besan vegetable pancake with tomato chutney and herbal tea",
                    "lunch": "Black-eyed pea (lobia) curry with whole wheat roti and kachumber salad",
                    "dinner": "Clear vegetable and tofu broth with steamed vegetable dumplings",
                    "snacks": "Mixed seed mix (flax, sunflower, pumpkin)",
                    "approx_calories": 1950,
                },
                {
                    "breakfast": "Avocado or paneer mash toast on multigrain sourdough",
                    "lunch": "Vegetable biryani with roasted soya chunks and cucumber mint raita",
                    "dinner": "Warm pumpkin soup with a light mixed greens and walnut salad",
                    "snacks": "Fresh tender coconut water and a small handful of cashews",
                    "approx_calories": 2100,
                },
            ]
        else:
            sample_meals = [
                {
                    "breakfast": "3 boiled eggs (2 whites, 1 whole) with whole wheat toast and fruit",
                    "lunch": "Grilled chicken breast or fish with brown rice and steamed green beans",
                    "dinner": "Stir-fried vegetables and egg bhurji with 2 multigrain rotis",
                    "snacks": "Greek yogurt with chia seeds and honey",
                    "approx_calories": 2150,
                },
                {
                    "breakfast": "Spinach and mushroom omelette with avocado toast",
                    "lunch": "Chicken curry with steamed basmati rice and fresh kachumber salad",
                    "dinner": "Clear chicken bone broth with shredded veggies and boiled sweet potato",
                    "snacks": "Roasted almonds and boiled egg white",
                    "approx_calories": 2200,
                },
                {
                    "breakfast": "Oatmeal with whey protein, chia seeds, and berries",
                    "lunch": "Baked fish fillet with mashed potatoes and sauteed broccoli",
                    "dinner": "Tender chicken tikka (air-fried) with mint chutney and cucumber salad",
                    "snacks": "Sprouted moong chaat with lime juice",
                    "approx_calories": 2050,
                },
                {
                    "breakfast": "Scrambled eggs with tomatoes, onions, and multigrain paratha",
                    "lunch": "Egg curry with whole wheat rotis and tossed cabbage salad",
                    "dinner": "Grilled fish with quinoa and roasted bell peppers",
                    "snacks": "Fruit bowl (guava and orange) with roasted pumpkin seeds",
                    "approx_calories": 2100,
                },
                {
                    "breakfast": "Greek yogurt parfait with rolled oats, seeds, and banana",
                    "lunch": "Chicken and vegetable stir fry over brown rice",
                    "dinner": "Lentil soup with grilled chicken skewers and green salad",
                    "snacks": "Handful of walnuts and green tea",
                    "approx_calories": 2000,
                },
                {
                    "breakfast": "Egg and cheese whole wheat wrap with baby spinach",
                    "lunch": "Fish curry with steamed rice and spiced buttermilk",
                    "dinner": "Light chicken stew with carrots, celery, and toasted sourdough",
                    "snacks": "Roasted makhana and coconut water",
                    "approx_calories": 2100,
                },
                {
                    "breakfast": "High-protein pancakes with peanut butter and mixed berries",
                    "lunch": "Herb-roasted chicken with baked sweet potato wedges and salad",
                    "dinner": "Steamed edamame and vegetable egg-drop soup",
                    "snacks": "Roasted chickpeas with lemon and spices",
                    "approx_calories": 2150,
                },
            ]

        days_dict = {}
        for idx, day_name in enumerate(days_names):
            days_dict[day_name] = sample_meals[idx]

        return {
            "weekly_summary": f"A balanced {dietary_type} nutrition plan optimized for your goal of '{goals}', prioritizing fresh produce and lean protein within ₹{budget}/day.",
            "daily_budget_estimate": budget,
            "target_dietary_type": dietary_type,
            "days": days_dict,
            "grocery_highlights": [
                "Seasonal greens, cucumbers, and tomatoes",
                "Whole grains (brown rice, whole wheat, oats)",
                "Quality protein staples (lentils, paneer, tofu or lean poultry/eggs)",
                "Healthy fats (chia seeds, walnuts, cold-pressed oil)",
            ],
        }
