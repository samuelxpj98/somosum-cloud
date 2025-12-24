
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContent } from '../types';
import { commentsService } from '../lib/firebase';

const CommentItem: React.FC<{
  comment: any;
  allComments: any[];
  postId: string;
  isDark?: boolean;
  depth?: number;
  profile: any;
}> = ({ comment, allComments, postId, isDark, depth = 0, profile }) => {
  const replies = allComments.filter(c => c.parentId === comment.id);
  const handleLike = () => commentsService.likeComment(postId, comment.id);

  return (
    <div className={`transition-all animate-in fade-in slide-in-from-left-4 duration-300 ${depth > 0 ? 'ml-6 mt-3 border-l-2 border-blue-100 pl-4' : 'mt-4'}`}>
      <div className={`p-5 rounded-[24px] border soft-shadow transition-all ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
        <div className="flex gap-3">
          <div className="size-10 rounded-full bg-[#1E293B] flex items-center justify-center text-white font-bold text-[10px] shrink-0 overflow-hidden">
            {comment.userAvatar ? <img src={comment.userAvatar} className="size-full object-cover" /> : comment.usuario?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h5 className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-[#1E293B]'}`}>{comment.usuario}</h5>
            <p className="text-[10px] text-[#3B82F6] font-bold uppercase tracking-widest mb-2">{comment.church || "SomosUm"}</p>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-[#334155]'}`}>{comment.texto}</p>
            <div className="flex items-center gap-4 mt-3">
              <button onClick={handleLike} className="flex items-center gap-1 text-slate-400 active:scale-90 transition-transform">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: comment.likes > 0 ? "'FILL' 1" : "" }}>thumb_up</span>
                <span className="text-[10px] font-bold">{comment.likes || 0}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {replies.map(reply => (
        <CommentItem key={reply.id} comment={reply} allComments={allComments} postId={postId} isDark={isDark} depth={depth + 1} profile={profile} />
      ))}
    </div>
  );
};

const AprofundarDetail: React.FC<any> = ({ content, markAsRead, onToggleSave, onToggleLike }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isDark = content.profile.isDarkMode;
  const isLiked = id ? content.profile.likedPostIds.includes(id) : false;
  const isSaved = id ? content.profile.savedPostIds.includes(id) : false;
  
  const [realtimeComments, setRealtimeComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);

  const displayItem = useMemo(() => {
    return content.expressos.find((e: any) => e.id === id) || (content as any).sheetPosts?.find((e: any) => e.id === id);
  }, [id, content]);

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = commentsService.subscribeToComments(id, setRealtimeComments);
    return () => unsubscribe();
  }, [id]);

  const handleSendComment = async () => {
    if (!commentText.trim() || !id) return;
    await commentsService.addComment(id, {
      usuario: content.profile.name || "Explorador",
      texto: commentText,
      userAvatar: content.profile.avatarUrl,
      church: content.profile.church
    });
    setCommentText('');
    setShowCommentBox(false);
  };

  const rootComments = useMemo(() => realtimeComments.filter(c => !c.parentId).sort((a,b) => b.hora - a.hora), [realtimeComments]);

  if (!displayItem) return <div className="p-10 text-center font-bold">Artigo não encontrado.</div>;

  return (
    <div className={`min-h-screen pb-12 transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-[#F1F5F9]'}`}>
      
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] overflow-hidden">
        <img src={displayItem.imageUrl} className="absolute inset-0 w-full h-full object-cover animate-in fade-in zoom-in-110 duration-1000" alt={displayItem.title} />
        <header className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-10">
          <button onClick={() => navigate(-1)} className="size-11 rounded-full bg-black/30 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white active:scale-90 transition-all">
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <div className="bg-black/30 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-full text-[12px] font-bold text-white uppercase tracking-[1.2px] flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">menu_book</span> {displayItem.readingTime}
          </div>
          <button className="size-11 rounded-full bg-black/30 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white active:scale-90 transition-all">
            <span className="material-symbols-outlined text-[24px]">share</span>
          </button>
        </header>
      </section>

      {/* Main Content */}
      <main className={`relative z-20 -mt-24 px-8 pt-16 pb-20 rounded-t-[56px] shadow-2xl transition-colors duration-300 ${isDark ? 'bg-slate-950 text-white' : 'bg-white text-[#334155]'}`}>
        
        <div className="text-center mb-16 animate-in slide-in-from-bottom-8 duration-700">
           <span className="text-[#3B82F6] font-bold text-[12px] uppercase tracking-[1.2px] mb-5 inline-block">
             {displayItem.categoryFull || displayItem.category}
           </span>
           <h1 className="text-[38px] font-bold leading-[1.05] tracking-tighter mb-6 text-[#1E293B] dark:text-white">
             {displayItem.title}
           </h1>
           {displayItem.subtitle && (
             <p className="text-[18px] font-bold leading-relaxed text-[#3B82F6] max-w-[340px] mx-auto italic opacity-80">
               "{displayItem.subtitle}"
             </p>
           )}
        </div>

        <div className={`whitespace-pre-line mb-16 text-[19px] leading-[1.65] font-medium animate-in fade-in duration-1000 ${isDark ? 'text-slate-400' : 'text-[#334155]'}`}>
          {displayItem.content.replace(/\\n/g, '\n').trim()}
        </div>

        {/* Pilar de Fé */}
        {displayItem.bibleReference && (
          <div className="mb-20 py-10 px-4 text-center border-y border-slate-50 dark:border-slate-800/30 animate-in fade-in duration-1000">
            <div className="flex flex-col items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-[#3B82F6] text-[40px]">menu_book</span>
              <h4 className="text-[#3B82F6] font-bold text-[12px] uppercase tracking-[1.5px]">Pilar da Fé</h4>
            </div>
            <p className={`font-serif text-[20px] leading-[1.6] italic max-w-[90%] mx-auto ${isDark ? 'text-blue-100' : 'text-[#1E293B]'}`}>
              "{displayItem.bibleReference}"
            </p>
          </div>
        )}

        {/* Social Actions */}
        <div className="flex gap-4 mb-16">
          <button onClick={() => id && onToggleLike(id)} className={`flex-1 py-5 rounded-[24px] border soft-shadow flex flex-col items-center gap-1 active:scale-95 transition-all ${isLiked ? 'text-red-500 border-red-100 bg-red-50/5' : 'border-slate-100 text-slate-400'}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "" }}>favorite</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Amei</span>
          </button>
          <button onClick={() => setShowCommentBox(!showCommentBox)} className={`flex-1 py-5 rounded-[24px] border soft-shadow flex flex-col items-center gap-1 active:scale-95 transition-all ${showCommentBox ? 'text-blue-600 border-blue-100' : 'border-slate-100 text-slate-400'}`}>
            <span className="material-symbols-outlined">chat_bubble</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Opinar</span>
          </button>
          <button onClick={() => id && onToggleSave(id)} className={`flex-1 py-5 rounded-[24px] border soft-shadow flex flex-col items-center gap-1 active:scale-95 transition-all ${isSaved ? 'text-amber-600 border-amber-100' : 'border-slate-100 text-slate-400'}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "" }}>bookmark</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Salvar</span>
          </button>
        </div>

        {/* Comment Box */}
        {showCommentBox && (
          <div className="mb-12 animate-in slide-in-from-top-4 duration-300">
             <textarea 
               value={commentText}
               onChange={e => setCommentText(e.target.value)}
               placeholder="Compartilhe sua reflexão..."
               className={`w-full p-5 rounded-[24px] border min-h-[120px] focus:ring-2 focus:ring-blue-500/20 transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-[#1E293B]'}`}
             />
             <button onClick={handleSendComment} className="mt-3 w-full py-4 bg-[#3B82F6] text-white rounded-[20px] font-bold uppercase text-[11px] tracking-widest">Postar Comentário</button>
          </div>
        )}

        {/* Global Conversations */}
        <section className="mb-20">
          <h3 className="text-2xl font-bold mb-8 text-[#1E293B] dark:text-white">Conversa no SomosUm</h3>
          <div className="space-y-4">
            {rootComments.length === 0 ? (
               <p className="text-center py-10 text-slate-400 text-sm font-bold uppercase tracking-widest">Seja o primeiro a opinar</p>
            ) : rootComments.map(comment => (
              <CommentItem key={comment.id} comment={comment} allComments={realtimeComments} postId={id!} isDark={isDark} profile={content.profile} />
            ))}
          </div>
        </section>

        <div onClick={() => { if(id) markAsRead(id); navigate(`/aprofundar`); }} className="w-full bg-[#3B82F6] p-12 rounded-[40px] flex items-center justify-between text-white shadow-2xl active:scale-95 transition-transform cursor-pointer group">
          <div className="text-left">
            <span className="text-[11px] font-bold opacity-60 uppercase block mb-2 tracking-[1.2px]">ESTUDO FINALIZADO</span>
            <p className="text-[28px] font-bold leading-none tracking-tighter">Concluir Jornada</p>
          </div>
          <div className="size-16 rounded-3xl bg-white/20 flex items-center justify-center backdrop-blur-md">
            <span className="material-symbols-outlined text-[36px]">check_circle</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AprofundarDetail;
