import React, { useState, useRef, useMemo } from 'react';
import { UserProfile, Expresso } from '../types';
import { useNavigate } from 'react-router-dom';
import { AVATAR_COLORS } from '../App';

interface ProfileProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  userPosts: Expresso[];
}

const Profile: React.FC<ProfileProps> = ({ profile, onUpdate, userPosts }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const safeProfile = useMemo(() => ({
    ...profile,
    savedPostIds: profile?.savedPostIds || [],
    likedPostIds: profile?.likedPostIds || [],
    readPostIds: profile?.readPostIds || [],
    loginCount: profile?.loginCount || 1,
    stats: profile?.stats || { daysInRow: 1, savedPosts: 0, writtenPosts: 0 },
    avatarUrl: profile?.avatarUrl || "",
    avatarColor: profile?.avatarColor || "#3B82F6",
    name: profile?.name || "Explorador",
    church: profile?.church || "Visitante",
    isPastor: !!profile?.isPastor,
    leadershipRole: profile?.leadershipRole || (profile?.isPastor ? 'pastor' : 'none'),
    isDarkMode: !!profile?.isDarkMode
  }), [profile]);

  // Cálculo robusto da porcentagem de leitura
  // Filtramos apenas posts que realmente existem no banco atual e que são "líveis" (EXPRESSO ou APROFUNDAR)
  const { readCount, totalReadablePosts, readPercentage } = useMemo(() => {
    if (!userPosts || userPosts.length === 0) return { readCount: 0, totalReadablePosts: 0, readPercentage: 0 };
    
    // Filtra apenas posts que podem ser lidos (ignora missões e outros tipos se existirem)
    const readablePosts = userPosts.filter(p => p.categoryType === 'EXPRESSO' || p.categoryType === 'APROFUNDAR');
    const total = readablePosts.length;
    
    // Conta quantos dos posts lidos pelo usuário realmente existem na lista atual
    const readIdsSet = new Set(safeProfile.readPostIds);
    const count = readablePosts.filter(p => readIdsSet.has(p.id)).length;
    
    const percentage = total > 0 ? Math.min(100, Math.round((count / total) * 100)) : 0;
    
    return { 
      readCount: count, 
      totalReadablePosts: total, 
      readPercentage: percentage 
    };
  }, [safeProfile.readPostIds, userPosts]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setEditedProfile({ ...editedProfile, avatarUrl: base64 });
        if (!isEditing) {
          onUpdate({ ...safeProfile, avatarUrl: base64 });
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
    const updated = { ...safeProfile, isDarkMode: !safeProfile.isDarkMode };
    onUpdate(updated);
    setEditedProfile(updated);
  };

  const isDark = safeProfile.isDarkMode;
  const hasPhoto = (isEditing ? editedProfile.avatarUrl : safeProfile.avatarUrl)?.length > 10;
  const isLeader = safeProfile.leadershipRole !== 'none';

  const getRoleLabel = () => {
    if (safeProfile.leadershipRole === 'pastor') return 'Pastor';
    if (safeProfile.leadershipRole === 'lider_juventude') return 'Líder Juventude';
    return 'Membro';
  };

  const savedPostsList = useMemo(() => {
    if (!userPosts) return [];
    return userPosts.filter(post => safeProfile.savedPostIds.includes(post.id));
  }, [safeProfile.savedPostIds, userPosts]);

  const displayedSavedPosts = savedPostsList.slice(0, 5);

  const handleLogout = () => {
    localStorage.removeItem('user_profile');
    localStorage.removeItem('somosum_sheets_cache_v4');
    window.location.href = '/';
  };

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
        <section className={`p-6 rounded-[32px] border transition-all ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'} flex items-center gap-5`}>
          <div className="relative" onClick={() => fileInputRef.current?.click()}>
            <div 
              className={`size-20 rounded-2xl p-0.5 shadow-lg transition-transform active:scale-95 overflow-hidden flex items-center justify-center text-white font-black text-2xl`}
              style={{ 
                backgroundColor: !hasPhoto ? (isEditing ? editedProfile.avatarColor : safeProfile.avatarColor) : 'transparent',
                background: hasPhoto ? (isLeader ? 'linear-gradient(to tr, #fbbf24, #f97316)' : 'linear-gradient(to tr, #2563eb, #22d3ee)') : undefined
              }}
            >
              {hasPhoto ? (
                <img 
                  src={isEditing ? editedProfile.avatarUrl : safeProfile.avatarUrl} 
                  alt={safeProfile.name} 
                  className="size-full rounded-[14px] object-cover border-2 border-white" 
                />
              ) : (
                <span>{(isEditing ? editedProfile.name : safeProfile.name)?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 size-7 bg-blue-600 border-2 border-white rounded-full flex items-center justify-center text-white shadow-md">
               <span className="material-symbols-outlined text-[16px]">add_a_photo</span>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <h2 className={`text-lg font-black truncate leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {safeProfile.name}
              </h2>
              {isLeader && (
                <span className="material-symbols-outlined text-amber-500 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${isLeader ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                {getRoleLabel()}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[120px]">
                {safeProfile.church}
              </span>
            </div>
          </div>
        </section>

        {/* Seletor de Cores na Edição */}
        {isEditing && !hasPhoto && (
          <section className={`p-6 rounded-[32px] border animate-in slide-in-from-top-4 duration-500 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-4 text-center">Escolha a cor do seu fundo</p>
            <div className="grid grid-cols-6 gap-3">
              {AVATAR_COLORS.map(color => (
                <button 
                  key={color}
                  onClick={() => setEditedProfile({ ...editedProfile, avatarColor: color })}
                  className={`size-8 rounded-lg border-2 transition-all active:scale-90 ${editedProfile.avatarColor === color ? 'border-white ring-2 ring-blue-600 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </section>
        )}

        <section className="grid grid-cols-2 gap-4">
          <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'} p-4 rounded-3xl border flex items-center gap-4 transition-colors`}>
            <span className="material-symbols-outlined text-orange-500 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>login</span>
            <div>
              <span className={`text-lg font-black block leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>{safeProfile.loginCount || 1}</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Acessou</span>
            </div>
          </div>
          <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'} p-4 rounded-3xl border flex items-center gap-4 transition-colors relative overflow-hidden`}>
            <span className="material-symbols-outlined text-indigo-500 text-2xl">task_alt</span>
            <div className="z-10">
              <span className={`text-lg font-black block leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>{readPercentage}%</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Concluído</span>
            </div>
            <div className="absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all duration-1000" style={{ width: `${readPercentage}%` }}></div>
          </div>
        </section>

        <section className={`rounded-[32px] border transition-all overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
          <button onClick={() => setShowDetails(!showDetails)} className="w-full px-6 py-4 flex items-center justify-between">
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
                      <input value={editedProfile.education || ''} onChange={e => setEditedProfile({...editedProfile, education: e.target.value})} className={`w-full font-bold text-sm bg-transparent border-b border-blue-600 pb-1 focus:outline-none ${isDark ? 'text-white' : 'text-slate-900'}`} />
                    ) : (
                      <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{safeProfile.education || 'Não informada'}</p>
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
                      <input value={editedProfile.whatsapp || ''} onChange={e => setEditedProfile({...editedProfile, whatsapp: e.target.value})} className={`w-full font-bold text-sm bg-transparent border-b border-blue-600 pb-1 focus:outline-none ${isDark ? 'text-white' : 'text-slate-900'}`} />
                    ) : (
                      <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{safeProfile.whatsapp || 'Não informado'}</p>
                    )}
                 </div>
              </div>
              {isEditing && (
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setIsEditing(false)} className={`flex-1 h-12 rounded-xl font-black uppercase text-[10px] border ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-400'}`}>Cancelar</button>
                  <button onClick={handleSave} className="flex-1 h-12 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] shadow-lg shadow-blue-600/20">Salvar</button>
                </div>
              )}
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className={`w-full h-12 rounded-xl font-black uppercase text-[10px] border flex items-center justify-center gap-2 transition-all active:scale-95 ${isDark ? 'bg-slate-700/50 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  Editar Informações
                </button>
              )}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className={`text-xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Salvos</h3>
          </div>
          <div className="grid gap-3">
            {displayedSavedPosts.length === 0 ? (
              <div className={`p-10 rounded-[32px] border border-dashed flex flex-col items-center gap-3 text-center ${isDark ? 'bg-slate-800/20 border-slate-700 text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                <span className="material-symbols-outlined text-4xl">bookmark_border</span>
                <p className="text-xs font-bold uppercase tracking-widest">Nada salvo ainda</p>
              </div>
            ) : (
              displayedSavedPosts.map(post => (
                <div key={post.id} onClick={() => {
                  const path = post.categoryType === 'APROFUNDAR' ? 'aprofundar' : 'expresso';
                  navigate(`/${path}/${post.id}`);
                }} className={`p-3.5 rounded-[24px] border transition-all active:scale-[0.98] flex items-center gap-4 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-100 shadow-sm text-slate-900'}`}>
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

        <div className="pt-8 pb-4 text-center">
          <button onClick={handleLogout} className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center justify-center gap-2 mx-auto">
            <span className="material-symbols-outlined text-[16px]">logout</span>
            Sair da Conta
          </button>
        </div>
      </main>
    </div>
  );
};

export default Profile;