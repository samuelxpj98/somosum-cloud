
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContent, Expresso, Comment } from '../types';
import { DEEP_DIVE_DATA } from './Aprofundar';

interface AprofundarDetailProps {
  content: AppContent;
  comments: Comment[];
  onAddComment: (comment: Comment) => void;
  onLikeComment: (id: string) => void;
  markAsRead: (id: string) => void;
  readPostIds: string[];
  onToggleSave: (id: string) => void;
  // Added onToggleLike prop definition to match App.tsx usage
  onToggleLike: (id: string) => void;
}

const CommentItem: React.FC<{
  comment: Comment;
  allComments: Comment[];
  onReply: (parentId: string, text: string) => void;
  onLike: (id: string) => void;
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
        <img 
          src={comment.userAvatar} 
          className={`${isReply ? 'size-8' : 'size-10'} rounded-full border-2 border-white shadow-sm object-cover`} 
          alt={comment.userName} 
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://i.pravatar.cc/150?u=fallback";
          }}
        />
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <div>
              <h5 className={`${isReply ? 'text-[11px]' : 'text-xs'} font-black text-slate-800`}>{comment.userName}</h5>
              <p className="text-[9px] text-slate-400 font-medium">{comment.userInfo}</p>
            </div>
            <span className="text-[9px] text-slate-300 font-bold">{comment.time}</span>
          </div>
          <p className={`${isReply ? 'text-xs' : 'text-sm'} text-slate-600 leading-relaxed font-medium`}>
            {comment.text}
          </p>
          <div className="flex items-center gap-6 mt-3">
            <button 
              onClick={() => onLike(comment.id)}
              className={`flex items-center gap-1 active:scale-125 transition-all ${comment.isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}
            >
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: comment.isLiked ? "'FILL' 1" : "" }}>favorite</span>
              <span className="text-[10px] font-bold">{comment.likes}</span>
            </button>
            <button 
              onClick={() => setIsReplying(!isReplying)}
              className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${isReplying ? 'text-blue-600' : 'text-slate-400'}`}
            >
              <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
              Responder
            </button>
          </div>
        </div>
      </div>

      {isReplying && (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 animate-in zoom-in-95 duration-200 mt-2">
          <textarea 
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`Responder a ${comment.userName}...`}
            className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs text-slate-700 focus:ring-1 focus:ring-blue-500/20 min-h-[60px] resize-none mb-3"
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsReplying(false)} className="px-3 py-1.5 text-[9px] font-black text-slate-400 uppercase">Cancelar</button>
            <button onClick={handleSendReply} className="px-4 py-1.5 bg-blue-600 text-white text-[9px] font-black rounded-lg uppercase shadow-sm">Enviar</button>
          </div>
        </div>
      )}

      {replies.length > 0 && !showReplies && (
        <button 
          onClick={() => setShowReplies(true)}
          className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest mt-2 hover:opacity-70 transition-opacity"
        >
          <div className="h-[1px] w-4 bg-blue-200"></div>
          Ver {replies.length} {replies.length === 1 ? 'resposta' : 'respostas'}
        </button>
      )}

      {showReplies && (
        <div className="animate-in slide-in-from-top-2 duration-300">
          {replies.map(reply => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              allComments={allComments} 
              onReply={onReply}
              onLike={onLike}
              isReply
            />
          ))}
          <button 
            onClick={() => setShowReplies(false)}
            className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-4 ml-8"
          >
            Ocultar respostas
          </button>
        </div>
      )}
    </div>
  );
};

const AprofundarDetail: React.FC<AprofundarDetailProps> = ({ 
  content, 
  comments, 
  onAddComment, 
  onLikeComment, 
  markAsRead, 
  readPostIds, 
  onToggleSave,
  // Destructured the newly added onToggleLike prop
  onToggleLike 
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const commentSectionRef = useRef<HTMLElement>(null);
  
  // Replaced local isLiked state with derived value from profile state
  const isLiked = id ? content.profile.likedPostIds.includes(id) : false;
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentStatus, setCommentStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const profile = content.profile;
  const userSocialInfo = `${profile.church || 'SomosUm'} • ${profile.course || profile.education || 'Membro'}`;
  
  const displayItem = useMemo(() => {
    const staticItem = DEEP_DIVE_DATA.find(e => e.id === id);
    if (staticItem) return staticItem;
    
    return content.expressos.find(e => e.id === id);
  }, [id, content.expressos]);

  const isSaved = id ? profile.savedPostIds.includes(id) : false;

  const rootComments = useMemo(() => {
    return comments.filter(c => c.postId === id && !c.parentId);
  }, [comments, id]);

  const isRead = id ? readPostIds.includes(id) : false;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSave = () => {
    if (!id) return;
    onToggleSave(id);
    triggerToast(isSaved ? 'Removido da biblioteca' : 'Artigo salvo na sua biblioteca! 📚');
  };

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    setCommentStatus('sending');
    
    const newComment: Comment = {
      id: Date.now().toString(),
      userName: profile.name,
      userAvatar: profile.avatarUrl,
      userInfo: userSocialInfo,
      text: commentText,
      likes: 0,
      time: "Agora",
      postId: id
    };

    setTimeout(() => {
      onAddComment(newComment);
      setCommentStatus('sent');
      setTimeout(() => {
        setShowCommentBox(false);
        setCommentText('');
        setCommentStatus('idle');
      }, 1000);
    }, 600);
  };

  const handleReply = (parentId: string, text: string) => {
    const newReply: Comment = {
      id: Date.now().toString(),
      userName: profile.name,
      userAvatar: profile.avatarUrl,
      userInfo: userSocialInfo,
      text: text,
      likes: 0,
      time: "Agora",
      postId: id,
      parentId: parentId
    };
    onAddComment(newReply);
  };

  const handleComplete = () => {
    if (id) markAsRead(id);
    navigate(`/aprofundar#post-${id}`);
  };

  if (!displayItem) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center">
        <span className="material-symbols-outlined text-slate-200 text-6xl mb-4">article</span>
        <h2 className="text-xl font-black text-slate-900 mb-2">Artigo não encontrado</h2>
        <button onClick={() => navigate('/aprofundar')} className="text-blue-600 font-bold uppercase text-xs tracking-widest">Voltar para Aprofundamento</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-12 relative">
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <span className="material-symbols-outlined text-amber-400">bookmark</span>
          <span className="text-xs font-black uppercase tracking-widest">{toastMessage}</span>
        </div>
      )}

      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-5 bg-white/80 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="size-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-900 shadow-sm border border-slate-100 active:scale-90 transition-transform">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <button className="size-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-900 shadow-sm border border-slate-100 active:scale-90 transition-transform">
          <span className="material-symbols-outlined">share</span>
        </button>
      </header>

      <main className="px-6 py-4">
        <div className="mb-4 text-center flex flex-col items-center gap-3">
           <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
             {displayItem.categoryFull || displayItem.category}
           </span>
           {isRead && (
            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full animate-in fade-in slide-in-from-top-2 duration-500">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span className="text-[9px] font-black uppercase tracking-widest">Leitura concluída</span>
            </div>
           )}
        </div>

        <h1 className="text-[34px] font-black text-slate-900 font-display leading-[1.1] tracking-tighter mb-4 text-center">
          {displayItem.title}
        </h1>

        <div className="flex items-center justify-center gap-4 text-slate-400 text-xs font-bold uppercase tracking-wider mb-8">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            {displayItem.readingTime}
          </div>
          <span className="text-slate-200">•</span>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">article</span>
            Conteúdo Original
          </div>
        </div>

        <div className="rounded-[32px] overflow-hidden shadow-xl mb-10 ring-1 ring-slate-100">
          <img src={displayItem.imageUrl} className="w-full h-72 object-cover" alt={displayItem.title} />
        </div>

        <div className="space-y-6 text-slate-700 font-medium leading-[1.7] text-[16px] mb-12">
           {displayItem.content.split('\n').map((para, idx) => (
             para.trim() && <p key={idx}>{para}</p>
           ))}
        </div>

        {(displayItem.bibleReference || displayItem.analogy) && (
          <section className="bg-slate-950 rounded-[32px] p-8 mb-12 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-symbols-outlined text-[120px] text-white select-none">format_quote</span>
            </div>
            
            <div className="relative z-10">
              <h4 className="text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                {displayItem.analogy?.title || 'VERSÍCULO CHAVE'}
              </h4>
              <p className="text-white text-xl font-bold font-display italic leading-relaxed mb-6">
                {displayItem.analogy?.text || 'O Senhor reina para sempre.'}
              </p>
              {displayItem.bibleReference && (
                <div className="flex justify-end">
                  <span className="text-white/60 text-xs font-black uppercase tracking-widest">— {displayItem.bibleReference}</span>
                </div>
              )}
            </div>
          </section>
        )}

        <div className="flex items-center justify-between gap-4 mb-12">
          {/* Updated like button to use the onToggleLike prop from App.tsx */}
          <button onClick={() => { if(id) onToggleLike(id); }} className={`flex-1 py-4 rounded-[20px] shadow-sm flex flex-col items-center gap-1 active:scale-95 transition-all border ${isLiked ? 'bg-red-50 border-red-100 text-red-500' : 'bg-white border-slate-100 text-slate-400'}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "" }}>favorite</span>
            <span className={`text-[10px] font-bold uppercase ${isLiked ? 'text-red-500' : 'text-slate-500'}`}>Curtir</span>
          </button>
          <button onClick={() => setShowCommentBox(!showCommentBox)} className={`flex-1 py-4 rounded-[20px] shadow-sm flex flex-col items-center gap-1 active:scale-95 transition-all border ${showCommentBox ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-white border-slate-100 text-slate-400'}`}>
            <span className="material-symbols-outlined">chat_bubble</span>
            <span className={`text-[10px] font-bold uppercase ${showCommentBox ? 'text-blue-600' : 'text-slate-500'}`}>Comentar</span>
          </button>
          <button onClick={handleSave} className={`flex-1 py-4 rounded-[20px] shadow-sm flex flex-col items-center gap-1 active:scale-95 transition-all border ${isSaved ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-white border-slate-100 text-slate-400'}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "" }}>bookmark</span>
            <span className={`text-[10px] font-bold uppercase ${isSaved ? 'text-amber-600' : 'text-slate-500'}`}>Salvar</span>
          </button>
        </div>

        {showCommentBox && (
          <div className="mb-12 p-6 bg-slate-50 rounded-[32px] border border-slate-100 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Sua Opinião</h4>
            <textarea 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="O que você achou desse aprofundamento?"
              className="w-full h-32 p-4 bg-white rounded-2xl border-none shadow-inner text-slate-600 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none font-medium mb-4"
            />
            <div className="flex gap-3">
              <button onClick={handleSendComment} disabled={commentStatus !== 'idle'} className="flex-1 bg-blue-600 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50">
                {commentStatus === 'sending' ? <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : commentStatus === 'sent' ? <span className="material-symbols-outlined">check_circle</span> : "Enviar"}
              </button>
              <button onClick={() => setShowCommentBox(false)} className="px-4 bg-white text-slate-400 font-bold h-12 rounded-xl border border-slate-100">Cancelar</button>
            </div>
          </div>
        )}

        <div className="h-[1px] w-full bg-slate-100 mb-10"></div>

        <section ref={commentSectionRef} className="mb-16 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black text-slate-900 font-display">Discussão</h3>
            <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full">{rootComments.length} posts</span>
          </div>
          
          <div className="space-y-6">
            {rootComments.map(comment => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                allComments={comments} 
                onReply={handleReply} 
                onLike={onLikeComment}
              />
            ))}
            {rootComments.length === 0 && (
              <div className="text-center py-12 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest italic">Inicie a discussão!</p>
              </div>
            )}
          </div>
        </section>

        <div 
          onClick={handleComplete}
          className="w-full bg-[#135bec] p-8 rounded-[32px] flex items-center justify-between group cursor-pointer active:scale-[0.98] transition-transform shadow-xl shadow-blue-600/20 mb-10"
        >
          <div className="text-left">
            <span className="text-[11px] font-black text-white/60 uppercase tracking-widest block mb-2">PRONTO PARA O PRÓXIMO?</span>
            <p className="text-2xl font-black text-white font-display leading-tight tracking-tight">Marcar como lido e<br/>voltar ao início</p>
          </div>
          <div className="size-14 bg-white/20 rounded-full flex items-center justify-center text-white group-hover:translate-x-1 transition-transform border border-white/20">
            <span className="material-symbols-outlined text-[32px]">arrow_forward</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AprofundarDetail;
