'use client';

import { useCallback, useEffect, useRef } from 'react';

type Key = 'click' | 'toggle' | 'focus';

type Options = {
    volume?: number;
    enabled?: boolean;
};

export function useSfx(
    map: Partial<Record<Key, string>>,
    { volume = 0.22, enabled = true }: Options = {}
) {
    const audiosRef = useRef<Partial<Record<Key, HTMLAudioElement>>>({});

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const next: Partial<Record<Key, HTMLAudioElement>> = {};

        (Object.keys(map) as Key[]).forEach((k) => {
            const src = map[k];
            if (!src) return;

            const a = window.document.createElement('audio');
            a.src = src;
            a.preload = 'auto';
            // a.playsInline = true;
            a.volume = volume;

            next[k] = a;
        });

        audiosRef.current = next;

        return () => {
            (Object.values(audiosRef.current) as HTMLAudioElement[]).forEach((a) => {
                try {
                    a.pause();
                    a.src = '';
                } catch {}
            });
            audiosRef.current = {};
        };
    }, [map, volume]);

    useEffect(() => {
        (Object.values(audiosRef.current) as HTMLAudioElement[]).forEach((a) => {
            a.volume = volume;
        });
    }, [volume]);

    const play = useCallback(
        (key: Key) => {
            if (!enabled) return;
            const a = audiosRef.current[key];
            if (!a) return;

            try {
                const node = a.cloneNode(true) as HTMLAudioElement;
                node.volume = a.volume;
                node.currentTime = 0;
                void node.play();
            } catch {}
        },
        [enabled]
    );

    return { play };
}
