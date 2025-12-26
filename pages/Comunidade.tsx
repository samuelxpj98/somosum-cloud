
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { commentsService } from '../lib/firebase';
import Header from '../components/Header';

const CommunityCommentCard: React.FC<{ 
  comment: any; 
  isDark: boolean; 
  rank?: number;
  repliesCount: number;
}> = ({ comment, isDark, rank, repliesCount }) => {
  const navigate = useNavigate();
  
  const handleNavigateToPost = () => {
    const path = comment.postTitle && comment.postTitle.length > 30 ? 'aprofundar' : 'expresso';
    navigate(`/${path}/${comment.postId}`);
  };

  const getRankBadge = (pos: number) => {
    const colors = [
      'bg-amber-400 text-amber-950', // 1º Ouro
      'bg-slate-300 text-slate-900',  // 2º Prata
      'bg-orange-400 text-orange-950' // 3º Bronze
    ];
    return (
      <div className={`size-6 rounded-lg flex items-center justify-center font-black text-[10px] shadow-lg ${colors[pos-1]}`}>
        {pos}º
      </div>
    );
  };

  return (
    <div 
      onClick={handleNavigateToPost} 
      className={`p-6 rounded-[32px] border soft-shadow mb-4 active:scale-[0.98] transition-all cursor-pointer relative group ${
        rank 
          ? (isDark ? 'bg-slate-800/50 border-blue-500/30' : 'bg-white border-blue-100 shadow-blue-600/5') 
          : (isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-50')
      }`}
    >
      {rank && (
        <div className="absolute -top-3 -left-2 z-10 animate-in zoom-in-50 duration-500">
          {getRankBadge(rank)}
        </div>
      )}

      <div className="flex gap-4 items-start">
        <div className="size-11 rounded-2xl bg-[#1E293B] flex items-center justify-center text-white font-bold text-[11px] shrink-0 overflow-hidden shadow-inner">
          {comment.userAvatar ? <img src={comment.userAvatar} className="size-full object-cover" /> : comment.usuario?.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h5 className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-[#1E293B]'}`}>{comment.usuario}</h5>
              <span className="text-[10px] text-slate-300 font-bold">•</span>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest truncate">{comment.church || "SomosUm"}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
               <div className="flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded-md">
                 <span className="material-symbols-outlined text-[12px] text-blue-500" style={{ fontVariationSettings: "'FILL' 1" }}>thumb_up</span>
                 <span className="text-[10px] font-black text-blue-500">{comment.likes || 0}</span>
               </div>
               {repliesCount > 0 && (
                 <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                   <span className="material-symbols-outlined text-[12px] text-emerald-500">forum</span>
                   <span className="text-[10px] font-black text-emerald-500">{repliesCount}</span>
                 </div>
               )}
            </div>
          </div>
          
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3 text-[9px] font-black uppercase tracking-widest border transition-colors ${
            isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'
          }`}>
            <span className="material-symbols-outlined text-[14px]">link</span>
            <span className="truncate max-w-[140px]">{comment.postTitle || "Reflexão"}</span>
          </div>

          <p className={`text-sm leading-relaxed line-clamp-2 italic ${isDark ? 'text-slate-300' : 'text-[#334155]'}`}>
            "{comment.texto}"
          </p>
        </div>
      </div>
    </div>
  );
};

const Comunidade: React.FC<{ content: any }> = ({ content }) => {
  const [allComments, setAllComments] = useState<any[]>([]);
  const [showAllRecent, setShowAllRecent] = useState(false);
  const isDark = content.profile.isDarkMode;

  useEffect(() => {
    const unsubscribe = commentsService.getAllConversations(setAllComments);
    return () => unsubscribe();
  }, []);

  const { trendingComments, recentComments } = useMemo(() => {
    const rootComments = allComments.filter(c => !c.parentId);
    const now = Date.now();
    
    // Calcula Score de Relevância (R): ((Replies * 5) + (Upvotes * 2)) / T^1.5
    const scored = rootComments.map(c => {
      const repliesCount = allComments.filter(reply => reply.parentId === c.id).length;
      const T = Math.max(1, (now - (c.hora || now - 3600000)) / 3600000);
      const relevance = ((repliesCount * 5) + ((c.likes || 0) * 2)) / Math.pow(T, 1.5);
      
      return { 
        ...c, 
        repliesCount,
        relevance
      };
    });

    const sorted = [...scored].sort((a, b) => b.relevance - a.relevance);
    
    const trending = sorted.slice(0, 3);
    const trendingIds = trending.map(t => t.id);
    
    const recent = scored
      .filter(c => !trendingIds.includes(c.id))
      .sort((a, b) => b.hora - a.hora);

    return { 
      trendingComments: trending, 
      recentComments: showAllRecent ? recent : recent.slice(0, 4) 
    };
  }, [allComments, showAllRecent]);

  const hasMoreRecent = useMemo(() => {
    const trendingIds = trendingComments.map(t => t.id);
    return allComments.filter(c => !c.parentId && !trendingIds.includes(c.id)).length > 4;
  }, [allComments, trendingComments]);

  return (
    <div className={`pb-32 min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Header content={content} />
      
      <main className="px-6 mt-10 space-y-12 animate-in fade-in duration-700">
        <section>
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-[38px] font-[900] tracking-tighter leading-none font-display uppercase">Comunidade</h1>
              <span className="material-symbols-outlined text-blue-600 text-4xl">forum</span>
            </div>
            <p className="text-slate-400 text-base font-medium leading-tight max-w-[300px]">
              Onde o café esfria e as ideias fervem. Explore o pensamento da nossa galera.
            </p>
          </header>

          <div className="space-y-10">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="size-8 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[2px] text-[#1E293B] dark:text-blue-400 leading-none">Puro Grão</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Os diálogos mais relevantes no momento</p>
                </div>
              </div>
              
              {trendingComments.length > 0 ? (
                trendingComments.map((c, index) => (
                  <CommunityCommentCard 
                    key={c.id} 
                    comment={c} 
                    isDark={isDark} 
                    rank={index + 1}
                    repliesCount={c.repliesCount}
                  />
                ))
              ) : (
                <div className="py-12 text-center opacity-30">
                  <span className="material-symbols-outlined text-5xl mb-2">hourglass_empty</span>
                  <p className="text-xs font-black uppercase tracking-widest">Aguardando engajamento...</p>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="size-8 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                    <span className="material-symbols-outlined text-[18px]">schedule</span>
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[2px] text-[#1E293B] dark:text-blue-400 leading-none">Novas Colheitas</h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Recém saídos da prensa</p>
                  </div>
                </div>
              </div>

              {recentComments.length > 0 ? (
                <>
                  <div className="space-y-2">
                    {recentComments.map(c => (
                      <CommunityCommentCard 
                        key={c.id} 
                        comment={c} 
                        isDark={isDark} 
                        repliesCount={c.repliesCount}
                      />
                    ))}
                  </div>
                  
                  {hasMoreRecent && (
                    <button 
                      onClick={() => setShowAllRecent(!showAllRecent)}
                      className={`w-full py-5 rounded-[24px] border-2 font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 mt-6 ${
                        isDark ? 'bg-slate-900 border-slate-800 text-blue-400' : 'bg-white border-slate-100 text-blue-600 shadow-sm'
                      }`}
                    >
                      {showAllRecent ? (
                        <>
                          <span className="material-symbols-outlined text-sm">expand_less</span>
                          Recolher Conversas
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-sm">expand_more</span>
                          Ver Mais Diálogos
                        </>
                      )}
                    </button>
                  )}
                </>
              ) : (
                trendingComments.length === 0 && (
                  <p className="text-center py-10 text-slate-400 text-xs font-bold uppercase tracking-widest">Silêncio na cafeteria...</p>
                )
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Comunidade;
