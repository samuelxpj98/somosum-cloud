
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AppContent, Expresso, UserProfile } from './types';
import Landing from './pages/Landing';
import Home from './pages/Home';
import ExpressoPage from './pages/Expresso';
import ExpressoDetail from './pages/ExpressoDetail';
import Comunidade from './pages/Comunidade';
import Aprofundar from './pages/Aprofundar';
import AprofundarDetail from './pages/AprofundarDetail';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import BottomNav from './components/BottomNav';
import { userService } from './lib/firebase';

const CACHE_KEY = 'somosum_sheets_cache';
const CACHE_EXPIRATION = 30 * 60 * 1000; // 30 minutos

const FALLBACK_DATA: AppContent = {
  branding: { appName: "SOMOSUM", region: "GOIÁS", motto: "Apologética Jovem" },
  landing: { 
    title: "DESPERTE SUA MENTE", 
    description: "Sua dose diária de fé e razão. Um guia para expandir seus conhecimentos e compartilhar sua cosmovisão com autoridade.",
    heroImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1200" 
  },
  expressos: [],
  comments: [],
  profile: {
    id: 'user-' + Math.random().toString(36).substr(2, 9),
    name: "Explorador",
    email: "",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=neutral",
    church: "",
    whatsapp: "",
    education: "",
    isPastor: false,
    isDarkMode: false,
    isProfileComplete: false,
    role: 'user',
    savedPostIds: [],
    likedPostIds: [],
    stats: { daysInRow: 1, savedPosts: 0, writtenPosts: 0 }
  }
};

const ProtectedRoute: React.FC<{ children: React.ReactNode, profile: UserProfile }> = ({ children, profile }) => {
  const location = useLocation();
  if (!profile.isProfileComplete && location.pathname !== '/onboarding' && location.pathname !== '/') {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
};

const SHEET_URLS = [
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTVDakgfBDNrAjigSbsNHuSZaDzDwNtvKYn7liPnycTYYveR1WAbChhahZPFLi4Ywd7IGBItymUbFE4/pub?gid=0&single=true&output=tsv",
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTVDakgfBDNrAjigSbsNHuSZaDzDwNtvKYn7liPnycTYYveR1WAbChhahZPFLi4Ywd7IGBItymUbFE4/pub?gid=922094770&single=true&output=tsv"
];

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<AppContent>(FALLBACK_DATA);
  const [loading, setLoading] = useState(true);
  const [readPostIds, setReadPostIds] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [sheetPosts, setSheetPosts] = useState<Expresso[]>([]);
  const [dynamicMissions, setDynamicMissions] = useState<string[]>([]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const savedProfile = localStorage.getItem('user_profile');
        if (savedProfile) {
          setUserProfile(JSON.parse(savedProfile));
        } else {
          setUserProfile(FALLBACK_DATA.profile);
        }

        const savedReadPosts = localStorage.getItem('read_posts');
        if (savedReadPosts) setReadPostIds(JSON.parse(savedReadPosts));

        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { posts, missions, timestamp } = JSON.parse(cachedData);
          if (Date.now() - timestamp < CACHE_EXPIRATION) {
            setSheetPosts(posts);
            setDynamicMissions(missions);
            setLoading(false);
            fetchSheetData();
            return;
          }
        }
        await fetchSheetData();
      } catch (error) { 
        console.error("Erro na inicialização:", error); 
        setLoading(false);
      }
    };

    const fetchSheetData = async () => {
      const allPosts: Expresso[] = [];
      const allMissions: string[] = [];

      await Promise.all(SHEET_URLS.map(async (url) => {
        try {
          const res = await fetch(url);
          const tsv = await res.text();
          const lines = tsv.split('\n').slice(1);
          const isAprofundarTab = url.includes('gid=922094770');
          const defaultType = isAprofundarTab ? "APROFUNDAR" : "EXPRESSO";

          lines.forEach((line, index) => {
            const parts = line.split('\t').map(p => p.trim());
            if (!parts[0]) return;
            const tipo = parts[7]?.toUpperCase() || defaultType;
            const id = `sheet-${url.split('gid=')[1].split('&')[0]}-${index}`;

            if (tipo === "MISSAO") {
              allMissions.push(parts[1] || parts[0]);
            } else {
              allPosts.push({
                id,
                title: parts[0],
                content: parts[1],
                imageUrl: parts[2] || "https://images.unsplash.com/photo-1504052434569-70ad5836ab65",
                category: parts[3] || "GERAL",
                categoryFull: parts[3],
                subtitle: parts[4] || "",
                readingTime: parts[5] || (isAprofundarTab ? "8 MIN" : "2 MIN"),
                bibleReference: parts[6] || "",
                categoryType: tipo,
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
        } catch (e) { console.error("Erro fetch aba:", e); }
      }));

      if (allPosts.length > 0) {
        setSheetPosts(allPosts);
        setDynamicMissions(allMissions);
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          posts: allPosts,
          missions: allMissions,
          timestamp: Date.now()
        }));
      }
      setLoading(false);
    };

    initializeApp();
  }, []);

  const mergedContent = useMemo(() => ({
    ...data,
    expressos: sheetPosts.filter(p => p.categoryType === 'EXPRESSO'),
    sheetPosts: sheetPosts,
    profile: userProfile || FALLBACK_DATA.profile
  }), [data, userProfile, sheetPosts]);

  const updateProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    localStorage.setItem('user_profile', JSON.stringify(updated));
  };

  const handleLogin = (syncedProfile: UserProfile) => {
    updateProfile(syncedProfile);
    navigate('/home');
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

  if (loading && sheetPosts.length === 0) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Moendo Grãos Teológicos...</p>
      </div>
    </div>
  );

  return (
    <div className={`mx-auto max-w-md min-h-screen shadow-xl relative overflow-x-hidden ${mergedContent.profile.isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
      <Routes>
        <Route path="/" element={<Landing content={mergedContent} onLogin={handleLogin} />} />
        <Route path="/onboarding" element={<Onboarding profile={mergedContent.profile} onUpdate={updateProfile} />} />
        
        <Route path="/home" element={<ProtectedRoute profile={mergedContent.profile}><Home content={mergedContent} missions={dynamicMissions} /></ProtectedRoute>} />
        <Route path="/expresso" element={<ProtectedRoute profile={mergedContent.profile}><ExpressoPage content={mergedContent} readPostIds={readPostIds} /></ProtectedRoute>} />
        <Route path="/expresso/:id" element={<ProtectedRoute profile={mergedContent.profile}><ExpressoDetail content={mergedContent} markAsRead={markAsRead} onToggleSave={toggleSavePost} onToggleLike={toggleLikePost} /></ProtectedRoute>} />
        <Route path="/comunidade" element={<ProtectedRoute profile={mergedContent.profile}><Comunidade content={mergedContent} /></ProtectedRoute>} />
        <Route path="/aprofundar" element={<ProtectedRoute profile={mergedContent.profile}><Aprofundar content={mergedContent} readPostIds={readPostIds} userPosts={sheetPosts} /></ProtectedRoute>} />
        <Route path="/aprofundar/:id" element={<ProtectedRoute profile={mergedContent.profile}><AprofundarDetail content={mergedContent} markAsRead={markAsRead} onToggleSave={toggleSavePost} onToggleLike={toggleLikePost} /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute profile={mergedContent.profile}><Profile profile={mergedContent.profile} onUpdate={updateProfile} readCount={readPostIds.length} userPosts={sheetPosts} /></ProtectedRoute>} />
      </Routes>
      <BottomNav isDarkMode={mergedContent.profile.isDarkMode} profileComplete={mergedContent.profile.isProfileComplete} />
    </div>
  );
};

const App: React.FC = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
