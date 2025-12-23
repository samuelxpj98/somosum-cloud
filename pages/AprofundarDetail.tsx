import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContent, Expresso, Comment } from '../types';
import { DEEP_DIVE_DATA } from './Aprofundar';

interface AprofundarDetailProps {
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
}> = ({ comment, allComments, onReply, onLike, isReply }) => {
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
    <div className={`flex flex-col gap-3 ${isReply ? 'ml-8 mt-4 border-l-2 border-slate-100 pl-4' : 'bg-slate-50 p-5 rounded-[24px] border border-slate-100'}`}>
      <div className="flex gap-3">
        <img src={comment.userAvatar} className={`${isReply ? 'size-8' : 'size-10'} rounded-full border-2 border-white shadow-sm object-cover`} alt={comment.userName} />
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <div>
              <h5 className={`${isReply ? 'text-[11px]' : 'text-xs'} font-black text-slate-800`}>{comment.userName}</h5>
              <p className="text-[9px] text-slate-400 font-medium">{comment.userInfo}</p>
            </div>
            <span className="text-[9px] text-slate-300 font-bold">{comment.time}</span>
          </div>
          <p className={`${isReply ? 'text-xs' : 'text-sm'} text-slate-600 leading-relaxed font-medium`}>{comment.text}</p>
          <div className="flex items-center gap-6 mt-3">
            <button onClick={() => comment.postId && onLike(comment.id, comment.postId)} className={`flex items-center gap-1 active:scale-125 transition-all ${comment.isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}>
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: comment.isLiked ? "'FILL' 1" : "" }}>favorite</span>
              <span className="text-[10px] font-bold">{comment.likes}</span>
            </button>
            <button onClick={() => setIsReplying(!isReplying)} className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
              <span className="material-symbols-outlined text-[16px]">chat_bubble</span> Responder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AprofundarDetail: React.FC<AprofundarDetailProps> = ({ content, comments, onAddComment, onLikeComment, markAsRead, readPostIds, onToggleSave, onToggleLike }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isLiked = id ? content.profile.likedPostIds.includes(id) : false;
  const isSaved = id ? content.profile.savedPostIds.includes(id) : false;
  const isDark = content.profile.isDarkMode;
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentStatus, setCommentStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const displayItem = useMemo(() => {
    return DEEP_DIVE_DATA.find(e => e.id === id) || content.expressos.find(e => e.id === id);
  }, [id, content.expressos]);

  const rootComments = comments.filter(c => c.postId === id && !c.parentId);

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

  if (!displayItem) return <div className="p-10 text-center font-bold">Artigo não encontrado.</div>;

  return (
    <div className={`min-h-screen pb-12 transition-colors duration-300 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-5 bg-white/80 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="size-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-900 shadow-sm border border-slate-100 active:scale-90 transition-transform"><span className="material-symbols-outlined">arrow_back</span></button>
        <div className="w-10"></div>
      </header>

      <main className="px-6 py-4">
        <div className="mb-4 text-center flex flex-col items-center gap-3">
           <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">{displayItem.categoryFull || displayItem.category}</span>
        </div>

        <h1 className="text-[34px] font-black text-slate-900 font-display leading-[1.1] tracking-tighter mb-4 text-center">{displayItem.title}</h1>

        <div className="rounded-[32px] overflow-hidden shadow-xl mb-10 ring-1 ring-slate-100"><img src={displayItem.imageUrl} className="w-full h-72 object-cover" alt="" /></div>

        <div className="space-y-6 text-slate-700 font-medium leading-[1.7] text-[16px] mb-12">
           {displayItem.content.split('\n').map((para, idx) => para.trim() && <p key={idx}>{para}</p>)}
        </div>

        <div className="flex items-center justify-between gap-4 mb-12">
          <button onClick={() => id && onToggleLike(id)} className={`flex-1 py-4 rounded-[20px] shadow-sm flex flex-col items-center gap-1 active:scale-95 transition-all border ${isLiked ? 'bg-red-50 border-red-100 text-red-500' : 'bg-white border-slate-100 text-slate-400'}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "" }}>favorite</span>
            <span className="text-[10px] font-bold uppercase">Curtir</span>
          </button>
          <button onClick={() => setShowCommentBox(!showCommentBox)} className={`flex-1 py-4 rounded-[20px] shadow-sm flex flex-col items-center gap-1 active:scale-95 transition-all border ${showCommentBox ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-white border-slate-100 text-slate-400'}`}>
            <span className="material-symbols-outlined">chat_bubble</span>
            <span className="text-[10px] font-bold uppercase">Opinar</span>
          </button>
          <button onClick={() => id && onToggleSave(id)} className={`flex-1 py-4 rounded-[20px] shadow-sm flex flex-col items-center gap-1 active:scale-95 transition-all border ${isSaved ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-white border-slate-100 text-slate-400'}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "" }}>bookmark</span>
            <span className="text-[10px] font-bold uppercase">Salvar</span>
          </button>
        </div>

        {showCommentBox && (
          <div className="mb-12 p-6 bg-slate-50 rounded-[32px] border border-slate-100 animate-in slide-in-from-bottom-4 duration-300">
            <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="O que você achou desse estudo?" className="w-full h-32 p-4 bg-white rounded-2xl border-none shadow-inner text-slate-600 mb-4 resize-none" />
            <button onClick={handleSendComment} disabled={commentStatus !== 'idle'} className="w-full bg-blue-600 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2">
              {commentStatus === 'sending' ? <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Publicar Comentário"}
            </button>
          </div>
        )}

        <section className="mb-16 space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-slate-900 font-display">Discussão</h3>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Real-time</span>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            {rootComments.map(comment => (
              <CommentItem key={comment.id} comment={comment} allComments={comments} onReply={()=>{}} onLike={onLikeComment} />
            ))}
          </div>
        </section>

        <div onClick={() => { if(id) markAsRead(id); navigate(`/home`); }} className="w-full bg-[#135bec] p-8 rounded-[32px] flex items-center justify-between text-white shadow-xl active:scale-[0.98] transition-transform">
          <div className="text-left">
            <span className="text-[11px] font-black text-white/60 uppercase tracking-widest block mb-2">CONCLUÍDO?</span>
            <p className="text-2xl font-black text-white font-display leading-tight tracking-tight">Marcar como lido e<br/>voltar ao início</p>
          </div>
          <span className="material-symbols-outlined text-[32px]">arrow_forward</span>
        </div>
      </main>
    </div>
  );
};

export default AprofundarDetail;