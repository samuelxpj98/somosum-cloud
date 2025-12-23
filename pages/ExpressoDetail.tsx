import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContent, Comment } from '../types';
import { marked } from 'marked';

interface ExpressoDetailProps {
  content: AppContent;
  comments: Comment[];
  onAddComment: (comment: Comment) => void;
  onLikeComment: (id: string, postId: string) => void;
  markAsRead: (id: string) => void;
  readPostIds: string[];
  onToggleSave: (id: string) => void;
  onToggleLike: (id: string) => void;
}

const CommentItem: React.FC<{
  comment: Comment;
  allComments: Comment[];
  onReply: (parentId: string, text: string) => void;
  onLike: (id: string, postId: string) => void;
  isReply?: boolean;
  isDark?: boolean;
}> = ({ comment, allComments, onReply, onLike, isReply, isDark }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  
  const replies = allComments.filter(c => c.parentId === comment.id);

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    onReply(comment.id, replyText);
    setReplyText('');
    setIsReplying(false);
    setShowReplies(true);
  };

  return (
    <div className={`flex flex-col gap-3 ${isReply ? 'ml-8 mt-4 border-l-2 border-slate-200 pl-4' : (isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100') + ' p-5 rounded-[24px] border'}`}>
      <div className="flex gap-3">
        <img src={comment.userAvatar} className={`${isReply ? 'size-8' : 'size-10'} rounded-full border-2 ${isDark ? 'border-slate-700' : 'border-white'} shadow-sm object-cover`} alt={comment.userName} />
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <div>
              <h5 className={`${isReply ? 'text-[11px]' : 'text-xs'} font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{comment.userName}</h5>
              <p className="text-[9px] text-slate-400 font-medium">{comment.userInfo}</p>
            </div>
            <span className="text-[9px] text-slate-300 font-bold">{comment.time}</span>
          </div>
          <p className={`${isReply ? 'text-xs' : 'text-sm'} leading-relaxed font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {comment.text}
          </p>
          <div className="flex items-center gap-6 mt-3">
            <button onClick={() => comment.postId && onLike(comment.id, comment.postId)} className={`flex items-center gap-1 active:scale-125 transition-all ${comment.isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}>
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: comment.isLiked ? "'FILL' 1" : "" }}>favorite</span>
              <span className="text-[10px] font-bold">{comment.likes}</span>
            </button>
            <button onClick={() => setIsReplying(!isReplying)} className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${isReplying ? 'text-blue-600' : 'text-slate-400'}`}>
              <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
              Responder
            </button>
          </div>
        </div>
      </div>

      {isReplying && (
        <div className={`${isDark ? 'bg-slate-900' : 'bg-white'} p-4 rounded-2xl border border-slate-100 mt-2`}>
          <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder={`Responder a ${comment.userName}...`} className={`w-full border-none rounded-xl p-3 text-xs min-h-[60px] resize-none mb-3 ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-700'}`} />
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsReplying(false)} className="px-3 py-1.5 text-[9px] font-black text-slate-400 uppercase">Cancelar</button>
            <button onClick={handleSendReply} className="px-4 py-1.5 bg-blue-600 text-white text-[9px] font-black rounded-lg uppercase shadow-sm">Enviar</button>
          </div>
        </div>
      )}

      {replies.length > 0 && !showReplies && (
        <button onClick={() => setShowReplies(true)} className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase mt-2">
          Ver {replies.length} respostas
        </button>
      )}

      {showReplies && (
        <div>
          {replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} allComments={allComments} onReply={onReply} onLike={onLike} isReply isDark={isDark} />
          ))}
          <button onClick={() => setShowReplies(false)} className="text-[9px] font-black text-slate-400 uppercase mt-4 ml-8">Ocultar</button>
        </div>
      )}
    </div>
  );
};

const ExpressoDetail: React.FC<ExpressoDetailProps> = ({ content, comments, onAddComment, onLikeComment, markAsRead, readPostIds, onToggleSave, onToggleLike }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const item = content.expressos.find(e => e.id === id);
  const [htmlContent, setHtmlContent] = useState('');
  const isDark = content.profile.isDarkMode;
  const isLiked = id ? content.profile.likedPostIds.includes(id) : false;
  const isSaved = id ? content.profile.savedPostIds.includes(id) : false;
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentStatus, setCommentStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [toast, setToast] = useState<{show: boolean, message: string}>({show: false, message: ''});

  const rootComments = comments.filter(c => c.postId === id && !c.parentId);
  
  useEffect(() => {
    if (item) {
      setHtmlContent(marked.parse(item.content) as string);
      window.scrollTo(0, 0);
    }
  }, [item]);

  const handleSendComment = () => {
    if (!commentText.trim() || !id) return;
    setCommentStatus('sending');
    const newComment: Comment = {
      id: Date.now().toString(),
      userName: content.profile.name,
      userAvatar: content.profile.avatarUrl,
      userInfo: `${content.profile.church} • ${content.profile.education}`,
      text: commentText,
      likes: 0,
      time: "Agora",
      postId: id
    };
    
    onAddComment(newComment);
    setTimeout(() => {
      setCommentStatus('sent');
      setTimeout(() => {
        setShowCommentBox(false);
        setCommentText('');
        setCommentStatus('idle');
      }, 800);
    }, 400);
  };

  if (!item) return <div className="p-10 text-center font-bold">Post não encontrado.</div>;

  return (
    <div className={`min-h-screen pb-12 transition-colors duration-300 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
      {toast.show && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300">
          <span className="material-symbols-outlined text-green-400">check_circle</span>
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      <div className="relative w-full aspect-square overflow-hidden bg-slate-100">
        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
        <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
          <button onClick={() => navigate(-1)} className="size-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white"><span className="material-symbols-outlined">arrow_back</span></button>
          <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-white">timer</span>
            <span className="text-[11px] font-bold text-white uppercase">{item.readingTime}</span>
          </div>
        </header>
      </div>

      <main className={`px-6 -mt-10 relative z-10 rounded-t-[40px] pt-8 transition-colors duration-300 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
        <div className="flex flex-col items-center mb-6 gap-3">
          <div className={`${isDark ? 'bg-blue-900/40 border-blue-800' : 'bg-blue-50 border-blue-100'} px-6 py-2 rounded-full border`}>
            <span className={`text-[11px] font-[900] uppercase tracking-[0.2em] ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{item.categoryFull || item.category}</span>
          </div>
        </div>
        
        <h1 className={`text-[32px] font-[900] leading-[1.1] mb-4 tracking-tighter font-display text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.title}</h1>
        <h2 className="text-xl font-bold text-blue-600 leading-tight mb-8 text-center">{item.subtitle}</h2>

        <div className={`prose max-w-none mb-10 ${isDark ? 'prose-invert text-slate-300' : 'prose-slate text-slate-800'}`} dangerouslySetInnerHTML={{ __html: htmlContent }} />

        <div className="flex items-center justify-between gap-4 mb-12">
          <button onClick={() => { if(id) onToggleLike(id); }} className={`flex-1 py-4 rounded-[20px] shadow-sm flex flex-col items-center gap-1 active:scale-95 transition-all border ${isLiked ? 'bg-red-50/10 border-red-500/20 text-red-500' : (isDark ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-white border-slate-100 text-slate-400')}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "" }}>favorite</span>
            <span className="text-[10px] font-black uppercase">Amei</span>
          </button>
          <button onClick={() => setShowCommentBox(!showCommentBox)} className={`flex-1 py-4 rounded-[20px] shadow-sm flex flex-col items-center gap-1 active:scale-95 transition-all border ${showCommentBox ? 'bg-blue-50/10 border-blue-500/20 text-blue-600' : (isDark ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-white border-slate-100 text-slate-400')}`}>
            <span className="material-symbols-outlined">chat_bubble</span>
            <span className="text-[10px] font-black uppercase">Opinar</span>
          </button>
          <button onClick={() => { if(id) onToggleSave(id); }} className={`flex-1 py-4 rounded-[20px] shadow-sm flex flex-col items-center gap-1 active:scale-95 transition-all border ${isSaved ? 'bg-amber-50/10 border-amber-500/20 text-amber-600' : (isDark ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-white border-slate-100 text-slate-400')}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "" }}>bookmark</span>
            <span className="text-[10px] font-black uppercase">Salvar</span>
          </button>
        </div>

        {showCommentBox && (
          <div className={`${isDark ? 'bg-slate-800' : 'bg-slate-50'} mb-8 p-6 rounded-[32px] border animate-in slide-in-from-top-4 duration-300`}>
             <textarea 
               value={commentText} 
               onChange={(e) => setCommentText(e.target.value)} 
               placeholder="Escreva sua opinião sincera..." 
               className={`w-full h-32 p-4 rounded-2xl border-none text-sm resize-none mb-4 ${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'}`} 
             />
             <button 
               onClick={handleSendComment} 
               disabled={commentStatus === 'sending'}
               className="w-full bg-blue-600 text-white font-black h-14 rounded-2xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center"
             >
               {commentStatus === 'sending' ? (
                 <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
               ) : commentStatus === 'sent' ? (
                 <span className="material-symbols-outlined">check_circle</span>
               ) : "Publicar Comentário"}
             </button>
          </div>
        )}

        <section className="mb-12 space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <h3 className={`text-xl font-black font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>Discussão</h3>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Real-time</span>
              </div>
            </div>
            <span className="text-[10px] font-black px-2 py-1 bg-slate-100 rounded-md text-slate-500">{rootComments.length} conversas</span>
          </div>
          <div className="space-y-6">
            {rootComments.map(comment => (
              <CommentItem key={comment.id} comment={comment} allComments={comments} onReply={()=>{}} onLike={onLikeComment} isDark={isDark} />
            ))}
            {rootComments.length === 0 && (
              <div className="py-12 text-center opacity-40 italic font-medium text-sm">Nenhum comentário ainda. Seja o primeiro!</div>
            )}
          </div>
        </section>

        <div onClick={() => { if(id) markAsRead(id); navigate(`/expresso`); }} className="w-full bg-[#135bec] p-8 rounded-[32px] flex items-center justify-between text-white shadow-xl active:scale-[0.98] transition-transform">
          <div className="text-left">
            <span className="text-[11px] font-black opacity-60 uppercase block mb-2">Concluído?</span>
            <p className="text-2xl font-black font-display leading-tight">Marcar como lido e voltar</p>
          </div>
          <span className="material-symbols-outlined text-[32px]">arrow_forward</span>
        </div>
      </main>
    </div>
  );
};

export default ExpressoDetail;