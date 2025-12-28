
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../types';
import { userService } from '../lib/firebase';

interface OnboardingProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ profile, onUpdate }) => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [churchName, setChurchName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [education, setEducation] = useState('');
  const [leadership, setLeadership] = useState<'pastor' | 'lider_juventude' | 'none'>('none');
  const [loading, setLoading] = useState(false);
  const isDark = profile.isDarkMode;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !churchName.trim() || !whatsapp.trim() || !email.trim() || !education.trim()) return;

    setLoading(true);
    const updatedProfile: UserProfile = {
      ...profile,
      name: fullName,
      church: churchName,
      whatsapp: whatsapp,
      email: email.toLowerCase().trim(),
      education: education,
      isPastor: leadership !== 'none',
      leadershipRole: leadership,
      isProfileComplete: true
    };

    try {
      await userService.saveProfile(profile.id || 'anonymous', updatedProfile);
      onUpdate(updatedProfile);
      
      const intended = sessionStorage.getItem('intended_destination');
      if (intended) {
        sessionStorage.removeItem('intended_destination');
        navigate(intended);
      } else {
        navigate('/home');
      }
    } catch (err) {
      console.error("Erro ao salvar perfil:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col p-8 transition-colors duration-500 ${isDark ? 'bg-slate-950 text-white' : 'bg-[#f8fafc] text-slate-900'}`}>
      
      <header className="absolute top-6 left-6 z-50">
        <button 
          onClick={() => navigate('/')}
          className={`size-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${
            isDark ? 'bg-slate-900 border border-slate-800 text-white' : 'bg-white border border-slate-100 shadow-sm text-slate-600'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
      </header>

      <div className="mt-12 mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="inline-flex items-center justify-center size-14 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-600/30 mb-5">
          <span className="material-symbols-outlined text-[28px]">person_add</span>
        </div>
        <h1 className="text-2xl font-[900] font-display tracking-tight leading-none mb-2 uppercase italic">Sua Identidade</h1>
        <p className="text-xs font-medium opacity-50 max-w-[280px] mx-auto leading-relaxed">
          Preencha os campos abaixo para iniciarmos nossa jornada de fé e razão.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200 pb-16 overflow-y-auto no-scrollbar">
        
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 ml-4">Nome e sobrenome</label>
          <input 
            required
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Ex: Samuel Duarte"
            className={`w-full h-14 px-6 rounded-[20px] border-2 transition-all outline-none text-sm font-bold ${
              isDark 
                ? 'bg-slate-900 border-slate-800 focus:border-blue-500 text-white' 
                : 'bg-white border-slate-100 focus:border-blue-400 text-slate-900'
            }`}
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Você possui um cargo de Liderança?</label>
          <div className="grid grid-cols-2 gap-3">
            <div 
              onClick={() => setLeadership(leadership === 'pastor' ? 'none' : 'pastor')}
              className={`p-4 rounded-[24px] border-2 transition-all cursor-pointer flex flex-col items-center gap-2 text-center ${
                leadership === 'pastor' 
                  ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10 scale-[1.02]' 
                  : (isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50/50 border-slate-100')
              }`}
            >
              <div className={`size-10 rounded-xl flex items-center justify-center transition-all ${leadership === 'pastor' ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-200 text-slate-400 dark:bg-slate-800'}`}>
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: leadership === 'pastor' ? "'FILL' 1" : "" }}>verified</span>
              </div>
              <h4 className={`text-[10px] font-black uppercase tracking-widest leading-tight ${leadership === 'pastor' ? 'text-amber-600' : 'text-slate-400'}`}>
                Sou Pastor
              </h4>
            </div>

            <div 
              onClick={() => setLeadership(leadership === 'lider_juventude' ? 'none' : 'lider_juventude')}
              className={`p-4 rounded-[24px] border-2 transition-all cursor-pointer flex flex-col items-center gap-2 text-center ${
                leadership === 'lider_juventude' 
                  ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10 scale-[1.02]' 
                  : (isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50/50 border-slate-100')
              }`}
            >
              <div className={`size-10 rounded-xl flex items-center justify-center transition-all ${leadership === 'lider_juventude' ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-200 text-slate-400 dark:bg-slate-800'}`}>
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: leadership === 'lider_juventude' ? "'FILL' 1" : "" }}>verified</span>
              </div>
              <h4 className={`text-[10px] font-black uppercase tracking-widest leading-tight ${leadership === 'lider_juventude' ? 'text-amber-600' : 'text-slate-400'}`}>
                Líder Juventude
              </h4>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 ml-4 flex items-baseline gap-1.5">
            Sua igreja <span className="text-[9px] lowercase font-bold opacity-40">(Nome completo)</span>
          </label>
          <input 
            required
            value={churchName}
            onChange={e => setChurchName(e.target.value)}
            placeholder="Ex: Igreja Batista Vibe"
            className={`w-full h-14 px-6 rounded-[20px] border-2 transition-all outline-none text-sm font-bold ${
              isDark 
                ? 'bg-slate-900 border-slate-800 focus:border-blue-500 text-white' 
                : 'bg-white border-slate-100 focus:border-blue-400 text-slate-900'
            }`}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 ml-4">WhatsApp (DDD + Número)</label>
          <input 
            required
            type="tel"
            value={whatsapp}
            onChange={e => setWhatsapp(e.target.value)}
            placeholder="62 99999-9999"
            className={`w-full h-14 px-6 rounded-[20px] border-2 transition-all outline-none text-sm font-bold ${
              isDark 
                ? 'bg-slate-900 border-slate-800 focus:border-blue-500 text-white' 
                : 'bg-white border-slate-100 focus:border-blue-400 text-slate-900'
            }`}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 ml-4 flex items-baseline gap-1.5">
            Estudante <span className="text-[9px] lowercase font-bold opacity-40">(Curso ou ano escolar)</span>
          </label>
          <input 
            required
            value={education}
            onChange={e => setEducation(e.target.value)}
            placeholder="Ex: Engenharia Elétrica ou 2º Ensino médio"
            className={`w-full h-14 px-6 rounded-[20px] border-2 transition-all outline-none text-sm font-bold ${
              isDark 
                ? 'bg-slate-900 border-slate-800 focus:border-blue-500 text-white' 
                : 'bg-white border-slate-100 focus:border-blue-400 text-slate-900'
            }`}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 ml-4">E-mail de acesso</label>
          <input 
            required
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className={`w-full h-14 px-6 rounded-[20px] border-2 transition-all outline-none text-sm font-bold ${
              isDark 
                ? 'bg-slate-900 border-slate-800 focus:border-blue-500 text-white' 
                : 'bg-white border-slate-100 focus:border-blue-400 text-slate-900'
            }`}
          />
        </div>

        <div className="pt-6">
          <button 
            type="submit"
            disabled={loading || !fullName || !churchName || !whatsapp || !email || !education}
            className={`w-full h-16 rounded-[24px] font-black uppercase text-xs tracking-[0.2em] transition-all shadow-2xl flex items-center justify-center gap-3 ${
              loading || !fullName || !churchName || !whatsapp || !email || !education
                ? 'bg-slate-300 text-white opacity-50 cursor-not-allowed'
                : 'bg-blue-600 text-white shadow-blue-600/30 active:scale-95'
            }`}
          >
            {loading ? (
              <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Acessar o APP</span>
                <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
              </>
            )}
          </button>
        </div>
      </form>
      
      <div className="mt-auto text-center py-4">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
          SomosUm Goiás: Fé moída na Razão.
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
