import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContent, Expresso, Comment } from '../types';
import Header from '../components/Header';

interface ExpressoProps {
  content: AppContent;
  comments: Comment[];
  onAddComment: (comment: Comment) => void;
  onLikeComment: (id: string) => void;
  readPostIds: string[];
}

const getCategoryColor = (category: string) => {
  const cat = category?.toUpperCase() || '';
  if (cat.includes('CIÊNCIA')) return 'bg-blue-600';
  if (cat.includes('HISTÓRIA')) return 'bg-purple-600';
  if (cat.includes('IDENTIDADE')) return 'bg-amber-500';
  if (cat.includes('CULTURA')) return 'bg-indigo-600';
  return 'bg-slate-600';
};

const Card: React.FC<{ 
  item: Expresso; 
  isGrid?: boolean;
  isRead?: boolean;
}> = ({ item, isGrid, isRead }) => {
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => navigate(`/expresso/${item.id}`)}
      className={`${isGrid ? 'w-full aspect-[4/5]' : 'w-full h-48'} relative rounded-[24px] overflow-hidden shadow-sm cursor-pointer group active:scale-[0.98] transition-all duration-500`}
    >
      <img src={item.imageUrl} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent"></div>
      
      {isRead && (
        <div className="absolute top-3 right-3 z-20 bg-emerald-500 text-white flex items-center gap-1 px-2 py-1 rounded-full shadow-lg border border-white/20">
          <span className="material-symbols-outlined text-[12px]">check</span>
          <span className="text-[8px] font-black uppercase tracking-tighter">Lido</span>
        </div>
      )}

      <div className="absolute bottom-4 left-4 right-4 z-10">
        <span className={`${getCategoryColor(item.category)} text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest mb-1.5 inline-block`}>
          {item.category}
        </span>
        <h4 className="text-[14px] font-[800] text-white leading-tight tracking-tight font-display line-clamp-2">
          {item.title}
        </h4>
      </div>
    </div>
  );
};

const ExpressoPage: React.FC<ExpressoProps> = ({ content, comments, onAddComment, onLikeComment, readPostIds }) => {
  const [filter, setFilter] = useState<'high' | 'classic' | null>(null);
  const navigate = useNavigate();
  const isDark = content.profile.isDarkMode;

  const sortedInHigh = useMemo(() => {
    return content.expressos.filter(e => !e.isClassic).sort((a, b) => b.id.localeCompare(a.id));
  }, [content.expressos]);

  const sortedClassics = useMemo(() => {
    return content.expressos.filter(e => e.isClassic).sort((a, b) => b.id.localeCompare(a.id));
  }, [content.expressos]);

  const activeItems = filter === 'high' ? sortedInHigh : sortedClassics;

  return (
    <div className={`pb-32 min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Header content={content} />
      
      <main className="px-6 space-y-8 mt-4">
        {filter ? (
          <section className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 pt-2">
              <button onClick={() => setFilter(null)} className={`size-10 rounded-full flex items-center justify-center border active:scale-90 transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-100'}`}>
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <div>
                <h1 className="text-2xl font-black font-display tracking-tight flex items-center gap-2">
                  {filter === 'high' ? 'Em Alta' : 'Clássicos'}
                  <span className="material-symbols-outlined text-blue-600">coffee</span>
                </h1>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{activeItems.length} RESPOSTAS EM GRADE</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {activeItems.map(item => (
                <Card key={item.id} item={item} isGrid isRead={readPostIds.includes(item.id)} />
              ))}
            </div>
          </section>
        ) : (
          <>
            <section className="animate-in fade-in duration-700">
              <h1 className="text-[36px] font-black font-display tracking-tight leading-none mb-2 flex items-center gap-3">
                Expresso 
                <span className="material-symbols-outlined text-blue-600 text-3xl">coffee</span>
              </h1>
              <p className="text-slate-400 text-[15px] font-medium">Respostas rápidas para sua fé.</p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black font-display">Em Alta</h3>
                {sortedInHigh.length > 4 && (
                   <button 
                    onClick={() => {
                      setFilter('high');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                    className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-full"
                  >
                    Ver todos
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {sortedInHigh.slice(0, 4).map(item => (
                  <Card key={item.id} item={item} isGrid isRead={readPostIds.includes(item.id)} />
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black font-display">Perguntas Clássicas</h3>
                {sortedClassics.length > 4 && (
                   <button 
                    onClick={() => {
                      setFilter('classic');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                    className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-full"
                  >
                    Ver todos
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {sortedClassics.slice(0, 4).map(item => (
                  <Card key={item.id} item={item} isGrid isRead={readPostIds.includes(item.id)} />
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default ExpressoPage;