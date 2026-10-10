// Mirrors scripts/timing_intro.py (seconds). Keep both in sync.
export const TOTAL_S = 55;
export const VO = {
  hook: {at: 0.3, dur: 2.67, text: "You didn't start a business… to copy and paste."},
  pain: {at: 3.6, dur: 3.71, text: 'Invoices into sheets. Leads into Slack. Every. Single. Day.'},
  meet: {at: 8.3, dur: 3.86, text: 'Meet FansaChat. AI workflow automation, in plain English.'},
  type: {at: 12.8, dur: 2.2, text: 'Just type what you need, in one sentence.'},
  build: {at: 18.7, dur: 4.05, text: 'And it builds the whole workflow for you. No flowcharts. No code.'},
  stats: {at: 23.9, dur: 7.98, text: 'Seven hundred plus integrations. Twenty-two verified MCP servers. Four hundred seventy-eight templates.'},
  origin: {at: 33.0, dur: 1.92, text: 'Built from Bangladesh, for the world.'},
  first: {at: 35.3, dur: 4.74, text: "FansaChat is Bangladesh's first plain-English workflow automation tool."},
  founder: {at: 42.3, dur: 3.84, text: "Made by a solo founder, for teams who'd rather say it, than build it."},
  cta: {at: 46.9, dur: 5.61, text: 'FansaChat. From fifteen dollars a month. Join the waitlist at fansachat.com.'},
} as const;
// Burned captions only where the on-screen text doesn't already say the line.
export const CAPTIONED: (keyof typeof VO)[] = ['type', 'build'];
// Scene windows in frames (8-frame overlaps; the incoming scene covers the outgoing one).
export const SCENES = {
  hook: [0, 110], pain: [102, 242], meet: [234, 386], type: [378, 560], build: [552, 716],
  stats: [708, 986], map: [978, 1268], founder: [1260, 1406], cta: [1398, 1650],
} as const;
