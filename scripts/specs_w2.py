# Week 2 specs (W2-01..W2-14): COMPARISON videos. Never name competitors ("other tools", "flowchart builders").
# Truth source: FansaChat counts complete workflow RUNS (however many steps); per-step tools charge every step.
import json
from specs_w1 import H, title, chat_beat, flow_beat, end_beat, tell_beat, phone_beat

def cmp(lt, lrows, rt, rrows, lm=None, rm=None, y=0.5): return {'t': 'compare', 'left': {'t': lt, 'rows': lrows, **({'meter': lm} if lm is not None else {})}, 'right': {'t': rt, 'rows': rrows, **({'meter': rm} if rm is not None else {})}, 'x': 0.5, 'y': y, 'cw': 1500, 'p45': {'cw': 960, 's': 0.9}}
S = {}
S['W2-01'] = {'pal': 'B2', 'lines': [
  "Your automation has five steps.",
  "Some tools charge you for every single step.",
  "Five steps, five charges. Every time it runs.",
  "FansaChat counts runs, not steps.",
  "One finished workflow is one run. However many steps it has.",
  "So the bigger your automation, the more you save.",
  "Same work. Fewer surprises on your bill.",
  "FansaChat. Pay for results, not steps. Join the waitlist."],
 'beats': [
  {'line': 0, 'hero': H(0.86, 0.8), 'els': [{'t': 'flow', 'nodes': [['gmail', 'Gmail', 'Trigger'], ['sheets', 'Sheets', 'Add row'], ['slack', 'Slack', 'Notify'], ['notion', 'Notion', 'Log'], ['telegram', 'Telegram', 'Ping']], 'layout': 'row', 'layout45': 'col', 'x': 0.5, 'y': 0.5, 's': 0.85, 'p45': {'s': 0.75}}]},
  {'line': 1, 'go': 'down', 'hero': H(0.86, 0.82, 'wow', 190), 'els': [title('Per step.', style='flip', y=0.25, size=130), {'t': 'counter', 'label': 'CHARGES', 'from': 1, 'to': 5, 'size': 110, 'x': 0.5, 'y': 0.55, 'bg': '#E8362B'}]},
  {'line': 2, 'go': 'right', 'hero': H(0.5, 0.86, 'meh', 190), 'els': [{'t': 'counter', 'label': 'CHARGES / MONTH', 'from': 5, 'to': 15000, 'size': 100, 'x': 0.5, 'y': 0.4, 'bg': '#E8362B'}, title('…every time it runs.', style='roll', y=0.62, size=96)]},
  {'line': 3, 'go': 'zoom', 'focus': [0.5, 0.4], 'hero': H(0.86, 0.3, 'happy', 180), 'els': [title('Runs, not steps.', style='flip', y=0.44, size=140)]},
  {'line': 4, 'go': 'right', 'hero': H(0.88, 0.82, 'happy', 170), 'els': [cmp('Per-step tools', ['5 steps = 5 charges', 'Every run multiplies'], 'FansaChat', ['5 steps = 1 run', 'Count finished work only'], lm=0.95, rm=0.2)]},
  {'line': 5, 'go': 'down', 'hero': H(0.5, 0.86, 'wink', 190), 'els': [title('Bigger automation.', style='roll', y=0.3, size=120), title('Bigger savings.', style='flip', y=0.52, size=120, word='more')]},
  {'line': 6, 'go': 'up', 'hero': H(0.86, 0.8, 'happy', 180), 'els': [{'t': 'paths', 'l': 'Per step: 5 × charges', 'r': 'Per run: 1 finished job', 'x': 0.5, 'y': 0.42}]},
  end_beat(7, 'Pay for results, not steps.', ['gmail', 'sheets', 'slack', 'notion', 'telegram', 'hubspot', 'stripe', 'shopify', 'airtable'])]}
S['W2-02'] = {'pal': 'B1', 'lines': [
  "Flowchart builders hand you forty boxes.",
  "Drag. Connect. Map the fields. Test. Fail. Start again.",
  "FansaChat hands you one chat box.",
  "Describe it the way you'd tell a friend.",
  "It builds the same flow. And tests it before it runs.",
  "No boxes. No mapping. No guessing.",
  "FansaChat. Say it. It's built. Join the waitlist."],
 'beats': [
  {'line': 0, 'hero': H(0.86, 0.8, 'wow'), 'els': [title('40 boxes.', style='flip', y=0.2, size=140), {'t': 'pile', 'items': [['⬜', 'Trigger → Filter → Formatter', 'step 1–3'], ['⬜', 'Lookup → Router → Path B', 'step 4–9'], ['⬜', 'Iterator → Aggregator', 'step 10–14'], ['⬜', 'Map 23 fields', 'step 15–40']], 'x': 0.45, 'y': 0.6, 'p45': {'x': 0.5}}]},
  {'line': 1, 'go': 'right', 'hero': H(0.86, 0.82, 'meh', 180), 'els': [title('DRAG. CONNECT. MAP. FAIL.', style='tape', size=84, y=0.3), {'t': 'card', 'icon': '⚠️', 'title': 'Error in step 17', 'sub': 'field “date” expected ISO string', 'badge': 'FAILED', 'x': 0.5, 'y': 0.58}]},
  {'line': 2, 'go': 'zoom', 'focus': [0.5, 0.5], 'hero': H(0.88, 0.3, 'happy', 170), 'els': [title('One chat box.', style='flip', y=0.44, size=140)]},
  chat_beat("When a client books a call on Calendly, create a deal in HubSpot, add the call notes page in Notion, and remind me on Telegram ten minutes before.", go='right'),
  {'line': 3, 'go': 'right', 'hero': H(0.88, 0.84, 'happy', 170), 'els': [title('Like telling a friend.', y=0.44, size=120, em=['friend.'])]},
  flow_beat(4, [['calendly', 'Calendly', 'Call booked'], ['hubspot', 'HubSpot', 'Deal'], ['notion', 'Notion', 'Call notes'], ['telegram', 'Telegram', 'Reminder −10m']], layout='row'),
  {'line': 5, 'go': 'up', 'hero': H(0.5, 0.86, 'wink', 190), 'els': [{'t': 'strike', 'text': 'No boxes.', 'size': 110, 'x': 0.5, 'y': 0.26}, {'t': 'strike', 'text': 'No mapping.', 'size': 110, 'x': 0.5, 'y': 0.46, 'word': 'mapping'}, {'t': 'strike', 'text': 'No guessing.', 'size': 110, 'x': 0.5, 'y': 0.66, 'word': 'guessing'}]},
  end_beat(6, "Say it. It's built.", ['calendly', 'hubspot', 'notion', 'telegram', 'slack', 'sheets', 'gmail', 'stripe', 'airtable'])]}
S['W2-03'] = {'pal': 'B3', 'lines': [
  "Automation course: six hours. Certificate included.",
  "Day two, you've forgotten half of it.",
  "With FansaChat, the course is one sentence.",
  "You say what should happen. It figures out the how.",
  "Built, tested, running, before the course intro ends.",
  "FansaChat. Skip the course. Join the waitlist."],
 'beats': [
  {'line': 0, 'hero': H(0.86, 0.8, 'meh'), 'els': [{'t': 'card', 'icon': 'youtube', 'title': 'Automation Masterclass', 'sub': '6h 12m · 48 lessons', 'x': 0.45, 'y': 0.48, 'badge': '6 HOURS', 'p45': {'x': 0.5}}, title('Certificate included 🎓', y=0.2, size=96)]},
  {'line': 1, 'go': 'down', 'hero': H(0.5, 0.86, 'meh', 190), 'els': [title('Day 2.', style='flip', y=0.3, size=150), {'t': 'strike', 'text': 'Webhooks, iterators, JSON paths', 'size': 72, 'x': 0.5, 'y': 0.56, 'word': 'forgotten'}]},
  {'line': 2, 'go': 'zoom', 'focus': [0.5, 0.45], 'hero': H(0.88, 0.3, 'happy', 170), 'els': [title('The course: one sentence.', style='flip', y=0.44, size=110)]},
  chat_beat("Every Friday at 5, send my clients their project status from Notion by email and post a summary in Slack.", go='right'),
  {'line': 3, 'go': 'right', 'hero': H(0.88, 0.84, 'wink', 170), 'els': [{'t': 'compare', 'left': {'t': 'You', 'rows': ['What should happen']}, 'right': {'t': 'FansaChat', 'rows': ['How: apps, steps, fields, testing']}, 'x': 0.5, 'y': 0.5, 'cw': 1400, 'p45': {'cw': 960}}]},
  flow_beat(4, [['gcal', 'Schedule', 'Fri 5:00'], ['notion', 'Notion', 'Project status'], ['gmail', 'Email clients', 'Sent'], ['slack', 'Slack', 'Summary']], layout='row'),
  end_beat(5, 'Skip the course.', ['notion', 'gmail', 'slack', 'gcal', 'sheets', 'hubspot', 'trello', 'asana', 'telegram'])]}
S['W2-04'] = {'pal': 'D2', 'lines': [
  "Ask a chatbot how to automate your invoices.",
  "It writes you a nice, long list of steps.",
  "Then you do all of them yourself.",
  "FansaChat doesn't tell you how. It does it.",
  "It builds the workflow, tests it, and runs it.",
  "FansaChat. Less advice. More done. Join the waitlist."],
 'beats': [
  {'line': 0, 'hero': H(0.86, 0.8, 'wow'), 'els': [title('“How do I automate invoices?”', style='flip', y=0.3, size=96), {'t': 'card', 'icon': '💬', 'title': 'Chatbot', 'sub': 'typing…', 'x': 0.5, 'y': 0.58}]},
  {'line': 1, 'go': 'down', 'hero': H(0.86, 0.84, 'meh', 180), 'els': [{'t': 'list', 'items': [['💬', 'Step 1: Create a webhook…'], ['💬', 'Step 2: Map the JSON fields…'], ['💬', 'Step 3: Set up OAuth…'], ['💬', 'Step 4–17: …']], 'x': 0.5, 'y': 0.5, 'cw': 1100, 'p45': {'cw': 960}}]},
  {'line': 2, 'go': 'right', 'hero': H(0.5, 0.86, 'meh', 190), 'els': [title('Homework. 📚', style='tape', size=130, y=0.42)]},
  {'line': 3, 'go': 'zoom', 'focus': [0.5, 0.42], 'hero': H(0.88, 0.3, 'happy', 170), 'els': [title("Doesn't tell you how.", style='roll', y=0.36, size=110), title('Does it.', style='flip', y=0.56, size=140, word='does')]},
  chat_beat("When a Stripe invoice is paid, add it to my Google Sheet, mark the client as paid in Notion and send me a Telegram message.", go='right'),
  flow_beat(4, [['stripe', 'Stripe', 'Invoice paid'], ['sheets', 'Google Sheets', 'Row added'], ['notion', 'Notion', 'Client: Paid'], ['telegram', 'Telegram', 'Ping']], layout='row'),
  end_beat(5, 'Less advice. More done.', ['stripe', 'sheets', 'notion', 'telegram', 'slack', 'gmail', 'hubspot', 'openai', 'airtable'])]}
S['W2-05'] = {'pal': 'D4', 'lines': [
  "Most automations break quietly.",
  "A field changes. A step fails. Nobody notices for a week.",
  "FansaChat tests every workflow before it runs.",
  "Real test run. Real data. Every step checked.",
  "If something can't work, you know before it matters.",
  "FansaChat. Tested before it runs. Join the waitlist."],
 'beats': [
  {'line': 0, 'hero': H(0.86, 0.8, 'meh'), 'els': [title('Breaks quietly.', style='flip', y=0.3, size=130), {'t': 'badges', 'n': 7, 'r': 300, 'x': 0.5, 'y': 0.55, 'color': '#E8362B'}]},
  {'line': 1, 'go': 'right', 'hero': H(0.86, 0.84, 'meh', 180), 'els': [{'t': 'pile', 'items': [['sheets', 'Column renamed', 'step 3 failing'], ['hubspot', 'Field deleted', 'step 2 failing'], ['slack', 'Channel archived', 'step 5 failing']], 'x': 0.45, 'y': 0.58, 'p45': {'x': 0.5}}, {'t': 'counter', 'label': 'DAYS UNNOTICED', 'from': 0, 'to': 7, 'size': 80, 'x': 0.78, 'y': 0.22, 'bg': '#E8362B', 'p45': {'x': 0.5, 'y': 0.15}}]},
  {'line': 2, 'go': 'zoom', 'focus': [0.5, 0.45], 'hero': H(0.88, 0.3, 'happy', 170), 'els': [title('Tested before it runs.', style='flip', y=0.44, size=120)]},
  flow_beat(3, [['typeform', 'Typeform', 'Test response'], ['hubspot', 'HubSpot', 'Contact created'], ['slack', 'Slack', 'Message posted'], ['sheets', 'Google Sheets', 'Row added']], go='right', layout='row'),
  {'line': 4, 'go': 'down', 'hero': H(0.86, 0.82, 'wink', 180), 'els': [{'t': 'stamp', 'text': '✓ TEST PASSED', 'color': '#19A55A', 'size': 90, 'x': 0.5, 'y': 0.44}]},
  end_beat(5, 'Tested before it runs.', ['typeform', 'hubspot', 'slack', 'sheets', 'notion', 'stripe', 'gmail', 'airtable', 'telegram'])]}
S['W2-06'] = {'pal': 'B6', 'lines': [
  "Here's a workflow with ten steps.",
  "With per-step pricing, every step adds to the bill.",
  "With FansaChat, ten steps is still one run.",
  "Users and workflows are unlimited on every plan.",
  "Only finished runs count. That's it.",
  "FansaChat. Build big. Pay fair. Join the waitlist."],
 'beats': [
  {'line': 0, 'hero': H(0.86, 0.82), 'els': [{'t': 'flow', 'nodes': [['typeform', 'Form', '1'], ['hubspot', 'CRM', '2'], ['slack', 'Slack', '3'], ['notion', 'Notion', '4'], ['gmail', 'Email', '5'], ['sheets', 'Sheet', '6'], ['calendly', 'Calendly', '7'], ['zoom', 'Zoom', '8'], ['stripe', 'Stripe', '9'], ['telegram', 'Telegram', '10']], 'layout': 'snake', 'layout45': 'col', 'x': 0.5, 'y': 0.52, 's': 0.62, 'p45': {'s': 0.42}}]},
  {'line': 1, 'go': 'right', 'hero': H(0.86, 0.82, 'wow', 180), 'els': [{'t': 'counter', 'label': 'STEPS BILLED', 'from': 1, 'to': 10, 'size': 120, 'x': 0.5, 'y': 0.44, 'bg': '#E8362B'}]},
  {'line': 2, 'go': 'down', 'hero': H(0.5, 0.86, 'happy', 190), 'els': [{'t': 'counter', 'label': 'RUNS', 'from': 1, 'to': 1, 'size': 160, 'x': 0.5, 'y': 0.42, 'bg': '#19A55A'}, title('10 steps = 1 run', y=0.66, size=90, em=['1', 'run'])]},
  {'line': 3, 'go': 'right', 'hero': H(0.86, 0.82, 'happy', 180), 'els': [{'t': 'list', 'items': [['👥', 'Unlimited users'], ['🔁', 'Unlimited workflows'], ['✓', 'Only finished runs count']], 'x': 0.5, 'y': 0.5, 'cw': 1000, 'p45': {'cw': 900}}]},
  {'line': 4, 'go': 'zoom', 'focus': [0.5, 0.45], 'hero': H(0.88, 0.3, 'wink', 170), 'els': [title("That's it.", style='flip', y=0.44, size=150)]},
  end_beat(5, 'Build big. Pay fair.', ['typeform', 'hubspot', 'slack', 'notion', 'gmail', 'sheets', 'calendly', 'zoom', 'stripe'])]}
S['W2-07'] = {'pal': 'B5', 'lines': [
  "Five apps. Five different logins. Five different ways to connect them.",
  "One tool for this. Another tool for that.",
  "FansaChat connects to seven hundred plus apps, from one chat.",
  "Gmail, Shopify, HubSpot, Notion, Slack. And hundreds more.",
  "One place to describe it. One place to watch it run.",
  "FansaChat. Every app, one conversation. Join the waitlist."],
 'beats': [
  {'line': 0, 'hero': H(0.86, 0.82, 'meh'), 'els': [{'t': 'cloud', 'apps': ['gmail', 'shopify', 'hubspot', 'notion', 'slack'], 'x': 0.5, 'y': 0.5}, title('5 apps. 5 ways.', style='flip', y=0.14, size=110)]},
  {'line': 1, 'go': 'right', 'hero': H(0.5, 0.86, 'meh', 190), 'els': [{'t': 'paths', 'l': 'One tool for this, another for that…', 'r': 'One chat', 'x': 0.5, 'y': 0.42}]},
  {'line': 2, 'go': 'zoom', 'focus': [0.5, 0.45], 'hero': H(0.88, 0.3, 'happy', 170), 'els': [{'t': 'counter', 'from': 0, 'to': 700, 'suffix': '+', 'label': 'APPS', 'size': 140, 'x': 0.5, 'y': 0.44}]},
  {'line': 3, 'go': 'down', 'hero': H(0.88, 0.86, 'happy', 170), 'els': [{'t': 'conveyor', 'apps': ['gmail', 'shopify', 'hubspot', 'notion', 'slack', 'stripe', 'airtable', 'asana', 'trello'], 'x': 0, 'y': 0.3, 'dir': 1}, {'t': 'conveyor', 'apps': ['calendly', 'zoom', 'whatsapp', 'telegram', 'figma', 'canva', 'xero', 'quickbooks', 'jira'], 'x': 0, 'y': 0.62, 'dir': -1}]},
  {'line': 4, 'go': 'right', 'hero': H(0.5, 0.86, 'wink', 190), 'els': [{'t': 'orbit', 'apps': ['gmail', 'shopify', 'hubspot', 'notion', 'slack', 'stripe', 'whatsapp', 'telegram'], 'r': 420, 'x': 0.5, 'y': 0.45}, title('One place.', style='flip', y=0.45, size=120)]},
  end_beat(5, 'Every app, one conversation.', ['gmail', 'shopify', 'hubspot', 'notion', 'slack', 'stripe', 'whatsapp', 'telegram', 'airtable'])]}
S['W2-08'] = {'pal': 'B1', 'lines': [
  "Bangladesh just built its first plain-English automation tool.",
  "One founder. One laptop. A big idea.",
  "Type what you need, and it builds the workflow for you.",
  "Seven hundred plus apps. Tested before it runs.",
  "Built in Bangladesh. Made for the world.",
  "FansaChat. Join the waitlist."],
 'beats': [
  {'line': 0, 'hero': H(0.86, 0.8, 'wow'), 'els': [title("Bangladesh's first.", style='flip', y=0.32, size=130), title('plain-English automation tool', y=0.55, size=72, em=['plain-English'])]},
  {'line': 1, 'go': 'right', 'hero': H(0.5, 0.86, 'happy', 190), 'els': [{'t': 'list', 'items': [['👤', 'One founder'], ['💻', 'One laptop'], ['💡', 'One big idea']], 'x': 0.5, 'y': 0.48, 'cw': 900}]},
  chat_beat("When a customer orders on Shopify, add them to my sheet and send a thank-you on WhatsApp.", go='down'),
  {'line': 2, 'go': 'right', 'hero': H(0.88, 0.86, 'happy', 170), 'els': [{'t': 'flow', 'nodes': [['shopify', 'Shopify', 'Order'], ['sheets', 'Sheets', 'Row'], ['whatsapp', 'WhatsApp', 'Thank-you']], 'layout': 'row', 'x': 0.5, 'y': 0.5}]},
  {'line': 3, 'go': 'down', 'hero': H(0.5, 0.86, 'wink', 190), 'els': [{'t': 'counter', 'from': 0, 'to': 700, 'suffix': '+', 'label': 'APPS', 'size': 120, 'x': 0.5, 'y': 0.36}, {'t': 'stamp', 'text': '✓ TESTED', 'color': '#19A55A', 'size': 80, 'x': 0.5, 'y': 0.62, 'word': 'tested'}]},
  {'line': 4, 'go': 'zoom', 'focus': [0.5, 0.45], 'hero': H(0.88, 0.3, 'happy', 170), 'els': [title('Built in Bangladesh.', style='roll', y=0.36, size=110), title('Made for the world. 🌍', style='flip', y=0.56, size=110, word='made')]},
  end_beat(5, 'Built in Bangladesh. Made for the world.', ['shopify', 'sheets', 'whatsapp', 'gmail', 'notion', 'slack', 'stripe', 'hubspot', 'telegram'])]}
S['W2-09'] = {'pal': 'D1', 'lines': [
  "Some tools charge per seat.",
  "Add your team, and the bill grows before any work gets done.",
  "FansaChat gives every plan unlimited users.",
  "Invite everyone. Pay only for finished runs.",
  "Your whole team, building automations together.",
  "FansaChat. Bring everyone. Join the waitlist."],
 'beats': [
  {'line': 0, 'hero': H(0.86, 0.8, 'meh'), 'els': [title('Per seat.', style='flip', y=0.3, size=150), {'t': 'counter', 'prefix': '×', 'from': 1, 'to': 25, 'label': 'SEATS', 'size': 100, 'x': 0.5, 'y': 0.58, 'bg': '#E8362B'}]},
  {'line': 1, 'go': 'right', 'hero': H(0.86, 0.84, 'meh', 180), 'els': [{'t': 'compare', 'left': {'t': 'Per-seat tools', 'rows': ['Bill grows with headcount', 'Before any work is done'], 'meter': 0.9}, 'right': {'t': 'FansaChat', 'rows': ['Unlimited users', 'Pay for finished runs'], 'meter': 0.3}, 'x': 0.5, 'y': 0.5, 'cw': 1500, 'p45': {'cw': 960}}]},
  {'line': 2, 'go': 'zoom', 'focus': [0.5, 0.45], 'hero': H(0.88, 0.3, 'happy', 170), 'els': [title('Unlimited users.', style='flip', y=0.44, size=140)]},
  {'line': 3, 'go': 'down', 'hero': H(0.5, 0.86, 'happy', 190), 'els': [{'t': 'cloud', 'apps': ['👩', '🧑', '👨', '👩‍💻', '🧑‍💼', '👨‍🎨', '👩‍🔧', '🧑‍🏫'], 'x': 0.5, 'y': 0.5}, title('Invite everyone.', style='roll', y=0.14, size=110)]},
  {'line': 4, 'go': 'right', 'hero': H(0.86, 0.84, 'wink', 180), 'els': [{'t': 'list', 'items': [['hubspot', 'Sales builds lead routing'], ['zendesk', 'Support builds auto-replies'], ['xero', 'Finance builds reminders']], 'x': 0.5, 'y': 0.5, 'cw': 1100, 'p45': {'cw': 960}}]},
  end_beat(5, 'Bring everyone.', ['hubspot', 'zendesk', 'xero', 'slack', 'notion', 'asana', 'jira', 'sheets', 'gmail'])]}
S['W2-10'] = {'pal': 'D2', 'lines': [
  "Your AI assistant can write. But can it do anything?",
  "It answers, then waits for you to copy the result somewhere.",
  "FansaChat connects AI to twenty-two verified tool servers and seven hundred plus apps.",
  "So your AI doesn't just suggest. It sends, files and updates.",
  "FansaChat. AI that actually acts. Join the waitlist."],
 'beats': [
  {'line': 0, 'hero': H(0.86, 0.8, 'wow'), 'els': [title('Can it DO anything?', style='flip', y=0.32, size=120), {'t': 'card', 'icon': 'openai', 'title': 'AI assistant', 'sub': 'Here is a draft you can copy…', 'x': 0.5, 'y': 0.58}]},
  {'line': 1, 'go': 'right', 'hero': H(0.86, 0.84, 'meh', 180), 'els': [title('Answer. Wait. Copy. Paste.', style='tape', size=90, y=0.4)]},
  {'line': 2, 'go': 'zoom', 'focus': [0.5, 0.45], 'hero': H(0.88, 0.3, 'happy', 170), 'els': [{'t': 'counter', 'from': 0, 'to': 22, 'label': 'VERIFIED MCP SERVERS', 'size': 110, 'x': 0.5, 'y': 0.34}, {'t': 'counter', 'from': 0, 'to': 700, 'suffix': '+', 'label': 'APPS', 'size': 110, 'x': 0.5, 'y': 0.6, 'd': 14}]},
  {'line': 3, 'go': 'down', 'hero': H(0.88, 0.86, 'happy', 170), 'els': [{'t': 'flow', 'nodes': [['openai', 'AI', 'Writes reply'], ['gmail', 'Sends', 'Email'], ['drive', 'Files', 'Drive'], ['hubspot', 'Updates', 'CRM']], 'layout': 'row', 'x': 0.5, 'y': 0.5}]},
  end_beat(4, 'AI that actually acts.', ['openai', 'gmail', 'drive', 'hubspot', 'slack', 'notion', 'github', 'linear', 'telegram'])]}
S['W2-11'] = {'pal': 'B3', 'lines': [
  "Four hundred seventy-eight templates, ready to use.",
  "Lead routing. Invoice reminders. Order alerts. Weekly reports.",
  "Pick one, and FansaChat sets it up for your apps.",
  "Or skip the templates, and just say what you need.",
  "FansaChat. Start from a template, or a sentence. Join the waitlist."],
 'beats': [
  {'line': 0, 'hero': H(0.86, 0.8, 'wow'), 'els': [{'t': 'counter', 'from': 0, 'to': 478, 'label': 'TEMPLATES', 'size': 140, 'x': 0.5, 'y': 0.44}]},
  {'line': 1, 'go': 'right', 'hero': H(0.86, 0.84, 'happy', 180), 'els': [{'t': 'carousel', 'items': [['Lead routing', '#2F9BFF'], ['Invoice reminders', '#FF8A3D'], ['Order alerts', '#19A55A'], ['Weekly reports', '#8C72FF']], 'words': ['lead', 'invoice', 'order', 'weekly'], 'x': 0.5, 'y': 0.5}]},
  {'line': 2, 'go': 'down', 'hero': H(0.88, 0.86, 'happy', 170), 'els': [{'t': 'card', 'icon': 'stripe', 'title': 'Invoice reminders', 'sub': 'Stripe → WhatsApp → Notion', 'badge': 'USE', 'badgeColor': '#19A55A', 'x': 0.5, 'y': 0.46}]},
  {'line': 3, 'go': 'zoom', 'focus': [0.5, 0.45], 'hero': H(0.88, 0.3, 'wink', 170), 'els': [title('Or just say it.', style='flip', y=0.44, size=140)]},
  end_beat(4, 'Start from a template, or a sentence.', ['stripe', 'whatsapp', 'notion', 'hubspot', 'shopify', 'slack', 'sheets', 'gmail', 'calendly'])]}
S['W2-12'] = {'pal': 'B4', 'lines': [
  "An app changes one field, and your flowchart breaks.",
  "Now you hunt through forty boxes to find which one.",
  "With FansaChat, you just say what changed.",
  "It updates the workflow, and tests it again.",
  "FansaChat. Change it by saying it. Join the waitlist."],
 'beats': [
  {'line': 0, 'hero': H(0.86, 0.8, 'wow'), 'els': [{'t': 'card', 'icon': 'hubspot', 'title': 'Field “Phone” renamed', 'sub': 'to “Mobile number”', 'badge': 'BREAKING', 'x': 0.5, 'y': 0.46}]},
  {'line': 1, 'go': 'right', 'hero': H(0.86, 0.84, 'meh', 180), 'els': [{'t': 'pile', 'items': [['⬜', 'Box 12 · Map fields', 'which one?'], ['⬜', 'Box 23 · Formatter', 'which one?'], ['⬜', 'Box 31 · Lookup', 'which one?'], ['⬜', 'Box 40 · Update', 'failing']], 'x': 0.45, 'y': 0.58, 'p45': {'x': 0.5}}]},
  {'line': 2, 'go': 'zoom', 'focus': [0.5, 0.45], 'hero': H(0.88, 0.3, 'happy', 170), 'els': [title('Just say what changed.', style='flip', y=0.44, size=120)]},
  chat_beat("HubSpot renamed Phone to Mobile number. Use the new field everywhere.", go='right'),
  flow_beat(3, [['hubspot', 'HubSpot', 'Mobile number'], ['whatsapp', 'WhatsApp', 'Uses new field'], ['sheets', 'Google Sheets', 'Updated']], go='right', layout='row'),
  end_beat(4, 'Change it by saying it.', ['hubspot', 'whatsapp', 'sheets', 'notion', 'slack', 'gmail', 'stripe', 'airtable', 'calendly'])]}
S['W2-13'] = {'pal': 'B7', 'lines': [
  "Meet Maya. She runs a team of ten.",
  "Every week, her team did the same copy-paste work, by hand.",
  "So Maya typed one sentence into FansaChat.",
  "Now new leads, invoices and reports handle themselves.",
  "Maya's team finally does the work they were hired for.",
  "Be like Maya. Join the FansaChat waitlist."],
 'beats': [
  {'line': 0, 'hero': {'x': 0.3, 'y': 0.92, 'who': 'maya', 'expr': 'smileBig', 'size': 300}, 'els': [title('Meet Maya.', style='flip', x=0.66, y=0.36, size=140, p45={'x': 0.5, 'y': 0.16}), {'t': 'card', 'icon': '👥', 'title': 'Team lead · 10 people', 'sub': 'agency, 6 clients', 'x': 0.66, 'y': 0.58, 'p45': {'x': 0.5, 'y': 0.3}}]},
  {'line': 1, 'go': 'right', 'hero': {'x': 0.18, 'y': 0.94, 'who': 'maya', 'expr': 'tired', 'size': 280}, 'els': [{'t': 'pile', 'items': [['hubspot', 'Copy leads to CRM', 'every day'], ['xero', 'Chase invoices', 'every week'], ['sheets', 'Build the report', 'every Monday']], 'x': 0.6, 'y': 0.56, 'p45': {'x': 0.5, 'y': 0.4}}]},
  {'line': 2, 'go': 'down', 'hero': {'x': 0.16, 'y': 0.95, 'who': 'maya', 'expr': 'explaining', 'size': 260}, 'els': [{'t': 'chat', 'text': 'Route new leads to the right person, send invoice reminders from Xero, and post the weekly report in Slack every Monday.', 'typeDur': 110, 'x': 0.58, 'y': 0.48, 'cw': 1150, 'p45': {'x': 0.5, 'y': 0.4, 'cw': 860}}]},
  {'line': 3, 'go': 'right', 'hold': 30, 'hero': {'x': 0.85, 'y': 0.95, 'who': 'maya', 'expr': 'smileBig', 'size': 260}, 'els': [{'t': 'flow', 'nodes': [['hubspot', 'Leads', 'Routed'], ['xero', 'Invoices', 'Reminded'], ['sheets', 'Report', 'Built'], ['slack', 'Slack', 'Posted Mon 8:00']], 'layout': 'row', 'layout45': 'col', 'x': 0.45, 'y': 0.45, 'p45': {'x': 0.5, 's': 0.8}}]},
  {'line': 4, 'go': 'down', 'hero': {'x': 0.5, 'y': 0.95, 'who': 'maya', 'expr': 'smileBig', 'size': 300}, 'els': [title('The work they were hired for.', style='flip', y=0.3, size=100)]},
  end_beat(5, 'Be like Maya.', ['hubspot', 'xero', 'sheets', 'slack', 'notion', 'asana', 'gmail', 'calendly', 'zoom'])]}
S['W2-14'] = {'pal': 'D3', 'lines': [
  "Same work. Two ways to automate it.",
  "Boxes, steps, per-step bills, and things that break quietly.",
  "Or one sentence, one run, tested before it goes live.",
  "Unlimited users. Seven hundred plus apps. Plain English.",
  "FansaChat. The simpler way to automate. Join the waitlist."],
 'beats': [
  {'line': 0, 'hero': H(0.86, 0.8, 'wow'), 'els': [title('Two ways.', style='flip', y=0.4, size=150)]},
  {'line': 1, 'go': 'right', 'hero': H(0.86, 0.84, 'meh', 180), 'els': [{'t': 'list', 'items': [['⬜', '40 boxes to connect'], ['💸', 'Billed per step'], ['⚠️', 'Breaks quietly']], 'x': 0.5, 'y': 0.5, 'cw': 1000, 'p45': {'cw': 920}}]},
  {'line': 2, 'go': 'down', 'hero': H(0.5, 0.86, 'happy', 190), 'els': [{'t': 'list', 'items': [['💬', 'One sentence'], ['1️⃣', 'One run, however many steps'], ['✓', 'Tested before it goes live']], 'x': 0.5, 'y': 0.5, 'cw': 1000, 'p45': {'cw': 920}}]},
  {'line': 3, 'go': 'zoom', 'focus': [0.5, 0.45], 'hero': H(0.88, 0.3, 'happy', 170), 'els': [{'t': 'orbit', 'apps': ['gmail', 'shopify', 'hubspot', 'notion', 'slack', 'stripe', 'whatsapp', 'telegram'], 'r': 420, 'x': 0.5, 'y': 0.46}, title('Plain English.', style='flip', y=0.46, size=120)]},
  end_beat(4, 'The simpler way to automate.', ['gmail', 'shopify', 'hubspot', 'notion', 'slack', 'stripe', 'whatsapp', 'telegram', 'airtable'])]}

for k, v in S.items():
    v['id'] = k
    json.dump(v, open(f'src/specs/{k}.json', 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
print(len(S), 'week-2 specs')
