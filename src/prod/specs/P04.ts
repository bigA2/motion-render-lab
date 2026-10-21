// P04 "Myth: you need to code to automate" — copy verbatim from fansachat-scripts P04.
import J from '../../specs/P04.json';
import {Spec} from '../timeline';

const L = J.lines;
export const P04: Spec = {
  id: 'P04', slug: 'myth-code', music: 'public/audio/04_lofi-future_traveling-in-your-mind_loyalty-freak-music.mp3',
  lines: L,
  pre: {3: 34, 4: 78, 5: 24, 6: 10},
  nocap: [5],
  capUntil: {3: 'when'},
  labels: {0: 'Myth or fact', 1: 'The problem', 2: 'The verdict', 3: 'The fix', 4: 'The result', 5: 'No code', 6: 'Join us'},
  acts: [
    {kind: 'myth', from: 0, to: 2},
    {kind: 'compose', from: 3, to: 3, typeLine: 3, typeFrom: 'when', sentence: 'When I get paid on Stripe, add it to my Airtable income table and message me on Telegram.',
      kw: [{kw: 'Stripe', node: 0}, {kw: 'Airtable', node: 1}, {kw: 'Telegram', node: 2}],
      nodes: [{app: 'stripe', name: 'Stripe', action: 'New payment', done: 'Payment received'}, {app: 'airtable', name: 'Airtable', action: 'Add row to “Income”', done: 'Row added'}, {app: 'telegram', name: 'Telegram Bot', action: 'Message me', done: 'Message sent'}]},
    {kind: 'ping', from: 4, to: 4, line: 4},
    {kind: 'end', from: 5, to: 6, dark: true, lead: 'No code.'},
  ],
};
