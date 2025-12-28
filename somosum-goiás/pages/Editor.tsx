
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Expresso } from '../types';

interface EditorProps {
  userPosts: Expresso[];
  onUpdateStatus: (id: string, status: 'draft' | 'pending' | 'published') => void;
  onDelete: (id: string) => void;
  isDarkMode?: boolean;
}

const Editor: React.FC<EditorProps> = ({ userPosts, onUpdateStatus, onDelete, isDarkMode }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);
  const isDark = isDarkMode;

  const sortedPosts = useMemo(() => {
    return [...userPosts].sort((a, b) => Number(b.id) - Number(a.id));
  }, [userPosts]);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'draft':
        return <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isDark ? 'bg-amber-900/40 text-amber-500' : 'bg-amber-100 text-amber-600'}`}>Rascunho</span>;
      case 'pending':
        return <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isDark ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>Pendente</span>;
      case 'published':
        return <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isDark ? 'bg-emerald-900/40 text-emerald-400' : 'bg-green-100 text-green-600'}`}>Publicado</span>;
      default:
        return null;
    }
  };

  const handleEdit = (post: Expresso) => {
    if (post.category === 'APROFUNDAMENTO') {
      navigate(`/editor/aprofundamento/${post.id}`);
    } else {
      navigate(`/editor/expresso/${post.id}`);
    }
  };

  return (
    <div className={`min-h-screen pb-32 animate-in fade-in duration-500 transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <header className={`sticky top-0 z-50 flex items-center justify-between px-6 py-5 border-b backdrop-blur-md transition-colors ${isDark ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white/90 border-slate-100 text-slate-900'}`}>
        <div className="w-6"></div>
        <h1 className="text-xl font-black font-display">Criar Conteúdo</h1>
        <button onClick={() => navigate('/home')} className="text-slate-400">
          <span className="material-symbols-outlined">close</span>
        </button>
      </header>

      <main className="p-6 space-y-8">
        <div className="space-y-4">
          <div className="text-center mb-2">
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Novo Conteúdo</p>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/editor/expresso')}
              className={`flex-1 p-6 rounded-[32px] border shadow-sm flex flex-col items-center gap-3 active:scale-95 transition-all ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
            >
              <div className="size-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              </div>
              <h2 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Expresso</h2>
            </button>

            <button 
              onClick={() => navigate('/editor/aprofundamento')}
              className="flex-1 bg-slate-900 p-6 rounded-[32px] shadow-lg flex flex-col items-center gap-3 active:scale-95 transition-all text-white border border-slate-800"
            >
              <div className="size-14 bg-white/10 text-white rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">menu_book</span>
              </div>
              <h2 className="text-xs font-black uppercase tracking-widest">Aprofundar</h2>
            </button>
          </div>
        </div>

        <section className={`rounded-[40px] border shadow-xl overflow-hidden transition-all duration-300 ${isExpanded ? 'pb-6' : 'pb-0'} ${isDark ? 'bg-slate-900 border-slate-800 shadow-slate-950/50' : 'bg-white border-slate-100 shadow-slate-200/50'}`}>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className={`w-full p-6 flex items-center justify-between transition-colors ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}
          >
            <div className="flex items-center gap-3">
              <div className="size-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[20px]">inventory_2</span>
              </div>
              <div className="text-left">
                <h3 className={`text-lg font-black font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>Minhas Postagens</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rascunhos e envios</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>{userPosts.length}</span>
              <span className={`material-symbols-outlined text-slate-300 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
            </div>
          </button>

          {isExpanded && (
            <div className="px-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
              {sortedPosts.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center gap-3 opacity-40">
                  <span className="material-symbols-outlined text-4xl text-slate-200">post_add</span>
                  <p className="text-sm font-medium text-slate-400">Nenhum post criado ainda.</p>
                </div>
              ) : (
                sortedPosts.map(post => (
                  <div key={post.id} className={`p-4 rounded-[28px] border flex flex-col gap-4 ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/50 border-slate-100'}`}>
                    <div className="flex gap-4">
                      <div className="relative">
                        <img src={post.imageUrl} className="size-16 rounded-2xl object-cover flex-shrink-0 shadow-sm" alt="" />
                        <div className={`absolute -top-1 -left-1 size-5 rounded-full flex items-center justify-center shadow-sm ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                          <span className="material-symbols-outlined text-[12px] text-blue-600">
                            {post.category === 'APROFUNDAMENTO' ? 'menu_book' : 'bolt'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{post.category}</span>
                          {getStatusBadge(post.status)}
                        </div>
                        <h4 className={`text-sm font-black line-clamp-1 leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>{post.title}</h4>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Post ID: {post.id}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {post.status !== 'published' && (
                        <>
                          <button 
                            onClick={() => onUpdateStatus(post.id, 'published')}
                            className="flex-[2] h-10 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md shadow-blue-600/10"
                          >
                            Aprovar
                          </button>
                          <button 
                            onClick={() => handleEdit(post)}
                            className={`flex-1 h-10 border rounded-xl text-[9px] font-black uppercase tracking-widest ${isDark ? 'bg-slate-800 border-slate-700 text-blue-400' : 'bg-white border-slate-200 text-blue-600'}`}
                          >
                            Editar
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => onDelete(post.id)}
                        className={`size-10 rounded-xl flex items-center justify-center active:scale-95 transition-all ${isDark ? 'bg-red-500/10 text-red-500' : 'bg-red-50 text-red-500'}`}
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Editor;
