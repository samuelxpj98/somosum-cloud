
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { userService, commentsService } from './lib/firebase';

const CACHE_KEY = 'somosum_sheets_cache_v4';
const CACHE_EXPIRATION = 2 * 60 * 1000; 

// 12 Cores vibrantes (sem branco/claro)
export const AVATAR_COLORS = [
  '#3B82F6', // Azul
  '#EF4444', // Vermelho
  '#10B981', // Esmeralda
  '#F59E0B', // Âmbar
  '#8B5CF6', // Violeta
  '#F43F5E', // Rosa
  '#6366F1', // Índigo
  '#06B6D4', // Ciano
  '#F97316', // Laranja
  '#14B8A6', // Teal
  '#D946EF', // Fúcsia
  '#475569'  // Grafite
];

const getRandomColor = () => AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

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
    avatarUrl: "", 
    avatarColor: getRandomColor(),
    church: "",
    whatsapp: "",
    education: "",
    isPastor: false,
    isDarkMode: false,
    isProfileComplete: false,
    role: 'user',
    savedPostIds: [],
    likedPostIds: [],
    likedCommentIds: [],
    readPostIds: [],
    loginCount: 1,
    stats: { daysInRow: 1, savedPosts: 0, writtenPosts: 0 }
  }
};

const ProtectedRoute: React.FC<{ children: React.ReactNode, profile: UserProfile }> = ({ children, profile }) => {
  const location = useLocation();
  if (!profile.isProfileComplete && location.pathname !== '/onboarding' && location.pathname !== '/') {
    sessionStorage.setItem('intended_destination', location.pathname);
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
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile>(FALLBACK_DATA.profile);
  const [sheetPosts, setSheetPosts] = useState<Expresso[]>([]);
  const [dynamicMissions, setDynamicMissions] = useState<string[]>([]);

  const handleAccessIncrement = useCallback((profile: UserProfile) => {
    const sessionKey = 'app_access_incremented_' + profile.id;
    if (!sessionStorage.getItem(sessionKey)) {
      const updatedProfile = {
        ...profile,
        loginCount: (profile.loginCount || 0) + 1,
        lastLoginDate: Date.now(),
        avatarColor: profile.avatarColor || getRandomColor()
      };
      
      setUserProfile(updatedProfile);
      localStorage.setItem('user_profile', JSON.stringify(updatedProfile));
      userService.saveProfile(updatedProfile.id, updatedProfile).catch(console.error);
      sessionStorage.setItem(sessionKey, 'true');
      return updatedProfile;
    }
    return profile;
  }, []);

  const fetchSheetData = async () => {
    const allPosts: Expresso[] = [];
    const allMissions: string[] = [];
    
    await Promise.all(SHEET_URLS.map(async (url) => {
      try {
        const res = await fetch(`${url}&t=${Date.now()}`);
        if (!res.ok) throw new Error("Falha na rede");
        
        const tsvText = await res.text();
        const cleanTsv = tsvText.replace(/^\uFEFF/, '').replace(/\r/g, '');
        const lines = cleanTsv.split('\n').filter(line => line.trim() !== "");
        const rows = lines.slice(1);
        
        const gid = url.split('gid=')[1].split('&')[0];
        const isAprofundarTab = gid === '922094770';

        rows.forEach((line, index) => {
          const parts = line.split('\t').map(p => p.trim());
          if (!parts[0]) return; 

          let tipoRaw = (parts[7] || "").toUpperCase().trim();
          let tipo = "EXPRESSO";
          if (tipoRaw.includes("APROFUNDAR")) tipo = "APROFUNDAR";
          else if (tipoRaw.includes("MISSAO") || tipoRaw.includes("MISSÃO")) tipo = "MISSAO";
          else if (isAprofundarTab) tipo = "APROFUNDAR";

          if (tipo === "MISSAO") {
            allMissions.push(parts[1] || parts[0]);
          } else {
            allPosts.push({
              id: `post-${gid}-${index}-${tipo.toLowerCase()}`,
              title: parts[0],
              content: (parts[1] || "").replace(/\\n/g, '\n'),
              imageUrl: parts[2] || "https://images.unsplash.com/photo-1504052434569-70ad5836ab65",
              category: parts[3] || "GERAL",
              categoryFull: parts[3] || "GERAL",
              subtitle: parts[4] || "",
              readingTime: parts[5] || (tipo === "APROFUNDAR" ? "8 MIN" : "2 MIN"),
              bibleReference: parts[6] || "",
              categoryType: tipo,
              tags: [parts[3]?.toLowerCase() || 'geral'],
              status: 'published'
            });
          }
        });
      } catch (e) {
        console.error("Erro na carga da planilha:", e);
      }
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

  useEffect(() => {
    const initializeApp = async () => {
      const savedProfile = localStorage.getItem('user_profile');
      let profileToUse: UserProfile | null = savedProfile ? JSON.parse(savedProfile) : null;

      if (profileToUse && profileToUse.isProfileComplete) {
        const updated = handleAccessIncrement(profileToUse);
        setUserProfile(updated);

        if (window.location.hash === '#/' || window.location.hash === '' || location.pathname === '/') {
          navigate('/home', { replace: true });
        }
      } else {
        setUserProfile(FALLBACK_DATA.profile);
      }

      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { posts, missions, timestamp } = JSON.parse(cached);
          if (posts && (Date.now() - timestamp < CACHE_EXPIRATION)) {
            setSheetPosts(posts);
            setDynamicMissions(missions);
            setLoading(false);
            fetchSheetData(); 
            return;
          }
        } catch (e) {
          localStorage.removeItem(CACHE_KEY);
        }
      }
      await fetchSheetData();
    };
    initializeApp();
  }, [handleAccessIncrement]);

  const mergedContent = useMemo(() => ({
    ...FALLBACK_DATA,
    expressos: sheetPosts.filter(p => p.categoryType === 'EXPRESSO'),
    sheetPosts: sheetPosts,
    profile: userProfile
  }), [userProfile, sheetPosts]);

  const updateProfile = (updated: Partial<UserProfile>) => {
    const complete = { ...userProfile, ...updated };
    setUserProfile(complete);
    localStorage.setItem('user_profile', JSON.stringify(complete));
    if (complete.isProfileComplete) userService.saveProfile(complete.id, complete).catch(console.error);
  };

  const markAsRead = (postId: string) => {
    const currentRead = userProfile.readPostIds || [];
    if (!currentRead.includes(postId)) {
      updateProfile({ readPostIds: [...currentRead, postId] });
    }
  };

  const handleLogin = (syncedProfile: UserProfile) => {
    const baseProfile = { ...FALLBACK_DATA.profile, ...syncedProfile, isProfileComplete: true };
    if (!baseProfile.avatarColor) baseProfile.avatarColor = getRandomColor();
    const finalProfile = handleAccessIncrement(baseProfile);
    setUserProfile(finalProfile);
    localStorage.setItem('user_profile', JSON.stringify(finalProfile));
    navigate('/home');
  };

  const toggleSavePost = (id: string) => {
    const currentSaved = userProfile.savedPostIds || [];
    const isSaved = currentSaved.includes(id);
    const newSavedIds = isSaved ? currentSaved.filter(pid => pid !== id) : [...currentSaved, id];
    updateProfile({ savedPostIds: newSavedIds });
  };

  const toggleLikePost = async (id: string) => {
    const currentLikes = userProfile.likedPostIds || [];
    if (currentLikes.includes(id)) return;
    updateProfile({ likedPostIds: [...currentLikes, id] });
  };

  const toggleLikeComment = async (postId: string, commentId: string) => {
    const currentCommentLikes = userProfile.likedCommentIds || [];
    if (currentCommentLikes.includes(commentId)) return;
    await commentsService.likeComment(postId, commentId);
    updateProfile({ likedCommentIds: [...currentCommentLikes, commentId] });
  };

  if (loading && sheetPosts.length === 0) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizando Cafeteria...</p>
      </div>
    </div>
  );

  return (
    <div className={`mx-auto max-w-md min-h-screen shadow-xl relative overflow-x-hidden ${mergedContent.profile.isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
      <Routes>
        <Route path="/" element={<Landing content={mergedContent} onLogin={handleLogin} />} />
        <Route path="/onboarding" element={<Onboarding profile={mergedContent.profile} onUpdate={updateProfile} />} />
        <Route path="/home" element={<ProtectedRoute profile={mergedContent.profile}><Home content={mergedContent} missions={dynamicMissions} /></ProtectedRoute>} />
        <Route path="/expresso" element={<ProtectedRoute profile={mergedContent.profile}><ExpressoPage content={mergedContent} readPostIds={mergedContent.profile.readPostIds} /></ProtectedRoute>} />
        <Route path="/expresso/:id" element={<ProtectedRoute profile={mergedContent.profile}><ExpressoDetail content={mergedContent} markAsRead={markAsRead} onToggleSave={toggleSavePost} onToggleLike={toggleLikePost} onLikeComment={toggleLikeComment} /></ProtectedRoute>} />
        <Route path="/comunidade" element={<ProtectedRoute profile={mergedContent.profile}><Comunidade content={mergedContent} /></ProtectedRoute>} />
        <Route path="/aprofundar" element={<ProtectedRoute profile={mergedContent.profile}><Aprofundar content={mergedContent} readPostIds={mergedContent.profile.readPostIds} userPosts={sheetPosts} /></ProtectedRoute>} />
        <Route path="/aprofundar/:id" element={<ProtectedRoute profile={mergedContent.profile}><AprofundarDetail content={mergedContent} markAsRead={markAsRead} onToggleSave={toggleSavePost} onToggleLike={toggleLikePost} onLikeComment={toggleLikeComment} /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute profile={mergedContent.profile}><Profile profile={mergedContent.profile} onUpdate={updateProfile} readCount={mergedContent.profile.readPostIds?.length || 0} totalPostsCount={sheetPosts.length} userPosts={sheetPosts} /></ProtectedRoute>} />
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
