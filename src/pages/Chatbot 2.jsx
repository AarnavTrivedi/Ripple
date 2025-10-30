import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, Loader2, Leaf } from "lucide-react";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your EcoTrackr AI assistant. Ask me anything about environmental topics, sustainability tips, or how to reduce your carbon footprint! 🌍"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    // Add user message
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // Call AI
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an eco-friendly AI assistant for EcoTrackr, an environmental tracking app. 
        
User question: ${userMessage}

Provide a helpful, friendly response focused on environmental topics, sustainability, eco-tips, and climate action. Keep responses concise (2-3 paragraphs max) and actionable. Use emojis occasionally to make it friendly.`,
        add_context_from_internet: true
      });

      // Add AI response
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: response || "I'm sorry, I couldn't generate a response. Please try again!" 
      }]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Sorry, I encountered an error. Please try again! 😅" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1a2f26]">
      {/* Header */}
      <div className="bg-[#0f5132]/95 backdrop-blur border-b border-emerald-500/20 px-6 py-4 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">EcoBot</h1>
            <p className="text-xs text-emerald-200/60">Your AI Environmental Assistant</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-32 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${
              message.role === 'user'
                ? 'bg-[#10D9A0] text-white'
                : 'bg-white/10 backdrop-blur-xl text-white border border-white/20'
            } rounded-2xl px-4 py-3 shadow-lg`}>
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-emerald-300 font-semibold">EcoBot</span>
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {message.content}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3 shadow-lg">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                <span className="text-sm text-emerald-200">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="fixed bottom-20 left-0 right-0 px-4 pb-4 bg-gradient-to-t from-[#1a2f26] via-[#1a2f26] to-transparent pt-8">
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 p-3 shadow-2xl">
          <div className="flex items-center gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about the environment..."
              className="flex-1 bg-white/5 border-white/20 text-white placeholder-gray-400 rounded-xl"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-[#10D9A0] hover:bg-[#0ec090] text-white rounded-xl px-4"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}