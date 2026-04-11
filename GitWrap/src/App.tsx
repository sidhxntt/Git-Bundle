import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Github } from 'lucide-react';
import { fetchGitHubData } from './lib/github';
import { 
  IntroSlide, 
  TopStatsSlide, 
  TopReposSlide, 
  CodingHabitsSlide, 
  LanguagesSlide, 
  FunInsightsSlide, 
  CollaborationSlide, 
  OutroSlide 
} from './components/Slides';

const slides = [
  IntroSlide,
  TopStatsSlide,
  TopReposSlide,
  CodingHabitsSlide,
  LanguagesSlide,
  FunInsightsSlide,
  CollaborationSlide,
  OutroSlide
];

export default function App() {
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<'landing' | 'loading' | 'slideshow'>('landing');
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;
    setStatus('loading');
    setError('');
    try {
      const githubData = await fetchGitHubData(username);
      setData(githubData);
      setStatus('slideshow');
    } catch (err) {
      setError('Could not fetch user. Check the username or try again later.');
      setStatus('landing');
    }
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setDirection(1);
      setCurrentSlide(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide(prev => prev - 1);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    if (status !== 'slideshow') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, status]);

  if (status === 'landing') {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-[#050505] text-white selection:bg-lime-400/30 flex items-center justify-center">
        <div className="gradient-bg">
          <div className="blob-container">
            <div className="blob-1"></div>
            <div className="blob-2"></div>
            <div className="blob-3"></div>
          </div>
          <div className="noise-overlay"></div>
        </div>

        <div className="relative z-10 max-w-md w-full px-6 text-center">
          <Github className="w-16 h-16 text-lime-400 mx-auto mb-8" />
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">
            GitHub <span className="text-lime-300 italic">Wrapped</span>
          </h1>
          <p className="text-gray-400 font-sans mb-8">
            Enter your GitHub username to generate your cinematic year in review.
          </p>
          <form onSubmit={handleGenerate} className="flex flex-col gap-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="octocat"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/50 transition-all font-sans text-center"
            />
            <button
              type="submit"
              disabled={!username}
              className="w-full bg-lime-400 text-black font-sans font-semibold rounded-xl px-6 py-4 text-lg hover:bg-lime-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate Review
            </button>
          </form>
          {error && <p className="text-red-400 mt-4 text-sm font-sans">{error}</p>}
        </div>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-[#050505] text-white flex items-center justify-center">
        <div className="gradient-bg">
          <div className="blob-container">
            <div className="blob-1"></div>
            <div className="blob-2"></div>
            <div className="blob-3"></div>
          </div>
          <div className="noise-overlay"></div>
        </div>

        <div className="relative z-10 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Github className="w-12 h-12 text-lime-400 mx-auto mb-6" />
          </motion.div>
          <h2 className="text-2xl font-serif text-white animate-pulse">Crunching the numbers...</h2>
        </div>
      </div>
    );
  }

  const CurrentSlideComponent = slides[currentSlide];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#050505] text-white selection:bg-lime-400/30">
      {/* Moving Gradient Background */}
      <div className="gradient-bg">
        <div className="blob-container">
          <div className="blob-1"></div>
          <div className="blob-2"></div>
          <div className="blob-3"></div>
        </div>
        <div className="noise-overlay"></div>
      </div>

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full p-4 z-50 flex gap-2">
        {slides.map((_, index) => (
          <div key={index} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-white"
              initial={{ width: index < currentSlide ? "100%" : "0%" }}
              animate={{ width: index === currentSlide ? "100%" : index < currentSlide ? "100%" : "0%" }}
              transition={{ duration: index === currentSlide ? 5 : 0.2, ease: "linear" }}
              onAnimationComplete={() => {
                if (index === currentSlide && currentSlide < slides.length - 1) {
                  nextSlide();
                }
              }}
            />
          </div>
        ))}
      </div>

      {/* Click Areas for Navigation */}
      <div className="absolute inset-0 z-40 flex">
        <div className="w-1/3 h-full cursor-w-resize" onClick={prevSlide} />
        <div className="w-2/3 h-full cursor-e-resize" onClick={nextSlide} />
      </div>

      {/* Slide Content */}
      <div className="relative z-30 w-full h-full flex items-center justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            className="w-full h-full absolute inset-0 pointer-events-auto"
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <CurrentSlideComponent data={data} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Hint */}
      <div className="absolute bottom-6 left-0 w-full text-center z-50 pointer-events-none">
        <p className="text-xs text-white/40 font-sans tracking-widest uppercase">
          Tap left/right or use arrows to navigate
        </p>
      </div>
    </div>
  );
}
