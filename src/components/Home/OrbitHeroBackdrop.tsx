// OrbitHeroBackdrop.tsx
'use client';

import React, { useEffect, useMemo, useRef } from 'react';

type Props = {
     className?: string;
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const OrbitHeroBackdrop = ({ className }: Props) => {
     const ref = useRef<HTMLDivElement | null>(null);

     useEffect(() => {
          const el = ref.current;
          if (!el) return;

          // init vars so first render is always valid
          el.style.setProperty('--px', '0');
          el.style.setProperty('--py', '0');

          const onMove = (e: PointerEvent) => {
               const r = el.getBoundingClientRect();
               if (r.width <= 0 || r.height <= 0) return;

               const nx = (e.clientX - r.left) / r.width; // 0..1
               const ny = (e.clientY - r.top) / r.height; // 0..1

               const x = clamp((nx - 0.5) * 2, -1, 1);
               const y = clamp((ny - 0.5) * 2, -1, 1);

               el.style.setProperty('--px', String(x));
               el.style.setProperty('--py', String(y));
          };

          const onLeave = () => {
               el.style.setProperty('--px', '0');
               el.style.setProperty('--py', '0');
          };

          // Use pointermove on window for "whole page" parallax.
          // We keep it passive to avoid scroll jank.
          window.addEventListener('pointermove', onMove, { passive: true });
          window.addEventListener('pointerleave', onLeave);

          return () => {
               window.removeEventListener('pointermove', onMove);
               window.removeEventListener('pointerleave', onLeave);
          };
     }, []);

     const stars = useMemo(() => {
          const dots: string[] = [];
          for (let i = 0; i < 90; i++) {
               const x = Math.floor(Math.random() * 1400);
               const y = Math.floor(Math.random() * 900);
               const a = (0.15 + Math.random() * 0.65).toFixed(2);
               dots.push(`${x}px ${y}px rgba(255,255,255,${a})`);
          }
          return dots.join(', ');
     }, []);

     // IMPORTANT: always use var(--px, 0) and var(--py, 0)
     const PX = 'var(--px, 0)';
     const PY = 'var(--py, 0)';

     return (
          <div
               ref={ref}
               className={['pointer-events-none absolute inset-0 overflow-hidden', className ?? ''].join(' ')}
          >
               {/* deep vignette */}
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),rgba(0,0,0,0.92)_60%,rgba(0,0,0,0.98))]" />

               {/* nebula layers (parallax) */}
               <div
                    className="absolute -top-44 left-1/2 h-[720px] w-[720px] -translate-x-1/2 rounded-full blur-3xl"
                    style={{
                         transform: `translate3d(calc(-50% + (${PX} * -22px)), calc(${PY} * -18px), 0)`,
                         background: 'radial-gradient(circle at center, rgba(68,188,255,0.22), transparent 62%)',
                    }}
               />
               <div
                    className="absolute -bottom-56 left-1/3 h-[820px] w-[820px] -translate-x-1/2 rounded-full blur-3xl"
                    style={{
                         transform: `translate3d(calc(-50% + (${PX} * 18px)), calc(${PY} * 14px), 0)`,
                         background: 'radial-gradient(circle at center, rgba(255,103,94,0.18), transparent 62%)',
                    }}
               />

               {/* orbit rings */}
               <div
                    className="absolute left-1/2 top-1/2 h-[760px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
                    style={{
                         transform: `translate3d(calc(-50% + (${PX} * 10px)), calc(-50% + (${PY} * 8px)), 0)`,
                    }}
               />
               <div
                    className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/8"
                    style={{
                         transform: `translate3d(calc(-50% + (${PX} * 7px)), calc(-50% + (${PY} * 6px)), 0)`,
                    }}
               />
               <div
                    className="absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/6"
                    style={{
                         transform: `translate3d(calc(-50% + (${PX} * 4px)), calc(-50% + (${PY} * 3px)), 0)`,
                    }}
               />

               {/* orbiting dot */}
               <div className="absolute left-1/2 top-1/2 h-[760px] w-[760px] -translate-x-1/2 -translate-y-1/2 animate-[spin_18s_linear_infinite]">
                    <div className="absolute left-1/2 top-0 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-white/90 shadow-[0_0_18px_rgba(255,255,255,0.65)]" />
               </div>

               {/* procedural stars */}
               <div
                    className="absolute left-0 top-0 h-px w-px opacity-60 blur-[0.2px]"
                    style={{
                         boxShadow: stars,
                         transform: `translate3d(calc(${PX} * -8px), calc(${PY} * -6px), 0)`,
                    }}
               />

               {/* scanlines */}
               <div className="absolute inset-0 opacity-[0.06] [background:linear-gradient(to_bottom,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:100%_6px]" />
          </div>
     );
};

export default OrbitHeroBackdrop;
