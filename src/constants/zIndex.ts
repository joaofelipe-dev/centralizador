export const zIndex = {
  sticky: 80,
  nav: 90,
  floating: 100,
  overlay: 110,
  modal: 120,
  toast: 130,
} as const;

export type ZIndexKey = keyof typeof zIndex;
