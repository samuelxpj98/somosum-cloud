import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContent } from '../types';
import Header from '../components/Header';

// Curadoria de Missões (Fallback de Segurança e Base Local)
const FALLBACK_MISSIONS = [
  "Memorize 1 Pedro 3:15 hoje e pense em como aplicá-lo em uma conversa real.",
  "Desafio: Explique a um familiar o que é 'Evangelho' em menos de 1 minuto.",
  "Compartilhe um dos 'Expressos' do app com alguém hoje no WhatsApp.",
  "Leia Romanos 1:20 e tire uma foto de algo na criação que te lembre a glória de Deus.",
  "Pergunte a um amigo: 'Qual sua maior dúvida sobre a existência de Deus?' e apenas ouça.",
  "Pesquise sobre o 'Argumento do Ajuste Fino' (Fine-Tuning) do universo.",
  "Assista hoje pelo menos um vídeo curto do 'Bibleproject português' no Youtube!",
  "Descubra quem foi C.S. Lewis e como ele passou do ateísmo ao cristianismo.",
  "Analise o argumento 'Moral' para a existência de Deus: o bem e o mal são relativos?",
  "Tire 5 minutos para orar especificamente por um amigo que tem dúvidas sobre a fé."
];

interface HomeProps {
  content: AppContent;
  missions: string[];
}

const Home: React.FC<HomeProps> = ({ content, missions }) => {
  const navigate = useNavigate();
  const [currentMission, setCurrentMission] = useState<string | null>(null);
  const isDark = content.profile.isDarkMode;

  const handleGetMission = () => {
    const source = missions.length > 0 ? missions : FALLBACK_MISSIONS;
    const randomIndex = Math.floor(Math.random() * source.length);
    setCurrentMission(source[randomIndex]);
  };

  return (
    <div className={`pb-28 min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Header content={content} />
      
      <main className="px-6 space-y-8 mt-6">
        {/* Expressos */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className={`text-xs font-[900] uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Destaque do Dia</h3>
          </div>
          <div 
            onClick={() => navigate('/expresso')}
            className="relative overflow-hidden rounded-[32px] shadow-xl aspect-[1.1/1] group cursor-pointer active:scale-[0.98] transition-transform"
          >
            <img 
              src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              alt="Expresso"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            
            <div className="absolute inset-0 p-8 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-yellow-400 text-black p-1 rounded-lg">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                </div>
                <span className="text-yellow-400 font-black text-sm tracking-widest uppercase">Rápido</span>
              </div>
              
              <h2 className="text-4xl font-black text-white mb-2 leading-none font-display">Expresso do Dia</h2>
              <p className="text-white/80 text-lg font-medium leading-tight max-w-[240px]">Respostas simples para o seu dia a dia.</p>
              
              <div className="mt-8">
                <div className="inline-flex items-center justify-between w-full bg-white text-blue-600 font-bold py-4 px-6 rounded-2xl shadow-lg">
                  <span className="text-xs uppercase tracking-widest font-black">Ler Agora</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Aprofundamento */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className={`text-xs font-[900] uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Estudo Profundo</h3>
          </div>
          <div 
            onClick={() => navigate('/aprofundar')}
            className={`relative overflow-hidden rounded-[32px] shadow-xl aspect-[1.1/1] group cursor-pointer active:scale-[0.98] transition-transform ${isDark ? 'bg-slate-950 border border-slate-800' : 'bg-slate-950'}`}
          >
            <img 
              src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=800" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-40" 
              alt="Aprofundamento"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
            
            <div className="absolute inset-0 p-8 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-white/10 backdrop-blur-md text-white p-1 rounded-lg border border-white/20">
                  <span className="material-symbols-outlined text-[20px]">menu_book</span>
                </div>
                <span className="text-white/70 font-black text-sm tracking-widest uppercase">Estudo</span>
              </div>
              
              <h2 className="text-4xl font-black text-white mb-2 leading-none font-display">Aprofundar</h2>
              <p className="text-white/70 text-lg font-medium leading-tight max-w-[240px]">Teologia e filosofia para quem quer ir além.</p>
              
              <div className="mt-8">
                <div className="inline-flex items-center justify-between w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-600/20 border border-blue-400/20">
                  <span className="text-xs uppercase tracking-widest font-black">Ver Tudo</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Missão de Hoje (Encerrando o feed) */}
        <section className="space-y-4 pt-4 animate-in fade-in duration-700">
           <div className={`p-6 rounded-[40px] border shadow-2xl transition-all ${isDark ? 'bg-blue-600/10 border-blue-500/20' : 'bg-white border-slate-100'}`}>
              <div className="flex items-center gap-4 mb-6">
                 <div className="size-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-600/30">
                    <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>target</span>
                 </div>
                 <div>
                    <h3 className="text-base font-black uppercase tracking-tight leading-none">Desafio Prático</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-widest">
                      Missão Diária
                    </p>
                 </div>
              </div>
              
              {currentMission ? (
                <div className="animate-in zoom-in-95 duration-300">
                  <div className={`p-5 rounded-2xl mb-6 ${isDark ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                    <p className={`text-[15px] font-bold leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {currentMission}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <button onClick={() => setCurrentMission(null)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">Fechar</button>
                    <button onClick={handleGetMission} className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">refresh</span>
                      Outra Missão
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={handleGetMission}
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 active:scale-95 transition-transform flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined text-[20px]">auto_fix</span>
                  Revelar Minha Missão
                </button>
              )}
           </div>
        </section>
      </main>
    </div>
  );
};

export default Home;