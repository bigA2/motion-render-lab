// OFL fonts from Google Fonts (same families as the presets lab): loaded at render time, not committed.
import {loadFont as bricolage} from '@remotion/google-fonts/BricolageGrotesque';
import {loadFont as instSans} from '@remotion/google-fonts/InstrumentSans';
import {loadFont as instSerif} from '@remotion/google-fonts/InstrumentSerif';
import {loadFont as jbMono} from '@remotion/google-fonts/JetBrainsMono';

const L = {subsets: ['latin'] as ('latin')[]};
export const F = {
  display: bricolage('normal', {weights: ['500', '700', '800'], ...L}).fontFamily,
  sans: instSans('normal', {weights: ['400', '500', '600', '700'], ...L}).fontFamily,
  serif: instSerif('italic', {weights: ['400'], ...L}).fontFamily,
  serifUp: instSerif('normal', {weights: ['400'], ...L}).fontFamily,
  mono: jbMono('normal', {weights: ['400', '500', '700'], ...L}).fontFamily,
};
