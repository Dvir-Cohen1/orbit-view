// Introduction.tsx
'use client';

import React, { useMemo, useState } from 'react';
import TextShadow from '../common/TextShadow';
import InViewAnimation from '../common/InViewAnimation';
import SectionComponent from '../common/SectionComponent';
import { useRouter } from 'next/navigation';
import Footer from '../Layout/Footer';
import { PLANETS } from '@/constants/solarSystem.constants';
import OrbitHeroBackdrop from './OrbitHeroBackdrop';
import { useMagnetic } from '@/hooks/useMagnetic';

const Introduction: React.FC = () => {
    const router = useRouter();
    const [planet, setPlanet] = useState<string>('Earth');

    const planets = useMemo(() => PLANETS.map((p) => p.name), []);
    const selectedPlanet = useMemo(() => PLANETS.find((p) => p.name === planet), [planet]);

    // const startBtnRef = useMagnetic<HTMLButtonElement>(0.18);

    const goExplore = () => router.push('/solar-system');
    const goPlanet = (name: string) => router.push(`/solar-system?focus=${encodeURIComponent(name)}`);

    const goRandom = () => {
        const pick = planets[Math.floor(Math.random() * planets.length)];
        setPlanet(pick);
        goPlanet(pick);
    };

    return (
        <InViewAnimation>
            <SectionComponent
                id="About"
                className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
            >
                <OrbitHeroBackdrop />

                {/* Mission-control card */}
                <div className="z-10 mt-28 w-full max-w-3xl rounded-2xl border border-white/10 bg-black/20 p-10 text-center shadow-[0_0_110px_rgba(0,0,0,0.62)] backdrop-blur-md md:mt-0">
                    {/* top mini label */}
                    <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs text-white/70">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--blue)] shadow-[0_0_14px_rgba(68,188,255,0.55)]" />
                        LIVE ORBIT SIMULATOR
                    </div>

                    <h1 className="leading-tight">
                        <TextShadow title="OrbitView" coloredTitle="." />
                    </h1>

                    <h4 className="mt-3 text-white/90">
                        Explore the cosmos, one <span className="text-[var(--blue)]">orbit</span> at a time.
                    </h4>

                    <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
                        A 3D solar system simulation built with React and Three.js — curated exploration, fast focus,
                        and cinematic motion.
                    </p>

                    {/* planet preview chips */}
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
                    </div>

                    {/* divider */}
                    <div className="mx-auto mt-8 h-px w-full max-w-xl bg-gradient-to-r from-transparent via-white/15 to-transparent" />

                    {/* actions */}
                    <div className="mt-8 grid gap-3 sm:grid-cols-3">
                        {/* Start Exploring (launch feeling) */}
                        <button
                            // ref={startBtnRef}
                            onClick={goExplore}
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
                                    className="rounded-lg bg-white/10 px-3 text-sm font-semibold text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/25"
                                >
                                    Go
                                </button>
                            </div>
                        </div>

                        {/* Surprise */}
                        <button
                            onClick={goRandom}
                            className="rounded-xl bg-gradient-to-r from-[#44BCFF]/25 to-[#FF675E]/20 px-5 py-3 font-semibold text-white transition hover:from-[#44BCFF]/35 hover:to-[#FF675E]/30 focus:outline-none focus:ring-2 focus:ring-white/25"
                        >
                            🎲 Surprise me
                        </button>
                    </div>

                    {/* micro-interaction hint */}
                    <p className="pt-3 text-xs text-white/45">
                        Tip: Hover planets in the simulator to reveal labels — click to focus.
                    </p>
                </div>

                <Footer />
            </SectionComponent>
        </InViewAnimation>
    );
};

export default Introduction;
