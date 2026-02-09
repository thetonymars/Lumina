
import React, { useState, useRef, useEffect } from 'react';
import { DesignHistoryItem, ProductRecommendation } from '../types';

interface ChatBoxProps {
  history: DesignHistoryItem[];
  onSendMessage: (msg: string) => void;
  isLoading: boolean;
  recommendations: ProductRecommendation[];
}

const ChatBox: React.FC<ChatBoxProps> = ({ history, onSendMessage, isLoading, recommendations }) => {
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-indigo-600 p-4 text-white font-medium flex items-center gap-2">
        <i className="fa-solid fa-wand-magic-sparkles"></i>
        <span>Design Assistant</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {history.length === 0 && (
          <div className="text-center text-gray-400 py-10">
            <i className="fa-regular fa-comment-dots text-4xl mb-2"></i>
            <p>Ready to refine your space? <br/>Ask me to change colors, furniture, or layout.</p>
          </div>
        )}
        
        {history.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-gray-100 text-gray-800 rounded-tl-none'
            }`}>
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="space-y-3 pt-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Shoppable Items</p>
            {recommendations.map((item, idx) => (
              <a 
                key={idx} 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block p-3 bg-indigo-50 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors group"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-indigo-900 text-sm">{item.title}</span>
                  {item.price && <span className="text-indigo-600 font-bold text-xs">{item.price}</span>}
                </div>
                <p className="text-xs text-gray-600 mb-2">{item.description}</p>
                <div className="text-[10px] text-indigo-500 font-medium group-hover:underline">
                  View on Retailer <i className="fa-solid fa-external-link ml-1"></i>
                </div>
              </a>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 bg-gray-50 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., 'Add a blue velvet sofa'"
          className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={isLoading}
        />
        <button 
          type="submit"
          disabled={isLoading || !input.trim()}
          className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          <i className="fa-solid fa-paper-plane"></i>
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
