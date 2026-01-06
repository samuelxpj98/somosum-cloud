
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
import { userService, commentsService } from './lib/firebase';

// VERSÃO 17.1: Correção do contador de acessos
const CACHE_KEY = 'somosum_v17_drive_images'; 
const APP_VERSION = '17.1';
const CACHE_EXPIRATION = 5 * 1000; 

export const AVATAR_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F43F5E',
  '#6366F1', '#06B6D4', '#F97316', '#14B8A6', '#D946EF', '#475569'
];

export const formatImageUrl = (url: string): string => {
  if (!url) return "https://images.unsplash.com/photo-1504052434569-70ad5836ab65";
  if (url.includes('drive.google.com')) {
    let fileId = "";
    if (url.includes('/file/d/')) {
      fileId = url.split('/file/d/')[1].split('/')[0];
    } else if (url.includes('id=')) {
      fileId = url.split('id=')[1].split('&')[0];
    }
    if (fileId) return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  return url;
};

export const getCategoryColor = (category: string) => {
  const cat = category?.toUpperCase() || '';
  if (cat.includes('CIÊNCIA') || cat.includes('RAZÃO')) return 'bg-blue-600';
  if (cat.includes('EVIDÊNCIAS')) return 'bg-amber-700';
  if (cat.includes('VIDA') || cat.includes('DILEMAS')) return 'bg-rose-600';
  if (cat.includes('IDENTIDADE')) return 'bg-indigo-600';
  if (cat.includes('CULTURA') || cat.includes('FÉ')) return 'bg-purple-600';
  return 'bg-slate-600';
};

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
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
};

const SHEET_URLS = [
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTVDakgfBDNrAjigSbsNHuSZaDzDwNtvKYn7liPnycTYYveR1WAbChhahZPFLi4Ywd7IGBItymUbFE4/pub?gid=0&single=true&output=tsv",
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTVDakgfBDNrAjigSbsNHuSZaDzDwNtvKYn7liPnycTYYveR1WAbChhahZPFLi4Ywd7IGBItymUbFE4/pub?gid=922094770&single=true&output=tsv"
];

const AppContentComponent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile>(FALLBACK_DATA.profile);
  const [sheetPosts, setSheetPosts] = useState<Expresso[]>([]);
  const [dynamicMissions, setDynamicMissions] = useState<string[]>([]);

  const fetchSheetData = async () => {
    const allPosts: Expresso[] = [];
    const allMissions: string[] = [];
    
    await Promise.all(SHEET_URLS.map(async (url) => {
      try {
        const res = await fetch(`${url}&t=${Date.now()}`);
        if (!res.ok) return;
        const tsvText = await res.text();
        const cleanTsv = tsvText.replace(/^\uFEFF/, '').split(/\r?\n/);
        const rows = cleanTsv.slice(1);
        const gid = url.split('gid=')[1].split('&')[0];
        const isAprofundarTab = gid === '922094770';

        rows.forEach((line, index) => {
          const parts = line.split('\t').map(p => p.trim());
          const postTitle = (parts[0] || "").replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
          if (!postTitle || postTitle.length < 2 || postTitle.toLowerCase() === 'título') return; 

          let tipoRaw = (parts[7] || "").toUpperCase().trim();
          let tipo = isAprofundarTab ? "APROFUNDAR" : "EXPRESSO";
          if (tipoRaw.includes("APROFUNDAR")) tipo = "APROFUNDAR";
          else if (tipoRaw.includes("MISSAO") || tipoRaw.includes("MISSÃO")) tipo = "MISSAO";

          if (tipo === "MISSAO") {
            allMissions.push(parts[1] || parts[0]);
          } else {
            const analogyTitle = parts[9] || (tipo === "EXPRESSO" ? 'A ANALOGIA' : 'VERSÍCULO CHAVE');
            const analogyText = parts[10]; 
            const hasAnalogy = analogyText && analogyText.length > 2;

            allPosts.push({
              id: `post-${gid}-${index}-${tipo.toLowerCase()}`,
              title: postTitle,
              content: (parts[1] || "").replace(/\\n/g, '\n'),
              imageUrl: formatImageUrl(parts[2]),
              category: parts[3] || "GERAL",
              categoryFull: parts[3] || "GERAL",
              subtitle: parts[4] || "", 
              readingTime: parts[5] || (tipo === "APROFUNDAR" ? "8 MIN" : "2 MIN"),
              bibleReference: parts[6] || "", 
              categoryType: tipo,
              tags: [parts[3]?.toLowerCase() || 'geral'],
              status: 'published',
              timestamp: Date.now() - (index * 1000), 
              analogy: hasAnalogy ? {
                icon: tipo === "EXPRESSO" ? 'bolt' : 'menu_book',
                title: analogyTitle,
                text: analogyText.replace(/\\n/g, '\n')
              } : undefined
            });
          }
        });
      } catch (e) {
        console.error("Erro fetch planilha", e);
      }
    }));

    setSheetPosts(allPosts);
    setDynamicMissions(allMissions);
    localStorage.setItem(CACHE_KEY, JSON.stringify({ 
      posts: allPosts, 
      missions: allMissions, 
      timestamp: Date.now() 
    }));
    setLoading(false);
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    const complete = { ...userProfile, ...updated };
    setUserProfile(complete);
    localStorage.setItem('user_profile', JSON.stringify(complete));
    if (complete.isProfileComplete && complete.id) {
      userService.saveProfile(complete.id, complete).catch(console.error);
    }
  };

  useEffect(() => {
    const lastVer = localStorage.getItem('app_version_somosum');
    if (lastVer !== APP_VERSION) {
      localStorage.clear(); 
      localStorage.setItem('app_version_somosum', APP_VERSION);
    }

    const initializeApp = async () => {
      const savedProfile = localStorage.getItem('user_profile');
      if (savedProfile) {
        try {
          const profile: UserProfile = JSON.parse(savedProfile);
          
          // Lógica de Incremento de Acesso por Sessão
          const sessionFlag = sessionStorage.getItem('somosum_session_active');
          let updatedProfile = {
            ...profile,
            readPostIds: Array.isArray(profile.readPostIds) ? profile.readPostIds : []
          };

          if (!sessionFlag) {
            updatedProfile.loginCount = (updatedProfile.loginCount || 0) + 1;
            sessionStorage.setItem('somosum_session_active', 'true');
            localStorage.setItem('user_profile', JSON.stringify(updatedProfile));
            if (updatedProfile.id) userService.saveProfile(updatedProfile.id, updatedProfile).catch(console.error);
          }

          setUserProfile(updatedProfile);
          if (location.pathname === '/') navigate('/home', { replace: true });
        } catch (e) {}
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
        } catch (e) {}
      }
      await fetchSheetData();
    };
    initializeApp();
  }, []);

  const mergedContent = useMemo(() => ({
    ...FALLBACK_DATA,
    expressos: sheetPosts.filter(p => p.categoryType === 'EXPRESSO'),
    sheetPosts: sheetPosts,
    profile: userProfile
  }), [userProfile, sheetPosts]);

  const handleLogin = (syncedProfile: UserProfile) => {
    // Incrementa o contador ao logar em uma conta existente
    const currentCount = syncedProfile.loginCount || 0;
    const baseProfile: UserProfile = { 
      ...FALLBACK_DATA.profile, 
      ...syncedProfile, 
      loginCount: currentCount + 1,
      isProfileComplete: true 
    };
    
    setUserProfile(baseProfile);
    localStorage.setItem('user_profile', JSON.stringify(baseProfile));
    sessionStorage.setItem('somosum_session_active', 'true');
    
    if (baseProfile.id) {
      userService.saveProfile(baseProfile.id, baseProfile).catch(console.error);
    }
    
    navigate('/home');
  };

  const toggleSavePost = (id: string) => {
    const currentSaved = userProfile.savedPostIds || [];
    const newSavedIds = currentSaved.includes(id) ? currentSaved.filter(pid => pid !== id) : [...currentSaved, id];
    updateProfile({ savedPostIds: newSavedIds });
  };

  const markAsRead = (id: string) => {
    const currentRead = userProfile.readPostIds || [];
    if (!currentRead.includes(id)) updateProfile({ readPostIds: [...currentRead, id] });
  };

  const toggleLikePost = (id: string) => {
    const currentLiked = userProfile.likedPostIds || [];
    const newLikedIds = currentLiked.includes(id) ? currentLiked.filter(pid => pid !== id) : [...currentLiked, id];
    updateProfile({ likedPostIds: newLikedIds });
  };

  const likeComment = async (postId: string, commentId: string) => {
    const currentLikedComments = userProfile.likedCommentIds || [];
    if (!currentLikedComments.includes(commentId)) {
      await commentsService.likeComment(postId, commentId);
      updateProfile({ likedCommentIds: [...currentLikedComments, commentId] });
    }
  };

  if (loading && sheetPosts.length === 0) return (
    <div className="flex h-screen items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Formatando Imagens do Drive...</p>
      </div>
    </div>
  );

  return (
    <div className={`mx-auto max-w-md min-h-screen relative overflow-x-hidden ${userProfile.isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
      <Routes>
        <Route path="/" element={<Landing content={mergedContent} onLogin={handleLogin} />} />
        <Route path="/onboarding" element={<Onboarding profile={userProfile} onUpdate={updateProfile} />} />
        <Route path="/home" element={<ProtectedRoute profile={userProfile}><Home content={mergedContent} missions={dynamicMissions} /></ProtectedRoute>} />
        <Route path="/expresso" element={<ProtectedRoute profile={userProfile}><ExpressoPage content={mergedContent} readPostIds={userProfile.readPostIds} /></ProtectedRoute>} />
        <Route path="/expresso/:id" element={<ProtectedRoute profile={userProfile}><ExpressoDetail content={mergedContent} markAsRead={markAsRead} onToggleSave={toggleSavePost} onToggleLike={toggleLikePost} onLikeComment={likeComment} /></ProtectedRoute>} />
        <Route path="/comunidade" element={<ProtectedRoute profile={userProfile}><Comunidade content={mergedContent} /></ProtectedRoute>} />
        <Route path="/aprofundar" element={<ProtectedRoute profile={userProfile}><Aprofundar content={mergedContent} readPostIds={userProfile.readPostIds || []} /></ProtectedRoute>} />
        <Route path="/aprofundar/:id" element={<ProtectedRoute profile={userProfile}><AprofundarDetail content={mergedContent} markAsRead={markAsRead} onToggleSave={toggleSavePost} onToggleLike={toggleLikePost} onLikeComment={likeComment} /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute profile={userProfile}><Profile profile={userProfile} onUpdate={updateProfile} userPosts={sheetPosts} /></ProtectedRoute>} />
      </Routes>
      <BottomNav isDarkMode={userProfile.isDarkMode} profileComplete={userProfile.isProfileComplete} />
    </div>
  );
};

const App: React.FC = () => (
  <Router>
    <AppContentComponent />
  </Router>
);

export default App;
