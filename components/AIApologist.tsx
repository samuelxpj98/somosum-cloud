
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { marked } from 'marked';

interface AIApologistProps {
  articleTitle: string;
  articleContent: string;
  isDarkMode?: boolean;
  onClose: () => void;
}

const SUGGESTED_PROMPTS = [
  "Explique isso para uma criança de 10 anos.",
  "Quais as principais evidências citadas?",
  "Como posso aplicar isso na escola/faculdade?",
  "Indique 3 versículos extras sobre este tema."
];

const AIApologist: React.FC<AIApologistProps> = ({ articleTitle, articleContent, isDarkMode, onClose }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Configurações Avançadas
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const resetConversation = () => {
    if (window.confirm("Deseja limpar o histórico desta conversa?")) {
      setMessages([]);
    }
  };

  const handleSend = async (customText?: string) => {
    const userMessage = customText || input.trim();
    if (!userMessage || isTyping) return;

    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const systemInstruction = `Você é o Mentor SomosUm, um assistente especializado em apologética cristã, teologia e filosofia. 
      Você está ajudando um jovem a entender o artigo: "${articleTitle}". 
      Use uma linguagem clara, profunda, porém acessível. Sempre que possível, cite passagens bíblicas.
      Sua personalidade é ajustada pela Temperatura: ${temperature} (mais alto = mais criativo/pastoral, mais baixo = mais técnico/acadêmico).
      Contexto do artigo atual: ${articleContent.substring(0, 3000)}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMessage,
        config: {
          systemInstruction,
          temperature: temperature,
          topP: topP,
        },
      });

      const aiText = response.text || "Desculpe, tive um problema ao processar sua dúvida. Pode tentar de novo?";
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (error) {
      console.error("Erro na IA:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "Houve um erro na conexão com meu banco de dados teológico." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className={`mt-auto relative w-full max-w-md mx-auto h-[88vh] rounded-t-[40px] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-20 duration-500 ${isDarkMode ? 'bg-slate-900 border-t border-slate-800' : 'bg-white'}`}>
        
        {/* Header da IA com Controles Avançados */}
        <div className={`p-5 border-b flex items-center justify-between transition-colors ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
              <span className="material-symbols-outlined text-[24px]">smart_toy</span>
            </div>
            <div>
              <h3 className={`text-sm font-black font-display leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Mentor IA</h3>
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Online</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button onClick={resetConversation} className={`size-9 rounded-lg flex items-center justify-center transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-400'}`} title="Resetar Conversa">
              <span className="material-symbols-outlined text-[20px]">restart_alt</span>
            </button>
            <button onClick={() => setShowSettings(!showSettings)} className={`size-9 rounded-lg flex items-center justify-center transition-colors ${showSettings ? 'bg-blue-600 text-white' : (isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-400')}`} title="Configurações Avançadas">
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </button>
            <div className="w-2"></div>
            <button onClick={onClose} className={`size-9 rounded-lg flex items-center justify-center transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-400'}`}>
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Modal de Configurações Avançadas */}
        {showSettings && (
          <div className={`p-6 border-b animate-in slide-in-from-top-2 duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-blue-50/50 border-blue-100'}`}>
            <h4 className={`text-[10px] font-black uppercase tracking-widest mb-4 ${isDarkMode ? 'text-slate-400' : 'text-blue-600'}`}>Parâmetros da Resposta</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className={`text-[11px] font-bold ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>Temperatura (Criatividade)</span>
                  <span className="text-[11px] font-black text-blue-600">{temperature}</span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.1" 
                  value={temperature} 
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between mt-1 text-[8px] font-bold text-slate-400 uppercase">
                  <span>Acadêmico</span>
                  <span>Pastoral</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Área de Chat */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-transparent">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6">
              <div className="size-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-blue-600 animate-pulse">chat_bubble</span>
              </div>
              <div>
                <p className={`text-base font-bold mb-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Alguma dúvida sobre o tema?</p>
                <p className="text-xs text-slate-400">Clique em uma sugestão ou digite sua pergunta.</p>
              </div>
              
              <div className="grid grid-cols-1 gap-2 w-full max-w-[280px]">
                {SUGGESTED_PROMPTS.map((p, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSend(p)}
                    className={`p-3 rounded-2xl border text-[11px] font-bold text-left transition-all active:scale-95 ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-blue-500' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[88%] p-5 rounded-[28px] shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : (isDarkMode ? 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700' : 'bg-slate-100 text-slate-800 rounded-tl-none')
              }`}>
                <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'text-white' : (isDarkMode ? 'prose-invert text-slate-200' : 'prose-slate text-slate-800')}`} 
                     dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }} />
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className={`p-4 rounded-[20px] rounded-tl-none flex items-center gap-1 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <div className="size-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="size-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="size-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Input de Mensagem */}
        <div className={`p-6 border-t ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <div className={`flex items-center gap-3 p-2 rounded-[24px] border-2 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 focus-within:border-blue-500/50' : 'bg-slate-50 border-slate-100 focus-within:border-blue-200'}`}>
            <input 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Digite sua dúvida teológica..."
              className={`flex-1 bg-transparent border-none focus:ring-0 p-3 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className={`size-12 rounded-2xl flex items-center justify-center transition-all ${
                input.trim() && !isTyping 
                  ? 'bg-blue-600 text-white shadow-lg active:scale-90' 
                  : 'bg-slate-300 text-slate-50 opacity-40'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIApologist;
