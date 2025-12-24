
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContent } from '../types';
import { commentsService } from '../lib/firebase';

const CommentItem: React.FC<{
  comment: any;
  isDark?: boolean;
}> = ({ comment, isDark }) => {
  return (
    <div className={`p-5 rounded-[24px] border transition-all animate-in fade-in slide-in-from-left-4 duration-300 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
      <div className="flex gap-3">
        <div className="size-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-sm">
          {comment.usuario?.substring(0,1).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <div>
              <h5 className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{comment.usuario}</h5>
              <p className="text-[9px] text-slate-400 font-medium">Comunidade SomosUm</p>
            </div>
            <span className="text-[9px] text-slate-300 font-bold">{comment.time}</span>
          </div>
          <p className={`text-sm leading-relaxed font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{comment.texto}</p>
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
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (!id) return;
    const unsubscribe = commentsService.subscribeToComments(id, (comments) => {
      setRealtimeComments(comments);
    });
    return () => unsubscribe();
  }, [id]);

  const handleSendComment = async () => {
    if (!commentText.trim() || !id) return;
    const newComment = {
      usuario: content.profile.name || "Explorador",
      texto: commentText,
      userAvatar: content.profile.avatarUrl
    };
    setCommentText('');
    setShowCommentBox(false);
    try { await commentsService.addComment(id, newComment); } catch (err) { console.error(err); }
  };

  if (!item) return <div className="p-10 text-center font-bold">Post não encontrado.</div>;

  return (
    <div className={`min-h-screen pb-12 transition-colors duration-300 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
      <header className={`sticky top-0 z-40 flex items-center justify-between px-6 py-5 ${isDark ? 'bg-slate-900/80' : 'bg-white/80'} backdrop-blur-md`}>
        <button onClick={() => navigate(-1)} className={`size-10 rounded-full flex items-center justify-center shadow-sm border active:scale-90 transition-transform ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex gap-2">
          <div className="bg-blue-600/10 px-4 py-2 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-widest">
            {item.readingTime}
          </div>
        </div>
      </header>

      <main className="px-6 py-4">
        {/* Título e Subtítulo (Subtítulo agora é Azul) */}
        <div className="mb-8 text-center flex flex-col items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-700">
           <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
             {item.categoryFull || item.category}
           </span>
           <h1 className={`text-[34px] font-[900] font-display leading-[1.1] tracking-tighter mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
             {item.title}
           </h1>
           {item.subtitle && (
             <p className="text-[15px] font-[800] max-w-[320px] leading-snug italic text-blue-600">
               "{item.subtitle}"
             </p>
           )}
        </div>

        {/* Imagem de Capa */}
        <div className="rounded-[32px] overflow-hidden shadow-xl mb-10 border border-slate-100 animate-in zoom-in-95 duration-700">
          <img src={item.imageUrl} alt={item.title} className="w-full h-72 object-cover" />
        </div>

        {/* Card de Analogia (Antes do Texto) */}
        {item.analogy && item.analogy.text && (
          <div className={`mb-10 p-6 rounded-[32px] border-2 border-dashed relative animate-in slide-in-from-right-4 duration-700 ${isDark ? 'bg-blue-600/5 border-blue-500/20' : 'bg-blue-50/30 border-blue-100'}`}>
            <div className="absolute -top-5 left-6 size-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <span className="material-symbols-outlined text-[20px]">{item.analogy.icon || 'bolt'}</span>
            </div>
            <h4 className="text-blue-600 font-black text-[11px] uppercase tracking-[0.2em] mb-3 mt-2">{item.analogy.title || 'A Analogia'}</h4>
            <p className={`text-[15px] font-bold leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {item.analogy.text}
            </p>
          </div>
        )}

        {/* Texto Principal */}
        <div className={`whitespace-pre-line mb-8 text-[17px] leading-relaxed animate-in fade-in duration-1000 ${isDark ? 'text-slate-300' : 'text-slate-700 font-medium'}`}>
          {item.content.replace(/\\n/g, '\n').trim()}
        </div>

        {/* PILAR DE FÉ (Versículo) - APÓS O TEXTO */}
        {item.bibleReference && (
          <div className={`mb-12 p-8 rounded-[40px] border relative transition-all ${isDark ? 'bg-amber-900/10 border-amber-800/30' : 'bg-amber-50 border-amber-100'}`}>
            <div className="flex items-center gap-3 mb-4">
               <div className="size-8 rounded-lg bg-amber-500 flex items-center justify-center text-white shadow-md">
                 <span className="material-symbols-outlined text-[18px]">menu_book</span>
               </div>
               <h4 className="text-amber-600 font-black text-[11px] uppercase tracking-[0.25em]">Pilar de Fé</h4>
            </div>
            <p className={`text-xl font-black font-display italic leading-tight ${isDark ? 'text-amber-200' : 'text-amber-900'}`}>
              "{item.bibleReference}"
            </p>
          </div>
        )}

        {/* Interações */}
        <div className="flex items-center justify-between gap-4 mb-12">
          <button onClick={() => id && onToggleLike(id)} className={`flex-1 py-4 rounded-[20px] border flex flex-col items-center gap-1 transition-all active:scale-95 ${isLiked ? 'text-red-500 border-red-100 bg-red-50/10' : (isDark ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-white border-slate-100 text-slate-400')}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "" }}>favorite</span> <span className="text-[10px] font-black uppercase">Amei</span>
          </button>
          <button onClick={() => setShowCommentBox(!showCommentBox)} className={`flex-1 py-4 rounded-[20px] border flex flex-col items-center gap-1 transition-all active:scale-95 ${showCommentBox ? 'text-blue-600 border-blue-100 bg-blue-50/10' : (isDark ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-white border-slate-100 text-slate-400')}`}>
            <span className="material-symbols-outlined">chat_bubble</span> <span className="text-[10px] font-black uppercase">Opinar</span>
          </button>
          <button onClick={() => id && onToggleSave(id)} className={`flex-1 py-4 rounded-[20px] border flex flex-col items-center gap-1 transition-all active:scale-95 ${isSaved ? 'text-amber-600 border-amber-100 bg-amber-50/10' : (isDark ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-white border-slate-100 text-slate-400')}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "" }}>bookmark</span> <span className="text-[10px] font-black uppercase">Salvar</span>
          </button>
        </div>

        {showCommentBox && (
          <div className={`${isDark ? 'bg-slate-800' : 'bg-slate-50'} mb-8 p-6 rounded-[32px] border border-slate-100 animate-in slide-in-from-bottom-4 duration-300 shadow-xl`}>
            <textarea value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="O que você achou?" className={`w-full h-32 p-4 rounded-2xl border-none mb-4 resize-none text-sm ${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}`} />
            <button onClick={handleSendComment} className="w-full bg-blue-600 text-white font-black h-14 rounded-2xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all">Publicar</button>
          </div>
        )}

        <section className="mb-12 space-y-4">
          <h3 className={`text-xl font-black font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>Discussão</h3>
          <div className="space-y-4">
            {realtimeComments.length === 0 ? (
               <div className="py-12 text-center opacity-30">
                  <span className="material-symbols-outlined text-4xl mb-2">chat_bubble_outline</span>
                  <p className="text-xs font-black uppercase">Seja o primeiro a opinar</p>
               </div>
            ) : (
              realtimeComments.map(comment => (
                <CommentItem key={comment.id} comment={comment} isDark={isDark} />
              ))
            )}
          </div>
        </section>

        <div onClick={() => { if(id) markAsRead(id); navigate(`/expresso`); }} className="w-full bg-[#135bec] p-8 rounded-[32px] flex items-center justify-between text-white shadow-xl active:scale-95 transition-transform cursor-pointer">
          <div className="text-left"><span className="text-[11px] font-black opacity-60 uppercase block mb-2">Concluído?</span><p className="text-2xl font-black font-display leading-tight">Finalizar e Voltar</p></div>
          <span className="material-symbols-outlined text-[32px]">check_circle</span>
        </div>
      </main>
    </div>
  );
};

export default ExpressoDetail;
