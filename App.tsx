
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppContent, Expresso, UserProfile } from './types';
import Landing from './pages/Landing';
import Home from './pages/Home';
import ExpressoPage from './pages/Expresso';
import ExpressoDetail from './pages/ExpressoDetail';
import Comunidade from './pages/Comunidade';
import Aprofundar from './pages/Aprofundar';
import AprofundarDetail from './pages/AprofundarDetail';
import Profile from './pages/Profile';
import BottomNav from './components/BottomNav';

const FALLBACK_DATA: AppContent = {
  branding: { appName: "SOMOSUM", region: "GOIÁS", motto: "Apologética Jovem" },
  landing: { 
    title: "Pronto para começar?", 
    description: "Explore o guia definitivo para entender e compartilhar sua fé com confiança.",
    heroImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1200" 
  },
  expressos: [],
  comments: [],
  profile: {
    name: "Explorador",
    email: "",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=neutral",
    church: "Não informado",
    education: "Não informado",
    isDarkMode: false,
    savedPostIds: [],
    likedPostIds: [],
    stats: { daysInRow: 1, savedPosts: 0, writtenPosts: 0 }
  }
};

// URLs reais fornecidas pelo usuário
const SHEET_URLS = [
  // Aba Expressos (GID 0)
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTVDakgfBDNrAjigSbsNHuSZaDzDwNtvKYn7liPnycTYYveR1WAbChhahZPFLi4Ywd7IGBItymUbFE4/pub?gid=0&single=true&output=tsv",
  // Aba Aprofundar (GID 922094770)
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTVDakgfBDNrAjigSbsNHuSZaDzDwNtvKYn7liPnycTYYveR1WAbChhahZPFLi4Ywd7IGBItymUbFE4/pub?gid=922094770&single=true&output=tsv"
];

const App: React.FC = () => {
  const [data, setData] = useState<AppContent>(FALLBACK_DATA);
  const [loading, setLoading] = useState(true);
  const [readPostIds, setReadPostIds] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [sheetPosts, setSheetPosts] = useState<Expresso[]>([]);
  const [dynamicMissions, setDynamicMissions] = useState<string[]>([]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Carrega Perfil
        const savedProfile = localStorage.getItem('user_profile');
        let initialProfile: UserProfile;
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile);
          initialProfile = { ...parsed, likedPostIds: parsed.likedPostIds || [] };
        } else {
          initialProfile = FALLBACK_DATA.profile;
          localStorage.setItem('user_profile', JSON.stringify(initialProfile));
        }
        setUserProfile(initialProfile);

        // Carrega Posts Lidos
        const savedReadPosts = localStorage.getItem('read_posts');
        if (savedReadPosts) setReadPostIds(JSON.parse(savedReadPosts));

        const allPosts: Expresso[] = [];
        const allMissions: string[] = [];

        await Promise.all(SHEET_URLS.map(async (url) => {
          try {
            const res = await fetch(url);
            const tsv = await res.text();
            const lines = tsv.split('\n').slice(1);
            
            // Identifica o tipo padrão baseado no GID da URL
            const isAprofundarTab = url.includes('gid=922094770');
            const defaultType = isAprofundarTab ? "APROFUNDAR" : "EXPRESSO";

            lines.forEach((line, index) => {
              const parts = line.split('\t').map(p => p.trim());
              if (!parts[0]) return;

              // parts[7] ainda pode sobrescrever o tipo se preenchido manualmente na planilha
              const tipo = parts[7]?.toUpperCase() || defaultType;
              const id = `sheet-${url.split('gid=')[1].split('&')[0]}-${index}`;

              if (tipo === "MISSAO") {
                allMissions.push(parts[1] || parts[0]);
              } else {
                const isClassic = parts[11]?.toUpperCase() === 'TRUE' || parts[11]?.toUpperCase() === 'VERDADEIRO';
                allPosts.push({
                  id: id,
                  title: parts[0],
                  content: parts[1],
                  imageUrl: parts[2] || "https://images.unsplash.com/photo-1504052434569-70ad5836ab65",
                  category: parts[3] || "GERAL",
                  categoryFull: parts[3],
                  subtitle: parts[4] || "",
                  readingTime: parts[5] || (isAprofundarTab ? "8 MIN" : "2 MIN"),
                  bibleReference: parts[6] || "",
                  categoryType: tipo,
                  isClassic: isClassic,
                  tags: [parts[3]?.toLowerCase() || 'geral'],
                  status: 'published',
                  analogy: parts[8] || parts[9] || parts[10] ? {
                    icon: parts[8] || (isAprofundarTab ? "menu_book" : "bolt"),
                    title: parts[9] || (isAprofundarTab ? "Versículo Chave" : "A Analogia"),
                    text: parts[10] || ""
                  } : undefined
                });
              }
            });
          } catch (e) {
            console.warn("Erro ao buscar aba da planilha:", url, e);
          }
        }));

        setSheetPosts(allPosts);
        setDynamicMissions(allMissions);
      } catch (error) { 
        console.error("Erro crítico na inicialização:", error); 
      } finally { 
        setLoading(false); 
      }
    };
    initializeApp();
  }, []);

  const mergedContent = useMemo(() => {
    const currentProfile = userProfile || FALLBACK_DATA.profile;
    return {
      ...data,
      expressos: sheetPosts.filter(p => p.categoryType === 'EXPRESSO'),
      sheetPosts: sheetPosts,
      profile: currentProfile
    };
  }, [data, userProfile, sheetPosts]);

  const updateProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    localStorage.setItem('user_profile', JSON.stringify(updated));
  };

  const toggleSavePost = (id: string) => {
    if (!userProfile) return;
    const isSaved = userProfile.savedPostIds.includes(id);
    const newSavedIds = isSaved ? userProfile.savedPostIds.filter(pid => pid !== id) : [...userProfile.savedPostIds, id];
    updateProfile({ ...userProfile, savedPostIds: newSavedIds, stats: { ...userProfile.stats, savedPosts: newSavedIds.length } });
  };

  const toggleLikePost = (id: string) => {
    if (!userProfile) return;
    const isLiked = userProfile.likedPostIds.includes(id);
    const newLikedIds = isLiked ? userProfile.likedPostIds.filter(pid => pid !== id) : [...userProfile.likedPostIds, id];
    updateProfile({ ...userProfile, likedPostIds: newLikedIds });
  };

  const markAsRead = (id: string) => {
    if (!readPostIds.includes(id)) {
      const newReadPosts = [...readPostIds, id];
      setReadPostIds(newReadPosts);
      localStorage.setItem('read_posts', JSON.stringify(newReadPosts));
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#F1F5F9]">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Moendo Grãos Teológicos...</p>
      </div>
    </div>
  );

  return (
    <Router>
      <div className={`mx-auto max-w-md min-h-screen shadow-xl relative overflow-x-hidden transition-colors duration-300 ${mergedContent.profile.isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
        <Routes>
          <Route path="/" element={<Landing content={mergedContent} />} />
          <Route path="/home" element={<Home content={mergedContent} missions={dynamicMissions} />} />
          <Route path="/expresso" element={<ExpressoPage content={mergedContent} readPostIds={readPostIds} />} />
          <Route path="/expresso/:id" element={<ExpressoDetail content={mergedContent} markAsRead={markAsRead} onToggleSave={toggleSavePost} onToggleLike={toggleLikePost} />} />
          <Route path="/comunidade" element={<Comunidade content={mergedContent} />} />
          <Route path="/aprofundar" element={<Aprofundar content={mergedContent} readPostIds={readPostIds} userPosts={sheetPosts} />} />
          <Route path="/aprofundar/:id" element={<AprofundarDetail content={mergedContent} markAsRead={markAsRead} onToggleSave={toggleSavePost} onToggleLike={toggleLikePost} />} />
          <Route path="/profile" element={<Profile profile={mergedContent.profile} onUpdate={updateProfile} readCount={readPostIds.length} userPosts={sheetPosts} />} />
        </Routes>
        <BottomNav isDarkMode={mergedContent.profile.isDarkMode} />
      </div>
    </Router>
  );
};

export default App;
