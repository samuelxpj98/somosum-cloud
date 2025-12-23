import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppContent, Comment, Expresso, UserProfile } from './types';
import Landing from './pages/Landing';
import Home from './pages/Home';
import ExpressoPage from './pages/Expresso';
import ExpressoDetail from './pages/ExpressoDetail';
import Aprofundar from './pages/Aprofundar';
import AprofundarDetail from './pages/AprofundarDetail';
import Profile from './pages/Profile';
import BottomNav from './components/BottomNav';

const GOOGLE_SHEETS_TSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTVDakgfBDNrAjigSbsNHuSZaDzDwNtvKYn7liPnycTYYveR1WAbChhahZPFLi4Ywd7IGBItymUbFE4/pub?output=tsv"; 

const App: React.FC = () => {
  const [data, setData] = useState<AppContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [globalComments, setGlobalComments] = useState<Comment[]>([]);
  const [userCreatedPosts, setUserCreatedPosts] = useState<Expresso[]>([]);
  const [readPostIds, setReadPostIds] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [sheetPosts, setSheetPosts] = useState<Expresso[]>([]);
  const [dynamicMissions, setDynamicMissions] = useState<string[]>([]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const savedProfile = localStorage.getItem('user_profile');
        let initialProfile: UserProfile;
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile);
          initialProfile = {
            ...parsed,
            likedPostIds: parsed.likedPostIds || []
          };
        } else {
          initialProfile = {
            name: "Explorador",
            email: "",
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
            church: "Não informada",
            education: "Não informada",
            isDarkMode: false,
            savedPostIds: [],
            likedPostIds: [],
            stats: { daysInRow: 1, savedPosts: 0, writtenPosts: 0 }
          };
          localStorage.setItem('user_profile', JSON.stringify(initialProfile));
        }
        setUserProfile(initialProfile);

        const savedUserPosts = localStorage.getItem('user_created_posts');
        if (savedUserPosts) setUserCreatedPosts(JSON.parse(savedUserPosts));
        const savedReadPosts = localStorage.getItem('read_posts');
        if (savedReadPosts) setReadPostIds(JSON.parse(savedReadPosts));

        try {
          const response = await fetch('conteudo.json');
          if (response.ok) {
            const json = await response.json();
            setData(json);
            setGlobalComments(json.comments || []);
          }
        } catch (e) { console.error("Erro no conteudo.json"); }

        if (GOOGLE_SHEETS_TSV_URL) {
          try {
            const sheetRes = await fetch(GOOGLE_SHEETS_TSV_URL);
            const tsvText = await sheetRes.text();
            const lines = tsvText.split('\n').slice(1);
            
            const posts: Expresso[] = [];
            const missions: string[] = [];

            lines.forEach((line, index) => {
              const parts = line.split('\t');
              if (!parts[0] || parts[0].trim() === "") return;

              const type = parts[7]?.trim()?.toUpperCase() || "EXPRESSO";

              if (type === "MISSAO") {
                missions.push(parts[1]?.trim() || parts[0]?.trim());
              } else {
                posts.push({
                  id: `sheet-${index}`,
                  title: parts[0]?.trim(),
                  content: parts[1]?.trim(),
                  imageUrl: parts[2]?.trim() || "https://images.unsplash.com/photo-1504052434569-70ad5836ab65",
                  category: parts[3]?.trim() || "GERAL",
                  categoryFull: parts[3]?.trim(),
                  subtitle: parts[4]?.trim() || "",
                  readingTime: parts[5]?.trim() || "2 MIN",
                  bibleReference: parts[6]?.trim() || "",
                  categoryType: type,
                  tags: [parts[3]?.toLowerCase() || 'geral'],
                  status: 'published',
                  isClassic: false,
                  analogy: parts[8] ? {
                    icon: parts[8]?.trim() || "bolt",
                    title: parts[9]?.trim() || "Analogia",
                    text: parts[10]?.trim() || ""
                  } : undefined
                });
              }
            });

            setSheetPosts(posts);
            setDynamicMissions(missions);
          } catch (err) {
            console.error("Erro ao carregar planilha:", err);
          }
        }

      } catch (error) {
        console.error("Erro crítico na inicialização:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  const mergedContent = useMemo(() => {
    if (!data || !userProfile) return null;
    
    const sheetExpressos = sheetPosts.filter(p => p.categoryType === "EXPRESSO");
    const sheetAprofundamentos = sheetPosts.filter(p => p.categoryType === "APROFUNDAR");

    return {
      ...data,
      expressos: [
        ...userCreatedPosts.filter(p => p.status === 'published'), 
        ...sheetExpressos, 
        ...sheetAprofundamentos, 
        ...data.expressos
      ],
      profile: userProfile
    };
  }, [data, userCreatedPosts, userProfile, sheetPosts]);

  const updateProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    localStorage.setItem('user_profile', JSON.stringify(updated));
  };

  const toggleSavePost = (id: string) => {
    if (!userProfile) return;
    const isSaved = userProfile.savedPostIds.includes(id);
    const newSavedIds = isSaved 
      ? userProfile.savedPostIds.filter(pid => pid !== id)
      : [...userProfile.savedPostIds, id];
    updateProfile({ ...userProfile, savedPostIds: newSavedIds, stats: { ...userProfile.stats, savedPosts: newSavedIds.length } });
  };

  const toggleLikePost = (id: string) => {
    if (!userProfile) return;
    const isLiked = userProfile.likedPostIds.includes(id);
    const newLikedIds = isLiked
      ? userProfile.likedPostIds.filter(pid => pid !== id)
      : [...userProfile.likedPostIds, id];
    updateProfile({ ...userProfile, likedPostIds: newLikedIds });
  };

  const handleAddComment = (newComment: Comment) => {
    setGlobalComments(prev => [newComment, ...prev]);
  };

  const handleLikeComment = (commentId: string) => {
    setGlobalComments(prev => prev.map(c => 
      c.id === commentId 
        ? { ...c, likes: c.isLiked ? c.likes - 1 : c.likes + 1, isLiked: !c.isLiked } 
        : c
    ));
  };

  const markAsRead = (id: string) => {
    if (!readPostIds.includes(id)) {
      const newReadPosts = [...readPostIds, id];
      setReadPostIds(newReadPosts);
      localStorage.setItem('read_posts', JSON.stringify(newReadPosts));
    }
  };

  if (loading || !mergedContent) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className={`mx-auto max-w-md min-h-screen shadow-xl relative overflow-x-hidden transition-colors duration-300 ${mergedContent.profile.isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
        <Routes>
          <Route path="/" element={<Landing content={mergedContent} />} />
          <Route path="/home" element={<Home content={mergedContent} missions={dynamicMissions} />} />
          <Route path="/expresso" element={<ExpressoPage content={mergedContent} comments={globalComments} onAddComment={handleAddComment} onLikeComment={handleLikeComment} readPostIds={readPostIds} />} />
          <Route path="/expresso/:id" element={<ExpressoDetail content={mergedContent} comments={globalComments} onAddComment={handleAddComment} onLikeComment={handleLikeComment} markAsRead={markAsRead} readPostIds={readPostIds} onToggleSave={toggleSavePost} onToggleLike={toggleLikePost} />} />
          <Route path="/aprofundar" element={<Aprofundar content={mergedContent} userPosts={userCreatedPosts} readPostIds={readPostIds} />} />
          <Route path="/aprofundar/:id" element={<AprofundarDetail content={mergedContent} comments={globalComments} onAddComment={handleAddComment} onLikeComment={handleLikeComment} markAsRead={markAsRead} readPostIds={readPostIds} onToggleSave={toggleSavePost} onToggleLike={toggleLikePost} />} />
          <Route path="/profile" element={<Profile profile={mergedContent.profile} onUpdate={updateProfile} readCount={readPostIds.length} userPosts={userCreatedPosts} />} />
        </Routes>
        <BottomNav isDarkMode={mergedContent.profile.isDarkMode} />
      </div>
    </Router>
  );
};

export default App;