
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContent } from '../types';
import { commentsService } from '../lib/firebase';
import { marked } from 'marked';

marked.setOptions({
  breaks: true,
  gfm: true
});

const CommentItem: React.FC<{
  comment: any;
  allComments: any[];
  postId: string;
  isDark?: boolean;
  depth?: number;
  profile: any;
  onLikeComment: (postId: string, commentId: string) => void;
}> = ({ comment, allComments, postId, isDark, depth = 0, profile, onLikeComment }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  
  const replies = useMemo(() => allComments.filter(c => c.parentId === comment.id), [allComments, comment.id]);
  const alreadyLiked = useMemo(() => (profile.likedCommentIds || []).includes(comment.id), [profile.likedCommentIds, comment.id]);

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    await commentsService.addComment(postId, {
      usuario: profile.name || "Explorador",
      texto: replyText,
      userAvatar: profile.avatarUrl,
      church: profile.church,
      parentId: comment.id,
      postTitle: comment.postTitle || "Comentário"
    });
    setReplyText('');
    setIsReplying(false);
    setShowReplies(true);
  };

  return (
    <div className={`transition-all animate-in fade-in slide-in-from-left-4 duration-300 ${depth > 0 ? 'ml-4 mt-2 border-l-2 border-slate-200 dark:border-slate-700 pl-4' : 'mt-4'}`}>
      <div className={`p-4 rounded-[24px] border soft-shadow transition-all ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
        <div className="flex gap-3">
          <div className="size-8 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-[8px] shrink-0 overflow-hidden">
            {comment.userAvatar ? <img src={comment.userAvatar} className="size-full object-cover" /> : comment.usuario?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
               <div className="flex items-center gap-2 flex-wrap min-w-0">
                 <h5 className={`text-[13px] font-bold truncate ${isDark ? 'text-white' : 'text-[#1E293B]'}`}>{comment.usuario}</h5>
                 <span className="text-[10px] text-slate-300 font-bold">•</span>
                 <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest truncate">{comment.church || "SomosUm"}</p>
               </div>
               <span className="text-[8px] text-slate-300 font-bold shrink-0 ml-2">{comment.time}</span>
            </div>
            <p className={`text-[13px] leading-relaxed mt-1 ${isDark ? 'text-slate-300' : 'text-[#334155]'}`}>{comment.texto}</p>
            
            <div className="flex items-center gap-4 mt-2">
              <button 
                onClick={() => !alreadyLiked && onLikeComment(postId, comment.id)} 
                className={`flex items-center gap-1 active:scale-90 transition-all ${alreadyLiked ? 'text-blue-500' : 'text-slate-400'}`}
              >
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: alreadyLiked ? "'FILL' 1" : "" }}>thumb_up</span>
                <span className="text-[9px] font-bold">{comment.likes || 0}</span>
              </button>
              <button onClick={() => setIsReplying(!isReplying)} className={`text-[9px] font-black uppercase tracking-widest ${isReplying ? 'text-blue-500' : 'text-slate-400'}`}>
                Responder
              </button>
            </div>

            {isReplying && (
              <div className="mt-3 animate-in slide-in-from-top-2 duration-200">
                <textarea 
                  autoFocus
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Sua resposta..."
                  className={`w-full p-3 rounded-xl border text-[12px] min-h-[60px] focus:ring-2 focus:ring-blue-500/20 outline-none ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                />
                <div className="flex gap-2 mt-2">
                  <button onClick={handleSendReply} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">Enviar</button>
                  <button onClick={() => setIsReplying(false)} className="px-4 py-2 text-slate-400 text-[9px] font-black uppercase tracking-widest">Cancelar</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {replies.length > 0 && (
        <div className="mt-1">
          {!showReplies ? (
            <button 
              onClick={() => setShowReplies(true)}
              className="ml-4 flex items-center gap-1.5 py-1 text-[9px] font-black text-blue-500 uppercase tracking-widest active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[14px]">subdirectory_arrow_right</span>
              Ver {replies.length} {replies.length === 1 ? 'resposta' : 'respostas'}
            </button>
          ) : (
            <div className="animate-in slide-in-from-top-2 duration-300">
              {replies.map(reply => (
                <CommentItem 
                  key={reply.id} 
                  comment={reply} 
                  allComments={allComments} 
                  postId={postId} 
                  isDark={isDark} 
                  depth={depth + 1} 
                  profile={profile}
                  onLikeComment={onLikeComment}
                />
              ))}
              <button 
                onClick={() => setShowReplies(false)}
                className="ml-4 py-1 text-[9px] font-black text-slate-400 uppercase tracking-widest active:scale-95 transition-all"
              >
                Recolher
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ExpressoDetail: React.FC<any> = ({ content, markAsRead, onToggleSave, onToggleLike, onLikeComment }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const item = content.expressos.find((e: any) => e.id === id);
  const isDark = content.profile.isDarkMode;
  const isLiked = useMemo(() => id ? content.profile.likedPostIds.includes(id) : false, [id, content.profile.likedPostIds]);
  const isSaved = useMemo(() => id ? content.profile.savedPostIds.includes(id) : false, [id, content.profile.savedPostIds]);
  
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
    if (!commentText.trim() || !id || !item) return;
    await commentsService.addComment(id, {
      usuario: content.profile.name || "Explorador",
      texto: commentText,
      userAvatar: content.profile.avatarUrl,
      church: content.profile.church,
      postTitle: item.title
    });
    setCommentText('');
    setShowCommentBox(false);
  };

  const processedContent = useMemo(() => {
    if (!item?.content) return '';
    const raw = item.content.replace(/\\n/g, '\n').trim();
    return marked.parse(raw);
  }, [item?.content]);

  const rootComments = useMemo(() => realtimeComments.filter(c => !c.parentId).sort((a,b) => b.hora - a.hora), [realtimeComments]);

  if (!item) return <div className="p-10 text-center font-bold">Conteúdo não encontrado.</div>;

  return (
    <div className={`min-h-screen pb-12 transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-[#F1F5F9]'}`}>
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

      <main className={`relative z-20 -mt-20 px-6 pt-12 pb-16 rounded-t-[48px] shadow-2xl transition-colors duration-300 ${isDark ? 'bg-slate-950 text-white' : 'bg-white text-[#334155]'}`}>
        <div className="text-center mb-10 animate-in slide-in-from-bottom-6 duration-700">
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

        {item.analogy && item.analogy.text && (
          <div className={`mb-10 p-8 rounded-[32px] border transition-all animate-in slide-in-from-bottom-4 duration-700 ${isDark ? 'bg-blue-600/5 border-blue-500/20' : 'bg-slate-50 border-slate-100'}`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="size-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>{item.analogy.icon || 'bolt'}</span>
              </div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">{item.analogy.title || 'A Analogia'}</h4>
            </div>
            <p className={`text-[15px] leading-relaxed font-medium whitespace-pre-wrap ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {item.analogy.text.replace(/\\n/g, '\n')}
            </p>
          </div>
        )}

        <div 
          className={`prose prose-slate max-w-none mb-10 animate-in fade-in duration-1000 
            ${isDark ? 'prose-invert prose-p:text-slate-400 prose-headings:text-white' : 'prose-p:text-[#334155] prose-headings:text-slate-900'}
            prose-headings:font-black prose-headings:tracking-tighter prose-p:text-[17px] prose-p:leading-[1.7] prose-p:mb-6 
            prose-strong:text-blue-600 dark:prose-strong:text-blue-400
          `}
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />

        <div className="flex gap-4 mb-16">
          <button 
            onClick={() => !isLiked && id && onToggleLike(id)} 
            className={`flex-1 py-5 rounded-[24px] border soft-shadow flex flex-col items-center gap-1 transition-all ${isLiked ? 'text-red-500 border-red-100 bg-red-50/5' : 'border-slate-100 text-slate-400 active:scale-95'}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "" }}>favorite</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">{isLiked ? 'Curtiu' : 'Amei'}</span>
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

        <section className="mb-16">
          <h3 className="text-2xl font-bold mb-8 text-[#1E293B] dark:text-white">Conversa no SomosUm</h3>
          <div className="space-y-2">
            {rootComments.length === 0 ? (
               <p className="text-center py-10 text-slate-400 text-sm font-bold uppercase tracking-widest">Inicie o diálogo</p>
            ) : rootComments.map(comment => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                allComments={realtimeComments} 
                postId={id!} 
                isDark={isDark} 
                profile={content.profile} 
                onLikeComment={onLikeComment}
              />
            ))}
          </div>
        </section>

        <div onClick={() => { if(id) markAsRead(id); navigate(`/expresso`); }} className="w-full bg-[#1E293B] p-10 rounded-[32px] flex items-center justify-between text-white shadow-2xl active:scale-95 transition-transform cursor-pointer border border-white/10">
          <div className="text-left">
            <span className="text-[10px] font-bold opacity-50 uppercase block mb-2 tracking-[1.2px]">CONCLUÍDO</span>
            <p className="text-[26px] font-bold leading-none tracking-tight">Terminei a leitura</p>
          </div>
          <span className="material-symbols-outlined text-[40px] text-[#3B82F6]">verified</span>
        </div>
      </main>
    </div>
  );
};

export default ExpressoDetail;
