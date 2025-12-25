
import React, { useState, useRef, useMemo } from 'react';
import { UserProfile, Expresso } from '../types';
import { useNavigate } from 'react-router-dom';

interface ProfileProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  readCount: number;
  userPosts: Expresso[];
}

const Profile: React.FC<ProfileProps> = ({ profile, onUpdate, readCount, userPosts }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setEditedProfile({ ...editedProfile, avatarUrl: base64 });
        if (!isEditing) {
          onUpdate({ ...profile, avatarUrl: base64 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onUpdate(editedProfile);
    setIsEditing(false);
  };

  const toggleDarkMode = () => {
    const updated = { ...profile, isDarkMode: !profile.isDarkMode };
    onUpdate(updated);
    setEditedProfile(updated);
  };

  const isDark = profile.isDarkMode;

  const savedPosts = useMemo(() => {
    const allAprofs = userPosts;
    return allAprofs.filter(post => profile.savedPostIds.includes(post.id));
  }, [profile.savedPostIds, userPosts]);

  const displayedSavedPosts = savedPosts.slice(0, 3);

  return (
    <div className={`min-h-screen pb-32 transition-colors duration-300 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <header className={`p-6 flex justify-between items-center sticky top-0 z-40 backdrop-blur-md ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-100'} border-b`}>
        <div className="w-10"></div>
        <h1 className={`text-lg font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Meu Perfil
        </h1>
        <button 
          onClick={toggleDarkMode}
          className={`size-10 flex items-center justify-center rounded-full transition-all ${isDark ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-100 text-slate-600'}`}
        >
          <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
        </button>
      </header>

      <main className="px-6 pt-8 space-y-6 animate-in fade-in duration-500">
        {/* Header Compacto */}
        <section className={`p-6 rounded-[32px] border transition-all ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'} flex items-center gap-5`}>
          <div className="relative" onClick={() => fileInputRef.current?.click()}>
            <div className={`size-20 rounded-2xl p-0.5 bg-gradient-to-tr ${profile.isPastor ? 'from-amber-400 to-orange-500' : 'from-blue-600 to-cyan-400'} shadow-lg transition-transform active:scale-95 overflow-hidden`}>
              <img 
                src={isEditing ? editedProfile.avatarUrl : profile.avatarUrl} 
                alt={profile.name} 
                className="size-full rounded-[14px] object-cover border-2 border-white" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://api.dicebear.com/7.x/avataaars/svg?seed=neutral";
                }}
              />
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <h2 className={`text-lg font-black truncate leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {profile.name}
              </h2>
              {profile.isPastor && (
                <span className="material-symbols-outlined text-amber-500 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${profile.isPastor ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                {profile.isPastor ? 'Pastor' : 'Membro'}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[120px]">
                {profile.church}
              </span>
            </div>
          </div>
        </section>

        {/* Estatísticas Rápidas */}
        <section className="grid grid-cols-2 gap-4">
          <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'} p-4 rounded-3xl border flex items-center gap-4 transition-colors`}>
            <span className="material-symbols-outlined text-orange-500 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
            <div>
              <span className={`text-lg font-black block leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>{profile.stats.daysInRow}</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Fogo</span>
            </div>
          </div>
          <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'} p-4 rounded-3xl border flex items-center gap-4 transition-colors`}>
            <span className="material-symbols-outlined text-indigo-500 text-2xl">menu_book</span>
            <div>
              <span className={`text-lg font-black block leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>{readCount}</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Estudos</span>
            </div>
          </div>
        </section>

        {/* Detalhes do Perfil (Minimizado por padrão) */}
        <section className={`rounded-[32px] border transition-all overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="w-full px-6 py-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[20px]">badge</span>
              <h3 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Dados da Identidade</h3>
            </div>
            <span className={`material-symbols-outlined text-slate-400 transition-transform ${showDetails ? 'rotate-180' : ''}`}>expand_more</span>
          </button>

          {showDetails && (
            <div className="px-6 pb-6 space-y-5 animate-in slide-in-from-top-2 duration-300">
              <div className="h-[1px] w-full bg-slate-100 dark:bg-slate-700"></div>
              
              <div className="flex items-start gap-4">
                 <div className="size-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <span className="material-symbols-outlined text-[18px]">school</span>
                 </div>
                 <div className="flex-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Estudante / Curso</p>
                    {isEditing ? (
                      <input 
                        value={editedProfile.education}
                        onChange={e => setEditedProfile({...editedProfile, education: e.target.value})}
                        className={`w-full font-bold text-sm bg-transparent border-b border-blue-600 pb-1 focus:outline-none ${isDark ? 'text-white' : 'text-slate-900'}`}
                      />
                    ) : (
                      <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{profile.education || 'Não informada'}</p>
                    )}
                 </div>
              </div>

              <div className="flex items-start gap-4">
                 <div className="size-8 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                 </div>
                 <div className="flex-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">WhatsApp</p>
                    {isEditing ? (
                      <input 
                        value={editedProfile.whatsapp}
                        onChange={e => setEditedProfile({...editedProfile, whatsapp: e.target.value})}
                        className={`w-full font-bold text-sm bg-transparent border-b border-blue-600 pb-1 focus:outline-none ${isDark ? 'text-white' : 'text-slate-900'}`}
                      />
                    ) : (
                      <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{profile.whatsapp}</p>
                    )}
                 </div>
              </div>

              <div className="flex items-start gap-4">
                 <div className="size-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <span className="material-symbols-outlined text-[18px]">mail</span>
                 </div>
                 <div className="flex-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">E-mail</p>
                    <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{profile.email}</p>
                 </div>
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setIsEditing(false)} className={`flex-1 h-12 rounded-xl font-black uppercase text-[10px] border ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-400'}`}>Cancelar</button>
                  <button onClick={handleSave} className="flex-1 h-12 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] shadow-lg shadow-blue-600/20">Salvar</button>
                </div>
              )}
              
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className={`w-full h-12 rounded-xl font-black uppercase text-[10px] border flex items-center justify-center gap-2 transition-all active:scale-95 ${isDark ? 'bg-slate-700/50 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  Editar Informações
                </button>
              )}
            </div>
          )}
        </section>

        {/* Biblioteca Salva */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className={`text-xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Salvos</h3>
            {savedPosts.length > 3 && (
              <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Ver Todos</button>
            )}
          </div>
          
          <div className="grid gap-3">
            {displayedSavedPosts.length === 0 ? (
              <div className={`p-10 rounded-[32px] border border-dashed flex flex-col items-center gap-3 text-center ${isDark ? 'bg-slate-800/20 border-slate-700 text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                <span className="material-symbols-outlined text-4xl">bookmark_border</span>
                <p className="text-xs font-bold uppercase tracking-widest">Nada salvo ainda</p>
              </div>
            ) : (
              displayedSavedPosts.map(post => (
                <div 
                  key={post.id}
                  onClick={() => navigate(`/aprofundar/${post.id}`)}
                  className={`p-3.5 rounded-[24px] border transition-all active:scale-[0.98] flex items-center gap-4 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'}`}
                >
                  <img src={post.imageUrl} className="size-12 rounded-xl object-cover shadow-sm flex-shrink-0" alt="" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black truncate leading-tight">{post.title}</h4>
                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{post.category}</span>
                  </div>
                  <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Logout (Discreto) */}
        <div className="pt-8 pb-4 text-center">
          <button 
            onClick={() => { localStorage.clear(); window.location.href = '/'; }}
            className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center justify-center gap-2 mx-auto"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            Sair da Conta
          </button>
        </div>
      </main>
    </div>
  );
};

export default Profile;
