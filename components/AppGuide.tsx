
import React, { useState } from 'react';

interface AppGuideProps {
  onClose: () => void;
  isDark?: boolean;
}

const steps = [
  {
    title: "BEM-VINDO AO ECOSSISTEMA",
    subtitle: "SomosUm Goiás",
    description: "Este não é apenas um app, é sua central de inteligência para uma fé fundamentada na razão. Aqui, cada detalhe foi moído para sua edificação.",
    icon: "cognition",
    color: "bg-blue-600",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "ALTA DEGUSTAÇÃO",
    subtitle: "O Expresso",
    description: "Doses rápidas para dúvidas intensas. O algoritmo prioriza o que é novo e viral. Ideal para aquele insight entre uma aula e outra.",
    icon: "bolt",
    color: "bg-orange-500",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "MOAGEM FINA",
    subtitle: "O Aprofundar",
    description: "Estudos densos e teológicos. Aqui a recência importa menos que a autoridade. Fontes acadêmicas e bíblicas fazem você subir no ranking.",
    icon: "menu_book",
    color: "bg-indigo-600",
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "PURO GRÃO",
    subtitle: "A Comunidade",
    description: "Onde o diálogo acontece. O algoritmo valoriza a profundidade das respostas (Dialética). Quanto melhor o debate, maior o seu score.",
    icon: "forum",
    color: "bg-emerald-600",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "CURADORIA INTELIGENTE",
    subtitle: "O Algoritmo",
    description: "Nossa IA monitora o engajamento e a qualidade das fontes. Os 3 primeiros lugares (Ouro, Prata, Bronze) são o selo de relevância da nossa geração.",
    icon: "analytics",
    color: "bg-amber-500",
    image: "https://images.unsplash.com/photo-1551288049-bbbda536339a?auto=format&fit=crop&q=80&w=600"
  }
];

const AppGuide: React.FC<AppGuideProps> = ({ onClose, isDark }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
    else onClose();
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={onClose}></div>
      
      <div className={`relative w-full max-w-sm rounded-[48px] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-500 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
        <div className="relative h-64 overflow-hidden">
          <img src={step.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000" alt={step.title} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
            <div className={`${step.color} size-12 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-black/20 border border-white/20`}>
              <span className="material-symbols-outlined text-[28px]">{step.icon}</span>
            </div>
            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="absolute bottom-6 left-8">
             <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mb-1">{step.subtitle}</p>
             <h2 className="text-white text-2xl font-black font-display tracking-tighter leading-none">{step.title}</h2>
          </div>
        </div>

        <div className="p-8 pb-10">
          <p className={`text-[15px] leading-relaxed mb-10 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {step.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {steps.map((_, idx) => (
                <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? `${step.color} w-8` : 'bg-slate-200 w-1.5 dark:bg-slate-700'}`}></div>
              ))}
            </div>
            
            <button 
              onClick={next}
              className={`px-8 py-4 ${step.color} text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-black/10 active:scale-95 transition-all flex items-center gap-2`}
            >
              {currentStep === steps.length - 1 ? 'Começar' : 'Próximo'}
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppGuide;
