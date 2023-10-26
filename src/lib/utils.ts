import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isIframe = window && window.location !== window.parent.location;

export const getPunkAvatar = (timestamp: number) =>
  `/images/punk/punk${(timestamp % 100).toString().padStart(3, "0")}.png`;

// A function that converts a hex color to an HSL color
export function hexToHsl(hex: string) {
  // Remove the # symbol from the hex color

  // Convert the hex color to RGB values
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  // Find the maximum and minimum RGB values
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  // Calculate the hue, saturation, and lightness
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

  // If the max and min are not equal, calculate the hue and saturation
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  // Convert the hue, saturation, and lightness to degrees, percentages, and percentages
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  // Return the HSL color as an array of numbers
  return `${h} ${s}% ${l}%`;
}
