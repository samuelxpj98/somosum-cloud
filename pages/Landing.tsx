
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContent, UserProfile } from '../types';
import { userService } from '../lib/firebase';

interface LandingProps {
  content: AppContent;
  onLogin: (profile: UserProfile) => void;
}

const Landing: React.FC<LandingProps> = ({ content, onLogin }) => {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSignUpFallback, setShowSignUpFallback] = useState(false);
  
  const { branding, landing } = content;
  const isDark = content.profile.isDarkMode;

  const handleSyncAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;

    setLoading(true);
    setError('');
    setShowSignUpFallback(false);

    try {
      const profile = await userService.findUserByEmail(cleanEmail);
      if (profile) {
        localStorage.removeItem('user_profile');
        onLogin({ ...profile, isProfileComplete: true });
      } else {
        setError('E-mail não localizado no sistema.');
        setShowSignUpFallback(true);
      }
    } catch (err: any) {
      console.error("Erro no login:", err);
      setError(err.message || 'Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  const startNewJourney = () => {
    localStorage.removeItem('user_profile');
    navigate('/onboarding');
  };

  const appendGmail = () => {
    if (!email.includes('@')) {
      setEmail(prev => prev + '@gmail.com');
    }
  };

  return (
    <div className={`relative min-h-screen flex flex-col p-6 items-center overflow-x-hidden transition-colors duration-300 ${isDark ? 'bg-slate-950 text-white' : 'bg-[#f8fafc] text-slate-900'}`}>
      
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={() => !loading && setShowLoginModal(false)}></div>
          <div className={`relative w-full max-w-sm rounded-[40px] shadow-2xl p-8 animate-in zoom-in-95 duration-300 ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
            <h3 className="text-2xl font-black font-display mb-2">Entrar na Conta</h3>
            <p className="text-xs font-medium text-slate-400 mb-8 uppercase tracking-widest">Acesse seu perfil de apolegeta.</p>
            
            <form onSubmit={handleSyncAccount} className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center px-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-blue-600">E-mail cadastrado</label>
                  {!email.includes('@') && email.length > 2 && (
                    <button 
                      type="button"
                      onClick={appendGmail}
                      className="text-[9px] font-black text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md active:scale-95 transition-all"
                    >
                      + @gmail.com
                    </button>
                  )}
                </div>
                <input 
                  autoFocus
                  required
                  type="email"
                  value={email}
                  disabled={loading}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className={`w-full h-14 px-6 rounded-[20px] border-2 transition-all outline-none text-sm font-bold ${
                    isDark 
                      ? 'bg-slate-800 border-slate-700 focus:border-blue-500 text-white' 
                      : 'bg-slate-50 border-slate-100 focus:border-blue-400 text-slate-900'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>

              {error && (
                <div className="animate-in fade-in slide-in-from-top-1 text-center bg-red-50 p-4 rounded-2xl border border-red-100">
                  <p className="text-[10px] font-bold text-red-600 uppercase tracking-tight mb-3 leading-tight">{error}</p>
                  {showSignUpFallback && (
                    <button 
                      type="button"
                      onClick={startNewJourney}
                      className="w-full h-10 rounded-xl bg-blue-600 text-white font-black text-[9px] uppercase tracking-widest shadow-lg"
                    >
                      Criar novo perfil
                    </button>
                  )}
                </div>
              )}

              <button 
                type="submit"
                disabled={loading || !email}
                className={`w-full h-14 bg-blue-600 text-white rounded-[20px] font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 transition-all ${loading ? 'opacity-70' : 'active:scale-95'}`}
              >
                {loading ? <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Acessar"}
              </button>
              
              {!loading && (
                <button 
                  type="button"
                  onClick={() => { setShowLoginModal(false); setShowSignUpFallback(false); setError(''); }}
                  className="w-full h-10 text-[10px] font-black text-slate-400 uppercase tracking-widest"
                >
                  Cancelar
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Background Dots */}
      <div className={`absolute inset-0 opacity-[0.15] pointer-events-none ${isDark ? 'opacity-[0.05]' : 'opacity-[0.15]'}`} 
           style={{ 
             backgroundImage: `radial-gradient(${isDark ? '#ffffff' : '#64748b'} 1px, transparent 1px)`, 
             backgroundSize: '24px 24px' 
           }}></div>
      
      {/* Logo Section */}
      <div className="relative z-10 flex flex-col items-center mt-12 mb-10 w-full">
        <div className="relative mb-6">
          <div className={`w-28 h-28 rounded-[32px] shadow-lg flex items-center justify-center border-4 transition-colors ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-blue-100/50'}`}>
            <span className="material-symbols-outlined text-[56px] text-blue-600" style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span>
          </div>
          <div className="absolute -bottom-1 -right-2 bg-[#ffcc00] text-slate-900 text-[11px] font-[900] px-3 py-1 rounded-full shadow-md uppercase tracking-tighter">
            GUIA
          </div>
        </div>

        <h1 className="text-[44px] font-[900] tracking-tighter leading-none mb-1 font-display flex">
          <span className={isDark ? 'text-white' : 'text-slate-900'}>SOMOS</span>
          <span className="text-blue-600">UM</span>
        </h1>
        
        <div className="flex items-center justify-center gap-4 mb-5 w-full max-w-[200px]">
          <div className={`h-[1px] flex-1 ${isDark ? 'bg-slate-800' : 'bg-slate-300'}`}></div>
          <h2 className="text-[13px] font-bold text-slate-400 tracking-[0.4em] uppercase">GOIÁS</h2>
          <div className={`h-[1px] flex-1 ${isDark ? 'bg-slate-800' : 'bg-slate-300'}`}></div>
        </div>

        <div className={`backdrop-blur-sm px-6 py-2 rounded-full mb-8 ${isDark ? 'bg-blue-600/10' : 'bg-blue-50/80'}`}>
          <p className="text-[11px] font-bold text-blue-600 uppercase tracking-[0.15em]">
            APOLOGÉTICA JOVEM
          </p>
        </div>
      </div>

      <div className="relative z-10 w-full mb-10">
        <div className={`w-full aspect-[1.3/1] rounded-[32px] overflow-hidden shadow-2xl relative border-4 transition-colors ${isDark ? 'border-slate-800' : 'border-white'}`}>
          <img 
            src={landing.heroImage} 
            alt="Jovens" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
          
          <div className="absolute bottom-6 left-6 right-6">
            <h3 className="text-white text-xl font-bold leading-tight">
              Respostas profundas para dúvidas sinceras.
            </h3>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full text-center mb-10 px-4">
        <h3 className={`text-[26px] font-[800] mb-3 tracking-tight font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {landing.title}
        </h3>
        <p className={`text-[15px] leading-relaxed max-w-[320px] mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {landing.description}
        </p>
      </div>

      <div className="relative z-10 w-full space-y-4 mb-12 px-2">
        <button 
          onClick={() => navigate('/onboarding')}
          className="w-full bg-[#135bec] hover:bg-blue-700 text-white font-bold h-16 rounded-[20px] shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
        >
          <span className="text-lg">Iniciar Jornada</span>
          <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
        </button>
        <button 
          onClick={() => setShowLoginModal(true)}
          className={`w-full font-bold h-16 rounded-[20px] border shadow-sm transition-all active:scale-[0.98] ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800'}`}
        >
          Já sou de casa. Login 🔥
        </button>
      </div>
    </div>
  );
};

export default Landing;
