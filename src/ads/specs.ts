// P02–P07 v8 specs (scripts: fansachat-scripts prod-scripts-v3/P_SCRIPTS_v3.md). `from` = VO line index where the scene
// starts; times come from the chosen female takes. App icons only where the script names the app.
import type {Spec} from './AdKit';
import t02 from '../../public/audio/p02v8/times.json';
import t03 from '../../public/audio/p03v8/times.json';
import t04 from '../../public/audio/p04v8/times.json';
import t05 from '../../public/audio/p05v8/times.json';
import t06 from '../../public/audio/p06v8/times.json';
import t07 from '../../public/audio/p07v8/times.json';

const END = {kind: 'end' as const};

export const SPECS: Spec[] = [
  {id: 'p02v8', music: '02_calm-minimal_once-more-with-you_loyalty-freak-music.mp3', ...t02, scenes: [
    {kind: 'hook', from: 0, phrases: [{text: 'Ever wondered why'}, {text: 'small business owners', hot: ['business']}, {text: 'never have enough time?', hot: ['time?']},
      {text: 'hours lost updating the CRM', app: 'ap/hubspot.png'}, {text: 'chasing leads', chip: '12 unanswered', red: true}, {text: 'fixing sheets', app: 'ap/google-sheets.png'}]},
    {kind: 'brand', from: 2, line: 'But what if those nightmare tasks ran on autopilot, 24/7?', hot: ['autopilot,', '24/7?'], sub: 'Welcome to FansaChat'},
    {kind: 'people', from: 4, rows: [['Sales lead', ['ap/hubspot.png']], ['Designer', ['si/canva.svg', 'ap/slack.png']], ['Accountant', ['ap/quickbooks.png']],
      ['Operations', ['ap/google-sheets.png', 'ap/trello.png', 'ap/gmail.png']], ['Support', ['si/whatsapp.svg']]], after: 'Different people, different apps.'},
    {kind: 'land', from: 10, title: 'One shared workspace', steps: [['New deal in HubSpot', 'ap/hubspot.png'], ['Brief to Canva', 'si/canva.svg'], ['Invoice in QuickBooks', 'ap/quickbooks.png'], ['Row in Sheets', 'ap/google-sheets.png'], ['Reply on WhatsApp', 'si/whatsapp.svg']],
      caption: 'One sentence connects the apps.', hot: ['sentence']},
    {kind: 'team', from: 12, rows: [], trust: 'You approve every connection.'},
    {...END, from: 13},
  ]},
  {id: 'p03v8', music: '03_calm-minimal_one-cool-minute_loyalty-freak-music.mp3', ...t03, scenes: [
    {kind: 'hook', from: 0, phrases: [{text: 'Your team'}, {text: "shouldn't wait days", hot: ['days']}, {text: 'for a developer', chip: 'Ticket #482 · waiting', red: true}, {text: 'to fix one small task.', hot: ['small']}]},
    {kind: 'night', from: 1, big: 'Queue', small: '3 days', loop: ['Can you update this?', 'Ticket #483 · waiting', 'Handoff to dev', 'Still waiting'], line: 'Every handoff, every "can you update this?" — stuck in a queue.', hot: ['stuck', 'queue.']},
    {kind: 'composer', from: 2, lead: 'Write it yourself, in plain English.', say: '"When a new client signs, create the project, assign the team and tell everyone."',
      steps: [['Client signs', 'Contract signed'], ['Create project', 'Project #212 created', 'ap/asana.png'], ['Assign team', '3 people assigned', 'ap/clickup.png'], ['Tell everyone', 'Team notified']], done: 'Done.'},
    {kind: 'team', from: 3, rows: [['New client flow', 'Edited just now'], ['Weekly handoff', 'Team'], ['Project updates', 'Team']], chip: 'Change it anytime — just ask', trust: 'Nothing runs until you approve it.'},
    {...END, from: 5},
  ]},
  {id: 'p04v8', music: '04_lofi-future_traveling-in-your-mind_loyalty-freak-music.mp3', ...t04, scenes: [
    {kind: 'hook', from: 0, phrases: [{text: 'Hiring help', chip: 'Expensive', red: true}, {text: 'is expensive.', hot: ['expensive.'], red: true}, {text: 'Doing everything yourself'}, {text: 'is exhausting.', hot: ['exhausting.']}]},
    {kind: 'brand', from: 2, sub: 'runs your busywork from one plain-English sentence'},
    {kind: 'tiers', from: 3, tiers: [
      {name: 'Starter', price: '$15', who: 'Freelancers', pains: 'Endless follow-ups, invoices, three inboxes'},
      {name: 'Pro', price: '$45', who: 'Creators and consultants', pains: 'Many clients, content for every channel, reports every week'},
      {name: 'Team', price: '$149', who: 'Agencies and small teams', pains: 'Client onboarding, team handoffs, reports for every client'},
      {name: 'Scale', price: '$299', who: 'Growing businesses', pains: 'Departments, approvals, people in different apps'}]},
    {kind: 'team', from: 11, rows: [], trust: "You approve every connection — and you don't pay until then."},
    {...END, from: 12},
  ]},
  {id: 'p05v8', music: '05_lofi-warm_roof-tops_holiznacc0.mp3', ...t05, scenes: [
    {kind: 'hook', from: 0, phrases: [{text: 'A lead messaged you', chip: 'New lead · 1 hour ago'}, {text: 'an hour ago.', hot: ['hour']}, {text: 'Did anyone reply?', hot: ['reply?'], red: true}]},
    {kind: 'people', from: 2, rows: [['Website form', ['ap/typeform.png']], ['Instagram DMs', ['si/instagram.svg']], ['Email', ['ap/gmail.png']], ['WhatsApp', ['si/whatsapp.svg']]]},
    {kind: 'land', from: 3, title: 'New leads', steps: [['Catch every lead', 'si/instagram.svg'], ['Save it to your CRM', 'ap/hubspot.png'], ['Friendly reply in seconds', 'si/whatsapp.svg']], caption: 'From one sentence.', hot: ['sentence.']},
    {kind: 'team', from: 4, rows: [['New lead · Website form', 'Maya'], ['New lead · Instagram', 'Arif'], ['New lead · WhatsApp', 'Sam']], trust: 'You approve every connection.'},
    {...END, from: 6},
  ]},
  {id: 'p06v8', music: '06_warm-emotional_washed-up_holiznacc0.mp3', ...t06, scenes: [
    {kind: 'hook', from: 0, phrases: [{text: 'Signing a new client'}, {text: 'should feel exciting', hot: ['exciting']}, {text: 'not like a pile of setup.', hot: ['setup.'], red: true}]},
    {kind: 'cards', from: 1, cards: [['Contract', 'to send'], ['Invoice', 'to create'], ['Project folder', 'to set up'], ['Welcome email', 'to write'], ['Team tasks', 'to assign']], flow: 'Every single time.'},
    {kind: 'land', from: 2, title: 'New client onboarding', steps: [['Contract sent'], ['Invoice created'], ['Project folder'], ['Welcome email'], ['Team tasks']], caption: 'Tell FansaChat once.', hot: ['once.']},
    {kind: 'team', from: 3, rows: [['Onboard Acme Co.', 'Maya'], ['Welcome pack', 'Arif'], ['Kickoff call', 'Sam']], trust: 'Nothing runs until you approve it.'},
    {...END, from: 5},
  ]},
  {id: 'p07v8', music: '07_warm-emotional_everything-is-love_komiku.mp3', ...t07, scenes: [
    {kind: 'hook', from: 0, phrases: [{text: 'Still building client reports'}, {text: 'from screenshots', chip: 'screenshot_14.png'}, {text: 'at the last minute?', hot: ['minute?'], red: true}]},
    {kind: 'people', from: 1, rows: [['Google Analytics', ['si/googleanalytics.svg']], ['Ads', ['si/googleads.svg']], ['Sheets', ['ap/google-sheets.png']]]},
    {kind: 'composer', from: 2, lead: 'One sentence.', say: '"Every Monday, pull the numbers, build the client report and send it."',
      steps: [['Pull the numbers', 'Analytics + Ads', 'si/googleanalytics.svg'], ['Build the report', 'Report · week 43'], ['Send it', 'Sent on time']], done: 'On time, every time'},
    {kind: 'team', from: 3, rows: [['Acme Co. · weekly report', 'Sent'], ['Bloom Studio · report', 'Sent'], ['Northwind · report', 'Sent']], trust: 'You approve every connection.'},
    {...END, from: 5},
  ]},
];
