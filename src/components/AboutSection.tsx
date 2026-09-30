import React from 'react';
import { Flame, Droplet, ShieldCheck, Heart, Sparkles, Award } from 'lucide-react';
import { badgommysLogo } from '../assets';

export const AboutSection: React.FC = () => {
  return (
    <section className="py-20 bg-[#0d0d11] text-white relative overflow-hidden">
      {/* Subtle Glow & Background Accents */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-950/60 border border-red-700/40 text-red-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Nuestra Esencia
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-6">
            ¿Qué es <span className="text-red-500 font-display">BadGommys</span>?
          </h2>
          <p className="text-zinc-300 text-base sm:text-lg leading-relaxed">
            BadGommys es el punto de encuentro definitivo entre la confitería clásica y la pasión mexicana por el picor y los sabores intensos. No somos solo gomitas con chile: somos una experiencia artesanal que fusiona salsas chamoy espesas con notas agridulces, limón deshidratado y una mezcla secreta de chiles selectos.
          </p>
        </div>

        {/* Content Grid: Mascot Emblem & Value Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Visual Brand Emblem Showcase */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-b from-[#181820] to-[#121217] rounded-3xl border border-zinc-800 shadow-2xl relative">
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden border-4 border-red-600 shadow-[0_0_35px_rgba(239,68,68,0.35)] mb-6 bg-black flex items-center justify-center p-2">
              <img
                src={badgommysLogo}
                alt="BadGommys Mascot"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">Puro Sabor Sin Filtros</h3>
            <p className="text-zinc-400 text-sm max-w-xs leading-relaxed mb-4">
              Creado para quienes buscan emociones fuertes en cada bocado. Frescura garantizada, textura tierna y un balance irresistible.
            </p>
            <div className="flex items-center gap-3 text-xs font-bold text-red-400 bg-red-950/40 px-4 py-1.5 rounded-full border border-red-800/30">
              <Flame className="w-4 h-4 fill-red-500 text-red-500" />
              <span>Receta 100% Original BadGommys</span>
            </div>
          </div>

          {/* 3 Core Value Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            <div className="p-6 bg-[#15151c] rounded-2xl border border-zinc-800/80 hover:border-red-600/40 transition-all hover:-translate-y-1 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 mb-4">
                <Flame className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Chamoy Secreto de la Casa</h4>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Nuestra salsa base está elaborada a partir de pulpa de ciruela, jamaica y tamarindo natural con la viscosidad perfecta para cubrir cada rincón sin escurrir.
              </p>
            </div>

            <div className="p-6 bg-[#15151c] rounded-2xl border border-zinc-800/80 hover:border-red-600/40 transition-all hover:-translate-y-1 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-4">
                <Droplet className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Textura Suave & Jugosa</h4>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Cero gomitas duras o chiclosas. Utilizamos grenetina de primer grado que mantiene su elasticidad y absorbe el escarchado de especias a la perfección.
              </p>
            </div>

            <div className="p-6 bg-[#15151c] rounded-2xl border border-zinc-800/80 hover:border-red-600/40 transition-all hover:-translate-y-1 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-500 mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Empaque Hermético Grado Pro</h4>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Sellado especial con barrera contra humedad y rayos UV para que tus gomitas lleguen tan frescas como si acabaran de salir del taller.
              </p>
            </div>

            <div className="p-6 bg-[#15151c] rounded-2xl border border-zinc-800/80 hover:border-red-600/40 transition-all hover:-translate-y-1 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Artesanal & Hecho con Amor</h4>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Cada paquete se prepara en lotes pequeños garantizando un control estricto de sabor, higiene impecable y máxima satisfacción en cada entrega.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
