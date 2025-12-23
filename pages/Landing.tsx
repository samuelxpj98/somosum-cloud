
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContent } from '../types';

interface LandingProps {
  content: AppContent;
}

const Landing: React.FC<LandingProps> = ({ content }) => {
  const navigate = useNavigate();
  const { branding, landing } = content;
  const isDark = content.profile.isDarkMode;

  return (
    <div className={`relative min-h-screen flex flex-col p-6 items-center overflow-x-hidden transition-colors duration-300 ${isDark ? 'bg-slate-950 text-white' : 'bg-[#f8fafc] text-slate-900'}`}>
      {/* Padrão de Pontos no Fundo */}
      <div className={`absolute inset-0 opacity-[0.15] pointer-events-none ${isDark ? 'opacity-[0.05]' : 'opacity-[0.15]'}`} 
           style={{ 
             backgroundImage: `radial-gradient(${isDark ? '#ffffff' : '#64748b'} 1px, transparent 1px)`, 
             backgroundSize: '24px 24px' 
           }}></div>
      
      {/* Seção do Logo */}
      <div className="relative z-10 flex flex-col items-center mt-12 mb-10 w-full">
        <div className="relative mb-6">
          <div className={`w-28 h-28 rounded-[32px] shadow-lg flex items-center justify-center border-4 transition-colors ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-blue-100/50'}`}>
            <span className="material-symbols-outlined text-[56px] text-blue-600" style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span>
          </div>
          <div className="absolute -bottom-1 -right-2 bg-[#ffcc00] text-slate-900 text-[11px] font-[900] px-3 py-1 rounded-full shadow-md uppercase tracking-tighter">
            GUIA
          </div>
        </div>

        <h1 className="text-[44px] font-[900] tracking-tighter leading-none mb-1 font-display flex">
          <span className={isDark ? 'text-white' : 'text-slate-900'}>SOMOS</span>
          <span className="text-blue-600">UM</span>
        </h1>
        
        <div className="flex items-center justify-center gap-4 mb-5 w-full max-w-[200px]">
          <div className={`h-[1px] flex-1 ${isDark ? 'bg-slate-800' : 'bg-slate-300'}`}></div>
          <h2 className="text-[13px] font-bold text-slate-400 tracking-[0.4em] uppercase">GOIÁS</h2>
          <div className={`h-[1px] flex-1 ${isDark ? 'bg-slate-800' : 'bg-slate-300'}`}></div>
        </div>

        <div className={`backdrop-blur-sm px-6 py-2 rounded-full mb-8 ${isDark ? 'bg-blue-600/10' : 'bg-blue-50/80'}`}>
          <p className="text-[11px] font-bold text-blue-600 uppercase tracking-[0.15em]">
            APOLOGÉTICA JOVEM
          </p>
        </div>
      </div>

      {/* Card de Destaque */}
      <div className="relative z-10 w-full mb-10 group">
        <div className={`w-full aspect-[1.3/1] rounded-[32px] overflow-hidden shadow-2xl relative border-4 transition-colors ${isDark ? 'border-slate-800' : 'border-white'}`}>
          <img 
            src={landing.heroImage} 
            alt="Jovens" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
          
          <div className="absolute top-6 left-6 flex gap-2">
            <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-lg border border-white/20">Fé</span>
            <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-lg border border-white/20">Razão</span>
          </div>

          <div className="absolute bottom-6 left-6 right-6">
            <h3 className="text-white text-xl font-bold leading-tight">
              Respostas profundas para dúvidas sinceras.
            </h3>
          </div>
        </div>
      </div>

      {/* Chamada para Ação */}
      <div className="relative z-10 w-full text-center mb-10 px-4">
        <h3 className={`text-[26px] font-[800] mb-3 tracking-tight font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {landing.title}
        </h3>
        <p className={`text-[15px] leading-relaxed max-w-[320px] mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {landing.description}
        </p>
      </div>

      {/* Botões */}
      <div className="relative z-10 w-full space-y-4 mb-12 px-2">
        <button 
          onClick={() => navigate('/home')}
          className="w-full bg-[#135bec] hover:bg-blue-700 text-white font-bold h-16 rounded-[20px] shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
        >
          <span className="text-lg">Explorar o Guia</span>
          <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
        </button>
        <button className={`w-full font-bold h-16 rounded-[20px] border shadow-sm transition-all active:scale-[0.98] ${isDark ? 'bg-slate-900 border-slate-800 text-white hover:bg-slate-800' : 'bg-white border-slate-100 text-slate-800 hover:bg-slate-50'}`}>
          Já tenho conta
        </button>
      </div>

      {/* Rodapé */}
      <div className="relative z-10 w-full py-8 mt-auto flex items-center justify-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
        <span>Sobre</span>
        <div className="size-1 rounded-full bg-slate-300"></div>
        <span>Ajuda</span>
        <div className="size-1 rounded-full bg-slate-300"></div>
        <span>Privacidade</span>
      </div>
    </div>
  );
};

export default Landing;
