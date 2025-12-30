
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContent, AppNotification } from '../types';
import { notificationsService } from '../lib/firebase';

interface HeaderProps {
  content: AppContent;
}

const Header: React.FC<HeaderProps> = ({ content }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  
  const isDark = content.profile.isDarkMode;
  const accessCount = content.profile.loginCount || 1;
  const profile = content.profile;

  useEffect(() => {
    if (profile?.id) {
      const unsub = notificationsService.subscribe(profile.id, setNotifications);
      return () => unsub();
    }
  }, [profile?.id]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotifClick = (n: AppNotification) => {
    notificationsService.markAsRead(profile.id, n.id);
    const path = n.postTitle.length > 30 ? 'aprofundar' : 'expresso';
    navigate(`/${path}/${n.postId}`);
    setShowNotifPanel(false);
  };

  const hasPhoto = profile.avatarUrl && !profile.avatarUrl.includes('dicebear') && profile.avatarUrl.length > 10;

  return (
    <>
      <header className={`sticky top-0 z-50 flex items-center justify-between px-6 py-5 transition-colors duration-300 ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50/90 border-slate-200'} border-b backdrop-blur-md`}>
        <h1 className={`text-2xl font-[900] tracking-tighter font-display cursor-pointer transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`} onClick={() => navigate('/home')}>
          SOMOSUMGOIAS
        </h1>
        <div className="flex items-center gap-3">
          {/* Botão de Notificações */}
          <button 
            onClick={() => setShowNotifPanel(!showNotifPanel)}
            className={`relative size-10 rounded-full flex items-center justify-center transition-all ${isDark ? 'bg-slate-800 text-white' : 'bg-white border border-slate-100 text-slate-600'}`}
          >
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: unreadCount > 0 ? "'FILL' 1" : "" }}>
              notifications
            </span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 size-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                {unreadCount}
              </span>
            )}
          </button>

          <div className={`hidden xs:flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-sm border transition-colors ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-700'}`}>
            <span className="material-symbols-outlined text-orange-500 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>login</span>
            <span className="text-sm font-bold">{accessCount}</span>
          </div>

          <button 
            onClick={() => navigate('/profile')}
            className={`size-10 rounded-full overflow-hidden ring-2 transition-all hover:opacity-80 flex items-center justify-center text-white font-black text-xs ${isDark ? 'ring-slate-700' : 'ring-white'}`}
            style={{ backgroundColor: !hasPhoto ? (profile.avatarColor || '#3B82F6') : 'transparent' }}
          >
            {hasPhoto ? (
              <img src={profile.avatarUrl} alt="Perfil" className="w-full h-full object-cover" />
            ) : (
              <span>{profile.name?.charAt(0).toUpperCase()}</span>
            )}
          </button>
        </div>
      </header>

      {/* Painel de Notificações */}
      {showNotifPanel && (
        <div className="fixed inset-0 z-[100] animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowNotifPanel(false)}></div>
          <div className={`absolute right-4 top-20 w-[calc(100%-32px)] max-w-sm rounded-[32px] shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-500 ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
            <div className={`p-5 border-b flex items-center justify-between ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
              <h3 className="text-xs font-black uppercase tracking-widest">Avisos</h3>
              <button onClick={() => setShowNotifPanel(false)} className="text-slate-400">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto no-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-12 text-center opacity-40">
                  <span className="material-symbols-outlined text-4xl mb-2">notifications_off</span>
                  <p className="text-[10px] font-black uppercase tracking-widest">Tudo limpo por aqui</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div 
                    key={n.id} 
                    onClick={() => handleNotifClick(n)}
                    className={`p-5 border-b transition-colors cursor-pointer flex gap-4 items-start ${n.read ? 'opacity-60' : (isDark ? 'bg-blue-600/5' : 'bg-blue-50/50')} ${isDark ? 'border-slate-800' : 'border-slate-50'}`}
                  >
                    <div className="size-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
                      <span className="material-symbols-outlined text-[20px]">chat</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] leading-tight mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        <span className="font-black">{n.senderName}</span> respondeu seu comentário.
                      </p>
                      <p className="text-[11px] text-slate-400 italic line-clamp-1 mb-2">"{n.text}"</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{n.postTitle.substring(0, 15)}...</span>
                        <span className="text-[8px] text-slate-300 font-bold">•</span>
                        <span className="text-[8px] text-slate-300 font-bold">{new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>
                    {!n.read && <div className="size-2 bg-blue-600 rounded-full mt-2"></div>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
