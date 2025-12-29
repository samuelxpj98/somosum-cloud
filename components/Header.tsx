
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContent } from '../types';

interface HeaderProps {
  content: AppContent;
}

const Header: React.FC<HeaderProps> = ({ content }) => {
  const navigate = useNavigate();
  const isDark = content.profile.isDarkMode;
  const accessCount = content.profile.loginCount || 1;
  const profile = content.profile;

  const hasPhoto = profile.avatarUrl && !profile.avatarUrl.includes('dicebear') && profile.avatarUrl.length > 10;

  return (
    <header className={`sticky top-0 z-50 flex items-center justify-between px-6 py-5 transition-colors duration-300 ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50/90 border-slate-200'} border-b backdrop-blur-md`}>
      <h1 className={`text-2xl font-[900] tracking-tighter font-display cursor-pointer transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`} onClick={() => navigate('/home')}>
        SOMOSUMGOIAS
      </h1>
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-sm border transition-colors ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-700'}`}>
          <span className="material-symbols-outlined text-orange-500 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>login</span>
          <span className="text-sm font-bold">{accessCount}</span>
        </div>
        <button 
          onClick={() => navigate('/profile')}
          className={`size-9 rounded-full overflow-hidden ring-2 transition-all hover:opacity-80 flex items-center justify-center text-white font-black text-xs ${isDark ? 'ring-slate-700' : 'ring-white'}`}
          style={{ backgroundColor: !hasPhoto ? (profile.avatarColor || '#3B82F6') : 'transparent' }}
        >
          {hasPhoto ? (
            <img 
              src={profile.avatarUrl} 
              alt="Perfil" 
              className="w-full h-full object-cover" 
            />
          ) : (
            <span>{profile.name?.charAt(0).toUpperCase()}</span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
