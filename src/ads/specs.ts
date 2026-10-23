// P01–P07 v9 specs (scripts: fansachat-scripts prod-scripts-v3/P_SCRIPTS_v3.md). `from` = VO line index where the scene
// starts. Each video: its own bright gradient + blobs + topic 3D assets (public/heroes, CC0 3dicons). App icons only where
// the script names the app. P01 = male VO, P02–P07 = female VO.
import type {Spec, Theme} from './AdKit';
import t01 from '../../public/audio/p01v8/times.json';
import t02 from '../../public/audio/p02v8/times.json';
import t03 from '../../public/audio/p03v8/times.json';
import t04 from '../../public/audio/p04v8/times.json';
import t05 from '../../public/audio/p05v8/times.json';
import t06 from '../../public/audio/p06v8/times.json';
import t07 from '../../public/audio/p07v8/times.json';
import w01 from '../../public/audio/p01v8/words.json';
import w02 from '../../public/audio/p02v8/words.json';
import w03 from '../../public/audio/p03v8/words.json';
import w04 from '../../public/audio/p04v8/words.json';
import w05 from '../../public/audio/p05v8/words.json';
import w06 from '../../public/audio/p06v8/words.json';
import w07 from '../../public/audio/p07v8/words.json';

const th = (bg: [string, string, string], blob: [string, string, string], assets: string[]): Theme => ({bg, blob, assets: assets.map((a) => `${a}.png`)});
const W = (w: unknown) => w as [number, number, string][];
const END = {kind: 'end' as const};
const APPS = ['ap/hubspot.png', 'ap/stripe.png', 'ap/notion.png', 'ap/trello.png', 'ap/asana.png', 'ap/calendly.png', 'ap/typeform.png', 'ap/quickbooks.png', 'ap/clickup.png', 'ap/pipedrive.png', 'ap/google-drive.png', 'ap/slack.png',
  'si/whatsapp.svg', 'si/instagram.svg', 'si/canva.svg', 'ap/facebook.png', 'ap/jotform.svg', 'ap/paperform.png', 'ap/google-forms.png', 'ap/fillout-forms.png', 'ap/gmail.png', 'ap/google-sheets.png', 'si/googleanalytics.svg', 'si/googleads.svg'];

export const SPECS: Spec[] = [
  {id: 'p01v8', music: '01_upbeat-tech_high-technologic-beat-explosion_loyalty-freak-music.mp3', ...t01, words: W(w01),
    theme: th(['#EEF0FF', '#FFE9DD', '#E3FBF1'], ['rgba(139,143,232,.55)', 'rgba(255,170,140,.5)', 'rgba(110,220,170,.45)'], ['chat-bubble-gradient', 'chat-text-color', 'clock-color', 'file-text-clay', 'notebook-clay', 'magic-trick-gradient', 'rocket-premium', 'puzzle-color', 'calender-color']),
    scenes: [
      {kind: 'hook', from: 0, big: true, phrases: [{text: 'Still juggling', hot: ['juggling']}, {text: 'client messages,', hot: ['messages,'], chip: 'Client · 3 new'}, {text: 'messy spreadsheets', hot: ['messy', 'spreadsheets'], app: 'ap/google-sheets.png'},
        {text: 'and late invoices', hot: ['late', 'invoices'], chip: 'Overdue · 14 days'}, {text: 'by hand, every single day?', hot: ['hand,', 'every', 'day?']}]},
      {kind: 'brand', from: 1, line: 'What if one plain-English sentence could handle all of it?', hot: ['one', 'plain-English', 'sentence', 'all'], sub: 'AI workflow automation', apps: APPS, chip: 'connected to 700+ apps'},
      {kind: 'flow', from: 3, say: 'When a client pays, send the receipt and update my sheet.', root: 'You', leaves: [['Payment received', 'ap/stripe.png'], ['Send the receipt', 'ap/gmail.png'], ['Update my sheet', 'ap/google-sheets.png']], caption: 'Done in seconds.', hot: ['Done', 'seconds.']},
      {kind: 'glass', from: 4, bars: ['Copy row 12', 'Paste row 12', 'Copy row 13', 'Paste row 13'], strike: true, line: 'No more late nights copying the same data.', hot: ['No', 'more', 'late', 'nights']},
      {kind: 'cycle', from: 5, prefix: 'For', items: ['freelance copywriters', 'independent SEO consultants', 'small agencies', 'consulting firms'], line: 'your work is heavier than reminders and bookings.', hot: ['heavier', 'reminders', 'bookings.']},
      {kind: 'cards', from: 6, cards: [['Leads', 'from five places'], ['Onboarding', 'that never ends'], ['Reports', 'nobody has time for']], flow: 'one smooth flow.'},
      {kind: 'team', from: 10, rows: [['Onboard new client', 'Maya'], ['Weekly SEO report', 'Arif'], ['Follow up 3 leads', 'Sam']], chip: 'Owner view · coming soon', trust: "Nothing connects until you approve it — and you don't pay until then."},
      {...END, from: 12},
    ]},
  {id: 'p02v8', music: '02_calm-minimal_once-more-with-you_loyalty-freak-music.mp3', ...t02, words: W(w02),
    theme: th(['#E6F3FF', '#F1E8FF', '#FFE8F3'], ['rgba(90,170,255,.5)', 'rgba(170,130,255,.45)', 'rgba(255,140,190,.45)'], ['clock-premium', 'megaphone-color', 'money-bag-clay', 'chat-text-premium', 'puzzle-color', 'notebook-clay', 'mobile-clay', 'sun-clay']),
    scenes: [
      {kind: 'hook', from: 0, phrases: [{text: 'Ever wondered why', hot: ['wondered']}, {text: 'small business owners', hot: ['small', 'business']}, {text: 'never have enough time?', hot: ['never', 'time?']},
        {text: 'hours lost updating the CRM', hot: ['hours', 'lost'], app: 'ap/hubspot.png'}, {text: 'chasing leads', hot: ['chasing'], chip: '12 unanswered'}, {text: 'fixing sheets', hot: ['fixing'], app: 'ap/google-sheets.png'}]},
      {kind: 'brand', from: 2, line: 'But what if those nightmare tasks ran on autopilot, 24/7?', hot: ['nightmare', 'autopilot,', '24/7?'], sub: 'Welcome to FansaChat'},
      {kind: 'people', from: 4, rows: [['Sales lead', ['ap/hubspot.png']], ['Designer', ['si/canva.svg', 'ap/slack.png']], ['Accountant', ['ap/quickbooks.png']],
        ['Operations', ['ap/google-sheets.png', 'ap/trello.png', 'ap/gmail.png']], ['Support', ['si/whatsapp.svg']]], after: 'Different people, different apps.'},
      {kind: 'flow', from: 10, say: 'Connect HubSpot, Canva, QuickBooks, Sheets and WhatsApp for my team.', root: 'Team', leaves: [['HubSpot deals', 'ap/hubspot.png'], ['Canva briefs', 'si/canva.svg'], ['QuickBooks', 'ap/quickbooks.png'], ['Sheets rows', 'ap/google-sheets.png'], ['WhatsApp replies', 'si/whatsapp.svg']],
        caption: 'One sentence connects the apps.', hot: ['One', 'sentence', 'connects']},
      {kind: 'team', from: 12, rows: [], trust: 'You approve every connection.'},
      {...END, from: 13},
    ]},
  {id: 'p03v8', music: '03_calm-minimal_one-cool-minute_loyalty-freak-music.mp3', ...t03, words: W(w03),
    theme: th(['#E5FBF0', '#FFF8DA', '#E3F1FF'], ['rgba(80,210,150,.45)', 'rgba(255,214,90,.45)', 'rgba(100,170,255,.45)'], ['lock-premium', 'magic-trick-gradient', 'file-text-clay', 'puzzle-color', 'rocket-premium', 'clock-color', 'notify-heart-clay', 'calender-color']),
    scenes: [
      {kind: 'hook', from: 0, phrases: [{text: 'Your team', hot: ['team']}, {text: "shouldn't wait days", hot: ["shouldn't", 'days']}, {text: 'for a developer', hot: ['developer'], chip: 'Ticket #482 · waiting'}, {text: 'to fix one small task.', hot: ['one', 'small']}]},
      {kind: 'glass', from: 1, bars: ['Every handoff', 'Can you update this?', 'Ticket #483 · waiting', 'Still in the queue'], line: 'Stuck in a queue.', hot: ['Stuck', 'queue.']},
      {kind: 'flow', from: 2, say: '"When a new client signs, create the project, assign the team and tell everyone."', root: 'You', leaves: [['Create the project', 'ap/asana.png'], ['Assign the team', 'ap/clickup.png'], ['Tell everyone', 'ap/notion.png']], caption: 'Written yourself. Done.', hot: ['yourself.', 'Done.']},
      {kind: 'team', from: 3, rows: [['New client flow', 'Edited just now'], ['Weekly handoff', 'Team'], ['Project updates', 'Team']], chip: 'Change it anytime — just ask', trust: 'Nothing runs until you approve it.'},
      {...END, from: 5},
    ]},
  {id: 'p04v8', music: '04_lofi-future_traveling-in-your-mind_loyalty-freak-music.mp3', ...t04, words: W(w04),
    theme: th(['#FFF0E3', '#FFE6EC', '#EDE9FF'], ['rgba(255,170,110,.5)', 'rgba(255,130,170,.45)', 'rgba(150,130,255,.45)'], ['money-bag-clay', 'bag-gradient', 'trophy-gradient', 'gift-clay', 'rocket-premium', 'fire-premium', 'bag-clay', 'sun-clay']),
    scenes: [
      {kind: 'hook', from: 0, phrases: [{text: 'Hiring help', hot: ['Hiring'], chip: 'Expensive'}, {text: 'is expensive.', hot: ['expensive.']}, {text: 'Doing everything yourself', hot: ['everything']}, {text: 'is exhausting.', hot: ['exhausting.']}]},
      {kind: 'brand', from: 2, sub: 'runs your busywork from one plain-English sentence', apps: APPS.slice(0, 16)},
      {kind: 'tiers', from: 3, tiers: [
        {name: 'Starter', price: '$15', who: 'Freelancers', pains: 'Endless follow-ups, invoices, three inboxes'},
        {name: 'Pro', price: '$45', who: 'Creators and consultants', pains: 'Many clients, content for every channel, reports every week'},
        {name: 'Team', price: '$149', who: 'Agencies and small teams', pains: 'Client onboarding, team handoffs, reports for every client'},
        {name: 'Scale', price: '$299', who: 'Growing businesses', pains: 'Departments, approvals, people in different apps'}]},
      {kind: 'team', from: 11, rows: [], trust: "You approve every connection — and you don't pay until then."},
      {...END, from: 12},
    ]},
  {id: 'p05v8', music: '05_lofi-warm_roof-tops_holiznacc0.mp3', ...t05, words: W(w05),
    theme: th(['#E2F8FB', '#E9FBEA', '#F0EAFF'], ['rgba(70,200,230,.45)', 'rgba(110,220,130,.45)', 'rgba(160,130,255,.45)'], ['chat-bubble-gradient', 'mobile-clay', 'notify-heart-clay', 'megaphone-color', 'chat-text-color', 'fire-premium', 'camera-clay', 'mic-gradient']),
    scenes: [
      {kind: 'hook', from: 0, phrases: [{text: 'A lead messaged you', hot: ['lead'], chip: 'New lead · 1 hour ago'}, {text: 'an hour ago.', hot: ['hour']}, {text: 'Did anyone reply?', hot: ['anyone', 'reply?']}]},
      {kind: 'people', from: 2, rows: [['Website form', ['ap/typeform.png']], ['Instagram DMs', ['si/instagram.svg']], ['Email', ['ap/gmail.png']], ['WhatsApp', ['si/whatsapp.svg']]]},
      {kind: 'flow', from: 3, say: 'When a lead messages me anywhere, save it to my CRM and send a friendly reply.', root: 'Leads', leaves: [['Website form', 'ap/typeform.png'], ['Instagram DMs', 'si/instagram.svg'], ['Email', 'ap/gmail.png'], ['WhatsApp', 'si/whatsapp.svg'], ['Saved to CRM', 'ap/hubspot.png']],
        caption: 'Every lead caught. Replied in seconds.', hot: ['Every', 'caught.', 'seconds.']},
      {kind: 'team', from: 4, rows: [['New lead · Website form', 'Maya'], ['New lead · Instagram', 'Arif'], ['New lead · WhatsApp', 'Sam']], trust: 'You approve every connection.'},
      {...END, from: 6},
    ]},
  {id: 'p06v8', music: '06_warm-emotional_washed-up_holiznacc0.mp3', ...t06, words: W(w06),
    theme: th(['#FFE9F0', '#FFF7E6', '#E6FAF2'], ['rgba(255,140,170,.45)', 'rgba(255,200,120,.45)', 'rgba(110,220,170,.45)'], ['gift-clay', 'file-text-clay', 'calender-color', 'notebook-clay', 'trophy-gradient', 'lock-premium', 'chat-text-premium', 'sun-clay']),
    scenes: [
      {kind: 'hook', from: 0, phrases: [{text: 'Signing a new client', hot: ['new', 'client']}, {text: 'should feel exciting', hot: ['exciting']}, {text: 'not like a pile of setup.', hot: ['pile', 'setup.']}]},
      {kind: 'glass', from: 1, bars: ['Contract', 'Invoice', 'Project folder', 'Welcome email', 'Team tasks'], line: 'The same steps, every single time.', hot: ['same', 'every', 'single']},
      {kind: 'flow', from: 2, say: 'When a new client signs, send the contract and invoice, create the folder, email a welcome and assign the team.', root: 'Client', leaves: [['Contract'], ['Invoice'], ['Project folder'], ['Welcome email'], ['Team tasks']],
        caption: 'Tell FansaChat once.', hot: ['once.']},
      {kind: 'team', from: 3, rows: [['Onboard Acme Co.', 'Maya'], ['Welcome pack', 'Arif'], ['Kickoff call', 'Sam']], trust: 'Nothing runs until you approve it.'},
      {...END, from: 5},
    ]},
  {id: 'p07v8', music: '07_warm-emotional_everything-is-love_komiku.mp3', ...t07, words: W(w07),
    theme: th(['#EFEAFF', '#E4F2FF', '#FFF6E5'], ['rgba(150,120,255,.45)', 'rgba(90,170,255,.45)', 'rgba(255,190,110,.45)'], ['file-text-clay', 'clock-premium', 'calender-color', 'trophy-gradient', 'notebook-clay', 'rocket-premium', 'camera-clay', 'money-bag-clay']),
    scenes: [
      {kind: 'hook', from: 0, phrases: [{text: 'Still building client reports', hot: ['client', 'reports']}, {text: 'from screenshots', hot: ['screenshots'], chip: 'screenshot_14.png'}, {text: 'at the last minute?', hot: ['last', 'minute?']}]},
      {kind: 'people', from: 1, rows: [['Google Analytics', ['si/googleanalytics.svg']], ['Ads', ['si/googleads.svg']], ['Sheets', ['ap/google-sheets.png']]]},
      {kind: 'flow', from: 2, say: 'Every Monday, pull the Analytics and Ads numbers, build the client report and send it.', root: 'Mon', leaves: [['Google Analytics', 'si/googleanalytics.svg'], ['Ads numbers', 'si/googleads.svg'], ['Build the report', 'ap/google-sheets.png'], ['Send to client', 'ap/gmail.png']],
        caption: 'On time, every time.', hot: ['time,', 'every', 'time.']},
      {kind: 'team', from: 3, rows: [['Acme Co. · weekly report', 'Sent'], ['Bloom Studio · report', 'Sent'], ['Northwind · report', 'Sent']], trust: 'You approve every connection.'},
      {...END, from: 5},
    ]},
];
