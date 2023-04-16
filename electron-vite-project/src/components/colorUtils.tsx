interface CIExyYColor {
  x: number;
  y: number;
  Y: number;
}

interface RGBColor {
  r: number;
  g: number;
  b: number;
}

// Convert RGB to CIE xyY
export const rgbToXyY = (r: number, g: number, b: number): CIExyYColor => {
  const gammaCorrect = (value: number): number => {
    if (value <= 0.04045) {
      return value / 12.92;
    } else {
      return Math.pow((value + 0.055) / 1.055, 2.4);
    }
  };

  const gammaCorrectedR = gammaCorrect(r / 255);
  const gammaCorrectedG = gammaCorrect(g / 255);
  const gammaCorrectedB = gammaCorrect(b / 255);

  const X = gammaCorrectedR * 0.4124 + gammaCorrectedG * 0.3576 + gammaCorrectedB * 0.1805;
  const Y = gammaCorrectedR * 0.2126 + gammaCorrectedG * 0.7152 + gammaCorrectedB * 0.0722;
  const Z = gammaCorrectedR * 0.0193 + gammaCorrectedG * 0.1192 + gammaCorrectedB * 0.9505;

  const x = X / (X + Y + Z);
  const y = Y / (X + Y + Z);

  return { x, y, Y };
};

// Convert CIE xyY to RGB
export const xyYToRgb = (x: number, y: number, Y: number): RGBColor => {
  const X = (Y / y) * x;
  const Z = (Y / y) * (1 - x - y);

  const rLinear = X * 3.2406 + Y * -1.5372 + Z * -0.4986;
  const gLinear = X * -0.9689 + Y * 1.8758 + Z * 0.0415;
  const bLinear = X * 0.0557 + Y * -0.2040 + Z * 1.0570;

  const gammaCorrect = (value: number): number => {
    if (value <= 0.0031308) {
      return 12.92 * value;
    } else {
      return 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
    }
  };

  const r = gammaCorrect(rLinear) * 255;
  const g = gammaCorrect(gLinear) * 255;
  const b = gammaCorrect(bLinear) * 255;

  return { r, g, b };
};
