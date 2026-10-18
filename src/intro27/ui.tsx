// Real FansaChat builder chrome (rebuilt from fansa-landing/public/workflow.html) + brand lockup.
import React from 'react';
import {continueRender, delayRender, Easing, Img, interpolate, staticFile} from 'remotion';
import {loadFont as inter} from '@remotion/google-fonts/Inter';
import {loadFont as sora} from '@remotion/google-fonts/Sora';
import * as si from 'simple-icons';

export const FONT = {
  ui: inter('normal', {weights: ['400', '500', '600', '700'], subsets: ['latin']}).fontFamily,
  sora: sora('normal', {weights: ['600', '700'], subsets: ['latin']}).fontFamily,
  clash: 'Clash Display',
};
// Clash Display = the landing's display face (public/fonts, same files fansachat.com serves)
if (typeof document !== 'undefined' && !document.getElementById('clash-ff')) {
  // NB: document.fonts.check() returns true for unknown families, so always register + wait explicitly
  const h = delayRender('clash display');
  const st = document.createElement('style'); st.id = 'clash-ff';
  st.textContent = [500, 600].map((w) => `@font-face{font-family:'Clash Display';font-weight:${w};font-style:normal;src:url('${staticFile(`fonts/clash-display-${w}.woff2`)}') format('woff2');}`).join('');
  document.head.appendChild(st);
  Promise.all([document.fonts.load('500 40px "Clash Display"'), document.fonts.load('600 40px "Clash Display"')]).then(() => continueRender(h)).catch(() => continueRender(h));
}

export type Theme = {bg: string; ink: string; lo: string; panel: string; panel2: string; line: string; edge: string; node: string; accent: string; streakA: string; streakB: string; dark: boolean};
export const THEMES: Record<'light' | 'dark', Theme> = {
  light: {bg: '#F7F6F9', ink: '#221E30', lo: '#6A6580', panel: 'rgba(255,255,255,0.78)', panel2: '#F1EFF8', line: 'rgba(32,28,46,0.10)', edge: '#2B2734', node: '#FFFFFF', accent: '#6468D8', streakA: 'rgba(139,143,232,0.30)', streakB: 'rgba(244,184,168,0.32)', dark: false},
  dark: {bg: '#100D16', ink: '#EDEBF5', lo: '#9A95B0', panel: 'rgba(28,24,38,0.82)', panel2: '#1C1826', line: 'rgba(255,255,255,0.10)', edge: '#CFCBE0', node: '#1C1826', accent: '#8B8FE8', streakA: 'rgba(139,143,232,0.16)', streakB: 'rgba(244,184,168,0.12)', dark: true},
};
export const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ez = (f: number, a: number, b: number, e = EXPO) => interpolate(f, [a, b], [0, 1], {...clamp, easing: e});

// ---------- icons: monochrome glyphs, exactly how the builder draws them ----------
const SI: Record<string, string> = {stripe: 'siStripe', drive: 'siGoogledrive', gmail: 'siGmail', xero: 'siXero', calendly: 'siCalendly', meta: 'siMeta', hubspot: 'siHubspot', gsc: 'siGooglesearchconsole', slides: 'siGoogleslides', figma: 'siFigma', shopify: 'siShopify', notion: 'siNotion', quickbooks: 'siQuickbooks', typeform: 'siTypeform', zendesk: 'siZendesk', mailchimp: 'siMailchimp', asana: 'siAsana', clickup: 'siClickup', webflow: 'siWebflow', airtable: 'siAirtable', dropbox: 'siDropbox', github: 'siGithub', jira: 'siJira', trello: 'siTrello', woo: 'siWoocommerce', intercom: 'siIntercom', discord: 'siDiscord', telegram: 'siTelegram', wordpress: 'siWordpress', paypal: 'siPaypal', zoom: 'siZoom', gcal: 'siGooglecalendar', linear: 'siLinear', canva: 'siCanva', squarespace: 'siSquarespace', wix: 'siWix', klaviyo: 'siKlaviyo', etsy: 'siEtsy', youtube: 'siYoutube'};
const LETTER: Record<string, string> = {docusign: 'DS', pipedrive: 'p', slack: '#', acuity: 'A', twilio: 'T', shippo: 'S'};
export const Glyph: React.FC<{k: string; size: number; color: string}> = ({k, size, color}) => {
  const s = size;
  if (k === 'ai') return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round"><path d="M12 3l1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9z" /><path d="M19 3v4M17 5h4" strokeLinecap="round" /></svg>;
  if (k === 'wait') return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>;
  if (k === 'schedule') return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M3.5 9.5h17M8 3v4M16 3v4" /></svg>;
  if (k === 'router') return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="2" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="9" r="2" /><path d="M6 8v8M6 12c0-3 4-3 10-3" /></svg>;
  const ic = SI[k] ? (si as unknown as Record<string, {path: string} | undefined>)[SI[k]] : undefined;
  if (ic) return <svg width={s} height={s} viewBox="0 0 24 24"><path d={ic.path} fill={color} /></svg>;
  const L = LETTER[k] ?? k.slice(0, 1).toUpperCase();
  return <svg width={s} height={s} viewBox="0 0 24 24"><text x="12" y="17" textAnchor="middle" fontFamily="Inter, Arial" fontWeight="800" fontSize={L.length > 1 ? 11 : 17} fill={color}>{L}</text></svg>;
};

// ---------- the brand lockup (Nav.jsx: logo-fansa as drawn + Sora 700 wordmark with the brand gradient) ----------
export const Lockup: React.FC<{f: number; at: number; size: number; th: Theme; sub?: React.ReactNode}> = ({f, at, size, th, sub}) => {
  const k = ez(f, at, at + 36); const kw = ez(f, at + 18, at + 60); const glint = ez(f, at - 30, at + 30, Easing.inOut(Easing.cubic));
  return <div style={{position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: size * 0.1}}>
    <div style={{position: 'relative', width: size, height: size}}>
      <Img src={staticFile('logo-fansa.png')} style={{width: size, height: size, objectFit: 'contain', opacity: k, transform: `scale(${0.965 + 0.035 * k})`, filter: `drop-shadow(0 ${size * 0.06}px ${size * 0.16}px rgba(124,92,224,${0.28 * k}))`}} />
      {/* glint: a thin specular line that crosses the mark once */}
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden', WebkitMaskImage: `url(${staticFile('logo-fansa.png')})`, WebkitMaskSize: 'contain', maskImage: `url(${staticFile('logo-fansa.png')})`, maskSize: 'contain'}}>
        <div style={{position: 'absolute', top: '-30%', bottom: '-30%', width: '22%', left: `${-40 + glint * 150}%`, transform: 'rotate(18deg)', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.85), transparent)', opacity: k}} />
      </div>
    </div>
    <div style={{overflow: 'hidden', paddingBottom: size * 0.06}}>
      <div style={{transform: `translateY(${(1 - kw) * 105}%)`, fontFamily: FONT.sora, fontWeight: 700, fontSize: size * 0.42, letterSpacing: '-0.02em', lineHeight: 1.1, backgroundImage: 'linear-gradient(180deg,#6468D8 0%,#8B8FE8 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>FansaChat</div>
    </div>
    {sub ? <div style={{opacity: ez(f, at + 46, at + 70), transform: `translateY(${(1 - ez(f, at + 46, at + 70)) * 8}px)`}}>{sub}</div> : null}
  </div>;
};

// ---------- headline: whole-line masked reveal, solid ink ----------
export const Line: React.FC<{text: string; f: number; at: number; size: number; color: string; weight?: number; out?: number}> = ({text, f, at, size, color, weight = 600, out}) => {
  const k = ez(f, at, at + 30); const ko = out !== undefined ? ez(f, out, out + 24, Easing.in(Easing.cubic)) : 0;
  return <div style={{overflow: 'hidden', padding: `${size * 0.08}px ${size * 0.04}px`}}>
    <div style={{transform: `translateY(${(1 - k) * 110 - ko * 110}%)`, fontFamily: FONT.clash, fontWeight: weight, fontSize: size, color, letterSpacing: '-0.02em', lineHeight: 1.04, whiteSpace: 'nowrap'}}>{text}</div>
  </div>;
};
// a word that rolls in place (outgoing goes up, incoming comes from below), one mask
export const Roll: React.FC<{words: string[]; ats: number[]; f: number; size: number; color: string}> = ({words, ats, f, size, color}) => {
  let i = -1; ats.forEach((a, j) => { if (f >= a) i = j; });
  return <div style={{position: 'relative', overflow: 'hidden', height: size * 1.2, width: size * 9, maxWidth: '96vw'}}>
    {words.map((w, j) => { if (j < i - 1 || j > i) return null; const kin = ez(f, ats[j], ats[j] + 22); const kout = j < i ? ez(f, ats[i], ats[i] + 22) : 0; return <div key={j} style={{position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', transform: `translateY(${(1 - kin) * 105 - kout * 105}%)`, fontFamily: FONT.clash, fontWeight: 600, fontSize: size, lineHeight: 1.2, color, letterSpacing: '-0.025em', whiteSpace: 'nowrap'}}>{w}</div>; })}
  </div>;
};
