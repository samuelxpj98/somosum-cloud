import React, { useEffect, useMemo, useState } from 'react';
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
  isDark?: boolean;
}> = ({ comment, allComments, onReply, onLike, isReply, isDark }) => {
  return (
    <div className={`flex flex-col gap-3 ${isReply ? 'ml-8 mt-4 border-l-2 border-slate-100 pl-4' : (isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100') + ' p-5 rounded-[24px] border'}`}>
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

const AprofundarDetail: React.FC<AprofundarDetailProps> = ({ content, comments, onAddComment, onLikeComment, markAsRead, readPostIds, onToggleSave, onToggleLike }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isLiked = id ? content.profile.likedPostIds.includes(id) : false;
  const isSaved = id ? content.profile.savedPostIds.includes(id) : false;
  const isDark = content.profile.isDarkMode;
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState('');

  const displayItem = useMemo(() => {
    return DEEP_DIVE_DATA.find(e => e.id === id) || content.expressos.find(e => e.id === id) || (content as any).sheetPosts?.find((e: any) => e.id === id);
  }, [id, content]);

  const rootComments = comments.filter(c => c.postId === id && !c.parentId);

  // Processamento de parágrafos para lidar com o Alt+Enter da planilha
  const formattedContent = useMemo(() => {
    if (!displayItem) return [];
    return displayItem.content
      .replace(/\\n/g, '\n') // Trata quebra de linha literal
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);
  }, [displayItem]);

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

  if (!displayItem) return <div className="p-10 text-center font-bold">Artigo não encontrado.</div>;

  return (
    <div className={`min-h-screen pb-12 transition-colors duration-300 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
      <header className={`sticky top-0 z-50 flex items-center justify-between px-6 py-5 ${isDark ? 'bg-slate-900/80' : 'bg-white/80'} backdrop-blur-md`}>
        <button onClick={() => navigate(-1)} className={`size-10 rounded-full flex items-center justify-center shadow-sm border active:scale-90 transition-transform ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="bg-blue-600/10 px-4 py-2 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-widest">
          {displayItem.readingTime} LEITURA
        </div>
      </header>

      <main className="px-6 py-4">
        <div className="mb-8 text-center flex flex-col items-center gap-3">
           <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
             {displayItem.categoryFull || displayItem.category}
           </span>
           <h1 className={`text-[34px] font-[900] font-display leading-[1.1] tracking-tighter mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
             {displayItem.title}
           </h1>
           {displayItem.subtitle && (
             <h2 className={`text-xl font-bold leading-tight ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
               {displayItem.subtitle}
             </h2>
           )}
        </div>

        <div className="rounded-[32px] overflow-hidden shadow-xl mb-10 border border-slate-100">
          <img src={displayItem.imageUrl} className="w-full h-72 object-cover" alt={displayItem.title} />
        </div>

        {displayItem.analogy && (
          <div className={`mb-10 p-8 rounded-[32px] border shadow-sm ${isDark ? 'bg-slate-800 border-slate-700 shadow-slate-950/20' : 'bg-slate-900 text-white shadow-xl shadow-slate-200/50'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                <span className="material-symbols-outlined text-[20px]">{displayItem.analogy.icon}</span>
              </div>
              <h4 className={`text-sm font-black uppercase tracking-widest text-white`}>
                {displayItem.analogy.title}
              </h4>
            </div>
            <p className={`text-base leading-relaxed font-medium italic ${isDark ? 'text-slate-400' : 'text-slate-100'}`}>
              "{displayItem.analogy.text}"
            </p>
          </div>
        )}

        <div className={`space-y-6 leading-[1.8] text-[17px] mb-12 ${isDark ? 'text-slate-300' : 'text-slate-700 font-medium'}`}>
           {formattedContent.map((paragraph, index) => (
             <p key={index}>{paragraph}</p>
           ))}
        </div>

        {displayItem.bibleReference && (
          <div className={`mb-12 p-8 rounded-[32px] border-2 border-dashed flex flex-col items-center text-center gap-4 animate-in fade-in duration-1000 ${isDark ? 'bg-blue-900/10 border-blue-800/40' : 'bg-blue-50/80 border-blue-200/50'}`}>
            <span className="material-symbols-outlined text-blue-600 text-4xl">auto_stories</span>
            <div>
              <p className="text-[11px] font-[900] uppercase tracking-[0.25em] text-blue-600 mb-2">Pilar da Fé</p>
              <h4 className={`text-lg font-black leading-relaxed italic ${isDark ? 'text-white' : 'text-slate-800'}`}>
                "{displayItem.bibleReference}"
              </h4>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 mb-12">
          <button onClick={() => id && onToggleLike(id)} className={`flex-1 py-4 rounded-[20px] border flex flex-col items-center gap-1 active:scale-95 transition-all ${isLiked ? 'text-red-500 border-red-100 bg-red-50/10' : (isDark ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-white border-slate-100 text-slate-400')}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "" }}>favorite</span> <span className="text-[10px] font-black uppercase">Curtir</span>
          </button>
          <button onClick={() => setShowCommentBox(!showCommentBox)} className={`flex-1 py-4 rounded-[20px] border flex flex-col items-center gap-1 active:scale-95 transition-all ${showCommentBox ? 'text-blue-600 border-blue-100 bg-blue-50/10' : (isDark ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-white border-slate-100 text-slate-400')}`}>
            <span className="material-symbols-outlined">chat_bubble</span> <span className="text-[10px] font-black uppercase">Opinar</span>
          </button>
          <button onClick={() => id && onToggleSave(id)} className={`flex-1 py-4 rounded-[20px] border flex flex-col items-center gap-1 active:scale-95 transition-all ${isSaved ? 'text-amber-600 border-amber-100 bg-amber-50/10' : (isDark ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-white border-slate-100 text-slate-400')}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "" }}>bookmark</span> <span className="text-[10px] font-black uppercase">Salvar</span>
          </button>
        </div>

        {showCommentBox && (
          <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'} mb-12 p-6 rounded-[32px] border animate-in slide-in-from-bottom-4 duration-300 shadow-xl`}>
            <textarea value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Comente aqui..." className={`w-full h-32 p-4 rounded-2xl border-none mb-4 resize-none text-sm ${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}`} />
            <button onClick={handleSendComment} className="w-full bg-blue-600 text-white font-black h-14 rounded-2xl shadow-lg shadow-blue-600/30 active:scale-95 transition-all">Publicar Opinião</button>
          </div>
        )}

        <section className="mb-16 space-y-6">
          <h3 className={`text-xl font-[900] font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>Discussão da Comunidade</h3>
          <div className="space-y-6">
            {rootComments.map(comment => (
              <CommentItem key={comment.id} comment={comment} allComments={comments} onReply={()=>{}} onLike={onLikeComment} isDark={isDark} />
            ))}
          </div>
        </section>

        <div onClick={() => { if(id) markAsRead(id); navigate(`/aprofundar`); }} className="w-full bg-[#135bec] p-8 rounded-[32px] flex items-center justify-between text-white shadow-xl active:scale-[0.98] transition-transform cursor-pointer">
          <div className="text-left"><span className="text-[11px] font-black opacity-60 block mb-2 uppercase tracking-widest">ESTUDO CONCLUÍDO</span><p className="text-2xl font-[900] font-display leading-tight">Finalizar e<br/>voltar à lista</p></div>
          <span className="material-symbols-outlined text-[32px]">check_circle</span>
        </div>
      </main>
    </div>
  );
};

export default AprofundarDetail;