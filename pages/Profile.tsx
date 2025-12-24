
import React, { useState, useRef, useMemo } from 'react';
import { UserProfile, Expresso } from '../types';
import { useNavigate } from 'react-router-dom';
// Removed DEEP_DIVE_DATA as it is no longer exported from Aprofundar.tsx

interface ProfileProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  readCount: number;
  userPosts: Expresso[];
}

const Profile: React.FC<ProfileProps> = ({ profile, onUpdate, readCount, userPosts }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showAllSaved, setShowAllSaved] = useState(false);
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
    // Relying on userPosts prop which is passed as the combination of sheet and user-created posts
    const allAprofs = userPosts;
    return allAprofs.filter(post => profile.savedPostIds.includes(post.id));
  }, [profile.savedPostIds, userPosts]);

  const displayedSavedPosts = showAllSaved ? savedPosts : savedPosts.slice(0, 2);

  return (
    <div className={`min-h-screen pb-32 transition-colors duration-300 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <header className={`p-6 flex justify-between items-center sticky top-0 z-40 backdrop-blur-md ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-100'} border-b`}>
        <div className="w-10"></div>
        <h1 className={`text-lg font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {isEditing ? 'Editar Perfil' : 'Meu Perfil'}
        </h1>
        <button 
          onClick={toggleDarkMode}
          className={`size-10 flex items-center justify-center rounded-full transition-all ${isDark ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-100 text-slate-600'}`}
        >
          <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
        </button>
      </header>

      <main className="px-6 pt-8 space-y-8 animate-in fade-in duration-500">
        {/* Avatar e Informações */}
        <section className="flex flex-col items-center text-center">
          <div className="relative mb-6 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className={`size-32 rounded-full p-1 bg-gradient-to-tr ${isDark ? 'from-blue-600 to-cyan-400' : 'from-blue-400 to-indigo-500'} shadow-2xl transition-transform active:scale-95`}>
              <img 
                src={isEditing ? editedProfile.avatarUrl : profile.avatarUrl} 
                alt={profile.name} 
                className="size-full rounded-full object-cover border-4 border-white shadow-inner" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://i.pravatar.cc/150?u=fallback";
                }}
              />
            </div>
            <div className="absolute bottom-1 right-1 size-9 bg-blue-600 text-white rounded-full flex items-center justify-center border-4 border-white shadow-lg">
              <span className="material-symbols-outlined text-[18px]">camera_alt</span>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
          </div>

          {isEditing ? (
            <div className="w-full space-y-4 max-w-xs mx-auto">
              <input 
                value={editedProfile.name}
                onChange={e => setEditedProfile({...editedProfile, name: e.target.value})}
                placeholder="Nome Completo"
                className={`w-full h-14 px-5 rounded-2xl font-bold border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
              />
            </div>
          ) : (
            <>
              <h2 className={`text-2xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{profile.name}</h2>
              <div className="flex items-center gap-2 mt-3 bg-blue-600/10 px-3 py-1 rounded-full border border-blue-600/20">
                 <span className="material-symbols-outlined text-blue-600 text-[16px]">verified</span>
                 <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Membro Ativo</span>
              </div>
            </>
          )}
        </section>

        {/* Estatísticas (Grade 2x2 com ícone de curtidas) */}
        <section className="grid grid-cols-2 gap-3">
          <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} p-4 rounded-3xl shadow-sm border flex items-center gap-4 transition-colors`}>
            <span className="material-symbols-outlined text-orange-500 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
            <div>
              <span className={`text-lg font-black block leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>{profile.stats.daysInRow}</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Dias</span>
            </div>
          </div>
          <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} p-4 rounded-3xl shadow-sm border flex items-center gap-4 transition-colors`}>
            <span className="material-symbols-outlined text-indigo-500 text-2xl">menu_book</span>
            <div>
              <span className={`text-lg font-black block leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>{readCount}</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Lidos</span>
            </div>
          </div>
          <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} p-4 rounded-3xl shadow-sm border flex items-center gap-4 transition-colors`}>
            <span className="material-symbols-outlined text-emerald-500 text-2xl">bookmark</span>
            <div>
              <span className={`text-lg font-black block leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>{profile.stats.savedPosts}</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Salvos</span>
            </div>
          </div>
          <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} p-4 rounded-3xl shadow-sm border flex items-center gap-4 transition-colors`}>
            <span className="material-symbols-outlined text-rose-500 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            <div>
              <span className={`text-lg font-black block leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>{profile.likedPostIds?.length || 0}</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Curtidas</span>
            </div>
          </div>
        </section>

        {/* Biblioteca Offline (Limite de 2 itens) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className={`text-xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Biblioteca</h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md">{savedPosts.length} itens</span>
          </div>
          
          <div className="grid gap-4">
            {displayedSavedPosts.map(post => (
              <div 
                key={post.id}
                onClick={() => navigate(`/aprofundar/${post.id}`)}
                className={`group p-4 rounded-[28px] border transition-all active:scale-[0.98] flex items-center gap-4 animate-in slide-in-from-bottom-2 duration-300 ${isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-100 hover:shadow-md'}`}
              >
                <div className="size-16 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm">
                  <img src={post.imageUrl} className="size-full object-cover" alt="" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{post.category}</span>
                  <h4 className={`text-sm font-black truncate leading-tight mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>{post.title}</h4>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    <span className="text-[10px] font-bold uppercase">{post.readingTime}</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-300 group-hover:text-blue-600 transition-colors">arrow_forward</span>
              </div>
            ))}
            
            {savedPosts.length > 2 && !showAllSaved && (
              <button 
                onClick={() => setShowAllSaved(true)}
                className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-dashed transition-all active:bg-blue-600/5 ${isDark ? 'bg-slate-800/30 border-slate-700 text-slate-400' : 'bg-slate-100/50 border-slate-200 text-slate-500'}`}
              >
                Ver mais {savedPosts.length - 2} itens salvos
              </button>
            )}

            {showAllSaved && (
              <button 
                onClick={() => setShowAllSaved(false)}
                className="text-center text-[10px] font-black text-blue-600 uppercase tracking-widest w-full py-2"
              >
                Recolher lista
              </button>
            )}

            {savedPosts.length === 0 && (
              <div className={`p-12 rounded-[32px] border-2 border-dashed flex flex-col items-center justify-center gap-3 opacity-40 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <span className="material-symbols-outlined text-4xl">bookmark_border</span>
                <p className="text-xs font-bold uppercase tracking-widest text-center">Nenhum post salvo.</p>
              </div>
            )}
          </div>
        </section>

        {/* Detalhes Institucionais */}
        <section className={`p-6 rounded-[32px] border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} space-y-6 transition-colors shadow-sm`}>
          <div className="flex items-center gap-3">
             <div className={`size-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                <span className="material-symbols-outlined">church</span>
             </div>
             <div className="flex-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Igreja</p>
                {isEditing ? (
                  <input 
                    value={editedProfile.church}
                    onChange={e => setEditedProfile({...editedProfile, church: e.target.value})}
                    placeholder="Nome da Igreja"
                    className={`w-full mt-1 font-bold text-sm focus:outline-none bg-transparent border-b border-blue-500/20 pb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}
                  />
                ) : (
                  <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{profile.church || 'Não informado'}</p>
                )}
             </div>
          </div>

          <div className="flex items-center gap-3">
             <div className={`size-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-amber-900/50 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
                <span className="material-symbols-outlined">school</span>
             </div>
             <div className="flex-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Formação</p>
                {isEditing ? (
                  <input 
                    value={editedProfile.education}
                    onChange={e => setEditedProfile({...editedProfile, education: e.target.value})}
                    placeholder="Ex: Teologia"
                    className={`w-full font-bold text-sm focus:outline-none bg-transparent border-b border-blue-500/20 pb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}
                  />
                ) : (
                  <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{profile.education || 'Não informado'}</p>
                )}
             </div>
          </div>
        </section>

        {/* Botão de Edição */}
        <div className="space-y-4">
          {isEditing ? (
            <div className="flex gap-4">
              <button onClick={() => setIsEditing(false)} className={`flex-1 h-16 rounded-[24px] font-black uppercase text-xs border ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-100 text-slate-400'}`}>Cancelar</button>
              <button onClick={handleSave} className="flex-[2] h-16 bg-blue-600 text-white rounded-[24px] font-black uppercase text-xs">Salvar Alterações</button>
            </div>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className={`w-full h-16 rounded-[24px] font-black uppercase text-xs border shadow-sm flex items-center justify-center gap-2 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-900'}`}
            >
              <span className="material-symbols-outlined text-[20px]">edit</span>
              Editar Meu Perfil
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
