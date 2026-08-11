import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import logo from '../assets/nexarion_logo.png';

const SplashScreen = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide splash screen after 1.2 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, pointerEvents: 'none' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ 
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', 
              backgroundSize: '40px 40px' 
            }}></div>
          </div>

          {/* Animated Circles */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ duration: 1 }}
          >
            <motion.div
              className="w-96 h-96 rounded-full border-2 border-cyan-400"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.div
              className="absolute w-96 h-96 rounded-full border-2 border-amber-400"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 2, delay: 0.5, repeat: Infinity, ease: "easeOut" }}
            />
          </motion.div>

          {/* Logo Container */}
          <motion.div
            className="relative z-10 flex flex-col items-center"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              duration: 0.8, 
              ease: [0.34, 1.56, 0.64, 1],
              opacity: { duration: 0.5 }
            }}
          >
            {/* Logo with glow effect */}
            <motion.div
              className="relative"
              animate={{ 
                scale: [1, 1.05, 1],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 blur-3xl bg-gradient-to-br from-cyan-500/30 via-amber-500/30 to-orange-500/30 rounded-full"></div>
              
              {/* Logo Image */}
              <img 
                src={logo} 
                alt="Nexarion Global Exports" 
                className="relative w-[500px] h-auto drop-shadow-2xl"
              />
            </motion.div>

            {/* Loading text */}
            <motion.div
              className="mt-8 flex gap-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {['L', 'o', 'a', 'd', 'i', 'n', 'g'].map((letter, index) => (
                <motion.span
                  key={index}
                  className="text-white text-xl font-bold"
                  animate={{ 
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    delay: index * 0.1,
                    ease: "easeInOut"
                  }}
                >
                  {letter}
                </motion.span>
              ))}
              <motion.span
                className="text-white text-xl font-bold ml-1"
                animate={{ 
                  opacity: [0, 1, 0],
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                ...
              </motion.span>
            </motion.div>

            {/* Progress bar */}
            <motion.div
              className="mt-6 w-64 h-1 bg-white/10 rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 via-amber-400 to-orange-400"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
