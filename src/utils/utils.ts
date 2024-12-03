const MIN_RADIUS: number = 3;
const MAX_RADIUS: number = 90;
const DEPTH: number = 90;
const LEFT_COLOR: string = '0078D7';
const RIGHT_COLOR: string = '3FB950';
const NUM_POINTS: number = 1500;

const getGradientStop = (ratio: number): string => {
    // For outer ring numbers potentially past max radius,
    // just clamp to 0
    ratio = ratio > 1 ? 1 : ratio < 0 ? 0 : ratio;

    const c0: number[] = LEFT_COLOR.match(/.{1,2}/g)!.map(
        (oct: string) => parseInt(oct, 16) * (1 - ratio)
    );
    const c1: number[] = RIGHT_COLOR.match(/.{1,2}/g)!.map(
        (oct: string) => parseInt(oct, 16) * ratio
    );
    const ci: number[] = [0, 1, 2].map((i: number) => Math.min(Math.round(c0[i] + c1[i]), 255));
    const color: string = ci
        .reduce((a: number, v: number) => (a << 8) + v, 0)
        .toString(16)
        .padStart(6, '0');

    return `#${color}`;
};

const calculateColor = (x: number): string => {
    const maxDiff: number = MAX_RADIUS * 2;
    const distance: number = x + MAX_RADIUS;

    const ratio: number = distance / maxDiff;

    const stop: string = getGradientStop(ratio);
    return stop;
};

const randomFromInterval = (min: number, max: number): number => {
    return Math.random() * (max - min) + min;
};

interface Point {
    idx: number;
    position: [number, number, number];
    color: string;
}

export const pointsInner: Point[] = Array.from({ length: NUM_POINTS }, (_v, k) => k + 1).map(
    (num: number) => {
        const randomRadius: number = randomFromInterval(MIN_RADIUS, MAX_RADIUS);
        const randomAngle: number = Math.random() * Math.PI * 2;

        const x: number = Math.cos(randomAngle) * randomRadius;
        const y: number = Math.sin(randomAngle) * randomRadius;
        const z: number = randomFromInterval(-DEPTH, DEPTH);

        const color: string = calculateColor(x);

        return {
            idx: num,
            position: [x, y, z],
            color,
        };
    }
);

export const pointsOuter: Point[] = Array.from({ length: NUM_POINTS / 4 }, (_v, k) => k + 1).map(
    (num: number) => {
        const randomRadius: number = randomFromInterval(MIN_RADIUS / 2, MAX_RADIUS * 2);
        const angle: number = Math.random() * Math.PI * 2;

        const x: number = Math.cos(angle) * randomRadius;
        const y: number = Math.sin(angle) * randomRadius;
        const z: number = randomFromInterval(-DEPTH * 10, DEPTH * 10);

        const color: string = calculateColor(x);

        return {
            idx: num,
            position: [x, y, z],
            color,
        };
    }
);
