
import React, { useEffect, useState, useMemo } from 'react';
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
    </div>
  );
};

const ExpressoDetail: React.FC<any> = ({ content, markAsRead, onToggleSave, onToggleLike }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const item = content.expressos.find((e: any) => e.id === id);
  const isDark = content.profile.isDarkMode;
  const isLiked = id ? content.profile.likedPostIds.includes(id) : false;
  const isSaved = id ? content.profile.savedPostIds.includes(id) : false;
  
  const [realtimeComments, setRealtimeComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);

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

  if (!item) return <div className="p-10 text-center font-bold">Conteúdo não encontrado.</div>;

  return (
    <div className={`min-h-screen pb-12 transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-[#F1F5F9]'}`}>
      
      {/* Hero Section */}
      <section className="relative w-full h-[55vh] overflow-hidden">
        <img src={item.imageUrl} className="absolute inset-0 w-full h-full object-cover animate-in fade-in zoom-in-110 duration-1000" alt={item.title} />
        <header className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-8">
          <button onClick={() => navigate(-1)} className="size-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white border border-white/10 active:scale-90 transition-all">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div className="bg-black/20 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-[10px] font-bold text-white uppercase tracking-[1.2px] flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px]">schedule</span> {item.readingTime}
          </div>
          <button className="size-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white border border-white/10 active:scale-90 transition-all">
            <span className="material-symbols-outlined text-[20px]">share</span>
          </button>
        </header>
      </section>

      {/* Main Content */}
      <main className={`relative z-20 -mt-20 px-6 pt-12 pb-16 rounded-t-[48px] shadow-2xl transition-colors duration-300 ${isDark ? 'bg-slate-950 text-white' : 'bg-white text-[#334155]'}`}>
        
        <div className="text-center mb-12 animate-in slide-in-from-bottom-6 duration-700">
          <span className="text-[12px] font-bold text-[#3B82F6] uppercase tracking-[1.2px] mb-4 block">
            {item.categoryFull || item.category}
          </span>
          <h1 className="text-[32px] font-bold leading-tight tracking-tighter mb-4 text-[#1E293B] dark:text-white">
            {item.title}
          </h1>
          {item.subtitle && (
            <p className="text-[16px] font-bold text-[#3B82F6] max-w-[300px] mx-auto opacity-90 leading-snug">
              {item.subtitle}
            </p>
          )}
        </div>

        <div className={`whitespace-pre-line mb-14 text-[17px] leading-[1.6] animate-in fade-in duration-1000 ${isDark ? 'text-slate-400' : 'text-[#334155]'}`}>
          {item.content.replace(/\\n/g, '\n').trim()}
        </div>

        {/* Pilar de Fé */}
        {item.bibleReference && (
          <div className="mb-14 py-8 px-4 text-center border-t border-slate-50 dark:border-slate-800/50 animate-in fade-in duration-1000">
            <div className="flex flex-col items-center gap-2 mb-5">
              <span className="material-symbols-outlined text-[#3B82F6] text-[32px]">menu_book</span>
              <h4 className="text-[#3B82F6] font-bold text-[12px] uppercase tracking-[1.2px]">Pilar da Fé</h4>
            </div>
            <p className={`font-serif text-[18px] leading-[1.6] italic max-w-[90%] mx-auto ${isDark ? 'text-blue-100' : 'text-[#1E293B]'}`}>
              "{item.bibleReference}"
            </p>
          </div>
        )}

        {/* Action Buttons */}
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

        {/* Comment Input */}
        {showCommentBox && (
          <div className="mb-12 animate-in slide-in-from-top-4 duration-300">
             <textarea 
               value={commentText}
               onChange={e => setCommentText(e.target.value)}
               placeholder="Deixe sua marca nesta conversa..."
               className={`w-full p-5 rounded-[24px] border min-h-[100px] focus:ring-2 focus:ring-blue-500/20 transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-[#1E293B]'}`}
             />
             <button onClick={handleSendComment} className="mt-3 w-full py-4 bg-[#3B82F6] text-white rounded-[20px] font-bold uppercase text-[11px] tracking-widest">Postar Comentário</button>
          </div>
        )}

        {/* Conversation List */}
        <section className="mb-16">
          <h3 className="text-2xl font-bold mb-8 text-[#1E293B] dark:text-white">Conversa no SomosUm</h3>
          <div className="space-y-4">
            {rootComments.length === 0 ? (
               <p className="text-center py-10 text-slate-400 text-sm font-bold uppercase tracking-widest">Inicie o diálogo</p>
            ) : rootComments.map(comment => (
              <CommentItem key={comment.id} comment={comment} allComments={realtimeComments} postId={id!} isDark={isDark} profile={content.profile} />
            ))}
          </div>
        </section>

        <div onClick={() => { if(id) markAsRead(id); navigate(`/expresso`); }} className="w-full bg-[#1E293B] p-10 rounded-[32px] flex items-center justify-between text-white shadow-2xl active:scale-95 transition-transform cursor-pointer">
          <div className="text-left">
            <span className="text-[10px] font-bold opacity-50 uppercase block mb-2 tracking-[1.2px]">CONCLUÍDO</span>
            <p className="text-[26px] font-bold leading-none tracking-tight">Guardar no Coração</p>
          </div>
          <span className="material-symbols-outlined text-[40px] text-[#3B82F6]">verified</span>
        </div>
      </main>
    </div>
  );
};

export default ExpressoDetail;
