
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Expresso, AppContent } from '../types';

interface AprofundarProps {
  userPosts: Expresso[];
  readPostIds: string[];
  content: AppContent;
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
    id: '1710000000005',
    category: 'Fé e Ciência',
    categoryFull: 'APOLOGÉTICA • COSMOLOGIA',
    title: 'O Argumento Cosmológico',
    subtitle: 'Entenda como a origem do universo aponta para um criador inteligente através da lógica e ciência.',
    imageUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=800',
    readingTime: '5 min',
    content: 'O argumento cosmológico Kalām é um dos pilares da apologética moderna. Ele postula que: 1. Tudo o que começa a existir tem uma causa. 2. O universo começou a existir. 3. Portanto, o universo tem uma causa.\n\nA ciência moderna, através da Teoria do Big Bang e da Segunda Lei da Termodinâmica, corrobora a ideia de que o universo teve um início absoluto no tempo e no espaço. Se o universo teve um início, ele não pode ter se auto-causado, exigindo um agente transcendente, imaterial e poderoso fora do tempo.',
    tags: ['Fé e Ciência'],
    bibleReference: 'Gênesis 1:1',
    resources: [
      { title: 'Em Guarda', description: 'William Lane Craig explica os argumentos teístas de forma acessível.', type: 'book', url: 'https://www.google.com/search?q=livro+em+guarda+william+lane+craig' },
      { title: 'Reasonable Faith', description: 'Site oficial com debates e artigos científicos sobre o tema.', type: 'link', url: 'https://www.reasonablefaith.org' }
    ]
  },
  {
    id: '1710000000004',
    category: 'Dor',
    categoryFull: 'TEODICEIA • PROBLEMA DO MAL',
    title: 'Deus e o Sofrimento',
    subtitle: 'Uma análise profunda sobre o porquê da dor em um mundo criado por um Deus de amor.',
    imageUrl: 'https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?auto=format&fit=crop&q=80&w=800',
    readingTime: '8 min',
    content: 'A questão do sofrimento é, talvez, a maior barreira intelectual e emocional para a fé. Se Deus é bom, por que não para o mal? Se é poderoso, por que não o impede?\n\nA resposta cristã envolve a compreensão do livre-arbítrio e da queda. Deus criou um mundo onde o amor é possível, e o amor exige a liberdade de escolha. O mal é a ausência ou distorção do bem. Além disso, a Bíblia nos mostra um Deus que não observa o sofrimento de longe, mas entra nele através de Jesus Cristo na cruz.',
    tags: ['Dor'],
    bibleReference: 'João 16:33',
    resources: [
      { title: 'O Problema da Dor', description: 'C.S. Lewis explora a natureza intelectual do sofrimento.', type: 'book', url: 'https://www.google.com/search?q=livro+o+problema+da+dor+cs+lewis' },
      { title: 'Caminhando com Deus na Dor', description: 'Timothy Keller aborda como lidar com a tragédia.', type: 'book', url: 'https://www.google.com/search?q=caminhando+com+deus+na+dor+e+no+sofrimento+keller' }
    ]
  },
  {
    id: '1710000000003',
    category: 'Identidade',
    categoryFull: 'ANTROPOLOGIA • ÉTICA MORAL',
    title: 'A Origem da Moralidade',
    subtitle: 'Valores morais objetivos exigem um legislador moral soberano. De onde vem o nosso senso de justiça?',
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800',
    readingTime: '7 min',
    content: 'Todos nós temos um senso de que certas coisas são realmente erradas e outras realmente certas. Mas se somos apenas o resultado de processos evolucionários cegos, a moralidade seria apenas uma ferramenta de sobrevivência, não uma verdade objetiva.\n\nO argumento moral sugere que a existência de leis morais universais aponta para um Doador da Lei Moral. Sem Deus, o "certo" e o "errado" tornam-se meras preferências culturais ou biológicas.',
    tags: ['Identidade'],
    bibleReference: 'Romanos 2:15',
    resources: [
      { title: 'Mero Cristianismo', description: 'A clássica defesa da moralidade objetiva por C.S. Lewis.', type: 'book', url: 'https://www.google.com/search?q=mero+cristianismo+cs+lewis' },
      { title: 'The Moral Argument', description: 'Vídeo animado detalhando a lógica do argumento moral.', type: 'video', url: 'https://www.youtube.com/watch?v=OxiAikEk2vU' }
    ]
  },
  {
    id: '1710000000002',
    category: 'Fé e Cultura',
    categoryFull: 'SOCIOLOGIA • PÓS-MODERNIDADE',
    title: 'Cristianismo e Modernidade',
    subtitle: 'Como manter os valores cristãos relevantes em uma cultura que muda constantemente?',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800',
    readingTime: '10 min',
    content: 'Vivemos na chamada "modernidade líquida", onde as instituições e verdades absolutas são questionadas. O desafio do cristão hoje não é apenas defender a fé, mas vivê-la de forma que faça sentido em um contexto secularizado.\n\nA cultura não é algo a ser evitado, mas redimido. Precisamos ser como os filhos de Issacar, que conheciam o seu tempo e sabiam o que Israel devia fazer.',
    tags: ['Fé e Cultura'],
    bibleReference: '1 Crônicas 12:32',
    resources: [
      { title: 'A Cidade de Deus', description: 'A obra monumental de Santo Agostinho sobre fé e sociedade.', type: 'book', url: 'https://www.google.com/search?q=a+cidade+de+deus+santo+agostinho' },
      { title: 'Cristianismo e Cultura', description: 'Ensaios de T.S. Eliot sobre a base cristã da civilização.', type: 'book', url: 'https://www.google.com/search?q=notas+para+uma+definicao+de+cultura+ts+eliot' }
    ]
  },
  {
    id: '1710000000001',
    category: 'Evidências',
    categoryFull: 'CRÍTICA TEXTUAL • ARQUEOLOGIA',
    title: 'Manuscritos do Mar Morto',
    subtitle: 'A descoberta arqueológica que confirmou a precisão milenar das Escrituras Sagradas.',
    imageUrl: 'https://images.unsplash.com/photo-1533158326339-7f3cf2404354?auto=format&fit=crop&q=80&w=800',
    readingTime: '6 min',
    content: 'Descobertos in 1947, os Manuscritos do Mar Morto são considerados a maior descoberta arqueológica do século XX. Eles contêm cópias de quase todos os livros do Antigo Testamento, datando de centenas de anos antes de Cristo.\n\nA comparação desses manuscritos com as traduções modernas provou que a Bíblia foi transmitida com uma precisão incrível ao longo de dois mil anos, refutando a ideia de que o texto foi corrompido.',
    tags: ['Evidências'],
    bibleReference: 'Isaías 40:8',
    resources: [
      { title: 'Evidência que Exige um Veredito', description: 'Josh McDowell documenta a confiabilidade histórica da Bíblia.', type: 'book', url: 'https://www.google.com/search?q=evidencia+que+exige+um+veredito+josh+mcdowell' },
      { title: 'Digital Dead Sea Scrolls', description: 'Acesse as imagens em alta resolução dos manuscritos.', type: 'link', url: 'http://dss.collections.imj.org.il/' }
    ]
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

  // Consolida e ordena todos os posts (Usuário + Estáticos)
  const allAprofundamentos = useMemo(() => {
    const publishedUserAprofundamentos = userPosts.filter(p => p.category === 'APROFUNDAMENTO' && p.status === 'published');
    return [...publishedUserAprofundamentos, ...DEEP_DIVE_DATA].sort((a, b) => {
      const idA = isNaN(Number(a.id)) ? 0 : Number(a.id);
      const idB = isNaN(Number(b.id)) ? 0 : Number(b.id);
      if (idA !== idB) return idB - idA;
      return b.id.localeCompare(a.id);
    });
  }, [userPosts]);

  // Aplica o filtro de categoria primeiro
  const filteredItems = useMemo(() => {
    if (filter === 'Todos') return allAprofundamentos;
    return allAprofundamentos.filter(item => 
      item.category.toLowerCase() === filter.toLowerCase() || 
      item.tags?.some(t => t.toLowerCase() === filter.toLowerCase()) ||
      item.categoryFull?.toLowerCase().includes(filter.toLowerCase())
    );
  }, [filter, allAprofundamentos]);

  // Define quais itens mostrar baseado no estado showAll
  const displayedItems = useMemo(() => {
    return showAll ? filteredItems : filteredItems.slice(0, 5);
  }, [filteredItems, showAll]);

  const hasMore = filteredItems.length > 5;

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setIsMenuOpen(false);
    setShowAll(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      {/* Menu de Categorias */}
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
                  onClick={() => handleFilterChange(cat.label)}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all active:scale-95 ${
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
                  {filter === cat.label && <span className="material-symbols-outlined ml-auto text-[16px]">check</span>}
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
        
        <div className="flex flex-col items-center">
          <h1 className={`text-sm font-black font-display tracking-widest uppercase leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>Aprofundamento</h1>
          {filter !== 'Todos' && (
            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-1 bg-blue-50 px-2 py-0.5 rounded-full">{filter}</span>
          )}
        </div>

        <button 
          onClick={() => setIsMenuOpen(true)}
          className={`size-10 rounded-full flex items-center justify-center transition-all ${
            isMenuOpen 
              ? 'bg-blue-600 text-white' 
              : (isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-50 text-slate-600 border border-slate-100 shadow-sm')
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">filter_list</span>
        </button>
      </header>

      <main className="px-6 pt-8">
        <div className="space-y-2">
          {displayedItems.map(item => (
            <ArticleCard key={item.id} item={item} isRead={readPostIds.includes(item.id)} isDark={isDark} />
          ))}
        </div>

        {hasMore && !showAll && (
          <div className="mt-8 mb-12 flex justify-center">
            <button 
              onClick={() => setShowAll(true)}
              className="px-10 py-5 bg-blue-600 text-white rounded-[28px] font-black text-[13px] uppercase tracking-widest shadow-xl shadow-blue-500/10 active:scale-95 transition-all flex items-center gap-3 animate-in zoom-in-95 duration-500"
            >
              <span className="material-symbols-outlined text-[20px]">expand_more</span>
              Ver tudo ({filteredItems.length - 5} posts restantes)
            </button>
          </div>
        )}

        {filteredItems.length === 0 && (
          <div className="py-24 text-center opacity-30 flex flex-col items-center">
            <span className="material-symbols-outlined text-7xl mb-4 text-slate-200">sentiment_dissatisfied</span>
            <p className={`font-black text-xs uppercase tracking-[0.2em] ${isDark ? 'text-white' : 'text-slate-900'}`}>Nenhum artigo encontrado</p>
            <button onClick={() => handleFilterChange('Todos')} className="mt-4 text-blue-600 font-black text-[10px] uppercase underline">Limpar Filtros</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Aprofundar;
