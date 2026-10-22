export type Replace = {text?: Record<string, string>; colors?: Record<string, string>};
export type Fit = 'native' | '4x5' | '16x9';
export const FIT_SIZE: Record<Exclude<Fit, 'native'>, {w: number; h: number}> = {'4x5': {w: 1080, h: 1350}, '16x9': {w: 1920, h: 1080}};

export const parseHex = (h: string): [number, number, number] | null => {
  let s = h.trim().replace('#', '');
  if (s.length === 3) s = s.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(s)) return null;
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16)) as [number, number, number];
};
export const toHex = ([r, g, b]: number[]) => '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');

/** Replace map text: exact match first, otherwise substring replace. */
export const swapText = (s: string, map?: Record<string, string>) => {
  if (!map) return s;
  const norm = s.replace(/\r/g, '\n');
  if (norm in map) return map[norm];
  let out = s;
  for (const [a, b] of Object.entries(map)) if (a) out = out.split(a).join(b);
  return out;
};

/** Scale factor to place a w*h content box in a W*H frame ("meet" = whole content visible, "cover" = fills frame). */
export const fitScale = (w: number, h: number, W: number, H: number, mode: 'meet' | 'cover' = 'meet') =>
  mode === 'meet' ? Math.min(W / w, H / h) : Math.max(W / w, H / h);
