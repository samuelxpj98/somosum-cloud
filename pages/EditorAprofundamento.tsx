
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Expresso, ResourceLink } from '../types';
import { FIXED_CATEGORIES } from './Aprofundar';

interface EditorAprofundamentoProps {
  onPublish: (post: Expresso) => void;
  userPosts?: Expresso[];
  isDarkMode?: boolean;
}

const EditorAprofundamento: React.FC<EditorAprofundamentoProps> = ({ onPublish, userPosts = [], isDarkMode }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [category, setCategory] = useState('Fé e Ciência');
  const [title, setTitle] = useState('');
  const [readingTime, setReadingTime] = useState('8');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [keyVerse, setKeyVerse] = useState('');
  const [verseRef, setVerseRef] = useState('');
  const [resources, setResources] = useState<ResourceLink[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  useEffect(() => {
    if (id && userPosts.length > 0) {
      const post = userPosts.find(p => p.id === id);
      if (post) {
        setTitle(post.title);
        setCategory(post.categoryFull || post.category);
        setReadingTime(post.readingTime.split(' ')[0]);
        setImagePreview(post.imageUrl);
        setTimeout(() => { if (contentRef.current) contentRef.current.innerHTML = post.content; }, 50);
        setKeyVerse(post.analogy?.text || '');
        setVerseRef(post.bibleReference || '');
        setResources(post.resources || []);
      }
    }
  }, [id, userPosts]);

  const handleSave = (status: 'draft' | 'pending' | 'published') => {
    const newPost: Expresso = {
      id: id || Date.now().toString(),
      category: 'APROFUNDAMENTO',
      categoryFull: category,
      title: title || 'Sem Título',
      subtitle: title.substring(0, 50) + '...',
      imageUrl: imagePreview || "https://images.unsplash.com/photo-1534067783941-51c9c2394834",
      content: contentRef.current?.innerHTML || '',
      readingTime: `${readingTime} min`,
      isClassic: false,
      bibleReference: verseRef,
      status: status,
      tags: ['estudo', category.toLowerCase()],
      resources: resources,
      analogy: { icon: 'format_quote', title: 'VERSÍCULO CHAVE', text: keyVerse }
    };
    onPublish(newPost);
    navigate('/editor');
  };

  return (
    <div className={`min-h-screen pb-32 transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setIsCategoryModalOpen(false)}></div>
          <div className={`relative w-full max-w-md rounded-[40px] shadow-2xl p-8 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
             <h3 className="text-xl font-black mb-6">Selecione o Tema</h3>
             <div className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto no-scrollbar">
              {FIXED_CATEGORIES.filter(c => c.label !== 'Todos').map(cat => (
                <button key={cat.label} onClick={() => { setCategory(cat.label); setIsCategoryModalOpen(false); }} className={`flex flex-col items-center gap-2 p-5 rounded-3xl border-2 transition-all ${category === cat.label ? 'border-blue-600 bg-blue-50/10' : (isDarkMode ? 'border-slate-800 bg-slate-800' : 'border-slate-50 bg-white')}`}>
                  <span className={`material-symbols-outlined ${category === cat.label ? 'text-blue-600' : 'text-slate-400'}`}>{cat.icon}</span>
                  <span className="text-[10px] font-black uppercase">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <header className={`sticky top-0 z-50 flex items-center justify-between px-6 py-6 border-b transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <button onClick={() => navigate('/editor')} className="text-slate-400"><span className="material-symbols-outlined">arrow_back</span></button>
        <h1 className="text-lg font-black">Estudo Profundo</h1>
        <div className="w-10"></div>
      </header>

      <main className="p-6 space-y-8">
        <textarea value={title} onChange={e => setTitle(e.target.value)} placeholder="Título do estudo..." className={`w-full bg-transparent text-[32px] font-black leading-tight tracking-tighter focus:outline-none resize-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`} rows={2} />
        
        <div ref={contentRef} contentEditable className={`w-full min-h-[300px] p-8 rounded-[32px] border-2 text-base leading-relaxed focus:outline-none ${isDarkMode ? 'bg-slate-900/40 border-slate-800 text-slate-300' : 'bg-white border-slate-50 text-slate-700'}`} />

        <div className="flex gap-4 pt-8">
          <button onClick={() => handleSave('pending')} className="flex-1 h-16 bg-blue-600 text-white rounded-[28px] font-black uppercase text-[11px] tracking-widest shadow-2xl active:scale-95 transition-all">Enviar para Moderação</button>
          <button onClick={() => handleSave('draft')} className="px-6 h-16 bg-slate-100 text-slate-400 rounded-[28px] font-black uppercase text-[10px]">Rascunho</button>
        </div>
      </main>
    </div>
  );
};

export default EditorAprofundamento;
