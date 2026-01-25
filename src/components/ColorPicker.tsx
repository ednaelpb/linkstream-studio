import { useState, useEffect } from "react";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

// Convert HSL string to hex for color input
function hslToHex(hsl: string): string {
  const match = hsl.match(/(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%/);
  if (!match) return "#3b82f6";
  
  const h = parseFloat(match[1]);
  const s = parseFloat(match[2]) / 100;
  const l = parseFloat(match[3]) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Convert hex to HSL string
function hexToHsl(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "190 80% 50%";

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [hexValue, setHexValue] = useState(() => hslToHex(value));

  useEffect(() => {
    setHexValue(hslToHex(value));
  }, [value]);

  const handleChange = (hex: string) => {
    setHexValue(hex);
    onChange(hexToHsl(hex));
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground block">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <div 
          className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-border cursor-pointer"
          style={{ background: `hsl(${value})` }}
        >
          <input
            type="color"
            value={hexValue}
            onChange={(e) => handleChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <input
          type="text"
          value={hexValue}
          onChange={(e) => handleChange(e.target.value)}
          className="flex-1 h-10 px-3 rounded-lg bg-input border border-border text-foreground text-sm font-mono uppercase"
          maxLength={7}
        />
      </div>
    </div>
  );
}
