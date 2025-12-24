
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContent, Expresso } from '../types';
import Header from '../components/Header';
import { commentsService } from '../lib/firebase';

const getCategoryColor = (category: string) => {
  const cat = category?.toUpperCase() || '';
  if (cat.includes('CIÊNCIA')) return 'bg-blue-600';
  if (cat.includes('HISTÓRIA')) return 'bg-purple-600';
  if (cat.includes('IDENTIDADE')) return 'bg-amber-500';
  if (cat.includes('CULTURA')) return 'bg-indigo-600';
  return 'bg-blue-600';
};

const Card: React.FC<{ 
  item: Expresso; 
  isGrid?: boolean;
  isRead?: boolean;
  isDark?: boolean;
}> = ({ item, isGrid, isRead, isDark }) => {
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => navigate(`/expresso/${item.id}`)}
      className={`${isGrid ? 'w-full aspect-[4/5.5]' : 'w-full h-56'} relative rounded-[32px] overflow-hidden shadow-lg cursor-pointer group active:scale-[0.97] transition-all duration-500 border border-white/5`}
    >
      <img src={item.imageUrl} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity group-hover:opacity-90"></div>
      
      {isRead && (
        <div className="absolute top-4 right-4 z-20 bg-emerald-500/90 backdrop-blur-md text-white flex items-center gap-1 px-3 py-1 rounded-full shadow-lg border border-white/20 scale-90">
          <span className="material-symbols-outlined text-[14px]">check</span>
          <span className="text-[9px] font-black uppercase tracking-tighter">Lido</span>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className={`${getCategoryColor(item.category)} text-white px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-sm`}>
            {item.category}
          </span>
          <span className="text-white/60 text-[8px] font-black uppercase tracking-widest">
            {item.readingTime}
          </span>
        </div>
        <h4 className="text-[15px] font-[900] text-white leading-[1.2] tracking-tight font-display group-hover:translate-y-[-2px] transition-transform">
          {item.title}
        </h4>
      </div>
    </div>
  );
};

const ExpressoPage: React.FC<{ content: AppContent; readPostIds: string[] }> = ({ content, readPostIds }) => {
  const [allComments, setAllComments] = useState<any[]>([]);
  const isDark = content.profile.isDarkMode;

  useEffect(() => {
    const unsubscribe = commentsService.getAllConversations(setAllComments);
    return () => unsubscribe();
  }, []);

  const { trending, recent } = useMemo(() => {
    const expressos = content.expressos;
    
    const scored = expressos.map(item => {
      const postComments = allComments.filter(c => c.postId === item.id);
      return { ...item, engagement: postComments.length };
    });

    const sortedByEngagement = [...scored].sort((a, b) => b.engagement - a.engagement);
    const trendingItems = sortedByEngagement.slice(0, 4);
    const trendingIds = trendingItems.map(i => i.id);
    
    const recentItems = scored
      .filter(item => !trendingIds.includes(item.id))
      .sort((a, b) => b.id.localeCompare(a.id))
      .slice(0, 6);

    return { trending: trendingItems, recent: recentItems };
  }, [content.expressos, allComments]);

  return (
    <div className={`pb-32 min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Header content={content} />
      
      <main className="px-6 space-y-12 mt-10 animate-in fade-in duration-700">
        <section>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-[40px] font-[900] font-display tracking-tight leading-none">Expresso</h1>
            <span className="material-symbols-outlined text-blue-600 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          </div>
          <p className="text-slate-400 text-[16px] font-medium leading-tight max-w-[280px]">
            Doses intensas e rápidas para despertar sua fé no corre do dia a dia.
          </p>
        </section>

        {/* Seção Em Alta */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-orange-500 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
            <h3 className="text-xs font-bold uppercase tracking-[1.5px] text-[#1E293B] dark:text-blue-400">Alta Degustação</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {trending.map(item => (
              <Card key={item.id} item={item} isGrid isRead={readPostIds.includes(item.id)} isDark={isDark} />
            ))}
          </div>
        </section>

        {/* Seção Recentes */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-blue-500 text-[20px]">schedule</span>
            <h3 className="text-xs font-bold uppercase tracking-[1.5px] text-[#1E293B] dark:text-blue-400">Moídos na Hora</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {recent.map(item => (
              <Card key={item.id} item={item} isGrid isRead={readPostIds.includes(item.id)} isDark={isDark} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ExpressoPage;
