import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  ShieldAlert,
  RotateCcw,
  Lightbulb,
} from 'lucide-react';
import { aiApi } from '../api/ai';
import { ChatMessage } from '../types';
import { useAuthStore } from '../store/authStore';

const initialMessages: ChatMessage[] = [
  {
    id: 'msg_welcome',
    sender: 'assistant',
    text: `Namaste! I am **SehatSync AI**, your personal health intelligence guide.

I can assist you with understanding your bio-telemetry, analyzing lifestyle habits, evaluating food synergies, and clarifying general wellness questions. How can I assist you with your health goals today?`,
    timestamp: 'Just now',
    suggestions: [
      'How to lower my evening stress and cortisol?',
      'Suggest a high-protein vegetarian post-workout snack',
      'Explain when to take my Vitamin D supplement',
      'What are easy ways to increase daily hydration?',
    ],
  },
];

export const Assistant: React.FC = () => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await aiApi.sendMessage(text, messages);
      setMessages((prev) => [...prev, response]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'assistant',
          text: "I apologize, but I encountered an error processing your query. Please verify your connection or try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages(initialMessages);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-4xl mx-auto">
      {/* Medical Disclaimer Banner */}
      <div className="mb-3 p-3 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-amber-900 flex items-start gap-2.5 shadow-xs shrink-0">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs font-medium leading-relaxed">
          <strong className="font-bold">Medical Disclaimer:</strong> SehatSync AI is an informational wellness and care coordination guide. Always consult a qualified healthcare professional for medical decisions, diagnosis, acute triage, or pharmaceutical adjustments.
        </p>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-800">Ask My Health AI</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Intelligent Guide
                </span>
              </div>
              <p className="text-[11px] text-teal-600 font-medium">Ready to assist • 24/7 Context Aware</p>
            </div>
          </div>

          <button
            onClick={handleResetChat}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            title="Reset conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold shadow-xs ${
                    isUser
                      ? 'bg-teal-700 text-white'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {isUser ? (
                    user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                {/* Bubble */}
                <div className="space-y-2">
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-tr-xs shadow-sm font-medium'
                        : 'bg-slate-50 border border-slate-200/70 text-slate-800 rounded-tl-xs shadow-xs'
                    }`}
                  >
                    {msg.text}
                  </div>

                  <div
                    className={`text-[10px] text-slate-400 font-medium px-1 ${
                      isUser ? 'text-right' : 'text-left'
                    }`}
                  >
                    {msg.timestamp}
                  </div>

                  {/* Suggestion Chips */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {msg.suggestions.map((suggestion, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => handleSendMessage(suggestion)}
                          className="px-3 py-1.5 rounded-full bg-teal-50/80 hover:bg-teal-100 text-teal-800 text-xs font-semibold border border-teal-200 transition-colors flex items-center gap-1.5 text-left"
                        >
                          <Sparkles className="w-3 h-3 text-teal-600 shrink-0" />
                          <span>{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 max-w-[85%] mr-auto">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl rounded-tl-xs bg-slate-50 border border-slate-200/70 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:-0.3s]" />
                <span className="text-xs text-slate-400 font-medium ml-1">Aarogya is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-100 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about health, nutrition, sleep, or symptoms..."
              disabled={isTyping}
              className="flex-1 px-4 py-3 text-sm rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50/60 focus:bg-white text-slate-800 placeholder-slate-400 font-medium"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="p-3 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-md disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-2 text-center">
            <span className="text-[10px] text-slate-400">
              Press <kbd className="px-1 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[9px]">Enter</kbd> to send
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
