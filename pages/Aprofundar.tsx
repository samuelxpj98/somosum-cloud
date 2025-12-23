
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Expresso, AppContent } from '../types';

interface AprofundarProps {
  userPosts: Expresso[];
  readPostIds: string[];
  content: any; 
}

export const FIXED_CATEGORIES = [
  { label: 'Todos', icon: 'all_inclusive' },
  { label: 'Fé e Ciência', icon: 'science' },
  { label: 'Evidências', icon: 'history_edu' },
  { label: 'Fé e Cultura', icon: 'theater_comedy' },
  { label: 'Sexualidade', icon: 'favorite' },
  { label: 'Identidade', icon: 'fingerprint' },
  { label: 'Dor', icon: 'sentiment_very_dissatisfied' },
  { label: 'Batista', icon: 'water_drop' }
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
    content: 'A inerrância bíblica é a doutrina de que a Bíblia, em seus manuscritos originais, é isenta de erros em tudo o que afirma. Isso não significa que ela não use metáforas ou linguagem fenomenológica (como dizer que o sol "nasce"), mas que sua verdade é absoluta em questões de fé, história e moral.\n\nA base para essa crença reside no próprio caráter de Deus: se Deus é a Verdade e a Bíblia é soprada por Ele (Teopneustos), logo, a Bíblia deve ser verdadeira. A autoridade da Bíblia não depende da aprovação humana, mas de sua origem divina. Ela é a regra de fé e prática que governa a vida cristã e nos apresenta o plano de salvação de forma clara e infalível.\n\nHistoricamente, a Igreja tem sustentado que as Escrituras são o meio pelo qual Deus se comunica com a humanidade de forma proposicional. Negar a inerrância é, em última instância, questionar se Deus pode ou quer falar a verdade de forma compreensível ao homem.',
    tags: ['Bíblia', 'Evidências'],
    bibleReference: '2 Timóteo 3:16 - Toda a Escritura é divinamente inspirada e proveitosa para o ensino, para a repreensão, para a correção, para a instrução em justiça.',
    analogy: {
      icon: 'map',
      title: 'O Mapa e o Terreno',
      text: 'Imagine um mapa perfeito de uma cidade. Se o mapa diz que há uma ponte, mas você não a vê, o erro não está no mapa, mas na sua visão ou localização. A Bíblia é o mapa infalível de Deus para a realidade.'
    }
  },
  {
    id: '1710000000005',
    category: 'Fé e Ciência',
    categoryFull: 'APOLOGÉTICA • COSMOLOGIA',
    title: 'O Argumento Cosmológico',
    subtitle: 'Entenda como a origem do universo aponta para um criador inteligente através da lógica e ciência.',
    imageUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=800',
    readingTime: '5 min',
    content: 'O argumento cosmológico Kalām postula que: 1. Tudo o que começa a existir tem uma causa. 2. O universo começou a existir. 3. Portanto, o universo tem uma causa.\n\nA ciência moderna corrobora a ideia de que o universo teve um início absoluto no tempo e no espaço. Se o universo teve um início, ele não pode ter se auto-causado, exigindo um agente transcendente fora do tempo.',
    tags: ['Fé e Ciência'],
    bibleReference: 'Gênesis 1:1 - No princípio, criou Deus os céus e a terra.',
    analogy: {
      icon: 'flare',
      title: 'A Explosão Ordenada',
      text: 'Uma explosão em uma gráfica nunca produziria um dicionário. Se o universo "explodiu" no Big Bang e gerou vida e ordem, deve haver uma mente por trás organizando os átomos.'
    }
  }
];

const ArticleCard: React.FC<{ item: Expresso, isRead?: boolean, isDark?: boolean }> = ({ item, isRead, isDark }) => {
  const navigate = useNavigate();
  return (
    <div 
      id={`post-${item.id}`}
      className={`rounded-[32px] overflow-hidden border shadow-sm mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative scroll-mt-32 transition-colors ${
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-50'
      }`}
    >
      <div className="aspect-[16/9] w-full relative overflow-hidden">
        <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.title} />
        {isRead && (
          <div className="absolute top-4 right-4 z-20 bg-emerald-500 text-white flex items-center gap-1 px-3 py-1.5 rounded-full shadow-lg border border-white/20">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Já leu</span>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-100">
            {item.category}
          </div>
          <span className="text-slate-400 text-[10px] font-bold">• {item.readingTime} leitura</span>
        </div>
        <h2 className={`text-xl font-black font-display mb-2 leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.title}</h2>
        <p className={`text-sm leading-relaxed font-medium mb-6 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.subtitle}</p>
        <button 
          onClick={() => navigate(`/aprofundar/${item.id}`)}
          className="w-full h-12 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-600/10 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">menu_book</span>
          Ler Artigo
        </button>
      </div>
    </div>
  );
};

const Aprofundar: React.FC<AprofundarProps> = ({ userPosts, readPostIds, content }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [filter, setFilter] = useState('Todos');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const isDark = content.profile.isDarkMode;

  const allAprofundamentos = useMemo(() => {
    const publishedUserAprofundamentos = userPosts.filter(p => (p.category === 'APROFUNDAMENTO' || p.categoryType === 'APROFUNDAR') && p.status === 'published');
    const sheetAprofundamentos = (content.sheetPosts || []).filter((p: any) => p.categoryType === 'APROFUNDAR');
    return [...publishedUserAprofundamentos, ...sheetAprofundamentos, ...DEEP_DIVE_DATA].sort((a, b) => {
      return b.id.localeCompare(a.id);
    });
  }, [userPosts, content.sheetPosts]);

  const filteredItems = useMemo(() => {
    if (filter === 'Todos') return allAprofundamentos;
    return allAprofundamentos.filter(item => 
      item.category.toLowerCase() === filter.toLowerCase() || 
      item.tags?.some(t => t.toLowerCase() === filter.toLowerCase()) ||
      item.categoryFull?.toLowerCase().includes(filter.toLowerCase())
    );
  }, [filter, allAprofundamentos]);

  const displayedItems = useMemo(() => {
    return showAll ? filteredItems : filteredItems.slice(0, 10);
  }, [filteredItems, showAll]);

  useEffect(() => {
    if (location.hash) {
      setShowAll(true);
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    }
  }, [location.hash]);

  return (
    <div className={`min-h-screen pb-32 relative transition-colors duration-300 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-end p-4">
          <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsMenuOpen(false)}></div>
          <div className={`relative w-64 rounded-3xl shadow-2xl border overflow-hidden animate-in slide-in-from-right-10 zoom-in-95 duration-300 mt-16 ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
          }`}>
            <div className={`p-5 border-b flex justify-between items-center ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50/50 border-slate-50'}`}>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtrar Temas</h3>
              <button onClick={() => setIsMenuOpen(false)} className="text-slate-300 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-2 max-h-[70vh] overflow-y-auto no-scrollbar">
              {FIXED_CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => { setFilter(cat.label); setIsMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${
                    filter === cat.label 
                      ? 'bg-blue-600 text-white' 
                      : (isDark ? 'bg-transparent text-slate-300 hover:bg-slate-700' : 'bg-transparent text-slate-600 hover:bg-slate-50')
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${filter === cat.label ? 'text-white' : 'text-slate-400'}`}>
                    {cat.icon}
                  </span>
                  <span className={`text-xs font-bold uppercase tracking-tight ${filter === cat.label ? 'font-black' : ''}`}>
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <header className={`sticky top-0 z-50 px-6 pt-8 pb-6 border-b flex items-center justify-between transition-colors ${
        isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-100'
      } backdrop-blur-md`}>
        <button onClick={() => navigate('/home')} className={`size-10 rounded-full flex items-center justify-center active:bg-slate-100 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <span className="material-symbols-outlined text-[28px]">arrow_back</span>
        </button>
        <div className="flex flex-col items-center"><h1 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Aprofundar</h1></div>
        <button onClick={() => setIsMenuOpen(true)} className="size-10 flex items-center justify-center"><span className="material-symbols-outlined text-[24px]">filter_list</span></button>
      </header>

      <main className="px-6 pt-8">
        <div className="space-y-2">
          {displayedItems.map(item => (
            <ArticleCard key={item.id} item={item} isRead={readPostIds.includes(item.id)} isDark={isDark} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Aprofundar;
