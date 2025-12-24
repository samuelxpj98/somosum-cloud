
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Expresso } from '../types';
import Header from '../components/Header';
import { commentsService } from '../lib/firebase';

export const FIXED_CATEGORIES = [
  { label: 'Todos', icon: 'grid_view' },
  { label: 'Fé e Ciência', icon: 'science' },
  { label: 'Filosofia', icon: 'psychology' },
  { label: 'Teologia', icon: 'menu_book' },
  { label: 'História', icon: 'history_edu' },
  { label: 'Cultura', icon: 'theater_comedy' },
];

const DetailedArticleCard: React.FC<{ item: Expresso, isRead?: boolean, isDark?: boolean }> = ({ item, isRead, isDark }) => {
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => navigate(`/aprofundar/${item.id}`)}
      className={`rounded-[40px] overflow-hidden shadow-2xl mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 relative aspect-[16/11] cursor-pointer group border-4 ${isDark ? 'border-slate-800' : 'border-white'}`}
    >
      <img src={item.imageUrl} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={item.title} />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
      
      {isRead && (
        <div className="absolute top-6 right-6 z-20 bg-emerald-500 text-white flex items-center gap-1.5 px-4 py-2 rounded-full shadow-xl border border-white/20 scale-90">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span className="text-[10px] font-black uppercase tracking-widest">Lido</span>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
            {item.categoryFull || item.category}
          </span>
          <span className="text-white/70 text-[10px] font-black uppercase tracking-widest">
            {item.readingTime}
          </span>
        </div>
        <h2 className="text-[28px] font-[900] text-white font-display mb-2 leading-[1.1] tracking-tighter">
          {item.title}
        </h2>
        {item.subtitle && (
          <p className="text-[13px] font-medium text-white/80 line-clamp-2 italic">
            "{item.subtitle}"
          </p>
        )}
      </div>
    </div>
  );
};

const Aprofundar: React.FC<{ userPosts: Expresso[]; readPostIds: string[]; content: any }> = ({ userPosts, readPostIds, content }) => {
  const [allComments, setAllComments] = useState<any[]>([]);
  const isDark = content.profile.isDarkMode;

  useEffect(() => {
    const unsubscribe = commentsService.getAllConversations(setAllComments);
    return () => unsubscribe();
  }, []);

  const { trending, recent } = useMemo(() => {
    const studies = (content.sheetPosts || []).filter((p: any) => p.categoryType === 'APROFUNDAR');
    
    const scored = studies.map(item => {
      const commentCount = allComments.filter(c => c.postId === item.id).length;
      return { ...item, engagement: commentCount };
    });

    const sortedByEngagement = [...scored].sort((a, b) => b.engagement - a.engagement);
    const trendingItems = sortedByEngagement.slice(0, 2);
    const trendingIds = trendingItems.map(i => i.id);
    
    const recentItems = scored
      .filter(item => !trendingIds.includes(item.id))
      .sort((a, b) => b.id.localeCompare(a.id))
      .slice(0, 4);

    return { trending: trendingItems, recent: recentItems };
  }, [content.sheetPosts, allComments]);

  return (
    <div className={`min-h-screen pb-32 transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <Header content={content} />
      
      <main className="px-6 pt-10 space-y-12 animate-in fade-in duration-700">
        <section>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-[40px] font-[900] font-display tracking-tight leading-none uppercase">Aprofundar</h1>
            <span className="material-symbols-outlined text-blue-600 text-4xl">waves</span>
          </div>
          <p className="text-slate-400 text-[16px] font-medium leading-tight max-w-[340px]">
            Indo além do aroma: estudos densos para uma cosmovisão moída na Verdade.
          </p>
        </section>

        {/* Estudos Alta Moagem Fina */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-orange-500 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
            <h3 className="text-xs font-bold uppercase tracking-[1.5px] text-[#1E293B] dark:text-blue-400">Alta Moagem Fina</h3>
          </div>
          <div className="space-y-6">
            {trending.map(item => (
              <DetailedArticleCard key={item.id} item={item} isRead={readPostIds.includes(item.id)} isDark={isDark} />
            ))}
          </div>
        </section>

        {/* Estudos Recentes */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-blue-500 text-[20px]">schedule</span>
            <h3 className="text-xs font-bold uppercase tracking-[1.5px] text-[#1E293B] dark:text-blue-400">Novas Colheitas</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {recent.map(item => (
              <div key={item.id} onClick={() => window.location.hash = `/aprofundar/${item.id}`} className={`rounded-[32px] overflow-hidden aspect-[4/5.5] relative group border-2 cursor-pointer ${isDark ? 'border-slate-800' : 'border-white'}`}>
                <img src={item.imageUrl} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={item.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                  <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1 block">{item.category}</span>
                  <h4 className="text-[13px] font-[900] font-display text-white leading-tight line-clamp-2">{item.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Aprofundar;
