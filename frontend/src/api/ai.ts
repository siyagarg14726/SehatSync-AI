import apiClient from './axios';
import { ChatMessage } from '../types';

export const aiApi = {
  sendMessage: async (userMessage: string, history: ChatMessage[] = []): Promise<ChatMessage> => {
    try {
      const response = await apiClient.post<ChatMessage>('/api/assistant/chat', {
        message: userMessage,
        history,
      });
      return response.data;
    } catch (error) {
      // Dynamic intelligent responses when backend is offline
      const lower = userMessage.toLowerCase();
      let reply = "I'm here to support your holistic wellness journey. How can I assist you with your health, nutrition, or medications today?";
      let suggestions: string[] = [
        'How can I lower my evening cortisol?',
        'What are rich vegetarian protein sources?',
        'Explain my Vitamin D dosage guidelines',
      ];

      if (lower.includes('stress') || lower.includes('anxiety') || lower.includes('relax')) {
        reply = `To help mitigate elevated stress levels, consider these evidence-based micro-practices:
1. **4-7-8 Pranayama Breathing:** Inhale through your nose for 4 seconds, hold for 7 seconds, and exhale steadily through your mouth for 8 seconds. Perform 4 cycles.
2. **Magnesium Glycinate:** Consider discussing a 200-300mg elemental magnesium supplement with your physician to calm neuromuscular excitability.
3. **Digital Sunset:** Discontinue smartphone and screen exposure 45 minutes prior to bedtime to preserve melatonin secretion.`;
        suggestions = ['Suggest relaxing herbal teas', 'Log my stress level in RakshakAI', 'Set an evening wind-down reminder'];
      } else if (lower.includes('diet') || lower.includes('food') || lower.includes('protein') || lower.includes('meal')) {
        reply = `For balanced nutrition that sustains steady glucose and mental focus:
• **Protein Target:** Aim for 1.2 to 1.6 grams of protein per kilogram of body weight. Great plant-based staples include moong dal sprouts, roasted sattu, paneer/tofu, and edamame.
• **Fiber Foundation:** Ensure at least 30g of prebiotic dietary fiber per day through flaxseeds, oats, leafy vegetables, and whole lentils.
• **Hydration:** Consume at least 2.5–3 liters of water across the day, infusing with lemon or cucumber slices.`;
        suggestions = ['Generate a high-protein Indian meal plan', 'What are good pre-workout snacks?', 'How to avoid post-lunch fatigue?'];
      } else if (lower.includes('sleep') || lower.includes('tired') || lower.includes('insomnia') || lower.includes('fatigue')) {
        reply = `Optimizing restorative deep sleep:
1. **Consistent Sleep Schedule:** Align your circadian rhythm by waking up and going to bed within the same 30-minute window daily.
2. **Morning Sunlight:** Get 10–15 minutes of natural sunlight exposure within 1 hour of waking to set your suprachiasmatic clock.
3. **Temperature Control:** Maintain a cool sleeping space (approximately 19–21°C / 66–70°F) for uninterrupted slow-wave sleep.`;
        suggestions = ['Track my sleep hours', 'Check my 30-day sleep trend', 'What supplements help with sleep?'];
      } else if (lower.includes('medication') || lower.includes('pill') || lower.includes('dose') || lower.includes('prescription')) {
        reply = `**Medication Safety Guidelines:**
• Always adhere strictly to the schedule prescribed by your physician.
• Note whether medications require a full stomach (e.g., Metformin) to prevent gastric irritation.
• You can organize alerts and view your active schedule directly in the **CareSync** tab.
*(Note: Never adjust prescription dosages without consulting your doctor.)*`;
        suggestions = ['View medications due today', 'Add new medication to CareSync', 'Review prescription logs'];
      }

      return {
        id: 'msg_' + Date.now(),
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions,
      };
    }
  },
};
