// P01–P07 v10 specs — same scripts / VO / word timings as v9 (audio p0Xv8), new look per memory feedback_ad_visual_rules_bright
// and storyboard fansa-knowledge/raw/video_research/P01-P07_v10_STORYBOARD.md: every video its own pale theme, two solid hot
// colours, background design element (fx), workflow stage and scene-change style; hook phrases carry noun visuals.
import type {Spec, Theme} from './AdKit10';
import {SPECS as V9} from './specs';

const A = (id: string) => V9.find((s) => s.id === id)!;
const APPS = (A('p01v8').scenes.find((s) => s.kind === 'brand') as {apps: string[]}).apps;
const END = {kind: 'end' as const};
const base = (id: string, theme: Theme) => { const v = A(id); return {id, music: v.music, times: v.times, end: v.end, words: v.words, theme}; };

export const SPECS10: Spec[] = [
  {...base('p01v8', {bg: ['#DDE7FF', '#F3F6FF'], bloom: ['rgba(64,120,255,.42)', 'rgba(130,170,255,.38)'], hot: ['#2563EB', '#6D28D9'], fx: 'streaks', stage: 'laptop', wipe: 'blur'}),
    scenes: [
      {kind: 'hook', from: 0, phrases: [{text: 'Still juggling', hot: ['juggling']}, {text: 'client messages,', hot: ['messages,'], vis: {v: 'chat', n: 3, badge: '3 new'}},
        {text: 'messy spreadsheets', hot: ['messy', 'spreadsheets'], vis: {v: 'sheet'}}, {text: 'and late invoices', hot: ['late', 'invoices'], vis: {v: 'invoice', badge: 'Overdue · 14 days'}},
        {text: 'by hand, every single day?', hot: ['hand,', 'every', 'day?'], vis: {v: 'clock', from: '9:00 am', to: '11:47 pm'}}]},
      {kind: 'brand', from: 1, line: 'What if one plain-English sentence could handle all of it?', hot: ['one', 'plain-English', 'sentence', 'all'], sub: 'AI workflow automation', apps: APPS.slice(0, 16), chip: 'connected to 700+ apps'},
      {kind: 'flow', from: 3, say: 'When a client pays, send the receipt and update my sheet.', root: 'You', leaves: [['Payment received', 'ap/stripe.png'], ['Send the receipt', 'ap/gmail.png'], ['Update my sheet', 'ap/google-sheets.png']], caption: 'Done in seconds.', hot: ['Done', 'seconds.']},
      {kind: 'glass', from: 4, bars: ['Copy row 12', 'Paste row 12', 'Copy row 13', 'Paste row 13'], strike: true, line: 'No more late nights copying the same data.', hot: ['No', 'more', 'late', 'nights']},
      {kind: 'cycle', from: 5, prefix: 'For', items: ['freelance copywriters', 'independent SEO consultants', 'small agencies', 'consulting firms'], line: 'your work is heavier than reminders and bookings.', hot: ['heavier', 'reminders', 'bookings.']},
      {kind: 'cards', from: 6, cards: [['Leads', 'from five places'], ['Onboarding', 'that never ends'], ['Reports', 'nobody has time for']], flow: 'one smooth flow.'},
      {kind: 'team', from: 10, rows: [['Onboard new client', 'Maya'], ['Weekly SEO report', 'Arif'], ['Follow up 3 leads', 'Sam']], chip: 'Owner view · coming soon', trust: "Nothing connects until you approve it — and you don't pay until then."},
      {...END, from: 12},
    ]},
  {...base('p02v8', {bg: ['#ECE7FF', '#FAF8FF'], bloom: ['rgba(140,100,255,.38)', 'rgba(255,140,120,.30)'], hot: ['#6D3CF5', '#E0472F'], fx: 'bokeh', stage: 'land', wipe: 'circle'}),
    scenes: [
      {kind: 'hook', from: 0, phrases: [{text: 'Ever wondered why', hot: ['wondered']}, {text: 'small business owners', hot: ['small', 'business'], vis: {v: 'people', n: 5}},
        {text: 'never have enough time?', hot: ['never', 'time?'], vis: {v: 'clock', from: '8:00 am', to: '11:58 pm'}},
        {text: 'hours lost updating the CRM', hot: ['hours', 'lost'], vis: {v: 'app', app: 'ap/hubspot.png'}}, {text: 'chasing leads', hot: ['chasing'], vis: {v: 'lead', msg: 'Still interested?', ago: '12 unanswered'}},
        {text: 'fixing sheets', hot: ['fixing'], vis: {v: 'sheet'}}]},
      {kind: 'brand', from: 2, line: 'But what if those nightmare tasks ran on autopilot, 24/7?', hot: ['nightmare', 'autopilot,', '24/7?'], sub: 'Welcome to FansaChat'},
      {kind: 'people', from: 4, rows: [['Sales lead', ['ap/hubspot.png']], ['Designer', ['si/canva.svg', 'ap/slack.png']], ['Accountant', ['ap/quickbooks.png']],
        ['Operations', ['ap/google-sheets.png', 'ap/trello.png', 'ap/gmail.png']], ['Support', ['si/whatsapp.svg']]], after: 'Different people, different apps.'},
      {kind: 'flow', from: 10, say: 'Connect HubSpot, Canva, QuickBooks, Sheets and WhatsApp for my team.', root: 'Team', leaves: [['HubSpot deals', 'ap/hubspot.png'], ['Canva briefs', 'si/canva.svg'], ['QuickBooks', 'ap/quickbooks.png'], ['Sheets rows', 'ap/google-sheets.png'], ['WhatsApp replies', 'si/whatsapp.svg']],
        caption: 'One sentence connects the apps.', hot: ['One', 'sentence', 'connects']},
      {kind: 'team', from: 12, rows: [], trust: 'You approve every connection.'},
      {...END, from: 13},
    ]},
  {...base('p03v8', {bg: ['#DFF6EB', '#F5FFFA'], bloom: ['rgba(30,180,120,.32)', 'rgba(60,110,230,.22)'], hot: ['#0A8F5F', '#1E40AF'], fx: 'dots', stage: 'laptop', wipe: 'whip'}),
    scenes: [
      {kind: 'hook', from: 0, phrases: [{text: 'Your team', hot: ['team'], vis: {v: 'people', n: 4}}, {text: "shouldn't wait days", hot: ["shouldn't", 'days'], vis: {v: 'clock', from: 'Day 1', to: 'Day 4'}},
        {text: 'for a developer', hot: ['developer'], vis: {v: 'ticket', label: 'Ticket #482'}}, {text: 'to fix one small task.', hot: ['one', 'small']}]},
      {kind: 'glass', from: 1, bars: ['Every handoff', 'Can you update this?', 'Ticket #483 · waiting', 'Still in the queue'], line: 'Stuck in a queue.', hot: ['Stuck', 'queue.']},
      {kind: 'flow', from: 2, say: '"When a new client signs, create the project, assign the team and tell everyone."', root: 'You', leaves: [['Create the project', 'ap/asana.png'], ['Assign the team', 'ap/clickup.png'], ['Tell everyone', 'ap/notion.png']], caption: 'Written yourself. Done.', hot: ['yourself.', 'Done.']},
      {kind: 'team', from: 3, rows: [['New client flow', 'Edited just now'], ['Weekly handoff', 'Team'], ['Project updates', 'Team']], chip: 'Change it anytime — just ask', trust: 'Nothing runs until you approve it.'},
      {...END, from: 5},
    ]},
  {...base('p04v8', {bg: ['#FFEBDD', '#FFF9F3'], bloom: ['rgba(255,130,80,.36)', 'rgba(100,80,255,.22)'], hot: ['#D9400F', '#3B2FC9'], fx: 'prisms', stage: 'land', wipe: 'blur'}),
    scenes: [
      {kind: 'hook', from: 0, phrases: [{text: 'Hiring help', hot: ['Hiring'], vis: {v: 'person', tag: '$3,500 / month'}}, {text: 'is expensive.', hot: ['expensive.']},
        {text: 'Doing everything yourself', hot: ['everything'], vis: {v: 'chat', n: 3, badge: '27 tasks'}}, {text: 'is exhausting.', hot: ['exhausting.'], vis: {v: 'clock', from: '6:00 pm', to: '11:58 pm'}}]},
      {kind: 'brand', from: 2, sub: 'runs your busywork from one plain-English sentence', apps: APPS.slice(0, 16)},
      {kind: 'tiers', from: 3, tiers: [
        {name: 'Starter', price: '$15', who: 'Freelancers', pains: 'Endless follow-ups, invoices, three inboxes'},
        {name: 'Pro', price: '$45', who: 'Creators and consultants', pains: 'Many clients, content for every channel, reports every week'},
        {name: 'Team', price: '$149', who: 'Agencies and small teams', pains: 'Client onboarding, team handoffs, reports for every client'},
        {name: 'Scale', price: '$299', who: 'Growing businesses', pains: 'Departments, approvals, people in different apps'}]},
      {kind: 'team', from: 11, rows: [], trust: "You approve every connection — and you don't pay until then."},
      {...END, from: 12},
    ]},
  {...base('p05v8', {bg: ['#DCF3F9', '#F4FCFF'], bloom: ['rgba(10,160,200,.32)', 'rgba(210,50,140,.20)'], hot: ['#0B7A93', '#C2187A'], fx: 'ripples', stage: 'laptop', wipe: 'circle'}),
    scenes: [
      {kind: 'hook', from: 0, phrases: [{text: 'A lead messaged you', hot: ['lead'], vis: {v: 'lead', msg: 'Hi! Are you free this week?', ago: 'New lead'}},
        {text: 'an hour ago.', hot: ['hour'], vis: {v: 'clock', from: '2:14 pm', to: '3:14 pm'}}, {text: 'Did anyone reply?', hot: ['anyone', 'reply?'], vis: {v: 'chat', n: 1, badge: 'No reply'}}]},
      {kind: 'people', from: 2, rows: [['Website form', ['ap/typeform.png']], ['Instagram DMs', ['si/instagram.svg']], ['Email', ['ap/gmail.png']], ['WhatsApp', ['si/whatsapp.svg']]]},
      {kind: 'flow', from: 3, say: 'When a lead messages me anywhere, save it to my CRM and send a friendly reply.', root: 'Leads', leaves: [['Website form', 'ap/typeform.png'], ['Instagram DMs', 'si/instagram.svg'], ['Email', 'ap/gmail.png'], ['WhatsApp', 'si/whatsapp.svg'], ['Saved to CRM', 'ap/hubspot.png']],
        caption: 'Every lead caught. Replied in seconds.', hot: ['Every', 'caught.', 'seconds.']},
      {kind: 'team', from: 4, rows: [['New lead · Website form', 'Maya'], ['New lead · Instagram', 'Arif'], ['New lead · WhatsApp', 'Sam']], trust: 'You approve every connection.'},
      {...END, from: 6},
    ]},
  {...base('p06v8', {bg: ['#FFE8EF', '#FFF8FA'], bloom: ['rgba(235,80,130,.32)', 'rgba(110,60,180,.20)'], hot: ['#C8114F', '#5B2A86'], fx: 'silk', stage: 'land', wipe: 'whip'}),
    scenes: [
      {kind: 'hook', from: 0, phrases: [{text: 'Signing a new client', hot: ['new', 'client'], vis: {v: 'person', tag: 'New client', sign: true}}, {text: 'should feel exciting', hot: ['exciting']},
        {text: 'not like a pile of setup.', hot: ['pile', 'setup.'], vis: {v: 'shots'}}]},
      {kind: 'glass', from: 1, bars: ['Contract', 'Invoice', 'Project folder', 'Welcome email', 'Team tasks'], line: 'The same steps, every single time.', hot: ['same', 'every', 'single']},
      {kind: 'flow', from: 2, say: 'When a new client signs, send the contract and invoice, create the folder, email a welcome and assign the team.', root: 'Client', leaves: [['Contract'], ['Invoice'], ['Project folder'], ['Welcome email'], ['Team tasks']],
        caption: 'Tell FansaChat once.', hot: ['once.']},
      {kind: 'team', from: 3, rows: [['Onboard Acme Co.', 'Maya'], ['Welcome pack', 'Arif'], ['Kickoff call', 'Sam']], trust: 'Nothing runs until you approve it.'},
      {...END, from: 5},
    ]},
  {...base('p07v8', {bg: ['#FFF3DF', '#FFFCF5'], bloom: ['rgba(255,160,50,.28)', 'rgba(80,70,220,.22)'], hot: ['#4338CA', '#C2410C'], fx: 'constellation', stage: 'laptop', wipe: 'blur'}),
    scenes: [
      {kind: 'hook', from: 0, phrases: [{text: 'Still building client reports', hot: ['client', 'reports'], vis: {v: 'people', n: 3}}, {text: 'from screenshots', hot: ['screenshots'], vis: {v: 'shots'}},
        {text: 'at the last minute?', hot: ['last', 'minute?'], vis: {v: 'clock', from: '11:52 pm', to: '11:59 pm'}}]},
      {kind: 'people', from: 1, rows: [['Google Analytics', ['si/googleanalytics.svg']], ['Ads', ['si/googleads.svg']], ['Sheets', ['ap/google-sheets.png']]]},
      {kind: 'flow', from: 2, say: 'Every Monday, pull the Analytics and Ads numbers, build the client report and send it.', root: 'Mon', leaves: [['Google Analytics', 'si/googleanalytics.svg'], ['Ads numbers', 'si/googleads.svg'], ['Build the report', 'ap/google-sheets.png'], ['Send to client', 'ap/gmail.png']],
        caption: 'On time, every time.', hot: ['time,', 'every', 'time.']},
      {kind: 'team', from: 3, rows: [['Acme Co. · weekly report', 'Sent'], ['Bloom Studio · report', 'Sent'], ['Northwind · report', 'Sent']], trust: 'You approve every connection.'},
      {...END, from: 5},
    ]},
];
