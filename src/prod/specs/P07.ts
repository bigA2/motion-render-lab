// P07 "If I were a freelance designer..." — copy verbatim from fansachat-scripts P07.
import J from '../../specs/P07.json';
import {Spec} from '../timeline';

const L = J.lines;
export const P07: Spec = {
  id: 'P07', slug: 'freelance-brief', music: 'public/audio/06_warm-emotional_washed-up_holiznacc0.mp3',
  lines: L,
  pre: {1: 10, 2: 12, 3: 30, 4: 64, 5: 12},
  capUntil: {3: 'when'},
  labels: {0: 'The hook', 1: 'The problem', 2: 'The reveal', 3: 'The fix', 4: 'The result', 5: 'Join us'},
  acts: [
    {kind: 'brief', from: 0, to: 2},
    {kind: 'compose', from: 3, to: 4, flipIn: true, typeLine: 3, typeFrom: 'when', runAt: [4, 'every'], litStep: 12,
      sentence: 'When someone sends my Tally brief form, add a Trello card, create the project in Clockify, and message me on Telegram.',
      kw: [{kw: 'Tally', node: 0}, {kw: 'Trello', node: 1}, {kw: 'Clockify', node: 2}, {kw: 'Telegram', node: 3}],
      nodes: [{app: 'tally', name: 'Tally', action: 'New brief form', done: 'Brief received'}, {app: 'trello', name: 'Trello', action: 'Card in “New briefs”', done: 'Card added'}, {app: 'clockify', name: 'Clockify', action: 'Create project', done: 'Project created'}, {app: 'telegram', name: 'Telegram Bot', action: 'Message me', done: 'Ping sent'}]},
    {kind: 'end', from: 5, to: 5, dark: true},
  ],
};
