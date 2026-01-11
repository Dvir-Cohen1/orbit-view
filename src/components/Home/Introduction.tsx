'use client';

import React, { useMemo, useState } from 'react';
import TextShadow from '../common/TextShadow';
import InViewAnimation from '../common/InViewAnimation';
import SectionComponent from '../common/SectionComponent';
import { useRouter } from 'next/navigation';
import Footer from '../Layout/Footer';
import { PLANETS } from '@/constants/solarSystem.constants';
// import OrbitHeroBackdrop from '@/components/home/OrbitHeroBackdrop';
import { useMagnetic } from '@/hooks/useMagnetic';
import OrbitHeroBackdrop from './OrbitHeroBackdrop';
const Introduction: React.FC = () => {
    const router = useRouter();
    const [planet, setPlanet] = useState<string>('Earth');

    const planets = useMemo(() => PLANETS.map((p) => p.name), []);
    const buttonRef = useMagnetic<HTMLButtonElement>(0.18);

    const goExplore = () => router.push('/solar-system');

    // If your solar-system page can read this query param and auto-focus,
    // it becomes SUPER satisfying. (Implementation below.)
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

                {/* glass card */}
                <div className="z-10 mt-36 w-full max-w-3xl space-y-7 rounded-2xl border border-white/10 bg-black/10 p-10 text-center shadow-[0_0_80px_rgba(0,0,0,0.55)] backdrop-blur-md md:mt-0">
                    <h1>
                        <TextShadow title="OrbitView" coloredTitle="." />
                    </h1>

                    <h4 className="text-white/90">
                        Explore the cosmos, one <span className="text-[var(--blue)]">orbit</span> at a time.
                    </h4>

                    <p className="text-lg text-white/75">
                        A 3D solar system simulation built with React and Three.js — curated exploration, fast focus,
                        and cinematic motion.
                    </p>

                    {/* actions */}
                    <div className="mt-8 grid gap-3 sm:grid-cols-3">
                        <button
                            ref={buttonRef}
                            onClick={goExplore}
                            className="rounded-xl bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
                        >
                            🪐 Start Exploring
                        </button>

                        <div className="rounded-xl bg-white/5 p-3">
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
                                    className="rounded-lg bg-white/10 px-3 text-sm font-semibold text-white transition hover:bg-white/15"
                                >
                                    Go
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={goRandom}
                            className="rounded-xl bg-gradient-to-r from-[#44BCFF]/25 to-[#FF675E]/20 px-5 py-3 font-semibold text-white transition hover:from-[#44BCFF]/35 hover:to-[#FF675E]/30 focus:outline-none focus:ring-2 focus:ring-white/25"
                        >
                            🎲 Surprise me
                        </button>
                    </div>

                    {/* micro-interaction hint */}
                    <p className="pt-2 text-xs text-white/45">
                        Tip: Hover planets in the simulator to reveal labels — click to focus.
                    </p>
                </div>

                <Footer />
            </SectionComponent>
        </InViewAnimation>
    );
};

export default Introduction;
