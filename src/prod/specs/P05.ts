// P05 "This or that: following up after sales calls" — copy verbatim from fansachat-scripts P05.
import J from '../../specs/P05.json';
import {Spec} from '../timeline';

const L = J.lines;
export const P05: Spec = {
  id: 'P05', slug: 'call-followup', music: 'public/audio/03_calm-minimal_one-cool-minute_loyalty-freak-music.mp3',
  lines: L,
  pre: {1: 12, 2: 14, 3: 22, 4: 60, 5: 16, 6: 10},
  capUntil: {3: 'when'},
  labels: {0: 'This or that', 1: 'The problem', 2: 'The cost', 3: 'The fix', 4: 'The result', 5: 'Your pick', 6: 'Join us'},
  acts: [
    {kind: 'split', from: 0, to: 2},
    {kind: 'compose', from: 3, to: 4, typeLine: 3, typeFrom: 'when', runAt: [4, 'every'], litStep: 13,
      sentence: 'When someone books on Calendly, create a deal in Pipedrive and a prep card in Trello.',
      kw: [{kw: 'Calendly', node: 0}, {kw: 'Pipedrive', node: 1}, {kw: 'Trello', node: 2}],
      nodes: [{app: 'calendly', name: 'Calendly', action: 'Invitee created', done: 'Booking tracked'}, {app: 'pipedrive', name: 'Pipedrive', action: 'Create deal', done: 'Deal created'}, {app: 'trello', name: 'Trello', action: 'Create prep card', done: 'Prep card ready'}]},
    {kind: 'poll', from: 5, to: 5},
    {kind: 'end', from: 6, to: 6, dark: true},
  ],
};
