import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Trophy, Zap, Sparkles } from 'lucide-react';
import { SliderBanner } from '../types';

interface BannerSliderProps {
  sliders: SliderBanner[];
  onOpenReferral: () => void;
  onFilterGame: (gameId: string) => void;
}

export const BannerSlider: React.FC<BannerSliderProps> = ({
  sliders,
  onOpenReferral,
  onFilterGame
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (sliders.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sliders.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [sliders.length]);

  if (!sliders || sliders.length === 0) return null;

  const current = sliders[currentIndex];

  const handleAction = () => {
    if (current.tag.includes('REFER')) {
      onOpenReferral();
    } else if (current.title.toLowerCase().includes('bgmi')) {
      onFilterGame('bgmi');
    } else if (current.title.toLowerCase().includes('free fire')) {
      onFilterGame('freefire');
    } else {
      onFilterGame('all');
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800/80 shadow-2xl">
      {/* Background Image with Gradient Overlay */}
      <div className="relative h-44 sm:h-52 md:h-64 w-full overflow-hidden">
        <img
          src={current.image}
          alt={current.title}
          className="w-full h-full object-cover object-center filter brightness-50 contrast-125 transition-all duration-700 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e17] via-[#0b0e17]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0e17] via-transparent to-black/60" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-7 md:p-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-2">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{current.tag}</span>
            </div>
            <h2 className="font-gaming text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-wide leading-tight">
              {current.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 line-clamp-2">
              {current.subtitle}
            </p>

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleAction}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-orange-600/30 active:scale-95"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>{current.btnText || 'Explore Now'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {sliders.length > 1 && (
          <>
            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + sliders.length) % sliders.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white flex items-center justify-center backdrop-blur-sm transition border border-white/10"
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % sliders.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white flex items-center justify-center backdrop-blur-sm transition border border-white/10"
              aria-label="Next banner"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Indicators */}
        <div className="absolute bottom-3 right-5 flex items-center gap-1.5">
          {sliders.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentIndex ? 'w-6 bg-amber-400' : 'w-2 bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
