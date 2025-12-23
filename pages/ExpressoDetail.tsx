
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContent, Comment } from '../types';
import { marked } from 'marked';

interface ExpressoDetailProps {
  content: AppContent;
  comments: Comment[];
  onAddComment: (comment: Comment) => void;
  onLikeComment: (id: string) => void;
  markAsRead: (id: string) => void;
  readPostIds: string[];
}

const CommentItem: React.FC<{
  comment: Comment;
  allComments: Comment[];
  onReply: (parentId: string, text: string) => void;
  onLike: (id: string) => void;
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
    <div className={`flex flex-col gap-3 ${isReply ? 'ml-8 mt-4 border-l-2 border-slate-100 pl-4' : (isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100') + ' p-5 rounded-[24px] border'}`}>
      <div className="flex gap-3">
        <img 
          src={comment.userAvatar} 
          className={`${isReply ? 'size-8' : 'size-10'} rounded-full border-2 ${isDark ? 'border-slate-700' : 'border-white'} shadow-sm object-cover`} 
          alt={comment.userName} 
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://i.pravatar.cc/150?u=fallback";
          }}
        />
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
        <div className={`${isDark ? 'bg-slate-900' : 'bg-white'} p-4 rounded-2xl border border-slate-100 animate-in zoom-in-95 duration-200 mt-2`}>
          <textarea 
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`Responder a ${comment.userName}...`}
            className={`w-full border-none rounded-xl p-3 text-xs focus:ring-1 focus:ring-blue-500/20 min-h-[60px] resize-none mb-3 ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-700'}`}
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
              isDark={isDark}
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

const ExpressoDetail: React.FC<ExpressoDetailProps> = ({ content, comments, onAddComment, onLikeComment, markAsRead, readPostIds }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const item = content.expressos.find(e => e.id === id);
  const [htmlContent, setHtmlContent] = useState('');
  const isDark = content.profile.isDarkMode;
  
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentStatus, setCommentStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [toast, setToast] = useState<{show: boolean, message: string}>({show: false, message: ''});
  const [imageError, setImageError] = useState(false);

  const rootComments = comments.filter(c => c.postId === id && !c.parentId);
  const isRead = id ? readPostIds.includes(id) : false;

  const profile = content.profile;
  const userSocialInfo = `${profile.church || 'SomosUm'} • ${profile.course || profile.education || 'Membro'}`;

  useEffect(() => {
    if (item) {
      setHtmlContent(marked.parse(item.content) as string);
      window.scrollTo(0, 0);
    }
  }, [item]);

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const handleShare = async () => {
    if (!item) return;
    
    const shareData = {
      title: `SOMOSUM: ${item.title}`,
      text: item.subtitle,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      showToast('Link copiado para compartilhar! 🚀');
    }).catch(() => {
      showToast('Erro ao copiar link. Tente novamente.');
    });
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
    navigate(`/expresso#post-${id}`);
  };

  if (!item) return <div className={`p-10 text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>Conteúdo não encontrado.</div>;

  return (
    <div className={`min-h-screen pb-12 relative transition-colors duration-300 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
      {toast.show && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300">
          <span className="material-symbols-outlined text-green-400">check_circle</span>
          <span className="text-sm font-bold whitespace-nowrap">{toast.message}</span>
        </div>
      )}

      <div className="relative w-full aspect-square overflow-hidden bg-slate-100">
        {!imageError ? (
          <img 
            src={item.imageUrl} 
            alt={item.title} 
            className="w-full h-full object-cover" 
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-900 flex flex-col items-center justify-center p-8 text-center">
            <span className="material-symbols-outlined text-white/20 text-[120px] mb-4">image_not_supported</span>
            <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Imagem não reconhecida</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent"></div>
        
        <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
          <button onClick={() => navigate(-1)} className="size-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-white">timer</span>
            <span className="text-[11px] font-bold text-white uppercase tracking-[0.1em]">{item.readingTime}</span>
          </div>
          <button 
            onClick={handleShare}
            className="size-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white active:scale-90 transition-transform"
            aria-label="Compartilhar"
          >
            <span className="material-symbols-outlined">share</span>
          </button>
        </header>
      </div>

      <main className={`px-6 -mt-10 relative z-10 rounded-t-[40px] pt-8 transition-colors duration-300 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
        <div className="flex flex-col items-center mb-6 gap-3">
          <div className={`${isDark ? 'bg-blue-900/40 border-blue-800' : 'bg-blue-50 border-blue-100'} px-6 py-2 rounded-full border`}>
            <span className={`text-[11px] font-[900] uppercase tracking-[0.2em] ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              {item.categoryFull || item.category}
            </span>
          </div>
          {isRead && (
            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full animate-in fade-in slide-in-from-top-2 duration-500">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span className="text-[9px] font-black uppercase tracking-widest">Leitura concluída</span>
            </div>
          )}
        </div>
        
        <h1 className={`text-[32px] font-[900] leading-[1.1] mb-4 tracking-tighter font-display text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {item.title}
        </h1>

        <h2 className="text-xl font-bold text-blue-600 leading-tight mb-8 text-center">
          {item.subtitle}
        </h2>

        {item.analogy && (
          <div className={`${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-blue-50/50 border-blue-100/50'} rounded-[28px] p-6 mb-8 border`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[20px]">{item.analogy.icon}</span>
              </div>
              <span className="text-[11px] font-[900] text-slate-400 uppercase tracking-widest">A ANALOGIA</span>
            </div>
            <h3 className={`text-lg font-black mb-2 font-display ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.analogy.title}</h3>
            <p className={`leading-relaxed font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {item.analogy.text}
            </p>
          </div>
        )}

        <div 
          className={`prose max-w-none leading-relaxed font-medium mb-10 ${isDark ? 'prose-invert text-slate-300' : 'prose-slate text-slate-800'}`}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {item.bibleReference && (
          <div className="mb-10 flex flex-col gap-4">
            <div className={`${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-blue-50/40 border-blue-100/40'} p-5 rounded-[24px] border flex items-center`}>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-blue-600">menu_book</span>
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">REFERÊNCIA BÍBLICA</p>
                   <p className={`text-lg font-bold italic font-display ${isDark ? 'text-blue-400' : 'text-blue-900'}`}>{item.bibleReference}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 mb-12">
          <button onClick={() => setIsLiked(!isLiked)} className={`flex-1 py-4 rounded-[20px] shadow-sm flex flex-col items-center gap-1 active:scale-95 transition-all border ${isLiked ? 'bg-red-50/10 border-red-500/20 text-red-500' : (isDark ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-white border-slate-100 text-slate-400')}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "" }}>favorite</span>
            <span className={`text-[10px] font-bold uppercase ${isLiked ? 'text-red-500' : 'text-slate-500'}`}>Curtir</span>
          </button>
          <button onClick={() => setShowCommentBox(!showCommentBox)} className={`flex-1 py-4 rounded-[20px] shadow-sm flex flex-col items-center gap-1 active:scale-95 transition-all border ${showCommentBox ? 'bg-blue-50/10 border-blue-500/20 text-blue-600' : (isDark ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-white border-slate-100 text-slate-400')}`}>
            <span className="material-symbols-outlined">chat_bubble</span>
            <span className={`text-[10px] font-bold uppercase ${showCommentBox ? 'text-blue-600' : 'text-slate-500'}`}>Comentar</span>
          </button>
          <button onClick={() => { setIsSaved(!isSaved); showToast(isSaved ? 'Removido dos salvos' : 'Salvo na biblioteca! 📚'); }} className={`flex-1 py-4 rounded-[20px] shadow-sm flex flex-col items-center gap-1 active:scale-95 transition-all border ${isSaved ? 'bg-amber-50/10 border-amber-500/20 text-amber-600' : (isDark ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-white border-slate-100 text-slate-400')}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "" }}>bookmark</span>
            <span className={`text-[10px] font-bold uppercase ${isSaved ? 'text-amber-600' : 'text-slate-500'}`}>Salvar</span>
          </button>
        </div>

        {showCommentBox && (
          <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'} mb-8 p-6 rounded-[32px] border animate-in slide-in-from-bottom-4 fade-in duration-300`}>
            <h4 className={`text-sm font-black uppercase tracking-widest mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Seu Comentário</h4>
            <textarea 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="O que você achou desse expresso?"
              className={`w-full h-32 p-4 rounded-2xl border-none shadow-inner text-sm placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none font-medium mb-4 ${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'}`}
            />
            <div className="flex gap-3">
              <button onClick={handleSendComment} disabled={commentStatus !== 'idle'} className="flex-1 bg-blue-600 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50">
                {commentStatus === 'sending' ? <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : commentStatus === 'sent' ? <span className="material-symbols-outlined">check_circle</span> : "Enviar Comentário"}
              </button>
              <button onClick={() => setShowCommentBox(false)} className={`px-4 font-bold h-12 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-white border-slate-100 text-slate-400'}`}>Cancelar</button>
            </div>
          </div>
        )}

        <section className="mb-12 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className={`text-xl font-black font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>Discussão</h3>
            <span className={`text-[10px] font-black px-2 py-1 rounded-md ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>{rootComments.length} tópicos</span>
          </div>
          
          <div className="space-y-6">
            {rootComments.map(comment => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                allComments={comments} 
                onReply={handleReply} 
                onLike={onLikeComment}
                isDark={isDark}
              />
            ))}
            {rootComments.length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-500 text-sm font-medium italic">Sem comentários neste post. Seja o primeiro!</p>
              </div>
            )}
          </div>
        </section>

        <div 
          onClick={handleComplete}
          className="w-full bg-[#135bec] p-8 rounded-[32px] flex items-center justify-between group cursor-pointer active:scale-[0.98] transition-transform shadow-xl shadow-blue-600/20 mb-8"
        >
          <div className="text-left">
            <span className="text-[11px] font-black text-white/60 uppercase tracking-widest block mb-2">PRONTO PARA O PRÓXIMO?</span>
            <p className="text-2xl font-black text-white font-display leading-tight tracking-tight">Marcar como lido e<br/>voltar à lista</p>
          </div>
          <div className="size-14 bg-white/20 rounded-full flex items-center justify-center text-white group-hover:translate-x-1 transition-transform border border-white/20">
            <span className="material-symbols-outlined text-[32px]">arrow_forward</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExpressoDetail;
