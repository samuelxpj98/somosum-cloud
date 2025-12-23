
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContent } from '../types';
import Header from '../components/Header';

interface HomeProps {
  content: AppContent;
}

const Home: React.FC<HomeProps> = ({ content }) => {
  const navigate = useNavigate();
  const isDark = content.profile.isDarkMode;

  return (
    <div className={`pb-28 min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Header content={content} />
      
      <main className="px-6 space-y-8 mt-6">
        {/* Expresso do Dia Card - Agora com mais destaque no topo */}
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

        {/* Aprofundamento Card */}
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
