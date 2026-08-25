export const Colors = {
  // Base and text
  Bg: '#F6F7F9',
  Surface: '#FFFFFF',
  SurfaceAlt: '#F1F3F7',
  Border: '#E2E6EC',
  InputBorder: '#C6CCD6',
  Text: '#1E1F22',
  Text2: '#5F646D',
  Text3: '#686E75',

  // Brand
  Brand: '#5F7DF7',
  BrandFill: '#4A5FD4',
  BrandStrong: '#3F52C2',
  BrandInk: '#3A55C0',
  BrandSoft: '#EEF1FF',
  OnFill: '#FFFFFF',

  // Semantic status
  Success: '#4B9B88',
  SuccessFill: '#3D8272',
  SuccessInk: '#2F7062',
  SuccessSoft: '#E7F3F0',
  Danger: '#C95763',
  DangerFill: '#B0424E',
  DangerInk: '#A8323F',
  DangerSoft: '#FBECEF',
  WarningInk: '#8A5416',
  WarningSoft: '#FDF0E0',
} as const;

export type ColorToken = keyof typeof Colors;

export const Tone = {
  Bread: { bg: '#FDF0E0', ink: '#8A5416', deep: '#7A4A12' },
  Cake: { bg: '#EEF1FF', ink: '#3A55C0', deep: '#33489F' },
  Card: { bg: '#F0EEFB', ink: '#4F42A3', deep: '#453A8C' },
  Pastry: { bg: '#F7EDF6', ink: '#7A3C74', deep: '#6A3465' },
  Beverage: { bg: '#E7F3F0', ink: '#2F7062', deep: '#296157' },
} as const;

export type ToneName = keyof typeof Tone;

export const Typography = {
  Xs: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
  XsMedium: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
  XsSemi: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const },
  Overline: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const, letterSpacing: 0.6 },
  Sm: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
  SmMedium: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
  SmSemi: { fontSize: 13, lineHeight: 18, fontWeight: '600' as const },
  SmBold: { fontSize: 13, lineHeight: 18, fontWeight: '700' as const },
  Md: { fontSize: 15, lineHeight: 21, fontWeight: '400' as const },
  MdMedium: { fontSize: 15, lineHeight: 21, fontWeight: '500' as const },
  MdSemi: { fontSize: 15, lineHeight: 21, fontWeight: '600' as const },
  MdBold: { fontSize: 15, lineHeight: 21, fontWeight: '700' as const },
  Lg: { fontSize: 17, lineHeight: 23, fontWeight: '600' as const },
  LgBold: { fontSize: 17, lineHeight: 23, fontWeight: '700' as const },
  Xl: { fontSize: 20, lineHeight: 26, fontWeight: '700' as const, letterSpacing: -0.4 },
  Xxl: { fontSize: 24, lineHeight: 30, fontWeight: '700' as const, letterSpacing: -0.5 },
  Display: { fontSize: 32, lineHeight: 38, fontWeight: '700' as const, letterSpacing: -1.0 },
} as const;

export const Spacing = {
  s1: 4,
  s2: 8,
  s3: 12,
  s4: 16,
  s5: 20,
  s6: 24,
  s8: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
  sheet: 24,
} as const;

export const Sizes = {
  touch: 48,
  control: 48,
  appBar: 60,
  keypadKey: 56,
} as const;

export const LayoutConstants = {
  MaxColumn: 560,
  WideColumn: 980,
} as const;
