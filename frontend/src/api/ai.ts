import apiClient from './axios';
import { ChatMessage } from '../types';

interface ChatResponse {
  reply: string;
  timestamp: string;
  disclaimer: string;
}

export const aiApi = {
  sendMessage: async (userMessage: string, history: ChatMessage[] = []): Promise<ChatMessage> => {
    const response = await apiClient.post<ChatResponse>('/api/v1/ai/chat', {
      message: userMessage,
      conversation_history: history.map((message) => ({
        role: message.sender === 'assistant' ? 'model' : 'user',
        content: message.text,
      })),
    });
    return {
      id: `assistant-${response.data.timestamp}`,
      sender: 'assistant',
      text: response.data.reply,
      timestamp: response.data.timestamp,
      suggestions: [],
    };
  },
};
