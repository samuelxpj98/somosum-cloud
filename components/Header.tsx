
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContent } from '../types';

interface HeaderProps {
  content: AppContent;
}

const Header: React.FC<HeaderProps> = ({ content }) => {
  const navigate = useNavigate();
  const isDark = content.profile.isDarkMode;
  const flameCount = content.profile.loginCount || 1;

  return (
    <header className={`sticky top-0 z-50 flex items-center justify-between px-6 py-5 transition-colors duration-300 ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50/90 border-slate-200'} border-b backdrop-blur-md`}>
      <h1 className={`text-2xl font-[900] tracking-tighter font-display cursor-pointer transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`} onClick={() => navigate('/home')}>
        SOMOSUMGOIAS
      </h1>
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-sm border transition-colors ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-700'}`}>
          <span className="material-symbols-outlined text-orange-500 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
          <span className="text-sm font-bold">{flameCount}</span>
        </div>
        <button 
          onClick={() => navigate('/profile')}
          className={`size-9 rounded-full overflow-hidden ring-2 transition-all hover:opacity-80 ${isDark ? 'ring-slate-700' : 'ring-white'}`}
        >
          <img 
            src={content.profile.avatarUrl} 
            alt="Perfil" 
            className="w-full h-full object-cover" 
            onError={(e) => { (e.target as HTMLImageElement).src = "https://api.dicebear.com/7.x/avataaars/svg?seed=neutral"; }}
          />
        </button>
      </div>
    </header>
  );
};

export default Header;
