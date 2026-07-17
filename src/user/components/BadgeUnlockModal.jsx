import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Sparkles } from 'lucide-react';

const BadgeUnlockModal = ({ isOpen, onClose, badges }) => {
  if (!badges || badges.length === 0) return null;

  // If there are multiple, we'll display them nicely
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
                transition: { type: 'spring', damping: 15 }
              }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="w-full max-w-md relative overflow-hidden rounded-3xl p-8 border pointer-events-auto text-center"
              style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                borderColor: '#ff6d34',
                boxShadow: '0 25px 50px -12px rgba(255, 109, 52, 0.25)',
              }}
            >
              {/* Confetti particles built with framer-motion */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(16)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: ['#ff6d34', '#00bea3', '#7c3aed', '#fbbf24', '#3b82f6'][i % 5],
                      left: '50%',
                      top: '50%',
                    }}
                    initial={{ x: 0, y: 0, scale: 0 }}
                    animate={{
                      x: (Math.random() - 0.5) * 300,
                      y: (Math.random() - 0.5) * 300,
                      scale: [0, 1.5, 0],
                      rotate: Math.random() * 360,
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: Math.random() * 0.5,
                    }}
                  />
                ))}
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>

              <div className="relative z-10 flex flex-col items-center">
                {/* Achievement Header */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="w-20 h-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-5xl mb-6 shadow-lg shadow-orange-500/10 relative"
                >
                  <Award className="absolute -top-2 -right-2 text-[#00bea3] w-7 h-7" />
                  <span className="animate-bounce select-none">{badges[0].icon}</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-1 text-[11px] font-black uppercase tracking-[0.25em] text-[#ff6d34] mb-3"
                >
                  <Sparkles size={12} className="animate-spin-slow" /> Badge Unlocked
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-2xl font-black text-white tracking-tight mb-2"
                >
                  {badges[0].name}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-slate-300 text-sm max-w-sm leading-relaxed mb-8"
                >
                  🎉 Congratulations!
                  <br />
                  You have unlocked the <strong className="text-white font-bold">{badges[0].name} Badge</strong> for maintaining a <span className="text-[#00bea3] font-bold">{badges[0].requirement}-Day Learning Streak</span>.
                </motion.p>

                {/* Multiple badges support display info */}
                {badges.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mb-6 p-3 bg-slate-800/50 border border-slate-700/50 rounded-2xl w-full text-left"
                  >
                    <p className="text-xs text-slate-400 font-semibold mb-2">Also unlocked in this session:</p>
                    <div className="flex flex-wrap gap-2">
                      {badges.slice(1).map((b, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-700 rounded-full text-xs text-white">
                          <span>{b.icon}</span>
                          <span className="font-semibold">{b.name}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  onClick={onClose}
                  className="w-full py-3.5 rounded-2xl font-black text-sm text-white shadow-lg hover:scale-105 active:scale-95 transition-transform"
                  style={{
                    background: 'linear-gradient(90deg, #ff6d34, #ff8c5f)',
                    boxShadow: '0 8px 24px -6px rgba(255, 109, 52, 0.4)',
                  }}
                >
                  Awesome, Let's Go!
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BadgeUnlockModal;
