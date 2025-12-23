
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
import Editor from './pages/Editor';
import EditorExpresso from './pages/EditorExpresso';
import EditorAprofundamento from './pages/EditorAprofundamento';
import BottomNav from './components/BottomNav';

const App: React.FC = () => {
  const [data, setData] = useState<AppContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [globalComments, setGlobalComments] = useState<Comment[]>([]);
  const [userCreatedPosts, setUserCreatedPosts] = useState<Expresso[]>([]);
  const [readPostIds, setReadPostIds] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'pending' } | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const savedProfile = localStorage.getItem('user_profile');
        let initialProfile: UserProfile;
        if (savedProfile) {
          initialProfile = JSON.parse(savedProfile);
        } else {
          initialProfile = {
            name: "Explorador",
            email: "",
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
            church: "Não informada",
            education: "Não informada",
            isDarkMode: false,
            savedPostIds: [],
            stats: { daysInRow: 1, savedPosts: 0, writtenPosts: 0 }
          };
          localStorage.setItem('user_profile', JSON.stringify(initialProfile));
        }
        setUserProfile(initialProfile);

        const savedUserPosts = localStorage.getItem('user_created_posts');
        if (savedUserPosts) {
          setUserCreatedPosts(JSON.parse(savedUserPosts));
        }

        const savedReadPosts = localStorage.getItem('read_posts');
        if (savedReadPosts) {
          setReadPostIds(JSON.parse(savedReadPosts));
        }

        try {
          const response = await fetch('conteudo.json');
          if (response.ok) {
            const json = await response.json();
            setData(json);
            setGlobalComments(json.comments || []);
          } else {
            throw new Error("Falha no fetch");
          }
        } catch (e) {
          setData({
            branding: { appName: "SOMOSUM", region: "GOIÁS", motto: "Apologética" },
            landing: { title: "Bem-vindo", description: "Inicie sua jornada.", heroImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac" },
            expressos: [],
            comments: [],
            profile: initialProfile
          });
        }
      } catch (error) {
        console.error("Erro crítico na inicialização:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotify = (message: string, type: 'success' | 'info' | 'pending' = 'success') => {
    setNotification({ message, type });
  };

  const mergedContent = useMemo(() => {
    if (!data || !userProfile) return null;
    const publishedUserPosts = userCreatedPosts.filter(p => p.status === 'published');
    const existingIds = new Set(data.expressos.map(e => e.id));
    const uniqueUserPosts = publishedUserPosts.filter(p => !existingIds.has(p.id));

    return {
      ...data,
      expressos: [...uniqueUserPosts, ...data.expressos],
      profile: userProfile
    };
  }, [data, userCreatedPosts, userProfile]);

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
    
    const updatedProfile = {
      ...userProfile,
      savedPostIds: newSavedIds,
      stats: { ...userProfile.stats, savedPosts: newSavedIds.length }
    };
    updateProfile(updatedProfile);
  };

  const markAsRead = (id: string) => {
    if (!readPostIds.includes(id)) {
      const newReadPosts = [...readPostIds, id];
      setReadPostIds(newReadPosts);
      localStorage.setItem('read_posts', JSON.stringify(newReadPosts));
    }
  };

  const upsertPost = (post: Expresso) => {
    const updatedPosts = [...userCreatedPosts];
    const index = updatedPosts.findIndex(p => p.id === post.id);
    
    if (index > -1) {
      updatedPosts[index] = post;
    } else {
      updatedPosts.unshift(post);
    }
    
    setUserCreatedPosts(updatedPosts);
    localStorage.setItem('user_created_posts', JSON.stringify(updatedPosts));

    // Notificação baseada no status
    if (post.status === 'published') {
      showNotify("Conteúdo publicado com sucesso! 🚀", "success");
    } else if (post.status === 'pending') {
      showNotify("Enviado para moderação/pendência. ⏳", "pending");
    } else {
      showNotify("Rascunho salvo com sucesso. 📁", "info");
    }
  };

  const updatePostStatus = (id: string, newStatus: 'draft' | 'pending' | 'published') => {
    const updated = userCreatedPosts.map(p => p.id === id ? { ...p, status: newStatus } : p);
    setUserCreatedPosts(updated);
    localStorage.setItem('user_created_posts', JSON.stringify(updated));
    
    const messages = {
      published: "Conteúdo publicado! 🚀",
      pending: "Enviado para pendências. ⏳",
      draft: "Movido para rascunhos. 📁"
    };
    showNotify(messages[newStatus], newStatus === 'published' ? 'success' : 'info');
  };

  const deleteUserPost = (id: string) => {
    const updated = userCreatedPosts.filter(p => p.id !== id);
    setUserCreatedPosts(updated);
    localStorage.setItem('user_created_posts', JSON.stringify(updated));
    showNotify("Postagem removida.", "info");
  };

  if (loading || !mergedContent) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className={`mx-auto max-w-md min-h-screen shadow-xl relative overflow-x-hidden transition-colors duration-300 ${mergedContent.profile.isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
        
        {/* Notificação Flutuante Animada */}
        {notification && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-xs animate-in slide-in-from-top-8 duration-500">
            <div className={`px-6 py-4 rounded-[28px] shadow-2xl flex items-center gap-4 border ${
              notification.type === 'success' 
                ? 'bg-emerald-500 border-emerald-400 text-white' 
                : notification.type === 'pending'
                ? 'bg-blue-600 border-blue-400 text-white'
                : 'bg-slate-800 border-slate-700 text-white'
            }`}>
              <span className="material-symbols-outlined text-[20px]">
                {notification.type === 'success' ? 'check_circle' : notification.type === 'pending' ? 'hourglass_top' : 'info'}
              </span>
              <p className="text-[11px] font-black uppercase tracking-widest leading-tight">{notification.message}</p>
            </div>
          </div>
        )}

        <Routes>
          <Route path="/" element={<Landing content={mergedContent} />} />
          <Route path="/home" element={<Home content={mergedContent} />} />
          <Route path="/expresso" element={<ExpressoPage content={mergedContent} comments={globalComments} onAddComment={()=>{}} onLikeComment={()=>{}} readPostIds={readPostIds} />} />
          <Route path="/expresso/:id" element={<ExpressoDetail content={mergedContent} comments={globalComments} onAddComment={()=>{}} onLikeComment={()=>{}} markAsRead={markAsRead} readPostIds={readPostIds} />} />
          <Route path="/aprofundar" element={<Aprofundar content={mergedContent} userPosts={userCreatedPosts} readPostIds={readPostIds} />} />
          <Route path="/aprofundar/:id" element={<AprofundarDetail content={mergedContent} comments={globalComments} onAddComment={()=>{}} onLikeComment={()=>{}} markAsRead={markAsRead} readPostIds={readPostIds} onToggleSave={toggleSavePost} />} />
          <Route path="/profile" element={<Profile profile={mergedContent.profile} onUpdate={updateProfile} readCount={readPostIds.length} userPosts={userCreatedPosts} />} />
          <Route path="/editor" element={<Editor userPosts={userCreatedPosts} onUpdateStatus={updatePostStatus} onDelete={deleteUserPost} isDarkMode={mergedContent.profile.isDarkMode} />} />
          <Route path="/editor/expresso" element={<EditorExpresso onPublish={upsertPost} userPosts={userCreatedPosts} isDarkMode={mergedContent.profile.isDarkMode} />} />
          <Route path="/editor/expresso/:id" element={<EditorExpresso onPublish={upsertPost} userPosts={userCreatedPosts} isDarkMode={mergedContent.profile.isDarkMode} />} />
          <Route path="/editor/aprofundamento" element={<EditorAprofundamento onPublish={upsertPost} userPosts={userCreatedPosts} isDarkMode={mergedContent.profile.isDarkMode} />} />
          <Route path="/editor/aprofundamento/:id" element={<EditorAprofundamento onPublish={upsertPost} userPosts={userCreatedPosts} isDarkMode={mergedContent.profile.isDarkMode} />} />
        </Routes>
        <BottomNav isDarkMode={mergedContent.profile.isDarkMode} />
      </div>
    </Router>
  );
};

export default App;
