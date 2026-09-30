import React, { useState, useEffect } from 'react';
import { Sparkles, Flame, Target, Eye, ChevronLeft, ChevronRight, Play, Pause, CheckCircle2 } from 'lucide-react';
import { CAROUSEL_SLIDES } from '../data/initialData';

export const StoryCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const slides = CAROUSEL_SLIDES;

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [isPlaying, slides.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const currentSlide = slides[currentIndex];

  const getSlideIcon = (icon: string) => {
    switch (icon) {
      case 'Flame':
        return <Flame className="w-7 h-7 text-red-500 fill-red-500" />;
      case 'Target':
        return <Target className="w-7 h-7 text-rose-400" />;
      case 'Eye':
        return <Eye className="w-7 h-7 text-amber-400" />;
      case 'Sparkles':
      default:
        return <Sparkles className="w-7 h-7 text-red-400" />;
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-[#0d0d11] via-[#111116] to-[#0d0d11] text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-red-500 flex items-center gap-1.5 mb-2">
              <Flame className="w-4 h-4" />
              Conoce Más de Nosotros
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-display">
              Historia, Calidad & Pasión <span className="text-red-500">BadGommys</span>
            </h2>
          </div>

          {/* Controls: Play/Pause and Next/Prev */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer border border-zinc-700/50"
              title={isPlaying ? 'Pausar carrusel' : 'Reanudar carrusel'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              id="carousel-prev-btn"
              onClick={handlePrev}
              className="p-2.5 rounded-full bg-zinc-800/80 hover:bg-red-600 text-zinc-300 hover:text-white transition-colors cursor-pointer border border-zinc-700/50 shadow-lg"
              title="Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              id="carousel-next-btn"
              onClick={handleNext}
              className="p-2.5 rounded-full bg-zinc-800/80 hover:bg-red-600 text-zinc-300 hover:text-white transition-colors cursor-pointer border border-zinc-700/50 shadow-lg"
              title="Siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector Buttons for Instant Jump */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-8">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => {
                setCurrentIndex(index);
                setIsPlaying(false);
              }}
              className={`text-left p-3.5 sm:p-4 rounded-2xl transition-all cursor-pointer border ${
                currentIndex === index
                  ? 'bg-red-600 text-white border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)] scale-[1.02]'
                  : 'bg-[#15151c] text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <div className="text-[11px] font-bold uppercase tracking-wider opacity-80 mb-0.5">
                Paso 0{index + 1}
              </div>
              <div className="font-extrabold text-sm sm:text-base leading-tight truncate">
                {slide.title}
              </div>
            </button>
          ))}
        </div>

        {/* Active Carousel Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#181822] via-[#14141a] to-[#0f0f14] border border-red-900/30 p-6 sm:p-10 lg:p-12 shadow-2xl transition-all">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Main Information */}
            <div className="lg:col-span-8 space-y-6">
              
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-red-600/20 border border-red-500/30">
                  {getSlideIcon(currentSlide.icon)}
                </div>
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-red-400">
                    {currentSlide.highlight}
                  </span>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                    {currentSlide.title}
                  </h3>
                </div>
              </div>

              <p className="text-zinc-300 text-base sm:text-lg leading-relaxed font-normal">
                {currentSlide.description}
              </p>

              {/* Bullet Points */}
              <div className="space-y-3 pt-2">
                {currentSlide.points.map((point, i) => (
                  <div key={i} className="flex items-start gap-3 bg-black/30 p-3 rounded-xl border border-white/5">
                    <CheckCircle2 className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-zinc-200 text-sm sm:text-base leading-snug">
                      {point}
                    </span>
                  </div>
                ))}
              </div>

            </div>

            {/* Visual Accent Badge side */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 sm:p-8 bg-gradient-to-b from-red-950/40 via-zinc-900/50 to-black/80 rounded-2xl border border-red-600/20 text-center">
              <div className="w-20 h-20 rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(239,68,68,0.3)]">
                {getSlideIcon(currentSlide.icon)}
              </div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-red-400 mb-1">
                Garantía BadGommys
              </span>
              <p className="text-xl font-bold text-white mb-3">
                {currentSlide.subtitle}
              </p>
              <div className="text-xs text-zinc-400 max-w-xs">
                Elaborado con amor y sabor picosito en Ciudad de México para todo el país.
              </div>
            </div>

          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8 pt-4 border-t border-zinc-800/60">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentIndex === i ? 'w-8 bg-red-500' : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                }`}
                title={`Ir a diapositiva ${i + 1}`}
              />
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
