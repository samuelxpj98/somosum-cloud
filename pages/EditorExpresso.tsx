import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Expresso } from '../types';

interface EditorExpressoProps {
  onPublish: (expresso: Expresso) => void;
  userPosts: Expresso[];
  isDarkMode?: boolean;
}

const CATEGORY_SUGGESTIONS = [
  { label: 'FÉ E CIÊNCIA', icon: 'science', color: 'text-blue-600' },
  { label: 'EVIDÊNCIAS', icon: 'history_edu', color: 'text-amber-700' },
  { label: 'FÉ E CULTURA', icon: 'theater_comedy', color: 'text-purple-600' },
  { label: 'SEXUALIDADE', icon: 'favorite', color: 'text-rose-500' },
  { label: 'IDENTIDADE', icon: 'fingerprint', color: 'text-indigo-600' },
  { label: 'DOR', icon: 'sentiment_very_dissatisfied', color: 'text-red-600' },
  { label: 'BATISTA', icon: 'water_drop', color: 'text-cyan-600' },
];

const LOCAL_COVERS = [
  "https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=800&auto=format",
  "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=800&auto=format",
  "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=800&auto=format",
  "https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?q=80&w=800&auto=format",
  "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=800&auto=format",
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format",
  "https://images.unsplash.com/photo-1490818387583-1baba5e638af?q=80&w=800&auto=format",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format",
  "https://images.unsplash.com/photo-1534067783941-51c9c2394834?q=80&w=800&auto=format",
  "https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=800&auto=format",
  "https://images.unsplash.com/photo-1493612276216-ee3925520721?q=80&w=800&auto=format",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800&auto=format",
  "https://images.unsplash.com/photo-1532012197367-e37802001712?q=80&w=800&auto=format",
  "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?q=80&w=800&auto=format",
  "https://images.unsplash.com/photo-1494059458055-385050f2409d?q=80&w=800&auto=format"
];

const EditorExpresso: React.FC<EditorExpressoProps> = ({ onPublish, userPosts, isDarkMode }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('FÉ E CIÊNCIA');
  const [analogyTitle, setAnalogyTitle] = useState('A ANALOGIA');
  const [analogyText, setAnalogyText] = useState('');
  const [content, setContent] = useState('');
  const [bibleRef, setBibleRef] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isClassic, setIsClassic] = useState(false);
  const [isSelectingImage, setIsSelectingImage] = useState(false);

  useEffect(() => {
    if (id) {
      const post = userPosts.find(p => p.id === id);
      if (post) {
        setTitle(post.title);
        setCategory(post.categoryFull || post.category);
        setAnalogyTitle(post.analogy?.title || 'A ANALOGIA');
        setAnalogyText(post.analogy?.text || post.subtitle || '');
        setContent(post.content);
        setBibleRef(post.bibleReference || '');
        setImagePreview(post.imageUrl);
        setIsClassic(!!post.isClassic);
      }
    }
  }, [id, userPosts]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const generateLocalImage = () => {
    setIsSelectingImage(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * LOCAL_COVERS.length);
      setImagePreview(LOCAL_COVERS[randomIndex]);
      setIsSelectingImage(false);
    }, 600);
  };

  const handleSave = (status: 'draft' | 'pending' | 'published') => {
    const newExpresso: Expresso = {
      id: id || Date.now().toString(),
      category: category.split(' ')[0],
      categoryFull: category,
      title: title || 'Sem Título',
      subtitle: analogyText || title.substring(0, 40),
      imageUrl: imagePreview || LOCAL_COVERS[0],
      content,
      readingTime: '1.5 MIN',
      isClassic: isClassic,
      bibleReference: bibleRef,
      status: status,
      tags: [category.toLowerCase()],
      analogy: { 
        icon: CATEGORY_SUGGESTIONS.find(c => c.label === category)?.icon || "bolt", 
        title: analogyTitle || 'A ANALOGIA', 
        text: analogyText 
      }
    };
    onPublish(newExpresso);
    navigate('/editor');
  };

  return (
    <div className={`min-h-screen pb-32 page-enter ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}`}>
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setIsCategoryModalOpen(false)}></div>
          <div className={`relative w-full max-w-md rounded-[40px] shadow-2xl p-8 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
             <h3 className="text-xl font-black mb-6">Escolher Tema</h3>
             <div className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto no-scrollbar">
                {CATEGORY_SUGGESTIONS.map(s => (
                  <button key={s.label} onClick={() => { setCategory(s.label); setIsCategoryModalOpen(false); }} className={`p-5 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${category === s.label ? 'border-blue-600 bg-blue-50/10' : (isDarkMode ? 'border-slate-800 bg-slate-800' : 'border-slate-50 bg-white')}`}>
                    <span className={`material-symbols-outlined text-[28px] ${s.color}`}>{s.icon}</span>
                    <p className="text-[10px] font-black uppercase">{s.label}</p>
                  </button>
                ))}
             </div>
          </div>
        </div>
      )}

      <header className={`sticky top-0 z-50 flex items-center justify-between px-6 py-6 border-b ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-50'}`}>
        <button onClick={() => navigate('/editor')} className="text-slate-400"><span className="material-symbols-outlined">arrow_back</span></button>
        <h1 className="text-lg font-black">{id ? 'Editar' : 'Novo'} Expresso</h1>
        <div className="w-10"></div>
      </header>

      <main className="p-6 space-y-8">
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capa do Post</h3>
            <button 
              onClick={generateLocalImage} 
              disabled={isSelectingImage} 
              className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <span className={`material-symbols-outlined text-sm ${isSelectingImage ? 'animate-spin' : ''}`}>refresh</span>
              {isSelectingImage ? 'Sorteando...' : 'Sortear Capa Local'}
            </button>
          </div>
          <div onClick={() => fileInputRef.current?.click()} className={`w-full aspect-[16/9] border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all relative ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-blue-100 bg-slate-50'}`}>
            {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" alt="Capa" /> : <span className="material-symbols-outlined text-3xl opacity-20">add_photo_alternate</span>}
            <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Pergunta Central</h3>
          <textarea placeholder="Qual sua dúvida hoje?" className={`w-full h-24 p-6 rounded-[28px] font-black text-xl border-none focus:ring-4 focus:ring-blue-500/10 transition-all resize-none ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900 shadow-inner'}`} value={title} onChange={e => setTitle(e.target.value)} />
        </section>

        <section className="space-y-3">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Explicação Completa</h3>
          <textarea placeholder="Desenvolva a resposta aqui..." className={`w-full h-56 p-6 rounded-[32px] border-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm leading-relaxed font-medium ${isDarkMode ? 'bg-slate-900 text-slate-300' : 'bg-slate-50 text-slate-700 shadow-inner'}`} value={content} onChange={e => setContent(e.target.value)} />
        </section>

        <div className="flex gap-4 pt-4">
          <button onClick={() => handleSave('draft')} className={`flex-1 h-16 rounded-[24px] font-black uppercase text-[10px] tracking-widest ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>Rascunho</button>
          <button onClick={() => handleSave('published')} className="flex-[2] h-16 bg-blue-600 text-white rounded-[24px] font-black uppercase text-[11px] tracking-widest shadow-2xl flex items-center justify-center gap-2 active:scale-95 transition-all">Publicar Expresso</button>
        </div>
      </main>
    </div>
  );
};

export default EditorExpresso;