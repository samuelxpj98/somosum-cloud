import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { marked } from 'marked';

interface AIApologistProps {
  articleTitle: string;
  articleContent: string;
  isDarkMode?: boolean;
  onClose: () => void;
}

const AIApologist: React.FC<AIApologistProps> = ({ articleTitle, articleContent, isDarkMode, onClose }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsTyping(true);

    try {
      // Inicialização estrita conforme diretrizes do SDK para Senior Engineers
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemInstruction = `Você é o Mentor SomosUm, um assistente especializado em apologética cristã, teologia e filosofia. 
      Você está ajudando um jovem a entender o artigo: "${articleTitle}". 
      Use uma linguagem clara, profunda, porém acessível. Sempre que possível, cite passagens bíblicas que sustentem os argumentos.
      Contexto do artigo atual: ${articleContent.substring(0, 2000)}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMessage,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const aiText = response.text || "Desculpe, tive um problema ao processar sua dúvida. Pode tentar de novo?";
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (error) {
      console.error("Erro na IA:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "Houve um erro na conexão com meu banco de dados teológico. Verifique sua conexão." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className={`mt-auto relative w-full max-w-md mx-auto h-[85vh] rounded-t-[40px] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-20 duration-500 ${isDarkMode ? 'bg-slate-900 border-t border-slate-800' : 'bg-white'}`}>
        {/* Header da IA */}
        <div className={`p-6 border-b flex items-center justify-between transition-colors ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
              <span className="material-symbols-outlined text-[28px]">smart_toy</span>
            </div>
            <div>
              <h3 className={`text-lg font-black font-display leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Mentor SomosUm</h3>
              <div className="flex items-center gap-1.5">
                <div className="size-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">IA Teológica Ativa</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className={`size-10 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-400'}`}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Área de Chat */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-transparent">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-60">
              <span className="material-symbols-outlined text-5xl text-blue-600">help_center</span>
              <div>
                <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Alguma dúvida sobre o artigo?</p>
                <p className="text-[11px] font-medium text-slate-400">Pergunte o que quiser sobre fé, razão ou teologia.</p>
              </div>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[85%] p-5 rounded-[28px] shadow-sm ${
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
              placeholder="Sua dúvida..."
              className={`flex-1 bg-transparent border-none focus:ring-0 p-3 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
            />
            <button 
              onClick={handleSend}
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
          <p className="text-center text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-4">IA Mentor: Use para fins educacionais e apologéticos.</p>
        </div>
      </div>
    </div>
  );
};

export default AIApologist;