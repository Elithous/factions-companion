export interface GradientOptions {
    weight: number,
    color: string
}

export function weightToColor(weight: number, gradient: GradientOptions[]) {
    // Ensure weight is between 0 and 1
    weight = Math.max(0, Math.min(1, weight));

    // Find the two color stops that the weight falls between
    let i;
    for (i = 1; i < gradient.length; i++) {
        if (weight <= gradient[i].weight) {
            break;
        }
    }
    const stop1 = gradient[i - 1];
    const stop2 = gradient[i];

    // Interpolate the color values
    const fraction = (weight - stop1.weight) / (stop2.weight - stop1.weight);
    const color = interpolateColor(stop1.color, stop2.color, fraction);

    return color;
}

export function interpolateColor(color1: string, color2: string, fraction: number) {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);

    const r = Math.round(c1.r + (c2.r - c1.r) * fraction);
    const g = Math.round(c1.g + (c2.g - c1.g) * fraction);
    const b = Math.round(c1.b + (c2.b - c1.b) * fraction);

    return `rgb(${r}, ${g}, ${b})`;
}

export function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}