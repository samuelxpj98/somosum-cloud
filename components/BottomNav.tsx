
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface BottomNavProps {
  isDarkMode?: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({ isDarkMode }) => {
  const location = useLocation();
  
  // A barra deve estar visível em quase todos os lugares, exceto na Landing Page Inicial
  const hidePaths = ['/'];
  if (hidePaths.includes(location.pathname)) return null;

  return (
    <nav className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto h-24 border-t flex justify-around items-center px-2 pb-2 z-50 transition-all duration-300 ${isDarkMode ? 'bg-slate-950/90 border-slate-800' : 'bg-white/90 border-slate-100'} backdrop-blur-md`}>
      <NavLink to="/home" className={({isActive}) => `flex flex-col items-center gap-1.5 transition-colors ${isActive ? 'text-blue-600' : (isDarkMode ? 'text-slate-600' : 'text-slate-400')}`}>
        <div className={`size-12 rounded-2xl flex items-center justify-center transition-all ${location.pathname === '/home' ? 'bg-blue-600/10' : ''}`}>
          <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: location.pathname === '/home' ? "'FILL' 1" : "" }}>home</span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-tighter">Início</span>
      </NavLink>
      
      <NavLink to="/expresso" className={({isActive}) => `flex flex-col items-center gap-1.5 transition-colors ${isActive ? 'text-blue-600' : (isDarkMode ? 'text-slate-600' : 'text-slate-400')}`}>
        <div className={`size-12 rounded-2xl flex items-center justify-center transition-all ${location.pathname === '/expresso' ? 'bg-blue-600/10' : ''}`}>
          <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: location.pathname === '/expresso' ? "'FILL' 1" : "" }}>bolt</span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-tighter">Expresso</span>
      </NavLink>
      
      <NavLink to="/editor" className={({isActive}) => `flex flex-col items-center gap-1.5 transition-colors ${isActive || location.pathname.includes('/editor') ? 'text-blue-600' : (isDarkMode ? 'text-slate-600' : 'text-slate-400')}`}>
        <div className={`size-12 rounded-2xl flex items-center justify-center transition-all ${location.pathname.includes('/editor') ? 'bg-blue-600/10' : ''}`}>
          <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: location.pathname.includes('/editor') ? "'FILL' 1" : "" }}>edit_square</span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-tighter">Editor</span>
      </NavLink>
      
      <NavLink to="/aprofundar" className={({isActive}) => `flex flex-col items-center gap-1.5 transition-colors ${isActive ? 'text-blue-600' : (isDarkMode ? 'text-slate-600' : 'text-slate-400')}`}>
        <div className={`size-12 rounded-2xl flex items-center justify-center transition-all ${location.pathname === '/aprofundar' ? 'bg-blue-600/10' : ''}`}>
          <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: location.pathname === '/aprofundar' ? "'FILL' 1" : "" }}>menu_book</span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-tighter">Aprofundar</span>
      </NavLink>
      
      <NavLink to="/profile" className={({isActive}) => `flex flex-col items-center gap-1.5 transition-colors ${isActive ? 'text-blue-600' : (isDarkMode ? 'text-slate-600' : 'text-slate-400')}`}>
        <div className={`size-12 rounded-2xl flex items-center justify-center transition-all ${location.pathname === '/profile' ? 'bg-blue-600/10' : ''}`}>
          <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: location.pathname === '/profile' ? "'FILL' 1" : "" }}>person</span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-tighter">Perfil</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
