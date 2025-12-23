import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContent } from '../types';
import Header from '../components/Header';

interface HomeProps {
  content: AppContent;
}

const MISSIONS = [
  "Memorize 1 Pedro 3:15 hoje e pense em como aplicá-lo em uma conversa real.",
  "Pesquise sobre o 'Argumento do Ajuste Fino' (Fine-Tuning) do universo.",
  "Pergunte a um amigo: 'Qual sua maior dúvida sobre a existência de Deus?' e apenas ouça.",
  "Escreva 3 motivos históricos pelos quais confiamos na veracidade dos Evangelhos.",
  "Assista a um vídeo curto sobre a Ressurreição de Jesus sob a ótica jurídica.",
  "Leia Romanos 1:20 e tire uma foto de algo na criação que te lembre a glória de Deus.",
  "Desafio: Explique a um familiar o que é 'Apologética' em menos de 1 minuto.",
  "Pesquise sobre quem foi C.S. Lewis e como ele passou do ateísmo ao cristianismo.",
  "Analise o argumento 'Moral' para a existência de Deus.",
  "Hoje, ore por uma pessoa que você sabe que tem dificuldades intelectuais com a fé.",
  "Leia sobre a descoberta dos Manuscritos do Mar Morto.",
  "Tente explicar a Trindade usando uma analogia (e descubra por que todas falham!).",
  "Reflita: Como o mal no mundo pode ser um argumento para a existência de um padrão moral (Deus)?",
  "Descubra o que significa a 'Suficiência das Escrituras'.",
  "Compartilhe um dos 'Expressos' do app com alguém hoje no WhatsApp.",
  "Leia o Salmo 19:1 e medite na relação entre Astronomia e Fé.",
  "Pesquise o termo 'Teodiceia' e entenda o que ele significa no estudo da dor.",
  "Tire 5 minutos para agradecer por uma dúvida que você já conseguiu sanar.",
  "Leia sobre a vida de William Lane Craig ou Alister McGrath.",
  "Faça um post no seu Instagram sobre a harmonia entre Razão e Fé."
];

const Home: React.FC<HomeProps> = ({ content }) => {
  const navigate = useNavigate();
  const [mission, setMission] = useState<string | null>(null);
  const isDark = content.profile.isDarkMode;

  const handleGetMission = () => {
    const randomIndex = Math.floor(Math.random() * MISSIONS.length);
    setMission(MISSIONS[randomIndex]);
  };

  return (
    <div className={`pb-28 min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Header content={content} />
      
      <main className="px-6 space-y-8 mt-6">
        <section className="space-y-4 animate-in fade-in duration-500">
           <div className={`p-6 rounded-[32px] border shadow-sm transition-all ${isDark ? 'bg-blue-600/10 border-blue-50/20' : 'bg-white border-slate-100'}`}>
              <div className="flex items-center gap-3 mb-4">
                 <div className="size-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                    <span className="material-symbols-outlined text-[20px]">target</span>
                 </div>
                 <div>
                    <h3 className="text-sm font-black uppercase tracking-widest leading-none">Missão de Hoje</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Desafio Prático Local</p>
                 </div>
              </div>
              
              {mission ? (
                <div className="animate-in zoom-in-95 duration-300">
                  <p className={`text-sm font-medium leading-relaxed mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{mission}</p>
                  <button onClick={() => setMission(null)} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Fechar Missão</button>
                </div>
              ) : (
                <button 
                  onClick={handleGetMission}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-600/20 active:scale-95 transition-transform"
                >
                  Gerar Missão Aleatória
                </button>
              )}
           </div>
        </section>

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
      </main>
    </div>
  );
};

export default Home;