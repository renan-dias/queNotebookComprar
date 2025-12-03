import React, { useState, useEffect, useRef } from 'react';
import Intro from './components/Intro';
import NotebookCard from './components/NotebookCard';
import Charts from './components/Charts';
import LiveSession from './components/LiveSession';
import { sendMessage } from './services/geminiService';
import { Message, RecommendationMetadata } from './types';
import { Send, Mic, MapPin, Search, ExternalLink } from 'lucide-react';

const SUGGESTIONS = [
  "Notebook gamer até R$ 5000",
  "Melhor custo-benefício para estudar",
  "MacBook Air M1 ou M2?",
  "Onde tem loja de informática perto?"
];

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showLiveSession, setShowLiveSession] = useState(false);
  const [location, setLocation] = useState<{ lat: number, lng: number } | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message
  useEffect(() => {
    if (!showIntro && messages.length === 0) {
      setMessages([{
        id: 'init',
        role: 'model',
        text: 'Olá! Eu sou o TechAdvisor. Estou aqui para te ajudar a escolher o notebook ideal. Me diga: qual será o uso principal do notebook e quanto você pretende investir?',
        timestamp: new Date()
      }]);
    }
  }, [showIntro, messages.length]);

  // Get location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log('Location access denied', err)
      );
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => scrollToBottom(), [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessage(messages, text, location);
      
      const modelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        timestamp: new Date(),
        metadata: response.metadata
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (showIntro) {
    return <Intro onComplete={() => setShowIntro(false)} />;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden">
      
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">Q</div>
          <h1 className="font-bold text-lg hidden md:block">Que Notebook Comprar?</h1>
        </div>
        <button 
          onClick={() => setShowLiveSession(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-lg shadow-blue-900/50"
        >
          <Mic size={16} />
          <span>Falar com Especialista</span>
        </button>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] md:max-w-[80%] space-y-2`}>
                
                {/* Bubble */}
                <div className={`p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none shadow-sm'
                }`}>
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                </div>

                {/* Rich Content (Metadata) - Only for model */}
                {msg.role === 'model' && msg.metadata && (
                  <div className="space-y-4 mt-2 animate-fade-in">
                    
                    {/* Charts */}
                    {msg.metadata.chartData && msg.metadata.chartData.length > 0 && (
                      <Charts data={msg.metadata.chartData} />
                    )}

                    {/* Notebook Cards */}
                    {msg.metadata.notebooks && msg.metadata.notebooks.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {msg.metadata.notebooks.map((nb, idx) => (
                          <NotebookCard key={idx} notebook={nb} />
                        ))}
                      </div>
                    )}

                    {/* Grounding Sources (Search) */}
                    {msg.metadata.groundingLinks && msg.metadata.groundingLinks.length > 0 && (
                      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 text-xs">
                        <div className="flex items-center text-slate-400 mb-2">
                          <Search size={12} className="mr-1" />
                          <span>Fontes da Pesquisa Google</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {msg.metadata.groundingLinks.slice(0, 3).map((link, idx) => (
                            <a 
                              key={idx} 
                              href={link.url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-blue-400 hover:text-blue-300 flex items-center transition-colors truncate max-w-[200px]"
                            >
                              <span className="truncate mr-1">{link.title}</span>
                              <ExternalLink size={10} />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                     {/* Map Locations */}
                     {msg.metadata.mapLocations && msg.metadata.mapLocations.length > 0 && (
                      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 text-xs">
                         <div className="flex items-center text-slate-400 mb-2">
                          <MapPin size={12} className="mr-1" />
                          <span>Lojas Encontradas (Google Maps)</span>
                        </div>
                        <ul className="space-y-1">
                          {msg.metadata.mapLocations.map((loc, idx) => (
                            <li key={idx} className="text-slate-300">{loc.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
               <div className="bg-slate-800 p-4 rounded-2xl rounded-bl-none border border-slate-700 flex items-center space-x-2">
                 <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                 <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-slate-900 p-4 border-t border-slate-800">
        <div className="max-w-4xl mx-auto">
          
          {/* Suggestions */}
          {messages.length < 2 && (
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
              {SUGGESTIONS.map(s => (
                <button 
                  key={s} 
                  onClick={() => handleSend(s)}
                  className="whitespace-nowrap px-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-sm text-slate-300 hover:bg-slate-700 hover:border-blue-500 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ex: Notebook para arquitetura até 6 mil..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="p-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-xl text-white transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </footer>

      {/* Live Voice Modal */}
      <LiveSession isOpen={showLiveSession} onClose={() => setShowLiveSession(false)} />

    </div>
  );
}
