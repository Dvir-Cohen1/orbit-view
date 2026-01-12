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
};

type Settings = {
     bloomEnabled: boolean;
     orbitRingsEnabled: boolean;
     orbitLinesEnabled: boolean;
     planetLabelsEnabled: boolean;

     habitableZoneEnabled: boolean;
};

const LS_KEY = 'ov_scene_settings_v2';

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
     } catch {
          // ignore storage failures
     }
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
     } = props;

     const baseId = useId();
     const ids = useMemo(
          () => ({
               bloom: `${baseId}-bloom`,
               rings: `${baseId}-rings`,
               lines: `${baseId}-lines`,
               labels: `${baseId}-labels`,
               hab: `${baseId}-hab`,
          }),
          [baseId],
     );

     const toggleOpen = useCallback(() => setIsOpen((v) => !v), [setIsOpen]);
     const close = useCallback(() => setIsOpen(false), [setIsOpen]);

     // Load persisted settings once
     useEffect(() => {
          const saved = safeReadSettings();
          if (!saved) return;

          if (typeof saved.bloomEnabled === 'boolean') setBloomEnabled(saved.bloomEnabled);
          if (typeof saved.orbitRingsEnabled === 'boolean') setOrbitRingsEnabled(saved.orbitRingsEnabled);
          if (typeof saved.orbitLinesEnabled === 'boolean') setOrbitLinesEnabled(saved.orbitLinesEnabled);
          if (typeof saved.planetLabelsEnabled === 'boolean') setPlanetLabelsEnabled(saved.planetLabelsEnabled);
          if (typeof saved.habitableZoneEnabled === 'boolean') setHabitableZoneEnabled(saved.habitableZoneEnabled);

          // eslint-disable-next-line react-hooks/exhaustive-deps
     }, []);

     // Persist whenever any setting changes
     useEffect(() => {
          safeWriteSettings({
               bloomEnabled,
               orbitRingsEnabled,
               orbitLinesEnabled,
               planetLabelsEnabled,
               habitableZoneEnabled,
          });
     }, [bloomEnabled, orbitRingsEnabled, orbitLinesEnabled, planetLabelsEnabled, habitableZoneEnabled]);

     // ESC closes panel
     useEffect(() => {
          if (!isOpen) return;

          const onKeyDown = (e: KeyboardEvent) => {
               if (e.key === 'Escape') close();
          };

          window.addEventListener('keydown', onKeyDown);
          return () => window.removeEventListener('keydown', onKeyDown);
     }, [isOpen, close]);

     return (
          <aside className="pointer-events-none absolute right-4 top-4 z-50">
               {/* Floating button */}
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

               {/* Panel */}
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
                         </div>
                    </div>
               ) : null}
          </aside>
     );
}
