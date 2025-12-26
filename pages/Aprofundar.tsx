
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Expresso } from '../types';
import Header from '../components/Header';
import { commentsService } from '../lib/firebase';

export const FIXED_CATEGORIES = [
  { label: 'Todos', icon: 'grid_view' },
  { label: 'Fé e Ciência', icon: 'science' },
  { label: 'História', icon: 'history_edu' },
  { label: 'Filosofia', icon: 'psychology' },
  { label: 'Teologia', icon: 'church' },
  { label: 'Cultura', icon: 'theater_comedy' },
];

const calculateLValue = (text: string): number => {
  if (!text) return 0;
  const urls = text.match(/https?:\/\/[^\s]+/g) || [];
  const bibleRefRegex = /(?:[123]\s)?(?:Gên|Êxo|Lev|Nâm|Deu|Jos|Juí|Rut|1Sm|2Sm|1Rs|2Rs|1Cr|2Cr|Esd|Nee|Est|Jó|Sal|Pro|Ecl|Can|Isa|Jer|Lam|Eze|Dan|Ose|Joe|Amó|Oba|Jon|Miq|Naú|Hab|Sof|Age|Zac|Mal|Mat|Mar|Luc|João|Atos|Rom|1Co|2Co|Gál|Efe|Fil|Col|1Te|2Te|1Ti|2Ti|Tit|Flm|Heb|Tia|1Pe|2Pe|1Jo|2Jo|3Jo|Jud|Apo)\.?\s\d+/gi;
  const hasBibleRef = bibleRefRegex.test(text);

  if (urls.length === 0 && !hasBibleRef) return 0;
  if (hasBibleRef) return 3;

  let maxL = 1;
  urls.forEach(url => {
    const u = url.toLowerCase();
    if (u.includes('.edu') || u.includes('.org') || u.includes('journal') || u.includes('museum')) maxL = 3;
    else if (u.includes('news') || u.includes('somosum') || u.includes('portal')) maxL = Math.max(maxL, 2);
    else if (u.includes('instagram.com') || u.includes('tiktok.com')) maxL = Math.max(maxL, 0);
  });
  return maxL;
};

const getCategoryColor = (category: string) => {
  const cat = category?.toUpperCase() || '';
  if (cat.includes('CIÊNCIA') || cat.includes('RAZÃO')) return 'bg-blue-600';
  if (cat.includes('EVIDÊNCIAS')) return 'bg-amber-700';
  if (cat.includes('VIDA') || cat.includes('DILEMAS')) return 'bg-rose-600';
  if (cat.includes('IDENTIDADE')) return 'bg-indigo-600';
  if (cat.includes('CULTURA') || cat.includes('FÉ')) return 'bg-purple-600';
  return 'bg-slate-600';
};

const DetailedArticleCard: React.FC<{ 
  item: Expresso; 
  isRead?: boolean; 
  isDark?: boolean;
  rank?: number;
}> = ({ item, isRead, isDark, rank }) => {
  const navigate = useNavigate();
  const categoryColor = getCategoryColor(item.categoryFull || item.category);
  
  return (
    <div 
      onClick={() => navigate(`/aprofundar/${item.id}`)}
      className={`rounded-[40px] overflow-hidden shadow-2xl mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 relative aspect-[16/11] cursor-pointer group border-4 ${isDark ? 'border-slate-800' : 'border-white'}`}
    >
      <img src={item.imageUrl} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={item.title} />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
      
      {rank !== undefined && (
        <div className="absolute top-6 left-6 z-30 bg-orange-500 text-white size-10 rounded-2xl flex items-center justify-center font-black text-lg shadow-xl shadow-orange-600/40 border border-white/20 animate-in zoom-in-50 duration-500">
          {rank}
        </div>
      )}

      {isRead && (
        <div className="absolute top-6 right-6 z-20 bg-emerald-500 text-white flex items-center gap-1.5 px-4 py-2 rounded-full shadow-xl border border-white/20 scale-90">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span className="text-[10px] font-black uppercase tracking-widest">Lido</span>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
        <div className="flex items-center gap-3 mb-3">
          <span className={`${categoryColor} text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg`}>
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
  const [showAllRecent, setShowAllRecent] = useState(false);
  const isDark = content.profile.isDarkMode;

  useEffect(() => {
    const unsubscribe = commentsService.getAllConversations(setAllComments);
    return () => unsubscribe();
  }, []);

  const { trending, recent } = useMemo(() => {
    const studies = (content.sheetPosts || []).filter((p: any) => p.categoryType === 'APROFUNDAR');
    const now = Date.now();
    
    const scored = studies.map(item => {
      const postComments = allComments.filter(c => c.postId === item.id);
      const C = postComments.length;
      const L = calculateLValue(item.content);
      const V = 0;
      const T = Math.max(1, (now - (item.hora || now - 86400000)) / 3600000);
      
      // Fórmula APROFUNDAR: R = ((C * 5) + (L * 5) + (V * 1)) / T^1.3
      const score = ((C * 5) + (L * 5) + (V * 1)) / Math.pow(T, 1.3);
      
      return { ...item, score };
    });

    const sortedByScore = [...scored].sort((a, b) => b.score - a.score);
    const trendingItems = sortedByScore.slice(0, 4);
    const trendingIds = trendingItems.map(i => i.id);
    
    const recentItems = scored
      .filter(item => !trendingIds.includes(item.id))
      .sort((a, b) => b.id.localeCompare(a.id));

    return { 
      trending: trendingItems, 
      recent: showAllRecent ? recentItems : recentItems.slice(0, 4) 
    };
  }, [content.sheetPosts, allComments, showAllRecent]);

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

        <section>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-orange-500 text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              <h3 className="text-lg font-black uppercase tracking-[1.5px] text-[#1E293B] dark:text-blue-400">Alta Moagem Fina</h3>
            </div>
            <p className="text-[10px] text-slate-400 font-medium ml-9 italic">
              Autoridade intelectual baseada em referências bíblicas e históricas.
            </p>
          </div>
          <div className="space-y-6">
            {trending.map((item, index) => (
              <DetailedArticleCard key={item.id} item={item} isRead={readPostIds.includes(item.id)} isDark={isDark} rank={index + 1} />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500 text-[20px]">schedule</span>
              <h3 className="text-xs font-bold uppercase tracking-[1.5px] text-[#1E293B] dark:text-blue-400">Novas Colheitas</h3>
            </div>
            {(content.sheetPosts || []).filter((p: any) => p.categoryType === 'APROFUNDAR').length > 4 && (
              <button 
                onClick={() => setShowAllRecent(!showAllRecent)}
                className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:opacity-70 transition-opacity"
              >
                {showAllRecent ? 'Ver Menos' : 'Ver Mais'}
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {recent.map(item => (
              <div key={item.id} onClick={() => window.location.hash = `/aprofundar/${item.id}`} className={`rounded-[32px] overflow-hidden aspect-[4/5.5] relative group border-2 cursor-pointer ${isDark ? 'border-slate-800' : 'border-white'}`}>
                <img src={item.imageUrl} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={item.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                  <span className={`text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1 block`}>
                    {item.category}
                  </span>
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
