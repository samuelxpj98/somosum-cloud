
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { commentsService } from '../lib/firebase';
import Header from '../components/Header';

const CommunityCommentCard: React.FC<{ comment: any; isDark: boolean }> = ({ comment, isDark }) => {
  const navigate = useNavigate();
  
  const handleNavigateToPost = () => {
    // Tenta encontrar se é expresso ou aprofundar baseado no ID do post (simplificado aqui)
    navigate(`/expresso/${comment.postId}`);
  };

  return (
    <div onClick={handleNavigateToPost} className={`p-5 rounded-[24px] border soft-shadow mb-4 active:scale-[0.98] transition-all cursor-pointer ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
      <div className="flex gap-3 items-start">
        <div className="size-10 rounded-full bg-[#1E293B] flex items-center justify-center text-white font-bold text-[10px] shrink-0 overflow-hidden">
          {comment.userAvatar ? <img src={comment.userAvatar} className="size-full object-cover" /> : comment.usuario?.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h5 className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-[#1E293B]'}`}>{comment.usuario}</h5>
            <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{comment.likes || 0} LIKES</span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-2">Em: {comment.postId.replace('sheet-', 'Post #')}</p>
          <p className={`text-sm leading-relaxed line-clamp-3 ${isDark ? 'text-slate-300' : 'text-[#334155]'}`}>{comment.texto}</p>
        </div>
      </div>
    </div>
  );
};

const Comunidade: React.FC<{ content: any }> = ({ content }) => {
  const [allComments, setAllComments] = useState<any[]>([]);
  const isDark = content.profile.isDarkMode;

  useEffect(() => {
    const unsubscribe = commentsService.getAllConversations(setAllComments);
    return () => unsubscribe();
  }, []);

  // Lógica: 2 mais curtidos + 2 mais comentados (aqui usamos replies se disponível, ou likes como proxy)
  const trendingComments = useMemo(() => {
    // Filtra apenas comentários raiz (sem parentId) para o feed principal
    const roots = allComments.filter(c => !c.parentId);
    
    // 2 Mais curtidos
    const mostLiked = [...roots].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 2);
    
    // 2 Mais respondidos (contagem de filhos)
    const rootsWithReplyCount = roots.map(root => ({
      ...root,
      replyCount: allComments.filter(c => c.parentId === root.id).length
    }));
    
    const mostReplied = rootsWithReplyCount
      .filter(root => !mostLiked.find(ml => ml.id === root.id)) // evita duplicados
      .sort((a, b) => b.replyCount - a.replyCount)
      .slice(0, 2);

    return [...mostLiked, ...mostReplied];
  }, [allComments]);

  const recentComments = useMemo(() => {
    const trendingIds = trendingComments.map(t => t.id);
    return allComments
      .filter(c => !c.parentId && !trendingIds.includes(c.id))
      .sort((a, b) => b.hora - a.hora)
      .slice(0, 4);
  }, [allComments, trendingComments]);

  return (
    <div className={`pb-32 min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Header content={content} />
      
      <main className="px-6 mt-8 space-y-10 animate-in fade-in duration-700">
        <section>
          <header className="mb-6">
            <h1 className="text-[32px] font-bold tracking-tighter leading-none mb-2">Comunidade</h1>
            <p className="text-slate-400 text-sm font-medium">As vozes que constroem nossa jornada.</p>
          </header>

          <div className="space-y-8">
            {/* Em Alta */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <span className="material-symbols-outlined text-orange-500 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                <h3 className="text-xs font-bold uppercase tracking-[1.5px] text-[#1E293B] dark:text-blue-400">Em Alta na Semana</h3>
              </div>
              {trendingComments.length > 0 ? (
                trendingComments.map(c => <CommunityCommentCard key={c.id} comment={c} isDark={isDark} />)
              ) : (
                <p className="text-center py-10 text-slate-400 text-xs font-bold uppercase tracking-widest">Silêncio reflexivo...</p>
              )}
            </div>

            {/* Recentes */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <span className="material-symbols-outlined text-blue-500 text-[20px]">schedule</span>
                <h3 className="text-xs font-bold uppercase tracking-[1.5px] text-[#1E293B] dark:text-blue-400">Novos Diálogos</h3>
              </div>
              {recentComments.length > 0 ? (
                recentComments.map(c => <CommunityCommentCard key={c.id} comment={c} isDark={isDark} />)
              ) : (
                <p className="text-center py-10 text-slate-400 text-xs font-bold uppercase tracking-widest">Aguardando novas ideias.</p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Comunidade;
