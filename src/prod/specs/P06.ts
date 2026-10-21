// P06 "Urgent client messages, never missed" — copy verbatim from fansachat-scripts P06.
import J from '../../specs/P06.json';
import {Spec} from '../timeline';

const L = J.lines;
export const P06: Spec = {
  id: 'P06', slug: 'agency-requests', music: 'public/audio/05_lofi-warm_roof-tops_holiznacc0.mp3',
  lines: L,
  pre: {1: 10, 2: 16, 3: 30, 4: 60, 5: 22, 6: 10},
  nocap: [2, 5],
  capUntil: {3: 'when'},
  labels: {0: 'The hook', 1: 'The problem', 2: 'The turn', 3: 'The fix', 4: 'The result', 5: 'One sentence', 6: 'Join us'},
  acts: [
    {kind: 'inbox', from: 0, to: 1},
    {kind: 'turn', from: 2, to: 2, dark: true, line: 2, words: ["Let's", 'fix', 'that.']},
    {kind: 'compose', from: 3, to: 4, typeLine: 3, typeFrom: 'when', runAt: [4, 'now'], litStep: 11,
      sentence: "When an Intercom conversation is tagged urgent, create a ClickUp task for whoever's on duty and post it in our Discord.",
      kw: [{kw: 'Intercom', node: 0}, {kw: 'urgent', node: 1}, {kw: 'ClickUp', node: 2}, {kw: 'Discord', node: 3}],
      nodes: [{app: 'intercom', name: 'Intercom', action: 'New conversation', done: 'Conversation caught'}, {app: 'filter', name: 'Filter', action: 'Only if tagged “urgent”', done: 'Tagged urgent'}, {app: 'clickup', name: 'ClickUp', action: 'Task for whoever’s on duty', done: 'Task assigned'}, {app: 'discord', name: 'Discord', action: 'Post in #client-urgent', done: 'Message posted'}]},
    {kind: 'end', from: 5, to: 6, dark: true, lead: 'One sentence.'},
  ],
};
