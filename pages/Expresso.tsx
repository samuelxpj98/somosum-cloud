
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContent, Expresso, Comment } from '../types';
import Header from '../components/Header';

interface ExpressoProps {
  content: AppContent;
  comments: Comment[];
  onAddComment: (comment: Comment) => void;
  onLikeComment: (id: string) => void;
  readPostIds: string[];
}

const getCategoryColor = (category: string) => {
  const cat = category?.toUpperCase() || '';
  if (cat.includes('CIÊNCIA')) return 'bg-blue-600';
  if (cat.includes('DOR')) return 'bg-red-500';
  if (cat.includes('IDENTIDADE')) return 'bg-amber-500';
  if (cat.includes('HISTÓRIA')) return 'bg-purple-600';
  return 'bg-slate-500';
};

const Card: React.FC<{ 
  item: Expresso; 
  isGrid?: boolean;
  isRead?: boolean;
}> = ({ item, isGrid, isRead }) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      ref={cardRef}
      id={`post-${item.id}`}
      onClick={() => navigate(`/expresso/${item.id}`)}
      className={`${isGrid ? 'w-full aspect-[4/5]' : 'w-full h-48'} relative rounded-[24px] overflow-hidden shadow-sm cursor-pointer group active:scale-[0.98] transition-all duration-500 scroll-mt-24 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <img 
        src={item.imageUrl} 
        alt={item.title} 
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
        onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1504052434569-70ad5836ab65"; }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
      
      {isRead && (
        <div className="absolute top-3 right-3 z-20 bg-emerald-500 text-white flex items-center gap-1 px-2 py-1 rounded-full shadow-lg border border-white/20 animate-in zoom-in duration-300">
          <span className="material-symbols-outlined text-[12px]">check_circle</span>
          <span className="text-[8px] font-black uppercase tracking-tighter">Lido</span>
        </div>
      )}

      <div className="absolute bottom-4 left-4 right-4 z-10">
        <span className={`px-2 py-0.5 rounded text-[8px] font-black text-white uppercase tracking-wider mb-2 inline-block ${getCategoryColor(item.category)}`}>
          {item.category}
        </span>
        <h4 className="text-[14px] font-[800] text-white leading-tight tracking-tight font-display line-clamp-2">
          {item.title}
        </h4>
      </div>
    </div>
  );
};

const TrendingCommentItem: React.FC<{
  comment: Comment;
  allComments: Comment[];
  onReply: (parentId: string, text: string, postId?: string) => void;
  onLike: (id: string) => void;
  isDark?: boolean;
}> = ({ comment, allComments, onReply, onLike, isDark }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  
  const replies = allComments.filter(c => c.parentId === comment.id);

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    onReply(comment.id, replyText, comment.postId);
    setReplyText('');
    setIsReplying(false);
    setShowReplies(true);
  };

  return (
    <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} p-5 rounded-[24px] shadow-sm border flex flex-col gap-4 animate-in slide-in-from-top-4 duration-500`}>
      <div className="flex gap-4">
        <img 
          src={comment.userAvatar} 
          className="size-10 rounded-full border-2 border-slate-50 shadow-sm flex-shrink-0 object-cover" 
          alt={comment.userName} 
          onError={(e) => { (e.target as HTMLImageElement).src = "https://api.dicebear.com/7.x/avataaars/svg?seed=neutral"; }}
        />
        <div className="flex-1 space-y-1">
          <div className="flex justify-between items-start">
            <div>
              <h5 className={`text-xs font-black font-display ${isDark ? 'text-white' : 'text-slate-800'}`}>{comment.userName}</h5>
              <p className="text-[10px] text-slate-400 font-medium">
                {comment.postId ? `Post #${comment.postId}` : comment.userInfo}
              </p>
            </div>
            <span className="text-[9px] text-slate-300 font-bold">{comment.time}</span>
          </div>
          <p className={`text-sm leading-relaxed font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {comment.text}
          </p>
          <div className="flex items-center gap-6 pt-2">
            <button 
              onClick={() => onLike(comment.id)}
              className={`flex items-center gap-1.5 transition-all active:scale-125 ${comment.isLiked ? 'text-red-500 font-bold' : 'text-slate-400 font-medium hover:text-red-500'}`}
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: comment.isLiked ? "'FILL' 1" : "" }}>favorite</span>
              <span className="text-xs">{comment.likes}</span>
            </button>
            <button 
              onClick={() => setIsReplying(!isReplying)}
              className={`flex items-center gap-1.5 transition-colors ${isReplying ? 'text-blue-600 font-bold' : 'text-slate-400 font-medium hover:text-blue-500'}`}
            >
              <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
              <span className="text-xs uppercase tracking-wider">Responder</span>
            </button>
          </div>
        </div>
      </div>

      {isReplying && (
        <div className={`${isDark ? 'bg-slate-700/50' : 'bg-slate-50'} p-4 rounded-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200`}>
          <textarea 
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`Responder a ${comment.userName}...`}
            className={`w-full border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/10 min-h-[80px] resize-none mb-3 font-medium ${isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-700'}`}
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsReplying(false)} className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase">Cancelar</button>
            <button onClick={handleSendReply} className="px-5 py-2 bg-blue-600 text-white text-[10px] font-black rounded-lg uppercase tracking-widest shadow-md active:scale-95 transition-transform">Enviar</button>
          </div>
        </div>
      )}

      {replies.length > 0 && !showReplies && (
        <button 
          onClick={() => setShowReplies(true)}
          className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest ml-14 hover:opacity-70 transition-opacity"
        >
          <div className="h-[1px] w-6 bg-blue-100"></div>
          Ver {replies.length} {replies.length === 1 ? 'resposta' : 'respostas'}
        </button>
      )}

      {showReplies && (
        <div className="ml-10 space-y-4 animate-in slide-in-from-top-2 duration-300">
          {replies.map(reply => (
            <div key={reply.id} className={`flex gap-3 border-l-2 pl-4 py-1 ${isDark ? 'border-slate-700' : 'border-slate-50'}`}>
              <img src={reply.userAvatar} className="size-8 rounded-full border border-slate-100 object-cover" alt={reply.userName} onError={(e) => { (e.target as HTMLImageElement).src = "https://api.dicebear.com/7.x/avataaars/svg?seed=neutral"; }} />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                   <h6 className={`text-[11px] font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{reply.userName}</h6>
                   <button 
                    onClick={() => onLike(reply.id)}
                    className={`flex items-center gap-1 active:scale-125 transition-all ${reply.isLiked ? 'text-red-500' : 'text-slate-300'}`}
                   >
                     <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: reply.isLiked ? "'FILL' 1" : "" }}>favorite</span>
                     <span className="text-[10px] font-bold">{reply.likes}</span>
                   </button>
                </div>
                <p className={`text-[13px] leading-snug ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{reply.text}</p>
              </div>
            </div>
          ))}
          <button 
            onClick={() => setShowReplies(false)}
            className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2"
          >
            Ocultar respostas
          </button>
        </div>
      )}
    </div>
  );
};

const ExpressoPage: React.FC<ExpressoProps> = ({ content, comments, onAddComment, onLikeComment, readPostIds }) => {
  const [filter, setFilter] = useState<'high' | 'classic' | null>(null);
  const [showAllTrending, setShowAllTrending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = content.profile.isDarkMode;

  const profile = content.profile;
  const userSocialInfo = `${profile.church || 'SomosUm'} • ${profile.course || profile.education || 'Membro'}`;

  // Combina e ordena os posts
  const sortedInHigh = useMemo(() => {
    return content.expressos
      .filter(e => e.isClassic === false || e.isClassic === undefined || e.isClassic === null)
      .sort((a, b) => b.id.localeCompare(a.id));
  }, [content.expressos]);

  const sortedClassics = useMemo(() => {
    return content.expressos
      .filter(e => e.isClassic === true)
      .sort((a, b) => b.id.localeCompare(a.id));
  }, [content.expressos]);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    }
  }, [location]);

  const activeItems = filter === 'high' ? sortedInHigh : sortedClassics;

  const sortedTrendingComments = useMemo(() => {
    return comments.filter(c => !c.parentId).sort((a, b) => {
      const aScore = a.likes + (comments.filter(c => c.parentId === a.id).length * 2);
      const bScore = b.likes + (comments.filter(c => c.parentId === b.id).length * 2);
      return bScore - aScore;
    });
  }, [comments]);

  const trendingToDisplay = showAllTrending 
    ? sortedTrendingComments 
    : sortedTrendingComments.slice(0, 2);

  const handleReply = (parentId: string, text: string, postId?: string) => {
    const newReply: Comment = {
      id: Date.now().toString(),
      userName: profile.name,
      userAvatar: profile.avatarUrl,
      userInfo: userSocialInfo,
      text: text,
      likes: 0,
      time: "Agora",
      postId: postId,
      parentId: parentId
    };
    onAddComment(newReply);
  };

  return (
    <div className={`pb-32 min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Header content={content} />
      
      <main className="px-6 space-y-8 mt-4">
        {filter ? (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
              <button onClick={() => setFilter(null)} className={`size-10 rounded-full shadow-sm flex items-center justify-center border active:scale-90 transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-900'}`}>
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <div>
                <h1 className="text-2xl font-[900] font-display tracking-tight">
                  {filter === 'high' ? 'Perguntas em Alta' : 'Perguntas Clássicas'}
                </h1>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Visualizando Todos ({activeItems.length})</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {activeItems.map(item => (
                <Card key={item.id} item={item} isGrid isRead={readPostIds.includes(item.id)} />
              ))}
            </div>
          </section>
        ) : (
          <>
            <section className="animate-in fade-in duration-700">
              <h1 className="text-[36px] font-[900] font-display tracking-tight leading-none mb-2">Expresso do Dia</h1>
              <p className="text-slate-400 text-[15px] font-medium">Respostas rápidas para sua fé.</p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-[800] font-display">Perguntas em Alta</h3>
                {sortedInHigh.length > 4 && (
                   <button onClick={() => setFilter('high')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-full">Ver todos</button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {sortedInHigh.slice(0, 4).map(item => (
                  <Card key={item.id} item={item} isGrid isRead={readPostIds.includes(item.id)} />
                ))}
                {sortedInHigh.length === 0 && (
                   <div className="col-span-2 py-12 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-2 border-dashed border-slate-200 rounded-[32px]">Nada em alta hoje</div>
                )}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-[800] font-display">Perguntas Clássicas</h3>
                {sortedClassics.length > 4 && (
                   <button onClick={() => setFilter('classic')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-full">Ver todos</button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {sortedClassics.slice(0, 4).map(item => (
                  <Card key={item.id} item={item} isGrid isRead={readPostIds.includes(item.id)} />
                ))}
                {sortedClassics.length === 0 && (
                   <div className="col-span-2 py-12 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-2 border-dashed border-slate-200 rounded-[32px]">Sem clássicos no momento</div>
                )}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                   <h3 className="text-lg font-[800] font-display">Discussões</h3>
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">O que os jovens estão falando</span>
                </div>
                {sortedTrendingComments.length > 2 && (
                  <button 
                    onClick={() => setShowAllTrending(!showAllTrending)}
                    className="text-[10px] font-black text-blue-600 uppercase tracking-widest"
                  >
                    {showAllTrending ? 'Ver menos' : 'Ver tudo'}
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {trendingToDisplay.map(comment => (
                  <TrendingCommentItem 
                    key={comment.id} 
                    comment={comment} 
                    allComments={comments} 
                    onReply={handleReply} 
                    onLike={onLikeComment}
                    isDark={isDark}
                  />
                ))}
                {sortedTrendingComments.length === 0 && (
                  <div className={`p-8 rounded-[32px] text-center border-2 border-dashed ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic">Inicie uma discussão!</p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default ExpressoPage;
