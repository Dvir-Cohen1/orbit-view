'use client';
import React from 'react';

type Props = {
     className?: string;
};

const OrbitHeroBackdrop = ({ className }: Props) => {
     return (
          <div
               className={[
                    'pointer-events-none absolute inset-0 overflow-hidden',
                    className ?? '',
               ].join(' ')}
          >
               {/* nebula glow */}
               <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(68,188,255,0.18),transparent_60%)] blur-2xl" />
               <div className="absolute -bottom-40 left-1/3 h-[680px] w-[680px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,103,94,0.14),transparent_60%)] blur-2xl" />

               {/* orbit rings */}
               <div className="absolute left-1/2 top-1/2 h-[680px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
               <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/8" />
               <div className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/6" />

               {/* orbiting dot */}
               <div className="absolute left-1/2 top-1/2 h-[680px] w-[680px] -translate-x-1/2 -translate-y-1/2 animate-[spin_18s_linear_infinite]">
                    <div className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-white/90 shadow-[0_0_18px_rgba(255,255,255,0.65)]" />
               </div>

               {/* stars */}
               <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(rgba(255,255,255,0.55)_1px,transparent_1px)] [background-size:22px_22px]" />
               <div className="absolute inset-0 opacity-35 [background-image:radial-gradient(rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:38px_38px] [background-position:12px_10px]" />
          </div>
     );
};

export default OrbitHeroBackdrop;
