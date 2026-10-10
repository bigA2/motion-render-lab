# Week 4 specs (W4-01..W4-14): use-case lists, explainers, proof, community, finale.
import json
from specs_w1 import H, title, chat_beat, flow_beat, end_beat, phone_beat

def listbeat(line, items, go='right', hero=None): return {'line': line, 'go': go, 'hero': hero or H(0.9, 0.86, 'happy', 160), 'els': [{'t': 'list', 'items': items, 'x': 0.5, 'y': 0.52, 'cw': 1250, 'p45': {'cw': 960}}]}
def five(pal, who, hook, intro_apps, items, lines_mid, tag, apps):
    # lines: 0 hook, 1..5 one automation each, 6 payoff, 7 end
    beats = [{'line': 0, 'hero': H(0.86, 0.82, 'wow'), 'els': [title(hook, style='flip', y=0.3, size=118), {'t': 'conveyor', 'apps': intro_apps, 'x': 0, 'y': 0.68}]}]
    gos = ['right', 'down', 'right', 'up', 'right']
    for i, (a1, a2, a3, label) in enumerate(items):
        beats.append({'line': i + 1, 'go': gos[i], 'hero': H(0.88 if i % 2 else 0.12, 0.84, 'happy', 170), 'els': [
            {'t': 'counter', 'from': 0, 'to': i + 1, 'prefix': '#', 'size': 90, 'x': 0.5, 'y': 0.16, 'bg': '#111' if PAL_DARK.get(pal) else None},
            {'t': 'flow', 'nodes': [[a1, label[0], label[1]], [a2, label[2], label[3]], [a3, label[4], label[5]]], 'layout': 'row', 'layout45': 'col', 'x': 0.5, 'y': 0.54, 'p45': {'s': 0.85}}]})
    beats.append({'line': 6, 'go': 'zoom', 'focus': [0.5, 0.45], 'hero': H(0.88, 0.3, 'wink', 170), 'els': [title(lines_mid, style='flip', y=0.44, size=110)]})
    beats.append(end_beat(7, tag, apps))
    for b in beats:
        for e in b['els']:
            if e.get('bg') is None and 'bg' in e: del e['bg']
    return beats
PAL_DARK = {'D1': 1, 'D2': 1, 'D3': 1, 'D4': 1}
S = {}
S['W4-01'] = {'pal': 'B2', 'lines': [
  "Five automations every freelancer should steal.",
  "One. Stripe invoice unpaid? A polite WhatsApp reminder goes out.",
  "Two. New client signs? A Notion project and Google Drive folder appear.",
  "Three. Calendly booking? Zoom link and intake form sent.",
  "Four. Toggl hours logged? A weekly summary for every client.",
  "Five. Payment received? It lands in QuickBooks, and you get a ping.",
  "Five automations. Five sentences. Zero code.",
  "FansaChat. Steal these. Join the waitlist."],
 'beats': five('B2', 'freelancers', 'Steal these 5.', ['stripe', 'notion', 'calendly', 'toggl', 'quickbooks', 'whatsapp', 'drive', 'zoom'],
  [('stripe', 'whatsapp', 'notion', ('Stripe', 'Unpaid 7d', 'WhatsApp', 'Reminder', 'Notion', 'Reminded')),
   ('docusign', 'notion', 'drive', ('Contract', 'Signed', 'Notion', 'Project', 'Drive', 'Folder')),
   ('calendly', 'zoom', 'googleforms', ('Calendly', 'Booked', 'Zoom', 'Link', 'Form', 'Intake')),
   ('toggl', 'sheets', 'gmail', ('Toggl', 'Hours', 'Sheets', 'Summary', 'Email', 'Client report')),
   ('stripe', 'quickbooks', 'telegram', ('Stripe', 'Paid', 'QuickBooks', 'Entry', 'Telegram', 'Ping'))],
  'Five sentences. Zero code.', 'Steal these.', ['stripe', 'notion', 'calendly', 'toggl', 'quickbooks', 'whatsapp', 'drive', 'zoom', 'telegram'])}
S['W4-02'] = {'pal': 'B6', 'lines': [
  "Five automations every online shop needs.",
  "One. New order? Logged in your sheet and the customer gets an update.",
  "Two. Stock running low? You get a Telegram alert.",
  "Three. Abandoned cart? A friendly reminder goes out.",
  "Four. Five-star review? Shared on Instagram stories.",
  "Five. Refund request? A ticket for the right person.",
  "Your shop, running itself.",
  "FansaChat. Your store on autopilot. Join the waitlist."],
 'beats': five('B6', 'shops', 'Your store, on autopilot.', ['shopify', 'woo', 'etsy', 'stripe', 'whatsapp', 'instagram', 'klaviyo', 'sheets'],
  [('shopify', 'sheets', 'whatsapp', ('Shopify', 'Order', 'Sheets', 'Logged', 'WhatsApp', 'Update')),
   ('shopify', 'sheets', 'telegram', ('Shopify', 'Stock < 5', 'Sheets', 'Reorder list', 'Telegram', 'Alert')),
   ('shopify', 'klaviyo', 'whatsapp', ('Shopify', 'Cart left', 'Klaviyo', 'Email', 'WhatsApp', 'Reminder')),
   ('shopify', 'canva', 'instagram', ('Review', '5 stars', 'Canva', 'Story card', 'Instagram', 'Shared')),
   ('whatsapp', 'zendesk', 'slack', ('WhatsApp', 'Refund ask', 'Zendesk', 'Ticket', 'Slack', 'Assigned'))],
  'Your shop, running itself.', 'Your store on autopilot.', ['shopify', 'woo', 'etsy', 'stripe', 'whatsapp', 'instagram', 'klaviyo', 'sheets', 'zendesk'])}
S['W4-03'] = {'pal': 'B3', 'lines': [
  "Five automations every content creator needs.",
  "One. New YouTube video? Posted to Instagram, X and LinkedIn.",
  "Two. New sponsor email? Added to your Notion deal board.",
  "Three. Comments with a question? Collected for your next video.",
  "Four. New Patreon member? A personal thank-you message.",
  "Five. Every Friday? Your growth numbers in one report.",
  "Create more. Post less.",
  "FansaChat. Post once, everywhere. Join the waitlist."],
 'beats': five('B3', 'creators', 'Post once. Everywhere.', ['youtube', 'instagram', 'x', 'linkedin', 'threads', 'notion', 'patreon', 'telegram'],
  [('youtube', 'instagram', 'linkedin', ('YouTube', 'New video', 'Instagram', 'Clip', 'LinkedIn', 'Post')),
   ('gmail', 'notion', 'telegram', ('Email', 'Sponsor', 'Notion', 'Deal board', 'Telegram', 'Ping')),
   ('youtube', 'openai', 'notion', ('YouTube', 'Comments', 'AI', 'Find questions', 'Notion', 'Ideas list')),
   ('patreon', 'gmail', 'discord', ('Patreon', 'New member', 'Email', 'Thank-you', 'Discord', 'Role')),
   ('youtube', 'sheets', 'slack', ('Schedule', 'Friday', 'Sheets', 'Growth', 'Slack', 'Report'))],
  'Create more. Post less.', 'Post once, everywhere.', ['youtube', 'instagram', 'x', 'linkedin', 'threads', 'notion', 'patreon', 'discord', 'telegram'])}
S['W4-04'] = {'pal': 'D2', 'lines': [
  "Five automations every dev team should have.",
  "One. Bug reported? A labelled GitHub issue appears.",
  "Two. Pull request merged? The changelog updates itself.",
  "Three. Error spike in Sentry? The on-call dev gets paged in Slack.",
  "Four. Deploy finished on Vercel? The team and the client hear about it.",
  "Five. Sprint ends? A summary from Linear lands in Notion.",
  "Ship code. Not status updates.",
  "FansaChat. Your dev ops, in plain English. Join the waitlist."],
 'beats': five('D2', 'devs', 'Ship, don’t sort.', ['github', 'gitlab', 'linear', 'jira', 'sentry', 'vercel', 'slack', 'discord'],
  [('discord', 'github', 'slack', ('Discord', 'Bug', 'GitHub', 'Issue', 'Slack', '#dev')),
   ('github', 'notion', 'x', ('GitHub', 'PR merged', 'Notion', 'Changelog', 'X', 'Announce')),
   ('sentry', 'slack', 'telegram', ('Sentry', 'Error spike', 'Slack', 'On-call', 'Telegram', 'Page')),
   ('vercel', 'slack', 'gmail', ('Vercel', 'Deployed', 'Slack', 'Team', 'Email', 'Client')),
   ('linear', 'notion', 'slack', ('Linear', 'Sprint end', 'Notion', 'Summary', 'Slack', 'Shared'))],
  'Ship code. Not status updates.', 'Your dev ops, in plain English.', ['github', 'gitlab', 'linear', 'jira', 'sentry', 'vercel', 'slack', 'discord', 'notion'])}
S['W4-05'] = {'pal': 'D1', 'lines': [
  "Five automations every agency runs on.",
  "One. Contract signed? Client onboarded across five tools.",
  "Two. New lead? Qualified, logged, and a call booked.",
  "Three. Every Friday? Each client gets their status report.",
  "Four. Task overdue? The owner gets a nudge in Slack.",
  "Five. Invoice due? Sent from Xero, reminded until paid.",
  "Scale clients. Not chaos.",
  "FansaChat. One chat for the whole agency. Join the waitlist."],
 'beats': five('D1', 'agencies', 'Scale clients, not chaos.', ['hubspot', 'clickup', 'slack', 'notion', 'docusign', 'xero', 'calendly', 'drive'],
  [('docusign', 'hubspot', 'clickup', ('DocuSign', 'Signed', 'HubSpot', 'Deal', 'ClickUp', 'Project')),
   ('typeform', 'hubspot', 'calendly', ('Typeform', 'Lead', 'HubSpot', 'Logged', 'Calendly', 'Call')),
   ('clickup', 'notion', 'gmail', ('Schedule', 'Friday', 'Notion', 'Status', 'Email', 'Client')),
   ('clickup', 'slack', 'slack', ('ClickUp', 'Overdue', 'Slack', 'Nudge', 'Slack', 'Owner')),
   ('xero', 'gmail', 'slack', ('Xero', 'Invoice', 'Email', 'Sent', 'Slack', 'Paid'))],
  'Scale clients. Not chaos.', 'One chat for the whole agency.', ['hubspot', 'clickup', 'slack', 'notion', 'docusign', 'xero', 'calendly', 'drive', 'figma'])}
S['W4-06'] = {'pal': 'B4', 'ex': 0.4, 'lines': [
  "Watch this.",
  "One sentence.",
  "Nodes appear. Every one connects.",
  "Tested. Every step green.",
  "Running.",
  "That's FansaChat. Join the waitlist."],
 'beats': [
  {'line': 0, 'hero': H(0.86, 0.8, 'wow'), 'els': [title('Watch this.', style='flip', y=0.44, size=150)]},
  chat_beat("When a new row is added to my Airtable, create a Trello card, message the owner on Slack and log it in Notion.", go='zoom'),
  {'line': 1, 'go': 'right', 'hero': H(0.88, 0.3, 'happy', 170), 'els': [title('One sentence.', style='roll', y=0.44, size=140)]},
  flow_beat(2, [['airtable', 'Airtable', 'New row'], ['trello', 'Trello', 'Card'], ['slack', 'Slack', 'Owner'], ['notion', 'Notion', 'Logged']], go='down', layout='row'),
  {'line': 3, 'go': 'right', 'hero': H(0.5, 0.86, 'happy', 190), 'els': [{'t': 'stamp', 'text': '✓ ALL STEPS GREEN', 'color': '#19A55A', 'size': 90, 'x': 0.5, 'y': 0.44}]},
  {'line': 4, 'go': 'up', 'hero': H(0.86, 0.84, 'wink', 180), 'els': [{'t': 'orbit', 'apps': ['airtable', 'trello', 'slack', 'notion', 'gmail', 'sheets', 'hubspot', 'stripe'], 'r': 420, 'x': 0.5, 'y': 0.46}, title('Running.', style='flip', y=0.46, size=140)]},
  end_beat(5, 'One sentence. Running.', ['airtable', 'trello', 'slack', 'notion', 'gmail', 'sheets', 'hubspot', 'stripe', 'telegram'])]}
S['W4-07'] = {'pal': 'B5', 'lines': [
  "What exactly is a workflow run?",
  "It's one finished job, from start to end.",
  "A new order, logged, messaged, and filed. That's one run.",
  "Three steps or thirty, it still counts as one.",
  "Starter gives you two thousand runs a month. Pro, ten thousand.",
  "So you pay for finished work, not for clicks.",
  "FansaChat. Simple, fair automation. Join the waitlist."],
 'beats': [
  {'line': 0, 'hero': H(0.86, 0.8, 'wow'), 'els': [title('What is a “run”?', style='flip', y=0.42, size=140)]},
  {'line': 1, 'go': 'right', 'hero': H(0.86, 0.84, 'happy', 180), 'els': [title('One finished job.', style='roll', y=0.42, size=130)]},
  flow_beat(2, [['shopify', 'Order', 'Start'], ['sheets', 'Logged', 'Step 2'], ['whatsapp', 'Messaged', 'Step 3'], ['drive', 'Filed', 'End']], go='down', layout='row'),
  {'line': 3, 'go': 'right', 'hero': H(0.5, 0.86, 'happy', 190), 'els': [{'t': 'counter', 'label': 'STEPS', 'from': 3, 'to': 30, 'size': 90, 'x': 0.32, 'y': 0.44, 'p45': {'x': 0.5, 'y': 0.3}}, {'t': 'counter', 'label': 'RUNS', 'from': 1, 'to': 1, 'size': 120, 'x': 0.7, 'y': 0.44, 'bg': '#19A55A', 'p45': {'x': 0.5, 'y': 0.58}}]},
  {'line': 4, 'go': 'down', 'hero': H(0.88, 0.86, 'happy', 170), 'els': [{'t': 'card', 'icon': '🌱', 'title': 'Starter', 'big': '2,000 runs/mo', 'x': 0.3, 'y': 0.46, 'p45': {'x': 0.5, 'y': 0.3}}, {'t': 'card', 'icon': '🚀', 'title': 'Pro', 'big': '10,000 runs/mo', 'x': 0.7, 'y': 0.46, 'd': 8, 'p45': {'x': 0.5, 'y': 0.62}}]},
  {'line': 5, 'go': 'zoom', 'focus': [0.5, 0.45], 'hero': H(0.88, 0.3, 'wink', 170), 'els': [title('Finished work.', style='flip', y=0.36, size=120), {'t': 'strike', 'text': 'Not clicks.', 'size': 100, 'x': 0.5, 'y': 0.58, 'word': 'not'}]},
  end_beat(6, 'Simple, fair automation.', ['shopify', 'sheets', 'whatsapp', 'drive', 'gmail', 'slack', 'notion', 'stripe', 'hubspot'])]}
S['W4-08'] = {'pal': 'D4', 'lines': [
  "Is my data safe with an automation tool?",
  "With FansaChat, you connect your own accounts.",
  "Your workflows run on your connections, and you can turn them off any time.",
  "Every run is logged, step by step, so you can see exactly what happened.",
  "You stay in control.",
  "FansaChat. Your data, your rules. Join the waitlist."],
 'beats': [
  {'line': 0, 'hero': H(0.86, 0.8, 'meh'), 'els': [title('Is my data safe?', style='flip', y=0.42, size=140)]},
  {'line': 1, 'go': 'right', 'hero': H(0.86, 0.84, 'happy', 180), 'els': [{'t': 'list', 'items': [['gmail', 'Your Gmail'], ['hubspot', 'Your HubSpot'], ['stripe', 'Your Stripe']], 'x': 0.5, 'y': 0.5, 'cw': 900}]},
  {'line': 2, 'go': 'down', 'hero': H(0.5, 0.86, 'happy', 190), 'els': [{'t': 'card', 'icon': '🔒', 'title': 'Your connections', 'sub': 'switch any workflow off, any time', 'x': 0.5, 'y': 0.44}]},
  {'line': 3, 'go': 'right', 'hero': H(0.88, 0.86, 'happy', 170), 'els': [{'t': 'list', 'items': [['✓', 'Step 1 · trigger received'], ['✓', 'Step 2 · row added'], ['✓', 'Step 3 · message sent']], 'x': 0.5, 'y': 0.5, 'cw': 1000, 'p45': {'cw': 920}}]},
  {'line': 4, 'go': 'zoom', 'focus': [0.5, 0.45], 'hero': H(0.88, 0.3, 'wink', 170), 'els': [title('You stay in control.', style='flip', y=0.44, size=120)]},
  end_beat(5, 'Your data, your rules.', ['gmail', 'hubspot', 'stripe', 'notion', 'slack', 'sheets', 'drive', 'shopify', 'telegram'])]}
S['W4-09'] = {'pal': 'B3', 'lines': [
  "We share one free automation idea every day.",
  "On our Telegram channel, t dot me slash fansachat.",
  "Real workflows for freelancers, shops, creators and teams.",
  "Ask questions, share the boring task you hate, and we'll show you how to automate it.",
  "Join the channel, and the FansaChat waitlist."],
 'beats': [
  {'line': 0, 'hero': H(0.86, 0.8, 'happy'), 'els': [title('1 automation a day.', style='flip', y=0.4, size=120)]},
  {'line': 1, 'go': 'right', 'hero': H(0.86, 0.84, 'happy', 180), 'els': [{'t': 'card', 'icon': 'telegram', 'title': 't.me/fansachat', 'sub': 'Telegram channel', 'x': 0.5, 'y': 0.44}]},
  {'line': 2, 'go': 'down', 'hero': H(0.5, 0.86, 'happy', 190), 'els': [{'t': 'carousel', 'items': [['Freelancers', '#FF8A3D'], ['Shops', '#FF6F61'], ['Creators', '#2F9BFF'], ['Teams', '#8C72FF']], 'words': ['freelancers', 'shops', 'creators', 'teams'], 'x': 0.5, 'y': 0.48}]},
  phone_beat(3, 'Share the task you hate.', [['telegram', 'New post 🔔', 'Today: auto-file receipts'], ['telegram', '“How do I…?”', 'answered in comments'], ['telegram', 'Your idea featured ✓', 'automation of the day']], em=['hate.']),
  end_beat(4, 'Join the channel: t.me/fansachat', ['telegram', 'notion', 'slack', 'shopify', 'stripe', 'youtube', 'hubspot', 'gmail', 'sheets'])]}
S['W4-10'] = {'pal': 'B7', 'lines': [
  "Myth: automation is only for engineers.",
  "Reality: if you can describe your work, you can automate it.",
  "No code. No flowcharts. No tutorials.",
  "Just say what should happen, and FansaChat builds it.",
  "FansaChat. Automation for everyone. Join the waitlist."],
 'beats': [
  {'line': 0, 'hero': H(0.86, 0.8, 'meh'), 'els': [title('MYTH:', style='tape', size=110, y=0.26), {'t': 'strike', 'text': 'Automation is for engineers.', 'size': 92, 'x': 0.5, 'y': 0.5, 'word': 'engineers'}]},
  {'line': 1, 'go': 'right', 'hero': H(0.86, 0.84, 'happy', 180), 'els': [title('REALITY:', style='tape', size=110, y=0.26, bg='#19A55A'), title('Describe it → automate it.', style='flip', y=0.5, size=100)]},
  {'line': 2, 'go': 'down', 'hero': H(0.5, 0.86, 'wink', 190), 'els': [{'t': 'strike', 'text': 'Code.', 'size': 110, 'x': 0.5, 'y': 0.26}, {'t': 'strike', 'text': 'Flowcharts.', 'size': 110, 'x': 0.5, 'y': 0.46, 'word': 'flowcharts'}, {'t': 'strike', 'text': 'Tutorials.', 'size': 110, 'x': 0.5, 'y': 0.66, 'word': 'tutorials'}]},
  chat_beat("When I get a new Calendly booking, add it to my Google Sheet and send me a WhatsApp message.", go='right'),
  {'line': 3, 'go': 'right', 'hero': H(0.88, 0.86, 'happy', 170), 'els': [{'t': 'flow', 'nodes': [['calendly', 'Calendly', 'Booking'], ['sheets', 'Sheets', 'Row'], ['whatsapp', 'WhatsApp', 'Message']], 'layout': 'row', 'x': 0.5, 'y': 0.5}]},
  end_beat(4, 'Automation for everyone.', ['calendly', 'sheets', 'whatsapp', 'gmail', 'notion', 'slack', 'shopify', 'stripe', 'telegram'])]}
S['W4-11'] = {'pal': 'B1', 'lines': [
  "Four hundred seventy-eight templates, built for real work.",
  "Sales. Support. Finance. Marketing. HR. Operations.",
  "Pick one, connect your apps, and it runs.",
  "Or describe your own, in one sentence.",
  "FansaChat. Templates or plain English. Join the waitlist."],
 'beats': [
  {'line': 0, 'hero': H(0.86, 0.8, 'wow'), 'els': [{'t': 'counter', 'from': 0, 'to': 478, 'label': 'TEMPLATES', 'size': 150, 'x': 0.5, 'y': 0.44}]},
  {'line': 1, 'go': 'right', 'hero': H(0.86, 0.84, 'happy', 180), 'els': [{'t': 'carousel', 'items': [['Sales', '#FF8A3D'], ['Support', '#3D9BFF'], ['Finance', '#19A55A'], ['Marketing', '#FFC800'], ['HR', '#FF5A8A'], ['Operations', '#8C72FF']], 'words': ['sales', 'support', 'finance', 'marketing', 'hr', 'operations'], 'x': 0.5, 'y': 0.48}]},
  {'line': 2, 'go': 'down', 'hero': H(0.88, 0.86, 'happy', 170), 'els': [{'t': 'flow', 'nodes': [['hubspot', 'Pick', 'Lead routing'], ['slack', 'Connect', 'Your apps'], ['✓', 'Runs', 'Tested']], 'layout': 'row', 'x': 0.5, 'y': 0.5}]},
  {'line': 3, 'go': 'zoom', 'focus': [0.5, 0.45], 'hero': H(0.88, 0.3, 'wink', 170), 'els': [title('Or one sentence.', style='flip', y=0.44, size=130)]},
  end_beat(4, 'Templates or plain English.', ['hubspot', 'slack', 'stripe', 'shopify', 'notion', 'zendesk', 'xero', 'mailchimp', 'sheets'])]}
S['W4-12'] = {'pal': 'B6', 'lines': [
  "Your side project just got its hundredth customer.",
  "Now the orders, emails and reports are eating your evenings.",
  "That's when you upgrade to Pro.",
  "Ten thousand runs a month, for automations that grow with you.",
  "FansaChat Pro. For when it gets serious. Join the waitlist."],
 'beats': [
  {'line': 0, 'hero': H(0.86, 0.8, 'wow'), 'els': [{'t': 'counter', 'from': 0, 'to': 100, 'label': 'CUSTOMERS', 'size': 140, 'x': 0.5, 'y': 0.4}, {'t': 'pop', 'text': '🎉', 'size': 140, 'x': 0.78, 'y': 0.3}]},
  {'line': 1, 'go': 'right', 'hero': H(0.86, 0.84, 'meh', 180), 'els': [{'t': 'pile', 'items': [['shopify', 'Orders', 'by hand'], ['gmail', 'Emails', 'by hand'], ['sheets', 'Reports', 'by hand']], 'x': 0.45, 'y': 0.58, 'p45': {'x': 0.5}}]},
  {'line': 2, 'go': 'zoom', 'focus': [0.5, 0.45], 'hero': H(0.88, 0.3, 'happy', 170), 'els': [title('Upgrade to Pro.', style='flip', y=0.44, size=140)]},
  {'line': 3, 'go': 'down', 'hero': H(0.88, 0.86, 'happy', 170), 'els': [{'t': 'counter', 'from': 0, 'to': 10000, 'label': 'RUNS / MONTH', 'size': 120, 'x': 0.5, 'y': 0.44}]},
  end_beat(4, 'Pro. For when it gets serious.', ['shopify', 'gmail', 'sheets', 'stripe', 'notion', 'slack', 'hubspot', 'whatsapp', 'telegram'])]}
S['W4-13'] = {'pal': 'D1', 'lines': [
  "One month. Fifty-six videos. One idea.",
  "Freelancers, shops, creators, developers, agencies, teams.",
  "Different jobs. The same copy-paste.",
  "And one sentence that fixes it.",
  "FansaChat. Automation in plain English. Join the waitlist."],
 'beats': [
  {'line': 0, 'hero': H(0.86, 0.8, 'happy'), 'els': [title('One month.', style='flip', y=0.3, size=140), {'t': 'counter', 'from': 0, 'to': 56, 'label': 'VIDEOS', 'size': 110, 'x': 0.5, 'y': 0.58}]},
  {'line': 1, 'go': 'right', 'hero': H(0.86, 0.84, 'happy', 180), 'els': [{'t': 'carousel', 'items': [['Freelancers', '#FF8A3D'], ['Shops', '#FF6F61'], ['Creators', '#2F9BFF'], ['Developers', '#3DE0FF'], ['Agencies', '#8C72FF'], ['Teams', '#FFC800']], 'words': ['freelancers', 'shops', 'creators', 'developers', 'agencies', 'teams'], 'x': 0.5, 'y': 0.48}]},
  {'line': 2, 'go': 'down', 'hero': H(0.5, 0.86, 'meh', 190), 'els': [title('The same copy-paste.', style='tape', size=110, y=0.44)]},
  {'line': 3, 'go': 'zoom', 'focus': [0.5, 0.45], 'hero': H(0.88, 0.3, 'wink', 170), 'els': [{'t': 'orbit', 'apps': ['gmail', 'shopify', 'hubspot', 'notion', 'slack', 'stripe', 'whatsapp', 'github'], 'r': 420, 'x': 0.5, 'y': 0.46}, title('One sentence.', style='flip', y=0.46, size=130)]},
  end_beat(4, 'Automation in plain English.', ['gmail', 'shopify', 'hubspot', 'notion', 'slack', 'stripe', 'whatsapp', 'github', 'telegram'])]}
S['W4-14'] = {'pal': 'B2', 'lines': [
  "One founder. One laptop. Seven hundred plus integrations.",
  "Built in Bangladesh, for anyone who's tired of copy-paste.",
  "You type what you need. FansaChat builds it, tests it, and runs it.",
  "We launch soon, and the first people in line get in first.",
  "FansaChat. Join the waitlist."],
 'beats': [
  {'line': 0, 'hero': H(0.86, 0.8, 'happy'), 'els': [{'t': 'list', 'items': [['👤', 'One founder'], ['💻', 'One laptop'], ['🔌', '700+ integrations']], 'x': 0.5, 'y': 0.5, 'cw': 900}]},
  {'line': 1, 'go': 'right', 'hero': H(0.86, 0.84, 'happy', 180), 'els': [title('Built in Bangladesh.', style='flip', y=0.36, size=120), title('For anyone tired of copy-paste.', y=0.58, size=80, em=['copy-paste.'])]},
  chat_beat("When a lead fills my form, add them to HubSpot and message me on Telegram.", go='down'),
  {'line': 2, 'go': 'right', 'hero': H(0.88, 0.86, 'happy', 170), 'els': [{'t': 'flow', 'nodes': [['typeform', 'Form', 'Lead'], ['hubspot', 'HubSpot', 'Added'], ['telegram', 'Telegram', 'Ping']], 'layout': 'row', 'x': 0.5, 'y': 0.5}]},
  {'line': 3, 'go': 'zoom', 'focus': [0.5, 0.45], 'hero': H(0.88, 0.3, 'wink', 170), 'els': [title('First in line, first in.', style='flip', y=0.44, size=110)]},
  end_beat(4, 'Built in Bangladesh. Made for the world.', ['typeform', 'hubspot', 'telegram', 'gmail', 'shopify', 'notion', 'slack', 'stripe', 'whatsapp'])]}

if __name__ == '__main__':
    for k, v in S.items():
        v['id'] = k
        json.dump(v, open(f'src/specs/{k}.json', 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print(len(S), 'week-4 specs')
