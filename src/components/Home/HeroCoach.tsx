'use client';

import React, { useEffect, useState } from 'react';

type Props = {
     onStart: () => void;
     onJump: () => void;
     forceOpen?: boolean;
     onClose?: () => void;
};

const KEY = 'ov_hero_coach_dismissed_v1';

export default function HeroCoach({ onStart, onJump, forceOpen, onClose }: Props) {
     const [open, setOpen] = useState(false);

     useEffect(() => {
          if (forceOpen) {
               setOpen(true);
               return;
          }

          const dismissed = window.localStorage.getItem(KEY) === '1';
          if (!dismissed) setOpen(true);
     }, [forceOpen]);

     const close = () => {
          setOpen(false);
          window.localStorage.setItem(KEY, '1');
          onClose?.();
     };

     if (!open) return null;

     return (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-end justify-center p-5 sm:items-center">
               <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-white/10 bg-black/55 p-4 text-white shadow-[0_0_60px_rgba(0,0,0,0.6)] backdrop-blur-md">
                    <div className="flex items-start justify-between gap-3">
                         <div>
                              <div className="text-sm font-semibold">Quick tour ✨</div>
                              <div className="mt-1 text-xs text-white/70">
                                   Drag to orbit • Scroll to zoom • Hover for names • Click to lock-on
                              </div>
                         </div>

                         <button
                              onClick={close}
                              aria-label="Dismiss quick tour"
                              className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/70 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/25"
                         >
                              Got it
                         </button>
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                         <button
                              onClick={() => {
                                   close();
                                   onStart();
                              }}
                              aria-label="Start exploring"
                              className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/25"
                         >
                              🪐 Start exploring
                         </button>

                         <button
                              onClick={() => {
                                   close();
                                   onJump();
                              }}
                              aria-label="Jump to a planet"
                              className="rounded-xl bg-gradient-to-r from-[#44BCFF]/25 to-[#FF675E]/20 px-3 py-2 text-sm font-semibold transition hover:from-[#44BCFF]/35 hover:to-[#FF675E]/30 focus:outline-none focus:ring-2 focus:ring-white/25"
                         >
                              🎯 Jump to a planet
                         </button>
                    </div>
               </div>
          </div>
     );
}
