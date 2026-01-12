'use client';

import React, { useEffect, useMemo, useState } from 'react';
import TextShadow from '../common/TextShadow';
import InViewAnimation from '../common/InViewAnimation';
import SectionComponent from '../common/SectionComponent';
import { useRouter } from 'next/navigation';
import Footer from '../Layout/Footer';
import { PLANETS } from '@/constants/solarSystem.constants';
import OrbitHeroBackdrop from './OrbitHeroBackdrop';
import { useMagnetic } from '@/hooks/useMagnetic';
import HeroCoach from './HeroCoach';

const QUICK_PICKS = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn'] as const;

// keep in sync with simulator storage key
const LAST_FOCUS_KEY = 'ov_last_focus';

const Introduction: React.FC = () => {
    const router = useRouter();
    const [planet, setPlanet] = useState<string>('Earth');
    const [lastFocus, setLastFocus] = useState<string | null>(null);

    const [showGuide, setShowGuide] = useState(false);

    const planets = useMemo(() => PLANETS.map((p) => p.name), []);
    const selectedPlanet = useMemo(() => PLANETS.find((p) => p.name === planet), [planet]);

    // subtle magnetic (avoid heavy strength = less jitter)
    // const startBtnRef = useMagnetic<HTMLButtonElement>(0.12);

    const goExplore = () => router.push('/solar-system');
    const goPlanet = (name: string) => router.push(`/solar-system?focus=${encodeURIComponent(name)}`);

    const goRandom = () => {
        const pick = planets[Math.floor(Math.random() * planets.length)];
        setPlanet(pick);
        goPlanet(pick);
    };

    const onQuickPick = (name: string) => {
        setPlanet(name);
        goPlanet(name);
    };

    const onSelectKeyDown = (e: React.KeyboardEvent<HTMLSelectElement>) => {
        if (e.key === 'Enter') goPlanet(planet);
    };

    // load "resume last focus" from localStorage
    useEffect(() => {
        try {
            const saved = window.localStorage.getItem(LAST_FOCUS_KEY);
            if (saved && planets.includes(saved)) setLastFocus(saved);
        } catch {
            // ignore
        }
    }, [planets]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === '?' || (e.shiftKey && e.key === '/')) {
                e.preventDefault();
                setShowGuide(true);
            }
        };

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);


    const resume = () => {
        if (!lastFocus) return;
        goPlanet(lastFocus);
    };

    return (
        <InViewAnimation>
            <SectionComponent
                id="About"
                className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
            >
                <OrbitHeroBackdrop />

                {/* Coach overlay (first-run only) */}
                <HeroCoach
                    forceOpen={showGuide}
                    onClose={() => setShowGuide(false)}
                    onStart={goExplore}
                    onJump={() => {
                        setPlanet('Earth');
                        goPlanet('Earth');
                    }}
                />
                <button
                    onClick={() => setShowGuide(true)}
                    aria-label="Open quick guide"
                    className="absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white/70 backdrop-blur-md transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/25"
                >
                    ?
                </button>
                {/* Mission-control card */}
                <div className="z-10 mt-28 w-full max-w-3xl rounded-2xl border border-white/10 bg-black/20 p-10 text-center shadow-[0_0_110px_rgba(0,0,0,0.62)] backdrop-blur-[2.2px] md:mt-0">
                    {/* top mini label */}
                    <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs text-white/70">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--blue)] shadow-[0_0_14px_rgba(68,188,255,0.55)]" />
                        INTERACTIVE PLANETARIUM
                    </div>

                    <h1 className="leading-tight">
                        <TextShadow title="OrbitView" coloredTitle="." />
                    </h1>

                    {/* Option C copy */}
                    <h4 className="mt-3 text-white/90">Your pocket planetarium—built to be touched.</h4>

                    <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
                        Spin, zoom, and lock onto planets with buttery motion. Labels on hover. Details on click. A little science,
                        a lot of vibe.
                    </p>

                    {/* micro stat tiles */}
                    <div className="mx-auto mt-5 grid max-w-xl grid-cols-3 gap-2 text-xs text-white/60">
                        <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                            <div className="text-white/80">Controls</div>
                            <div>Drag • Zoom • Click</div>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                            <div className="text-white/80">Discover</div>
                            <div>Hover for names</div>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                            <div className="text-white/80">Focus</div>
                            <div>Instant lock-on</div>
                        </div>
                    </div>

                    {/* selected planet chips */}
                    <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
                            {selectedPlanet?.icon && (
                                <img
                                    src={selectedPlanet.icon}
                                    alt=""
                                    className="h-6 w-6 rounded-full opacity-90"
                                    loading="lazy"
                                />
                            )}
                            Selected: <span className="text-white">{planet}</span>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
                            Mode: <span className="text-white">Free explore</span>
                        </div>

                        {/* Resume last focus */}
                        {lastFocus && (
                            <button
                                onClick={resume}
                                aria-label={`Resume last focused planet: ${lastFocus}`}
                                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/25"
                            >
                                ⏪ Resume: <span className="text-white">{lastFocus}</span>
                            </button>
                        )}
                    </div>

                    {/* quick picks */}
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {QUICK_PICKS.map((p) => (
                            <button
                                key={p}
                                onClick={() => onQuickPick(p)}
                                aria-label={`Jump to ${p}`}
                                className={[
                                    'rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition',
                                    'focus:outline-none focus:ring-2 focus:ring-white/25',
                                    p === planet ? 'bg-white/12 text-white' : 'hover:bg-white/10',
                                ].join(' ')}
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                    {/* divider */}
                    <div className="mx-auto mt-8 h-px w-full max-w-xl bg-gradient-to-r from-transparent via-white/15 to-transparent" />

                    {/* actions */}
                    <div className="mt-8 grid gap-3 sm:grid-cols-3">
                        {/* Start Exploring */}
                        <button
                            // ref={startBtnRef}
                            onClick={goExplore}
                            aria-label="Start exploring the solar system"
                            className="group relative overflow-hidden rounded-xl bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
                        >
                            <span className="relative z-10">🪐 Start Exploring</span>

                            {/* moving glow strip */}
                            <span className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
                                <span className="absolute -left-1/2 top-0 h-full w-1/2 animate-[spin_1.3s_linear_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent blur-md" />
                            </span>
                        </button>

                        {/* Jump to planet */}
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                            <label className="block text-left text-xs text-white/60">Jump to planet</label>

                            <div className="mt-2 flex gap-2">
                                <select
                                    value={planet}
                                    onChange={(e) => setPlanet(e.target.value)}
                                    onKeyDown={onSelectKeyDown}
                                    aria-label="Select a planet to jump to"
                                    className="w-full rounded-lg bg-black/35 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-white/25"
                                >
                                    {planets.map((p) => (
                                        <option key={p} value={p}>
                                            {p}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    onClick={() => goPlanet(planet)}
                                    aria-label={`Go to ${planet}`}
                                    className="rounded-lg bg-white/10 px-3 text-sm font-semibold text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/25"
                                >
                                    Go
                                </button>
                            </div>

                            <div className="mt-2 text-left text-[11px] text-white/45">Tip: press Enter to go</div>
                        </div>

                        {/* Surprise */}
                        <button
                            onClick={goRandom}
                            aria-label="Surprise me with a random planet"
                            className="rounded-xl bg-gradient-to-r from-[#44BCFF]/25 to-[#FF675E]/20 px-5 py-3 font-semibold text-white transition hover:from-[#44BCFF]/35 hover:to-[#FF675E]/30 focus:outline-none focus:ring-2 focus:ring-white/25"
                        >
                            🎲 Surprise me
                        </button>
                    </div>

                    {/* clearer UX hint */}
                    <p className="pt-3 text-xs text-white/50">Drag to orbit • Scroll to zoom • Hover for names • Click to focus</p>
                </div>

                <Footer />
            </SectionComponent>
        </InViewAnimation>
    );
};

export default Introduction;
