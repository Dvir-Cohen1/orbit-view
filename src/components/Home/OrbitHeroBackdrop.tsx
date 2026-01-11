// OrbitHeroBackdrop.tsx
'use client';

import React, { useEffect, useMemo, useRef } from 'react';

type Props = { className?: string };

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export default function OrbitHeroBackdrop({ className }: Props) {
     const ref = useRef<HTMLDivElement | null>(null);

     // target from pointer
     const target = useRef({ x: 0, y: 0 });
     // smoothed values
     const current = useRef({ x: 0, y: 0 });
     const rafId = useRef<number | null>(null);

     useEffect(() => {
          const el = ref.current;
          if (!el) return;

          el.style.setProperty('--px', '0');
          el.style.setProperty('--py', '0');

          const onMove = (e: PointerEvent) => {
               const r = el.getBoundingClientRect();
               if (r.width <= 0 || r.height <= 0) return;

               const nx = (e.clientX - r.left) / r.width;  // 0..1
               const ny = (e.clientY - r.top) / r.height;  // 0..1

               target.current.x = clamp((nx - 0.5) * 2, -1, 1);
               target.current.y = clamp((ny - 0.5) * 2, -1, 1);
          };

          const onLeave = () => {
               target.current.x = 0;
               target.current.y = 0;
          };

          window.addEventListener('pointermove', onMove, { passive: true });
          window.addEventListener('pointerleave', onLeave);

          const tick = () => {
               // lerp for smooth motion, not twitchy
               current.current.x = lerp(current.current.x, target.current.x, 0.08);
               current.current.y = lerp(current.current.y, target.current.y, 0.08);

               // write CSS vars once per frame
               el.style.setProperty('--px', current.current.x.toFixed(4));
               el.style.setProperty('--py', current.current.y.toFixed(4));

               rafId.current = requestAnimationFrame(tick);
          };

          rafId.current = requestAnimationFrame(tick);

          return () => {
               window.removeEventListener('pointermove', onMove);
               window.removeEventListener('pointerleave', onLeave);
               if (rafId.current) cancelAnimationFrame(rafId.current);
          };
     }, []);

     const stars = useMemo(() => {
          const dots: string[] = [];
          // generate more + larger bounds so it doesn't “end” on big screens
          for (let i = 0; i < 140; i++) {
               const x = Math.floor(Math.random() * 2400);
               const y = Math.floor(Math.random() * 1400);
               const a = (0.12 + Math.random() * 0.65).toFixed(2);
               dots.push(`${x}px ${y}px rgba(255,255,255,${a})`);
          }
          return dots.join(', ');
     }, []);

     const PX = 'var(--px, 0)';
     const PY = 'var(--py, 0)';

     return (
          <div
               ref={ref}
               className={['pointer-events-none absolute inset-0 overflow-hidden', className ?? ''].join(' ')}
          >
               {/* deep vignette */}
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),rgba(0,0,0,0.92)_60%,rgba(0,0,0,0.98))]" />

               {/* nebula layers */}
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
                    style={{ transform: `translate3d(calc(-50% + (${PX} * 10px)), calc(-50% + (${PY} * 8px)), 0)` }}
               />
               <div
                    className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/8"
                    style={{ transform: `translate3d(calc(-50% + (${PX} * 7px)), calc(-50% + (${PY} * 6px)), 0)` }}
               />
               <div
                    className="absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/6"
                    style={{ transform: `translate3d(calc(-50% + (${PX} * 4px)), calc(-50% + (${PY} * 3px)), 0)` }}
               />

               {/* orbiting dot */}
               <div className="absolute left-1/2 top-1/2 h-[760px] w-[760px] -translate-x-1/2 -translate-y-1/2 animate-[spin_18s_linear_infinite]">
                    <div className="absolute left-1/2 top-0 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-white/90 shadow-[0_0_18px_rgba(255,255,255,0.65)]" />
               </div>

               {/* procedural stars: 1px seed + big box-shadow field */}
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
}
