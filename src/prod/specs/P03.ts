// P03 "If I ran a 5-person agency..." — copy verbatim from fansachat-scripts P03 (VO lines live in src/specs/P03.json for the voice jobs).
import J from '../../specs/P03.json';
import {Spec} from '../timeline';

const L = J.lines;
const ITEMS = [
  {n: '01', t: 'Client onboarding', a: 'jotform', b: 'clickup'},
  {n: '02', t: 'Sales calls', a: 'calendly', b: 'pipedrive'},
  {n: '03', t: 'Getting paid', a: 'clickup', b: 'xero'},
];
export const P03: Spec = {
  id: 'P03', slug: 'agency-first-3', music: 'public/audio/02_calm-minimal_once-more-with-you_loyalty-freak-music.mp3',
  lines: L,
  pre: {4: 66, 6: 66, 8: 66, 9: 12},
  capUntil: {3: 'when', 5: 'when', 7: 'when'},
  labels: {0: 'The hook', 1: 'The promise', 2: 'Automation 01', 4: 'Automation 02', 6: 'Automation 03', 8: 'The recap', 9: 'Join us'},
  acts: [
    {kind: 'list', from: 0, to: 0, items: ITEMS},
    {kind: 'chatflash', from: 1, to: 1},
    {kind: 'compose', from: 2, to: 3, tag: ITEMS[0], typeLine: 3, typeFrom: 'when', sentence: L[3], kw: [{kw: 'Jotform', node: 0}, {kw: 'ClickUp', node: 1}],
      nodes: [{app: 'jotform', name: 'Jotform', action: 'New submission', done: 'Submission received'}, {app: 'clickup', name: 'ClickUp', action: 'Create project + starter tasks', done: 'Project created'}]},
    {kind: 'compose', from: 4, to: 5, tag: ITEMS[1], typeLine: 5, typeFrom: 'when', sentence: L[5], kw: [{kw: 'Calendly', node: 0}, {kw: 'Pipedrive', node: 1}],
      nodes: [{app: 'calendly', name: 'Calendly', action: 'Call booked', done: 'Booking received'}, {app: 'pipedrive', name: 'Pipedrive', action: 'Create deal', done: 'Deal created'}]},
    {kind: 'compose', from: 6, to: 7, tag: ITEMS[2], typeLine: 7, typeFrom: 'when', sentence: L[7], kw: [{kw: 'ClickUp', node: 0}, {kw: 'Xero', node: 1}],
      nodes: [{app: 'clickup', name: 'ClickUp', action: 'Project marked done', done: 'Project done'}, {app: 'xero', name: 'Xero', action: 'Draft the invoice', done: 'Invoice drafted'}]},
    {kind: 'recap', from: 8, to: 8, items: ITEMS},
    {kind: 'end', from: 9, to: 9, dark: true},
  ],
};
