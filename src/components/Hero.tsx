import React from 'react';
import { Flame, Sparkles, ShoppingBag, ShieldCheck, ArrowRight } from 'lucide-react';
import { heroBg } from '../assets';
import { PageView } from '../types';

interface HeroProps {
  onExploreProducts: () => void;
  onNavigate?: (page: PageView) => void;
  onContactClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreProducts, onNavigate, onContactClick }) => {
  return (
    <section className="relative w-full min-h-[560px] lg:min-h-[640px] flex items-center justify-center overflow-hidden">
      {/* High-Resolution Gummy Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt="Gomitas surtidas dulces y picosas BadGommys"
          className="w-full h-full object-cover object-center scale-105 transform hover:scale-100 transition-transform duration-1000"
        />
        {/* Radial Dark & Color Grading Overlay for optimal readability */}
        <div className="absolute inset-0 bg-radial from-black/50 via-black/75 to-black/95 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d11] via-black/40 to-black/60" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
        
        {/* Floating Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/30 border border-red-500/50 text-red-200 text-xs sm:text-sm font-extrabold uppercase tracking-widest mb-6 backdrop-blur-md shadow-lg animate-bounce">
          <Flame className="w-4 h-4 text-red-400 fill-red-500" />
          <span>La auténtica experiencia dulce y picosa</span>
          <Sparkles className="w-4 h-4 text-amber-300" />
        </div>

        {/* Title matching exact screenshot */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-none mb-6 drop-shadow-[0_4px_25px_rgba(0,0,0,0.9)] font-display">
          Bad <span className="text-red-500">Gommys</span>
        </h1>

        {/* Subtitle matching exact screenshot */}
        <p className="text-lg sm:text-2xl md:text-3xl text-zinc-100 font-medium max-w-3xl mx-auto mb-10 leading-relaxed drop-shadow-md">
          La explosión de sabores que no sabías que necesitabas. Dulce, picoso y todo lo demás.
        </p>

        {/* CTA Button matching screenshot */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            id="hero-buy-now-btn"
            onClick={onExploreProducts}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#ff3838] hover:bg-[#ff1f1f] text-white px-9 py-4 rounded-full font-black text-lg shadow-[0_0_35px_rgba(255,56,56,0.6)] hover:shadow-[0_0_45px_rgba(255,56,56,0.85)] transition-all transform hover:-translate-y-1 active:translate-y-0 cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>¡Comprar Ahora!</span>
            <ArrowRight className="w-5 h-5 ml-1" />
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-14 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-zinc-300 text-xs sm:text-sm font-semibold">
          <div className="flex items-center justify-center gap-2 bg-black/40 py-2.5 px-3 rounded-xl backdrop-blur-sm border border-white/5">
            <span className="text-red-400 text-lg">🌶️</span>
            <span>Chamoy Artesanal</span>
          </div>
          <div className="flex items-center justify-center gap-2 bg-black/40 py-2.5 px-3 rounded-xl backdrop-blur-sm border border-white/5">
            <span className="text-amber-400 text-lg">⚡</span>
            <span>Envíos Rápidos</span>
          </div>
          <div className="flex items-center justify-center gap-2 bg-black/40 py-2.5 px-3 rounded-xl backdrop-blur-sm border border-white/5">
            <span className="text-rose-400 text-lg">✨</span>
            <span>100% Frescas</span>
          </div>
          <div className="flex items-center justify-center gap-2 bg-black/40 py-2.5 px-3 rounded-xl backdrop-blur-sm border border-white/5">
            <span className="text-emerald-400 text-lg">🔒</span>
            <span>Compra Segura</span>
          </div>
        </div>

      </div>
    </section>
  );
};
