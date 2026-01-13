'use client';

import React, { useCallback, useEffect, useId, useMemo } from 'react';
import { FaSliders } from 'react-icons/fa6';

type SceneSettingsMenuProps = {
     isOpen: boolean;
     setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;

     bloomEnabled: boolean;
     setBloomEnabled: React.Dispatch<React.SetStateAction<boolean>>;

     orbitRingsEnabled: boolean;
     setOrbitRingsEnabled: React.Dispatch<React.SetStateAction<boolean>>;

     orbitLinesEnabled: boolean;
     setOrbitLinesEnabled: React.Dispatch<React.SetStateAction<boolean>>;

     planetLabelsEnabled: boolean;
     setPlanetLabelsEnabled: React.Dispatch<React.SetStateAction<boolean>>;

     habitableZoneEnabled: boolean;
     setHabitableZoneEnabled: React.Dispatch<React.SetStateAction<boolean>>;

     timeScale: number;
     setTimeScale: React.Dispatch<React.SetStateAction<number>>;

     sfxEnabled: boolean;
     setSfxEnabled: React.Dispatch<React.SetStateAction<boolean>>;

     asteroidBeltEnabled: boolean;
     setAsteroidBeltEnabled: React.Dispatch<React.SetStateAction<boolean>>;

     atmospheresEnabled: boolean;
     setAtmospheresEnabled: React.Dispatch<React.SetStateAction<boolean>>;
};

type Settings = {
     bloomEnabled: boolean;
     orbitRingsEnabled: boolean;
     orbitLinesEnabled: boolean;
     planetLabelsEnabled: boolean;
     habitableZoneEnabled: boolean;

     timeWarp?: 'slow' | 'normal' | 'fast';
     sfxEnabled?: boolean;
     asteroidBeltEnabled?: boolean;
     atmospheresEnabled?: boolean;
};

const LS_KEY = 'ov_scene_settings_v4';

function safeReadSettings(): Partial<Settings> | null {
     try {
          const raw = window.localStorage.getItem(LS_KEY);
          if (!raw) return null;
          const parsed = JSON.parse(raw) as Partial<Settings>;
          return parsed && typeof parsed === 'object' ? parsed : null;
     } catch {
          return null;
     }
}

function safeWriteSettings(settings: Settings) {
     try {
          window.localStorage.setItem(LS_KEY, JSON.stringify(settings));
     } catch { }
}

const ToggleRow = React.memo(function ToggleRow({
     label,
     description,
     checked,
     onChange,
     id,
}: {
     label: string;
     description?: string;
     checked: boolean;
     onChange: (next: boolean) => void;
     id: string;
}) {
     return (
          <div className="flex items-start justify-between gap-3 py-2">
               <div className="min-w-0">
                    <label htmlFor={id} className="block text-sm font-medium text-white">
                         {label}
                    </label>
                    {description ? <p className="mt-0.5 text-xs text-white/65">{description}</p> : null}
               </div>

               <input
                    id={id}
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-white"
               />
          </div>
     );
});

export default function SceneSettingsMenu(props: SceneSettingsMenuProps) {
     const {
          isOpen,
          setIsOpen,
          bloomEnabled,
          setBloomEnabled,
          orbitRingsEnabled,
          setOrbitRingsEnabled,
          orbitLinesEnabled,
          setOrbitLinesEnabled,
          planetLabelsEnabled,
          setPlanetLabelsEnabled,
          habitableZoneEnabled,
          setHabitableZoneEnabled,
          timeScale,
          setTimeScale,
          sfxEnabled,
          setSfxEnabled,
          asteroidBeltEnabled,
          setAsteroidBeltEnabled,
          atmospheresEnabled,
          setAtmospheresEnabled,
     } = props;

     const baseId = useId();
     const ids = useMemo(
          () => ({
               bloom: `${baseId}-bloom`,
               rings: `${baseId}-rings`,
               lines: `${baseId}-lines`,
               labels: `${baseId}-labels`,
               hab: `${baseId}-hab`,
               sfx: `${baseId}-sfx`,
               belt: `${baseId}-belt`,
               atm: `${baseId}-atm`,
          }),
          [baseId],
     );

     const toggleOpen = useCallback(() => setIsOpen((v) => !v), [setIsOpen]);
     const close = useCallback(() => setIsOpen(false), [setIsOpen]);

     useEffect(() => {
          const saved = safeReadSettings();
          if (!saved) return;

          if (typeof saved.bloomEnabled === 'boolean') setBloomEnabled(saved.bloomEnabled);
          if (typeof saved.orbitRingsEnabled === 'boolean') setOrbitRingsEnabled(saved.orbitRingsEnabled);
          if (typeof saved.orbitLinesEnabled === 'boolean') setOrbitLinesEnabled(saved.orbitLinesEnabled);
          if (typeof saved.planetLabelsEnabled === 'boolean') setPlanetLabelsEnabled(saved.planetLabelsEnabled);
          if (typeof saved.habitableZoneEnabled === 'boolean') setHabitableZoneEnabled(saved.habitableZoneEnabled);

          if (saved.timeWarp === 'slow') setTimeScale(0.09);
          if (saved.timeWarp === 'normal') setTimeScale(0.18);
          if (saved.timeWarp === 'fast') setTimeScale(0.42);

          if (typeof saved.sfxEnabled === 'boolean') setSfxEnabled(saved.sfxEnabled);
          if (typeof saved.asteroidBeltEnabled === 'boolean') setAsteroidBeltEnabled(saved.asteroidBeltEnabled);
          if (typeof saved.atmospheresEnabled === 'boolean') setAtmospheresEnabled(saved.atmospheresEnabled);

          // eslint-disable-next-line react-hooks/exhaustive-deps
     }, []);

     useEffect(() => {
          const timeWarp = timeScale <= 0.1 ? 'slow' : timeScale >= 0.3 ? 'fast' : 'normal';

          safeWriteSettings({
               bloomEnabled,
               orbitRingsEnabled,
               orbitLinesEnabled,
               planetLabelsEnabled,
               habitableZoneEnabled,
               timeWarp,
               sfxEnabled,
               asteroidBeltEnabled,
               atmospheresEnabled,
          });
     }, [
          bloomEnabled,
          orbitRingsEnabled,
          orbitLinesEnabled,
          planetLabelsEnabled,
          habitableZoneEnabled,
          timeScale,
          sfxEnabled,
          asteroidBeltEnabled,
          atmospheresEnabled,
     ]);

     useEffect(() => {
          if (!isOpen) return;

          const onKeyDown = (e: KeyboardEvent) => {
               if (e.key === 'Escape') close();
          };

          window.addEventListener('keydown', onKeyDown);
          return () => window.removeEventListener('keydown', onKeyDown);
     }, [isOpen, close]);

     return (
          <div className="pointer-events-none">
               <button
                    type="button"
                    aria-label={isOpen ? 'Close scene settings' : 'Open scene settings'}
                    aria-expanded={isOpen}
                    onClick={toggleOpen}
                    className="pointer-events-auto flex items-center gap-2 rounded-lg bg-gray-900/40 px-3 py-2 text-sm text-white shadow-lg backdrop-blur-sm hover:bg-gray-900/55 focus:outline-none"
               >
                    <FaSliders />
                    <span className="hidden sm:inline">Scene</span>
               </button>

               {isOpen ? (
                    <div className="pointer-events-auto mt-3 w-[280px] rounded-xl bg-gray-900/35 p-4 text-white shadow-xl backdrop-blur-md">
                         <div className="mb-3 flex items-center justify-between">
                              <div>
                                   <p className="text-sm font-semibold">Scene Settings</p>
                                   <p className="text-xs text-white/65">Visual toggles (saved automatically)</p>
                              </div>

                              <button
                                   type="button"
                                   onClick={close}
                                   className="rounded-md bg-white/10 px-2 py-1 text-xs hover:bg-white/15"
                                   aria-label="Close scene settings"
                              >
                                   Close
                              </button>
                         </div>

                         <div className="mb-3 rounded-lg border border-white/10 bg-white/5 p-2">
                              <div className="mb-2 text-xs text-white/65">Time warp</div>
                              <div className="grid grid-cols-3 gap-2">
                                   <button
                                        type="button"
                                        onClick={() => setTimeScale(0.09)}
                                        className={['rounded-md px-2 py-1 text-xs', timeScale <= 0.1 ? 'bg-white/15' : 'bg-white/5 hover:bg-white/10'].join(' ')}
                                   >
                                        Slow
                                   </button>
                                   <button
                                        type="button"
                                        onClick={() => setTimeScale(0.18)}
                                        className={[
                                             'rounded-md px-2 py-1 text-xs',
                                             timeScale > 0.1 && timeScale < 0.3 ? 'bg-white/15' : 'bg-white/5 hover:bg-white/10',
                                        ].join(' ')}
                                   >
                                        Normal
                                   </button>
                                   <button
                                        type="button"
                                        onClick={() => setTimeScale(0.42)}
                                        className={['rounded-md px-2 py-1 text-xs', timeScale >= 0.3 ? 'bg-white/15' : 'bg-white/5 hover:bg-white/10'].join(' ')}
                                   >
                                        Fast
                                   </button>
                              </div>
                         </div>

                         <div className="divide-y divide-white/10">
                              <ToggleRow
                                   id={ids.bloom}
                                   label="Bloom"
                                   description="Glow from bright objects (postprocessing)"
                                   checked={bloomEnabled}
                                   onChange={setBloomEnabled}
                              />

                              <ToggleRow
                                   id={ids.rings}
                                   label="Orbit rings"
                                   description="Thin circular ring bands"
                                   checked={orbitRingsEnabled}
                                   onChange={setOrbitRingsEnabled}
                              />

                              <ToggleRow
                                   id={ids.lines}
                                   label="Orbit dashed lines"
                                   description="Dashed orbit lines overlay"
                                   checked={orbitLinesEnabled}
                                   onChange={setOrbitLinesEnabled}
                              />

                              <ToggleRow
                                   id={ids.labels}
                                   label="Planet labels"
                                   description="Show planet name tags"
                                   checked={planetLabelsEnabled}
                                   onChange={setPlanetLabelsEnabled}
                              />

                              <ToggleRow
                                   id={ids.hab}
                                   label="Habitable zone"
                                   description="Subtle hot/green/cold bands"
                                   checked={habitableZoneEnabled}
                                   onChange={setHabitableZoneEnabled}
                              />

                              {/* ✅ NEW: FX-only toggle */}
                              <ToggleRow
                                   id={ids.sfx}
                                   label="UI sound FX"
                                   description="Button clicks, toggles, focus sounds"
                                   checked={sfxEnabled}
                                   onChange={setSfxEnabled}
                              />

                              <ToggleRow
                                   id={ids.belt}
                                   label="Asteroid belt"
                                   description="Adds the main belt between Mars & Jupiter"
                                   checked={asteroidBeltEnabled}
                                   onChange={setAsteroidBeltEnabled}
                              />

                              <ToggleRow
                                   id={ids.atm}
                                   label="Atmospheres"
                                   description="Subtle limb glow shells (Earth/Venus/Mars)"
                                   checked={atmospheresEnabled}
                                   onChange={setAtmospheresEnabled}
                              />
                         </div>
                    </div>
               ) : null}
          </div>
     );
}
