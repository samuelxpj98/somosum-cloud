import React, { useEffect, useState, useMemo } from 'react';
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
          <p className={`${isReply ? 'text-xs' : 'text-sm'} leading-relaxed font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{comment.text}</p>
          <div className="flex items-center gap-6 mt-3">
            <button onClick={() => comment.postId && onLike(comment.id, comment.postId)} className={`flex items-center gap-1 active:scale-125 transition-all ${comment.isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}>
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: comment.isLiked ? "'FILL' 1" : "" }}>favorite</span>
              <span className="text-[10px] font-bold">{comment.likes}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExpressoDetail: React.FC<ExpressoDetailProps> = ({ content, comments, onAddComment, onLikeComment, markAsRead, readPostIds, onToggleSave, onToggleLike }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const item = content.expressos.find(e => e.id === id);
  const isDark = content.profile.isDarkMode;
  const isLiked = id ? content.profile.likedPostIds.includes(id) : false;
  const isSaved = id ? content.profile.savedPostIds.includes(id) : false;
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState('');

  const rootComments = comments.filter(c => c.postId === id && !c.parentId);
  
  // Processamento de parágrafos para lidar com o Alt+Enter da planilha
  const formattedContent = useMemo(() => {
    if (!item) return [];
    // Substitui quebras de linha literais "\n" por quebras reais e divide
    return item.content
      .replace(/\\n/g, '\n')
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);
  }, [item]);

  useEffect(() => {
    if (item) window.scrollTo(0, 0);
  }, [item]);

  const handleSendComment = () => {
    if (!commentText.trim() || !id) return;
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
    setCommentText('');
    setShowCommentBox(false);
  };

  if (!item) return <div className="p-10 text-center font-bold">Post não encontrado.</div>;

  return (
    <div className={`min-h-screen pb-12 transition-colors duration-300 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
      <div className="relative w-full aspect-square overflow-hidden bg-slate-100">
        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
        <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
          <button onClick={() => navigate(-1)} className="size-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-sm border border-white/30 active:scale-95"><span className="material-symbols-outlined">arrow_back</span></button>
          <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 text-white text-[11px] font-black tracking-widest border border-white/30">
            <span className="material-symbols-outlined text-[18px]">timer</span> {item.readingTime}
          </div>
        </header>
      </div>

      <main className={`px-6 -mt-10 relative z-10 rounded-t-[40px] pt-8 transition-colors duration-300 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
        <div className="flex flex-col items-center mb-6 gap-3 text-center">
          <div className={`${isDark ? 'bg-blue-900/40 border-blue-800' : 'bg-blue-50 border-blue-100'} px-6 py-2 rounded-full border`}>
            <span className={`text-[11px] font-[900] uppercase tracking-[0.2em] ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{item.categoryFull || item.category}</span>
          </div>
          <h1 className={`text-[32px] font-[900] leading-[1.1] mb-2 tracking-tighter font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.title}</h1>
          <h2 className={`text-xl font-bold leading-tight mb-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{item.subtitle}</h2>
        </div>

        {item.analogy && (
          <div className={`mb-10 p-8 rounded-[32px] border shadow-sm ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20"><span className="material-symbols-outlined">{item.analogy.icon}</span></div>
              <h4 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.analogy.title}</h4>
            </div>
            <p className={`text-base italic font-medium leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>"{item.analogy.text}"</p>
          </div>
        )}

        {/* Renderização robusta de parágrafos */}
        <div className={`space-y-5 mb-10 text-[16px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          {formattedContent.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {item.bibleReference && (
          <div className={`mb-12 p-8 rounded-[32px] border-2 border-dashed flex flex-col items-center text-center gap-4 animate-in fade-in duration-700 ${isDark ? 'bg-blue-900/10 border-blue-800/40' : 'bg-blue-50/50 border-blue-200/50'}`}>
            <span className="material-symbols-outlined text-blue-600 text-4xl">auto_stories</span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 mb-2">Pilar da Fé</p>
              <h4 className={`text-base font-black italic leading-relaxed ${isDark ? 'text-white' : 'text-slate-800'}`}>"{item.bibleReference}"</h4>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 mb-12">
          <button onClick={() => id && onToggleLike(id)} className={`flex-1 py-4 rounded-[20px] flex flex-col items-center gap-1 border transition-all active:scale-95 ${isLiked ? 'text-red-500 border-red-500/20 bg-red-50/5' : 'text-slate-400 border-slate-100'}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "" }}>favorite</span> <span className="text-[10px] font-black uppercase">Amei</span>
          </button>
          <button onClick={() => setShowCommentBox(!showCommentBox)} className={`flex-1 py-4 rounded-[20px] flex flex-col items-center gap-1 border transition-all active:scale-95 ${showCommentBox ? 'text-blue-600 border-blue-600/20 bg-blue-50/5' : 'text-slate-400 border-slate-100'}`}>
            <span className="material-symbols-outlined">chat_bubble</span> <span className="text-[10px] font-black uppercase">Opinar</span>
          </button>
          <button onClick={() => id && onToggleSave(id)} className={`flex-1 py-4 rounded-[20px] flex flex-col items-center gap-1 border transition-all active:scale-95 ${isSaved ? 'text-amber-600 border-amber-500/20 bg-amber-50/5' : 'text-slate-400 border-slate-100'}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "" }}>bookmark</span> <span className="text-[10px] font-black uppercase">Salvar</span>
          </button>
        </div>

        {showCommentBox && (
          <div className={`${isDark ? 'bg-slate-800' : 'bg-slate-50'} mb-8 p-6 rounded-[32px] border border-slate-100 animate-in slide-in-from-top-4 duration-300 shadow-xl`}>
            <textarea value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="O que você achou?" className={`w-full h-32 p-4 rounded-2xl border-none mb-4 resize-none text-sm ${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}`} />
            <button onClick={handleSendComment} className="w-full bg-blue-600 text-white font-black h-14 rounded-2xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all">Publicar</button>
          </div>
        )}

        <section className="mb-12 space-y-6">
          <h3 className={`text-xl font-black font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>Discussão</h3>
          <div className="space-y-6">
            {rootComments.map(comment => (
              <CommentItem key={comment.id} comment={comment} allComments={comments} onReply={()=>{}} onLike={onLikeComment} isDark={isDark} />
            ))}
          </div>
        </section>

        <div onClick={() => { if(id) markAsRead(id); navigate(`/expresso`); }} className="w-full bg-[#135bec] p-8 rounded-[32px] flex items-center justify-between text-white shadow-xl active:scale-95 transition-transform cursor-pointer">
          <div className="text-left"><span className="text-[11px] font-black opacity-60 uppercase block mb-2">Concluído?</span><p className="text-2xl font-black font-display leading-tight">Marcar como lido e voltar</p></div>
          <span className="material-symbols-outlined text-[32px]">arrow_forward</span>
        </div>
      </main>
    </div>
  );
};

export default ExpressoDetail;