
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContent, Expresso } from '../types';
import Header from '../components/Header';
import { commentsService } from '../lib/firebase';
import { getCategoryColor } from '../App';

const calculateLValue = (text: string): number => {
  if (!text) return 0;
  const urls: string[] = text.match(/https?:\/\/[^\s]+/g) || [];
  const bibleRefRegex = /(?:[123]\s)?(?:Gên|Êxo|Lev|Nâm|Deu|Jos|Juí|Rut|1Sm|2Sm|1Rs|2Rs|1Cr|2Cr|Esd|Nee|Est|Jó|Sal|Pro|Ecl|Can|Isa|Jer|Lam|Eze|Dan|Ose|Joe|Amó|Oba|Jon|Miq|Naú|Hab|Sof|Age|Zac|Mal|Mat|Mar|Luc|João|Atos|Rom|1Co|2Co|Gál|Efe|Fil|Col|1Te|2Te|1Ti|2Ti|Tit|Flm|Heb|Tia|1Pe|2Pe|1Jo|2Jo|3Jo|Jud|Apo)\.?\s\d+/gi;
  const hasBibleRef = bibleRefRegex.test(text);

  if (urls.length === 0 && !hasBibleRef) return 0;
  if (hasBibleRef) return 3;

  let maxL = 1;
  urls.forEach(url => {
    const u = url.toLowerCase();
    if (u.includes('edu') || u.includes('org') || u.includes('journal') || u.includes('museum') || u.includes('history')) {
      maxL = 3;
    } else if (u.includes('news') || u.includes('somosum') || u.includes('portal') || u.includes('g1.globo')) {
      maxL = Math.max(maxL, 2);
    }
  });
  return maxL;
};

const Card: React.FC<{ 
  item: Expresso; 
  isGrid?: boolean;
  isRead?: boolean;
  isDark?: boolean;
  rank?: number;
}> = ({ item, isGrid, isRead, isDark, rank }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/expresso/${item.id}`)}
      className={`${isGrid ? 'w-full aspect-[4/5.5]' : 'w-full h-56'} relative rounded-[32px] overflow-hidden shadow-lg cursor-pointer group active:scale-[0.97] transition-all duration-500 border border-white/5 bg-slate-800`}
    >
      <img src={item.imageUrl} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent transition-opacity group-hover:opacity-90"></div>
      
      {rank !== undefined && (
        <div className="absolute top-4 left-4 z-30 bg-orange-500 text-white size-8 rounded-xl flex items-center justify-center font-black shadow-lg shadow-orange-600/40 border border-white/20">
          {rank}
        </div>
      )}

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
        <h4 className="text-[14px] font-[900] text-white leading-tight tracking-tight font-display line-clamp-2 block overflow-hidden">
          {item.title}
        </h4>
      </div>
    </div>
  );
};

const ExpressoPage: React.FC<{ content: AppContent; readPostIds: string[] }> = ({ content, readPostIds }) => {
  const [allComments, setAllComments] = useState<any[]>([]);
  const [showAllRecent, setShowAllRecent] = useState(false);
  const isDark = content.profile.isDarkMode;

  useEffect(() => {
    const unsubscribe = commentsService.getAllConversations(setAllComments);
    return () => unsubscribe();
  }, []);

  const { trending, recent } = useMemo(() => {
    const expressos = content.expressos || [];
    if (expressos.length === 0) return { trending: [], recent: [] };

    const now = Date.now();
    const scored = expressos.map(item => {
      const postComments = allComments.filter(c => c.postId === item.id);
      const C = postComments.length;
      const L = calculateLValue(item.content);
      const postTimestamp = item.timestamp || (now - 86400000);
      
      // Proteção contra divisões por zero ou valores absurdos
      const T_hours = Math.max(1, (now - postTimestamp) / 3600000); 
      
      const rawScore = ((C * 4) + (L * 2)) / Math.pow(T_hours, 1.2);
      const score = (isNaN(rawScore) || !isFinite(rawScore)) ? 0 : rawScore;
      
      return { ...item, score };
    });

    const sortedByScore = [...scored].sort((a, b) => (b.score || 0) - (a.score || 0));
    const trendingItems = sortedByScore.slice(0, 4);
    const trendingIds = trendingItems.map(i => i.id);
    
    const recentItems = scored
      .filter(item => !trendingIds.includes(item.id))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    return { 
      trending: trendingItems, 
      recent: showAllRecent ? recentItems : recentItems.slice(0, 4) 
    };
  }, [content.expressos, allComments, showAllRecent]);

  return (
    <div className={`pb-32 min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Header content={content} />
      
      <main className="px-6 space-y-12 mt-10 animate-in fade-in duration-700">
        <section>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-[40px] font-[900] font-display tracking-tight leading-none uppercase">Expresso</h1>
            <span className="material-symbols-outlined text-blue-600 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          </div>
          <p className="text-slate-400 text-[16px] font-medium leading-tight max-w-[300px]">
            Doses intensas e rápidas para despertar sua fé no corre do dia a dia.
          </p>
        </section>

        {content.expressos.length === 0 ? (
          <section className="py-20 text-center flex flex-col items-center gap-4 opacity-40">
            <span className="material-symbols-outlined text-6xl text-slate-400">coffee_maker</span>
            <div className="space-y-1">
               <p className="text-sm font-black uppercase tracking-widest">Moedor Vazio</p>
               <p className="text-[10px] font-bold">Nenhum Expresso foi publicado ainda.</p>
            </div>
          </section>
        ) : (
          <>
            <section>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-orange-500 text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                  <h3 className="text-lg font-black uppercase tracking-[1.5px] text-[#1E293B] dark:text-blue-400">Alta Degustação</h3>
                </div>
                <p className="text-[10px] text-slate-400 font-medium ml-9 italic">
                  Posts curtos com mais curtidas e comentários do APP
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {trending.map((item, index) => (
                  <Card key={item.id} item={item} isGrid isRead={readPostIds.includes(item.id)} isDark={isDark} rank={index + 1} />
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-500 text-[20px]">schedule</span>
                  <h3 className="text-xs font-bold uppercase tracking-[1.5px] text-[#1E293B] dark:text-blue-400">Moídos na Hora</h3>
                </div>
                {content.expressos.length > 4 && (
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
                  <Card key={item.id} item={item} isGrid isRead={readPostIds.includes(item.id)} isDark={isDark} />
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default ExpressoPage;
