import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Expresso } from '../types';

interface AprofundarProps {
  userPosts: Expresso[];
  readPostIds: string[];
  content: any; 
}

export const FIXED_CATEGORIES = [
  { label: 'Todos', icon: 'apps' },
  { label: 'Fé e Ciência', icon: 'science' },
  { label: 'Evidências', icon: 'history_edu' },
  { label: 'Teologia', icon: 'menu_book' },
  { label: 'Filosofia', icon: 'psychology' },
  { label: 'Cultura', icon: 'theater_comedy' },
];

export const DEEP_DIVE_DATA: Expresso[] = [
  {
    id: '1710000000006',
    category: 'Evidências',
    categoryFull: 'BIBLIOLOGIA • INERRÂNCIA',
    title: 'A Autoridade Inerrante das Escrituras',
    subtitle: 'Por que cremos que a Bíblia é a palavra de Deus inspirada e sem erros em seus originais?',
    imageUrl: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=800',
    readingTime: '10 min',
    content: 'A inerrância bíblica é a doutrina de que a Bíblia, em seus manuscritos originais, é isenta de erros em tudo o que afirma...',
    tags: ['Bíblia', 'Evidências'],
    bibleReference: '2 Timóteo 3:16',
    analogy: {
      icon: 'map',
      title: 'O Mapa e o Terreno',
      text: 'A Bíblia é o mapa infalível de Deus para a realidade.'
    }
  },
  {
    id: '1710000000005',
    category: 'Fé e Ciência',
    categoryFull: 'APOLOGÉTICA • COSMOLOGIA',
    title: 'O Argumento Cosmológico',
    subtitle: 'Entenda como a origem do universo aponta para um criador inteligente.',
    imageUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=800',
    readingTime: '5 min',
    content: 'O argumento cosmológico Kalām postula que: 1. Tudo o que começa a existir tem uma causa...',
    tags: ['Fé e Ciência'],
    bibleReference: 'Gênesis 1:1',
    analogy: {
      icon: 'flare',
      title: 'A Explosão Ordenada',
      text: 'Se o universo gerou vida e ordem, deve haver uma mente por trás organizando os átomos.'
    }
  }
];

// Card detalhado para a visão inicial de destaque
const DetailedArticleCard: React.FC<{ item: Expresso, isRead?: boolean, isDark?: boolean }> = ({ item, isRead, isDark }) => {
  const navigate = useNavigate();
  return (
    <div className={`rounded-[32px] overflow-hidden border shadow-sm mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative transition-colors ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-50'}`}>
      <div className="aspect-[16/9] w-full relative overflow-hidden">
        <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.title} />
        {isRead && (
          <div className="absolute top-4 right-4 z-20 bg-emerald-500 text-white flex items-center gap-1 px-3 py-1.5 rounded-full shadow-lg border border-white/20">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Lido</span>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-100">{item.category}</div>
          <span className="text-slate-400 text-[10px] font-bold">• {item.readingTime}</span>
        </div>
        <h2 className={`text-xl font-black font-display mb-2 leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.title}</h2>
        <button onClick={() => navigate(`/aprofundar/${item.id}`)} className="w-full h-12 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
          Ler Artigo
        </button>
      </div>
    </div>
  );
};

// Card compacto para a visão em grade
const SmallArticleCard: React.FC<{ item: Expresso, isRead?: boolean, isDark?: boolean }> = ({ item, isRead, isDark }) => {
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => navigate(`/aprofundar/${item.id}`)}
      className={`rounded-[24px] overflow-hidden border shadow-sm flex flex-col animate-in zoom-in-95 duration-500 cursor-pointer active:scale-95 transition-all h-full ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-50'}`}
    >
      <div className="aspect-square w-full relative overflow-hidden">
        <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.title} />
        {isRead && (
          <div className="absolute top-2 right-2 z-10 size-6 bg-emerald-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-lg">
            <span className="material-symbols-outlined text-[14px]">check</span>
          </div>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-1 block">{item.category}</span>
          <h4 className={`text-[12px] font-black font-display leading-tight line-clamp-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.title}</h4>
        </div>
      </div>
    </div>
  );
};

const Aprofundar: React.FC<AprofundarProps> = ({ userPosts, readPostIds, content }) => {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  const isDark = content.profile.isDarkMode;

  const allItems = useMemo(() => {
    const publishedUser = userPosts.filter(p => (p.category === 'APROFUNDAMENTO' || p.categoryType === 'APROFUNDAR') && p.status === 'published');
    const sheetAprofs = (content.sheetPosts || []).filter((p: any) => p.categoryType === 'APROFUNDAR');
    return [...publishedUser, ...sheetAprofs, ...DEEP_DIVE_DATA].sort((a, b) => b.id.localeCompare(a.id));
  }, [userPosts, content.sheetPosts]);

  return (
    <div className={`min-h-screen pb-32 relative transition-colors duration-300 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <header className={`sticky top-0 z-50 px-6 pt-8 pb-6 border-b flex items-center justify-between transition-colors ${
        isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-100'
      } backdrop-blur-md`}>
        <button onClick={() => showAll ? setShowAll(false) : navigate('/home')} className={`size-10 rounded-full flex items-center justify-center active:bg-slate-100 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <span className="material-symbols-outlined text-[28px]">{showAll ? 'grid_view' : 'arrow_back'}</span>
        </button>
        <div className="flex flex-col items-center">
          <h1 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {showAll ? 'Todos os Estudos' : 'Aprofundar'}
          </h1>
        </div>
        <div className="w-10"></div>
      </header>

      <main className="px-6 pt-8">
        {showAll ? (
          <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-500">
            {allItems.map(item => (
              <SmallArticleCard key={item.id} item={item} isRead={readPostIds.includes(item.id)} isDark={isDark} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Em Destaque</p>
            {allItems.slice(0, 4).map(item => (
              <DetailedArticleCard key={item.id} item={item} isRead={readPostIds.includes(item.id)} isDark={isDark} />
            ))}
            
            {allItems.length > 4 && (
              <button 
                onClick={() => setShowAll(true)}
                className={`w-full py-6 rounded-[32px] border-2 border-dashed font-black text-[11px] uppercase tracking-widest shadow-sm active:scale-95 transition-all flex items-center justify-center gap-3 mt-4 ${
                  isDark ? 'bg-slate-800/40 border-slate-700 text-blue-400' : 'bg-white border-blue-100 text-blue-600'
                }`}
              >
                Ver tudo em Grade (2x2)
                <span className="material-symbols-outlined text-sm">expand_more</span>
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Aprofundar;